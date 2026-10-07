# 유니버스 점검 2026-10 — 종합

> 2026-10-08 · 점검: Fable(읽기 전용 에이전트 6개, 축별 순차) · 종합·검증·긴급 수정: Opus (세션 164)
> 목적: 브랜드 사이트가 서로 연결되며 커진 복잡도 속 **시스템·기능·데이터 모순 해결**과 **이상적인 사이트 구조** 판단 근거
> 기준: 루트 CLAUDE.md 헌법 7원칙 · 데이터 계약 5조 · §1.9.5 SSOT 사슬 · 부록 A

## 읽는 순서

1. 이 문서 — 전체 그림·이미 고친 것·결정할 것·작업 순서
2. 작업할 축의 보고서 (각 항목에 근거 파일:줄 · 해결안 · 작업량)

| 축 | 보고서 | C | H | M | L | 한 줄 |
|---|---|---|---|---|---|---|
| 1 | [데이터 계약](axis-1-data-contract.md) | 3 | 6 | 11 | 6 | 코어는 견고, **코어를 우회하는 옛 경로**에 위반 집중 (직원 판단 함수 2벌·affiliations 2벌·email 키) |
| 2 | [SSOT 중복](axis-2-ssot.md) | 0 | 7 | 10 | 6 | SSOT 파일은 있으나 **선언 이전 복제본이 살아 있음** (도메인 맵 3벌·브랜드 이름 10곳·분류 4벌) |
| 3 | [권한·보안](axis-3-security.md) | 3 | 6 | 12 | 7 | **옛 라우트·옛 RLS**가 코어 가드 밖에 남음 (`USING(true)`·자기 승인 컬럼·open redirect) |
| 4 | [문서 ↔ 실제](axis-4-docs-vs-reality.md) | 1 | 7 | 13 | 8 | 핵심 규칙은 맞음, **옛 문장이 새 규칙 옆에 공존** (email 조인 키 지시 등) · UC 4벌 |
| 5 | [죽은 것](axis-5-dead.md) | 0 | 4 | 8 | 4 | 테이블 499개 중 355개 0행 · 미사용 API ~55 · **보관 브랜드 API ~250개 켜짐** |
| 6 | [브랜드 간 연결](axis-6-cross-brand.md) | 0 | 5 | 7 | 5 | 코어 장치는 있음, **실제 이어진 여정은 거의 없음** (독립 도메인 로그인 단절·첫 진입 동의 없음) |
| 6+ | [부록: 연결 지도](axis-6-appendix-connection-map.md) | | 3 | 3 | | 집중 6개 브랜드 링크·테이블·프로필 연결 파일:줄 단위 + 새 항목 A6-1~6 |
| | **합계** | **7** | **38** | **64** | **36** | 145건 |

## 공통 진단 (6개 축을 관통하는 한 문장)

**코어(api-guard·member_roles·capability·program_* 모듈·SSOT 레지스트리)는 잘 설계돼 있다. 문제는 거의 전부 "코어가 생기기 전에 만든 것"이 정리되지 않고 옆에 살아 있는 것이다.**
→ 새 기능을 더 만들기 전에 **옛 것을 코어로 흡수하거나 끄는 정리 단계**가 필요하다. 회원 5명(전원 직원 포함)·대부분 테이블 0행인 지금이 가장 싸다 — Badak(~9,000명 재가입)·MADLeap 오픈 후에는 데이터 이전 비용이 생긴다.

## 이미 고친 것 (2026-10-08, 커밋 336e4a03 · 운영 확인)

| 항목 | 조치 | 운영 확인 |
|---|---|---|
| 축3 C-1 SmarComm CRM API 비인증 개인정보 노출 | 대시보드 API 직원 전용 + crm 핸들러 `requireStaff` | 비로그인 401 · 직원 화면 정상 |
| 축3 C-2 로그인만으로 뉴스레터 전체 발송 | `requireStaff` + 정책 등록 | 401 · 인트라 정상 |
| 축3 C-3 `board-assets` anon 쓰기 | 쓰기 정책 3개 삭제 (`sql/security-board-assets-lockdown.sql`) | 읽기 정책만 남음 |
| 축3 H-2 `.png` 경로로 API 게이트 우회 (로컬 재현됨) | middleware matcher `/api/:path*` 추가 | 401 |
| 축1 C-2 Badak `badak_members.role` 권한 상승 | API → `requireStaff` | 401 |
| 축1 C-1 `hero_talent_applications` anon 열람·키 혼용 | 본인(`auth_member_id()`)·직원만 + anon REVOKE (`sql/security-hero-talent-applications-rls.sql`) | anon 권한 없음 |
| 축5 `/api/debug-env` (환경변수 이름 공개) | 삭제 | 이 커밋 배포 후 404 |

## 보고서 간 보정 (Opus 확인)

- 축2 H-3 "`posts` 테이블 없음" → **`posts`·`board_configs`는 DB VIEW로 존재** (축5 확인, 2026-10-08 pg_class 재확인). `badak_posts`·`subscriptions`는 실제로 없음 → H-3은 이 두 개로 범위 축소.
- 축3 H-2는 정적 분석 "확인 필요"였으나 로컬에서 재현 확인 후 수정함.

## ⚠️ 운영 중 노출 확인 — 다음 세션 맨 먼저 (승인 필요)

- **A6-4 `get_public_profile` RPC가 회원 이메일 반환** — SECURITY DEFINER + anon EXECUTE, `members.email·affiliations·privacy_settings·role`을 `row_to_json`으로 그대로 돌려준다. handle 있는 회원 5명 전원 공개 상태(2026-10-08 Opus 재확인). handle만 알면 비로그인으로 이메일 조회 가능.
- 수정안: 함수의 SELECT에서 `email`·`affiliations`·`privacy_settings`·`role` 제거(공개 필드 name·company·bio·avatar_url·interests·handle·social_links·created_at·profile_visibility만) → `sql/security-get-public-profile.sql` + MCP apply_migration. 영향: `components/UniverseProfile.tsx`가 공개 뷰에서 `publicData.email`로 badak·hero 프로필을 email 매칭 조회(축1 H-2) → 공개 뷰에서 그 섹션이 비게 됨(원래 동의 없는 교차 노출이라 오히려 맞음). `/profile/@handle` 화면 확인 필요.

## 결정이 필요한 것 (사용자)

| # | 결정 | 관련 | 선택지 |
|---|---|---|---|
| D-1 | **독립 도메인 간 로그인 유지** | 축6 H-1 · 축3 H-5 | ① SSO 복구(LoginModal에 1단계 추가) ② SSO 폐기·도메인마다 로그인(코드 삭제로 보안 항목도 소멸) |
| D-2 | **보관 Tier 브랜드 API·페이지 끄기** | 축5 H-2 · 헌법 원칙 5 | middleware 규칙 1개로 ~250 API 차단 → 파일 삭제는 이후 |
| D-3 | **빈 테이블 91개 DROP** (코드 0·행 0) | 축5 H-3 | 백업 후 마이그레이션 1개 · 옛 `mad_competition*`·`mad_certificates` 포함 |
| D-4 | **브랜드 순환 구조 확정** — MADLeap = 독립 브랜드인가 MADLeague 동아리인가, HeRo 프로그램을 코어(program_*)로 옮길지 | 축6 H-3 · 축4 H-5 | 결정 후 문서·인트라·데이터 동시 정리 |
| D-5 | **CLAUDE.md 정리** — 모순 문장 제거·분량 1,901 → ~1,100줄·브랜드 문서 2등급(집중/실험) | 축4 전체 | 문서가 매 세션 작업 지시서라 틀린 문장이 계속 퍼짐 |
| D-6 | **탈퇴 정책** — `/api/account/delete`가 auth 계정을 직접 삭제하고 브랜드 데이터는 미정리 · "이 브랜드만 탈퇴" 없음 | 축6 H-5 · 축1 | Data_Lifecycle 표대로 코어 함수화 |
| D-7 | **`crm_absorb_member` 트리거** — 가입 시 전 회원을 CRM에 자동 복사 (목적 외 이용 소지, 개인정보보호법 제18조) | 축1 H-6 | 중단 / 동의 기반으로 변경 |

## 권장 작업 순서 (Opus 세션에서 하나씩 — 각 항목은 보고서 근거를 코드·DB로 재확인 후 수정)

**1단계 — 남은 보안 (회원 받기 전 필수)**
0. **A6-4 `get_public_profile` 이메일 반환 차단** (위 ⚠️) · **A6-2 MADLeague 포트폴리오 타 브랜드 이력 필터** (공개 포트폴리오 교차 노출)
1. 축1 C-3 `is_tenone_staff()` → `auth_is_staff()` (함수 1개로 정책 65개 단일화) — DB 승인
2. 축3 H-3 `USING(true)` 7개 테이블 + anon REVOKE (`collected_data` anon UPDATE 포함) — DB 승인
3. 축3 H-1 HeRo 매칭 RLS·API 2개 `assertSelf` (HeRo 공개 운영 중)
4. 축3 H-4 자기 승인 컬럼 REVOKE (`brand_membership_applications`·`approvals` 우선)
5. 축3 H-5 open redirect — `safeRedirect`를 `lib/login-href.ts`로 승격해 4곳 적용
6. 축3 H-6 `/api/hero/tih` email upsert 덮어쓰기
7. 축5 H-1 `Scripts/` 실행파일·PAT 스크립트 제거 + .gitignore

**2단계 — 모순 제거 (SSOT 한 곳으로)**
8. 축1 H-1+H-5 · 축6 H-4 — 브랜드 가입·동의 = `member_brand_joins` 단일화 + BrandJoinGate (affiliations 판단 7곳 교체)
9. 축2 H-1 도메인 맵 3벌 → `domain-registry` 파생 · H-7 `0gamja/ogamja` 통일
10. 축2 H-2 Badak·HeRo·MADLeap `brand-site-menus` 등록 (site:check ❌ 해소)
11. 축6 H-2 교차 브랜드 링크 헬퍼 (독립 도메인 404 — HeRo 공개 중) — 부록 A6-5(푸터 `/brands`·`/universe`·WORK 드롭다운·HitProfileBadge)·A6-1(모바일 "가입" 404) 같이
12. 축2 H-5 산업군·직무군 단일화 · H-4 브랜드 이름·컬러 단일화
13. D-5 CLAUDE.md 정리 (축4 C-1·H-1·H-2 우선)

**3단계 — 정리·이상적 구조**
14. D-2·D-3 보관 브랜드 차단·빈 테이블 DROP · 미사용 API·파일·패키지 삭제 (축5)
15. 축5 H-4 Badak Mock 제거 (Badak 오픈 전)
16. D-4·D-6 순환 구조·탈퇴 코어 함수 (축6 "이상적 연결 구조 제안" 3단계)
17. 점검기 확장: `scripts/site-check.mjs`에 코드 테이블명 ↔ DB 대조, `USING(true)`+anon 정책 집계, STAFF 경로 핸들러 가드 검사 (재발 방지 — 기억 대신 점검기)

## 주의

- 보고서는 Fable의 정적 분석이다. **"확신도: 확인 필요" 항목은 반드시 재확인 후** 작업. 삭제·DB 권한 변경은 사용자 승인.
- 다음 점검은 3단계 끝난 뒤 같은 6축으로 반복해 수치(139건) 비교.
