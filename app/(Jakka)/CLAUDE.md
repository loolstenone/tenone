# Jakka 브랜드 가이드

> **JAKKA** — 아티스트·크리에이터를 위한 포트폴리오 & 마켓플레이스

---

## 정체성

- **한 줄 소개**: 작가가 주인공인 포트폴리오 + 스토리 플랫폼 (Brunch 감성 · 작가들의 마을)
- **톤앤매너**: 미니멀하지만 또렷함. "흐릿한 갤러리"가 아니라 "또렷한 인쇄물".
- **주 컬러**: 검정·흰색 기반. 본문은 반드시 가독성 확보 (본문은 검정에 준하는 톤)
- **디자인 방향**: 4단계 여정 (피드 → 포트폴리오 → 쇼케이스 → 마켓). 이미지와 글이 함께 숨 쉰다.

---

## 🏗️ UI 컴포넌트 표준 — 반드시 이것만 쓸 것

> **새 페이지 만들기 전 이 섹션을 먼저 읽어라.** 매 페이지마다 다르게 구현하면 안 된다.

### 페이지 헤더

모든 Jakka 페이지는 `<PageHeader>` 컴포넌트를 사용한다. 직접 div 구현 금지.

```tsx
import { PageHeader } from "@/features/jakka/PageHeader";

// eyebrow: 영어, title: 한국어, action: 오른쪽 버튼 (선택)
<PageHeader
    eyebrow="Market"
    title="마켓"
    subtitle="작가의 작품·굿즈·피규어를 직접 구매하세요."
    action={<button className="inline-flex items-center gap-1.5 text-[12px] font-bold text-neutral-900 border border-neutral-900 px-3 py-2 hover:bg-neutral-900 hover:text-white transition-colors">...</button>}
/>
```

**규칙:**
- eyebrow: 영어 (예: "Market", "Showcase", "Explore")
- title: **반드시 한국어** (✅ 마켓, 쇼케이스, 작가 탐색 / ❌ WANTS, MARKET)
- subtitle: `text-neutral-700` (PageHeader가 자동 처리)
- action 버튼: `border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white` 패턴

### 탭/필터 버튼

**전 페이지 통일: 네모 pill 버튼** (underline 탭 금지)

```tsx
// sticky 필터 바
<div className="sticky top-[44px] md:top-0 z-10 bg-white border-b border-neutral-200">
    <div className="px-5 py-2.5 flex gap-1.5 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => (
            <button
                key={tab.key}
                onClick={() => setActive(tab.key)}
                className={`shrink-0 text-[12px] font-bold px-3 py-1.5 border transition-colors ${
                    active === tab.key
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-300 text-neutral-500 hover:border-neutral-700"
                }`}
            >
                {tab.label}
            </button>
        ))}
    </div>
</div>
```

**규칙:**
- active: `border-neutral-900 bg-neutral-900 text-white`
- inactive: `border-neutral-300 text-neutral-500 hover:border-neutral-700`
- 폰트: `text-[12px] font-bold`
- overflow 탭은 `overflow-x-auto scrollbar-none` + 각 버튼에 `shrink-0`
- ❌ underline `border-b-2 -mb-px` 방식 금지
- ❌ `text-neutral-400` inactive 색상 금지 (항상 `text-neutral-500`)
- ❌ 타입별 colored active state — Wants의 채용=파란색 같은 방식은 허용 예외

### 선(Divider) 시스템 — 3단계만 허용

| 용도 | 클래스 | 예시 |
|------|--------|------|
| **메이저 구분** — 페이지 헤더 하단, 스티키 탭바/필터바 하단, 헤더↔콘텐츠 경계 | `border-b border-neutral-200` | PageHeader, 탭바 sticky div |
| **마이너 구분** — 콘텐츠 내부, 통계 행, 리스트 아이템 사이 | `border-b border-neutral-100` / `border-y border-neutral-100` | 통계 row, notice list |
| **그리드** | `gap` 사용, border 없음 | 카드 그리드 |

```tsx
// ✅ 스티키 필터/탭바
<div className="sticky top-[44px] md:top-0 z-10 bg-white border-b border-neutral-200 px-5 py-2.5">

// ✅ 콘텐츠 내 섹션 구분
<div className="border-t border-neutral-100 mt-4 pt-4">

// ✅ 통계 행
<div className="flex justify-between border-y border-neutral-100 py-3">
```

**금지:**
- ❌ `border-neutral-300` — 구조 선에 사용 금지 (너무 강함)
- ❌ 스티키 바에 `border-neutral-100` — 너무 약해 구분 안 됨
- ❌ 동일 영역에서 200/100 혼용

### 카드 텍스트 계층

```tsx
// 크리에이터 handle / 메타
<p className="text-[11px] font-mono text-neutral-500">@handle</p>
// 카드 제목 — font-semibold 금지, 반드시 font-bold 이상
<p className="text-[13px] font-bold text-neutral-900 leading-snug line-clamp-2">제목</p>
// 가격 / 주요 수치
<p className="text-[14px] font-black text-neutral-900">320,000원</p>
```

---

## ⚠️ 디자인 규칙 — 가독성 우선 (반복 위반 = 즉시 수정)

> **이 규칙은 매 컴포넌트 작성마다 체크한다.** 위반이 누적되고 있다 (2026-04 다수 사고).
> Jakka = "흐릿한 갤러리"가 아니라 **"또렷한 인쇄물"**. 미니멀 ≠ 흐릿.

### Tailwind 중성 톤 사용 기준 (neutral-*)

| 용도 | **허용 토큰** | 위반 예시 |
|------|-------------|---------|
| 제목·본문·버튼 라벨 | **`text-neutral-900`** | ❌ neutral-600/700으로 쓰는 것 |
| 보조 본문 (부제·설명·날짜·장소) | **`text-neutral-700`** 이상 | ❌ neutral-500/600으로 쓰는 것 |
| 섹션 레이블 (ALL-CAPS 모노) | `text-neutral-500` | ALL-CAPS 장식 레이블만 허용 |
| placeholder·비활성 상태 | `text-neutral-400` | 실제 정보에 쓰면 절대 안 됨 |
| 테두리·구분선·배경 | `border-neutral-100/200` / `bg-neutral-50` | **글에는 금지** |

### 🚨 절대 금지 (2026-04 반복 위반 목록)

```
❌ text-neutral-600 — 날짜, 장소, 설명 등 정보성 텍스트에 사용
❌ text-neutral-500 이하로 버튼 라벨 쓰기
❌ font-bold + text-neutral-500 조합 (굵은데 흐릿 = 모호)
❌ border-neutral-300 버튼에서 text color 미지정 → 부모 상속으로 흐릿해짐
❌ 카드 제목을 text-neutral-500 이하로 쓰기
❌ 본문·설명에 페이드 아웃 그라디언트
```

### ✅ 표준 스니펫 — 이것만 복사해서 쓸 것

```tsx
// 날짜/장소/메타 (정보성 → neutral-900)
<span className="flex items-center gap-1.5 text-[13px] text-neutral-900">
    <Calendar className="h-3.5 w-3.5 text-neutral-500" />
    2026-05-14 ~ 2026-05-28
</span>

// 버튼 (테두리 버튼은 반드시 text-neutral-900 명시)
<button className="text-[12px] font-semibold text-neutral-900 border border-neutral-900 px-3 py-1.5 hover:bg-neutral-900 hover:text-white">
    공유
</button>

// 리스트 카드
<p className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">카테고리</p>
<h3 className="text-[16px] font-bold text-neutral-900">제목</h3>
<p className="text-[13px] text-neutral-700 line-clamp-2">부제·요약</p>
<p className="text-[11px] text-neutral-700">날짜 · 장소</p>

// 상세 페이지
<h1 className="text-[28px] font-black text-neutral-900">제목</h1>
<p className="text-[16px] text-neutral-700">부제</p>
<p className="text-[15px] leading-[1.9] text-neutral-900">본문</p>

// 섹션 레이블 (유일하게 neutral-500 허용)
<p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em]">섹션명</p>
```

### 체크리스트 — 컴포넌트 저장 전 확인

- [ ] 날짜·장소·이름 등 실제 정보 → `text-neutral-900` 또는 `text-neutral-700`?
- [ ] 버튼 라벨 → `text-neutral-900` 명시했나?
- [ ] 버튼에 `text-neutral-600` 이하 없나?
- [ ] `font-bold`인데 `text-neutral-500` 이하 없나?
- [ ] `border-*` 버튼에서 텍스트 색상 부모 상속 의존 없나?

### 컬러 팔레트 (브랜드별 악센트는 최소한만)

| 용도 | 토큰 |
|------|------|
| 승인/성공 | `text-green-600` (아이콘만 — 본문은 검정) |
| 거부/오류 | `text-red-600` |
| 대기/정보 | `text-amber-600` |
| 링크 hover | `hover:text-neutral-900` (기본이 이미 900이면 `hover:opacity-70`) |

---

## 접근 모델

- **유형**: 오픈 (누구나 크리에이터 포트폴리오 공개 가능)
- **가입 경로**:
  1. 회원가입 (이메일)
  2. 크리에이터 핸들 설정 (`@handle`, 고유)
  3. `jakka_creators` 레코드 자동 생성
  4. 작품 업로드 가능 (`jakka_works`)
- **멤버 권한**:
  - `member` — 열람자 (포트폴리오 감상)
  - `creator` — 크리에이터 (작품 업로드·판매)
  - `admin` — 운영진 (평가 시스템 관리)

---

## 프로필 특화

- **특화 테이블**: `jakka_creators` (크리에이터 프로필)
- **고유 필드**:
  - `handle` — 크리에이터 핸들 (@username, 고유)
  - `category` — 전공 (사진, 일러스트, 그래픽, 영상, 공예 등)
  - `bio` — 자기소개
  - `portfolio_links` — 외부 링크 (Behance, Instagram 등)
  - `follower_count` — 팔로워 수 (캐시)
  - `is_verified` — 인증 크리에이터 여부
- **universe-profile.ts 조회 함수**: `getJakkaProfile(email: string)`

---

## 권한 체계

- **role 종류**:
  - `member` — 일반 사용자 (열람 전용)
  - `creator` — 크리에이터 (작품 업로드·판매)
  - `admin` — 운영진 (context: `brand:jakka`)
- **context**: `brand:jakka`
- **인트라 관리 권한**: `/intra/ums/jakka/*` (2개 패널)

---

## UC 정책 특이사항

- **브랜드 전용 액션**:
  - `upload_work` — 작품 업로드 (월 5회, 무료)
  - `create_collection` — 콜렉션 생성 (월 1회, 500 UC)
  - `share_portfolio` — 포트폴리오 공유 (월 3회, 200 UC)
- **brand_id 지정**: `brand_id = 'jakka'` (Jakka 전용)
- **판매 보상**: 마켓 판매 시 Jakka가 수수료 일부를 UC로 지급하는 방식 검토 중

---

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `app/(Jakka)/layout.tsx` | generateMetadata |
| `app/(Jakka)/jakka/page.tsx` | 갤러리 홈 (추천 작품·작가) |
| `app/(Jakka)/jakka/explore/page.tsx` | 작품 탐색 (카테고리·필터·검색) |
| `app/(Jakka)/jakka/market/page.tsx` | 마켓 (판매 상품 카테고리) |
| `app/(Jakka)/jakka/market/[id]/page.tsx` | 상품 상세 (찜·공유·관련작품·스펙·조회수·입고알림·Q&A·구매플로우) |
| `app/(Jakka)/jakka/market/apply/page.tsx` | 마켓 입점 신청 (소개·포트폴리오·정산계좌·약관) |
| `app/(Jakka)/jakka/market/upload/page.tsx` | 작품 등록 (승인 작가만) |
| `app/(Jakka)/jakka/market/edit/[id]/page.tsx` | 상품 수정 |
| `app/(Jakka)/jakka/seller/page.tsx` | 판매자 센터 (홈·상품·주문·문의·설정 탭) |
| `features/jakka/PurchaseModal.tsx` | 구매 문의 접수 모달 |
| `app/intra/ums/jakka/sellers/page.tsx` | 인트라 마켓 판매자 심사 |
| `app/api/intra/jakka/sellers/route.ts` | 심사 승인·반려 API |
| `app/(Jakka)/jakka/showcase/[slug]/page.tsx` | 쇼케이스 상세 (공유·위치·관람정보·작가 업데이트·참가 작가 편집·카운트다운) |
| `app/(Jakka)/jakka/showcase/new/page.tsx` | 쇼케이스 신청 (3명 승인·오픈시간 분단위·publish_mode) |
| `app/intra/ums/jakka/market/page.tsx` | 인트라 마켓 관리 (개요/상품/주문 + 매출·수수료) |
| `app/intra/ums/jakka/showcases/page.tsx` | 인트라 쇼케이스 관리 (5탭 + 강제 승인/반려/종료) |
| `app/api/intra/jakka/market/route.ts` | 인트라 마켓 조회 API (products/orders/stats) |
| `app/api/intra/jakka/showcases/route.ts` | 인트라 쇼케이스 조회/조치 API |
| `app/(Jakka)/jakka/category/page.tsx` | 카테고리 인덱스 |
| `app/(Jakka)/jakka/[handle]/page.tsx` | 크리에이터 포트폴리오 공개 |
| `app/(Jakka)/jakka/profile/page.tsx` | 크리에이터 프로필 (본인 편집) |
| `app/(Jakka)/jakka/upload/page.tsx` | 작품 업로드 |
| `app/(Jakka)/jakka/settings/page.tsx` | 계정 설정 (포트폴리오 공개·비공개 등) |
| `app/(Jakka)/jakka/wants/page.tsx` | 찾는 작품 공고 (의뢰 기능) |
| `app/(Jakka)/jakka/my/page.tsx` | 마이페이지 (MyProfileCard + 내 작품) |
| `features/jakka/JakkaInstaLayout.tsx` | 인스타 스타일 레이아웃 (모바일 최적화) |
| `lib/supabase/jakka.ts` | DB 클라이언트 |
| `app/api/jakka/*` | API 라우트 (현재 불필요, 공유 API 사용 중) |

---

## 인트라 관리 경로

| 경로 | 역할 |
|------|------|
| `/intra/ums/jakka` | 크리에이터·작품 관리 |
| `/intra/ums/jakka/notices` | 공지사항 및 공고 관리 |

---

## 개발 주의사항

### 포트폴리오 공개 설정

- ❌ 크리에이터가 프로필을 "비공개"로 설정했으면 `/jakka/[handle]` 접근 차단 (404 아님)
- ✅ 본인만 접근 가능하게 처리 (마이페이지에서만 열람)

### 작품 이미지 처리

- **업로드 경로**: Supabase Storage `jakka-works` 버킷
- **리사이징**: 클라이언트에서 썸네일(400×300) + 전체(1200×800) 2종 저장
- **WebP 압축**: 품질 85% (갤러리 용도이므로 품질 중시)

### 핸들 고유성

- `jakka_creators.handle`에 UNIQUE 제약
- 중복 시 에러 메시지: "이미 사용 중인 핸들입니다. 다른 이름을 시도해보세요."
- 핸들 수정 불가능 (생성 후 변경 금지)

### 마켓 마킹

- 나침반 아이콘 → Store 아이콘으로 교체 (마켓 링크)
- 마켓 상품은 "판매 상품"이지 "서비스 의뢰"가 아님 (작품·굿즈·피규어 판매만)
- 현재 mock 데이터 상태 — DB 테이블 `jakka_products` 생성 필요

---

## 현재 상태

| 항목 | 내용 |
|------|------|
| **Phase** | Beta (2026-04-21) — 마켓 디테일 8기능 + 입점 승인제 + 판매자 센터 완성 |
| **개발 수준** | 포트폴리오·탐색·업로드 + 마켓 전체 플로우(목록→상세→신청→승인→등록→판매→정산) 완성 |
| **이월 작업** | 입점 승인/반려 시 이메일 알림, 정산 리포트 자동 생성, 구매 실결제 통합 |
| **최근 결정** | NFT 카테고리 완전 제거 (실체 없이 메타데이터만 있는 상태라 제거) / 플랫폼 수수료 15% 기본 / 주문 MVP = 구매 문의 접수 (실결제 후속) / 품절 시 입고 알림 신청 |

### Phase A 마켓 디테일 (2026-04-20~21)

- **A-1 찜·공유**: `jakka_product_likes` + likes_count 트리거, X/Threads 공유
- **A-2 관련 작품**: 같은 작가/같은 카테고리 각 4개
- **A-3 작품 스펙**: dimensions·material·production_year·edition·is_signed·has_certificate
- **A-4 조회수**: `view_count` + `jakka_increment_product_view` RPC
- **A-5 입고 알림**: `jakka_product_notify` (품절 상품 버튼 동적 전환)
- **A-6 Q&A**: `jakka_product_qna` (공개/비공개, 작가 답변, 삭제)
- **A-7 ~~NFT~~**: 삭제됨 (실체 없음)
- **A-8 구매 플로우**: `jakka_orders` + `PurchaseModal` (배송지/메시지, status 6단계)

### Phase B 입점 승인제

- `jakka_creators.seller_status` (none/pending/approved/rejected/suspended)
- `jakka_seller_applications` 테이블
- `/jakka/market/apply` 신청 폼, `/jakka/market/upload` 승인자 게이트
- `/intra/ums/jakka/sellers` 인트라 심사 페이지 + `/api/intra/jakka/sellers`

### Phase C 판매자 센터

- `/jakka/seller` 단일 페이지 5탭 (홈/상품/주문/문의/설정)
- 대기 알림·통계(조회·찜·매출)·주문 상태 전환·Q&A 답변·수수료 확인

---

## 참고

- 서비스 접근 모델: [CLAUDE.md § 1.4](../../CLAUDE.md#14-서비스-접근-모델-6종)
- UC 정책: [docs/Universe_Coin_Policy.md](../../docs/Universe_Coin_Policy.md)
- UX 표준: [UX_GUIDE.md](../../UX_GUIDE.md)
