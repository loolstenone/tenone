# SmarComm Phase 3 — 발송·자동화 백엔드 설계서

> 작성 2026-05-21 · 워크트리 `vibrant-sammet-3259e9` 세션
>
> Phase 1·2가 정리한 SSOT 위에 **실제 발송과 자동화**를 얹는다. 이 문서는 코드 작성 전 의사결정을 굳히기 위한 설계 SSOT.

---

## 0. 현재 상태 (Phase 2까지)

| 영역 | 현재 |
|---|---|
| `smarcomm_broadcasts` 테이블 | 존재 — 행 생성·수정·삭제 가능 |
| `/api/smarcomm/broadcasts` | CRUD만. **발송 트리거 없음**. `sent_count`·`delivered_count`는 외부가 PATCH로 업데이트해야 작동 |
| `workflow_automations` 테이블 | 존재 — 규칙 정의만. 트리거 엔진 없음 |
| `workflow_tasks` 테이블 | DB 연동 완료 |
| crm/kakao·crm/push 페이지 | `BroadcastPage` 통합 UI. 저장은 되지만 발송 불가 |
| `members.affiliations[]` | 타겟 audience 정의 미사용 |

---

## 1. 카카오 비즈메시지 — 3 채널, 3 결정

### 1-A. 알림톡 (kakao_alimtalk)
- **법적 분류**: 정보성 — 광고 메시지 송신 동의 불필요
- **인프라**: 카카오 비즈니스 채널 + **사전 승인된 템플릿 코드** 필수
- **공급사 옵션**:
  - 옵션 ①: 카카오 직연동 (DAUM 검토자 응대 필요, 진입 어려움)
  - 옵션 ②: 알리고/엑스리오/뿌리오/NHN Toast 등 **재판매 사업자** (실무 표준)
  - 옵션 ③: 솔라피(Solapi) — API 친화적, 토큰 기반 ✅ 추천

**🔵 결정 1.1**: 공급사 선택 — Solapi / 알리고 / 카카오 직연동 / 보류
**🔵 결정 1.2**: 템플릿 — 미리 정의해서 등록? (예: 주문확인·결제완료·배송조회·예약확인 4종 시작)

### 1-B. 친구톡 (kakao_friendtalk)
- **법적 분류**: 광고 — 사전 수신 동의(채널 친구 추가) 필수
- **인프라**: 카카오 비즈니스 채널 + 친구 등록 회원만 발송
- **공급사**: 알림톡과 동일 라인업

**🔵 결정 1.3**: 친구톡 1차 범위에 포함? (알림톡만 우선, 친구톡은 Phase 3.2로 분리 권장)

### 1-C. 비즈메시지 (kakao_bizmsg) — 신규
- 카카오 비즈메시지 통합 (2024 출시) — 알림톡+친구톡+RCS를 묶음. 안정화 전, **Phase 3.3으로 지연 권장**

---

## 2. 푸시 — 웹·모바일 2 갈래

### 2-A. 웹 푸시 (push)
- 인프라: **VAPID 키 + Service Worker + Push Subscription endpoint**
- SmarComm은 웹앱 — 모바일 앱 없으면 **웹 푸시가 현실적**
- DB: 새 테이블 `smarcomm_push_subscriptions` (`user_id, endpoint, p256dh, auth, created_at`)
- 비용: 0 (브라우저 표준 + Web Push 프로토콜 직접)

### 2-B. FCM 모바일 푸시 (app_push)
- 인프라: Firebase 프로젝트 + 모바일 앱 (현재 미존재)
- **모바일 앱 없으므로 Phase 3.3으로 지연**

**🔵 결정 2.1**: 웹 푸시(VAPID) 즉시 진행? FCM은 모바일 앱 출시 후로 보류 권장

---

## 3. 이메일 — Resend 이미 세팅됨

### 현황
- Resend SMTP 검증 도메인 `tenone.biz` ✓
- `noreply@tenone.biz` 발신 가능 ✓
- 별도 카카오·웹푸시와 달리 **즉시 발송 가능**

**🟢 권장**: Phase 3.1 = 이메일 발송 트리거 먼저 (가장 빠른 가치 실현)
- `/api/smarcomm/broadcasts/[id]/send` POST → Resend API 호출 → `sent_count`/`delivered_count` 업데이트
- 타겟 audience는 `members` 테이블에서 segment 조회 (또는 `crm_segments` 테이블 활용)

---

## 4. 자동화 트리거 엔진

### 4-A. 트리거 유형 (workflow_automations.trigger.type)
- `manual` — 사용자가 즉시 실행 버튼
- `schedule` — cron 표현식 (매일 9시 등)
- `event` — webhook (외부에서 POST, 예: 신규 가입·구매)
- `condition` — 조건 충족 시 (예: 7일 무방문 사용자)

### 4-B. 실행 인프라 옵션

| 옵션 | 장점 | 단점 |
|---|---|---|
| **Supabase pg_cron** | 이미 사용 중 (Whole See·Marvis), 추가 비용 0 | Postgres 함수 안에서 fetch 어색, 외부 호출 제한 |
| **Vercel Cron** | Next.js 친화, code-as-config | Hobby plan 12개/일 한도, 분 단위 정밀도 X |
| **Edge Function + pg_cron 트리거** | Edge Function에서 fetch·복잡 로직, pg_cron이 스케줄러 | 2-tier 복잡도 |
| **외부 큐 (Upstash QStash)** | 분 단위 정밀도, 재시도 내장 | 신규 SaaS 의존 |

**🟢 권장**: **Edge Function + pg_cron** — 이미 인프라 있음
- pg_cron이 1분마다 Edge Function `automation-tick` 호출
- Edge Function이 `workflow_automations` 스캔 → 트리거 조건 충족 시 실행

### 4-C. 실행 액션 (workflow_automations.actions[])
- `send_broadcast` — `smarcomm_broadcasts` 행 생성 + 발송 API 호출
- `send_email` — Resend 직호출
- `add_member_tag` — `members` 메타데이터 갱신
- `trigger_webhook` — 외부 URL POST

---

## 5. 우선순위·마일스톤

> 사용자 결정을 반영해 단계 분리. **각 단계는 독립 배포 가능**.

### Phase 3.1 — 이메일 발송 (1~2 세션)
- [ ] `crm_segments` 테이블 (없으면 신설)
- [ ] `/api/smarcomm/broadcasts/[id]/send` POST 엔드포인트
- [ ] Resend API 호출, audience 조회, count 갱신
- [ ] `BroadcastPage`에 "지금 발송" 버튼 + 진행률 UI
- [ ] `wio_subscriptions` 한도 검증 (Free·Starter는 월 N건 제한)

### Phase 3.2 — 웹 푸시 (1 세션)
- [ ] VAPID 키 생성 + env 등록
- [ ] `smarcomm_push_subscriptions` 테이블 + RLS
- [ ] 구독 UI (서비스 워커 + Subscribe 버튼)
- [ ] `/api/smarcomm/broadcasts/[id]/send` 웹 푸시 분기

### Phase 3.3 — 카카오 알림톡 (1~2 세션, Solapi 결정 시)
- [ ] Solapi 계정·발신 프로필 설정 (사용자 작업)
- [ ] 템플릿 4종 등록 (사용자 작업)
- [ ] `SOLAPI_API_KEY`·`SOLAPI_API_SECRET` env
- [ ] `/api/smarcomm/broadcasts/[id]/send` 알림톡 분기
- [ ] 템플릿 변수 매핑 UI

### Phase 3.4 — 자동화 엔진 (2~3 세션)
- [ ] `automation-tick` Edge Function
- [ ] pg_cron 등록 (`select cron.schedule(...)`)
- [ ] 트리거 조건 평가 로직
- [ ] 액션 실행 (broadcast·email·webhook)
- [ ] 자동화 실행 로그 테이블

### Phase 3.5 — FCM·친구톡·비즈메시지 (모바일 앱/카카오 친구 채널 확보 후)
- 보류

---

## 6. DB 신설 스키마 요약

```sql
-- Phase 3.2
CREATE TABLE smarcomm_push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    tenant_id TEXT DEFAULT 'tenone',
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ
);

-- Phase 3.4
CREATE TABLE smarcomm_automation_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_id UUID REFERENCES workflow_automations(id),
    tenant_id TEXT DEFAULT 'tenone',
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status TEXT, -- 'running' | 'success' | 'failed'
    error_message TEXT,
    actions_executed JSONB
);

-- (선택) Phase 3.1에서 crm_segments가 없으면 신설
CREATE TABLE crm_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT DEFAULT 'tenone',
    name TEXT NOT NULL,
    description TEXT,
    filter JSONB NOT NULL, -- members 쿼리 필터 표현
    member_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 7. 사용자 결정 포인트 요약

| # | 항목 | 옵션 | 권장 |
|---|---|---|---|
| **D1** | 카카오 공급사 | Solapi / 알리고 / 카카오 직 / 보류 | **Solapi** (또는 보류 시 Phase 3.1만 진행) |
| **D2** | 친구톡 1차 포함? | Y / N | **N (Phase 3.5)** |
| **D3** | 비즈메시지(통합형) 포함? | Y / N | **N (Phase 3.5)** |
| **D4** | 웹 푸시 진행? | Y / N | **Y (Phase 3.2)** |
| **D5** | FCM 모바일 푸시? | Y / N | **N (모바일 앱 없음)** |
| **D6** | 자동화 엔진 인프라 | pg_cron+Edge / Vercel Cron / Upstash | **pg_cron + Edge Function** |
| **D7** | 시작 순서 | 이메일 / 푸시 / 카카오 동시? | **이메일 → 푸시 → 카카오** (가치 실현 속도 순) |

---

## 8. 다음 첫 액션 (D1~D7 결정 후)

→ §9의 **구현 옵션 비교**를 먼저 결정해야 함. 결정 후:

1. (옵션 A 선택 시) `lib/email/send-broadcast.ts` 공용 헬퍼 추출 + `/api/smarcomm/email/send` 라우트 신설
2. (옵션 B 선택 시) `/api/smarcomm/email/campaigns` CRUD + UI 풀 구현 (3 세션)
3. (옵션 C 선택 시) `smarcomm_broadcasts` 마이그레이션 계획 + BroadcastPage 재설계 (4 세션)

---

## 9. 구현 옵션 비교 — 새로 발견된 인프라 반영

> **2026-05-21 세션 발견**: 인트라에 이미 작동하는 이메일 발송 인프라가 있다.
> 새로 만드는 게 아니라 **재사용 vs 재구축** 결정이 핵심.

### 9-A. 발견된 기존 자산

`/api/intra/crm/broadcast/send/route.ts` (229줄, 풀 스택):

| 기능 | 구현 |
|---|---|
| 발신자 검증 | `email_senders` 테이블 |
| 대상자 조회 | `crm_segments.rules` + `crm_people.person_ids` 합집합 |
| 제외 필터 | `do_not_email`, `do_not_contact` |
| 예약 발송 | `scheduled_at` 미래면 status='scheduled' 저장만 |
| 테스트 발송 | `testEmails` 지정 시 해당 주소만 |
| 변수 치환 | `applyVariables(template, context)` |
| HTML 렌더링 | `renderCrmHtml()` — 헤더·CTA·푸터 |
| List-Unsubscribe | RFC 8058 헤더 + one-click |
| 배치 발송 | 50개씩 `resend.batch.send()` |
| 로그 | `email_sends` 테이블에 resend_id·status 저장 |
| 상태 업데이트 | `crm_campaigns.status='sent'`, recipient_count |

이건 SmarComm Phase 3.1이 만들려던 거의 모든 것이다.

### 9-B. 모순 발견 — 2개 시스템 분리

| 항목 | smarcomm_broadcasts (BroadcastPage 사용) | crm_campaigns (인트라 발송 사용) |
|---|---|---|
| 타겟 채널 | 카카오·푸시·SMS·email | email 전용 |
| 대상자 | `target_audience: text` (자유 텍스트) | `segment_id` + `person_ids` |
| 본문 | `content: text` (짧음) | `body_html`, `body_text`, `preheader`, button 등 |
| 발송 트리거 | **없음** | 있음 (Resend 배치) |
| 변수 치환 | 없음 | 있음 |
| 로그 | broadcasts row 자체에 counter | `email_sends` 별도 테이블 |
| 사용자 접근 | SmarComm 마케터 | 인트라 직원만 |

→ CLAUDE.md §1.10 위반: "구독 테이블은 wio_subscription_plans 하나만 쓴다"의 정신 (한 도메인 = 한 테이블).

### 9-C. 옵션 A — 공용 헬퍼 추출 + SmarComm 라우트 신설 (Recommended)

```
lib/email/send-broadcast.ts  ← 신설
  ├─ resolveTargets(segmentId, personIds, testEmails)
  ├─ renderEmailBatch(campaign, sender, targets)
  └─ executeBatchSend(emails) → email_sends 로그

app/api/intra/crm/broadcast/send/route.ts  ← 헬퍼 호출로 변경
app/api/smarcomm/email/send/route.ts       ← 신설, 헬퍼 호출
  └─ 권한: SmarComm 사용자 + 본인 캠페인만
```

**SmarComm 마케터 흐름** (옵션 A):
1. SmarComm UI에 새 라우트 `/smarcomm/dashboard/crm/email/campaigns/new` (또는 기존 페이지에 모달)
2. 캠페인 작성 시 `crm_campaigns`에 직접 INSERT (테이블은 멀티-tenant 분리)
3. 발송 시 `/api/smarcomm/email/send` → 공용 헬퍼

**장점**:
- 발송 코드 재구현 0 — 검증된 인프라 재사용
- 단일 발송 진실 (인트라·SmarComm 둘 다 같은 헬퍼)
- email_sends 로그 통합

**단점**:
- `crm_campaigns`가 두 사용처를 지원하도록 권한·테넌트 컬럼 보강 필요
- BroadcastPage의 이메일 채널은 별도 처리 또는 제거

**예상 세션**: 1.5

### 9-D. 옵션 B — SmarComm 안에 캠페인 생성 UI 풀 구현

옵션 A + 인트라 UI 수준의 캠페인 빌더(에디터·미리보기·세그먼트 선택·예약·테스트 발송 등)를 SmarComm crm/email 페이지 안에 새로 만들기.

**장점**: SmarComm 마케터가 인트라 거치지 않음. 자체 완결.
**단점**: UI 작업 큼. 인트라 UI를 부분적으로 재사용해도 ≈3 세션.

### 9-E. 옵션 C — smarcomm_broadcasts 폐기 + crm_campaigns 통합

`smarcomm_broadcasts`를 마이그레이션하고 BroadcastPage(카카오·푸시)도 `crm_campaigns` 또는 새로 만든 `broadcasts_v2` 통합 테이블 위로 옮긴다.

**장점**: 단일 발송 모델. 카카오·푸시·이메일 한 큐로 관리.
**단점**: 마이그레이션 + UI 재설계 + 채널별 분기 처리. ≈4 세션. 이미 작성된 broadcasts row 있다면 데이터 이전 필요.

### 9-F. 권장 — 옵션 A (단계적 통합)

근거:
1. 가장 빠른 가치 실현 (1.5 세션)
2. 검증된 인트라 발송 인프라 재사용 — 회귀 위험 낮음
3. 옵션 C로 가는 길의 1단계로도 자연스러움 (헬퍼 추출 후 옵션 C 진행 시 코드 거의 그대로)
4. 카카오·푸시는 인프라 결정 보류 중이라 BroadcastPage 폐기는 시기상조

### 9-G. 옵션 A 진행 시 첫 5 액션

1. `lib/email/send-broadcast.ts` 신설 — `/api/intra/crm/broadcast/send/route.ts`의 71~228줄을 추출
2. 인트라 라우트가 헬퍼 호출하도록 변경, 회귀 테스트
3. `crm_campaigns`에 `tenant_owner` 또는 `created_by_service` 컬럼 추가 (smarcomm 사용자 격리)
4. `/api/smarcomm/email/send/route.ts` 신설 — SmarComm 권한 검증 + 본인 캠페인 한정 + 헬퍼 호출
5. SmarComm `/dashboard/crm/email/page.tsx`에 "내 캠페인" 섹션 + 캠페인 ID로 발송 버튼 (UI 모달은 Phase 3.1.2로)

---

## 10. 변경 이력

- 2026-05-21 초안 작성
- 2026-05-21 §9 추가 — 인트라 기존 발송 인프라 발견 후 구현 옵션 A/B/C 비교


각 단계 완료 후 다음 단계 진입. 한 세션 단위로 점진 배포.
