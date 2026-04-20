# Domo 브랜드 가이드

> **Domo** — 인생 2회차, 도모하다. "정년·은퇴 후 새로운 도전을 시작하는 시니어 비즈니스맨"

---

## 정체성

- **한 줄 소개**: 시니어 비즈니스맨 네트워킹 + 준비서 + 기획 + 투자자문 플랫폼
- **톤앤매너**: 전문적·경험담·신뢰감. 시니어 존중.
- **주 컬러**: 짙은 보라 (#7F1146)
- **디자인 방향**: 네트워킹 + 인사이트 + 이벤트. 경험자 중심의 정보 공유.

---

## 접근 모델

- **유형**: 오픈 + 구매/이벤트 (참여는 자유, 고급 서비스는 유료)
- **가입 경로**:
  1. 회원가입 (이메일)
  2. 프로필 설정 (경력, 관심사)
  3. 네트워크 접근 가능
- **멤버 권한**: member, mentor, admin

---

## 프로필 특화

- **특화 테이블**: 없음 (공통 members)
- **고유 필드**: career_history, expertise_areas, mentoring_available

---

## 권한 체계

- **role 종류**: member, mentor, admin
- **context**: `brand:domo`

---

## UC 정책 특이사항

- **브랜드 전용 액션**:
  - `attend_event` (월 3회, 500 UC)
  - `write_insight` (월 1회, 2000 UC)
- **brand_id 지정**: `brand_id = 'domo'`

---

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `app/(Domo)/layout.tsx` | generateMetadata |
| `app/(Domo)/domo/page.tsx` | 메인 (이벤트 + 네트워크 피드) |
| `app/(Domo)/domo/services/page.tsx` | 서비스 안내 |
| `app/(Domo)/domo/network/page.tsx` | 멤버 네트워크 |
| `app/(Domo)/domo/insights/page.tsx` | 경험담 & 인사이트 |
| `app/(Domo)/domo/events/page.tsx` | 이벤트 목록 |
| `app/(Domo)/domo/my/page.tsx` | 마이페이지 |

---

## 현재 상태

| 항목 | 내용 |
|------|------|
| **Phase** | Beta — 네트워킹 시스템 구축 중 |
| **이월 작업** | 멘토링 매칭 시스템 |

---

## 참고

- 서비스 접근 모델: [CLAUDE.md § 1.4](../../CLAUDE.md#14-서비스-접근-모델-6종)
