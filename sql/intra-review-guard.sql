-- =====================================================================================
-- 브랜드 심사 경로 보호 (WIO 백서 기준 2단계-1) — 끝난 심사 잠금 · 본인 셀프 승인 차단 · 역할 이력 보호 · 기록
-- =====================================================================================
-- 대상 DB : 유니버스 DB ziotlxkdctlhiwkgmmsh
-- 상태    : 2026-10-15 사용자 승인 후 적용 (마이그레이션 intra_review_guard) · 재실행 가능
-- 선행    : sql/intra-record-and-approval-guard.sql (audit_log·record_change)
-- 근거    : WIO 백서 9장(정정은 새 기록)·11장 A등급 2·3·14장(상태 전이는 DB가 막는다)
--           docs/wio/Intra_Approval_State_Map.md 3장(브랜드 심사)
--
-- 발견한 구멍 (2026-10-15)
--   - jakka_seller_applications: 신청자 UPDATE 정책이 status='pending'만 보고 WITH CHECK 없음 → 본인이 status='approved'로 바꿀 수 있음
--   - badak_leader_applications: 신청자 INSERT 정책이 status를 안 봄 → 'approved'로 바로 넣을 수 있음
--   - 4개 심사 테이블 모두 끝난 심사(승인·반려)를 다시 바꿀 수 있음 (accepted→rejected 등)
--   - 바닥장 승인 후 역할 부여가 두 경로에서 달랐음 (API 'leader' = CHECK 위반으로 항상 실패, 인트라 'badakjang')
-- =====================================================================================

-- -------------------------------------------------------------------------------------
-- ① 끝난 심사 잠금 — 인자: 끝난 상태 목록(쉼표). 정정은 새 신청으로
-- -------------------------------------------------------------------------------------
create or replace function public.guard_review_status()
returns trigger language plpgsql set search_path = public as $$
declare
  v_final text[] := string_to_array(tg_argv[0], ',');
begin
  if new.status is distinct from old.status and old.status = any (v_final) then
    raise exception '이미 끝난 심사(%)는 바꿀 수 없습니다. 새 신청으로 처리해 주세요', old.status
      using errcode = '42501';
  end if;
  return new;
end $$;

do $$
declare r record;
begin
  for r in select * from (values
    ('badak_leader_applications', 'approved,rejected'),
    ('mad_applications',          'accepted,rejected'),
    ('program_applications',      'accepted,declined'),   -- withdrawn → pending(재신청)은 허용
    ('jakka_seller_applications', 'approved,rejected')
  ) as t(tbl, finals) loop
    execute format('drop trigger if exists guard_review_status on public.%I', r.tbl);
    execute format('create trigger guard_review_status before update of status on public.%I
                    for each row execute function public.guard_review_status(%L)', r.tbl, r.finals);
  end loop;
end $$;

-- -------------------------------------------------------------------------------------
-- ② 신청자 셀프 승인 차단 — 기존 protect_review_columns 재사용 (직원은 통과, 신청자는 허용 상태로 고정)
-- -------------------------------------------------------------------------------------
drop trigger if exists protect_review_columns on public.jakka_seller_applications;
create trigger protect_review_columns before insert or update on public.jakka_seller_applications
  for each row execute function public.protect_review_columns('pending,withdrawn', 'reviewer_id', 'reviewer_note', 'reviewed_at');

drop trigger if exists protect_review_columns on public.badak_leader_applications;
create trigger protect_review_columns before insert or update on public.badak_leader_applications
  for each row execute function public.protect_review_columns('pending', 'reviewer_note', 'reviewed_at');

-- -------------------------------------------------------------------------------------
-- ③ 바닥장 승인 → 역할 부여를 DB가 한 번에 (경로가 몇 개든 결과가 같게)
-- -------------------------------------------------------------------------------------
create or replace function public.badak_promote_on_leader_approval()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'approved' and old.status is distinct from 'approved' then
    update public.badak_members
       set role = 'badakjang',
           leader_level = coalesce(leader_level, 'C'),
           level_updated_at = coalesce(level_updated_at, now())
     where role = 'member'
       and (id = new.member_id or (new.member_id is null and user_id = new.user_id));
  end if;
  return null;
end $$;

drop trigger if exists badak_promote_on_leader_approval on public.badak_leader_applications;
create trigger badak_promote_on_leader_approval after update of status on public.badak_leader_applications
  for each row execute function public.badak_promote_on_leader_approval();

-- -------------------------------------------------------------------------------------
-- ④ 역할 이력 보호 (CLAUDE.md §1.3.1 "UPDATE 금지 — valid_until 설정 + 새 행")
--    허용되는 UPDATE는 진행 중 역할 종료(valid_until NULL → 값) 하나뿐
-- -------------------------------------------------------------------------------------
create or replace function public.guard_capability_role_update()
returns trigger language plpgsql set search_path = public as $$
begin
  if old.valid_until is not null then
    raise exception '끝난 역할 기록은 바꿀 수 없습니다 (새 행으로 추가)' using errcode = '42501';
  end if;
  if (to_jsonb(new) - 'valid_until') is distinct from (to_jsonb(old) - 'valid_until') then
    raise exception '역할 기록은 종료(valid_until)만 할 수 있습니다. 바뀐 역할은 새 행으로 추가하세요' using errcode = '42501';
  end if;
  return new;
end $$;

drop trigger if exists guard_capability_role_update on public.member_capability_roles;
create trigger guard_capability_role_update before update on public.member_capability_roles
  for each row execute function public.guard_capability_role_update();

-- -------------------------------------------------------------------------------------
-- ⑤ 기록 — 심사 4종 + 회원 역할. 계좌·연락처 원문은 기록에 넣지 않는다 (백서 9장)
-- -------------------------------------------------------------------------------------
create or replace function public.record_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  c_redact  constant text[] := array['bank_account_number','bank_account_holder','business_number',
                                     'tax_invoice_email','contact','phone','email','emergency_contact'];
  v_old     jsonb := case when tg_op <> 'INSERT' then to_jsonb(old) end;
  v_new     jsonb := case when tg_op <> 'DELETE' then to_jsonb(new) end;
  v_row     jsonb;
  v_changed jsonb;
  v_action  text  := lower(tg_op);
  v_exc     text  := nullif(current_setting('intra.exception', true), '');
  v_actor   uuid  := coalesce(public.auth_member_id(), auth.uid());
  v_target  uuid;
  k         text;
begin
  v_row    := coalesce(v_new, v_old);
  v_target := coalesce(nullif(v_row->>'member_id','')::uuid, nullif(v_row->>'drafter_id','')::uuid);

  if tg_op = 'UPDATE' then
    select jsonb_object_agg(n.key, jsonb_build_array(v_old->n.key, n.value))
      into v_changed
      from jsonb_each(v_new) n
     where n.value is distinct from v_old->n.key and n.key not in ('updated_at');
    if v_changed is null then return null; end if;
    if v_changed ? 'status' then
      v_action := 'status:' || coalesce(v_old->>'status','') || '→' || coalesce(v_new->>'status','');
    end if;
  end if;

  -- 개인정보 원문 가리기 (바뀌었다는 사실만 남긴다)
  foreach k in array c_redact loop
    if v_changed ? k then v_changed := jsonb_set(v_changed, array[k], '["***","***"]'); end if;
    if v_row ? k and v_row->>k is not null then v_row := jsonb_set(v_row, array[k], '"***"'); end if;
  end loop;

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
    perform set_config('intra.exception', '', true);
  end if;
  return null;
end $$;
revoke all on function public.record_change() from public, anon, authenticated;

do $$
declare t text;
begin
  foreach t in array array['badak_leader_applications','mad_applications','program_applications',
                           'jakka_seller_applications','member_capability_roles'] loop
    execute format('drop trigger if exists zz_record_change on public.%I', t);
    execute format('create trigger zz_record_change after insert or update or delete on public.%I
                    for each row execute function public.record_change()', t);
  end loop;
end $$;

create or replace function public.audit_log_readable(p_resource text)
returns boolean language sql stable security invoker set search_path = public as $$
  select public.auth_is_super_admin() or case
    when p_resource in ('payroll','incentives')
      then public.auth_has_duty('payroll') or public.auth_has_duty('accounting')
    when p_resource in ('expenses','payments','invoices','card_usage','fin_journals','wio_expenses')
      then public.auth_has_duty('finance') or public.auth_has_duty('accounting')
    when p_resource in ('tenone_staff_profiles','timesheet_weeks')
      then public.auth_has_duty('hr')
    when p_resource in ('approvals','wio_approvals','approval_requests','wio_workflow_instances',
                        'badak_leader_applications','mad_applications','program_applications',
                        'jakka_seller_applications','member_capability_roles')
      then public.auth_is_staff()
    else false            -- member_roles 등 권한 기록은 마스터만
  end
$$;
revoke all on function public.audit_log_readable(text) from public, anon;
grant execute on function public.audit_log_readable(text) to authenticated;

revoke all on function public.guard_review_status()               from public, anon, authenticated;
revoke all on function public.badak_promote_on_leader_approval()  from public, anon, authenticated;
revoke all on function public.guard_capability_role_update()      from public, anon, authenticated;
