# Seoul360 브랜드 가이드

> **Seoul/360°** — Explore Seoul by Subway. "#ChallengeOnlySubwaySeoulTour"

---

## 정체성

- **한 줄 소개**: 지하철만으로 서울 구석구석을 탐험하는 외국인 여행 가이드
- **톤앤매너**: 활기차고 친근함·다국어(영어 중심)·모험. 여행자 중심.
- **주 컬색**: 노랑 (#F5C518) + 어두운 배경
- **디자인 방향**: 지하철 노선별 + 구별 + 역별 + 서울 외 지역

---

## 접근 모델

- **유형**: 오픈 (로그인 없이 전부 열람 가능)
- **가입 경로**: 없음 (로그인 불필요)
- **멤버 권한**: viewer, contributor, admin

---

## 프로필 특화

- **특화 테이블**: 없음
- **고유 필드**: N/A (콘텐츠 중심 사이트)

---

## 권한 체계

- **role 종류**: viewer, contributor, admin
- **context**: `brand:seoul360`
- **인트라 관리 권한**: `/intra/ums/seoul360` (콘텐츠 관리)

---

## UC 정책 특이사항

- **브랜드 전용 액션**: 없음 (콘텐츠 전용 사이트)
- **brand_id 지정**: `brand_id = 'seoul360'`

---

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `app/(Seoul360)/layout.tsx` | generateMetadata |
| `app/(Seoul360)/seoul360/page.tsx` | 메인 (지하철 탐험 소개) |
| `app/(Seoul360)/seoul360/subway-line/page.tsx` | 지하철 노선별 가이드 |
| `app/(Seoul360)/seoul360/district/page.tsx` | 구별 여행 가이드 |
| `app/(Seoul360)/seoul360/station/page.tsx` | 역별 장소 정보 |
| `app/(Seoul360)/seoul360/outside-seoul/page.tsx` | 서울 외 지역 |

---

## 개발 주의사항

- 영어 우선 콘텐츠 (외국인 대상)
- 인증 없는 사이트 — `authMethods: {email: false, google: false, kakao: false}`
- 지하철 노선·역 정보는 공공데이터 기반

---

## 현재 상태

| 항목 | 내용 |
|------|------|
| **Phase** | Beta — 콘텐츠 수집 및 정리 중 |
| **이월 작업** | 영문 역별 상세 페이지 확장 |

---

## 참고

- 서비스 접근 모델: [CLAUDE.md § 1.4](../../CLAUDE.md#14-서비스-접근-모델-6종)
