# Intra ↔ Universe 연결 아키텍처

> Date: 2026-04-02
> Author: Claude (텐원 요청)
> Status: 설계 문서 — 검토 후 확정

---

## 0. 문제 정의

인트라(tenone.biz/intra)는 165페이지의 관리 대시보드다.
유니버스는 26개 브랜드 사이트다.

**현재: 대부분의 인트라 기능이 "저장" 버튼만 있고 DB에 안 간다.**
**목표: 인트라에서 조작하면 유니버스 전체에 반영된다.**

---

## 1. 전체 구조

```
                    ┌──────────────────────────────┐
                    │       tenone.biz/intra        │
                    │       (관리자 플랫폼)           │
                    └──────────┬───────────────────┘
                               │ WRITE
                               ▼
                    ┌──────────────────────────────┐
                    │         Supabase              │
                    │   (단일 DB · brand_id RLS)     │
                    └──────────┬───────────────────┘
                               │ READ
              ┌────────┬───────┼───────┬────────┐
              ▼        ▼       ▼       ▼        ▼
           HeRo     Badak   Mindle  SmarComm  ...26개
         hero.ne.kr  badak.biz  mindle.tenone.biz
```

**원칙: 인트라가 쓰고, 브랜드가 읽는다. Supabase가 중간이다.**

---

## 2. 6개 계층

인트라와 유니버스의 연결을 6개 계층으로 분리한다.
각 계층은 독립적이며, 아래에서 위로 쌓는다.

```
L6  에이전트 ─── AI가 자동으로 운영
L5  운영 ─────── ERP/HR/프로젝트 (인트라 전용)
L4  상거래 ───── 구독/결제/포인트
L3  사람 ─────── 통합 회원/레벨/권한
L2  콘텐츠 ───── 게시판/아티클/뉴스레터
L1  설정 ─────── 사이트/브랜딩/SEO/테마
```

---

## L1. 설정 계층 (Site Configuration)

> 인트라 위치: BUMS > 사이트 관리

### 역할
각 브랜드 사이트의 메타데이터, 테마, SEO를 중앙 관리한다.

### DB 테이블

```sql
CREATE TABLE site_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id TEXT UNIQUE NOT NULL,        -- 'tenone', 'hero', 'badak' (= SiteIdentifier)

    -- 브랜딩
    name TEXT NOT NULL,                  -- '헤로'
    tagline TEXT,                        -- '인재를 발굴하고 연결합니다'
    logo_url TEXT,
    favicon_url TEXT,
    og_image_url TEXT,

    -- SEO
    meta_title TEXT,                     -- 'HeRo — 탤런트 에이전시'
    meta_description TEXT,
    meta_keywords TEXT,

    -- 테마
    color_primary TEXT DEFAULT '#171717',
    color_accent TEXT DEFAULT '#171717',
    color_header TEXT DEFAULT '#ffffff',
    color_footer TEXT DEFAULT '#171717',

    -- 도메인
    domain TEXT,                         -- 'hero.ne.kr'
    subdomain TEXT,                      -- 'hero.tenone.biz'

    -- 기능 토글
    features JSONB DEFAULT '{}',         -- { "board": true, "newsletter": true, "commerce": false }

    updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 데이터 흐름

```
인트라: BUMS > 사이트 관리 > 저장
  → INSERT/UPDATE site_configs WHERE site_id = 'hero'

브랜드 사이트: app/(HeRo)/layout.tsx
  → SELECT * FROM site_configs WHERE site_id = 'hero'
  → generateMetadata() 에 반영
  → CSS 변수에 테마 색상 주입
```

### 브랜드 레이아웃 소비 코드 (예시)

```typescript
// lib/supabase/site.ts
export async function getSiteConfig(siteId: string) {
    const { data } = await supabase
        .from('site_configs')
        .select('*')
        .eq('site_id', siteId)
        .single();
    return data;
}

// app/(HeRo)/layout.tsx
export async function generateMetadata(): Promise<Metadata> {
    const config = await getSiteConfig('hero');
    if (!config) return { title: 'HeRo' }; // fallback
    return {
        title: config.meta_title,
        description: config.meta_description,
        keywords: config.meta_keywords,
        openGraph: { images: config.og_image_url ? [config.og_image_url] : [] },
    };
}
```

### 상태: 🔴 미구현
- 인트라 UI 있음 (BUMS > 사이트 관리)
- DB 테이블 없음
- handleSave가 빈 함수

---

## L2. 콘텐츠 계층 (Content)

> 인트라 위치: BUMS > 게시판 관리 / 콘텐츠 관리 / 뉴스레터

### 역할
인트라에서 콘텐츠를 작성·관리하면, 해당 브랜드 사이트에 자동 노출된다.

### DB 테이블 (기존)

```
board_configs   → 게시판 설정 (site, slug, categories, permissions)
board_posts     → 게시글 (site, board, title, content, status)
board_comments  → 댓글
board_likes     → 좋아요
board_bookmarks → 북마크
```

### 데이터 흐름

```
인트라: BUMS > 게시판 관리 > 글 작성 > 발행
  → INSERT board_posts (site='hero', board='notice', status='published')

브랜드 사이트: hero.ne.kr/community 또는 tenone.biz/intra/hero의 게시판
  → BoardPage 컴포넌트 → GET /api/board/posts?site=hero&board=notice
  → 해당 사이트의 글만 표시 (site 필터)
```

### 상태: 🟡 부분 작동
- board_configs, board_posts 테이블 존재
- API 동작 (/api/board/*)
- 인트라에서 발행하면 브랜드 사이트에 보임
- **뉴스레터**: 미연동 (발송 시스템 없음)

---

## L3. 사람 계층 (People)

> 인트라 위치: Universe > 통합 회원 / 게스트 관리 / 개인정보

### 역할
하나의 계정으로 모든 브랜드 사이트에 접근. 인트라에서 레벨·권한·소속 관리.

### DB 테이블 (기존)

```
auth.users              → Supabase Auth (이메일/소셜 로그인)
members                 → 통합 프로필 (name, phone, grade, brands[], app_metadata)
  ├── customer_level    → Lv0~Lv5 (게스트/무료/활동/구독/VIP/파트너)
  ├── brands            → 소속 브랜드 배열
  └── app_metadata      → is_staff, is_super_admin, brand_roles
```

### 데이터 흐름

```
회원 가입: hero.ne.kr 에서 가입
  → Supabase Auth → auth.users 생성
  → 트리거 → members 행 생성 (brands: ['hero'])

인트라: Universe > 통합 회원
  → SELECT * FROM members (전체 조회, RLS: super_admin)
  → 레벨 변경, 브랜드 추가, 활성/비활성 설정

브랜드 사이트: hero.ne.kr
  → 로그인 시 members.brands에 'hero' 포함 여부 확인
  → 레벨에 따른 기능 제한 (Lv3+ 구독 콘텐츠 등)
```

### 상태: 🟢 작동
- Supabase Auth + members 테이블 존재
- 공유 쿠키 (.tenone.biz) 로 SSO
- 인트라 통합 회원 페이지에서 DB 조회
- **미흡**: 브랜드 사이트에서 레벨 기반 접근 제한 미구현

---

## L4. 상거래 계층 (Commerce)

> 인트라 위치: Universe > 구독 관리 / BUMS > 쇼핑 관리 / 프로모션

### 역할
구독, 결제, 포인트, 프로모션을 중앙 관리. 브랜드 사이트에서 결제·구독 처리.

### DB 테이블 (신규 필요)

```sql
-- 구독 플랜 정의
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id TEXT NOT NULL,              -- 'wio', 'smarcomm', 'mindle'
    name TEXT NOT NULL,                 -- 'Pro'
    price_monthly INT NOT NULL,         -- 14900 (원)
    price_yearly INT,                   -- 149000 (원)
    features JSONB DEFAULT '[]',        -- ['무제한 프로젝트', 'AI 분석']
    max_members INT,                    -- 100 (null = 무제한)
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0
);

-- 사용자 구독 상태
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id),
    plan_id UUID REFERENCES subscription_plans(id),
    site_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',  -- active, cancelled, expired, trial
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 포인트 (기존 points 테이블 확장)
-- 프로모션 (기존 promotions 테이블)
```

### 데이터 흐름

```
인트라: Universe > 구독 관리
  → 플랜 CRUD → subscription_plans
  → 사용자별 구독 상태 확인/변경 → subscriptions

브랜드 사이트: wio.tenone.biz/pricing
  → SELECT * FROM subscription_plans WHERE site_id = 'wio'
  → 결제 처리 → INSERT subscriptions

접근 제어: wio.tenone.biz/app/analytics (Pro 전용)
  → SELECT * FROM subscriptions WHERE member_id = ? AND site_id = 'wio'
  → status = 'active' AND plan.name >= 'Pro' → 접근 허용
```

### 상태: 🔴 미구현
- 인트라 UI 있음 (구독 관리, 쇼핑 관리)
- DB 테이블 없음
- 결제 연동 없음 (Phase 2 이후)

---

## L5. 운영 계층 (Operations)

> 인트라 위치: ERP / Project / HeRo / SmarComm / Wiki

### 역할
인트라 전용. 브랜드 사이트에 직접 노출되지 않음.
단, 운영 결과가 다른 계층에 간접 영향.

```
ERP (재무/HR/결재)          → 내부 직원 관리
Project (프로젝트/Job/타임시트) → 프로젝트 운영
HeRo (이력서/HIT/커리어)      → 인재 관리
SmarComm (캠페인/리드/딜)     → 마케팅 운영
Wiki (핸드북/온보딩/FAQ)       → 사내 지식
```

### 간접 연결 예시

```
HeRo 인트라: 이력서 빌더 → resume 저장
  → HeRo 퍼블릭 사이트에서 해당 인재 프로필 공개 (L2 콘텐츠 계층 경유)

SmarComm 인트라: 캠페인 생성
  → SmarComm 사이트 대시보드에서 진행 상태 표시 (L2 경유)
```

### 상태: 🟡 부분 작동
- DB 연동된 것: projects, jobs, timesheets, approval, partners
- Mock인 것: 대부분의 HR, 재무, 마케팅 분석

---

## L6. 에이전트 계층 (Agent)

> 인트라 위치: Agent Hub

### 역할
AI 에이전트가 모든 계층을 가로지르며 자동 운영한다.
인트라 Agent Hub에서 에이전트 프로필 관리, 대화, 로그 추적.

### DB 테이블 (기존)

```
agent_profiles  → 에이전트 정체성, System Prompt, 도구, 모델
agent_messages  → 모든 에이전트 행위 로그
```

### 데이터 흐름

```
인트라: Agent Hub
  → 에이전트 선택 → 대화 (POST /api/agent/hub)
  → Claude API 호출 → 에이전트가 WIO 모듈 API를 Tool로 사용
  → 행위 로그 → agent_messages

브랜드 사이트: 각 브랜드별 에이전트 임베드 (향후)
  → 바당쇠(Badak), 매드레드(MADLeague) 등
  → 같은 /api/agent/hub 엔드포인트 사용
  → brand_id로 해당 브랜드 에이전트만 접근
```

### 상태: 🟢 작동
- agent_profiles, agent_messages 테이블 존재
- Agent Hub에서 대화 가능
- 6개 에이전트 프로필 등록됨
- **미흡**: 에이전트 Tool 연동 (WIO 모듈 → Tool)

---

## 3. 우선순위 로드맵

### 지금 바로 (L1 설정 — 영향력 최대, 공수 최소)

```
1. site_configs 테이블 생성 + 시드 (26개 사이트)
2. BUMS > 사이트 관리 handleSave → DB upsert 연결
3. 각 브랜드 layout.tsx → getSiteConfig() 로 metadata 동적 생성
```

**효과**: 인트라에서 SEO 수정 → 즉시 브랜드 사이트 반영. 전 사이트 통합 관리 시작.

### 다음 (L2 콘텐츠 보강)

```
1. 뉴스레터 발송 시스템 (Resend 또는 SES)
2. 콘텐츠 관리 → 브랜드 사이트 아티클 페이지 연결
3. 미디어 라이브러리 → Supabase Storage 연동
```

### 그 다음 (L4 상거래)

```
1. subscription_plans + subscriptions 테이블
2. 결제 연동 (토스페이먼츠 or 포트원)
3. 브랜드 사이트 접근 제어 미들웨어
```

---

## 4. 연결 매트릭스

어떤 인트라 모듈이 어떤 브랜드 사이트에 영향을 주는지.

| 인트라 모듈 | 영향받는 사이트 | 계층 | 현재 상태 |
|------------|---------------|------|----------|
| BUMS > 사이트 관리 | 전체 26개 | L1 설정 | 🔴 미연동 |
| BUMS > 게시판 관리 | 게시판 있는 모든 사이트 | L2 콘텐츠 | 🟢 작동 |
| BUMS > 콘텐츠 관리 | 전체 | L2 콘텐츠 | 🟡 일부 |
| BUMS > 뉴스레터 | 뉴스레터 구독 사이트 | L2 콘텐츠 | 🔴 미연동 |
| Universe > 통합 회원 | 전체 | L3 사람 | 🟢 작동 |
| Universe > 구독 관리 | WIO, SmarComm, Mindle | L4 상거래 | 🔴 미연동 |
| BUMS > 쇼핑/프로모션 | 커머스 사이트 | L4 상거래 | 🔴 미연동 |
| ERP / Project | 없음 (내부 전용) | L5 운영 | 🟡 부분 |
| Agent Hub | 전체 (에이전트 임베드 시) | L6 에이전트 | 🟢 작동 |

---

## 5. 기술 원칙

### 5-1. 단방향 흐름

```
인트라 → Supabase → 브랜드 사이트
(WRITE)   (STORE)    (READ)
```

브랜드 사이트가 직접 인트라를 호출하지 않는다.
브랜드 사이트의 사용자 행위(가입, 구독, 글쓰기)도 Supabase에 쓴다.
인트라는 Supabase에서 읽어서 관리한다.

### 5-2. API 이중 소비자 원칙 (Universe OS)

모든 API는 프론트엔드 UI와 AI 에이전트가 동일하게 사용한다.

```
/api/board/posts    ← 인트라 UI가 호출
/api/board/posts    ← 에이전트가 자동 발행 시에도 호출
```

### 5-3. brand_id 기반 격리

```sql
-- 모든 테이블에 brand_id 또는 site_id
-- RLS로 해당 브랜드 데이터만 접근
-- super_admin은 전체 접근

CREATE POLICY "site_configs_select" ON site_configs
    FOR SELECT USING (
        auth_is_super_admin()
        OR site_id = current_setting('app.current_brand', true)
    );
```

### 5-4. 캐시 전략

```
site_configs  → ISR (10분) 또는 on-demand revalidation
board_posts   → SSR (요청마다 최신)
members       → 클라이언트 캐시 (auth-context)
subscriptions → 클라이언트 캐시 + 미들웨어 검증
```

---

## 6. 결론

인트라와 유니버스는 **Supabase를 매개로 연결**된다.
6개 계층 중 L2(콘텐츠), L3(사람), L6(에이전트)는 이미 작동한다.
L1(설정)은 공수 최소 + 영향력 최대이므로 즉시 연동한다.
L4(상거래)는 수익화 시점에 맞춰 구현한다.
L5(운영)는 인트라 전용이므로 브랜드 연동 불필요.

**지금 해야 할 것: L1 site_configs 테이블 만들고, 인트라 사이트 관리를 실제로 작동시키는 것.**
