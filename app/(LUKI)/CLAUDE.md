# LUKI 브랜드 가이드

> **LUKI** — AI Idol Group. "Ten:One Universe의 AI 엔터테인먼트 브랜드"

---

## 정체성

- **한 줄 소개**: AI 기반 아이돌 그룹 (가상 아이돌 + 팬덤 플랫폼)
- **톤앤매너**: 밝음·에너지·팬과의 연결. K-POP 중심.
- **주 컬색**: 보라색 (#7C3AED)
- **디자인 방향**: 멤버 프로필 + 음악·콘텐츠 + 팬덤 활동

---

## 접근 모델

- **유형**: 오픈 + 구독 (기본 팬덤 활동은 자유, 멤버십은 유료)
- **가입 경로**:
  1. 회원가입
  2. 즉시 팬덤 활동 가능
  3. 멤버십으로 독점 콘텐츠 접근
- **멤버 권한**: fan, official_fan, admin

---

## 프로필 특화

- **특화 테이블**: luki_fans (팬덤 정보)
- **고유 필드**:
  - fan_name (팬덤 활동명)
  - favorite_member (최애 멤버)
  - membership_tier (일반/official/vip)

---

## 권한 체계

- **role 종류**: fan, official_fan, admin
- **context**: `brand:luki`
- **인트라 관리 권한**: `/intra/ums/luki` (팬덤 관리)

---

## UC 정책 특이사항

- **브랜드 전용 액션**:
  - `watch_content` (월 10회, 무료)
  - `fan_activity` (월 5회, 500 UC)
- **brand_id 지정**: `brand_id = 'luki'`

---

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `app/(LUKI)/layout.tsx` | generateMetadata |
| `app/(LUKI)/luki/page.tsx` | 메인 (멤버 소개 + 최신 콘텐츠) |
| `app/(LUKI)/luki/members/page.tsx` | 멤버 프로필 |
| `app/(LUKI)/luki/music/page.tsx` | 음악·앨범 |
| `app/(LUKI)/luki/content/page.tsx` | 콘텐츠 (영상·포토) |
| `app/(LUKI)/luki/fanclub/page.tsx` | 팬클럽 + 멤버십 |

---

## 개발 주의사항

- AI 아이돌 콘텐츠 — LLM/이미지 생성 AI 활용
- 팬덤 연령층 다양 — 접근성 고려
- 다국어 지원 예정 (한국어 + 영어)

---

## 현재 상태

| 항목 | 내용 |
|------|------|
| **Phase** | Beta — AI 멤버 캐릭터 개발 중 |
| **이월 작업** | AI 생성 음악/영상 콘텐츠 파이프라인 |

---

## 참고

- 서비스 접근 모델: [CLAUDE.md § 1.4](../../CLAUDE.md#14-서비스-접근-모델-6종)
