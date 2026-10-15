-- =====================================================================================
-- 인트라 기록 켜기 + 결재 구멍 막기 (WIO 백서 기준 1단계)
-- =====================================================================================
-- 대상 DB : 유니버스 DB ziotlxkdctlhiwkgmmsh
-- 상태    : 2026-10-15 사용자 승인 후 적용 (마이그레이션 intra_record_and_approval_guard + intra_audit_log_readable_invoker + intra_record_change_fk_fix) · 재실행 가능
-- 근거    : docs/WIO 백서 Way It Operates.md 3장 원칙 3(모든 행위는 기록)·9장(기록은 추가만, 직무분리)
--           11장 A등급 2(기록 추가만)·3(자기 승인 금지)·14장(상태 전이는 DB가 막는다)
--           docs/Intra 진단 WIO 기본 설계 기준 대비.md 7장·9-3(기록 켜기)
--           docs/wio/Intra_Approval_State_Map.md (결재 구멍 목록)
--
-- 무엇을 하나
--   ① audit_log(지금 0행·앱 미사용)를 변경 기록 원장으로 쓴다: 추가만 가능, 직무별 열람
--   ② record_change() 트리거 하나를 결재·재무·인사·권한 테이블 15개에 건다 — 앱이 빠뜨려도 DB가 남긴다
--   ③ 결재 3종(approvals·wio_approvals·approval_requests): 자기 결재 금지 · 끝난 결재는 되돌릴 수 없음
--      (인트라 1인 운영 예외: super_admin 본인 결재는 허용하되 audit_log에 'self_approval' 예외로 표시)
--   ④ 결재 승인·반려 → 연결된 경비(expenses) 상태를 DB가 같은 트랜잭션에서 바꾼다 (앱 2단계 update 제거)
--
-- 하지 않는 것: 기존 테이블 컬럼·데이터 변경 없음(approvals.drafter_id 기본값만 추가), 모듈 이관 없음
-- =====================================================================================

-- -------------------------------------------------------------------------------------
-- ① audit_log = 변경 기록 원장 (추가만)
-- -------------------------------------------------------------------------------------
create index if not exists audit_log_resource_target_idx on public.audit_log(resource, target_id, created_at);
create index if not exists audit_log_actor_idx on public.audit_log(actor_id, created_at);

create or replace function public.audit_log_append_only()
returns trigger language plpgsql set search_path = public as $$
begin
  raise exception 'audit_log는 추가만 가능합니다 (WIO A등급 2)' using errcode = '42501';
end $$;

drop trigger if exists audit_log_no_change on public.audit_log;
create trigger audit_log_no_change before update or delete on public.audit_log
  for each row execute function public.audit_log_append_only();
drop trigger if exists audit_log_no_truncate on public.audit_log;
create trigger audit_log_no_truncate before truncate on public.audit_log
  for each statement execute function public.audit_log_append_only();

-- 열람: 기록에 변경 전후 값이 그대로 담기므로 원 테이블과 같은 직무 기준 (개인정보보호법 제29조, CLAUDE.md §1.6)
create or replace function public.audit_log_readable(p_resource text)
returns boolean language sql stable security invoker set search_path = public as $$
  select public.auth_is_super_admin() or case
    when p_resource in ('payroll','incentives')
      then public.auth_has_duty('payroll') or public.auth_has_duty('accounting')
    when p_resource in ('expenses','payments','invoices','card_usage','fin_journals','wio_expenses')
      then public.auth_has_duty('finance') or public.auth_has_duty('accounting')
    when p_resource in ('tenone_staff_profiles','timesheet_weeks')
      then public.auth_has_duty('hr')
    when p_resource in ('approvals','wio_approvals','approval_requests','wio_workflow_instances')
      then public.auth_is_staff()
    else false            -- member_roles 등 권한 기록은 마스터만
  end
$$;

drop policy if exists audit_select on public.audit_log;
create policy audit_select on public.audit_log for select to authenticated
  using (public.audit_log_readable(resource));

revoke insert, update, delete, truncate on public.audit_log from anon, authenticated, service_role;
grant select on public.audit_log to authenticated;
grant select on public.audit_log to service_role;

-- -------------------------------------------------------------------------------------
-- ② 변경 기록 트리거 — 하나를 여러 테이블에
--    action: insert / update / delete / status:<전>→<후>
--    details: {record_id, op, via(authenticated·service_role·db), auth_uid, changed{컬럼:[전,후]} | row, exception}
-- -------------------------------------------------------------------------------------
-- ⚠️ audit_log.actor_id·target_id는 members FK — 행 ID를 target_id에 넣으면 대상 테이블 쓰기가 전부 실패한다
--    (2026-10-15 적용 직후 발견·즉시 수정). 행 ID = details.record_id, target_id = 그 행이 가리키는 회원
create or replace function public.record_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_old     jsonb := case when tg_op <> 'INSERT' then to_jsonb(old) end;
  v_new     jsonb := case when tg_op <> 'DELETE' then to_jsonb(new) end;
  v_row     jsonb := coalesce(v_new, v_old);
  v_changed jsonb;
  v_action  text  := lower(tg_op);
  v_exc     text  := nullif(current_setting('intra.exception', true), '');
  v_actor   uuid  := coalesce(public.auth_member_id(), auth.uid());
  v_target  uuid  := coalesce(nullif(v_row->>'member_id','')::uuid, nullif(v_row->>'drafter_id','')::uuid);
begin
  if tg_op = 'UPDATE' then
    select jsonb_object_agg(n.key, jsonb_build_array(v_old->n.key, n.value))
      into v_changed
      from jsonb_each(v_new) n
     where n.value is distinct from v_old->n.key and n.key not in ('updated_at');
    if v_changed is null then return null; end if;      -- 바뀐 것 없음
    if v_changed ? 'status' then
      v_action := 'status:' || coalesce(v_old->>'status','') || '→' || coalesce(v_new->>'status','');
    end if;
  end if;

  insert into public.audit_log (actor_id, target_id, action, resource, details, tenant_id)
  values (
    (select id from public.members where id = v_actor),
    (select id from public.members where id = v_target),
    v_action,
    tg_table_name,
    jsonb_strip_nulls(jsonb_build_object(
      'record_id', coalesce(v_row->>'id', v_row->>'member_id'),
      'op', lower(tg_op),
      'via', coalesce(nullif(auth.role(), ''), 'db'),
      'auth_uid', auth.uid(),
      'changed', v_changed,
      'row', case when tg_op <> 'UPDATE' then v_row end,
      'exception', v_exc)),
    coalesce(v_row->>'tenant_id', 'tenone'));
  if v_exc is not null and tg_table_name = 'approvals' then
    perform set_config('intra.exception', '', true);   -- 예외 표시는 그 결재 한 건에만
  end if;
  return null;
end $$;
create index if not exists audit_log_record_idx on public.audit_log(resource, ((details->>'record_id')), created_at);

do $$
declare t text;
begin
  foreach t in array array[
    'approvals','wio_approvals','approval_requests','wio_workflow_instances',   -- 결재
    'expenses','wio_expenses','payments','invoices','card_usage','fin_journals', -- 재무
    'payroll','incentives',                                                      -- 급여
    'tenone_staff_profiles','timesheet_weeks',                                   -- 인사
    'member_roles'                                                               -- 권한
  ] loop
    if to_regclass('public.' || t) is not null then
      execute format('drop trigger if exists zz_record_change on public.%I', t);
      execute format('create trigger zz_record_change after insert or update or delete on public.%I
                      for each row execute function public.record_change()', t);
    end if;
  end loop;
end $$;

-- -------------------------------------------------------------------------------------
-- ③ 결재 판단 보호 — 자기 결재 금지 · 끝난 결재 잠금
--    BEFORE UPDATE. 행위자를 알 수 없는 DB 직접 작업(마이그레이션)은 잠금만 적용
-- -------------------------------------------------------------------------------------
create or replace function public.guard_approval_decision()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_final  text[] := array['approved','rejected','completed'];
  v_member uuid   := public.auth_member_id();
  v_self   boolean := false;
begin
  if new.status is not distinct from old.status then return new; end if;

  -- 끝난 결재는 되돌리지 않는다 (정정은 새 문서로) — 백서 9장 정정 원칙
  if old.status = any (v_final) then
    raise exception '이미 끝난 결재(%)는 바꿀 수 없습니다. 새 문서로 다시 올려 주세요', old.status
      using errcode = '42501';
  end if;

  if not (new.status = any (v_final)) then return new; end if;

  -- 요청자 본인인가
  if tg_table_name = 'approvals' then
    v_self := v_member is not null and old.drafter_id = v_member;
  elsif tg_table_name in ('wio_approvals','approval_requests') then
    v_self := auth.uid() is not null and exists (
      select 1 from public.wio_members w where w.id = old.requester_id and w.user_id = auth.uid());
  end if;

  if v_self then
    if tg_table_name = 'approvals' and public.auth_is_super_admin() then
      -- 인트라 1인 운영 예외 (Intra 진단 8장): 허용하되 기록에 예외로 남긴다
      perform set_config('intra.exception', 'self_approval', true);
    else
      raise exception '자기가 올린 결재는 직접 승인·반려할 수 없습니다 (WIO A등급 3)' using errcode = '42501';
    end if;
  end if;

  -- 판단 시각·판단자 채우기 (앱이 빠뜨려도)
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

do $$
declare t text;
begin
  foreach t in array array['approvals','wio_approvals','approval_requests'] loop
    execute format('drop trigger if exists guard_approval_decision on public.%I', t);
    execute format('create trigger guard_approval_decision before update of status on public.%I
                    for each row execute function public.guard_approval_decision()', t);
  end loop;
end $$;

-- 기안자 = 로그인한 회원 (화면이 drafter_id를 빠뜨려도)
alter table public.approvals alter column drafter_id set default public.auth_member_id();

-- -------------------------------------------------------------------------------------
-- ④ 결재 결과 → 연결된 경비 상태 (같은 트랜잭션, 경비 RLS와 무관하게)
-- -------------------------------------------------------------------------------------
create or replace function public.sync_expense_from_approval()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status
     and new.status in ('approved','rejected')
     and new.reference_type = 'expense' and new.reference_id is not null then
    update public.expenses
       set status      = new.status,
           approved_by = case when new.status = 'approved' then public.auth_member_id() end,
           approved_at = case when new.status = 'approved' then now() end
     where id = new.reference_id and status = 'pending';
  end if;
  return null;
end $$;

drop trigger if exists sync_expense_from_approval on public.approvals;
create trigger sync_expense_from_approval after update of status on public.approvals
  for each row execute function public.sync_expense_from_approval();

-- 내부 함수는 트리거로만 실행
revoke all on function public.record_change()              from public, anon, authenticated;
revoke all on function public.guard_approval_decision()    from public, anon, authenticated;
revoke all on function public.sync_expense_from_approval() from public, anon, authenticated;
revoke all on function public.audit_log_append_only()      from public, anon, authenticated;
revoke all on function public.audit_log_readable(text) from public, anon;
grant execute on function public.audit_log_readable(text) to authenticated;
