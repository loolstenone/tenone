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
| `origin` | signup · sso_auto · admin |

- 가입 시 자동 기록: `fn_auto_member_brand_join` 트리거가 `members.origin_site` → slug 변환 후 INSERT
- ⏳ **미구현**: 브랜드 첫 진입 시 약관 동의 화면 + `terms_version` 기록 (브랜드별 약관 버전 체계가 먼저 필요)

---

## 3. 탈퇴 처리 — 두 가지 범위

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
| hero_talent_applications · hero_matching_requests · hero_jh_responses · hero_tih_responses | 삭제 ❓ | **결정 필요**: 매칭 이력 보존 기간 |
| hero_matches | 익명화 | 상대방(기업) 기록 보존 |
| hero_company_members | 삭제 (기업은 유지) | 기업 계정은 다른 담당자에게 승계 |
| hero_coaching_sessions | 익명화 ❓ | 결제·정산 연관 시 법정 보관 (전자상거래법 5년) |
| coaching_waitlist · hero_search_light_waitlist · hero_business_inquiries | 삭제 | 이메일 기반 대기·문의 |
| hit_questions · hit_report_modules · hit_* 마스터 | 유지 | 콘텐츠 (개인 연결 없음) |

### 3.2 MADLeague (⚠️ 회원 키 위반 있음 — 이전 전 정리 대상)

| 테이블 | 브랜드 탈퇴 | 비고 |
|--------|-----------|------|
| mad_members | 삭제 | ⚠️ `email`·`user_id` 키 → `member_id`로 전환 필요 (계약 1조) |
| mad_applications · mad_hero_applications | 삭제 | 지원서. 비회원 지원 가능하면 email 유지 허용 |
| mad_team_members · mad_certificates | 익명화 ❓ | **결정 필요**: 수료·대회 이력을 기록으로 남길지 |
| mad_articles · mad_posts · mad_comments · mad_article_comments | 익명화 ❓ | **결정 필요**: 커뮤니티 글 처리 원칙 (아래 4번) |
| mad_article_likes | 삭제 | |
| mad_clubs.president_member_id | 연결 해제 | 동아리는 유지 |
| mad_clubs · mad_cohorts · mad_competitions · mad_competition_results · mad_archive | 유지 | 활동 콘텐츠 |

### 3.3 MADLeap · Badak — 이전 시 확정
- 외부 서버의 실제 데이터 구조를 보고 이전 설계와 함께 정한다 (§0.1 외부 서버 이전 원칙).
- 참고: Vercel의 `madleap_portfolios`는 회원 키 컬럼이 없음, `badak_*` 29개는 이전 전 추정 설계(동결).

### 3.4 공통 핵심 (계정 전체 탈퇴 시)
`member_roles` · `member_capability_roles` · `member_preferences` · `member_brand_joins` · `uc_*` → 삭제 (members FK cascade 여부 점검 필요) · UC는 정책상 소멸 (CLAUDE.md 1.5)

---

## 4. 결정이 필요한 정책 (텐원님)

1. **커뮤니티 글·댓글**: 탈퇴 시 삭제 vs 익명화("탈퇴한 회원")? — 일반적 관행은 익명화 + 본인 요청 시 삭제
2. **HeRo 매칭·지원 이력**: 탈퇴 즉시 삭제 vs 일정 기간 보존?
3. **MADLeague 수료·대회 이력**: 탈퇴해도 기록으로 남길지 (익명화)?

결정 후 이 문서의 ❓ 표시를 확정하고, 탈퇴 처리 함수(`process_brand_withdrawal(member_id, brand_id)`)로 구현한다.
