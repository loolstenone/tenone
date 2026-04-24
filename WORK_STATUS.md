# 작업 현황

> 마지막 업데이트: 2026-04-24 (세션 84 — Planner's Planner AI MVP 풀스택 구축 완료)

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

### 남은 기능 작업 (P3~P5)

**P3 고급 기능**
- #16 필기 입력 (Fabric.js/Excalidraw) — 태블릿·S Pen·Apple Pencil 지원
- #17 FrameWorkBook 구조화 위젯 — 만다라트·SWOT을 자유 텍스트에서 전용 UI로
- #18 기업 플랜 — 팀·조직 협업 Project Book
- #19 AI 설정 고급화 — `ai_context_scope` UI · 브리핑 샘플 미리보기
- #20 Copy-to-AI 페이로드 편집

**P4 운영·분석**
- #21 GTM 이벤트 트래킹 (온보딩 완료율·Weekly 작성·AI 사용량)
- #22 사용자 매뉴얼·FAQ (`/planners/app/help`)
- #23 베타 피드백 버튼
- #24 Intra 관리 확장 (사용량·브리핑 로그·구독 리포트)

**P5 추가 연동**
- #25 Notion · #26 Slack · #27 Apple Calendar/Outlook (CalDAV)

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
