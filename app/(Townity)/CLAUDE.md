# Townity 브랜드 가이드

> **타우니티(Townity)** — 지역이 살아야 우리가 산다. "AI 시대의 지역 커뮤니티"

---

## 정체성

- **한 줄 소개**: 지역 소멸과 고령화에 맞서는 지역 기반 커뮤니티
- **톤앤매너**: 따뜻함·연대·지속성. 로컬 중심.
- **주 컬러**: 초록색 (#10B981)
- **디자인 방향**: 우리 동네 + 함께 해요 + 이야기. 지역 사람들의 목소리.

---

## 접근 모델

- **유형**: 오픈 (누구나 지역 기반 참여 가능)
- **가입 경로**:
  1. 회원가입 (선택적)
  2. 지역 선택
  3. 커뮤니티 참여 가능
- **멤버 권한**: member, local_leader, admin

---

## 프로필 특화

- **특화 테이블**: 없음 (공통 members + 지역 정보)
- **고유 필드**: primary_location, roles_in_community, interests

---

## 권한 체계

- **role 종류**: member, local_leader, admin
- **context**: `brand:townity`

---

## UC 정책 특이사항

- **브랜드 전용 액션**: share_story (월 2회, 1000 UC)
- **brand_id 지정**: `brand_id = 'townity'`

---

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `app/(Townity)/layout.tsx` | generateMetadata |
| `app/(Townity)/townity/page.tsx` | 메인 (프로젝트 소개) |
| `app/(Townity)/townity/about/page.tsx` | 타우니티란 |
| `app/(Townity)/townity/town/page.tsx` | 우리 동네 (지역 맵) |
| `app/(Townity)/townity/together/page.tsx` | 함께 해요 (참여) |
| `app/(Townity)/townity/stories/page.tsx` | 이야기 (커뮤니티 피드) |

---

## 현재 상태

| 항목 | 내용 |
|------|------|
| **Phase** | Beta — 지역 커뮤니티 구축 중 |
| **이월 작업** | 지역별 로컬 리더 매칭 시스템 |

---

## 참고

- 서비스 접근 모델: [CLAUDE.md § 1.4](../../CLAUDE.md#14-서비스-접근-모델-6종)
