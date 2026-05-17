# Ten:One™ AI Agent Team — 실측 State (v2.5)

> **잠금 일자**: 2026-05-17 (세션 141)
> **이전 마스터**: TenOne_AI_Team_v2.4 (2026-04-09 작성, stale)
> **갱신 근거**: Prod DB `ziotlxkdctlhiwkgmmsh` 실측 + Edge Function 로그 + pg_cron 점검

이 문서는 **현실 SSOT**다. `anthropic-skills:tenone-agent` 스킬이 다음에 갱신될 때 이 문서를 반영해야 한다.

---

## 0. v2.4 대비 변경사항 요약

| 항목 | v2.4 (2026-04-09) | v2.5 (2026-05-17 실측) |
|---|---|---|
| agent_profiles | 21개 | **28개** (+7) |
| Edge Functions ACTIVE | 2개 (daily-vrief, trend-crawl) | **11개** (+9, SmarComm Scan 인프라 포함) |
| L3 챗봇 | 7 (Badak 방별) | **9** (Badak 7 + blue·red 추가) |
| L1 infra | 없음 | **2개 추가** (openclaw, gemma — local runtime) |
| mindle_sources | 20 | **49 active / 55 total** |
| collected_data | 290건 | **566건** (이전) → 27일 정지 후 2026-05-17 복구 |
| mindle_trends | 52건 | 572건 → 동일하게 정지 후 복구 |
| pg_cron jobs | (미문서화) | **4개** active (cron schema) |
| crawler_status 테이블 | "rss_parser·web_naver·deutbot active" 명시 | **legacy TrendHunter 시스템**. 현재 trend-crawl Edge Function은 이 테이블을 갱신하지 않음. **혼동 주의** |
| 에이전트 활용도 | (미측정) | L2 운영 9개 중 3개만 가동 (madleague·hero·smarcomm), 6개 미호출 |

---

## 1. 에이전트 전체 목록 (28개, 실측)

### L0 — 기획 (1개)

| name | display_name | model | runtime | 메시지 수 | 비고 |
|------|-------------|-------|---------|----------|------|
| `1001` | 열시일분 | claude-sonnet-4-6 | cloud | 1,171 | meta · 유일한 오케스트레이터 |

### L1 — 조사분석 / 인프라 (7개)

| name | display_name | type | model | runtime | 메시지 | 비고 |
|------|-------------|------|-------|---------|--------|------|
| `mindle` | Mindle | agent | claude-sonnet-4-6 | cloud | **1,097** | 실질 트렌드 처리 메인 |
| `wholsee` | Whole See | agent | claude-sonnet-4-6 | cloud | 0 | 마스터 v2.4의 메인이었으나 실제 미호출. mindle이 대체 |
| `rook` | 루크 | agent | claude-sonnet-4-6 | cloud | 0 | AI 크리에이터, 미호출 |
| `wio` | 위오 | agent | claude-sonnet-4-6 | cloud | 0 | 시스템 솔루션, 미호출 |
| `gravity` | 그래비티 | agent | claude-sonnet-4-6 | cloud | 4 | **v2.5 신설** — Brand Gravity 담당 |
| `deutbot` | 듣봇 | chatbot | claude-haiku-4-5 | cloud | 4 | 외부 카카오 청취, 응답 금지 |
| `openclaw` | OpenClaw | infra | gemma4:e4b | **local** | 0 | **v2.5 신설** — 미가동 (local_endpoint 미점검) |
| `gemma` | Gemma | infra | gemma4:e4b | **local** | 0 | **v2.5 신설** — 로컬 LLM, 미가동 |

### L2 — 운영 에이전트 (9개)

| name | display_name | brand_id | 메시지 | 마지막 활동 | 상태 |
|------|-------------|----------|--------|-----------|------|
| `madleague` | MADLeague (레드) | tenone | 20 | 2026-03-28 | 🟡 흔적만 |
| `hero` | 히어로 | tenone | 2 | 2026-04-04 | 🟡 흔적만 |
| `smarcomm` | 스마커 | tenone | 2 | 2026-04-03 | 🟡 흔적만 |
| `badak` | 바닥 | tenone | **0** | — | ❌ 미가동 |
| `madleap` | MADLeap (블루) | tenone | **0** | — | ❌ 미가동 |
| `fwn` | FWN | fwn | **0** | — | ❌ 미가동 |
| `montz` | 몬츠 | montz | **0** | — | ❌ 미가동 |
| `planner` | 플래너스 | planners | **0** | — | ❌ 미가동 |
| `youinone` | 유인원 | youinone | **0** | — | ❌ 미가동 |

### L2 — 브랜드 챗봇 (1개)

| name | display_name | model | 메시지 |
|------|-------------|-------|--------|
| `badaksoe` | 바당쇠 | claude-haiku-4-5 | 0 |

### L3 — Badak 방별 챗봇 (9개)

| name | display_name | 담당 방 | 메시지 | 마지막 활동 |
|------|-------------|--------|--------|-----------|
| `repper` | 레퍼런스창고봇 | 레퍼런스 창고 | 16 | 2026-04-10 |
| `badangsoe` | 수다방봇 | 수다방 | 6 | 2026-04-09 |
| `dima` | 디마봇 | 디지털마케팅 | 2 | 2026-04-09 |
| `leader` | 리더봇 | 팀장과 리더 | 2 | 2026-04-10 |
| `blue` | 블루 | (v2.5 신설) | 0 | — |
| `red` | 레드 | (v2.5 신설) | 0 | — |
| `cr` | CR봇 | CR하는사람들 | 0 | — |
| `hunter` | 헌터봇 | 이직취업 | 0 | — |
| `jaryo` | 자료봇 | 자료공유 | 0 | — |

> ⚠️ **v2.4 명명 불일치**: 마스터는 L2에 챗봇 7개라고 했으나 실제는 L3에 9개. layer 컬럼이 분리됨.

---

## 2. Edge Functions 11개 (실측, 모두 ACTIVE)

| slug | 용도 | 호출 주기 |
|------|------|----------|
| `daily-vrief` | 10:01 KST 브리핑 생성 | pg_cron `1 1 * * *` UTC |
| `trend-crawl` | 매시간 RSS → Haiku 필터 → Sonnet 카드 | pg_cron `0 * * * *` UTC |
| `trend-to-draft` | mindle_trends → content_drafts 변환 | pg_cron `30 * * * *` UTC |
| `process-deutbot` | 듣봇 외부 메시지 처리 | 이벤트 트리거 |
| `pain-classify` | SmarComm Scan: pain point 분류 | scan 호출 |
| `pain-collect` | SmarComm Scan: pain point 수집 | scan 호출 |
| `question-mapper` | SmarComm Scan: 질문 매핑 (verify_jwt=true) | scan 호출 |
| `ai-prober` | SmarComm Scan: AI 응답 probe | scan 호출 |
| `gap-analyzer` | SmarComm Scan: gap 분석 | scan 호출 |
| `source-tracer` | SmarComm Scan: 출처 추적 | scan 호출 |
| `voice-designer` | SmarComm Scan: voice 설계 | scan 호출 |

---

## 3. pg_cron Jobs (4개, cron schema)

| jobid | schedule | command | jobname |
|-------|----------|---------|---------|
| 1 | `0 * * * *` | POST → trend-crawl | trend-crawl-hourly |
| 2 | `30 * * * *` | POST → trend-to-draft | trend-to-draft-hourly |
| 3 | `1 1 * * *` | POST → daily-vrief | daily-vrief-morning |
| 4 | `1 1 * * *` | POST → tenone.biz/api/agent/briefing (Bearer 토큰) | daily-briefing-1001 |

> **vercel.json crons (15개)** 도 별도로 존재하나 일부는 `/api/cron/daily-gpr`처럼 **404로 응답** (라우트 미구현). 정리 필요.

---

## 4. 알려진 차단요소·미해결 항목 (2026-05-17)

### ✅ 해소 (이 세션에서)

- ~~trend-crawl 27일째 정지~~ → source_type NOT NULL 누락 패치, v8 재배포, 즉시 복구 검증 (max_id 41,538 → 213,014 / 5분 신규 237행 / mindle_trends 3개 생성)

### 🟡 미해소

| # | 항목 | 원인·메모 |
|---|------|----------|
| 1 | L2 운영 에이전트 6개 미호출 | badak·madleap·fwn·montz·planner·youinone — system_prompt는 있으나 호출 트리거 부재 |
| 2 | L3 챗봇 9개 중 5개 메시지 0 | 메신저 ↔ 챗봇 훅 미연결 |
| 3 | OpenClaw·Gemma local runtime 미점검 | local_endpoint 미설정 |
| 4 | wholsee 라인 미가동 | 실제로는 mindle이 처리. agent_name 불일치 정리 필요 |
| 5 | crawler_status 테이블 legacy | 현재 trend-crawl은 이 테이블을 안 씀. TrendHunter 시스템 잔재. 정리 후보 |
| 6 | vercel.json `/api/cron/daily-gpr` 404 | 라우트 미구현. 비활성화 또는 구현 |

---

## 5. 메시지 활동 지표 (실측)

| 지표 | 값 |
|------|----|
| agent_messages 누적 | 1,230건 |
| 최근 7일 | 175건 |
| 최근 30일 | 837건 |
| 일일 평균 | ~28건 |
| 가장 최근 | 2026-05-17 15:15 KST (trend-crawl vrief, 257 collected) |

---

## 6. 향후 우선순위 (Lane B 이후)

| Lane | 작업 | 효과 | 추정 |
|------|------|------|------|
| C | L2 6개 호출 트리거 부여 | 자산 가동률 33%→100% | 2~3 세션 |
| D | Badak 챗봇 9개 메신저 통합 | 챗봇 자산화 | 1~2 세션 |
| F | Agent Hub KPI 패널 | 가동률 가시화 | 1 세션 |
| E | OpenClaw 실통합 (local_endpoint + Gemma) | 비용 절감, Phase 0 회복 | 3~4 세션 |
| 정리 | crawler_status legacy 폐기 + wholsee/mindle 명명 통일 + daily-gpr 라우트 결정 | 혼동 제거 | 0.5 세션 |
