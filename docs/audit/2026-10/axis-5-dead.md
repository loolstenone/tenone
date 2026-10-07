# 축 5 — 죽은 것 점검 (2026-10-08, Fable)

> 범위: 운영 DB(`ziotlxkdctlhiwkgmmsh`) public 테이블 499개 × `pg_stat_user_tables`(행 수·누적 쓰기·마지막 analyze) ↔ 코드(`app/`·`lib/`·`components/`·`features/`·`Scripts/`·`supabase/functions/`·`middleware.ts`) 전수 grep(`.from('t')`·`rpc('f')` 엄격 패턴 + 단어 단위 느슨 패턴) · 함수 118개·트리거 80개·뷰 10개·pg_cron 4개 · API 라우트 508개 · 페이지 553개 · 패키지 51개 · `sql/` 282개 · `docs/` 64개. 회원 개인정보 값은 조회하지 않음(행 수만).
> 중복 회피: 코드가 읽는데 DB에 없는 테이블 = 축2 H-3, layout 없는 브랜드 그룹 = 축4 H-3, 0행 중복 테이블군(알림 6종·인증서 3종·경쟁 3종…) = 축2 M-6, PAT 스크립트 = 축4 M-7, 죽은 복제 컴포넌트 4개 = 축2 L-4 — 본 문서는 "참조만" 하고 확장분만 적는다.

## 요약

- DB는 **499개 테이블 중 355개(71%)가 0행**이다. 그중 코드 참조도 없는 **91개는 삭제 후보**, 코드는 있으나 한 번도 INSERT된 적 없는 199개는 "만들어만 둔 기능"(WIO 57·MyVerse 28·Jakka 17·Badak 16). 코드 0·행 있음 18개(옛 MADLeague 경쟁 PT 6개 등)는 이전 완료 후 잔재.
- 코드 쪽은 **API 라우트 77개가 어디서도 호출되지 않고**(외부 콜백·cron 제외 시 ~55), 보관 Tier 브랜드 API가 **약 250개(전체의 절반)** 살아 있어 §0.1 원칙 5("보관 브랜드는 페이지·API를 끈다")와 정면으로 어긋난다. import 0인 파일 80개(약 16,000줄), import 0 패키지 5개.
- 저장소에 **Python venv 실행파일 14개(25MB)·`__pycache__`·PAT 기반 스크립트 19개**가 `Scripts/`로 커밋돼 있다 — 공급망·자격증명 위생 문제라 H.
- `sql/` 282개 중 적용 이력 표기는 16개뿐이고 `planners-*` 53개 ↔ `myverse-*` 41개가 개명 전후로 공존, `docs/` 64개 중 40개는 어느 문서·가이드에서도 참조되지 않는 2026-03~05 설계서.
- **심각도별 개수**: High 4 · Medium 8 · Low 4 (총 16). **삭제 후보 총계**: 테이블 91 · 함수 12 · 뷰 5 · API 라우트 55(+보관 브랜드 ~250 차단) · 코드 파일 80 · 패키지 5 · 스크립트 33(실행파일 14 + PAT 19) · sql 파일 ≥60 · docs 40.

## 발견 사항

### [H-1] `Scripts/`에 Python venv 실행파일 25MB·`.pyc`·PAT 스크립트 19개가 커밋됨 — 공급망·자격증명 위생
- 근거: `git ls-files Scripts/` 50개 중 `coloredlogs.exe`·`dotenv.exe`·`f2py.exe`·`isympy.exe`·`magika.exe`·`markitdown.exe`·`normalizer.exe`·`numpy-config.exe`·`onnxruntime_test.exe`·`pdfplumber.exe`·`pypdfium2.exe`·`humanfriendly.exe`·`markdownify.exe` 등 **실행파일 14개(25,102,380 bytes)** + `Scripts/__pycache__/*.pyc` 3개 + `dumppdf.py`·`pdf2txt.py`·`vba_extract.py`(pip 패키지 엔트리). Windows 대소문자 무시로 Python venv `Scripts/`와 프로젝트 `scripts/`가 합쳐진 흔적. `.gitignore`에 `Scripts`·`*.exe` 없음. `SUPABASE_ACCESS_TOKEN`/`SERVICE_ROLE_KEY`를 읽는 스크립트 **19개**(축4 M-7은 13개로 집계 — `crawl-test.js`·`migrate-moments-bucket.js`·`run-site-configs.js`·`seed-madleague-results.js`·`reset-and-reseed-dancingwhale.js`·`run-sql-print.js` 추가). `package.json` `deploy:dev`·`deploy:prod`가 가리키는 `scripts/deploy.js`는 존재하지 않음(부록 A 금지 명령이라 삭제가 맞음).
- 영향: 저장소 클론마다 25MB 바이너리 전파, 출처 불명 `.exe`가 리뷰 없이 실행될 수 있음(공급망), PAT 스크립트는 부록 D "사용 중단" 정책과 충돌, Linux(Vercel)에서는 `Scripts/`와 `scripts/`가 다른 경로라 `npm run site:check`가 `scripts/site-check.mjs`를 못 찾을 수 있음(현재 git에는 `Scripts/site-check.mjs`만 추적됨 — 확인 필요).
- 해결안: ① `git rm --cached Scripts/*.exe Scripts/__pycache__ Scripts/*.py` + `.gitignore`에 `*.exe`·`__pycache__/`·`Scripts/` 추가 ② PAT 스크립트 19개 중 유지할 것(`site-check.mjs`·`madzine-import.mjs`·`rook-import.mjs`·`madleague-programs-import.mjs` — SERVICE_ROLE은 `.env.local` 서버 키라 PAT와 성격이 다름)만 남기고 `run-sql*.js`·`seed-*.js`·`migrate-*.js`·`reseed-*.js`·`update-*.js`·`crawl-test.js`·`vercel-fix-env.js`·`test-hit-*.js` 삭제(git 이력에 남으므로 백업 불필요) ③ 디렉터리를 소문자 `scripts/`로 `git mv`(대소문자만 바꾸려면 임시 이름 경유) ④ `package.json` `deploy:*` 제거.
- 작업량: S · 확신도: 높음

### [H-2] 호출되지 않는 API 라우트 77개 + 보관 Tier 브랜드 API ~250개가 전부 살아 있음 (§0.1 원칙 5)
- 근거: `app/api/**/route.ts` 508개의 경로 문자열을 코드 전체에서 검색(라우트 파일 자신 제외) → 0건 **77개**. 그중 외부에서 부르는 정당한 예외: Vercel cron(`/api/myverse/cron/*` — `vercel.json`의 `/api/planners/cron/*`가 middleware 0a rewrite로 도달)·OAuth 콜백(`/api/integrations/google/callback`·`/api/auth/gmail/start`)·웹훅(`/api/myverse/billing/webhook`·`/api/integrations/slack/webhook`)·메일 링크(`/api/newsletter/unsubscribe`)·QR(`/api/certificates/verify`)·에이전트 런타임(`/api/agent/{invoke,run,publish,badaksoe}` — 열시일분/Edge가 호출 가능) ≈ 22개. **나머지 ~55개는 UI도 외부도 부르지 않는다**: `/api/uc/{earn,redeem,restore}`(UC 적립·사용·복원 — UI 소비자 0, 아래 확인 필요)·`/api/members/[id]`·`/api/points{,/[memberId],/leaderboard}`·`/api/partners{,/[id]}`·`/api/timesheets`·`/api/library`·`/api/contents`·`/api/events`·`/api/scan`·`/api/subscription/access`·`/api/approvals/[id]`·`/api/badak/{apply/admin,explore/people,explore/wants,members/search,posts/[postId]/comments,traces}`·`/api/madleague/admin/members`·`/api/hero/achievements/[id]`·`/api/hit/a/result/preview`·`/api/intra/wio/tenants`·`/api/gravity/{prescan/run,score/history,score/report}`·`/api/trendhunter/{collect,respond,stats}`·`/api/smarcomm/campaigns/finalize`·`/api/myverse/*` 19개(`ai/chat`·`chat`·`community*` 4·`daily/ai-summary`·`domains/activity`·`embeddings/generate`·`food`·`search`·`myverse-search`·`timeblocks`·`verse/on-this-day`·`vision`·`portfolio/[memberId]`·`projects/dashboard`·`public/projects/[token]`·`integrations/google/calendar/event`·`billing/{checkout,portal}`)·`/api/cron/{crawl,process,opportunity-crawl,opportunity-process,trend-crawl,vrief-am,vrief-pm}` 7개(`vercel.json`·pg_cron 어디에도 없음 — `trend-crawl`·`daily-vrief`는 Edge Function+pg_cron으로 대체됨)·**`/api/debug-env`**(인증 없이 `ANTH*`/`SUPA*` 환경변수 **이름 목록**과 존재 여부를 반환 — 값은 아니지만 정보 노출).
  보관 Tier(`ums_sites.tier IS NULL`) 브랜드 API 상위 디렉터리: `myverse` 148 · `smarcomm` 43 · `gravity` 15 · `trendhunter` 5 · `competitions` 4 · `certificates` 3 · `networking` 3 · `points` 3 · `projects` 3 · `montz` 2 · `partners` 2 · `opportunities` 2+1 · `subscription` 2 · `approvals` 2 · `jakka`·`mindle`·`timesheets`·`library`·`contents`·`events`·`scan`·`forms`·`ums` 각 1 → **약 250개**가 보관 브랜드 소속. `lib/api-access-policy.ts`(직원 전용 강제)에 등록되지 않은 보관 API는 축3 API 전수표의 인증 상태 그대로 공개된다.
- 영향: 공격 표면(원칙 5의 존재 이유). 미호출 라우트는 테스트도 안 되므로 축3에서 발견된 비인증 패턴이 조용히 남는다. `/api/debug-env`는 즉시 삭제 대상.
- 해결안: ① `/api/debug-env`·cron 7개·`uc/{earn,redeem,restore}` 확인 후 삭제(1커밋) ② 보관 브랜드 API는 **파일 삭제 대신 middleware 게이트**: `ums_sites.lifecycle='frozen'`인 브랜드의 `/api/{brand}/*`를 middleware가 404/직원 전용으로 막는 규칙 1개(축2 M-1 `next.config` 브랜드 목록 하드코딩과 같은 SSOT 문제를 만들지 않도록 `domain-registry`/`ums_sites`에서 파생) ③ 그 다음 세션에서 보관 브랜드별 파일 삭제(아래 "보관 Tier 브랜드별 끌 것"). 백업: git 이력.
- 작업량: S(①②) / M(③) · 확신도: 높음(목록) / 중간(외부 호출 예외 판별은 코드 기준이라 Edge Function·열시일분 스킬에서 부르는 경로는 못 봄)

### [H-3] DB 테이블 355개가 0행 — 코드 0·행 0 **91개 삭제 후보**, 코드 0·행 있음 18개, 코드 있음·쓰기 흔적 0 **199개**
- 근거: `pg_stat_user_tables` 499개 중 `n_live_tup=0` 355개. 분류:
  - **① 코드 0 + 행 0 (91개, 삭제 후보)** — 접두사별: `bg_*` 14(`bg_scores*`·`bg_situations*`·`bg_source_*` 등 BrandGravity 2세대 설계 잔재), `mkt_*` 10(SmarComm WIO MKT 설계만), `mail_*` 7(`mail_automations`·`mail_events`·`mail_quotas`·`mail_send_logs`·`mail_senders`·`mail_subscriptions`·`mail_usage_logs` — 축2 M-7의 `mail_subscriptions` 포함), `hr_*` 5·`fin_*` 4·`sys_*` 2·`wio_*` 5(ERP 설계만), `marvis_*` 4, `comm_*` 4, `mad_certificates`·`mad_submissions`·`mad_submission_comments`·`mad_competition_results`·`madleague_profiles`, `jakka_showcase_members`, `badak_match_scores`·`badak_visitor_logs`, `smarcomm_billing_history`·`smarcomm_profiles`·`smarcomm_scan_results`, `evolution_enrollments`·`evolution_profiles`, `post_attachments`·`post_bookmarks`·`post_likes`, `comments`·`approvals`·`expenses`·`timesheets`·`timesheet_weeks`·`organizations`·`org_members`·`surveys`·`survey_responses`·`votes`·`vote_responses`·`digests`·`audit_log`·`uc_monthly_tracking`·`member_role_history`·`member_visits`·`hero_business_inquiries`·`chat_messages`·`bums_member_access`·`bums_widgets`. (`approvals`·`expenses`·`chat_messages` 등 11개는 과거 쓰기 흔적 있음 — 시드 후 비움.) 느슨 grep에서 `comments`·`approvals`·`expenses`·`timesheets`·`organizations`는 일반 단어라 거짓 양성이 섞임 → 삭제 전 `.from('…')` 재확인.
  - **② 코드 0 + 행 있음 (18개, 보관/이전 판단)** — 옛 MADLeague 경쟁 PT 짝 `mad_competitions`(4)·`mad_competition_teams`(6)·`mad_round_{questions,answers,notices}`(1·1·2)·`mad_team_members`(1) → **`program_rounds`(4)·`program_teams`(6)·`program_{questions,answers,notices}`(1·1·2)·`program_participants`로 이전 완료**(세션 163, 코드 참조 0 확인 — 삭제 가능, 단 Program_Module §5 "배포 후 삭제" 결정 대기) · `badaksoe_rooms`(34, 마지막 쓰기 2026-05, 바당쇠 에이전트 폐기?) · `chat_threads`(5)·`chat_messages`(0) (듣봇 초기 — 현재는 `deutbot_logs` 2,047행) · `bums_sites`(6)·`bums_boards` VIEW (`ums_sites`로 대체, 축2 확인 필요와 동일) · `badak_fee_configs`(5)·`badak_level_criteria`(4)·`badak_leader_fee_summary` VIEW (바닥장 등급·수수료 — 코드 0, 설계만) · `hero_service_products`(6) · `mail_plan_defaults`(8) · `skill_history`(9) · `smarcomm_industry_benchmarks`(32) · `uc_redeem_policies`(4)·`uc_transfers`(5) (축4 H-4) · `tenone_staff_profiles`(3)은 `staff_profile:tenone_staff_profiles(...)` 조인 문법이라 **거짓 양성(유지)**.
  - **③ 코드 있음 + 행 0 + 누적 쓰기 0 (199개, 기능 미사용)** — `wio_*` **57**(`wio_*` 71개 중 80%: approvals·bd_projects·chat·courses·culture·documents·equipment·gpr·inventory·jobs·kpi·leads·orders·positions·projects·quotes·settlements·talk·timesheets·todos·workflow…), `myverse_*` 28, `jakka_*` 17(26개 중 — Jakka는 **26개 테이블 전부 0행**), `badak_*` 16(31개 중 28개 0행), `smarcomm_*` 8, `hero_*` 8, `crm_*` 6, `hit_*` 5, `mkt_*` 4, `mad_*` 4, `montz_*` 3, 기타 단일 테이블 40여 개(`bookings`·`guests`·`payments`·`payroll`·`partners`·`profiles`·`courses`·`enrollments`·`certificates`·`competitions`·`competition_teams`·`contents`·`attachments`·`bot_responses`·`privacy_deletion_requests`·`member_invites`·`member_points`·`point_logs`·`library_*`·`networking_*`·`shop_orders`·`analytics_snapshots`·`daily_stats`·`email_events`…). 이 중 `certificates`·`competitions`·`competition_teams`·`courses`·`enrollments`·`profiles`·알림 5종은 축2 M-6 참조.
  - 전체: 행 있는 테이블 144개뿐. 브랜드별 (테이블/행/코드0): badak 31/11/4 · bg 29/431/14 · jakka 26/0/1 · mad 21/44/10 · myverse 55/6,712/0 · smarcomm 20/541/4 · wio 71/1,533/5 · hero 18/14/2 · hit 18/2,622/0 · mindle 4/2,375/0 · mkt 15/0/10 · mail 9/8/8 · marvis 4/0/4 · comm 5/0/4 · fin 5/0/4 · hr 6/0/5.
- 영향: 0행이어도 GRANT·RLS 정책이 걸린 테이블은 PostgREST 노출 면이고(축3 H-3 `USING(true)` 류가 여기 섞여 있음), 백업·마이그레이션·`list_tables` 응답·인트라 "사이트 현황" 경고를 부풀린다. `mad_competitions` 짝은 이전 완료 후 남아 "4행 vs 4행"(축2 확인 필요)으로 혼동을 만든다.
- 해결안: ① `pg_dump --schema-only` + 행 있는 18개 `COPY TO` CSV로 `backups/2026-10/` 백업(저장소 밖) → ② ①군 91개 `DROP TABLE` 마이그레이션 1개(`sql/drop-dead-tables-2026-10.sql`, `apply_migration`으로 이력 남김) — 단 느슨 grep 양성 5개(`comments`·`approvals`·`expenses`·`timesheets`·`organizations`)와 트리거 달린 `brand_membership_applications`는 제외하고 별도 확인 ③ ②군은 사용자 결정(`mad_competition*` 7개 DROP = Program_Module §5 실행, `badaksoe_rooms`·`chat_*`·`bums_*` 보관 여부) ④ ③군은 브랜드 보관 처리와 묶어 WIO 57개부터 — WIO는 "판매용 제품"이라 설계 보존이 필요하면 **DDL만 `sql/wio-schema.sql`로 보관하고 DB에서는 DROP**(재생성은 파일 실행 1회).
- 작업량: M · 확신도: 높음(①·③ 목록) / 중간(②는 용도 판단 필요)

### [H-4] 집중 브랜드 실화면이 Mock 데이터 파일을 읽는다 — Badak 랜딩·Explore, 인트라 ERP 직원 등록
- 근거: `lib/*-data.ts` 20개 중 소비자가 있는 것: `lib/badak-cloud-data.ts`(391줄) ← `app/(Badak)/badak/page.tsx`·`badak/explore/page.tsx`·`app/api/badak/cloud/route.ts`·`features/badak/cloud/NeedDetailSheet.tsx` (DB `badak_needs` 0행·`badak_wants` 0행인데 화면은 Mock으로 채움) · `lib/staff-data.ts`(479줄) ← `app/intra/erp/hr/staff/register/page.tsx`·`staff/[id]/page.tsx`·`erp/page.tsx`·`intra/myverse/messenger/*` 3곳 (직원 정보 Mock — DB `tenone_staff_profiles` 3행과 별개) · `lib/workflow-data.ts`·`lib/smarcomm/workflow-data.ts`(같은 내용 2벌) ← `lib/workflow-context.tsx`·`app/intra/studio/workflow/*`·SmarComm 대시보드 14곳 · `lib/mindle/trend-data.ts` ← Mindle 페이지 4곳(DB `mindle_trends` 2,316행 있음에도) · `lib/smarcomm/{blog,dashboard,glossary,guide,scan}-data.ts` ← SmarComm 20곳 · `lib/crm-data.ts`·`gpr-data.ts`·`point-data.ts`·`marketing-data.ts`·`library-data.ts` ← 각 context(인트라 ERP·마케팅·포인트). 소비자 0: `lib/smarcomm/mock-data.ts`·`report-data.ts`(삭제).
- 영향: Badak(집중, 회원 9,000 재가입 예정)의 첫 화면이 가짜 "니즈·사람" 카드를 보여줌 — 오픈 전 DB 연결 필수. 인트라 ERP 직원 등록이 Mock이면 HR 기능이 실제로는 없다는 뜻(축4 ROADMAP "Intra 143p UI+DB 대부분 완성"과 어긋남).
- 해결안: 집중 브랜드(Badak·Mindle은 Whole See 공급원)부터 Mock → DB 교체, 인트라 ERP/마케팅/포인트 context는 WIO 모듈(§1.10 원칙 2)로 대체하거나 메뉴를 내린다. `workflow-data.ts` 2벌은 1벌로.
- 작업량: M · 확신도: 높음

### Medium

| ID | 내용 (근거 → 영향 → 해결) | 작업량 |
|---|---|---|
| M-1 | **참조 없는 DB 함수 12개 + 뷰 5개**: 트리거·RLS 정책·다른 함수·cron·뷰·코드 어디서도 안 부르는 함수 `badak_check_level_up`·`calc_spower_8d`·`score_uf`·`get_active_sources`·`get_raw_collected_data`·`hero_active_company_ids`·`hero_match_candidates_for_jh`(tih 버전만 코드 1곳)·`link_hit_session_to_member`·`mad_gen_cert_code`(→ `program_certificates`로 대체)·`myverse_cleanup_classification_jobs`·`myverse_expire_subscriptions`·**`set_brand_role`**(권한 부여 함수 — SECURITY DEFINER면 축3 범위, 확인 필요) · 뷰 `badak_leader_fee_summary`·`bums_boards`·`hit_a_results_safe`·`member_point_balances`·`member_points_summary` 코드 0(`hit_b_results_safe` 1곳·`posts`·`board_configs`·`site_configs`·`myverse_public_handles`는 사용 중). `sync_bookmark_count`·`sync_comment_count`·`sync_like_count`·`increment_post_view`는 트리거 없이 코드 문자열만 3~4곳(옛 `posts` 테이블용 — 축2 H-3과 같이 정리). 트리거 `trg_sync_legacy_on_role_change → sync_roles_to_legacy`는 "제거된 `members` 권한 컬럼"(§1.6)에 역동기화하는 잔재 — 축1 C-3과 함께 DROP → `DROP FUNCTION` 12 + `DROP VIEW` 5 마이그레이션(정의는 `pg_get_functiondef`로 sql 파일에 백업) | S |
| M-2 | **cron 이중 체계 잔재**: `app/api/cron/` 17개 중 `vercel.json` 등록 11개 + 미등록 7개(H-2) · pg_cron 4개 중 `trend-crawl-hourly`·`daily-vrief-morning`은 Edge Function(`trend-crawl`·`daily-vrief`)을 부르는데 **같은 일을 하는 `/api/cron/trend-crawl`·`/api/cron/daily-vrief`(Vercel cron 등록됨)**이 공존 — 하루 두 경로로 실행될 수 있음 · `supabase/functions/` 16 디렉터리 ↔ 배포 11(축4 M-1: `daily-analytics-sync`·`daily-gpr`·`mindle-metrics-compute`·`mindle-newsletter-draft` 미배포) → 경로당 1실행 주체 결정(Edge+pg_cron ⟷ Vercel cron), 진 쪽 삭제. `.claude/launch.json`·`vercel.json` crons 13개 중 `/api/planners/cron/*` 2개는 middleware rewrite 의존 — `/api/myverse/cron/*`로 직접 수정 | S |
| M-3 | **`sql/` 282개 파일 = 적용 이력 없는 스냅샷 더미**: "적용 완료/applied/적용일" 표기 16개뿐 · 개명 전 `planners-*` **53개** ↔ `myverse-*` 41개 공존(`myverse-rename-planners-to-myverse.sql` 이후에도 양쪽 유지) · 존재하지 않는 테이블을 CREATE하는 파일 6개(`board-tables.sql`·`step3-erp-tables.sql`·`step3a-fix-tables.sql`·`site-configs-table.sql`·`madleague_post_likes.sql`·`archive-seed-and-spam.sql` — `posts`·`site_configs`·`board_configs`는 이제 VIEW, `archive`·`mad_post_likes`는 DROP됨) · `drop-legacy-points`·`cleanup-unused-boards-2026-10-07`·`cron-cleanup-2026-10-07`·`remove-dummy-*` 등 1회성 정리 파일 · `debug-query.sql`·`check-master-data.sql`(조회용) · security/rls 계열 22개 중복 적용분 → Supabase `list_migrations` 이력이 SSOT가 되도록: 적용 완료·대체된 파일은 `sql/archive/2026-04~09/`로 이동(삭제 아님), 살아 있는 스키마는 모듈별 1파일(`sql/schema/{program,ums,uc,...}.sql`)로 재구성. 부록 D "파일 상단에 적용일 기록" 규칙을 `site-check`류 점검기로 강제 | M |
| M-4 | **`docs/` 64개 중 40개 미참조·2026-03~05 작성**: 루트 `CLAUDE.md`·`ROADMAP`·`WORK_STATUS`·`UX_GUIDE`·브랜드 CLAUDE.md·`.claude/` 어디서도 파일명이 언급되지 않는 문서 — `CURRENT_STATUS`·`PLANNING`·`PROJECT_STATUS`·`SITEMAP`·`DIRECTOR_COMMENTS`(03-22~04-01 초기 상태 문서 5), `WIO_BUILD_STATUS`·`WIO_Board_Guide`·`WIO_EUS_v1`·`WIO_EUS_v2`·`WIO_Enterprise_Unified_System`·`WIO_Glossary_v1`·`WIO_OrgDesign_v1`·`wio/SITE_DEV_GUIDE`(WIO 8 — `WIO_Master_Architecture`만 SSOT), `Myverse_BMC_v2`·`Myverse_Business_Plan_v1`·`Myverse_Dev_Guide_v2`·`Myverse_Landing_Dev_Guide_v1`·`Planners_Site_Content_v1`·`Planners_User_Mode_Research`(MyVerse/Planner's 6), `Intra_Restructure_Plan`·`Intra_Universe_Architecture`·`ACCESS_CONTROL_GUIDE`·`PERMISSION_POLICY`(인트라·권한 4 — §1.6 이전 모델), `TenOne_Agent_Architecture`(Agent_State가 대체)·`Bot_Strategy_쇠봇_듣봇`·`Messenger_Hub_Architecture`(10-05 신규인데 미참조), `TrendHunter_크롤러_기술설계서_v1`·`MINDLE_CRAWLER_INTEGRATION_SUMMARY`·`README_MINDLE_RSS_TEST`·`RSS_FEED_ANALYSIS`·`mindle-rss-*`(Mindle 크롤러 5), `BrandGravity_Service_Design`·`BrandGravity_Workflow`·`Badak_Explore_Vision`·`MADLeague_Site_Plan_v2`·`Orbi_Improvement_Plan`·`UX_AUDIT`·`email-templates`·`hit_api`·`hit-character-prompts`·`Worktree_Protocol`(§3.4가 워크트리 운영 폐기) · 바이너리 `TenOne_기획문서_IA_v1.docx`·`TenOne_Universe_Directory.html` → `docs/archive/`로 이동 + 루트 CLAUDE.md "문서 체계" 표에 살아 있는 문서만(축4 문서 정리 제안과 병행) | S |
| M-5 | **import 0 패키지 5개**: `@excalidraw/excalidraw`(^0.18, 번들 큼 — `next.config.ts`에 1회 언급뿐, `features/myverse/planner/CanvasEditor`는 자체 캔버스)·`lunar-javascript`(음력 — `planners-anniversaries` 시절)·`tailwind-merge`·`isomorphic-dompurify`(`dompurify` 직접 사용 3곳)·devDeps `docx`·`mammoth`(Scripts 어디서도 미사용, `next.config` serverExternalPackages 추정 언급 2) · `@tiptap/pm`은 tiptap peer 의존이라 유지 → `npm uninstall` 5개 + `next.config.ts` 외부 패키지 목록 정리 | S |
| M-6 | **import 0 코드 파일 80개(약 16,000줄)**: `lib/hit/data/*-questions.ts` 10개(≈4,800줄 — HIT 문항이 DB `hit_questions` 2,160행으로 이관된 뒤 잔재; `hero-types-full`·`hit-a-layer`·`hit-b-modules`·`type-matching`·`base-questions`·`b-deep-questions`는 사용 중) · `features/myverse/planner/*` 15 + `features/myverse/app/*` 8 (Planner's → MyVerse 흡수 때 남은 구 화면: `PlannersHomePage`·`PlannersChrome`·`TimeTrackerView` 865줄·`IndexView` 391줄·`TodayDashboard` 460줄…) · SmarComm 8(`Header`·`Footer`·`SmarCommSidebar`·`RightPanel`·`MediaChannelMatrix`·`PageActions`·`SmarCommPreviewGate`·`grading/thresholds`) · `components/` 11(`UniverseMembership.tsx` — §1.3 "레거시, 전 사이트 제거 완료"인데 파일 잔존 · `UnderConstruction.tsx` — 아래 L-1 · `ErpSidebar`·`MarketingSidebar`·`StudioSidebar`(인트라 구 사이드바 3벌) · `AppShell`·`BrandCard`·`ContactImportModal`·`LatestPostsWidget`·`StarfieldWrapper`·`UniverseBadge`) · Badak 4(`explore/MatchCard`·`explore/WantsCard`·`TagPicker`·`cloud/index`) · HIT 3 · Jakka/MoNTZ 구 Header·Footer 4 · `lib/sso.ts`·`lib/myverse-supabase.ts`(289줄 별도 supabase 클라이언트)·`lib/brand-meta.ts`(축2 L-4)·`lib/integrations/index.ts`·`lib/wio/*` 4·`lib/myverse/{capture/ocr,capture/stt,classification/ml-router,canvas-engine/index}` → `git rm` 1커밋(`npx tsc --noEmit`·`npm run build`로 검증; `index.ts` 배럴 2개는 디렉터리 import 가능성 재확인) | S |
| M-7 | **링크 0 페이지 21개**(메뉴·레지스트리·`href`·`router.push` 어디에도 경로 없음): 집중 — Badak `/badak/bacademy`·`/badak/meetups`·`/badak/shop`, HeRo `/hero/branding`·`/hero/career`·`/hero/for-business`, MADLeague `/madleague/arena` · 실험 — Jakka `/jakka/write`, MyVerse `app/personal/brand`·`app/settings/blocks`·`app/settings/integrations`·`/myverse/offline`·`/myverse/roadmap`, WIO `app/comm/mail`·`app/data/governance`·`app/system/module-mgmt`·`app/system/org-setup`·`/wio/e2e-flows`, SmarComm `/smarcomm/offline` · TenOne `/newsletter/confirmed`·`/unsubscribe/done`은 메일 링크 도착 페이지(정상) → 집중 브랜드 7개는 `lib/brand-site-menus.ts`에 넣거나 삭제(둘 중 하나 — 고아 페이지는 SEO·site-check 밖), 실험 브랜드는 보관 처리와 함께 삭제 | S |
| M-8 | **트리거 달린 0행 테이블·이름 불일치**: `brand_membership_applications`(0행, 코드 1곳 Action Hub entry만)에 `trg_approve_membership` · `myverse_*` 테이블 트리거 8개가 `planners_*` 이름(`planners_canvases_touch_trigger`…) · `marketing_campaigns`(0행)에 `smarcomm_campaign_complete_assetize` · `hit_{c,d,e,f}_results`(0행·쓰기 0)에 `sync_hero_profile_*` 6개 → 테이블 정리(H-3)와 함께 트리거 DROP, 이름은 `myverse_*`로 재생성 | S |

### Low

| ID | 내용 | 작업량 |
|---|---|---|
| L-1 | `components/UnderConstruction.tsx` 소비자 0 — 루트 `CLAUDE.md` §1.1 핵심 파일 표·§2.4 체크리스트("`UnderConstruction` 또는 전용 랜딩")·인트라 `standard/dev-rules` 페이지가 사용을 지시. 실제 브랜드 랜딩은 전부 전용 페이지. 삭제하고 문서 2곳 수정, 또는 보관 브랜드 공통 랜딩으로 되살려 쓰기(H-2 ③과 연결) | S |
| L-2 | `features/{brand}/{Brand}Footer.tsx` 래퍼 28개(축2 L-6) + Jakka·MoNTZ·SmarComm 구 Header/Footer 6개는 소비자 0(M-6 포함) — `UniverseFooter` 직접 호출로 축소 시 같이 삭제 | S |
| L-3 | `package.json` `deploy:dev`·`deploy:prod` → 없는 `scripts/deploy.js`(H-1) · `.claude/launch.json` 외 `scripts/vercel-fix-env.js`·`update-agent-profiles.js`·`seed-empty-tables.js`(0행 테이블 시드용)는 용도 종료 | S |
| L-4 | `supabase/functions/` 미배포 4개(축4 M-1)와 `sql/mindle-newsletter-draft-cron.sql`·`mindle-student-uc.sql`(ROADMAP 3-D 미배포 기능의 SQL)은 "배포 예정"인지 폐기인지 표기 없음 — 디렉터리에 `README`(상태) 또는 삭제 | S |

## 표: 삭제 후보 테이블 · 미사용 API · 미사용 파일 · 미사용 패키지

**① 삭제 후보 테이블(코드 0·행 0) 91개 — 접두사별**

| 군 | 개수 | 테이블 |
|---|---|---|
| bg_ | 14 | competitor_scores · pain_clusters · probe_runs · reports · score_snapshots · scores · scores_by_ai · scores_by_category · situation_sets · situations · source_analyses · source_independent · source_search · source_site_check |
| mkt_ | 10 | agencies · attribution · creatives · data_sources · journeys · media_plans · mmm_results · sentiment · settlements · strategies |
| mail_ | 7 | automations · events · quotas · send_logs · senders · subscriptions · usage_logs |
| hr_/fin_/sys_ | 11 | hr_attendance · hr_evaluations · hr_feedback · hr_job_postings · hr_org_units · fin_assets · fin_budgets · fin_contracts · fin_journals · sys_audit_logs · sys_workflows |
| wio_ | 5 | culture_scores · handover_checklists · hit_results · org_simulations · positions |
| mad_/madleague_ | 5 | mad_certificates · mad_submissions · mad_submission_comments · mad_competition_results · madleague_profiles |
| marvis_/comm_ | 8 | marvis_{connections,customers,drafts,orders} · comm_{conversations,documents,messages,notifications} |
| 브랜드 단일 | 9 | badak_match_scores · badak_visitor_logs · jakka_showcase_members · smarcomm_billing_history · smarcomm_profiles · smarcomm_scan_results · evolution_enrollments · evolution_profiles · hero_business_inquiries |
| 공용 | 22 | post_attachments · post_bookmarks · post_likes · comments · approvals · expenses · timesheets · timesheet_weeks · organizations · org_members · surveys · survey_responses · votes · vote_responses · digests · audit_log · uc_monthly_tracking · member_role_history · member_visits · chat_messages · bums_member_access · bums_widgets |

**② 코드 0·행 있음 18개(판단 필요)**: mad_competitions(4) · mad_competition_teams(6) · mad_round_questions(1) · mad_round_answers(1) · mad_round_notices(2) · mad_team_members(1) · badaksoe_rooms(34) · chat_threads(5) · bums_sites(6) · badak_fee_configs(5) · badak_level_criteria(4) · hero_service_products(6) · mail_plan_defaults(8) · skill_history(9) · smarcomm_industry_benchmarks(32) · uc_redeem_policies(4) · uc_transfers(5) · ~~tenone_staff_profiles(3)~~(거짓 양성, 유지)

**③ 코드 있음·행 0·쓰기 0 199개**: wio_ 57 · myverse_ 28 · jakka_ 17 · badak_ 16 · smarcomm_ 8 · hero_ 8 · crm_ 6 · hit_ 5 · mkt_ 4 · mad_ 4 · montz_ 3 · 기타 43 (전체 목록은 `pg_stat_user_tables WHERE n_live_tup=0 AND n_tup_ins=0`으로 재현)

**미사용 API 55개(외부 호출 예외 제외)**: H-2 본문 목록. **미사용 파일 80개**: M-6. **미사용 패키지 5개**: `@excalidraw/excalidraw` · `lunar-javascript` · `tailwind-merge` · `isomorphic-dompurify` · `docx`+`mammoth`(dev). **참조 없는 DB 함수 12·뷰 5**: M-1.

## 보관 Tier 브랜드별 끌 것 (`ums_sites.tier IS NULL`, 코어·집중 6개 제외)

| 브랜드 | 페이지 | API 라우트 | features 파일 | 테이블(행) | 비고 |
|---|---|---|---|---|---|
| MyVerse(+Planner's) | 77 | 148 (`/api/myverse`) + cron 2 | 153 (미사용 23) | 55 (6,712) | 실데이터 있음(contacts 6,064·canvases·daily) — **읽기 전용 전환 후 차단**, `lib/myverse-supabase.ts`·`features/myverse/planner` 구 화면 삭제 |
| WIO | 143 | `/api/intra/wio` 등 | 2 + `lib/wio` 7 | 71 (1,533 — 대부분 feature_flags·analytics) | 테이블 57개 쓰기 0 → DDL 파일로 보관 후 DROP(H-3 ④) |
| SmarComm | 49 | 43 + cron 2 | 35 (미사용 8) | 20 (541) | 외부 `C:\Projects\SmarComm` 별도 프로젝트와 이중 — Mock 데이터 5파일(H-4) |
| Jakka | 24 | 1 | 5 (구 Header/Footer 2) | 26 (**0**) | 테이블 전부 0행 → 페이지·테이블·트리거 11개 일괄 |
| BrandGravity | 5 | 15 (`/api/gravity`) | 2 | 29 (431) | 미사용 14 테이블 DROP, 결과 데이터(pain_sources 268 등) CSV 백업 |
| Mindle | 10 | 1 + cron(`all-crawl`·`all-process`·`newsletter-crawl`) + Edge 2 | 8 | 4 (2,375) | Whole See 공급원이라 **크롤러·Edge는 유지**, 사이트 페이지만 noindex/차단, `trend-data.ts` Mock 제거 |
| MoNTZ | 8 | 2 | 7 (구 Header/Footer 2) | 6 (0) | 전부 삭제 가능 |
| YouInOne · ChangeUp · Domo · FWN · Seoul360 · 0gamja · Townity · NatureBox · Mullaesian · NamingFactory · BrandGravity | 각 2~8 | 0~2 | 각 2 | 0~1 | 랜딩 1페이지 + layout만 남기고 하위 페이지 삭제(`UnderConstruction` 공통 랜딩 재사용, L-1) |
| Dokdae · Wiki(lifecycle active, tier NULL) | 1 · 9 | 0 · 2 | — | wiki_* 3 (29) | 내부 서비스 — 유지, 직원 전용 확인만 |
| LUKI · EvoSchool · trendhunter | 0 · 1 · 0 | 0 · 0 · 5 | 0 | evolution_* 2 (0) | 축4 H-3 — `siteConfigs`·`ums_sites` row·`/api/trendhunter` 5개·`(LUKI)` 디렉터리 정리 |
| 공용 모듈(브랜드 귀속 없음) | — | points 3 · partners 2 · timesheets · library · contents · events · scan · subscription 2 · networking 3 · opportunities 3 · projects 3 · approvals 2 · forms · competitions 4 · certificates 3 | — | 공용 0행 22(①) | WIO 흡수(§1.10 원칙 2) 또는 삭제 |

## 먼저 정리할 순서 (상위 5개)

1. **H-1 `Scripts/` 실행파일·`.pyc`·PAT 스크립트 제거 + `.gitignore`** — 1커밋, 되돌릴 것 없음(git 이력). `/api/debug-env`·cron 7개·`deploy:*`도 같은 커밋.
2. **H-2 ② 보관 브랜드 API 게이트** — middleware 규칙 1개로 ~250개 라우트의 공격 표면을 즉시 닫는다(파일 삭제는 그 뒤 천천히). `lifecycle='frozen'` SSOT 재사용.
3. **H-3 ① 91개 테이블 DROP**(백업 후) + **M-1 함수 12·뷰 5·M-8 트리거** — 마이그레이션 1개. `mad_competition*` 7개는 Program_Module §5 결정과 함께.
4. **H-4 Badak Mock 제거** — Badak 오픈 전 필수. `lib/badak-cloud-data.ts` → `badak_needs`/`badak_wants` DB 연결(또는 Explore 섹션을 오픈 범위에서 제외).
5. **M-6 미사용 파일 80개 + M-5 패키지 5개 삭제** — `tsc`·`build` 통과로 검증, 번들·설치 시간 절감. 이어서 M-3 `sql/archive`·M-4 `docs/archive` 이동.

## 확인 필요

- `/api/uc/{earn,redeem,restore}` — UI 소비자 0인데 §1.5가 핵심 API로 명시. 에이전트·외부 스킬(`tenone-agent`)이 부르는지, 아니면 `lib/supabase/uc.ts` 직접 호출로 대체됐는지. 후자면 삭제, 전자면 `api-access-policy` 등록.
- `/api/agent/{invoke,run,publish,badaksoe}` · `/api/cron/{vrief-am,vrief-pm,crawl,process,opportunity-*}` — Edge Function·열시일분 Chat 스킬·외부 스케줄러가 호출하는지(코드 밖이라 못 봄). `badaksoe_rooms`(34행)와 함께 바당쇠 에이전트 폐기 여부.
- `set_brand_role` 함수(참조 0) — SECURITY DEFINER로 `member_roles`에 쓰는지. 그렇다면 삭제가 축3 항목.
- `Scripts/`(대문자)만 git 추적 → Vercel(Linux)에서 `npm run site:check`(`scripts/site-check.mjs`) 동작 여부. 로컬은 대소문자 무시라 드러나지 않음.
- `mad_competitions`(4)·`program_rounds`(4) 같은 4건인지 — 행 내용 미조회. Program_Module §5 "배포 후 삭제" 시점 결정.
- `badak_fee_configs`·`badak_level_criteria`·`badak_leader_fee_summary`(바닥장 등급·수수료 설계)와 `hero_service_products`(6)·`uc_redeem_policies`(4)·`uc_transfers`(5) — 살릴 기능인지(살리면 코드가 없고, 버리면 DROP).
- `chat_threads`(5)·`chat_messages` vs `deutbot_logs`(2,047) — 듣봇 1세대 테이블 보관 가치.
- 느슨 grep에서만 잡힌 `comments`·`approvals`·`expenses`·`timesheets`·`organizations` — 일반 단어라 실제 `.from()` 호출 0인지 삭제 직전 재확인(엄격 패턴은 0).
- `@excalidraw/excalidraw`·`docx`·`mammoth` — `next.config.ts` 언급이 `serverExternalPackages`/`transpilePackages`인지. 동적 `import()` 문자열 조립이면 grep에 안 잡힘.
- MyVerse 실데이터(contacts 6,064·canvases·daily·weekly) 소유자가 운영자 1인(`myverse_users` 1행)인지 — 1인이면 "서비스 종료 절차" ①·④ 생략 가능.

## 점검 범위·한계

- 코드 참조는 문자열 grep 기준: `.from('t')`·`rpc('f')`·`"public.t"`·`table: 't'` 엄격 패턴 + 단어 단위 느슨 패턴. 변수로 조립한 테이블명(`.from(tableName)`), Supabase REST 직접 URL, Edge Function 내부 SQL(`supabase/functions` SQL 문자열은 0건 매칭 — 전부 supabase-js `.from()` 사용으로 보임)은 엄격 패턴에만 의존.
- API "미호출"은 코드 안의 경로 문자열 기준 — 템플릿 리터럴 조립(`/api/forms/${…}`·`/api/integrations/${…}` 2종만 발견), 외부 스케줄러·Chat 스킬·브라우저 북마크 호출은 보이지 않음. `vercel.json` cron·OAuth·웹훅·메일 링크는 예외로 분류했음.
- "링크 0 페이지"는 정적 경로만(동적 `[id]` 제외), `href`/`push`/레지스트리 문자열 기준. 브랜드 루트·subdomain prefix 제거 경로도 함께 검색했으나 외부 메일·QR 진입 페이지는 거짓 양성 가능.
- import 0 파일은 `/{basename}'|"` 패턴 — 같은 basename이 다른 디렉터리에 있으면 거짓 음성(살아 있다고 오판) 가능, 즉 실제 미사용은 80개보다 많을 수 있다. `app/` 하위 비페이지 파일(`*-data.ts`·컴포넌트)은 범위 밖.
- DB는 `pg_stat_user_tables`(통계 리셋 이후 누적 — 프로젝트 생성 후 리셋된 적 없어 보임: `collected_data` 933k 쓰기)·`pg_proc`·`pg_trigger`·`pg_views`·`pg_policies`·`cron.job` 조회만. 테이블 크기(bytes)·인덱스·GRANT·RLS는 축1·3 범위. Storage 버킷·Auth 설정·Vault는 보지 않음.
- `docs/` 참조 여부는 파일명 문자열이 루트 md·브랜드 CLAUDE.md·`.claude/`에 있는지만 — Chat 스킬(`tenone-*`)이 G드라이브 경로로 참조하는 문서는 알 수 없음.
- 실험·보관 브랜드 21개는 페이지·API·테이블 개수만 집계, 페이지 내용은 읽지 않았다. 집중 브랜드도 Mock 사용(H-4) 외 페이지 로직은 미검토.
- 라인 수·개수는 2026-10-08 `claude/work-start-eb5675` 워크트리 기준(`336e4a03` 이후 미커밋 변경 없음).
