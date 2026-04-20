# EvoSchool 브랜드 가이드

> **Evolution School** — 실무 교육 플랫폼. "진짜 실력을 키우는 곳"

---

## 정체성

- **한 줄 소개**: 실전 중심 업무 교육 플랫폼 (기술·리더십·커뮤니케이션)
- **톤앤매너**: 실용적·진실·발전. 성인 교육 중심.
- **주 컬색**: 빨강 (#F87171)
- **디자인 방향**: 강좌 + 학습 경로 + 수료증 + 커뮤니티

---

## 접근 모델

- **유형**: 교육 + 구독 (강좌 구독 기반)
- **가입 경로**:
  1. 회원가입
  2. 강좌 검색 및 등록
  3. 학습 시작
- **멤버 권한**: student, instructor, admin

---

## 프로필 특화

- **특화 테이블**: evschool_profiles (학습 이력)
- **고유 필드**:
  - completed_courses[] (수료 강좌)
  - current_courses[] (진행 중 강좌)
  - skills[] (습득 스킬)

---

## 권한 체계

- **role 종류**: student, instructor, admin
- **context**: `brand:evschool`

---

## UC 정책 특이사항

- **브랜드 전용 액션**: complete_course (월 2회, 3000 UC)
- **brand_id 지정**: `brand_id = 'evschool'`

---

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `app/(EvoSchool)/layout.tsx` | generateMetadata |
| `app/(EvoSchool)/evschool/page.tsx` | 메인 (강좌 카탈로그) |
| `app/(EvoSchool)/evschool/courses/page.tsx` | 강좌 검색 |
| `app/(EvoSchool)/evschool/courses/[id]/page.tsx` | 강좌 상세 |
| `app/(EvoSchool)/evschool/learning-path/page.tsx` | 학습 경로 |
| `app/(EvoSchool)/evschool/certificates/page.tsx` | 수료증 |

---

## 현재 상태

| 항목 | 내용 |
|------|------|
| **Phase** | Beta — 강좌 콘텐츠 구축 중 |
| **이월 작업** | 학습 경로 추천 알고리즘 |

---

## 참고

- 서비스 접근 모델: [CLAUDE.md § 1.4](../../CLAUDE.md#14-서비스-접근-모델-6종)
- WIO 모듈: [Learn + Wiki](../../CLAUDE.md#7가지-wio-모듈)
