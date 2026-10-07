# 축 4 — 문서 ↔ 실제 불일치 (2026-10-08, Fable)

> 범위: 루트 `CLAUDE.md` 전체 · `app/(*)/CLAUDE.md` 27개 · `docs/Data_Lifecycle.md` · `docs/Program_Module.md` · `docs/Universe_Coin_Policy.md` · `docs/TenOne_Agent_State.md` · `UX_GUIDE.md` · `WORK_STATUS.md`(세션 163) · `ROADMAP.md`.
> 방법: 문서의 파일 경로 604건 존재 확인(스크립트) · 테이블·컬럼·함수는 운영 DB `information_schema`/`pg_proc` 조회(SELECT만, 회원 값 미조회) · 규칙은 코드 grep. 축 1~3에서 이미 다룬 항목은 "축N X-n 참조"로만.

## 요약

- 코드·DB 대비 **루트 CLAUDE.md의 핵심 규칙은 대체로 맞다**(공통 컴포넌트·api-guard·capability 9종·Edge Function 11·pg_cron 4·program_* 11개 테이블·Program_Module 설계 ↔ DB 일치). 틀린 곳은 **"오래된 문장이 새 규칙 옆에 그대로 남은 것"**에 몰려 있다 — 같은 파일 안에서 `affiliations` 사용 지시와 금지, email 조인 키 지시와 데이터 계약 1조가 공존한다.
- 브랜드 CLAUDE.md는 **집중 브랜드(MADLeague·RooK·HeRo 일부)는 최신**, Badak·MADLeap·TenOne과 실험 브랜드 11개는 2026-05 이전 템플릿 그대로다 — 없는 페이지·없는 컬럼·폐기된 권한 모델(`member_roles` leader/admin)·틀린 UC 단가를 "현재"로 적고 있다.
- UC는 문서(루트·정책·브랜드)·DB·코드가 **4벌**로 갈라졌다: 테이블명 `uc_rules`(없음), `service_onboard`·`write_portfolio`·`write_story`(DB에 없음), Badak `join_group` 50UC(DB 5,000), `uc_redeem_policies`(DB에 있으나 문서·코드 미사용).
- **심각도별 개수**: Critical 1 · High 7 · Medium 13 · Low 8 (총 29)

## 발견 사항

### [C-1] 루트 §1.4 체크리스트가 "서비스 테이블의 `email` 컬럼 = members 조인 키"를 지시 — 데이터 계약 1조와 정반대
- 문서: `CLAUDE.md:588` "서비스별 테이블에 `email` 컬럼 있는가? (members 조인 키)" · `CLAUDE.md:589` "`get{Service}Profile()` 함수 추가" · `app/(Badak)/CLAUDE.md:39` "`getBadakProfile(email: string)`" · `app/(HeRo)/CLAUDE.md:74` "회원 = `affiliations @> ['hero']`"
- 실제: `CLAUDE.md` §0.1 데이터 계약 1조 "유일한 열쇠는 `members.id` … 이메일은 연결 키로 쓰지 않는다". 코드 `lib/supabase/universe-profile.ts:104,127` `getBadakProfile(email)`·`getHeroProfile(email)`은 아직 email 키(축1 H-2 참조)이고, `career_profiles`·`badak_profiles`는 `email` 컬럼이 없다(DB: `career_profiles.member_id`, `badak_profiles.id`). 새 브랜드가 이 체크리스트를 따르면 email 컬럼을 또 만든다.
- 판단 제안: **문서 수정** — §1.4 체크리스트를 "`member_id`(→members.id) FK 있는가 / 계정 정보 복사 컬럼 없는가"로 교체, `get{Service}Profile(memberId)` 시그니처로. Badak·HeRo 문장도 같이. 코드 쪽은 축1 H-2.
- 작업량: S

### [H-1] 루트 문서 안에서 `members.affiliations[]` 사용 지시와 금지가 공존
- 문서: `CLAUDE.md:432` "`members.affiliations[]`로 이용 중인 서비스 목록 관리" · `:558` "`affiliations[]` → 이용 중인 브랜드 목록 **계속 관리**" · §1.9.2 "Work Space … `user.affiliations[]`에서 자동 매칭" · `app/(TenOne)/CLAUDE.md:219` "`affiliations[]` — 참여 중인 브랜드 목록" ↔ `CLAUDE.md` §1.9.5 "❌ 브랜드 회원 수를 `members.affiliations`로 세기 → `member_brand_joins`(헌법 원칙 1)" · §0.1 실행 장치 "브랜드 가입·동의 = `member_brand_joins`"
- 실제: 코드 17개 파일이 affiliations를 읽고/쓴다(축1 H-1 참조 — 인트라 7곳·Badak API·`UniverseUtilityBar`). DB `member_brand_joins` 10행.
- 판단 제안: **문서 수정 + 사용자 결정** — affiliations의 남은 용도를 "UI 캐시(표시용)"로 한정할지 완전 폐기할지 정한 뒤 §1.3·§1.3.1·§1.9.2·TenOne 문장을 한 번에 고친다. 결정 전까지 Claude는 두 지시 중 하나를 임의로 고른다.
- 작업량: S (문서) / M (코드, 축1)

### [H-2] Badak·MADLeap CLAUDE.md가 활동 역할(leader·admin·approved_member)을 `member_roles(context='brand:badak')`에 두라고 지시 — §1.6 금지 사항이며 context 형식도 틀림
- 문서: `app/(Badak)/CLAUDE.md:47-49,118` "`leader`·`admin` (context: `brand:badak`)", "`member_roles.role='leader'` + `context='brand:badak'` 검증" · `app/(MADLeap)/CLAUDE.md:21,33-34` "member, approved_member, leader, admin / context `brand:madleap`"
- 실제: `CLAUDE.md` §1.6 "❌ 회원 활동 역할(멘토·현역·바닥장·구독자)을 member_roles에 넣지 않는다 → `member_capability_roles`". DB `member_roles` 활성 조합: 브랜드 관리는 `role='badak', context='brand'`(role=slug, context='brand') — `brand:badak` 형식 행은 0건, `leader`/`admin` role 0건. MADLeague 문서(`app/(MADLeague)/CLAUDE.md:43-56`)는 이미 capability 기준으로 고쳐져 있어 브랜드 문서끼리도 모순. 코드의 Badak 자체 권한 컬럼은 축1 C-2.
- 판단 제안: **문서 수정** — MADLeague 문서 "권한 체계" 표를 Badak(`meetup` owner/participant)·MADLeap(`club`)에 맞게 복제. 리더 판단 = `member_capability_roles(meetup, badak, owner)`.
- 작업량: S

### [H-3] 브랜드 그룹 4곳에 `layout.tsx`가 없고 LUKI는 페이지 0개 — 루트 "모든 브랜드 레이아웃 필수 패턴"·ROADMAP "[x] 22개 layout"·브랜드 핵심 파일 표와 전부 어긋남
- 문서: `CLAUDE.md:282` "모든 브랜드 레이아웃 필수 패턴(generateMetadata + getSiteConfigServer)" · `ROADMAP.md:262` "[x] 22개 브랜드 `layout.tsx` → generateMetadata()" · `app/(LUKI)/CLAUDE.md:58-63` 핵심 파일 6개 · `app/(EvoSchool)/CLAUDE.md:55-60` 6개 · `app/(NamingFactory)/CLAUDE.md:52-56` · `app/(wiki)/CLAUDE.md:49-53`
- 실제: `app/(EvoSchool)`·`app/(LUKI)`·`app/(NamingFactory)`·`app/(wiki)`에 `layout.tsx` 없음. `app/(LUKI)`는 CLAUDE.md만 있고 라우트 0개(그런데 `lib/site-config.ts` `luki` 설정·`CLAUDE.md:250` 도메인 표 `/luki`는 존재). EvoSchool은 `evschool/page.tsx` 1개, NamingFactory는 `page.tsx`+`my`뿐. 실험 브랜드 11개의 핵심 파일 표가 없는 페이지를 나열(아래 "없는 경로" 표).
- 판단 제안: **사용자 결정** — LUKI·EvoSchool·NamingFactory는 §0.1 Tier "보관"이면 라우트·siteConfigs·CLAUDE.md를 종료 절차 ⑤~⑦로 정리(문서를 "보관 — 페이지 없음" 한 줄로), 유지면 layout 추가. wiki는 내부 도구라 layout만 추가. `site-check`에 "브랜드 그룹 layout 존재"가 이미 있으므로 `--all`로 드러난다.
- 작업량: S (문서) / M (코드)

### [H-4] UC 문서 4벌이 서로 다르고 DB와도 다름 — 테이블명·액션 키·단가·사용 정책
- 문서: `CLAUDE.md:615` 테이블 "`uc_rules`" · `docs/Universe_Coin_Policy.md:43,45` `service_onboard` 500 / 온보딩 최대 6,500 · `app/(Badak)/CLAUDE.md:57-58` `join_group` "월 5회, 50 UC" · `write_story` · `app/(MADLeague)/CLAUDE.md:62-64` `service_onboard`·`submit_story`(madleague)·`write_portfolio` · `app/(MADLeap)/CLAUDE.md:40-42` 동일
- 실제: DB 테이블은 `uc_earn_rules`(코드 10개 파일이 이 이름) — `uc_rules` 없음. `uc_earn_rules` 활성 행에 `service_onboard`·`write_story`·`write_portfolio` 없음, `submit_story`는 badak만, `join_group`은 badak 5,000 UC/월 1회. 온보딩 실제 최대 6,000. 사용 정책은 DB `uc_redeem_policies`(4행, `max_discount_pct`·`scope`)가 있으나 `lib/supabase/uc.ts:141`은 `paymentAmount * 0.1` 하드코딩 — 문서 어디에도 `uc_redeem_policies`가 없고(ROADMAP:369 학생 50% 시드만) `is_student_email()` 함수는 DB에 없음.
- 판단 제안: **문서 수정 + 코드 결정** — ① `CLAUDE.md:615` → `uc_earn_rules`·`uc_redeem_policies`. ② 브랜드 CLAUDE.md "UC 정책 특이사항"은 DB `uc_earn_rules WHERE brand_id=…`를 옮겨 적지 말고 "인트라 UC 정책 화면 참조"로 줄인다(값 복제 금지). ③ `redeemUC`가 `uc_redeem_policies`를 읽게 할지(학생 할인 정책 살림) 테이블을 지울지 결정.
- 작업량: S (문서) / S (코드)

### [H-5] MADLeap CLAUDE.md "Phase Public · is_open=true(외부 공개)" — DB는 닫힌 외부 서버 스테이징
- 문서: `app/(MADLeap)/CLAUDE.md:69-72` "Public … is_open=true 토글", "**is_open** true (외부 공개)"
- 실제: DB `ums_sites.madleap` = tier focus · hosting **external** · **is_open=false**; `lib/domain-registry.ts:104` external; `CLAUDE.md` §0.1 "MADLeap 외부 nginx · 학생 회원 ~200 · Vercel 새로 제작(이전 없음)" · 원칙 6 "외부 운영 중 브랜드의 Vercel 버전은 비공개". 문서대로 "복구"하면 원칙 6 위반(같은 브랜드 두 곳 공개 + 학생 회원 혼선).
- 판단 제안: **문서 수정** — 현재 상태를 "비공개 스테이징(external, is_open=false) · DNS 전환 체크리스트 §2.5 대기"로, 세션 151·152 기록은 CHANGELOG로 이동. Badak(`app/(Badak)/CLAUDE.md:141` "Beta")도 같은 문장으로.
- 작업량: S

### [H-6] ROADMAP "tenant_id 일괄 추가 ✅ 완료 — 누락 2개뿐" vs 실제 76개 테이블에 brand/tenant/site 컬럼 없음
- 문서: `ROADMAP.md:275-284` "0-A ✅ 완료 … 누락 테이블 2개(`capabilities`, `wio_tenants`) 모두 불필요" · `CLAUDE.md` §1.10 원칙 6 "모든 테이블에 brand_id 또는 tenant_id" · §1.10 체크리스트
- 실제: public 499개 중 **76개**(15%)에 `brand_id`·`tenant_id`·`site_id`·`site`·`brand` 중 어느 컬럼도 없음 — `myverse_*` 45 · `smarcomm_scan*`·`smarcomm_*` 8 · `marvis_*` 4 · `hero_achievements`·`hero_coaching_sessions`·`hero_reflections` · `madleap_portfolios`·`madleap_study_programs` · `mindle_personas`·`mindle_trend_metrics` · `capabilities`·`wio_tenants`(의도적). 집중 브랜드 소속 5개(hero 3·madleap 2)는 원칙 6 위반.
- 판단 제안: **문서 수정 + 코드** — ROADMAP 0-A를 "[ ] 집중 브랜드 5개 테이블 brand_id 추가, 실험 브랜드 71개는 Tier 결정 시"로 되돌리고, 원칙 6에 "예외: 전역 레지스트리(capabilities)·테넌트 자체(wio_tenants)" 명시. `site:check`에 "브랜드 접두 테이블의 brand_id 존재" 항목 추가 검토.
- 작업량: S (문서) / M (코드)

### [H-7] 접근 모델·capability가 문서 3곳에서 서로 다름 — 루트 §1.4 표 · DB `brand_capabilities` · 브랜드 CLAUDE.md
- 문서: `CLAUDE.md:569-571` 오픈(Mindle·MyVerse·RooK…)/구독(BrandGravity·SmarComm·WIO)/구매(HeRo·Planner's·ChangeUp·NatureBox·Badak) · `app/(HeRo)/CLAUDE.md:66` "capability 4종 community·course·**subscription**·purchase" · `:75-77` role `purchaser`·`subscriber`·`coach` · `:82` "`hero_company_members` **신설 필요**" · `app/(Badak)/CLAUDE.md:19` "오픈 + 멤버십"
- 실제: DB `brand_capabilities` hero = community/course/**portfolio**/purchase(subscription 없음) · badak = community/course/meetup/purchase(membership 없음) · mindle·myverse·wio·smarcomm·brandgravity = subscription · `capabilities.built_in_roles`에 `purchaser`·`coach`·`representative`·`hiring_manager` 없음(purchase는 `buyer`). `hero_company_members` 테이블은 **존재**. `member_capability_roles` 실행은 3행(club/멘토·community/member·portfolio/creator)뿐. §1.6.1 "❌ brand_capabilities에 없는 capability로 role INSERT" 규칙을 문서 자신이 어긴다. 코드 복제본은 축2 M-8.
- 판단 제안: **문서 수정** — §1.4 표의 브랜드 열을 지우고 "SSOT = DB `brand_capabilities`(인트라 Standard › capabilities)"로. HeRo 문서는 역할명을 `built_in_roles`로 맞추거나 `capabilities.built_in_roles`에 추가(레시피 6)한 뒤 적는다.
- 작업량: S

### Medium

| ID | 문서 ↔ 실제 | 판단 제안 | 작업량 |
|---|---|---|---|
| M-1 | **Agent_State v2.5 낡음**(루트 `CLAUDE.md:61`가 "실측 SSOT"라 지목): "28개"(`:15,28`) ↔ DB `agent_profiles` **26**(openclaw·gemma 없음 — `CLAUDE.md:58` 폐기 기록과 일치, Agent_State만 stale) · pg_cron 4번째 `daily-briefing-1001`(`:112`) ↔ 실제 `mindle-weak-signal-daily` · "vercel.json crons 15개"(`:114`) ↔ 13개 · "`/api/cron/daily-gpr` 404 라우트 미구현"(`:133`) ↔ `app/api/cron/daily-gpr/route.ts` 존재 · `supabase/functions` 16개 ↔ 배포 11개(미배포 `daily-analytics-sync`·`daily-gpr`·`mindle-metrics-compute`·`mindle-newsletter-draft`) | 문서 수정 — v2.6으로 재실측(숫자는 인트라 Standard › 외부 리소스 화면이 이미 11·4를 표시하므로 문서는 링크로) | S |
| M-2 | **ROADMAP 자기모순**: `ROADMAP.md:201-203` 현재 상태 요약 "site_configs 연동 필요 · 구독 인프라 ❌ 미생성 · Agent Hub Prod DB 실행 필요" ↔ 같은 파일 ③·2-A·1-D "✅ 완료"(DB `wio_subscription_plans` 15행·`agent_profiles` 26). "🚨 즉시(이번 주)" 섹션(4월)·`/intra/bums/sites`(`:261`, 경로 없음 → `/intra/ums/sites`) 잔존. 3-D `[x] mindle-newsletter-draft 신설`·`[x] is_student_email()`은 코드만 있고 미배포·DB 함수 없음 | 문서 수정 — 요약 표 삭제(부록 F와 중복), 완료 섹션은 CHANGELOG로 | S |
| M-3 | **Data_Lifecycle 낡음**: `:20-22` "focus 4개(rook 없음) · frozen 22" ↔ DB focus 5(rook 포함)·frozen 21 · `:81` "mad_members `email`·`user_id` 키 → member_id 전환 필요" ↔ DB `mad_members`에 `email` 없음·`member_id` 있음(2026-10-07 DROP, `app/(MADLeague)/CLAUDE.md:36`) · 3.3 "`badak_*` 29개" ↔ 축1 M-8 "21개" · `process_brand_withdrawal` 미존재는 문서가 "자동화 시점 전"이라 명시(정상) | 문서 수정 — 1장 "현재" 블록은 DB에서 읽으라는 한 줄로 교체, 3.2 mad_members 행 갱신 | S |
| M-4 | **`jakka_profiles` 없음**: `CLAUDE.md:583` 특화 테이블 표 · `app/intra/ums/standard/members/page.tsx:13` 같은 문구 ↔ DB 없음(Jakka는 `jakka_creators` 8곳 사용). `universe-profile.ts`에 `getJakkaProfile` 없음 | 문서 수정 — 표에서 삭제 또는 `jakka_creators`(실험 Tier라 표 자체를 "집중 브랜드만"으로 축소) | S |
| M-5 | **TenOne CLAUDE.md 인트라 경로 4개 없음**: `:115` `/intra/erp/people`(실제 `/intra/erp/hr`) · `:121,147` `/intra/studio/sites`(실제 `/intra/ums/sites`) · `:122` `/intra/studio/wio`(`/intra/ums/wio`) · `:123,159` `/intra/studio/agents`(`/intra/agent`) · `:103` "26개 브랜드별 UMS 패널"·`:169` "28+ 브랜드" 숫자 혼재 | 문서 수정 — "인트라 관리 경로" 표를 `lib/intra-nav.ts` 링크로 대체 | S |
| M-6 | **`site-branding` 버킷 없음**(축3 M-3 참조) — 루트 `CLAUDE.md:916,1887` · `app/(TenOne)/CLAUDE.md:149` · 인트라 Standard 페이지 3곳(`standard/external`·`standard/sites`·`external/dev-env`)이 존재한다고 기술. DB 버킷은 `brand-assets`·`board-assets` 등 11개 | 사용자 결정(버킷 생성 vs `brand-assets`로 통일) 후 문서 5곳 일괄 수정 | S |
| M-7 | **부록 D 낡음**: `CLAUDE.md:1731` "GRANT 마이그레이션 → 2026-10-30 이전 1회 실행 필요" ↔ `sql/grant-public-tables-migration.sql:2` "✅ 2026-10-04 적용 완료"(ROADMAP도 [x]) · 그 파일 `:7` "실행 방식: `scripts/run-sql.js`"(폐기 스크립트) · `CLAUDE.md:1705` "PAT 스크립트 사용 중단" ↔ `scripts/`에 `SUPABASE_ACCESS_TOKEN` 읽는 스크립트 **13개** 잔존(`run-sql*.js`·`seed-*.js`·`migrate-*.js`·`reseed-madleague.js`·`update-email-templates.js`) | 문서 수정 + 스크립트 삭제(사용자 승인) — 브랜드 문서의 `Scripts/*.mjs`(대문자) 표기도 `scripts/`로 | S |
| M-8 | **루트 숫자·상태 낡음**: `:35` "AI Agent 6개 에이전트" ↔ 26 · `:237` "29개" 28행 + `/luki` pathSiteMap 없음(축2 M-2) · 부록 F `:1763-1764` "구독 인프라 미구현 · Agent Hub Prod DB 실행 필요" ↔ 둘 다 운영 중 · `:1768-1769` G드라이브 문서 2개 참조(저장소 밖) | 문서 수정 — 부록 F 삭제(WORK_STATUS와 중복), §0 표 숫자 제거 | S |
| M-9 | **`CAPABILITY_LABELS` 상수 없음**(축2 M-3 참조): `CLAUDE.md:756,783` 레시피 4·6 + 인트라 `standard/capabilities/page.tsx:144` 같은 지시 ↔ 코드엔 `CapabilitySection.tsx`·`UniverseProfile.tsx` 인라인 2벌(라벨도 DB `name_ko`와 다름: 밋업/클럽/코스 vs 모임/동아리/강의) | 코드 수정(`lib/capabilities.ts` 생성) 후 문서 그대로 | S |
| M-10 | **실험 브랜드 CLAUDE.md 11개가 템플릿 그대로** — 핵심 파일 표에 없는 페이지 32개(아래 표), 접근 모델·권한도 §1.6 이전 모델. 2026-05 이후 갱신 없음(§2.3 자동 갱신 규칙이 해당 브랜드 미편집이라 작동 안 함) | 문서 수정 — 실험·보관 브랜드 CLAUDE.md는 "정체성 · Tier/상태(DB) · 존재하는 파일" 20줄 이내로 축소 | S |
| M-11 | **Badak CLAUDE.md 세부 오류**: `:38` `badak_profiles.is_recruiter` 컬럼 없음(DB 17컬럼에 없음, 코드 참조 0) · `:50,98` "9개 관리 패널(추가 2개 TBD)" ↔ `app/intra/ums/badak/` 8개 디렉터리(`needs-queue` 미기재) · `:127` "스팸 방지 DB 트리거(1시간 5개)" 근거 미확인 · `:146-161` 외부 서버 이전 계획은 §0.1 "이전 없음"(2026-10-05 확정)과 같은 날짜인데 "원하는 사람만 옮긴다"로 다름 | 문서 수정 — 이전 계획 절은 §0.1과 하나로(회원 데이터 복사 없음·재가입 안내만) | S |
| M-12 | **§2.4 ↔ §1.9.5 사이드바 지시 충돌**: `CLAUDE.md:1377` "`lib/intra-nav.ts` 사이드바 브랜드 목록에 추가(알파벳순)" ↔ §1.9.5 "❌ intra-nav.ts에서 브랜드를 집중/보관 섹션 사이로 손으로 옮기기(tier는 DB)". 코드는 `regroupBrandSections()`가 DB tier로 재배치하므로 "추가"는 여전히 수동 — 둘 다 맞지만 §2.4에 "섹션은 DB tier가 정함" 보강 필요 | 문서 수정 | S |
| M-13 | **Program_Module·WORK_STATUS "Scripts/" · 설계 ↔ DB**: Program_Module §2 표와 DB `program_*` 11개 테이블 일치(양호). 단 `Program_Module.md:83` `consent-text.ts`·`:115` `ProgramTheme.ts`는 디렉터리 없이 파일명만(`lib/programs/consent-text.ts`·`features/programs/ProgramTheme.ts`) · §5 "옛 mad_* 삭제는 배포 후" ↔ `mad_competitions`·`mad_certificates` DB 잔존(의도, WORK_STATUS 2번) · HeRo `/hero/programs` 헤더 진입점 미정(사용자 결정 대기 — 정상) | 문서 수정(경로 보완) | S |

### Low

| ID | 내용 | 작업량 |
|---|---|---|
| L-1 | `app/(wiki)/CLAUDE.md:49-53` 경로가 `app/(Wiki)/…`(대문자) — 실제 디렉터리 `app/(wiki)`. Linux(Vercel)에서는 다른 경로 | S |
| L-2 | `CLAUDE.md:1554` "다음 할 일" 예시의 `components/ScanPage.tsx` 없음 — 예시지만 실존 파일로 바꾸면 혼동 제거 | S |
| L-3 | Myverse `features/myverse/MyverseSidebar.tsx`(`:323`)·`app/LaneSubNav.tsx`(`:136`)·`planner/TimeBlockTimeline.tsx`(`:256`) 없음 · WIO `components/WIOLayout.tsx`·`WIOTable.tsx`(`:100-101`) 없음 · SmarComm `lib/smarcomm/brand-personality.ts`(`:985`, "신규 호출 금지" 대상이 이미 삭제됨) | S |
| L-4 | `app/(MADLeague)/CLAUDE.md:102,104`·`app/(RooK)/CLAUDE.md:323`·WORK_STATUS `Scripts/…mjs` — 실제 `scripts/` | S |
| L-5 | `docs/Universe_Coin_Policy.md:45,139` "온보딩 최대 6,500" ↔ DB 6,000(`service_onboard` 없음) — H-4에 포함, 숫자만 별도 | S |
| L-6 | `app/(HeRo)/CLAUDE.md:500` "Phase P3 완료(2026-04-24 세션 83)"가 맨 위 — 세션 158·163 변경이 표 중간에 끼어 시간순 아님 | S |
| L-7 | `UX_GUIDE.md` — 코드 대조 불일치 없음. 부록 B "추가 예정(실제 구현 후 채울 것)"이 2026-05 이후 비어 있음 | S |
| L-8 | `CLAUDE.md` §1.9.2 Workspace 레지스트리 예시 `planners → /planners/app` — 실제 `WORKSPACE_REGISTRY`에 planners 없음(MyVerse 흡수). smarcomm `/dashboard`는 `app/(SmarComm)/smarcomm/dashboard` — 서브도메인 prefix 분기에서만 동작(확인 필요) | S |

### 없는 경로 — 문서가 존재한다고 적은 파일 (총 604 참조 중)

| 문서 | 줄 | 없는 경로 | 비고 |
|---|---|---|---|
| `app/(LUKI)/CLAUDE.md` | 58-63 | `layout.tsx` · `luki/page.tsx` · `members` · `music` · `content` · `fanclub` | 라우트 0개 (H-3) |
| `app/(EvoSchool)/CLAUDE.md` | 55-60 | `layout.tsx` · `courses` · `courses/[id]` · `learning-path` · `certificates` | `evschool/page.tsx`만 존재 |
| `app/(NamingFactory)/CLAUDE.md` | 52-56 | `layout.tsx` · `tool` · `portfolio` · `consult` | |
| `app/(wiki)/CLAUDE.md` | 49-53 | `(Wiki)/layout.tsx` · `wiki/docs` · `wiki/[slug]` | 대소문자 L-1 |
| `app/(Townity)/CLAUDE.md` | 54-57 | `about` · `town` · `together` · `stories` | |
| `app/(NatureBox)/CLAUDE.md` | 51-54 | `about` · `products` · `jeongseon` · `visit` | |
| `app/(Mullaesian)/CLAUDE.md` | 53-55 | `tour` · `gallery` · `commune` | |
| `app/(FWN)/CLAUDE.md` | 51-53 | `category/[city]` · `models` · `brands` | |
| `app/(BrandGravity)/CLAUDE.md` | 55-56 | `portfolio` · `about` | |
| `app/(YouInOne)/CLAUDE.md` | 54-55 | `projects` · `projects/[id]` | |
| `app/(Dokdae)/CLAUDE.md` | 51 | `dokdae/agent/[id]/page.tsx` | |
| `app/(Myverse)/CLAUDE.md` | 136, 256, 323 | `LaneSubNav.tsx` · `TimeBlockTimeline.tsx` · `MyverseSidebar.tsx` | L-3 |
| `app/(WIO)/CLAUDE.md` | 100-101 | `components/WIOLayout.tsx` · `WIOTable.tsx` | L-3 |
| `app/(SmarComm)/CLAUDE.md` | 985 | `lib/smarcomm/brand-personality.ts` | 삭제된 파일을 금지 대상으로 언급 |
| `app/(TenOne)/CLAUDE.md` | 115, 121-123 | `/intra/erp/people` · `/intra/studio/{sites,wio,agents}` | M-5 |
| `ROADMAP.md` | 261 | `/intra/bums/sites` | M-2 |
| `CLAUDE.md` | 1554, 1768-1769 | `components/ScanPage.tsx` · G드라이브 문서 2개 | L-2, M-8 |

> 집중 브랜드(MADLeague·RooK·HeRo·Badak·MADLeap·TenOne) 핵심 파일 표의 코드 경로는 위 TenOne 인트라 경로 외 **전부 존재**. 루트 CLAUDE.md의 함수·컴포넌트명 35종(`requireStaff`·`loginHref`·`siteHeaderNav`·`computeSitesStatus`·`brandSiteUrl`·`assertSelf`·`internalAuthHeaders`·`useCaptcha`…)도 전부 존재 — 단 `resolve_site_slug`는 DB 함수(코드 참조 0, 정상).

### 양호 (확인했고 문제 없음)

- 데이터 계약 5조·§1.6 권한 규약 ↔ DB `member_roles` 조합(role=slug, context='brand'/'module'/'system'/'universe') 일치 · `members.consent` 5/5 기록 · `SignupConsent`가 `/signup`·`LoginModal`·`ConsentGate`(루트 layout) 3경로 모두 사용(§1.2.0 일치)
- §1.3.1 capability 9종·내장 roles ↔ DB `capabilities` 완전 일치 · 대표 브랜드 열 ↔ `brand_capabilities` 일치(HeRo portfolio 추가분만 문서 누락)
- §1.5 "결제 건별 10%" ↔ `lib/supabase/uc.ts:141` 구현 · `LIFE_ONCE_*` Set 존재(정책 문서와 일치)
- §2.5 `scripts/site-check.mjs`가 표의 항목(파비콘·UtilityBar·MobileMenu·Footer·MyProfileCard·loginHref·"준비 중"·useSearchParams·brand-site-menus·CANONICAL·noindex·처리방침·밝은 글자색)을 전부 검사
- §0 "11 Edge Function · pg_cron 4 job" ↔ 실측 11·4 · Program_Module §2 ↔ `program_*` 11개 테이블 · Data_Lifecycle 2장 `member_brand_joins` 컬럼(terms_version·status·withdrawn_at·origin) ↔ DB 일치
- 공통 컴포넌트 채택(축2 L-6)·브랜드 layout의 정적 `metadata` 0건

## 문서 정리 제안 (어느 문서를 어떻게 — 분량 줄이기 포함)

1. **루트 CLAUDE.md (1,901줄 → 목표 ~1,100줄)**
   - 삭제: 부록 F(현재 상태 — WORK_STATUS와 중복, 낡음) · §1.1 도메인 29행 표(인트라 Standard › sites가 registry를 읽음 — 링크로) · §1.4 접근 모델 브랜드 열·특화 테이블 표(DB `brand_capabilities`·인트라 화면 링크로) · §1.6.1 레시피 코드 블록 6개(`docs/Capability_Recipes.md`로 분리) · 부록 G.1 GTM UI 조작 절차 40줄(`docs/External_Resources.md`로)
   - 수정: C-1(§1.4 체크리스트) · H-1(§1.3·§1.3.1·§1.9.2 affiliations 문장) · H-4(§1.5 테이블명) · M-6·M-7·M-8·M-12
   - 원칙: **숫자·목록은 적지 않는다**(DB·레지스트리·인트라 화면 링크) — 29·28·26·6·11·4 같은 수가 세션마다 어긋나는 원인
2. **브랜드 CLAUDE.md 27개 → 2등급으로**
   - 집중 6개: 템플릿 유지하되 "현재 상태" 표는 **최근 2세션만** 남기고 나머지는 CHANGELOG로(MADLeague 198줄·HeRo 568줄·SmarComm 1,040줄 → 각 ≤150줄). UC·권한·접근 모델 절은 값 복제 대신 "DB/레지스트리 참조"
   - 실험·보관 21개: 20줄 템플릿(정체성 · Tier/상태는 DB · 존재 파일 · 재가동 조건)으로 일괄 축소 — 없는 페이지 표 32건·옛 권한 모델 제거(M-10)
3. **Data_Lifecycle.md** — 1장 "현재" 블록·3.2 mad_members 행 갱신(M-3), 3.3 MADLeap·Badak은 §0.1 "이전 없음" 기준으로 "새 사이트 테이블 기준 탈퇴 처리" 정의로 교체
4. **TenOne_Agent_State.md** — v2.6 재실측(M-1) 또는 인트라 Standard › 외부 리소스 화면을 SSOT로 지정하고 문서는 "미해소 항목"만
5. **ROADMAP.md** — 현재 상태 요약 표·"🚨 즉시" 섹션·Phase 0 완료 블록 삭제(CHANGELOG에 있음), 0-A 재오픈(H-6), 3-D 미배포 표시(M-2)
6. **Universe_Coin_Policy.md** — 액션 표를 DB `uc_earn_rules` 덤프로 교체하지 말고 "원칙 + 인트라 UC 정책 화면 링크 + `uc_redeem_policies` 설명"으로(H-4)
7. **UX_GUIDE.md** — 변경 없음(부록 B 채우기만)

## 확인 필요

- `members.affiliations[]`의 존치 범위(H-1) — UI 캐시로 남길지 폐기할지. 폐기면 `UniverseUtilityBar` Work Space 드롭다운 데이터원을 `member_brand_joins`로 바꾸는 코드 작업이 따라온다.
- LUKI·EvoSchool·NamingFactory의 Tier(H-3) — `ums_sites`는 셋 다 `lifecycle=frozen`·`tier NULL`. 보관이면 라우트·siteConfigs·CLAUDE.md 정리, 아니면 layout 추가.
- `uc_redeem_policies`(4행)와 학생 50% 할인(ROADMAP 3-D)을 살릴지(H-4) — 살리면 `redeemUC` 수정, 아니면 테이블 DROP + ROADMAP 항목 삭제.
- `site-branding` 버킷(M-6) — 생성할지 `brand-assets`로 통일할지(축3 M-3과 함께).
- PAT 스크립트 13개 삭제(M-7) — `scripts/madzine-import.mjs`·`rook-import.mjs`·`madleague-programs-import.mjs`는 PAT 미사용이라 유지.
- Badak "외부 서버 이전 계획"(M-11) — §0.1 "이전 없음"과 같은 날 결정된 두 문장 중 어느 쪽이 최종인지.
- SmarComm Workspace 경로 `/dashboard`(L-8)가 `smarcomm.tenone.biz`에서 실제 열리는지(middleware prefix 분기) — 브라우저 미확인.

## 점검 범위·한계

- 파일 경로는 백틱 안의 `app/|lib/|components/|features/|sql/|docs/|scripts/` 접두 경로와 `*.tsx|ts|sql|md|js` 파일명만 추출(604건). 백틱 없는 경로·URL 경로(`/intra/...`)는 집중 브랜드·TenOne만 수동 확인.
- DB는 테이블·컬럼·함수 **존재 여부**와 `ums_sites`·`capabilities`·`brand_capabilities`·`uc_earn_rules`·`uc_redeem_policies` 컬럼·행 수·설정값만 조회. 회원 행·개인정보 값은 조회하지 않음. RLS·GRANT는 축 1·3 범위.
- 브랜드 CLAUDE.md 27개 중 집중 6개 + `(Mindle)`·`(Myverse)`·`(WIO)`·`(SmarComm)`은 핵심 파일·현재 상태·권한·UC 절을 읽음; 나머지 17개는 핵심 파일 표의 경로만 기계 대조(본문 규칙은 안 읽음).
- `docs/WIO_Master_Architecture.md`·`docs/Universe_OS_Plan.md`·`docs/HeRo_Matching_Tetrad_v1.md`·`docs/Identity_Architecture.md`·`.claude/skills`(tenone-agent 등)는 범위 밖 — 루트 `CLAUDE.md:62`가 "마스터 v2.4 스킬은 stale"이라 적은 상태 그대로.
- CHANGELOG.md·WORK_STATUS.md 세션 162 이전은 읽지 않음(세션 163 블록만 — 기재 내용은 코드·DB와 일치).
- 외부 리소스(Vercel 도메인·Supabase Redirect URL "33개"·Turnstile 호스트·Resend)는 접근하지 않아 부록 G 숫자는 미검증.
