# Brand Gravity™ 브랜드 가이드

> **Brand Gravity™** — 브랜딩 컨설팅. "브랜드의 중력을 만드는 전략"

---

## 정체성

- **한 줄 소개**: 브랜드 전략 컨설팅 및 브랜딩 포트폴리오 쇼케이스
- **톤앤매너**: 전문적·신뢰감·전략. 기업 고객 중심.
- **주 컬색**: 깊은 파란색 (#1E3A5F) + 악센트 금색 (#E0A458)
- **디자인 방향**: 서비스 + 포트폴리오 + 상담 신청

---

## 접근 모델

- **유형**: 서비스 + 포트폴리오 (상담 신청 기반)
- **가입 경로**:
  1. 회원가입
  2. 포트폴리오 열람
  3. 상담 신청
- **멤버 권한**: viewer, client, admin

---

## 프로필 특화

- **특화 테이블**: 없음 (공통 members)
- **고유 필드**: company_name, industry, consulting_needs

---

## 권한 체계

- **role 종류**: viewer, client, admin
- **context**: `brand:brandgravity`

---

## UC 정책 특이사항

- **브랜드 전용 액션**: 없음
- **brand_id 지정**: `brand_id = 'brandgravity'`

---

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `app/(BrandGravity)/layout.tsx` | generateMetadata |
| `app/(BrandGravity)/brandgravity/page.tsx` | 메인 |
| `app/(BrandGravity)/brandgravity/services/page.tsx` | 서비스 안내 |
| `app/(BrandGravity)/brandgravity/portfolio/page.tsx` | 컨설팅 포트폴리오 |
| `app/(BrandGravity)/brandgravity/about/page.tsx` | 회사 소개 |

---

## 현재 상태

| 항목 | 내용 |
|------|------|
| **Phase** | Beta (2026-05-17 업데이트) — 브랜딩 컨설팅 포트폴리오 전시 중 |
| **이월 작업** | 상담 신청 시스템 |
| **QA 완료 (2026-05-17)** | Universe 컴포넌트 정합 확인 — `generateMetadata()` ✅ · `UniverseUtilityBar` ✅ · `UniverseMobileMenu` ✅ · `UniverseFooter` ✅ · `LoginModal` ✅ · `loginHref()` ✅ |

---

## 참고

- 서비스 접근 모델: [CLAUDE.md § 1.4](../../CLAUDE.md#14-서비스-접근-모델-6종)
