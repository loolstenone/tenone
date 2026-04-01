# Ten:One™ Universe — 통합 아키텍처 (Claude Code 개발 기준)

> Version: 1.0
> Date: 2026-04-02
> Purpose: Claude Code가 개발 시 참조하는 단일 기준 문서
> Scope: Universe 전체 구조, 4대 제품, 접근 제어, DB 설계, AI 자동화

---

## 0. 이 문서의 위치

```
이 문서 = "어떻게 만들 것인가" (아키텍처)
PROJECT_STATUS.md = "지금 어디까지 만들었는가" (현황)
TenOne_Dev_Alignment.md = "BM과 개발의 괴리" (정렬)
각 브랜드 BM 문서 = "왜 만드는가, 무엇을 파는가" (비즈니스)
```

---

## 1. Universe 맵 — 26개 브랜드의 역할과 관계

### 1-1. 4개 영역

Universe는 4개 영역으로 나뉜다. 왼쪽에서 오른쪽으로 가치가 흐른다.

```
┌─────────────┐    ┌─────────────────┐    ┌──────────────┐    ┌──────────────┐
│   솔루션      │    │    커뮤니티       │    │     인재      │    │  대중 접점     │
│  (만든다)     │ →  │   (모은다)       │ →  │  (키운다)     │ →  │  (확산한다)    │
│              │    │                 │    │              │    │              │
│  WIO         │    │  MADLeague      │    │  HeRo        │    │  Myverse     │
│  Mindle      │    │  Badak          │    │  Planner's   │    │  0gamja      │
│  RooK        │    │  domo           │    │  YouInOne    │    │  Mindle(B2C) │
│  SmarComm    │    │  MoNTZ          │    │              │    │  FWN         │
│              │    │                 │    │              │    │  Mullaesian  │
│              │    │                 │    │              │    │  Townity     │
│              │    │                 │    │              │    │  Korea360    │
└─────────────┘    └─────────────────┘    └──────────────┘    └──────────────┘
```

### 1-2. 브랜드 카탈로그 (전체 26개)

| # | 브랜드 | 영역 | 역할 (한 줄) | 라우트 | 산하 |
|---|--------|------|-------------|--------|------|
| 1 | **Ten:One™** | 오케스트레이터 | Universe의 철학과 방향을 정의한다 | `/` `/about` `/universe` | — |
| 2 | **WIO** | 솔루션 | 기업의 업무 자동화 솔루션. Orbi ERP+AI | `/wio` | — |
| 3 | **Mindle** | 솔루션+대중 | 데이터 크롤링·분석·트렌드 콘텐츠·B2B 컨설팅 | `/mindle` | Whole See, Naming Factory |
| 4 | **RooK** | 솔루션 | AI 크리에이티브 총괄 제작 | `/rook` | — |
| 5 | **SmarComm** | 솔루션 | 기업의 마케팅 자동화 OS | `/smarcomm` | — |
| 6 | **MADLeague** | 커뮤니티 | 전국 7개 동아리 연합. 인재 발굴의 시작점 | `/madleague` | ChangeUp, 7거점 |
| 7 | **Badak** | 커뮤니티 | 산업·직무·직급별 네트워킹. 9,000명+ | `/badak` | — |
| 8 | **domo** | 커뮤니티 | 시니어 비즈니스 네트워크 | `/domo` | — |
| 9 | **MoNTZ** | 커뮤니티 | AI 모델·인플루언서 에이전시 | `/montz` | Jakka |
| 10 | **HeRo** | 인재 | 탤런트 에이전시. 발굴·육성·매칭·관리 | `/hero` | Brand Gravity |
| 11 | **Planner's** | 인재 | 기획자 양성. Vrief/GPR 교육 | `/planners` | Evolution School |
| 12 | **YouInOne** | 인재 | 프로젝트 기획사. 매월 1개 프로젝트 진행 | `/youinone` | — |
| 13 | **Myverse** | 대중 | Personal Blackbox. 일반 대중으로의 폭발 통로 | 앱 (React Native) | — |
| 14 | **0gamja** | 대중 | 중고대학생 공감 콘텐츠·심리 상담 | `/0gamja` | — |
| 15 | **FWN** | 대중 | 패션 업계 전문 플랫폼 | `/fwn` | — |
| 16 | **Mullaesian** | 대중 | 문래창작촌 라이프 매거진 | `/mullaesian` | — |
| 17 | **Townity** | 대중 | 지역 거점 커뮤니티 플랫폼 | `/townity` | — |
| 18 | **Korea360** | 대중 | 외국인을 위한 한국 자유여행 솔루션 | `/korea360` | — |
| 19 | **NatureBox** | 대중 | 강원 정선 자연 식품 브랜드 | `/naturebox` | — |

산하 브랜드 (독립 라우트 없음, 부모 하위):
- **ChangeUp** → `/madleague/changeup`
- **Evolution School** → `/planners/learn`
- **Whole See** → Mindle 내부 크롤러 엔진
- **Naming Factory** → `/mindle/naming` 또는 독립 서비스
- **Brand Gravity** → HeRo 산하 브랜딩
- **Jakka** → MoNTZ 산하 작가 플랫폼
- **7거점** → MADLeap·PAM·ADlle·ABC·SUZAK·FIRE·MADX (각 `/madleague/{거점}`)

### 1-3. 핵심 가치 흐름 (화살표)

```
[사람의 순환]
MADLeague(모은다) → HeRo(상위 1% 발굴·매칭) → Planner's(기획자로 키운다)
Badak(현업 연결) → Planner's(교육에 참여) → YouInOne(프로젝트에 참여)
domo(시니어) → YouInOne(프로젝트에 참여)

[인텔리전스 흐름]
Mindle(먼저 본다) → SmarComm(전략) + RooK(제작)

[인프라 흐름]
WIO(IT) + YouInOne(인간) → 전 브랜드가 같은 방식으로 움직인다

[대중 확산]
전 브랜드 → Myverse → 일반 대중
Mullaesian(로컬) → Townity(전국) → Korea360(글로벌)
```

---

## 2. 4대 제품 — 무엇을 팔고, 누가 쓰는가

### 2-1. 제품 정의

| 제품 | 하는 일 | 고객 | 수익 모델 |
|------|--------|------|----------|
| **Mindle** | 데이터를 모으고 분석하고, 트렌드 콘텐츠를 만들고, 기업의 트렌드 모니터링 서비스를 제공한다 | B2C: 마케터·기획자 / B2B: 기업 마케팅팀 | 구독 + 리포트 + 트렌드 커머스 |
| **SmarComm** | 기업의 마케팅을 자동화한다 | B2B: 중소·스타트업·중견 기업 | 구독 (SaaS) + 대행 (서비스) |
| **WIO** | 기업의 업무 자동화 솔루션을 개발한다 | B2B: 중소~대기업 | 구독 (SaaS) |
| **AI Agent** | TenOne의 업무 자동화를 위한 인공지능 에이전트를 구축한다 | 내부 → 검증 후 외부 | 내부 비용 절감 → 외부 판매 |

### 2-2. 제품 간 관계

```
Mindle(연료) ──트렌드 데이터──→ SmarComm(마케팅 제품)
                                     │
                               마케팅 인프라(MKT-*)
                                     │
WIO(공장) ◄────── 인프라 레이어 ────────┘
    │
    │ COM-AI = Agent Hub
    ▼
AI Agent(운영 엔진) ──→ 위 3개 제품을 6개 에이전트가 자동 운영
```

핵심 원칙:
- **WIO = 표준 공장** — 새 기능은 WIO 모듈로 먼저 만든다
- **SmarComm = WIO MKT-* 위의 어플리케이션** — 인프라와 어플리케이션 분리
- **Mindle = 연료** — 데이터가 없으면 SmarComm도, WIO 마케팅도, 에이전트도 작동하지 않는다
- **AI Agent = 운영자** — 사람 대신 3개 제품을 운영한다

---

## 3. 시스템 아키텍처 — 3개 시스템

### 3-1. 전체 구조

```
┌───────────────────────────────────────────────────────────────────┐
│                        tenone.biz                                 │
│                    (Next.js 단일 앱)                               │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐│
│  │              │  │              │  │                          ││
│  │ /intra/*     │  │ /wio/app/*   │  │  /smarcomm/*             ││
│  │ TenOne Intra │  │ WIO Orbi     │  │  SmarComm Work Space    ││
│  │              │  │              │  │                          ││
│  │ 내부 관리자    │  │ 멀티테넌트     │  │  고객사 마케팅           ││
│  │ is_staff     │  │ 엔진          │  │  워크스페이스             ││
│  │              │  │              │  │                          ││
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────────┘│
│         │                 │                      │               │
│  ┌──────┴─────────────────┴──────────────────────┴──────────┐    │
│  │                                                          │    │
│  │  /hero, /badak, /mindle, /madleague, /planners, ...      │    │
│  │  26개 브랜드 퍼블릭 사이트                                   │    │
│  │  (각 브랜드별 레이아웃 + 페이지)                              │    │
│  │                                                          │    │
│  └──────────────────────────┬───────────────────────────────┘    │
└─────────────────────────────┼────────────────────────────────────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │      Supabase        │
                   │  (단일 DB · 142 테이블) │
                   │  brand_id / tenant_id │
                   │  RLS 격리             │
                   └──────────────────────┘
```

### 3-2. 3개 시스템의 역할

| 시스템 | 경로 | 본질 | 사용자 | 규모 |
|--------|------|------|--------|------|
| **TenOne Intra** | `/intra/*` | 텐원 내부 운영 대시보드. WIO 모듈을 내부용으로 조합 | `is_staff` 직원/파트너/크루 | 9개 섹션 |
| **WIO Orbi** | `/wio/app/*` | 모든 기능의 엔진. 멀티테넌트 ERP+AI | 모든 브랜드 + 외부 기업 | 16서비스, 110+모듈, 141p |
| **SmarComm WS** | `/smarcomm/*` | 마케팅 특화 클라이언트 워크스페이스 | SmarComm 고객사 | 46p + 16 lib |

### 3-3. 원칙: WIO = 공장

```
새 기능이 필요할 때:
  1. WIO 모듈로 먼저 만든다 (범용, 멀티테넌트)
  2. Intra가 tenant_id='tenone'으로 가져다 쓴다
  3. SmarComm이 WIO MKT-* 위에 어플리케이션을 얹는다
  4. 외부 기업이 SaaS로 구독한다

잘못된 방법:
  ✗ Intra 전용 테이블을 새로 만든다
  ✗ SmarComm 전용 DB를 분리한다
  ✗ 같은 기능을 3곳에서 각각 만든다
```

---

## 4. 접근 제어 — 누가 무엇을 볼 수 있는가

### 4-1. 사용자 유형

| 유형 | 식별 | 접근 범위 | 예시 |
|------|------|----------|------|
| **비로그인** | — | 퍼블릭 사이트 읽기 전용 | 브랜드 소개 페이지 방문자 |
| **일반 회원** (Lv0~2) | `auth.users` + `members` | 퍼블릭 + 무료 기능 | 뉴스레터 구독자, MADLeague 학생 |
| **유료 구독자** (Lv3) | `subscriptions.status = 'active'` | 퍼블릭 + 유료 콘텐츠/기능 | Mindle 유료 구독, WIO SaaS |
| **VIP/파트너** (Lv4~5) | `members.customer_level` | 확장 권한 | Badak 프리미엄, HeRo 파트너사 |
| **내부 직원** | `app_metadata.is_staff = true` | Intra 전체 | 텐원 직원, 크루, 파트너 |
| **관리자** | `app_metadata.is_super_admin = true` | 모든 것 | 텐원 |

### 4-2. 라우트별 접근 제어

```typescript
// middleware.ts 의사코드
function middleware(request) {
    const path = request.pathname;

    // 퍼블릭 사이트 — 누구나
    if (isPublicBrandPage(path)) return next();

    // Intra — is_staff 필수
    if (path.startsWith('/intra')) {
        if (!user?.app_metadata?.is_staff) return redirect('/login');
    }

    // WIO Orbi — 로그인 필수 + 테넌트 소속
    if (path.startsWith('/wio/app')) {
        if (!user) return redirect('/login');
        // Demo 모드는 예외
        if (isDemo(path)) return next();
        // SaaS/Master 모드는 tenant 소속 확인
    }

    // SmarComm WS — 구독 필수
    if (path.startsWith('/smarcomm/workspace')) {
        if (!hasActiveSubscription(user, 'smarcomm')) return redirect('/smarcomm/pricing');
    }

    // 유료 콘텐츠 — 구독 체크
    if (isPaidContent(path)) {
        if (!hasActiveSubscription(user, getSiteId(path))) return showPaywall();
    }
}
```

### 4-3. WIO Orbi 3모드

| 모드 | 경로 | 접근 | 데이터 |
|------|------|------|--------|
| **Demo** | `/wio/app?mode=demo` | 누구나 | 샘플 데이터 (읽기 전용) |
| **SaaS** | `/wio/app` | 구독 기업 로그인 | 해당 기업 데이터 (`tenant_id` 격리) |
| **Master** | `/wio/app?mode=master` | `is_super_admin` | 모든 테넌트 데이터 |

---

## 5. DB 설계 원칙

### 5-1. 테이블 소유권

| 소유 | 테이블 접두사 | 사용처 | 격리 키 |
|------|-------------|--------|---------|
| **WIO** (공장) | `wio_*` | Orbi + Intra + SmarComm | `tenant_id` |
| **브랜드 공통** | 접두사 없음 | 전 브랜드 | `brand_id` 또는 `site_id` |
| **Mindle 전용** | `mindle_*` | Mindle 크롤러·분석 | — |
| **에이전트** | `agent_*` | Agent Hub | `agent_id` |

### 5-2. 핵심 테이블 구조

**인증·회원 (L3 사람)**
```
auth.users              → Supabase Auth (이메일/소셜)
members                 → 통합 프로필
  ├── customer_level    → Lv0~Lv5
  ├── brands[]          → 소속 브랜드 배열
  └── app_metadata      → is_staff, is_super_admin, brand_roles
```

**사이트 설정 (L1 설정)** — 신규, 즉시 구현
```sql
site_configs (
    site_id TEXT PK,          -- 'tenone', 'hero', 'badak' ...
    name TEXT,                -- 표시명
    tagline TEXT,             -- 한 줄 소개
    logo_url TEXT,
    meta_title TEXT,
    meta_description TEXT,
    color_primary TEXT,
    color_accent TEXT,
    domain TEXT,              -- 커스텀 도메인
    features JSONB,           -- { board: true, newsletter: true, commerce: false }
    updated_at TIMESTAMPTZ
);
```

**콘텐츠 (L2 콘텐츠)** — 기존 + 확장
```
board_configs             → 게시판 설정 (site_id 기반)
board_posts               → 게시글
board_comments, likes, bookmarks
mindle_sources            → 크롤러 수집 원본
mindle_trends             → 트렌드 카드 (분석 결과)
mindle_reports            → 리포트
mindle_subscribers        → 뉴스레터 구독자
```

**구독·결제 (L4 상거래)** — WIO 테이블 사용
```
wio_subscription_plans    → 구독 플랜 정의 (site_id별)
wio_subscriptions         → 사용자 구독 상태
wio_payments              → 결제 기록
wio_points                → 포인트
```
> ⚠️ Intra 전용으로 새 테이블을 만들지 않는다. WIO 테이블을 tenant_id/site_id로 공유한다.

**운영 (L5 운영)** — WIO 테이블 사용
```
projects                  → 프로젝트 (이미 WIO 연동)
wio_jobs                  → 업무/태스크
wio_timesheets            → 시수 기록
wio_approval_*            → 전자결재
partners                  → 파트너 풀
```

**에이전트 (L6 에이전트)**
```
agent_profiles            → 에이전트 정체성, System Prompt
agent_messages            → 행위 로그
agent_communications      → 에이전트 간 Vrief 교환
agent_gpr                 → 에이전트 GPR 자동 집계
agent_usage_logs          → API 사용량·비용 추적
```

### 5-3. 데이터 흐름 원칙

```
[기본 흐름: 단방향]
Intra(관리자) → Supabase ← 브랜드 사이트(읽기)
                  ↑
          회원 행위(가입, 글쓰기, 구독)

[SmarComm 예외: 양방향 읽기]
SmarComm WS(고객) → Supabase ← Intra(관리자)
  고객이 캠페인 생성      관리자가 성과 확인

[API 이중 소비자]
모든 API는 프론트엔드 UI와 AI 에이전트가 동일하게 사용한다.
/api/board/posts  ← Intra UI가 호출
/api/board/posts  ← 에이전트가 자동 발행 시에도 호출
```

---

## 6. B2B / B2C 구독 서비스 설계

### 6-1. 구독이 필요한 브랜드

| 브랜드 | 구독 유형 | 대상 | 플랜 |
|--------|----------|------|------|
| **Mindle** | B2C 개인 + B2B 팀 | 마케터·기획자 | Free(뉴스레터) → Mindler(7,900원/월) → Pro(39,000원/5인) |
| **SmarComm** | B2B 기업 | 기업 마케팅 담당 | Starter(9.9만/월) → Business(49만/월) → Enterprise(협의) |
| **WIO Orbi** | B2B 기업 | 기업 전체 | Free → Starter → Pro → Business → Enterprise |
| **Myverse** | B2C 개인 | 일반 대중 | Free → Pro(9,900원/월) → Team(19,900원/인/월) |
| **Badak** | B2C 개인 | 현업인 | Free → Premium(19,900원/월) |

구독이 없는 브랜드: MADLeague, HeRo, Planner's, YouInOne, RooK, domo, MoNTZ, 0gamja, FWN, Mullaesian, Townity, Korea360, NatureBox — 이들은 프로젝트 기반 수익이거나 아직 수익화 전.

### 6-2. 구독 테이블 (WIO 공유)

```sql
-- 모든 구독 서비스가 같은 테이블을 쓴다
CREATE TABLE wio_subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id TEXT NOT NULL,              -- 'mindle', 'smarcomm', 'wio', 'myverse', 'badak'
    slug TEXT NOT NULL,                 -- 'free', 'starter', 'pro', 'business', 'enterprise'
    name TEXT NOT NULL,
    description TEXT,
    price_monthly INT,                  -- 원 단위. null = 무료 또는 협의
    price_yearly INT,
    features JSONB DEFAULT '[]',
    max_members INT,                    -- null = 무제한
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    UNIQUE(site_id, slug)
);

CREATE TABLE wio_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id),
    plan_id UUID NOT NULL REFERENCES wio_subscription_plans(id),
    site_id TEXT NOT NULL,              -- 빠른 조회용 비정규화
    status TEXT NOT NULL DEFAULT 'active',  -- active, trial, cancelled, expired
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at TIMESTAMPTZ,
    payment_provider TEXT,              -- 'toss', 'portone', null
    external_subscription_id TEXT,      -- PG사 구독 ID
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: 본인 구독만 조회. is_staff는 전체 조회.
CREATE POLICY "own_subscription" ON wio_subscriptions
    FOR SELECT USING (
        member_id = auth.uid()
        OR auth_is_staff()
    );
```

### 6-3. 구독 기반 접근 제어 (미들웨어)

```typescript
// lib/subscription.ts
export async function hasAccess(userId: string, siteId: string, requiredPlan?: string): Promise<boolean> {
    const { data } = await supabase
        .from('wio_subscriptions')
        .select('*, plan:wio_subscription_plans(*)')
        .eq('member_id', userId)
        .eq('site_id', siteId)
        .eq('status', 'active')
        .single();

    if (!data) return false;
    if (!requiredPlan) return true; // 아무 구독이나 있으면 OK
    return data.plan.sort_order >= getPlanOrder(requiredPlan);
}
```

---

## 7. Intra 관리 기능 — Universe를 어떻게 관리하는가

### 7-1. Intra 섹션 구조

```
/intra
├── Dashboard          ← 전체 현황 대시보드
├── Universe           ← L3 사람: 통합 회원, 게스트, 개인정보
│   ├── 통합 회원       ← members 테이블 CRUD
│   ├── 구독 관리       ← wio_subscription_plans + wio_subscriptions
│   └── 포인트/프로모션  ← wio_points + promotions
├── BUMS               ← L1 설정 + L2 콘텐츠: 브랜드 유니버스 관리
│   ├── 사이트 관리     ← site_configs 테이블 (26개 사이트 SEO/테마/기능)
│   ├── 게시판 관리     ← board_configs + board_posts CRUD
│   ├── 콘텐츠 관리     ← 아티클, 미디어 라이브러리
│   └── 뉴스레터       ← mindle_subscribers + 발송
├── Project            ← L5 운영: 프로젝트 관리
│   ├── 프로젝트       ← projects 테이블
│   ├── Job/태스크      ← wio_jobs 테이블
│   └── 타임시트       ← wio_timesheets 테이블
├── HeRo               ← 인재 관리 (이력서, HIT, 매칭)
├── SmarComm           ← 마케팅 운영 (캠페인, 리드, 성과)
├── ERP                ← L5 운영: 재무/HR (WIO Finance+HR 모듈)
├── Wiki               ← 사내 지식 (핸드북, 온보딩, FAQ)
└── Agent Hub          ← L6 에이전트: 에이전트 대화, 프로필, 로그
```

### 7-2. Intra가 관리하는 것 vs 각 사이트가 관리하는 것

| 관리 주체 | 무엇을 | 어디서 |
|----------|--------|--------|
| **Intra** | 사이트 설정 (SEO, 테마, 기능 토글) | BUMS > 사이트 관리 |
| **Intra** | 전체 회원 관리 (레벨, 소속, 활성화) | Universe > 통합 회원 |
| **Intra** | 구독 플랜 CRUD | Universe > 구독 관리 |
| **Intra** | 콘텐츠 발행 (공지, 아티클) | BUMS > 게시판/콘텐츠 |
| **Intra** | 프로젝트·태스크·시수 | Project 섹션 |
| **Intra** | 에이전트 관리·대화 | Agent Hub |
| **각 브랜드 사이트** | 회원 가입 | 해당 사이트 회원가입 폼 |
| **각 브랜드 사이트** | 구독 결제 | 해당 사이트 Pricing 페이지 |
| **각 브랜드 사이트** | 사용자 콘텐츠 (글, 댓글) | 해당 사이트 게시판 |
| **SmarComm WS** | 고객 캠페인 생성·관리 | `/smarcomm/workspace` |
| **WIO Orbi** | 기업별 업무 전체 | `/wio/app` |

### 7-3. Intra ↔ 브랜드 연결 매트릭스 (현재 상태)

| Intra 모듈 | 영향받는 사이트 | 계층 | 상태 |
|------------|---------------|------|------|
| BUMS > 사이트 관리 | 전체 26개 | L1 설정 | 🔴 미연동 → **즉시 구현** |
| BUMS > 게시판 관리 | 게시판 있는 사이트 | L2 콘텐츠 | 🟢 작동 |
| BUMS > 뉴스레터 | Mindle 등 | L2 콘텐츠 | 🔴 미연동 |
| Universe > 통합 회원 | 전체 | L3 사람 | 🟢 작동 |
| Universe > 구독 관리 | WIO, SmarComm, Mindle, Badak, Myverse | L4 상거래 | 🔴 미연동 |
| Project | 없음 (내부) | L5 운영 | 🟡 부분 |
| Agent Hub | 전체 (에이전트 임베드 시) | L6 에이전트 | 🟢 작동 |

---

## 8. AI 자동화 — 에이전트가 무엇을 자동화하는가

### 8-1. 6개 에이전트

| 에이전트 | 브랜드 | 자동화 대상 | Intra 연결 |
|---------|--------|-----------|-----------|
| **열시일분** | Ten:One | 전체 오케스트레이터. 10:01 취합 | Agent Hub에서 대화 |
| **바당쇠** | Badak | 14개 방 리스닝 → 시그널 수집 | Badak 관리에 리포트 |
| **매드레드** | MADLeague | 7거점 공지, 경쟁PT, 인재 선발 | MADLeague 관리에 연동 |
| **매드블루** | MADLeap | 서울/경기 OT, 멘토링 | MADLeague 관리에 연동 |
| **Whole See** | Mindle | 크롤러 → 분석 → 트렌드 카드 생성 | BUMS > 콘텐츠에 카드 표시 |
| **네이미스트** | Naming Factory | 네이밍 요청 처리 | 독립 서비스 |

### 8-2. 에이전트의 Intra 자동화

```
[현재 — Phase 0]
텐원이 "회의 시작" → 열시일분이 수동 취합 → 브리핑

[Phase 0.5 — 크롤러 자동화]
Whole See: GCP Scheduler → RSS 크롤 → mindle_sources → Claude 분석 → mindle_trends
바당쇠: 리스닝 모드 가동 (수집만, 응답은 수동)

[Phase 1 — DB 기반 브리핑]
각 에이전트 Result → agent_gpr 테이블 저장
열시일분: agent_gpr에서 읽어 자동 취합 → 브리핑 MD 생성
인트라 Dashboard에 "오늘의 브리핑" 위젯 표시

[Phase 2 — 자동 브리핑]
GCP Scheduler → 10:01 API 자동 호출 → 브리핑 MD 생성 → 카카오톡 전송
텐원은 카톡에서 확인만

[Phase 3 — 에이전트 간 자동 교환]
Whole See Result(트렌드) → agent_communications → 열시일분 자동 라우팅
→ SmarComm 전략 매칭 → 제안서 초안 자동 생성
→ 텐원 승인 건만 알림
```

### 8-3. Agent Hub 아키텍처

```
Intra Agent Hub (/intra/agent-hub)
  └── POST /api/agent/hub
        │
        ├── agent_id로 System Prompt 로드 (agent_profiles)
        ├── Claude API 호출
        ├── 에이전트가 WIO API를 Tool로 사용 가능:
        │     /api/board/posts     ← 콘텐츠 자동 발행
        │     /api/projects        ← 프로젝트 생성
        │     /api/members         ← 회원 조회
        │     /api/mindle/trends   ← 트렌드 카드 조회
        └── 행위 로그 → agent_messages

브랜드 사이트 에이전트 임베드 (향후):
  badak.biz → 바당쇠 챗봇 임베드
  madleague → 매드레드 챗봇 임베드
  같은 /api/agent/hub 사용, brand_id로 에이전트 격리
```

---

## 9. 구현 우선순위

### 즉시 (L1 설정 — 공수 최소, 영향 최대)

```
1. site_configs 테이블 생성 + 26개 사이트 시드 데이터
2. /intra/bums/sites handleSave → DB upsert 연결
3. 각 브랜드 layout.tsx → getSiteConfig(siteId) 로 metadata 동적 생성
4. ISR 10분 캐시 또는 on-demand revalidation
```

### 다음 (구독 인프라)

```
1. wio_subscription_plans + wio_subscriptions 테이블 생성
2. /intra/universe/subscriptions 관리 UI → DB 연결
3. Mindle, SmarComm, WIO, Badak 각 Pricing 페이지 → 플랜 표시
4. 구독 체크 미들웨어 → 유료 콘텐츠 접근 제어
5. (Phase 2) 결제 PG 연동 (토스페이먼츠 또는 포트원)
```

### 그 다음 (콘텐츠 확장)

```
1. 뉴스레터 발송 시스템 (Resend 또는 SES)
2. Mindle 트렌드 카드 → /mindle/trends 페이지 연결
3. 미디어 라이브러리 → Supabase Storage
4. 각 브랜드 아티클 페이지 공통 컴포넌트
```

### 마지막 (AI 자동화)

```
1. Agent Hub Tool 연동 (에이전트가 WIO API 호출)
2. agent_gpr 자동 집계 → Intra Dashboard 위젯
3. GCP Scheduler → 10:01 자동 브리핑
4. 에이전트 간 자동 Vrief 교환
```

---

## 10. 캐시 전략

| 데이터 | 전략 | 이유 |
|--------|------|------|
| site_configs | ISR 10분 | 자주 안 바뀜 |
| board_posts | SSR (요청마다) | 최신성 중요 |
| mindle_trends | ISR 1시간 | 크롤러가 주기적 갱신 |
| members | 클라이언트 캐시 (auth-context) | 로그인 세션 |
| wio_subscriptions | 클라이언트 캐시 + 미들웨어 검증 | 결제 시 즉시 반영 필요 |
| WIO Orbi 업무 데이터 | Supabase Realtime | 실시간 협업 |
| 에이전트 대화 | 비캐시 | 매번 API 호출 |

---

## 11. 모순 방지 체크리스트

개발 시 아래를 위반하면 구조적 모순이 발생한다:

| # | 규칙 | 위반 시 문제 |
|---|------|------------|
| 1 | 구독 테이블은 `wio_subscription_plans` 하나만 쓴다 | 브랜드마다 구독 테이블이 생기면 관리 불가 |
| 2 | Intra 전용 운영 테이블을 새로 만들지 않는다 (WIO 테이블 사용) | Intra와 WIO에 같은 기능이 이중으로 생김 |
| 3 | 브랜드 사이트는 Supabase만 바라본다 (Intra API 직접 호출 금지) | 브랜드 간 의존성 발생 |
| 4 | SmarComm WS는 WIO MKT-* 위의 어플리케이션이다 | 마케팅 기능이 WIO와 SmarComm에 이중 구현됨 |
| 5 | 에이전트는 사람과 같은 API를 쓴다 | 에이전트 전용 API가 생기면 UI와 동기화 깨짐 |
| 6 | 모든 테이블에 brand_id 또는 tenant_id가 있다 | RLS 격리 불가 |
| 7 | site_configs의 site_id와 각 브랜드 layout의 식별자가 일치해야 한다 | SEO/테마 연동 깨짐 |

---

## 부록: 기술 스택

```
프론트엔드:  Next.js 16 + React 19 + TypeScript + Tailwind CSS v4
백엔드:     Supabase (Auth + DB + Storage + Realtime + RLS)
AI:         Anthropic Claude API (Haiku: 단순, Sonnet: 분석, Opus: 전략)
배포:       GCP Cloud Run
모바일:     React Native (Expo) — Myverse 전용
도메인:     tenone.biz (단일 플랫폼)
```

---

*Ten:One™ Universe 통합 아키텍처 v1.0 — 2026-04-02*
