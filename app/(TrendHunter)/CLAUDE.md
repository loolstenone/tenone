# TrendHunter 브랜드 가이드

> **Trend Hunter** — AI가 데이터를 읽고, 우리가 트렌드를 만든다

---

## 정체성

- **한 줄 소개**: AI 기반 트렌드 분석 및 콘텐츠 보고서 플랫폼
- **톤앤매너**: 전문적·데이터 중심·실행력. 마케팅 의사결정 지원.
- **주 컬색**: 빨강 (#E50000) + 노랑 (#FFB800)
- **디자인 방향**: Weekly 리포트 + Signals + References + Opportunities

---

## 접근 모델

- **유형**: 구독 기반 (주간 리포트 구독)
- **가입 경로**:
  1. 회원가입
  2. 구독 선택 (Free/Pro/Business)
  3. 리포트 열람 가능
- **멤버 권한**: subscriber, analyst, admin

---

## 프로필 특화

- **특화 테이블**: 없음 (공통 members + 구독 정보)
- **고유 필드**: subscription_plan, interests_tags

---

## 권한 체계

- **role 종류**: subscriber, analyst, admin
- **context**: `brand:trendhunter`

---

## UC 정책 특이사항

- **브랜드 전용 액션**: download_report (월 3회, 500 UC)
- **brand_id 지정**: `brand_id = 'trendhunter'`

---

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `app/(TrendHunter)/layout.tsx` | generateMetadata |
| `app/(TrendHunter)/trendhunter/page.tsx` | 메인 (최신 리포트) |
| `app/(TrendHunter)/trendhunter/weekly/page.tsx` | Weekly 리포트 아카이브 |
| `app/(TrendHunter)/trendhunter/signals/page.tsx` | 트렌드 신호 |
| `app/(TrendHunter)/trendhunter/references/page.tsx` | 참고 자료 |
| `app/(TrendHunter)/trendhunter/opportunities/page.tsx` | 기회 분석 |

---

## 현재 상태

| 항목 | 내용 |
|------|------|
| **Phase** | Beta — AI 크롤링 & 분석 고도화 중 |
| **이월 작업** | 구독 시스템 연동 |

---

## 참고

- 서비스 접근 모델: [CLAUDE.md § 1.4](../../CLAUDE.md#14-서비스-접근-모델-6종)
