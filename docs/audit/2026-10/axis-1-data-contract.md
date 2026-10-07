# 축 1 — 데이터 계약 위반 점검 (2026-10-08, Fable)

> 범위: 루트 CLAUDE.md §0.1 데이터 계약 5조 기준. 코드(`app/`·`lib/`·`components/`·`features/`) grep + 운영 DB(`ziotlxkdctlhiwkgmmsh`) 스키마·RLS·GRANT·함수 조회(SELECT만). 회원 개인정보 값은 조회·기재하지 않음(개수·컬럼만).
> 집중 브랜드(TenOne·인트라·MADLeague·MADLeap·Badak·HeRo·RooK)와 코어를 상세, 실험·보관 브랜드는 요약.

## 요약

- 코어(`lib/api-guard.ts`·`member_roles`·`protect_member_privileged_columns` 트리거·프로그램 모듈·HeRo `member_id` FK)는 계약을 잘 지키고 있다. 위반은 **"코어를 우회하는 옛 경로"**에 몰려 있다: ① DB RLS의 직원 판단 함수 `is_tenone_staff()`가 `members.account_type`을 보는 제2의 권한 SSOT(정책 65개), ② Badak 전용 API가 `badak_members.role`로 관리자 판단 + 그 컬럼을 본인이 UPDATE 가능, ③ `hero_talent_applications` RLS가 `member_id = auth.uid()`(키 혼용)이고 비회원 지원서 행(이름·이메일·전화)이 anon에게 열림, ④ 브랜드 가입 사실의 SSOT가 `members.affiliations`와 `member_brand_joins`로 이원화(인트라 7곳·Badak API가 affiliations 기준, 현재 DB의 affiliations 값에 `brand`·`module`·`system` 같은 쓰레기 값 존재).
- 현재 운영 DB 실회원이 5명(전원 직원 계정 포함)이라 실제 피해는 없으나, Badak·MADLeap 신규 가입 오픈 전에 C·H는 반드시 정리해야 한다.
- **심각도별 개수**: Critical 3 · High 6 · Medium 11 · Low 6 (총 26)

## 발견 사항

### [C-1] `hero_talent_applications` RLS가 `member_id = auth.uid()` — 키 혼용 + 비회원 지원서 PII가 anon에 공개
- 계약 조항: 1조(바뀌지 않는 ID) · 4조
- 근거: DB `pg_policies.hero_talent_app_owner_read` = `(member_id = auth.uid()) OR (member_id IS NULL)` · FK `hero_talent_applications.member_id → members.id`(auth uid 아님) · `column_privileges`: anon·authenticated에 `email,name,phone` 포함 SELECT·INSERT·UPDATE GRANT · RLS enabled. 코드 `app/api/hero/talent-agent/apply/route.ts:19-23` (name·email·phone 저장, member_id는 세션에서 결정 — 코드는 정상).
- 영향: (a) 본인 조건이 members.id ≠ auth uid라 회원 지원자는 자기 지원서를 못 본다. (b) `member_id IS NULL`(비회원 지원) 행은 **anon 포함 누구나** 이름·이메일·전화를 SELECT 가능 — 개인정보 유출(개인정보보호법 제29조 안전조치). 현재 0건이라 피해 없음.
- 해결안: 정책을 `member_id = hero_current_member_id()`로 교체하고 `member_id IS NULL` 분기 삭제(비회원 지원서는 직원·service_role만). anon·authenticated의 SELECT/UPDATE GRANT REVOKE(서버 API만 쓰므로). `sql/`에 마이그레이션 파일 추가.
- 작업량: S
- 확신도: 높음

### [C-2] Badak API가 `badak_members.role`로 관리자 판단 — 그 컬럼은 본인이 UPDATE 가능
- 계약 조항: 2조(권한은 한 곳에서)
- 근거: `app/api/badak/needs/review/route.ts:14-24` (`badak_members.role IN ('admin','super_admin')`로 403 판단) · DB `badak_members_update` 정책 `auth.uid() = user_id`(컬럼 제한 없음) · `column_privileges`: authenticated(그리고 **anon**)에 `role` 포함 전 컬럼 UPDATE·INSERT GRANT · `badak_members.role` default `'member'`.
- 영향: 로그인한 누구나 자기 `badak_members.role='admin'`으로 바꾼 뒤 니즈 승인 큐 조회·승인 가능(권한 상승). 세션 156과 같은 유형.
- 해결안: `requireAdmin`을 `lib/api-guard.ts` `requireStaff`(또는 `member_roles(role='badak', context='brand')`)로 교체. `badak_members.role` 컬럼은 삭제하거나 UPDATE GRANT에서 제외(`REVOKE UPDATE(role) ... FROM authenticated, anon`). Badak 전면 재설계(§0.1 새로 제작) 전이라도 API 1곳은 즉시 수정.
- 작업량: S
- 확신도: 높음

### [C-3] RLS 직원 판단 `is_tenone_staff()`가 `members.account_type`을 본다 — 권한 SSOT 이원화(정책 65개)
- 계약 조항: 2조
- 근거: DB 함수 `is_tenone_staff` = `EXISTS(SELECT 1 FROM members WHERE auth_id=auth.uid() AND account_type='staff' AND tenant_id='tenone')` · 이 함수를 쓰는 정책 65개(테이블: `members`, `member_brand_joins`, `guests`, `hr_*`, `fin_*`, `payroll`, `wio_*` 59종…) vs `auth_is_staff()`(JWT `is_staff` ← `member_roles`) 206개. CLAUDE.md §1.6: "직원 판단 SSOT = `member_roles` … `auth_is_staff()`".
- 영향: 직원 등록·해제가 `member_roles`에만 반영되면 급여·재무·HR·`member_brand_joins` RLS는 옛 `account_type`을 따라간다(해제된 직원이 계속 보거나, 새 직원이 못 봄). 현재는 트리거 `protect_member_privileged_columns`가 `account_type`을 본인 수정에서 막아 상승 공격은 불가 — 그러나 두 정의가 어긋나는 순간 사고. 현재 4명은 두 정의가 일치함(불일치 0건 확인).
- 해결안: `is_tenone_staff()` 본문을 `SELECT public.auth_is_staff()`로 교체(함수 1개 수정으로 65개 정책 일괄 전환, 정책 자체는 손대지 않음). 이후 `members.account_type`은 "직원 프로필 분류"로만 쓰고 권한 판단에서 제거(`lib/staff-context.tsx:65`, `lib/supabase/erp.ts:336-349` 등은 표시용이라 허용).
- 작업량: S (함수 교체) + M (account_type 의존 코드 검토)
- 확신도: 높음

### [H-1] 브랜드 가입 SSOT 이원화 — 인트라·Badak API가 `members.affiliations`로 회원 수·멤버십 판단
- 계약 조항: 1조 · 5조 · §1.9.5 "브랜드 회원 수를 affiliations로 세기 금지"
- 근거: `app/intra/hero/page.tsx:83-84`, `app/intra/ums/badak/page.tsx:121-124`, `app/intra/ums/badak/members/page.tsx:81-82`, `app/api/intra/myverse/overview/route.ts:22`, `app/intra/ums/{domo,smarcomm,townity,youinone}/page.tsx` (`.contains("affiliations",[brand])`) · `app/api/badak/members/[id]/route.ts:39-44` (affiliations에 'badak' 없으면 404) · `app/api/badak/member/route.ts:20`·`member/onboard/route.ts:18`·`app/api/myverse/onboarding/route.ts:146` (가입 시 affiliations만 추가, `member_brand_joins` 미기록) · DB: `member_brand_joins` 10건 vs `affiliations`에 브랜드가 아닌 값 `brand:1, module:4, system:5`만 존재 · affiliations 중 joins 없는 조합 10건.
- 영향: 인트라 브랜드 회원 수가 사이트 현황(`computeSitesStatus`, member_brand_joins 기준)과 다름. `affiliations`는 `protect_member_privileged_columns` 보호 대상이 아니라 **본인이 UPDATE 가능** → 누구나 'badak'을 넣어 Badak 공개 프로필 노출 조건을 통과. 가입 동의 기록(4조) 없이 "가입"이 성립.
- 해결안: ① `app/api/badak/member*`·`myverse/onboarding`이 `lib/programs/consent.ts` 패턴으로 `member_brand_joins` INSERT(terms_version 포함). ② 인트라 7곳을 `member_brand_joins` 기준으로 교체(RooK 세션 161 방식). ③ `affiliations`는 UI 편의(워크스페이스 드롭다운)로만 두고, 쓰기 경로를 `member_brand_joins` 트리거로 파생시키거나 컬럼 자체를 보호 트리거에 추가. ④ 현재 DB의 `brand/module/system` 값 출처 확인 후 정리.
- 작업량: M
- 확신도: 높음 (쓰레기 값 출처는 확인 필요)

### [H-2] `lib/supabase/universe-profile.ts` — 전부 email 키 + 존재하지 않는 컬럼 조회
- 계약 조항: 1조
- 근거: `universe-profile.ts:38-57` `getUniverseProfile(email)`·`updateUniverseProfile(email)` (`members.eq('email')`) · `:104-131` `getBadakProfile(email)`→`badak_profiles.eq('email')`, `getHeroProfile(email)`→`career_profiles.eq('email')` · DB: `badak_profiles`·`career_profiles`에 `email` 컬럼 없음(`career_profiles.member_id NOT NULL`) · `:222-250` `joinService/leaveService(email)`.
- 영향: Badak·HeRo 특화 프로필 조회는 항상 에러→null(유니버스 프로필 서비스 현황이 비어 보임). 이메일 변경 시 동기화 단절. `app/(Badak)/CLAUDE.md:39`·`app/(HeRo)/CLAUDE.md:222`도 email 시그니처를 표준처럼 기록.
- 해결안: 모든 함수 시그니처를 `memberId`로 바꾸고 `member_id`로 조회(MADLeague는 세션 160에 이미 전환). `joinService/leaveService`는 삭제하고 `member_brand_joins`로 통일. 브랜드 CLAUDE.md 2곳 갱신.
- 작업량: M
- 확신도: 높음

### [H-3] `mad_applications`·`mad_hero_applications`에 계정 정보 복사 컬럼(name·email·phone) 잔존 + `user_id`(auth uid) 키
- 계약 조항: 1조
- 근거: DB `mad_applications.email NOT NULL, name NOT NULL, phone`(member_id nullable) · `mad_hero_applications.name NOT NULL, email NOT NULL, phone, user_id`(members FK 없음) · `app/api/madleague/hero/route.ts:50-54` (user_id·name·email·phone 저장) · RLS `mad_hero_read_own: user_id = auth.uid()` · `column_privileges`: `mad_hero_applications`는 anon·authenticated에 전 컬럼 SELECT·INSERT·UPDATE GRANT(정책이 막고 있을 뿐). `app/(MADLeague)/CLAUDE.md:24`는 "member_id로 연결, 이메일은 계정 이메일만"이라 하지만 DB 컬럼은 남아 있음.
- 영향: 회원이 지원하면 이름·연락처가 두 벌(members + mad_*) — 변경·탈퇴 시 불일치, Data_Lifecycle 3.2의 삭제 대상이 늘어남. HeRo 프로그램 지원(`mad_hero_applications`)이 MADLeague 테이블에 저장되는 것도 3조와 어긋남(HeRo가 주인이면 `program_applications`/`hero_*`로).
- 해결안: 회원 지원은 `member_id NOT NULL` + name/email/phone NULL 허용(비회원 지원만 채움) 또는 컬럼 삭제. `mad_hero_applications`는 프로그램 모듈 `program_applications(brand_id='hero', channel='madleague')`로 흡수(Program_Module §9 구조가 이미 있음). anon GRANT REVOKE.
- 작업량: M
- 확신도: 높음

### [H-4] `badak_members`에 `phone`·`avatar_url` 복사 + anon SELECT `true` 정책
- 계약 조항: 1조 · (보안)
- 근거: DB `badak_members(phone, avatar_url, role, user_id→auth.users)` · 정책 `badak_members_select` qual `true` · anon에 `phone` 포함 SELECT GRANT · `app/api/badak/member/route.ts:74,104,112` (avatar_url 복사·phone 저장) · 현재 2행(phone 1건).
- 영향: Badak 회원 전화번호가 anon API로 전부 열람 가능. Badak은 §0.1 "새로 제작" 대상이라 설계는 바뀔 예정이나 API·테이블은 운영 DB에 살아 있다.
- 해결안: 단기 — `REVOKE SELECT(phone) ON badak_members FROM anon, authenticated`, 공개 조회는 서버 API 화이트리스트로. 재설계 시 `badak_members`는 `member_id→members.id`만 두고 phone/avatar_url/role 제거(모든 `badak_*` 21개 테이블의 FK가 `badak_members`·`auth.users`를 향함 — Data_Lifecycle 3.3 "이전 시 확정" 범위).
- 작업량: S (단기) / L (재설계)
- 확신도: 높음

### [H-5] 서비스별 동의(`member_brand_joins.terms_version`) 기록 경로가 프로그램 참가 1곳뿐
- 계약 조항: 4조
- 근거: 쓰기 경로 grep — `lib/programs/consent.ts:23-28`(origin='program')과 DB 트리거 `fn_auto_member_brand_join`(signup, terms_version 없음)뿐. Badak 온보딩·MyVerse 온보딩·HeRo 진단/매칭 신청·MADLeague 지원서(`mad_applications.consent`에 자체 기록) 모두 `member_brand_joins` 미기록. `docs/Data_Lifecycle.md` §2도 "⏳ 미구현"으로 명시(의도된 이월이나 브랜드 오픈 전 필수).
- 영향: 브랜드 첫 진입 동의 증빙이 테이블마다 다른 곳(`mad_applications.consent`, `members.consent`, 없음)에 흩어짐 → 탈퇴·분쟁 시 동의 버전 추적 불가. Badak 9,000명 재가입(`app/(Badak)/CLAUDE.md` 전환 ②)이 이 기록에 의존.
- 해결안: `lib/programs/consent.ts`의 `ensureBrandConsent(memberId, brand, version)`를 `lib/brand-consent.ts`로 승격해 공통화, 브랜드 마이페이지 첫 진입(`AuthGate`/`ConsentGate` 확장)과 각 신청 API에서 호출. `mad_applications.consent`는 유지하되 joins에도 같은 버전 기록.
- 작업량: M
- 확신도: 높음

### [H-6] 가입 트리거 `crm_absorb_member`가 모든 신규 회원의 이름·이메일·전화를 `crm_people`에 복사
- 계약 조항: 1조 · 4조(목적 외 이용) · §0.1 법적 검토(제18조)
- 근거: DB 트리거 `trg_crm_absorb_member → crm_absorb_member`: INSERT 시 `crm_people(name,email,phone,member_id,…,source='member_signup')` 생성, 이메일 LOWER 매칭으로 기존 row에 member_id 연결 · `crm_people_with_member_id` 5건(= 전 회원).
- 영향: 회원 가입 목적(서비스 이용)으로 받은 정보가 자동으로 마케팅 CRM 대상이 됨 — 광고성 수신 동의(`consent.marketing`)와 무관하게 복사. 이메일 변경 시 `crm_people.email`은 그대로(두 벌). 이메일 매칭으로 타인 CRM row에 연결될 수 있음(이메일 재사용 시).
- 해결안: 트리거 삭제 또는 `consent.marketing=true`인 경우만 + email/phone 복사 대신 `member_id` 참조만(표시는 조인). CRM 비회원 연락처만 email 키 유지(계약 1조 예외 범위).
- 작업량: S
- 확신도: 높음 (법적 판단은 법률 검토 권고)

### Medium

| ID | 조항 | 내용 (근거 → 영향 → 해결) | 작업량 |
|---|---|---|---|
| M-1 | 1조 | `app/api/admin/create-staff/route.ts:24-30` `member_roles.eq('user_id', user.id)` — `member_roles`에 `user_id` 컬럼 없음(member_id뿐) → 항상 403(fail-closed라 안전하지만 기능 불능). `requireStaff`/`isStaffMember`로 교체 | S |
| M-2 | 1조 | 인트라·ERP가 `members.eq('email', user.email)`로 member id 해석: `app/intra/erp/approval/draft/{expenditure,report}/page.tsx:34/36`, `app/intra/project/management/new/page.tsx:232`, `app/intra/myverse/timesheet/page.tsx:83`, `app/api/intra/{planners/payments,planners/subscribers,wio/tenants}/route.ts:20`, `lib/supabase/wio.ts:69` → `useAuth().user.id` 또는 `requireStaff` 결과의 memberId 사용 | S |
| M-3 | 2조 | `components/SiteClosedOverlay.tsx:43` 마스터 bypass를 이메일 문자열 `'lools@tenone.biz'` 비교로 판단 → `/api/auth/me`가 `is_super_admin`(JWT)을 반환하게 하고 그것으로 판단 | S |
| M-4 | 2조 | `lib/api-access-policy.ts:9` `SMARCOMM_BETA_EMAILS` 이메일 allowlist로 API 접근 허용 → `member_roles(role='smarcomm', context='module')`로 전환 (SmarComm 보관 Tier라 우선순위 낮음) | S |
| M-5 | 2조 | `lib/auth-context.tsx:95-98` `member_roles` 비어 있으면 `members.roles/intra_access/brand_access/module_access`로 fallback, `lib/supabase/identity.ts:127-156` `account_type/affiliations` fallback → 트리거가 본인 수정을 막아 상승은 불가하나 제2 SSOT. fallback 삭제(현재 5/5 회원 모두 member_roles 보유) | S |
| M-6 | 4조 | `components/UniverseProfile.tsx:637-639` 비소유자에게 브랜드별 서비스 현황을 `privacySettings[site] === false`일 때만 숨김(opt-out) · `app/(TenOne)/profile/[handle]/page.tsx:87-90` 공개 프로필에 `email`·`affiliations` 포함 → 계약 4조는 교차 노출 = 별도 동의(opt-in). 기본값을 숨김으로, email은 공개 데이터에서 제거 | S |
| M-7 | 1조 | MyVerse: RLS 정책 30개가 email 기준(`myverse_*.본인만`, `planners_*`), `lib/myverse/auth.ts:27`·`app/api/myverse/*`·`features/myverse/DomainPage.tsx:24` 등 members를 email로 조회 → `myverse_users.member_id`가 있으니 `auth_member_id()`/`hero_current_member_id()` 기준으로 정책·코드 일괄 전환 (실험 Tier — 재가동 시) | M |
| M-8 | 5조 | `docs/Data_Lifecycle.md`에 탈퇴 처리 정의가 없는 회원 키 테이블: `badak_*` 21개(3.3 "이전 시 확정"으로 보류 명시), `jakka_*` 11개(auth.users 키), `myverse_*` 45개, `montz_*`, `smarcomm_*`, `evolution_*`, `madleap_portfolios`, `marvis_*`, `coaching_waitlist`·`hero_search_light_waitlist`(HeRo는 있음), RooK(`ums_posts`) · `process_brand_withdrawal` 함수 미존재(문서상 자동화 시점 전) → 집중 브랜드 중 RooK·MADLeap 행 추가, 실험 브랜드는 "계정 전체 탈퇴 시 members cascade 여부"만 표로 | S |
| M-9 | 1조 | `jakka_*`·`badak_*`·`montz_creators`·`wio_members`·`mad_hero_applications`·`hr_*`·`wio_subscriptions` 등 `user_id → auth.users` 직접 키(auth uid). `members.id`와 혼용 → 집중 브랜드(MADLeague `mad_members.user_id UNIQUE`)부터 `member_id` 단일화, 실험 브랜드는 재가동 시 | L |
| M-10 | 1조 | `app/api/hero/company/register/route.ts:157-166` `hero_tih_responses.eq('email', contactEmail)`로 기존 응답 연결 — 담당자 이메일은 CLAUDE.md(HeRo:270)에 "담당자 이메일로 유지" 예외라 비회원 키로는 허용. 단 **회원이 입력한 임의 이메일**로 타인 응답을 자기 기업에 연결 가능 → 인증된 `user.email`과 일치할 때만 연결 | S |
| M-11 | 3조 | `lib/programs/brands.ts:16,90-91` 코어 프로그램 모듈이 `mad_clubs`·`mad_applications`를 직접 읽음 — Program_Module §2 "코어가 mad_clubs를 직접 참조하지 않는다"와 어긋나나 §7 "브랜드 훅(`lib/programs/brands.ts`)"으로 의도됨. 훅 파일을 `lib/madleague/program-hooks.ts`로 옮겨 소유권을 브랜드 쪽에 두면 문서와 일치 | S |

### Low

| ID | 조항 | 내용 | 작업량 |
|---|---|---|---|
| L-1 | 1조 | `lib/api-guard.ts:94`·`lib/intra-server-gate.ts:20` email fallback — `auth_id IS NULL` + 인증 완료 이메일 조건으로 제한된 계정 연결 용도. 허용 범위이나 연결 후 `auth_id`를 채우는지 확인 필요 | S |
| L-2 | 1조 | `coaching_waitlist(email NOT NULL, name, member_id)`·`newsletter_subscribers(email, member_id, name)`·`privacy_deletion_requests(email, name, member_id)` — 비회원 허용 테이블이라 email 키는 예외. 회원인 경우 name 복사 없이 member_id만 채우도록 API 확인 | S |
| L-3 | 1조 | `myverse_public_handles(name, avatar_url)`·`badak_leader_applications(name NOT NULL)` 계정 정보 복사 — 표시 스냅샷 목적이면 문서화, 아니면 조인 | S |
| L-4 | 2조 | `lib/staff-context.tsx:23,65`·`lib/supabase/erp.ts:336-349`·`app/intra/erp/hr/*` `account_type='staff'`로 직원 목록 조회 — 표시용이라 위반은 아니나 C-3 해결 후 `member_roles` 기준으로 맞추면 목록·권한 일치 | S |
| L-5 | 4조 | `components/SignupConsent.tsx` 마케팅 기본값 false(정상). `app/intra/ums/members/guests/page.tsx:23-32` Mock 데이터에 `marketing: true` 하드코딩 — 실데이터 연결 시 제거 | S |
| L-6 | 1조 | `app/api/intra/members/route.ts:23`·`app/intra/ums/members/list/page.tsx:174` 인트라 회원 목록이 `roles`(레거시 컬럼) 표시 — `member_roles` 조인으로 교체 | S |

## 먼저 고칠 순서 (상위 5개와 이유)

1. **C-2 Badak `badak_members.role` 관리자 판단** — 지금 로그인 가능한 누구나 권한 상승. API 1곳 + REVOKE 1줄.
2. **C-1 `hero_talent_applications` RLS** — HeRo는 Vercel 운영 중(집중, 공개). 지원서 1건 들어오는 순간 PII가 anon에 열린다.
3. **C-3 `is_tenone_staff()` → `auth_is_staff()`** — 함수 1개 교체로 65개 정책이 단일 SSOT로. 직원 변동 전에.
4. **H-1 + H-5 브랜드 가입·동의 SSOT 단일화** — Badak 9,000명 재가입·MADLeap 오픈이 `member_brand_joins` 기록에 달려 있고, 인트라 숫자 불일치의 근원.
5. **H-6 `crm_absorb_member` 트리거** — 가입 즉시 목적 외 복사가 자동으로 일어나므로 회원이 늘기 전에 멈춰야 한다 (제18조).

## 확인 필요 (근거 부족·추정)

- `members.affiliations`에 `brand`·`module`·`system` 값이 들어간 경로 — 코드·SQL grep으로 작성자 미발견. 인트라 수동 편집 또는 옛 마이그레이션 추정 (H-1 ④).
- `lib/api-guard.ts` email fallback으로 연결된 뒤 `members.auth_id`가 채워지는지(L-1) — 연결 코드(`member/link`)는 미확인.
- `badak_*` 테이블(29개 중 회원 키 21개)이 "이전 전 추정 설계(동결)"인데 API 라우트 20개가 살아 있음(`app/api/badak/*`) — 공개 접근 가능 여부는 `is_open=false` 가림막이 페이지만 막고 API는 막지 않으므로 축 2(보안)와 교차 확인 권고.
- `crm_absorb_member`의 법적 판단(서비스 이용 목적 ↔ CRM 목적)은 법률 검토 사항.
- `UniverseProfile` 교차 노출 기본값(M-6)이 "본인 허락 시에만"(§0.1 원칙 7)의 의도된 해석(opt-out)인지 사용자 결정 필요.

## 점검 범위·한계 (못 본 것)

- 실험·보관 브랜드(Jakka·MoNTZ·MyVerse·SmarComm·WIO 등) 코드는 grep 결과 요약 수준. 개별 API 로직은 읽지 않음.
- RLS는 `members`·`badak_*`·`mad_*`·`hero_talent_applications`·`member_*`·`jakka_creators`만 정책 본문 확인. 나머지 300여 정책은 함수 참조 개수만 집계.
- 트리거는 `members`·`badak_members`만 열람. 다른 테이블의 복사 트리거 가능성 미확인.
- Supabase Storage 버킷 정책·Edge Function 코드는 범위 밖.
- 외부 서버(Badak·MADLeap 기존 사이트) DB는 접근 불가 — 이전 설계 검증 불가.
- 코드 grep은 `.from('테이블')` 문자열 패턴 기준 — 동적 테이블명·RPC 호출은 누락 가능.
