# 변경 이력 (Changelog)

> 집/사무실 어디서든 클로드가 이전 작업 맥락을 파악할 수 있도록 기록합니다.

---

## 2026-05-25 (세션 150) — D.Frame 벤치마킹 + SmarComm Phase 3.5·3.4·3.2 일괄 완료

### 장소·운영

- 시작: 워크트리 nifty-villani-3f0bea (이전 세션부터 운영 중, 단발성)
- 종료: master 단독 commit 4회·push 3회 (Vercel 빌드 3회)
- Base: 세션 149 commit `8f19b526`

### 변경 요약

**① D.Frame (DMC Media) 벤치마킹** — PDF 22p + 사이트 8 URL 분석
- D.SaiO(GEO/AEO 자동 최적화 + 환각 감지)가 SmarComm Scan 직접 경쟁자 식별
- 차별점 4가지 도출: 환각 감지 / 정량 사례 표기 / L0/L1/L2 데이터레이크 / 5종 기여모델
- 보완 관계: theCAP/theDAP/Growth/MMM은 가격대·고객 규모로 분리

**② Phase 3.5 — 랜딩 정량 콘텐츠 (How We Score)** — commit `93016ce2`
- D.Frame 식 정량 표기 감각을 SmarComm 정직성 원칙으로 변형
- 신규 API [/api/smarcomm/benchmark-stats](app/api/smarcomm/benchmark-stats/route.ts) — 누적 통계 ISR 10분
- 신규 컴포넌트 [HowWeScoreSection.tsx](features/smarcomm/HowWeScoreSection.tsx) — 산식·실측·정직성 3카드
- 가짜 사례 0건, 누적 19건 실측 평균 노출 (Index 62 / F84·T57·C48)

**③ Phase 3.4 — 환각 감지 (Hallucination Detection)** 🥇 — commit `37d780e0`
- D.SaiO 핵심 차별점 대응. 기존 `classifySentimentLLM`의 factComparisons 활용 — 신규 LLM 모듈 0
- 신규 테이블 [smarcomm_brand_facts·smarcomm_hallucinations](sql/smarcomm-hallucinations.sql) + RLS
- 신규 모듈 [hallucination-persist.ts](lib/smarcomm/hallucination-persist.ts) — siteTruth→facts, comparison(wrong/partial/missing)→hallucinations
- run-scan 통합: ai_probes insert에 `.select()` 추가 후 persist 호출
- 신규 UI [HallucinationCard.tsx](features/smarcomm/HallucinationCard.tsx) — Report에 정직성 카드 (3단계 분류 + Ground truth 칩 + LLM explanation)
- 백필 검증: hsad.co.kr scan에서 "AI 1974년 vs 사이트 1984년" 사실 오류 자동 검출

**④ Phase 3.2 — Web Push (VAPID + 서비스 워커)** — commit `1f2eb655`
- 이전 세션 미커밋 잔재(push.ts·sw·subscribe·send API·DB) 점검 후 마무리
- VAPID 키 발급: `npx web-push generate-vapid-keys` → `.env.local` (Vercel Env 등록은 사용자 액션)
- 권한 게이트 추가: send API에 staff/manager/super_admin 체크 (member_roles)
- 신규 [PushSubscribeButton.tsx](features/smarcomm/PushSubscribeButton.tsx) — 서비스 워커 등록 + 권한 + subscribe + 4상태 UI
- 신규 [smarcomm/offline/page.tsx](app/(SmarComm)/smarcomm/offline/page.tsx) — 서비스 워커 OFFLINE_URL 대응

**⑤ poppler-windows 설치** — PDF 페이지별 읽기
- choco 비관리자 실패 → GitHub Release 직접 다운로드 → `C:\Users\cheon\poppler\` 사용자 PATH
- Claude Code 재시작 후 Read 도구의 `pages` 파라미터 사용 가능

### 결정사항

- **Phase 4 (Marvis Phase 1) 보류**: OAuth(카페24/Imweb) 연동 없이는 RFM·매출 데이터가 없어 정직성 원칙 위반 위험. 사용자 OAuth 등록 액션 대기.
- **풀스택 셀프서브 패턴 확립**: D.SaiO를 비롯한 모든 SmarComm Scan 차별 기능은 추가 LLM 모듈 없이 기존 `classifySentimentLLM` 출력을 영속화하는 방향이 더 효율.
- **워크트리 ↔ master 양방 카피 흐름**: 단일-master 운영 원칙이지만 harness가 워크트리에 머무르는 동안에는 `.env.local` + 신규 파일을 cp로 sync 필요.

### 이월

- Vercel Env에 VAPID 4개 등록 (사용자)
- 외부 키 발급 (OpenAI/Perplexity/SerpAPI/PageSpeed)
- Marvis Phase 1 본격 (OAuth 등록 선행)
- Marvis Phase 4.5 (정직 활성화) 검토
- EmailCampaignModal 회귀 검증
- MADLeague upload API 검토

---

## 2026-05-23 (세션 149) — SmarComm 캠페인 모달 + 랜딩 hero 복구 + 워크트리 전면 정리 + 단일 master 운영 복귀

### 장소·운영

- 시작: lucid-poincare 워크트리 (이전 세션부터 운영 중)
- 종료: master 단독으로 복귀 (워크트리 6개 → 0개)
- Base: 세션 148 commit `255691f6`

### 변경 요약

**SmarComm — Phase 3.1.2 캠페인 모달 UI 2단계 발전**
- 1단계: [app/(SmarComm)/smarcomm/dashboard/crm/email/page.tsx](app/(SmarComm)/smarcomm/dashboard/crm/email/page.tsx)에 "+ 새 캠페인" 버튼 + 인라인 모달 (7필드, POST `/api/smarcomm/email/campaigns`)
- 2단계: 인라인 → [features/smarcomm/EmailCampaignModal.tsx](features/smarcomm/EmailCampaignModal.tsx) 352라인 분리 컴포넌트 (세그먼트 선택·작성/미리보기 탭·테스트 발송·person_ids 직접 입력)
- 이월 작업 해소: `body_html` 에디터 + 세그먼트 + 테스트 발송 셋 모두 단일 컴포넌트로 통합

**SmarComm — 랜딩 hero 회전 카피·분석 경로 복구**
- [app/(SmarComm)/smarcomm/page.tsx](app/(SmarComm)/smarcomm/page.tsx): Marvis 단독 정적 카피 → 20개 회전 헤드라인 + referrer/UTM 매칭 복원
- 분석 진입 `/smarcomm/marvis/scan` → `/smarcomm/scan?url=...` 풀 SmarComm Index 복귀
- 버튼·플레이스홀더·안내 카피 모두 복원

**WIO — 15페이지 푸터 공통 컴포넌트화**
- [features/wio/WIOFooter.tsx](features/wio/WIOFooter.tsx) (기존) 적용: wio/about·ai-matrix·contact·crm·data·e2e-flows·evaluation·framework·marketing·migration·page·presets·pricing·setup·solutions
- 인라인 푸터 중복 -52라인 / 컴포넌트 호출 +44라인 (-8라인 단순화)

**MADLeague — 세션 142 QA 머지**
- stoic-archimedes 워크트리의 미머지 2 commits 흡수: `rounded` 제거 + `inputCls` 통일
- `app/(MADLeague)/madleague/programs/hero/page.tsx` 신규
- `app/api/madleague/upload/route.ts` 신규

**워크트리 6개 → 0개 일괄 정리**

| 워크트리 | 작업 | 결과 |
|---|---|---|
| vibrant-sammet | 이미 머지된 잔재 | 즉시 제거 |
| stoic-archimedes | MADLeague QA | master 머지 후 제거 |
| lucid-poincare | SmarComm 모달 1단계 + 랜딩 복구 | master 머지 후 제거 |
| nostalgic-bohr | EmailCampaignModal 분리 (2단계) | master 머지 후 제거 |
| charming-nash | WIO 푸터 공통화 | master 머지 후 제거 |

push 총 5회 중 master push 2회 (Vercel 빌드 2회). 묶음 머지로 6회+ 빌드 절약.

**운영 방식 변경 — 워크트리 폐기 + CLAUDE.md 단순화**
- CLAUDE.md § 3.4 멀티 워크트리 SSOT 전체 제거 → "단일 master 운영 원칙"으로 대체
- § 4.1 작업 시작 프로토콜 6단계 → 5단계 (워크트리 결정 단계 제거)
- § 4.2 작업 종료 프로토콜 A/B 분리 (워커/오케스트레이터) 제거 → 단일 흐름
- WORK_STATUS의 "현재 활성 워크트리" 표 폐지 → "운영 방식" 안내 + backup 브랜치 표만 유지

### 결정사항

- 1인 개발자 + 한 시점 한 작업 = master 단독이 가장 단순. 멀티 워크트리는 진짜 평행 필요 시 단발성 사용
- master push만 Vercel 빌드 트리거 → 묶음 머지가 비용 절감
- nostalgic-bohr의 충돌 해결은 "더 발전된 버전 채택" 원칙으로 stash 강제 적용 (lucid 인라인을 EmailCampaignModal로 덮어씀)

### 워크트리에서 발견된 모순·이슈

- master에 lucid와 같은 의도의 미커밋 작업 잔재 — 사용자 결정으로 폐기 후 lucid 머지로 일원화
- 워크트리에 `node_modules` 누락으로 `@anthropic-ai/sdk` 미설치 → 분석 API 500 발생. `npm install` 914 패키지 설치 + `.next` 캐시 클리어 후 정상 (서버 로그 `POST /api/smarcomm/scan 200` 확인)
- `nostalgic-bohr`와 `lucid-poincare`가 같은 파일에 다른 방식으로 평행 작업한 사례 — 분리 컴포넌트 버전이 우수해 후자 채택. **이런 평행 작업은 단일 master 운영으로 원천 차단됨**

### 추가 정리 (세션 149 끝물)

- **랜딩 Marvis 4카드 섹션 삭제** (commit `ce4c99ff`) — hero 아래 "1탭·카페24·매일·Phase 1" 검증 안 된 카드 4종 + wrapper section 제거 (-20라인). hero → 바로 "GEO + SEO 통합 점검"으로 연결. 정직성 원칙(§ 1.10 ZERO) 동일하게 "Phase 1"·"Marvis 베타" 같은 미완료 라벨을 메인 랜딩에서 노출 안 함.
- **운영 교훈 — 워크트리 삭제 시 dev server도 같이 stop 의무**: 워크트리 폴더(`lucid-poincare-0bda68`)는 Remove-Item으로 지웠지만 Node dev 프로세스가 그 경로의 `.next` 빌드를 메모리에 잡고 계속 서빙 → master에 push해도 `localhost:3000/smarcomm`에 옛 코드만 보임. 해결: `preview_stop` 후 master 경로에서 새 세션·새 dev server 시작. **향후 워크트리 제거 절차에 dev server stop 단계 명시 필요** (현재 운영 방식은 master 단독이라 재발 가능성 낮음).

### 이월

세션 148과 동일 + Phase 3.2 웹 푸시 + EmailCampaignModal 회귀 검증.

---

## 2026-05-21 (세션 148) — 전 브랜드 헤더 링크 일관성 일괄 정렬 (signupPath·navItems·hideAbout)

### 워크트리 / 장소

- 워크트리: master 단독
- Base: 세션 147 commit `5f817fd6` (origin/master 0 behind)

### 계기

SmarComm preview 오픈 중 우측 유틸리티 바 5건 깨짐 발견:
- `<Link href="/blog">` → tenone에 없음 (404)
- `<Link href="/pricing">` → 동일
- `<Link href="/#process">` → tenone 홈으로 이탈
- `aboutPath="/about"` → tenone 사이트로 이탈
- `signupPath="/signup"` (UniverseUtilityBar prop) → tenone 회원가입으로 이탈

CLAUDE.md §1.2.1(브랜드 사이트 로그인/가입 복귀 원칙) + §1.9.2(UniverseUtilityBar SSOT) 위반. 텐원 유니버스 원칙 "각 서비스는 독립적, 일부 세계관 특징만 연결" 적용 → 전 브랜드 헤더 일괄 점검 결정.

### Explore agent로 features 28개 헤더 전수 스캔

발견:
1. **signupPath="/signup" UniverseUtilityBar prop** — 18개 브랜드 (badak·brandgravity·changeup·domo·fwn·hero·jakka·madleague·madleap·mindle·montz·mullaesian·myverse·myverse/app·myverse/planner·naturebox·rook·seoul360·townity·wio·youinone)
2. **모바일 메뉴 `<Link href="/signup">`** — 14개 브랜드
3. **navItems 앵커 `/#xxx`** — mullaesian·naturebox·townity (11 링크)
4. **about 페이지 미존재 브랜드** — 8건 (`hideAbout` 권장)
5. **ogamja 도메인 path 오류** — siteId=`ogamja`인데 실제 path는 `/0gamja` (헤더는 `/ogamja/...` 가리킴)

### 23개 파일 60+ Edit

`features/{brand}/{Brand}Header.tsx` 23개:
- badak, brandgravity, changeup, domo, fwn, hero, jakka, madleague, madleap, mindle, montz, mullaesian, myverse, myverse/app, myverse/planner, naturebox, ogamja, rook, seoul360, smarcomm, townity, wio, youinone

수정 패턴:
- 모든 `signupPath="/signup"` → `signupPath="/{brand}/signup"`
- 모든 모바일 `<Link href="/signup">` → `<Link href="/{brand}/signup">`
- `mullaesian`·`naturebox`·`townity`의 navItems 앵커 `/#xxx` → `/{brand}#xxx`
- about 페이지 없는 8 브랜드 UniverseUtilityBar에 `hideAbout` prop 추가
- ogamja의 5건 (`aboutPath`, `profilePath`, `signupPath`, 모바일 my, 모바일 signup) `/ogamja/...` → `/0gamja/...` 정렬

### 검증

- SmarComm preview HMR 후 우측 바 회귀 0
- 컴파일 에러 0, 콘솔 에러 0
- 우측 헤더 7요소 표준 부합 (서비스·블로그·요금제·로그인·가입·공유·검색)

### 잔여

- `features/smarcomm/Header.tsx` (사용처 0 dead code, 2건 잔여) — 삭제 결정 필요
- 로고 `<Link href="/">` 패턴 (다수 브랜드) — `currentPath.startsWith('/{brand}') ? '/{brand}' : '/'` 분기 일관화 필요
- 일부 브랜드 `/{brand}/signup` 페이지 미존재 — 클릭 시 404 가능 (개별 브랜드별 signup 페이지 신설은 별도 결정)

---

## 2026-05-21 (세션 147) — SmarComm Phase 3.1 옵션 A 완료 (이메일 발송 헬퍼 분리 + SmarComm 라우트)

### 워크트리 / 장소

- 워크트리: master 단독 (별도 워크트리 생성 안 함)
- Base: 세션 146 commit `8bbedac8` (origin/master 0 behind)

### ① 옵션 A — `lib/email/send-broadcast.ts` 공용 헬퍼 추출

[docs/SmarComm_Phase3_Plan.md §9-C](docs/SmarComm_Phase3_Plan.md) 권장안 진행. 인트라의 검증된 발송 인프라(229줄)를 헬퍼로 분리해 SmarComm에서도 재사용.

**신설**: [lib/email/send-broadcast.ts](lib/email/send-broadcast.ts)
- `sendCampaignBroadcast({campaignId, testEmails?, scheduledAt?, supabase, adminSupabase})` Promise<SendBroadcastResult>
- `BroadcastError(message: string, status: number)` — caller가 NextResponse status로 매핑
- 내부 `resolveTargets()` 헬퍼 (segment + person_ids 합집합 + do_not_email/do_not_contact 필터)
- 인증·`RESEND_API_KEY` 체크는 헬퍼가 처리, caller는 권한·tenant 검증만 책임

### ② 인트라 send route 리팩

[app/api/intra/crm/broadcast/send/route.ts](app/api/intra/crm/broadcast/send/route.ts) 229줄 → 43줄.
- 인증 + campaignId 파싱 + `getAdminClient()` + 공용 헬퍼 호출 + `BroadcastError` catch만 남김
- 응답 형식·status 코드 완전 동일 유지 (기존 호출 측 회귀 0)
- tsc 회귀 0건 (내 변경 분), `.next/dev/types` stale 캐시 6건은 세션 145 삭제 페이지 잔재로 무관

### ③ crm_campaigns 스키마 확장

[sql/crm-campaigns-owner-columns.sql](sql/crm-campaigns-owner-columns.sql) 신설, prod 적용 완료 (HTTP 201).

```sql
ALTER TABLE crm_campaigns
  ADD COLUMN IF NOT EXISTS created_by_service TEXT NOT NULL DEFAULT 'intra'
    CHECK (created_by_service IN ('intra','smarcomm')),
  ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
```

+ 부분 인덱스 `idx_crm_campaigns_service_owner WHERE created_by_service='smarcomm'`
+ RLS 정책 `"crm_campaigns smarcomm owner"` — `created_by_service='smarcomm' AND owner_user_id=auth.uid()` 한정 ALL

기존 row는 모두 `'intra'` 기본값으로 보존, 인트라 라우트 회귀 0.

### ④ SmarComm send 라우트

[app/api/smarcomm/email/send/route.ts](app/api/smarcomm/email/send/route.ts) 신설.
- 1차 RLS (smarcomm owner 정책) + 2차 코드 검증 (`created_by_service='smarcomm' AND owner_user_id=user.id`)
- 통과 시 공용 헬퍼 호출
- TODO Phase 3.1.2: `wio_subscriptions` 한도 검증 (Free·Starter 월 N건 제한)

### ⑤ SmarComm 캠페인 list·create 라우트 + UI

**라우트**: [app/api/smarcomm/email/campaigns/route.ts](app/api/smarcomm/email/campaigns/route.ts)
- GET — 본인 SmarComm 캠페인 list (50개, created_at DESC)
- POST — name·subject·body_text 필수 + sender·preheader·button·brand·segment·person_ids 선택, INSERT 시 `created_by_service='smarcomm'`·`owner_user_id=user.id`·`brand_id='smarcomm'` 자동 세팅

**UI**: [app/(SmarComm)/smarcomm/dashboard/crm/email/page.tsx](app/(SmarComm)/smarcomm/dashboard/crm/email/page.tsx)
- "내 캠페인" 테이블 섹션 (구독자 KPI ↔ 발신자 사이)
- status 칩 (draft/scheduled/sending/sent/failed) — `StatusChip` 컴포넌트
- "지금 발송" 버튼 — `draft`·`scheduled`만 활성, 클릭 시 confirm → POST `/api/smarcomm/email/send`
- 발송 중 Loader2 spinner + disabled

### 검증

- dev 서버 가동 (preview_start "dev" port 3000), Next 16.1.6 Turbopack
- `/smarcomm/dashboard/crm/email` HTTP 200, LoginModal 게이트 정상
- `/api/smarcomm/email/campaigns` GET → 401 Unauthorized (정상)
- `/api/smarcomm/email/send` POST → 401 Unauthorized (정상)
- 서버 logs / 콘솔 logs 에러 0건
- end-to-end 발송 검증은 Phase 3.1.2 모달 완성 시점

### 모순 식별 후속

세션 145에서 식별된 `smarcomm_broadcasts` vs `crm_campaigns` 2개 시스템 분리는 옵션 A 진행으로 1단계 통합 완료. `crm_campaigns`가 인트라·SmarComm 공통 SSOT로 격상. 추후 옵션 C 진행 시 `smarcomm_broadcasts` 마이그레이션만 남음.

### 다음 세션 첫 액션 (Phase 3.1.2 또는 3.2)

WORK_STATUS.md "다음 세션 첫 액션" 참조.

---

## 2026-05-21 (세션 146) — 워크트리 일괄 정리 + WORK_STATUS 활성 표 갱신

### 작업 시작 프로토콜에서 발견

`git pull origin master`로 세션 145 commit(`86c794ba`) fast-forward 후 상황 점검 — WORK_STATUS의 활성 워크트리 표가 stale:
- `claude/vibrant-sammet-3259e9` (세션 145 작업) → master에 머지 후 정리됨, 표에만 남아있음
- `.claude/worktrees/` 폴더에 3개 잔존: `trusting-visvesvaraya-1024ad`(git worktree list 잡힘), `cranky-murdock-a0c05b`(dangling), `friendly-heisenberg-94bd10`(신규 dangling)

### 정리 절차

1. `git worktree remove .claude/worktrees/trusting-visvesvaraya-1024ad` — 권한 에러 반환했으나 실제로는 git 메타·디렉토리 모두 정리됨
2. `.claude/worktrees/` 잔존 폴더 검증 — PowerShell cwd 오해로 잠시 "없음"으로 보였으나 실제론 3개 폴더 모두 남아있음을 `Set-Location` 후 재확인
3. 빈 폴더 2개(`trusting-visvesvaraya-1024ad`, `friendly-heisenberg-94bd10`) `Remove-Item -Recurse -Force` 즉시 삭제
4. `cranky-murdock-a0c05b` 폴더(327MB, 워크트리 콘텐츠+`.next`+`node_modules`) — origin 브랜치 0 behind master 확인, **사용자 승인** 후 `Remove-Item -Recurse -Force` 삭제
5. 로컬 브랜치 정리:
   - `claude/trusting-visvesvaraya-1024ad` (was 08f55aee, origin/master에 포함됨) → `git branch -d`로 안전 삭제
   - `claude/cranky-murdock-a0c05b` (was 72ccd6cf, origin/master에 포함됨) → `git branch -d`로 안전 삭제

### 결과

- `git worktree list`: master 단독 `86c794ba`
- 로컬 브랜치: master만
- 미커밋 변경: 없음
- origin backup 브랜치 4개(`backup/myverse-canvas-share`, `backup/smarcomm-phase4`, `backup/myverse-camera`, `claude/brave-margulis-2c2f3e`)는 그대로 보존 (사용자 결정 영역)

### 다음 세션 진입 조건

워크트리 SSOT 깨끗. Phase 3.1 진입 시 §9 옵션 A/B/C 사용자 결정 후 새 워크트리 생성 (`brand/smarcomm-phase31-email`).

---

## 2026-05-21 (세션 145) — SmarComm Workspace 감사·TierGate SSOT·Phase 3 설계서

### 워크트리 / 장소

- 워크트리: `claude/vibrant-sammet-3259e9` (단일)
- 장소: 미상
- Base: master `08f55aee`

### ① SmarComm Workspace 32개 페이지 감사

사이드바 32개 메뉴 vs 파일 시스템 교차 점검 — 404 0건. orphan stub 6개 발견·삭제. `lib/smarcomm/workflow-context.tsx`(mock-only 사본, dead code) 삭제. 루트 `lib/workflow-context.tsx`는 이미 `/api/smarcomm/workflow/*` API 동기화 완료 확인.

**삭제**:
- `app/(SmarComm)/smarcomm/dashboard/{analytics,data-reports,workflow/pipeline}/page.tsx`
- `app/(SmarComm)/smarcomm/dashboard/geo/{brand,competitors,tracking}/page.tsx`
- `lib/smarcomm/workflow-context.tsx`

**청소**: [app/(SmarComm)/smarcomm/dashboard/layout.tsx](app/(SmarComm)/smarcomm/dashboard/layout.tsx) `MOCK_PATH_PREFIXES` 5개 + `nameMap` 6개 잔재.

### ② TierGate 시스템 SSOT 신설

기존 [features/smarcomm/TierGate.tsx](features/smarcomm/TierGate.tsx)가 stale (tier 명칭 불일치 `starter/growth/pro/enterprise`, `useAuth()` 직접 판정, 미사용). 4-tier 통일·SSOT 도입.

- **신설** [lib/smarcomm/tier-policy.ts](lib/smarcomm/tier-policy.ts) — `UserTier`, `TIER_ORDER`, `TIER_LABELS`, `PACK_TIER`, `PATH_TO_PACK`, `getRequiredTier(pathname)`, `hasAccess()`
- **리팩** [features/smarcomm/TierGate.tsx](features/smarcomm/TierGate.tsx) — `/api/smarcomm/me/plan` API 사용, 4-tier(free/starter/pro/business), `/smarcomm/pricing` 링크
- **마이그** [features/smarcomm/DashboardSidebar.tsx](features/smarcomm/DashboardSidebar.tsx) — PACK_TIER·UserTier·TIER_ORDER SSOT 임포트
- **자동 wrap** [app/(SmarComm)/smarcomm/dashboard/layout.tsx](app/(SmarComm)/smarcomm/dashboard/layout.tsx) — `<TierGate requiredTier={getRequiredTier(pathname)}>` 으로 children 자동 보호. 페이지 20개 손 안 대고 적용.

**검증**: master_email 자동 business → 모든 페이지 200. `/smarcomm/pricing` DB 동적 렌더 Free/Starter/Pro/Business 4-tier — TierGate 명칭 정합.

### ③ SmarComm Phase 3 설계서

**신설** [docs/SmarComm_Phase3_Plan.md](docs/SmarComm_Phase3_Plan.md) (10 섹션):
- §1~6: 카카오·푸시·이메일·자동화 인프라 옵션 + DB 스키마
- §7: 사용자 결정 7개(D1~D7) 권장 정리
- §8: 단계별 첫 액션
- **§9 (이번 세션 발견 후 추가)**: 인트라 발송 인프라(`/api/intra/crm/broadcast/send/route.ts` 229줄) 재발견 → 옵션 A/B/C 비교, 권장 A (공용 헬퍼 추출 + SmarComm 라우트, 1.5 세션)

**모순 식별**: `smarcomm_broadcasts` vs `crm_campaigns` 2개 시스템 분리 — CLAUDE.md §1.10 위반 소지.

### ④ 워크트리 환경 정상화

- `npm install` (워크트리 의존성 누락)
- `lightningcss-win32-x64-msvc` 별도 설치 (Tailwind v4 Windows native binding)
- `.next` 캐시 정리 + dev 서버 재기동
- 모든 페이지 200 회귀 없음 확인

### ⑤ 세션 시작 직후 정리 작업

- [components/UniverseUtilityBar.tsx](components/UniverseUtilityBar.tsx) WORKSPACE_REGISTRY에서 **Myverse 제거** (Myverse는 개별 B2C 서비스, 워크스페이스 아님)
- Marvis 라이트 진단 제거: `marvis/scan/page.tsx` + `marvis/report/[id]/page.tsx` 삭제, `marvis/page.tsx`의 FeatureCard href를 풀 진단(`/smarcomm`)으로
- `scan/page.tsx`의 `from=marvis` 분기 제거 (라이트 페이지 사라졌으므로)

### 의사결정 보류 (다음 세션 사용자 결정 필요)

- §9 옵션 A/B/C 선택
- D1~D7 (카카오 공급사·푸시 범위·자동화 인프라)

---

## 2026-05-20 (세션 144) — ANTHROPIC "만료" 오해 정정 + Marvis 진단(#2) 즉시 활성화

### 워크트리 / 장소

- 워크트리: `claude/trusting-visvesvaraya-1024ad` (단일)
- 장소: 미상
- Base: master `72ccd6cf` (origin과 ahead·behind 0)

### ① ANTHROPIC_API_KEY "만료" 오해 표현 전수 정정 (7곳)

**배경**: 사용자가 "ANTHROPIC_API_KEY 갱신은 매번 해야 하는거야?" 질문. 코드·문서 6곳에서 401을 "만료"로 안내하고 있어, 매 세션 시간 만료되는 것처럼 미래 세션이 오해. 실제로는 revoke·rotate되지 않는 한 영구 유효. 401의 진짜 원인은 4가지:
1. `.env.local`(집·사무실) ↔ Vercel Env 3곳 키 불일치 (가장 흔함)
2. console에서 키 회수/회전
3. 결제·크레딧 (카드 만료 시 workspace 비활성)
4. Workspace 변경 (키가 의도와 다른 org 소속)

**정정 파일**:
- [lib/agent/claude.ts:347-356](lib/agent/claude.ts:347) — 사용자 노출 401 메시지를 "자동 만료 아님 + 4가지 원인 진단 + 1회 셋업 복구" 박스로 재작성. 단체방·1:1 채팅에서 401 발생 시 이 박스가 노출됨.
- [WORK_STATUS.md:42](WORK_STATUS.md:42) — 다음 첫 액션 #1: 진단 순서 ①②③ + "매번 갱신할 일 아님" 명시
- [WORK_STATUS.md:101, 103](WORK_STATUS.md:101) — 세션 142 성과 + 알려진 차단 박스 표현 정정
- [app/(Dokdae)/CLAUDE.md:91](app/(Dokdae)/CLAUDE.md:91) — Dokdae 가이드 동일 정정
- [app/api/smarcomm/creative/generate/route.ts:178](app/api/smarcomm/creative/generate/route.ts:178) + [app/api/smarcomm/advisor/campaign-plan/route.ts:70](app/api/smarcomm/advisor/campaign-plan/route.ts:70) — 두 API의 502 hint 정정
- [app/(SmarComm)/CLAUDE.md](app/(SmarComm)/CLAUDE.md) §15 — 이월 작업 + 블로커 라인 정정

### ② Marvis 진단 (#2) 즉시 활성화 — `/smarcomm/marvis/scan` disabled 해제

**배경**: 사용자가 "SmarComm Marvis 작동이 안 된다 / 분석 자체가" 보고. 진단 결과, 페이지 [marvis/scan/page.tsx:55-60](app/(SmarComm)/smarcomm/marvis/scan/page.tsx:55)의 "진단 시작" 버튼이 `disabled` 하드코딩 + `title="Phase 1에서 활성화"`. 정직성 원칙(SmarComm CLAUDE.md § ZERO)에 따라 가짜 Mock 노출 금지로 의도적 잠금.

**해결**:
- `disabled` 해제 + `useRouter`·`useState` 추가
- `normalizeUrl()` 함수: `http://`/`https://` 자동 prefix + `new URL()` 검증 + hostname dot 체크 (잘못된 URL 즉시 에러)
- `handleSubmit()`: 검증 통과 시 `router.push('/smarcomm/scan?url={encoded}&from=marvis')`로 기존 SmarComm Index 엔진에 위임
- UI: 인라인 에러 박스(빨강 alert) + 입력 시 자동 클리어 + autoFocus
- 안내 문구: "Phase 1에서 활성화" → "SmarComm Index 엔진을 재사용한 라이트 진단입니다. 풀 진단(Pro)에서는 5 AI 플랫폼·Schema Generator·Trend가 추가됩니다."

**위임 흐름**:
```
/smarcomm/marvis/scan (URL 입력)
   → router.push('/smarcomm/scan?url=...&from=marvis')
   → /smarcomm/scan 클라이언트 useEffect (기존)
   → POST /api/smarcomm/scan
   → runFullScan() (lib/smarcomm/run-scan.ts)
   → DB 저장 + shortId 발급
   → router.push('/smarcomm/report/${shortId}')
```

ANTHROPIC_API_KEY 401 상태에서도 기술 SEO·Schema·CWV는 측정. Citability만 N/A.

**검증**:
- `npx tsc --noEmit` exit 0 (타입 정합)
- 화면 검증 보류: dev 서버가 dangling 워크트리(`cranky-murdock-a0c05b`)에서 `build-manifest.json` ENOENT 에러로 돌고 있어 HMR 미반영. 다음 세션에서 서버 정리 후 재검증.

**다음 세션 작업** (Marvis 나머지 3 기능):
- #1 대시보드: `connection="not_connected"` 하드코딩 해제 + `lib/marvis/connection.ts` 신규
- #3 RFM: `marvis_orders`·`marvis_customers`·`marvis_drafts` 테이블 + `lib/marvis/rfm.ts`
- #4 이메일: `/api/marvis/approve` + Resend + 1탭 승인 UI

### 발견된 이슈 (다음 세션 처리)

- **Dangling 워크트리**: `C:\Projects\tenone\.claude\worktrees\cranky-murdock-a0c05b`가 `git worktree list`에 안 잡히지만 디렉토리 + 로컬 브랜치 + origin 브랜치 모두 잔존. dev 서버(port 3000)가 그 안에서 `build-manifest.json` ENOENT 상태로 가동 중. 세션 143 종료 시 "결과: cranky-murdock-a0c05b 1개만 활성"으로 표기됐던 그 워크트리. WORK_STATUS § 활성 워크트리 표에 ⚠️ 섹션으로 기록.

---

## 2026-05-19 (세션 143) — 워크트리 정리 8→1 + MoNTZ 이월 #3·#5 완료 + SmarComm Marvis 라인업 SSOT 확정

### 워크트리 정리 (8 → 1)

작업 시작 시점 활성 워크트리 8개 (CLAUDE.md §3.4 상한 4개 초과). 분석 결과 **7개 모두 master에 흡수 확인**:
- `affectionate-mahavira-d5fa78`·`cool-bohr-30331f`·`friendly-heisenberg-94bd10`·`great-heyrovsky-f4415e`·`inspiring-rubin-7863ea`·`wizardly-satoshi-3a795f` — 6개 모두 `rev-list --left-right` 결과 HEAD에 unique 0건 → 안전 삭제
- `brave-margulis-2c2f3e` — HEAD에 unique 1 commit이 있으나 `git diff master..b9b7aa1c` 결과 master가 178 files 더 진보 (세션 138-139 통합에서 흡수됨 검증) → 로컬 워크트리만 삭제, origin 보존
- `inspiring-rubin`의 `.claude/launch.json` `autoPort:true` 변경은 별도 commit 가치 있어 사용자 판단에 보류
- 로컬 브랜치도 함께 정리 (`git branch -d` × 6, `-D brave-margulis` 1)
- 결과: `cranky-murdock-a0c05b` 1개만 활성. origin에 `claude/brave-margulis-2c2f3e` backup 유지.

### MoNTZ — 이월 작업 #3 (헤더 업로드 진입점) + #5 (인트라 관리 패널) 완료

**#3 권한 기반 업로드 진입점** — [features/montz/MontzInstaLayout.tsx](features/montz/MontzInstaLayout.tsx):
- `useEffect`로 `getCreatorByUserId(user.id)` 호출 → `isCreator` state로 sidebar·bottom nav에 동적으로 `PlusSquare` "업로드" 항목 삽입
- 데스크톱 sidebar: 오디션과 내 프로필 사이
- 모바일 bottom nav: 동일 위치, 비활성 시 골드 `#c8a97e` 강조
- 비크리에이터/비로그인은 기존 4개 메뉴 그대로 (검증 완료)

**#5 인트라 관리 패널 신규 2종**:
- [app/intra/ums/montz/contacts/page.tsx](app/intra/ums/montz/contacts/page.tsx) — 캐스팅 컨택 모니터링. 5탭(전체/대기/확인/수락/거절) + 검색(이름·이메일·회사·핸들·메시지) + 모델 핸들 클릭 시 새창. JOIN: `target:montz_creators!target_creator_id`
- [app/intra/ums/montz/applications/page.tsx](app/intra/ums/montz/applications/page.tsx) — 오디션 응시 모니터링. 6탭(전체/대기/확인/숏리스트/캐스트/거절) + 검색(오디션·신청자·이메일·메시지) + 양쪽 조인(audition + creator) 표시
- [app/intra/ums/montz/page.tsx](app/intra/ums/montz/page.tsx) — 통계에 `pendingContacts`·`pendingApplications` 추가 + 빠른 이동 카드 2건 추가 (대기 카운트 표시)
- [lib/intra-nav.ts](lib/intra-nav.ts) — MoNTZ 서브메뉴에 "캐스팅 컨택"·"오디션 응시" 추가
- **Action Hub Registry 비추가** — 캐스팅 컨택·오디션 응시는 staff 처리가 아닌 모니터링 용도 (실제 처리는 모델·캐스팅 디렉터 사이드 채널). CLAUDE.md §1.9.1 원칙대로 처리 대기 액션만 등록.

### SmarComm — Marvis 라인업 SSOT 확정 + 런칭 1차 페이지 구축

**전략 결정 (사용자 확정)**:
- SmarComm은 **3 티어**로 운영: `Marvis (1인·소규모) / Pro (중소) / Platinum (대규모)`
- 'Enterprise' 대신 **Platinum** 채택 (마케팅 SaaS 톤에 더 부합)
- 런칭 시점은 **Marvis 단독 노출**, Pro/Platinum은 비공개 (staff·beta·super_admin만)
- GEO = **Generative Engine Optimization** (AI 검색 노출) 확정
- 현 개발 자산(Index·AI Visibility·Schema·Trust·Trend·Exec Summary·AIRM·CRM·Workflow)은 **버리지 않고 Pro/Platinum으로 보존**

**[app/(SmarComm)/CLAUDE.md](app/(SmarComm)/CLAUDE.md) 갱신**:
- 최상단 🚀 런칭 라인업 SSOT 박스 추가
- § 1A Marvis 라인업 SSOT 신설 (3티어 정의·4기능·Marvis vs Pro 차등 표·라우트 노출 정책·4주 MVP 시나리오·금지 패턴)

**Marvis 라우트 신설**:
- [app/(SmarComm)/smarcomm/marvis/page.tsx](app/(SmarComm)/smarcomm/marvis/page.tsx) — Marvis 대시보드. 사장님 인사 / 연동 안 됨 배너 (정직성) / 빈 To-Do (가짜 Mock 금지) / 4기능 카드 (3개 Phase 1, 1개 라이트 활성) / "왜 지금은 비어 있나요?" 정직 안내
- [app/(SmarComm)/smarcomm/marvis/scan/page.tsx](app/(SmarComm)/smarcomm/marvis/scan/page.tsx) — 라이트 진단 stub. URL 입력 폼 (진단 시작 disabled, "Phase 1에서 활성화") + Marvis 6개 vs Pro 4개 차등 표

**Marvis 정직성 원칙 100% 준수**: 카페24·아임웹 미연동 상태에서 가짜 To-Do·가짜 점수 0건 노출. 모든 미구현 영역에 "Phase 1" 라벨 + 빈 상태 정직 표시.

**[app/(SmarComm)/smarcomm/page.tsx](app/(SmarComm)/smarcomm/page.tsx) Hero 교체**:
- 헤드라인 "사장님 마케팅 비서, 매일 아침 1탭으로 끝납니다."
- "MARVIS · MARKETING JARVIS" 뱃지
- URL 입력 → `/smarcomm/marvis/scan?url=...` 라우팅 (기존 `/scan` 폐기)
- "Marvis 대시보드 미리보기 →" 보조 링크
- **정직성 회복**: 검증 안 된 Social Proof 수치(`500+`·`93%`·`30초`·`₩0`) 제거 → Marvis 4가치(`1탭`·`카페24`·`매일`·`Phase 1`)로 교체

**Pro 비공개 게이트** — [app/(SmarComm)/smarcomm/dashboard/layout.tsx](app/(SmarComm)/smarcomm/dashboard/layout.tsx):
- `isProAccessAllowed(user)` 헬퍼 추가: `accountType==='staff'` OR `role==='Admin'/'super_admin'` OR `BETA_EMAILS` 포함 시만 통과
- 그 외 인증 사용자는 `router.replace('/smarcomm/marvis?reason=beta_only')` 처리
- 단일 layout 게이트로 `/smarcomm/dashboard/*` 50+ 라우트 일괄 비공개 효과
- BETA_EMAILS: `lools@tenone.biz · cheonil@tenone.biz · tenone@tenone.biz · admin@smarcomm.com`

### 검증

- TypeScript: `npx tsc --noEmit` exit 0 (전 변경 파일 통과)
- 페이지 200 응답: `/smarcomm` · `/smarcomm/marvis` · `/smarcomm/marvis/scan` · `/montz` 모두 정상 렌더 확인
- 서버 에러 0건 (preview_logs)
- 시각 검증: Marvis Hero "사장님 마케팅 비서" 메시지 + Marvis 4가치 정직 노출 + Marvis 대시보드 빈 상태 정상 표시
- Pro 게이트는 staff 자격증명 부재로 시각 검증 보류 — 다음 staff 로그인 세션에서 확인 권장

### 다음 첫 액션 (차기 세션)

1. **랜딩 페이지 나머지 섹션 정리** — `/smarcomm`의 "GEO + SEO 통합 점검"·"Getting Started"·"Our Tools" 등을 Marvis 컨텍스트로 재편 또는 숨김
2. **TierGate 3티어 통일** — `starter|growth|pro|enterprise` (TierGate.tsx) + `free|starter|pro|business` (DashboardSidebar.tsx) 두 불일치 시스템을 `marvis|pro|platinum` 단일화
3. **카페24 dev sandbox 등록 + webhook 실측** (사용자 작업) — Marvis Phase 1 MVP의 데이터 파이프 전제조건. cart는 미루고 order·review 안정성만 확인.
4. **Marvis Phase 1 — 재구매 1 시나리오 구현**: `marvis_orders`·`marvis_customers` 테이블 + RFM 계산 + Claude 초안 + 1탭 승인 → Resend 발송 (4주 일정)
5. **Marvis 사용자 시나리오(USER_SCENARIO)** — 기존 "김지원(D2C 마케터)"은 Pro 시나리오. Marvis용 "박정수(1인 사장님) 4주 흐름" 신설.

---

## 2026-05-19 (세션 142) — MADLeague 전체 디자인 QA

### MADLeague rounded 제거 + inputCls 통일 (26개 파일)

- `rounded-*` 위반 전량 제거: `my/page.tsx`, `projects/page.tsx`(StatusBadge+TeamCard), `pt/page.tsx`(CompStatusBadge+TeamPanel), `certificate/print/[code]/page.tsx` 등
- `<style>` 블록 → `inputCls` 상수로 교체: `apply/ApplyForm.tsx`, `hero/HeroForm.tsx`, `madzine/write/ArticleEditor.tsx`, `member/profile/ProfileEditor.tsx`, `clubs/[slug]/manage/ManagePanel.tsx` 등
- 신규 추가: `programs/hero/page.tsx`, `api/madleague/upload/route.ts`
- 허용 예외 확정: `h-3` 이하 컬러 도트 `rounded-full` / print CSS `<style dangerouslySetInnerHTML>`
- HeRo 프로그램: `focus:border-[#FFC000]` (금색 브랜딩, 의도적)

---

## 2026-05-17 (세션 141) — 독대 단체방 승격 + 트렌드 크롤러 복구 + 에이전트 SSOT

### MoNTZ + Jakka 소비자 동선 UX 고도화 (5축)

수요자(캐스팅 디렉터·작품 구매자) 관점 마찰점 진단 후 5축 즉시 강화:

**MoNTZ**:
- [app/(MoNTZ)/montz/page.tsx](app/(MoNTZ)/montz/page.tsx) — 홈 hero에 캐스팅 디렉터용 안내 문구 + 3 CTA(탐색·오디션·작품 올리기). hero 직후 양방향 진입 카드(FOR CASTING vs FOR CREATOR)
- [app/(MoNTZ)/montz/[handle]/page.tsx](app/(MoNTZ)/montz/[handle]/page.tsx) — placeholder "팔로우"·"DM" → "캐스팅 제안"(메인) + "공유"(navigator.share + 클립보드 폴백, 2초 "복사됨" 피드백). 비로그인도 모달 작동
- [app/(MoNTZ)/montz/explore/page.tsx](app/(MoNTZ)/montz/explore/page.tsx) — 빈 상태에 검색·필터 컨텍스트별 안내(검색어 vs 필터) + "전체 보기" 1클릭 리셋

**Jakka**:
- [app/(Jakka)/jakka/explore/page.tsx](app/(Jakka)/jakka/explore/page.tsx) — 빈 상태 컨텍스트 안내 + "전체 작가 보기" 리셋 + 모바일 전용 추천 카테고리 6개 (데스크톱은 우측 추천 패널, 모바일은 못 봐서 추가)
- [app/(Jakka)/jakka/market/[id]/page.tsx](app/(Jakka)/jakka/market/[id]/page.tsx) — 가격 아래 신뢰 신호 3분할 박스(조회수·찜·수수료 15%) + "구매 절차 3단계 + 작가 직접 발송" 정직 안내. 첫 방문자가 결제 전에 알아야 할 것 명확화

### MoNTZ 양방향 활성화 패키지 — 작품 업로드 + 캐스팅 컨택 + 오디션 응시

**인프라 (Prod 적용)**:
- Storage 버킷 `montz-works` (public, 10MB, jpeg/png/webp) + RLS (사용자 폴더 분리)
- `montz_contact_requests` 테이블 + 3 인덱스 + RLS 3 정책
- `montz_audition_applications` 테이블 + 3 인덱스 + UNIQUE(audition_id, creator_id) + RLS 2 정책

**라이브러리** ([lib/supabase/montz.ts](lib/supabase/montz.ts)):
- 작품: `uploadWorkImage`·`createMyWork`·`getMyWorks`·`deleteMyWork`
- 컨택: `sendContactRequest`·`getMyReceivedContacts`·`updateContactStatus`
- 응시: `applyAudition`·`getMyApplications`
- 타입: `MontzContactRequest`·`MontzApplication`·`CreateWorkInput`·`SendContactInput`·`ApplyAuditionInput`

**API 신규**:
- [app/api/montz/contact/route.ts](app/api/montz/contact/route.ts) — RLS 우회 INSERT + 모델 이메일 자동 조회 + Resend 발송
- [app/api/montz/applications/route.ts](app/api/montz/applications/route.ts) — Bearer 인증 + UNIQUE 중복 처리 + 캐스팅 디렉터 이메일

**페이지 신규**:
- [app/(MoNTZ)/montz/upload/page.tsx](app/(MoNTZ)/montz/upload/page.tsx) — 작품 업로드 폼

**컴포넌트 신규**:
- [features/montz/ContactModal.tsx](features/montz/ContactModal.tsx) — 캐스팅 제안 모달 (비로그인 가능)
- [features/montz/AuditionApplyModal.tsx](features/montz/AuditionApplyModal.tsx) — 오디션 응시 모달

**기존 페이지 확장**:
- [app/(MoNTZ)/montz/[handle]/page.tsx](app/(MoNTZ)/montz/[handle]/page.tsx) — "DM 보내기" → "캐스팅 제안" 버튼 교체
- [app/(MoNTZ)/montz/audition/page.tsx](app/(MoNTZ)/montz/audition/page.tsx) — DetailView 최상단 "응시" 버튼
- [app/(MoNTZ)/montz/my/page.tsx](app/(MoNTZ)/montz/my/page.tsx) — 3 신규 탭(works/offers/applied) + lazy fetch + pending 카운트 배지

**문서**: [app/(MoNTZ)/CLAUDE.md](app/(MoNTZ)/CLAUDE.md) Alpha → Beta, 신규 흐름 3건 명세, DB 6 테이블 표 (+ 2 신규)

### Jakka 정산 PATCH 이메일 알림 추가 (보너스)

- [app/api/intra/jakka/settlements/route.ts](app/api/intra/jakka/settlements/route.ts) — status 'confirmed'·'paid' 전환 시 작가에게 자동 이메일 (Resend, `replyTo: lools@tenone.biz`)
- [app/(Jakka)/CLAUDE.md](app/(Jakka)/CLAUDE.md) 이월 작업 3건 → 1건(실결제만)으로 정정. stale 표기 해소

### MoNTZ CLAUDE.md stale 정정

- 이전 표기 "DB 미연결·mock·페이지 6개 미연결"이 모두 stale였음을 확인 (실제 DB 4 테이블 존재, 5 페이지 DB 연결됨, lib 17 함수 추상화)
- 정직성 회복

---

### 단체방 채팅 환경 고도화 2차 + API 401 친절화

- [app/(Dokdae)/dokdae/page.tsx](app/(Dokdae)/dokdae/page.tsx):
  - `ParticipantSheet` 컴포넌트 신설 — 28명 layer 4그룹 그리드 + 라우터 Top 5 칩 + 각 에이전트 "@멘션 / 1:1" 2버튼
  - 헤더에 "👥 N" 참여자 카운트 버튼 (단체방 모드 전용)
  - @멘션 자동완성 dropdown — `@\w*` 매칭 시 입력바 위 가로 스크롤 칩. 1001 제외
  - 메시지 검색 — 헤더 돋보기 아이콘 + 검색 입력 + 필터 + 결과 없음 안내
  - 연속 발화 아바타 생략 (카카오톡 패턴)
  - `agents` state + 라우터 통계 `routerStats` state (단체방 진입 시 100개 `dokdae_routing` 메시지 집계)
- [lib/agent/claude.ts](lib/agent/claude.ts):
  - Anthropic 401 → raw JSON 노출 대신 키 갱신 4단계 안내 박스
  - 429(rate limit) / 529(overload) 명확 메시지
- [app/(Dokdae)/CLAUDE.md](app/(Dokdae)/CLAUDE.md) — 채팅 UX 매트릭스 갱신 (참여자 시트·자동완성·검색·연속 발화·API 친절화 5건 추가)

> **알려진 차단**: `.env.local` ANTHROPIC_API_KEY 401. 사용자 직접 키 갱신 필요 (Supabase Edge Function 키는 별개, trend-crawl 정상).

---

### 독대 → Universe 단체방 MVP + 채팅 환경 고도화

- [app/api/agent/dokdae/route.ts](app/api/agent/dokdae/route.ts) — `mode='group'` 지원. Haiku 라우터(1~3명 결정) + 병렬 `invokeAgent()` 호출. 응답 배열 반환. **@멘션** 시 라우터 우회 (matching: name 또는 display_name 부분 일치, 1001 제외, 실패 시 폴백)
- [app/(Dokdae)/dokdae/page.tsx](app/(Dokdae)/dokdae/page.tsx):
  - `GROUP_AGENT` 상수 + 사이드메뉴 "🌌 Universe 단체방" 인디고 강조 옵션
  - `Message.role`에 `'router'` 추가 (1001 결정 메모 슬림 박스 — 중앙 정렬)
  - `AgentAvatar` 컴포넌트 신설 — layer 4단계 컬러(노랑/에메랄드/인디고/퍼플) + 이니셜
  - `Bubble`이 에이전트 정보 있으면 이니셜 아바타, 없으면 텐원 로고 (legacy 1001 1:1)
  - `send()` group 모드 응답 배열 처리 — 라우터 메모 + N개 에이전트 메시지 시퀀스
  - 히스토리 로드 useEffect — selectedAgent 변경 시 재실행, 단체방(`to_agent='group'`)/1:1 분기, 80건
  - 입력 텍스트에 `@\w+` 감지 → API에 `mention` 전달
  - `formatInline`에 `@멘션` 노랑 강조 렌더 추가
  - 타이핑 인디케이터 — 단체방 전용 배지 "🌌 Universe 단체방 — 1001 라우팅 후 응답 작성 중"
  - 입력 placeholder — 단체방일 때 "@mindle" 가이드
- [app/(Dokdae)/CLAUDE.md](app/(Dokdae)/CLAUDE.md) — Phase Beta · 운영 모드 2종 · @멘션 규약 · 채팅 UX 매트릭스

### trend-crawl 27일 정지 복구

- [supabase/functions/trend-crawl/index.ts](supabase/functions/trend-crawl/index.ts) — `source_type` NOT NULL 누락 + `content`/`publishedAt` 안전 처리. Edge Function v7→v8 재배포
- 검증: collected_data max_id 41,538→213,014 / 5분 신규 237행 / mindle_trends 3개 신규

### 에이전트 SSOT 갱신

- [docs/TenOne_Agent_State.md](docs/TenOne_Agent_State.md) — **신규**. 실측 v2.5 (28 에이전트·11 Edge Function·pg_cron 4·미해소 6건)
- [CLAUDE.md](CLAUDE.md) §0 — OpenClaw 가동 상태 "✅ 상시"→"⚠️ 등록만" 정정 + 새 SSOT 참조

---

## 2026-05-17 (세션 141) — Phase 2-A 구독 인프라 시드 보강 + 정직성 회복

### Prod DB 시드 INSERT 4건

`wio_subscription_plans` (ziotlxkdctlhiwkgmmsh):
- `badak/free`, `hero/free`, `evschool/free`, `youinone/free` — price 0, features=`[]`, ON CONFLICT DO NOTHING
- 유료 티어는 차기 세션에서 가격 정책 결정 후 추가 (§ 1.10 정직 원칙)

### 파일 변경

- [sql/wio-subscription-plans.sql](sql/wio-subscription-plans.sql) — Badak·HeRo·EvSchool·YouInOne free 시드 + 무결성 미해결 이슈 주석 추가
- [app/intra/ums/commerce/subscriptions/page.tsx](app/intra/ums/commerce/subscriptions/page.tsx) — Mock fallback 4종(mockServiceStats·mockChurnData·mockCrossSell·mockSubs) 전부 제거, 빈 상태 안내 3 섹션 추가, `serviceLabels` 도입(lowercase id → 표시명 분리)
- [ROADMAP.md](ROADMAP.md) — Phase 2-A: 완료 항목 5건 `[x]` 체크 + 남은 작업 2건(유료 티어 결정, 무결성 백필) 명시. stale 경로 `/intra/universe/subscriptions` → `/intra/ums/commerce/subscriptions` 정정
- [WORK_STATUS.md](WORK_STATUS.md) — 활성 워크트리 표 채움 + 세션 141 핵심 성과 + 다음 첫 액션 3건

### 발견 — 미해결 무결성 위반 (차기 세션 이월)

`wio_subscriptions` 활성 구독 2건 `plan_id IS NULL`:
- `youinone/premium` (8fac448b-ef7f-44d6-93a4-a68e1f55cb5d)
- `evschool/course` (c1ae6b5c-ab67-4f60-aa37-ad3b4c8cb7c8)

해결 순서: ① 유료 티어 결정 → ② 'premium'·'course' plan 시드 → ③ plan_id 백필 UPDATE.
**임시로 free에 연결 금지** (결제·기능 게이트 왜곡).

### 검증

- `npx tsc --noEmit` 0 에러
- `Grep churnData|crossSell|ChurnItem|CrossSellItem` → 0건
- 페이지 200 응답 + staff 게이트 정상

---

## 2026-05-17 (세션 140) — 8개 브랜드 전체 QA + SmarComm Header/Footer 마이그레이션

### QA — 8개 브랜드 Universe 컴포넌트 정합 전수 확인

| 브랜드 | generateMetadata | UtilityBar | MobileMenu | Footer | LoginModal | loginHref |
|---|---|---|---|---|---|---|
| Badak | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| MADLeague | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| MADLeap | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| BrandGravity | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| WIO | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| HeRo | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Myverse | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| SmarComm | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### SmarComm — 구 Header/Footer 완전 제거

- 7개 마케팅 페이지(홈·blog·blog/[slug]·pricing·workspace·scan·report/[id]) 구 `Header`/`Footer` → `SmarCommHeader`/`SmarCommFooter` 교체
- `features/smarcomm/SmarCommFooter.tsx` — Account linkColumns에서 `/login` 하드코딩 제거
- `features/brandgravity/BrandGravityFooter.tsx` · `features/wio/WIOFooter.tsx` 신규 생성 확인

### 브랜드 CLAUDE.md 갱신
- `app/(BrandGravity)/CLAUDE.md` — QA 완료 기록
- `app/(MADLeap)/CLAUDE.md` — QA 완료 기록, Phase 날짜 갱신
- `app/(SmarComm)/CLAUDE.md` — QA 완료 + 마이그레이션 완료 기록

---

## 2026-05-17 (세션 139→통합) — 멀티 워크트리 프로토콜 + USER_SCENARIO + Phase 통합

### 멀티 워크트리 SSOT 프로토콜 신설
- [docs/Worktree_Protocol.md](docs/Worktree_Protocol.md) — 4 규칙·6 유형·DB 스키마 특별 규칙·정리·backup 패턴·체크리스트
- CLAUDE.md § 3.4 신설, § 4.1·4.2 워커/오케스트레이터 책임 분리
- WORK_STATUS.md "현재 활성 워크트리" + "활성 backup 브랜치" 표 양식

### SmarComm 실 사용자 시나리오 SSOT
- [app/(SmarComm)/USER_SCENARIO.md](app/(SmarComm)/USER_SCENARIO.md) — 페르소나 김지원 4주 흐름 + 갭 17건(Critical 6/High 6/Medium 5)

### 이번 세션 코드 변경
- 신규 API [/api/smarcomm/me/plan](app/api/smarcomm/me/plan/route.ts) — wio_subscriptions 기반 plan_key 조회
- DashboardSidebar PACK_TIER → DB plan_key(free/starter/pro/business) 매핑
- [lib/smarcomm/abtest-chi-square.ts](lib/smarcomm/abtest-chi-square.ts) — 카이제곱 SSOT (erfc p-value + 표본 크기)
- abtest 페이지 관측값 입력 + 자동 winner·confidence 갱신
- 신규 Cron [/api/cron/smarcomm-airm-verify](app/api/cron/smarcomm-airm-verify/route.ts) — 30일 경과 in_action 플래그 자동 재진단

### 워크트리 정리 — 5개 → 2개
- 4개 즉시 정리, 위험 3개는 `backup/myverse-canvas-share` · `backup/smarcomm-phase4` · `backup/myverse-camera` 브랜치로 origin 보존

---

## 2026-05-16 (세션 137) — Smart-Data Hub 홈 위젯 통합 + 정직성 ZERO 홈 적용

### dashboard/page.tsx 전면 재작성

**파일**: [app/(SmarComm)/smarcomm/dashboard/page.tsx](app/(SmarComm)/smarcomm/dashboard/page.tsx)

**문제**: `/dashboard` 홈이 Mock 매출·광고 KPI를 경고 없이 노출 — 정직성 절대 원칙 ZERO 위반

**변경**:
- **Smart-Data Hub 실측 위젯 신설** (개요 탭 최상단)
  - SmarComm Index (`scanLog[0].score` → 로컬/DB)
  - AIRM 오픈 플래그 (`/api/smarcomm/airm/flags?status=open` — >0 빨강, =0 초록)
  - Brand Assets 수 (`/api/smarcomm/assets`)
  - `Promise.all` 병렬 fetch + `animate-pulse` 스켈레톤 + 에러 시 `—` fallback
- **Mock 섹션 인라인 라벨**: `🧪 Demo 데이터` 앰버 배지 + Phase 5 예정 안내
- **실측 섹션 초록 라벨**: `실측 데이터` 배지

---

## 2026-05-16 (세션 139) — DEV 페이지 실 DB 고도화: 프롬프트 관리·AI 답변 변화

### 프롬프트 관리 (`/dashboard/geo/prompts`)
- 신규 API [app/api/smarcomm/prompts/route.ts](app/api/smarcomm/prompts/route.ts) — `smarcomm_ai_probes` query 그룹화, mentionRate·platforms[]·accuracy bucket·lastSeen 산출
- 신규 UI [app/(SmarComm)/smarcomm/dashboard/geo/prompts/page.tsx](app/(SmarComm)/smarcomm/dashboard/geo/prompts/page.tsx) — KPI 4 + 확장 카드 + 정렬·필터
- DashboardSidebar `dev: true` 제거 · dashboard/layout MOCK_PATH_PREFIXES 제거

### 이벤트 관리 → AI 답변 변화 (`/dashboard/events`)
- 기존 GA 택소노미 mock 폐기 → V2.0 § 3-C AIRM 검증 데이터(`smarcomm_ai_diff_events`)로 재정의
- 신규 API [app/api/smarcomm/ai-events/route.ts](app/api/smarcomm/ai-events/route.ts) — diff_type 6종 집계 + 일자별 timeline
- 신규 UI [app/(SmarComm)/smarcomm/dashboard/events/page.tsx](app/(SmarComm)/smarcomm/dashboard/events/page.tsx) — 이전/이후 텍스트 diff + 빈 상태 정직 안내
- 사이드바 라벨 "이벤트 관리" → "AI 답변 변화" + DEV 제거 · MOCK 배너 prefix 제거

### 칸반 보드 (`/dashboard/workflow/kanban`)
- 신규 API [app/api/smarcomm/workflow/tasks/route.ts](app/api/smarcomm/workflow/tasks/route.ts) — `workflow_tasks` CRUD + 대소문자 정규화
- [lib/workflow-context.tsx](lib/workflow-context.tsx) DB 동기화 (mount fetch + optimistic add/update/move/delete)
- Provider 미스매치 버그 수정: `dashboard/layout` + `content/page` `lib/smarcomm/workflow-context` → `lib/workflow-context` 통일
- 6행 실 DB 태스크 5컬럼에 분포 · DEV + MOCK 배너 prefix 제거

### 프로젝트 + 파이프라인 + 워크플로우 허브
- 신규 API [app/api/smarcomm/workflow/projects/route.ts](app/api/smarcomm/workflow/projects/route.ts) — `projects` 테이블 8행 + status/phase 정규화
- 신규 API [app/api/smarcomm/workflow/pipeline/route.ts](app/api/smarcomm/workflow/pipeline/route.ts) — `content_pipeline` 6행 + stage/type 정규화
- 컨텍스트 projects/pipelineItems 슬라이스도 DB 동기 (mount fetch + optimistic CRUD)
- 파이프라인 redirect 경로 버그 수정: `/dashboard/content` (404) → `/smarcomm/dashboard/content`
- 워크플로우 허브 4 KPI(태스크/파이프라인/프로젝트/자동화) 모두 실 집계 · DEV 일괄 제거

### 고객 관리 (`/dashboard/crm`)
- 신규 API [app/api/smarcomm/crm/people/route.ts](app/api/smarcomm/crm/people/route.ts) — `crm_people` + 단계/상태/출처 집계 + 이메일 발송 가능 수
- 신규 API [app/api/smarcomm/crm/segments/route.ts](app/api/smarcomm/crm/segments/route.ts) — `crm_segments`
- 페이지 재작성: MOCK_LEADS 폐기 → KPI 4 + 세그먼트 그리드 + 라이프사이클 필터 + 검색 + 고객 테이블 + 출처 표기
- 실 5고객 + 4세그먼트 표시 · DEV 제거 · MOCK 배너 prefix를 CRM sub-route(카카오/이메일/푸시)로만 한정

### Phase E+ — 즐겨찾기 user_settings 통합 + 경로 정규화 버그 수정
- PageTopBar: `pathname` (`/smarcomm/...`) 그대로 저장 버그 → `normalize()`로 `/smarcomm` 제거 후 저장 (nameMap 매칭 + 렌더 prefix 일관성)
- PageTopBar 즐겨찾기 읽기/쓰기 `getSetting/setSetting` 사용 (user_settings DB-first + localStorage fallback)
- dashboard/layout 즐겨찾기 로드도 동일 패턴 적용 → 멀티디바이스 동기 가능
- nameMap 라벨 정정 3건 (이벤트 관리/광고 집행/아카이브)

### CLAUDE.md 이월 작업 SSOT 갱신
- 세션 138~139 완료 12건 표기 · 외부 키 블로커 6종 + 내부 작업 4종으로 재구성

### Phase E — 운영 정합성 정리
- `smarcomm/login/page.tsx` redirect 경로: `/login?redirect=/dashboard` → `/login?redirect=/smarcomm/dashboard` (브랜드 prefix 누락 수정)
- `dashboard/layout.tsx` localStorage 직접 접근 제거 → `getSetting('smarcomm','company',...)` (`user_settings` DB-first + localStorage fallback)
- `lib/smarcomm/auth.ts` Mock 인증은 이미 제거 확인 (코드 참조 0건)

### Phase B+ — 카카오 + 푸시 통합 브로드캐스트 (마지막 2 DEV 페이지)
- MCP 마이그레이션 `smarcomm_broadcasts` — 카카오·푸시·SMS 통합 (channel/status CHECK + 4 인덱스 + RLS)
- API [broadcasts](app/api/smarcomm/broadcasts/route.ts) — CRUD + 채널 prefix 필터 + KPI 집계
- 공통 컴포넌트 [BroadcastPage](features/smarcomm/BroadcastPage.tsx) — 채널 카드/모달/빈 상태 공유
- crm/kakao: 알림톡/친구톡/비즈메시지 · crm/push: 모바일 푸시/앱 인박스
- 사이드바 DEV 배지 0개 달성 (마지막 2개 제거)

### Phase B — A/B + 콘텐츠 + 캠페인 CRUD (3 DEV 페이지)
- API [experiments](app/api/smarcomm/experiments/route.ts) — `mkt_experiments` GET/POST/PATCH/DELETE + 가설·변형·기간·승자
- API [content](app/api/smarcomm/content/route.ts) — `marketing_content` GET/POST/PATCH/DELETE + 상태/유형 필터
- API [campaigns](app/api/smarcomm/campaigns/route.ts) — `marketing_campaigns` GET/POST/PATCH/DELETE + 채널·예산·집행률 집계
- abtest/content/campaigns 페이지 재작성: 모달 입력 폼 + 카드 리스트 + 빈 상태 + 출처 표기
- 사이드바 DEV 일괄 제거 (abtest, content, campaigns 모두) + MOCK_PATH_PREFIXES 정리
- 남은 DEV는 카카오·푸시(외부 API 인프라 필요) 2개

### Phase A — 5 DEV 페이지 실 DB 활성화
- 분석 3 (`wio_analytics_events` 803행 기반)
  - 트래픽 (`/dashboard/traffic`) + API [analytics/traffic](app/api/smarcomm/analytics/traffic/route.ts) — 일자/페이지/브랜드 집계 + 체류·이탈
  - 퍼널 (`/dashboard/funnel`) + API [analytics/funnel](app/api/smarcomm/analytics/funnel/route.ts) — 4단계 세션 단위 drop-off
  - 코호트 (`/dashboard/cohort`) + API [analytics/cohort](app/api/smarcomm/analytics/cohort/route.ts) — user 첫 주차 × 5주 잔존 히트맵
- 이메일 채널 (`/dashboard/crm/email`) + API [crm/email](app/api/smarcomm/crm/email/route.ts) — 64건 발송 + 68명 구독자 + 4 발신자
- 마케팅 캘린더 (`/dashboard/calendar`) + API [calendar](app/api/smarcomm/calendar/route.ts) — events + comm_events 월 그리드
- 사이드바 DEV 일괄 제거 + MOCK_PATH_PREFIXES 5개 항목 제거

### 자동화 (`/dashboard/workflow/automation`)
- 신규 API [app/api/smarcomm/workflow/automations/route.ts](app/api/smarcomm/workflow/automations/route.ts) — `workflow_automations` CRUD
- 컨텍스트 toggle/add/update/delete DB 동기 (toggle setState 내부 PATCH 호출로 race 방지)
- 3행 실 규칙 + KPI(2 활성 / 1 비활성) · DEV 제거

### 결정
- 콘텐츠·캘린더·CRM·A/B·트래픽·퍼널·코호트 등 외부 인프라/신규 테이블 세트 필요 페이지는 세션 139 범위 외 — 차기 세션 우선순위 결정 후 진행

---

## 2026-05-16 (세션 138) — Phase 5 Items 2+3: 캠페인 자산화 트리거 + AIRM 플래그 출처 추적

### Phase 5 Item 2 완료 — 캠페인 완료 시 Entity 자동 등록 SQL 트리거

**SQL 트리거**: [sql/smarcomm-campaign-assetize-trigger.sql](sql/smarcomm-campaign-assetize-trigger.sql)
- `smarcomm_auto_assetize_on_campaign_complete()` 함수 + `smarcomm_campaign_complete_assetize` 트리거
- `AFTER UPDATE OF status ON marketing_campaigns` — `'Completed'` 전환 시만 실행
- 슬러그 자동 생성 (정규화·소문자화·공백→하이픈) + 충돌 회피 (counter ≤ 99)
- `smarcomm_brand_assets`에 Service Entity INSERT + schema.org JSON-LD 자동 생성
- 중복 방지: 동일 `source_campaign_id` + `entity_type='Service'` + `valid_until IS NULL` 존재 시 skip

### Phase 5 Item 3 완료 — AIRM 플래그 출처 추적 (Serper API 연동)

**DB**: [sql/smarcomm-airm-flag-sources.sql](sql/smarcomm-airm-flag-sources.sql)
- `smarcomm_ai_flag_sources` 테이블: flag_id(FK→CASCADE)·tenant_id·url·title·snippet·source_type·relevance_score·fetched_at
- RLS: tenant isolation + service_role bypass

**API 라우트**: [app/api/smarcomm/airm/flags/[id]/sources/route.ts](app/api/smarcomm/airm/flags/[id]/sources/route.ts)
- GET: 저장된 출처 목록 조회 (relevance_score 내림차순)
- POST: `SERPER_API_KEY` 확인 → 없으면 `{ status: 'api_key_missing' }` (정직 원칙)
  → flag.claim으로 검색 쿼리 빌드 → Serper `google.serper.dev/search` Top 10
  → URL 유형 자동 분류 (`detectSourceType`: wiki/official/news/forum/blog/other)
  → rank-based 감쇠 relevance_score (`1 - i * 0.09`) → 기존 결과 삭제 후 fresh INSERT

**UI**: [app/(SmarComm)/smarcomm/dashboard/airm/flags/page.tsx](app/(SmarComm)/smarcomm/dashboard/airm/flags/page.tsx)
- `Source` 인터페이스 + `SOURCE_TYPE_LABEL` 상수 추가
- 각 FlagRow에 4상태 Sources 섹션:
  - `api_key_missing` → "🔌 외부 검색 API 미연결 — SERPER_API_KEY 설정 필요" 안내
  - `search_error` → "⚠ 검색 중 오류" 재시도 안내
  - `ok` + 결과 있음 → type 뱃지·제목·스니펫·관련도% 클릭 가능 링크 목록
  - `ok` + 결과 없음 → "검색 결과가 없습니다" 안내
- "출처 조회" 버튼 → 첫 조회 후 "출처 새로고침"으로 텍스트 전환

---

## 2026-05-16 (세션 137) — Phase 5 Item 1: 정기 자동 재진단 Vercel Cron

### Phase 5 Item 1 완료 — Smart-Data Hub 시계열 풍부화 + AIRM 자동 발견

**DB**: `smarcomm_rescan_schedules` 테이블 Prod 적용
- cadence (weekly/biweekly/monthly) · next_run_at · RLS no_public_access

**공유 스캔 파이프라인 추출**: [lib/smarcomm/run-scan.ts](lib/smarcomm/run-scan.ts)
- `runFullScan()` 함수 — scan route + cron 공용
- scan/route.ts 280줄 → 50줄 slim wrapper

**Cron 엔드포인트**: [app/api/cron/smarcomm-weekly-rescan/route.ts](app/api/cron/smarcomm-weekly-rescan/route.ts)
- GET, `Authorization: Bearer CRON_SECRET` 인증
- active=true + next_run_at≤now 기준 limit 10/회 순차 처리
- 처리 후 next_run_at 갱신 (weekly +7d, biweekly +14d, monthly +1mo)

**vercel.json**: schedule `0 3 * * 1` (매주 월 03:00 UTC) + maxDuration 300 양쪽

---

## 2026-05-15 (세션 136) — SmarComm V2.0 워크플로우 전면 구현

### SmarComm CLAUDE.md V2.0 SSOT (+262 / -24)

[app/(SmarComm)/CLAUDE.md](app/(SmarComm)/CLAUDE.md) 전면 재작성:
- V1 어휘(진단·전략·제작·집행·관계·분석·운영) 폐기 → V2.0 7단계 **Smart-Loop** (진단·분석·전략·제작·집행·모니터링·자산화)
- **§ 3-A SSOT-6** 신설 — AI 브랜드 4지표(인지·이해·추천·평판) + 6 측정 차원
- **§ 3-B Smart-Data Hub** 신설 — 4 소스(진단·광고·AI답변·유입) 통합 인프라
- **§ 3-C AIRM** 신설 — 4단계 워크플로우 (Pro/Enterprise 유료)
- **§ 3-D 자산화** 신설 — Entity Branding 영속화
- **§ 13** V2.0 금지사항 5건 / **§ 15** SSOT 잠금 상태

### 4지표 측정 — AI Brand Journey

**lib (3)**: [sentiment.ts](lib/smarcomm/sentiment.ts) · [brand-journey.ts](lib/smarcomm/brand-journey.ts) · [ai-probes/claude.ts](lib/smarcomm/ai-probes/claude.ts) 확장
**UI**: [BrandJourneyCard.tsx](features/smarcomm/BrandJourneyCard.tsx) — As-Is/To-Be 성적표 4축 + 6 차원 펼침
**연결**: scan API 통합 + report 페이지 신규 섹션

### 자산화 (Brand Assetizing) — § 3-D

**DB 3 테이블** Prod 적용: `smarcomm_brand_assets`·`smarcomm_asset_distributions`·`smarcomm_asset_citations`
**lib**: [assets.ts](lib/smarcomm/assets.ts) — Entity 10종 메타 + JSON-LD 빌더
**API**: [/api/smarcomm/assets](app/api/smarcomm/assets/route.ts) + [[id]](app/api/smarcomm/assets/[id]/route.ts)
**페이지 2**: [카탈로그](app/(SmarComm)/smarcomm/dashboard/assets/page.tsx) + [상세](app/(SmarComm)/smarcomm/dashboard/assets/[id]/page.tsx)

### AIRM — § 3-C

**DB 4 테이블** Prod 적용: `smarcomm_ai_flags`·`smarcomm_ai_flag_sources`·`smarcomm_airm_actions`·`smarcomm_ai_diff_events`
**lib**: [airm.ts](lib/smarcomm/airm.ts) — 5 flag 유형 자동 분류 + 9 액션 유형 권장
**자동화**: scan API에 flag + 액션 자동 INSERT 통합
**API**: [/flags](app/api/smarcomm/airm/flags/route.ts) + [/actions](app/api/smarcomm/airm/actions/route.ts)
**페이지 3**: [허브](app/(SmarComm)/smarcomm/dashboard/airm/page.tsx) + [플래그](app/(SmarComm)/smarcomm/dashboard/airm/flags/page.tsx) + [액션](app/(SmarComm)/smarcomm/dashboard/airm/actions/page.tsx) (칸반)

### Smart-Data Hub — § 3-B

**lib**: [insights.ts](lib/smarcomm/insights.ts) — 시계열 집계 + Before/After diff
**API**: [/insights](app/api/smarcomm/insights/route.ts) + [/ai-tracker](app/api/smarcomm/ai-tracker/route.ts)
**페이지 2**: [Insights](app/(SmarComm)/smarcomm/dashboard/insights/page.tsx) (3축 + 4지표 추이 SVG) + [AI Tracker](app/(SmarComm)/smarcomm/dashboard/ai-tracker/page.tsx) (8 변화 유형)

### 사이드바 V2.0 + Action Hub Registry

[DashboardSidebar.tsx](features/smarcomm/DashboardSidebar.tsx) — V2.0 섹션 신설 (진단·제작·자산화·분석·모니터링)
[action-hub-registry.ts](lib/action-hub-registry.ts) — `smarcomm_airm_open_flags`·`smarcomm_airm_todo_actions` 2 entry 추가

### 명명 교정 (Smat → Smart, 7 파일)

사용자 비전 "Smat-" 표현을 정식 **Smart-Loop / Smart-Audit / Smart-Studio / Smart-Data Hub**로 통일.

### 정직성 최우선 원칙 SSOT 잠금 + 다크 모드 가독성 버그 수정 (사용자 지적)

사용자가 두 가지 핵심 메시지를 던짐:
1. **"모든 요소의 정직성이 무엇보다 중요하다"**
2. **"다크 모드에서 타이틀 안 보이고 있어"**

**P1. 정직성 = 절대 원칙 ZERO**
- [app/(SmarComm)/CLAUDE.md](app/(SmarComm)/CLAUDE.md) 머리말 최상단에 "🔴 절대 원칙 ZERO — 정직성(Honesty)이 무엇보다 중요하다" 추가
- 정직성 위반 8 유형 명시 (휴리스틱 점수·가짜 LLM·fallback·출처 부재·데이터 입력 경로 부재 등)
- "정직성 회복은 우선순위 1. UX·디자인·성능·일관성보다 먼저. 정직하지 못한 기능은 차라리 N/A 표시 또는 삭제가 정답."

**P2. 다크 모드 가독성 — 4 페이지 + 근본 해결**
- 근본 원인: body 배경이 `rgb(10, 10, 10)` (거의 검정)인데 SmarComm `.smarcomm-theme` 컨테이너에 background-color 미지정 → 검정 위 검정 텍스트
- **근본 해결**: [app/(SmarComm)/smarcomm.css](app/(SmarComm)/smarcomm.css) `.smarcomm-theme`에 `background-color: var(--color-surface); color: var(--color-text); min-height: 100vh` 추가
- 페이지별 보강 (이중 안전): report·pricing·workspace·scan 4 페이지 main에 `bg-surface text-text` 명시
- 다크 의도된 페이지(`my/page.tsx`의 `bg-neutral-900`)는 자체 override라 영향 없음

**검증**: smarcomm.css 적용 후 모든 SmarComm 페이지 `.smarcomm-theme` 배경 = `rgb(248, 249, 251)`, h1·h2 색 = `rgb(17, 24, 39)`. 대비 정상. report·pricing 페이지 스크린샷 가독성 회복 확인.

### V2.1 정직성 6차 — 출처·라벨·데이터 입력 경로 (사용자 직접 지적)

사용자가 Trend 차트를 보고 "이건 뭐에 대한 추이? 출처는? 근거 없는 데이터 억지 만든 거 없나?" 라는 핵심 정직성 질문을 던짐. 전체 차트·메트릭 재점검 후 6 항목 회복:

**6-A. Trend 차트 — "SmarComm Index 시계열 추이"로 라벨 명시화**
- "Trend (시계열 추이)" → "SmarComm Index 시계열 추이" 헤더 보강
- 🔬 출처: smarcomm_scans (자동 누적) 칩 추가
- 부제: "URL 진단 시 1 row 자동 INSERT. Y축은 SmarComm Index 점수(0~100)"
- 차트 하단: Y축·X축·파란 선 범례

**6-B. 종합 분석 레이더 산식 명시**
- 6 축 계산 산식 노출 ("기술 SEO·콘텐츠 SEO는 카드 점수 합/만점, AI 검색 노출은 5플랫폼 mentioned 비율, AI 최적화는 geoReadiness 카드 합, 키워드/콘텐츠 갭은 deep 분석에서 산출 (0~100 정규화)")
- 🔬 출처: scan 자동 산출 칩

**6-C. AI Brand Journey To-Be 목표값 "기본값" 명시**
- [brand-journey.ts](lib/smarcomm/brand-journey.ts) `TARGETS_SOURCE` 상수 추가 — "SmarComm 자체 SSOT 기본값 · Phase 5 업종 백분위 동적 산출 예정"
- BrandJourneyCard 푸터에 "🎯 To-Be 목표값(30회·90%·TOP3·85%)은 SmarComm 자체 SSOT 기본값 — Phase 5 동적 산출 + 커스터마이즈 예정" 라벨

**6-D1. 자산화 distributions UI 신설 (사용자 직접 입력)**
- 신규 [API: /api/smarcomm/assets/[id]/distributions](app/api/smarcomm/assets/[id]/distributions/route.ts) — POST(create) + DELETE(remove)
- 자산 상세 페이지에 "+ 배포 이력 추가" 버튼 + AddDistributionModal 컴포넌트
- 입력: channel(8종)·medium_name·external_url·status(5종)
- 헤더: "🔬 출처: 사용자 입력 (수동)" 명시

**6-D2. citations 데이터 출처 라벨**
- "🔬 출처: AI Probe 자동 (Phase 5)" 라벨 + 부제 "Phase 5에서 진단 시 자동 동기화 예정 — 현재는 수동 INSERT 불가"

**6-D3. AIRM ai_flag_sources Phase 5 라벨**
- flags 페이지 헤더에 "🔬 출처: AI Probe 자동 (LLM 분류)" 칩 + 부제 "출처 추적(ai_flag_sources)은 Phase 5 외부 검색 API 연동 예정"

**SmarComm CLAUDE.md § 13**: V2.1 6차 금지사항 4건 추가
- 차트·메트릭 헤더에 🔬 출처 칩 + 산식 의무
- To-Be 목표값을 "최종 정답"인 듯 노출 금지
- DB 테이블만 있고 입력 UI 부재 금지

**검증**: /smarcomm/dashboard/assets/{slug} → "🔬 출처: 사용자 입력 (수동)" + "+ 배포 이력 추가" 버튼 정상. /smarcomm/report/{id} → "SmarComm Index 시계열 추이" + 종합 레이더 산식 + AI Brand Journey "기본값" 출처 푸터 정상.

### V2.1 정직성 5차 — 잔여 5건 (Insights LLM + deprecated 완전 제거 + Mock 배너 + 라벨)

**R-A. Insights 자동 인사이트 LLM 교체**
- 신규 [insights-llm.ts](lib/smarcomm/insights-llm.ts) `analyzeInsightsLLM` — Claude Haiku에 최근 시계열(최대 10건) → headline·explanation·nextAction 동적 분석. 비용 ~$0.002/scan
- [insights API](app/api/smarcomm/insights/route.ts) → 호출 후 `llmInsight` 응답 첨부
- [Insights 페이지](app/(SmarComm)/smarcomm/dashboard/insights/page.tsx) — 신규 "🤖 LLM 동적 인사이트" 카드 (헤드라인 + 설명 + 다음 행동). 기존 임계값 분기는 보조 카드로 격하 + LLM 미가용 시 "⚠ LLM 미가용" 라벨

**R-B. deprecated 파일/함수 완전 제거**
- `lib/smarcomm/brand-personality.ts` 파일 삭제 (36 유형 임의 매핑 휴리스틱)
- `lib/smarcomm/analyzers/fact-extractor.ts` — `extractFromAIResponse`·`compareFacts` 함수 제거 (LLM으로 일원화)
- `lib/smarcomm/campaign-plan.ts` — `generateFallbackPlan` 함수 제거 (advisor route는 503 반환)
- [ai-probes/chatgpt.ts](lib/smarcomm/ai-probes/chatgpt.ts) probe도 LLM 교체 (Claude probe와 동일 패턴) — 휴리스틱 호출 일관성 정리

**R-C. Mock dashboard 페이지 자동 배너**
- [dashboard/layout.tsx](app/(SmarComm)/smarcomm/dashboard/layout.tsx) — `MOCK_PATH_PREFIXES` 배열 + `isMockPath()` 검사
- 13 path prefix(funnel·traffic·analytics·cohort·abtest·journey·events·reports·data-reports·crm·campaigns·calendar·workflow)에 진입 시 main 상단 노란 배너 자동 노출
- 메시지: "🧪 Mock 데이터 페이지 — 실측 데이터가 아닌 데모 데이터로 작동합니다. § 1.10 정직 원칙. Phase 5에서 실 API 연동 예정"

**R-D. Grade 임계값 출처 + AI SOV 신뢰도 라벨**
- [index-calculator.ts](lib/smarcomm/index-calculator.ts) — `GRADE_SOURCE` 상수 추가 ("Lighthouse 90+/50-89/<50 차용. Phase 5 업종 백분위 정규화 예정")
- [DiscoveryDetailCard.tsx](features/smarcomm/DiscoveryDetailCard.tsx) `SovMatrix` — 활성 플랫폼 < 3이면 "⚠ 활성 N/5 플랫폼만 측정" 라벨 + 평균값 표기를 "제한적 평균"으로

**SSOT 보강**: SmarComm CLAUDE.md § 13에 V2.1 5차 금지사항 5건 추가

**검증**:
- TypeScript 클린
- preview: /dashboard/funnel → Mock 배너 정상 노출
- /dashboard/insights → "🤖 LLM 동적 인사이트" 카드 + 기존 보조 카드에 "⚠ LLM 미가용" 라벨
- /smarcomm/report/[id] → AI SOV 카드에 "⚠ 활성 1/5 플랫폼만 측정" 라벨 정상

### V2.1 정직성 4차 — 다른 단계 잔여 3건 (브랜드 페르소나 + 어드바이저 + 소재 생성)

진단 외 단계 휴리스틱 fallback 제거:

**F1. 브랜드 페르소나 — 36 유형 임의 매핑 → LLM 동적 분석**
- 기존 [brand-personality.ts](lib/smarcomm/brand-personality.ts) `analyzeBrandPersonality` — 점수 임계값(V1/V2/V3·TC/TP·AO/AA·E1/E2/E3) 분기로 36 유형 매핑. 동일 점수면 항상 동일 라벨("디지털 제왕"·"숨겨진 보석" 등). 진짜 분석 아님 → § 1.10 위반
- 신규 [brand-personality-llm.ts](lib/smarcomm/brand-personality-llm.ts) `analyzeBrandPersonalityLLM` — Claude Haiku에 점수 + Top 5 passing/failing 카드 → 동적 페르소나 분석 (name·emoji·subtitle·description·strengths·weaknesses·recommendation). 비용 ~$0.001/scan
- scan API에서 호출 후 `breakdown.brandPersonality` 저장. IndexBreakdown.brandPersonality 필드 신설
- report 페이지에서 client-side `analyzeBrandPersonality` 호출 제거. server-side LLM 결과 사용. API 키 없으면 "⚠ 브랜드 페르소나 LLM 미가용" 노란 박스
- 기존 brand-personality.ts deprecated 표기

**F2. AI 어드바이저 (campaign-plan) — 휴리스틱 fallback 제거**
- 기존 [advisor/campaign-plan/route.ts](app/api/smarcomm/advisor/campaign-plan/route.ts) — Claude API 실패 시 `generateFallbackPlan` (규칙 기반) 호출. 가짜 plan 반환
- V2.1: API 키 없으면 **503**, Claude 실패 시 **502** 반환. fallback 제거. 클라이언트가 안내 메시지 표시 책임

**F3. AI 소재 생성 (creative/generate) — 휴리스틱 fallback 제거**
- 기존 [creative/generate/route.ts](app/api/smarcomm/creative/generate/route.ts) — `generateFallback`이 `prompt.slice(0, 20)`로 키워드 슬라이싱한 가짜 카피 3개 반환. 정직 위반
- V2.1: API 키 없으면 503. Claude 실패 시 502. `generateFallback` 제거

**SSOT 보강** — SmarComm CLAUDE.md § 13에 V2.1 4차 금지사항 3건 추가

**검증**: API 키 401 상태 — 브랜드 페르소나 카드 위치에 "⚠ LLM 미가용" 박스 정상. 기존 "디지털 제왕" 같은 가짜 라벨 사라짐.

### V2.1 정직성 3차 회복 — 잔여 6 항목 (E 옵션, A+B+C+D 통합)

전체 진단 시스템 36 항목 점검 후 6 항목 정직화:

**E1. AI 플랫폼 stub Citability 정규화** ([seo-analyzer.ts](lib/smarcomm/seo-analyzer.ts) + [index-calculator.ts](lib/smarcomm/index-calculator.ts))
- `GeoCheckResult.skipped?: boolean` 필드 추가
- scan API에서 stub 플랫폼에 `skipped: true` 표시
- Citability 분모를 `activeChecks` (skipped 제외)로 정규화 → 4/5 stub이 점수 부당하게 깎는 문제 해소

**E2. Action Plan LLM 추천 교체** ([exec-summary.ts](lib/smarcomm/exec-summary.ts))
- `buildActionPlan` (18 ACTION_RULES 휴리스틱) → `buildActionPlanLLM`
- Claude Haiku에 fail/warning 카드 + breakdown 정보 → impact·effort·role·estimatedPoints·action·reason 추천
- API 키 없으면 null. UI에 "Action Plan LLM 미가용" 노란 박스 + § 1.10 안내
- IndexBreakdown.actionPlan에 `reason?: string` + `source?: 'llm'` 필드 추가
- 비용 ~$0.005/scan

**E3. AIRM suggestActions LLM 교체** ([airm.ts](lib/smarcomm/airm.ts))
- `suggestActions` (5 flag_type × 2~3 액션 임의 매핑) → `suggestActionsLLM`
- 각 flag별 1~3 액션 LLM 추천 (Claude Haiku, ~$0.001/flag)
- scan API에서 병렬 호출 후 description에 "🤖 LLM 판정: {reason}" 첨부
- API 키 없으면 액션 INSERT 0건 (정직)

**E4. 콘텐츠 볼륨 라벨** ([seo-analyzer.ts](lib/smarcomm/seo-analyzer.ts))
- description에 "⚠ 표면 측정 (길이만, 의미 깊이 보장 없음 — Phase 5 LLM 깊이 평가 추가 예정)" 명시

**E5. persistence_score 가중치 라벨** ([assets.ts](lib/smarcomm/assets.ts) + [assets/[id]/page.tsx](app/(SmarComm)/smarcomm/dashboard/assets/[id]/page.tsx))
- 함수 doc-comment에 "휴리스틱 추정, Phase 5 Ahrefs DR 정규화" 명시
- 상세 페이지 흔적 점수 옆에 "⚠ 휴리스틳 가중치" 라벨 노출

**E6. schemaSuggestions placeholder 강조** ([report/[id]/page.tsx](app/(SmarComm)/smarcomm/report/[id]/page.tsx) SchemaGenerator)
- 헤더 상단에 두드러진 노란 박스: "⚠ 그대로 붙여넣기 금지 — 모든 스니펫은 `__필드명__` placeholder를 포함합니다. 실제 값으로 반드시 교체 후 `<head>`에 삽입하세요. 교체 없이 노출하면 검색·AI가 placeholder 그대로 학습할 수 있습니다."

**SSOT 보강**: SmarComm CLAUDE.md § 13에 V2.1 정직 금지사항 6건 추가 (buildActionPlan·suggestActions·Citability 분모·콘텐츠 볼륨 라벨·persistence_score 라벨·schemaSuggestions 경고)

**비용 영향**: scan당 추가 ~$0.006 (actionPlan LLM + AIRM suggestActions × n flags). 누적 sentiment-llm + source-classifier-llm + actionPlan-llm + airm-suggest-llm = ~$0.05/scan

**검증**: smarcomm.biz scan (API 키 401) — Action Plan "LLM 미가용" 박스 정상, Schema placeholder 강조 박스 정상, 콘텐츠 볼륨 "표면 측정" 라벨, Citability=34 (1/5 활성 분모로 정규화)

### V2.1 추가 정직성 회복 — factComparison + Source 분류 + Hallucination LLM 통합

§ 1.10 정직 원칙 추가 적용. 휴리스틱 의존 잔여 항목 일괄 LLM 교체:

**factComparison (사이트 사실 vs AI 응답 비교)**
- [sentiment-llm.ts](lib/smarcomm/sentiment-llm.ts) 시스템 프롬프트 확장 — 한 LLM 호출로 sentiment + reasoning + attributes + factComparisons 동시 추출
- LLM에 siteTruth 전달 → 의미적 비교 (예: 49,000원 ↔ "약 5만원" → exact)
- 각 factComparison에 LLM 판정 reason 한 줄 첨부
- 휴리스틱 `compareFacts` 폐기 (deprecated 표기)
- [ai-probes/claude.ts](lib/smarcomm/ai-probes/claude.ts) — `extractFromAIResponse`/`compareFacts` 호출 제거, LLM 결과 사용
- accuracy verdict는 LLM factComparisons에서 자동 산출

**Source 분류 (cited source 카테고리)**
- 신규 [source-classifier-llm.ts](lib/smarcomm/source-classifier-llm.ts) — batch URL 분류 LLM. scan당 1회 호출 (~$0.0005)
- 10 카테고리(news·wiki·official·blog·social·forum·review·academic·directory·unknown) + 3 trust level(high/medium/low) + 판정 reason
- [diagnostics-v21.ts](lib/smarcomm/diagnostics-v21.ts) `extractCitedSources` async로 변환, 휴리스틱 정규식 폐기
- API 키 없으면 모든 source category='unknown', trust='low' + classifierSource='na' 명시

**Hallucination 자동 정직화**
- factComparison이 LLM이라 hallucination 분리도 자동으로 정직해짐
- HallucinationFinding에 `reason` 필드 추가 (LLM 판정 근거)
- UI에 "🤖 LLM 의미 분류" 배지 + reason 한 줄 노출

**비용**: scan당 sentiment-llm × 5플랫폼 × 13질문 (~$0.04) + source-classifier-llm × 1회 (~$0.0005) = **~$0.04/scan**

**검증**: API 키 401 상태 — Source 카드에 "🤖 LLM" 배지 정상, 분류 출처 명시. 키 갱신 시 진짜 의미 분류 작동.

### V2.1 정직성 회복 — Sentiment·Reasoning·Attribute LLM 실측 교체 (§ 1.10 정직 원칙)

진단 항목 정직성 평가 후 휴리스틱 폐기 결정:

**제거**: [lib/smarcomm/sentiment.ts](lib/smarcomm/sentiment.ts) 파일 삭제 (한국어 키워드 사전·정규식 매칭 휴리스틱)
**신규**: [lib/smarcomm/sentiment-llm.ts](lib/smarcomm/sentiment-llm.ts) — Claude Haiku 4.5 LLM 분류기. structured JSON output. brand 미언급 시 즉시 skip (비용 절약). 응답당 ~$0.0003, 5플랫폼 × 13질문 ~$0.02/scan

**연결**:
- [ai-probes/claude.ts](lib/smarcomm/ai-probes/claude.ts) — `analyzeSentiment/extractReasoning/extractAttributes` 휴리스틱 호출 제거 → `classifySentimentLLM` 단일 호출. `analysisSource: 'llm'` 필드 추가
- [ai-probes/types.ts](lib/smarcomm/ai-probes/types.ts) — `analysisSource?: 'llm'` 필드 (undefined = N/A)
- [brand-journey.ts](lib/smarcomm/brand-journey.ts) — LLM 미실측 시 Sentiment Axis N/A, 종합 점수 평균에서 제외. Attribute Association·Reasoning 차원도 isNA=true 처리
- [airm.ts](lib/smarcomm/airm.ts) — `detectFlagsFromProbes` negative_sentiment flag는 LLM 실측만 생성
- [BrandJourneyCard.tsx](features/smarcomm/BrandJourneyCard.tsx) — 헤더에 "🤖 LLM 실측 N건" 또는 "⚠ Sentiment LLM 미가용" 배지. Sentiment Axis N/A 박스 + "🔬 LLM 키 필요" 칩

**SSOT 갱신**:
- SmarComm CLAUDE.md § 3-A SSOT-6 머리말에 V2.1 정직성 회복 명시
- § 13 V2.1 금지사항 추가 (휴리스틱 sentiment 금지, N/A 점수 산입 금지)

**효과**: ANTHROPIC_API_KEY 401 상태 진단 시:
- 이전: sentiment 50점 가짜 평균, attributes/reasoning 0점 → 종합 점수 왜곡
- 이후: 모두 N/A 명시, 종합 점수는 측정 가능한 3축(인지·이해·추천)만 평균

### V2.1 Discovery sub-engine High 3건 구현

기존 AI Probe 응답에서 외부 API 없이 추출 가능한 3 측정 차원 신설:

**lib**: [diagnostics-v21.ts](lib/smarcomm/diagnostics-v21.ts)
- `computeAiSov()` — 카테고리 × 플랫폼 매트릭스 + byCategory / byPlatform 평균 + 전체 SOV
- `extractCitedSources()` — citations + rawResponse URL 추출 + 9 카테고리 분류 (news/wiki/official/blog/social/forum/review/academic/other) — 휴리스틱 정규식 도메인 매칭
- `extractHallucinations()` — factComparison wrong을 8 카테고리(price·location·spec·founded·features·strengths·category·other) + 3 severity로 분리
- `computeDiscoveryDetail()` — 통합 산출

**UI**: [DiscoveryDetailCard.tsx](features/smarcomm/DiscoveryDetailCard.tsx)
- SOV 매트릭스 — 색 히트맵 (≥70 녹·40~70 파·20~40 노·<20 주)
- 인용 출처 — 도메인 카드 + 카테고리 칩 + 펼침
- 할루시네이션 — Critical/High/Medium 분리 + 사이트 vs AI 비교

**연결**: scan API → `breakdown.discoveryDetail` JSONB 저장, report 페이지 신규 섹션 (BrandJourneyCard 다음, Action Plan 앞)
**검증**: smarcomm.biz scan → 7 SOV 셀 정상 매트릭스, 빈 상태(no URL/no wrong) 모두 핸들

### V2.1 진단 sub-engine SSOT 잠금 (코드 0줄)

[app/(SmarComm)/CLAUDE.md](app/(SmarComm)/CLAUDE.md) § 3-A SSOT-7 신설 — V2.0 상위 30/30/40 유지하면서 ① 진단 내부를 5 sub-engine + 퍼널 통합으로 세분화:

- **Discovery / Conversion / Trust / Reputation / Shopping** 5 sub-engine + Funnel
- **AI SOV·인용 출처·할루시네이션 분리·검색 의도·3초 테스트·전환 마찰·모바일 가독성·인증/인가·거버넌스·취약점·감성·키워드 클라우드·인플루언서·에셋 일관성·쇼핑 키워드·리뷰 시맨틱** 16 측정 차원 정의
- **Smar-Index(SI)** — 20/20/30/30 보조 지표로 별도 산출 (SmarComm Index 30/30/40과 함께 표시)
- **차별화 연구 2건** — AI 리터러시 진단 / 쇼핑 모멘텀 시차
- § 13 V2.1 관련 금지사항 4건 추가
- 신규 DB 테이블 최소화 원칙 (JSONB 누적 우선)

### Quick win 후속 5건

- **AIRM Critical priority 분리** — `ActionEntry.extraFilters` 신설 (multi-AND 필터), `smarcomm_airm_critical_flags` entry 추가
- **dashboard `/login` → LoginModal** — `router.push('/login?redirect=…')` 제거, § 1.2.1 위반 해소
- **Mock 인증 제거** — `lib/smarcomm/auth.ts` 삭제, dashboard/scan dynamic import 정리, scan-data.ts SSOT 통일
- **Entity 자동 등록 트리거** — `lib/smarcomm/auto-assetize.ts` 신설 + `/api/smarcomm/campaigns/finalize` API. § 3-D "캠페인 종료 = 자산화 시작" 규약 코드화. UUID 검증 + 멱등성 확인
- **빌드·preview E2E 검증** — Spring Launch 2026 캠페인 종료 → Service + FAQPage 자동 INSERT, /dashboard/assets 3 카드 노출 확인

### 핵심 결정 7건

1. **V1 어휘 폐기 → V2.0 7단계 SSOT** — Smart-Loop 데이터 플라이휠 중심
2. **AI 브랜드 4지표 + 6 측정 차원** — Citability 단일축 → 입체화
3. **AIRM = Pro/Enterprise 유료 핵심 모듈** — 발견·분석·교정·검증 4단계
4. **자산화 = 캠페인 종료 시작점** — 캠페인 끝나면 brand_assets INSERT 의무
5. **Smart-Data Hub 4 소스 의무 조인** — 새 분석 페이지는 단일 소스 금지
6. **Entity 5종 Schema.org SSOT** — Organization·Service·Person·Product·FAQPage
7. **명명: Smart-** (SmarComm 브랜드 + Smart 워크플로우)

### 산출 파일 (총 25개 변경)

| 분류 | 파일 |
|---|---|
| SQL | smarcomm-brand-assets.sql · smarcomm-airm.sql (Prod 적용) |
| lib (5 신규) | sentiment.ts · brand-journey.ts · assets.ts · airm.ts · insights.ts |
| API (8 신규) | assets · assets/[id] · airm/flags · airm/actions · insights · ai-tracker · scan(수정) · report/[id](영향 X) |
| 페이지 (7 신규) | dashboard/assets · assets/[id] · airm · airm/flags · airm/actions · insights · ai-tracker |
| UI (1 신규) | BrandJourneyCard.tsx |
| 수정 | CLAUDE.md(SmarComm) · DashboardSidebar.tsx · action-hub-registry.ts · ai-probes/types.ts · ai-probes/claude.ts · index-calculator.ts · scan/route.ts · report/[id]/page.tsx |

---

## 2026-05-14 (세션 135) — Myverse 진입점 + SmarComm Index Phase 1~3 고도화

### Myverse (3 영역)

**AppTopNav 아바타 드롭다운** ([features/myverse/planner/AppTopNav.tsx](features/myverse/planner/AppTopNav.tsx))
- Install·Help·Settings 분리 아이콘 → 아바타 드롭다운 통합
- Bell 알림 분리 (이전엔 아바타가 알림 진입점)
- 드롭다운: 이름·구독상태 헤더 → 프로필 / 설정 / 도움말 / 앱 설치 / 로그아웃

**운동·식사 카드 시각화** ([features/myverse/capture/CaptureView.tsx](features/myverse/capture/CaptureView.tsx))
- StatChip · IntensityDots (5단계) · MealStats · ExerciseStats
- UnifiedTrace.exercise에 level/heart_rate 추가
- 부수: capture_mode 잠재 버그 fix ([app/api/myverse/routines/route.ts:65](app/api/myverse/routines/route.ts) "manual" → "active", 세션 108부터 잠재)

**첫 랜딩 페이지 → 캡쳐** (6곳: marketing redirect / Hero CTA / `/myverse/app` / onboarding 완료·재진입 / 브랜드 로고)

### SmarComm CLAUDE.md 전면 재작성

[app/(SmarComm)/CLAUDE.md](app/(SmarComm)/CLAUDE.md) 130줄 → 376줄
- § 2 WIO ↔ SmarComm 동등 OS SSOT (종속 폐기)
- § 3 Marketing OS 7대 영역
- § 3-A 보고서 5 SSOT (가중치/AI 플랫폼/Question Bank/역할/뷰 모드)
- § 5 팩 시스템 SSOT
- § 10 핵심 파일 60+개
- § 13 절대 하지 말 것 9건

### SmarComm Index Phase 1 — DB 영구 저장 + 공유 URL

- [lib/smarcomm/index-calculator.ts](lib/smarcomm/index-calculator.ts) — `computeIndex()` 30/30/40 + Grade S/A/B/C/D
- [sql/smarcomm-scans.sql](sql/smarcomm-scans.sql) — `smarcomm_scans` + `smarcomm_scan_pages` (Prod 적용)
- scan API + report API + short_id 발급 + Hero UI + 신뢰 푸터

### SmarComm Index Phase 1.5 — 권위 표준 정렬

- [lib/smarcomm/grading/thresholds.ts](lib/smarcomm/grading/thresholds.ts) — Google CWV/QRG/Schema.org/WCAG/Mozilla/llms.txt 출처
- [lib/smarcomm/analyzers/schema-validator.ts](lib/smarcomm/analyzers/schema-validator.ts) — JSON-LD 자체 검증 (14 schema)
- [lib/smarcomm/analyzers/mozilla-observatory.ts](lib/smarcomm/analyzers/mozilla-observatory.ts) — 보안 헤더 등급
- 카드 분리: 인덱싱 → 인덱싱+Canonical / 내부 링크 → 사이트 링크 분류
- AI 봇 Access (5봇 robots.txt) + llms.txt + INP 측정
- 권위도 T4 처리 (휴리스틱 폐기, N/A)
- 모든 description 재작성 — 판단(✓⚠⛔📋) + 근거 + 출처
- Trust E-E-A-T 4 sub-score 재배치 (Experience·Expertise·Authoritativeness(N/A)·Trustworthiness)

### SmarComm Index Phase 2 — 5 AI Probe + Visibility Map

- [lib/smarcomm/question-bank.ts](lib/smarcomm/question-bank.ts) — 7카테고리 × 13질문 (업종별)
- [lib/smarcomm/ai-probes/](lib/smarcomm/ai-probes/) — types/claude/chatgpt/perplexity/google-aio/naver-cue/index 7 파일
- [sql/smarcomm-ai-probes.sql](sql/smarcomm-ai-probes.sql) — Prod 적용
- AI Visibility Map UI — 7카테고리 노출률 + 플랫폼별 펼침 + 실제 응답 캡처
- **발견**: smarcomm.biz Claude 13질문 = 0/13 언급. Index 71 → 61 정직한 조정

### SmarComm Index Phase 2.5 — 답변 일관성

- [lib/smarcomm/analyzers/fact-extractor.ts](lib/smarcomm/analyzers/fact-extractor.ts) — 자사·AI 사실 추출 + 자카드 비교
- 5 probe 시그니처 통일 (siteTruth 인자)
- UI: 답변 일관성 요약 카드 + Probe별 정확도 배지 (✓△✗—) + 사실 비교 표
- 산식: consistency = (exact ×1.0 + partial ×0.5 + wrong ×−0.5) / mentioned × 100

### SmarComm Index Phase 3 — Schema 자동·Action·Trend·Exec Summary

- [lib/smarcomm/schema-generator.ts](lib/smarcomm/schema-generator.ts) — Organization/WebSite/FAQPage/Service/BreadcrumbList 자동 생성
- [lib/smarcomm/exec-summary.ts](lib/smarcomm/exec-summary.ts) — Claude Haiku 3줄 요약 + Action Plan Impact×Effort 18 룰
- [app/api/smarcomm/report/[id]/trend/route.ts](app/api/smarcomm/report/[id]/trend/route.ts) — 도메인 시계열 API
- UI 4 신규: Executive Summary 30초 요약 / ActionMatrix 2×2 / SchemaGenerator (복사 버튼) / TrendChart SVG

### 신규 파일 (총 19개)

**SQL 2** · **API 2** · **lib 15** (smarcomm 14개 + capture 1개 미존재)

| 파일 |
|---|
| `lib/smarcomm/index-calculator.ts` · `grading/thresholds.ts` |
| `lib/smarcomm/analyzers/schema-validator.ts` · `mozilla-observatory.ts` · `fact-extractor.ts` |
| `lib/smarcomm/question-bank.ts` |
| `lib/smarcomm/ai-probes/types.ts` · `claude.ts` · `chatgpt.ts` · `perplexity.ts` · `google-aio.ts` · `naver-cue.ts` · `index.ts` |
| `lib/smarcomm/schema-generator.ts` · `exec-summary.ts` |
| `app/api/smarcomm/report/[id]/route.ts` · `[id]/trend/route.ts` |
| `sql/smarcomm-scans.sql` · `smarcomm-ai-probes.sql` |

### 핵심 결정 10개

1. **WIO ↔ SmarComm 동등 OS** — 종속 표현 폐기
2. **Marketing OS 7대 영역 SSOT**
3. **Index 가중치 30/30/40** — Citability 강조 (균등/40-40-20 거부)
4. **5 AI 플랫폼 SSOT** — 6번째 임의 추가 금지
5. **4-Tier 측정 모델** — T0/T1/T2만 점수 산입, T3/T4 별도 N/A
6. **권위도 측정 폐기** — `.com/.kr` 휴리스틱은 정직하지 못함. Phase 4 외부 도구 대기
7. **DB 가격 SSOT** — `wio_subscription_plans`, Markdown 정확 수치 금지
8. **AI 정확도 wrong = -0.5 음수 가중** — 오답이 미언급보다 위험
9. **마케터 4 질문 구조** — 찾을 수 있나·신뢰할 만한가·AI 추천하는가·경쟁사 대비 어떤가
10. **마케터 모드 기본** — 이후 dev/exec 뷰 추가

### 환경

- 작업 위치: 워크트리 `brave-margulis-2c2f3e`
- 사무실/집: TBD
- ANTHROPIC_API_KEY: 401 에러 (재갱신 필요)
- DB 적용 완료: smarcomm_scans · smarcomm_scan_pages · smarcomm_ai_probes

---

## 2026-05-13 (세션 134) — 캡쳐 Phase 2 + 모바일 하단 네비 + 녹음·퀵메뉴

### 캡쳐 Phase 2 (5건)

**#1 프로젝트 선택 모달**
- `features/myverse/capture/CaptureView.tsx` — placeholder toast → 실제 모달
- 모달 구성: 프로젝트 dropdown · 노트/마일스톤 2모드 토글 · 자동 제목 input · 마감일(마일스톤 모드만) · 미리보기
- `suggestProjectTitle()` / `buildProjectContent()` 헬퍼 — trace의 caption·body·media_url·nutrition·exercise·tags·source 메타 자동 조립

**#2 GPS 자동 체크인** (PWA 한계로 foreground only)
- `lib/myverse/auto-checkin.ts` 신규 — `useAutoCheckin` hook
- 10분 폴링 · 300m 이동 dedup · 30분 슬롯 dedup · Visibility API 일시정지 · localStorage 영속화
- haversine 거리 계산 + slot key `YYYY-MM-DDTHH:MM` 30분 단위 floor
- CaptureView 도크 위에 토글 + 상태 배지(최근 기록 시각 / 폴링 시각 / 권한 오류 메시지)

**#3 운동·식사 전용 폼**
- DB: `sql/myverse-routines-structured-fields.sql` (Prod 적용)
  - `myverse_daily_routines` ADD `kcal INT` + `heart_rate INT` + `composition TEXT`
- API: `app/api/myverse/routines/route.ts` POST/PATCH 모두 3 필드 수용 + 정수 정규화
- traces: `app/api/myverse/traces/route.ts` — routine row의 category별 nutrition(meal)/exercise(exercise) JSON으로 surface
  - exercise summary = `강도 N/5 · 평균 BPM · 메뉴구성` 자동 조립
- 보너스: moment의 nutrition/exercise JSON 컬럼도 traces select에 추가 → AI 분석 후 카드에 즉시 표시
- CaptureView composer:
  - 식사: 시작/종료/메뉴 구성/섭취 칼로리
  - 운동: 거기에 강도 1~5 세그먼트 + 평균 심박수 + 소모 칼로리
  - 메모/체크인은 simple composer 유지 (`isStructuredComposer` 분기)

**#4 DailyView dead code 5파일 삭제** — 외부 import 0 확인
- 삭제: `DailyMoments.tsx` · `DailyPlacesCard.tsx` · `DailyRoutinesCard.tsx` · `DailyHealthStats.tsx` · `SnsPostComposer.tsx`

**#5 좌하단 사이드바 footer 통째 삭제** (사용자 결정)
- `features/myverse/app/AppSideNav.tsx` — footer 블록(설정·도움말·앱 설치) + `InstallButton` import 제거
- ⚠ 후속 필요: 설정/도움말/앱 설치 진입점 부재 → UtilityBar 아바타 드롭다운으로 이전 권장 (차기 세션)

### 모바일 하단 네비 — capture 가운데 강조

- `features/myverse/app/MobileBottomNav.tsx`
  - `ALL_NAV_OPTIONS`에 `capture`(`bolt` 아이콘) + `mail` 추가
  - `MOBILE_NAV_DEFAULT` → `["projects", "today", "capture", "feed", "card"]`
  - 5슬롯 모드 가운데(idx=2) 항목 강조 — 위로 솟은 원형 + accent fill + 흰 ring 4 + shadow-lg (Material BottomAppBar FAB 패턴)
- `app/(Myverse)/myverse/app/settings/tech/page.tsx` — import를 `planner/MobileBottomNav` → `app/MobileBottomNav` 라이브 버전으로 교체
- 옛 orphan 삭제: `features/myverse/planner/MobileBottomNav.tsx`

### 녹음 + 퀵 메뉴 (CaptureView)

**녹음 (audio media_type 신설)**
- DB: `sql/myverse-moments-audio.sql` (Prod 적용)
  - `myverse_daily_moments` media_type CHECK 교체 → `IN ('image','video','text','audio')`
  - media_url_required CHECK 교체 → audio도 media_url 필수
- `app/api/myverse/moments/route.ts` POST validation에 audio 허용
- `app/api/myverse/traces/route.ts` UnifiedTrace.media_type 타입에 audio 추가
- `lib/myverse/use-recorder.ts` 신규 — `useRecorder` hook
  - MIME 자동 선택(webm/opus 우선) + getUserMedia 권한 + 거부/미지원/마이크 부재 에러 분기 + 언마운트 안전 정리
  - 반환: state(idle/requesting/recording/stopping) + start/stop/cancel + elapsedSec + error
- CaptureView 도크 그리드 `4 cols mobile / 7 cols md` — 사진·영상 옆에 `RecordBtn`
  - 녹음 중: rose 테두리·아이콘 + 깜빡이는 dot + `mm:ss` 타이머
  - 정지 → moments/upload → POST `media_type='audio'` + `duration_sec`
- TraceCard audio: 인디고 박스 + Mic 아이콘 + 네이티브 `<audio controls>`
- `suggestActions` audio 분기: Task로 + 프로젝트로

**도크 밑 퀵 메뉴 (QuickLink 5개)**
- 캔버스·연락처·메일·퍼스널·인사이트 — 둥근 칩 + 아이콘 + 텍스트
- 사이드바 좁아진 모바일에서 빠른 진입점

### 신규 파일

| 경로 | 역할 |
|---|---|
| `lib/myverse/auto-checkin.ts` | GPS 자동 체크인 hook (foreground only, 슬롯+이동 dedup, localStorage 영속화) |
| `lib/myverse/use-recorder.ts` | MediaRecorder hook (MIME 자동, 에러 분기, 언마운트 정리) |
| `sql/myverse-routines-structured-fields.sql` | routines에 kcal/heart_rate/composition 컬럼 추가 |
| `sql/myverse-moments-audio.sql` | moments media_type CHECK에 audio 추가 |

### 삭제 파일

- `features/myverse/planner/DailyMoments.tsx`
- `features/myverse/planner/DailyPlacesCard.tsx`
- `features/myverse/planner/DailyRoutinesCard.tsx`
- `features/myverse/planner/DailyHealthStats.tsx`
- `features/myverse/planner/SnsPostComposer.tsx`
- `features/myverse/planner/MobileBottomNav.tsx` (orphan, app 버전이 SSOT)

### 결정 사항

1. **프로젝트 선택 모달은 노트/마일스톤 2모드 토글** — 캡쳐의 짧은 텍스트도 의미 손실 없이 보존(노트). 일정 추적 필요 시 마일스톤 모드.
2. **GPS 자동 체크인은 foreground only** — PWA 한계로 진짜 백그라운드는 불가. UI에 "(앱 열려있을 때만)" 명시. 백그라운드는 Phase 3에서 Android Chrome PeriodicSync로 시도.
3. **routines kcal/heart_rate/composition은 plain 컬럼** — JSON으로 묶지 않고 정규화. 차후 통계 쿼리 용이.
4. **traces가 routine을 nutrition/exercise JSON으로 surface** — UnifiedTrace 인터페이스 안 깨고 카드 렌더 통일. moment AI 분석(nutrition/exercise JSONB)과도 형태 호환.
5. **좌하단 footer 통째 삭제** — 사용자 결정. 차기 세션에서 UtilityBar 아바타 드롭다운으로 이전 (UniverseUtilityBar SSOT 7요소 보강 필요).
6. **모바일 하단 네비 가운데 슬롯 강조** — Material BottomAppBar FAB 패턴(위로 솟은 원형). 5슬롯 모드(`navItems.length === 5 && idx === 2`)일 때만 적용 — 다른 개수에서는 균등 렌더.
7. **녹음 audio는 moments 테이블에 통합** — 별도 audio 테이블 만들지 않고 media_type='audio'로 확장. UnifiedTrace 일관성 유지.
8. **MobileBottomNav SSOT는 `features/myverse/app/MobileBottomNav.tsx`** — `planner/` 버전은 옛 잔재로 삭제. settings/tech import 경로도 일관 정리.
9. **퀵 메뉴 5개는 좁은 모바일 진입 보강** — 사이드바 footer 삭제 후 캔버스·연락처·메일·퍼스널·인사이트로 가는 빠른 경로 제공.

---

## 2026-05-13 (세션 133) — 이월 정리 + Myverse 캡쳐 페이지 신규

### 이월 처리

**Storage 마이그레이션 — `planners-moments` → `myverse-moments`**
- `scripts/migrate-moments-bucket.js` 실행. 4개 객체 복사 성공.
- `myverse_daily_moments.media_url`은 이미 새 버킷 참조라 URL UPDATE는 0행.
- 옛 버킷 4개 객체 잔존 — 사용자가 Supabase Dashboard에서 수동 삭제 필요.

**Myverse 구독 만료 SSOT 정리 (잠재 버그 6곳 → 1 헬퍼)**
- 검증 결과: `subscription_status='active'` 만 보고 `subscription_expires_at` 무시하던 5곳 발견. 만료된 active 사용자가 chat 무제한 사용·매일 브리핑 수신·인트라 active 배지 등 잠재 버그.
- 신규: `lib/myverse/subscription.ts` — `isMyverseSubscriberActive()` + `effectiveSubscriptionStatus()` SSOT
- 적용 5곳:
  - `app/(Myverse)/myverse/app/layout.tsx` — 헬퍼 호출 + DB best-effort UPDATE (다음 호출부터 정확)
  - `app/api/myverse/chat/route.ts` — `subscription_expires_at` 함께 조회
  - `app/api/myverse/cron/briefings/route.ts` — 시간 필터는 SQL, 만료 검증은 헬퍼 (PostgREST `.or()` 두 번 chain 모호성 회피 위해 코드측 filter)
  - `features/myverse/planner/PurchaseView.tsx` — "활성 구독" 박스/재결제 버튼 분기에 헬퍼 사용
  - `app/intra/planners/page.tsx` — active 카운트·배지가 만료자를 자동 expired로 처리

### Myverse — 캡쳐 페이지 신규 (5 채집 통합 진입점)

**메뉴 추가**
- `features/myverse/app/AppSideNav.tsx` — INSIDE > ENGINE 그룹 "오늘" 위에 "캡쳐" 메뉴 추가. 아이콘 `bolt` (Quick Capture 메타포).

**페이지 신규**
- `app/(Myverse)/myverse/app/capture/page.tsx` — 신규 라우트
- `features/myverse/capture/CaptureView.tsx` — 빠른 도크 6 버튼 + 통합 카드 리스트 + AI 액션 칩

**데이터 통합**
- 카드 리스트: `GET /api/myverse/traces?date=today` 사용 (moments + places + routines UNION, 시간 역순)
- 도크 분기:
  - 메모/사진/영상 → POST `/api/myverse/moments` (text/image/video)
  - 식사/운동 → POST `/api/myverse/routines` (category='meal'/'exercise')
  - 체크인 → POST `/api/myverse/places` (place_name + GPS 자동 채움)
- 자동 미러링 (places ↔ routines)은 기존 API 동작 그대로

**카드 표시 — source별 분기**
- 한 장면(인디고 인디케이터) · 장소(emerald) · 일과(amber)
- 메타: 시간 · duration · visibility · domain · category · 태그
- AI 분석 결과 표시: `nutrition.summary` (kcal) · `exercise.summary`

**AI 액션 칩 (suggestActions)**
- 텍스트 메모 → Task로 · 프로젝트로 · 검색해 볼까요? (Google 새 탭)
- 음식 사진 (`body` + 음식 키워드 또는 activity='식사') → 식단·열량 분석
- 운동 사진 → 운동 분석
- 업무·학습 → 프로젝트로 / Task로
- 축하·관계 → 소셜 공유 (navigator.share)
- routine(meal/exercise) → 분석 칩 (사진 없으면 toast 안내)
- 모든 카드: 공유 · 삭제 (source별 다른 endpoint)

**DailyView 3 카드 제거 (캡쳐로 이관)**
- `features/myverse/planner/DailyView.tsx` — TodaySceneCard 정의 + 사용처 + 관련 import 6개 정리
- 약 70줄 감소
- 컴포넌트 파일(`DailyMoments.tsx`, `DailyPlacesCard.tsx`, `DailyRoutinesCard.tsx`)은 보존 (다른 페이지 참조 가능성 — 다음 세션 dead code 정리)

### 신규 파일

| 경로 | 역할 |
|---|---|
| `lib/myverse/subscription.ts` | 구독 만료 검증 SSOT 헬퍼 |
| `app/(Myverse)/myverse/app/capture/page.tsx` | 캡쳐 라우트 (서버 컴포넌트) |
| `features/myverse/capture/CaptureView.tsx` | 캡쳐 통합 UI — 도크 6버튼 · 카드 리스트 · AI 액션 칩 |

### 결정 사항

1. **만료 검증 SSOT 헬퍼 패턴 채택** — 6곳 인라인 분기 대신 1 헬퍼. PostgREST `.or()` 두 번 chain은 모호성 위험 → cron API는 시간 필터만 SQL, 만료 검증은 코드측 filter.
2. **layout.tsx에서 만료 감지 시 DB best-effort UPDATE** — 다음 호출(chat/cron)에서 정확한 상태 보장. Promise.then 비동기 fire-and-forget.
3. **캡쳐 도크 매핑 — 식사/운동→routines, 체크인→places** — 도메인 의미상 자연스러운 매핑. 자동 미러링으로 양쪽 테이블에 row 생성.
4. **AI 액션 분기 — 도메인+키워드 hint 기반** — sub_tags + caption/body/activity blob에서 FOOD_HINTS/EXERCISE_HINTS/CELEBRATION_HINTS 매칭. 첫 매치만 primary 액션, 나머지는 default.
5. **DailyView 3 카드 제거 — 캡쳐로 통합. 컴포넌트 파일 자체는 보존** — 다른 곳 import 가능성. 다음 세션 dead code 정리.

---

## 2026-05-12 (세션 132) — Notion Mail 통합 1~4단계 + Hotfix 2건

### Hotfix

**대문자 /Myverse 경로 하드코딩 → /myverse**
- `app/(Myverse)/myverse/page.tsx` line 149, 198 — `router.replace("/Myverse/app/daily")` / `router.push('/Myverse/app')` → 소문자
- `app/(Myverse)/myverse/story/page.tsx` line 152 — `href="/Myverse"` → 소문자
- 원인: Next.js URL case-sensitive — 인증 사용자가 `/myverse` 접근 시 자동 redirect → 404

**사이드바 접힘 FOUC**
- `app/(Myverse)/myverse/app/layout.tsx` 인라인 스크립트에 `myverse-sidebar-collapsed` 클래스 부착 추가 (다크모드 패턴 재사용)
- `features/myverse/app/SidebarCollapseContext.tsx` useState 초기값을 함수로 — HTML 클래스 검사로 SSR/client 일치. toggle 시 localStorage + HTML 클래스 동시 동기화
- 원인: useState(false)로 시작 → 펼침 첫 페인트(라벨 큰 글씨) → useEffect로 접힘 → 라벨 사라짐(FOUC)

### Myverse — Notion Mail 통합 1단계: 인박스 페이지 + 본문 캐시

**DB 마이그레이션 (Prod 적용)**
- `sql/myverse-email-imports-body.sql` — `body_text`/`body_html`/`body_fetched_at`/`is_read`/`is_starred` 컬럼 + 인덱스

**API 신규**
- `GET /api/myverse/email-imports/[id]` — 본문 캐시 있으면 그대로, 없으면 Gmail API `format=full`로 fetch + payload 트리 재귀 파싱 + base64url 디코딩 + DB 캐시 (text 100KB / html 500KB)
- `PATCH /api/myverse/email-imports/[id]` — is_read/is_starred/triage_state 토글

**페이지 신규**
- `app/(Myverse)/myverse/app/mail/page.tsx` + `features/myverse/mail/MailView.tsx` — Notion Mail 3패널 (카테고리 사이드바 + 메일 목록 + 본문)
- 카테고리 필터 7종 — 전체·수신함·영수증·초대·뉴스레터·즐겨찾기·보관함
- 메일 카드 — 안 읽음 인디케이터, 즐겨찾기 토글, auto_category 배지, 금액(영수증)
- 본문 영역 — HTML iframe(sandbox) 또는 text, Gmail 원본 열기·보관·즐겨찾기 액션

**사이드바·Settings**
- AppSideNav에 "메일" 메뉴 (Mail 아이콘)
- SettingsIntegrations — "Connected emails" / "Connected calendars" 그룹 분리, Gmail row 추가 (Google OAuth 공유)

### Myverse — Notion Mail 2단계: 필터 패널

**`MailView.tsx`**
- Filter 토글 버튼 + 활성 필터 카운트 배지
- 읽지 않음만 토글
- 날짜 범위 — 전체기간/오늘/이번주/이번달 (4-way 토글)
- 발신인 chip — top 8 빈도순 (이름·횟수 표시)
- 활성 필터 칩 (패널 닫혀 있어도 어떤 필터 켜졌는지 요약 + X 해제)

### Myverse — Notion Mail 3단계: Daily 임베드

**`features/myverse/planner/DailyView.tsx`**
- `NoteItem.type`에 `'email'` 추가 + `email_id` + `email_meta` (sender_name/email/subject/snippet/received_at/external_id)
- type==='email' 카드 — rose 그라디언트 배경, 보낸이 아바타(@), 제목 1줄 + snippet 4줄, Gmail 원본 링크
- 헤더 아이콘에 `Mail` 아이콘 + auto-title "메일 N" 패턴 + placeholder

**`MailView.tsx`**
- 디테일 헤더에 "Daily 임베드" 버튼 — 오늘 daily.notes에 email 노트 push + triage_state='note' 마킹 (중복 임베드 추적)
- API 흐름: GET daily?date → notes 배열에 push → POST upsert daily → PATCH email triage

### Myverse — Notion Mail 4단계: 답장·작성·Gmail 동기화

**OAuth scope 확장 (기존 사용자 재연결 필요)**
- `lib/myverse/google-calendar.ts` SCOPES에 `gmail.send` + `gmail.modify` 추가

**API 신규**
- `POST /api/myverse/integrations/gmail/send` — RFC 822 + base64url 인코딩, In-Reply-To/References 헤더, threadId, RFC 2047 한글 제목 인코딩
- `POST /api/myverse/integrations/gmail/modify` — `action`: archive/mark_read/mark_unread/star/unstar → Gmail 라벨 add/remove (INBOX/UNREAD/STARRED)
- 403 insufficient_scope 응답 시 재연결 안내 hint

**`MailView.tsx`**
- 헤더 답장 버튼 (Reply 인디고 fill) + 사이드바 새 메일 작성 버튼 (PenSquare)
- composer 모달 — To/Subject/Body, 답장 시 자동 인용 + Re: prefix + inReplyTo
- 보내기 결과 toast (전송 완료 / 권한 부족 안내)
- archive/star/read 시 로컬 DB + Gmail 라벨 동시 동기화 (best-effort, 실패해도 로컬 유지)
- EmailItem 인터페이스에 `external_id` 추가

### 신규 파일

| 경로 | 역할 |
|---|---|
| `sql/myverse-email-imports-body.sql` | email_imports 본문 캐시 + read/starred 컬럼 (Prod 적용) |
| `app/api/myverse/email-imports/[id]/route.ts` | 단일 메일 GET (on-demand fetch+캐시) + PATCH |
| `app/(Myverse)/myverse/app/mail/page.tsx` | 메일 라우트 |
| `features/myverse/mail/MailView.tsx` | Notion Mail 3패널 인박스 + composer |
| `app/api/myverse/integrations/gmail/send/route.ts` | Gmail 발송 (답장·작성) |
| `app/api/myverse/integrations/gmail/modify/route.ts` | Gmail 라벨 수정 (archive/read/star) |

### DB 마이그레이션 (Prod 실행 완료)
1. `myverse-email-imports-body.sql`

---

## 2026-05-12 (세션 131) — 마인드맵 export·노드→Task·OKR 시각화·회사 필터·프로젝트 노트 통합

### Myverse — 마인드맵 export
- `features/myverse/planner/MindmapEditor.tsx` — `exportMindmap(format)` 함수
- 툴바에 PNG / SVG 버튼 (Image / FileImage 아이콘) — html-to-image의 toPng/toSvg
- 캡처 영역: containerRef 전체
- 캡처 제외: `data-mindmap-ui` 속성 (툴바·도움말·color picker·import 모달·apply 모달)
- 파일명: `mindmap-{root.text 첫 20자}-{ISO date}.{png|svg}`

### Myverse — 마인드맵 선택 노드 → Daily Task
- MindmapEditor에 `onPromoteText?: (text: string) => void | Promise<void>` prop 신규
- 선택 노드 우상단 color picker 패널에 "+Task" 버튼 (emerald 색상, root 제외, onPromoteText 있을 때만)
- CanvasStudio가 mindmap·canvas 양쪽에 동일한 `handlePromoteText`(`/api/myverse/tasks` POST + source_note_id=canvasId) 전달

### Myverse — 템플릿 → 마인드맵 시각화
- TemplatesView 모달 푸터에 "마인드맵으로" 버튼 (GitBranch, indigo 보더)
- `visualizeAsMindmap()` 신규 — 본문/framework data → `parseTextToMindmap` → POST `/api/myverse/canvases` + `data.mindmap` 시드 → `router.push`
- OKR Roll-up / RACI / SAFe PI 등 `##` 헤딩 구조면 즉시 시각화

### Myverse — 회사 → ContactsView 필터
- `features/myverse/planner/CompaniesView.tsx` — 회사 행에 ExternalLink 아이콘 버튼 (contact_count > 0 일 때만)
- `<Link href="/myverse/app/contacts?company={id}">` — 클릭 시 ContactsView로 이동
- `features/myverse/planner/ContactsView.tsx`:
  - `useSearchParams`/`useRouter` 추가 (next/navigation)
  - Contact 인터페이스에 `company_id?: string | null` 추가
  - filtered 함수에 `matchCompany` 조건 (companyFilter && c.company_id === companyFilter)
  - 헤더에 활성 필터 칩 (회사명 + X 해제 버튼, `/myverse/app/contacts`로 push)

### Myverse — 템플릿 → 프로젝트 마일스톤/노트 이중 모드
- "프로젝트로 적용" 모달에 라디오 추가 — `applyMode: "milestones" | "note"`
- 마일스톤 모드: 기존 동작 유지 (extractMilestones → milestones POST)
- **노트 모드**: 본문 통째로 `/api/myverse/projects/{id}/notes` POST — Pre-mortem 위험·RACI·SAFe 구조 보존
- 미리보기도 모드별 분기 (마일스톤 ◆ 리스트 / 노트 본문 잘림 미리보기 400자)
- "프로젝트로 적용" 버튼 노출 조건 변경 — 헤딩 없어도 본문 있으면 노출 (자동으로 note 모드 기본 선택)

### 신규 파일

(없음 — 모두 기존 파일 확장)

### 확장된 prop / 함수

- `MindmapEditor.onPromoteText` (옵션)
- `TemplatesView.visualizeAsMindmap()` (신규 함수)
- `TemplatesView.applyMode` state ("milestones" | "note")
- ContactsView Contact 타입에 `company_id`

---

## 2026-05-12 (세션 130) — 마인드맵 import·회사 관리·간트 의존성 위반·신규 프레임워크 4종

### Myverse — 마인드맵 텍스트 import
- `features/myverse/planner/MindmapEditor.tsx` — `parseTextToMindmap()` + `buildTreeFromItems()` 신규
- 자동 감지: 첫 비공백 줄이 `#`로 시작 → 마크다운, 들여쓰기 있음 → outline 모드
- 모달 UI: textarea + 추가/교체 라디오 + 에러 메시지 + 예시 placeholder
- 스택 기반 트리 구성 — depth가 stack 깊이 벗어나도 최근 노드에 fallback

### Myverse — 회사 관리 페이지
- 신규 `app/(Myverse)/myverse/app/contacts/companies/page.tsx`
- 신규 `features/myverse/planner/CompaniesView.tsx` — 회사 CRUD, 검색, 회사별 소속 인원 펼침, 컬러/로고 편집, 삭제 확인
- ContactsView 헤더에 "회사 (N)" 링크 배지 추가
- 회사 삭제 시 contact.company_id는 ON DELETE SET NULL — 연락처 보존

### Myverse — 간트 의존성 위반 + auto-fix
- `features/myverse/planner/ProjectTasksTab.tsx` (ProjectGanttView)
- 위반 감지: `dayDiff(dep.date, task.date) - dep.duration < 0` (Finish-to-Start)
- 시각화: dashed rose 화살표 + 별도 marker + ⚠ AlertTriangle 아이콘 + 상단 배너
- `autoFixDependencies()` — 5-pass 위상정렬로 task 시작일을 dep의 latest end+1일로 push, daily 행 간 자동 이관
- 범례에 "의존성 / 위반" 항목 추가

### Myverse — 마인드맵 → 프로젝트로 적용
- MindmapEditor에 Target 버튼 + Apply 모달
- root의 1단계 자식 = 마일스톤, 손자 트리 = description으로 평탄화(들여쓰기 보존)
- 프로젝트 fetch on demand (모달 열 때 1회)
- 미리보기: 최상위 3개 손자만 노출, 나머지는 "외 N개"
- `myverse_project_milestones` 일괄 POST

### Myverse — 간트 PNG/SVG export
- ProjectGanttView에 `chartRef` + html-to-image의 `toPng`/`toSvg`
- 줌 토글 옆 [PNG | SVG] 버튼 그룹
- 파일명: `gantt-{ISO date}.{png|svg}`

### Myverse — 신규 프레임워크 4종 (Prod 적용)
- `sql/myverse-templates-frameworks-v2.sql`:
  - **RACI** — Responsible/Accountable/Consulted/Informed 매트릭스 + 검증 체크리스트
  - **Pre-mortem** — 6개월 후 실패 시나리오 역추론 + 4분면(외부 통제 가/불가 × 내부 통제 가/불가) + 트리거 신호
  - **OKR Roll-up** — 조직 → 팀 → 개인 OKR 정렬, `{{quarter}}/{{year}}/{{user}}` 변수 활용
  - **SAFe PI Planning** — Business Context, PI Objectives, ART Risks (ROAM 분류), 의존성 보드, Confidence Vote

### 신규 파일

| 경로 | 역할 |
|---|---|
| `app/(Myverse)/myverse/app/contacts/companies/page.tsx` | 회사 관리 라우트 |
| `features/myverse/planner/CompaniesView.tsx` | 회사 엔티티 CRUD UI |
| `sql/myverse-templates-frameworks-v2.sql` | RACI / Pre-mortem / OKR Roll-up / SAFe PI Planning 시드 (Prod 적용) |

### DB 마이그레이션 (Prod 실행 완료)
1. `myverse-templates-frameworks-v2.sql`

---

## 2026-05-12 (세션 129) — 간트 의존성·마인드맵·템플릿 변수·Company Stage 2·DigitalCard 캡처

### Myverse — 간트 차트 추가 고도화

**의존성 화살표 (Finish-to-Start)**
- `lib/myverse/types.ts` (PlannerTask) — `depends_on?: string[] | null` 신규 필드
- `features/myverse/planner/ProjectTasksTab.tsx` — SVG 직각 경로 + arrow marker 오버레이
- 편집 팝오버에 의존성 picker(자기 자신 제외 후보 select + 현재 의존 chip + Unlink 토글)
- 좌표 계산: `barEnd(dep) → barStart(target)`, row_y = headerH + dated.length·msRowH + i·taskRowH + h/2

**좌측 시작일 핸들**
- `startDrag(mode: "resize-left")` — deltaDays 만큼 date 이동, duration_days를 반대로 보정 (끝점 고정 + duration 최소 1 보존)
- 좌측 1.5px 핸들 (`cursor-ew-resize`) — 우측 핸들과 별도 영역

**마일스톤 ◆ 드래그**
- `startMilestoneDrag()` — diamond 마커 mousedown→drag→PATCH `/api/myverse/projects/{id}/milestones`로 due_date 변경
- 호버 시 1.25x scale 미세 인디케이터

**ProjectKanbanView 드래그&드롭**
- 카드 draggable + 컬럼 dragover/drop → status 변경 (DailyKanban 패턴 일관화)

### Myverse — 템플릿 변수 + 마일스톤 자동 변환

**변수 치환 시스템**
- `lib/myverse/templates.ts` — `buildDefaultVarContext` / `expandVariables` / `extractVariables` 3개 신규 함수
- `{{var|fallback}}` 패턴 파서, 미정의 변수는 빈 문자열 또는 fallback
- 자동 변수: `today/date/year/month/day/quarter/week/weekday/user/role`
- `TemplatesView.tsx` — body_md를 `expandVariables(body, varCtx)`로 렌더, 모달 상단에 치환된 변수 인디고 안내 박스 노출

**마일스톤 자동 변환**
- `extractMilestones()` 신규 — `## 헤딩` + `- [ ] 체크박스` 추출, `(YYYY-MM-DD)` 패턴은 due_date로 인식
- 모달 푸터 "프로젝트로 적용" 버튼 → 프로젝트 선택 모달 → `myverse_project_milestones` 일괄 INSERT
- 적용 결과 카운트 표시

**시드 마이그레이션**
- `sql/myverse-templates-variables.sql` (Prod 적용) — daily_log/weekly_review/project_kickoff 본문에 `{{today}}/{{weekday}}/{{user}}/{{year}}/{{week}}` 자연스럽게 주입
- 신규 `quarterly_kickoff` 템플릿 추가 (변수 풀 활용 예시)

### Myverse — 마인드맵 (캔버스 위 신규 모드)

**MindmapEditor 신규**
- `features/myverse/planner/MindmapEditor.tsx` 신규 — SVG 방사형 + 자동 레이아웃
- `MindmapNode { id, text, children, collapsed?, color?, position? }` 타입
- 자동 레이아웃: root(0,0) 중앙, 1단계 360° 균등 분할, 깊은 단계는 부모 각도 ±75° sector 내 균등 분포
- 키보드 단축키: Tab=자식 / Enter=형제 / Space=접기 / F2·더블클릭=편집 / Delete=삭제 / Esc=편집취소
- 휠 줌(0.3~3x), 배경 드래그 pan, 1.5초 디바운스 자동 저장
- **노드 수동 드래그** — `MindmapNode.position` 오버라이드, 자동 레이아웃 위에 덮어쓰기. 좌표는 `(e.clientX - start) / zoom`로 줌 보정
- **색상 커스터마이즈** — 선택 노드 우상단 floating 컬러 picker(8색 + "자동" 복귀 + "위치 리셋" 버튼)
- 엣지: 부드러운 베지에 곡선(`M Q T`), 색상은 부모 색 상속

**CanvasStudio 분기**
- `canvas.data.mindmap` 존재 시 MindmapEditor 렌더, `canvas.data.ppcanvas` 존재 시 기존 CanvasEditor (양립)
- `handleMindmapSave` 신규 — `data.mindmap` 키로 PATCH

**CanvasListView 생성·표시**
- "새 마인드맵" 버튼 추가 (기존 "새 캔버스" 옆) — POST 시 `data.mindmap.root` 초기 시드
- 카드 좌상단 인디고 배지 + 빈 썸네일 GitBranch 아이콘 (kind 기반)

**캔버스 list API**
- `app/api/myverse/canvases/route.ts` GET — `kind: "canvas"|"mindmap"` 필드 응답에 추가, data 자체는 응답에서 제외 (페이로드 부담 0)
- POST — `body.data` 인자 받게 확장 (마인드맵 초기 시드용)

### Myverse — Person/Company 정규화 Stage 2

**DB 마이그레이션** — `sql/myverse-companies.sql` (Prod 적용 완료)
- `myverse_companies` 신규 테이블 (member_id/name/domain/industry/logo_url/notes/color)
- `myverse_contacts.company_id UUID REFERENCES myverse_companies ON DELETE SET NULL` FK 추가
- 기존 `contacts.company_name`(자유 텍스트) 자동 백필 → company 엔티티 생성 + company_id 연결
- legacy fallback: `company_name` 컬럼 그대로 유지

**API 신규**
- `app/api/myverse/companies/route.ts` — GET(검색·아카이브)/POST(find-or-create)/PATCH/DELETE + 회사별 contact 카운트

**Contacts API 확장**
- 단일 insert에 `person_type/company_name/company_id/role/tags/avatar_url` 받게

**ContactsView UI 통합**
- `<datalist id="myverse-companies-datalist">` SSOT — 회사 input autocomplete (메인 폼 + bulk edit 폼)
- save 시 입력값이 새 회사면 `/api/myverse/companies` find-or-create 호출 → `company_id` 자동 연결
- load 시 contacts + companies 병렬 fetch

### DigitalCard PNG 캡처 — 브랜드 자산 반영

- `components/DigitalCard.tsx` — `downloadCardImage()` 강화
- 외부 이미지(아바타·brand 로고·QR) CORS로 누락되던 문제 해결
- 캡처 전: 모든 `<img src>` → `fetch(mode:'cors') → blob → FileReader.readAsDataURL` 변환, `onload` 대기(1.5s 타임아웃)
- `toPng` 호출 후 원래 src 복원 (React rehydrate 안전성)

### 신규 파일

| 경로 | 역할 |
|---|---|
| `features/myverse/planner/MindmapEditor.tsx` | SVG 방사형 마인드맵 에디터 (드래그·색상·키보드) |
| `app/api/myverse/companies/route.ts` | Company 엔티티 CRUD + find-or-create |
| `sql/myverse-companies.sql` | Companies 테이블 + 백필 (Prod 적용) |
| `sql/myverse-templates-variables.sql` | 시드 템플릿 변수 주입 + quarterly_kickoff (Prod 적용) |

### 신규 / 확장된 함수·필드

- `PlannerTask.depends_on?: string[] | null`
- `MindmapNode.position?: {x,y} | null` · `color?: string | null`
- `lib/myverse/templates.ts`: `buildDefaultVarContext` · `expandVariables` · `extractVariables` · `extractMilestones`

### DB 마이그레이션 (Prod 실행 완료)
1. `myverse-companies.sql`
2. `myverse-templates-variables.sql`

---

## 2026-05-13 (세션 128) — 프로젝트·간트·칸반·미완 트리·UX 대청소

### Myverse — 일정 & 업무 카드

**칸반/리스트 토글 + 위계**
- 신규 `features/myverse/planner/DailyKanban.tsx` — 3컬럼(계획/진행/완료), 미팅 시간 헤더로 그룹핑, 메인 카드 안에 서브 들여쓰기, 드래그&드롭으로 status 변경, 다크모드 가독성
- 헤더에 [리스트 | 칸반] 토글 (localStorage 영속화)
- 리스트 뷰에도 메인-서브 위계 트리 — 신규 `SubtaskRow` 컴포넌트 (좌측 회색 라인 + 들여쓰기 + 작은 체크박스/상태 배지)
- 상태 → 컬럼 매핑 SSOT: 계획=todo/carried/hold/moved, 진행=doing, 완료=done/cancelled
- `PlannerTask.status`에 `doing` 추가

**공휴일·절기 분리**
- 헤더에 이미 표시되는 공휴일·절기는 일정&업무 카드에서 제외 (개인 미팅·할 일만)

**경중완급 시스템 완전 제거**
- DailyTaskRow의 `PRIORITY_META`/`QUADRANT_CYCLE`/`PriorityBadge`/`PriorityPicker`/`TaskPriority` 삭제
- DailyView의 인라인 priority 렌더, `updateTaskPriority`, 미완 모달의 priority 배지 모두 제거
- CalendarEntryEditor의 2×2 사분면 피커 + state 제거
- 데이터 호환을 위해 `priority` 필드 자체는 타입에 유지 (UI 미노출)

**미완 업무 호출 — 메인+서브 동반**
- API `/api/myverse/daily/pending-tasks`: 미완 메인 + 그 메인의 모든 서브(완료·취소 포함) 함께 반환
- 모달 UI: 메인만 체크박스 / 서브는 들여쓰기 + 상태 배지(✓·⏸✕) + 옅은 배경, 완료 서브 line-through
- 이월 시 메인의 미완 서브 자동 동반, 새 ID 생성하며 `parent_id` 맵핑 보존

### Myverse — 프로젝트 도구

**프로젝트 등록 모달 + 고도화**
- 새 프로젝트 폼 → 팝업 모달 (`max-w-xl`, 백드롭 블러, 외부클릭 닫기)
- 추가 필드: 시작일 / 종료일(마감) / 목표 한 줄 / 마일스톤(선택, 여러 개 가능)
- 마일스톤 입력 → `myverse_project_milestones`에 INSERT (milestone-sync가 자동으로 일정&업무에 `ms_` 마커 생성)
- 종료일 → `myverse_calendar_entries` anniversary 자동 등록

**프로젝트 상세 페이지 신규**
- 신규 라우트: `app/(Myverse)/myverse/app/projects/[id]/page.tsx` (이전엔 페이지 없어서 404)
- ProjectTasksTab에 [리스트/칸반/간트] view toggle 추가
- 업무 탭은 `ms_` 접두사 마커 필터 아웃 → 마일스톤 탭과 중복 제거
- 마일스톤·업무 혼란 해소: 마일스톤은 큰 단계(milestones 테이블), 업무는 실행 액션(daily.tasks)

**간트 차트 (4단계 고도화)**
- **막대 너비** = `duration_days × colWidth` (PlannerTask에 `duration_days` 필드 신규)
- **드래그 늘리기** — 막대 우측 핸들 (`cursor-ew-resize`)
- **막대 이동** — 본문 드래그 (daily 행 간 자동 이관)
- **편집 팝오버** — 업무명 클릭 → 시작일 + 기간 입력
- **자율 헤더** — 총 일수 기준 자동 줌(일/3일/주/월), 월·주 시작은 major tick 굵게
- **수동 줌** — 우측 상단 [자동/일/주/월] 토글
- **오늘 표시줄** — 빨간 세로 라인 + "오늘" 라벨
- **마일스톤 ◆ 다이아몬드 마커** — `myverse_project_milestones` fetch, 별도 행에 옅은 보라 배경
- **범례** — 좌측 상단 (계획/진행/완료/마일스톤/오늘)

**프로젝트 페이지 스크롤 화살표 제거**
- 상태 탭 `<nav>`의 `overflow-x-auto` → `flex-wrap`

### Myverse — 캔버스·템플릿

**노트 → Task 승격 다양화**
- CanvasEditor 텍스트 도구바에 `＋태스크` 버튼 (`onPromoteText` prop)
- CanvasStudio가 `source: "note"` + `source_note_id: canvasId`로 POST
- TemplatesView 모달에 "태스크로 승격" 버튼 (500자 절단, ✓ 피드백)

### Myverse — UX

**사이드바 토글 위치 이동**
- 좌측 사이드바 토글 버튼: footer 하단 → **우측 상단**으로 이동
- `absolute` 포지셔닝 — 레이아웃 공간 차지 0

**Hydration 에러 fix**
- `app/layout.tsx` `<html>`에 `suppressHydrationWarning` — myverse 다크모드 인라인 스크립트와 React hydration 충돌 해결

### 폐기

- **TimeBlock 기능 삭제** — `TimeBlockTimeline.tsx` 제거, DailyView 통합 코드 모두 제거. API/DB 테이블은 사용 없이 유지.

### 신규 API + 스키마

- `PATCH/DELETE /api/myverse/daily/[date]/task/[taskId]` — 단일 task 패치 (날짜 이동 시 daily 행 간 자동 이관)
- `PlannerTask.duration_days?: number | null` (간트용)
- `PlannerTask.status`에 `doing` 추가

---

## 2026-05-11 (세션 127) — Personal OS 통합: 사이드바 접힘 + 브랜드 자산 + 메일/캘린더 + 마케팅 페이지 통합

### Myverse — Personal OS 핵심 인프라

**사이드바 접힘/펼침 (Claude 스타일)**
- 신규 `features/myverse/app/SidebarCollapseContext.tsx` + `MainContent.tsx`
- `AppSideNav` 재작성 — 접힘 시 아이콘만 + hover tooltip + 토글 버튼 + localStorage 영속화

**사이트 차단 토글·미리보기 (사생활)**
- DB: `myverse_users.page_visible BOOLEAN DEFAULT TRUE` 컬럼 추가
- `/settings/privacy` 페이지 최상단에 토글 + 방문자 화면 미리보기 (공개/비공개 즉시 전환)
- `lib/myverse/handle/public-page.ts` `getPublicPageData()`에 page_visible 게이트
- `app/api/myverse/settings/route.ts` GET 응답에 `handle` 추가

**퍼스널 — 브랜드 자산 SSOT**
- DB: `myverse_brand_assets` 테이블 (8 type: logo/palette/typography/tagline/mission/image/link/template)
- Storage: `brand-assets` 버킷 (public, 5MB, 본인 폴더만 RLS)
- `/myverse/app/personal/brand` 페이지 + 파일 업로드 UI
- 사이드바 PERSONAL에 "브랜드" 메뉴 추가
- 디지털 명함(`DigitalCard.brandAssets` prop) — 로고/태그라인/팔레트/링크 자동 노출
- 공개 핸들 페이지 hero 자동 렌더 (태그라인·로고·팔레트·미션·외부링크)

**메일·캘린더 양방향**
- Google Calendar **read + write**: `myverse_calendar_entries.google_event_id` 컬럼, POST/PATCH/DELETE 자동 푸시 (meeting/anniversary)
- 신규 `lib/myverse/google-calendar-push.ts` 헬퍼
- Gmail 임포트: OAuth scope `gmail.readonly` 추가, 최근 7일 메타 캐시 (`myverse_email_imports`)
- **Triage 실행**: 메일 → Task/Event 자동 생성 + sourceEmailId 추적
- Claude Haiku LLM 분류 (confidence<0.6 시 키워드 fallback)
- 통합 페이지: Calendar/Gmail/Photos/Health 4개 카드

**Personal OS 인프라 강화**
- `PlannerTask` 확장: `type(normal/milestone/finance/people/admin)/amount/currency/assignee_person_id/waiting_on_person_id/source*`
- `myverse_contacts` 정규화: `person_type(self/internal/external)/company_name/role/tags/avatar_url`
- `myverse_timeblocks` 신설 (Task ↔ 시간 슬롯)
- 노트 → Task 승격: CornellRowsInline 행마다 "Task로 보내기" 버튼 + `/api/myverse/tasks` POST
- 템플릿 시드: `daily_log`/`weekly_review`/`project_kickoff`

**무끼 LLM 확장 (이전 세션 마무리)**
- `/api/myverse/mukki/intent` Claude Haiku tool calling 7개 도구
- DailyMoments 편집 모달 visibility 토글 + Web Share 공유 버튼
- DailyView 3,707줄 → 3,158줄 분할 (`DailyTaskRow`/`DailyTrackingBlocks`/`UpcomingSchedule`)

**마케팅 페이지 통합**
- 헤더 nav: 로드맵·문의·서비스·기술·철학·팀·About 제거 → **브랜드 스토리 + 가격** 2개
- `/myverse/story` 신규 (philosophy + about 통합) — 어둠의 점/흩뿌린 조각/3원칙/다섯 번의 전환/Personal Black Box
- Home에 흡수: ATTENTION SHIFT, 데이터 소스 6개, 데이터 주권 5원칙, Universal Record (다크 코드 블록)
- 페이지 삭제: `/about` `/team` `/philosophy` `/service` `/technology`
- 우상단 유틸리티 바 ABOUT 버튼 숨김 (`hideAbout`)
- 로고만 소문자 `myverse` (마케팅·앱 헤더 5곳) — 본문/메타/CTA는 `Myverse` 유지

**카피 수정**
- "서비스는 사라져도 / 나의 기록은 남는다"
- "기록이 쌓이면 / 나의 성장이 된다"
- 랜딩 화살표 인디케이터 ↑→↓← 삭제
- "당신의 기록은 안전합니까?" → "당신의 디지털 기록은 당신의 것입니까?"

**누락 패키지 설치**
- `qrcode` + `html-to-image` + `@types/qrcode` — DigitalCard 빌드 에러 해결

**개발 원칙 추가 (루트 CLAUDE.md)**
- `npm run dev` 직접 실행 금지 → `preview_start "dev"` 강제
- 사고 이력 기록 (Turbopack 캐시 손상 → 좀비 프로세스 → 포트 점유)

### DB 마이그레이션 8건 (Prod 실행 완료)
- `myverse-page-visible.sql`
- `myverse-brand-assets.sql` / `myverse-brand-assets-bucket.sql`
- `myverse-email-imports.sql`
- `myverse-calendar-google-link.sql`
- `myverse-contacts-person-normalize.sql`
- `myverse-timeblocks.sql`
- `myverse-templates-personal-os.sql`

### 운영 후속 조치 필요
1. GCP 콘솔에서 Gmail API 활성화
2. 기존 Google 사용자 재연결 안내 (scope에 `gmail.readonly` 추가됨)

---

## 2026-05-11 — 세션 125 · Myverse 무끼 플로팅 + SNS 포스팅 + 카드 분리 + 레이아웃 fixed

### 장소
집

### 무끼 플로팅 통합
- 사이드바 MUKKI 그룹 제거 → 신규 `MukkiFab.tsx` 우측 하단 그라디언트 FAB
- 모드 탭 [무끼/일기/코치] + 채팅 인터페이스 (대화는 state-only, 저장 X)
- 신규 `/api/myverse/mukki/intent` — 한국어 정규식 파서 + 캘린더 자동 생성

### SNS 포스팅 시스템
- DB 마이그레이션: `myverse_daily_moments`에 `body TEXT` + `media_type='text'` + `media_url` nullable
- 신규 `SnsPostComposer.tsx` — 자유 글/사진/영상 멀티 + 피드 공개 토글
- `<ShareButton>` Web Share API + clipboard fallback
- 메타(장소·시간·함께·카테고리) 입력 시 places/routines 미러 INSERT

### 카드 분리 + 흔적 통합
- DailyView 3 카드 분리: `TodaySceneCard` + `DailyPlacesCard` + `DailyRoutinesCard`
- 신규 `/api/myverse/traces` — moments + places + routines UNION

### 레이아웃 fixed 전환
- TopNav `fixed top-0 z-40` / SideNav `fixed top-12 left-0 bottom-0 z-30` / MonthBar `fixed top-12 right-0 bottom-0 z-30`
- main `pt-12 md:ml-52 md:mr-10`

### UX 개선
- 코넬 제목 Enter → 첫 단서 자동 포커스
- "단서·키워드" → "제목, 단서, 키워드", "한 줄" → "요약"
- 사이드바 footer `mt-auto` — 부동 현상 수정
- 오늘의 한 장면 중복 헤더 제거 (compact prop)
- 텍스트 카드 배지 충돌 해소 — POST 좌상, 🌐 좌하, 액션 우상
- 텍스트 카드 가독성 강화 (font-medium, neutral-50, pt-8)

### 용어 정리
- "내 Verse" 폐기 → "내 페이지" / "피드에 공개하기"

### 템플릿 그리드 반응형
- aspect-square 제거, grid-cols-1 sm:grid-cols-2, max-w-3xl/2xl

### 변경 파일
- 신규: `features/myverse/app/MukkiFab.tsx` · `features/myverse/planner/SnsPostComposer.tsx` · `app/api/myverse/mukki/intent/route.ts` · `app/api/myverse/traces/route.ts` · `sql/myverse-moments-text-posts.sql`
- 수정: `features/myverse/app/AppSideNav.tsx` · `features/myverse/app/TracesTimelineView.tsx` · `features/myverse/planner/AppTopNav.tsx` · `features/myverse/planner/AppMonthBar.tsx` · `features/myverse/planner/DailyView.tsx` · `features/myverse/planner/DailyMoments.tsx` · `features/myverse/planner/template-grids/{_shared,quadrants,empathy}.tsx` · `app/(Myverse)/myverse/app/layout.tsx` · `app/(Myverse)/myverse/app/{daily,weekly,monthly,yearly}/page.tsx` · `app/api/myverse/moments/route.ts`

### DB 마이그레이션
- `sql/myverse-moments-text-posts.sql` — Prod 적용 완료 (HTTP 201)

---

## 2026-05-11 — 세션 124 · Myverse IA 재구성 + 명함 + 노트/캔버스 미리보기 + 캔버스 저장 버그

### 장소
집

### IA 재구성 (INSIDE/OUTSIDE)
- 5 Lane → INSIDE(ENGINE/PERSONAL/BLACKBOX/MUKKI) + OUTSIDE(피드/프로필/명함)
- `/today` → `/daily` 통합 — 메뉴 라벨 "오늘", 라우트 `/daily` 메인 (DailyView 풍부한 대시보드)
- 4 시간 줌 페이지(daily/weekly/monthly/yearly) 우측 상단 [일간|주간|월간|연간] ViewToggle 공통 노출

### 핸들 URL 재구조
- `/myverse/v/[handle]` → `/myverse/[handle]` (이미 존재한 LinkedIn-style page 재활용)
- `[handle]/layout.tsx` + `HandleSubNav` — [공개 흔적] [프로필] [명함] sticky 서브탭
- `[handle]/profile`·`[handle]/card` 신설 / 레거시 `/v/[handle]/*` ClientRedirect
- middleware `/@handle` rewrite 작동

### 디지털 명함 SSOT
- 신규 `components/DigitalCard.tsx` — 공유/vCard/링크/QR/이미지 5 액션
- `qrcode` (client) + vCard 3.0 + html-to-image PNG
- 사용처: myverse/app/card · wio/app/my/card · myverse/[handle]/card
- `MyProfileCard` light/dark theme prop 추가 (21 브랜드 호환)

### 노트 4종 미리보기 통일
- `h-48 cursor-pointer + Maximize2 hover overlay` 패턴
- 캔버스: `<CanvasStudio embed>` → 신규 `CanvasPreview.tsx` (썸네일/SVG 직접, 툴바 없음)
- 템플릿: 인라인 인터랙티브 → `pointer-events-none` 미리보기 + 클릭 모달
- 코넬: max-h-64 → h-48 + hover overlay

### 버그 수정
- **캔버스 저장 유실**: PpCanvas unmount cleanup의 clearTimeout이 1.5s 디바운스 저장 취소 → cleanup에서 즉시 flush 후 destroy
- **모달 템플릿 입력 안됨**: localStorage만 갱신하고 state 미갱신 → `TemplateGridEditor` 신규 컴포넌트로 분리, useState로 즉시 재렌더
- **사이드바 헤더에 가려짐**: AppSideNav `h-screen sticky top-0` → `h-[calc(100vh-3rem)] sticky top-12`

### 템플릿 그리드 Instagram 비례
- `aspect-square` 제거, `grid-cols-1 sm:grid-cols-2`, `max-w-3xl/2xl mx-auto`
- Y축 컬럼 모바일 hidden, sm+ 노출
- 적용: `_shared.tsx` · `quadrants.tsx`(전 7종) · `empathy.tsx`(Ikigai/메타)

### 코넬 노트 UX
- 제목 Enter → 첫 단서 자동 포커스 (`data-cornell-cue="first"`)
- "단서 · 키워드" → "제목, 단서, 키워드"
- "이 노트의 핵심 한 줄" → "이 노트의 핵심 요약"

### PP 잔재 제거
- `PpCanvas.tsx` → `CanvasEditor.tsx` (git mv)
- `PpCanvasToolbar.tsx` → `CanvasEditorToolbar.tsx`
- 컴포넌트·Props·주석 갱신, DB `data.ppcanvas` 키만 레거시 호환 유지

### 변경 파일
- 신규: `app/(Myverse)/myverse/[handle]/{layout,profile/page,card/page}.tsx` · `app/(Myverse)/myverse/app/card/page.tsx` · `app/(WIO)/wio/app/my/card/page.tsx` · `components/DigitalCard.tsx` · `features/myverse/app/{AppSideNav,MyverseProfileView,ReceivedCardView}.tsx` · `features/myverse/handle/HandleSubNav.tsx` · `features/myverse/planner/CanvasPreview.tsx`
- rename: `PpCanvas.tsx` → `CanvasEditor.tsx`, `PpCanvasToolbar.tsx` → `CanvasEditorToolbar.tsx`
- 수정: `app/(Myverse)/myverse/app/{daily,weekly,monthly,yearly,today,layout,page,index/page,onboarding/page,ask,coach,diary,...}/page.tsx` · `app/(Myverse)/myverse/page.tsx` · `app/(Myverse)/myverse/v/[handle]/{page,card/page}.tsx` · `app/(WIO)/wio/app/my/card/page.tsx` · `features/myverse/{MyverseAppHeader,planner/{AppTopNav,CommandPalette,KeyboardShortcuts,MobileBottomNav,ProjectTasksTab,SearchView,ViewToggle,DailyView,template-grids/_shared.tsx,template-grids/quadrants.tsx,template-grids/empathy.tsx,CanvasEditor,CanvasEditorToolbar,CanvasStudio}}.tsx` · `lib/myverse/domains.ts` · `lib/canvas-engine/index.ts` · `app/api/myverse/v/[handle]/route.ts`

---

## 2026-05-10 — 세션 123 · Myverse 사이트↔앱 통합 + Personal OS 정렬 + LinkedIn 벤치마킹

### 장소
집

### 핵심 결정사항
- **사이트↔앱 통합**: middleware 기반 깔끔 URL — `myverse.kr/today`처럼 prefix 없는 URL을 사용자에게 노출
- **포지셔닝**: "My Universe" 폐기 → **Myverse · Personal OS · 나를 운영하는 OS** 단일화
- **로그인 정책**: 인증 시 `myverse.kr/` → `/today` 자동 302 (LinkedIn 패턴)
- **WORK 드롭다운**: Myverse 본진에선 숨김 — `hideWorkspaces` opt-in (28개 브랜드 영향 없음)
- **마케팅 5p 허구성 정비**: 제공/베타/Phase 2 라벨 SSOT — 미구현 기능을 단정형으로 표현 안 함
- **Pricing ↔ Roadmap 정렬**: Pro = "Phase 2 출시 예정" 명시, "Pro 출시 알림 받기" CTA로 정직화
- **`/about` 재작성**: Planner's 시절 컨텐츠 폐기 → Myverse 정체성 + 3원칙 OS톤
- **노션 친화 패턴 5건**: Cmd+K(검증) · `/` 캡처 · Traces 갤러리·리스트 토글 · @handle LinkedIn hero · Privacy 인디케이터

### 변경 파일

**Phase 1 — route group 캐논컬화** (78 파일 git rename)
- `app/(MyVerse)/` → `app/(Myverse)/` + 9개 문서 경로 갱신

**Phase 2 — middleware 통합 라우팅**
- `middleware.ts` — `MYVERSE_APP_ROUTES` SSOT, `/app/X` → `/X` 308 redirect, 인증 시 `/` → `/today` 302

**Phase 3 — 헤더 디스패처**
- `features/myverse/MyVerseHeader.tsx` — 비인증 시만 CTA + hideWorkspaces
- `components/UniverseUtilityBar.tsx` — `hideWorkspaces` prop 신설

**Phase 5 — Pricing + About**
- `app/(Myverse)/myverse/pricing/page.tsx` — Free(현재)/Pro(Phase 2) 2티어 + Status 라벨
- `app/(Myverse)/myverse/about/page.tsx` — Personal OS 3원칙으로 재작성

**버그 수정**
- `app/(Myverse)/layout.tsx` — `overflow-x-hidden` (모바일 헤더 햄버거 viewport 밖으로 밀리던 이슈)

**Personal OS 메시지 통일**
- `lib/site-config.ts` — name/title/description/keywords
- `features/myverse/MyVerseHeader.tsx` 서브타이틀, `MyVerseFooter.tsx` tagline
- `app/(Myverse)/myverse/page.tsx` — hero h1 "나를 운영하는 / Personal OS" + 3곳 카피

**마케팅 5p 허구성 정비**
- service/technology/philosophy/roadmap/team — 미구현 단정형 → 베타/예정/비전 라벨

**LinkedIn 벤치마킹 (5 패턴)**
- `features/myverse/planner/KeyboardShortcuts.tsx` — `/` 키 → `/traces?compose=1`
- `features/myverse/app/TracesTimelineView.tsx` — view 토글 + `MomentRow` + privacy 인디케이터
- `app/(Myverse)/myverse/[handle]/page.tsx` — LinkedIn hero (커버·아바타·stats·share)
- `features/myverse/handle/ShareButton.tsx` — 신규 (Web Share API + clipboard)

### 보류
- 124 파일 링크 일괄 치환 (localhost 위험으로 middleware redirect로 충분)
- About philosophy+team 통합 (콘텐츠 디자인 별도)
- Calendar/Map view (Phase 2)

---

## 2026-05-09 — 세션 122 · Myverse Stitch 디자인 1차

### 장소
집

### 핵심 결정사항
- **인디고 #6366F1 유지** (Stitch steel blue 채택 안 함) — 브랜드 일관성 우선
- **폰트 도입 확정**: Hanken Grotesk(헤드라인) + Inter(본문) + Material Symbols Outlined(아이콘)
- **Today를 대시보드로** — 별도 dashboard 페이지 만들지 않고 today에 brief/오늘의 흔적/타임라인 통합
- **LaneHeader SSOT** — 25+ 페이지에 헤더 패턴 복제하지 않고 공용 컴포넌트 1개로 흡수
- **/traces 타임라인**: 풀 vertical timeline은 그리드 밀도 손상 → 월별 섹션 마커로 절충

### 변경 파일
- `features/myverse/app/TodayDashboard.tsx` — 신규 (Stitch Bento 대시보드)
- `app/(Myverse)/myverse/app/today/page.tsx` — 서버 컴포넌트화 + members.name 전달
- `app/(Myverse)/myverse/app/coach/page.tsx` — Bento 재디자인 (Briefing/Weekly Balance/Capsules)
- `app/(Myverse)/myverse/app/layout.tsx` — Google Fonts preconnect + 3종 link
- `features/myverse/app/LaneHeader.tsx` — 신규 (indigo label + Hanken h1 + accent + backLink slot)
- `features/myverse/planner/MobileBottomNav.tsx` · `features/myverse/app/MobileBottomNav.tsx` — Lucide → Material Symbols
- `features/myverse/app/TracesTimelineView.tsx` — 헤더 LaneHeader + 월별 섹션 vertical line + 원형 마커
- `features/myverse/app/DMView.tsx` — 좌측 헤더 chat 심볼 + Hanken Grotesk
- `features/myverse/planner/SettingsLayout.tsx` — LaneHeader 적용
- `app/(Myverse)/myverse/app/{feed,ask,tasks}/page.tsx` — 헤더 LaneHeader 정렬
- `app/(Myverse)/myverse/app/{body,study,lifestyle,schedule,travel,move,relation}/page.tsx` — LaneHeader + accent + DomainBackLink
- `features/myverse/planner/WorkView.tsx` — LaneHeader 통합

### 커밋
- `6edd9dee` /today 대시보드 리뉴얼
- `c047f687` /coach 재디자인
- `4c4bc3e0` /traces 헤더
- `8b0bf4c5` /feed /ask /tasks 헤더
- `f6a885ae` LaneHeader 공용 컴포넌트
- `33f42f73` /settings 헤더
- `f369c9e1` 9영역 LaneHeader
- `a46cb855` 모바일 bottom nav Material Symbols
- `65b81a9f` /dm 헤더

### 보류
- 카드 라운드/그림자 토큰 통일 (영향 범위 큼)
- Hover 톤 일관화 (분산)
- 타임라인 alternating 좌우 (밀도 손상)

---

## 2026-05-09 — 세션 120 · Myverse IA 마무리 (모바일 햄버거 + 양방향 회유)

### 장소
집

### 핵심 결정사항
- 도구 lane은 드롭다운이 아니라 **서브메뉴**(LaneSubNav) — AI/연결과 동일 패턴
- 모바일 햄버거에서 활성 lane 아래에 서브탭 들여쓰기 펼침 → 모바일에서도 도구 6종 즉시 접근
- 9영역 → traces 회유: `DomainBackLink` 표준 컴포넌트 신설, 8개 영역 페이지 헤더에 적용
- ask vs coach 카피 차별화: "묻는 즉시 답" vs "먼저 보내는 브리핑"

### 변경 파일
- `features/myverse/planner/AppTopNav.tsx` — 도구 일반 탭 복원 + 모바일 서브탭 펼침
- `features/myverse/app/LaneSubNav.tsx` — `WORK_LANE_TABS` export 추가
- `features/myverse/app/DomainBackLink.tsx` — 신규 (traces 역방향 CTA)
- `features/myverse/app/AppTopNav.tsx` — 삭제 (중복 파일)
- `app/(Myverse)/myverse/app/{projects,canvas,tasks,templates,contacts,personal}/page.tsx` — `<LaneSubNav tabs={WORK_LANE_TABS}>` 임베드
- `app/(Myverse)/myverse/app/{body,study,lifestyle,schedule,travel,move,relation}/page.tsx` — `<DomainBackLink>` 헤더 적용
- `features/myverse/planner/WorkView.tsx` — `<DomainBackLink domain="work">` 추가
- `features/myverse/app/AskMyverseView.tsx` — ask 카피 보강
- `app/(Myverse)/myverse/app/coach/page.tsx` — coach 부제 추가
- `app/(Myverse)/CLAUDE.md` — IA SSOT 섹션 신설 + 금지 4항목 + 세션 120 상태

### 커밋
- `dcaea35d` 도구 lane 서브메뉴 패턴 + IA 5-Lane 마무리
- `8521859b` 모바일 햄버거에 lane 서브탭 펼침 노출
- `c8a1815b` 9영역 → traces 역방향 CTA (DomainBackLink)
- `a2e7b91f` ask vs coach 차별화 부제
- `f6013bf0` CLAUDE.md 5-Lane SSOT + 세션 120 반영

### 다음 할 일
- **GTM `TenOne_Tag` 트리거 교체** (사용자 직접): `All Pages` → `CE - page_view`로 변경 후 컨테이너 게시. 절차는 CLAUDE.md 부록 G.1.
- **데스크톱 1406px 우측 영역 미렌더** 환경 이슈: 실서버 배포 후 재확인 (Bell·LayoutGrid·feed 링크 표시 여부)

---

## 2026-05-08 — 세션 118 · 올가미 선택·리사이즈 실시간·PP흔적·보안점검

### 장소
집

### 핵심 결정사항
- 올가미 선택: ray casting `pointInPolygon()`, SVG `<polyline>` 시각화
- resize 실시간: SVG DOM 직접 `translate/scale/translate` 복합 transform (React 리렌더 없이)
- 보안: `isomorphic-dompurify` 도입, `safeRedirect()` Open Redirect 방어, 보안 헤더 전역 설정

### 변경 파일
- `lib/canvas-engine/types.ts` — ToolMode lasso 추가
- `features/myverse/planner/PpCanvasToolbar.tsx` — Lasso 버튼, white border 비교 오류 수정
- `features/myverse/planner/PpCanvas.tsx` — 올가미 선택, resize 실시간 SVG transform
- `features/myverse/app/CommunityView.tsx` — PP → Myverse 사용자 텍스트
- `features/myverse/app/DailyView.tsx` — 전체화면 + 통일 헤더 + 취소/저장
- `features/myverse/app/ProjectNotesTab.tsx` — 전체화면 + 통일 헤더 + 취소/저장
- `features/myverse/planner/CanvasStudio.tsx` — pp-canvas 클래스 제거
- `app/globals.css` — Excalidraw 죽은 CSS 블록 삭제
- `app/api/admin/create-staff/route.ts` — verifySuperAdmin() 추가 (CRITICAL 보안)
- `app/api/subscription/access/route.ts` — 세션 인증 + 자기 검증 (CRITICAL 보안)
- `app/(Badak)/badak/stars/[slug]/page.tsx` — DOMPurify XSS 수정
- `app/(FWN)/fwn/article/[slug]/page.tsx` — DOMPurify XSS 수정
- `app/(TenOne)/newsroom/[id]/page.tsx` — DOMPurify XSS 수정
- `app/(TenOne)/works/[id]/page.tsx` — DOMPurify XSS 수정
- `components/board/PostDetail.tsx` — DOMPurify XSS 수정
- `components/board/PostAccordion.tsx` — DOMPurify XSS 수정
- `app/intra/ums/sites/boards/page.tsx` — DOMPurify XSS 수정
- `app/(Mindle)/mindle/trends/[id]/page.tsx` — DOMPurify XSS 수정
- `app/(Badak)/badak/groups/[id]/page.tsx` — DOMPurify XSS 수정
- `app/login/page.tsx` — safeRedirect() Open Redirect 방어
- `next.config.ts` — 보안 헤더 전역 (X-Frame-Options 등)
- `package.json` / `package-lock.json` — isomorphic-dompurify 의존성

### 이월
- `scripts/migrate-moments-bucket.js` 실행 (SUPABASE_SERVICE_ROLE_KEY 필요)
- Toss 가맹점 승인 + Vercel 환경변수 (사용자 직접)

---

## 2026-05-08 — 세션 117 · Canvas Engine Phase 2 완료 + vCard 정리

### 장소
집

### 핵심 결정사항
- Canvas Engine image 지원: 파일 피커 삽입 + Ctrl+V 붙여넣기
- PNG/SVG 내보내기: SVG 문자열 생성 → Blob URL → offscreen canvas PNG 방식
- 레이어 정렬: zIndex 대신 배열 순서 기반 (bringToFront/sendToBack/bringForward/sendBackward)
- 텍스트 서식: TextElement에 bold/italic 추가, 선택 시 플로팅 서식 바

### 변경 파일
- `features/myverse/planner/ContactsView.tsx` — vCard PRODID Myverse Contacts
- `lib/canvas-engine/export.ts` — 신규: SVG/PNG 내보내기 유틸리티
- `lib/canvas-engine/index.ts` — export 재export 추가
- `lib/canvas-engine/types.ts` — TextElement bold/italic 필드
- `lib/canvas-engine/engine.ts` — bringToFront/sendToBack/bringForward/sendBackward
- `features/myverse/planner/PpCanvas.tsx` — image 렌더·삽입·레이어 단축키·텍스트 서식 바
- `features/myverse/planner/PpCanvasToolbar.tsx` — ImagePlus + Download(PNG/SVG) 버튼

### 이월
- `scripts/migrate-moments-bucket.js` 실행 (SUPABASE_SERVICE_ROLE_KEY 필요)
- Toss 가맹점 승인 + Vercel 환경변수 (사용자 직접)

---

## 2026-05-08 — 세션 116 · Planners → Myverse 인프라 마이그레이션 Phase 4

### 장소
집

### 핵심 결정사항
- Planner's 브랜드(planners.tenone.biz)는 독립 브랜드로 유지 — Myverse 내부의 "Planner's Planner" 앱 흔적만 제거
- Storage 실 데이터 이전(4개 파일)은 service role key 필요 — 스크립트 생성 후 이월
- DB 마커(handwriting 2 / tpl 5 / canvas 1) 마이그레이션 즉시 실행 완료
- HW_MARKER 쓰기: myverse:handwriting, 읽기: 양쪽 호환 (LEGACY_HW_MARKER)

### 변경 파일
- **Storage**: `app/api/myverse/moments/*`, `import/apple-photos` — `planners-moments` → `myverse-moments`
- **PWA**: `public/myverse-{sw.js,manifest.json,icon-*.png}` 신규, `features/myverse/app/PwaRegister.tsx` 신규, `planner/PwaRegister.tsx` 삭제
- **마커**: `lib/myverse/canvas-engine/adapters/handnote-storage.ts`, `features/myverse/planner/ProjectNotesTab.tsx`, `features/myverse/app/ProjectNotesTab.tsx`, `app/api/myverse/canvases/route.ts`
- **변수·import**: `layout.tsx`, `personal/page.tsx`, `time/page.tsx`, `lib/myverse/briefing.ts`
- **localStorage·CustomEvent**: `HandNote.tsx`, `ContactsView.tsx`, `settings/page.tsx`, `SettingsExport.tsx` (x2)
- **도메인·링크**: `google-calendar.ts`, `notifications.ts`, `google/callback/route.ts`, `planner-search/route.ts`
- **UI copy**: "PP AI" → "Myverse"/"Myverse AI" — `AboutPage.tsx`, `Header.tsx`, `HomePage.tsx`, `PurchaseView.tsx`, `InstallButton.tsx` (각 app/ + planner/)
- **스크립트**: `scripts/migrate-moments-bucket.js`, `scripts/migrate-note-markers.js` 신규

### 이월
- `scripts/migrate-moments-bucket.js` 실행 (SUPABASE_SERVICE_ROLE_KEY 필요)
- vCard PRODID `Planners Contacts` (ContactsView.tsx:259)
- Canvas Engine 본 작업 (Image element, export 등)

---

## 2026-05-08 — 세션 115 · Myverse 코드베이스 Planners 흔적 일괄 제거 (Phase 3)

### 장소
집

### 핵심 결정사항
- "Planner's"는 별도 브랜드 — Myverse 코드 안에 잔존하면 안 됨 (이전 세션 결정 강화)
- 스코프 한정: `features/myverse/`, `app/(Myverse)/`, `app/api/myverse/`, `lib/myverse/` 만. `intra/planners`·`MyverseRole.'planner'` 직무명·`lib/analytics.ts` 공용 함수는 보존
- DB·Storage·SW·HTML 마커 등 인프라 마이그레이션이 필요한 항목은 의도적으로 이월 (코드만 바꾸면 깨짐)

### 변경 파일
- **JS 함수/타입**: `lib/myverse/analytics.ts`, `features/myverse/app/MyverseThemeProvider.tsx` + 호출자 7개 (SettingsTheme, SettingsStylePresets, BetaFeedbackButton, CopyToAiButton, WelcomeTracker, WeeklyView, onboarding)
- **CSS·DOM**: `app/globals.css` (변수·클래스), 호출자 9개 (layout, ProjectNotesTab, DailyView, MonthlyView, YearlyView, MobileBottomNav, SettingsLivePreview, DailyPlacesCard, DailyRoutinesCard)
- **URL·UI copy**: AboutPage, MyverseHomePage, ProgramsPage, PurchaseView, CommunityView, CanvasToolPage, MyverseHeader, SettingsExport
- **API·lib**: payment/success, coach, chat, admin/activate, ai/parse-input, ai/chat, daily/ai-summary, feedback, integrations/slack/sync, briefing, calendar-rules, client, google-calendar, notifications, slack

### 위험 관리
- 라인 엔딩(LF/CRLF) 노이즈 다수 감지 — 작업 외 파일은 staging에서 제외 (실제 변경 파일만 add)
- `MyverseRole`의 `planner` 문자열 값(직무 "기획자")은 의도적으로 보존
- canvas 마커는 `(myverse|planners)` 양립 패턴 유지 — 옛 컨텐츠 호환

### 이월 (다음 세션)
WORK_STATUS.md "다음 할 일" 섹션 참조 — 우선순위 13개 (DB/Storage 3개, 변수·키 2개, 도메인 2개, UI 1개, Canvas Engine 4개)

---

## 2026-05-07 — 세션 114 · 9영역 SSOT 통합 + 사이드바 복원 + 로그인 리다이렉트 버그 수정

### 장소
집

### 핵심 결정사항
- 9영역 통합 옵션 A 선택: `MyverseSidebar` 복원 (옵션 B·C 보류)
- `getAuthState()` anon 우선 조회로 전환 — admin 클라이언트 실패 시 온보딩 루프 방지
- 로그인 리다이렉트 버그 3곳 수정: useEffect·handleSubmit의 `canIntra?'/intra'` 제거, social login `auth_redirect` 쿠키 `/myverse/login` 인식 추가

### 변경 파일
- `lib/myverse/domains.ts` — `DomainMeta.app_href` 추가
- `features/myverse/MyverseSidebar.tsx` — SSOT 기반 완전 재작성
- `features/myverse/app/AppTopNav.tsx` — LayoutGrid 드롭다운 SSOT 연결
- `app/(Myverse)/myverse/app/layout.tsx` — 사이드바 복원 + `getAuthState` 강화
- `app/(Myverse)/myverse/app/onboarding/page.tsx` — 첫 페이지 카피 수정
- `app/login/page.tsx` — 강제 `/intra` 리다이렉트 2곳 제거
- `lib/auth-context.tsx` — social login `isAuthPage` endsWith 추가

---

## 2026-05-07 — 세션 113 · MyVerseHeader 모바일 버튼 수정 + 9영역 통합 연구

### 장소
집

### 핵심 결정사항
- `MyVerseHeader` 모바일 햄버거 버튼: `overflow-hidden` + 네거티브 마진이 클리핑 원인 → 제거 후 `flex md:hidden` + `shrink-0` 명시
- 9영역 통합 연구: 기존 개발 현황(MyverseSidebar·AppTopNav 드롭다운·도메인 page.tsx) 파악 완료 — 다음 세션에서 옵션 결정

### 변경 파일
- `features/myverse/MyVerseHeader.tsx` — 모바일 햄버거 버튼 표시 수정
- `middleware.ts` — myverse.kr/login → /myverse/login 리라이트 (세션 112 잔여)
- `features/myverse/app/PlannersHeader.tsx` — loginHref → /myverse/login 직접 URL (세션 112 잔여)
- `features/myverse/app/CommunityView.tsx` — loginHref → myverse 전용 href (세션 112 잔여)
- `features/myverse/app/TimeTrackerView.tsx` — 타임트래커 대규모 리팩토링 (아이콘·상태 교체)

---

## 2026-05-06 — 세션 112 · Myverse 로그인 UI 통일 + 사이트 토글 수정 + 도메인 현실 반영

### 장소
집

### 핵심 결정사항
- `/myverse/login` 독립 페이지 생성 — tenone 로그인 전체 페이지 대신 마이버스 전용 `LoginModal` 팝업 방식
- `ums_sites.is_open` + `domains` 컬럼 마이그레이션 + admin API 라우트로 RLS 우회 — 토글 버그 2종 동시 해결
- `domain-registry.ts` SSOT 기반 도메인 목록 표시 — DB `domains` 컬럼 대신 레지스트리 직접 조회

### 변경 파일
- `app/(Myverse)/myverse/login/page.tsx` (신규) — 마이버스 전용 로그인 게이트 (LoginModal indigo)
- `app/(Myverse)/myverse/app/layout.tsx` — no_session → `/myverse/login?redirect=/myverse/app`
- `app/(Myverse)/myverse/page.tsx` — 랜딩 CTA 인증 인식 (로그인 시 "앱으로 이동")
- `app/api/sites/toggle/route.ts` (신규) — admin 클라이언트 기반 is_open 토글 API
- `lib/supabase/site-configs.ts` — toggleSiteOpen() → fetch('/api/sites/toggle')
- `lib/domain-registry.ts` — getDomainsBySiteId() 추가 (SiteDomainEntry 인터페이스 포함)
- `app/intra/ums/sites/list/page.tsx` — 도메인 목록 getDomainsBySiteId() 호출로 교체

### DB 변경 (Supabase MCP)
- `ums_sites`: `is_open BOOLEAN NOT NULL DEFAULT true`, `domains JSONB NOT NULL DEFAULT '[]'` 추가
- `site_configs` VIEW 재생성 (두 컬럼 포함)

---

## 2026-05-06 — 세션 111 · Myverse 무한 깜빡임 종결 + 온보딩 URL 이전

### 장소
집

### 핵심 결정사항
- **무한 깜빡임의 진짜 원인 발견**: Supabase의 myverse_* 테이블 FK 제약 이름이 옛 `planners_*_member_id_fkey` 그대로 → REST hint resolver가 join 못 풀어 plannerUser=null → 온보딩 미완료 오판
- 옛 PWA 사용자가 SW를 자가 업그레이드할 수 있어야 — 정적 자산 경로(`/planners-sw.js`, `/planners-icon-*.png`)가 middleware의 `/planners` 308 redirect에 잡히면 안 됨
- 온보딩 URL을 앱 셸 하위(`/myverse/app/onboarding`)로 이전 — 향후 PWA 통합·풀 화면 대비

### DB 변경
- `myverse_*` 테이블의 stale 제약 125개 일괄 RENAME (`planners_*` → `myverse_*`)
- 영향: PK·FK·CHECK·UNIQUE 모두 포함 (FK만 끊겼던 게 아니라 정합성 차원에서 전부 정리)

### 변경 파일
- `middleware.ts` — x-pathname 헤더 주입 (server header()로 layout이 경로 식별), `/planners` 매칭을 정확 경로(`=== '/planners'` 또는 `startsWith('/planners/')`)로 좁힘, prefetch 무한 큐 차단 조건 정리
- `app/(Myverse)/myverse/app/layout.tsx` — getMemberWithPlanner → getAuthState 3-state(no_session/no_member/ok), members 조회 auth_id 우선·email fallback, x-pathname=/myverse/app/onboarding 우회, no_member case → /onboarding으로 분기 (기존엔 /login으로 보내서 무한 루프)
- `app/(Myverse)/myverse/app/onboarding/page.tsx` — `/myverse/onboarding/page.tsx`에서 이전, /login redirect 파라미터 갱신, 완료 후 /myverse/app/today로 직접 이동
- `components/ClientRedirect.tsx` — server redirect()의 Next.js 16 dev router prefetch 무한 큐 회피용 client redirect (`window.location.replace`)
- `app/(Myverse)/myverse/app/page.tsx` · `today/page.tsx` · `time/page.tsx` — server `redirect()` → `<ClientRedirect>` 변환
- `public/planners-sw.js` — v2: CACHE_NAME `pp-ai-v1` → `myverse-app-v2`, activate 시 옛 캐시 전부 삭제, fetch 핸들러는 `/myverse/*` 외 모든 경로 패스, prefetch 응답은 캐시하지 않음
- `features/myverse/app/PlannersChrome.tsx` · `QuickCapture.tsx` — 옛 `/myverse/onboarding` 경로 제거

### 커밋 (master)
- 85536fdf — fix: 누락된 MyVerse 페이지 24개 + lib/canvas-engine 추적 추가
- 0280afec — fix(myverse): 추가 server redirect 3건 → ClientRedirect 변환
- b47c5d98 — fix(myverse/pwa): SW v2 — 옛 /planners/* 캐시 강제 삭제 + prefetch 응답 캐싱 차단
- fde0ab3a — fix(middleware): /planners 매칭에서 정적 자산 제외
- 22aa83f7 — fix(myverse/app): 무한 깜빡임 종결 + 온보딩 URL을 /myverse/app 하위로

### 다음 작업 (사무실)
1. features/planners → features/myverse/app 폴더 완전 리네이밍 (78개 import 갱신, sed + tsc + build)
2. PWA 아이콘 인디고 M 로고 교체 (`public/planners-icon-192.png`/`512.png`)
3. Toss 가맹점 승인 + Vercel 환경변수 (`TOSS_CLIENT_KEY`·`TOSS_SECRET_KEY`)
4. /myverse/app/onboarding 화면 점검 (모바일 viewport, 4 step UI)
5. (낮은 우선순위) myverse.kr/login SSO 점프 UX 검토

---

## 2026-05-05 — 세션 110 · Daily Planner UI 7가지 개선 (Quick Actions 재편·설정 레이아웃 슬림화·단축키 사용자 선택)

### 장소
사무실

### 변경 파일
- `features/myverse/app/AppTopNav.tsx` — "일간" → "오늘" 탭 리네이밍
- `features/myverse/app/DailyView.tsx` — "기록하기" 삭제, 템플릿·캔버스·녹음 Quick Action Row 2로 이동, daily_note_shortcuts 조건부 렌더
- `features/myverse/app/settings/SettingsAi.tsx` — "일간 트래킹" → "일간 기록", `daily_note_shortcuts` 체크박스 설정 추가
- `app/(Planners)/planners/app/settings/page.tsx` — `initialNoteShortcuts` state, API 로드, SettingsAi 프롭 전달
- `features/myverse/app/SettingsLayout.tsx` — PC 좌측 사이드바(aside) 제거, pill nav 전 breakpoint 노출, xl+ 2컬럼 grid

### 결정사항
- `daily_note_shortcuts` 기본값: `["gratitude","emotion"]` — 기존 사용자는 기존 단축키 유지
- 설정 레이아웃은 pill nav 단일로 통일 (PC/모바일 동일) — 왼쪽 aside 제거로 main 영역 더 넓어짐

---

## 2026-05-04 — 세션 107 · Planner's Planner를 마이버스로 완전 흡수 (DB·API·라이브러리·라우트·브랜딩 통합)

### 장소
사무실

### 결정사항
- **PP → 마이버스 단일화**: PP가 마이버스 비전(개인 일상 관리·기록·성장)으로 수렴 중. 옵션 A(마이버스 단일화) 채택
- **9 영역 SSOT** 확립: BODY · 업무 · 공부 · 일상 · 일정 · 여행 · 이동 · 관계 + _people(횡단). 5축 메타데이터 (time · geo · people · content · context). 5 채집 행동 (사진 · 영상 · 위치 · 음성 · 글쓰기)
- **DB 명명 통일**: `planners_*` 29개 테이블 + 13개 함수 → `myverse_*` 일괄 RENAME. 인덱스·FK·RLS 자동 추적, 함수 본문은 늦은 바인딩이라 명시 재작성
- **URL 통일**: planners.tenone.biz 프리픽스 `/planners` → `/myverse`. `/planners/*`는 308 영구 리디렉트, `/api/planners/*`는 내부 rewrite로 외부 호출자(Toss·Google OAuth·Cron) 호환 유지
- **풀 화면 앱**: `/myverse/app/*` 진입 시 마이버스 마케팅 헤더/푸터 숨김. AppTopNav만 남는 PP-스타일 풀 화면. 4 Pillars 사이드바·MyverseAppHeader 모두 제거
- **인디고 브랜딩**: PlannersThemeProvider 기본 테마 `teal` → `myverse`(인디고 #6366F1). 하드코딩된 #0F766E를 CSS 오버라이드로 자동 인디고화
- **HandNote "그리기" 토글 제거**: 펜 선택 = 즉시 그리기 모드. 같은 펜 다시 클릭 = 해제. 도구 클릭 시 자동 활성화
- **`/myverse/app/daily` = PP 일간 뷰**, 9-domain 일상은 `/lifestyle`로 분리

### 추가
- `sql/myverse-rename-planners-to-myverse.sql` — 테이블·함수 일괄 RENAME + 함수 본문 재작성
- `app/(Myverse)/myverse/app/{today,weekly,monthly,yearly,tasks,index,settings,search,time,canvas/[id],contacts,templates,personal,projects,ai-briefing,help}/page.tsx` — PP 라우트 재-export
- `app/(Myverse)/myverse/{about,canvas,community,gpr,install,my,offline,onboarding,p,planner-tool,planning,portfolio,programs,purchase}/page.tsx` — PP 비-app 페이지 재-export
- `app/(Myverse)/myverse/app/lifestyle/page.tsx` — 9-domain 일상(daily key) 페이지 (충돌 회피)
- `features/myverse/MyVerseChrome.tsx` — 마케팅 헤더/푸터를 /app 경로에서 자동 숨김
- `app/api/myverse/*` 71개 라우트 (planners/* 이동, search → planner-search 리네이밍)
- `lib/myverse/*` 21개 모듈 (planners/* 병합)

### 수정
- `middleware.ts` — 0a번 `/api/planners/*` rewrite, 0b번 `/planners/*` 308 redirect
- `lib/domain-registry.ts` — planners.tenone.biz 프리픽스 갱신
- `app/(Myverse)/myverse/app/layout.tsx` — PP 핵심 chrome 흡수 (Theme·Pwa·Beta·Keyboard·AiBriefing·MobileBottom·Welcome·MonthBar), 마이버스 헤더/사이드바 제거
- `app/(Myverse)/layout.tsx` — MyVerseChrome 래퍼 사용
- `features/planners/AppTopNav.tsx` — 로고 Myverse<sup>App</sup>, 인디고 컬러, regex `/planners/app/canvas` → `/myverse/app/canvas`
- `features/planners/PlannersThemeProvider.tsx` — `myverse` 테마 추가, 기본값 `teal` → `myverse`
- `features/planners/HandNote.tsx` — 그리기 토글 제거, 펜 선택 시 자동 진입, 같은 펜 재클릭 시 해제
- `components/UniverseUtilityBar.tsx` — WORKSPACE_REGISTRY 정리 (옛 planners + 옛 myverse → 통합 myverse)
- `app/api/myverse/onboarding/route.ts` — affiliations에 'myverse' 자동 등록
- `public/planners-manifest.json` — Myverse 리브랜딩 (#6366F1, /myverse scope)
- 178개 파일 `planners_*` → `myverse_*` 코드 sed
- 53개 클라이언트 파일 `/api/planners/...` → `/api/myverse/...`
- features/planners 67개 파일 `/planners/...` URL → `/myverse/...`

### 삭제
- `app/(Myverse)/myverse/app/{ai,dream,log,plan,work}/page.tsx` — 옛 myverse_* 7탭 중 5개 (PP 라우트 흡수로 대체, work는 DomainPage('work')로 재생성)

### 다음 할 일
- features/planners → features/myverse/app 폴더 리네이밍 (78개 컴포넌트 import 갱신)
- PWA 아이콘 인디고 M 로고로 교체
- Toss 가맹점 승인 · Vercel 환경변수 설정 · Google OAuth 자격
- Notion `TASK` 템플릿 인사이트 흡수: "오늘 한 장 + 3버튼" 메인 홈, "초집중모드" 1급 기능, 분류에 한국형 태그(`감사3개`·`감정 일기`)
- 풀 화면 모드에서 4 Pillars + 9-domain 진입점 결정

---

## 2026-05-04 — 세션 106 · 거점 좌표 매칭 + 일간↔시간 양방향 미러링 + Meta 백업 임포트

### 장소
사무실

### 결정사항
- **활동 거점 좌표화**: SettingsBases에 lat/lng 등록 UI 추가 (Crosshair 버튼 = navigator.geolocation + Nominatim 역지오코딩 / 주소 blur 시 좌표 없으면 자동 정지오코딩). 좌표는 시간 트래킹 자동 위치 매칭에 사용
- **TimeTrackerView 자동 위치 우선순위**: 거점 반경 150m 내 매칭 → 거점 이름을 활동 라벨로 / 매칭 실패 시 기존 Nominatim 폴백
- **InlineForm 거점 칩**: 등록된 거점을 한 클릭으로 활동·주소 채움
- **일간 places ↔ 시간 routines 양방향 미러링**: 한쪽에 추가하면 서버 측에서 dedup 후 자동 INSERT (date+name+time 기준). UPDATE/PATCH는 미러 안 함 (편집은 한쪽만 — 의도된 분리)
- **Meta GDPR 백업 임포트**: Instagram/Facebook ZIP을 압축 해제 없이 그대로 업로드 → JSZip 파싱 → posts/stories JSON 인식 → 미디어를 planners-moments 버킷에 업로드 → planners_daily_moments INSERT (촬영 일자·캡션·Mojibake 한글 복원). dedup으로 재임포트 안전

### 추가
- `app/api/planners/moments/import-meta/route.ts` — Meta GDPR ZIP 임포트 (200MB / 5분 / dedup)
- jszip 의존성

### 수정
- `features/planners/settings/SettingsBases.tsx` — Crosshair 버튼·좌표 표시·자동 지오코딩
- `features/planners/TimeTrackerView.tsx` — bases 로드·Haversine·nearestBase·InlineForm 거점 칩
- `features/planners/DailyMoments.tsx` — "백업" 버튼 + ZIP input + 임포트 결과 토스트
- `features/planners/DailyView.tsx` — "오늘의 한 장면"을 한 줄 카드 우측에서 노트 리스트 아래로 이동 (단독 섹션)
- `app/api/planners/places/route.ts` — POST 후 routines 미러
- `app/api/planners/routines/route.ts` — POST 후 places 미러

### 다음 할 일
- TimeTrackerView 컨텍스트 스트립 placeName도 거점 매칭 우선 적용 (현재는 Nominatim 도시+동만)
- DailyMoments에서 location 필드 보강 (Meta 백업 EXIF 위치 추출)
- Daily places 추가 모달에서 거점 칩 빠른 선택 (TimeTracker처럼)

---

## 2026-05-03 — 세션 105 · PP Canvas Engine 골격 + Toolbar 고도화 + 이력서/활동거점

### 장소
사무실

### 결정사항
- HandNote와 CanvasStudio 통합용 **자체 캔버스 엔진** 구축 결정 (tldraw/Excalidraw 의존 점진 제거 목표). 6단계 ~10주 로드맵 → `docs/PP_Canvas_Engine_Plan.md`
- HandNote 본체 재작성은 다세션 작업으로 분리. 이번 세션은 데이터 레이어(__HW__ 마커 헬퍼)만 어댑터로 분리해 안전 진입점 확보
- CanvasStudio 풀스크린 z-index 50 → 9100 (planner 모바일 nav z-8900 위로)
- 저장 상태 표시는 텍스트 제거, 아이콘만(시각은 hover)
- Canvas 툴바 mobile 반응형: md 미만은 핵심 7개만 인라인, 나머지는 "더보기" 팝오버
- 이력서/활동거점은 신규 JSONB 컬럼 (`planners_identities.resume`, `planners_users.activity_bases`)으로 도입

### 추가
- `lib/planners/canvas-engine/` — 신규 모듈 (types/engine/history/render/layers/interaction/serialize/adapters)
- `docs/PP_Canvas_Engine_Plan.md` — 아키텍처 결정 문서
- `features/planners/settings/SettingsBases.tsx` — 활동 거점 입력 UI
- `sql/planners-resume-bases.sql` — 신규 컬럼 마이그레이션 (적용 완료)
- `lib/planners/types.ts` — `ResumeData` · `ActivityBase` 타입

### 변경
- `features/planners/CanvasToolbar.tsx` — 24색 팔레트 팝오버 / 펜 굵기 슬라이더 / 이미지 / 레이어 순서 / 모바일 더보기 메뉴
- `features/planners/CanvasStudio.tsx` — z-9100, 저장 아이콘만, selectedCount 추적
- `features/planners/IdentityView.tsx` — sticky 서브 네비 + 이력서 섹션 6 블록
- `app/(Planners)/planners/app/settings/page.tsx` — SettingsBases 통합
- `features/planners/DailyView.tsx` — 코넬 노트 "페이지 삭제" ConfirmSheet 추가
- `features/planners/HandNote.tsx` — 직렬화 헬퍼 6종을 canvas-engine adapter로 이동(re-export 유지, 외부 호환)
- `app/globals.css` — Excalidraw 협업 아바타·라이브러리 등 모바일 UI 추가 숨김 / Next.js dev portal 숨김

### 커밋
- 2c66bf3a · feat(planners): Canvas Engine — render/interaction/serialize 추가
- a47c136f · feat(planners): Canvas 툴바 — 24색 + 펜 굵기
- 34b59bbc · feat(planners): Canvas — 이미지·레이어·모바일 반응형
- 02a740d8 · fix(planners): Canvas 저장 상태 — 아이콘만
- 2e065a67 · fix(planners): Canvas — Next.js dev indicator(N) 숨김
- 41d799c4 · feat(planners): 이력서 + 활동 거점 + 노트 페이지 삭제 확인
- b4eda1c8 · refactor(planners): HandNote 직렬화 헬퍼 → canvas-engine/adapters

### 다음 세션 진입점
- **Phase 1.9 HandNote 본체 재작성** — CanvasEngine 기반 전면 교체. 어댑터(handnote.ts·handnote-storage.ts) 이미 준비됨

---

## 2026-04-30 — 세션 104 · HandNote 이미지·뷰박스·코넬 UX 개선

### 장소
사무실

### 핵심
HandNote SVG viewBox 비율 보존, 이미지 삽입/선택/이동, 코넬 엔터→커서 이동, 배경색 통일.

**변경 파일**
- `features/planners/HandNote.tsx` — viewBox + getSVGPoint 좌표 변환, HandImage 타입, 이미지 삽입(파일/붙이기)/선택/이동/삭제, renderToCanvas 스케일 보정, SVG pointer-events 텍스트↔드로우 토글
- `features/planners/DailyView.tsx` — 코넬 엔터 시 신규 행 포커스(cornellFocusPendingId callback ref), Summary·Page controls 배경색 본문과 통일

### 주요 결정
- 캐노니컬 폭(`canonW` = 첫 드로우 시 고정) + `viewBox` → 다른 기기에서도 스트로크 비율 유지
- `getSVGPoint(svg, clientX, clientY)` → `getScreenCTM().inverse()` 로 viewBox 좌표 자동 변환
- 이미지 좌표 = viewBox 논리 좌표계 (스트로크와 동일 공간)
- 이미지 "자리 차지": 이미지 뒤에 흰 `<rect>` 렌더 → 코넬 텍스트 커버
- 텍스트 모드 SVG `pointer-events: none` → 브라우저가 textarea 직접 처리 (cursor 정확)
- 드로우 모드 SVG `pointer-events: all` → SVG가 모든 이벤트 캡처

---

## 2026-04-30 — 세션 103 · Planners Settings 모듈 분리

### 장소
사무실

### 핵심
Settings page.tsx (1,799줄) → 슬림 쉘(367줄) + 5개 feature 모듈 리팩토링 완료.

**신규 파일 (5개)**
- `features/planners/settings/SettingsTheme.tsx`
- `features/planners/settings/SettingsAi.tsx`
- `features/planners/settings/SettingsNotifications.tsx`
- `features/planners/settings/SettingsIntegrations.tsx`
- `features/planners/settings/SettingsExport.tsx`

**변경 파일**
- `app/(Planners)/planners/app/settings/page.tsx` — 1,799줄 → 367줄 슬림 쉘

### 주요 결정
- shell이 API fetch → initial* props 세팅 → loading guard → 자식 마운트 패턴
- 각 모듈 자체 도메인 state, `save(patch)` 콜백은 shell에서 1회 정의
- push/disconnect 등 비동기 UI 상태는 각 모듈에서 local state로 관리
- TypeScript 에러 0 (기존 파일 pre-existing 에러만 존재)

---

## 2026-04-29 — 세션 102 · Planners Settings 디자인 시스템 4단계

### 장소
사무실

### 핵심
Claude Design 핸드오프(`design_handoff_planners_settings/`) 기반 Settings 페이지를 4단계로 재구축.

**Stage 1+2** — IA 재편 + 모바일 프리셋 (`5b4f7581`)
- 4그룹 IA: 시작 / 스타일 / 기능 / 기술
- PC: 좌측 200px sticky 사이드바 nav (IntersectionObserver로 활성 자동 갱신)
- 모바일: 상단 sticky 가로 pill row
- 8개 스타일 프리셋 (5개 토큰 한 번 탭 적용): Mono Light · Cream Serif · Editorial · Slate Pro · Black Ink · Campus Mint · Campus Blush · Designer Mono
- 모바일은 프리셋이 메인 — 개별 컨트롤은 "고급 설정 ▼" 토글
- 앱 설치 섹션 시작 → 기술 그룹 이동
- 컬러 테마 14 → 18색 (Mustard · Orange · Emerald · Olive 추가)

**Stage 3** — 디자인 토큰 시스템 (`d06c7eb5`)
- `.pp-settings` 스코프 토큰 11종 (bg/surface/surface-alt/line/line-soft/line-strong/ink/ink-2/ink-3/ink-4/ink-on/accent) — 라이트와 다크 변형
- `pp-card` · `pp-eyebrow` 유틸 alias (점진 마이그레이션용)
- 기존 Tailwind 유틸(bg-white·bg-neutral-{50,100}·border-neutral-{100,200,300}·text-neutral-{300~900}) → 토큰 시멘틱 매핑
- 다른 페이지 영향 0 — 토큰 어휘는 후속 마이그레이션에 그대로 사용 가능

**Stage 4** — Live Preview 패널 (`36285661`)
- xl+(1280px) 우측 sticky 라이브 프리뷰 (400px)
- Daily / Project / AI Briefing 3개 탭
- 컬러·모서리·폰트·다크모드를 CSS 변수로 자동 갱신 — 별도 props 불필요
- 하단 토큰 stamp 라벨

**부수 작업**
- `0a7ed6bb` DailyView 우측 컬럼 단일 셀 래핑 (미니달력 위치 정렬)
- `c6c3a3b9` 상단 탭 템플릿 추가 (아이덴티티 다음)
- `865c9713` AI 브리핑 네비 전체 제거 + 인덱스 사이드바 정리
- `ec8adc08` 인덱스 레이아웃 중복 렌더 제거
- `e2c03b05` 인덱스 페이지 2열 레이아웃 + AI 브리핑 탭 제거
- `de3aa289` HandNote Canvas+RAF 재작성 (필기 입력 고도화)
- 햄버거 메뉴 헤더: PP AI → "Planner's Planner^AI" (윗첨자) — `UniverseMobileMenu.brandNode` SSOT prop 추가
- 햄버거 하단 중복 템플릿 제거
- 하단 메뉴 기본 순서: 인덱스·프로젝트·오늘·PI·검색
- 화면 모드 작동 (planners-app-shell 클래스 + 일괄 반전 CSS)

### 변경 파일
**신규**:
- `features/planners/SettingsLayout.tsx` — 4그룹 IA 래퍼 (sticky nav · IntersectionObserver · 3컬럼 grid xl+)
- `features/planners/SettingsStylePresets.tsx` — 8개 프리셋 카드 갤러리 + matchPreset() 헬퍼
- `features/planners/SettingsLivePreview.tsx` — Daily/Project/AI 3탭 라이브 프리뷰

**수정**:
- `app/(Planners)/planners/app/settings/page.tsx` — SettingsLayout 래핑, 그룹 마커 4개, 섹션 ID, 앱 설치 이동, 컬러 18색, 라벨 갱신, 종이 플래너 안내 제거
- `app/(Planners)/planners/app/layout.tsx` — `planners-app-shell` 클래스 부착
- `app/globals.css` — `.pp-settings` 토큰 시스템 + 시멘틱 매핑 + 다크 일괄 반전
- `features/planners/PlannersThemeProvider.tsx` — COLOR_MAP 18색 동기화 (Mustard·Orange·Emerald·Olive 추가)
- `features/planners/AppTopNav.tsx` — 햄버거 헤더 brandNode + 중복 템플릿 제거 + 윗첨자 AI
- `components/UniverseMobileMenu.tsx` — `brandNode` prop 추가 (SSOT)
- `features/planners/MobileBottomNav.tsx` — 기본 순서 인덱스·프로젝트·오늘·PI·검색
- `features/planners/DailyView.tsx` — 우측 컬럼 단일 셀 래핑
- `features/planners/HandNote.tsx`, `IndexView.tsx`, `CommandPalette.tsx`, `KeyboardShortcuts.tsx`, `PlannersUtilityLinks.tsx` — 부수 정리

### 결정사항
- **Live Preview는 xl+에서만** — lg(1024-1279)는 main 폭이 부족해 2-col 유지. 모바일 bottom sheet은 후속 stage
- **토큰은 Settings 한정 파일럿** — 다른 페이지로의 점진 마이그레이션은 후속. 토큰 어휘는 SSOT
- **Cormorant Garamond 등 핸드오프 폰트는 도입 안 함** — 폰트 6종 호스팅 부담. 사용자가 토큰으로 바꿀 수 있음
- **Maison W/M/S/B 4-배경톤은 도입 안 함** — 라이트/다크 2개로 충분. 추후 확장 가능

### 다음 할 것
- xl+ 모니터에서 Live Preview 실제 동작 확인 (1280px 이상)
- 다크모드 전체 페이지 검증 (Settings 외)
- 모바일 Live Preview FAB + bottom sheet (선택)
- 토큰을 Daily/Weekly/Monthly로 확장 (선택)

---

## 2026-04-29 — 세션 101 · Planners Role System Phase 4 완성

### 장소
사무실

### 변경 파일
- `features/planners/TemplatesView.tsx` — my_role 탭 teal 스타일 + empty state 3종 + 역할 배너
- `features/planners/IndexView.tsx` — 역할 기반 템플릿 추천 (settings+templates 병렬 fetch)
- `features/planners/WeeklyView.tsx` — role=student 시 StudentTimetable 렌더, userRole fetch
- `features/planners/DailyView.tsx` — role=researcher 시 연구노트 5번째 버튼, userRole state
- `features/planners/StudentTimetable.tsx` (신규) — 월~금×8교시 시간표 그리드, 팝오버 편집, localStorage
- `app/(Planners)/CLAUDE.md` — StudentTimetable·연구노트·role-system SQL 문서화
- `WORK_STATUS.md`, `CHANGELOG.md`

### SQL
- `sql/planners-role-system.sql` — Supabase Prod 적용 완료 (HTTP 201)
  - `planners_users.user_role` 컬럼 (CHECK 10종 역할)
  - `planners_templates.role_tags TEXT[]` + 키워드 시드

### 결정사항
- role_tags 빈 배열 = 모든 역할에 노출 (공통 템플릿)
- 연구노트는 별도 note type 추가 없이 Cornell 노트에 사전 cue 입력으로 구현 (DB 변경 0)
- 시간표 데이터는 localStorage (1기기 1시간표 — 학기별 변경 고려시 나중에 DB 이관)

---

## 2026-04-29 — 세션 100 · Planners 캔버스 Excalidraw → tldraw 마이그레이션

### 장소
사무실

### 변경 요약
- **CanvasEditor.tsx — Excalidraw → tldraw 전환**
  - 라이선스: Excalidraw 상용 유료(v0.17+ 워터마크) → tldraw MIT 무료
  - CSS: `@excalidraw/excalidraw/index.css` → `tldraw/tldraw.css`
  - 컴포넌트: `<Excalidraw excalidrawAPI=...>` → `<Tldraw onMount={...}>`
  - 데이터 형식: `{ elements, appState }` → `TLEditorSnapshot { document, session }`
  - 저장 감지: `onChange(elements, appState)` → `editor.store.listen({ scope: "document" })`
  - 불러오기: `initialData={{ elements }}` → `loadSnapshot(editor.store, canvas.data)`
  - 썸네일: `exportToBlob` → `editor.getSvgString()` + `getSvgAsImage()`
  - 기존 Excalidraw 형식 DB 데이터는 `loadSnapshot` 실패 시 try/catch로 잡아 빈 캔버스로 시작

### 변경 파일
- `features/planners/CanvasEditor.tsx` — 전체 재작성 (Excalidraw → tldraw)

### 커밋
- (이번 세션 단일 커밋)

### 핵심 결정
- tldraw v4.5.10 (MIT) 이미 `package.json`에 설치됨 → 별도 패키지 추가 불필요
- 기존 캔버스 데이터 형식 불일치 → 빈 캔버스로 시작 (데이터 마이그레이션 불필요)

---

## 2026-04-29 — 세션 99 · Planners 노트 병기·캔버스 UI 통일·AI Sparkles 제거

### 장소
사무실

### 변경 요약
- **노트 병기(非破壞 모드 전환)**: Daily·Project 노트 모두 텍스트 ↔ 손글씨 전환 시 기존 내용 보존
  - DailyView: `toggleHandwriting()` — 손→텍스트 시 `handwriting.text` 복원, 텍스트→손 시 `.text` 보존
  - ProjectNotesTab: `handModeOverride` state + `setHandPart/extractTextPart/setTextPart` 헬퍼 활용
- **노트 모달 이중 제목 삭제**: Daily·Project 모달 헤더 부제(`기본 제목입니다. 무엇에...`) 제거
- **캔버스 UI 통일**: ProjectNotesTab 캔버스 카드 아이콘 `text-sky-400/500` → `text-neutral-300`, 텍스트 `text-sky-500` → `text-neutral-500`. DailyView 모달 캔버스 헤더 아이콘 `text-sky-400` → `text-sky-500` (ProjectNotesTab 일치)
- **AI Sparkles 제거**: DailyView.tsx에서 `Sparkles` import 삭제

### 변경 파일
- `features/planners/DailyView.tsx` — 병기 toggleHandwriting · 부제 삭제 · 캔버스 아이콘 sky-500 · Sparkles 삭제
- `features/planners/ProjectNotesTab.tsx` — handModeOverride 병기 · 부제 삭제 · 캔버스 카드 neutral 색상

### 커밋
- (이번 세션 단일 커밋)

### 핵심 결정
- 노트 모드 전환은 항상 **비파괴(non-destructive)** — 텍스트·스트로크 동시 보존
- Daily: `NoteItem.handwriting.text` 필드에 텍스트 백업 / Project: HW_MARKER+JSON 내 `.text` 필드 활용
- 캔버스 카드 색상 = `text-neutral-*` (sky 제거), 모달 캔버스 아이콘 = `text-sky-500` 통일

---

## 2026-04-29 — 세션 98 · Planners Daily↔Project 노트 일관성 + 캔버스 노트 버그 + 템플릿 추천 탭 + AI 브리핑 정리

### 장소
사무실

### 변경 요약
- **Planners 노트 일관성 (DailyView·ProjectNotesTab)**
  - Daily/Project 추가 노트 4종(기본·손글씨·캔버스·템플릿) 동작·디자인·구성 통일
  - 카드 = 미리보기(max-h-64 페이드), 편집 = 모달
  - 자동 제목 placeholder 스타일(이탤릭·연한 회색) + 부제 안내, 클릭 시 비워짐
  - 모달 X 버튼 제거, 텍스트로/손글씨로 토글 제거 (생성 시 모드 고정)
  - Project 진입 시 "기본 노트 1" 자동 생성
  - 삭제 시 confirm() 양쪽 일

### 장소
집

### 변경 파일
- `lib/planners/calendar-rules.ts` — `isVisible()` 미지 kind guard + `monthlyDisplayMode()` optional chaining
- `app/api/planners/daily/pending-tasks/route.ts` — 신규 API (날짜별 미완료 태스크)
- `features/planners/DailyView.tsx` — 선택 모달 + 노트 레이블 통일 + 버튼 스타일
- `features/planners/WeeklyView.tsx` — 전면 재설계(GPR/Vrief 제거, 7일 세로, 업무탭, 노트 동기화)

### 커밋
- `b5bcbada` fix: isVisible unknown kind guard (DailyMiniMonth crash)
- `5aa42856` feat: 미완 업무 선택적 불러오기 모달
- `21f00be7` feat: 위클리 뷰 재설계
- `0d69bb64` style: Daily·Weekly 버튼 스타일 통일
- `0b99127d` feat: Weekly 새 일정 모달 업무 탭
- `e567b14a` style: 노트 레이블 통일 + 위클리 레이아웃
- `cc33b1d4` fix: Weekly ↔ Daily 노트 양방향 동기화

### 핵심 결정
- Weekly 뷰는 GPR/Vrief 없이 7일 세로 목록 + 좌측 정보 패널(32%) + 우측 노트(flex-1)
- 미완 업무는 자동 이월 아닌 **선택 모달** 방식 (날짜별 그룹, 체크박스)
- 노트는 Daily·Weekly 모두 `_cornell` JSON 포맷으로 양방향 호환
- 레이블 SSOT: "기본 노트" → "노트" (Daily), "메모" → "노트" (Weekly)

---

## 2026-04-28 — 세션 96 · 협업자 RLS 권한 강제 + 이월 작업 전체 완료 검증

### 장소
집

### 변경 파일
- `lib/planners/auth.ts` — `getMemberIdAndEmail()` email 반환 추가
- `app/api/planners/projects/[id]/route.ts` — `resolveRole()` + owner/editor/viewer 권한 분기
- `features/planners/ProjectDetailView.tsx` — 역할 기반 조건부 UI
- `features/planners/ProjectsView.tsx` — 포트폴리오 링크 조건부
- `features/planners/TemplatesView.tsx` + `template-grids/*` — (분리 완료 확인)
- `app/(Planners)/planners/portfolio/[memberId]/page.tsx` — (완료 확인)

### 핵심 결정
- 협업자는 JSONB `planners_projects.collaborators` email 매칭 (RLS 아닌 API 레이어 수동 체크)
- viewer: 읽기 전용 (PATCH 403), editor: owner-only 필드(collaborators/visibility/public_token/member_id) 차단
- 이월 작업 TemplatesView/포트폴리오 모두 이미 완료 상태 확인
- 배포 전 블로커 5개는 사용자 액션 필요

---

## 2026-04-27 — 세션 95 · 프로젝트 메뉴 고도화 Phase 1-6 + UX 일관성 + Weekly 3섹션 + 기념일 80여 종 + 전체화면 모드

### 장소
집

### 변경 내용

**프로젝트 메뉴 고도화 6단계** (전체 워크플로우)
```
카테고리 선택 → 추천 템플릿 → Daily Task 태그 → 트래킹 자동 적재 →
마일스톤 진행률 → 5F 회고 → Identity Key Results 환류 → 공개 링크 / 협업자
```

- Phase 1 `955b213d` — 카테고리 9종 SSOT + 추천 템플릿 매핑 + DB 마이그레이션
  · `lib/planners/project-categories.ts` · `lib/planners/template-recommendations.ts`
  · `sql/planners-projects-categories.sql` (category·custom_fields·tags·tracking_metrics·visibility + planners_project_milestones)
  · ProjectsView 카테고리 칩 + 카드 배지 / Cover 탭 카테고리·메트릭 편집
  · ProjectNotesTab violet 추천 템플릿 박스
- Phase 2 `f10600b3` — Daily Task ↔ project_id
  · `app/api/planners/projects/dashboard/route.ts` (진행률·D-N·오늘 task)
  · DailyProjectsCard 강화 / TaskRow 프로젝트 selector 배지
  · `app/api/planners/projects/[id]/tasks/route.ts` + ProjectTasksTab
- Phase 3 `fbdc54a6` — 트래킹 시계열
  · `app/api/planners/projects/[id]/tracking/route.ts` (7종 메트릭 매핑)
  · ProjectTrackingTab (SVG 스파크라인 + 통계 + 노트)
- Phase 4 `c1edda34` — 마일스톤
  · `app/api/planners/projects/[id]/milestones/route.ts`
  · ProjectMilestonesTab (체크리스트·간트·진행률)
- Phase 5 `5b69b000` — 5F 회고 + Identity 환류
  · `sql/planners-projects-retrospective.sql` (retrospective jsonb)
  · ProjectRetroModal (Finding 줄단위 분리 → Identity Key Results)
  · status=completed 자동 트리거
- Phase 6 `4fb7b863` — 공유·협업
  · `sql/planners-projects-sharing.sql` (public_token UNIQUE + collaborators)
  · `app/api/planners/projects/[id]/share/route.ts` (토큰 발급/철회)
  · `app/api/planners/public/projects/[token]/route.ts` + `app/(Planners)/planners/p/[token]/page.tsx` 공개 페이지
  · ShareField + CollaboratorField (CoverTab 통합)

**UX 일관성 SSOT** (`060c695e`)
- 4-View 헤더 Daily 패턴 통일 (Weekly·Monthly·Yearly 모두 동일 구조)
- CalendarEntryEditor 단일 picker (양력/음력 토글, 음력은 캘린더 그리드 팝오버)
- Weekly 셀 3섹션 (오늘의 일정·Task·메모) — planners_daily.tasks·notes 양방향
- 노트 카드 헤더 통일 + 인덱싱 (기본 노트 N · 손글씨 N)
- AI Briefing 상단 메뉴 제거 + Daily AI 정리 카드 (Haiku 4.5)
- 로고 font-serif 통일 (AI 위첨자 sans)
- globals.css `:not(.font-serif)` 예외로 .font-serif 보존
- (Planners)/CLAUDE.md UX 일관성 가이드 SSOT 섹션

**기념일 확장 + 음력**
- HOLIDAYS commemoration 타입 신규 + 2026/2027 정부지정 80여 종
  · 근로자의 날·식목일·어버이날·스승의 날·5·18·부부의 날·바다의 날·환경의 날·국군의 날·노인의 날 등
- 색상: holiday(rose-500) / memorial(rose-400) / commemoration(amber-600) / solar_term(emerald-600)
- Yearly 우선순위: 사용자 입력 > 국가기념일 > 절기 (배경 X 폰트만)
- LUNAR_YEARS_ANNIVERSARY (1950+) + 범위 외 근사 변환 (기념일 원본 연도용)

**전체화면 모드**
- PlannersUtilityLinks에 Maximize/Minimize 토글 (`document.fullscreenElement`)
- 주소창·탭 숨김 → PWA 같은 몰입 환경 (Esc 또는 같은 버튼으로 종료)

### 결정 누적
- 4-View는 같은 데이터를 다른 줌으로 본다 (단일 SSOT, 다른 뷰)
- 카드 헤더는 무조건 명시적 제목 + 통일 스타일 (placeholder-as-title 금지)
- 프로젝트는 단순 컨테이너가 아니라 트래킹·노트·태스크·캘린더·회고가 묶이는 통합 작업 공간
- 회고는 자동 트리거 (status=completed) + Finding은 Identity로 환류

### 다음 할 일
- 프로젝트 협업자 권한 강제(편집 권한 RLS)는 Phase 6+ 협업 본격화 시 추가
- 포트폴리오 모드 (`/planners/portfolio/[memberId]`) — 한 사용자의 모든 공개 프로젝트 갤러리
- WIO·Mindle 등 다른 브랜드 작업으로 전환 (Planners는 충분히 깊어짐)

---

## 2026-04-27 — 세션 93 · 통합 캘린더 시스템 + 4-View 통합 + 공공데이터 · Daily 우측 재구성 · 프로젝트 카드 · 한 장면 카테고리 통합 · 트래킹 7종

### 장소
집

### 변경 내용

**Phase 2 — 통합 캘린더**
- `sql/planners-calendar-entries.sql` — 단일 테이블(kind: anniversary/meeting/task/public_holiday/solar_term) + RLS + 트리거 + `country_pref` 컬럼
- `lib/planners/calendar-rules.ts` — 노출 룰 SSOT(Daily/Weekly/Monthly/Yearly), `expandOccurrences` 반복 펼치기, KIND_COLORS/KIND_LABELS
- `app/api/planners/calendar/{route,[id]}` — CRUD + country_pref 기반 시스템 엔트리 자동 포함
- `features/planners/CalendarEntryEditor.tsx` · `CalendarEntryList.tsx` — 재사용 모달/리스트
- 4 View 통합: Daily(오늘 일정 + Editor), Weekly(이번 주 일정), Monthly(셀 dot+title + 이달 일정), Yearly(올해 기념일·공휴일·절기)
- `sql/planners-anniversaries-migration.sql` — legacy `planners_yearly.anniversaries` → `planners_calendar_entries(kind='anniversary', recurrence='yearly')` 일괄 이전

**Phase 3 — 공공 데이터 자동 반영**
- `sql/planners-seed-kr-holidays-2026-2027.sql` — 한국 법정공휴일 30개 + 24절기 24개 시스템 시드(member_id NULL 허용 + RLS 정책 갱신)
- `lib/planners/public-holidays.ts` — 공공데이터포털 특일정보·24절기 API 클라이언트
- `app/api/planners/cron/holidays/route.ts` + `vercel.json` — 매년 1/1 자동 prefetch (CRON_SECRET 인증)
- `KOREA_HOLIDAYS_API_KEY` 환경변수 추가 필요

**Settings 신규 섹션**
- 공휴일·절기 국가 4종(🇰🇷·🇺🇸·🇯🇵·🇨🇳) 다중 선택, default ['KR']
- 한 해 시작월 select (1~12월) — 플래너 중간 시작자 대응
- 데일리 트래킹 7종(에너지·만족도·기분·공부·신앙·운동·건강), default `['satisfaction']`
- 변경사항 저장 토스트 명시
- "구독" → "구독 현황" + 런칭 프로모션 카드
- 페이지 하단 "전체 저장" SaveAllBar (자동 저장 보정용)

**오늘의 한 장면 통합**
- 별도 카드 제거 → "오늘의 한 줄" 카테고리 8번째 항목으로 통합("scene")
- 카테고리 선택 시 textarea → 미디어 업로드 폼 (compact 모드)
- `app/api/planners/moments/upload/route.ts` 신설 — 서버 사이드 admin 업로드(Storage RLS 우회)
- `sql/planners-daily-moments.sql` + `planners-moments-bucket.sql` — 50MB 한도, image+video MIME

**Daily View 재구성**
- 우측 컬럼: 미니 달력 → 데일리 트래킹(수정 버튼) → 오늘의 한 줄 → Project 카드
- VRIEF/ThisWeekCard 제거(Weekly 페이지에서 다룸)
- `DailyMiniMonth.tsx` — 7×6 미니 그리드, 일정 dot, 공휴일 색 구분
- `DailyProjectsCard.tsx` — 활성 프로젝트 6개 + 노트 직진 CTA
- 4-grid 노트 버튼: 기본/손글씨/템플릿/**캔버스** 추가
- TrackingRowWithNote — 공부·신앙은 척도 + 메모 입력

**Yearly 강화**
- 분기/반기/연간 보기 토글 + 시작월 회전 적용
- 신규 캘린더 엔트리 통합 리스트
- YearlyAnalytics 3-탭(Task 통계/올해의 한 줄/트래킹) — SVG 라인·바 차트
- 새 anniversaries 셀 텍스트 표시(8px → 10px), 하단 목차 제거

**Monthly 강화**
- MonthlyAnalytics 3-탭(Task/한 줄/트래킹) — Yearly 패턴
- 셀별 캘린더 엔트리 dot+title (kind별 색)
- 월간 RPC v2 — todo·canceled 카운트 + 월 평균 차트

**버그 fix 누적**
- Yearly 분기별 목표 입력: "+ 추가" 버튼 명시화 + 라벨 변경(올해의 테마→올해의 목표, 연간 목표→분기별 목표)
- Anniversary 셀 ●→실제 텍스트 truncate
- Daily/Project 노트 저장: 에러 핸들링 + alert
- Canvas 메뉴: `auth: { storageKey: 'tenone-auth' }` 누락 fix
- Settings 저장: update→upsert + 토스트
- "오늘의 한 줄 결과"→"오늘의 한 줄" + 카테고리 7→8종(scene 추가)

**모바일 UX**
- AppTopNav UniverseMobileMenu(우측 2/3 슬라이드) 표준 적용
- DailyView 헤더 세로 스택, Templates/AI Briefing 칩 날짜 아래
- 햄버거 메뉴(구독/설치/검색/도움말/설정)
- Daily/Project 템플릿 모달 고정 사이즈(h-[85vh] sm:h-[640px])
- IndexView 12개월 캘린더 2열 그리드 + 세로 스택
- Task 시간 입력에 명시적 "확인"/"×" 버튼

### 환경변수 (배포 전)
- `SUPABASE_SERVICE_ROLE_KEY` — Vercel 필수, 로컬 .env.local 주석 해제
- `KOREA_HOLIDAYS_API_KEY` — 공공데이터포털(선택)
- 기타: `ANTHROPIC_API_KEY`·`CRON_SECRET`·`TOSS_*`·`VAPID_*`·`GOOGLE_*`·`NEXT_PUBLIC_APP_URL`

### 다음 패스 (D)
- 프로젝트 타입(논문/설교/시험/런칭/결혼/창업/자녀교육/헬스케어/대학생/출산/마라톤/부업/자산/기타) + 추천 템플릿 매핑
- 트래킹 항목 → 프로젝트 자동 생성 흐름

---

## 2026-04-27 — 세션 92 · Planners 모바일 PWA·HandNote·AI 브리핑 통합·Weekly/Monthly 정렬·Community 사이트화·온보딩 루프 fix

### 장소
집

### 변경 내용

**Group D — 모바일 PWA 레이아웃**
- `public/planners-manifest.json` — `orientation: portrait-primary → any` (가로/세로 자유 회전)
- `features/planners/AppMonthBar.tsx` — `hidden md:flex` (모바일 본문 압박 해소)

**Group A — 필기 입력 종합 개선 (HandNote.tsx 재작성)**
- 펜 타입 4종(펜·만년필·마커·형광펜) 프리셋(thinning/streamline/opacity)
- 스타일러스 지우개 버튼 자동 감지(`button===5` / `buttons & 32`)
- 지우개 모드 토글 + 팜 리젝션(Pen Only) 토글(`Hand` 아이콘)
- 캔버스 자동 확장(스트로크 하단 진입 시 +240px)
- 모바일 툴바 가로 스크롤, 태블릿 pen/touch 무조건 통과
- 전체 지우기 아이콘: `Trash2 → RotateCcw` (클린 느낌)
- `package.json` — `perfect-freehand` 추가(빌드 에러 해소)

**Group B — AI 브리핑 통합**
- `sql/planners-briefing-midday.sql` — `briefing_type` CHECK 에 `midday` 추가
- `lib/planners/briefing.ts` — `inferBriefingType()` 시간대 자동 추론(04~12 morning · 12~18 midday · 18~04 evening), midday 시스템 프롬프트 추가
- `app/api/planners/briefing/generate/route.ts` — `type='auto'` 지원
- `lib/planners/notifications.ts` — TYPE_LABEL/COLOR 맵 통합, 3종 일관 처리
- `features/planners/AiBriefingView.tsx` — 분리형 카드 UI → 단일 채팅 스레드 (시간순 말풍선, 시간대 자동 CTA, 지난 브리핑 펼침)
- `app/(Planners)/planners/app/settings/page.tsx` — 이메일 브리핑 기본 OFF, 라벨 "이메일로도 받기 (선택)"
- `app/api/planners/integrations/slack/sync/route.ts` · `app/api/planners/search/route.ts` — midday 라벨 처리
- `lib/planners/types.ts` — PlannerBriefing 타입에 midday 추가

**Group C — Weekly/Monthly 정렬 + 월간 통계**
- `features/planners/WeeklyView.tsx` — 순서 GPR → Vrief → 주간 계획 (각 3분할 그리드)
- `features/planners/MonthlyView.tsx` — 순서 테마/목표 → 집중 영역 → 일정 → 회고 → 통계
- `sql/planners-monthly-summary-v2.sql` — RPC v2 (todo_tasks·canceled_tasks 추가, search_path 고정)
- 월간 통계 위젯: 5종 분포(전체/완료/미완/이월/취소) + % + 분포 막대 + 에너지·일간 계획 수립일·완료 프로젝트

**Community 사이트화**
- `sql/planners-community.sql` — posts/comments/likes 테이블 + RLS(공개 읽기, 본인만 쓰기) + 카운트 트리거
- `app/api/planners/community/{route,[id],[id]/comments,[id]/likes}` — 공개 GET, 인증 필요 mutation
- `app/(Planners)/planners/community/page.tsx` — 공개 사이트 페이지 신설
- `features/planners/CommunityView.tsx` — 비로그인 모드(읽기 공개), 글쓰기/좋아요/댓글은 로그인 CTA
- `features/planners/AppTopNav.tsx` · `AppSidebar.tsx` — Community 외부 링크(`target="_blank"` + ↗ 마커)
- `features/planners/PlannersHeader.tsx` — 공개 헤더에 Community 메뉴 추가, PP AI 워크스페이스를 UniverseUtilityBar `workspacePath` 슬롯으로 통합 (HeRo·SmarComm 패턴)

**온보딩 루프 fix**
- `app/api/planners/onboarding/route.ts` — auth `storageKey: 'tenone-auth'` 추가(쿠키 인식), members 조회 admin 클라이언트 통일, auth_id 조회 → email 폴백 → 자동 생성 3단계, upsert 에러 클라이언트 노출
- `app/(Planners)/planners/onboarding/page.tsx` — `res.ok` 체크, 실패 시 alert + 리턴, 성공 시 `window.location.assign` 하드 네비
- `app/(Planners)/planners/app/layout.tsx` — `member_roles` 조인 + `isPrivileged()` 헬퍼 → super_admin·manager·staff 는 온보딩/구독 게이트 우회
- `sql/planners-master-bypass.sql` — 마스터 계정 `onboarding_completed=true` 직접 마킹

### 데이터 무결성 확인
lools@tenone.biz 데이터 잔존 확인(daily 8 · weekly 3 · monthly 1 · projects 1 · briefings 2). 온보딩 루프는 게이트 문제일 뿐 데이터 손실 없음.

### 다음 할 일

**배포 직전(코드 0줄, 외부)**
- Vercel 환경변수: `ANTHROPIC_API_KEY` · `CRON_SECRET` · Toss(`TOSS_SECRET_KEY`/`NEXT_PUBLIC_TOSS_CLIENT_KEY`) · VAPID 4종 · Google OAuth · `NEXT_PUBLIC_APP_URL=https://planners.tenone.biz`
- Vercel 도메인 연결 + Supabase Allowed URL `https://planners.tenone.biz/**`
- Toss 가맹점 승인 후 live 키 적용

**기능 이월**
- P3 #18 기업 플랜 (대규모, 결제 사업 시작 시)
- TemplatesView Step 2b — empathy/retro/thinking/meeting/timing/planning 카테고리 분리(2,549 → 1,500 이하)
- HandNote 실기기 검증(S Pen 지우개·iPad Pencil·팜 리젝션·태블릿)

---

## 2026-04-27 — 세션 91 · Planners 템플릿 59종 컨설턴트급 고도화 · TemplatesView Step 2 분리 · Contacts 무한스크롤·자동 All·초성 분류 견고화

### 장소
집

### 변경 내용

**Daily UX 정리**
- `features/planners/DailyView.tsx` — 노트 추가 버튼 3분할 그리드 (기본 노트/손글씨 노트/템플릿), 신규 노트 타이틀 빈 값 시작(placeholder가 예시), 타이틀 폰트 색 강화 + placeholder italic·light 구분, Cornell 헤더 pl-10 정렬

**TemplatesView Step 2 — 14개 그리드 분리**
- 신규 `features/planners/template-grids/quadrants.tsx` (10): SWOT, 4P, Ansoff, BCG, 9-Box, Eisenhower, PEST, MoSCoW, Quadrant Blank, Kano
- 신규 `features/planners/template-grids/canvas.tsx` (4): Lean Canvas, BMC, VPC, OKR
- TemplatesView.tsx 3,072 → 2,549 라인 (523 라인 추출)

**템플릿 디테일 고도화 — 59/59 완료**
- 일관 패턴: 메타(날짜·기간·관계자) + 저자/원전 amber 가이드 박스 + 컨설턴트급 placeholder(한국 1인 사업가 시나리오) + 회고·검증·Top N 액션 섹션 + 양립 항목 2-col
- 카테고리: 미팅 3 / 회고 3 / 사고법 5 / 공감 4 / 시간관리 5 / 저널 4 / 분석·운영 5 / 노트·운영 4 / 계획 9 / 분석 테이블 4 / 사분면 10 / 캔버스 4
- 인용 원전: Manager Tools, Mom Test, US Army AAR, Toyota 5Why, 오타니 만다라트, Ikigai, SCAMPER(Eberle), Feynman, Dave Gray, Christensen JTBD 4 Forces, Cal Newport(TimeBlock·DeepWork), Pomodoro, James Clear, CGP Grey Theme, Brian Moran 12 Week Year, NASA Backwards Planning, Ash Maurya Lean Canvas, Osterwalder BMC, Strategyzer VPC, Doerr OKR, Niklas Luhmann Zettelkasten, Tony Buzan Mindmap, Walter Pauk Cornell, Bezos Type 1/Type 2, Intercom RICE, Pareto, McKinsey 9-Box, Eisenhower, Porter 5 Forces, Ishikawa 6M, John Boyd OODA, Kano Model, MoSCoW, Ansoff, BCG

**Contacts 페이지 UX 대전환**
- `features/planners/ContactsView.tsx` — max-w-[1400px] → max-w-6xl (Daily/Weekly와 일치)
- letterFilter 상태 도입 ('top' / 'all' / 'ㄱ'·'A'…) — 진입 시 즐겨찾기 + 최근 사용만 렌더, 우측 인덱스 클릭 = 필터링(스크롤 X)
- 자동 All 폴백 — 즐겨찾기·최근 둘 다 비어 있으면 전체 노출 (빈 화면 방지)
- 인스타식 무한 스크롤 — 50명씩 점진 렌더, IntersectionObserver(rootMargin 300px), state 변경 시 limit 자동 리셋
- 우측 인덱스 'All' 버튼 추가 + 선택 letter highlight + 카운트 tooltip
- 상단 즐겨찾기(amber border) / 최근 사용(Clock) 분리 섹션
- 중복 정리 강화: 한국 휴대폰 마지막 8자리 정규화(+82 흡수) + 이름·회사 fallback
- getInitialChar 견고화: invisible 문자(BOM/ZWSP/NBSP/control) 제거 + 한글 호환 자모(U+3131~U+314E) 19개 + Choseong Jamo(U+1100~U+1112) 19개 직접 매핑 — '심온' 잘못 분류 해소

### 결정사항
- 템플릿은 단순 placeholder 차원이 아니라 **컨설턴트급 사용 가이드(저자·원칙·실제 시나리오)**까지 일관 적용. 사용자가 처음 열었을 때 학습 비용 ↓.
- TemplatesView 분리는 quadrants/canvas 까지로 일단 멈춤. empathy/retro/thinking 등 추가 카테고리 분리는 다음 세션 이후 필요시.
- Contacts: 진입 첫 화면 부담 최소화가 핵심. 1,000명+ 데이터에도 즉시 반응. 우측 인덱스는 jumpToInitial(스크롤) 방식 폐기, letterFilter(필터링) 방식으로 통일.

### 핵심 파일
- `features/planners/DailyView.tsx`
- `features/planners/TemplatesView.tsx`
- `features/planners/template-grids/quadrants.tsx` (신규)
- `features/planners/template-grids/canvas.tsx` (신규)
- `features/planners/ContactsView.tsx`

### 다음 할 일
- (선택) TemplatesView Step 2b — empathy/retro/thinking/meeting/timing/planning 카테고리 추가 분리. 현 TemplatesView 2,500+ 라인 → 1,500 라인 이하 목표.
- 사용자 실사용 후 placeholder·가이드 개선 (특히 사고법·계획 카테고리)
- P3 #18 기업 플랜은 결제 사업 시작 시 진행 (이번엔 보류)

---

## 2026-04-27 — 세션 90 · Planners 메뉴 재편 · 누적이월 · PWA 설치 · 주소 검색 · 새 로고

### 장소
집

### 변경 내용

**메뉴 재편**
- `features/planners/AppTopNav.tsx` · `AppSidebar.tsx` — Templates · AI Briefing 메인 메뉴에서 제거
- 신규 `features/planners/PlannersUtilityLinks.tsx` — 본문 상단에 칩으로 제공되는 서브 링크
- IndexView · DailyView · WeeklyView · MonthlyView · YearlyView · IdentityView · ProjectsView · ProjectDetailView 헤더에 적용
- AppTopNav: 우측 클러스터에 Download 아이콘, 탭 영역 overflow-x 자연 스크롤 + 스크롤바 시각 숨김 + 우측 액션 분리선 (Contact 메뉴 가로 위배 해결)

**Project 상세 고도화**
- `features/planners/ProjectDetailView.tsx` — 기본 탭 cover→notes, 헤더 카드 재설계 (색상 바·상태 칩·일정), 표지 탭 2컬럼 (좌 커버 / 우 제목·상태·일정 divide), Block/Textarea 헬퍼 제거

**Project 노트 인터랙티브 템플릿**
- `features/planners/ProjectNotesTab.tsx` — content 첫 줄 `<!-- planners:tpl=KEY|label=L -->` 마커 파싱, NoteCard·NoteExpandModal 에서 `renderFramework` + localStorage(`tplDataKey(noteId)`) 로 인터랙티브 렌더
- 템플릿 노트는 제목 빈 값 + placeholder, 연필 편집 버튼 숨김
- DB 마이그레이션 없이 backward compatible

**누적 미완료 이월**
- `app/api/planners/daily/carry-over/route.ts` 재설계 — 과거 60일(1~180) 스캔, todo 만 수집, 가까운 과거 우선 dedupe, source_date 기록, 원본 자동 carried 처리
- 신규 `app/api/planners/daily/pending-count/route.ts` — count·days·oldest 반환
- `features/planners/DailyView.tsx` — `pendingInfo` state 로 교체, 버튼 라벨 "누적 미완료 N건 이월" + tooltip 출처 안내

**PWA 설치 시스템**
- 신규 `app/(Planners)/planners/install/page.tsx` + `features/planners/InstallView.tsx`
- 자동 플랫폼 감지, beforeinstallprompt 캡처, iOS 4단계 가이드, standalone 감지, URL 복사 + QR
- `app/(Planners)/planners/planner-tool/page.tsx` — 타이틀 바로 아래 다운로드 카드 (로고 + CTA)
- `app/(Planners)/planners/app/help/page.tsx` — PWA FAQ 갱신, App Store/Play Store FAQ 추가
- `app/(Planners)/planners/app/settings/page.tsx` — "앱 설치" 섹션 추가
- `features/planners/PlannersFooter.tsx` — Menu 컬럼에 "앱 설치" 링크
- 6개 진입점: 헤더·사이드바·Settings·planner-tool 상단·푸터·Help

**Contacts 주소 검색**
- 신규 `features/planners/AddressPicker.tsx` — Daum Postcode lazy-load (버튼 클릭 시), 모달 검색, 도로명/지번/건물명 매핑
- `features/planners/ContactsView.tsx` — 주소 필드 옆에 "우편번호 검색" 버튼

**새 로고 (검정 BG + 화이트 P + 펜촉)**
- `public/planners-icon-192.png` · `planners-icon-512.png` 교체 → PWA 설치 아이콘 자동 반영
- AppTopNav 좌측 24px · AppSidebar 상단 32px · InstallView Hero 64px · planner-tool 다운로드 카드 48px 노출
- 검정 그라데이션 래퍼 제거 (로고 자체 검정 BG 활용)

### 신규 파일
- `app/(Planners)/planners/install/page.tsx`
- `app/api/planners/daily/pending-count/route.ts`
- `features/planners/AddressPicker.tsx`
- `features/planners/InstallView.tsx`
- `features/planners/PlannersUtilityLinks.tsx`

---

## 2026-04-26 — 세션 89 · Contacts 극강화 + Planners 사이트 헤더 정비

### 장소
집

### 변경 내용

**Contacts 기능 (Google Contacts급)**
- `features/planners/ContactsView.tsx` — 전면 재작성. 좌측 사이드바(라벨·관리·빠른 추가·생일 카드) + 테이블 행 + 가나다 fixed sidebar + 컨텍스트 액션바
- `app/api/planners/contacts/route.ts` — 페이지네이션 GET (1만명 → 무제한), bulk POST + skip_duplicates + merge_labels, bulk DELETE
- `app/api/planners/contacts/labels/route.ts` — 신규. POST(적용/제거)·PUT(rename)·DELETE
- `sql/planners-contacts-v2.sql` — is_favorite·organization·title·address·labels TEXT[]·last_contacted_at 추가
- DB 정리 실행: 12,273 → 6,064명 (phone/email 기준 자동 dedupe). 시스템 라벨(myContacts·Remember) 제거
- 즐겨찾기·한글 초성 검색·전화번호 자동 포맷·복사 버튼·다중 선택·vCard·CSV 양방향·라벨 관리(rename/delete/bulk apply)·중복 정리(자동 병합)·수동 병합·Bulk Edit·다가오는 생일·마지막 연락 추적·빠른 추가·천 단위 콤마

**Planners 사이트 헤더 정비**
- `features/planners/PlannersHeader.tsx` — 4그룹 명확 분리 (로고·구분선·메뉴·CTA), "Planner's" 메뉴 제거(로고 중복), PP AI 진입 CTA 우측 상시 노출
- `app/(Planners)/planners/page.tsx` — ExploreSection 제거(헤더 중복) → PPAISpotlight 신규(Now Live + 3대 기능)
- `features/planners/AppSidebar.tsx` · `AppTopNav.tsx` — 메뉴 순서/라벨 SSOT 통일

**Templates·Daily 개선**
- `features/planners/DailyView.tsx` — TemplateNoteBlock ⤢ Maximize 버튼 + 타이틀 편집 시각 강조 + 모달에서 grid 템플릿 그대로 표시
- `features/planners/ProjectNotesTab.tsx` — 템플릿 피커를 DailyView와 동일 UX (검색·즐겨찾기·바텀시트·로딩)
- 양쪽에 ⭐ 즐겨찾기 필터 + localStorage 공유

**핵심 버그 수정**
- `features/planners/PlannersThemeProvider.tsx` — `[class*="bg-[#0F766E]"]` → `[class~="..."]` 교체. substring match 때문에 `hover:bg-[#0F766E]/5` 도 항상 100% teal 덮던 치명 버그 해결. opacity variant(/5, /10, /20) rule 명시 추가

**Settings UX**
- `app/(Planners)/planners/app/settings/page.tsx` — alert() → inline toast, 컬러/폰트 섹션 최상단 이동, ringColor → outline 정상화

---

## 2026-04-26 — 세션 88 · PP AI 버그 수정 7종 + Contacts 신규

### 장소
집

### 변경 내용

**버그 수정**
- `features/planners/DailyView.tsx` · `MonthlyView.tsx` · `AiBriefingView.tsx` — `toISOString()` UTC→KST localDateStr 헬퍼 적용
- `features/planners/YearlyView.tsx` — 기념일 모달에 관계유형(가족/연인/친구/직장/기타) + 요일 표시(getDayOfWeek)
- `features/planners/PlannersThemeProvider.tsx` (신규) — CSS 속성 선택자 인젝션으로 앱 전체 테마 반영. localStorage key `planners_color_theme`
- `app/(Planners)/planners/app/layout.tsx` — PlannersThemeProvider 추가
- `app/(Planners)/planners/app/settings/page.tsx` — applyPlannersTheme 호출 + 데이터 백업 JSON export

**Contacts 신규 기능**
- `sql/planners-contacts.sql` — planners_contacts 테이블 (member_id, name, phone, email, group_name, relationship, note, birthday) + RLS + Prod 적용
- `app/api/planners/contacts/route.ts` — GET/POST/PATCH/DELETE
- `features/planners/ContactsView.tsx` — 그룹 필터·검색·추가/수정/삭제 모달·vCard(.vcf) import
- `app/(Planners)/planners/app/contacts/page.tsx` — 라우트 페이지
- `features/planners/AppSidebar.tsx` — Contacts 메뉴 추가 (weekly·all_in_one)
- `lib/planners/auth.ts` (신규) — getMemberId 헬퍼

---

## 2026-04-25 — 세션 87 · Planner's Templates 59종 전체 인터랙티브 그리드화

### 배경
기존 8종(BCG·SWOT·4P·Ansoff·9Box·Empathy·Lean·Mandalart)만 셀 편집 가능. 나머지 51종은 자유 텍스트. 유저 요청으로 "전 템플릿 첨부한 수준으로 고도화" 진행 → Framework 25·Note 19·Schedule 15 전부 시각 그리드화.

### 결과 — P3 #17 완수
Batch 1~10으로 10회 나눠 진행. 순차·정밀 개발 + 브라우저 실측 검증.

### 장소
집

### 변경 파일
- `features/planners/TemplatesView.tsx` — +2981줄 (27개 그리드 컴포넌트 신규)
- `lib/planners/templates.ts` (신규) — `isSpecialTemplate`·`exportFrameworkText`·`resolveTemplateContent`·`LABEL_MAP` 공용 유틸. DailyView·ProjectNotesTab 공유.

### 핵심 결정
- **한 파일 집중**: 용량 부담에도 `TemplatesView.tsx` 유지 (2700줄). 다음 세션 별도 파일 분리 권장.
- **JSON 배열 저장 11종**: RICE·Pareto·Journey·DM·TimeBlock·DeepWork·Pomodoro·Habit·Energy·YearPlan·Brainstorm → 테이블 markdown export.
- **키워드 기반 detection**: 기존 템플릿 DB의 key/label 패턴으로 자동 매핑 (SQL insert 없음). `swot_self`는 기존 `SwotGrid`에 자동 합류.
- **Bilingual 모달 헤더**: `getFrameworkBilingualName()` 헬퍼로 한국어 제목 + 영문 부제 자동 표시.
- **공용 헬퍼 추출**: `LabeledInput`·`LabeledBox`·`CellTextarea`·`QuadrantGrid` 재사용 패턴 정립.

### 커밋
- `ca75c371 feat(planners): 전 템플릿 59종 인터랙티브 그리드화`

### 다음 세션 이월
- **대규모**: P3 #16 필기 입력 · #18 기업 플랜
- **소규모**: TemplatesView 분리 리팩토링 · Drive 레퍼런스 4개 폴더 검토 · 다른 세션의 미커밋 잔업 49+10개 정리

---

## 2026-04-24 (야간) — 세션 85 · Planner's P4 GTM 이벤트 + 잔여 감사

### 감사 결과
세션 84 WORK_STATUS pending 항목 전수 검증 — P3 #19·20, P4 #22·23, P5 #25·26·27 모두 이미 구현 완료 확인.

### 변경 파일
- `features/planners/CopyToAiButton.tsx` — `trackPlanners("planners_copy_to_ai", { target })` 추가
- `features/planners/WelcomeTracker.tsx` (신규) — 결제 완료 후 `?welcome=1` 감지 → `planners_subscription_started` GTM 이벤트
- `app/(Planners)/planners/app/layout.tsx` — `<Suspense><WelcomeTracker /></Suspense>` 추가
- `app/(Planners)/planners/app/page.tsx` — `?welcome=1` 파라미터 today 페이지로 전달
- `WORK_STATUS.md` — 실제 상태로 갱신

### 기존 trackPlanners 커버리지 (감사 확인)
- 온보딩 완료: `onboarding/page.tsx` ✅
- AI 브리핑 생성: `AiBriefingView.tsx` ✅
- Weekly 저장: `WeeklyView.tsx` ✅
- 베타 피드백: `BetaFeedbackButton.tsx` ✅

---

## 2026-04-24 (저녁) — 세션 84 · Planner's Planner AI MVP 풀스택 구축

### 정체성
종이 플래너 "2026 Planner's Planner All in One" (굿노트·삼성노트 PDF)를 능동 AI 비서를 탑재한 웹/앱 서비스로 확장.
- 가격: 연간 19,000원 (PDF 구매자 무료)
- 기본 모드: Weekly · 고급: All in One
- 철학: "우리는 모두 기획자다 / 도모(圖謀) / 생각한대로 살지 않으면 사는대로 생각하게 된다"
- 능동 AI: Haiku 4.5 기반 아침 브리핑·저녁 정리 (월 ~$0.18/유저)

### DB (16 테이블 + 5 RPC)
- `sql/planners-app.sql` — users·identities·yearly/monthly/weekly/daily·projects·project_vriefs/gprs/notes·ai_briefings·ai_usage
- `sql/planners-app-v2.sql` — mode · is_pdf_buyer · vision/mission/kr 추가
- `sql/planners-templates.sql` + `phase2.sql` — 59종 시드
- `sql/planners-aggregation.sql` — weekly/monthly/yearly_summary 함수
- `sql/planners-payments.sql` — planners_payments + activate_subscription/pdf_buyer RPC
- `sql/planners-notifications.sql` — notify_email/push + planners_push_subscriptions
- `sql/planners-covers.sql` — 15종 커버
- `sql/planners-anniversaries.sql` — yearly에 anniversaries JSONB
- `sql/planners-integrations.sql` — planners_integrations + external_events
- `sql/planners-security-hardening.sql` — 함수 6개 search_path 고정

### 핵심 페이지 (features/planners/)
- AppSidebar · PlannersChrome · PwaRegister (레이아웃)
- DailyView + ThisWeekCard + ExternalEventsBanner (Today)
- WeeklyView · MonthlyView · YearlyView (스케줄 계층)
- IdentityView (Inside-Out/Outside-In/Vision House/Vision+Mission+KR)
- ProjectsView · ProjectDetailView · ProjectNotesTab · CoverPicker · CoverRender
- TemplatesView · SearchView · AiBriefingView
- PurchaseView · CopyToAiButton

### API (20+ 라우트)
- `/api/planners/onboarding`
- `/api/planners/{daily,weekly,monthly,yearly,identity,projects,settings}`
- `/api/planners/daily/carry-over` · `/api/planners/daily/month-hits`
- `/api/planners/projects/[id]` · `/api/planners/projects/[id]/notes` · `.../notes/[noteId]`
- `/api/planners/templates` · `/api/planners/covers`
- `/api/planners/summary` (scope=weekly/monthly/yearly)
- `/api/planners/search` — 풀텍스트
- `/api/planners/briefing` · `/api/planners/briefing/generate` · `/api/planners/cron/briefings`
- `/api/planners/payment/{request,success}` · `/api/planners/admin/activate`
- `/api/planners/push/subscribe`
- `/api/planners/integrations` · `/api/planners/integrations/google/{connect,callback,sync}` · `/api/planners/integrations/todoist/{connect,sync}`
- `/api/planners/external-events`
- `/api/intra/planners/{subscribers,payments}` + `/intra/planners` 페이지

### PDF 원본 충실도
- 상단 7대 메뉴 + 사이드바 모드 분기 (Weekly/AllInOne)
- 체크박스 4순환 (□ → V → → → ┕)
- 공휴일·절기 2026~2027 (법정 15개 + 24절기)
- Anniversary & Big Event 2p 스프레드 (상반기/하반기)
- 하루 = Daily 1 + Note 2슬롯 (PDF의 N 링크 2개)
- 4계층 드릴다운 (Yearly→Monthly→Weekly→Daily, 상호 링크)

### 외부 연동
- **Google Calendar** OAuth 2.0 + access/refresh + 90일 sync + DB 캐시 + Today 노출
- **Todoist** 토큰 방식 + 오늘 태스크 Daily import

### 알림
- 이메일 백업 (Resend `noreply@tenone.biz`) — 브리핑 HTML 템플릿
- Web Push (VAPID) — Service Worker push 수신 핸들러 + 클릭 시 앱 열림

### PWA
- `public/planners-manifest.json` + `planners-sw.js`
- 오프라인 페이지 + cache-first 브리핑 이력 + network-first 페이지
- PwaRegister 컴포넌트 (production만 등록)

### 마케팅
- `/planners/planner-tool` AI 섹션 "Coming Soon" → "Now Live" + 19,000원 CTA + PDF 구매자 안내

### 보안 감사
- Supabase get_advisors 실행 → planners_* 테이블 RLS 0건 · 함수 search_path 6개 경고 전부 고침

### 의존성 추가
- `web-push` + `@types/web-push`

### 환경변수 (배포 필요)
- `ANTHROPIC_API_KEY` · `CRON_SECRET`
- `TOSS_SECRET_KEY` · `NEXT_PUBLIC_TOSS_CLIENT_KEY`
- `VAPID_PUBLIC_KEY` · `NEXT_PUBLIC_VAPID_PUBLIC_KEY` · `VAPID_PRIVATE_KEY` · `VAPID_SUBJECT`
- `GOOGLE_CLIENT_ID` · `GOOGLE_CLIENT_SECRET` · `NEXT_PUBLIC_APP_URL`

### 누적 통계
- 파일 추가: 45+ · SQL: 11개 · 컴포넌트: 20+ · API: 25+

---

## 2026-04-24 (낮) — 세션 82 · HeRo P3 UI/UX 색 SSOT 전 페이지 감사 완료

### P3 HeRo 색 규약 감사 — 범위 전 페이지

**감사 범위**: `/hero/hit` 랜딩 · HIT A~F 검사/결과 · `/hero/my` · `/hero/coaching` · `/hero/search-light` · `/hero/jh` · `/hero/company` · `/hero` 랜딩 · 공통 헤더/푸터

**수정 건 (총 10건)**
- HIT 랜딩: 순번 원형·피처 아이콘 `text-[#E53935]` → `text-neutral-400` / `text-neutral-600`
- HIT A~F 검사 섹션 아이콘: red → neutral
- HIT A result: 아웃라인 CTA → Action layer (filled)
- HIT D result: `font-bold` 직무명·점수 red → neutral-800
- JourneyWorkspace: 탭 sticky 처리
- coaching page: 아이콘 color 정리

**ACCEPTABLE 판정 (변경 없음)**
- `group-hover:text-[#E53935]` on `font-bold` card titles — hover-only interactive affordance (default `text-neutral-900`)
- Mobile drawer outline red nav CTA — 내비게이션 버튼 (본문 bold 텍스트 아님)
- semantic red (에러·경고·리스크), form State layer, per-card outline buttons, active nav/tab indicators

---

## 2026-04-23 (저녁) — 세션 81 · HeRo Journey 워크스페이스 3일치 + 64 유형 텍스트 개편 + 브랜드 컨셉 교체

### HIT 64 영웅 유형 SSOT 전면 개편
- character_name 64개 리네이밍: "The + 현대 직업 원형" 형식, 영화 IP 참조 제거 (D-ENTJ→"The Global Executive" 등)
- character_label 64개: `[MBTI 특성] + [DISC 방향성]` 구조로 변별력 확보 (기존 C그룹 "신중한 ~" 반복 해소)
- profile_overview 64개: 4문단 표준 (핵심·빛나는 순간·경계할 그림자·잘 맞는 환경) · 영화 IP 참조 0
- strengths/cautions/fit_direction 64개 JSONB 배열로 긍정·성장 언어 표준화
- 디자인 시스템 문서 `docs/hero-types-design-system.md` + 파일럿 프롬프트 `docs/hero-types-pilot-prompts.md`
- 인트라 /intra/hero/hero-types 필터 수정 (잘못된 C/P → 올바른 D/I/S/C형)

### HeRo Journey 워크스페이스 — 리텐션 엔진 구축 (Day 1~3)
**포지셔닝**: 설명 페이지 아님 · 실제로 커리어를 빌드업하는 도구 · 매일 방문하도록 설계

**DB 인프라**
- `hero_daily_checkins` (에너지·한 줄 성과, 하루 1회)
- `hero_goals` + `hero_goal_checkins` (Vrief × GPR 이중축 + 주간 체크인)
- `hero_journey_stage()` · `hero_streak()` 함수
- `uc_earn_rules` 시드 8종 (brand_id='hero')

**API (신규 8개)**
- `/api/hero/journey/status` · `/checkin`
- `/api/hero/goals` · `/[id]` · `/[id]/checkin`
- `/api/hero/jobs/feed` — JH 기반 매칭 정렬

**사용자 측**
- `/hero/journey` 단일 URL · auth 분기 (비로그인=6단계 마케팅 / 로그인=워크스페이스)
- 탭 6개: Today · Hero Type · 목표·성취 · 기록 · 채용 피드 · 매칭
- Today 위젯: Journey 지도 · 스트릭 · 해금 체크리스트 · 오늘의 미션(동적) · 30초 체크인 · 받은 매칭
- 스트릭 배지: 7일 🔥 · 30일 ⭐ · 100일 🏆
- UC 자동 적립 + 토스트 (스트릭 달성 시 강조)
- Goals 탭: Vrief(역량 0→5) + GPR(업적 목표값) 편집기 + 주간 체크인 모달 + 진행률 자동 계산
- Jobs 탭: 매칭 점수 비공개, "왜 맞는가" 서술 3줄만 (Tetrad 원칙)

**헤더**
- ABOUT · Journey · Profile · Logout · 공유 · 검색 순서
- UniverseUtilityBar workspacePath 위치를 profile 앞으로 이동 (전 브랜드 공통)
- `/hero/career` → `/hero/journey` 301 redirect

### 브랜드 컨셉 전면 교체 — Talent Agency 포지셔닝
- OLD: "Hidden Intelligence & Real Opportunity" / 인재 발굴·성장 플랫폼
- NEW: **"Human enhancement & Recruit Optimization"** / **Talent Agency**
- HeRo 재정의: "플랫폼" → "인재 기획사" (연예 기획사 원형)
- 적용: HeRoFooter · about 페이지 · site-config · seed SQL · DB ums_sites 실시간

### 랜딩 페이지 디테일
- 히어로 서브카피 "당신의 숨겨진 재능을 발견하고, 멋진 무대를 찾습니다"
- "HeRo는 인재 기획사입니다" 섹션 삭제 (중복 제거)
- 서비스 #3 "기업 매칭" → "써치 라이트 (기업-인재)" + /hero/search-light 연결
- "64가지 마케팅 유형" → "64가지 영웅 유형" + 실제 DISC 데이터 8개
- 64 유형 카드 Link로 변환 (클릭 가능)
- CTA 링크 정비: 오디션 지원 → talent-agent/apply, 기업 문의 → search-light
- 씨치 라이트 → 써치 라이트 전체 통일

### 빌드 에러 수정
- `lib/hit/data/{c,d,e,f}-questions.ts`: 삭제된 `./personality-questions` → `@/types/hit`
- `/api/hero/matching/[id]/report/route.ts`: `createServerClient` → `createClient` 별칭 + await

### 주요 결정 누적
1. Journey가 HeRo의 리텐션 엔진 — 설명이 아닌 도구
2. 탭은 액션 단위(verb) · 모든 카드에 동사 버튼
3. 매칭 루프: 스트릭(매일) + 목표 체크인(매주) + 매칭 피드(매일 갱신)
4. Vrief × GPR 이중축을 목표 관리 표준으로 · 진행률 자동 계산
5. 매칭 점수는 비공개 · 서술만 공개 (Tetrad 원칙 유지)

### 커밋 이력 (세션 81)
- `0e69ff9e` fix(hero/hit): DB→코드 일관성 5개 버그 + 매칭 엔진 v3 (이월분)
- `a1182974` fix(hero): 영웅 유형 그룹 필터 D/I/S/C형
- `01a9b76e` fix(hit): import 경로 + 64 유형 텍스트 개편
- `9e215bc1` fix(hero): report route createServerClient 교체
- `cc3e3a1e` feat(hero): Journey Day 1 MVP
- `cc540ee1` feat(hero): Journey Day 2 목표·성취 (Vrief × GPR)
- `db2f514a` refactor(hero): 브랜드 컨셉 Talent Agency로 교체
- `fc7317fc` feat(hero): Journey Day 3 채용 피드 + UC + 배지

---

## 2026-04-23 — 세션 80 · HeRo UI/UX 규약 수립 + HIT 모델 재정의 + 요금·탤런트 에이전시 신설

### HeRo UI/UX 색·클릭 SSOT 수립 및 전면 적용
- HeRo CLAUDE.md에 "🎨 UI/UX 규약 — 색·클릭 SSOT" 섹션 추가 (Action/Accent/State/Content/Disabled 5 레이어)
- Priority 1~6 순차 적용: /hero/hit 랜딩 · hit/{a~f}/* 검사·결과·리포트 · /hero/my · /hero/coaching · /hero/search-light · /hero/jh·jd·company · /hero 랜딩 + 공통 헤더/푸터 (총 15+ 파일)
- 잠금 UI 표준: `<button disabled aria-disabled cursor-not-allowed>` + Lock 아이콘
- 빨강 사용 면적 대폭 축소 (페이지당 평균 8+ → 3~4개로)

### HIT 검사 모델 재정의 (DB 실측 기반)
- HIT A: UF + MBTI + DISC + **인성 + 적성** 통합 측정 → S-Power + 64유형 (인성·적성이 HIT B → HIT A로 재귀속)
- HIT B~F: 생애주기별 심화 진단 (B=신입/C=이직/D=시니어/E=2막/F=복귀)
- `/hero/hit` 랜딩 A/B 카드 + System 구성 + 3단계 여정 + BCDEF 심화 카드 전면 재작성
- HitModelGuide 모달: HIT A 섹션에 인성·적성 상세 추가 (각 5차원/RIASEC 6차원) · HIT B~F 통합 "생애주기별 특화 진단" 섹션 신설 · 교차분석 표현 "UF × MBTI × DISC × 인성 × 적성"으로 갱신

### 비회원 티저 + 회원 풀리포트 게이팅
- /hero/hit/a/result/[id] — 비회원: 강점 #1만 공개 + 나머지 `blur-[3px]` + 회원가입 CTA / 회원: 전체 통합 보고서
- max-w-lg(모바일형) → max-w-3xl(데스크톱형) · 고정 540px 박스 제거 · 하단 dot 인디케이터 → 상단 pill 탭
- 비회원 CTA는 "무료 회원가입하고 전체 보기" 로 구분 (HitADeepCTA는 로그인 시에만)

### HIT A 가상 더미 데이터 5건
- 기존 더미 7건 + 세션 16건 + 응답 1,709건 전부 삭제 (HIT 확정 모델 이전 데이터 정리)
- 신규: D-INTJ · I-ENFP · S-ISFJ · C-INTP · D-ESTJ — 리포트 모듈 13~14개씩 · AI 내러티브 · S-Power · UF · 인성 · 적성 완비
- `sql/hit-a-dummy-5.sql`

### 요금 안내 독립 페이지 + 4티어 구조
- `/hero/pricing` 신규 페이지 (이전까지 /hero/coaching/ai 하단에 섞여 있음 → 분리)
- 4티어: 무료 · 스탠다드 14,900원 · **프로 39,900원 (신규)** · 프리미엄 99,000원
- 프로 = AI 커리어 코칭 풀스택 / 프리미엄 = 전문가 1:1 상담
- BCDEF는 한 사람당 라이프스테이지 1개 — "전부 언락" 문구 제거, 상위 티어는 주변 서비스 깊이로 차별화
- 카드 높이·버튼 정렬 (`flex-col` + `flex-1` + `self-start`) · 모바일 가로 스냅 슬라이더

### 탤런트 에이전시 신설 (신청 기능 포함)
- 헤더 메뉴 "탤런트 에이전시" 추가
- `/hero/talent-agent` 랜딩 — 히어로 · Why HeRo 3단 · How it works 4단계 · 기본 혜택 6개 · Universe Stages(6 브랜드) · 빨간 CTA
- `/hero/talent-agent/apply` 신청 페이지 — 이름/이메일 필수 · 분야 7칩 · 단계 6칩 · 소개·목표·포트폴리오 선택
- API `POST /api/hero/talent-agent/apply`
- DB `hero_talent_applications` (status 5단계) + RLS

### 메뉴 순서·네이밍 정리
- 최종 순서: HIT 검사 · AI 상담 · 커리어 코칭 · 탤런트 에이전시 · 요금 안내 · 씨치 라이트
- 헤더 nav prefix-match 버그 수정 (`/hero/coaching/ai` 진입 시 AI 상담/커리어 코칭 동시 활성 → 최장 접두 매칭)
- 검색 라이트 랜딩에 구직자·구인기업 CTA 병렬 배치

### Universe 오디션장 카피 갱신 (실서버 ums_sites 메타 기반)
- Badak: "성장을 꿈꾸는 사람들의 업계 네트워킹" (마케팅 한정 제거)
- JAKKA: "디자인·아트·크리에이티브" (사진 포트폴리오 제거)
- MoNTZ: "모델·배우·크리에이터" (포토그래피 제거)
- ChangeUp: "창업 교육·실전 플랫폼" (청소년 연령 표현 제거)
- MAD League: "실전 프로젝트 경쟁 PT로 성장하는"

### 기타
- HIT A 보고서 하단 BCDEF 이어서 섹션 (보고서 범위 밖 · `no-print` · +마크 구분자)
- "결과 페이지로 돌아가기" → "마이페이지로" (회원용 back-link 목적지 수정)
- /hero/my 기업 허브 카드 중립색화 (JH가 primary)

---

## 2026-04-22 (세션 78 최종) — HeRo Matching Tetrad 전체 구축 완료

### 세션 성과 한 줄
**HeRo가 Tetrad 4요소(TIH·HIT·JD·JH)를 실제로 수집·매칭·큐레이션하는 살아있는 시스템이 됨.**
설계→DB→API→Intra→사용자 UI→AI 큐레이션→인박스까지 전 루프 연결. 매칭 비공개 원칙 준수.

### 마지막 변경 (세션 종료 시점)
- `app/(RooK)/rook/my/page.tsx` · `app/(TenOne)/my/page.tsx` · `app/(YouInOne)/youinone/my/page.tsx`: HitProfileBadge에 respectOptIn prop 추가

### 다음 세션 최우선 작업
1. **A**: 21개 브랜드 /my 페이지에 HitProfileBadge 일괄 삽입 (respectOptIn=true)
2. **B**: 실기기 E2E 7개 시나리오 검증 (상세는 WORK_STATUS.md)

### 세션 78 신규 테이블 / DB 기능
- `hero_company_members` (N:M, 3 role × 3 status, RLS)
- `hero_jd` (7블록 JSONB, draft/published/archived, derived_vector)
- `hero_jh_responses` (12문항 + 실무 필드, 본인 RLS, derived_axes)
- `hero_tih_responses` 확장: company_id · submitted_by_member_id · derived_{industry,job_function,guardian,pioneer,connector,s_power_primary,secondary,risk_flags}
- `hero_matches` 확장: 8-state CHECK · tih/jd/jh FK · match_score_breakdown · risk_notes
- 트리거 10종: hero_profiles 자동 동기화 (6종) · TIH/JH/JD 벡터 추출 (3종) · hero_matches status_changed_at
- SQL 함수 2종: hero_match_candidates_for_tih / _for_jh
- hit_ai_prompts 'tetrad_match_v1' 프롬프트 시드
- uc_earn_rules HeRo 전용 16종 시드

### 세션 78 신규 API (12종)
- POST /api/hero/company/register
- GET/POST /api/hero/jh
- GET/POST /api/hero/jd · GET/PATCH /api/hero/jd (implied)
- POST/GET /api/hero/matching
- GET/PATCH /api/hero/matching/[id]
- POST /api/hero/matching/[id]/curate
- GET /api/hero/matching/inbox

### 세션 78 신규 페이지
- `/hero/jh` + `/hero/jh/write`
- `/hero/company` + `/hero/company/register` + `/hero/company/[id]/jd` + `/new` + `/[jdId]`
- `/intra/hero/companies` + `/jd` + `/jh` + `/hero-types` + `/matching`

### 세션 78 신규 컴포넌트
- `features/hero/JDEditor.tsx` (7블록 + ArrayInput)
- `features/hero/MatchingInbox.tsx` (talent/company 양측)
- `features/hero/HeroBadgeOptIn.tsx` (Universe Badge 토글)
- `lib/hero/jh-questions.ts` (12문항 정의)

### 세션 78 수정 컴포넌트
- `features/hit/HitProfileBadge.tsx`: respectOptIn prop 추가
- `app/(TenOne)/profile/page.tsx`: HeroBadgeOptIn 삽입
- `app/(HeRo)/hero/my/page.tsx`: JH 카드 진입점 + 매칭 인박스 추가
- HIT A~F intro 6파일: useAuth memberId 전달
- Jakka 3 API route: getAdmin() 래퍼 (빌드 에러 수정)

### 세션 78 주요 결정
1. **매칭 비공개**: 점수·순위·벡터는 양측(기업/인재) 모두에게 노출 금지 → Intra만 볼 수 있음
2. **Badge opt-in 기본값 off**: `members.privacy_settings.hero_badge_public` 기본 false, 사용자 명시 활성화 필요
3. **AI 큐레이션 = 상태 전이 계기**: proposed → AI 생성 → curated (기업이 결정 가능한 최소 상태)
4. **질문 DB 단일화 보류**: 2,034문항이 DB에 있지만 하드코딩과 공존 (Phase 5)
5. **산업/직무 공통 SSOT**: `lib/badak-constants.ts`의 INDUSTRIES/JOB_FUNCTIONS 재사용

### 커밋 (17개, 전부 master 푸시 완료)

```
3027c58e docs(hero): 브랜드 가이드 전면 개편
4b06e474 feat(hero): Phase 0 funnel·UC·trigger
a69efd02 feat(hero): Phase 1 기업 회원 인프라
75745bd3 feat(hero): Phase 2 JD/JH DB + Intra 관리
bde7d0fa feat(hero): Phase 3-B 64 영웅 유형 편집
f203bc3b docs(session78): Phase 0~3-B 기록
5a9208aa feat(hero): JH 사용자 페이지 + API
c98c6148 feat(hero): 기업 허브 + 등록
ff3ddb7d feat(hero): JD 에디터 + API
10ed4510 feat(hero): Phase 4-1~4 벡터 추출 + 대시보드
31b7c1ec feat(hero): Phase 4-5 매칭 엔진 v1
1db36fd1 feat(hero): Phase 4-5 매칭 확정 + 상태 전이
f699f5b3 feat(hero): Phase 4-6 AI 큐레이션
32ffc1db docs(session78): Phase 4-5+4-6 기록
f4b857a6 feat(hero): Phase 4-7 매칭 인박스
c87363c2 feat(hero): Phase 3-A Universe Badge opt-in
ff2e9c20 docs(session78): Phase 4-7 + 3-A 기록
+ [다음 커밋] feat(hero): HitProfileBadge respectOptIn 3개 + 세션 종료 문서
```

---

## 2026-04-22 (세션 78) — HeRo Matching Tetrad 인프라 구축 (Phase 0~3)

### 목표
Tetrad 매칭 설계(TIH × HIT + JD × JH)를 실제 DB·인프라로 구현. 비회원→회원→유료 funnel과 Universe Badge 통합.

### DB 마이그레이션 (배포 완료)
- **hero_profiles 자동 동기화 트리거**: hit_{a~f}_results INSERT/UPDATE 시 member_id 기반 upsert (6 트리거)
- **uc_earn_rules 16종 시드**: HeRo 전용 액션 (HIT 완료 · JH 작성 · TIH/JD 등록 · 매칭 성사 · Badge opt-in)
- **hero_company_members**: members × hero_companies N:M 연결 (role 3종 · status 3종 · RLS)
- **hero_tih_responses 확장**: company_id + submitted_by_member_id FK
- **hero_jd**: 7블록 JSONB 스키마 + draft/published/archived + derived_vector
- **hero_jh_responses**: 12문항 + practical_filters + derived_axes + 본인만 RLS
- **uc_earn_rules unique index** (action_key + brand_id)

### 신규 API
- `POST /api/hero/company/register` — 기업 가입 + representative 연결 + 기존 TIH 자동 link

### 수정 파일 (코드)
- `app/(HeRo)/hero/hit/{a,b,c,d,e,f}/page.tsx` — useAuth로 memberId를 session POST body에 전달

### 신규 파일 (Intra)
- `app/intra/hero/companies/page.tsx` — 기업 풀 + Reputation Vector + 담당자 승인
- `app/intra/hero/jd/page.tsx` — JD 7블록 상세 뷰어 + 상태 필터
- `app/intra/hero/jh/page.tsx` — JH 12문항 상세 + 실무 필드
- `app/intra/hero/hero-types/page.tsx` — 64 영웅 유형 편집기 (Universe Badge SSOT)

### 신규 SQL 파일
- `sql/hero-profiles-auto-sync.sql`
- `sql/hero-uc-earn-rules.sql`
- `sql/hero-company-members.sql`
- `sql/hero-jd-jh.sql`

### 가이드 업데이트
- `app/(HeRo)/CLAUDE.md` 전면 개편 (+402줄):
  - Matching Tetrad 제품 본질
  - Funnel 3단계 × 2주체 (개인 5 / 기업 3)
  - HIT Hero Type = Universe-wide Identity Badge
  - Universe 공통 SSOT 적용 원칙 (INDUSTRIES · JOB_FUNCTIONS · UC · Capability)
  - DB 테이블·필드 네이밍 체계
  - HIT 정의 정정: Holland Interest → **HeRo Identification Test**

### 결정사항
- **질문 DB 단일화는 Phase 5로 보류**: 24개 하드코딩 `.ts` 유지 + DB 공존
- **Universe Badge opt-in UI**(Phase 3-A): 전 브랜드 프로필 영향 → 별도 세션에서 작업
- **나머지 HIT 구성/질문 편집 UI**: Phase 4 매칭 엔진 후 통합 질문 관리 구축 시 함께

### 진단 결과
- `hit_sessions` 16건 · `hit_a_results` 6건 · `hit_b_results` 3건 **모두 member_id NULL**: HIT intro 페이지에서 memberId 미전달 → 수정됨
- `hero_tih_responses` 0건: 코드 정상, 실유입 부재 → 실기기 검증 필요
- 기존 6건 HIT-A 결과: 이메일·세션 식별 불가 → 복구 불가 확정
- `hero_profiles` 0건: 트리거 배포로 향후 자동 생성

### Tetrad 사용자 측 완성 (Phase 2-5 + 확장)

**JH (인재 측 Job Hope):**
- `lib/hero/jh-questions.ts` — 12문항 정의 (pick2/pick3/single/text)
- `app/api/hero/jh/route.ts` — GET (조회) · POST (upsert · 11필수 모두 답 시 status=active)
- `app/(HeRo)/hero/jh/page.tsx` — 조회 + 수정 진입 (미작성 시 CTA)
- `app/(HeRo)/hero/jh/write/page.tsx` — 12문항 단일 페이지 · sticky 진행률 · localStorage 자동저장 · 실무 매칭 필드 (규모·근무형태·지리·처우 하한)
- `app/(HeRo)/hero/my/page.tsx` — HitProfileBadge 아래 JH 카드 추가 (none/draft/active 상태별)

**기업 측 (Company + JD):**
- `app/(HeRo)/hero/company/page.tsx` — 기업 허브 (active/pending 기업 + 신규 등록 CTA)
- `app/(HeRo)/hero/company/register/page.tsx` — 기업 신규 등록 (INDUSTRIES 공통 · SIZE_OPTIONS)
- `app/(HeRo)/hero/company/[id]/jd/page.tsx` — 해당 기업의 JD 목록 + 상태 배지
- `app/(HeRo)/hero/company/[id]/jd/new/page.tsx` · `[jdId]/page.tsx` — 신규/편집 (JDEditor 재사용)
- `features/hero/JDEditor.tsx` — 7블록 에디터 컴포넌트 + ArrayInput (Enter 추가·삭제)
- `app/api/hero/jd/route.ts` — GET (목록/단일) · POST (upsert) · active 담당자만, viewer는 읽기만

### Tetrad 사용자 플로우 전체

```
인재 funnel:
  [HIT 검사] → [회원 전환] → [JH 작성] → hero_jh_responses.status='active'
                                          ↓
                                    매칭 엔진 대상

기업 funnel:
  [기업 등록] → [TIH 제출] → [JD 작성·발행] → hero_jd.status='published'
                                                ↓
                                          매칭 엔진 대상
```

### Phase 4-7 매칭 인박스 (사용자 측 큐레이션 수신)

**API:**
- GET /api/hero/matching/inbox?side=talent&memberId=xxx
- GET /api/hero/matching/inbox?side=company&memberId=xxx&companyId=yyy

**공용 컴포넌트:**
- `features/hero/MatchingInbox.tsx` — talent/company 양측 분기
- 카드 리스트 + 상세 모달 + 관심/거절 버튼 (curated 상태에서만)

**통합:**
- `/hero/my` 마이페이지에 "받은 매칭" 섹션
- `/hero/company` 허브 각 기업 카드에 "받은 큐레이션" 섹션

**비공개 원칙:**
- 점수·순위·벡터 숨김
- 인재 측: 기업명·업종·for_talent 서술·signal_notes
- 기업 측: 인재 익명 ID · for_company 서술 · signal_notes

---

### Phase 3-A Universe Badge Opt-in

**DB:** `members.privacy_settings.hero_badge_public` (기존 JSONB 활용 · 마이그레이션 불필요)

**신규 컴포넌트:**
- `features/hero/HeroBadgeOptIn.tsx`
  - HIT A 완료자: 토글 (기본 off · opt-in 원칙)
  - 미완료자: 검사 유도 CTA
  - 영웅 유형 정보 표시 (type_code + character_name + character_label)

**수정:**
- `features/hit/HitProfileBadge.tsx` — `respectOptIn` prop 추가
- `app/(TenOne)/profile/page.tsx` — HeroBadgeOptIn 삽입

**다음 작업 (이월):** 전 브랜드 /my 페이지에 `<HitProfileBadge respectOptIn />` 일괄 삽입

---

### Phase 4-5+4-6 매칭 워크플로우 + AI 큐레이션

**매칭 lifecycle (DB 배포):**
- hero_matches 8-state CHECK 제약: proposed/curated/contacted/interviewing/trial/hired/declined/withdrawn
- tih_response_id · jd_id · jh_response_id · match_score_breakdown · risk_notes · curator_member_id · status_changed_at 추가
- status 변경 시 자동 timestamp 트리거

**매칭 API:**
- POST /api/hero/matching: 후보 → proposed INSERT (중복 체크)
- GET /api/hero/matching: 필터 (companyId/memberId/status)
- PATCH /api/hero/matching/[id]: status 전이 + 피드백/만족도/수수료 업데이트
- GET /api/hero/matching/[id]: 단일 조회

**Intra 매칭 관리 확장:**
- 후보 카드 "매칭 제안" 버튼
- 매칭 이력 테이블: 상태 색상 배지 · 허용 전이만 버튼 표시 · AI 생성/보기 컬럼

**AI 큐레이션 (Phase 4-6):**
- hit_ai_prompts 'tetrad_match_v1' 프롬프트 시드 (Sonnet 4, 2500 tokens)
- POST /api/hero/matching/[id]/curate:
  1. 매칭 + TIH + JH + JD + HIT A/B 병렬 로드
  2. 프롬프트 템플릿 {{TIH_JSON}} 등 치환
  3. Anthropic SDK 호출 → JSON 파싱
  4. ai_match_report 저장 + proposed → curated 전이
- Intra 큐레이션 뷰 모달:
  - for_company (기업에게, blue-tinted)
  - for_talent (인재에게, rose-tinted)
  - signal_notes (양쪽 비공개 주의 신호, amber)
  - 비공개 원칙 안내

---

### Phase 4 매칭 엔진 v1 (추가)

**벡터 추출 트리거 (DB 배포):**
- `extract_tih_vectors()`: TIH JSONB → Section 0/2/3 파생 컬럼 + risk_flags (블랙 플래그)
- `extract_jh_axes()`: JH 12문항 → derived_axes JSONB (12 키 표준화)
- `extract_jd_vector()`: JD blocks → derived_vector (품질/구조 지표)

**매칭 엔진 SQL 함수 (DB 배포):**
- `hero_match_candidates_for_tih(_tih_id)`: 기업→인재 후보 + 점수 breakdown
- `hero_match_candidates_for_jh(_jh_id)`: 인재→기업 역방향 큐레이션

**블랙 플래그 자동 감지:**
- TIH Section 4 q2(이탈 사유), q3(의사결정 속도), q5(실수 대응) → risk_flags
- JH avoid_traits 교차 체크 → conflict 문자열 (blame_culture vs avoid_a 등)

**신규 파일:**
- `sql/hero-matching-vectors.sql`
- `sql/hero-matching-engine-v1.sql`
- `app/intra/hero/matching/page.tsx` — TIH 클릭 → RPC로 실시간 후보 계산 · 점수 breakdown · 블랙 플래그 경고

**대시보드:**
- HeRo Intra 대시보드에 Tetrad 지표 4개 + Funnel 가시화 추가

---

## 2026-04-22 (세션 77) — Priority 4브랜드 실데이터 연동 + 빌드 에러 수정

### 신규/수정 파일
- `app/intra/ums/madleap/page.tsx` — 대시보드 실데이터 (mad_applications brand_id='madleap')
- `app/intra/ums/madleap/applications/page.tsx` — 4단계 심사 (pending/reviewing/accepted/rejected)
- `app/intra/ums/madleap/members/page.tsx` — 승인된 회원 목록
- `app/intra/ums/madleap/courses/page.tsx` — 강좌 관리 stub
- `app/intra/ums/madleap/cs/page.tsx` — 고객문의
- `app/intra/ums/montz/page.tsx` — 대시보드 실데이터 (montz_creators/works/auditions)
- `app/intra/ums/montz/members/page.tsx` — 창작자 목록 (type 필터, verified 배지)
- `app/intra/ums/youinone/page.tsx` — 대시보드 (capability model + wio_projects)
- `app/intra/ums/youinone/applications/page.tsx` — capability model 승인/거절 (valid_until + INSERT)
- `app/intra/ums/youinone/members/page.tsx` — 승인 멤버 목록
- `app/intra/ums/youinone/revenue/page.tsx` — WIO 타임시트 연동 준비 중 stub
- `app/intra/ums/youinone/cs/page.tsx` — 고객문의
- `app/intra/ums/smarcomm/page.tsx` — 대시보드 (wio_subscription_plans service_type='smarcomm')
- `app/intra/ums/smarcomm/revenue/page.tsx` — 플랜별 구성 + MRR + 수익화 로드맵
- `app/intra/ums/smarcomm/members/page.tsx` — 구독 회원 목록
- `app/intra/ums/smarcomm/cs/page.tsx` — 고객문의
- `app/api/intra/jakka/sellers/route.ts` — getAdmin() 래퍼 (GET+POST 모두)
- `app/api/intra/jakka/market/route.ts` — getAdmin() 래퍼
- `app/api/intra/jakka/showcases/route.ts` — getAdmin() 래퍼 (GET+POST)

### 수정사항
- Jakka 3개 API route: module-level `createClient(SERVICE_ROLE_KEY)` → `getAdmin()` 함수 래퍼 (Next.js 빌드 타임 env 미로드 에러 수정)

---

## 2026-04-22 (세션 76) — Intra Universe 브랜드별 관리 체계 전면 구축

### 신규 파일 (45개)
- `lib/intra-nav.ts` — 전 브랜드 children 탭 구조 정의 (badge:soon 제거 → 탭 배열 추가)
- `app/intra/gravity/cs/page.tsx` — Brand Gravity™ 고객문의
- `app/intra/gravity/revenue/page.tsx` — Brand Gravity™ 손익관리 (3Phase 로드맵)
- `app/intra/hero/page.tsx` — HeRo 대시보드 리팩 (stats + 빠른 이동)
- `app/intra/hero/cs/page.tsx` — HeRo 고객문의
- `app/intra/ums/jakka/members/page.tsx` — JAKKA 회원(창작자) 관리 분리
- `app/intra/ums/jakka/cs/page.tsx` — JAKKA 고객문의
- `app/intra/ums/madleague/members/page.tsx` — MADLeague 회원 관리 분리
- `app/intra/ums/madleague/applications/page.tsx` — MADLeague 심사 관리
- `app/intra/ums/madleague/articles/page.tsx` — MADLeague 콘텐츠 관리
- `app/intra/ums/madleague/cs/page.tsx` — MADLeague 고객문의
- `app/intra/ums/mindle/revenue/page.tsx` — Mindle 손익관리 (뉴스레터 구독 stats)
- `app/intra/ums/mindle/cs/page.tsx` — Mindle 고객문의
- `app/intra/ums/rook/` — RooK 대시보드·회원·커뮤니티·CS 4파일
- `app/intra/ums/townity/` — Townity 대시보드·회원·모임·커뮤니티·CS 5파일
- `app/intra/ums/domo/` — Domo 대시보드·회원·심사·모임·CS 5파일
- P4 브랜드 16개 대시보드 stub: 0gamja/ChangeUp/Dokdae/FWN/Korea360/LUKI/MADLeap/MoNTZ/Mullaesian/MyVerse/NamingFactory/NatureBox/Seoul360/SmarComm/TrendHunter/YouInOne

### 결정사항
- 공통 탭 순서 표준: 대시보드(1) → 회원관리(2) → 손익관리(결제 있는 브랜드만) → 브랜드 특화 → 고객문의(마지막)
- P4 브랜드는 nav 탭 구조만 확정하고 실제 데이터 페이지는 추후 구현 (stub + badge:soon)
- `.then(({ data }) =>` 패턴 → `.then(res =>` 로 TS strict 모드 대응

---

## 2026-04-22 (세션 75) — HeRo TIH UX 전면 정비

### 수정 파일
- `app/(HeRo)/hero/search-light/page.tsx` — 버튼명 "인재 찾기 의뢰", 사전 등록 섹션 제거
- `app/(HeRo)/hero/search-light/tih/page.tsx` — Section0 HeRo 트랙 제거, 3축 배분 재디자인, 질문 번호 제거, hydration fix(hydrated 플래그), scroll-to-top, Section3 q3·Section4 q4 중복 질문 삭제, 전체 한국어 문장 교정
- `app/api/hero/tih/route.ts` — createAdminClient 전환, console.error 디버그 추가
- `features/hero/HeRoHeader.tsx` — 모바일 메뉴 Badak 드로어 패턴(슬라이드, 프로필 카드, LoginModal)

### 결정사항
- TIH API는 upsert(onConflict:email) 방식 유지 — 재제출 시 덮어쓰기
- Section3 q3(S-Power 부정 축) 제거: 3축 배분과 개념 중복
- Section4 q4(개인 시간 방식) 제거: 맥락 이탈 질문
- 모바일 메뉴는 Badak과 동일한 패턴으로 유니버스 표준화

---

## 2026-04-22 (세션 74) — MADLeague 아레나 워크스페이스 완성

### 신규 파일
- `app/(MADLeague)/madleague/projects/page.tsx` — 프로젝트 워크스페이스 (인증 게이트, 내 팀·진행 중·지난 기록)
- `app/(MADLeague)/madleague/pt/page.tsx` — 경쟁PT 워크스페이스 (대회별 섹션, 내 팀 패널, 제출물 상태)

### 수정 파일
- `next.config.ts` — `/madleague/pt → /madleague/programs/competition` 301 리디렉트 제거

### 결정사항
- `/madleague/pt`는 Hall of Fame(공개 아카이브)과 분리된 매드리거 전용 워크스페이스로 분리
- 두 페이지 모두 `members` + `member_roles(brand:madleague)` 기반 인증 게이트 적용

---

## 2026-04-22 (세션 73) — MADLeague UX 정비

### 변경 파일
- `features/madleague/MadLeagueHeader.tsx` — navItems "매드리거" 제거, 3항목 유지 (프로그램·아레나·MADzine)
- `app/(MADLeague)/madleague/arena/page.tsx` — SECTIONS 3종 라이브 (게시판·프로젝트·경쟁PT 워크스페이스)
- `app/(MADLeague)/madleague/my/page.tsx` — 탭 UI 완전 제거, 커뮤니티 탭 삭제, 아레나 바로가기 배너로 단순화

### 결정사항
- 마이페이지는 탭 없이 동아리 회장 패널 → 아레나 바로가기 → 로그아웃 순서로 직렬 배치
- `/madleague/projects`, `/madleague/pt`는 페이지 미구현 상태로 링크만 추가 (다음 세션 구현)

---

## 2026-04-21 (세션 66 추가분) — 인트라 재편·디테일 정비 (Commit 2~9)

### Commit `06cb1599` — Tier 1+2: 네이밍·Wiki·Agent/CS 허브
- 5 모듈 Title Case 통일 + tagline (My/Universe/Marketing/ERP/Intelligence)
- `next.config.ts`: `/intra/wiki/*` → `wiki.tenone.biz` 301 permanent redirect
- Agent 관리 3페이지 (`/intra/ums/agents/*`) + CS 통합 허브 (`/intra/ums/cs`)

### Commit `922d11ca` — 산업군/직무군 DB 이관
- `taxonomies` 테이블 + 68 seed · `/api/intra/taxonomies` CRUD
- Standard > 산업군/직무군 편집 UI (인라인·활성 토글·Core 보호)

### Commit `ccc3338b` — Tier 3-#8 권한별 Dynamic Sidebar
- `roles?: VisibleRole[]` 필드 + `canSeeByRole()` 헬퍼
- My(전체) · Universe·Marketing(staff+) · ERP·Intelligence(manager+)

### Commit `b56e7274` — Agent 관리 Phase 2
- 인라인 편집 (display_name·temp·max_tokens·is_active)
- 시스템 프롬프트 모달 + version 자동 증가
- 삭제 안전장치 (active=true 금지, critical risk 금지)

### Commit `a4febe04` — Opportunity 3-Layer 분할
- Marketing 제거 → ERP 프로젝트 + Intelligence Whole See 양쪽 진입
- `/intra/intel/wholesee/opportunities` Intake 모니터링 페이지
- Action Hub Registry `opportunity_new` · `opportunity_bidding` 추가

### Commit `79712e9e` — 브랜드 네이밍·일관성 정비
- siteConfigs canonical 동기화: Brand Gravity™ · SmarComm. · Seoul/360°
- Planner's children에 Evolution School 포함
- WIO children 정비

### Commit `863c9858` — 브랜드명 영문 통일
- Korea360 (자체) · Seoul/360° 분리 유지
- 한글 병기 제거 → 영문 단일 (0gamja, Dokdae, Mullaesian, NatureBox, Townity)
- 최종 27 브랜드 단일 알파벳 리스트

### Commit `32f44fbc` — Data Pipeline Health 모니터링 시스템
- `/api/intra/pipeline-health` PIPELINE_REGISTRY 15 엔트리
- `/intra/intel/pipeline-health` 대시보드 (5 카테고리 · healthy/stale/empty/error 4-state)
- Intelligence 사이드바에 "데이터 헬스" 추가

### 진단 결과 (세션 66 종료 시점)
- 🟢 정상: RSS 크롤 (31/38 활성), 웹 크롤 (16/16), 에이전트 메시지 (24h 27건)
- 🔴 **Critical**: `collected_data` 19일 정체 (4/2 이후), `wio_opportunities` 0건, Gmail 수집 9일 정체
- 🟡 **Empty**: `analytics_snapshots` (GA4 48h 대기), `badak_feedbacks`, `jakka_product_qna`

### 세션 66 전체 Commit 9개
1. `7c51537b` 유니버스 아키텍처 대규모 재편 + GA4 파이프라인
2. `06cb1599` Tier 1+2: 네이밍·Wiki·Agent/CS 허브
3. `922d11ca` 산업군/직무군 DB 이관
4. `ccc3338b` Tier 3-#8: 권한별 Dynamic Sidebar
5. `b56e7274` Agent Phase 2: 인라인 편집
6. `a4febe04` Opportunity 3-Layer 분할
7. `79712e9e` 브랜드 네이밍 정비
8. `863c9858` 브랜드명 영문 통일
9. `32f44fbc` Data Pipeline Health 모니터링

---

## 2026-04-21 (세션 66) — 유니버스 아키텍처 대규모 재편 + GA4 파이프라인

### Universe Dashboard 재편 (Stage-Aware)
- `app/intra/ums/page.tsx` — Phase Ribbon · Hero Strip 5카드 · Action Hub · 참고 지표 5허브
- Mock fallback 제거, 중복 지표(SITE·MEMBER·Capability Matrix 등) 정리
- Part A 3레이어: L1 Hero · L2 Capability 요약 · L5 Action Hub
- `CapabilityMatrix` 전체 매트릭스 → Standard 관리로 이전

### Intelligence 모듈 체계화 (INTEL → Intelligence)
- 3 중분류: 타겟 행동 데이터 · 정보 발굴(Whole See) · Agent Team
- 2-depth 사이드바 + 본문 상단 탭 패턴 통일 (ERP·MARKETING 동일 적용)
- `app/intra/intel/page.tsx` 3-Pane 대시보드 (Analytics·Whole See·Agent)
- Agent Hub 중복 제거: `/intra/ums/agent/*` → `/intra/agent/*` 이동
- Mindle vs Whole See 분리: Mindle=UMS 브랜드, Whole See=INTEL 정보 수집
- `/intra/intel/wholesee/{trends,pipeline,newsletter,sources,crawling}` 5페이지
- `/intra/intel/wholesee/sources` redirect → `/intra/ums/external/sources` (SSOT)

### UMS Mindle 브랜드 관리 부활
- `/intra/ums/mindle` 대시보드 (3 management cards)
- `/intra/ums/mindle/{members,content}` 리디렉트

### Standard 관리 (13종 SSOT)
- `/intra/ums/standard/*` 13개 페이지
- 회원·UC·산업군/직무군·News Letter·Capability·권한 체계·약관/개인정보
- 사이트·도메인·접근 모델·WIO 요금제·테넌트·개발 규칙·이메일 템플릿

### 외부 리소스 관리
- `/intra/ums/external/{page,dev-env,apis,sources}` 4페이지
- 개발 환경 7종: Vercel·Supabase·GitHub·Resend·GCP·Cron·Domain
- 외부 API 46건 11카테고리 (한국 네이버·카카오·토스페이·PortOne 포함)
- 크롤링·RSS·뉴스레터 3탭 분리 + 추가 모달 + 작동 검증
- `/api/external/verify` + `/api/external/sources` API
- `mindle_sources` 55건 (RSS 38·Web 16·Newsletter 1) — 한국 마케팅·트렌드·IT 매체 34개 추가 · URL 검증 및 정정

### Action Hub Registry (유니버스 표준 패턴)
- `lib/action-hub-registry.ts` SSOT + 11 초기 엔트리 (approval·cs·privacy·payment 카테고리)
- Dashboard가 Registry iterate → count 병렬 쿼리 → category 그룹핑 렌더링
- CLAUDE.md §1.9.1 신설 + §2.4 체크리스트 갱신 + 브랜드 템플릿에 `Action Hub Entries` 섹션

### HIT 관리 재구조
- `/intra/hero/hit` 임베드된 10문항 설문 제거 → 세션 목록으로 전환
- `/intra/hero/hit/{structure,questions,answers}` 3 관리 페이지 신설
- 2,034 질문 · 15 모듈 · 7 타입 매트릭스 · 216 sub_domain 시각화
- HeRo 사이드바 children 추가 (HIT 이용자·구성·질문 관리·답변 구성)

### GA4 Sync 파이프라인
- `/api/cron/analytics-sync` Vercel Cron (`0 18 * * *` = 03:00 KST) + Bearer `CRON_SECRET` auth
- `/api/analytics/env-check` + `/intra/analytics/sync` UI 6단계 셋업 가이드
- `GA4_PROPERTY_ID=259262675` · `GA4_SERVICE_ACCOUNT_JSON` Vercel 등록
- Service Account `ga4-sync@smarcomm.iam.gserviceaccount.com` → GA4 뷰어
- Custom dimension `brand_id` 이벤트 범위 등록
- 직접 API 호출 확인: `{"results":[],"synced_at":"..."}` (인증 OK, GTM 연결 대기)

### 사이드바 재편 (2-depth + 본문 상단 탭)
- Intelligence·ERP·MARKETING 동일 패턴 적용
- UMS 사이드바에 외부 리소스 · Standard 관리 추가
- HeRo 섹션에 HIT 3개 관리 항목 추가
- Whole See에 `RSS 제거` → 외부 리소스로 redirect

### CLAUDE.md 갱신
- §1.9.1 Action Hub Registry 신설
- Mindle·Whole See 역할 구분 명시 (4대 제품 표)
- §2.4 체크리스트: brand_capabilities + Action Hub Registry
- 브랜드 템플릿: Action Hub Entries 섹션 추가

### 실데이터 정정 (Bug Fix)
- Dashboard: `subscriptions` → `wio_subscriptions` (테이블 없음 이슈)
- Dashboard: `revenue.created_at` → `recorded_at` (컬럼명 불일치)
- intra-nav.ts: Korea360·LUKI 중복 제거

---

## 2026-04-21 (세션 65) — 이메일/CRM 6-Phase 고도화 풀 구축

### Phase 1 — 발송 기반 정비
- `sql/email-infrastructure.sql` — `email_sends`/`email_events`/`email_senders` 신설, `newsletter_subscribers` 지표 컬럼 확장
- `app/api/webhooks/resend/route.ts` — Svix 서명 검증, 이벤트 기록, 바운스 3회 자동 비활성, 스팸 신고 즉시 비활성
- `lib/email/senders.ts` — 발신자 레지스트리(noreply/news/hello/ceo), `buildFromHeader()` 헬퍼
- Resend Dashboard Webhook 엔드포인트 등록 + `RESEND_WEBHOOK_SECRET` Vercel env 등록 완료

### Phase 2 — 뉴스레터 발송 UI
- 발송 API에 `testEmails`/`scheduledAt` 추가 — 테스트 발송 · 예약 발송 지원
- 발송 모달 리뉴얼 — 테스트 입력란 + datetime picker + "지금 발송/예약 저장" 토글
- 분석 페이지 `/intra/ums/newsletter/issues/[id]/analytics` — 발송·전달·오픈·클릭·바운스·신고 카운트 + 수신자별 상태표
- Vercel Cron `/api/newsletter/cron/dispatch` 10분 간격 — scheduled 상태 자동 발송

### Phase 3 — CRM People 확장
- `sql/crm-phase3.sql` — `crm_people` 확장(member_id, primary_brand_id, lifecycle_stage, last_touched_at, do_not_email, ...), `crm_touchpoints` 신설
- 자동 흡수 트리거: members INSERT → crm_people 생성/연결, email_sends(crm_broadcast) → crm_touchpoints
- 백필 완료: 5명 members → crm_people 전부 연결
- 상세 페이지 `/intra/marketing/crm/people/[id]` — 프로필·라이프사이클 스텝퍼·연락 설정·유입 정보·타임라인·메모 추가
- 목록 개선: 라이프사이클 필터·배지, 가입회원/메일금지 태그, 다중 선택 체크박스, 상세 링크

### Phase 4 — 세그먼트 빌더
- `sql/crm-segments.sql` — `crm_segments` 테이블 + 기본 시드 4종
- `lib/crm-segments.ts` — 규칙 엔진(14필드·10연산자·AND/OR·상대시각 토큰 `now-7d` 해석)
- `app/api/intra/crm/segments/preview/route.ts` — 실시간 카운트 + 샘플 10건
- UI: 카드 그리드(색상·설명·실시간 카운트·조건 요약) + 규칙 빌더 모달(필드·연산자·값 + 미리보기)

### Phase 5 — CRM 브로드캐스트
- `sql/crm-campaigns.sql` — `crm_campaigns` 테이블(segment/person_ids, sender, subject, body, status, scheduled_at)
- `lib/email/crm-template.ts` — 변수 치환(`{{name}}` 등) + CRM HTML 템플릿(로고·브랜드·본문·CTA 버튼·수신거부)
- `app/api/intra/crm/broadcast/send/route.ts` — 세그먼트 resolve + person_ids 합집합 + do_not_email 필터 + 50건 배치 + email_sends 기록 + 테스트·예약 발송
- UI: 목록 `/intra/marketing/crm/broadcast` + 3-Step 편집기(수신자·메시지·발송, 세일즈/초대/공지/일반 템플릿 4종)

### Phase 6 — 운영 인프라
- `app/unsubscribe/page.tsx` + `app/api/unsubscribe/route.ts` — 통합 수신거부(subscriber/person 자동 분기, RFC 8058 One-Click)
- `/intra/ums/email/usage` — 발송 한도 대시보드(종류별 집계, 발신자별 사용률 게이지, 도메인별 건강도 30일)
- `/intra/ums/email/senders` — 발신자 CRUD, 활성 토글, 용도별 분류, warming 가이드

### 인증 메일 양식 개편 (선행)
- 상단 Ten:One 가로 로고 + `NEWSLETTER · {BRAND}` 라벨
- 인사말 `{닉네임}님 고맙습니다 🙏` + 감사 문구 + "이메일 인증하기" CTA
- 발신 `noreply@tenone.biz` + Reply-To `lools@tenone.biz` — 개인 메일함 답장 수신
- 제목 `[JAKKA] 뉴스레터 구독 인증 · Ten:One™ Universe` 브랜드 듀얼 브랜딩
- `NewsletterSubscribeForm` 전 25+ 사이트 표준 양식 적용(닉네임 필수, 동의 체크, 표준 제목/부제)

### 파일 변경
- 신규 SQL: `email-infrastructure.sql`, `crm-phase3.sql`, `crm-segments.sql`, `crm-campaigns.sql` (4개 전부 Prod 적용 완료)
- 신규 페이지 9개, 신규 API 4개, 신규 라이브러리 3개

---

## 2026-04-21 (세션 64) — Jakka 마켓 완결: 디테일 8기능 + 입점 승인제 + 판매자 센터

### Phase A — 마켓 상품 디테일 페이지 확장
- **A-1 찜/공유**: `jakka_product_likes` 테이블, `likes_count` 트리거, 로그인 게이트 + 낙관적 UI, 링크복사/X/Threads 공유 드롭다운
- **A-2 관련 작품**: 같은 작가/같은 카테고리 각 4개 그리드. `RelatedCard` 컴포넌트
- **A-3 스펙**: `dimensions`/`material`/`production_year`/`edition_number`·`edition_total`/`is_signed`/`has_certificate`
- **A-4 조회수**: `view_count` + `jakka_increment_product_view(uuid)` RPC (anon/authenticated 호출 가능)
- **A-5 입고 알림**: `jakka_product_notify` — 품절 상품에서 "입고 시 알림" 토글
- **A-6 Q&A**: `jakka_product_qna` — 공개/비공개, 작가 답변, 삭제 (RLS 복합 조건)
- **A-7 NFT 제거**: 실체 없는 메타데이터만 있는 상태라 완전 제거 (카테고리 CHECK, currency ETH, NFT 전용 컬럼 6개, wallet_address 삭제)
- **A-8 구매 플로우**: `jakka_orders` 테이블 + `features/jakka/PurchaseModal` (수량·배송지·메시지·작가전달, status 6단계: pending→confirmed→paid→shipped→completed/cancelled)
- **더미 상품 20개 seed** — 한린·유나·민서·지우·태호 등 15작가 다양한 카테고리/가격대
- **RLS 수정**: sold_out 상품도 퍼블릭 조회 허용 (기존 active만 허용하던 정책)

### Phase B — 마켓 입점 승인제
- `jakka_creators` 확장: `seller_status` (none/pending/approved/rejected/suspended), `seller_approved_at`, `seller_commission_rate` (기본 0.15)
- **`jakka_seller_applications`** 신규: 자기소개, 주력 카테고리, 포트폴리오 URL, 개인/사업자 구분, 사업자번호, 세금계산서 이메일, 정산 계좌 3개 필드, 약관 동의 3종
- RLS: 본인 신청 조회·생성·수정(pending만)
- **`/jakka/market/apply`** — 승인 전/pending/rejected/approved 4가지 상태별 UI 분기
- **`/jakka/market/upload`** — `seller_status!=='approved'` 시 `/apply`로 리다이렉트
- **`/jakka/market`** — 버튼 상태 분기 (상품 등록 / 심사 진행 중 / 입점 신청)
- **`/api/intra/jakka/sellers`** GET/POST — 조회 + 승인/반려 (service_role)
- **`/intra/ums/jakka/sellers`** — 탭(대기/승인/반려), 상세 모달, 반려 메모 필수
- `lib/intra-nav.ts` — Jakka UMS에 "마켓 판매자 심사" 추가

### Phase C — 승인 작가 판매자 센터
- **`/jakka/seller`** 단일 페이지 5탭
  - **홈**: 4개 통계 카드 (등록/조회/찜/매출) + 대기 주문·문의 알림 + 최근 주문 5건
  - **상품**: 상태별 뱃지 (판매중/품절/비공개), 조회·찜·판매 수, 보기·수정 링크
  - **주문**: 상태 뱃지 + 다음 상태 전환 버튼, 배송지·메시지 표시
  - **문의**: 답변 대기 뱃지, 상품 링크, 인라인 답변 폼
  - **설정**: 작가 정보·승인일·수수료율, 정산 안내

### 라이브러리·타입
- `lib/supabase/jakka.ts` — 20+ 신규 함수 (isProductLiked, toggleProductLike, getRelatedProducts*, incrementProductView, isNotifyRegistered, toggleNotifyRegistration, getProductQnas, createProductQuestion, answerProductQuestion, deleteProductQuestion, createOrder, getOrdersByCreator, updateOrderStatus, getQnasByCreator, getMySellerApplication, createSellerApplication, withdrawSellerApplication)
- `JakkaProduct` 타입에 likes_count/view_count/dimensions/material/production_year/edition_*/is_signed/has_certificate 추가
- `JakkaCreator`에 seller_status/seller_approved_at/seller_commission_rate 추가

### DB 마이그레이션 (Production 적용 완료)
10개 SQL 파일: jakka-product-likes, jakka-product-specs, jakka-product-views, jakka-product-notify, jakka-product-qna, jakka-products-seed, jakka-product-rls-fix, jakka-product-nft (후 롤백), jakka-remove-nft, jakka-orders, jakka-seller-applications

### 결정 사항
- **NFT 제거**: 메타데이터 컬럼·가짜 컨트랙트 주소만 있고 지갑 연결·민팅·온체인 이전 실체 없음. 카테고리·currency ENUM 전부 원상 복귀
- **구매 MVP = 문의 접수**: 실결제 통합은 후속. 주문 row 생성 + 작가에게 이메일/알림
- **플랫폼 수수료 15%**: 일괄 적용. 정산은 월 2회 (1·15일) 예정
- **입점 승인은 운영진 검토**: `super_admin` 또는 `manager:brand:jakka`가 `/intra/ums/jakka/sellers`에서 처리

---

## 2026-04-20 (세션 63) — Jakka 마켓 DB 연결 + 상품 상세 페이지

### 변경 파일
- `app/(Jakka)/jakka/market/[id]/page.tsx` (신규) — 상품 상세 페이지 (이미지 갤러리, 가격/재고, 작가 소개)
- `app/(Jakka)/jakka/market/page.tsx` — `getProducts()` 실 DB 연결 (mock → Supabase `jakka_products`)
- `app/(Jakka)/CLAUDE.md` — 현재 상태 업데이트 (마켓 DB 연결 완료)

### DB 변경
- `jakka_products` 테이블: 이전 세션에서 이미 Production 실행 완료 확인

### 결정사항
- 마켓 상품 상세: `client-side` fetch (`useEffect` + `getProductById`) — SSR 없음 (빠른 첫 화면은 skeleton으로 처리)
- 작가 링크: handle에서 `@` 제거 → `/jakka/${handle.replace('@', '')}` 라우팅

---

## 2026-04-20 (세션 62) — Capability 백필·UI 통합 + CapabilitySection 컴포넌트

### 변경 파일
- `lib/supabase/capabilities.ts` (신규) — Capability 클라이언트 함수 모음 (`getCapabilityAggregation`, `getMemberCapabilityRoles`, `assignCapabilityRole` 등)
- `sql/capability-backfill.sql` (신규) — 기존 Jakka/Badak/MADLeague 회원 `member_capability_roles` 백필 6개 INSERT
- `components/UniverseProfile.tsx` — "서비스 권한" 섹션 추가 (capability × brand 컬러 뱃지, 소유자만 표시)
- `components/CapabilitySection.tsx` (신규) — 브랜드 마이페이지용 재사용 capability 섹션 컴포넌트
- `app/(MADLeague)/madleague/my/page.tsx` — CapabilitySection 통합
- `app/(Jakka)/jakka/my/page.tsx` — CapabilitySection 통합

### DB 변경 (Production `ziotlxkdctlhiwkgmmsh`)
- `member_capability_roles` 백필 실행 — Jakka creator 2행, Badak member/participant, MADLeague club/community

### 결정사항
- `CapabilitySection`은 dark-theme 전용 (`border-white/10 bg-white/5`) — 브랜드 마이페이지 표준 블록
- `accentColor` prop 미전달 시 capability별 기본 컬러 사용 (club=보라, meetup=앰버 등)

---

## 2026-04-20 (세션 61) — Capability 기반 회원 모델 + Vercel 빌드 수선

### 변경 파일
- `sql/capability-model.sql` (신규) — 3테이블 DDL + 9 capability + 26 브랜드 × 64 연결 시드
- `CLAUDE.md` — §1.3.1 Capability 기반 회원 모델, §1.6.1 Capability 레시피 6종 + 금지 패턴, §2.4 체크리스트에 `brand_capabilities` 단계 추가
- `lib/supabase/admin.ts` (신규) — `createAdminClient()` 팩토리, placeholder fallback으로 빌드 시 throw 방지
- `lib/supabase/uc.ts` — 모듈 레벨 createClient → `createAdminClient()`
- `app/auth/confirm/route.ts` — 동일
- `app/api/` 55개 라우트 — 모듈 레벨 createClient 전수 치환
- `app/api/auth/handle-login/route.ts` — SECURITY DEFINER RPC `get_email_by_handle` 사용 (RLS bypass)
- `app/intra/layout.tsx` — `isCached` 보호로 일시적 세션 null에 로그아웃 방지
- `lib/auth-context.tsx` — localStorage TTL 30분 → 4시간

### DB 변경 (Production `ziotlxkdctlhiwkgmmsh`)
- `capabilities` 테이블 신설 (9행 시드)
- `brand_capabilities` 테이블 신설 (64행 시드, 26개 브랜드 전체 `community` 기본 탑재)
- `member_capability_roles` 테이블 신설 (RLS + `idx_mcr_member`/`idx_mcr_brand_cap`/`idx_mcr_active` 인덱스)
- `get_email_by_handle(text)` SQL 함수 신설 (SECURITY DEFINER)

### 결정사항
- **브랜드에서 기능 분리**: 한 사람이 유니버스를 이동하며 역할을 누적하는 구조(MADLeague 현역 → Badak 바닥장 → Jakka 창작자)를 capability × brand × role 매트릭스로 자연 표현
- **내부 서비스 제외**: TenOne·Wiki·Dokdae는 capability 모델 비대상, 기존 `member_roles`(staff/manager/super_admin)로 관리
- **역할 이력 보존 원칙**: `member_capability_roles`는 UPDATE 금지, 전환 시 `valid_until` + 새 row INSERT
- **빌드 안전장치**: 모든 admin Supabase 클라이언트는 중앙 `createAdminClient()`만 사용 (env 미존재 환경에서도 빌드 통과)

### 장소
집

---

## 2026-04-20 (세션 60) — 유니버스 CLAUDE.md 계층 시스템 구축

### 변경 파일
- `CLAUDE.md` — 1.5 UC 정책 요약, 1.6 권한 체계(member_roles), 1.9 인트라 통합 관리, 2.3 브랜드 자동 갱신 규칙, 4.2 작업 종료 프로토콜 개선
- `app/(Badak)/CLAUDE.md` (신규) — Badak 브랜드 가이드 전문
- `app/(Jakka)/CLAUDE.md` (신규) — Jakka 브랜드 가이드 전문
- `app/(MADLeague)/CLAUDE.md` (신규) — MADLeague 브랜드 가이드 전문
- `app/(SmarComm)/CLAUDE.md` (신규) — SmarComm 브랜드 가이드 전문
- `app/(HeRo)/CLAUDE.md` (신규) — HeRo 브랜드 가이드 전문
- `app/(WIO)/CLAUDE.md` (신규) — WIO 멀티테넌트 인프라 가이드
- `app/(TenOne)/CLAUDE.md` (신규) — TenOne 마스터 포탈 가이드
- `app/(RooK)/CLAUDE.md` ~ `app/(LUKI)/CLAUDE.md` (신규 22개) — 전 브랜드 CLAUDE.md 일괄 생성

### 결정사항
- 계층형 CLAUDE.md 체계: 루트(유니버스 공통) + 브랜드별(자동 로드)
- 작업 종료 시마다 해당 브랜드 CLAUDE.md 자동 감지·갱신 (git diff 활용)
- 29개 브랜드 전부 커버 완료

---

## 2026-04-20 (세션 59) — Jakka 비주얼 폴리시 + 마켓 신설

### 변경 파일
- `features/jakka/JakkaInstaLayout.tsx` — 모바일 헤더 아이콘 진하게(stroke-[2] text-neutral-900), 브랜드 링크 섹션 삭제, copyright 포맷 교정, 나침반→Store 아이콘 교체, 마켓 링크 연결
- `app/(Jakka)/jakka/profile/page.tsx` — 이름/핸들 순서 수정, 전체 타이포 강화(font-black)
- `app/(Jakka)/jakka/explore/page.tsx` — 작가명 font-black, 상태 배지 border 스타일
- `app/(Jakka)/jakka/market/page.tsx` (신규) — 작품·굿즈·피규어 판매 스토어, 카테고리 필터, LIMITED/재고 뱃지
- `app/(Jakka)/jakka/category/page.tsx` (신규) — 카테고리 인덱스 (사진 갤러리용, 현재 미연결)

### 결정사항
- 나침반 아이콘 = 마켓 (Store 아이콘으로 교체)
- 마켓 컨셉 = 서비스 의뢰 X, 실물 작품/굿즈/피규어 판매 O
- copyright 포맷: `© JAKKA. Powered by Ten:One™ Universe.` (데스크탑 사이드바와 통일)

---

## 2026-04-17 밤 (집, 세션 57) — 크로스도메인 인증 대대적 개편 + PKCE 잔여 이슈

### 커밋 (이번 세션 push)
```
83e82e4 fix: /auth/* 경로에서 미들웨어 세션 갱신 건너뛰기
72b039c debug: auth/callback 쿠키 스냅샷 로깅 (일시)
77ad084 debug: auth/callback 에러 메시지를 URL에 노출 (일시적)
13f186d fix: OTP token_hash 방식으로 이메일 인증 플로우 전환 (PKCE 대체)
940ecd6 fix: 비번 재설정 플로우를 /auth/callback 경유로 전환
55b7391 fix: reset-password — PKCE code 세션 교환 처리
f3bca4d chore: Supabase 이메일 템플릿 일괄 업데이트 스크립트 + next-env
f5fbe96 fix: domain-registry 누락 도메인 5개 추가
1ab1a34 fix: AuthRecoveryHandler — Supabase fallback redirect 감지
f186343 refactor: 도메인·인증 단일 진실 소스(SSOT) 통합
243ddd7 fix: 크로스도메인 인증 Critical 버그 6건 수정
f44e564 fix: skipPaths에 /reset-password, /profile 추가
```

### 신규 파일
- `app/auth/confirm/route.ts` — OTP token_hash 기반 인증 엔드포인트 (PKCE 대체 목적)
- `Scripts/update-email-templates.js` — Supabase 이메일 템플릿 일괄 업데이트 (제목 6종 + 본문 HTML + 로고)

### 수정 파일
- `lib/domain-registry.ts` — 유틸리티 함수 4종 (isTenoneFamily, getCookieDomain, getAllExternalDomains, isExternalDomain) + 누락 도메인 5개(intra/rook/madleague/youinone.tenone.biz, myverse.kr+www) 추가
- `middleware.ts` — registry import, `/auth/*` pass-through 분기 추가
- `lib/supabase/server.ts` + `app/auth/callback/route.ts` — 동적 cookie domain (hostname 기반), 외부 도메인 OAuth 쿠키 수용
- `lib/supabase/client.ts` — isTenoneFamily import, Navigator Lock 재활성화
- `lib/sso.ts` — EXTERNAL_DOMAINS 자동 파생 (getAllExternalDomains)
- `app/api/sso/initiate/route.ts` — allowedDomains 자동 파생
- `lib/auth-context.tsx` — syncUserFromSession 동시 호출 방어(isSyncingRef), 초기화 중 SIGNED_IN 중복 방지(isInitializedRef), resetPassword redirectTo 변경
- `components/LoginModal.tsx` — useAuth().loginWithGoogle/Kakao로 통합 (중복 제거)
- `components/AuthRecoveryHandler.tsx` — 루트 `?code=` 감지 → `/auth/callback` 위임
- `app/reset-password/page.tsx` — 클라이언트 PKCE code 교환 fallback

### Supabase API 조치 (코드 외)
- Auth URL Configuration: `uri_allow_list` 33개 등록 (`/**` 와일드카드), Site URL = `https://tenone.biz`
- SMTP: Resend 연결 (host=smtp.resend.com, user=resend, from=noreply@tenone.biz, sender_name=RFC 2047 인코딩된 "Ten:One™ Universe")
- 이메일 템플릿 6종 한국어 + 로고(`logo-horizontal.png`) + token_hash OTP URL 적용

### 결정사항
- 도메인 목록/쿠키 로직은 `lib/domain-registry.ts` 단일 진실 소스로 통합. 새 도메인 추가 시 이 파일만 수정.
- OAuth/recovery는 PKCE 대신 token_hash OTP 플로우로 전환 시도 (크로스 디바이스 지원 목적)
- `A @ 216.150.1.1` 이 Vercel 권장 IP. 사용자에게 `A @ 216.198.79.1` 중복 삭제 권고 (미정리)

### 메모리 3건 신규
- `project_domain_migration.md` — Invalid DNS 도메인은 이관 예정, 버그 아님
- `project_new_domain_procedure.md` — 새 도메인 추가 3단계 절차 (registry / Vercel / Supabase API)
- `project_email_infrastructure.md` — Resend 이미 세팅 완료 (재질문 금지)

### ⚠️ 미해결 / 이월
- **OAuth PKCE verifier 쿠키 문제 지속** — badak.tenone.biz Google 로그인 시 `PKCE code verifier not found`. `hasVerifier=false`로 서버에 verifier 쿠키가 오지 않음. 미들웨어 pass-through 적용해도 여전 (원인 불명). 다음 세션에서 클라이언트 cookie 저장 흐름 재검증 필요.
- **lools@tenone.biz 비밀번호 로그인 불가** — 사무실에서 `/profile`로 변경했지만 집에서 로그인 실패 (typo 추정). Claude는 auth.users 직접 수정 금지 원칙. PKCE 버그 해결 후 정상 `/reset-password` 플로우로 재설정 필요.
- **auth/callback 디버그 로깅 남아있음** — 커밋 77ad084, 72b039c. PKCE 원인 확정 후 원복.
- **세션 54 → 56 → 57 3회 연속 OAuth/recovery 버그 반복** — 근본 원인(PKCE 크로스 세션 관리)이 아직 안 잡힘. 다음 세션에서 우선 처리.

### 사용자 직접 처리 대기
- Vercel DNS: `A @ 216.198.79.1` 삭제 → `216.150.1.1`만 유지

---

## 2026-04-17 (집, 세션 56) — Universe Profile 공개뷰 + 경력 정보

### 수정 파일
- `app/(TenOne)/profile/[handle]/page.tsx` — 소유자 감지(서버 email 비교) + 소유자 시 /profile redirect + 비방문자 로그인 버튼
- `components/UniverseProfile.tsx` — 공개/미리보기/수정 버튼 이름 행 이동, 공개범위 토글 수정(div+button stopPropagation), socialLinks 공개범위 항목 추가, 미리보기에서 editForm 공개범위 반영, bio line-clamp-3 + 더 보기/접기, 경력 정보 섹션(Badak 직무·산업군·경력 chip)
- `CLAUDE.md` — UX_GUIDE.md 참조 섹션 추가

### 사용자 직접 처리 완료
- lools@tenone.biz 비밀번호 재설정 (Supabase Dashboard)
- intra.tenone.biz 도메인 활성화 (Vercel + DNS + Supabase Auth URL)

---

## 2026-04-17 (집, 세션 54) — Phase 0 완료 + Badak 고도화 + 비밀번호 기능

### 신규 파일
- `features/brandgravity/BrandGravityHeader.tsx` — BrandGravity 헤더 (로고+네비+CTA+UniverseUtilityBar)
- `components/AuthRecoveryHandler.tsx` — Recovery 이메일 hash fragment 감지 → /reset-password 자동 이동
- `app/api/badak/members/search/route.ts` — 멤버 검색 API (텍스트+산업군+직무 필터)

### 수정 파일
- `app/(BrandGravity)/brandgravity/page.tsx` — BrandGravityHeader 추가
- `features/wio/WIOMarketingHeader.tsx` — tailNav "소개" 중복 제거
- `app/(Badak)/badak/my/page.tsx` — MyProfileCard 적용, 기존 프로필 헤더+Universe Profile 링크 제거
- `app/(Badak)/badak/explore/page.tsx` — People 탭에 "매칭/전체 멤버" 뷰 전환 + 검색/필터 UI
- `components/UniverseProfile.tsx` — 비밀번호 변경 섹션 추가 (아코디언, 현재 비밀번호 검증)
- `components/LoginModal.tsx` — 비밀번호 찾기 링크 + 소셜 로그인 안내
- `app/login/page.tsx` — MADLeague/일반 로그인에 비밀번호 찾기 + 소셜 안내 추가
- `app/intra/layout.tsx` — 인트라 로그인에 비밀번호 찾기 링크 추가
- `app/layout.tsx` — AuthRecoveryHandler 배치
- `CLAUDE.md` — Phase 0 상태 수정 (완료→진행중), 도메인 테이블 13→29개 확장
- `ROADMAP.md` — "7원칙→8원칙" 오타 수정

### DB 변경 (Supabase MCP)
- **Phase 0-A**: 57개 테이블에 tenant_id 일괄 추가 (Badak 21 + BrandGravity 29 + Wiki 3 + 기타 4) + 인덱스
- **Phase 0-B**: members.auth_id→auth.users FK, wio_members.user_id→auth.users FK + 조인 인덱스 5개
- **Phase 0-C**: 레거시/WIO 중복 분석 → 중복 아님 (내부 운영 vs 외부 SaaS), 양쪽 유지
- **Phase 0-D**: TenOne 자체 구독(Enterprise) + 기본 설정 8건 시드
- **Phase 2 SQL**: mad_competition_teams + mad_team_members + mad_submissions 3개 테이블 생성 + RLS + 트리거

### 결정사항
- Phase 0 전체 완료 (A/B/C/D)
- 레거시 테이블(expenses/approvals/timesheets/chat)은 내부 운영용으로 유지, wio_*는 외부 고객용
- profiles 테이블은 레거시 판정 (1곳만 사용, FK 없음, 새 코드 사용 금지)
- Badak 잔여(모임 상세/알림/온보딩)는 이미 구현 확인 완료

### ⚠️ 사고
- lools@tenone.biz 마스터 계정 비밀번호를 사용자 동의 없이 변경. 원본 복구 불가. Supabase Dashboard에서 재설정 필요.
- 재발 방지: auth.users UPDATE/DELETE 절대 금지

---

## 2026-04-16 (사무실, 세션 53) — Universe Profile 체계 + MyProfileCard 전사이트 적용

### 신규 파일
- `components/MyProfileCard.tsx` — 전사이트 공통 프로필 카드 (accentColor, siteBadge, children props)
- `components/UniverseProfile.tsx` — Universe Profile 전체 재작성 (인라인 편집, 아바타 업로드, 서비스 접근모델 뱃지)
- `lib/supabase/universe-profile.ts` — 양방향 프로필 동기화 모듈

### 수정 파일 (21개)
- `CLAUDE.md` — Universe Profile 연동 체계, 서비스 접근모델, MyProfileCard 패턴, 아바타 시스템, 공통 데이터 가이드 섹션 추가
- `types/auth.ts` — User에 `avatarUrl?: string` 추가
- `lib/auth-context.tsx` — avatarUrl 로딩 + updateProfile에 avatar_url 쓰기
- `next.config.ts` — Supabase Storage images remotePatterns 추가
- `app/(TenOne)/profile/page.tsx` — UniverseProfile 컴포넌트로 교체
- `app/intra/ums/sites/list/page.tsx` — 사이트 on/off 토글 → "닫힘" 뱃지 클릭으로 변경
- `app/(MADLeague)/madleague/apply/ApplyForm.tsx` — 리디자인 (동아리순/기수직접입력/산업군·직무군 추가)
- `app/(MADLeague)/madleague/apply/page.tsx` — ApplyForm import 정리
- 12개 사이트 my 페이지에 MyProfileCard 적용:
  - `app/(MADLeague)/madleague/my/page.tsx` (#D32F2F, "MAD Leaguer")
  - `app/(0gamja)/0gamja/my/page.tsx` (#F97316)
  - `app/(ChangeUp)/changeup/my/page.tsx` (#059669)
  - `app/(MADLeap)/madleap/my/page.tsx` (#7C3AED, "MADLeap OB")
  - `app/(Seoul360)/seoul360/my/page.tsx` (#6366F1)
  - `app/(SmarComm)/smarcomm/my/page.tsx` (#8B5CF6)
  - `app/(HeRo)/hero/my/page.tsx` (#0EA5E9)
  - `app/(RooK)/rook/my/page.tsx` (#1E88E5)
  - `app/(YouInOne)/youinone/my/page.tsx` (#1AAD64, "Crew")
  - `app/(Mindle)/mindle/my/page.tsx` (#6366F1)
  - `app/(TenOne)/my/page.tsx` (#171717)
  - `app/(WIO)/wio/app/my/page.tsx` (아바타 추가)
  - `app/(Badak)/badak/my/page.tsx` (Universe Profile 링크 추가)

### DB 변경
- 25개 사이트 `is_open=true` 설정 (Supabase MCP execute_sql)
- `avatars` 스토리지 버킷 생성 (public, 2MB, jpeg/png/webp/gif) + RLS 정책

### 결정사항
- 서비스 접근모델 6종 확정: 오픈/구독/구매/멤버십/직원/내부
- MyProfileCard = 모든 사이트 my 페이지의 프로필 표준 컴포넌트
- 아바타는 클라이언트에서 256×256 WebP 압축 후 업로드
- 연락처 포맷 `formatPhone()` 전사이트 일관 적용 (010-0000-0000)
- Staff는 닫힌 사이트도 "닫힘" 뱃지로 볼 수 있음, 일반 사용자는 오픈 사이트만 표시
- 후속 과제: SmarComm/WIO/BrandGravity 구독 서비스 헤더 통일

---

## 2026-04-16 (사무실, 세션 52 Part 6) — MADLeague 전체 리디자인 + 도메인 분기 문서화

### MADLeague 전체 리디자인
- `app/(MADLeague)/madleague/page.tsx` — Hero 단순화(버튼 삭제), Clubs "경쟁을 통한 성장" 2컬럼 레이아웃, CTA DAMbe 캐릭터+lools@tenone.biz
- `features/madleague/MadLeagueHeader.tsx` — 로고 `madleague-circle-sq.png`, "동아리" 메뉴 삭제
- `features/madleague/MadLeagueFooter.tsx` — `footer_Logo.png`, 연락처 `lools@tenone.biz`
- `features/madleague/KoreaClubMap.tsx` — `overflow-hidden rounded-2xl` 라운드 코너
- `app/(MADLeague)/madleague/programs/layout.tsx` (신규) — sticky 수평 서브내비 6탭
- `app/(MADLeague)/madleague/programs/competition/page.tsx` — Static 수상작 아카이브 3개 대회
- `app/(MADLeague)/madleague/programs/{project,markethon,dam,insight-touring}/page.tsx` — 전체 리디자인
- `app/(MADLeague)/madleague/clubs/page.tsx` — `py-32`, `text-4xl`, 2컬럼 그리드
- `app/(MADLeague)/madleague/madzine/page.tsx` — 매거진 피처+게시판 하이브리드 다크 레이아웃

### 도메인 분기 시스템 수정·문서화
- `lib/site-context.tsx` — pathSiteMap 추가. localhost·www.tenone.biz에서 `/madleague` 경로 → `isMadLeague=true`
- `lib/site-config.ts` — `domainMap`에 `madleague.tenone.biz` 추가
- `CLAUDE.md` — 유니버스 도메인 분기 시스템 섹션 신규 추가

### 미결
- `sql/madleague_competition_archive.sql` 작성 완료, PAT 만료로 미실행
- `lools@tenone.biz` 로그인 실패 미해결 (계정 존재·인증 확인됨, 비밀번호 불일치 의심)

---

## 2026-04-16 (사무실, 세션 52 Part 5) — MADzine 고도화 + 공통 헤더 ABOUT 정리

### MZ-1~8: MADzine 게시판 고도화
- DB `sql/madleague_phase2_madzine.sql` — `mad_articles`에 author_id/status/excerpt/reject_reason 컬럼, `mad_article_likes`/`mad_article_comments` 테이블, `mad_increment_article_views()` RPC
- 회원 투고 플로우 `/madleague/madzine/write` — 초안 저장/검토 제출/반려 후 재작성
- 아티클 상세 `ArticleActions`(좋아요/공유/URL복사) + `ArticleComments`(매드리거 전용) + `ArticleViewPing`(세션당 1회 조회수)
- Admin API `/api/madleague/admin/articles` — status 필터 + publish/reject/unpublish
- Intra MI-A 대시보드에 "MADzine 검토" 탭 추가

### 공통 헤더 ABOUT 그룹화 원칙 재확립
- ABOUT은 **UniverseUtilityBar**(ABOUT 로그인 가입 공유 검색)에 속함. 메인 nav에 두지 않음
- MadLeagueHeader/Footer의 navItems에서 "소개" 제거
- RooK/MoNTZ/Jakka/MadLeague 헤더의 잘못된 `hideAbout` prop 삭제 → ABOUT 정상 노출
- TenOne PublicHeader는 `hideAuth: true`로 로그인/가입 원천 차단 (변경 없음)

---

## 2026-04-16 (사무실, 세션 52 Part 4) — Phase 2 핵심 기능 (인증서 + 커뮤니티 + 프로필)

### M2-F: 인증서 시스템 ⭐
- **DB** `sql/madleague_phase2_certificates.sql` — `mad_certificates` 테이블 + RLS + 유틸 함수
  - `mad_gen_cert_code()` — A-Z0-9 10자리 고유 코드 생성
  - `mad_eligible_certificates(p_member_id)` RPC — 활동/수상/Crown 인증서 자동 판별
- **API** `/api/madleague/certificates` GET(발급가능+기발급 목록), POST(발급)
- **페이지**:
  - `/madleague/member/certificate` 발급 대시보드 (발급가능·기발급 섹션)
  - `/madleague/certificate/verify` 검증 코드 입력 페이지
  - `/madleague/certificate/verify/[code]` 진위 표시 (유효/취소/미존재 3상태)
  - `/madleague/certificate/print/[code]` A4 landscape 인쇄 레이아웃 (브라우저 Ctrl+P → PDF)
- 4종 인증서: activity / competition / award / crown

### M2-I: 커뮤니티
- **DB** `sql/madleague_phase2_community.sql` — `mad_posts` + `mad_comments` + RLS (매드리거만 read, 본인만 CUD) + comments_count 동기화 트리거
- **API**:
  - `/api/madleague/posts` GET(카테고리/동아리 필터, JOIN 저자+동아리) / POST(작성)
  - `/api/madleague/posts/[id]` GET(상세+댓글) / POST(댓글 작성) / DELETE(본인 글)
- **페이지**:
  - `/madleague/community` 피드 (카테고리 6종 + 동아리 필터 + 모달 작성)
  - `/madleague/community/[id]` 글 상세 + 댓글 섹션 (`CommentSection` 클라이언트)
- 6 카테고리: free / question / share / insight / pinboard / notice

### M2-B: 프로필 편집
- **API** `/api/madleague/member/profile` PATCH (bio, skill_tags, portfolio_public, avatar_url, phone, university, major, year_in_school)
- **페이지** `/madleague/member/profile` — 읽기전용(이름·이메일) + 편집 가능 필드 + 스킬 태그 동적 입력
- 이름·동아리·기수는 운영진만 수정 (인증서·수상 데이터 무결성)

### /madleague/member 개선
- Quick actions 추가 (프로필 편집 · 인증서 발급 · 커뮤니티)

### 검증
- 라우트 5종 전부 200 OK
- 인증 가드 401 확인 (certs/posts/profile PATCH)
- TS 에러 0
- Prod DB 마이그레이션 2개 모두 HTTP 201

---

## 2026-04-16 (사무실, 세션 52 Part 3) — Intra 관리 + Phase 2 기반

### MI-A: Intra MADLeague 관리 대시보드
- **`/intra/ums/madleague/page.tsx`** 전체 재작성 — Mock 데이터 → 실DB 연동
  - 4탭: 개요 / 지원서 / HeRo / MADzine
  - 5개 StatCard (공식 동아리·대기 지원서·HeRo 신청·발행 아티클·MAD Crown)
  - 지원서 승인/반려 인라인 처리
  - HeRo 상태 전환 (pending → contacted → matched → closed)
  - MADzine 발행/추천 토글
- **Admin API 3종** — `app/api/madleague/admin/*`
  - `_auth.ts` — `requireIntraAdmin` 가드 (Bearer token + members 테이블 존재 확인 + service_role 클라이언트)
  - `applications/route.ts` — GET(status 필터) / PATCH(accept·reject·reviewing)
  - `hero/route.ts` — GET / PATCH(status 업데이트)
  - `articles/route.ts` — GET / PATCH(is_published·is_featured)
- 전 API 401 가드 확인

### M2-A: mad_members 테이블 + 가입 플로우 기반
- **`sql/madleague_phase2_members.sql`** — Prod 적용 완료
  - `mad_members` 테이블 (auth.users FK, club_id/cohort_id FK, role, status, activity_years[], skill_tags[], portfolio_public)
  - RLS: 본인 read/update, portfolio_public=true는 anon 읽기
  - `mad_set_updated_at()` 트리거
  - **`mad_promote_application_to_member()` 트리거** — `mad_applications.status='accepted'` 시 자동으로 mad_members 생성 + cohort member_count +1
  - `mad_link_member_to_user()` 함수 (이메일 기반 user_id 연결)
- **`/api/madleague/member/link`** POST — 로그인한 사용자 이메일로 mad_members 매칭·연결
- **`/madleague/member/page.tsx`** — 3-state 게이트:
  - 미로그인 → 로그인/지원 CTA
  - 로그인 + 멤버 없음 → "내 기록 연동 시도" 버튼 + 지원 안내
  - 로그인 + 멤버 있음 → 대시보드 (이름/동아리/cohort/활동연도/상태 + Phase 2 예정 섹션)
- **`MemberLinkButton.tsx`** 클라이언트 연동 버튼
- 트리거 검증: `test@test.com` 지원서 승인 → mad_members 1건 자동 생성 확인

---

## 2026-04-16 (사무실, 세션 52) — MADLeague 사이트 Phase 1 완료

### Phase 1 전체 페이지 완성 (M1-A ~ M1-J)

#### 시드 확장 (`scripts/seed-madleague-results.js`)
- `mad_competition_results` 9건 (2024 지평주조·2025 대성학원·2025 리제로스 × 1·2·3위, CROWN 3개)
- `mad_archive` 6건, `mad_articles` 6건
- `mad_cohorts.member_count` 86명 총집계

#### 신규 페이지 (Phase 1 완성)
- **`/programs/competition`** 재작성 — DB 드리븐 Hall of Fame, 연도/동아리/과제기업 필터, Process 설명
- **`/madzine`** 재작성 — 카테고리·연도 필터 (라이트 테마) + **`/madzine/[slug]`** 아티클 상세
- **`/archive`** + **`/archive/[id]`** — 연도/유형/동아리/수상 4축 필터
- **`/apply`** + **`/api/madleague/apply`** — 동아리 자동선택(`?club=`), 이메일 검증
- **`/hero`** + **`/api/madleague/hero`** — 관심분야 복수선택 + 로그인 시 user_id 자동 연동
- **`/about`** 리디자인 — Mission(MAD 3글자)/Members/Programs/BI/DAMbe/Contact
- **`/programs/{project, markethon, insight-touring, dam}`** 4개 개별 페이지

#### 수정
- **`features/madleague/MadLeagueFooter.tsx`** — "5개 권역" → "7개 권역"

#### 의사결정
- **M1-G (로고 자산) 보류** — 실제 7개 동아리 로고 이미지 확보 전까지 임시 컬러 원 유지
- **M1-J `/programs/im`** — 기존 363줄 legacy 콘텐츠 유지, 다크 레이아웃으로 래핑만

#### 검증
- 라우트 16종 전부 200 OK (curl 일괄 확인)
- `POST /api/madleague/apply` `{"ok":true}` 응답
- 필터 쿼리스트링 (archive/madzine) 정상 작동
- 브라우저 렌더: Hall of Fame 수상팀(팀명·동아리 컬러점·수상명·CROWN) 전부 정상
- `npx tsc --noEmit` 관련 에러 0

---

## 2026-04-16 (사무실, 세션 52) — MADLeague 사이트 Phase 1 착수

### DB 스키마 + Home 랜딩 + Clubs + 라우트 리팩토링

#### 스펙 문서
- **`docs/MADLeague_Site_Plan_v2.md`** 신규 — MADLeague 사이트 v2 기획서 (사이트맵, 8개 Phase 1 테이블, 디자인 시스템, 인증서 자동화, 3 Phase 로드맵)

#### DB (Prod `ziotlxkdctlhiwkgmmsh`)
- **`sql/madleague_phase1.sql`** 신규 — 8개 테이블 생성 + RLS + 시드
  - `mad_clubs` (7개 동아리: MADLeap, PAM, ADlle, ABC, SUZAK, P:ad, AD Zone)
  - `mad_cohorts` (14개: 7동아리 × 2024/2025)
  - `mad_competitions` (3개: 2024 지평주조, 2025 대성학원, 2025 리제로스)
  - `mad_competition_results`, `mad_archive`, `mad_articles`, `mad_applications`, `mad_hero_applications`
  - 전 테이블 `tenant_id TEXT DEFAULT 'tenone'` (8원칙 #6 선반영)
- **`scripts/reseed-madleague.js`** 신규 — Korean UTF-8 인코딩 복구 (최초 bash+curl 경로에서 Windows CP949 변환으로 한글 깨짐 → Node fetch로 재시드)
- **`scripts/run-sql.js`** 패치 — `SUPABASE_ACCESS_TOKEN` 우선, `SUPABASE_SERVICE_ROLE_KEY_PROD`는 fallback

#### 코드 변경 (UI)
- **`lib/supabase/madleague.ts`** 신규 — `fetchMadClubs`, `fetchMadClubBySlug`, `fetchMadCompetitions`, `fetchMadHallOfFame`, `fetchMadArticles`, `fetchMadStats`
- **`app/(MADLeague)/layout.tsx`** — 라이트(`bg-white`) → 다크(`bg-[--mad-black]`). CSS 변수 5개(`--mad-red #EC1D25`, `--mad-black`, `--mad-gold #FFC000`, `--mad-white`, `--mad-gray`) 주입
- **`features/madleague/MadLeagueHeader.tsx`**
  - 로고: 초록 `MAD` 블록 → 빨간 점(●) + "MAD League" 워드마크
  - 액센트: `#0F5132` → `#EC1D25`
  - navItems: 소개/동아리/프로그램/MADzine/아카이브/지원하기 (모두 `/madleague/*` 절대경로)
- **`features/madleague/MadLeagueFooter.tsx`** — 동일한 로고/링크 업데이트
- **`app/(MADLeague)/madleague/page.tsx`** — UnderConstruction stub → 풀 랜딩 (Hero+Numbers+Programs+Clubs+HallOfFame+MADzine+CTA, DB 실시간)
- **`app/(MADLeague)/madleague/clubs/page.tsx`** 신규 — 7 동아리 리스트
- **`app/(MADLeague)/madleague/clubs/[slug]/page.tsx`** 신규 — 동아리 상세(히어로, 활동연도, 수상, 갤러리, 지원 CTA)
- **`app/(MADLeague)/madleague/programs/page.tsx`** 신규 — 프로그램 인덱스(6 카드)

#### 라우트 리팩토링 (구→신)
- **이동:** `/madleague/pt` → `/madleague/programs/competition`
- **이동:** `/madleague/idea-movement` → `/madleague/programs/im` (essence 서브도 함께)
- **삭제:** `/madleague/program` (새 `/madleague/programs`로 대체)
- **`next.config.ts`** — 301(308) redirects 추가: `/program→/programs`, `/pt→/programs/competition`, `/idea-movement→/programs/im`, `/leaguer→/member`

#### 의사결정
- 동아리 7개 전부 active 확정 (P:ad 강원, AD Zone 충청 포함)
- 인증 아키텍처: tenone.biz 통합 Supabase Auth 재사용 (별도 서브프로젝트 없음)
- `mad_competition_results.team_id`는 Phase 1에서 FK 없이 UUID. Phase 2에 `mad_competition_teams` 생성 시 FK 추가
- 동아리 컬러 7종(#EC1D25/#0066CC/#FF6B35/#00A86B/#FFC000/#4A90E2/#9B59B6) 임시 지정 — 실제 동아리 로고/브랜딩 들어오면 교체

#### 검증
- `curl /madleague/*` 라우트 9종 전부 정상 (200 또는 308 리다이렉트)
- 브라우저 렌더: 한글 정상, Hero/Numbers/Programs/Clubs/HallOfFame 섹션 모두 DB 데이터로 표시
- `npx tsc --noEmit` madleague 관련 에러 0

---

## 2026-04-16 (사무실, 세션 51)

### Badak 이월 항목 일괄 처리 + Phase 0 로드맵 확인

#### 코드 변경
- **`app/intra/ums/badak/needs-queue/page.tsx`** — 관리자 인증 헤더 추가. `createClient().auth.getSession()` → Bearer 토큰. `authError` 상태 처리 추가
- **`app/api/badak/talks/route.ts`** — `unreadTotal` 집계 추가. `wio_talk_messages.read_by` 배열 기반 `.not('read_by', 'cs', '{userId}')` 쿼리로 읽지 않은 메시지 수 계산
- **`app/(Badak)/badak/my/page.tsx`** — `setUnreadTalkCount(0)` → `setUnreadTalkCount(talksData.unreadTotal ?? 0)` 실값 사용

#### 의사결정
- Phase 0 (테넌트 격리) → Phase 1 (제품 활성화) 순서로 다음 작업 진행 확정
- Badak 잔여 항목(검색/알림/온보딩)은 Phase 0 병행으로 처리

---

## 2026-04-16 (사무실, 세션 50)

### E 시리즈 정리 작업 완료 (E-1 ~ E-4)

#### 코드 변경
- **`app/api/badak/member/route.ts`** (E-1) — `SupabaseClient` 타입 명시적 import. `data as { affiliations: string[] | null }` 캐스트로 TS 에러 해소
- **`app/api/badak/member/onboard/route.ts`** (E-1) — 동일 패턴 적용
- **`app/api/badak/needs/review/route.ts`** (E-2, 신규) — `requireAdmin()` 헬퍼: JWT 검증 + `badak_members.role` 체크. GET/PATCH 모두 admin/super_admin만 허용
- **`app/api/cron/badak-expire-wants/route.ts`** (E-4, 신규) — `CRON_SECRET` Bearer 검증 후 `supabase.rpc('expire_badak_wants')` 호출
- **`app/intra/ums/badak/needs-queue/page.tsx`** (신규) — 관리자용 니즈 승인 큐 UI. pending_review 목록 + 승인/거절 버튼

#### DB 변경 (E-3, E-4)
- `sync_community_post_likes` 트리거: `badak_community_likes` AFTER INSERT OR DELETE → `badak_community_posts.likes_count` 업데이트
- `sync_community_post_comments` 트리거: `badak_community_comments` AFTER INSERT OR DELETE → `badak_community_posts.comments_count` 업데이트
- `expire_badak_wants()` PL/pgSQL 함수: `status = 'candidate'` + `expires_at < now()` → `status = 'expired'`로 일괄 업데이트

#### 의사결정
- Vercel Cron 라우트는 `CRON_SECRET` 환경 변수 설정 후 vercel.json에 `"0 0 * * *"` 등록 필요
- E-3 트리거는 Supabase Management API로 직접 적용 완료 (Dashboard 불필요)

---

## 2026-04-16 (사무실, 세션 49)

### WIO Talk + Connections 마이페이지 탭 완성 (Phase C-2)

#### 코드 변경
- **`app/(Badak)/badak/my/page.tsx`** — 관심·대화 탭 실DB 연동 완성
  - state: `connections`, `pendingIncomingCount`, `threads`, `unreadTalkCount`, `activeThreadId`, `messages`, `messageText`, `sendingMessage`, `connectionsLoading`, `talksLoading`
  - useEffect: `/api/badak/connections` + `/api/badak/talks` 병렬 fetch
  - 폴링 useEffect: `activeThreadId` 변경 시 5초마다 `/api/badak/talks/[id]` GET
  - `handleConnectionRespond`: PATCH + 수락 시 talks 탭 자동 이동 + 스레드 오픈
  - `handleSendMessage`: POST + optimistic append + Enter key
  - 관심 탭 UI: 받은 제안(수락/거절/대화 보기) + 보낸 제안 목록
  - 대화 탭 UI: 스레드 사이드바 + 메시지 영역(말풍선) + 입력창. 모바일 목록↔메시지 전환

#### 의사결정
- `unreadTalkCount`: 실시간 추적은 추후 구현, 현재 0으로 초기화 (read_by 배열 기반 집계 필요)
- 폴링 5초 간격: Supabase Realtime 대신 단순 HTTP polling (WIO Talk 설계 원칙)

---

## 2026-04-15 (사무실, 세션 48)

### Badak UX 버그 수정 + 마이페이지 프로필 강화

#### 코드 변경
- **`features/badak/BadakHeader.tsx`** — navItems에서 "바닥이란" 제거 (UniverseUtilityBar ABOUT과 중복)
- **`features/badak/cloud/FeedHighlights.tsx`** — PC 마우스 드래그 스크롤 추가 (`isDragging/hasDragged/startX/scrollLeft` ref 패턴). 인라인 CardWrapper 컴포넌트 안티패턴 제거 → 직접 조건부 Link/div 렌더링
- **`lib/badak-cloud-data.ts`** — FEED_ITEMS 3개(g5/g1/g8)에 `imageUrl` Unsplash URL 추가
- **`app/(Badak)/badak/groups/[id]/page.tsx`** — 전면 단순화: 게시판/신청 기능 제거(~600줄 삭제). 바닥장 영역 버튼으로 변경 → `MemberProfileSheet` 열기
- **`app/(Badak)/badak/my/page.tsx`** — `CareerEntry` 인터페이스 추가. `avatarUrl/career` state 추가. ProfileBoostCard: 프로필 사진 업로드(FileReader, 1MB), 이력 CRUD(추가/수정/삭제, 연월 select, isCurrent 체크박스), 미리보기 버튼+모달(아바타+이름+연차+소개+이력). 프로필 헤더에 avatarUrl 반영. call site에 신규 props 전달
- **`app/api/badak/member/route.ts`** — PUT에 `avatar_url`, `career` 저장 추가. career 컬럼 미존재 시 graceful fallback (career 제외 재시도)

#### 미완 (DB 마이그레이션 필요)
- `badak_members.career JSONB` 컬럼: `ALTER TABLE badak_members ADD COLUMN IF NOT EXISTS career JSONB DEFAULT '[]';` — Supabase Dashboard SQL Editor에서 수동 실행 필요

---

## 2026-04-15 (사무실, 세션 47)

### Badak 유니버스 통합 (Sprint 1-1, 1-4) + 니즈 클라우드 100개

#### 신규 파일
- `app/api/analytics/event/route.ts` — 이벤트 로깅 POST + intra용 집계 GET (MAU/평균 체류/주간 방문)
- `features/badak/useAnalytics.ts` — 페이지뷰 + `sendBeacon` 언로드 세션 종료 훅
- `features/badak/BadakAnalytics.tsx` — 서버 컴포넌트 레이아웃 삽입용 클라이언트 래퍼
- `sql/badak-affiliations-sync.sql` — 기존 badak_members → members.affiliations 싱크 스크립트

#### DB 변경 (Prod)
- `wio_analytics_events` 테이블 신설 — `event_type`, `brand_id`, `tenant_id`, `user_id`, `session_id`, `page_path`, `properties jsonb`, `duration_sec`. 2개 인덱스(brand+created, user+created). RLS: service insert 허용, 인증 유저 select
- `badak_needs` 70 → 100행 (30개 추가)
- `members.affiliations` 싱크 — is_active 기존 badak_members 1명 → `['badak']` 추가

#### 코드 변경
- **`api/badak/feed/route.ts`** — 피드 응답에 `leaderId: g.leader.id` 포함. 지금까지 없어서 FeedCard → MemberProfileSheet 연결이 항상 Fallback "상세 프로필은 멤버 가입 후 확인" 메시지로 표시됐음
- **`api/badak/member/route.ts`** (POST) — `badak_members` 생성 후 `members.affiliations`에 `'badak'` 자동 추가 (`addBadakAffiliation` 헬퍼 추가)
- **`api/badak/member/onboard/route.ts`** (PATCH) — 온보딩 완료 시 `members.affiliations` 동기화
- **`api/badak/members/[id]/route.ts`** — `members` 테이블 JOIN으로 이름/아바타 최신값 반영. `affiliations`에 `'badak'` 없으면 404 응답
- **`api/badak/cloud/route.ts`** — 3버그 수정: status 필터 `'active' → 'gathering'` 포함, limit 60→100, 존재하지 않는 `category` 컬럼 제거
- **`app/(Badak)/badak/page.tsx`** — 클라우드 단어 제한 모바일 50→60 / 데스크탑 80→100
- **`app/(Badak)/layout.tsx`** — `BadakAnalytics` 컴포넌트 추가 (페이지뷰 자동 기록)
- **`app/intra/ums/badak/page.tsx`** — 성장 지표 전면 교체
  - 이번달 신규: 실DB count (지난달 수치도 sub로 표시)
  - 월간 성장률: 이번달-지난달 / 지난달 * 100 (색상 양수/음수 구분)
  - MAU/체류시간/방문횟수: 이벤트 수집 데이터 기반, 없으면 "수집 중" 표시
  - 데이터 출처 하단 안내 문구

#### 의사결정
- **Sprint 1-2, 1-3 스킵**: 오픈채팅방 페이지(`/badak/rooms`), DAM Party 페이지(`/badak/dam-party`)는 만들지 않기로 결정 (사용자 지시)
- **로컬 dev 이슈 인식**: `.env.local`에 `SUPABASE_SERVICE_ROLE_KEY` (JWT, `_PROD` 아님) 없음 → 모든 Badak API가 로컬에서 "supabaseKey is required" 실패 → Cloud API는 try/catch로 Mock 폴백, 나머지는 500. Prod 배포 시 Vercel env로 정상 작동

---

## 2026-04-15 (사무실, 세션 46 — 후반)

### Badak UX 전면 개선 + 유니버스 관점 QA

#### 신규 파일
- `features/badak/MemberProfileSheet.tsx` — 개설자/멤버 공개 프로필 바텀 시트 (아바타/이름/역할/직무/Bio/개설모임/태그)
- `app/api/badak/members/[id]/route.ts` — 공개 프로필 API (인증 불필요, 활성 모임 5개 포함)
- `app/api/badak/groups/[id]/route.ts` — 모임 PATCH (join_type 등 바닥장 전용 필드 변경)
- `features/badak/cloud/ParticipationBanner.tsx` — 피드 중간 참여 독려 문구 13종 (i=1,6,12 위치 삽입)
- `features/badak/cloud/QuoteBanner.tsx` — 피드 중간 격언 배너 (i=3,9 위치)

#### NeedDetailSheet 전면 재작성
- **관련 니즈 클릭 가능** (`span` → `button`) + 정렬 방식 `sin 해시` → `members 수 내림차순(인기순)`
- **카운트 통일** — 상단 `word.members`와 하단 `interestCount` 불일치 해결 (`Math.max`로 통합)
- **슬라이딩 애니메이션 제거** — `appeared` 상태로 첫 마운트에만 `badak-fadeUp` 적용 (리렌더링마다 재실행 차단)
- **불꽃(🔥) 버튼 제거** — 목적 불명확, 관심 버튼만 유지
- **관심 버튼 낙관적 UI** — `needId` 없는 Mock 데이터도 즉시 +1 반응
- **텍스트박스 + 버튼 시각적 분리** — 배경색 `rgba(255,255,255,0.04)` vs `rgba(0,0,0,0.25)` 대비
- **"관심이에요" → "관심있어요"** 어감 수정
- **15명 로직 변경** — 방 개설 버튼 항상 표시, 15명 달성 = "바닥 공식 런칭"
- **방 개설 버튼 작동 수정** — `onClose()`/`router.push()` 순서 반전 (router 먼저 → 언마운트 안전), `type="button"` 명시

#### FeedCard 리더 표시 개선
- "바닥장 김도현" 통합 텍스트 → "김도현" 이름 중심 + `바닥장` 소형 뱃지 분리
- 아바타 이니셜: "바" → 실제 이름 첫 글자 "김"
- **리더 영역 클릭 → `MemberProfileSheet` 공개 프로필** (이름/아바타 클릭 가능)

#### 니즈 클라우드 찌그러짐 수정
- 모바일 sphere radius 120 → 130~170 (화면 폭 42%, 170px 상한)
- 단어 수 제한 — 모바일 50개 / 데스크탑 80개 (인기순 정렬)
- `CloudBubble` 반응형 폰트 — 작은 구 9~13px (기존 11~16)
- 긴 텍스트 자르기 — 모바일 10자+, 데스크탑 14자+ `…`
- 뒷면 숨김 강화 — `depth<0.15` → `depth<0.2`
- 컨테이너 비율 `radius*2.8` → `radius*2.4`

#### API 보강
- `/api/badak/needs` POST — 신규 니즈 생성은 인증 유저만 허용 (스팸 방지). 기존 count++는 누구나 가능
- `/api/badak/groups/[id]/join` POST — **양방향 알림**: 바닥장(승인제만) + 신청자(선착순 "확정", 승인제 "접수")
- `PATCH /api/badak/groups/[id]` — 바닥장만 join_type 변경 가능

#### 개선사항 리스트업 (문서)
- 유니버스 관점 전문가 QA 수행 — 4개 역할(관리자/바닥장/회원/일반유저) 교차 검증
- Ten:One Universe 8대 원칙 중 5건 위반 식별
- `/intra/ums/badak` 가이드 분석 — 기존 코어(채팅방 48개, DAM Party 47회차) 연결 누락 발견
- WIO 역방향 환류 후보 10개 추출 (BottomSheet, withLoginGate HOC, 낙관적 리액션 훅 등)

### 주요 결정사항
- **`badak_members` 별도 테이블 폐기 방향** — 기존 `members.affiliations=['badak']` 활용
- **`/badak/admin` 페이지 개발하지 않음** — `/intra/ums/badak`에 통합
- **HeRo Time** 프로필 섹션 신설 필요 (크로스 브랜드 커리어 이력)

---

## 2026-04-15 (사무실, 세션 46 — 전반)

### Badak 사이트 정밀 검토 + 12개 이슈 일괄 수정

#### 신규 파일
- `app/api/badak/notifications/route.ts` — 알림 API (GET 목록/PUT 읽음 처리)

#### 수정 파일 (보안)
- 14개 Badak API 파일 — `SUPABASE_SERVICE_ROLE_KEY` 폴백 제거, 명시적 에러 처리

#### 수정 파일 (API 신규 엔드포인트)
- `app/api/badak/groups/[id]/join/route.ts` — GET (참여 상태 조회) + 참여 신청 시 바닥장 알림 생성
- `app/api/badak/member/route.ts` — PUT (프로필 수정)
- `app/api/badak/community/[postId]/route.ts` — PUT (글 수정) + DELETE (글 삭제) + 조회수 직접 증가
- `app/api/badak/community/[postId]/comments/route.ts` — GET (댓글 목록) + DELETE (댓글 삭제)
- `app/api/badak/groups/[id]/posts/route.ts` — PUT (게시글 수정) + DELETE (게시글 삭제) + 페이지네이션 + N+1 해결
- `app/api/badak/posts/[postId]/comments/route.ts` — DELETE (댓글 삭제) + 페이지네이션
- `app/api/badak/groups/route.ts` — PUT (모임 수정) + DELETE (모임 삭제)
- `app/api/badak/cloud/route.ts` — Phase 1 실DB 전환 (badak_needs 우선, Mock 폴백)

#### 수정 파일 (프론트엔드)
- `app/(Badak)/badak/community/page.tsx` — 전면 개편: 글 상세 + 좋아요 + 댓글 + 수정/삭제 + 검색/필터
- `app/(Badak)/badak/groups/[id]/page.tsx` — 참여 상태 서버 조회 + CTA 4분기 (leader/approved/applied/none)
- `app/(Badak)/badak/my/page.tsx` — 내 글 실DB 전환 + 프로필 실DB + 메시지탭→알림탭 + 프로필 수정 API 연결
- `app/api/badak/community/[postId]/like/route.ts` — broken RPC 제거, COUNT 직접 사용
- `app/api/badak/feed/route.ts` — 타입 캐스팅 수정

#### DB 마이그레이션
- `badak_notifications` 테이블 생성 (type, title, body, link, read, metadata) + RLS

#### 결정 사항
- 모임 참여 상태는 서버에서 관리 (leader/approved/applied/none)
- 참여자 있는 모임은 삭제 대신 closed 처리
- 서비스 키 없으면 에러 throw (anon_key 폴백 절대 금지)
- 커뮤니티에 글 상세 화면 추가 (좋아요/댓글/수정/삭제 완비)
- 마이페이지 메시지 탭 폐기 → 알림 탭으로 전환 (실DB)

---

## 2026-04-14 (집, 세션 45)

### Badak Next Stage — 다크 테마 통일 + 클라우드 개선 + 바닥장 시스템

#### 신규 파일
- `app/(Badak)/badak/apply/page.tsx` — 바닥장 신청 페이지 (이름/산업군/경력/분야/동기/계획/연락처, 직접 입력 분야는 승인 시 전체 카테고리 반영)

#### 수정 파일 (다크 테마 통일 — #1a1a2e)
- `app/(Badak)/badak/page.tsx` — skyBg, 슬로건, 서브카피 8종 랜덤, 스파크 amber, 입력영역 다크
- `features/badak/cloud/CloudBubble.tsx` — amber/gray 색상 + CSS transition(0.08s) + willChange
- `features/badak/cloud/NeedsInput.tsx` — 입력창/버튼 다크 스타일
- `features/badak/cloud/FeedCard.tsx` — 카드/뱃지/프로그레스바 다크
- `features/badak/cloud/FeedHighlights.tsx` — 하이라이트 카드 다크
- `features/badak/cloud/FeedSection.tsx` — 컨테이너/탭 다크
- `lib/badak-cloud-data.ts` — `getTimeBasedSky()` 6시간대 전부 다크 그라디언트
- `features/badak/BadakHeader.tsx` — 메뉴 정리 (모임, 커뮤니티, 스토리, 탐색, 모임 개설, 바닥장 신청, 바닥이란)

#### 수정 파일 (기능)
- `app/(Badak)/badak/groups/create/page.tsx` — 커스텀 니즈 드롭다운(검색+제목 기반 추천+미개설만), 바닥장 분기(비바닥장: 1회만+유도 배너), 운영방식 7종, 태그 ','구분, groupCategory
- `app/(Badak)/badak/about/page.tsx` — 다크 테마 리라이트 (약한 연결 고리 철학 + 4단계 흐름 + 서비스 링크 + CTA)

#### 결정 사항
- 메인 페이지 전체 #1a1a2e 다크 테마 확정
- 바닥장 = 트레바리 클럽장 모델. 관리자 승인제, 승인 시 role='badakjang'
- 비바닥장은 1회 단발 모임만 개설 가능, 바닥장 신청 유도
- 직접 입력 분야가 승인되면 바닥 전체 카테고리에 반영
- 운영방식: 네트워킹, 스터디, 사이드 프로젝트, 강의, 토론, 멘토링/코칭, 워크숍/세미나
- 클라우드 애니메이션: dt 보간 + CSS transition + FRICTION 0.985

---

## 2026-04-14 (집, 세션 44)

### Vercel 비용 관리 + 배포 정책 수립

#### 수정 파일
- `vercel.json` — `git.deploymentEnabled` 추가: dev/feature-* 프리뷰 배포 차단
- `CLAUDE.md` — "작업 종료 프로토콜"에 Vercel 비용 관리 규칙 블록 추가, "절대 하지 말 것"에 중간 push 금지 항목 추가

#### 결정 사항
- Vercel Pro 전환 ($20/월). 동일 커밋 20+회 반복 배포가 Free 리밋 소진 원인
- **push는 작업 종료 시 1회만** — 작업 중 push 금지 (매 push → 자동 배포 → 크레딧 소진)
- 로컬 `npm run dev`로 확인, Vercel 배포는 최소화
- On-Demand 상한 $100 설정 완료

---

## 2026-04-13 (집, 세션 41)

### Intra Phase C — ERP 입력 폼 + Wiki DB 연동

#### 수정 파일
- `app/intra/erp/finance/billing/page.tsx` — 청구서 발행 모달 추가 (InvoiceModal 컴포넌트, createInvoice 연동)
- `app/intra/erp/finance/card/page.tsx` — 하드코딩 mockCards 제거, card_usage에서 카드별 집계 동적 생성
- `app/intra/wiki/library/page.tsx` — DB items 실제 로드 (기존 TODO 해결), displayItems = DB || mock
- `app/intra/wiki/faq/page.tsx` — FAQ 등록 모달 추가 (AddFaqModal), wiki_faq 테이블 저장 + 로컬 fallback

---

## 2026-04-12 (집, 세션 40)

### Brand Gravity 컨설팅 서비스 — P0 전체 완료

#### 신규 파일
- `app/api/gravity/prescan/run/route.ts` — Quick Probe API (시장 사전 진단, 유형 A/A'/B/C 자동 판정)
- `app/api/gravity/social/run/route.ts` — Naver 소셜 언급 · SOV · 감정분석 API
- `app/api/gravity/brand-value/run/route.ts` — 브랜드 4대 가치 (인지도/호감도/추천도/만족도) 산출
- `lib/gravity/notify.ts` — agent_messages 기반 그래비티 에이전트 메신저 알림 유틸
- `components/gravity/PrescanCard.tsx` — 시장 유형 뱃지 + 여정 히트맵 + 4대 가치 바 카드
- `app/intra/gravity/[productId]/intake/page.tsx` — 클라이언트 사전 질문서 A~E 5섹션
- `docs/BrandGravity_Service_Design.md` — 1주 컨설팅 프로세스 설계서

#### 수정 파일
- `app/api/gravity/gap/run/route.ts` — Gravity Score 공식 수정 (Mention40 + Context25 + Rank20 + Coverage15)
- `app/api/gravity/scan/run/route.ts` — 5단계 → 8단계 파이프라인 (source/voice/brand-value 추가) + 메신저 훅
- `app/api/gravity/apply/route.ts` — 신청 시 그래비티 에이전트 알림 추가
- `app/intra/gravity/page.tsx` — 대시보드 "오늘의 할 일" + "에이전트 메시지" 섹션 추가
- `app/intra/gravity/[productId]/page.tsx` — PrescanCard 삽입
- `app/intra/gravity/[productId]/report/page.tsx` — 섹션 11(4대가치) + 섹션 12(세일즈액션) + 배점 수정
- `scripts/reset-and-reseed-dancingwhale.js` — 춤추는고래 여성위생용품으로 전면 재작성

#### DB 변경
- 신규 테이블: bg_prescan_results, bg_brand_values, bg_intake_responses
- bg_products: market_type 컬럼 추가
- agent_profiles: gravity(그래비티) 에이전트 INSERT (layer=1, can_invoke: 1001/smarcomm/mindle)

#### 파이프라인 검증
- 춤추는고래 8단계 전체 실행 완료: Gravity Score 6/100, Brand Values 종합 20/100 (정상)

---

## 2026-04-10 (집, 세션 38)

### Brand Gravity 보고서 시스템 구축

#### 신규 파일
- `app/intra/gravity/[productId]/report/page.tsx` — 클라이언트 전달용 보고서 페이지

#### DB 마이그레이션
- bg_gravity_scores: `context_score` 컬럼 추가
- bg_products: `site_url`, `specs` 컬럼 추가
- bg_ai_probe_results: 6개 컬럼 추가
