# MoNTZ 브랜드 가이드

> **MoNTZ** — 모델·배우를 위한 포트폴리오 & 오디션 플랫폼

---

## 정체성

- **한 줄 소개**: 모델·배우가 포트폴리오를 공개하고, 오디션·캐스팅 공고에 지원하는 플랫폼
- **톤앤매너**: 미니멀·세련됨·전문성. 크리에이터가 주인공.
- **주 컬러**: 검정·흰색 기반 + 골드 악센트 `#c8a97e` (MoNTZ "o" 자에만)
- **디자인 방향**: JAKKA 클론 구조 (InstaLayout + PageHeader + 3-tier divider). 인물 사진 포트레이트(3:4) 중심.
- **레퍼런스**: OURCOVERS (4-col model cards, measurements), OTR (audition board)

---

## 🏗️ UI 컴포넌트 표준

> **JAKKA 가이드와 동일** (`app/(Jakka)/CLAUDE.md § UI 컴포넌트 표준` 참조). 차이점만 아래에 기재.

### MoNTZ 전용 규칙

- **크리에이터 카드**: `aspect-[3/4]` (포트레이트 세로형) — 가로형 금지
- **측정 정보 표시**: `border border-neutral-100 px-3 py-2` 박스 안에, 라벨은 `text-[10px] font-bold text-neutral-500 uppercase tracking-wider`
- **골드 악센트 사용처**: verified badge (BadgeCheck 아이콘), 인증 뱃지 배경색 — 그 외 사용 금지
- **availability 배지**:
  - `active` → `bg-emerald-50 text-emerald-700` + `bg-emerald-400` dot
  - `selective` → `bg-amber-50 text-amber-700` + `bg-amber-400` dot
  - `inactive` → `bg-neutral-100 text-neutral-500` + `bg-neutral-300` dot

---

## 접근 모델

- **유형**: 오픈 (포트폴리오 공개, 오디션 열람 모두 가능)
- **가입 경로**: 회원가입 → 핸들 설정 → `montz_creators` 레코드 생성
- **멤버 권한**: viewer (열람), creator (포트폴리오 업로드), admin (관리)

---

## 프로필 특화

- **특화 테이블**: `montz_creators`
- **고유 필드**: handle, type(model/actor/both), height, bust/waist/hip, shoe_size, hair_color, eye_color, availability_status, is_verified
- **universe-profile.ts 조회 함수**: `getMontzProfile()` (미구현 — 추후 추가)

---

## 권한 체계

- **role 종류**: viewer, creator, admin
- **context**: `brand:montz`
- **인트라 관리 권한**: `/intra/ums/montz/*` (미구현)

---

## UC 정책 특이사항

- **브랜드 전용 액션**: 없음 (공통 UC 정책 적용)
- **brand_id 지정**: `brand_id = 'montz'`

---

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `app/(MoNTZ)/layout.tsx` | generateMetadata + MontzInstaLayout 래퍼 |
| `features/montz/MontzInstaLayout.tsx` | JAKKA 클론 레이아웃 (sidebar + mobile nav) |
| `lib/supabase/montz.ts` | 타입 + 목 데이터 + DB 쿼리 함수 |
| `app/(MoNTZ)/montz/page.tsx` | 홈 (featured 2장 + 그리드) |
| `app/(MoNTZ)/montz/explore/page.tsx` | 탐색 (검색 + 유형 필터 + 크리에이터 그리드) |
| `app/(MoNTZ)/montz/[handle]/page.tsx` | 공개 프로필 (측정 정보 + 포트폴리오 그리드) |
| `app/(MoNTZ)/montz/profile/page.tsx` | 본인 프로필 |
| `app/(MoNTZ)/montz/audition/page.tsx` | 오디션 공고 (WANTS 클론) |

---

## DB 테이블 (미생성 — 목 데이터 폴백 사용 중)

```sql
montz_creators   -- 크리에이터 프로필 (handle, type, measurements, availability)
montz_works      -- 포트폴리오 작업물 (images, category, tags)
montz_auditions  -- 오디션 공고 (company, role, type, deadline, pay)
```

> ⚠️ DB 테이블 미생성 상태. `lib/supabase/montz.ts`의 쿼리 함수들이 에러 시 목 데이터 반환.

---

## 인트라 관리 경로

- `/intra/ums/montz/*` — 미구현 (Phase 2 이후)

---

## 개발 주의사항

- ❌ 구 `MoNTZHeader` / `MoNTZFooter` 사용 금지 (파일 존재하지만 layout.tsx에서 제거됨)
- ✅ `MontzInstaLayout` 전용 레이아웃으로 교체 완료
- `profile/page.tsx`는 현재 `MOCK_HANDLE = "jiwon.oh"` 고정 — 실 DB 연결 시 `user.email`로 조회 로직 교체 필요
- 커버 이미지: `montz_creators.cover_url` (nullable) — 없으면 커버 섹션 숨김
- 포트폴리오 이미지: `aspect-square` 3열 그리드 (JAKKA 동일)

---

## 현재 상태

| 항목 | 내용 |
|------|------|
| **Phase** | Alpha (2026-04-20) — 핵심 5페이지 완성, DB 미연결 (목 데이터) |
| **완료** | layout 교체, 홈·탐색·프로필·오디션·업로드 페이지 구조 |
| **이월 작업** | DB 테이블 생성 + 실 데이터 연결, `/montz/upload` 페이지, 팔로우/연락 기능 |

---

## 참고

- 서비스 접근 모델: [CLAUDE.md § 1.4](../../CLAUDE.md#14-서비스-접근-모델-6종)
- JAKKA 디자인 표준: [app/(Jakka)/CLAUDE.md](../\(Jakka\)/CLAUDE.md)
