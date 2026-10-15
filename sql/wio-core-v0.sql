-- =====================================================================================
-- WIO Core v0 — 기본 단위 8 + event_log + 기록 트리거 + 단일 행위 함수 (초안)
-- =====================================================================================
-- 대상 DB : WIO 전용 Supabase 프로젝트 "WIO" (xyfnjklkszykkrlqdkwh · 서울 · 2026-10-15 생성, 무료)
--           ⛔ 유니버스 DB(ziotlxkdctlhiwkgmmsh)에 적용하지 않는다.
-- 상태    : 초안 · 2026-10-15 적용 (마이그레이션 wio_core_v0 + wio_core_v0_search_path) · 보안 어드바이저 경고 0
--           재실행 가능(IF NOT EXISTS / OR REPLACE / DROP IF EXISTS) · 테넌트는 아직 없음 (bootstrap_tenant 미실행)
-- 근거    : docs/WIO 백서 Way It Operates.md 3장(원칙)·4장(기본 단위)·11장(A등급)·14장(상태 전이는 DB 함수로만)
--           docs/WIO 기본 설계 AI 업무 통제 플랫폼.md 3장(event_log 필드)·4장(handoff)·12장(A등급 10개)
--           docs/wio/Intra_Approval_State_Map.md (현재 앱의 결재·상태 전이 위치 — 옮겨 올 대상 목록)
--
-- 기본 단위 8 = Actor · Membership · Party · Agreement · Work · Money · Policy · Evidence
--   (백서 4장 표의 Event는 별도로 event_log가 담당한다. handoff는 Work의 kind='handoff')
--
-- 쓰기 구조 (백서 원칙 4 "모든 쓰기는 한 경로를 지난다")
--   클라이언트·에이전트·관리자 ─▶ wio.act()  ── 근거 체인 검사 → 정책 판정 → 판정 기록 → 반영
--                                     │
--                     반영되는 순간 ─▶ wio.tg_record() (모든 단위 테이블의 BEFORE 트리거)
--                                     ├ wio.act()가 연 행위 맥락(wio.ctx)이 없으면 거부  = 우회 차단
--                                     ├ 상태 변경은 transition 행위 + wio.state_transitions에 있는 전이만
--                                     └ event_log에 한 줄 (변경 전후 · 행위자 · 판정 · 근거)
--   event_log 는 추가만 가능 (UPDATE·DELETE·TRUNCATE 트리거 거부 + 권한 회수) · 테넌트별 해시 체인
--
-- A등급(절대 불변) 구현 위치
--   1 단일 쓰기 경로 ............ tg_record 맥락 검사 · 단위 테이블에 authenticated 쓰기 권한 없음
--   2 기록은 추가만 ............. tg_event_guard · REVOKE · 정정은 reverse(역이벤트)
--   3 자기 승인 금지 ............ _judge (요청자=승인자 · 정책 작성자 · 직무분리 2조합)
--   4 fail closed ............... decide: 맞는 정책 없으면 deny · 행위자 확인 불가면 거부
--   5 실제 판단자 기록 .......... event_log.actor_id(실행) · on_behalf_of(대리) · decided_by(승인)
--   6 AI 권한 상승 불가 ......... decide: agent의 policy·membership·actor 행위 deny · 승인은 human만
--   7 차대 일치 ................. money_entries 한 행 = 한 금액 + 차변≠대변 CHECK
--   8 마감 기간 불변 ............ ⏳ TODO (accounting_periods 단위 추가 후)
--   9 보존기간·legal hold ....... evidence 삭제 차단 (tg_record) · 원장 삭제는 경로 자체가 없음
--  10 테넌트 격리 ............... RLS(SELECT만) + act의 테넌트 일치 검사 · AI의 사람 평가 확정 금지 ⏳ (평가 대상 단위 추가 후)
--
-- 유니버스 공통 규칙과 다른 점 (의도된 차이)
--   - 테이블이 public이 아니라 schema wio. 대시보드 › API › Exposed schemas에 wio 추가해야 조회 가능
--   - 부록 D GRANT 블록(authenticated DML)을 따르지 않는다: 쓰기는 wio.act()만 (A등급 1). 조회는 SELECT + RLS
--   - 개인정보 원문을 단위 테이블에 두지 않는다 (백서 9장): human Actor는 global_person_id(가명 ID)만, 이름 없음
-- =====================================================================================

create schema if not exists wio;
create extension if not exists pgcrypto with schema extensions;

-- 시스템 Actor (부트스트랩·스케줄러 행위자) — 고정 ID
-- 00000000-0000-0000-0000-0000000000a1

-- -------------------------------------------------------------------------------------
-- 0. 테넌트 (계약 단위 — 기본 단위는 아니지만 모든 단위의 격리 키)
-- -------------------------------------------------------------------------------------
create table if not exists wio.tenants (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  status      text not null default 'active' check (status in ('active','suspended','closed')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- -------------------------------------------------------------------------------------
-- 1. Actor — 사람·AI 에이전트·외부 연동. 사람의 신원은 회사 위에 하나 (tenant_id 없음)
-- -------------------------------------------------------------------------------------
create table if not exists wio.actors (
  id                  uuid primary key default gen_random_uuid(),
  type                text not null check (type in ('human','agent','integration','system')),
  global_person_id    uuid,                 -- Ten:One ID(members.id) 등 회사 밖 신원. 가명 키로만 보관
  auth_user_id        uuid unique,          -- 이 프로젝트 auth.users.id (에이전트도 자기 계정으로 로그인 — service_role 금지)
  label               text,                 -- 에이전트·연동 이름만. 사람 이름은 넣지 않는다 (CHECK)
  delegation_profile  text,                 -- 위임 프로필 키 → policies.actor_profile
  status              text not null default 'active' check (status in ('active','suspended','retired')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint actors_human_identity check (type <> 'human' or (global_person_id is not null and label is null))
);

-- -------------------------------------------------------------------------------------
-- 2. Membership — Actor가 회사와 맺는 기간 있는 관계
-- -------------------------------------------------------------------------------------
create table if not exists wio.memberships (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references wio.tenants(id),
  actor_id    uuid not null references wio.actors(id),
  role        text not null check (role in ('owner','employee','partner','contractor','guest','agent','integration')),
  scope       jsonb not null default '{}'::jsonb,   -- 접근 범위(업무·예산 항목 등). 판정은 policies가 한다
  valid_from  timestamptz not null default now(),
  valid_to    timestamptz,
  status      text not null default 'active' check (status in ('active','ended')),
  created_by  uuid references wio.actors(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint memberships_period check (valid_to is null or valid_to > valid_from)
);
create unique index if not exists memberships_active_uq on wio.memberships(tenant_id, actor_id, role) where status = 'active';
create index if not exists memberships_actor_idx on wio.memberships(actor_id);

-- -------------------------------------------------------------------------------------
-- 3. Party — 고객·거래처·외주사·파트너 (한 회사가 여러 역할)
-- -------------------------------------------------------------------------------------
create table if not exists wio.parties (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references wio.tenants(id),
  legal_name  text not null,
  biz_reg_no  text,
  roles       text[] not null default '{}' check (roles <@ array['customer','supplier','contractor','partner']::text[]),
  bank_ref    text,                          -- 계좌 원문 아님 — 별도 암호화 저장소 참조
  risk_level  text not null default 'normal' check (risk_level in ('low','normal','high','blocked')),
  status      text not null default 'draft' check (status in ('draft','active','suspended','closed')),
  created_by  uuid references wio.actors(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create unique index if not exists parties_bizno_uq on wio.parties(tenant_id, biz_reg_no) where biz_reg_no is not null;

-- -------------------------------------------------------------------------------------
-- 4. Agreement — 견적·계약·발주서·변경계약 (변경계약은 새 버전 행)
-- -------------------------------------------------------------------------------------
create table if not exists wio.agreements (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references wio.tenants(id),
  kind          text not null check (kind in ('quote','contract','purchase_order','amendment')),
  party_id      uuid not null references wio.parties(id),
  parent_id     uuid references wio.agreements(id),   -- 변경계약이 고치는 원 계약
  version       int  not null default 1 check (version >= 1),
  title         text,
  amount        bigint not null default 0 check (amount >= 0),
  currency      char(3) not null default 'KRW',
  period_start  date,
  period_end    date,
  status        text not null default 'draft'
                check (status in ('draft','submitted','approved','rejected','sent','active','closed','terminated','cancelled')),
  created_by    uuid references wio.actors(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint agreements_period check (period_end is null or period_start is null or period_end >= period_start),
  constraint agreements_amendment check (kind <> 'amendment' or parent_id is not null)
);
create index if not exists agreements_party_idx on wio.agreements(party_id);

-- -------------------------------------------------------------------------------------
-- 5. Work — 목표·프로젝트·업무 항목·핸드오프
--    handoff: requester(주는 쪽) → owner(받는 쪽), 마감·완료 기준 필수, 제출과 확인 분리
-- -------------------------------------------------------------------------------------
create table if not exists wio.work_items (
  id                  uuid primary key default gen_random_uuid(),
  tenant_id           uuid not null references wio.tenants(id),
  kind                text not null check (kind in ('goal','project','item','handoff')),
  parent_id           uuid references wio.work_items(id),
  title               text not null,
  owner_actor_id      uuid references wio.actors(id),
  requester_actor_id  uuid references wio.actors(id),
  agreement_id        uuid references wio.agreements(id),   -- 납품·검수 대상 계약
  due_at              timestamptz,
  done_criteria       text,
  blocks              uuid[] not null default '{}',        -- 이 건이 끝나야 시작할 수 있는 다른 work
  response_event_id   uuid,                                -- 완료·반려를 기록한 event
  status              text not null default 'open'
                      check (status in ('open','requested','accepted','in_progress','submitted','verified','rejected','closed','cancelled')),
  created_by          uuid references wio.actors(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint work_handoff_required check (
    kind <> 'handoff' or (requester_actor_id is not null and owner_actor_id is not null
                          and due_at is not null and coalesce(done_criteria,'') <> ''))
);
create index if not exists work_items_parent_idx on wio.work_items(parent_id);
create index if not exists work_items_owner_idx on wio.work_items(owner_actor_id) where status not in ('closed','cancelled');

-- -------------------------------------------------------------------------------------
-- 6. Money — 예산 항목·약정·청구·지급·수금·AI 사용 비용. 한 행 = 한 금액의 분개(차변=대변)
-- -------------------------------------------------------------------------------------
create table if not exists wio.money_entries (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references wio.tenants(id),
  kind             text not null check (kind in ('budget_line','commitment','invoice_in','invoice_out','payment','receipt','ai_cost','adjustment')),
  budget_line_id   uuid references wio.money_entries(id),
  agreement_id     uuid references wio.agreements(id),
  work_id          uuid references wio.work_items(id),
  party_id         uuid references wio.parties(id),
  amount           bigint not null check (amount >= 0),
  currency         char(3) not null default 'KRW',
  debit_account    text,
  credit_account   text,
  accounting_date  date not null default current_date,
  reverses_id      uuid references wio.money_entries(id),   -- 정정: 원 행을 고치지 않고 역분개
  status           text not null default 'draft'
                   check (status in ('draft','submitted','approved','rejected','issued','paid','collected','active','closed','cancelled')),
  created_by       uuid references wio.actors(id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint money_double_entry check (
    kind = 'budget_line'
    or (debit_account is not null and credit_account is not null and debit_account <> credit_account))
);
create index if not exists money_agreement_idx on wio.money_entries(agreement_id);
create index if not exists money_budget_idx on wio.money_entries(budget_line_id);

-- -------------------------------------------------------------------------------------
-- 7. Policy — 위임전결 규칙 · 법규 팩. B등급(WIO 배포, tenant_id NULL) / C등급(회사 설정)
--    판정 기록(policy_decisions)도 Policy 단위에 속한다 = 결재 기록의 단일 원본
-- -------------------------------------------------------------------------------------
create table if not exists wio.policies (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          uuid references wio.tenants(id),
  grade              char(1) not null check (grade in ('B','C')),
  rule_key           text not null,                  -- 사람이 읽는 규칙 이름
  action_pattern     text not null,                  -- 'money.transition:paid', 'work.*', '*'
  actor_type         text check (actor_type in ('human','agent','integration','system')),
  actor_profile      text,                           -- actors.delegation_profile 과 맞으면 적용
  money_min          bigint check (money_min >= 0),  -- 금액 구간 [min, max)
  money_max          bigint check (money_max >= 0),
  reversibility      text check (reversibility in ('internal','external')),
  outcome            text not null check (outcome in ('auto','notify','approve','deny')),
  approver_actor_id  uuid references wio.actors(id), -- 비면 테넌트 owner
  valid_from         timestamptz not null default now(),
  valid_to           timestamptz,
  version            int not null default 1,
  status             text not null default 'draft' check (status in ('draft','active','retired')),
  created_by         uuid references wio.actors(id),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint policies_grade_tenant check ((grade = 'B' and tenant_id is null) or (grade = 'C' and tenant_id is not null)),
  constraint policies_period check (valid_to is null or valid_to > valid_from)
);
create index if not exists policies_lookup_idx on wio.policies(tenant_id, status);

create table if not exists wio.policy_decisions (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          uuid not null references wio.tenants(id),
  request_id         uuid,                         -- 멱등 키 (같은 요청 재전송 시 같은 결과)
  actor_id           uuid not null references wio.actors(id),
  on_behalf_of       uuid references wio.actors(id),
  action_key         text not null,
  object_type        text not null,
  object_id          uuid,
  request            jsonb not null,               -- 승인 후 실행할 원 요청 그대로
  amount             bigint,
  reversibility      text,
  policy_id          uuid references wio.policies(id),
  outcome            text not null check (outcome in ('auto','notify','approve','deny')),
  reason             text,
  approver_actor_id  uuid references wio.actors(id),
  status             text not null check (status in ('pending','executing','executed','rejected','denied','expired')),
  decided_by         uuid references wio.actors(id),
  decided_at         timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create unique index if not exists policy_decisions_request_uq on wio.policy_decisions(tenant_id, request_id) where request_id is not null;
create index if not exists policy_decisions_queue_idx on wio.policy_decisions(tenant_id, approver_actor_id) where status = 'pending';

-- -------------------------------------------------------------------------------------
-- 8. Evidence — 문서·메일·외부 레코드·승인 기록. 해시로 원본 고정
-- -------------------------------------------------------------------------------------
create table if not exists wio.evidence (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references wio.tenants(id),
  kind             text not null check (kind in ('document','email','external_record','approval','receipt','tax_invoice','other')),
  uri              text,
  hash             text not null,                   -- sha256 hex
  retention_until  date,                            -- 법정 보존기한 (B등급 법규 팩이 채움)
  legal_hold       boolean not null default false,
  status           text not null default 'active' check (status in ('active','superseded')),
  created_by       uuid references wio.actors(id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- -------------------------------------------------------------------------------------
-- 허용 상태 전이 (WIO 표준 아래층 — 회사별 단계는 policies로 조립, 전이 자체는 고정)
-- -------------------------------------------------------------------------------------
create table if not exists wio.state_transitions (
  object_type    text not null,
  from_status    text not null,
  to_status      text not null,
  reversibility  text not null default 'internal' check (reversibility in ('internal','external')),
  primary key (object_type, from_status, to_status)
);

insert into wio.state_transitions(object_type, from_status, to_status, reversibility) values
  -- Agreement
  ('agreement','draft','submitted','internal'), ('agreement','submitted','approved','internal'),
  ('agreement','submitted','rejected','internal'), ('agreement','rejected','draft','internal'),
  ('agreement','approved','sent','external'),     ('agreement','approved','active','internal'),
  ('agreement','sent','active','external'),       ('agreement','active','closed','internal'),
  ('agreement','active','terminated','external'), ('agreement','draft','cancelled','internal'),
  -- Work (goal·project·item = open 시작, handoff = requested 시작 / 제출과 확인 분리)
  ('work','open','in_progress','internal'),       ('work','requested','accepted','internal'),
  ('work','accepted','in_progress','internal'),   ('work','in_progress','submitted','internal'),
  ('work','submitted','verified','internal'),     ('work','submitted','rejected','internal'),
  ('work','rejected','in_progress','internal'),   ('work','verified','closed','internal'),
  ('work','open','cancelled','internal'),         ('work','requested','cancelled','internal'),
  ('work','in_progress','cancelled','internal'),
  -- Money
  ('money','draft','submitted','internal'),       ('money','submitted','approved','internal'),
  ('money','submitted','rejected','internal'),    ('money','rejected','draft','internal'),
  ('money','approved','paid','external'),         ('money','approved','issued','external'),
  ('money','issued','collected','internal'),      ('money','draft','cancelled','internal'),
  ('money','draft','active','internal'),          ('money','active','closed','internal'),
  -- Party
  ('party','draft','active','internal'),          ('party','active','suspended','internal'),
  ('party','suspended','active','internal'),      ('party','active','closed','internal'),
  -- Policy (C등급 변경 자체가 판정 대상)
  ('policy','draft','active','internal'),         ('policy','active','retired','internal'),
  -- Evidence · Membership · Actor · Tenant
  ('evidence','active','superseded','internal'),
  ('membership','active','ended','internal'),
  ('actor','active','suspended','internal'),      ('actor','suspended','active','internal'),
  ('actor','active','retired','internal'),
  ('tenant','active','suspended','internal'),     ('tenant','suspended','active','internal'),
  -- 판정 기록 (결재)
  ('policy_decision','pending','executing','internal'), ('policy_decision','pending','rejected','internal'),
  ('policy_decision','pending','expired','internal'),   ('policy_decision','executing','executed','internal')
on conflict do nothing;

-- -------------------------------------------------------------------------------------
-- event_log — 모든 변경의 원본. 추가만 가능. 테넌트별 seq + 해시 체인
-- -------------------------------------------------------------------------------------
create table if not exists wio.event_log (
  id                  uuid primary key default gen_random_uuid(),
  tenant_id           uuid,                          -- NULL = 플랫폼 체인 (전역 Actor 시드 등)
  seq                 bigint not null,
  occurred_at         timestamptz not null,          -- 발생 시각 (후결·사후 입력이면 과거)
  recorded_at         timestamptz not null default now(),  -- 기록 시각 (트리거가 강제)
  actor_id            uuid not null,                 -- 실제 실행·판단한 Actor (A5)
  on_behalf_of        uuid,                          -- 대리 실행 시 원 요청자
  action              text not null,                 -- 'money.transition:paid', 'decide:agreement.create' …
  object_type         text not null,
  object_id           uuid,
  reason_ref          uuid,                          -- 연결된 목표(work) 또는 예산 항목(money)
  evidence_ids        uuid[] not null default '{}',
  money_delta         jsonb,
  policy_decision_id  uuid,
  exception_kind      text check (exception_kind in ('substitute','post_approval','advance','late_entry','correction')),
  reverses_event_id   uuid,
  ai_meta             jsonb,                         -- {model, model_version, prompt_version, input_ref, output_ref} (인공지능기본법 5년)
  change              jsonb not null,                -- {op, before, after}
  prev_hash           text,
  hash                text not null,
  constraint event_log_tenant_fk   foreign key (tenant_id) references wio.tenants(id) deferrable initially deferred,
  constraint event_log_actor_fk    foreign key (actor_id) references wio.actors(id) deferrable initially deferred,
  constraint event_log_behalf_fk   foreign key (on_behalf_of) references wio.actors(id) deferrable initially deferred,
  constraint event_log_decision_fk foreign key (policy_decision_id) references wio.policy_decisions(id) deferrable initially deferred,
  constraint event_log_reverses_fk foreign key (reverses_event_id) references wio.event_log(id)
);
create unique index if not exists event_log_chain_uq
  on wio.event_log((coalesce(tenant_id, '00000000-0000-0000-0000-000000000000'::uuid)), seq);
create index if not exists event_log_object_idx on wio.event_log(object_type, object_id);
create index if not exists event_log_actor_idx on wio.event_log(actor_id, occurred_at);

-- =====================================================================================
-- 헬퍼
-- =====================================================================================

-- object_type → 테이블
create or replace function wio.table_of(p_object_type text)
returns text language sql immutable as $$
  select case p_object_type
    when 'tenant' then 'tenants'           when 'actor' then 'actors'
    when 'membership' then 'memberships'   when 'party' then 'parties'
    when 'agreement' then 'agreements'     when 'work' then 'work_items'
    when 'money' then 'money_entries'      when 'policy' then 'policies'
    when 'evidence' then 'evidence'        when 'policy_decision' then 'policy_decisions'
  end
$$;

create or replace function wio._has_col(p_table text, p_col text)
returns boolean language sql stable as $$
  select exists (select 1 from information_schema.columns
                 where table_schema = 'wio' and table_name = p_table and column_name = p_col)
$$;

-- payload 키 중 실제 컬럼인 것만 (동적 SQL 컬럼 목록)
create or replace function wio._cols(p_table text, p_payload jsonb)
returns text language sql stable as $$
  select string_agg(quote_ident(c.column_name), ', ' order by c.ordinal_position)
  from information_schema.columns c
  where c.table_schema = 'wio' and c.table_name = p_table and p_payload ? c.column_name
$$;

-- 로그인한 사용자의 Actor (fail closed: 없으면 NULL → 호출자가 거부)
create or replace function wio.current_actor()
returns uuid language sql stable security definer set search_path = wio, pg_temp as $$
  select id from wio.actors where auth_user_id = auth.uid() and status = 'active'
$$;

-- 로그인한 사용자가 지금 속한 테넌트 (RLS 기준)
create or replace function wio.my_tenants()
returns setof uuid language sql stable security definer set search_path = wio, pg_temp as $$
  select m.tenant_id
  from wio.memberships m
  join wio.actors a on a.id = m.actor_id
  where a.auth_user_id = auth.uid() and a.status = 'active'
    and m.status = 'active' and m.valid_from <= now() and (m.valid_to is null or m.valid_to > now())
$$;

-- 행위 맥락 열기·닫기 (트랜잭션 로컬) — wio.act 계열 함수만 호출
create or replace function wio._ctx_open(p_ctx jsonb)
returns void language sql as $$ select set_config('wio.ctx', p_ctx::text, true) $$;
create or replace function wio._ctx_close()
returns void language sql as $$ select set_config('wio.ctx', '', true) $$;

-- =====================================================================================
-- 기록 트리거 — 모든 단위 테이블 BEFORE INSERT/UPDATE/DELETE
--   ① 행위 맥락 없으면 거부 (A1)  ② 상태 전이 검사  ③ 불변 컬럼·보존 검사  ④ event_log 기록
-- =====================================================================================
create or replace function wio.tg_record()
returns trigger language plpgsql as $$
declare
  v_ctx     jsonb := nullif(current_setting('wio.ctx', true), '')::jsonb;
  v_obj     text  := tg_argv[0];
  v_old     jsonb;
  v_new     jsonb;
  v_row     jsonb;
  v_id      uuid;
  v_tenant  uuid;
begin
  if v_ctx is null then
    raise exception 'WIO-A1: wio.% 쓰기는 wio.act()로만 가능합니다', tg_table_name using errcode = '42501';
  end if;

  if tg_op <> 'INSERT' then v_old := to_jsonb(old); end if;
  if tg_op <> 'DELETE' then v_new := to_jsonb(new); end if;
  v_row := coalesce(v_new, v_old);
  v_id  := (v_row->>'id')::uuid;

  if tg_op = 'UPDATE' then
    if v_new->'id' is distinct from v_old->'id' or v_new->'tenant_id' is distinct from v_old->'tenant_id' then
      raise exception 'WIO-A10: id·tenant_id는 바꿀 수 없습니다' using errcode = '42501';
    end if;
    if (v_new->>'status') is distinct from (v_old->>'status') then
      if v_ctx->>'op' is distinct from 'transition' then
        raise exception 'WIO: % 상태는 transition 행위로만 바꿉니다', v_obj using errcode = '42501';
      end if;
      if not exists (select 1 from wio.state_transitions
                     where object_type = v_obj and from_status = v_old->>'status' and to_status = v_new->>'status') then
        raise exception 'WIO: 허용되지 않은 상태 전이 % → % (%)', v_old->>'status', v_new->>'status', v_obj
          using errcode = '23514';
      end if;
    end if;
  end if;

  if tg_op = 'DELETE' and v_obj = 'evidence'
     and (coalesce((v_old->>'legal_hold')::boolean, false) or (v_old->>'retention_until')::date >= current_date) then
    raise exception 'WIO-A9: 보존기간 중이거나 legal hold인 근거는 지울 수 없습니다' using errcode = '42501';
  end if;

  v_tenant := case when v_obj = 'tenant' then v_id
                   else coalesce((v_row->>'tenant_id')::uuid, nullif(v_ctx->>'tenant_id','')::uuid) end;

  insert into wio.event_log (
    tenant_id, occurred_at, actor_id, on_behalf_of, action, object_type, object_id,
    reason_ref, evidence_ids, money_delta, policy_decision_id, exception_kind,
    reverses_event_id, ai_meta, change)
  values (
    v_tenant,
    coalesce(nullif(v_ctx->>'occurred_at','')::timestamptz, now()),
    (v_ctx->>'actor_id')::uuid,
    nullif(v_ctx->>'on_behalf_of','')::uuid,
    coalesce(v_ctx->>'action_key', v_obj || '.' || lower(tg_op)),
    v_obj,
    v_id,
    nullif(v_ctx->>'reason_ref','')::uuid,
    coalesce(array(select jsonb_array_elements_text(v_ctx->'evidence_ids'))::uuid[], '{}'),
    case when v_obj = 'money' then jsonb_build_object(
           'kind', v_row->'kind', 'amount', v_row->'amount', 'currency', v_row->'currency',
           'debit', v_row->'debit_account', 'credit', v_row->'credit_account',
           'status_before', v_old->'status', 'status_after', v_new->'status') end,
    nullif(v_ctx->>'decision_id','')::uuid,
    nullif(v_ctx->>'exception_kind',''),
    nullif(v_ctx->>'reverses_event_id','')::uuid,
    v_ctx->'ai',
    jsonb_build_object('op', lower(tg_op), 'before', v_old, 'after', v_new));

  if tg_op = 'DELETE' then return old; end if;
  return new;
end $$;

-- event_log: 맥락 없는 INSERT 거부 + 테넌트별 seq·해시 체인
create or replace function wio.tg_event_chain()
returns trigger language plpgsql as $$
declare
  v_seq   bigint;
  v_prev  text;
  v_key   uuid := coalesce(new.tenant_id, '00000000-0000-0000-0000-000000000000'::uuid);
begin
  if nullif(current_setting('wio.ctx', true), '') is null then
    raise exception 'WIO-A2: event_log는 기록 트리거만 쓸 수 있습니다' using errcode = '42501';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('wio.event_log:' || v_key::text, 0));
  select seq, hash into v_seq, v_prev
    from wio.event_log
   where coalesce(tenant_id, '00000000-0000-0000-0000-000000000000'::uuid) = v_key
   order by seq desc limit 1;
  new.seq         := coalesce(v_seq, 0) + 1;
  new.prev_hash   := v_prev;
  new.recorded_at := clock_timestamp();
  new.hash := encode(extensions.digest(
    coalesce(v_prev, '') || '|' || jsonb_build_object(
      'id', new.id, 'tenant_id', new.tenant_id, 'seq', new.seq,
      'occurred_at', new.occurred_at, 'recorded_at', new.recorded_at,
      'actor_id', new.actor_id, 'on_behalf_of', new.on_behalf_of, 'action', new.action,
      'object_type', new.object_type, 'object_id', new.object_id, 'reason_ref', new.reason_ref,
      'evidence_ids', new.evidence_ids, 'money_delta', new.money_delta,
      'policy_decision_id', new.policy_decision_id, 'exception_kind', new.exception_kind,
      'reverses_event_id', new.reverses_event_id, 'ai_meta', new.ai_meta, 'change', new.change
    )::text, 'sha256'), 'hex');
  return new;
end $$;

-- event_log: 수정·삭제·비우기 거부 (A2)
create or replace function wio.tg_event_guard()
returns trigger language plpgsql as $$
begin
  raise exception 'WIO-A2: event_log는 추가만 가능합니다 (정정은 역이벤트)' using errcode = '42501';
end $$;

drop trigger if exists zz_event_chain on wio.event_log;
create trigger zz_event_chain before insert on wio.event_log
  for each row execute function wio.tg_event_chain();
drop trigger if exists event_no_update on wio.event_log;
create trigger event_no_update before update or delete on wio.event_log
  for each row execute function wio.tg_event_guard();
drop trigger if exists event_no_truncate on wio.event_log;
create trigger event_no_truncate before truncate on wio.event_log
  for each statement execute function wio.tg_event_guard();

-- 단위 테이블에 기록 트리거 부착 (이름 zz_ = 다른 BEFORE 트리거 다음에 실행)
do $$
declare r record;
begin
  for r in select * from (values
    ('tenants','tenant'), ('actors','actor'), ('memberships','membership'), ('parties','party'),
    ('agreements','agreement'), ('work_items','work'), ('money_entries','money'),
    ('policies','policy'), ('policy_decisions','policy_decision'), ('evidence','evidence')
  ) as t(tbl, obj) loop
    execute format('drop trigger if exists zz_record on wio.%I', r.tbl);
    execute format('create trigger zz_record before insert or update or delete on wio.%I
                    for each row execute function wio.tg_record(%L)', r.tbl, r.obj);
  end loop;
end $$;

-- =====================================================================================
-- 근거 체인 검사 (백서 5장) — 정책 판정 이전, 사람 승인으로도 못 건너뜀
--   반환: NULL = 통과, 텍스트 = 끊긴 고리 (deny 사유, 'blocked:' 접두)
-- =====================================================================================
create or replace function wio.check_chain(
  p_tenant uuid, p_actor uuid, p_object_type text, p_op text, p_to text,
  p_row jsonb, p_payload jsonb, p_evidence_ids uuid[])
returns text language plpgsql stable as $$
declare
  v_agr  wio.agreements;
  v_work wio.work_items;
begin
  -- 지출: 지급 = 발주(Agreement) + 검수 완료(Work verified) + 청구서(Evidence) + 금액 이내
  if p_object_type = 'money' and p_op = 'transition' and p_to = 'paid' then
    select * into v_agr from wio.agreements where id = (p_row->>'agreement_id')::uuid and tenant_id = p_tenant;
    if not found or v_agr.status not in ('approved','sent','active') then
      return 'blocked: 지급에 연결된 계약·발주가 없거나 유효하지 않습니다';
    end if;
    select * into v_work from wio.work_items where id = (p_row->>'work_id')::uuid and tenant_id = p_tenant;
    if not found or v_work.status not in ('verified','closed') then
      return 'blocked: 검수 완료된 업무가 연결되지 않았습니다';
    end if;
    if coalesce(cardinality(p_evidence_ids), 0) = 0 then
      return 'blocked: 청구서 등 근거가 없습니다';
    end if;
    if (p_row->>'amount')::bigint > v_agr.amount then
      return 'blocked: 지급액이 계약 금액을 넘습니다';   -- TODO 누적 지급액·허용 오차(회사 설정)
    end if;
  end if;

  -- 수입: 청구 발행 = 계약 + 납품 완료 + 계약 범위 이내
  if p_object_type = 'money' and p_op = 'transition' and p_to = 'issued' then
    select * into v_agr from wio.agreements where id = (p_row->>'agreement_id')::uuid and tenant_id = p_tenant;
    if not found or v_agr.status not in ('active','sent','approved') then
      return 'blocked: 청구에 연결된 계약이 없습니다';
    end if;
    if not exists (select 1 from wio.work_items where id = (p_row->>'work_id')::uuid and status in ('verified','closed')) then
      return 'blocked: 납품·마일스톤 완료 확인이 없습니다';
    end if;
    if (p_row->>'amount')::bigint > v_agr.amount then
      return 'blocked: 청구액이 계약 범위를 넘습니다';   -- TODO 누적 청구액
    end if;
  end if;

  -- handoff: 제출은 받은 쪽, 확인·반려는 요청한 쪽
  if p_object_type = 'work' and p_op = 'transition' then
    if p_to = 'submitted' and (p_row->>'owner_actor_id')::uuid is distinct from p_actor then
      return 'deny: 제출은 담당자(owner)만 합니다';
    end if;
    if p_to in ('verified','rejected') and (p_row->>'kind') = 'handoff'
       and (p_row->>'requester_actor_id')::uuid is distinct from p_actor then
      return 'deny: 확인·반려는 요청자만 합니다';
    end if;
  end if;

  return null;
end $$;

-- =====================================================================================
-- 정책 판정 (백서 7장) — auto / notify / approve / deny. 맞는 정책이 없으면 deny (A4)
--   B등급(법규 팩)과 C등급(회사 설정) 중 더 엄격한 쪽. C등급 안에서는 더 구체적인 패턴 우선
-- =====================================================================================
create or replace function wio.decide(
  p_tenant uuid, p_actor uuid, p_key text, p_amount bigint, p_rev text, p_at timestamptz,
  out policy_id uuid, out outcome text, out reason text, out approver uuid)
language plpgsql stable as $$
declare
  v_type    text;
  v_profile text;
  v_b       wio.policies;
  v_c       wio.policies;
  v_pick    wio.policies;
begin
  select type, delegation_profile into v_type, v_profile from wio.actors where id = p_actor;

  -- A6: AI는 자기·다른 AI의 권한을 올릴 수 없다
  if v_type = 'agent' and (p_key like 'policy.%' or p_key like 'membership.%' or p_key like 'actor.%') then
    outcome := 'deny'; reason := 'WIO-A6: 에이전트는 정책·권한·Actor를 바꿀 수 없습니다'; return;
  end if;

  -- 후보 조건 (유효일자 = 행위 발생 시점 기준, 과거 판정은 다시 계산하지 않음)
  select p.* into v_b from wio.policies p
   where p.status = 'active' and p.grade = 'B'
     and p_key like replace(p.action_pattern, '*', '%')
     and (p.actor_type is null or p.actor_type = v_type)
     and (p.actor_profile is null or p.actor_profile = v_profile)
     and (p.money_min is null or coalesce(p_amount, 0) >= p.money_min)
     and (p.money_max is null or coalesce(p_amount, 0) <  p.money_max)
     and (p.reversibility is null or p.reversibility = p_rev)
     and p.valid_from <= p_at and (p.valid_to is null or p.valid_to > p_at)
   order by case p.outcome when 'deny' then 0 when 'approve' then 1 when 'notify' then 2 else 3 end
   limit 1;

  select p.* into v_c from wio.policies p
   where p.status = 'active' and p.grade = 'C' and p.tenant_id = p_tenant
     and p_key like replace(p.action_pattern, '*', '%')
     and (p.actor_type is null or p.actor_type = v_type)
     and (p.actor_profile is null or p.actor_profile = v_profile)
     and (p.money_min is null or coalesce(p_amount, 0) >= p.money_min)
     and (p.money_max is null or coalesce(p_amount, 0) <  p.money_max)
     and (p.reversibility is null or p.reversibility = p_rev)
     and p.valid_from <= p_at and (p.valid_to is null or p.valid_to > p_at)
   order by length(replace(replace(p.action_pattern, '*', ''), '%', '')) desc,
            (p.actor_profile is not null) desc, (p.actor_type is not null) desc,
            case p.outcome when 'deny' then 0 when 'approve' then 1 when 'notify' then 2 else 3 end
   limit 1;

  if v_b.id is null and v_c.id is null then
    outcome := 'deny'; reason := 'WIO-A4: 적용할 정책이 없습니다 (fail closed)'; return;
  end if;

  v_pick := case
    when v_b.id is null then v_c
    when v_c.id is null then v_b
    when (case v_b.outcome when 'deny' then 0 when 'approve' then 1 when 'notify' then 2 else 3 end)
      <= (case v_c.outcome when 'deny' then 0 when 'approve' then 1 when 'notify' then 2 else 3 end) then v_b
    else v_c end;

  policy_id := v_pick.id;
  outcome   := v_pick.outcome;
  reason    := v_pick.rule_key;
  if outcome = 'approve' then
    approver := coalesce(v_pick.approver_actor_id,
                 (select m.actor_id from wio.memberships m
                   where m.tenant_id = p_tenant and m.role = 'owner' and m.status = 'active'
                   order by m.valid_from limit 1));
  end if;
end $$;

-- =====================================================================================
-- 반영 (내부 전용 — 판정 통과·승인 후에만 호출. 직접 EXECUTE 권한 없음)
-- =====================================================================================
create or replace function wio._apply(p_decision_id uuid)
returns uuid language plpgsql as $$
declare
  d        wio.policy_decisions;
  r        jsonb;
  v_op     text;
  v_obj    text;
  v_tbl    text;
  v_id     uuid;
  v_pl     jsonb;
  v_cols   text;
  v_status text;
begin
  select * into d from wio.policy_decisions where id = p_decision_id;
  r     := d.request;
  v_op  := r->>'op';
  v_obj := r->>'object_type';
  v_tbl := wio.table_of(v_obj);
  v_id  := nullif(r->>'object_id','')::uuid;

  perform wio._ctx_open(jsonb_build_object(
    'tenant_id', d.tenant_id, 'actor_id', d.actor_id, 'on_behalf_of', d.on_behalf_of,
    'action_key', d.action_key, 'op', v_op, 'decision_id', d.id,
    'occurred_at', coalesce(r->>'occurred_at', now()::text), 'reason_ref', r->>'reason_ref',
    'evidence_ids', coalesce(r->'evidence_ids', '[]'::jsonb), 'exception_kind', r->>'exception_kind',
    'ai', r->'ai'));

  if v_op = 'create' then
    v_id := gen_random_uuid();
    v_pl := (coalesce(r->'payload', '{}'::jsonb)
             - 'id' - 'tenant_id' - 'status' - 'created_by' - 'created_at' - 'updated_at' - 'reverses_id')
            || jsonb_build_object('id', v_id);
    if wio._has_col(v_tbl, 'tenant_id')  then v_pl := v_pl || jsonb_build_object('tenant_id', d.tenant_id); end if;
    if wio._has_col(v_tbl, 'created_by') then v_pl := v_pl || jsonb_build_object('created_by', d.actor_id); end if;
    if v_obj = 'work' and v_pl->>'kind' = 'handoff' then v_pl := v_pl || '{"status":"requested"}'; end if;
    v_cols := wio._cols(v_tbl, v_pl);
    execute format('insert into wio.%I (%s) select %s from jsonb_populate_record(null::wio.%I, $1)',
                   v_tbl, v_cols, v_cols, v_tbl) using v_pl;

  elsif v_op = 'update' then          -- D등급 필드만 (상태·식별·소유 컬럼 제외)
    v_pl := coalesce(r->'payload', '{}'::jsonb)
            - 'id' - 'tenant_id' - 'status' - 'created_by' - 'created_at' - 'updated_at'
            - 'hash' - 'reverses_id' - 'auth_user_id' - 'global_person_id' - 'type' - 'grade';
    v_cols := wio._cols(v_tbl, v_pl);
    if v_cols is null then raise exception 'WIO: 바꿀 수 있는 필드가 없습니다'; end if;
    v_pl := v_pl || jsonb_build_object('updated_at', now());
    v_cols := wio._cols(v_tbl, v_pl);
    execute format('update wio.%I t set (%s) = (select %s from jsonb_populate_record(null::wio.%I, to_jsonb(t) || $1)) where t.id = $2',
                   v_tbl, v_cols, v_cols, v_tbl) using v_pl, v_id;

  elsif v_op = 'transition' then
    execute format('update wio.%I set status = $1, updated_at = now() where id = $2', v_tbl)
      using r->'payload'->>'to', v_id;

  elsif v_op = 'delete' then          -- 초안·근거만. 원장 성격 행은 지우지 않고 cancelled/closed 전이
    execute format('select status from wio.%I where id = $1', v_tbl) into v_status using v_id;
    if v_obj <> 'evidence' and v_status is distinct from 'draft' then
      raise exception 'WIO: 초안이 아닌 %는 지울 수 없습니다 (취소 전이를 쓰세요)', v_obj;
    end if;
    execute format('delete from wio.%I where id = $1', v_tbl) using v_id;

  elsif v_op = 'reverse' then         -- Money 정정: 원 행은 그대로, 차대 바꾼 역분개 추가
    if v_obj <> 'money' then raise exception 'WIO: reverse는 money만'; end if;
    insert into wio.money_entries (tenant_id, kind, budget_line_id, agreement_id, work_id, party_id,
                                   amount, currency, debit_account, credit_account, reverses_id, status, created_by)
    select tenant_id, 'adjustment', budget_line_id, agreement_id, work_id, party_id,
           amount, currency, credit_account, debit_account, id, status, d.actor_id
      from wio.money_entries where id = v_id
    returning id into v_id;
  end if;

  -- 판정 기록 종결 (이것도 이벤트로 남는다)
  perform wio._ctx_open(jsonb_build_object(
    'tenant_id', d.tenant_id, 'actor_id', d.actor_id, 'action_key', 'policy_decision.transition:executed',
    'op', 'transition', 'decision_id', d.id));
  update wio.policy_decisions set status = 'executed', object_id = v_id, updated_at = now() where id = d.id;
  return v_id;
end $$;

-- =====================================================================================
-- 판단 (결재) — 대기열의 approve 건에 사람이 승인·반려. A3·A5·직무분리
-- =====================================================================================
create or replace function wio._judge(p_actor uuid, p_tenant uuid, p_decision_id uuid, p_verdict text, p_note text)
returns jsonb language plpgsql as $$
declare
  d       wio.policy_decisions;
  v_type  text;
  v_row   jsonb;
  v_obj   uuid;
begin
  select * into d from wio.policy_decisions where id = p_decision_id and tenant_id = p_tenant for update;
  if not found then raise exception 'WIO: 판정 기록이 없습니다'; end if;
  if d.status <> 'pending' then raise exception 'WIO: 이미 처리된 건입니다 (%)', d.status; end if;

  select type into v_type from wio.actors where id = p_actor;
  if v_type <> 'human' then
    raise exception 'WIO-A5: 승인은 사람만 합니다 (AI가 사람 명의로 승인 불가)' using errcode = '42501';
  end if;
  if p_actor = d.actor_id or p_actor = d.on_behalf_of then
    raise exception 'WIO-A3: 자기 요청은 승인할 수 없습니다' using errcode = '42501';
  end if;
  if exists (select 1 from wio.policies where id = d.policy_id and created_by = p_actor) then
    raise exception 'WIO-A3: 정책을 만든 사람은 그 정책으로 승인할 수 없습니다' using errcode = '42501';
  end if;
  if d.approver_actor_id is not null and d.approver_actor_id <> p_actor then
    raise exception 'WIO: 지정된 승인권자가 아닙니다';   -- TODO 대결(미리 지정된 대리인, 한도 이하) — 백서 11장 예외
  end if;
  if p_verdict = 'reject' and coalesce(p_note, '') = '' then
    raise exception 'WIO: 반려는 사유가 필요합니다';
  end if;

  -- 직무분리 (백서 9장) — 지급 승인 대상 money 행 기준
  if d.object_type = 'money' and d.object_id is not null then
    select to_jsonb(m) into v_row from wio.money_entries m where m.id = d.object_id;
    if exists (select 1 from wio.event_log e
                where e.object_type = 'party' and e.object_id = (v_row->>'party_id')::uuid
                  and e.actor_id = p_actor and e.change->>'op' = 'insert') then
      raise exception 'WIO-SoD: 거래처를 등록한 사람은 그 거래처 지급을 승인할 수 없습니다' using errcode = '42501';
    end if;
    if exists (select 1 from wio.event_log e
                where e.object_type = 'work' and e.object_id = (v_row->>'work_id')::uuid
                  and e.actor_id = p_actor and e.action = 'work.transition:verified') then
      raise exception 'WIO-SoD: 검수한 사람은 같은 건 지급을 승인할 수 없습니다' using errcode = '42501';
    end if;
  end if;

  perform wio._ctx_open(jsonb_build_object(
    'tenant_id', p_tenant, 'actor_id', p_actor, 'op', 'transition', 'decision_id', d.id,
    'action_key', 'policy_decision.' || p_verdict));
  update wio.policy_decisions
     set status = case p_verdict when 'approve' then 'executing' else 'rejected' end,
         decided_by = p_actor, decided_at = now(),
         reason = coalesce(nullif(p_note, ''), reason), updated_at = now()
   where id = d.id;

  if p_verdict = 'approve' then
    v_obj := wio._apply(d.id);
  end if;
  return jsonb_build_object('decision_id', d.id, 'verdict', p_verdict, 'object_id', coalesce(v_obj, d.object_id));
end $$;

-- =====================================================================================
-- 단일 행위 함수 — 모든 쓰기의 유일한 입구 (기본 설계 POST /actions)
--   화면·에이전트·외부 연동·관리자 모두 이것만 호출한다. 에이전트도 자기 auth 계정으로 (service_role 금지)
--
--   p_op: create | update | transition | delete | reverse   (결재는 object_type='policy_decision', op=approve|reject)
--   transition은 p_payload = {"to": "<상태>"}
--   반환: {decision_id, outcome, reason, status, object_id}
-- =====================================================================================
create or replace function wio.act(
  p_tenant_id       uuid,
  p_object_type     text,
  p_op              text,
  p_object_id       uuid        default null,
  p_payload         jsonb       default '{}'::jsonb,
  p_reason_ref      uuid        default null,
  p_evidence_ids    uuid[]      default '{}',
  p_on_behalf_of    uuid        default null,
  p_occurred_at     timestamptz default null,
  p_request_id      uuid        default null,
  p_exception_kind  text        default null,
  p_ai              jsonb       default null)
returns jsonb language plpgsql security definer set search_path = wio, extensions, pg_temp as $$
declare
  v_actor   uuid := wio.current_actor();
  v_tbl     text := wio.table_of(p_object_type);
  v_row     jsonb;
  v_to      text;
  v_key     text;
  v_amount  bigint;
  v_rev     text := 'internal';
  v_chain   text;
  v_pid     uuid;
  v_outcome text;
  v_reason  text;
  v_approver uuid;
  v_res     jsonb;
  v_status  text;
  v_dec     uuid;
  v_obj     uuid;
  v_prev    wio.policy_decisions;
  v_at      timestamptz := coalesce(p_occurred_at, now());
begin
  -- 1. 누가 (fail closed)
  if v_actor is null then
    raise exception 'WIO-A4: 행위자를 확인할 수 없습니다' using errcode = '42501';
  end if;
  if p_tenant_id is null or not exists (select 1 from wio.my_tenants() t where t = p_tenant_id) then
    raise exception 'WIO-A10: 이 회사의 구성원이 아닙니다' using errcode = '42501';
  end if;
  if p_occurred_at is not null and p_occurred_at < now() - interval '1 day' and p_exception_kind is null then
    raise exception 'WIO: 과거 시점 행위는 예외 유형(late_entry 등)을 밝혀야 합니다';
  end if;

  -- 2. 판단(결재)
  if p_object_type = 'policy_decision' then
    if p_op not in ('approve','reject') then raise exception 'WIO: 판정 기록은 approve·reject만'; end if;
    v_res := wio._judge(v_actor, p_tenant_id, p_object_id, p_op, p_payload->>'note');
    perform wio._ctx_close();
    return v_res;
  end if;

  if v_tbl is null or p_object_type = 'tenant' then
    raise exception 'WIO: 알 수 없는 대상 %', p_object_type;
  end if;
  if p_op not in ('create','update','transition','delete','reverse') then
    raise exception 'WIO: 알 수 없는 행위 %', p_op;
  end if;

  -- 3. 멱등 (같은 request_id 재전송)
  if p_request_id is not null then
    select * into v_prev from wio.policy_decisions where tenant_id = p_tenant_id and request_id = p_request_id;
    if found then
      return jsonb_build_object('decision_id', v_prev.id, 'outcome', v_prev.outcome, 'reason', v_prev.reason,
                                'status', v_prev.status, 'object_id', v_prev.object_id, 'replayed', true);
    end if;
  end if;

  -- 4. 대상 현재 상태 (테넌트 일치)
  if p_op <> 'create' then
    if p_object_type = 'actor' then
      select to_jsonb(a) into v_row from wio.actors a
       where a.id = p_object_id
         and exists (select 1 from wio.memberships m where m.actor_id = a.id and m.tenant_id = p_tenant_id);
    else
      execute format('select to_jsonb(t) from wio.%I t where t.id = $1 and t.tenant_id = $2', v_tbl)
        into v_row using p_object_id, p_tenant_id;
    end if;
    if v_row is null then raise exception 'WIO: 대상이 없거나 이 회사 것이 아닙니다'; end if;
  end if;

  -- 5. 행위 키 · 금액 · 되돌림 가능성
  if p_op = 'transition' then
    v_to := p_payload->>'to';
    select st.reversibility into v_rev from wio.state_transitions st
     where st.object_type = p_object_type and st.from_status = v_row->>'status' and st.to_status = v_to;
  end if;
  v_key    := p_object_type || '.' || p_op || coalesce(':' || v_to, '');
  v_amount := coalesce(nullif(p_payload->>'amount','')::bigint, nullif(v_row->>'amount','')::bigint);

  -- 6. 근거 체인 → 정책 판정
  if p_op = 'transition' and v_rev is null then
    v_outcome := 'deny'; v_reason := format('허용되지 않은 전이 %s → %s', v_row->>'status', v_to);
  else
    v_chain := wio.check_chain(p_tenant_id, v_actor, p_object_type, p_op, v_to, v_row, p_payload, p_evidence_ids);
    if v_chain is not null then
      v_outcome := 'deny'; v_reason := v_chain;
    else
      select x.policy_id, x.outcome, x.reason, x.approver into v_pid, v_outcome, v_reason, v_approver
        from wio.decide(p_tenant_id, v_actor, v_key, v_amount, v_rev, v_at) x;
    end if;
  end if;

  v_status := case v_outcome when 'approve' then 'pending' when 'deny' then 'denied' else 'executing' end;
  -- TODO 후결(post_approval): 정해진 유형·금액 이하면 실행 후 pending — 백서 11장 예외

  -- 7. 판정 기록 (deny도 사유와 함께 남긴다)
  perform wio._ctx_open(jsonb_build_object(
    'tenant_id', p_tenant_id, 'actor_id', v_actor, 'on_behalf_of', p_on_behalf_of,
    'action_key', 'decide:' || v_key, 'op', 'create', 'occurred_at', v_at, 'ai', p_ai));
  insert into wio.policy_decisions (tenant_id, request_id, actor_id, on_behalf_of, action_key, object_type, object_id,
                                    request, amount, reversibility, policy_id, outcome, reason, approver_actor_id, status)
  values (p_tenant_id, p_request_id, v_actor, p_on_behalf_of, v_key, p_object_type, p_object_id,
          jsonb_build_object('op', p_op, 'object_type', p_object_type, 'object_id', p_object_id,
                             'payload', p_payload, 'reason_ref', p_reason_ref,
                             'evidence_ids', to_jsonb(coalesce(p_evidence_ids, '{}')),
                             'occurred_at', v_at, 'exception_kind', p_exception_kind, 'ai', p_ai),
          v_amount, v_rev, v_pid, v_outcome, v_reason, v_approver, v_status)
  returning id into v_dec;

  -- 8. 반영 (auto·notify만 즉시. notify 보고·취소 창은 TODO — 알림 큐)
  if v_outcome in ('auto','notify') then
    v_obj := wio._apply(v_dec);
  end if;

  perform wio._ctx_close();
  return jsonb_build_object('decision_id', v_dec, 'outcome', v_outcome, 'reason', v_reason,
                            'status', case when v_obj is not null then 'executed' else v_status end,
                            'object_id', coalesce(v_obj, p_object_id));
end $$;

-- =====================================================================================
-- 부트스트랩 — 테넌트 개설 (service_role 전용 · 이것도 event_log에 남는다). 시스템 Actor 시드는 파일 맨 끝
-- =====================================================================================
create or replace function wio.bootstrap_tenant(p_name text, p_owner_auth_user uuid, p_owner_person_id uuid)
returns uuid language plpgsql security definer set search_path = wio, extensions, pg_temp as $$
declare
  c_sys    constant uuid := '00000000-0000-0000-0000-0000000000a1';
  v_tenant uuid := gen_random_uuid();
  v_owner  uuid;
begin
  perform wio._ctx_open(jsonb_build_object('tenant_id', v_tenant, 'actor_id', c_sys,
                                           'action_key', 'tenant.bootstrap', 'op', 'create'));
  insert into wio.tenants (id, name) values (v_tenant, p_name);

  select id into v_owner from wio.actors where auth_user_id = p_owner_auth_user;
  if v_owner is null then
    insert into wio.actors (type, global_person_id, auth_user_id, delegation_profile)
    values ('human', p_owner_person_id, p_owner_auth_user, 'owner') returning id into v_owner;
  end if;
  insert into wio.memberships (tenant_id, actor_id, role, created_by) values (v_tenant, v_owner, 'owner', c_sys);

  -- 기본 C등급 정책 (시스템이 만든다 → owner가 이 정책으로 승인해도 A3 위반 아님)
  -- 그 외 전부(권한·정책·지급·외부 발송 등)는 '*' = owner 승인. 정책이 없으면 deny(A4)
  insert into wio.policies (tenant_id, grade, rule_key, action_pattern, actor_profile, reversibility, outcome, approver_actor_id, status, created_by) values
    (v_tenant, 'C', '기본: 모든 행위는 owner 승인',      '*',                  null,    null,       'approve', v_owner, 'active', c_sys),
    (v_tenant, 'C', '업무 생성·수정·전이는 자동',        'work.*',             null,    'internal', 'auto',    null,    'active', c_sys),
    (v_tenant, 'C', '근거 등록은 자동',                  'evidence.create',    null,    null,       'auto',    null,    'active', c_sys),
    (v_tenant, 'C', '거래처·계약·돈 초안은 자동',        'party.create',       null,    null,       'auto',    null,    'active', c_sys),
    (v_tenant, 'C', '거래처·계약·돈 초안은 자동',        'agreement.create',   null,    null,       'auto',    null,    'active', c_sys),
    (v_tenant, 'C', '거래처·계약·돈 초안은 자동',        'money.create',       null,    null,       'auto',    null,    'active', c_sys),
    -- 1인 회사(Intra 진단 8장): owner 본인의 내부·되돌릴 수 있는 행위는 실행 후 보고
    (v_tenant, 'C', 'owner 내부 행위는 notify',          '*',                  'owner', 'internal', 'notify',  null,    'active', c_sys);

  perform wio._ctx_close();
  return v_tenant;
end $$;

-- =====================================================================================
-- RLS — 조회만 (같은 테넌트). 쓰기 정책은 두지 않는다: 쓰기는 wio.act()(SECURITY DEFINER)만
-- =====================================================================================
alter table wio.tenants           enable row level security;
alter table wio.actors            enable row level security;
alter table wio.memberships       enable row level security;
alter table wio.parties           enable row level security;
alter table wio.agreements        enable row level security;
alter table wio.work_items        enable row level security;
alter table wio.money_entries     enable row level security;
alter table wio.policies          enable row level security;
alter table wio.policy_decisions  enable row level security;
alter table wio.evidence          enable row level security;
alter table wio.state_transitions enable row level security;
alter table wio.event_log         enable row level security;

drop policy if exists tenants_read on wio.tenants;
create policy tenants_read on wio.tenants for select to authenticated
  using (id in (select wio.my_tenants()));

drop policy if exists actors_read on wio.actors;
create policy actors_read on wio.actors for select to authenticated
  using (auth_user_id = auth.uid()
         or exists (select 1 from wio.memberships m where m.actor_id = actors.id and m.tenant_id in (select wio.my_tenants())));

do $$
declare t text;
begin
  foreach t in array array['memberships','parties','agreements','work_items','money_entries',
                           'policy_decisions','evidence','event_log'] loop
    execute format('drop policy if exists %I on wio.%I', t || '_read', t);
    execute format('create policy %I on wio.%I for select to authenticated using (tenant_id in (select wio.my_tenants()))',
                   t || '_read', t);
  end loop;
end $$;
-- TODO event_log·money_entries의 개인 단위 열람 범위 (본인·팀 기본, 관리자 공개는 설정 + 기록 — 백서 10장)

drop policy if exists policies_read on wio.policies;
create policy policies_read on wio.policies for select to authenticated
  using (tenant_id is null or tenant_id in (select wio.my_tenants()));

drop policy if exists state_transitions_read on wio.state_transitions;
create policy state_transitions_read on wio.state_transitions for select to authenticated using (true);

-- =====================================================================================
-- GRANT — 조회는 SELECT, 쓰기는 wio.act 한 개 (A1). anon은 아무것도 없음
-- =====================================================================================
revoke all on all tables    in schema wio from public, anon, authenticated;
revoke all on all functions in schema wio from public, anon, authenticated;
grant usage on schema wio to authenticated, service_role;
grant select on all tables in schema wio to authenticated;
grant select on all tables in schema wio to service_role;   -- service_role도 쓰기는 트리거가 막는다
grant execute on function wio.act(uuid, text, text, uuid, jsonb, uuid, uuid[], uuid, timestamptz, uuid, text, jsonb) to authenticated;
grant execute on function wio.my_tenants()    to authenticated;
grant execute on function wio.current_actor() to authenticated;
grant execute on function wio.bootstrap_tenant(text, uuid, uuid) to service_role;
revoke update, delete, truncate on wio.event_log from service_role;

-- search_path 고정 (Supabase 보안 어드바이저 0011 — 함수 안 이름이 다른 스키마 객체로 바뀌치기 되는 것 방지)
do $$
declare f regprocedure;
begin
  for f in select p.oid::regprocedure from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'wio' and p.proconfig is null loop
    execute format('alter function %s set search_path = wio, extensions, pg_temp', f);
  end loop;
end $$;

-- =====================================================================================
-- 시스템 Actor 시드 — 맨 끝에 둔다 (event_log 지연 FK가 걸린 뒤 같은 트랜잭션에서 ALTER TABLE 하면 55006 오류)
-- =====================================================================================
do $$
begin
  if not exists (select 1 from wio.actors where id = '00000000-0000-0000-0000-0000000000a1') then
    perform wio._ctx_open(jsonb_build_object('actor_id', '00000000-0000-0000-0000-0000000000a1',
                                             'action_key', 'actor.bootstrap', 'op', 'create'));
    insert into wio.actors (id, type, label) values ('00000000-0000-0000-0000-0000000000a1', 'system', 'WIO system');
    perform wio._ctx_close();
  end if;
end $$;
