# ChangeUp 브랜드 가이드

> **ChangeUp** — 미래를 만드는 일, 창업. "AI 시대 청소년 창업 교육"

---

## 정체성

- **한 줄 소개**: 고등학생·대학생 창업 교육 플랫폼 (부모·학교·지역사회 투자 생태계)
- **톤앤매너**: 희망적·도전적·교육. 청소년 중심.
- **주 컬러**: 초록색 (#1AAD64)
- **디자인 방향**: 프로그램 + 투자 + 스타트업 + 커뮤니티

---

## 접근 모델

- **유형**: 교육 + 투자 (프로그램 수강료 + 투자 유치)
- **가입 경로**:
  1. 회원가입 (학생/부모/투자자)
  2. 프로그램 검색 및 등록
  3. 창업 커뮤니티 참여
- **멤버 권한**: student, parent, mentor, investor, admin

---

## 프로필 특화

- **특화 테이블**: changeup_profiles (역할별 프로필)
- **고유 필드**:
  - role (student/parent/mentor/investor)
  - startup_id (참여 중인 스타트업)
  - expertise (투자자/멘토 전문 분야)

---

## 권한 체계

- **role 종류**: student, parent, mentor, investor, admin
- **context**: `brand:changeup`

---

## UC 정책 특이사항

- **브랜드 전용 액션**:
  - `join_program` (월 1회, 5000 UC)
  - `pitch_startup` (월 2회, 2000 UC)
- **brand_id 지정**: `brand_id = 'changeup'`

---

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `app/(ChangeUp)/layout.tsx` | generateMetadata |
| `app/(ChangeUp)/changeup/page.tsx` | 메인 (프로그램 + 성공 사례) |
| `app/(ChangeUp)/changeup/programs/page.tsx` | 교육 프로그램 |
| `app/(ChangeUp)/changeup/invest/page.tsx` | 투자 정보 |
| `app/(ChangeUp)/changeup/startups/page.tsx` | 스타트업 목록 (피칭) |
| `app/(ChangeUp)/changeup/community/page.tsx` | 창업 커뮤니티 |

---

## 현재 상태

| 항목 | 내용 |
|------|------|
| **Phase** | Beta — 프로그램 & 투자 매칭 시스템 구축 중 |
| **이월 작업** | 멘토 매칭 알고리즘 |

---

## 참고

- 서비스 접근 모델: [CLAUDE.md § 1.4](../../CLAUDE.md#14-서비스-접근-모델-6종)
