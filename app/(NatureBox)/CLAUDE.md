# NatureBox 브랜드 가이드

> **자연함(NatureBox)** — 정선의 자연을 담다. "한소농장에서 전하는 건강한 먹거리"

---

## 정체성

- **한 줄 소개**: 강원도 정선 기반 자연식품 브랜드 (로컬 농산물 판매)
- **톤앤매너**: 정성스러움·자연스러움·건강. 농가 중심.
- **주 컬러**: 올리브 (#6B8E23)
- **디자인 방향**: 정선 이야기 + 우리 먹거리 + 방문 안내

---

## 접근 모델

- **유형**: 오픈 + 판매 (제품 정보는 자유, 구매는 외부 플랫폼)
- **가입 경로**: 회원가입 (선택적) → 제품 정보 열람
- **멤버 권한**: member, admin

---

## 프로필 특화

- **특화 테이블**: 없음 (공통 members)
- **고유 필드**: region, farm_interest

---

## 권한 체계

- **role 종류**: member, admin
- **context**: `brand:naturebox`

---

## UC 정책 특이사항

- **브랜드 전용 액션**: 없음
- **brand_id 지정**: `brand_id = 'naturebox'`

---

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `app/(NatureBox)/layout.tsx` | generateMetadata |
| `app/(NatureBox)/naturebox/page.tsx` | 메인 (제품 쇼케이스) |
| `app/(NatureBox)/naturebox/about/page.tsx` | 자연함 이야기 |
| `app/(NatureBox)/naturebox/products/page.tsx` | 우리 먹거리 |
| `app/(NatureBox)/naturebox/jeongseon/page.tsx` | 정선 이야기 |
| `app/(NatureBox)/naturebox/visit/page.tsx` | 오시는 길 |

---

## 현재 상태

| 항목 | 내용 |
|------|------|
| **Phase** | Beta — 로컬 식품 브랜딩 중 |
| **이월 작업** | 온라인 판매 채널 연결 |

---

## 참고

- 서비스 접근 모델: [CLAUDE.md § 1.4](../../CLAUDE.md#14-서비스-접근-모델-6종)
