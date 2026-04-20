# Planners 브랜드 가이드

> **Planner's** — 우리는 모두 기획자다. "기획은 꾀하는 것, 계획은 세우는 것"

---

## 정체성

- **한 줄 소개**: 기획·기획자 교육 및 커뮤니티 플랫폼
- **톤앤매너**: 지적·창의적·교육. 기획자 커뮤니티 중심.
- **주 컬러**: 틸 (#0F766E)
- **디자인 방향**: Planning 콘텐츠 + Planner's Planner (도구) + 교육

---

## 접근 모델

- **유형**: 오픈 + 교육 (기본 정보 자유, 고급 과정은 유료)
- **가입 경로**: 회원가입 → Planning 콘텐츠 열람 가능
- **멤버 권한**: member, instructor, admin

---

## 프로필 특화

- **특화 테이블**: 없음 (공통 members)
- **고유 필드**: planning_experience, interests

---

## 권한 체계

- **role 종류**: member, instructor, admin
- **context**: `brand:planners`

---

## UC 정책 특이사항

- **브랜드 전용 액션**: attend_workshop (월 2회, 1000 UC)
- **brand_id 지정**: `brand_id = 'planners'`

---

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `app/(Planners)/layout.tsx` | generateMetadata |
| `app/(Planners)/planners/page.tsx` | 메인 |
| `app/(Planners)/planners/planning/page.tsx` | Planning 아카이브 |
| `app/(Planners)/planners/planner-tool/page.tsx` | Planner's Planner (기획 도구) |

---

## 현재 상태

| 항목 | 내용 |
|------|------|
| **Phase** | Beta — 기획자 커뮤니티 구축 중 |
| **이월 작업** | Planner's Planner 고도화 |

---

## 참고

- 서비스 접근 모델: [CLAUDE.md § 1.4](../../CLAUDE.md#14-서비스-접근-모델-6종)
