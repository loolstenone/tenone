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
| `app/(MADLeap)/madleap/portfolio/page.tsx` | 포트폴리오 |
| `app/(MADLeap)/madleap/my/page.tsx` | 마이페이지 |

---

## 현재 상태

| 항목 | 내용 |
|------|------|
| **Phase** | Beta (2026-04-22 업데이트) — 포트폴리오 페이지 완성 |
| **이월 작업** | 포트폴리오 DB 연동 (현재 mock 데이터, 추후 portfolios 테이블 연결) |

---

## 참고

- 서비스 접근 모델: [CLAUDE.md § 1.4](../../CLAUDE.md#14-서비스-접근-모델-6종)
