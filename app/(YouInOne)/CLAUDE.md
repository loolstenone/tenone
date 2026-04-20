# YouInOne 브랜드 가이드

> **YouInOne** — 기업과 사회의 문제를 해결하는 프로젝트 그룹. "Idea + Strategy"

---

## 정체성

- **한 줄 소개**: 소규모 기업 연합 얼라이언스 (프로젝트 기반 협업)
- **톤앤매너**: 전문적·신뢰감·협력. B2B 비즈니스 중심.
- **주 컬러**: 초록색 (#1AAD64)
- **디자인 방향**: 프로젝트 중심. 팀·기업 협력 관리.

---

## 접근 모델

- **유형**: 구매 기반 (프로젝트별 참여비 결제)
- **가입 경로**: 
  1. 회원가입 (기업 이메일 권장)
  2. 프로젝트 검색 및 참여 신청
  3. 승인 후 참여 시작
- **멤버 권한**: member, project_lead, admin

---

## 프로필 특화

- **특화 테이블**: 없음 (공통 members + WIO project 테이블 공유)
- **고유 필드**: company_name, industry, project_role

---

## 권한 체계

- **role 종류**: member, project_lead, admin
- **context**: `brand:youinone`

---

## UC 정책 특이사항

- **브랜드 전용 액션**: join_project (월 5회, 1000 UC)
- **brand_id 지정**: `brand_id = 'youinone'`

---

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `app/(YouInOne)/layout.tsx` | generateMetadata |
| `app/(YouInOne)/youinone/page.tsx` | 메인 (프로젝트 피드) |
| `app/(YouInOne)/youinone/projects/page.tsx` | 프로젝트 목록 |
| `app/(YouInOne)/youinone/projects/[id]/page.tsx` | 프로젝트 상세 |
| `app/(YouInOne)/youinone/my/page.tsx` | 마이페이지 (참여 프로젝트) |

---

## 현재 상태

| 항목 | 내용 |
|------|------|
| **Phase** | Beta — 프로젝트 관리 시스템 구축 중 |
| **이월 작업** | WIO 프로젝트 모듈 통합 |

---

## 참고

- 서비스 접근 모델: [CLAUDE.md § 1.4](../../CLAUDE.md#14-서비스-접근-모델-6종)
