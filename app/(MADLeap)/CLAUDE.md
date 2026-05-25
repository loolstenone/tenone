# MADLeap 브랜드 가이드

> **MADLeap** — 수도권 마케팅 광고 창업 대학생 연합 동아리. "실전 프로젝트로 경험하다"

---

## 정체성

- **한 줄 소개**: 마케팅·광고·창업을 실전으로 경험하는 수도권 연합동아리
- **톤앤매너**: 실전·에너지·포용. 커뮤니티 중심.
- **주 컬러**: 사이안 (#00B8FF)
- **디자인 방향**: 커뮤니티 + 스터디 룸 + 포트폴리오

---

## 접근 모델

- **유형**: 승인 멤버십 (지원서 → 심사 → 승인)
- **가입 경로**: MADLeague와 동일한 구조 (지원서 기반)
- **멤버 권한**: member, approved_member, leader, admin

---

## 프로필 특화

- **특화 테이블**: `mad_applications` (MADLeague와 공유)
- **고유 필드**: club_slug, cohort, activity_year, university, major

---

## 권한 체계

- **role 종류**: member, approved_member, leader, admin
- **context**: `brand:madleap`

---

## UC 정책 특이사항

- **브랜드 전용 액션**: 
  - `service_onboard` (500 UC)
  - `submit_story` (5000 UC)
- **brand_id 지정**: `brand_id = 'madleap'`

---

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `app/(MADLeap)/layout.tsx` | generateMetadata |
| `app/(MADLeap)/madleap/page.tsx` | 메인 페이지 |
| `app/(MADLeap)/madleap/community/page.tsx` | 커뮤니티 |
| `app/(MADLeap)/madleap/study-room/page.tsx` | 스터디 룸 |
| `app/(MADLeap)/madleap/portfolio/page.tsx` | 포트폴리오 (Server Component · DB 연동) |
| `app/(MADLeap)/madleap/my/page.tsx` | 마이페이지 |
| `features/madleap/PortfolioGrid.tsx` | 포트폴리오 필터 + 그리드 (Client Component) |
| `features/madleap/MadLeapHeader.tsx` | 헤더 (nav `/madleap/*` 표준) |
| `sql/madleap-portfolios.sql` · `sql/madleap-portfolios-seed.sql` | 테이블·시드 SSOT |

---

## 현재 상태

| 항목 | 내용 |
|------|------|
| **Phase** | Beta+ (2026-05-25 업데이트) — 정직성 회복 + 포트폴리오 DB 연동 완료 |
| **이월 작업** | study_programs DB 연동 (운영진이 콘텐츠 제공 필요) · madleap.co.kr sub-pages 7종(소개·연혁·프로그램·조직·세계관·멤버십·BI) 마이그레이션 검토 · is_open 토글 결정 (현재 false) |
| **세션 151 (2026-05-25)** | **madleap.co.kr 실 콘텐츠 마이그레이션 + 정직성 회복** ① 헤더 nav 경로 `/madleap/*` 표준화 (commit `805fed7f`) ② 포트폴리오 DB 연동 — `madleap_portfolios` 테이블 + `PortfolioGrid` client + page server component (commit `cb21776e`) ③ 시드 정직성 회복 — mock 12개(가짜) → madleap.co.kr 실 프로젝트 17개 (commit `16cb5a11`, [seed](../../sql/madleap-portfolios-seed.sql)) ④ home·about 페이지 정직성 회복 — 운영진 실명·동문 quote·통계 mock 모두 제거, madleap.co.kr 원문 학생 목소리 3가지·"진짜 실력은 트로피 갯수가 아니라" 핵심 철학·5대 가치 원문 순서·"매년 2~3월 2년 활동" 모집 안내 도입 (commit `ce799f58`) |
| **검증된 콘텐츠 (madleap.co.kr 출처)** | 학생 목소리 3 · 핵심 철학 · 5대 가치 순서 (확장·연결·발로 뛰다·세상을 기획하는 기획자·결과로 말하다) · 인재상 3 (전문가·열망·소통) · 모집 안내 · 채널 4 (이메일·인스타·블로그·유튜브) · 포트폴리오 17건 (4기 6·3기 8·2기 3) |
| **미검증 (제거 완료)** | 운영진 10명 실명 · 동문 quote 3 (카카오·삼성·토스) · 통계 4 (200+ 멤버·15+ 수상·12+ 파트너·32명 선발) · highlights 4 (대상·DAM Party 150명 등) · instagram feed 6 · 5기 30명·전형 4단계·기간 03.17~04.06 |
| **신규 DB 테이블** | `madleap_portfolios` (16 cols, public read · service_role write, sort_order desc·gen_num desc 정렬, RLS 적용) · 17 rows 시드 |
| **QA 완료 (2026-05-17)** | Universe 컴포넌트 정합 확인 — `generateMetadata()` ✅ · `UniverseUtilityBar` ✅ · `UniverseMobileMenu` ✅ · `UniverseFooter` ✅ · `LoginModal` ✅ · `loginHref()` ✅ |

---

## 참고

- 서비스 접근 모델: [CLAUDE.md § 1.4](../../CLAUDE.md#14-서비스-접근-모델-6종)
