# 인트라 결재·상태 전이 코드 위치 (Intra 진단 7번)

> 조사일 2026-10-15 · 기준 커밋 2dadd2a5 · WIO 백서 기본 단위 이관 준비용 (읽기 전용 조사, 코드·DB 변경 없음)
> 라인 번호 `~`는 근사치. SQL은 repo 기준이며 실제 DB 적용 여부는 검증하지 않음.

## 요약

- **결재 체계가 둘 공존**: (a) `wio_approvals` 단순 결재(pending→approved/rejected) (b) `approval_requests` + `wio_workflow_*` 다단계 엔진. 레거시 `approvals`는 SQL에만 언급.
- **공용 상태 전이 헬퍼 없음** — 도메인마다 각자 `.update({ status })`.
- **전이 이력을 남기는 곳은 세 곳뿐**: `wio_workflow_instances.step_history`(JSON) · `contact_submissions.handling_log`(JSON) · `badak_level_history`(레벨만). `audit_log`·`sys_audit_logs`·`history_events`·`wio_events` 등 테이블은 있으나 결재·심사 경로에서 쓰지 않음.
- **현재 상태 가드 없는 전이 다수** (accepted→rejected, rejected→approved 등 역전 가능).

## 반영 현황 (2026-10-15, 백서 1단계 "기록 켜기 + 결재 구멍 막기")

| 항목 | 조치 |
|---|---|
| 변경 기록 없음 | `sql/intra-record-and-approval-guard.sql` — `audit_log`를 추가 전용 원장으로, `record_change()` 트리거를 결재·재무·급여·인사·권한 15개 테이블에 |
| `app/api/approvals` 무가드 PATCH·POST | **삭제** (호출처 없음, 컬럼도 안 맞아 동작하지 않던 경로) |
| 인트라 ERP 결재·경비가 WIO 제품 테이블(`wio_approvals`·`wio_expenses`)을 가리킴 → 저장 불가 | `lib/supabase/erp.ts`를 인트라 테이블 `approvals`·`expenses`로 |
| 자기 결재 · 끝난 결재 되돌리기 | DB 트리거 `guard_approval_decision` (approvals·wio_approvals·approval_requests). super_admin 본인 결재만 예외로 허용하고 기록에 `self_approval` |
| 결재 승인 후 경비 상태를 앱이 따로 update (비원자·에러 무시) | DB 트리거 `sync_expense_from_approval` — 같은 트랜잭션 |
| 결재 화면이 실패를 숨기고 목록에서 먼저 지움 | `app/intra/erp/approval/page.tsx` — 저장 성공 후 제거, 거부 사유 표시 |

### 2단계-1 (2026-10-15) 브랜드 심사 경로 — `sql/intra-review-guard.sql` (마이그레이션 intra_review_guard)

| 항목 | 조치 |
|---|---|
| 끝난 심사(승인·반려·선발·거절)를 다시 바꿀 수 있음 | DB 트리거 `guard_review_status` — 바닥장·MADLeague·프로그램·Jakka 판매자 신청 (service_role도 막힘) |
| Jakka 신청자가 자기 신청을 `approved`로 바꿀 수 있음 (UPDATE 정책 WITH CHECK 없음) · 바닥장 신청을 `approved`로 바로 INSERT 가능 | `protect_review_columns` 트리거 — 직원 아니면 상태·심사 컬럼 고정 |
| 바닥장 승인 경로 2개가 서로 다름 (API는 없는 컬럼·`role='leader'`로 항상 실패, 인트라는 브라우저 직접 2단계) | 인트라 화면 → `PATCH /api/badak/apply` 하나로. 역할 부여(`badakjang`·C)는 DB 트리거 `badak_promote_on_leader_approval` |
| Jakka 심사자 = 요청 본문 `reviewerId` | 세션의 직원 ID (`requireStaff`), GET도 직원 확인 |
| 승인 API가 대기 여부 확인 후 조건 없이 update (동시 클릭 시 이중 처리) | Badak·Jakka·MADLeague(승인·반려·인트라)·프로그램 신청 모두 `.eq('status','pending')` 조건부 update → 0행이면 409 |
| YouInOne 심사 화면이 브라우저에서 `member_capability_roles`를 직접 읽고 씀 (RLS로 동작 안 함) | `/api/intra/youinone/applications` (직원 전용) |
| 회원 역할 이력 UPDATE 금지(§1.3.1)가 규칙뿐 | DB 트리거 `guard_capability_role_update` — 진행 중 역할의 종료(`valid_until` 설정)만 허용 |
| 심사·역할 변경 기록 없음 | `zz_record_change`를 5개 테이블에 추가, 계좌·연락처·이메일 원문은 기록에서 `***` |

남은 것: HeRo·MyVerse 결제 경로, `lib/workflow-engine.ts`, 퇴사 처리 원자화, 상태 전이 DB 함수화(백서 14장).

## 0. Intra 진단(`docs/Intra 진단 WIO 기본 설계 기준 대비.md`)과 대조

진단은 DB만 봤고 "앱 소스로 결재·상태 전이 위치를 맞춰 보라"(9장 끝)고 남겼다. 앱 코드로 확인한 결과:

| 진단 내용 | 앱 코드 확인 |
|---|---|
| 상태 전이 DB 함수 없음, 앱이 status를 직접 바꿈 (3장) | **맞음** — 공용 헬퍼도 없고, 서버 API·인트라 화면(브라우저 직접)·lib 클라이언트 함수가 각자 `.update({status})` |
| 결재 세 방식: approved_by 컬럼 / `approvals` reference_id / workflow 엔진 (3장) | 앱이 실제로 쓰는 것은 **`wio_approvals`**(단순 승인·반려) + **`approval_requests` + `wio_workflow_instances`**(`lib/workflow-engine.ts`). `approvals` 테이블은 앱 코드에서 안 씀. 엔진과 결재 요청은 앱이 따로 update해 동기화(비원자) |
| 워크플로 인스턴스가 대상과 연결 안 됨 (3장) | 맞음 — 엔진 단계 담당자(assigneeRule)도 검사하지 않음 |
| 기록 테이블은 있으나 기록 경로 없음 (7장) | **맞음** — `member_role_history`·`audit_log` 등을 결재·심사 경로에서 쓰지 않음. 이력은 JSON 컬럼 2곳(`step_history`, `handling_log`)뿐 |
| 에이전트는 service_role로 권한 검사 밖 (6장) | 앱에서도 관리 API가 `createAdminClient()` 후 상태를 바꾸는 패턴이 다수 (Jakka 판매자 승인은 reviewerId까지 body 값) |

→ WIO 쪽 초안: `sql/wio-core-v0.sql` (단위 8 + event_log + 기록 트리거 + `wio.act()` 단일 쓰기 경로). 이 목록의 각 경로가 옮겨 갈 때 `wio.act(…, 'transition', …)` 한 줄로 바뀐다.

## 1. 결재 핵심

| 위치 | 테이블 | 전이 | 이력 | 권한 |
|---|---|---|---|---|
| `app/api/approvals/[id]/route.ts:6-17` PATCH | wio_approvals | body 전체 update (임의 status) | 없음 | **없음** (RLS 테넌트 멤버 FOR ALL만) |
| `app/api/approvals/route.ts:18-38` POST | wio_approvals | insert (status 포함 body spread), doc_no = count+1 | 없음 | requireAuth만 |
| `lib/supabase/wio.ts:412-415` updateApprovalStatus | wio_approvals | →approved/rejected | 없음 | 클라이언트 RLS |
| `lib/supabase/erp.ts:47-58` updateApprovalStatus | wio_approvals | →임의 | 없음 | 클라이언트 RLS |
| `lib/supabase/erp.ts:163-170` updateExpenseByApproval | wio_expenses | 결재 결과 미러링 (비원자) | 없음 | 클라이언트 RLS |
| `app/intra/erp/approval/page.tsx:42-54` | wio_approvals → wio_expenses | pending→approved/rejected | 없음 | 결재자 검증 없음 |
| `app/(WIO)/wio/app/my/approval/page.tsx:205-222` | wio_approvals | approved/rejected (에러 무시) | 없음 | 쓰기 시 결재자 검증 없음 |
| `app/(WIO)/wio/app/approval/page.tsx:255-273` | approval_requests + instances | 생성 pending/running | step_history | 없음 |
| 같은 파일 `:441-505` handleAction | approval_requests + instances | advanceStep 후 approval_requests 별도 update (비원자) | step_history | 현재 스텝 담당자 미검증, actorId 클라이언트 값 |
| `lib/workflow-engine.ts:225-267` startWorkflow | wio_workflow_instances | insert running | - | 없음 |
| `lib/workflow-engine.ts:277-377` advanceStep | instances | running→rejected/completed, step++ | **step_history append** | 없음 · condition/parallel 미평가 |
| `lib/workflow-engine.ts:472-491` markSLATimeout | instances | running→timeout | completed_at만 | 없음 (호출처 미확인) |
| `lib/workflow-engine.ts:498-538` cancelWorkflow | instances | running→cancelled | step_history | approval_requests 미갱신 |
| `lib/workflow-engine.ts:171-212` upsertWorkflowDefinition | definitions.is_active | 토글 | 없음 | 없음 |

- RLS: `supabase/wio-sprint2.sql:147` wio_approvals 테넌트 FOR ALL · `supabase/orbi-modules-remaining.sql:493` workflow_instances `USING (true)` (적용 시 전원 쓰기)
- `sql/security-protect-review-columns.sql:9-10` — wio_approvals 자기 결재 방지·필드 화이트리스트를 "후속 과제"로 남김 = 현재 미보호
- 기안 생성: `app/intra/erp/approval/draft/{page,report,expenditure}` → `lib/supabase/erp.ts:37-45` createApproval · `app/intra/myverse/expenses/page.tsx:92-101`
- 값 불일치: `app/intra/erp/finance/expenses/page.tsx:59,70,94,103` — 'pending'으로 쓰고 '대기'로 필터
- 결재선 템플릿: `sql/approval_templates.sql` · `app/intra/erp/settings/approval-line/page.tsx:65-87`

## 2. 인사·재무

| 위치 | 테이블 | 전이 | 이력 | 권한 |
|---|---|---|---|---|
| `sql/staff-duty-roles.sql` ~140-165 트리거 | tenone_staff_profiles | invited→onboarding→active→offboarded | 없음 | 본인 변경 차단(hr duty만) |
| `app/api/intra/staff/onboard/route.ts:10-18` | staff profile | onboarding→active | - | requireMember + 서약 |
| `app/api/intra/staff/offboard/route.ts:9-21` | staff profile·member_roles | →offboarded | - | requireStaff + 인사/마스터 |
| `app/api/intra/duties/route.ts:42-63` | member_roles.is_active | grant/revoke | member_role_history 기록 여부 미확인 | requireStaff(+super_admin) |
| `lib/supabase/erp.ts:470-478` updatePaymentStatus | payments | →paid | 없음 | RLS staff |
| `app/intra/erp/finance/billing/page.tsx:222` | invoices | →paid | 없음 | RLS staff |
| `app/api/intra/jakka/settlements/route.ts:180-220` | jakka_settlements | draft/confirmed/paid 임의(역전 허용) | 타임스탬프만 | middleware staff |
| `app/api/myverse/payment/success/route.ts:23-79` | myverse_payments | pending→paid/failed → 구독 활성 | meta | 이미 paid 재호출 가드 없음 |
| `app/api/myverse/billing/webhook/route.ts` ~97-120 | myverse_subscriptions | Stripe status upsert/canceled | stripe_events.processed | 서명 검증 미확인 |

휴가 결재 워크플로우는 없음(폼 라벨만).

## 3. 브랜드 신청·심사

| 위치 | 테이블 | 전이 | 가드·이력 |
|---|---|---|---|
| `app/api/madleague/admin/applications/route.ts` ~36-59 | mad_applications | accept=`lib/madleague-roles.ts:249`(pending\|reviewing 가드) · reject/reviewing 직접 update | reject 상태 가드 없음, reviewer_note 덮어쓰기 |
| `app/api/madleague/applications/[id]/approve` · `/reject` | mad_applications | accepted / rejected | reject는 pending 가드, note 없음 |
| `sql/madleague-members-core-link.sql:20-50` 트리거 | →mad_members | accepted 시 생성 (구버전 `madleague_phase2_members.sql:76-108` 중복) | |
| `app/api/badak/apply/route.ts:90-157` PATCH | badak leader 신청 | approved/rejected → role='leader' | 상태 가드 없음 |
| `app/api/badak/groups/review/route.ts` | badak groups·needs | pending_review→recruiting/rejected, →completed | badak_level_history만 |
| `app/api/badak/needs/review/route.ts:31-52` | badak_needs | pending_review→gathering/rejected | 가드·이력 없음 |
| `app/api/badak/groups/[id]/members/route.ts:55-75` | 모임 멤버 | applied→action | 가드 있음 |
| `app/api/intra/jakka/sellers/route.ts` ~95-140 | jakka_seller_applications·creators | pending→approved/rejected | **reviewerId를 body에서 받음** |
| `app/api/intra/jakka/showcases/route.ts` ~55-85 | jakka_showcases | approve/reject/end | 가드 없음 |
| `sql/jakka-showcases-table.sql:102-137` 트리거 | jakka_showcases | 승인 3→approved, 거절 1→rejected | |
| `lib/supabase/jakka.ts:1766-1779` · `sql/jakka-orders.sql:43-53` | jakka_orders | 임의 OrderStatus · status_changed_at | 이력 없음 |
| `app/api/intra/hero/offers/[id]/route.ts:26-63` | hero_offers | requested→rejected/sent | 사전 조회 가드(비원자) |
| `app/api/hero/offers/[id]/route.ts` ~70-95 | hero_offers·recipients | requested→canceled, sent→closed, →expired | |
| `app/api/hero/offers/inbox/[id]/route.ts` | recipients | sent→viewed/declined/accepted, accepted→declined | 기한·중복 가드 |
| `app/api/hero/matching/[id]/curate/route.ts:97-103` | 매칭 | proposed→curated | staff 정책 |
| `app/api/intra/mindle/queue/[id]/route.ts:66-95` | mindle_trends | collected→* | collected 가드(409) |
| `app/api/crawler/route.ts` | collected_data | raw→processed/error/rejected | |
| `lib/brand-join.ts:34-44` | member_brand_joins | active / withdrawn_at | `trg_approve_membership_fn` 정의가 repo에 없음 |
| `sql/ums-task2-members.sql:50-90` 트리거 | members·subscriptions | active 승격·만료 강등 | |
| `sql/smarcomm-campaign-assetize-trigger.sql:13` | smarcomm 캠페인 | Completed 시 자산화 | |
| `app/api/intra/forms/[id]/route.ts:102-111` | forms | draft→open | |
| `app/api/forms/[brand]/[slug]/route.ts:96-154` | 응답 | →cancelled (본인) | |
| `app/api/intra/programs/rounds/[id]/route.ts:180-200` | program_applications | accepted/declined | 상태 가드 없음, decided_by |
| `app/api/intra/myverse/reports/[id]/route.ts:14-45` | 제보 | open→reviewing/resolved/dismissed | |
| `app/api/intra/planners/feedback/route.ts:53-61` | 피드백 | →임의 | |

## 4. CS·개인정보

- `app/api/intra/contact-submissions/[id]/route.ts:37-62` — **handling_log에 {at, by, channel, status, note} append** (유일한 CS 이력) · resolved는 note 필수
- `app/api/badak/inquiries/route.ts:85` — 같은 테이블, 이력 없음
- `app/api/account/delete/route.ts` · `app/api/auth/cancel-signup/route.ts` — 상태 전이가 아닌 익명화·삭제

## 5. 우선 점검 (event_log·단일 행위 함수로 옮길 때 먼저)

1. `app/api/approvals/[id]` PATCH — 무가드 임의 update (자기 결재 가능)
2. 클라이언트 직접 결재 update (`intra/erp/approval`, `wio/app/my/approval`)
3. `lib/workflow-engine.ts` advanceStep — 담당자 미검증·비원자
4. MADLeague admin reject · Badak apply · programs rounds — 현재 상태 가드 없음
5. Jakka `reviewerId` body 신뢰
6. MyVerse 결제 콜백 재호출 가드
7. HeRo 제안 승인 비원자
8. 경비 status 값 불일치

## 6. 보강 조사 (2차)

### 클라이언트 직접 상태 쓰기 (서버 검증 없음, RLS만)

| 위치 | 테이블 | 전이 | 비고 |
|---|---|---|---|
| `app/intra/ums/badak/members/page.tsx:135-158` | badak_leader_applications · badak_members | →approved/rejected, 승인 시 role='badakjang'·leader_level='C' | 비원자, 에러 미확인. `app/api/badak/apply` PATCH와 **승인 경로 중복** |
| `app/intra/ums/youinone/applications/page.tsx:25-39` | member_capability_roles | applicant valid_until=now + approved_member insert | 현재 상태 조건 없음, 비원자 |
| `app/intra/ums/commerce/shop/page.tsx:92-100` | shop_orders · shop_products | status 임의 | 가드·이력 없음 |
| `app/intra/ums/commerce/promotions/page.tsx:81-84` | promotions | status 임의 | 가드·이력 없음 |
| `lib/supabase/erp.ts:431-440` updateInvoiceStatus | invoices | 임의, paid면 paid_at | 호출 `app/intra/erp/finance/billing/page.tsx:222` |
| `lib/supabase/montz.ts:538-554` updateContactStatus | montz_contact_requests | seen/accepted/declined 임의 | creator 본인 범위만 |
| `lib/supabase/montz.ts:380-385` setHeroCreator | montz_creators.is_hero | false→true 두 번 update | 비원자 |
| `components/ProfileComments.tsx:90` | profile_comments.is_hidden | →true | 모더레이션 플래그 |
| `features/montz/VerificationModal.tsx:42-51` | montz_verification_requests | insert pending | 이후 전이 경로 없음 |

### 서버 경로

- `app/api/badak/groups/[id]/members/route.ts:13-123` — requireMember 아님(Bearer 직접 파싱 + 모임장 확인), applied→approved/rejected **가드 있음(409)**, 정원 확인 비원자, rpc 결과 미확인, 이력 없음
- `lib/staff-lifecycle.ts:101-110` completeOnboarding — invited|onboarding→active **가드 있음**, 이력 없음
- `lib/staff-lifecycle.ts:113-130` offboardStaff — 상태 가드 없음, member_roles 일괄 비활성·status offboarded·account_type 여러 update 비트랜잭션, **이력 없음**
- `lib/staff-lifecycle.ts:66-72` 초대 upsert — 이미 active인 직원을 invited로 되돌릴 수 있음
- `app/api/intra/duties/route.ts:41-67` — **member_role_history 기록 안 함** (테이블은 `supabase/identity-architecture.sql:30-46`에만)
- `app/api/madleague/applications/president/route.ts` — GET 전용, 전이 없음
- HeRo 기업 승인(hero_companies pending→active) — **경로 없음** (`app/intra/hero/companies/page.tsx:118` 헤더에만 '담당자 승인')
- MoNTZ 오디션 지원 — pending 이후 전이 경로 없음
- `app/api/myverse/billing/webhook/route.ts:28-62` — Stripe 서명 검증 있음, **타임스탬프 허용 범위 검사 없음(재전송 가능)**, 멱등 처리 비원자
- `app/api/crawler/route.ts:91-94` requireStaff · `app/api/cron/smarcomm-airm-verify/route.ts:36-39` 내부 키만 (`lib/api-guard.ts:58-59` 비교가 `includes()` — 상수 시간 아님)

### API 호출만 확인 (서버 핸들러 미추적)

`components/madleague/ClubRecruitResponses.tsx:51-55` → `/api/madleague/clubs/[slug]/recruit` · `components/intra/forms/FormEditor.tsx:66-69,275-278` → `/api/intra/forms/[id]`(·`/responses`) · `features/myverse/planner/ProjectRetroModal.tsx:57-63` → `/api/myverse/projects/[id]` · `features/hero/GoalsTab.tsx:136` · ums의 badak/groups·needs-queue·madleap/applications·uc/transactions·standard/taxonomies PATCH
