# 데이터 생애주기 — 서비스 상태 · 브랜드 가입 · 탈퇴 처리

> CLAUDE.md §0.1 **데이터 계약 4·5조**의 실행 문서. 2026-10-05 세션 157 작성.
> 스키마: `sql/service-lifecycle.sql` (운영 DB 적용 완료)

---

## 1. 서비스 상태 — `ums_sites`

| 컬럼 | 값 | 의미 |
|------|----|------|
| `tier` | core · focus · experiment · archive · NULL | 브랜드 Tier (§0.1 표). NULL = 미결정 |
| `lifecycle` | active · frozen · sunsetting · archived | 운영 / 동결(신규 투자 없음) / 종료 절차 중 / 보관(접속·API 차단) |
| `hosting` | vercel · external | 이 서버 / 외부 서버(이전 전) |
| `sunset_at` | timestamptz | `sunsetting`일 때 종료 예정일 (필수) |
| `is_open` | boolean | 가림막 여부 (기존). lifecycle과 별개 — 개발 중인 active 브랜드도 닫혀 있을 수 있음 |

**현재 (2026-10-05)**
- core: tenone
- focus: hero(vercel) · madleague · madleap · badak (external)
- 운영 유지(내부 도구, Tier 미결정): dokdae · wiki
- frozen: 나머지 22개

**상태 전환 규칙**
- `active → frozen`: 결정만으로 가능 (신규 개발 중단)
- `frozen/active → sunsetting`: `sunset_at` 지정 + §0.1 종료 절차 ① 공지부터 시작
- `sunsetting → archived`: 종료 절차 ⑤ 완료 시. `is_open=false`, 라우팅·API 차단
- `external → vercel`: 외부 서버 이전 완료 시 + `lib/domain-registry.ts` CANONICAL_HOSTS 동시 변경

---

## 2. 브랜드 가입·동의 — `member_brand_joins`

| 컬럼 | 규칙 |
|------|------|
| `brand_id` | **`ums_sites.slug`만** (FK). 호스트명·표시명은 `resolve_site_slug()`로 변환 |
| `terms_version` · `terms_agreed_at` | 브랜드 첫 진입 시 동의한 약관 버전·시각 (데이터 계약 4조) |
| `status` · `withdrawn_at` | active / withdrawn. 브랜드만 탈퇴하면 row는 남기고 status 변경 (재가입 이력) |
| `origin` | signup · sso_auto · admin · **program** (프로그램 참가 동의, 2026-10-08) |

- 가입 시 자동 기록: `fn_auto_member_brand_join` 트리거가 `members.origin_site` → slug 변환 후 INSERT
- ⏳ **미구현**: 브랜드 첫 진입 시 약관 동의 화면 + `terms_version` 기록 (브랜드별 약관 버전 체계가 먼저 필요)
- ✅ **프로그램 참가 동의** (2026-10-08): 회차 방 첫 입장·초대 링크 합류 시 주인 브랜드에 `terms_version='program-2026-10-08'` 기록 (`lib/programs/consent.ts`)

---

## 3. 탈퇴 처리 — 두 가지 범위

> ### ⚙️ 현재 운영 방식 (2026-10-05 결정) — 전부 보존 + 수동 처리
> - **자동 삭제·익명화 시스템은 아직 만들지 않는다.** 매칭·지원·대회 이력, 수료증, 결제 기록 등 모든 데이터는 보존한다.
> - 탈퇴·삭제 요청이 오면 운영자가 `privacy_deletion_requests`(접수 후 30일 기한)로 받아 **아래 표 기준대로 수동 처리**한다.
> - 아래 표는 "수동 처리할 때 따를 기준"이자, 나중에 자동화할 때의 설계서다.
> - ⚠️ 법적 유의: 탈퇴한 회원의 식별 가능한 데이터를 계속 보관하는 것은 개인정보보호법 제21조 위반 소지가 있다. 현재 Vercel 쪽 실회원이 0명이라 실제 위험은 낮지만, 탈퇴 요청은 반드시 기한 내 수동 처리한다.
> - **자동화 시점**: Badak·MADLeap 회원 이전 전 (실회원 탈퇴가 발생하기 시작하는 시점) — `process_brand_withdrawal(member_id, brand_id)` 구현

| 범위 | 기록 | 처리 |
|------|------|------|
| **이 브랜드만** | `member_brand_withdrawals` scope=`brand` + joins status=`withdrawn` | 아래 브랜드별 표의 "브랜드 탈퇴" 열 |
| **계정 전체** | scope=`account` + `privacy_deletion_requests` | 모든 브랜드 표 처리 → `members` 삭제(cascade) → `auth.users`는 사용자가 Dashboard에서 직접 (CLAUDE.md 1.2) |

처리 방식 3종: **삭제** · **익명화**(row는 남기고 member 연결·개인정보 제거, "탈퇴한 회원" 표시) · **유지**(콘텐츠·운영 데이터, 개인 연결 없음)

### 3.1 HeRo (회원 키 정상 — 전부 `member_id`)

| 테이블 | 브랜드 탈퇴 | 비고 |
|--------|-----------|------|
| hero_profiles · career_profiles · resumes | 삭제 | 개인 프로필 |
| hero_goals · hero_goal_checkins · hero_daily_checkins · hero_reflections · hero_achievements | 삭제 | 개인 기록 |
| hit_*_results · hit_sessions · hit_chat_messages · hit_admin_flags | 삭제 | 진단 결과 (민감) |
| hero_talent_applications · hero_matching_requests · hero_jh_responses · hero_tih_responses | 익명화 후 영구 보관 | 직무·산업·결과 등 통계는 남기고 이름·연락처·member 연결 제거 (2026-10-05 결정). 직업소개사업 등록 시 법정 장부 보존기간만 원본 보관 |
| hero_matches | 익명화 | 상대방(기업) 기록 보존 |
| hero_company_members | 삭제 (기업은 유지) | 기업 계정은 다른 담당자에게 승계 |
| hero_coaching_sessions | 결제 연관분 5년 원본 보관 후 익명화 | 전자상거래법 계약·결제 기록 5년 |
| coaching_waitlist · hero_search_light_waitlist · hero_business_inquiries | 삭제 | 이메일 기반 대기·문의 |
| hit_questions · hit_report_modules · hit_* 마스터 | 유지 | 콘텐츠 (개인 연결 없음) |

### 3.2 MADLeague (⚠️ 회원 키 위반 있음 — 이전 전 정리 대상)

| 테이블 | 브랜드 탈퇴 | 비고 |
|--------|-----------|------|
| mad_members | 삭제 | ⚠️ `email`·`user_id` 키 → `member_id`로 전환 필요 (계약 1조) |
| mad_applications · mad_hero_applications | 삭제 | 지원서. 비회원 지원 가능하면 email 유지 허용 |
| (옛) mad_team_members · mad_certificates | → 코어 프로그램 모듈로 이전 (아래 3.2.2) | 옛 테이블은 배포 후 삭제 |
| mad_articles · mad_posts · mad_comments · mad_article_comments | 익명화 ("탈퇴한 회원") | 본인 요청 시 삭제 (2026-10-05 결정) |
| mad_article_likes | 삭제 | |
| mad_clubs.president_member_id | 연결 해제 | 동아리는 유지 |
| mad_clubs · mad_cohorts · mad_competitions · mad_competition_results · mad_archive | 유지 | 활동 콘텐츠 |

### 3.2.1 공통 신청 폼 (`forms` · `form_responses`, 2026-10-07 — 전 브랜드)

| 테이블 | 브랜드 탈퇴 | 비고 |
|--------|-----------|------|
| form_responses (member_id 있음) | 삭제 + 첨부파일(`contact-attachments/forms/...`) 삭제 | 해당 brand_id 응답만 |
| form_responses (비회원, respondent_email) | 폼별 보관 기간(`consent.retention`) 경과 후 삭제 | **자동 삭제 없음 — 운영자가 판단해 수동 정리** (2026-10-10 사용자 결정). 보관 기간은 폼별 선택 — 비우면 동의 화면에 표시 안 함 (MADLeap 지원서 = 미고지, 사용자 결정 · ⚠️ 개인정보보호법 제15조 ② 고지 사항 누락 위험 인지). 적었으면 그 기간을 넘기지 않게 정리 = 인트라 폼 › 응답 탭 › 선택 삭제·개별 삭제 (응답 + 첨부파일 영구 삭제) |
| forms | 유지 | 신청서 정의 (개인정보 없음) |

### 3.2.2 코어 프로그램 모듈 (`program_*`, 2026-10-08 — MADLeague·RooK·HeRo 공용, brand_id별)

| 테이블 | 브랜드 탈퇴 (해당 brand_id 행) | 비고 |
|--------|-----------|------|
| program_participants | 익명화 후 영구 보관 (member 연결 제거) | 팀 구성·활동 이력 통계 (2026-10-05 결정 승계) |
| program_applications | 삭제 (선발된 건은 participants로 이력 유지) | 지원 동기·포트폴리오 링크 (2026-10-08) |
| program_submissions · 제출 파일(`program-submissions` 버킷) | 팀 제출물 유지 (submitted_by 연결 제거) · 개인 참가 제출물 삭제 | 팀 공동 저작물 |
| program_questions · program_answers · program_submission_comments | 익명화 ("탈퇴한 회원") | |
| program_results | 유지 | 팀 이름·순위 스냅샷 (개인 없음) |
| **program_certificates** | **§4 공통 정책 "수료증" 그대로**: member_id NULL(계정 연결 해제) · snapshot에서 birthdate·university·major·group_name·cohort·team_name 삭제 · match_hash·linked_by NULL · **이름·발급일·코드 유지** (+ 인증서 내용인 구분·대회·결과 — 개인정보 아님) | 진위 확인. 발급·연결 동의 문구에 고지(계정 발급 · `pt-cert-2026-10-09`). 본인 삭제 요구(제36조) 시 폐기 후 삭제. 매드리거 등록 정보(mad_applications)는 별개 — 표 3.2 기준 |
| program_rounds · program_teams · program_notices | 유지 | 운영 콘텐츠 |

- **수료증 관리 대장 인증서** (2026-10-09, 구분 = `cert_key='ledger:{코드}'`, 원본 = 인트라 — 구글 시트 2026-10-10 동결, member_id NULL — 비회원): 2025 대성학원·리제로스·2026 춤추는고래 경쟁 PT 참가·수상 243건. snapshot = 이름·생년월일·대학·전공·동아리·기수·팀. **전화번호는 가져오지 않음**(최소 수집). `match_hash` = HMAC(이름|전화번호, env `CERT_MATCH_SECRET`) — 전화번호 원본 미보관. 로그인 + ① 매드리거 등록 정보(이름+전화번호)로 찾기(우선권, linked_by registration) 또는 ② 직접 확인(이름+생년월일+대학, Turnstile, linked_by manual) + 동의(`pt-cert-2026-10-09`) 시 그 계정에 연결 → 이후 탈퇴 처리는 위 program_certificates 규칙(익명화) 그대로. PNG·PDF는 브라우저에서 생성(서버 보관 없음). ⚠️ **아무도 연결하지 않은 대장 행의 보관 기간 미정** — 처리방침에 항목·기간 고지 필요

### 3.2.3 서비스 간 연계 동의 (`member_service_links`, 2026-10-09 — 코어)

| 상황 | 처리 | 비고 |
|------|------|------|
| 회원이 연결 끊기 | `revoked_at` 설정 (revoke_reason=`member`) — 받는 서비스는 즉시 못 읽음 | 행은 남김 (동의·철회 이력 = 입증 자료) |
| 서비스 탈퇴 (scope=brand) | 그 서비스가 보내는 쪽·받는 쪽인 연계 자동 철회 (트리거 `trg_revoke_service_links_on_withdrawal`) | `brand_withdrawal` |
| 계정 전체 탈퇴 | 전부 자동 철회 → members 삭제 시 FK cascade로 행 삭제 | `account_withdrawal` |

- 받는 서비스는 원본을 **복사해 두지 않는다** — 매번 동의 확인 후 원천 테이블을 읽는다 (철회 = 즉시 안 보임). 레지스트리 `lib/service-links.ts`
- 첫 실제 연계: MADLeague 인증서 → HeRo 마이페이지 (`/api/hero/linked/madleague-certificates` — 구분·프로그램·결과·발급일·코드만, 생년월일·대학·전공 제외)

### 3.3 MADLeap · Badak — 이전 시 확정
- 외부 서버의 실제 데이터 구조를 보고 이전 설계와 함께 정한다 (§0.1 외부 서버 이전 원칙).
- 참고: Vercel의 `madleap_portfolios`는 회원 키 컬럼이 없음, `badak_*` 29개는 이전 전 추정 설계(동결).

### 3.4 공통 핵심 (계정 전체 탈퇴 시)
`member_roles` · `member_capability_roles` · `member_preferences` · `member_brand_joins` · `uc_*` → 삭제 (members FK cascade 여부 점검 필요) · UC는 정책상 소멸 (CLAUDE.md 1.5)

---

## 4. 전 브랜드 공통 정책 (2026-10-05 결정)

| 데이터 | 탈퇴 시 처리 | 법적 근거 |
|--------|-------------|----------|
| 커뮤니티 글·댓글 | 익명화("탈퇴한 회원"), 본인 요청 시 삭제 | — |
| 매칭·지원·활동·대회 이력 | **익명화 후 영구 보관** (식별 정보 제거) | 개인정보보호법 제21조(파기) · 제58조의2(익명정보 적용 제외) |
| 수료증 | 이름·발급일·인증코드만 보관 (진위 확인) | 방침 명시 + 발급 시 동의 |
| 결제·계약 기록 | 5년 원본 보관 후 익명화 | 전자상거래법 |

> ⛔ **식별 가능한 상태로 영구 보관 금지** — 탈퇴 = 이용 목적 달성 → 지체 없이 파기가 원칙 (제21조).

자동화는 위 3장 '현재 운영 방식'의 자동화 시점에 `process_brand_withdrawal(member_id, brand_id)`로 구현 (HeRo·MADLeague부터). 그 전까지는 수동 처리.
