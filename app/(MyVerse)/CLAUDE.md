# Myverse 브랜드 가이드

> **My Universe** — 디지털 속 나를 키운다. "Personal Black Box for the Digital Age"

---

## 정체성

- **한 줄 소개**: 개인 데이터 통합 플랫폼 + AI 에이전트 (기록 수집 → AI 학습 → 개인화)
- **톤앤매너**: 미래적·개인화·신뢰. AI 중심.
- **주 컬러**: 인디고 (#6366F1)
- **디자인 방향**: 철학 + 서비스 + 기술 + 로드맵. AI 기반 개인화.

---

## 접근 모델

- **유형**: 오픈 + 구독 (기본 기능 자유, 고급 AI 분석은 유료)
- **가입 경로**:
  1. 회원가입
  2. 데이터 권한 허용 (외부 서비스 연동)
  3. 개인 유니버스 생성
- **멤버 권한**: member, subscriber, admin

---

## 프로필 특화

- **특화 테이블**: myverse_profiles (개인 Black Box 정보)
- **고유 필드**: 
  - connected_services[] (연동 서비스 목록)
  - personal_tags[] (자기 정의)
  - ai_insights (AI가 생성한 개인 인사이트)

---

## 권한 체계

- **role 종류**: member, subscriber, admin
- **context**: `brand:myverse`
- **데이터 주권**: 사용자가 자신의 데이터 100% 소유 + 언제든 삭제 가능

---

## UC 정책 특이사항

- **브랜드 전용 액션**: 
  - `connect_service` (월 3회, 무료)
  - `unlock_ai_insights` (월 1회, 5000 UC)
- **brand_id 지정**: `brand_id = 'myverse'`

---

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `app/(Myverse)/layout.tsx` | generateMetadata |
| `app/(Myverse)/myverse/page.tsx` | 메인 (개인 유니버스 대시보드) |
| `app/(Myverse)/myverse/philosophy/page.tsx` | 철학 (데이터 주권, AI 신뢰) |
| `app/(Myverse)/myverse/service/page.tsx` | 서비스 소개 |
| `app/(Myverse)/myverse/technology/page.tsx` | 기술 & 보안 |
| `app/(Myverse)/myverse/roadmap/page.tsx` | 로드맵 |
| `app/(Myverse)/myverse/team/page.tsx` | 팀 소개 |

---

## 현재 상태

| 항목 | 내용 |
|------|------|
| **Phase** | Beta — 개인 데이터 통합 & AI 에이전트 고도화 중 |
| **이월 작업** | 외부 서비스 API 연동 (Google, Apple, Spotify 등) |

---

## 참고

- 서비스 접근 모델: [CLAUDE.md § 1.4](../../CLAUDE.md#14-서비스-접근-모델-6종)
- UOS (Universe Operating System): [docs/Universe_OS_Plan.md](../../docs/Universe_OS_Plan.md)
