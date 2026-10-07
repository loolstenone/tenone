# 축 3 — 권한·보안 점검 (2026-10-08, Fable)

> 범위: 루트 CLAUDE.md §1.2·§1.6·부록 A "인증·DB" 기준. `app/api/**/route.ts` 508개 정적 분석(스크립트로 admin client·가드·정책 대조 후 의심 라우트 60여 개 직접 열람) + `middleware.ts`·`lib/api-guard.ts`·`lib/api-access-policy.ts`·`lib/intra-server-gate.ts` + 운영 DB(`ziotlxkdctlhiwkgmmsh`) `pg_policies`·`information_schema`·`has_column_privilege`·`storage.buckets/objects` 정책·`get_advisors(security)` 조회(SELECT만). 회원 개인정보 값은 조회·기재하지 않음(행 수·컬럼만). 실서버 요청 없음.
> 축 1(`axis-1-data-contract.md`)·축 2(`axis-2-ssot.md`)에 있는 항목은 "축N X-n 참조"로만 적는다.

## 요약

- 코어 가드(`requireStaff`·middleware 1b 인트라 게이트·`protect_member_privileged_columns` 트리거·`program_*`/`uc_*` service_role 전용 설계)는 견고하다. 문제는 **코어 가드 밖에 남은 옛 라우트와 옛 RLS 정책**에 몰려 있다: ① SmarComm CRM API가 인증 없이 service_role로 이름·이메일·전화를 통째로 반환, ② 뉴스레터 발송 API가 "로그인만 하면" 전 구독자에게 메일 발송, ③ `board-assets` 버킷이 anon에게 업로드·덮어쓰기·삭제 전부 열림, ④ `hero_matches`·`hero_companies`·`newsletter_subscribers`·`collected_data`(3.7만 행)·`member_visits`(IP) 등 `USING (true)` 읽기 정책 + anon 컬럼 GRANT, ⑤ 본인 UPDATE 정책이 `status`·`approved_at`·`plan`·`points` 같은 권한성 컬럼까지 열어 자기 승인·자기 구독 활성화가 가능한 테이블 10여 개, ⑥ 인증 링크(`/auth/confirm?next=`)·SSO·콜백의 open redirect.
- middleware가 `.png/.jpg/.svg`로 끝나는 경로를 아예 건너뛰므로, **정책(middleware)에만 기대는 동적 API 7개**는 `/{id}.png` 형태로 직원 게이트를 우회할 수 있다(정적 분석 — 실서버 미검증).
- 현재 실회원 5명·대부분 테이블 0행이라 실피해는 없으나, HeRo는 공개 운영 중이고 `collected_data`·`board-assets`는 실데이터가 있다.
- **심각도별 개수**: Critical 3 · High 6 · Medium 12 · Low 7 (총 28)

## 발견 사항

### [C-1] `/api/smarcomm/crm/people`·`/crm/email` — 인증 없이 service_role로 CRM 이름·이메일·전화·구독자 목록 전부 반환
- 근거: `app/api/smarcomm/crm/people/route.ts:31-39` (`createAdminClient().from('crm_people').select('*')` → name·email·phone 포함 응답, 가드 없음) · `app/api/smarcomm/crm/email/route.ts:15-23` (`email_sends.to_addr`, `email_senders`, `newsletter_subscribers.email,name` 반환, 가드 없음) · `lib/api-access-policy.ts:28` `SMARCOMM_DASHBOARD_API`는 `airm|assets|broadcasts|campaigns|content|creatives|experiments|workflow`만 — `crm`·`scans`·`analytics`·`insights`·`journey`·`calendar`·`data-hub`·`prompts`·`report/[id]`·`ai-*`·`benchmark-stats`는 **정책 밖**(같은 패턴 GET 18개, 전부 admin client·가드 없음). DB `crm_people` 5행(= 전 회원, 축1 H-6 트리거로 자동 복사).
- 악용 시나리오: 누구나 URL 한 번으로 전 회원·구독자·CRM 연락처의 이름·이메일·전화를 내려받는다 (개인정보보호법 제29조).
- 해결안: `SMARCOMM_DASHBOARD_API` 정규식을 `/^\/api\/smarcomm\/(?!scan(\/|$)|me\/|push\/|email\/send)/` 처럼 "공개 진단 API 제외 전부 직원"으로 뒤집고, 각 핸들러에도 `requireStaff` 추가(이중 방어). SmarComm은 보관 Tier(§0.1)이므로 Pro 대시보드 API 18개를 아예 끄는 것도 선택지.
- 작업량: S
- 확신도: 높음

### [C-2] `/api/newsletter/send` — 로그인한 아무 회원이나 전 구독자에게 뉴스레터 발송
- 근거: `app/api/newsletter/send/route.ts:41-48` `if (!user && !isAdmin) 401` — 직원 여부 검사 없음(파일 전체 grep: staff·member_roles 0건). 세션 클라이언트로 `newsletter_issues`·`newsletter_subscribers` 조회 → DB 정책 `newsletter_read_auth` = authenticated `SELECT USING (true)`라 일반 회원도 전 구독자 조회 가능. `isAdmin`은 `auth === \`Bearer ${process.env.ADMIN_API_KEY}\``(M-1 패턴). 정책 미등록 경로.
- 악용 시나리오: 가입만 한 사용자가 `noreply@tenone.biz` 명의로 전 구독자에게 임의 이슈를 발송 — 스팸·피싱·정보통신망법 제50조 위반 책임이 운영사에 귀속.
- 해결안: `requireStaff(req)`로 교체(내부 호출은 `isInternalRequest`가 처리). `/api/newsletter/send`를 `STAFF_ONLY_API`에 추가. `newsletter_read_auth` 정책을 `auth_is_staff()`로 교체하고 authenticated SELECT GRANT는 유지해도 됨(H-3와 함께).
- 작업량: S
- 확신도: 높음

### [C-3] Storage `board-assets` — public 버킷 + anon 업로드·덮어쓰기·삭제 정책
- 근거: `storage.buckets` `board-assets public=true, file_size_limit=none, allowed_mime=any` · `storage.objects` 정책 `board_assets_insert/update/delete/read` 모두 `roles=public`, 조건 `bucket_id='board-assets'`뿐(auth.uid() 검사 없음) · 객체 404개(전 버킷 중 최다). 비교: `avatars`는 authenticated 한정, `brand-assets`·`myverse-moments`는 폴더=본인 검사 있음.
- 악용 시나리오: 로그인 없이 임의 파일(크기·형식 무제한)을 올리거나 기존 게시글 이미지 404개를 다른 이미지로 덮어쓰기·삭제 — 호스팅 남용·피싱 자산 배포·게시판 훼손.
- 해결안: INSERT/UPDATE/DELETE 정책을 `roles=authenticated` + `(storage.foldername(name))[1] = auth_member_id()::text`(또는 서버 API `/api/board/upload`만 쓰므로 anon·authenticated 쓰기 정책 삭제 → service_role만), 버킷에 `file_size_limit`·`allowed_mime_types` 설정. `sql/`에 마이그레이션 추가.
- 작업량: S
- 확신도: 높음

### [H-1] HeRo 매칭 데이터 — RLS `SELECT USING (true)` + 비인증 API 2개 (`memberId` 쿼리 신뢰)
- 근거: DB `hero_matches.hero_matches_auth_read`·`hero_companies.hero_companies_auth_read` = `roles=public`, `qual=true`(이름과 달리 anon 포함) · anon에 `hero_matches` 전 컬럼 SELECT GRANT(`ai_match_report, fee_amount, fee_paid, match_score_breakdown, risk_notes, talent_feedback…`) · `app/api/hero/matching/inbox/route.ts:38-53` 가드 없이 `?memberId=`로 인재 측 매칭 리포트 반환 · `app/api/hero/journey/status/route.ts:22-80` 가드 없이 `?memberId=`로 체크인·매칭 수 조회 + 스테이지 승급 시 `earnUC`·이메일 발송(쓰기 부수효과). `hero_matches` 1행·`hero_companies` 1행.
- 악용 시나리오: 비로그인 사용자가 PostgREST 또는 위 API로 다른 회원의 매칭 상태·AI 리포트·수수료·피드백을 열람하고, 임의 memberId로 승급 메일·UC 지급을 트리거.
- 해결안: 두 정책을 `profile_member_id = hero_current_member_id() OR auth_is_staff() OR (기업 담당자 조건)`으로 교체, anon SELECT GRANT REVOKE. 두 API는 `requireMember` + `assertSelf(auth, memberId)`(또는 memberId를 세션에서만 도출). `app/(HeRo)/CLAUDE.md`에 반영.
- 작업량: S
- 확신도: 높음

### [H-2] middleware matcher가 `.png/.jpg/.svg` 끝 경로를 건너뜀 → 정책에만 기대는 동적 API의 직원 게이트 우회
- 근거: `middleware.ts:283-285` `matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)']` — 0-API 게이트(`:83-89`)·1b 인트라 게이트(`:158-176`)가 이 경로에서는 실행되지 않음. Next.js 동적 세그먼트 `[id]`는 `abc.png`도 매칭한다. 정책(`getApiAccessRule`)에만 기대고 핸들러 자체 가드가 없는 라우트 54개 중 동적 세그먼트 7개: `/api/hero/matching/[id]` **PATCH**(`match_status·fee_paid·fee_amount·ai_match_report` 수정, `route.ts:13-40`), `/api/hero/matching/[id]/curate` POST, `/api/intra/myverse/reports/[id]` PATCH, `/api/smarcomm/airm/flags/[id]/sources`, `/api/smarcomm/assets/[id]`(GET·PATCH·DELETE), `/assets/[id]/distributions`, `/distributions/enrich-da`.
- 악용 시나리오: 비로그인 사용자가 `/api/hero/matching/{uuid}.png`로 PATCH를 보내 매칭 상태·수수료 납부 여부를 바꾼다(정적 분석 결론 — 실서버 미검증).
- 해결안: ① matcher에서 확장자 예외를 `/_next/*`·`/favicon.ico` 등 정적 경로로만 좁히고 `/api/:path*`는 항상 포함(별도 matcher 항목). ② 7개 핸들러에 `requireStaff` 직접 추가(정책은 1차, 핸들러는 2차 — CLAUDE.md 부록 A 원칙). ③ `scripts/site-check.mjs`에 "STAFF_ONLY 경로의 route.ts가 requireStaff를 import하는지" 검사 추가.
- 작업량: S
- 확신도: 확인 필요 (matcher 동작은 로컬 `preview_start`로 `/api/hero/matching/x.png` 401 여부 확인)

### [H-3] `USING (true)` 읽기·쓰기 정책 — 방문 IP·수집 데이터·탈퇴 사유·주문·대화 스레드가 anon에 열림
- 근거(정책명 → anon 컬럼 GRANT → 행 수):
  - `member_visits.member_visits_read` anon `true` → `ip_address, user_agent, member_id` → 0행 (+ `member_visits_write` = 로그인 누구나 ALL)
  - `collected_data.anon_read` + **`anon_update`**(`tenant_id='tenone'`) → content·raw_data·metadata → **37,727행** — anon이 크롤링 원천을 읽고 **수정** 가능(Mindle 파이프라인 오염)
  - `member_brand_withdrawals.member_brand_withdrawals_read` anon `true`(`reason, scope, member_id`) + `_write` 로그인 누구나 ALL → 0행
  - `chat_threads.chat_threads_agent_read` anon `true` + `chat_threads_anon_update`(channel) + `chat_threads_authenticated` 로그인 누구나 ALL → 5행 (2026-10-05 메시지 정책 사고와 같은 테이블군)
  - `wio_orders.wio_orders_read` anon `true` + `_write` 로그인 누구나 ALL · `evolution_enrollments` anon read + 로그인 누구나 ALL(`certificate_url, score, status`) · `wio_tenants_public_read` anon `true` · `newsletter_subscribers.newsletter_read_auth` authenticated `true`(email·name, C-2 연계)
  - 그 외 `qual=true` SELECT 정책 110개 집계(공개 콘텐츠가 대부분이나 `badak_group_members`·`jakka_bookmarks/likes/follows`·`hr_org_units`·`wio_work_assignments`·`wio_kpi_targets` 등 활동·조직 정보 포함)
- 악용 시나리오: 비로그인으로 회원 접속 IP·탈퇴 사유·주문 내역을 읽고, 수집 데이터 3.7만 건을 덮어써 트렌드 콘텐츠를 조작.
- 해결안: 위 7개 테이블 정책을 본인(`auth_member_id()`)·직원(`auth_is_staff()`)·service_role로 교체, anon SELECT/UPDATE GRANT REVOKE. 110개 `true` 정책은 표로 뽑아 "공개 콘텐츠 / 활동 로그 / 운영 데이터"로 분류 후 후자 2종 정리. 점검기: `pg_policies`에서 `qual='true' AND roles ∋ anon|public`을 `site-check --db`로 자동 집계.
- 작업량: M
- 확신도: 높음

### [H-4] 본인 UPDATE 정책이 권한성 컬럼까지 허용 — 자기 승인·자기 구독 활성화 (축1 C-2와 같은 패턴, 다른 테이블)
- 근거(`pg_policies` qual + `has_column_privilege(authenticated, …, 'UPDATE')` 교차, 축1 C-2 `badak_members.role` 제외):
  - `jakka_showcases.jakka_showcases_update` `auth.uid()=user_id` → `status, approved_at` 수정 가능 → 쇼케이스 자기 승인
  - `brand_membership_applications.bma_self_rw` 본인 ALL → `status='approved'`로 셀프 변경 → 트리거 `trg_approve_membership`이 `member_brand_joins` INSERT(승인 멤버십 브랜드 가입 성립)
  - `wio_subscriptions.subs_own_write` 본인 ALL → `status, plan` → 유료 구독 자기 활성화 · `wio_tenants.wio_tenants_owner` → `plan, is_active` 셀프 업그레이드
  - `wio_approvals`·`wio_timesheets`·`wio_points` `wio_*_tenant` = 같은 테넌트 회원 누구나 ALL → `status/approved_at`·`approved`·`points` 수정(결재 셀프 승인·시수 승인·포인트 조작) · `wio_recognitions_auth_all` 로그인 누구나 → `points` · `approvals.approvals_update` 기안자 본인 → `status`(`/api/approvals/[id]` PATCH가 body를 그대로 spread, `route.ts:11-13`)
  - `montz_creators.is_verified`·`badak_profiles.is_active`·`jakka_creators.status/is_public`·`hero_jh_responses.status`(`member_id = auth.uid()` 키 혼용, 축1 C-1 패턴)·`mad_members`(`user_id = auth.uid()` 본인 UPDATE, 컬럼 제한 없음 — `cohort_id`·`status` 등은 확인 필요)
- 악용 시나리오: 로그인 사용자가 supabase-js로 자기 행의 `status`/`plan`/`points`를 바꿔 심사·결제·승인 단계를 건너뛴다.
- 해결안: 공통 패턴으로 `REVOKE UPDATE (status, approved_at, plan, is_active, is_verified, points, approved) ON … FROM authenticated` (컬럼 단위 GRANT가 가장 싸다) 또는 `members`처럼 보호 트리거. WIO 테넌트 정책은 `wio_members.role`(관리자) 조건 추가. `/api/approvals/[id]`는 허용 필드 화이트리스트.
- 작업량: M
- 확신도: 높음 (mad_members 컬럼은 확인 필요)

### [H-5] Open redirect — 인증 링크·SSO·콜백의 `next`/`final`/`redirect` 미검증
- 근거: `app/auth/confirm/route.ts:24,72` `next = searchParams.get('next') || '/'` → `NextResponse.redirect(\`${origin}${next}\`)` 검증 없음(`next=.evil.com` → `https://www.tenone.biz.evil.com`, `next=@evil.com` → userinfo 형태로 외부 이동) · `app/auth/callback/page.tsx:15,50` `router.replace(next)` 절대 URL 허용 · `app/api/sso/exchange/route.ts:21,53` `new URL(final_path, origin)` — 절대 URL이면 origin 무시 · `app/(Myverse)/myverse/login/page.tsx:14` `router.replace(redirect)`. 반면 `app/login/page.tsx:19-26` `safeRedirect()`는 올바르게 막고 있음(재사용 안 됨).
- 악용 시나리오: 이메일 인증·비밀번호 재설정 링크(`/auth/confirm?...&next=`)를 변조해 로그인 완료 직후 피싱 사이트로 보낸다 — 세션 쿠키는 안전하지만 사용자는 "텐원 링크"를 믿고 이동.
- 해결안: `safeRedirect`를 `lib/login-href.ts`로 승격(상대 경로 + `/`로 시작 + `//`·`\\`·`@`·`.`로 이어지는 호스트 변조 차단)하고 4곳 모두 적용. SSO `final`은 initiate에서 저장한 `sso_tokens.final_path`만 쓰고 쿼리 값은 무시.
- 작업량: S
- 확신도: 높음

### [H-6] `/api/hero/tih` — 인증·캡차 없이 `email` 충돌 upsert로 타 기업 TIH 응답 덮어쓰기
- 근거: `app/api/hero/tih/route.ts:4-28` 가드·Turnstile 없음, `upsert({... email: body.contactEmail ...}, { onConflict: 'email' })` → 기존 행 전체 교체. `hero_tih_responses` 2행. 같은 기업 담당자 이메일로 `hero_company/register`가 응답을 연결함(축1 M-10).
- 악용 시나리오: 타 기업 담당자 이메일만 알면 그 기업의 인재 요구 응답을 임의 내용으로 바꾸거나 스팸으로 테이블을 채운다.
- 해결안: `verifyTurnstile` 필수 + upsert 대신 insert(중복 시 신규 행·status pending) 또는 로그인 회원이면 `member_id` 기준. 비회원 응답은 이메일 확인 토큰 후 반영.
- 작업량: S
- 확신도: 높음

### Medium

| ID | 내용 (근거 → 영향 → 해결) | 작업량 |
|---|---|---|
| M-1 | **`Bearer ${process.env.ADMIN_API_KEY}` 직접 비교** 6곳: `app/api/agent/{badaksoe,profiles,publish,run}/route.ts`, `app/api/hero/journey/weekly-report/route.ts:23`, `app/api/newsletter/send/route.ts:45` — 환경변수 미설정 배포(프리뷰 등)에서 `Bearer undefined`가 통과(fail-open). `lib/api-guard.ts:55-60 isInternalRequest`는 16자 미만·미설정 키를 거부하므로 이것으로 교체. `/api/agent/*`는 `STAFF_ONLY_API`에도 없음 → 추가 | S |
| M-2 | **`/api/badak/member/verify`** POST·PUT 비인증 (`route.ts:43-64,95-120`): 임의 `email`로 인증 메일 발송(Resend 중계·과금) + 임의 `userId`로 코드 생성, 6자리 코드 시도 횟수 제한 없음. 결과는 클라이언트(`app/(Badak)/badak/my/page.tsx:1375-1398`)가 믿고 진행 → `requireUser` + 세션 user.id만 사용, 시도 횟수·분당 발송 제한, 검증 결과는 서버가 상태로 보관 | S |
| M-3 | **`/api/sites/upload`** 인증 없음(`route.ts:15-22` anon 키 클라이언트) — 버킷 `site-branding`이 **DB에 없음**(storage.buckets 11개 중 부재)이라 지금은 실패하지만, CLAUDE.md G.3·§1.9는 존재한다고 기술. `badak/upload`의 `uploads` 버킷도 부재. → `requireStaff` + admin client로 고치고 버킷 생성(private 아님, 브랜딩용 public + mime 제한), 문서 정정 | S |
| M-4 | **공개 폼 Turnstile 누락**: `app/api/gravity/apply/route.ts`(bg_apply_requests), `app/api/hero/talent-agent/apply/route.ts`(축1 C-1 테이블), `hero/tih`(H-6), `badak/member/verify`(M-2) — `lib/turnstile-server.ts` fail-closed 헬퍼가 있는데 미사용. `app/api/trendhunter/collect/route.ts:30-34` `if (apiKey && …)` → `TRENDHUNTER_API_KEY` 미설정 시 anon이 `collected_data` INSERT(외부 status의 required 목록에도 없음) → `isInternalRequest` 또는 키 필수로 | S |
| M-5 | **SECURITY DEFINER search_path 미고정 30개**(advisor 87건 중 definer) + anon 실행 가능 definer 36개(`get_advisors`): `has_brand_admin_access`, `grant_signup_uc`, `jakka_set_showcase_admin`, `trg_approve_membership_fn`, `crm_absorb_*`, `fn_wio_*` 등. 트리거 함수가 대부분이라 직접 호출 피해는 제한적이나 `get_public_profile`(anon 실행, `members.email`을 SELECT에 포함 — 반환 필터는 확인 필요). → 전부 `SET search_path = public` + 트리거·내부 함수는 `REVOKE EXECUTE FROM anon, authenticated` | S |
| M-6 | **권한 판단 제2 소스 잔존**: `privacy_deletion_requests."Staff can manage"` = `members.roles @> {staff|admin}`(본인 UPDATE GRANT 있는 컬럼, 트리거가 막는 중) · `ums_sites_super_admin`·`customer_payments_staff_all` = `members.account_type` · `sso_tokens`·`wio_members`·`partners`·`members_delete` = `is_tenone_staff()`(축1 C-3 참조) · `SMARCOMM_BETA_EMAILS`(축1 M-4 참조) → 전부 `auth_is_staff()` | S |
| M-7 | **세션 클라이언트 + body spread UPDATE** `app/api/members/[id]/route.ts:20`, `app/api/projects/[id]/route.ts:27`, `app/api/approvals/[id]/route.ts:11` — RLS·트리거에만 의존. members는 트리거가 보호, projects는 staff 전용 정책이라 안전, approvals는 H-4. → 허용 필드 화이트리스트 공통화 | S |
| M-8 | **`sso_tokens`**에 access·refresh 토큰 평문 저장, 사용 후 행 삭제 안 함(`exchange/route.ts:50` used=true만, 만료 삭제는 재접근 시) → 5행 잔존. 정책은 `is_tenone_staff()`(M-6). → 교환 즉시 DELETE + 만료 cron, 또는 토큰 대신 Supabase `signInWithIdToken`/`exchangeCodeForSession` 활용 | S |
| M-9 | **anon 테이블 쓰기 GRANT 1,047건**(role_table_grants INSERT/UPDATE/DELETE) — 부록 D 표준은 anon SELECT만. RLS가 유일한 벽이라 H-3 같은 `true` 정책 하나로 바로 열림 → `sql/grant-public-tables-migration.sql`에 `REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM anon` + 필요한 테이블만 재부여 | S |
| M-10 | **SECURITY DEFINER 뷰 6개**(advisor ERROR): `bums_boards`, `board_configs`, `posts`, `site_configs`, `badak_leader_fee_summary`, `myverse_public_handles` — 뷰 생성자 권한으로 RLS 우회. `posts`는 축2 H-3가 "테이블 없음"이라 한 것이 실제로는 definer 뷰(코드 `board.ts`가 읽는 대상 재확인). `badak_leader_fee_summary`는 수수료 데이터 → `security_invoker = true`로 전환, 불필요 뷰 DROP | S |
| M-11 | **Auth 설정**: Leaked Password Protection 비활성(advisor) → Dashboard › Auth › Password에서 HIBP 켜기(코드 변경 없음, 👤) | S |
| M-12 | **`/api/hit/a/score`가 런타임에 `.env.local`을 파일로 읽음**(`route.ts:64-72` `fs.readFileSync(path.join(cwd,'.env.local'))`) — 비밀 처리 경로가 둘, 부록 D "PAT 평문 금지"와 같은 취지. `/api/debug-env`(`route.ts:1-9`)는 환경변수 **이름** 목록 노출 → 둘 다 삭제 | S |

### Low

| ID | 내용 | 작업량 |
|---|---|---|
| L-1 | `/api/badak/members/search`·`/badak/members/[id]`·`/badak/needs/[id]/members` 비인증 + `user_id`(auth uid) 노출 — 축1 H-4 참조. RLS도 `true`라 API 막아도 PostgREST로 읽힘 | S |
| L-2 | `/api/agent/profiles` POST: 관리자 키 검사 후 **세션 클라이언트**로 INSERT(`route.ts:41-44`) → 키 호출은 RLS에 막혀 항상 실패(fail-closed, 기능 불능). admin client + `requireStaff`로 | S |
| L-3 | `rls_enabled_no_policy` 35개(`program_*`·`uc_*`·`mail_*`·`badak_fee_configs`·`mad_round_*` 등) — service_role 전용 설계면 정상(deny-all). 단 클라이언트에서 직접 읽는 곳이 있으면 항상 0건(축2 H-3 유형) → 코드 `.from()` 대조 | S |
| L-4 | 확장 `pg_net`·`vector`가 public 스키마(advisor) → `extensions` 스키마로 이동 | S |
| L-5 | `hero_daily_checkins`·`hero_jh_responses` 정책 `member_id = auth.uid()` — 키 혼용(축1 C-1 패턴, 다른 테이블). 본인 조건이 영원히 거짓 → 서버 API만 동작 | S |
| L-6 | `dangerouslySetInnerHTML` 16곳 중 14곳은 `sanitizeHtml/sanitizeRichHtml`·JSON-LD·자기 에디터 출력. 미정화 1곳 `app/(Mindle)/mindle/trends/[id]/page.tsx:157,169` `textWithBold(para)` — AI 생성 텍스트지만 원천이 크롤링(`collected_data`, H-3로 anon 수정 가능)이라 체인 가능 → 이스케이프 후 bold 치환 확인 | S |
| L-7 | 업로드 검증 양호: `board/upload`(requireMember·image·5MB), `madleague/upload`(mime·크기), `myverse/moments/upload`(mime·크기). `mad-community` 버킷(public, 85객체)은 pdf·zip·docx 허용 — 커뮤니티 첨부가 공개 URL로 열람 가능(의도면 OK, 과제 제출물은 `mad-submissions`/`program-submissions` private 버킷 0객체로 분리돼 있음) | S |

## API 전수 결과 (508개 중 문제 있는 것만)

> 분류: A=service_role 사용, 가드=`require*`/`assertSelf`/`getMemberId`/`sessionMemberId` 등, 정책=`api-access-policy` 매칭. 아래 외 440여 개는 가드·정책·세션 RLS 중 하나 이상으로 보호됨(Myverse 140개는 `getMemberId()` 이메일 키 — 축1 M-7 참조).

| 경로 | 메서드 | 보호수단 | 판정 |
|---|---|---|---|
| `/api/smarcomm/crm/people`, `/crm/email`, `/scans`, `/report/[id]`, `/analytics/*`, `/insights`, `/journey`, `/calendar`, `/data-hub`, `/prompts`, `/ai-*`, `/benchmark-stats`, `/crm/segments` (18) | GET | A · 없음 | C-1 |
| `/api/newsletter/send` | POST | 로그인만 | C-2 |
| `/api/hero/matching/inbox`, `/api/hero/journey/status` | GET | A · 없음 (`?memberId`) | H-1 |
| `/api/hero/matching/[id]`, `[id]/curate`, `/api/intra/myverse/reports/[id]`, `/api/smarcomm/airm/flags/[id]/sources`, `/api/smarcomm/assets/[id]`(+2) | PATCH/POST/DELETE | 정책만 | H-2 |
| `/api/hero/tih` | POST | A · 없음 · 캡차 없음 | H-6 |
| `/api/agent/{badaksoe,profiles,publish,run}`, `/api/hero/journey/weekly-report`, `/api/newsletter/send` | POST | `Bearer ${env}` 직접 비교 | M-1 |
| `/api/badak/member/verify` | POST/PUT | A · 없음 | M-2 |
| `/api/sites/upload` | POST | 없음 (anon 키) | M-3 |
| `/api/gravity/apply`, `/api/hero/talent-agent/apply`, `/api/trendhunter/collect` | POST | A · 캡차/키 없음 또는 fail-open | M-4 |
| `/api/approvals/[id]`, `/api/projects/[id]`, `/api/members/[id]` | PATCH | 세션 RLS만 · body spread | M-7 / H-4 |
| `/api/sso/exchange` | GET | 토큰 · `final` 미검증 | H-5 / M-8 |
| `/api/debug-env`, `/api/hit/a/score` | GET/POST | — | M-12 |
| `/api/badak/members/search`, `/badak/members/[id]`, `/badak/needs/[id]/members`, `/badak/cloud`, `/badak/feed` | GET | A · 없음 (공개 의도) | L-1 |
| `/api/agent/profiles` | POST | 키 → 세션 RLS | L-2 |

양호 확인: `requireStaff`·`isInternalRequest` 기반 크론 15개(`internalAuthHeaders` 사용), `lib/intra-server-gate.ts` + middleware 1b, `program_*` 라우트의 `sessionMemberId`·`getRoundAccess`·`getTeamScope`, MADLeague `getMadAccess` 계열, `hit/*` 세션 RLS, `sites/toggle`(member_roles 직접 조회 — `requireStaff`로 바꾸면 더 좋음), 클라이언트 컴포넌트에서 admin client import 0건, `NEXT_PUBLIC_*`에 관리자 키 0건(ADMIN_KEY 금지 목록만 존재), 인증 폼 `signUp/signInWithPassword/resetPasswordForEmail` 7곳 전부 `captchaToken` 전달, 내부 fetch 15곳 전부 `Authorization` 헤더 포함.

## 먼저 고칠 순서 (상위 5개)

1. **C-1 SmarComm CRM API 18개 차단** — 정규식 한 줄 + `requireStaff`. 지금 이 순간 전 회원 연락처가 URL 하나로 열려 있다.
2. **C-2 뉴스레터 발송 `requireStaff`** — 회원이 늘기 전에. 한 줄 교체.
3. **C-3 `board-assets` 정책 + H-3 `true` 정책 7개** — SQL 마이그레이션 1개로 묶어 처리(anon REVOKE 포함, M-9와 함께).
4. **H-1 HeRo 매칭 정책·API** — HeRo는 공개 운영 중(집중 Tier). 정책 2개 교체 + API 2개 `assertSelf`.
5. **H-2 middleware matcher + H-5 open redirect** — 둘 다 "코어 가드가 있는데 구멍이 난" 유형이라 가드 신뢰도를 회복해야 다른 수정의 전제가 선다. matcher는 로컬 확인 후 수정.

H-4(자기 승인 컬럼)는 WIO·Jakka·MoNTZ가 실험 Tier라 다음 순위이나, `brand_membership_applications`(승인 멤버십 코어)와 `approvals`는 1차에 포함 권고.

## 확인 필요

- **H-2 matcher 우회**: Next.js 16.1 matcher가 `/api/hero/matching/x.png`를 실제로 제외하는지 로컬(`preview_start`)에서 401/200 확인 — 실서버 요청은 하지 않았다.
- `get_public_profile()`(anon 실행 definer)이 `email`을 반환 JSON에서 제외하는지 — 함수 본문 600자만 열람.
- `mad_members` 본인 UPDATE 정책이 `cohort_id`·`status`·`role`류 컬럼을 열어 두는지(컬럼 GRANT는 미조회).
- `collected_data.anon_update`가 외부 크롤러(OpenClaw 폐기 전) 호환용 의도인지 — 의도여도 `tenant_id='tenone'` 조건만으로는 anon 전체 수정 허용.
- `posts`가 definer 뷰라면 축2 H-3 결론("테이블 없음") 재검토 — 뷰 정의는 미조회.
- `ADMIN_API_KEY`·`TRENDHUNTER_API_KEY`·`TURNSTILE_SECRET_KEY`가 Production·Preview 양쪽에 설정됐는지(`/api/intra/external/status`가 점검하나 Preview 환경은 별도) — M-1·M-4의 실제 노출 여부가 여기 달려 있다.
- `mad-community` public 버킷의 pdf·zip 첨부(85객체)가 공개 의도인지.

## 점검 범위·한계

- API 508개는 스크립트 분류(admin client·가드 함수명·정책 정규식·쓰기 호출 유무) 후 "가드 없음" 60여 개와 핵심 가드 파일만 직접 읽었다. 가드가 있는 라우트의 **소유권 검증 누락**(`assertSelf` 없이 body id 사용)은 Myverse·Badak·HeRo 일부만 표본 확인 — 전수는 아니다.
- RLS는 `qual='true'` 전수 + 본인 UPDATE × 권한성 컬럼 교차 + 핵심 30여 테이블 정책 본문. 나머지 정책 300여 개는 집계만.
- Storage는 `storage.buckets`·`storage.objects` 정책·객체 수만. 개별 객체 경로·내용은 보지 않았다.
- Edge Function 11개·pg_cron·Supabase Auth 설정(Redirect URL 목록·MFA)·Vercel 환경변수 값·Cloudflare Turnstile 설정은 범위 밖.
- 클라이언트 번들 실측(빌드 산출물 grep)은 하지 않았다 — `NEXT_PUBLIC_*`·admin import는 소스 grep 기준.
- 실서버에 어떤 요청도 보내지 않았으므로 "우회 가능"은 전부 코드·정책 정적 판단이다.
