# TenOne Universe Identity Architecture
## 3계층 다중 페르소나(Multi-Persona) 회원 설계

> **단일 진실 소스**: 유니버스 전체 회원 체계의 설계 문서
>
> 핵심 원칙: **"한 사람, 하나의 여권, 행성마다 다른 옷"**

---

## 현재 상태 (문제점)

```
members 테이블 (30+ 컬럼 괴물)
├── 코어: id, auth_id, email, name, phone, bio...
├── HR: department, position, employee_id, hire_date, employment_type  ← TenOne 전용인데 공용 테이블에
├── 권한: account_type, roles[], affiliations[], module_access[]       ← 배열 남발
├── 접근: intra_access, system_access[], brand_access[]                ← 하드코딩
├── 포인트: total_points, grade                                        ← 어느 브랜드 포인트?
├── 브랜드: origin_site, brand_roles(JSONB)                            ← 사용 안 됨
└── 기타: skills[], group[], newsletter_subscribed...
```

**문제:**
- `is_badak_vip`, `smarcomm_tier` 같은 컬럼이 추가될 때마다 전체 테이블 오염
- Badak 공인회원 로직이 SmarComm 코드에 영향
- 23개 브랜드가 모두 같은 User 인터페이스를 공유 → 타입이 비대
- RLS가 "모든 인증 사용자가 모든 멤버를 읽을 수 있음" → 보안 취약

---

## 새 아키텍처: 3계층 설계

```
┌─────────────────────────────────────────────────────┐
│                    Tier 1: 여권                      │
│              members (Core Identity)                 │
│   "우주를 관통하는 단일한 신분증"                       │
│   id, auth_id, email, name, avatar, status           │
└──────────────────────┬──────────────────────────────┘
                       │ 1:N
┌──────────────────────┴──────────────────────────────┐
│                 Tier 2: 뱃지                         │
│           member_roles (Universe Badges)              │
│   "유니버스에서 획득한 역할/자격"                       │
│   staff, partner, crew, madleaguer, investor...       │
└──────────────────────┬──────────────────────────────┘
                       │ 1:N
┌──────────────────────┴──────────────────────────────┐
│              Tier 3: 행성별 옷                        │
│        brand_profiles (Site-Specific)                 │
│   "각 행성에서 입는 현지 복장"                         │
│   tenone_profiles, smarcomm_profiles,                │
│   badak_profiles, madleague_profiles...              │
└─────────────────────────────────────────────────────┘
```

---

## Tier 1: Core Identity (여권)

> **절대 변하지 않는 코어 정체성. 23개 브랜드 공통.**

### 테이블: `members` (슬림화)

```sql
CREATE TABLE members (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id     UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

    -- 코어 신원
    email       VARCHAR(255) NOT NULL UNIQUE,
    name        VARCHAR(100) NOT NULL,
    avatar_url  TEXT,
    avatar_initials VARCHAR(4),
    phone       VARCHAR(20),
    bio         TEXT,

    -- 상태
    status      TEXT NOT NULL DEFAULT 'active',  -- active | suspended | deactivated
    origin_site VARCHAR(100) DEFAULT 'tenone.biz',

    -- 메타
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),
    last_login_at   TIMESTAMPTZ,

    -- 뉴스레터 (유니버스 공통)
    newsletter_subscribed BOOLEAN DEFAULT false
);
```

**제거 대상 (Tier 2/3로 이동):**
| 현재 컬럼 | 이동 위치 | 이유 |
|-----------|-----------|------|
| `account_type` | Tier 2 `member_roles` | 역할은 여러 개 가능 |
| `roles[]` | Tier 2 `member_roles` | 정규화 |
| `affiliations[]` | Tier 2 `member_roles` | 정규화 |
| `department, position, employee_id, hire_date` | Tier 3 `tenone_staff_profiles` | TenOne 전용 |
| `intra_access, module_access[], system_access[]` | Tier 2에서 **파생** | 하드코딩 제거 |
| `brand_access[]` | Tier 2에서 **파생** | 하드코딩 제거 |
| `total_points, grade` | Tier 3 각 브랜드 또는 별도 `member_points` | 브랜드별 포인트 |
| `skills[], group[]` | Tier 3 해당 브랜드 프로필 | 맥락 의존적 |
| `brand_roles` | Tier 2 `member_roles` | JSONB → 정규 테이블 |
| `company` | Tier 3 해당 브랜드 프로필 | 브랜드마다 다름 |

### TypeScript: `CoreIdentity`

```typescript
// types/identity.ts

/** Tier 1: 유니버스 여권 — 모든 브랜드 공통 */
export interface CoreIdentity {
    id: string;
    authId: string;
    email: string;
    name: string;
    avatarUrl?: string;
    avatarInitials: string;
    phone?: string;
    bio?: string;
    status: 'active' | 'suspended' | 'deactivated';
    originSite: string;
    createdAt: string;
    lastLoginAt?: string;
}
```

---

## Tier 2: Universe Roles (뱃지)

> **유니버스 전체 단위의 역할/자격. "이 사람이 뭘 할 수 있는가?"**

### 테이블: `member_roles`

```sql
CREATE TABLE member_roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

    -- 역할 정의
    role        TEXT NOT NULL,       -- 'staff', 'partner', 'crew', 'madleaguer', ...
    context     TEXT DEFAULT 'universe',  -- 'universe' (전체) 또는 브랜드 ID ('badak', 'madleague')

    -- 메타
    granted_at  TIMESTAMPTZ DEFAULT now(),
    granted_by  UUID REFERENCES members(id),  -- 누가 부여했는가
    expires_at  TIMESTAMPTZ,                  -- NULL = 영구
    is_active   BOOLEAN DEFAULT true,

    -- 중복 방지
    UNIQUE(member_id, role, context)
);

CREATE INDEX idx_member_roles_member ON member_roles(member_id);
CREATE INDEX idx_member_roles_role ON member_roles(role);
CREATE INDEX idx_member_roles_context ON member_roles(context, role);
```

### 역할 체계 (Role Taxonomy)

```
Universe Roles (context = 'universe')
├── super_admin    — 신(God). TenOne 최고 관리자. 모든 것에 접근.
├── staff          — TenOne 정직원. 인트라 접근 가능.
├── partner        — 파트너사 소속. 제한적 인트라 접근.
├── junior_partner — 주니어 파트너. 더 제한적.
├── alliance       — 제휴사 소속.
├── crew           — 프로젝트 크루 (프리랜서/계약직).
├── investor       — 투자자. 특별 대시보드 접근.
└── member         — 일반 회원 (기본값). 퍼블릭만 접근.

Brand Roles (context = 브랜드 ID)
├── madleague:leader      — MAD League 리더
├── madleague:member      — MAD League 동아리원
├── badak:certified       — Badak 공인회원
├── badak:advertiser      — Badak 광고주
├── smarcomm:subscriber   — SmarComm 유료 구독자
├── smarcomm:admin        — SmarComm 워크스페이스 관리자
├── hero:talent           — HeRo 인재풀 등록자
├── hero:recruiter        — HeRo 리크루터
├── evolution:instructor  — Evolution 강사
├── evolution:student     — Evolution 수강생
└── ...
```

### 권한 파생 규칙 (하드코딩 대신 규칙 기반)

```sql
-- 뷰: 멤버별 접근 가능 브랜드 목록
CREATE VIEW member_brand_access AS
SELECT DISTINCT
    mr.member_id,
    CASE
        WHEN mr.context = 'universe' AND mr.role IN ('super_admin', 'staff')
            THEN b.id  -- staff는 모든 브랜드 접근
        WHEN mr.context != 'universe'
            THEN mr.context  -- 브랜드 역할이 있으면 해당 브랜드 접근
    END AS brand_id
FROM member_roles mr
CROSS JOIN brands b
WHERE mr.is_active = true
  AND (mr.expires_at IS NULL OR mr.expires_at > now());

-- 뷰: 인트라 접근 가능 여부
CREATE VIEW member_intra_access AS
SELECT member_id, true AS can_access
FROM member_roles
WHERE role IN ('super_admin', 'staff', 'partner', 'junior_partner', 'crew')
  AND context = 'universe'
  AND is_active = true
  AND (expires_at IS NULL OR expires_at > now());
```

### TypeScript: `UniverseRole`

```typescript
// types/identity.ts

/** 유니버스 역할 종류 */
export type UniverseRoleType =
    | 'super_admin' | 'staff' | 'partner' | 'junior_partner'
    | 'alliance' | 'crew' | 'investor' | 'member';

/** Tier 2: 유니버스 뱃지 */
export interface UniverseRole {
    id: string;
    role: string;           // 'staff', 'badak:certified', ...
    context: string;        // 'universe' 또는 브랜드 ID
    grantedAt: string;
    expiresAt?: string;
    isActive: boolean;
}

/** 역할에서 파생되는 권한 */
export interface DerivedPermissions {
    canAccessIntra: boolean;
    accessibleBrands: string[];
    accessibleModules: string[];
    isStaff: boolean;
    isSuperAdmin: boolean;
}
```

---

## Tier 3: Site-Specific Data (행성별 옷)

> **각 브랜드에서만 필요한 확장 데이터. 다른 행성을 오염시키지 않는다.**
>
> Tier 3는 단일 테이블이 아니라 **3가지 하위 유형**으로 나뉜다.

### Tier 3의 3가지 하위 유형

```
Tier 3: 행성별 데이터
│
├── 3A. 프로필 (Profile)          1:1    천천히 변함
│    "이 사람이 이 행성에서 누구인가?"
│    예: SmarComm 구독 등급, Badak 인증 상태, MADLeague 기수
│
├── 3B. 활동 기록 (Activity Log)  1:N    계속 쌓임
│    "이 사람이 이 행성에서 뭘 했는가?"
│    예: 수강 이력, 결제 내역, 참여 프로젝트, 포인트 이력
│
└── 3C. 구독/설정 (Preferences)   1:1    사용자가 직접 변경
     "이 사람이 이 행성에서 뭘 원하는가?"
     예: 뉴스레터 수신, 알림 설정, 언어, 테마
```

### 왜 3가지로 나누는가?

```
❌ 나쁜 설계: evolution_profiles 하나에 전부 넣기
  → is_instructor, enrolled_courses[], completed_courses[],
    certificates[], newsletter_opt_in, notification_pref...
  → 수강 완료할 때마다 배열 UPDATE (비효율, 히스토리 유실)

✅ 좋은 설계: 유형별 분리
  → evolution_profiles:     is_instructor, instructor_bio (프로필)
  → evolution_enrollments:  course_id, enrolled_at, status (활동 기록)
  → evolution_preferences:  newsletter, notifications (설정)
```

---

### 3A. 프로필 테이블 (1:1, 브랜드별 신분증)

> **member_id 당 1행. 그 브랜드에서의 "신분"을 정의.**

#### TenOne Staff Profile (HR 데이터)

```sql
CREATE TABLE tenone_staff_profiles (
    member_id       UUID PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
    department      VARCHAR(100),
    position        VARCHAR(100),
    employee_id     VARCHAR(50),
    hire_date       DATE,
    employment_type VARCHAR(50),  -- 정규직, 계약직, 인턴, 파견
    team            VARCHAR(100),
    office_location VARCHAR(100),
    emergency_contact VARCHAR(100),
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);
```

#### SmarComm Profile (마케팅 솔루션)

```sql
CREATE TABLE smarcomm_profiles (
    member_id         UUID PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
    subscription_tier TEXT DEFAULT 'free',  -- free, starter, pro, business, enterprise
    workspace_id      UUID,
    company           VARCHAR(200),
    company_size      VARCHAR(50),   -- 1-10, 11-50, 51-200, 200+
    industry          VARCHAR(100),
    billing_email     VARCHAR(255),
    trial_ends_at     TIMESTAMPTZ,
    created_at        TIMESTAMPTZ DEFAULT now(),
    updated_at        TIMESTAMPTZ DEFAULT now()
);
```

#### Badak Profile (네트워킹/광고)

```sql
CREATE TABLE IF NOT EXISTS badak_profiles (
    member_id       UUID PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
    is_certified    BOOLEAN DEFAULT false,
    certification_date TIMESTAMPTZ,
    badge           TEXT,            -- 'gold', 'silver', 'bronze'
    specialty       TEXT[],
    job_function    VARCHAR(100),
    industry        VARCHAR(100),
    experience_years INTEGER,
    company         VARCHAR(200),
    can_offer       TEXT[],
    looking_for     TEXT[],
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);
```

#### MADLeague Profile (대학 동아리 연합)

```sql
CREATE TABLE madleague_profiles (
    member_id       UUID PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
    university      VARCHAR(200),
    club_name       VARCHAR(200),
    generation      INTEGER,         -- 기수
    league_role     TEXT,            -- 'leader', 'vice_leader', 'member', 'alumni'
    major           VARCHAR(100),
    graduation_year INTEGER,
    is_alumni       BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);
```

#### HeRo Profile (인재 매칭)

```sql
CREATE TABLE IF NOT EXISTS hero_profiles (
    member_id       UUID PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
    talent_type     TEXT,            -- 'developer', 'designer', 'marketer'
    experience_level TEXT,           -- 'junior', 'mid', 'senior', 'lead'
    resume_url      TEXT,
    portfolio_url   TEXT,
    availability    TEXT DEFAULT 'not_looking',
    desired_salary  VARCHAR(50),
    skills          TEXT[],
    preferred_industries TEXT[],
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);
```

#### Evolution School Profile (교육)

```sql
CREATE TABLE evolution_profiles (
    member_id       UUID PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
    is_instructor   BOOLEAN DEFAULT false,
    instructor_bio  TEXT,
    total_learning_hours INTEGER DEFAULT 0,  -- 집계 캐시
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);
```

#### Myverse Profile (개인 대시보드)

```sql
-- 이미 존재: myverse_profiles
-- 그대로 유지 (display_name, bio, interests, mood, cover_image 등)
```

---

### 3A+. 프로필 내 등급/권한 변이 (Level-Up & Transitions)

> **Tier 3 프로필은 "고정"이 아니다. 안에서 등급이 오르고, 권한이 추가된다.**
> **변이의 "현재 상태"는 3A 프로필에, "이력"은 3B 활동 기록에 저장한다.**

#### 패턴: 현재 상태 vs 이력 분리

```
┌──────────────────────────────────────────────────────────────┐
│  3A 프로필 (현재 스냅샷)          3B 이력 (변이 기록)          │
│                                                              │
│  badak_profiles                  member_role_history          │
│  ├── badge = 'platinum'          ├── 2024-01 bronze 부여      │
│  ├── is_certified = true         ├── 2024-06 silver 승격      │
│  └── specialty = ['마케팅']      ├── 2025-01 gold 승격        │
│       ↑ 현재 값만                 ├── 2025-03 certified 획득   │
│                                  └── 2025-12 platinum 승격    │
│                                       ↑ 전체 히스토리          │
└──────────────────────────────────────────────────────────────┘
```

#### 공통: 역할/등급 변이 이력 테이블

```sql
-- 모든 브랜드의 등급/권한 변경을 추적하는 공통 이력 테이블
CREATE TABLE member_role_history (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    brand_id    TEXT NOT NULL,          -- 'badak', 'smarcomm', 'universe', ...

    -- 변경 내용
    action      TEXT NOT NULL,          -- 'granted', 'revoked', 'upgraded', 'downgraded', 'expired'
    role_or_level TEXT NOT NULL,        -- 변경된 역할/등급 이름
    previous_value TEXT,               -- 이전 값 (upgrade 시)
    new_value   TEXT,                  -- 새 값

    -- 맥락
    reason      TEXT,                  -- 'subscription_payment', 'manual_admin', 'auto_promotion', 'exam_passed'
    changed_by  UUID REFERENCES members(id),  -- NULL이면 시스템 자동
    reference_id UUID,                 -- 관련 리소스 (결제 ID, 시험 ID 등)
    metadata    JSONB DEFAULT '{}',    -- 추가 정보 (유연하게)

    created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_role_history_member ON member_role_history(member_id, brand_id, created_at DESC);
```

#### 실전 시나리오: 등급 변이 예시

```
📍 시나리오 1: SmarComm Free → Pro 업그레이드
─────────────────────────────────────────────
1. 결제 완료 이벤트 발생
2. smarcomm_profiles UPDATE: subscription_tier = 'pro'
3. member_roles INSERT: { role: 'subscriber', context: 'smarcomm' }
4. member_role_history INSERT: {
     brand_id: 'smarcomm',
     action: 'upgraded',
     role_or_level: 'subscription_tier',
     previous_value: 'free',
     new_value: 'pro',
     reason: 'subscription_payment',
     reference_id: '결제ID'
   }

📍 시나리오 2: Badak 일반 → 공인회원 인증
─────────────────────────────────────────
1. 인증 심사 통과
2. badak_profiles UPDATE: is_certified = true, badge = 'silver'
3. member_roles INSERT: { role: 'certified', context: 'badak' }
4. member_role_history INSERT: {
     action: 'granted',
     role_or_level: 'certified',
     reason: 'certification_exam_passed'
   }

📍 시나리오 3: Evolution 수강생 → 전 과정 수료 → 강사 자격
──────────────────────────────────────────────────────────
1. 마지막 필수 과정 완료
2. evolution_enrollments UPDATE: status = 'completed'
3. evolution_profiles UPDATE: is_instructor = true
4. member_roles INSERT: { role: 'instructor', context: 'evolution' }
5. member_role_history INSERT: {
     action: 'granted',
     role_or_level: 'instructor',
     reason: 'auto_promotion',
     metadata: { completed_courses: ['과정A', '과정B', '과정C'] }
   }

📍 시나리오 4: 구독 만료 (자동 다운그레이드)
──────────────────────────────────────────
1. 크론잡/웹훅: SmarComm Pro 결제 실패
2. smarcomm_profiles UPDATE: subscription_tier = 'free'
3. member_roles DELETE: { role: 'subscriber', context: 'smarcomm' }
4. member_role_history INSERT: {
     action: 'downgraded',
     role_or_level: 'subscription_tier',
     previous_value: 'pro',
     new_value: 'free',
     reason: 'payment_failed'
   }
```

#### 자동 승급 규칙 (트리거/크론)

```sql
-- 예: Badak 포인트 기반 자동 배지 승급
CREATE OR REPLACE FUNCTION auto_badge_upgrade()
RETURNS TRIGGER AS $$
DECLARE
    total INT;
    current_badge TEXT;
    new_badge TEXT;
BEGIN
    -- 해당 멤버의 Badak 포인트 합산
    SELECT COALESCE(SUM(points), 0) INTO total
    FROM member_points
    WHERE member_id = NEW.member_id AND brand_id = 'badak';

    -- 현재 배지
    SELECT badge INTO current_badge
    FROM badak_profiles WHERE member_id = NEW.member_id;

    -- 등급 판정
    new_badge := CASE
        WHEN total >= 10000 THEN 'platinum'
        WHEN total >= 5000  THEN 'gold'
        WHEN total >= 1000  THEN 'silver'
        ELSE 'bronze'
    END;

    -- 변경이 있으면 업데이트 + 이력 기록
    IF new_badge != COALESCE(current_badge, 'bronze') THEN
        UPDATE badak_profiles SET badge = new_badge WHERE member_id = NEW.member_id;
        INSERT INTO member_role_history (member_id, brand_id, action, role_or_level, previous_value, new_value, reason)
        VALUES (NEW.member_id, 'badak', 'upgraded', 'badge', current_badge, new_badge, 'auto_promotion');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_badak_badge_upgrade
    AFTER INSERT ON member_points
    FOR EACH ROW
    WHEN (NEW.brand_id = 'badak')
    EXECUTE FUNCTION auto_badge_upgrade();
```

#### TypeScript: 변이 추적 타입

```typescript
// types/identity.ts

/** 등급/권한 변이 이력 */
interface RoleHistoryEntry {
    id: string;
    brandId: string;
    action: 'granted' | 'revoked' | 'upgraded' | 'downgraded' | 'expired';
    roleOrLevel: string;
    previousValue?: string;
    newValue?: string;
    reason?: string;
    changedBy?: string;    // 관리자 ID (null = 시스템)
    metadata?: Record<string, unknown>;
    createdAt: string;
}

/** 프로필에 현재 등급 정보 포함 */
interface BadakProfile {
    memberId: string;
    isCertified: boolean;
    certificationDate?: string;
    badge: 'bronze' | 'silver' | 'gold' | 'platinum';  // 현재 등급
    // ... 기타 필드
}
```

---

### 3B. 활동 기록 테이블 (1:N, 계속 쌓이는 이력)

> **INSERT 중심. 한 번 기록되면 수정보다 추가가 많다.**
> **각 브랜드가 필요한 만큼 만든다. 공통 패턴은 공유.**

#### 공통 패턴: 포인트/등급 이력 (모든 브랜드 공유)

```sql
-- 유니버스 공통 포인트 시스템
CREATE TABLE member_points (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    brand_id    TEXT NOT NULL,         -- 'tenone', 'badak', 'madleague', ...
    points      INTEGER NOT NULL,      -- +100, -50
    reason      TEXT NOT NULL,         -- 'login_bonus', 'post_created', 'event_attended'
    reference_id UUID,                 -- 관련 리소스 ID (게시물, 이벤트 등)
    created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_member_points_member ON member_points(member_id, brand_id);

-- 브랜드별 누적 포인트 (집계 뷰)
CREATE VIEW member_points_summary AS
SELECT member_id, brand_id,
       SUM(points) AS total_points,
       CASE
           WHEN SUM(points) >= 10000 THEN 'Diamond'
           WHEN SUM(points) >= 5000  THEN 'Platinum'
           WHEN SUM(points) >= 2000  THEN 'Gold'
           WHEN SUM(points) >= 500   THEN 'Silver'
           ELSE 'Bronze'
       END AS grade
FROM member_points
GROUP BY member_id, brand_id;
```

#### Evolution: 수강 이력

```sql
CREATE TABLE evolution_enrollments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    course_id   UUID NOT NULL REFERENCES courses(id),
    status      TEXT DEFAULT 'enrolled',  -- enrolled, in_progress, completed, dropped
    enrolled_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    score       NUMERIC(5,2),             -- 최종 점수
    certificate_url TEXT,                 -- 수료증 URL
    created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_evolution_enrollments_member ON evolution_enrollments(member_id);
```

#### SmarComm: 결제/구독 이력

```sql
CREATE TABLE smarcomm_billing_history (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    plan_tier   TEXT NOT NULL,             -- 'starter', 'pro', 'business'
    amount      INTEGER NOT NULL,          -- 원 단위
    currency    VARCHAR(3) DEFAULT 'KRW',
    status      TEXT DEFAULT 'paid',       -- paid, refunded, failed
    period_start TIMESTAMPTZ,
    period_end  TIMESTAMPTZ,
    invoice_url TEXT,
    created_at  TIMESTAMPTZ DEFAULT now()
);
```

#### HeRo: 지원/매칭 이력

```sql
CREATE TABLE hero_applications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    job_id      UUID NOT NULL,             -- 채용 공고 ID
    status      TEXT DEFAULT 'applied',    -- applied, screening, interview, offered, rejected
    applied_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now(),
    notes       TEXT
);
```

#### Badak: 네트워킹 활동 이력

```sql
CREATE TABLE badak_connections (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    target_member_id UUID NOT NULL REFERENCES members(id),
    status      TEXT DEFAULT 'pending',    -- pending, connected, blocked
    connected_at TIMESTAMPTZ,
    message     TEXT,
    created_at  TIMESTAMPTZ DEFAULT now()
);
```

#### MADLeague: 프로젝트 참여 이력

```sql
CREATE TABLE madleague_participations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    project_id  UUID NOT NULL,
    role        TEXT,                      -- 'pm', 'developer', 'designer', 'member'
    joined_at   TIMESTAMPTZ DEFAULT now(),
    left_at     TIMESTAMPTZ,
    contribution_note TEXT
);
```

#### 공통: 로그인/방문 이력 (전 브랜드 통합)

```sql
CREATE TABLE member_visits (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    brand_id    TEXT NOT NULL,
    visited_at  TIMESTAMPTZ DEFAULT now(),
    ip_address  INET,
    user_agent  TEXT
);
-- 자동 파티셔닝 or 30일 보관 후 삭제
CREATE INDEX idx_member_visits_recent ON member_visits(member_id, visited_at DESC);
```

---

### 3C. 구독/설정 테이블 (1:1, 사용자가 직접 관리)

> **사용자의 "선호"와 "동의". GDPR/개인정보 관련 항목도 여기.**
> **공통 테이블 하나 + 브랜드별 확장으로 처리.**

#### 공통: 브랜드별 구독/알림 설정

```sql
-- 모든 브랜드에 적용되는 사용자 설정 (범용)
CREATE TABLE member_preferences (
    member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    brand_id        TEXT NOT NULL,          -- 'tenone', 'badak', 'smarcomm', ...

    -- 뉴스레터 / 마케팅
    newsletter_subscribed   BOOLEAN DEFAULT false,
    marketing_email_opt_in  BOOLEAN DEFAULT false,
    marketing_sms_opt_in    BOOLEAN DEFAULT false,

    -- 알림 설정
    notify_email    BOOLEAN DEFAULT true,
    notify_push     BOOLEAN DEFAULT false,
    notify_kakao    BOOLEAN DEFAULT false,

    -- UI 설정
    language        VARCHAR(5) DEFAULT 'ko',    -- 'ko', 'en', 'ja'
    theme           VARCHAR(20) DEFAULT 'system', -- 'light', 'dark', 'system'
    timezone        VARCHAR(50) DEFAULT 'Asia/Seoul',

    -- 개인정보 동의
    privacy_agreed_at    TIMESTAMPTZ,
    terms_agreed_at      TIMESTAMPTZ,
    data_retention_agreed BOOLEAN DEFAULT false,

    -- 메타
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),

    PRIMARY KEY (member_id, brand_id)
);
```

**이 설계의 장점:**

```
Q: "김텐원이 Badak에서는 뉴스레터 받고, SmarComm에서는 안 받고 싶어요"

A: member_preferences 테이블에서:
   (김텐원, 'badak')    → newsletter_subscribed = true
   (김텐원, 'smarcomm') → newsletter_subscribed = false

Q: "유니버스 전체 뉴스레터 수신 거부"

A: members 테이블에서:
   newsletter_subscribed = false  (Tier 1 = 전체 기본값)
   → 각 브랜드 설정에서 override 가능
```

#### 우선순위 규칙 (Override Chain)

```
Tier 1 (members.newsletter_subscribed)     ← 유니버스 기본값
  ↓ 브랜드별 override
Tier 3C (member_preferences.newsletter)    ← 브랜드별 설정

판단 로직:
1. member_preferences에 해당 브랜드 행이 있으면 → 그 값 사용
2. 없으면 → members.newsletter_subscribed 사용 (전체 기본값)
```

---

### Tier 3 전체 구조 요약

```
                    ┌─ 3A. 프로필 (1:1)
                    │   tenone_staff_profiles
                    │   smarcomm_profiles
                    │   badak_profiles
                    │   madleague_profiles
                    │   hero_profiles
                    │   evolution_profiles
                    │   myverse_profiles
                    │
Tier 3 ─────────────┼─ 3B. 활동 기록 (1:N)
(행성별 데이터)      │   member_points          ← 공통 (brand_id 포함)
                    │   member_visits           ← 공통 (brand_id 포함)
                    │   evolution_enrollments   ← Evolution 전용
                    │   smarcomm_billing_history ← SmarComm 전용
                    │   hero_applications       ← HeRo 전용
                    │   badak_connections        ← Badak 전용
                    │   madleague_participations ← MADLeague 전용
                    │
                    └─ 3C. 구독/설정 (1:1 per brand)
                        member_preferences      ← 공통 (brand_id 포함)
                        (뉴스레터, 알림, 언어, 테마, 개인정보 동의)
```

### TypeScript 타입

```typescript
// types/identity.ts

/** Tier 3A: 사이트별 프로필 (유니온 타입) */
type SiteProfile =
    | { type: 'tenone'; data: TenOneStaffProfile }
    | { type: 'smarcomm'; data: SmarCommProfile }
    | { type: 'badak'; data: BadakProfile }
    | { type: 'madleague'; data: MadLeagueProfile }
    | { type: 'hero'; data: HeroProfile }
    | { type: 'evolution'; data: EvolutionProfile }
    | { type: 'myverse'; data: MyverseProfile }
    | null;

/** Tier 3B: 활동 기록 (각 브랜드별 타입) */
interface PointEntry {
    id: string;
    brandId: string;
    points: number;
    reason: string;
    createdAt: string;
}

interface EvolutionEnrollment {
    id: string;
    courseId: string;
    status: 'enrolled' | 'in_progress' | 'completed' | 'dropped';
    enrolledAt: string;
    completedAt?: string;
    score?: number;
    certificateUrl?: string;
}

/** Tier 3C: 브랜드별 구독/설정 */
interface BrandPreferences {
    brandId: string;
    newsletterSubscribed: boolean;
    marketingEmailOptIn: boolean;
    notifyEmail: boolean;
    notifyPush: boolean;
    notifyKakao: boolean;
    language: string;
    theme: 'light' | 'dark' | 'system';
}

/** 전체 Tier 3 묶음 */
interface SiteData {
    profile: SiteProfile;              // 3A
    preferences: BrandPreferences | null;  // 3C
    // 3B는 필요 시 lazy 로딩 (목록이므로 초기 로드에 포함 안 함)
}
```

### 프로필 테이블이 필요 없는 브랜드

다음 브랜드들은 3A 프로필 테이블 불필요 (Tier 2 역할 + 3C 설정만으로 충분):

| 브랜드 | 이유 | 사용하는 Tier 3 |
|--------|------|----------------|
| Seoul360 | 관광 가이드 — 기본 회원만 | 3C 설정만 |
| Montz | 포토그래피 — 작품은 콘텐츠 테이블 | 3C 설정만 |
| FWN | 랜딩 페이지 수준 | 3C 설정만 |
| 0gamja | 단순 커뮤니티 — 게시판 시스템 | 3B 활동 + 3C 설정 |
| Domo | 시니어 네트워킹 — Badak 구조 공유 가능 | 필요 시 domo_profiles 추가 |
| NatureBox, Townity | 서비스 특성상 | 3C 설정만 |
| WIO | SaaS 플랫폼 — 워크스페이스 단위 | 별도 wio_workspaces 테이블 |

---

## 실전 흐름: "김텐원"이 유니버스를 돌아다닐 때

### 1. 로그인 순간

```
[Browser] → Supabase Auth (signInWithPassword)
    ↓
[Middleware] → 세션 쿠키 설정
    ↓
[Auth Context] → members 테이블에서 Tier 1 (CoreIdentity) 로드
               → member_roles 테이블에서 Tier 2 (Roles) 로드
               → 현재 도메인에 맞는 Tier 3 프로필 로드
    ↓
[Context State] → { identity, roles, siteProfile, permissions }
```

### 2. 사이트별 경험

```typescript
// lib/identity-context.tsx (새 컨텍스트)

interface UniverseUser {
    // Tier 1: 여권
    identity: CoreIdentity;

    // Tier 2: 뱃지 (전체 목록)
    roles: UniverseRole[];

    // Tier 2에서 파생
    permissions: DerivedPermissions;

    // Tier 3: 현재 사이트 프로필 (사이트마다 다름)
    siteProfile: SiteProfile | null;
}

// 사이트별 프로필 타입 유니온
type SiteProfile =
    | { type: 'tenone'; data: TenOneStaffProfile }
    | { type: 'smarcomm'; data: SmarCommProfile }
    | { type: 'badak'; data: BadakProfile }
    | { type: 'madleague'; data: MadLeagueProfile }
    | { type: 'hero'; data: HeroProfile }
    | { type: 'evolution'; data: EvolutionProfile }
    | { type: 'myverse'; data: MyverseProfile }
    | null;
```

### 3. 시나리오별 동작

```
📍 김텐원이 Badak(바닥)에 접속
─────────────────────────────
1. 미들웨어: badak.biz → /badak 리라이트
2. Auth Context:
   - Tier 1 로드: { name: "김텐원", email: "kt@tenone.biz" }
   - Tier 2 로드: [
       { role: "staff", context: "universe" },
       { role: "certified", context: "badak" }
     ]
   - Tier 3 로드: badak_profiles → { is_certified: true, badge: "gold" }
3. UI: ✅ 공인회원 배지 표시 + 프라이빗 게시판 접근


📍 김텐원이 SmarComm에 접속
─────────────────────────────
1. 미들웨어: smarcomm.biz → /smarcomm 리라이트
2. Auth Context:
   - Tier 1 로드: 동일
   - Tier 2 로드: [
       { role: "staff", context: "universe" }
       // SmarComm 구독 역할 없음
     ]
   - Tier 3 로드: smarcomm_profiles → NULL (프로필 없음)
3. UI: 일반 회원 대시보드만 표시 (구독 필요 안내)


📍 외부인 "박바닥"이 인트라넷 접근 시도
──────────────────────────────────────
1. Auth Context:
   - Tier 2 로드: [
       { role: "member", context: "universe" },
       { role: "certified", context: "badak" }
     ]
   - permissions.canAccessIntra = false  (staff/partner/crew가 아님)
2. UI: ❌ "내부 구성원 전용" 에러
```

---

## 마이그레이션 전략

### Phase 1: 새 테이블 생성 + 데이터 이관 (비파괴적)

```sql
-- 1. member_roles 테이블 생성
-- 2. 기존 members.roles[] → member_roles INSERT
-- 3. 기존 members.affiliations[] → member_roles INSERT (context = 브랜드ID)
-- 4. 기존 members.account_type → member_roles INSERT (context = 'universe')
-- 5. 브랜드별 프로필 테이블 생성
-- 6. 기존 members의 HR 필드 → tenone_staff_profiles 이관
```

### Phase 2: 코드 전환 (점진적)

```
1. types/identity.ts 생성 (새 타입 정의)
2. lib/identity-context.tsx 생성 (새 컨텍스트)
3. 기존 auth-context.tsx는 identity-context를 래핑하여 하위 호환
4. 각 브랜드 페이지에서 점진적으로 새 컨텍스트 사용
5. 인트라 layout에서 member_roles 기반 권한 확인으로 전환
```

### Phase 3: 정리

```
1. members 테이블에서 이관 완료된 컬럼 제거
2. 기존 auth-context의 레거시 필드 deprecate
3. RLS 정책 강화 (브랜드별 격리)
```

---

## RLS 정책 설계

```sql
-- members: 본인 읽기 + staff는 전체 읽기
CREATE POLICY "members_select" ON members FOR SELECT USING (
    auth_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM member_roles
        WHERE member_id = (SELECT id FROM members WHERE auth_id = auth.uid())
        AND role IN ('super_admin', 'staff')
        AND context = 'universe'
        AND is_active = true
    )
);

-- member_roles: 본인 역할은 본인이 읽기 + staff는 전체
CREATE POLICY "roles_select" ON member_roles FOR SELECT USING (
    member_id = (SELECT id FROM members WHERE auth_id = auth.uid())
    OR EXISTS (
        SELECT 1 FROM member_roles
        WHERE member_id = (SELECT id FROM members WHERE auth_id = auth.uid())
        AND role IN ('super_admin', 'staff')
        AND context = 'universe'
        AND is_active = true
    )
);

-- 브랜드 프로필: 본인 + 해당 브랜드 관리자
CREATE POLICY "badak_profiles_select" ON badak_profiles FOR SELECT USING (
    member_id = (SELECT id FROM members WHERE auth_id = auth.uid())
    OR EXISTS (
        SELECT 1 FROM member_roles
        WHERE member_id = (SELECT id FROM members WHERE auth_id = auth.uid())
        AND (
            (role = 'super_admin' AND context = 'universe')
            OR (context = 'badak' AND role IN ('admin', 'moderator'))
        )
        AND is_active = true
    )
);
```

---

## API 설계: 사이트별 유저 조립

```typescript
// lib/supabase/identity.ts

/**
 * 현재 사이트에 맞는 유저 정보 조립
 * 미들웨어/Context에서 호출
 */
export async function assembleUser(
    authId: string,
    currentBrand: string
): Promise<UniverseUser | null> {
    const supabase = createClient();

    // Tier 1: 코어 신원
    const { data: member } = await supabase
        .from('members')
        .select('*')
        .eq('auth_id', authId)
        .single();

    if (!member) return null;

    // Tier 2: 모든 활성 역할
    const { data: roles } = await supabase
        .from('member_roles')
        .select('*')
        .eq('member_id', member.id)
        .eq('is_active', true);

    // Tier 2 → 권한 파생
    const permissions = derivePermissions(roles || []);

    // Tier 3: 현재 브랜드 프로필 (있으면)
    const siteProfile = await loadSiteProfile(supabase, member.id, currentBrand);

    return {
        identity: mapToIdentity(member),
        roles: roles || [],
        permissions,
        siteProfile,
    };
}

/** 역할에서 권한 파생 */
function derivePermissions(roles: UniverseRole[]): DerivedPermissions {
    const universeRoles = roles
        .filter(r => r.context === 'universe')
        .map(r => r.role);

    const isSuperAdmin = universeRoles.includes('super_admin');
    const isStaff = isSuperAdmin || universeRoles.includes('staff');

    return {
        isSuperAdmin,
        isStaff,
        canAccessIntra: isStaff
            || universeRoles.includes('partner')
            || universeRoles.includes('junior_partner')
            || universeRoles.includes('crew'),
        accessibleBrands: isSuperAdmin
            ? ['*']  // 전체 접근
            : [...new Set(roles.filter(r => r.context !== 'universe').map(r => r.context))],
        accessibleModules: deriveModules(universeRoles),
    };
}

/** 브랜드별 프로필 로드 */
async function loadSiteProfile(
    supabase: any,
    memberId: string,
    brand: string
): Promise<SiteProfile | null> {
    const tableMap: Record<string, string> = {
        tenone: 'tenone_staff_profiles',
        smarcomm: 'smarcomm_profiles',
        badak: 'badak_profiles',
        madleague: 'madleague_profiles',
        hero: 'hero_profiles',
        evolution: 'evolution_profiles',
        myverse: 'myverse_profiles',
    };

    const table = tableMap[brand];
    if (!table) return null;

    const { data } = await supabase
        .from(table)
        .select('*')
        .eq('member_id', memberId)
        .single();

    return data ? { type: brand, data } as SiteProfile : null;
}
```

---

## 하위 호환 전략

기존 `auth-context.tsx`의 `User` 인터페이스를 즉시 변경하면 143개 페이지가 깨집니다.
따라서 **어댑터 패턴**으로 점진 전환합니다.

```typescript
// lib/auth-context.tsx (기존 — 어댑터 추가)

/** 새 UniverseUser → 기존 User 변환 (하위 호환) */
function universeUserToLegacyUser(uu: UniverseUser): User {
    const staffProfile = uu.siteProfile?.type === 'tenone' ? uu.siteProfile.data : null;

    return {
        id: uu.identity.id,
        name: uu.identity.name,
        email: uu.identity.email,
        avatarInitials: uu.identity.avatarInitials,

        // Tier 2 → 레거시 매핑
        role: uu.permissions.isSuperAdmin ? 'Admin' : uu.permissions.isStaff ? 'Manager' : 'Member',
        accountType: deriveLegacyAccountType(uu.roles),
        primaryType: deriveLegacyAccountType(uu.roles),
        roles: uu.roles.map(r => r.context === 'universe' ? r.role : `${r.context}:${r.role}`),
        affiliations: [...new Set(uu.roles.filter(r => r.context !== 'universe').map(r => r.context))],

        // Tier 2 → 접근 권한
        intraAccess: uu.permissions.canAccessIntra,
        moduleAccess: uu.permissions.accessibleModules,
        systemAccess: [],
        brandAccess: uu.permissions.accessibleBrands,

        // Tier 3 → 스태프 프로필
        department: staffProfile?.department,
        position: staffProfile?.position,
        employeeId: staffProfile?.employee_id,
        hireDate: staffProfile?.hire_date,
        employmentType: staffProfile?.employment_type,

        // 기타
        phone: uu.identity.phone,
        bio: uu.identity.bio,
        createdAt: uu.identity.createdAt,
    };
}
```

---

## 추가 고려 사항

### 1. 계정 생명주기 (Account Lifecycle)

> **"김텐원이 Badak만 탈퇴" vs "유니버스 전체 탈퇴"**

```
계정 상태 흐름:

  가입 ─→ active ─→ suspended ─→ deactivated ─→ deleted
                 ↗     (관리자 제재)  (본인 탈퇴)    (30일 후 영구 삭제)
           복구 가능      복구 가능      복구 가능       ❌ 복구 불가
```

```sql
-- Tier 1: 전체 탈퇴 (유니버스에서 나감)
-- members.status = 'deactivated'
-- → 30일 유예 후 auth.users + members + 모든 Tier 2/3 데이터 삭제
-- → 게시물/댓글은 익명화 (author_name = '탈퇴한 사용자')

-- Tier 3: 브랜드별 탈퇴 (특정 행성에서만 나감)
-- badak_profiles DELETE + member_roles WHERE context='badak' DELETE
-- → members 유지, 다른 브랜드 데이터 유지
-- → 해당 브랜드 활동 기록은 익명화

ALTER TABLE members ADD COLUMN deactivated_at TIMESTAMPTZ;  -- 탈퇴 요청일
ALTER TABLE members ADD COLUMN deletion_scheduled_at TIMESTAMPTZ;  -- 영구 삭제 예정일
```

#### 브랜드별 탈퇴 테이블

```sql
CREATE TABLE member_brand_withdrawals (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id   UUID NOT NULL REFERENCES members(id),
    brand_id    TEXT NOT NULL,
    reason      TEXT,
    withdrawn_at TIMESTAMPTZ DEFAULT now(),
    data_deleted_at TIMESTAMPTZ  -- 실제 데이터 삭제 시점
);
```

---

### 2. 가입 경로 추적 (Referral & Funnel)

> **"이 사람이 어디서 왔고, 언제 각 브랜드에 첫 접속했는가?"**

```sql
-- 브랜드별 첫 접속/가입 기록
CREATE TABLE member_brand_joins (
    member_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    brand_id    TEXT NOT NULL,
    joined_at   TIMESTAMPTZ DEFAULT now(),

    -- 유입 경로
    referral_code   VARCHAR(50),           -- 초대 코드
    referral_member_id UUID REFERENCES members(id),  -- 추천인
    utm_source      VARCHAR(100),
    utm_medium      VARCHAR(100),
    utm_campaign    VARCHAR(100),
    landing_url     TEXT,

    PRIMARY KEY (member_id, brand_id)
);

-- 사용 예:
-- "박바닥은 2024-03에 Badak에서 가입, 초대코드 'BD2024'"
-- "2024-09에 MADLeague도 가입, 구글 광고를 통해"
```

---

### 3. 브랜드 간 데이터 공유 동의 (Cross-Brand Consent)

> **"HeRo 이력서를 Badak에서도 볼 수 있게?" → 사용자 동의 필수**

```sql
-- member_preferences 테이블에 추가 (3C 확장)
ALTER TABLE member_preferences ADD COLUMN
    cross_brand_profile_sharing BOOLEAN DEFAULT false;
    -- true: 이 브랜드의 프로필을 다른 브랜드에서 조회 가능
    -- false: 이 브랜드의 프로필은 이 브랜드에서만

-- 또는 더 세밀하게:
CREATE TABLE member_data_consents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    source_brand    TEXT NOT NULL,       -- 데이터 원본 브랜드
    target_brand    TEXT NOT NULL,       -- 공유 대상 브랜드
    data_type       TEXT NOT NULL,       -- 'profile', 'activity', 'points'
    consented       BOOLEAN DEFAULT false,
    consented_at    TIMESTAMPTZ,
    revoked_at      TIMESTAMPTZ,

    UNIQUE(member_id, source_brand, target_brand, data_type)
);

-- "김텐원이 HeRo 프로필을 Badak에서 공유하겠다고 동의"
-- INSERT INTO member_data_consents
--   (member_id, source_brand, target_brand, data_type, consented)
--   VALUES ('김텐원ID', 'hero', 'badak', 'profile', true);
```

---

### 4. 관리자 권한 위임 (Delegated Admin)

> **"MADLeague 리더가 자기 동아리원을 직접 관리"**
> **브랜드 관리자 ≠ 유니버스 관리자**

```
권한 범위 매트릭스:

                    Tier 1      Tier 2           Tier 3
                    (members)   (member_roles)   (brand profiles)
─────────────────────────────────────────────────────────────
super_admin         CRUD        CRUD 전체         CRUD 전체
staff               R           CRUD (자기 담당)   CRUD (자기 담당)
brand_admin(badak)  R           CRUD badak만      CRUD badak만
brand_member(badak) R (자기만)   R (자기만)         RU (자기 프로필만)
member              R (자기만)   R (자기만)         —
```

```sql
-- member_roles에 'admin' 역할 + context로 범위 제한
-- { role: 'admin', context: 'madleague' }
-- → MADLeague 관련 Tier 3 테이블만 CRUD 가능

-- RLS에서 활용:
CREATE POLICY "brand_admin_manage_profiles" ON madleague_profiles
FOR ALL USING (
    -- 자기 프로필이거나
    member_id = (SELECT id FROM members WHERE auth_id = auth.uid())
    -- 해당 브랜드 관리자이거나
    OR EXISTS (
        SELECT 1 FROM member_roles
        WHERE member_id = (SELECT id FROM members WHERE auth_id = auth.uid())
        AND context = 'madleague'
        AND role = 'admin'
        AND is_active = true
    )
    -- 유니버스 관리자
    OR EXISTS (
        SELECT 1 FROM member_roles
        WHERE member_id = (SELECT id FROM members WHERE auth_id = auth.uid())
        AND context = 'universe'
        AND role IN ('super_admin', 'staff')
        AND is_active = true
    )
);
```

---

### 5. 임시 권한 / 체험판 (Trial & Temporary Access)

> **"SmarComm Pro 14일 무료 체험", "이벤트 기간 한정 Badak VIP"**

```sql
-- member_roles.expires_at 활용 (이미 설계에 포함)
INSERT INTO member_roles (member_id, role, context, expires_at)
VALUES ('김텐원ID', 'subscriber', 'smarcomm', now() + interval '14 days');

-- 크론잡: 매일 만료된 역할 처리
-- (Supabase: pg_cron 또는 Edge Function scheduled)
CREATE OR REPLACE FUNCTION expire_roles()
RETURNS void AS $$
BEGIN
    -- 만료된 역할 비활성화
    UPDATE member_roles
    SET is_active = false
    WHERE expires_at < now() AND is_active = true;

    -- 이력 기록
    INSERT INTO member_role_history (member_id, brand_id, action, role_or_level, reason)
    SELECT member_id, context, 'expired', role, 'auto_expiration'
    FROM member_roles
    WHERE expires_at < now() AND is_active = false
    AND NOT EXISTS (
        SELECT 1 FROM member_role_history h
        WHERE h.member_id = member_roles.member_id
        AND h.brand_id = member_roles.context
        AND h.role_or_level = member_roles.role
        AND h.action = 'expired'
        AND h.created_at > member_roles.expires_at - interval '1 day'
    );

    -- 프로필 다운그레이드 (SmarComm 예시)
    UPDATE smarcomm_profiles sp
    SET subscription_tier = 'free'
    WHERE NOT EXISTS (
        SELECT 1 FROM member_roles mr
        WHERE mr.member_id = sp.member_id
        AND mr.context = 'smarcomm'
        AND mr.role = 'subscriber'
        AND mr.is_active = true
    )
    AND sp.subscription_tier != 'free';
END;
$$ LANGUAGE plpgsql;

-- pg_cron으로 매일 실행
-- SELECT cron.schedule('expire-roles', '0 3 * * *', 'SELECT expire_roles()');
```

---

### 6. 팀/조직 단위 계정 (B2B Organizations)

> **"SmarComm에서 회사 단위로 가입 → 직원 5명이 같은 워크스페이스"**
> **WIO 가격 플랜도 조직 단위**

```sql
CREATE TABLE organizations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(200) NOT NULL,
    slug        VARCHAR(100) UNIQUE,       -- URL용 (tenone, acme-corp)
    brand_id    TEXT NOT NULL,             -- 어느 브랜드의 조직인가
    plan_tier   TEXT DEFAULT 'free',       -- 조직 차원의 플랜
    owner_id    UUID NOT NULL REFERENCES members(id),
    logo_url    TEXT,
    max_seats   INTEGER DEFAULT 5,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE org_members (
    org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    member_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    org_role    TEXT DEFAULT 'member',     -- 'owner', 'admin', 'member', 'viewer'
    invited_by  UUID REFERENCES members(id),
    joined_at   TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (org_id, member_id)
);
```

```
조직과 개인의 관계:

┌─────────────────────────────────────────┐
│  members (개인)                          │
│  김텐원 ─┬── org_members ──→ TenOne Inc. │
│          └── org_members ──→ Badak Co.  │
│                                          │
│  박바닥 ──── org_members ──→ Badak Co.  │
│                                          │
│  이매드 ──── (조직 없음, 개인 사용)       │
└─────────────────────────────────────────┘

→ 개인 계정은 항상 존재 (Tier 1)
→ 조직은 선택적 (SmarComm/WIO에서 주로 사용)
→ 조직 플랜이 개인 역할을 override할 수 있음
   (조직이 Pro면 → 소속 멤버 전원 Pro 권한)
```

---

### 7. 감사 로그 (Audit Trail)

> **"누가 언제 무슨 권한을 변경했는가?" — 보안/규정 준수 필수**

```sql
-- member_role_history가 이미 역할 변경 이력을 담당
-- 추가로 민감한 작업 전체를 기록:

CREATE TABLE audit_log (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id    UUID REFERENCES members(id),  -- 행위자 (NULL = 시스템)
    target_id   UUID REFERENCES members(id),  -- 대상
    action      TEXT NOT NULL,         -- 'login', 'role_change', 'profile_update', 'data_export', 'account_delete'
    resource    TEXT,                  -- 'member_roles', 'badak_profiles', ...
    details     JSONB DEFAULT '{}',    -- 변경 전/후 데이터
    ip_address  INET,
    user_agent  TEXT,
    created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_audit_target ON audit_log(target_id, created_at DESC);
CREATE INDEX idx_audit_actor ON audit_log(actor_id, created_at DESC);
```

---

### 8. 전체 아키텍처 다이어그램 (최종)

```
┌──────────────────────────────────────────────────────────────────┐
│  Supabase auth.users                                             │
│  (이메일/비밀번호/소셜 인증)                                       │
└──────────────────────┬───────────────────────────────────────────┘
                       │ auth_id
┌──────────────────────┴───────────────────────────────────────────┐
│  Tier 1: members (여권)                                          │
│  id, email, name, avatar, phone, status                          │
│  + deactivated_at, deletion_scheduled_at                         │
└──────┬────────────────────────┬──────────────────────────────────┘
       │ 1:N                    │ 1:N
┌──────┴──────┐          ┌──────┴──────────────────────────────────┐
│ Tier 2:     │          │ organizations (조직)                     │
│ member_roles│          │ id, name, brand_id, plan_tier            │
│ (뱃지)      │          │   └── org_members (member_id, org_role)  │
│ role+context│          └─────────────────────────────────────────┘
│ expires_at  │
└──────┬──────┘
       │
┌──────┴──────────────────────────────────────────────────────────┐
│  Tier 3: 행성별 데이터                                            │
│                                                                   │
│  3A 프로필 (1:1)              3B 활동 기록 (1:N)                   │
│  ├ tenone_staff_profiles      ├ member_points (공통)               │
│  ├ smarcomm_profiles          ├ member_visits (공통)               │
│  ├ badak_profiles             ├ member_role_history (공통)          │
│  ├ madleague_profiles         ├ member_brand_joins (공통)           │
│  ├ hero_profiles              ├ evolution_enrollments              │
│  ├ evolution_profiles         ├ smarcomm_billing_history           │
│  └ myverse_profiles           ├ hero_applications                  │
│                               ├ badak_connections                  │
│  3C 구독/설정 (1:1/brand)     └ madleague_participations           │
│  ├ member_preferences                                              │
│  └ member_data_consents       감사: audit_log                      │
└────────────────────────────────────────────────────────────────────┘
```

---

## 성능 핵심: JWT 커스텀 클레임 (Custom Claims)

> **⚠️ 이것을 안 하면 3계층이 오히려 독이 된다.**
>
> 매 요청마다 `members → member_roles → brand_profiles` 3단 JOIN을 해야 권한을 알 수 있으면
> 유저 1만 명 시점에 DB가 죽는다. **JWT 토큰 안에 핵심 역할을 넣어서 DB 조회 없이 판단**한다.

### 문제: RLS가 매 쿼리마다 서브쿼리를 실행

```sql
-- 현재 RLS 정책 (매 SELECT마다 이 서브쿼리가 실행됨)
CREATE POLICY "brand_admin_access" ON badak_profiles FOR SELECT USING (
    member_id = (SELECT id FROM members WHERE auth_id = auth.uid())     -- 서브쿼리 1
    OR EXISTS (
        SELECT 1 FROM member_roles                                       -- 서브쿼리 2
        WHERE member_id = (SELECT id FROM members WHERE auth_id = auth.uid())  -- 서브쿼리 3
        AND context = 'badak' AND role = 'admin' AND is_active = true
    )
);
-- → badak_profiles에서 100행 SELECT하면 서브쿼리가 300번 실행
```

### 해결: JWT app_metadata에 역할 캐시

```
auth.users.raw_app_meta_data에 핵심 역할을 저장:

{
  "member_id": "uuid-xxx",
  "roles": ["staff:universe", "certified:badak", "leader:madleague"],
  "brands": ["badak", "madleague", "smarcomm"],
  "is_staff": true,
  "is_super_admin": false
}

→ RLS에서 auth.jwt() → app_metadata로 즉시 접근
→ DB 서브쿼리 0번
```

### DB 트리거: member_roles 변경 시 JWT 자동 갱신

```sql
-- 1. JWT 클레임 갱신 함수
CREATE OR REPLACE FUNCTION sync_roles_to_jwt()
RETURNS TRIGGER AS $$
DECLARE
    target_member_id UUID;
    target_auth_id UUID;
    role_array TEXT[];
    brand_array TEXT[];
    has_staff BOOLEAN;
    has_super_admin BOOLEAN;
BEGIN
    -- INSERT/UPDATE는 NEW, DELETE는 OLD
    target_member_id := COALESCE(NEW.member_id, OLD.member_id);

    -- members에서 auth_id 조회
    SELECT auth_id INTO target_auth_id
    FROM members WHERE id = target_member_id;

    IF target_auth_id IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;

    -- 현재 활성 역할 집계
    SELECT
        ARRAY_AGG(DISTINCT role || ':' || context),
        ARRAY_AGG(DISTINCT context) FILTER (WHERE context != 'universe'),
        BOOL_OR(role = 'staff' AND context = 'universe'),
        BOOL_OR(role = 'super_admin' AND context = 'universe')
    INTO role_array, brand_array, has_staff, has_super_admin
    FROM member_roles
    WHERE member_id = target_member_id
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now());

    -- auth.users.raw_app_meta_data 갱신
    UPDATE auth.users
    SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object(
        'member_id', target_member_id,
        'roles', COALESCE(role_array, ARRAY[]::TEXT[]),
        'brands', COALESCE(brand_array, ARRAY[]::TEXT[]),
        'is_staff', COALESCE(has_staff, false),
        'is_super_admin', COALESCE(has_super_admin, false),
        'roles_synced_at', now()
    )
    WHERE id = target_auth_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 트리거: member_roles 변경 시 자동 실행
CREATE TRIGGER trg_sync_jwt_on_role_change
    AFTER INSERT OR UPDATE OR DELETE ON member_roles
    FOR EACH ROW
    EXECUTE FUNCTION sync_roles_to_jwt();
```

### RLS 정책: JWT 클레임 기반 (100배 빠름)

```sql
-- ❌ 느린 방식 (매번 3단 서브쿼리)
CREATE POLICY "slow_policy" ON badak_profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM member_roles WHERE ...)
);

-- ✅ 빠른 방식 (JWT에서 즉시 읽기)
CREATE POLICY "fast_policy" ON badak_profiles FOR SELECT USING (
    -- 본인 프로필
    member_id = ((auth.jwt() -> 'app_metadata' ->> 'member_id')::UUID)
    -- 또는 badak 브랜드 접근 가능자
    OR 'badak' = ANY(
        ARRAY(SELECT jsonb_array_elements_text(auth.jwt() -> 'app_metadata' -> 'brands'))
    )
    -- 또는 staff/super_admin
    OR (auth.jwt() -> 'app_metadata' ->> 'is_staff')::BOOLEAN = true
);

-- 더 간결한 헬퍼 함수
CREATE OR REPLACE FUNCTION auth_has_brand(brand_name TEXT)
RETURNS BOOLEAN AS $$
    SELECT brand_name = ANY(
        ARRAY(SELECT jsonb_array_elements_text(
            COALESCE(auth.jwt() -> 'app_metadata' -> 'brands', '[]'::JSONB)
        ))
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth_is_staff()
RETURNS BOOLEAN AS $$
    SELECT COALESCE(
        (auth.jwt() -> 'app_metadata' ->> 'is_staff')::BOOLEAN,
        false
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth_member_id()
RETURNS UUID AS $$
    SELECT (auth.jwt() -> 'app_metadata' ->> 'member_id')::UUID;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 최종 RLS (깔끔)
CREATE POLICY "badak_profiles_select" ON badak_profiles FOR SELECT USING (
    member_id = auth_member_id()
    OR auth_has_brand('badak')
    OR auth_is_staff()
);
```

### 프론트엔드에서 JWT 클레임 활용

```typescript
// 미들웨어나 Context에서 DB 조회 없이 권한 판단
const { data: { user } } = await supabase.auth.getUser();
const appMeta = user?.app_metadata;

const isStaff = appMeta?.is_staff === true;
const isSuperAdmin = appMeta?.is_super_admin === true;
const brands = (appMeta?.brands as string[]) || [];
const roles = (appMeta?.roles as string[]) || [];
const memberId = appMeta?.member_id as string;

// Badak 접근 가능?
const canAccessBadak = isStaff || brands.includes('badak');

// 인트라 접근 가능?
const canAccessIntra = isStaff || roles.some(r =>
    r.startsWith('partner:') || r.startsWith('crew:')
);
```

### JWT 갱신 타이밍

```
1. member_roles INSERT/UPDATE/DELETE → 트리거가 즉시 app_metadata 갱신
2. 다음 토큰 리프레시 시 (보통 1시간 이내) 새 JWT에 반영
3. 즉시 반영이 필요하면 → supabase.auth.refreshSession() 호출
4. 미들웨어의 getUser()가 매 요청마다 토큰 갱신 → 자연스럽게 반영

주의: app_metadata는 서버에서만 변경 가능 (클라이언트에서 조작 불가 = 보안 OK)
```

---

## 무중단 비파괴 마이그레이션 전략 (Safe Migration)

> **⚠️ 절대 원칙: 기존 컬럼을 DROP 하지 않는다. 검증될 때까지.**
>
> 140+개 페이지가 `members.account_type`, `members.roles[]`를 직접 읽고 있다.
> 이걸 한 번에 바꾸면 프로덕션이 폭발한다.

### 마이그레이션 4대 원칙

```
1. 복사만 한다 (INSERT INTO ... SELECT)    — 원본 절대 안 건드림
2. 이중 쓰기 (Dual Write)                  — 새/구 테이블에 동시에 기록
3. 이중 읽기 (Dual Read)                   — 새 테이블 우선, 실패 시 구 테이블 fallback
4. 구 컬럼 삭제는 마지막 (Phase 완전 종료 후) — DROP은 전체 검증 후에만
```

### 마이그레이션 타임라인

```
시간 ──────────────────────────────────────────────────────────→

Phase A: 양쪽 존재 (Dual Existence)
┌──────────────────────────────────────────────────────────┐
│  members.roles[]        ← 기존 코드가 읽음 (유지)        │
│  members.account_type   ← 기존 코드가 읽음 (유지)        │
│  member_roles 테이블    ← 새 데이터 복사됨 (추가)         │
│                                                          │
│  상태: 두 곳에 같은 데이터 존재                            │
└──────────────────────────────────────────────────────────┘

Phase B: 이중 쓰기 (Dual Write)
┌──────────────────────────────────────────────────────────┐
│  역할 변경 시:                                            │
│    1. member_roles INSERT/UPDATE  ← 새 테이블 (주)       │
│    2. members.roles[] UPDATE      ← 구 테이블 (동기화)    │
│    3. JWT app_metadata 갱신       ← 트리거 자동           │
│                                                          │
│  상태: 새 테이블이 마스터, 구 테이블은 거울               │
└──────────────────────────────────────────────────────────┘

Phase C: 읽기 전환 (Read Switchover)
┌──────────────────────────────────────────────────────────┐
│  새 코드 (identity-context):                              │
│    → member_roles에서 읽기                                │
│    → JWT app_metadata에서 읽기                            │
│                                                          │
│  기존 코드 (auth-context 어댑터):                         │
│    → member_roles → 기존 User 형태로 변환                 │
│    → members.roles[]는 더 이상 안 읽음                    │
│                                                          │
│  상태: 모든 읽기가 새 테이블로 전환됨                     │
└──────────────────────────────────────────────────────────┘

Phase D: 정리 (Cleanup) — 전체 검증 후에만!
┌──────────────────────────────────────────────────────────┐
│  ✅ 모든 페이지가 새 컨텍스트/어댑터 사용 확인            │
│  ✅ 프로덕션 1주일 이상 무사고 운영 확인                  │
│  ✅ members.roles[] 컬럼 읽는 코드 = 0개 확인            │
│                                                          │
│  그제서야:                                                │
│    ALTER TABLE members DROP COLUMN roles;                 │
│    ALTER TABLE members DROP COLUMN affiliations;          │
│    ALTER TABLE members DROP COLUMN account_type;          │
│    ...                                                    │
└──────────────────────────────────────────────────────────┘
```

### 이중 쓰기 트리거 (Phase B)

```sql
-- member_roles 변경 → members.roles[] 동기화 (하위 호환)
CREATE OR REPLACE FUNCTION sync_roles_to_legacy()
RETURNS TRIGGER AS $$
DECLARE
    target_member_id UUID;
    legacy_roles TEXT[];
    legacy_affiliations TEXT[];
    legacy_account_type TEXT;
BEGIN
    target_member_id := COALESCE(NEW.member_id, OLD.member_id);

    -- 활성 역할 집계
    SELECT
        ARRAY_AGG(DISTINCT role) FILTER (WHERE context = 'universe'),
        ARRAY_AGG(DISTINCT context) FILTER (WHERE context != 'universe')
    INTO legacy_roles, legacy_affiliations
    FROM member_roles
    WHERE member_id = target_member_id AND is_active = true
      AND (expires_at IS NULL OR expires_at > now());

    -- account_type 결정 (가장 높은 우주 역할)
    legacy_account_type := CASE
        WHEN 'super_admin' = ANY(legacy_roles) THEN 'staff'
        WHEN 'staff' = ANY(legacy_roles) THEN 'staff'
        WHEN 'partner' = ANY(legacy_roles) THEN 'partner'
        WHEN 'junior_partner' = ANY(legacy_roles) THEN 'junior-partner'
        WHEN 'crew' = ANY(legacy_roles) THEN 'crew'
        ELSE 'member'
    END;

    -- 기존 members 테이블 동기화
    UPDATE members SET
        roles = COALESCE(legacy_roles, ARRAY[]::TEXT[]),
        affiliations = COALESCE(legacy_affiliations, ARRAY[]::TEXT[]),
        account_type = legacy_account_type,
        intra_access = (legacy_account_type != 'member'),
        updated_at = now()
    WHERE id = target_member_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_sync_legacy_on_role_change
    AFTER INSERT OR UPDATE OR DELETE ON member_roles
    FOR EACH ROW
    EXECUTE FUNCTION sync_roles_to_legacy();
```

### 코드 전환 안전 장치

```typescript
// lib/supabase/identity.ts

/**
 * 역할 조회: 새 테이블 우선, 실패 시 구 테이블 fallback
 * Phase C 완료 후 fallback 제거
 */
async function getRoles(memberId: string): Promise<UniverseRole[]> {
    // 1차: member_roles 테이블 (새)
    const { data: newRoles, error } = await supabase
        .from('member_roles')
        .select('*')
        .eq('member_id', memberId)
        .eq('is_active', true);

    if (!error && newRoles && newRoles.length > 0) {
        return newRoles.map(mapToUniverseRole);
    }

    // 2차 fallback: members.roles[] (구) — Phase D에서 제거
    console.warn('[Identity] Falling back to legacy members.roles[]');
    const { data: member } = await supabase
        .from('members')
        .select('account_type, roles, affiliations')
        .eq('id', memberId)
        .single();

    if (member) {
        return legacyToRoles(member);  // 구 형식 → 새 형식 변환
    }

    return [{ role: 'member', context: 'universe', isActive: true }];
}
```

### 검증 체크리스트 (Phase D 실행 전 반드시 통과)

```
DROP 전 체크리스트:
─────────────────
□ grep -r "\.account_type" --include="*.ts" --include="*.tsx" → 0 hits (auth-context 어댑터 제외)
□ grep -r "\.roles\b" --include="*.ts" --include="*.tsx" → 0 hits (새 UniverseRole만 사용)
□ grep -r "\.affiliations" --include="*.ts" --include="*.tsx" → 0 hits
□ grep -r "\.intra_access" --include="*.ts" --include="*.tsx" → 0 hits
□ grep -r "\.module_access" --include="*.ts" --include="*.tsx" → 0 hits
□ member_roles 테이블 행 수 == members에서 역할 있는 행 수 (정합성)
□ 프로덕션 1주일 이상 에러 로그에 "Falling back to legacy" 0건
□ JWT app_metadata에 roles 필드가 있는 유저 비율 = 100%
```

---

## 운영 효율성을 위한 장치

### 1. 자동화 규칙 엔진 (Rule Engine)

> **수작업 줄이기: "이 조건이면 자동으로 이렇게 처리"**

```sql
-- 자동화 규칙 테이블 (관리자가 UI에서 설정)
CREATE TABLE automation_rules (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id    TEXT NOT NULL,
    name        VARCHAR(200) NOT NULL,
    description TEXT,
    is_active   BOOLEAN DEFAULT true,

    -- 트리거 조건
    trigger_event TEXT NOT NULL,  -- 'role_granted', 'points_reached', 'enrollment_completed',
                                 -- 'subscription_changed', 'profile_updated', 'member_joined'
    conditions  JSONB NOT NULL,  -- { "field": "total_points", "operator": ">=", "value": 1000 }

    -- 실행 액션
    actions     JSONB NOT NULL,  -- [
                                 --   { "type": "grant_role", "role": "certified", "context": "badak" },
                                 --   { "type": "send_notification", "template": "badge_upgrade" },
                                 --   { "type": "update_profile", "field": "badge", "value": "silver" }
                                 -- ]

    created_by  UUID REFERENCES members(id),
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 실행 예시:
-- "Badak 포인트 1000점 도달 → Silver 배지 자동 부여 + 축하 알림"
-- "Evolution 필수 3과정 수료 → 강사 자격 자동 부여"
-- "SmarComm 14일 체험 만료 3일 전 → 리마인더 이메일"
```

### 2. 대시보드용 집계 뷰 (Materialized Views)

> **매번 JOIN 하지 말고, 미리 계산해 둔 요약 데이터**

```sql
-- 멤버 요약 뷰: 관리자 대시보드에서 한 번에 조회
CREATE MATERIALIZED VIEW member_summary AS
SELECT
    m.id,
    m.name,
    m.email,
    m.status,
    m.created_at,
    m.last_login_at,

    -- Tier 2 집계
    ARRAY_AGG(DISTINCT mr.role || ':' || mr.context)
        FILTER (WHERE mr.is_active) AS active_roles,
    COUNT(DISTINCT mr.context)
        FILTER (WHERE mr.is_active AND mr.context != 'universe') AS brand_count,

    -- Tier 3A 존재 여부 (어느 브랜드에 프로필이 있는가)
    EXISTS(SELECT 1 FROM tenone_staff_profiles WHERE member_id = m.id) AS has_tenone_profile,
    EXISTS(SELECT 1 FROM smarcomm_profiles WHERE member_id = m.id) AS has_smarcomm_profile,
    EXISTS(SELECT 1 FROM badak_profiles WHERE member_id = m.id) AS has_badak_profile,
    EXISTS(SELECT 1 FROM madleague_profiles WHERE member_id = m.id) AS has_madleague_profile,

    -- Tier 3B 활동 요약
    (SELECT COUNT(*) FROM member_points WHERE member_id = m.id) AS total_point_events,
    (SELECT COALESCE(SUM(points), 0) FROM member_points WHERE member_id = m.id) AS universe_total_points

FROM members m
LEFT JOIN member_roles mr ON mr.member_id = m.id
GROUP BY m.id;

-- 매일 새벽 갱신 (pg_cron)
-- SELECT cron.schedule('refresh-member-summary', '0 4 * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY member_summary');
-- 인덱스 (CONCURRENTLY 갱신을 위해 UNIQUE INDEX 필수)
CREATE UNIQUE INDEX idx_member_summary_id ON member_summary(id);
```

### 3. 벌크 작업 지원 (Bulk Operations)

> **"MADLeague 3기 동아리원 50명 일괄 등록", "SmarComm Free 유저 1000명에게 체험판 부여"**

```sql
-- 벌크 작업 이력
CREATE TABLE bulk_operations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id    TEXT NOT NULL,
    operation   TEXT NOT NULL,       -- 'grant_roles', 'create_profiles', 'send_notifications'
    target_count INTEGER NOT NULL,
    success_count INTEGER DEFAULT 0,
    fail_count  INTEGER DEFAULT 0,
    status      TEXT DEFAULT 'pending',  -- pending, running, completed, failed
    parameters  JSONB NOT NULL,      -- 작업 파라미터
    result      JSONB,               -- 결과 요약
    created_by  UUID REFERENCES members(id),
    created_at  TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);

-- Edge Function으로 비동기 처리
-- "50명에게 madleague:member 역할 일괄 부여"
-- → bulk_operations INSERT → Edge Function 트리거 → 건건이 member_roles INSERT
```

### 4. 알림 템플릿 (Notification Templates)

> **역할 변경, 등급 승급, 만료 임박 시 자동 알림**

```sql
CREATE TABLE notification_templates (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id    TEXT NOT NULL,
    trigger_event TEXT NOT NULL,      -- 'role_granted', 'badge_upgraded', 'trial_expiring'
    channel     TEXT NOT NULL,        -- 'email', 'push', 'kakao', 'in_app'
    subject     TEXT,
    body_template TEXT NOT NULL,      -- "{{name}}님, {{brand}}에서 {{role}} 등급으로 승격되었습니다!"
    is_active   BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- 변수 치환: {{name}}, {{email}}, {{brand}}, {{role}}, {{previous_role}}, {{points}}
```

### 5. 데이터 정합성 체크 (Integrity Jobs)

> **"Tier 2에 역할이 있는데 Tier 3 프로필이 없는 경우" 같은 불일치 감지**

```sql
-- 정합성 체크 함수 (주간 실행)
CREATE OR REPLACE FUNCTION check_data_integrity()
RETURNS TABLE(issue_type TEXT, member_id UUID, details TEXT) AS $$
BEGIN
    -- 1. member_roles에 badak:certified가 있는데 badak_profiles가 없는 경우
    RETURN QUERY
    SELECT 'missing_profile'::TEXT, mr.member_id, 'has badak:certified role but no badak_profile'::TEXT
    FROM member_roles mr
    WHERE mr.context = 'badak' AND mr.role = 'certified' AND mr.is_active = true
    AND NOT EXISTS (SELECT 1 FROM badak_profiles bp WHERE bp.member_id = mr.member_id);

    -- 2. 프로필은 있는데 역할이 없는 경우
    RETURN QUERY
    SELECT 'orphan_profile'::TEXT, bp.member_id, 'has smarcomm_profile but no smarcomm role'::TEXT
    FROM smarcomm_profiles bp
    WHERE NOT EXISTS (
        SELECT 1 FROM member_roles mr
        WHERE mr.member_id = bp.member_id AND mr.context = 'smarcomm' AND mr.is_active = true
    );

    -- 3. 만료된 역할이 여전히 active인 경우
    RETURN QUERY
    SELECT 'expired_not_deactivated'::TEXT, mr.member_id,
           format('role %s:%s expired at %s', mr.context, mr.role, mr.expires_at)::TEXT
    FROM member_roles mr
    WHERE mr.expires_at < now() AND mr.is_active = true;
END;
$$ LANGUAGE plpgsql;
```

### 6. API Rate Limiting & Abuse Prevention

> **"한 사람이 100개 브랜드에 가입하는 것" 방지**

```
제한 규칙:
- 한 멤버의 최대 활성 역할 수: 50개
- 한 멤버의 최대 조직 가입 수: 10개
- 포인트 적립: 일일 최대 500포인트/브랜드
- 프로필 수정: 분당 최대 5회
```

---

## 구현 체크리스트 (마이그레이션 순서)

> **절대 원칙:**
> - ❌ 기존 members 컬럼을 DROP 하지 않는다 (Phase D 검증 통과 전까지)
> - ❌ 기존 코드가 읽는 필드를 없애지 않는다
> - ✅ 새 테이블은 "추가"만 한다 (비파괴)
> - ✅ 이중 쓰기 트리거로 신/구 데이터 동기화

### Phase 1: 새 테이블 생성 (추가만, 기존 안 건드림)

**핵심 테이블:**
- [ ] `member_roles` 테이블 생성 (Tier 2)
- [ ] `member_role_history` 테이블 생성
- [ ] `member_preferences` 테이블 생성 (Tier 3C)
- [ ] `member_points` 테이블 + `member_points_summary` 뷰 생성
- [ ] `member_brand_joins` 테이블 생성
- [ ] `audit_log` 테이블 생성

**JWT 인프라:**
- [ ] `sync_roles_to_jwt()` 함수 생성
- [ ] `trg_sync_jwt_on_role_change` 트리거 생성
- [ ] `auth_member_id()`, `auth_is_staff()`, `auth_has_brand()` 헬퍼 함수 생성

**레거시 동기화 트리거:**
- [ ] `sync_roles_to_legacy()` 함수 생성
- [ ] `trg_sync_legacy_on_role_change` 트리거 생성
- [ ] → member_roles 변경 → members.roles[], account_type 자동 동기화

### Phase 2: 데이터 복사 (INSERT INTO ... SELECT)

> ⚠️ 원본 데이터 절대 수정/삭제 안 함. 복사만.

- [ ] 기존 `members.account_type` → `member_roles` INSERT (context='universe')
- [ ] 기존 `members.roles[]` 각 원소 → `member_roles` INSERT
- [ ] 기존 `members.affiliations[]` 각 원소 → `member_roles` INSERT (context=브랜드ID)
- [ ] 기존 HR 필드 → `tenone_staff_profiles` INSERT
- [ ] 기존 `members.newsletter_subscribed` → `member_preferences` INSERT
- [ ] 복사 후 **정합성 검증**: member_roles 행 수 == members에서 역할 있는 행 수
- [ ] 복사 후 **JWT 갱신**: 전 멤버 app_metadata 일괄 갱신

### Phase 3: 브랜드별 프로필 테이블 (Tier 3A + 3B)

**프로필 (3A):**
- [ ] `tenone_staff_profiles` 생성
- [ ] `smarcomm_profiles` 생성
- [ ] `badak_profiles` 보강 (기존 테이블에 컬럼 추가)
- [ ] `madleague_profiles` 생성
- [ ] `hero_profiles` 생성
- [ ] `evolution_profiles` 생성
- [ ] `myverse_profiles` 유지 (이미 존재)

**활동 기록 (3B):**
- [ ] `evolution_enrollments` 생성
- [ ] `smarcomm_billing_history` 생성
- [ ] `hero_applications` 생성
- [ ] `badak_connections` 생성
- [ ] `madleague_participations` 생성
- [ ] `member_visits` 생성

### Phase 4: RLS 정책 (JWT 클레임 기반)

- [ ] members: `auth_member_id()` 본인 + `auth_is_staff()` staff
- [ ] member_roles: 본인 + staff + `auth_has_brand(context)` 브랜드 admin
- [ ] 각 브랜드 프로필: 본인 + 해당 브랜드 admin + super_admin
- [ ] member_preferences: 본인만 수정
- [ ] audit_log: super_admin만 읽기
- [ ] **기존 members RLS는 유지** (기존 코드 하위 호환)

### Phase 5: 코드 전환 (이중 읽기)

**새 코드 생성:**
- [ ] `types/identity.ts` 새 타입 정의 (CoreIdentity, UniverseRole, SiteProfile 등)
- [ ] `lib/supabase/identity.ts` 유저 조립 함수 (assembleUser)
- [ ] `lib/identity-context.tsx` 새 컨텍스트
- [ ] getRoles() 함수: member_roles 우선 → members.roles[] fallback

**기존 코드 어댑터 연결:**
- [ ] `auth-context.tsx`에 어댑터 추가 (UniverseUser → 기존 User 변환)
- [ ] `intra/layout.tsx` 권한 확인: JWT app_metadata 우선 → DB fallback
- [ ] 각 브랜드 페이지 점진 전환 (새 컨텍스트 사용)

### Phase 6: 조직/B2B + 자동화

**조직:**
- [ ] `organizations` 테이블 생성
- [ ] `org_members` 테이블 생성

**자동화:**
- [ ] `automation_rules` 테이블 생성
- [ ] `notification_templates` 테이블 생성
- [ ] `bulk_operations` 테이블 생성
- [ ] 역할 만료 크론잡 (`expire_roles`)
- [ ] 포인트 자동 배지 트리거
- [ ] 데이터 정합성 체크 주간 크론잡
- [ ] `member_summary` Materialized View + 갱신 크론잡

### Phase 7: 검증 & 모니터링 (최소 1주)

- [ ] 프로덕션 에러 로그 "Falling back to legacy" 모니터링 → 0건 확인
- [ ] JWT app_metadata에 roles 있는 유저 비율 = 100%
- [ ] member_roles ↔ members.roles[] 정합성 = 100%
- [ ] 전 브랜드 로그인/접근 테스트 통과

### Phase 8: 테스트 시나리오

- [ ] "김텐원" (staff): 전 브랜드 접근 + 인트라 ✅ + JWT에 is_staff=true
- [ ] "박바닥" (member + badak:certified): 인트라 차단, 바닥 프라이빗 접근 ✅
- [ ] "이매드" (madleaguer): MADLeague 기능 접근, 인트라 차단
- [ ] 소셜 로그인 신규 가입 → member 역할 자동 부여 → JWT 즉시 갱신
- [ ] SmarComm Pro 체험판 만료 → 자동 다운그레이드 → JWT 갱신 → RLS 반영
- [ ] 브랜드별 탈퇴 → 프로필 삭제, 역할 삭제, 다른 브랜드 무영향
- [ ] 전체 탈퇴 → 30일 유예 → 영구 삭제
- [ ] 벌크 역할 부여 → 50명 일괄 처리 → JWT 일괄 갱신
- [ ] 관리자 권한 위임 → 브랜드 admin이 자기 영역만 CRUD 가능
- [ ] RLS 침투 테스트: badak admin이 smarcomm_profiles 접근 시도 → 차단 ✅

### Phase D: 레거시 정리 (전체 검증 완료 후에만!)

> **⚠️ 아래 검증이 모두 통과한 후에만 실행:**
> ```
> □ grep -r "\.account_type" → auth-context 어댑터 외 0건
> □ grep -r "\.roles\b" → 새 UniverseRole 참조만
> □ grep -r "\.affiliations" → 0건
> □ grep -r "\.intra_access" → 0건
> □ grep -r "\.module_access" → 0건
> □ 프로덕션 1주일 이상 무사고
> □ "Falling back to legacy" 로그 0건
> □ JWT roles 적용률 100%
> ```

- [ ] `members` 테이블에서 레거시 컬럼 DROP:
  - `account_type`, `roles`, `affiliations`, `intra_access`
  - `module_access`, `system_access`, `brand_access`, `brand_roles`
  - `department`, `position`, `employee_id`, `hire_date`, `employment_type`
  - `total_points`, `grade`, `skills`, `group`
- [ ] 레거시 동기화 트리거 제거 (`trg_sync_legacy_on_role_change`)
- [ ] auth-context 어댑터 fallback 제거
- [ ] getRoles() fallback 제거

---

## Tier 4: 테넌트 격리 + WIO 서비스 계층 (2026-04-03 추가)

> 기존 Tier 1~3은 **"누구인가"** (Identity).
> Tier 4는 **"어떤 서비스를 쓰는가"** (Service Isolation).

### 개념

```
Tier 1: 여권 (members — Core Identity)
Tier 2: 뱃지 (member_roles — Universe Roles)
Tier 3: 행성별 옷 (brand_profiles — Site-Specific)
Tier 4: 서비스 격리 (tenant_id — Data Isolation)
```

### tenant_id vs brand_id

```
tenant_id = 계약 단위 (TenOne, XXXX Corp, VVVV Inc...)
brand_id  = 유니버스 내부 브랜드 구분 (LUKI, Badak, MADLeague...)
```

- 유니버스 내부 브랜드: `tenant_id = 'tenone'` + `brand_id`로 구분
- 외부 고객: 각자 `tenant_id` 보유 (WIO 구독 or 맞춤 서비스 계약)
- Universe 분석 레이어 (Mindle/Whole See): 전체 tenant 크로스 분석 (PII 제거)

### WIO 서비스 2-Tier와의 관계

| 서비스 | tenant_id | 격리 방식 |
|--------|-----------|----------|
| 규격 서비스 (구독) | 자동 생성 | wio_subscription_plans + feature flags |
| 맞춤 서비스 (용역) | 수동 생성 | wio_tenant_configs + custom config |
| TenOne 자사 | 'tenone' (고정) | 모든 기능 접근 (super_admin) |

### wio_members와의 연결

```
auth.users → profiles (Tier 1 — 인증)
    ↓
member_brand_joins (Tier 2 — Universe SSO)
    ↓
wio_members (Tier 3/4 — WIO 서비스 사용자)
    ├── tenant_id: 어느 테넌트 소속인가
    ├── user_id: auth.users(id)
    └── role: 해당 테넌트에서의 권한
```

### Phase 0 완료 사항 (2026-04-03)

- [x] 80개 테이블에 `tenant_id TEXT DEFAULT 'tenone'` 추가
- [x] 기존 NULL 행 → 'tenone' 일괄 업데이트
- [x] 핵심 11개 테이블에 tenant_id 인덱스 추가
- [x] 시스템 테이블 5개 의도적 제외 (brands, site_configs, sso_tokens, wio_subscription_plans, wio_tenants)
