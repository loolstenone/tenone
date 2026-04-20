# Mindle 브랜드 가이드

> **Mindle** — 트렌드의 홀씨를 찾아, 인사이트로 피워냅니다

---

## 정체성

- **한 줄 소개**: AI 기반 트렌드 분석 플랫폼 (데이터 크롤링 → 인사이트 큐레이션)
- **톤앤매너**: 영감적·데이터 중심·큐레이션. 트렌드 허브.
- **주 컬러**: 노랑 (#F5C518)
- **디자인 방향**: 트렌드 카드 + 리포트 + 데이터 + 레퍼런스

---

## 접근 모델

- **유형**: 오픈 + 구독 (카드는 자유, 상세 리포트는 유료)
- **가입 경로**: 회원가입 → 트렌드 피드 열람 가능
- **멤버 권한**: member, subscriber, analyst, admin

---

## 프로필 특화

- **특화 테이블**: 없음 (공통 members)
- **고유 필드**: interest_categories, subscription_level

---

## 권한 체계

- **role 종류**: member, subscriber, analyst, admin
- **context**: `brand:mindle`

---

## UC 정책 특이사항

- **브랜드 전용 액션**: save_report (월 5회, 무료)
- **brand_id 지정**: `brand_id = 'mindle'`

---

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `app/(Mindle)/layout.tsx` | generateMetadata |
| `app/(Mindle)/mindle/page.tsx` | 메인 (트렌드 피드) |
| `app/(Mindle)/mindle/trends/page.tsx` | 트렌드 검색 |
| `app/(Mindle)/mindle/reports/page.tsx` | 리포트 아카이브|
| `app/(Mindle)/mindle/data/page.tsx` | 데이터 시각화 |
| `app/(Mindle)/mindle/references/page.tsx` | 참고 자료 |

---

## 현재 상태

| 항목 | 내용 |
|------|------|
| **Phase** | Beta — AI 크롤러 고도화 중 |
| **이월 작업** | Mindle 뉴스레터 자동화 (Intra Marketing 연동) |

---

## 참고

- 서비스 접근 모델: [CLAUDE.md § 1.4](../../CLAUDE.md#14-서비스-접근-모델-6종)
- WIO 모듈: [Crawler + Content Pipeline](../../CLAUDE.md#7가지-wio-모듈)
