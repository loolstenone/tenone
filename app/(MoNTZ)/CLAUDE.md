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

> **이 섹션이 곧 법이다. 매 컴포넌트 저장 전 반드시 체크한다.**

### ⚠️ 타이포그래피 — 절대 규칙 (반복 위반 금지)

| 용도 | **허용 토큰** | ❌ 절대 금지 |
|------|-------------|------------|
| 제목·본문·버튼 라벨·날짜·마감일·출연료 등 **정보성 텍스트** | `text-neutral-900` | `text-neutral-600/700`으로 쓰기 |
| 보조 본문 (부제·설명·역할·태그) | `text-neutral-700` 이상 | `text-neutral-500/600`으로 쓰기 |
| 섹션 레이블 (ALL-CAPS 모노, 장식용) | `text-neutral-500` | 실제 정보에 쓰기 |
| placeholder·비활성 상태 | `text-neutral-400` | 실제 정보에 쓰기 |

```
❌ font-bold + text-neutral-500 조합 (굵은데 흐릿 = 즉시 수정)
❌ font-medium 사용 — 반드시 font-bold 이상
❌ font-semibold → font-bold로 통일
❌ 날짜·마감일·페이 등 핵심 정보에 text-neutral-700 이하
```

### ✅ 표준 스니펫

```tsx
// 날짜·마감·페이 등 정보 → neutral-900
<span className="text-[12px] font-bold text-neutral-900">2025.05.31</span>

// 보조 정보 (역할·설명) → neutral-700 이상
<p className="text-[11px] font-bold text-neutral-700">주인공 상대역 (여, 20대)</p>

// 섹션 레이블 (유일하게 neutral-500 허용, ALL-CAPS 조건)
<p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">마감</p>

// 뒤로가기·보조 링크
<Link className="text-[12px] font-semibold text-neutral-700 hover:text-neutral-900">← 목록</Link>
```

### 컴포넌트 저장 전 체크리스트

- [ ] 날짜·마감·페이·이메일 등 실제 정보 → `text-neutral-900`?
- [ ] 역할·태그·부제 등 보조 정보 → `text-neutral-700` 이상?
- [ ] 버튼 라벨에 `text-neutral-600` 이하 없나?
- [ ] `font-bold`인데 `text-neutral-500` 이하 없나?
- [ ] `font-medium` / `font-semibold` 사용 없나? (→ `font-bold`로)

### 선(Divider) 시스템

| 용도 | 클래스 |
|------|--------|
| 페이지 헤더 하단, 테이블 헤더, 스티키 바 | `border-b border-neutral-200` |
| 콘텐츠 내부 행 구분 | `border-b border-neutral-100` |

❌ `border-neutral-300` 구조 선에 사용 금지

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
| **Phase** | **Beta** (2026-05-17 양방향 완성) — 모델·배우 작품 업로드 + 캐스팅 디렉터 컨택 + 오디션 응시 흐름 모두 가동 |
| **완료** | 페이지 8개(홈·탐색·프로필·오디션·my·about·[handle]·**upload**) + 6 DB 테이블 + 3 신규 흐름 |
| **이월 작업** | (1) 팔로우 기능 (현재 placeholder), (2) 헤더 네비에 upload 직접 진입점, (3) 인트라 응시·컨택 관리 패널 |

### 신규 흐름 3건 (2026-05-17 양방향 활성화)

#### 1. 모델·배우 작품 업로드
- 페이지: [app/(MoNTZ)/montz/upload/page.tsx](app/(MoNTZ)/montz/upload/page.tsx) — 폼(제목·카테고리·설명·태그·이미지 5장) + Storage 병렬 업로드 + montz_works INSERT
- Storage 버킷 `montz-works` (public, 10MB, jpeg/png/webp) — 사용자 폴더 분리 (`{userId}/...`)
- RLS: 본인 폴더만 INSERT/UPDATE/DELETE, public read
- 라이브러리: `uploadWorkImage` · `createMyWork` · `getMyWorks` · `deleteMyWork` ([lib/supabase/montz.ts](../../lib/supabase/montz.ts))

#### 2. 캐스팅 디렉터 → 모델·배우 컨택
- DB: `montz_contact_requests` (target_creator_id, sender_name/email/company/role_title, message, status 4단계)
- API: [app/api/montz/contact/route.ts](app/api/montz/contact/route.ts) — RLS 우회 INSERT + Resend 이메일 발송 (모델 user_id → auth.users.email)
- UI: [features/montz/ContactModal.tsx](../../features/montz/ContactModal.tsx) — 비로그인도 사용 가능 (이메일 필수). 로그인 사용자는 sender_user_id 자동 첨부
- 진입점: [app/(MoNTZ)/montz/[handle]/page.tsx](app/(MoNTZ)/montz/[handle]/page.tsx) "DM 보내기" → "캐스팅 제안" 버튼 (#c8a97e 강조)

#### 3. 모델·배우 → 오디션 응시
- DB: `montz_audition_applications` (audition_id × creator_id UNIQUE, message, applicant_email, status 5단계)
- API: [app/api/montz/applications/route.ts](app/api/montz/applications/route.ts) — Bearer 인증 + INSERT + 캐스팅 디렉터(`audition.contact_email`)에게 Resend 이메일 발송
- UI: [features/montz/AuditionApplyModal.tsx](../../features/montz/AuditionApplyModal.tsx) — 비로그인은 안내 후 차단, 메시지+이메일 입력
- 진입점: [app/(MoNTZ)/montz/audition/page.tsx](app/(MoNTZ)/montz/audition/page.tsx) DetailView 액션 영역 최상단 "이 공고에 응시하기" (#c8a97e)

### `/montz/my` 마이페이지 — 3 신규 탭

| 탭 | 소스 | 동작 |
|---|---|---|
| **내 작품** | `getMyWorks` | 그리드 + 호버 시 삭제. "새 작품 업로드" CTA |
| **받은 제안** | `getMyReceivedContacts` | 카드 + 수락/거절/확인만 + 답장 mailto. 신규(pending) 카운트 배지 강조 |
| **신청 오디션** | `getMyApplications` | 카드 + 상태 5단계(pending/seen/shortlisted/rejected/cast) |

### 실 데이터 현황 (Prod, 2026-05-17 실측)

| 테이블 | 행 수 | 컬럼 수 |
|---|---|---|
| `montz_creators` | 8 | 32 |
| `montz_works` | 6 | 11 |
| `montz_auditions` | 6 | 14 |
| `montz_verification_requests` | 0 | 13 |
| `montz_contact_requests` | 0 | 11 (신규) |
| `montz_audition_applications` | 0 | 9 (신규) |

---

## 참고

- 서비스 접근 모델: [CLAUDE.md § 1.4](../../CLAUDE.md#14-서비스-접근-모델-6종)
- JAKKA 디자인 표준: [app/(Jakka)/CLAUDE.md](../\(Jakka\)/CLAUDE.md)
