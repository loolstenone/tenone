-- =====================================================================================
-- 퇴사 처리를 DB 함수 하나로 (WIO 백서 기준 2단계-2) — 권한 회수·상태·퇴사일이 같이 되거나 같이 안 되게
-- =====================================================================================
-- 대상 DB : 유니버스 DB ziotlxkdctlhiwkgmmsh
-- 상태    : 2026-10-15 사용자 승인 후 적용 (마이그레이션 staff_offboard) · 재실행 가능
-- 선행    : sql/intra-record-and-approval-guard.sql · sql/intra-review-guard.sql (record_change)
-- 근거    : WIO 백서 11장 A등급 1(단일 쓰기 경로)·5(실제 판단자 기록)·14장(상태 전이는 DB 함수)
--
-- 이전 (lib/staff-lifecycle.ts offboardStaff): 권한 회수 → 기본 회원 권한 → 직원 상태 → 회원 유형을 앱이 차례로 update.
--   중간 실패 시 일부 권한만 회수된 채 남고, 뒤 단계 에러는 무시됐다. 서버 키로 실행돼 기록에 처리자도 안 남았다
-- 이후: staff_offboard() 한 번 = 한 트랜잭션. 권한 판단(인사 직무·마스터)도 DB가 실시간 member_roles로 다시 확인
--
-- ⚠️ 남는 틈: 퇴사자의 브라우저에 이미 발급된 로그인 토큰(JWT)은 만료(최대 1시간)까지 is_staff를 갖고 있다.
--    인트라 화면·서버 API는 middleware가 요청마다 member_roles를 보므로 즉시 막히지만, 브라우저 → DB 직접 조회(RLS)는
--    토큰 갱신 전까지 직원으로 통과할 수 있다
-- =====================================================================================

-- -------------------------------------------------------------------------------------
-- ① 기록의 처리자 — 서버 키(service_role)로 실행되는 DB 함수는 auth_member_id()가 비므로,
--    함수가 확인한 처리자를 트랜잭션 안에서만 넘긴다 (intra.actor). 로그인 사용자 요청은 항상 JWT가 우선
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
  v_actor   uuid  := coalesce(public.auth_member_id(),
                              nullif(current_setting('intra.actor', true), '')::uuid,
                              auth.uid());
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

-- -------------------------------------------------------------------------------------
-- ② 퇴사 처리 — 일반 회원(member@universe)만 남기고 모든 권한 회수 + 직원 상태 offboarded + 퇴사일
--    실행: 서버(service_role)만. 처리자(p_by) 자격은 함수 안에서 실시간 member_roles로 확인
-- -------------------------------------------------------------------------------------
create or replace function public.staff_offboard(p_member uuid, p_left_at date, p_by uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_status  text;
  v_revoked int;
begin
  if p_member is null or p_left_at is null then
    raise exception '직원과 퇴사일을 지정하세요' using errcode = '22023';
  end if;
  if p_by is null or not exists (
      select 1 from public.member_roles
       where member_id = p_by and is_active and (expires_at is null or expires_at > now())
         and ((role = 'super_admin' and context = 'universe') or (role = 'hr' and context = 'duty'))) then
    raise exception '퇴사 처리는 인사 담당 또는 마스터만 할 수 있습니다' using errcode = '42501';
  end if;
  if p_member = p_by then
    raise exception '본인은 퇴사 처리할 수 없습니다' using errcode = '42501';
  end if;
  if exists (select 1 from public.member_roles
              where member_id = p_member and role = 'super_admin' and context = 'universe' and is_active) then
    raise exception '마스터 계정은 퇴사 처리할 수 없습니다' using errcode = '42501';
  end if;

  select status into v_status from public.tenone_staff_profiles where member_id = p_member for update;
  if not found then
    raise exception '직원 정보가 없습니다' using errcode = 'P0002';
  end if;
  if v_status = 'offboarded' then
    raise exception '이미 퇴사 처리된 직원입니다' using errcode = '42501';
  end if;

  perform set_config('intra.actor', p_by::text, true);

  update public.member_roles
     set is_active = false, expires_at = now()
   where member_id = p_member and is_active
     and not (role = 'member' and context = 'universe');
  get diagnostics v_revoked = row_count;

  insert into public.member_roles (member_id, role, context, is_active, granted_by)
  values (p_member, 'member', 'universe', true, p_by)
  on conflict (member_id, role, context) do update
    set is_active = true, expires_at = null
    where not public.member_roles.is_active or public.member_roles.expires_at is not null;

  update public.tenone_staff_profiles
     set status = 'offboarded', left_at = p_left_at
   where member_id = p_member;

  return jsonb_build_object('revoked', v_revoked);
end $$;

revoke all on function public.staff_offboard(uuid, date, uuid) from public, anon, authenticated;
grant execute on function public.staff_offboard(uuid, date, uuid) to service_role;
