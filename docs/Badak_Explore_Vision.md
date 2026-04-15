# Badak 니즈 탐색 고도화 기획서 (v2)

> **핵심 철학 — 니즈와 니즈가 만나 원츠(Wants)가 된다.**
>
> 작성: 2026-04-15 (세션 48) / 개정: 2026-04-15 v2 (텐원 방향성 반영)
> 상태: Draft — Phase 1 착수 범위 확정 중

---

## 0. 핵심 철학: Needs → Wants

```
         Need (나)              Need (상대)
     "AI 배우고 싶어"         "AI 가르쳐 줄 사람"
             │                      │
             └──────────┬───────────┘
                        ▼
                   Want (우리)
            "AI 스터디 같이 하자"
                        │
                        ▼
                   Action
                (모임 / 파트너 /
                 프로젝트 / 대화)
```

**정의:**
- **Need** = 한 사람의 부족·욕구·지향 (unidirectional)
- **Want** = 두 사람 이상의 니즈가 만나 생긴 공동의 지향 (bidirectional)
- **Action** = Want을 실행으로 옮기는 모든 것 (모임, 파트너십, DM, 프로젝트)

**설계 원칙:**
1. 니즈는 혼자서도 등록된다. 혼자 있어도 의미 있다.
2. 니즈가 다른 니즈와 만나는 순간이 바닥의 **진짜 가치 창출 지점**.
3. UI는 "당신의 니즈가 지금 누구와 만날 수 있는가"를 1초에 보여줘야 한다.
4. Want 하나가 생기면 바닥은 그 Want를 기억하고 확장 기회를 제시한다.

---

## 1. 현재 상태 (Baseline)

| 요소 | 현재 구현 |
|------|----------|
| `/badak/explore` | 니즈 클라우드의 필터/검색 뷰 |
| 매칭 기준 | 없음 — 키워드 나열 |
| 주체 | 니즈 (=키워드) 중심, 사람은 뒤에 숨어 있음 |
| 액션 | 니즈 클릭 → 모임 있으면 합류 |

**한계:** 니즈는 보이는데, 그 니즈를 가진 **사람**은 보이지 않는다. Want이 발생할 기회가 차단됨.

---

## 2. 고도화 방향 (v2 — 개인 간 연결 심화 우선)

> **1단계: 개인 간 Needs→Wants를 완성한다.**
> **2단계: 기업 계정·채용 유료화는 1단계 트랙션 확인 후 논의.**

### 2.1 우선 구현할 3모드 (개인 중심)

| 모드 | Need ↔ Need 예시 | Want 결과 |
|------|------------------|----------|
| **NEEDS 매칭** | "AI 배우고 싶어" ↔ "AI 배우고 싶어" | "AI 스터디 같이 하자" → 모임 개설 |
| **상호 보완** | "카피 배우고 싶어" ↔ "개발 배우고 싶어, 카피는 자신 있음" | "스킬 교환" → 1:1 파트너 |
| **업계 네트워킹** | 같은 산업/직무 피어 | "커피챗" → DM 또는 오프라인 |

### 2.2 나중에 붙일 것 (Phase 후반)

- **기업·채용 계정** — 개인 트래픽 충분히 쌓이고 나면 B2B 매칭으로 확장
- **유료 기능** — 매칭 품질·우선 노출 등 (개인 UGC가 쌓인 후에야 의미 있음)

---

## 3. 핵심 원칙

1. **사람이 일차 단위.** 니즈는 사람의 속성.
2. **양방향 매칭.** Need ↔ Need, Need ↔ Offer.
3. **Want 보존.** 만남이 성사되면 "공동 want"로 기록 → 추후 확장 (같은 멤버끼리 새 모임, 새 주제로 다시 만남).
4. **사생활 존중.** `profile_public=false` 시 매칭 대상에서 제외.
5. **클릭 최소화.** 3번 이내에 "대화 시작" 또는 "모임 참여".
6. **WIO 공통 모듈로.** 매칭 엔진은 `wio_people.matching`으로.

---

## 4. 매칭 시그널 (Matching Signals)

### 4.1 공통 프로필 신호 (이미 수집 중)
- 산업 (`industry`)
- 직무 (`job_function`)
- 연차 (`experience_years`)
- 관심 태그 (`interest_tags`)
- 원하는 것 (`looking_for`) ← ✅ 존재
- 줄 수 있는 것 (`can_offer`) ← ✅ 존재
- 커리어 이력 (`career` JSONB) ← ✅ 존재
- 유니버스 활동 (`affiliations`) ← ✅ 존재

### 4.2 니즈 관련 신호 (신규)
- 사용자가 **공감/관심 표현한 니즈** (Fire, Heart)
- 사용자가 **직접 제출한 니즈** (pending_review → gathering)
- 사용자가 참여한 **모임 이력**
- **스토리·커뮤니티 글** 키워드 (Phase 3에서 NLP)

### 4.3 모드별 가중치 (초안)

| 신호 | NEEDS 매칭 | 상호 보완 | 네트워킹 |
|------|:----:|:----:|:----:|
| 같은 니즈에 공감/관심 표시 | **×3** | ×1 | ×1 |
| 같은 니즈 제출 이력 | **×3** | ×1 | ×0 |
| 상호 need ↔ offer | ×1 | **×3** | ×1 |
| 같은 산업 | ×1 | ×1 | **×3** |
| 같은 직무 | ×1 | ×1 | **×2** |
| 유니버스 공통 활동 | ×1 | ×2 | ×2 |
| 같은 모임 참여 이력 | ×2 | ×2 | ×2 |

매칭 점수 = Σ(signal × weight). 임계값 이상만 노출 + 매칭 근거 표기.

---

## 5. UX 설계

### 5.1 `/badak/explore` 개편 구조 (v2)

```
┌─────────────────────────────────────┐
│ [탭] 니즈 | 사람 | 원츠               │  ← 원츠(Wants) 탭이 핵심
├─────────────────────────────────────┤
│ ✨ 지금 바로 만날 수 있어요 (Top 3)   │
│ ┌─[Wants 카드]────────┐             │
│ │ 나: "AI 배우고 싶어"  │             │
│ │ ×                     │             │
│ │ 김○○: "AI 배우고 싶어"│             │
│ │ ⇓                     │             │
│ │ 💡 AI 스터디 같이?    │             │
│ │ [모임 만들기] [대화]  │             │
│ └──────────────────────┘             │
├─────────────────────────────────────┤
│ 내 니즈와 매칭된 사람 (Top N)         │
├─────────────────────────────────────┤
│ 니즈 클라우드 (기존 — 유지)           │
└─────────────────────────────────────┘
```

### 5.2 탭별 UI

**탭 1 — 니즈**: 현재 클라우드 유지. 클릭 시 "이 니즈를 가진 사람들" 보여주기.
**탭 2 — 사람**: 매칭 스코어 Top N. 필터로 산업/직무/연차.
**탭 3 — 원츠 (Wants)**: 내 니즈 + 상대 니즈가 만나서 나올 수 있는 **공동 프로젝트/모임 제안** 카드. ← v2 핵심 추가.

### 5.3 액션 버튼

| 행동 | 경로 |
|------|------|
| 프로필 상세 | `MemberProfileSheet` (기존) |
| 1:1 대화 시작 | Phase 3 — WIO Talk 모듈 구축 후 |
| 같은 Want으로 모임 열기 | `/badak/groups/create?want=xxx&peer=yyy` pre-fill |
| 관심 보내기 (Connection) | `badak_connections` 신설 |
| "이 Want 북마크" | 나중에 다시 보기 위해 저장 |

---

## 6. DB 스키마

### 6.1 신규/확장 테이블

#### `badak_connections` (사람↔사람 연결)

```sql
CREATE TABLE IF NOT EXISTS badak_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES auth.users(id),
  to_user_id   UUID NOT NULL REFERENCES auth.users(id),
  type TEXT NOT NULL CHECK (type IN ('interest','partner','network')),
  -- ↑ hiring 제외 (기업 계정 단계에서 추가)
  want_id UUID REFERENCES badak_wants(id),  -- 어떤 Want로부터 만들어진 연결인지
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','accepted','declined','blocked')),
  created_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ,
  UNIQUE (from_user_id, to_user_id, type)
);
```

#### `badak_wants` (신규 — v2 핵심)

```sql
-- 니즈가 만나서 생긴 "공동 지향"을 기록
CREATE TABLE IF NOT EXISTS badak_wants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- 이 Want를 구성하는 니즈들
  need_ids UUID[] NOT NULL,
  -- 이 Want를 구성하는 사람들
  member_ids UUID[] NOT NULL,
  -- AI/시스템이 제안한 공동 목표
  suggested_title TEXT,
  -- 이 Want이 어떤 모드인지
  mode TEXT NOT NULL CHECK (mode IN ('needs_match','mutual','network')),
  -- 매칭 점수 (상위 N개 Want만 노출)
  score INT NOT NULL,
  -- 실제로 실행된 흔적
  group_id UUID REFERENCES badak_groups(id),     -- 모임으로 발전했나
  connection_id UUID REFERENCES badak_connections(id),  -- 1:1 연결로 발전했나
  status TEXT DEFAULT 'candidate'
    CHECK (status IN ('candidate','activated','dismissed','expired')),
  created_at TIMESTAMPTZ DEFAULT now(),
  activated_at TIMESTAMPTZ
);

CREATE INDEX ON badak_wants USING GIN (member_ids);
CREATE INDEX ON badak_wants (status, score DESC);
```

#### `badak_members` 확장

```sql
ALTER TABLE badak_members
  ADD COLUMN IF NOT EXISTS open_to_needs    BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS open_to_partner  BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS open_to_network  BOOLEAN DEFAULT TRUE;
-- open_to_hiring은 기업 계정 단계에서 추가
```

### 6.2 매칭 캐시 (성능)

```sql
CREATE TABLE IF NOT EXISTS badak_match_scores (
  user_id UUID NOT NULL REFERENCES auth.users(id),
  peer_id UUID NOT NULL REFERENCES auth.users(id),
  mode TEXT NOT NULL,
  score INT NOT NULL,
  reasons JSONB,      -- 매칭 근거 (UI 표시용 — 투명성)
  computed_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, peer_id, mode)
);
-- 주기적 재계산 (Edge Function + pg_cron)
```

---

## 7. API 설계

```
GET  /api/badak/explore/people?mode=needs|mutual|network&limit=20
     → 매칭 점수 상위 N명 + 매칭 근거

GET  /api/badak/explore/wants?limit=10
     → 내 니즈 × 상대 니즈로 만들어진 "Wants 카드" Top N
     → 각 카드: {needIds, members, suggestedTitle, score, actions}

GET  /api/badak/explore/need/:id/people
     → 특정 니즈를 가진 사람들

POST /api/badak/connections
     body: { toUserId, type, wantId?, message }
     → 관심/파트너 제안 전송 (Want에서 발생한 거면 wantId 포함)

PATCH /api/badak/connections/:id
      body: { status: 'accepted'|'declined' }

POST /api/badak/wants/:id/activate
     body: { action: 'create_group' | 'start_dm' }
     → Want을 모임 또는 연결로 변환 (활성화)
```

---

## 8. 단계별 실행 (Phase Plan v2)

### Phase 1 — 매칭 기반 (1~2주)
**목표:** 매칭 시그널 수집 + 최소 매칭 API (1모드)
- [ ] `/badak/my` 프로필에 `open_to_needs / open_to_partner / open_to_network` 체크박스
- [ ] `badak_connections` 테이블 생성/확정
- [ ] `/api/badak/explore/people?mode=needs` 구현
- [ ] `MatchCard` 컴포넌트 (사람 카드 + 매칭 근거 표기)
- [ ] `/badak/explore` — "니즈 / 사람" 2-탭 구조

### Phase 2 — Wants 도입 (1~2주) ← v2 핵심
**목표:** 니즈×니즈 → Wants 카드 자동 생성
- [ ] `badak_wants` 테이블 신설
- [ ] Wants 생성 로직 (batch: 매일 새벽 or on-demand)
  - 내 니즈에 같은 니즈를 가진 사용자들 → Wants 카드
  - 내 `looking_for` ↔ 상대 `can_offer` → 상호 Wants 카드
- [ ] `/api/badak/explore/wants` — Top N Wants 반환
- [ ] `/badak/explore` — "원츠(Wants)" 탭 추가
- [ ] Want 활성화 흐름 — [모임 만들기 pre-fill] [대화 신청]

### Phase 3 — 연결 액션 (1주)
- [ ] `/api/badak/connections` POST/PATCH
- [ ] 받은 제안 알림 (`badak_notifications`)
- [ ] 내 페이지 "받은 제안" / "보낸 제안" 섹션
- [ ] Want → 모임 개설 시 자동으로 want_id 연결 (추적)

### Phase 4 — 품질 루프 (1~2주)
- [ ] 매칭 점수 캐시 (`badak_match_scores` + 주기 배치)
- [ ] 매칭 Good/Bad 피드백 버튼 → 가중치 재조정
- [ ] Wants 카드 클릭 → 모임 전환율 추적
- [ ] 비활성 사용자 필터링 (프로필 거의 빈 사용자 제외)

### Phase 5 — AI 보강
- [ ] 프로필 Bio + 커리어 임베딩 (Claude Haiku)
- [ ] 니즈 간 의미 유사도 매칭 (벡터 검색)
- [ ] Wants 카드의 `suggested_title`을 AI가 자연어로 생성
  - 예: need "AI 배우기" + need "AI 가르치기" → "AI 입문 스터디 같이 하기"

### Phase 6 — (삭제됨: 처음부터 WIO 모듈로)
**v2 결정: `lib/wio/people/matching`을 Phase 1부터 바로 만듦.**
Badak의 `/api/badak/explore/*`는 얇은 어댑터로만 존재하고, 실제 로직은 WIO 모듈에 있음.
HeRo·MADLeague는 이 모듈을 바로 import해서 쓰면 됨 (추가 추출 작업 불필요).

### Phase 7 — 기업 계정 / 유료화 (v2 보류)
**개인 Needs×Wants 트랙션 충분히 쌓인 후에만 착수.**
- 기업 계정 (`tenant_id`): 회사가 회원으로 등록
- `open_to_hiring` 플래그
- 채용·제휴 프리미엄 기능 (매칭 우선 노출 등)
- 가격 — 별도 기획

---

## 9. 측정 지표 (Metrics)

| 지표 | Phase 1 목표 | Phase 2 목표 | Phase 4 목표 |
|------|:----:|:----:|:----:|
| 매칭 카드 CTR | 20% | 30% | 40% |
| **Wants 카드 활성화율** | — | 15% | 30% |
| Wants → 모임 전환 | — | 5% | 15% |
| Wants → 대화 전환 | — | 10% | 25% |
| 관심 수락률 | — | 20% | 35% |
| 일간 매칭 생성 수 | 회원 × 3 | 회원 × 5 | 회원 × 10 |
| 프로필 완성률 | 50% | 60% | 70% |

---

## 10. 리스크 & 방안

| 이슈 | 방안 |
|------|------|
| **스팸/민폐 연락** | 일 5회 제한 + block 기능 + 3회 이상 차단당한 계정은 매칭에서 강등 |
| **매칭 투명성** | 매칭 근거를 카드에 항상 표기 ("같은 니즈 2개 · 같은 업계") |
| **프라이버시** | `profile_public=false`는 무조건 제외 + `open_to_*` 필터 |
| **Wants 자동 생성 피로** | 사용자별 Wants 카드 일간 상한 (최대 5~10개) |
| **냉각 기간** | 프로필 빈 사용자는 매칭에서 제외 (프로필 강화 유도) |
| **매칭 편향** | 특정 인기 사용자에 매칭 쏠리지 않게 일일 연결 제안 수 제한 |

---

## 11. 결정 필요 사항 (텐원 확인 — v2 업데이트)

**v1에서 확정된 것:**
- ✅ 기업 계정·채용 유료화는 **Phase 7로 미룸** (개인 단계 먼저)
- ✅ "니즈×니즈=원츠" 철학을 **중심축**으로 (§0, 신규 `badak_wants` 테이블)

**결정 완료 (2026-04-15):**
- ✅ **메시징**: **내부 Talk(WIO Talk 모듈)** — Phase 3에서 선구축. 외부 연락처 공유 안 함.
- ✅ **Wants 생성 주기**: **실시간 (on-demand)** — 배치 안 씀. 사용자가 탐색 탭 열면 즉시 계산.
- ✅ **WIO 일반화 시점**: **처음부터 WIO 모듈로 구축** — Phase 6 별도 추출 없음. Badak이 `wio_people.matching`의 첫 소비자.
- ✅ **Mock→실DB**: **지금 바로** — Phase 1 착수 직전에 전환 완료.

---

## 12. 관련 자산 (재활용)

**이미 있는 것:**
- `MemberProfileSheet` — 프로필 시트 (Badak)
- `PublicProfile` (WIO) — 공개 프로필 컴포넌트
- `BottomSheet` (WIO) — 바텀 시트 쉘
- `useOptimisticReaction` (WIO) — Wants 활성화 액션에 재사용
- `badak_members.looking_for / can_offer` — 매칭 핵심 신호 ✅
- `badak_members.career` — 커리어 이력 ✅
- `badak_members.affiliations` — 유니버스 활동 ✅
- `badak_members.profile_public` — 프라이버시 플래그 ✅
- `badak_members.open_to_*` — v2에서 추가 예정
- `badak_needs` — 니즈 테이블 (100개 데이터 존재)
- `badak_need_interests` — 관심 표시 (Fire/Heart)

**새로 만들 것 (최소):**
- `badak_wants` (Phase 2)
- `badak_connections` (Phase 1~3)
- `badak_match_scores` 캐시 (Phase 4)

**WIO로 추출할 것 (Phase 6):**
- 매칭 엔진
- Connections 관리
- Wants 생성 로직

---

## 13. 다음 액션

사용자 확정 대기:
1. Phase 1 착수해도 되나? (`open_to_*` 체크박스 + 1모드 매칭)
2. §11의 결정 필요 4건에 대한 답

착수 시 첫 커밋 순서:
1. DB 마이그레이션 — `badak_members.open_to_*` + `badak_connections`
2. `/api/badak/explore/people?mode=needs` API
3. `/badak/explore` 탭 구조 + MatchCard
4. `/badak/my` 체크박스 3개

---

**핵심 메시지 (요약):**
> Badak은 니즈가 모이는 게시판이 아니다. **니즈가 만나서 원츠가 되는 곳**이다. Wants가 생기면 모임도, 파트너십도, 대화도 따라온다. 기업과 돈 이야기는 원츠가 충분히 흐르기 시작한 다음이다.
