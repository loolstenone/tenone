# Planners 브랜드 가이드

> **Planner's** — 우리는 모두 기획자다. 적어도 자기 인생에서 만큼은.
> **PP AI** — 능동 AI 비서가 있는 자기 성취 플랫폼.

---

## 정체성

- **한 줄 소개**: 기획·기획자 교육 커뮤니티 + 능동 AI 플래너 서비스
- **톤앤매너**: 지적·창의적·철학적 깊이 · 종이 감성 + 디지털 편의
- **주 컬러**: Teal `#0F766E`
- **디자인 방향**: Minimal · Serif 헤더 + Sans 본문 · 종이 질감
- **철학 3문**:
  - "우리는 모두 기획자다 — 적어도 자기 인생에서 만큼은"
  - "나는 무엇을 도모(圖謀)하고 있는가?"
  - "생각한대로 살지 않으면, 사는대로 생각하게 된다"

---

## 제품 구성

### 1. 종이/PDF 플래너 (기존)
- 2026 Planner's Planner All in One (굿노트·삼성노트 호환)
- Badak Mall (`badak.biz/planners`) 판매
- 구성: Schedule 19 · Note 64 · FrameWorkBook 26 · Front Cover 27+ · Personal Identity 10p

### 2. Planner's Planner AI (신규 MVP 완성)
- 경로: `/planners/app/*`
- 가격: **연간 19,000원** (PDF 구매자 무료 1년)
- 모드: **Weekly** (기본) · **All in One** (고급)
- 능동 AI: Haiku 4.5 아침 브리핑·저녁 정리 (~$0.18/유저/월)

---

## 접근 모델

- **유형**: 오픈 가입 + 유료 구독 (하이브리드)
- **가입 경로**: 회원가입 → 온보딩 4단계 → 앱 진입
- **멤버 권한**: member · subscriber · manager · admin · staff

---

## 프로필 특화

- **특화 테이블**: `planners_users` (mode · subscription · AI 설정 · 알림 설정 · PDF 구매자 플래그)
- **Universe 연동**: members 테이블 SSOT, planners_users로 확장
- `universe-profile.ts` 조회 함수: 향후 `getPlannersProfile()` 추가 가능

---

## 권한 체계

- **role 종류**: member · subscriber · purchaser · manager · super_admin
- **context**: `brand:planners`
- **관리자 게이트**: `role IN ('staff','manager','super_admin')` → `/intra/planners`

---

## UC 정책 특이사항

- **브랜드 전용 액션**: 향후 추가 가능 (현재 미시드)
- **brand_id 지정**: `brand_id = 'planners'`

---

## Action Hub Entries

(현재 Action Hub 대상 없음 — PDF 구매자 검증은 관리자 수동 매칭)

---

## 핵심 파일

### 마케팅 (공개 페이지)
| 파일 | 역할 |
|------|------|
| `app/(Planners)/layout.tsx` | generateMetadata + PlannersChrome 래퍼 |
| `app/(Planners)/planners/page.tsx` | 메인 랜딩 |
| `app/(Planners)/planners/planning/page.tsx` | Planning 아카이브 |
| `app/(Planners)/planners/planner-tool/page.tsx` | PP 도구 소개 + PP AI "Now Live" CTA |
| `app/(Planners)/planners/programs/page.tsx` | Programs |
| `app/(Planners)/planners/gpr/page.tsx` | GPR |
| `app/(Planners)/planners/my/page.tsx` | 마이페이지 |
| `features/planners/PlannersChrome.tsx` | `/planners/app`·`/onboarding`·`/purchase`에서 헤더/푸터 숨김 |

### PP AI 앱 쉘
| 파일 | 역할 |
|------|------|
| `app/(Planners)/planners/app/layout.tsx` | 인증 게이트 + 구독 검증 + 사이드바 |
| `app/(Planners)/planners/app/page.tsx` | /today로 리디렉트 |
| `app/(Planners)/planners/onboarding/page.tsx` | 4단계 온보딩 |
| `app/(Planners)/planners/purchase/page.tsx` | Toss 19,000원/년 결제 |
| `app/(Planners)/planners/offline/page.tsx` | PWA 오프라인 |
| `features/planners/AppSidebar.tsx` | 사이드바 (모드별 메뉴 분기 + 구독 상태 표시 + 업그레이드 CTA) |
| `features/planners/PwaRegister.tsx` | SW 등록 + manifest 링크 |

### 뷰 컴포넌트 (features/planners/)
- DailyView · ThisWeekCard · ExternalEventsBanner — Today
- WeeklyView — 주간 Vrief + GPR + 집계 + 7일 캘린더
- MonthlyView — 월 그리드 + 공휴일 + 주차 링크 + 히트 인디케이터
- YearlyView — 12개월 + 분기별 목표 + Anniversary 2p 스프레드
- IdentityView — Vision/Mission/KR (Weekly) + Inside-Out/Outside-In/Vision House (All in One)
- ProjectsView · ProjectDetailView · ProjectNotesTab — 프로젝트 목록/상세/노트
- CoverPicker · CoverRender — 15종 Cover
- TemplatesView — 59종 카탈로그 + 27개 인터랙티브 그리드 컴포넌트 (2026-04-25 세션 87: 전 템플릿 시각 편집 완성)
- AiBriefingView — 아침/저녁 브리핑 생성·이력
- ContactsView — 연락처 목록/그룹/검색/편집/vCard import
- AddressPicker — Daum Postcode lazy-load 모달 (Contacts 주소 필드)
- PlannersUtilityLinks — 본문 상단 Templates · AI Briefing 칩 서브링크
- InstallView — `/planners/install` PWA 설치 가이드 (자동 플랫폼 감지 + beforeinstallprompt)
- SearchView — 풀텍스트
- PurchaseView — 결제
- CopyToAiButton — Claude/ChatGPT/Gemini deep link

### 라이브러리 (lib/planners/)
- types.ts — 타입 정의 + getISOWeek/getWeekBoundaries
- templates.ts — 템플릿 공용 유틸 (isSpecialTemplate·exportFrameworkText·resolveTemplateContent·LABEL_MAP). DailyView·ProjectNotesTab에서 템플릿 삽입 시 localStorage 데이터를 markdown으로 export
- client.ts — Supabase CRUD helpers
- briefing.ts — Haiku 4.5 브리핑 생성 + 컨텍스트 수집
- notifications.ts — 이메일(Resend) + Web Push(VAPID)
- holidays.ts — 2026~2027 한국 공휴일·24절기
- google-calendar.ts — OAuth + token refresh + events sync
- todoist.ts — 토큰 검증 + 오늘 태스크 import

### API 라우트 (app/api/planners/)
- 핵심 CRUD: onboarding · daily · weekly · monthly · yearly · identity · projects/[id] · projects/[id]/notes(/[noteId]) · settings · contacts
- 템플릿: templates · covers
- 집계: summary(scope=weekly/monthly/yearly) · daily/month-hits
- 검색: search
- Daily 누적 이월: daily/carry-over (60일 일괄 todo 회수) · daily/pending-count (count·days·oldest)
- AI 브리핑: briefing · briefing/generate · cron/briefings
- 결제: payment/request · payment/success · admin/activate
- 알림: push/subscribe
- 연동: integrations · integrations/google/{connect,callback,sync} · integrations/todoist/{connect,sync} · external-events
- Intra 관리: intra/planners/subscribers · intra/planners/payments

### SQL (sql/planners-*.sql)
- planners-app · planners-app-v2 · planners-templates · planners-templates-phase2 · planners-aggregation · planners-payments · planners-security-hardening · planners-notifications · planners-covers · planners-anniversaries · planners-integrations

### PWA 자산 (public/)
- planners-manifest.json · planners-sw.js
- ⚠️ 배포 전 필요: planners-icon-192.png · planners-icon-512.png

---

## 인트라 관리 경로

| 경로 | 역할 |
|------|------|
| `/intra/planners` | PP AI 관리 (구독자·결제·수동 활성화) |
| `/intra/ums/planners/planning` | Planning 콘텐츠 (기존) |
| `/intra/ums/planners/gpr` | GPR (기존) |
| `/intra/ums/planners/programs` | Programs (기존) |

---

## 개발 주의사항

### 능동 AI
- 프롬프트 SSOT: `lib/planners/briefing.ts` 내 `systemPrompt()` · 톤 3종(professional/friendly/brief)
- 사용량 카운트: `planners_ai_usage` (upsert 실패해도 브리핑 성공)
- 크론: `/api/planners/cron/briefings` 매 시간, `CRON_SECRET` Authorization Bearer 헤더 필수
- 알림 발송: 브리핑 생성 후 `dispatchBriefingNotifications()` 백그라운드 호출 (실패해도 브리핑 반환 OK)

### 결제 (Toss)
- Flow: `/planners/purchase` → `/api/planners/payment/request` (주문 생성) → Toss widget → `successUrl` → confirm API → `planners_activate_subscription` RPC
- `TOSS_SECRET_KEY` 미설정 시 confirm 단계에서 실패 → `/planners/purchase?failed=config` 리디렉트
- 테스트 키 기본값 내장 (`test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq`) — 실 배포 시 live 키로 교체 필수

### PDF 구매자 활성화
- Badak Mall 주문 기록 자동 매칭 기능 없음 (향후 가능)
- 관리자가 Intra에서 이메일 입력 → `pdf_buyer` 소스로 수동 활성화 → 1년 무료
- `planners_activate_pdf_buyer` RPC 호출

### 구독 접근 제어
- `app/(Planners)/planners/app/layout.tsx`에서 검증
- `subscription_status='expired'` → `/planners/purchase?expired=1` 리디렉트
- `free` 상태는 진입 허용 (베타 기간)
- 만료 예정 시 사이드바에 "1년 구독 시작" 배너 표시

### Templates/Covers API
- 공개 읽기 (RLS `USING (true)`)
- API는 anon 클라이언트 사용 (admin client 필요 없음)
- 로컬 dev에서도 조회 가능

### 외부 연동
- **Google Calendar**: `GOOGLE_CLIENT_ID`·`GOOGLE_CLIENT_SECRET` 설정 필요. Redirect URI = `{NEXT_PUBLIC_APP_URL}/api/planners/integrations/google/callback` Google Cloud Console에 등록 필수.
- **Todoist**: 사용자가 직접 API 토큰 붙여넣기. OAuth 아님.

### 보안
- 함수 6개 `search_path = public, pg_temp` 고정 (planners_*_summary + activate_* + expire)
- RLS: planners_users/identities/yearly/monthly/weekly/daily/projects/project_*/ai_briefings/ai_usage/payments/push_subscriptions/integrations/external_events — 전부 `본인만` 정책
- templates/covers는 `FOR SELECT USING (true)` (공개 읽기)

### UX 규약
- 체크박스 순환: `□` 미완 → `V` 완료 → `→` 이월 → (다시 □)
- 날짜 1개 = Daily 1 + Note 2 슬롯 (PDF 재현)
- 공휴일/일요일 빨간색 · 절기 중성 회색
- 빨강(#0F766E 아님): 공휴일·에러·기념일 등 semantic red만
- Teal(#0F766E): Action·Accent·State layer만

### 문구
- "도모(圖謀)" 한자 병기 (원본 PDF 감성 유지)
- "생각한대로 살지 않으면, 사는대로 생각하게 된다" Italic · border-t 구분
- 영어 라벨 대문자: Today · Weekly · Monthly · Yearly · Identity · Projects · Templates · Settings (사이드바 통일)

---

## 🎯 UX 일관성 가이드 (세션 94 SSOT)

> **원칙**: PP AI는 Daily/Weekly/Monthly/Yearly 4-View가 한 사람의 시간을 다른 줌 레벨로 보는 것이다.
> 같은 데이터·같은 모달·같은 시각 패턴 — 줌만 바뀐다. 사용자가 "다른 앱에 들어왔나?" 느끼는 순간이 가장 큰 실패.

### 1) 페이지 헤더 — 4-View 단일 패턴
```
< [font-serif text-2xl md:text-3xl 제목] [상태배지(이번 주/이번 달/올해/Today)] >
[서브라인 text-sm text-neutral-500]
```

| View | 제목 | 배지 | 서브 |
|---|---|---|---|
| Daily | `2026년 4월 27일` | `Today` (오늘일 때) | weather · 요일 · 음력 · 공휴일/절기 |
| Weekly | `2026년 4월 27일 — 5월 3일` | `이번 주` | `W18 · 4월 - 5월` |
| Monthly | `2026년 4월` | `이번 달` | (없음) |
| Yearly | `2026년` | `올해` | (없음) |
| Canvas/PI/Project/Contact | 한국어 제목 + 보조 영문 라벨 | — | 한 줄 설명 |

좌우 prev/next 화살표는 시간뷰만. 비시간뷰는 화살표 없음.

### 2) 카드 헤더 — 단일 패턴
```tsx
<section className="bg-white border border-neutral-200 rounded-xl p-5">
  <div className="flex items-center justify-between mb-3">
    <h2 className="text-xs uppercase tracking-widest text-neutral-400">{TITLE}</h2>
    {/* 우측 액션: + 추가 / 수정 / 공유 등 */}
  </div>
  ...
</section>
```

- **제목 형식**: 한국어 우선, 영어는 라벨/배지 용도만 (예: `Daily Tracking` 같은 영문 카테고리 라벨 OK)
- **금지**: placeholder 텍스트를 제목처럼 쓰는 것 (예: 노트 카드의 "예: 회의록..." italic이 헤더 자리에 있는 패턴 — 명시적 헤더 필요)
- **금지**: 카드마다 다른 폰트 크기·웨이트
- 인덱싱이 있는 카드 (손글씨, 캔버스 등): `손글씨 N`, `캔버스 N` 형식 — 사용자 입력 제목 있으면 그것 우선

### 3) 입력 패턴
- **날짜·시간·반복 입력**: 모든 뷰에서 `CalendarEntryEditor` 모달 단일 사용
  · 양력/음력 토글 (한 곳에서 전환) — 표기는 `YYYY-MM-DD` 통일
  · 음력은 단일 트리거 + 캘린더 그리드 팝오버 (드롭다운 3개 X)
- **인라인 task 추가**: Daily/Weekly 셀 하단에 `+` 입력. Enter 또는 blur로 저장 → `planners_daily.tasks`
- **노트/캔버스 추가**: Daily/Project 본문 하단의 4개 버튼 (기본 노트·손글씨·템플릿·캔버스)

### 4) 데이터 SSOT
- **task**: `planners_daily.tasks` JSON 배열 — Daily에서 입력하든 Weekly에서 입력하든 같은 row 업데이트
- **calendar 엔트리** (anniversary/meeting/task/public_holiday/solar_term): `planners_calendar_entries` 단일 테이블
- **법정 공휴일·24절기**: `lib/planners/holidays.ts` `HOLIDAYS` 정적 테이블 (DB 아님)

### 5) 뷰 간 이동 규칙
- 셀/카드 본문 클릭 → 인라인 입력 또는 모달 (페이지 이동 X)
- 다른 뷰로 가는 명시적 이동은 `↗` (ArrowUpRight) 아이콘 hover 시 노출
- 사이드바·상단 탭으로만 페이지 이동 (Index/Today/Weekly/Monthly/Yearly/P.I/Project/Canvas/Contact/Community)

### 6) 표기 우선순위 (셀 텍스트 1개만 보여줄 때)
1. **사용자 입력** (calEntries — anniversary/meeting/task)
2. **국가 기념일 / 추모일** (HOLIDAYS `type='holiday'|'memorial'`)
3. **절기** (HOLIDAYS `type='solar_term'`)

### 7) 색상 컨벤션
| 의미 | Tailwind |
|---|---|
| Today/이번주/올해 배지 | `bg-[#0F766E] text-white` |
| 공휴일 | `text-rose-500` |
| 추모일 | `text-rose-400` |
| 절기 | `text-emerald-600` |
| Anniversary kind | `KIND_COLORS.anniversary` (rose) |
| Meeting kind | `KIND_COLORS.meeting` (sky) |
| Task kind | `KIND_COLORS.task` (teal) |
| Public holiday kind | `KIND_COLORS.public_holiday` (red) |
| Solar term kind | `KIND_COLORS.solar_term` (neutral) |

### 8) 상단 탭 (메인 메뉴)
`Index · Today · Weekly · Monthly · Yearly · P.I · Project · Canvas · Contact · Community↗`

- **AI Briefing은 메인 탭에 두지 않는다** — Daily 우측 "AI 정리" 카드 또는 본문 서브링크로만
- **Templates는 메인 탭에 두지 않는다** — 각 뷰(Weekly/Monthly/Yearly) 우측 상단 버튼으로

### 9) 4-View 줌 모델 (논리적 일관성)
```
Yearly  : 12개월 한눈에 — 기념일/큰 행사/공휴일/절기 (우선순위 한 줄만 셀)
Monthly : 달 그리드 — 각 일에 task + entry dot
Weekly  : 7일 펼침 — 각 일에 task 인라인 입력 + 일정 미리보기
Daily   : 한 날 깊이 — task 풀편집 · 노트 · 트래킹 · AI 정리
```

같은 데이터를 다른 줌으로 본다. 한 곳에서 입력 → 다른 모든 뷰에 즉시 반영.

---

## 환경변수 (전체)

```bash
# 공통
ANTHROPIC_API_KEY=sk-ant-...
CRON_SECRET=...
SUPABASE_SERVICE_ROLE_KEY=...     # 이미 설정됨
RESEND_API_KEY=...                # 이미 설정됨

# Toss Payments
NEXT_PUBLIC_TOSS_CLIENT_KEY=live_ck_... (또는 test_ck_)
TOSS_SECRET_KEY=live_sk_... (또는 test_sk_)

# Web Push (선택)
VAPID_PUBLIC_KEY=...
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...   # 동일 값
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:lools@tenone.biz

# Google Calendar (선택)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXT_PUBLIC_APP_URL=https://planners.tenone.biz
```

VAPID 키 생성: `npx web-push generate-vapid-keys`

---

## 현재 상태

| 항목 | 내용 |
|------|------|
| **Phase** | **세션 95 (2026-04-27)** — **프로젝트 메뉴 고도화 Phase 1-6 완료** (통합 작업 공간) · **카테고리 9종 SSOT** (`project-categories.ts` 학습/비즈니스/창작/헬스/여행/관계/재무/운영/커스텀) · **추천 템플릿 매핑** (`template-recommendations.ts`) · **DB 확장** (planners_projects.category·custom_fields·tags·tracking_metrics·visibility·retrospective·public_token·collaborators / planners_project_milestones 신규) · **Daily Task ↔ project_id** (TaskRow selector 배지 / DailyProjectsCard 진행률·D-N·오늘 task) · **`/api/planners/projects/dashboard|[id]/tasks|[id]/tracking|[id]/milestones|[id]/share`** 5종 endpoint · **트래킹 자동 시계열** (planners_daily 7종 메트릭 자동 매핑 + SVG 스파크라인) · **마일스톤** (체크리스트·간트·자동 진행률) · **5F 회고** (Fact/Feeling/Finding/Future/Feedback · status=completed 자동 트리거 · Finding → Identity Key Results 환류) · **공개 링크** (`/api/planners/public/projects/[token]` + `/planners/p/[token]` Server Component / 토큰 발급·철회 / URL 복사) · **협업자** (이메일·뷰어/에디터 역할 기록) · **프로젝트 상세 5탭** (노트·Task·마일스톤·트래킹·표지·설정) · **전체화면 모드** (`document.fullscreenElement` 토글 — PlannersUtilityLinks Maximize/Minimize 버튼) · **기념일 80여 종 확장** (commemoration 타입 + 2026/2027 정부지정 / Yearly 셀 우선순위: 사용자 > 국가기념일 > 절기) · **UX 일관성 SSOT** (4-View 헤더 Daily 패턴 통일 / Weekly 셀 3섹션 — 일정·Task·메모 양방향 동기화 / 노트 카드 헤더 통일 + 인덱싱 / 로고 font-serif / `:not(.font-serif)` 글로벌 예외) · **CalendarEntryEditor 단일 picker** (양력 native + 음력 캘린더 그리드 팝오버 · YYYY-MM-DD 표기) · **음력 1950+ 근사 변환** (기념일 원본 연도용) · **AI Briefing 메뉴 제거 → Daily AI 정리 카드** (Haiku 4.5 100-180자) (2026-04-27 세션 94+95)
| **Phase 93** | 세션 93 — 통합 캘린더 시스템(`planners_calendar_entries` 단일 테이블 + `calendar-rules.ts` SSOT 5 kinds × 4 views 노출 룰) · 4-View 통합 렌더 · 공공데이터 자동 반영(KR 공휴일 30 + 24절기 시드 + cron 매년 1/1) · Daily 우측 재구성 · 트래킹 7종 · MonthlyAnalytics·YearlyAnalytics 3-탭 · Canvas storageKey fix · Settings upsert + SaveAllBar · 구독 + 런칭 프로모션
| **Phase 92** | 세션 92 (2026-04-27) — 모바일 PWA(orientation any · AppMonthBar 모바일 숨김) · HandNote 종합 개선(펜 4종·스타일러스 지우개 자동 감지·팜 리젝션·캔버스 자동 확장 · perfect-freehand 추가) · AI 브리핑 통합(midday 타입 + 시간대 자동 추론 + 단일 채팅 UI · 이메일 기본 OFF) · Weekly 순서 재정렬(GPR→Vrief→주간 계획) · Monthly 재정렬(테마/목표→집중 영역→일정→회고)+월간 통계(5종 task 분포·에너지·일간 계획) · **Community 사이트화** (`/planners/community` 공개 읽기, 로그인 회원 작성, 카테고리 4종 · 앱 메뉴는 외부 링크) · **PP AI 워크스페이스 슬롯 통일** (UniverseUtilityBar `workspacePath`, HeRo·SmarComm 패턴) · **온보딩 루프 fix** (`storageKey: tenone-auth` · auth_id→email→자동생성 3단계 · super_admin/staff/manager 게이트 우회 · 마스터 DB 마킹) (2026-04-27 세션 92) |
| **운영 중** | 마케팅 랜딩 (`/planners`, `/planner-tool`, `/planning` 등) |
| **배포 대기** | `/planners/app/*` 전체 + 결제 + 온보딩 + AI 브리핑 + PWA + 연동 |
| **완료 범위** | W1~P2 전 범위 + P3 #17·19·20 + P4 #21·22·23·24(GTM·Help·피드백·Intra) + P5 #25·26·27 |
| **배포 전 블로커** | PWA 아이콘 2개 · Toss 가맹점 승인 · 환경변수 Vercel 설정 · Google OAuth 자격 · Supabase Redirect URL 추가 |
| **이월 작업** | P3 #18 기업플랜 (대규모, 결제 사업 시작 시) · (선택) TemplatesView Step 2b — empathy/retro/thinking/meeting/timing/planning 카테고리 추가 분리해 TemplatesView 2,500+ 라인 → 1,500 이하 · 협업자 RLS 권한 강제 (현재 collaborators 초대 기록만, 실제 편집 권한 미적용) · 포트폴리오 모드 (`/planners/portfolio/[memberId]`) — 한 사용자의 모든 공개 프로젝트 갤러리 |
| **주요 결정** | 19,000원/년 · Weekly 기본 · PDF 구매자 무료 · 커뮤니티 운영 안 함 |
| **최근 결정 누적** | 능동 AI가 핵심 차별점 · 이메일 백업 · Web Push 선택 · 외부 연동은 플래너 중심 입출력 채널 · 59종 템플릿 전부 시각 그리드 편집 지원 (localStorage 자동 저장 + markdown export) · **Templates · AI Briefing 은 본문 서브링크 (메인 메뉴는 Index/Today/Weekly/Monthly/Yearly/P.I/Project/Contact)** · **PWA 전용** (앱스토어 미등록, /planners/install 가이드) · **누적 이월 = 어제 한정이 아니라 60일 미완료 일괄 회수** · **템플릿은 placeholder 차원이 아니라 컨설턴트급 가이드(저자·원칙·실제 시나리오)까지 일관 적용** · **Contacts는 진입 시 즐겨찾기+최근만 렌더, 우측 인덱스는 스크롤 점프 X·필터링 방식, 1,000명+ 데이터도 인스타식 점진 노출(50명/페이지)** · **getInitialChar는 invisible 문자·호환 자모·Choseong Jamo까지 견고하게 분류** |

---

## 참고 문서

- 루트 CLAUDE.md § 1.4 (접근 모델 6종)
- 루트 CLAUDE.md § 1.3.1 (Capability 모델)
- docs/Universe_Coin_Policy.md
