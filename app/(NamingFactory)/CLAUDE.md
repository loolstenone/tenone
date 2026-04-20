# NamingFactory 브랜드 가이드

> **Naming Factory** — 네이밍 서비스. "브랜드·제품·서비스의 이름을 짓는 전문 서비스"

---

## 정체성

- **한 줄 소개**: 전문 네이밍 컨설팅 + AI 네이밍 도구
- **톤앤매너**: 창의적·전략적·신뢰. 기업 고객 중심.
- **주 컬색**: 노랑 (#FCD34D)
- **디자인 방향**: 네이밍 도구 + 포트폴리오 + 상담 신청

---

## 접근 모델

- **유형**: 서비스 + 도구 (기본 네이밍 도구 자유, 상담은 유료)
- **가입 경로**:
  1. 회원가입
  2. 네이밍 도구 사용 가능
  3. 상담 신청 가능
- **멤버 권한**: user, client, admin

---

## 프로필 특화

- **특화 테이블**: 없음 (공통 members)
- **고유 필드**: company_name, naming_type (brand/product/service), industry

---

## 권한 체계

- **role 종류**: user, client, admin
- **context**: `brand:namingfactory`

---

## UC 정책 특이사항

- **브랜드 전용 액션**: generate_names (월 5회, 무료)
- **brand_id 지정**: `brand_id = 'namingfactory'`

---

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `app/(NamingFactory)/layout.tsx` | generateMetadata |
| `app/(NamingFactory)/namingfactory/page.tsx` | 메인 |
| `app/(NamingFactory)/namingfactory/tool/page.tsx` | AI 네이밍 도구 |
| `app/(NamingFactory)/namingfactory/portfolio/page.tsx` | 컨설팅 포트폴리오 |
| `app/(NamingFactory)/namingfactory/consult/page.tsx` | 상담 신청 |

---

## 현재 상태

| 항목 | 내용 |
|------|------|
| **Phase** | Beta — AI 네이밍 모델 학습 중 |
| **이월 작업** | 맥락 기반 네이밍 생성 고도화 |

---

## 참고

- 서비스 접근 모델: [CLAUDE.md § 1.4](../../CLAUDE.md#14-서비스-접근-모델-6종)
