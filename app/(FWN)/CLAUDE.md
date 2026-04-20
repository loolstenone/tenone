# FWN 브랜드 가이드

> **FWN** — Fashion Week Network. "The World is on the Runway"

---

## 정체성

- **한 줄 소개**: 전 세계 패션 위크를 네트워크로 연결하는 플랫폼
- **톤앤매너**: 전문적·세련됨·글로벌. 패션업계 중심.
- **주 컬러**: 초록색 (#00C853)
- **디자인 방향**: 도시별 패션 위크 + 모델 + 브랜드 정보 + 뉴스

---

## 접근 모델

- **유형**: 오픈 + 구매 (정보 열람은 자유, 네트워킹은 유료)
- **가입 경로**: 회원가입 → 즉시 정보 열람 가능
- **멤버 권한**: member, professional, admin

---

## 프로필 특화

- **특화 테이블**: 없음 (공통 members)
- **고유 필드**: industry_role, location, interests

---

## 권한 체계

- **role 종류**: member, professional, admin
- **context**: `brand:fwn`

---

## UC 정책 특이사항

- **브랜드 전용 액션**: attend_fashion_week (월 2회, 1000 UC)
- **brand_id 지정**: `brand_id = 'fwn'`

---

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `app/(FWN)/layout.tsx` | generateMetadata |
| `app/(FWN)/fwn/page.tsx` | 메인 (패션 위크 지도) |
| `app/(FWN)/fwn/category/[city]/page.tsx` | 도시별 페이지 (Seoul, Paris, NYC 등) |
| `app/(FWN)/fwn/models/page.tsx` | 모델 정보 |
| `app/(FWN)/fwn/brands/page.tsx` | 브랜드 정보 |

---

## 현재 상태

| 항목 | 내용 |
|------|------|
| **Phase** | Beta — 도시별 데이터 수집 중 |
| **이월 작업** | 모델·브랜드 프로필 데이터베이스 구축 |

---

## 참고

- 서비스 접근 모델: [CLAUDE.md § 1.4](../../CLAUDE.md#14-서비스-접근-모델-6종)
