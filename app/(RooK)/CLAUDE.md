# RooK 브랜드 가이드

> **RooK** — AI Creator. "밈에서 영화까지, 루크의 창작 영역에는 경계가 없습니다"

---

## 정체성

- **한 줄 소개**: AI 기반 창작 플랫폼 (영상·이미지·음악 생성 및 공유)
- **톤앤매너**: 자유로움·창의적·도전적. 아티스트 중심.
- **주 컬러**: 초록색 (#00d255)
- **디자인 방향**: 갤러리 + 크리에이션 도구. 사용자가 만드는 콘텐츠 중심.

---

## 접근 모델

- **유형**: 오픈 (누구나 가입 후 창작 가능)
- **가입 경로**:
  1. 회원가입 (이메일)
  2. 즉시 창작 도구 접근 가능
  3. `members` 레코드 생성
- **멤버 권한**:
  - `member` — 기본 크리에이터
  - `creator` — 인증 크리에이터
  - `admin` — 운영진

---

## 프로필 특화

- **특화 테이블**: 없음 (공통 members 테이블)
- **고유 필드**: 창작 이력 (followers, works_count, verified_status)

---

## 권한 체계

- **role 종류**: member, creator, admin
- **context**: `brand:rook`

---

## UC 정책 특이사항

- **브랜드 전용 액션**: create_work (월 10회, 무료)
- **brand_id 지정**: `brand_id = 'rook'`

---

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `app/(RooK)/layout.tsx` | generateMetadata |
| `app/(RooK)/rook/page.tsx` | 갤러리 (추천 작품) |
| `app/(RooK)/rook/create/page.tsx` | 창작 도구 |
| `app/(RooK)/rook/explore/page.tsx` | 작품 탐색 |
| `app/(RooK)/rook/my/page.tsx` | 마이페이지 |

---

## 현재 상태

| 항목 | 내용 |
|------|------|
| **Phase** | Beta — 창작 도구 구축 중 |
| **이월 작업** | AI 생성 모델 연동 |

---

## 참고

- 서비스 접근 모델: [CLAUDE.md § 1.4](../../CLAUDE.md#14-서비스-접근-모델-6종)
