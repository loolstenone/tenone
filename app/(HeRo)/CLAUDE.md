# HeRo 브랜드 가이드

> **HeRo** — 심리 검사 기반 커리어 코칭 플랫폼. "당신의 강점을 발견하세요"

---

## 정체성

- **한 줄 소개**: HIT(Holland Interest Theory) 심리 검사 + AI 커리어 상담 시스템
- **톤앤매너**: 따뜻함·희망적·전문적. 사용자의 성장을 응원하는 톤.
- **주 컬러**: 주황색 + 파랑 (긍정·신뢰)
- **디자인 방향**: 검사→결과→코칭. 사용자 여정 중심의 단계별 경험.

---

## 접근 모델

- **유형**: 오픈 + 구매/구독 (HIT 검사 유료, 상담 구독)
- **가입 경로**:
  1. 회원가입 (이메일)
  2. 무료 검사 또는 유료 검사 선택
  3. 결제 (Stripe/Toss)
  4. HIT 검사 실시 (총 60분)
  5. 결과 도출 → 커리어 코칭 시작
- **멤버 권한**:
  - `member` — 기본 회원 (무료 콘텐츠)
  - `purchaser` — 검사 구매자 (결과 조회)
  - `subscriber` — 구독 상담자 (정기 코칭)

---

## 프로필 특화

- **특화 테이블**: `career_profiles`, `hit_results` (검사 결과 저장)
- **고유 필드**:
  - `hit_type` — HIT 유형 (R, I, A, S, E, C 조합, 예: "RIA")
  - `hit_score` — 각 유형별 점수 (0-100)
  - `desired_position` — 희망 직무
  - `desired_industry` — 희망 산업
  - `skills` — 자기 평가 강점 (배열)
  - `coaching_history` — 코칭 이력 (리포트 링크)
- **universe-profile.ts 조회 함수**: `getHeRoProfile(email: string)`

---

## 권한 체계

- **role 종류**:
  - `member` — 기본 회원
  - `purchaser` — 검사 구매자 (context: `brand:hero`)
  - `subscriber` — 정기 상담자 (context: `brand:hero`)
  - `coach` — 상담사 (context: `brand:hero`, 관리자)
- **context**: `brand:hero`
- **인트라 관리 권한**: 없음 (외부 도구)

---

## UC 정책 특이사항

- **브랜드 전용 액션**:
  - `complete_hit_test` — HIT 검사 완료 (생애 1회, 1000 UC)
  - `purchase_coaching` — 코칭 구매 (월 2회, 2000 UC)
- **brand_id 지정**: `brand_id = 'hero'`

---

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `app/(HeRo)/layout.tsx` | generateMetadata |
| `app/(HeRo)/hero/page.tsx` | 랜딩 (검사 소개·CTA) |
| `app/(HeRo)/hero/hit/[type]/page.tsx` | HIT 검사 (6개 페이지: A, B, C, D, E, F) |
| `app/(HeRo)/hero/hit/[type]/test/page.tsx` | 검사 실시 페이지 |
| `app/(HeRo)/hero/hit/results/page.tsx` | 검사 결과 (유형별 설명) |
| `app/(HeRo)/hero/coaching/page.tsx` | 코칭 프로그램 |
| `app/(HeRo)/hero/coaching/ai/page.tsx` | AI 상담 (챗봇) |
| `app/(HeRo)/hero/career/page.tsx` | 커리어 경로 (직무별 추천) |
| `app/(HeRo)/hero/audition/page.tsx` | 면접 준비 (AI 피드백) |
| `app/(HeRo)/hero/branding/page.tsx` | 자기소개 포장 |
| `app/(HeRo)/hero/for-business/page.tsx` | 기업용 (단체 검사) |
| `app/(HeRo)/hero/my/page.tsx` | 마이페이지 (MyProfileCard + 검사 이력) |
| `features/hero/HeRoHeader.tsx` | 헤더 |
| `features/hero/HeRoFooter.tsx` | 푸터 |
| `lib/supabase/hero.ts` | DB 클라이언트 |

---

## 인트라 관리 경로

- 없음 (외부 커리어 상담 도구로 운영)

---

## 개발 주의사항

### HIT 검사 보안

- ❌ 검사 도중 나가기 금지 (진행률 저장 필수)
- ✅ 세션 종료 시 자동 저장 (localStorage에 임시 저장)
- 완료 시에만 `hit_results` INSERT

### 결과 해석

- 결과 도출 후 절대 수정 불가능 (검사 무결성)
- 재검사 필요 시 새로운 `hit_results` 레코드 생성

### AI 코칭

- OpenAI API 호출 (현재 claude-3.5-sonnet 사용 예상)
- 사용자 프라이버시: 코칭 내용 암호화 저장

---

## 현재 상태

| 항목 | 내용 |
|------|------|
| **Phase** | Launch (2026-04-20) — 검사 시스템 안정화 완료. |
| **개발 수준** | 검사·결과·코칭 기본 완성. AI 상담 고도화 진행. |
| **이월 작업** | 없음 — 기본 기능 확정 |
| **최근 결정** | 검사별 페이지 단순화, 결과 해석 상세화 |

---

## 참고

- 서비스 접근 모델: [CLAUDE.md § 1.4](../../CLAUDE.md#14-서비스-접근-모델-6종)
- UC 정책: [docs/Universe_Coin_Policy.md](../../docs/Universe_Coin_Policy.md)
