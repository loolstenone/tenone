# 작업 현황

> 마지막 업데이트: 2026-04-26 (세션 89 — Contacts 극강화 + Planners 헤더 정비)

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
