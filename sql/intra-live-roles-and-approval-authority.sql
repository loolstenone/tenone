-- =====================================================================================
-- 권한은 지금 기준으로 · 결재는 권한 있는 사람만 · MyVerse 구독은 결제로만 (WIO 백서 기준 2단계-3)
-- =====================================================================================
-- 대상 DB : 유니버스 DB ziotlxkdctlhiwkgmmsh
-- 상태    : 2026-10-15 사용자 승인 후 적용 (마이그레이션 intra_live_roles_and_approval_authority + intra_live_roles_tighten) · 재실행 가능
-- 선행    : sql/intra-record-and-approval-guard.sql (guard_approval_decision)
-- 근거    : WIO 백서 11장 A등급 3(자기 승인 금지)·4(닫힘 실패)·6(권한 상승 금지)
--
-- ① 퇴사·권한 회수 즉시 반영
--    auth_is_staff()·auth_is_super_admin()·auth_has_duty()가 로그인 토큰(JWT)만 보고 판단했다 → 회수해도 토큰 만료(최대 1시간)까지
--    브라우저 → DB 조회가 직원으로 통과. 이제 토큰이 직원이라고 해도 member_roles를 지금 다시 확인한다.
--    토큰이 직원이 아니면 바로 false (일반 회원 요청은 비용 없음). 확인 결과는 요청(트랜잭션) 하나 동안만 기억한다
--    측정 (2026-10-15, collected_data 4만 행 전체 count, 직원): 토큰만 315ms · 매 행 조회 2,800ms · 요청당 1회 기억 약 610ms
--
-- ② 결재는 권한 있는 사람만 (자기 결재 금지·끝난 결재 잠금은 기존 guard_approval_decision)
--    인트라 ERP 결재(approvals): 마스터 · 결재 직무(approval@duty) · 경비 결재는 재무 직무(finance@duty)도
--    WIO 결재(wio_approvals·approval_requests): 같은 회사(tenant)의 owner·admin·manager
--    서버 키·DB 직접 작업(로그인 사용자 아님)은 잠금 규칙만 적용
--
-- ③ MyVerse 구독은 결제·관리자로만
--    myverse_users '본인만 ALL' 정책으로 회원이 자기 구독 상태·만료일을 직접 바꿀 수 있었고,
--    구독 활성화 함수 myverse_activate_subscription을 누구나(anon 포함) 호출할 수 있었다 → 결제 없이 유료 구독
--    결제 완료 처리는 myverse_complete_toss_payment() 한 번 = 결제 기록 + 구독 활성화, 같은 주문 두 번 처리 안 됨
-- =====================================================================================

-- -------------------------------------------------------------------------------------
-- ① 지금 유효한 내 권한 (요청당 1회 조회)
-- -------------------------------------------------------------------------------------
create or replace function public.auth_live_roles()
returns text[] language plpgsql stable security definer set search_path = public as $$
declare
  v_mid   uuid := public.auth_member_id();
  v_cache text;
  v_roles text[];
begin
  if v_mid is null then return '{}'; end if;
  v_cache := current_setting('auth.live_roles', true);
  if v_cache like v_mid::text || '|%' then
    return string_to_array(substr(v_cache, length(v_mid::text) + 2), ',');
  end if;
  select coalesce(array_agg(r.role || '@' || r.context), '{}') into v_roles
    from public.member_roles r
   where r.member_id = v_mid and r.is_active and (r.expires_at is null or r.expires_at > now());
  perform set_config('auth.live_roles', v_mid::text || '|' || array_to_string(v_roles, ','), true);
  return v_roles;
end $$;

create or replace function public.auth_is_staff()
returns boolean language plpgsql stable security definer set search_path = public as $$
begin
  if not coalesce((auth.jwt() -> 'app_metadata' ->> 'is_staff')::boolean, false) then return false; end if;
  return public.auth_live_roles() && array['staff@universe','manager@universe','super_admin@universe'];
end $$;

create or replace function public.auth_is_super_admin()
returns boolean language plpgsql stable security definer set search_path = public as $$
begin
  if not coalesce((auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean, false) then return false; end if;
  return 'super_admin@universe' = any (public.auth_live_roles());
end $$;

create or replace function public.auth_has_duty(duty text)
returns boolean language plpgsql stable security definer set search_path = public as $$
begin
  if public.auth_is_super_admin() then return true; end if;
  if not coalesce((auth.jwt() -> 'app_metadata' -> 'roles') ? (duty || ':duty'), false) then return false; end if;
  return (duty || '@duty') = any (public.auth_live_roles());
end $$;

-- -------------------------------------------------------------------------------------
-- ② 결재 판단 보호 — 기존 규칙 + 결재 권한
-- -------------------------------------------------------------------------------------
create or replace function public.guard_approval_decision()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_final  text[] := array['approved','rejected','completed'];
  v_member uuid   := public.auth_member_id();
  v_self   boolean := false;
  v_roles  text[];
  v_ok     boolean;
begin
  if new.status is not distinct from old.status then return new; end if;

  if old.status = any (v_final) then
    raise exception '이미 끝난 결재(%)는 바꿀 수 없습니다. 새 문서로 다시 올려 주세요', old.status
      using errcode = '42501';
  end if;

  if not (new.status = any (v_final)) then return new; end if;

  -- 결재 권한 (로그인 사용자 요청만 — 서버 키·DB 작업은 잠금 규칙만)
  if auth.uid() is not null then
    if tg_table_name = 'approvals' then
      v_roles := public.auth_live_roles();
      v_ok := v_roles && array['super_admin@universe','approval@duty']
              or (old.reference_type = 'expense' and 'finance@duty' = any (v_roles));
    else
      v_ok := exists (select 1 from public.wio_members w
                       where w.user_id = auth.uid() and w.tenant_id = old.tenant_id
                         and coalesce(w.is_active, true) and w.role in ('owner','admin','manager'));
    end if;
    if not v_ok then
      raise exception '결재 권한이 없습니다' using errcode = '42501';
    end if;
  end if;

  if tg_table_name = 'approvals' then
    v_self := v_member is not null and old.drafter_id = v_member;
  elsif tg_table_name in ('wio_approvals','approval_requests') then
    v_self := auth.uid() is not null and exists (
      select 1 from public.wio_members w where w.id = old.requester_id and w.user_id = auth.uid());
  end if;

  if v_self then
    if tg_table_name = 'approvals' and public.auth_is_super_admin() then
      perform set_config('intra.exception', 'self_approval', true);
    else
      raise exception '자기가 올린 결재는 직접 승인·반려할 수 없습니다 (WIO A등급 3)' using errcode = '42501';
    end if;
  end if;

  if tg_table_name = 'approvals' then
    new.completed_at := coalesce(new.completed_at, now());
  elsif tg_table_name = 'wio_approvals' then
    new.approved_at := coalesce(new.approved_at, now());
    if new.approver_id is null then
      new.approver_id := (select w.id from public.wio_members w
                           where w.user_id = auth.uid() and w.tenant_id = old.tenant_id limit 1);
    end if;
  elsif tg_table_name = 'approval_requests' then
    new.completed_at := coalesce(new.completed_at, now());
  end if;
  return new;
end $$;

-- -------------------------------------------------------------------------------------
-- ③ MyVerse 구독 — 결제·관리자로만
-- -------------------------------------------------------------------------------------
create or replace function public.protect_myverse_billing_columns()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if coalesce(auth.role(), '') not in ('authenticated', 'anon') or public.auth_is_staff() then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.subscription_status     := 'free';
    new.subscription_expires_at := null;
    new.subscription_price      := 19000;
    new.is_pdf_buyer            := false;
    new.pdf_buyer_verified_at   := null;
  else
    new.subscription_status     := old.subscription_status;
    new.subscription_expires_at := old.subscription_expires_at;
    new.subscription_price      := old.subscription_price;
    new.is_pdf_buyer            := old.is_pdf_buyer;
    new.pdf_buyer_verified_at   := old.pdf_buyer_verified_at;
  end if;
  return new;
end $$;

drop trigger if exists protect_myverse_billing_columns on public.myverse_users;
create trigger protect_myverse_billing_columns before insert or update on public.myverse_users
  for each row execute function public.protect_myverse_billing_columns();

revoke all on function public.myverse_activate_subscription(uuid, integer, text) from public, anon, authenticated;
grant execute on function public.myverse_activate_subscription(uuid, integer, text) to service_role;

-- 토스 결제 완료: 대기 중인 주문만 paid로 바꾸고 그때만 구독 활성화 (새로고침·동시 요청에도 한 번)
create or replace function public.myverse_complete_toss_payment(
  p_order_id text, p_payment_key text, p_receipt_url text, p_method text, p_meta jsonb)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_pay record;
  v_end date;
begin
  select * into v_pay from public.myverse_payments where order_id = p_order_id for update;
  if not found then return 'not_found'; end if;
  if v_pay.status = 'paid' then return 'already_paid'; end if;
  if v_pay.status <> 'pending' then return 'not_pending'; end if;

  v_end := (current_date + make_interval(years => coalesce(v_pay.subscription_years, 1)))::date;
  update public.myverse_payments
     set status = 'paid', toss_payment_key = p_payment_key, toss_receipt_url = p_receipt_url,
         method = p_method, paid_at = now(), subscription_starts = current_date,
         subscription_ends = v_end, meta = p_meta, updated_at = now()
   where id = v_pay.id;
  perform public.myverse_activate_subscription(v_pay.member_id, coalesce(v_pay.subscription_years, 1), 'toss');
  return 'paid';
end $$;
revoke all on function public.myverse_complete_toss_payment(text, text, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.myverse_complete_toss_payment(text, text, text, text, jsonb) to service_role;

revoke all on function public.protect_myverse_billing_columns() from public, anon, authenticated;
-- auth_live_roles는 auth_is_staff 등(SECURITY DEFINER, 소유자 권한)이 부르므로 직접 실행 권한은 아무에게도 주지 않는다
revoke all on function public.auth_live_roles() from public, anon, authenticated;
alter function public.myverse_activate_subscription(uuid, integer, text) set search_path = public;
