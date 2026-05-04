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
- WeeklyView — 7일 세로 목록 (좌 32% 정보 패널: 날씨·음력·절기·기념일·미팅·업무 / 우 flex-1 노트 textarea)
- MonthlyView — 월 그리드 + 공휴일 + 주차 링크 + 히트 인디케이터
- YearlyView — 12개월 + 분기별 목표 + Anniversary 2p 스프레드
- IdentityView — Vision/Mission/KR (Weekly) + Inside-Out/Outside-In/Vision House (All in One)
- ProjectsView · ProjectDetailView · ProjectNotesTab — 프로젝트 목록/상세/노트
- CoverPicker · CoverRender — 15종 Cover
- TemplatesView — 59종 카탈로그 + 27개 인터랙티브 그리드 + my_role 탭 (역할 필터링 + empty state + teal 헤더 배너)
- StudentTimetable — 대학생 역할 시 WeeklyView에 학기 시간표 (월~금 × 8교시, localStorage 저장, 색상별 과목 셀)
- AiBriefingView — 아침/저녁 브리핑 생성·이력
- ContactsView — 연락처 목록/그룹/검색/편집/vCard import
- AddressPicker — Daum Postcode lazy-load 모달 (Contacts 주소 필드)
- PlannersUtilityLinks — 본문 상단 Templates · AI Briefing 칩 서브링크
- InstallView — `/planners/install` PWA 설치 가이드 (자동 플랫폼 감지 + beforeinstallprompt)
- SearchView — 풀텍스트
- PurchaseView — 결제
- CopyToAiButton — Claude/ChatGPT/Gemini deep link
- **Settings 디자인 시스템 (세션 102)**
  - SettingsLayout — 4그룹 IA(시작/스타일/기능/기술) · PC sticky 사이드바 · 모바일 가로 pill row · IntersectionObserver 활성 자동 갱신 · xl+ 3컬럼 grid (사이드바·main·preview)
  - SettingsStylePresets — 8개 프리셋(Mono Light·Cream Serif·Editorial·Slate Pro·Black Ink·Campus Mint·Campus Blush·Designer Mono) · 컬러·모서리·system폰트·user폰트·모드 5개 토큰 한 번에 적용 · matchPreset() 헬퍼
  - SettingsLivePreview — xl+(1280px) 우측 sticky 라이브 프리뷰 · Daily/Project/AI 3탭 · CSS 변수(--pp-*, --planners-accent, --planners-font, --planners-user-font)로 즉시 반영
  - 토큰: `app/globals.css` `.pp-settings` 스코프 11종(라이트+다크) — 핸드오프 design_handoff_planners_settings/tokens.css 참조
  - **Settings 모듈 분리 (세션 103)**: `page.tsx` 1,799줄 → 367줄 슬림 쉘 + 5개 feature 모듈
    - `features/planners/settings/SettingsTheme.tsx` — 컬러·모서리·폰트·다크모드 (Group 02)
    - `features/planners/settings/SettingsAi.tsx` — AI 브리핑·톤·컨텍스트·트래킹 (Group 03)
    - `features/planners/settings/SettingsNotifications.tsx` — 이메일/Push 알림 (Group 04 일부)
    - `features/planners/settings/SettingsIntegrations.tsx` — Google Calendar·Todoist 연동 (Group 04 일부)
    - `features/planners/settings/SettingsExport.tsx` — 앱 설치·데이터 백업·구독 현황 (Group 05)
    - `features/planners/settings/SettingsBases.tsx` — 활동 거점(사무실·집·학습·운동·카페·기타) 입력 (세션 105)
- **Canvas Engine (세션 105)**
  - `lib/planners/canvas-engine/` — 자체 캔버스 엔진 골격(HandNote+CanvasStudio 통합 목표). types·engine·history·render·layers·interaction·serialize·adapters 8 모듈
  - `docs/PP_Canvas_Engine_Plan.md` — 6단계 ~10주 로드맵 (Core → Shapes → Selection → Text → Polish → Migration)
  - `features/planners/CanvasToolbar.tsx` — 24색 팔레트·펜 굵기·이미지·레이어 순서·모바일 더보기
  - `features/planners/IdentityView.tsx` — 이력서 섹션(학력·경력·자격증·기술·언어·수상) + sticky 서브 네비

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
- Daily 누적 이월: daily/carry-over (60일 일괄 todo 회수) · daily/pending-count (count·days·oldest) · daily/pending-tasks (날짜별 그룹 반환, 선택 모달 용도)
- AI 브리핑: briefing · briefing/generate · cron/briefings
- 결제: payment/request · payment/success · admin/activate
- 알림: push/subscribe
- 연동: integrations · integrations/google/{connect,callback,sync} · integrations/todoist/{connect,sync} · external-events
- Intra 관리: intra/planners/subscribers · intra/planners/payments

### SQL (sql/planners-*.sql)
- planners-app · planners-app-v2 · planners-templates · planners-templates-phase2 · planners-aggregation · planners-payments · planners-security-hardening · planners-notifications · planners-covers · planners-anniversaries · planners-integrations
- **planners-role-system** — `planners_users.user_role` 컬럼 + `planners_templates.role_tags[]` + 키워드 시드 (2026-04-29 적용 완료)

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
- **노트/캔버스 추가**: Daily/Project 본문 하단의 버튼
  · 공통 4개: 기본 노트·손글씨·템플릿·캔버스
  · 연구원(`researcher`) 역할 추가 시 5번째 "연구노트" 버튼 노출 (질문→가설→방법→관찰→해석→다음스텝 6행 코넬 노트 자동 생성)

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

### 8) 상단 탭 (메인 메뉴) 🟢 SSOT — 매번 같음

**표기 순서 (왼쪽→오른쪽, 모두 한국어)**:
`인덱스 · 일간 · 주간 · 월간 · 연간 · 연락처 · 퍼스널 · 프로젝트 · 캔버스 · 템플릿 · 커뮤니티↗`

- 한 사람의 시간을 다른 줌으로 보는 4-View(일간·주간·월간·연간)가 중심
- 시간(Time Tracking)은 사용자가 켤 때만 추가 노출
- 영문 라벨 금지: ~~Index, Today, P.I, Project, Canvas, Templates~~
- **AI Briefing/템플릿은 메인 탭에 두지 않는다** — 각 뷰 본문에서 호출

**SSOT 파일**: `features/planners/AppTopNav.tsx` `TABS` 배열. 라벨 변경은 이 한 곳에서만.

### 8-A) 본문 서브 메뉴 (Sub-Nav) 🟢 SSOT

**단일 패턴**: 밑줄 + active teal. `IdentitySubNav.tsx` 양식을 모든 곳에서 재현.

```tsx
<nav className="flex items-center gap-1 border-b border-neutral-200 mb-4">
  {TABS.map(tab => {
    const isActive = active === tab.id;
    return (
      <button
        key={tab.id}
        onClick={() => setActive(tab.id)}
        className={`relative px-4 py-2.5 text-sm whitespace-nowrap transition-colors ${
          isActive
            ? "text-[#0F766E] font-semibold"
            : "text-neutral-500 hover:text-neutral-900"
        }`}
      >
        {tab.label}
        {tab.count != null && <span className="ml-1 opacity-60 text-xs">({tab.count})</span>}
        {isActive && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-[#0F766E]" />}
      </button>
    );
  })}
</nav>
```

**적용 대상**: 퍼스널/이력서, 템플릿(전체·대학생·프레임워크·스케줄·노트·추천·즐겨찾기), 프로젝트 상태(진행중·완료·보관·전체), 새 페이지 추가 시 무조건 이 패턴.

**금지 패턴**:
- ❌ 컬러 pill 혼합 (active=teal pill, fav=slate pill, recommended=amber pill 등)
- ❌ 둥근 카드형 탭 + 보더 강조
- ❌ 탭마다 아이콘 색상 다르게 — 아이콘은 라벨 옆 작게 1색만

### 8-B) 보조 필터 (카테고리·역할 등) ⚪

서브 메뉴 다음 줄에 **rounded-full pill**로 노출. active=`bg-neutral-800 text-white` / inactive=`bg-neutral-100 text-neutral-500`. 카테고리 컬러가 의미를 가질 때만 active 시 컬러 적용.

서브 메뉴와 시각적으로 구분되도록 작게(`text-xs px-2.5 py-0.5`) 유지.

### 8-C) 추가/수정/삭제 버튼 🟢 SSOT

**1. 새로 만들기 (페이지 우상단 1차 CTA)**
```tsx
<button className="flex items-center gap-1 px-3 py-1.5 text-xs bg-[#0F766E] text-white rounded-lg hover:bg-[#0d5e56] transition-colors">
  <Plus className="h-3.5 w-3.5" /> 새 X
</button>
```
- 위치: 페이지 헤더 우측 또는 sub-nav 라인 우측
- 라벨: `새 프로젝트` / `새 캔버스` / `새 노트` (간결한 명사)
- ❌ 금지: 풀너비 dashed border 박스 (`border-2 border-dashed`) — 빈 상태 안내용으로만 허용

**2. 카드/행 안의 추가 (인라인 +)**
```tsx
<button className="p-1.5 rounded text-neutral-300 hover:text-[#0F766E] hover:bg-neutral-100 transition-colors">
  <Plus className="h-3.5 w-3.5" />
</button>
```
- 위치: 카드 헤더 우측, 또는 리스트 마지막 행
- 아이콘만 (텍스트 X), title 속성으로 설명

**3. 수정 (Edit/Pencil)**
- 항목 hover 시 노출되는 작은 아이콘. `opacity-0 group-hover:opacity-100`
- `<Pencil className="h-3.5 w-3.5" />` neutral-300 → `text-[#0F766E]` on hover

**4. 삭제**
- 같은 패턴, `<Trash2 className="h-3.5 w-3.5" />` neutral-300 → `text-rose-500` on hover
- 영구 삭제 또는 의미 큰 삭제는 ConfirmSheet 모달로 한 번 더 확인
- 노트·캔버스처럼 가벼운 삭제는 즉시 삭제(undo 토스트 권장)

**5. 처리 결과 사이클** (task/meeting status)
- 단일 status 버튼 클릭 = 사이클 전환: 미완(`·`) → 완료(`✓`) → 보류(`⏸`) → 취소(`✕`) → 미완 (반복, 멈춤 없음)
- 변경(이동)은 별도 우측 캘린더 아이콘 → 모달 (날짜+시간 선택)
- 색상: done `bg-[#0F766E]` / hold `bg-amber-200` / canceled `bg-neutral-300` / moved `bg-violet-500`

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
| **Phase** | **세션 105 (2026-05-03)** — **PP Canvas Engine 골격 + Toolbar 고도화 + 이력서/활동거점/노트 삭제 확인** · `lib/planners/canvas-engine/` 신규 모듈(types·engine·history·render·layers·interaction·serialize·adapters) + 6단계 ~10주 로드맵 docs/PP_Canvas_Engine_Plan.md · CanvasToolbar 24색 팔레트 팝오버(HEX·픽커·최근8) + 펜 굵기 슬라이더(0.5~32px) + 이미지·레이어 순서(맨앞/앞/뒤/맨뒤) + 모바일 "더보기" 메뉴 · CanvasStudio z-9100(모바일 nav 위) + 저장 아이콘만 · IdentityView 이력서 섹션(학력·경력·자격증·기술·언어·수상) + sticky 서브 네비 · SettingsBases 활동 거점(사무실·집·학습·운동·카페·기타 6 type) · DailyView 코넬 페이지 삭제 ConfirmSheet · HandNote __HW__ 직렬화 헬퍼를 canvas-engine/adapters로 추출 · `planners_identities.resume`·`planners_users.activity_bases` JSONB 컬럼 추가 |
| **Phase 104** | 세션 104 (2026-04-30) — HandNote 이미지·뷰박스·코넬 UX 개선 · SVG viewBox + getSVGPoint 좌표계 통일 · HandImage 타입 + 이미지 삽입(파일/붙이기)/선택/이동/삭제 · renderToCanvas viewBox 스케일 보정 · 코넬 엔터→신규행 포커스 |
| **Phase 103** | **세션 103 (2026-04-30)** — **Settings page.tsx 모듈 분리 완성** (1,799줄 → 367줄 슬림 쉘 · 5개 feature 모듈: SettingsTheme·SettingsAi·SettingsNotifications·SettingsIntegrations·SettingsExport · TypeScript 에러 0) |
| **Phase 102** | **세션 102 (2026-04-29)** — **Settings 디자인 시스템 4단계 완성** (Claude Design 핸드오프 기반) · 4그룹 IA(시작/스타일/기능/기술) + PC 200px sticky 사이드바 + 모바일 가로 pill row · 8개 프리셋(Mono Light·Cream Serif·Editorial·Slate Pro·Black Ink·Campus Mint·Campus Blush·Designer Mono) — 5개 토큰(컬러·모서리·system폰트·user폰트·모드) 한 번 탭 적용 · `.pp-settings` 토큰 시스템(11종 라이트+다크) · xl+(1280px) Live Preview 우측 sticky 패널(Daily/Project/AI 3탭) — CSS 변수로 즉시 반영 · 컬러 18색(Mustard·Orange·Emerald·Olive 추가) · 화면 모드 작동(planners-app-shell + 일괄 반전) |
| **Phase 100** | 세션 100 (2026-04-29) — **CanvasEditor Excalidraw → tldraw 마이그레이션** (MIT 무료, 워터마크 없음) · `<Tldraw onMount>` + `editor.store.listen` + `getSnapshot/loadSnapshot` + `getSvgAsImage` 썸네일 |
| **Phase 96** | 세션 96 (2026-04-28) — **협업자 RLS 권한 강제 완료** (resolveRole() owner/editor/viewer 3단계 · viewer PATCH 403 · editor owner-only 필드 차단 · userRole 클라이언트 반환 · 역할 배지 + ShareField/CollaboratorField 오너만 노출) · **이월 작업 전체 완료** (TemplatesView 754줄+7개 grid 파일 분리 확인 · 포트폴리오 모드 /planners/portfolio/[memberId] 확인) · 배포 전 블로커 5개 사용자 액션 대기 |
| **Phase 93** | 세션 93 — 통합 캘린더 시스템(`planners_calendar_entries` 단일 테이블 + `calendar-rules.ts` SSOT 5 kinds × 4 views 노출 룰) · 4-View 통합 렌더 · 공공데이터 자동 반영(KR 공휴일 30 + 24절기 시드 + cron 매년 1/1) · Daily 우측 재구성 · 트래킹 7종 · MonthlyAnalytics·YearlyAnalytics 3-탭 · Canvas storageKey fix · Settings upsert + SaveAllBar · 구독 + 런칭 프로모션
| **Phase 92** | 세션 92 (2026-04-27) — 모바일 PWA(orientation any · AppMonthBar 모바일 숨김) · HandNote 종합 개선(펜 4종·스타일러스 지우개 자동 감지·팜 리젝션·캔버스 자동 확장 · perfect-freehand 추가) · AI 브리핑 통합(midday 타입 + 시간대 자동 추론 + 단일 채팅 UI · 이메일 기본 OFF) · Weekly 순서 재정렬(GPR→Vrief→주간 계획) · Monthly 재정렬(테마/목표→집중 영역→일정→회고)+월간 통계(5종 task 분포·에너지·일간 계획) · **Community 사이트화** (`/planners/community` 공개 읽기, 로그인 회원 작성, 카테고리 4종 · 앱 메뉴는 외부 링크) · **PP AI 워크스페이스 슬롯 통일** (UniverseUtilityBar `workspacePath`, HeRo·SmarComm 패턴) · **온보딩 루프 fix** (`storageKey: tenone-auth` · auth_id→email→자동생성 3단계 · super_admin/staff/manager 게이트 우회 · 마스터 DB 마킹) (2026-04-27 세션 92) |
| **운영 중** | 마케팅 랜딩 (`/planners`, `/planner-tool`, `/planning` 등) |
| **배포 대기** | `/planners/app/*` 전체 + 결제 + 온보딩 + AI 브리핑 + PWA + 연동 |
| **완료 범위** | W1~P2 전 범위 + P3 #17·19·20 + P4 #21·22·23·24(GTM·Help·피드백·Intra) + P5 #25·26·27 |
| **배포 전 블로커** | PWA 아이콘 2개 · Toss 가맹점 승인 · 환경변수 Vercel 설정 · Google OAuth 자격 · Supabase Redirect URL 추가 |
| **이월 작업** | P3 #18 기업플랜 (대규모, 결제 사업 시작 시) — 나머지 이월 작업 모두 완료 |
| **주요 결정** | 19,000원/년 · Weekly 기본 · PDF 구매자 무료 · 커뮤니티 운영 안 함 |
| **최근 결정 누적** | 능동 AI가 핵심 차별점 · 이메일 백업 · Web Push 선택 · 외부 연동은 플래너 중심 입출력 채널 · 59종 템플릿 전부 시각 그리드 편집 지원 (localStorage 자동 저장 + markdown export) · **Templates · AI Briefing 은 본문 서브링크 (메인 메뉴는 Index/Today/Weekly/Monthly/Yearly/P.I/Project/Contact)** · **PWA 전용** (앱스토어 미등록, /planners/install 가이드) · **누적 이월 = 어제 한정이 아니라 60일 미완료 일괄 회수** · **미완 업무는 자동 이월이 아닌 선택 모달 방식** · **Weekly 뷰는 GPR/Vrief 없이 7일 세로 목록 + 좌 정보 패널(32%) + 우 노트(flex-1)** · **노트 레이블 = "노트" (Daily·Weekly 통일)** · **Daily↔Weekly 노트는 `_cornell` JSON 포맷으로 양방향 호환** · **Daily·Weekly 일정 추가 버튼 = 아이콘 전용 `p-1.5 rounded` 스타일** · **Weekly 새 일정 모달에 업무 탭 포함** · **템플릿은 placeholder 차원이 아니라 컨설턴트급 가이드(저자·원칙·실제 시나리오)까지 일관 적용** · **Contacts는 진입 시 즐겨찾기+최근만 렌더, 우측 인덱스는 스크롤 점프 X·필터링 방식, 1,000명+ 데이터도 인스타식 점진 노출(50명/페이지)** · **getInitialChar는 invisible 문자·호환 자모·Choseong Jamo까지 견고하게 분류** |

---

## 참고 문서

- 루트 CLAUDE.md § 1.4 (접근 모델 6종)
- 루트 CLAUDE.md § 1.3.1 (Capability 모델)
- docs/Universe_Coin_Policy.md
