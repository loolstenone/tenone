# 작업 현황

> 마지막 업데이트: 2026-04-27 (세션 93 — 통합 캘린더 시스템 + 4-View 통합 + 공공데이터 + Daily 우측 재구성 + 트래킹 7종 + Yearly 시작월/구간)

---

## 세션 93 핵심 성과 (2026-04-27)

### 통합 캘린더 (Phase 2)
- 단일 `planners_calendar_entries` 테이블 + `lib/planners/calendar-rules.ts` SSOT
- 5 kinds × 4 views 노출 룰 매트릭스
- Daily/Weekly/Monthly/Yearly 모두 통합 + reusable Editor/List
- legacy anniversaries 일괄 마이그레이션

### 공공 데이터 (Phase 3)
- KR 공휴일 30개 + 24절기 시드 (member_id NULL 시스템 엔트리)
- country_pref 기반 자동 노출 (4국 선택)
- 공공데이터포털 특일정보 API 클라이언트 + cron(매년 1/1)

### Settings 확장
- 한 해 시작월 select
- 공휴일·절기 국가 4종 다중 선택
- 트래킹 7종(에너지·만족도·기분·공부·신앙·운동·건강), default 만족도
- "구독 현황" 라벨 + 런칭 프로모션
- 전체 저장 SaveAllBar

### Daily UI 대수술
- 별도 한 장면 카드 제거 → "오늘의 한 줄" 카테고리 8번째로 통합
- 우측 컬럼: 미니 달력 + 트래킹(수정버튼) + 한 줄 + 프로젝트 카드
- 4번째 노트 옵션 캔버스 추가
- 서버 사이드 미디어 업로드(Storage RLS 우회)

### Yearly 보기 개선
- 분기/반기/연간 토글
- 시작월 회전 적용
- Anniversary 셀 텍스트 노출, 하단 목차 제거
- 분기별 목표 "+ 추가" 명시 + 라벨 정정

### 버그 fix 누적
- Canvas API storageKey 누락
- Settings update→upsert + 토스트
- 노트 저장 에러 핸들링
- Yearly 분기별 목표 입력
- Anniversary 셀 텍스트
- "오늘의 한 줄 결과"→"오늘의 한 줄" + 카테고리 8종

### 환경변수 이슈 (사용자 조치 필요)
`.env.local` 의 `# SUPABASE_SERVICE_ROLE_KEY=...` 주석 해제 필수. 미설정 시 모든 admin DB 작업이 "Invalid API key" 실패.

---

## 세션 92 핵심 성과 (2026-04-27)

---

## 세션 92 핵심 성과 (2026-04-27)

### 모바일 PWA + 회전
- manifest `orientation: any`, AppMonthBar 모바일 숨김

### HandNote 종합 개선
- 펜 4종(펜·만년필·마커·형광펜), 스타일러스 지우개 자동 감지, 팜 리젝션, 캔버스 자동 확장, 클린 아이콘
- `perfect-freehand` 패키지 누락 해소

### AI 브리핑 통합
- midday 타입 추가, 시간대 자동 추론, 단일 채팅 UI
- 이메일 옵션화 (기본 OFF)

### Weekly/Monthly 재정렬 + 월간 통계
- Weekly: GPR → Vrief → 주간 계획 (3분할 그리드)
- Monthly: 테마/목표 → 집중 영역 → 일정 → 회고 → 통계
- 월간 RPC v2 (5종 task 분포 + 에너지 + 일간 계획 수립일)

### Community 사이트화
- `/planners/app/community` → `/planners/community` (공개 읽기, 로그인 회원 작성)
- 4 카테고리: 후기·사례·제안·일상
- posts·comments·likes 테이블 + RLS + 카운트 트리거
- 앱 메뉴는 외부 링크(↗), 공개 헤더 Community 추가
- PP AI 버튼 → UniverseUtilityBar `workspacePath` 슬롯(HeRo·SmarComm 패턴 통일)

### 온보딩 루프 fix
- API: `storageKey: tenone-auth` 추가, auth_id→email→자동생성 3단계 폴백
- Layout: super_admin·staff·manager 게이트 우회
- 마스터 계정 DB 직접 마킹
- 데이터 잔존 확인(daily 8·weekly 3·monthly 1·projects 1·briefings 2 · 손실 없음)

---

## 세션 91 핵심 성과 (2026-04-27)

### Daily UX 정리
- 노트 추가 버튼 3분할 그리드 (기본 노트 / 손글씨 노트 / 템플릿)
- 신규 노트 타이틀 빈 값으로 시작 → placeholder가 예시 역할
- 타이틀 폰트 색 강화 (neutral-900) + placeholder italic·light 구분
- Cornell 헤더 좌측 padding row(w-6 X컬럼)와 정렬 (pl-10)

### TemplatesView Step 2 — 14개 그리드 카테고리 파일 분리
- `features/planners/template-grids/quadrants.tsx` — SWOT, 4P, Ansoff, BCG, 9-Box, Eisenhower, PEST, MoSCoW, Quadrant Blank, Kano (10개)
- `features/planners/template-grids/canvas.tsx` — Lean Canvas, BMC, VPC, OKR (4개)
- TemplatesView.tsx 3,072 → 2,549 라인 (523라인 추출)

### 템플릿 디테일 고도화 — 59종 모두 완료
일관 적용 패턴: 메타 영역(날짜·기간·주제·관계자) + 저자/원전 가이드 박스(amber) + 컨설턴트급 placeholder 예시(한국 1인 사업가 시나리오) + 회고·검증·다음 액션 섹션(담당·기한 강제) + 양립 항목 2-col 레이아웃.

| 카테고리 | 종 | 핵심 |
|---|---|---|
| 미팅 | 3 | Meeting / 1on1 / Interview — 회의록·Manager Tools·Mom Test |
| 회고 | 3 | KPT / AAR / 5Why — Top Try·US Army·Toyota·Verify |
| 사고법 | 5 | Mandalart / Ikigai / 5W1H / SCAMPER / Feynman |
| 공감 | 4 | EmpathyMap / Persona / JTBD / JourneyMap — 4 Forces·Top 3 기회 |
| 시간관리 | 5 | TimeBlock / DeepWork / Pomodoro / EnergyMap / HabitTracker |
| 저널 | 4 | EmotionLog / Gratitude / Reading / WeeklyJournal — CBT·Three Good Things·Active Reading |
| 분석·운영 | 5 | Porter5 / Fishbone / OODA / Brainstorm / DecisionLog — Bezos T1/T2·Lessons |
| 노트·운영 | 4 | Standup / Zettelkasten / Mindmap / DailyDesign — Luhmann·Buzan·정체성 기반 |
| 계획 | 9 | WeeklyReview/Win, Monthly, Quarterly, Year, FiveYear, MovingAverage, ReversePlan, Sprint |
| 분석 테이블 | 4 | RICE / Pareto / DecisionMatrix / Cornell — Top 1~3 결정·Sanity check |
| 사분면 | 10 | quadrants.tsx 그룹 — TOWS·6M·9-Box 등 |
| 캔버스 | 4 | LeanCanvas / BMC / VPC / OKR |

### Contacts 페이지 UX 대전환
- **본문 폭 일치**: max-w-[1400px] → max-w-6xl (Daily/Weekly와 동일)
- **letterFilter 도입**: 'top'(즐겨찾기+최근) / 'all'(전체) / 'ㄱ'·'A'(특정 letter)
- **자동 All 폴백**: 즐겨찾기·최근 둘 다 비어 있으면 top 모드라도 전체 노출 (첫 사용자 빈 화면 X)
- **인스타식 무한 스크롤**: 50명씩 점진 렌더, IntersectionObserver(rootMargin 300px), letterFilter/view/search 변경 시 limit 리셋
- **우측 인덱스 강화**: All 버튼 추가, 클릭 = 필터링(스크롤 X), 선택 letter highlight, 카운트 tooltip
- **상단 즐겨찾기 + 최근 분리 섹션**: amber border 즐겨찾기 / Clock 최근 사용
- **중복 정리 강화**: 한국 휴대폰 마지막 8자리 정규화(+82 흡수) + 이름·회사 fallback
- **초성 분류 견고화**: getInitialChar에서 invisible 문자(BOM/ZWSP/NBSP) 제거 + 호환 자모(U+3131~) + Choseong Jamo(U+1100~) 직접 매핑 — '심온' 같은 잘못 분류 케이스 해소

---

## 세션 90 핵심 성과 (2026-04-27)

### 메뉴 재편 + 본문 서브 링크
- AppTopNav · AppSidebar 에서 **Templates · AI Briefing 메인 메뉴 제거**
- 신규 `PlannersUtilityLinks.tsx` 칩 컴포넌트 → Index · Today · Weekly · Monthly · Yearly · P.I · Project 본문 헤더에 일관 배치
- AppTopNav 우측 클러스터 + 사이드바 + Settings + 푸터 + Help 등 6곳 **앱 설치 진입점** 추가
- Contact 메뉴 가로 사이즈 위배 수정 (overflow-x 자연 스크롤 + 스크롤바 시각 숨김 + 우측 액션 분리선)

### Project 상세 페이지 고도화
- 기본 탭 cover→**notes** 로 전환 (작업 영역이 첫 화면)
- 헤더: 색상 바 + 제목 + 상태 칩(컬러 토큰) + 일정 한 줄 → 정보 위계 명확
- 표지 탭 2컬럼 레이아웃 (좌:커버 미리보기/변경, 우:제목·상태·시작·종료를 divide 라인으로 통합)

### 프로젝트 노트에 인터랙티브 템플릿 적용
- ProjectNotesTab 의 NoteCard / NoteExpandModal 가 콘텐츠 마커(`<!-- planners:tpl=key -->`) 감지 → `renderFramework` 로 그리드 렌더
- DailyView 와 동일하게 localStorage 데이터 자동 저장 (key=`tplDataKey(noteId)`)
- 템플릿 노트는 제목 빈 값 + placeholder 로 라벨 안내, 연필 편집 버튼 숨김
- DB 마이그레이션 없이 backward compatible

### 누적 미완료 이월 (어제→과거 60일)
- `app/api/planners/daily/carry-over/route.ts` 재설계 — 과거 N일 일괄 스캔, status='todo' 만 수집, 가까운 과거 우선 dedupe, source_date 기록, 원본 row 자동 carried 처리
- 신규 `app/api/planners/daily/pending-count/route.ts` — count·days·oldest 반환
- DailyView 버튼 라벨: "어제 미완료 이월" → **"누적 미완료 N건 이월"** + tooltip 출처 안내

### PWA 설치 시스템
- 신규 `/planners/install` 페이지 (`app/(Planners)/planners/install/page.tsx` + `features/planners/InstallView.tsx`)
- 자동 플랫폼 감지 (Android · iOS · PC), `beforeinstallprompt` 캡처해 1-click 설치 버튼, iOS 는 Safari 4단계 그림 가이드
- 이미 standalone 이면 "설치됨" 안내, URL 복사 + QR 코드, "App Store / Play Store 에 없는 이유" FAQ
- `/planners/planner-tool` 타이틀 바로 아래에 다운로드 카드 (로고 + 앱 다운로드 CTA + 보조 카피)

### Contacts 주소 검색기
- 신규 `features/planners/AddressPicker.tsx` — Daum Postcode lazy-load (버튼 클릭 시 1회), 모달 내 검색, 도로명/지번/건물명 자동 매핑
- 무료·무인증·CORS 무관, 페이지 진입 비용 0

### 새 로고 적용
- `public/planners-icon-192.png` · `planners-icon-512.png` 교체 (검정 BG + 화이트 P + 펜촉)
- AppTopNav 좌측(24px) · AppSidebar 상단(32px) · Install Hero(64px) · planner-tool 다운로드 카드(48px) 에 마크 노출, 불필요한 그라데이션 래퍼 제거

---

## 세션 89 핵심 성과 (2026-04-26)

### Contacts 기능 극강화 (Google Contacts급)

| 영역 | 내용 |
|---|---|
| DB 정리 | 12,273명 → **6,064명** (6,209 중복 자동 제거 · 권오성 12→1) |
| 시스템 라벨 정리 | myContacts·Remember 메타라벨 일괄 제거 |
| 1만명 한도 → **무제한** | API 페이지네이션 (PostgREST max-rows 우회) |
| 자동 dedupe | bulk POST `skip_duplicates` 기본 활성 (phone/email 키) |
| 라벨 동기화 모드 | `merge_labels=true` — 기존 row에 라벨/빈 필드만 병합 |
| 라벨 관리 API | `/api/planners/contacts/labels` (POST·PUT·DELETE) |
| CSV 양방향 | Google Contacts CSV 헤더 자동 매핑. Export 토글 (vcf/csv) |
| 빠른 추가 | 사이드바 한 줄 입력 자동 파싱 |
| 다가오는 생일 카드 | 14일 내 생일자 위젯 (D-day 색상 구분) |
| 마지막 연락 추적 | tel:/mailto: 클릭 시 last_contacted_at PATCH + "최근 연락" 뷰 |
| Bulk Edit | 회사·직책·그룹·관계·즐겨찾기·메모 일괄 수정 |
| 수동 병합 | 2명 선택 시 필드별 A/B 선택 UI |
| Google Contacts 레이아웃 | 좌측 사이드바 + 테이블 행 + 가나다 fixed sidebar |
| 천 단위 콤마 | 모든 카운트 `toLocaleString("ko-KR")` |

### Planners 사이트 헤더 + 홈 정비

- 헤더 4그룹 명확 분리 (로고·구분선·메뉴·CTA) + vertical divider
- "Planner's" 메뉴 제거 (로고와 중복)
- PP AI 진입 CTA 헤더 우측 (teal-emerald 그라디언트, 인증 상태별 라우팅)
- 홈 ExploreSection 제거 (헤더와 100% 중복) → PPAISpotlight 신설
- AppSidebar·AppTopNav 메뉴 순서·라벨 SSOT 통일

### 기타 개선

- TemplateNoteBlock ⤢ Maximize + 타이틀 편집 명확화
- ProjectNotesTab 피커를 DailyView 동일 UX로 통일 (검색·즐겨찾기·바텀시트)
- DailyView·ProjectNotesTab 즐겨찾기 필터 (localStorage 공유)
- **PlannersThemeProvider 치명 버그 수정**: `*=` → `~=` selector — `hover:bg-[#0F766E]/5` 가 항상 teal 덮던 문제 해결
- Settings: alert→toast, 컬러/폰트 섹션 최상단 이동

### 신규 파일
- `app/api/planners/contacts/labels/route.ts`
- `sql/planners-contacts-v2.sql` (labels TEXT[], is_favorite, organization, title, address)

---

## 세션 88 (2026-04-26 이전)

### 버그 수정 7종 + Contacts 신규

| # | 항목 | 상태 |
|---|------|------|
| 1 | 오늘 날짜 에러 (UTC→KST) | ✅ DailyView·MonthlyView·AiBriefingView |
| 2 | 기념일 요일 계산 | ✅ YearlyView 모달 getDayOfWeek |
| 3 | 연락처 가져오기 (vCard) | ✅ ContactsView vCard import |
| 4 | 연락처 그룹핑 | ✅ group_name 필터 + 섹션 분리 |
| 5 | 기념일 관계유형 | ✅ YearlyView relationship 필드 |
| 6 | 세팅 컬러 앱 전체 반영 | ✅ PlannersThemeProvider + applyPlannersTheme |
| 7 | 세팅 데이터 백업 | ✅ JSON export (7 API 병렬) |

**신규 파일**: `features/planners/ContactsView.tsx` · `app/(Planners)/planners/app/contacts/page.tsx` · `app/api/planners/contacts/route.ts` · `sql/planners-contacts.sql` · `features/planners/PlannersThemeProvider.tsx` · `lib/planners/auth.ts`

---

## 세션 87 핵심 성과 (2026-04-25)

### Templates 59종 전체 인터랙티브 그리드화 — P3 #17 완수

기존 3종(BCG·SWOT·9Box) + Batch 1~10 총 56종 신규 → **59/59 전 템플릿 시각 편집 그리드 완성**.

| Batch | 범주 | 신규 그리드 |
|---|---|---|
| 0 (기존 세션) | Framework | Empathy Map · Lean Canvas · Mandalart |
| 1 | 4-cell | Eisenhower · PEST · MoSCoW · 4분면 |
| 2 | 캔버스 | BMC · VPC |
| 3 | 구조 | OKR · Persona · JTBD |
| 4 | 표·랭킹 | RICE 🏆 · 5W1H · 5Why 사다리 |
| 5 | 특수 도형 | Ikigai · Porter5 · SCAMPER · Kano · Pareto · Fishbone · Journey Map |
| 6 | Note 구조 | KPT · OODA · Cornell · Decision Matrix · Feynman (swot_self 자동) |
| 7 | Note 세션 | 1:1 · 회의록 · 인터뷰 · AAR · 브레인스토밍 ⭐ · 의사결정 로그 |
| 8 | Note 로그 | 감정 로그 😊 · 감사 일기 · 독서 노트 · 스탠드업 · 주간 저널 · 제텔카스텐 · 마인드맵 |
| 9 | Schedule 시간 | 타임블록 · 하루 설계 · 딥워크 · 포모도로 🍅 · 습관 트래커 ✅ · 에너지 지도 · 주간 리뷰 · 주간 WIN |
| 10 | Schedule 계획 | 월간 테마 · 분기 계획 · 연간 12개월 맵 · 5년 비전 · 90일 실험 · 역산 계획 · 스프린트 |

### 공통 장치
- 모달 헤더 한국어 + 영문 부제 자동 표기
- `localStorage` 자동 저장 → Daily/ProjectNotes 삽입 시 markdown export
- JSON 구조 템플릿(RICE·Pareto·Journey·DM·TimeBlock·DeepWork·Pomodoro·Habit·Energy·YearPlan·Brainstorm)은 테이블 markdown으로 변환
- 공용 헬퍼: `LabeledInput`·`LabeledBox`·`CellTextarea`·`QuadrantGrid`
- 공용 유틸 `lib/planners/templates.ts` 추출 → `DailyView`·`ProjectNotesTab` 공유

### 변경 파일
- `features/planners/TemplatesView.tsx` (+2981줄 — 27개 그리드 컴포넌트 신규)
- `lib/planners/templates.ts` (신규 · 공용 export 유틸)

### 커밋
- `ca75c371 feat(planners): 전 템플릿 59종 인터랙티브 그리드화`

---

## 이번 세션 핵심 성과

### Planner's Planner AI — 런칭 가능 MVP 전 구간 완성

종이 플래너 "2026 Planner's Planner All in One"을 웹/앱 서비스 **Planner's Planner AI**로 확장. W1~P2 전 범위 완성.

**철학**: "우리는 모두 기획자다, 적어도 자기 인생에서 만큼은 / 나는 무엇을 도모(圖謀)하고 있는가 / 생각한대로 살지 않으면 사는대로 생각하게 된다"

**구성 5축**: Personal Identity + Scheduler + Note + Project Book + Template

**핵심 차별점**: **능동 AI 비서** (아침 브리핑·저녁 정리) — Vridge(Vrief+GPR) 방법론 × Identity 정렬

---

## 구축 내역

### DB (16 테이블 + RPC 5)
- `planners_users` · `planners_identities` · `planners_yearly/monthly/weekly/daily`
- `planners_projects` · `planners_project_vriefs` · `planners_project_gprs` · `planners_project_notes`
- `planners_ai_briefings` · `planners_ai_usage`
- `planners_templates` (59종) · `planners_covers` (15종)
- `planners_payments` · `planners_push_subscriptions` · `planners_integrations` · `planners_external_events`
- RPC: `planners_activate_subscription` · `planners_activate_pdf_buyer` · `planners_expire_subscriptions` · `planners_weekly/monthly/yearly_summary`

### 주요 페이지 (13개)
- `/planners/onboarding` — 4단계 (Welcome→Mode→AI 설정→Identity 라이트)
- `/planners/purchase` — Toss Payments 19,000원/년
- `/planners/app/{today,weekly,monthly,yearly,identity,projects,projects/[id],templates,ai-briefing,search,settings}`
- `/planners/offline` — PWA 오프라인 페이지
- `/intra/planners` — 관리자 대시보드 (구독자·결제·수동 활성화)

### 능동 AI 인프라
- Haiku 4.5 (`claude-haiku-4-5-20251001`) 기반 아침 브리핑·저녁 정리
- Context: P.I / Daily / Weekly / Monthly / Projects 크로스 참조
- Vercel Cron: 매 시간 실행 (유저 설정 시각과 매칭해 브리핑 생성)
- 이메일 백업 (Resend) + Web Push (VAPID, 환경변수 설정 시)

### 결제·구독
- Toss Payments: request → Toss widget → success callback → confirm API → 구독 활성화
- PDF 구매자 무료 활성화: 관리자가 Intra에서 수동 매칭 (1년 무료)
- 만료 자동 감지 → purchase 리디렉트

### 외부 연동
- **Google Calendar**: OAuth 2.0 + access/refresh token + 이벤트 fetch + 90일 sync
- **Todoist**: 개인 API 토큰 방식 + 오늘 태스크 → Daily import

### Templates 59종
- FrameWorkBook 25: SWOT · 만다라트 · OKR · Quadrant · Business/Lean Canvas · 5W1H · PEST · Ikigai · Persona · RICE · Eisenhower · MoSCoW · Fishbone · 5Why · Pareto · Journey Map · Empathy Map · VPC · Porter 5 · Ansoff · BCG · SCAMPER · JTBD · Kano
- Schedule 15: Time Block · Weekly Review · Monthly Theme · Quarterly · Daily Design · Year Plan · 5-Year · Energy Map · Pomodoro · Deep Work · Weekly WIN · Reverse Plan · Sprint · Habit Tracker · 90-Day Experiment
- Note 19: Cornell · Meeting · Brainstorm · Decision Log · KPT · Feynman · Zettelkasten · Mindmap · Reading · Standup · 1:1 · Interview · Gratitude · Emotion Log · Decision Matrix · OODA · Personal SWOT · AAR · Weekly Journal

### 원본 PDF 충실도
- 상단 7대 메뉴 + 사이드바 모드 (Weekly 기본 / All in One 고급)
- 체크박스 기호: □ V → ┕ (순환)
- 공휴일·절기 2026~2027 (법정공휴일 15개 + 24절기)
- Anniversary & Big Event 2p 스프레드 (상반기/하반기 31일 매트릭스)
- 날짜 1개 = Daily + Note 2슬롯 (PDF의 N 링크 2개 재현)
- 4계층 드릴다운 (Index → Yearly → Monthly → Weekly → Daily)

---

## 이번 세션 결정사항

| 결정 | 내용 |
|------|------|
| 가격 | **연간 19,000원** (정기결제 아님, 수동 갱신) |
| 기본 모드 | **Weekly** (빠른 진입) · All in One은 고급 옵션 |
| PDF 구매자 | **무료 1년** (a: PDF 구매자에게 웹앱 무료 제공) |
| 커뮤니티 | **운영 안 함** (5번 결정) |
| 모드 전환 | Settings에서 언제든 |
| AI 톤 | professional · friendly(기본) · brief |
| 체크박스 | PDF 관례 계승 (V / → / ┕) |
| 능동 AI 비용 | 월 ~$0.18/유저 (Haiku 4.5, 월 60회) |

---

## 보안 감사 결과 (Supabase get_advisors)

- planners_* 테이블 **16개 RLS 정책 문제 0건**
- planners_* 함수 6개 `search_path` 경고 → 모두 ALTER로 고정 완료
- 전체 ERROR 8개는 레거시 VIEW (`hit_a_results_safe` 등) — Planner's 배포 무관

---

## 다음 집·사무실·새 세션에서 이어 할 작업

### 배포 직전 필수 (코드 0줄, 외부 작업)
1. **환경변수 Vercel 설정**:
   - `ANTHROPIC_API_KEY` · `CRON_SECRET`
   - `TOSS_SECRET_KEY` · `NEXT_PUBLIC_TOSS_CLIENT_KEY` (실제 가맹점 승인 후 live 키)
   - `VAPID_PUBLIC_KEY` · `NEXT_PUBLIC_VAPID_PUBLIC_KEY` · `VAPID_PRIVATE_KEY` · `VAPID_SUBJECT`
   - `GOOGLE_CLIENT_ID` · `GOOGLE_CLIENT_SECRET`
   - `NEXT_PUBLIC_APP_URL=https://planners.tenone.biz`
2. **PWA 아이콘 자산**: `/public/planners-icon-192.png` · `planners-icon-512.png`
3. **Toss 가맹점 승인** 및 실 결제 키 적용
4. **Google Cloud Console**: Redirect URI `https://planners.tenone.biz/api/planners/integrations/google/callback` 등록
5. **Supabase Allowed URL**: `https://planners.tenone.biz/**` 추가
6. Vercel 도메인 연결: planners.tenone.biz

### 완료 확인 (세션 85 감사)

세션 84에서 pending으로 기록된 아래 항목들이 이미 구현 완료 상태임을 확인:
- ✅ P3 #19 AI 설정 고급화 (`ai_context_scope` UI + 브리핑 샘플 미리보기) — `settings/page.tsx`
- ✅ P3 #20 Copy-to-AI 페이로드 편집 (`editing` state + textarea) — `CopyToAiButton.tsx`
- ✅ P4 #22 사용자 매뉴얼·FAQ — `app/(Planners)/planners/app/help/page.tsx`
- ✅ P4 #23 베타 피드백 버튼 — `features/planners/BetaFeedbackButton.tsx`
- ✅ P5 #25 Notion · #26 Slack · #27 iCal — `settings/page.tsx` UI + API routes

### 이번 세션 추가 완료 (세션 85)
- ✅ P4 #21 GTM trackPlanners 추가:
  - `CopyToAiButton.tsx` — `planners_copy_to_ai` (target: claude/chatgpt/gemini)
  - `WelcomeTracker.tsx` (신규) + `app/layout.tsx` — `planners_subscription_started` (?welcome=1)
  - `app/page.tsx` — welcome 파라미터 today 페이지로 전달

### 완료 확인 (세션 86 감사)

세션 85에서 pending으로 기록된 아래 항목이 이미 구현 완료 상태임을 확인:
- ✅ P4 #24 Intra 관리 확장 — `/intra/planners` 4탭 (구독자·결제·브리핑 로그·AI 사용량) + 통계 그리드 완성
  - `app/intra/planners/page.tsx` (421줄) — 탭·검색·수동 활성화 모달
  - `app/api/intra/planners/briefings/route.ts` — 최근 200개 브리핑 + 이메일 조인
  - `app/api/intra/planners/usage/route.ts` — 월별 사용량 + 집계 stats
- ✅ 빌드 검증 (exit 0, 세션 86)

### 남은 기능 작업 (대규모 이월)

**P3 대규모**
- #16 필기 입력 (Fabric.js/Excalidraw) — 태블릿·S Pen·Apple Pencil 지원
- ~~#17 FrameWorkBook 구조화 위젯~~ — ✅ 세션 87 완료 (전 59종 그리드화)
- #18 기업 플랜 — 팀·조직 협업 Project Book

### 세션 87 이월 (소규모)
- `features/planners/TemplatesView.tsx` 2700+ 줄 → 다음 세션에서 `features/planners/template-grids/` 폴더로 그리드 컴포넌트 27개 분리 리팩토링 권장
- 유저가 공유한 Google Drive 4개 폴더(프레임워크/노트/놀이/스케쥴) 미검토 — 추가 템플릿 후보 발굴 대상
- 기타 미커밋 잔업 49 modified + 10 untracked (다른 Planner's 세션 진행중 코드로 판단, 본 세션과 별개) — 별도 정리 세션 필요

### 배포 후 모니터링 과제
- 능동 AI 7일 연속 실동작 테스트 (크론 정상 트리거 확인)
- Haiku 4.5 API 비용 실측
- 결제 실제 성공률
- Google Calendar 동기화 정상성
- PWA 홈스크린 설치율
- 온보딩 이탈 구간 분석

---

## 세션 시작 시 우선 체크 사항

1. **환경변수**: 위 목록 중 아직 설정 안 된 것 확인
2. **PWA 아이콘 여부** 확인 (없으면 manifest에서 경고 뜸)
3. `/planners/planner-tool` 페이지의 "Now Live" CTA → `/planners/purchase`로 연결 확인
4. 로그인 → 온보딩 → Today → Weekly → Project → AI Briefing 전체 흐름 로컬 검증 (`npm run dev`)

---

## 누적 세션 요약 (전 세션까지)

- 세션 83: HeRo 잔업 정리 (매칭 엔진 v3 DB 적용, audition 페이지 리디렉트 정리, HIT 질문 DB 단일화, HitProfileBadge 브랜드 배포, E2E 빌드 검증)
- 세션 82: HeRo P3 UI/UX 색 SSOT 전 페이지 감사 완료
- 세션 81: HeRo Journey 워크스페이스 Day 3 + Talent Agency 리브랜딩 + 64 영웅 유형 v2
- 세션 80: HeRo P3 색 SSOT 초기
- ...
