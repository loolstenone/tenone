# 작업 현황

> 마지막 업데이트: 2026-05-04 (세션 107 — Planner's Planner를 마이버스로 완전 흡수)

---

## 세션 107 핵심 성과 (2026-05-04)

### 의사결정
- **PP → 마이버스 단일화**: PP가 마이버스 비전(개인 일상 관리·기록·성장)으로 수렴 중. 옵션 A 채택. 9 영역 SSOT(BODY·업무·공부·일상·일정·여행·이동·관계·_people) + 5 채집 행동 + 5축 메타데이터 SSOT 확립

### DB
- 테이블 29개 + 함수 13개 `planners_*` → `myverse_*` RENAME (인덱스·FK·RLS·트리거 자동 추적, 함수 본문 늦은 바인딩 재작성)
- `sql/myverse-rename-planners-to-myverse.sql` 적용 완료, 잔여 `planners_*` 객체 0건
- 코드 178개 파일 일괄 sed
- `members.affiliations[]`에 `'myverse'` 자동 등록 (온보딩 API + 백필 1명)

### 라우트 + 미들웨어
- `/myverse/app/*` 14개 PP 시간뷰·도구 라우트 미러링 (today·weekly·monthly·yearly·daily·tasks·index·settings·search·time·canvas·contacts·templates·personal·projects·ai-briefing·help·canvas/[id])
- `/myverse/{about,canvas,community,gpr,install,my,offline,onboarding,p,planner-tool,planning,portfolio,programs,purchase}` 14개 비-app 페이지 미러링
- 미들웨어 0a: `/api/planners/*` → `/api/myverse/*` 내부 rewrite (Toss·Google OAuth·Cron 호환)
- 미들웨어 0b: `/planners/*` → `/myverse/*` 308 영구 리디렉트
- `lib/domain-registry.ts`: planners.tenone.biz 프리픽스 `/planners` → `/myverse`
- 충돌 해소: `/myverse/app/daily`(PP 일간 뷰) vs 9-domain 일상 → 9-domain은 `/lifestyle`로 분리

### API + lib 디렉토리 병합
- `app/api/planners/*` 71개 라우트 → `app/api/myverse/*` (충돌 search → `planner-search`)
- `lib/planners/*` 21개 모듈 → `lib/myverse/*`
- 53개 클라이언트 fetch URL 갱신, 모든 `@/lib/planners` → `@/lib/myverse`
- features/planners 67개 파일 `/planners/...` → `/myverse/...`

### 풀 화면 앱 셸 + 인디고 브랜딩
- `/myverse/app/*` 진입 시 마케팅 헤더/푸터 숨김 (`MyVerseChrome` 클라이언트 래퍼)
- `MyverseAppHeader`·4 Pillars `MyverseSidebar` 제거 → AppTopNav만 노출 (PP 시절 풀 화면 셸 패턴)
- `app/(MyVerse)/myverse/app/layout.tsx`: PP 핵심 chrome 흡수 (PlannersThemeProvider · PwaRegister · BetaFeedbackButton · KeyboardShortcuts · AiBriefingFab · MobileBottomNav · WelcomeTracker · AppMonthBar)
- AppTopNav 로고: "Planner's Planner AI" → **Myverse**<sup>App</sup>, teal `#0F766E` → 인디고 `#6366F1`
- PlannersThemeProvider 기본 테마 `teal` → `myverse`(인디고). 모든 하드코딩 teal 클래스가 CSS 오버라이드로 인디고로 매핑
- `UniverseUtilityBar.WORKSPACE_REGISTRY`: 옛 `planners` + 옛 `myverse` 제거 → 통합 `myverse` (`/myverse/app`)
- `public/planners-manifest.json` 리브랜딩 (Myverse · /myverse · #6366F1)

### HandNote (기본 노트) UX 개선
- "그리기" 버튼 제거 — 펜 선택 시 즉시 그리기 모드 진입, 같은 펜 다시 클릭 시 해제
- 이미지 선택·매직 선택(올가미)·지우개 클릭 시 자동 그리기 레이어 활성화
- 시각 상태 3단계: teal 활성 / 회색 활성(펜 선택만) / 비활성

### 다음 할 일
- features/planners → features/myverse/planner 폴더 리네이밍 (78개 컴포넌트 import 갱신 동반)
- PWA 아이콘 인디고 M 로고로 교체 (현재 `planners-icon-192.png` 그대로)
- Toss 가맹점 승인 + Vercel 환경변수 설정
- Notion `TASK` 템플릿 인사이트 흡수: "오늘 한 장 + 3버튼" 메인 홈, "초집중모드" 1급 기능, 분류에 한국형 태그(`감사3개`·`감정 일기`)
- 풀 화면 모드에서 4 Pillars + 9-domain 진입점 결정 (현재 비노출 상태)

---

## 세션 106 핵심 성과 (2026-05-04)

### Phase 1 — 활동 거점 좌표화 + 시간 트래킹 자동 위치 매칭
- **SettingsBases**: Crosshair 버튼으로 현재 위치를 거점에 등록 (navigator.geolocation + Nominatim 역지오코딩으로 주소도 자동 채움). 주소 입력 blur 시 좌표 없으면 자동 정지오코딩. 좌표 등록 시 행 아래 lat/lng 표시
- **TimeTrackerView**: 마운트 시 `/api/planners/settings`에서 activity_bases 로드. 자동 위치 입력 시 Haversine 거리 계산으로 거점 반경 150m 내 매칭 → 거점 이름이 활동 라벨로(예: "사무실"). 매칭 실패 시 기존 Nominatim 폴백
- **InlineForm 거점 칩**: 등록된 거점을 클릭 한 번으로 활동·주소 채움

### Phase 2 — 일간 places ↔ 시간 routines 양방향 미러링
- POST `/places` → `planners_daily_routines`에 dedup 후 자동 INSERT (date+activity+start_time 키). duration_min → end_time 계산
- POST `/routines` → `planners_daily_places`에 dedup 후 자동 INSERT (date+place_name+visited_at 키). end-start → duration_min 계산
- 카테고리 매핑 함수 (`mapToPlacesCategory`/`mapToRoutinesCategory`) — 매칭 안되면 general
- UPDATE/PATCH는 미러링 안 함 (편집은 한쪽만 — 의도된 분리)

### Phase 3 — Instagram / Facebook 백업 ZIP 임포트
- `POST /api/planners/moments/import-meta` — JSZip으로 ZIP 그대로 파싱 (압축 해제 불필요)
- Instagram `posts_1.json` / `stories.json` + Facebook `your_posts_*.json` 자동 인식
- Mojibake(latin1→UTF-8) 한국어 캡션 자동 복원
- 미디어를 `planners-moments` 버킷에 업로드 → `planners_daily_moments` INSERT (촬영 일자·캡션·happened_at)
- dedup: (member_id, date, file_size, happened_at) 기준 — 재임포트 안전
- 200MB / 5분 타임아웃 / 응답에 imported·skipped·total·errors[]
- DailyMoments 헤더에 "백업" 버튼 추가 (Archive 아이콘) + 결과 토스트

### 다음 할 일
- TimeTracker 컨텍스트 스트립 placeName도 거점 매칭 우선 (현재는 Nominatim 결과만)
- DailyMoments 위치 필드 보강 (Meta 백업 EXIF 위치 추출)
- Daily places 추가 UI에 거점 칩 빠른 선택

---

## 세션 105 핵심 성과 (2026-05-03 — 이전)

---

## 세션 105 핵심 성과 (2026-05-03)

### Canvas Engine 신설 (`lib/planners/canvas-engine/`) — Phase 1 골격

HandNote와 CanvasStudio를 통합할 자체 캔버스 엔진의 뼈대 구축. tldraw·Excalidraw 의존성 점진 제거 목표.

**모듈 구성**
- `types.ts` — CanvasDocument · CanvasElement union(stroke/rect/ellipse/diamond/arrow/line/text/image) · ToolMode · PenKind 6종 · Viewport · BackgroundTemplate
- `engine.ts` — CanvasEngine 클래스: CRUD · 선택 · 도구 · 뷰포트 · 이벤트 · undo/redo 위임
- `history.ts` — HistoryStack (최대 50단계, structuredClone 스냅샷)
- `render.ts` — Canvas 2D 라이브 stroke 렌더(RAF용) + makeLiveContext 헬퍼
- `layers/strokes.ts` — perfect-freehand 래퍼 + 6종 펜 프로파일(pen/pencil/fountain/marker/highlighter/brush)
- `layers/background.ts` — blank/dots/grid/lines 템플릿 CSS 스타일
- `interaction/palm-rejection.ts` — 스타일러스 활성 시 손바닥 입력 무시
- `interaction/pan-zoom.ts` — 1손가락 pan + 2손가락 pinch + 마우스 휠 zoom
- `serialize.ts` — JSON 직렬화 + 버전 마이그레이션 골격
- `adapters/handnote.ts` — HandNoteData ↔ CanvasDocument 양방향 어댑터
- `adapters/handnote-storage.ts` — `__HW__` 마커 직렬화 헬퍼 6종 (HandNote에서 추출)

**계획서**: `docs/PP_Canvas_Engine_Plan.md` — 6단계 ~10주 로드맵 (Core → Shapes → Selection → Text → Polish → Migration)

### Canvas Toolbar 고도화 (`features/planners/CanvasToolbar.tsx`)

- **색상**: 인라인 7색 + "+" 버튼으로 팝오버 (24색 4×6 그리드 / 최근 사용 8개 / HEX 입력 / 네이티브 색상 픽커)
- **굵기**: 펜·도형 모드에서 노출, 4 프리셋(가는·기본·굵은·매우굵은) + 0.5–32px 슬라이더
- **이미지 삽입**: Excalidraw image tool 트리거 (캔버스 클릭 시 파일 선택)
- **레이어 순서**: 선택 시 4단계(맨앞/앞/뒤/맨뒤) 노출. updateScene으로 elements 직접 재정렬
- **모바일 반응형**: md 미만에서 도형/텍스트/이미지/레이어/undo/redo 모두 "더보기" 메뉴로 흡수, 인라인은 핵심 7개만
- **선택 시 크기/회전**: Excalidraw 네이티브 핸들이 캔버스 위에 표시 (별도 작업 불필요)

### Canvas Studio (`features/planners/CanvasStudio.tsx`)

- 풀스크린 z-index 50 → 9100 (planner 모바일 nav z-8900 위로)
- 저장 상태: 텍스트 "오전 09:45 저장됨" 제거, 회전 Loader/체크 아이콘만 (시각·텍스트는 hover 툴팁)
- selectedElementIds count 추적 → CanvasToolbar에 prop 전달
- globals.css: Excalidraw 모바일 사이드 UI(라이브러리·자물쇠·손)·협업 아바타 추가 숨김 + Next.js dev portal(N) 숨김

### Planners 신규 기능 3종

- **이력서 섹션** (IdentityView): 학력·경력·자격증·기술·언어·수상 6 블록 + sticky 서브 네비. `planners_identities.resume` JSONB 컬럼 추가
- **활동 거점** (Settings): SettingsBases 컴포넌트 — 사무실·집·학습·운동·카페·기타 6 type, 빠른 추가·기본 거점 별표. `planners_users.activity_bases` JSONB 컬럼 추가
- **노트 페이지 삭제 확인** (DailyView): 코넬 노트 "페이지 삭제" 버튼 즉시 삭제 → ConfirmSheet 추가 ("N 중 i페이지" 표시)

### 다음 할 것

- **Phase 1.9 HandNote 본체 재작성** (다음 세션 메인) — CanvasEngine 기반 전면 교체. 데이터 레이어는 어댑터로 이미 분리됨
- Canvas Engine Phase 2 (도형 layer 추출)
- 배포 블로커 5종 그대로

---

## 세션 104 핵심 성과 (2026-04-30)

### Planners — HandNote & DailyView Cornell 고도화

**HandNote.tsx 주요 변경**

1. **viewBox 스케일 수정** — 스트로크가 저장된 캔버스 폭(`value.width`)을 캐노니컬로 유지, 화면이 좁아져도 오른쪽이 잘리지 않고 비례 축소됨. `getSVGPoint()` 유틸로 화면→SVG 논리 좌표 자동 변환.

2. **이미지 삽입** — 툴바 `ImagePlus` 버튼(파일 선택) + `Ctrl+V` 클립보드 붙이기 두 가지 경로. 삽입 즉시 선택 모드 진입, 캔버스 중앙 배치, 하단 자동 확장.

3. **이미지 선택·이동 모드** — `MousePointer2` 툴바 버튼으로 전환. z-order 역순 hit-test, 드래그 이동, 우상단 ✕ 버튼 또는 `Delete/Backspace`로 삭제.

4. **자리 차지** — 이미지 뒤 흰 `<rect>` 삽입 → 코넬 텍스트·배경 가림. 스트로크는 이미지 위 레이어. 다크모드 대응(`#1e1e2e`).

5. **`HandImage` 타입** 추가, `HandNoteData.images?: HandImage[]` 확장 (기존 데이터 하위 호환).

6. **width 캐노니컬 보존** — undo/redo/erase/onPointerUp 모두 `value?.width || width || 600` 우선 유지.

**DailyView.tsx 주요 변경**

- **Cornell Enter → 자동 커서 이동** — `cornellFocusPendingId` ref + textarea 콜백 ref 패턴, Enter 치면 새 행 삽입 + 해당 note textarea에 즉시 포커스.
- **요약·페이지 컨트롤 배경 통일** — `bg-neutral-50/40` 제거 → 본문과 동일 투명 배경.
- **Cornell SVG pointer-events 개선** — 텍스트 모드: SVG `none` → 클릭이 textarea에 직접 전달(커서 위치·텍스트 선택 정상 동작). 그리기 모드: SVG `all`.

**MonthlyView.tsx** — 기존 소규모 수정 포함.

### 다음 할 것

- HandNote 이미지 크기 조절 핸들 (resize handles — Phase 2)
- 이미지 "자리 차지" → Cornell row 높이 자동 확장 연동 (Phase 2)
- ~~Settings 다크모드 검증~~ ✅ bg-neutral-200/300/400 dark override 적용 완료 (세션 105)
- 배포 블로커 해소: PWA 아이콘 2개 · Toss 가맹점 · Vercel 환경변수 · Google OAuth · Supabase Redirect URL

---

## 세션 103 핵심 성과 (2026-04-30)

### Planners — Settings page.tsx 모듈 분리 완성

`app/(Planners)/planners/app/settings/page.tsx` 1,799줄 → 367줄 슬림 쉘로 리팩토링.

**5개 feature 모듈 생성** (`features/planners/settings/`)
- `SettingsTheme.tsx` — 컬러·모서리·폰트·다크모드 (Group 02)
- `SettingsAi.tsx` — AI 브리핑 시간·톤·컨텍스트·트래킹·국가·프로젝트 링크 (Group 03)
- `SettingsNotifications.tsx` — 이메일/Web Push 알림 (Group 04 알림)
- `SettingsIntegrations.tsx` — Google Calendar·Todoist 연동 (Group 04 연동)
- `SettingsExport.tsx` — 앱 설치·데이터 백업·구독 현황 (Group 05)

**슬림 쉘 패턴**
- shell이 API fetch + initial* 상태 세팅 → loading guard → 자식 컴포넌트 마운트
- 각 모듈이 자체 도메인 state 소유, `save(patch)` 공유 콜백
- TypeScript 에러 0 확인

### 다음 할 것
- Settings 외 페이지 다크모드 검증 (Daily/Weekly/Monthly 카드 색상 전환)
- xl+ 모니터에서 Live Preview 실제 동작 확인 (1280px 이상)
- 배포 블로커 해소: PWA 아이콘 2개 · Toss 가맹점 · Vercel 환경변수 · Google OAuth · Supabase Redirect URL

---

## 세션 102 핵심 성과 (2026-04-29)

### Planners — Settings 페이지 디자인 시스템 4단계 (Stage 1+2+3+4)

Claude Design 핸드오프 (`design_handoff_planners_settings/`) 기반 Settings 페이지 재구축.

**Stage 1+2 — IA 재편 + 모바일 프리셋** (`5b4f7581`)
- 4그룹 IA: **시작 / 스타일 / 기능 / 기술**
- PC: 좌측 200px sticky 사이드바 (IntersectionObserver로 활성 자동 갱신)
- 모바일: 상단 sticky 가로 pill row
- 8개 프리셋 (5개 토큰 한 번 탭 적용): Mono Light · Cream Serif · Editorial · Slate Pro · Black Ink · Campus Mint · Campus Blush · Designer Mono
- 모바일은 프리셋 메인, 개별 컨트롤은 "고급 설정 ▼" 토글
- 컬러 14 → 18색 (Mustard · Orange · Emerald · Olive 추가)

**Stage 3 — 디자인 토큰 시스템** (`d06c7eb5`)
- `.pp-settings` 스코프 토큰 11종 (라이트+다크 양쪽)
- 기존 Tailwind 유틸리티 → 토큰 시멘틱 자동 매핑
- `pp-card` · `pp-eyebrow` alias 유틸

**Stage 4 — Live Preview 패널** (`36285661`)
- xl+(1280px) 우측 sticky 400px 패널
- Daily · Project · AI Briefing 3탭
- 컬러·모서리·폰트·다크모드 즉시 반영 (CSS 변수)

### 신규 파일 (3개)
- `features/planners/SettingsLayout.tsx` — 4그룹 IA + sticky nav + 3컬럼 grid xl+
- `features/planners/SettingsStylePresets.tsx` — 8개 프리셋 갤러리
- `features/planners/SettingsLivePreview.tsx` — Daily/Project/AI 라이브 프리뷰

### 부수 작업 (이번 세션 다른 커밋들)
- `de3aa289` HandNote Canvas+RAF 재작성 — 필기 입력 끊김 해소
- `e2c03b05` 인덱스 PC/태블릿 2열 레이아웃 + AI 브리핑 탭 제거
- `865c9713` AI 브리핑 네비 전체 제거 (FAB만 유지)
- `c6c3a3b9` 상단 탭 템플릿 추가 (아이덴티티 다음)
- `0a7ed6bb` DailyView 우측 컬럼 단일 셀 래핑 (미니달력 위치 정렬)
- 햄버거 메뉴 헤더 PP AI → Planner's Planner^AI (UniverseMobileMenu.brandNode SSOT)
- 하단 메뉴 기본 순서: 인덱스·프로젝트·오늘·PI·검색
- 화면 모드(다크) 작동 — planners-app-shell + bg/border/text 일괄 반전

### 다음 할 것
- xl+ 모니터에서 Live Preview 실제 동작 확인 (요구 폭 1280px 이상)
- Settings 외 페이지 다크모드 검증 (Daily/Weekly/Monthly 카드 색상 전환 확인)
- 모바일 Live Preview FAB + bottom sheet (선택)
- 토큰을 Daily/Weekly/Monthly로 확장 — `.pp-settings` 패턴을 다른 뷰로 (선택)

---

## 세션 101 핵심 성과 (2026-04-29)

### Planners — Role System Phase 4 (전문 뷰)

**TemplatesView — my_role 탭 완성**
- `my_role` 탭 버튼: teal 색상 + `UserCircle2` 아이콘 (isFav/isRec와 동일한 특수 처리 패턴)
- Empty state 3-케이스: (1) 역할 미설정 → 설정 페이지 링크 버튼 (2) 역할 있지만 템플릿 없음 → "준비 중" (3) 기본
- 탭 활성 시 teal 헤더 배너 (역할명 + 설명 + 개수)

**IndexView — 역할 기반 템플릿 추천**
- settings + templates 병렬 fetch → role_tags 필터링 → 상위 5개 번호 목록 표시
- 역할 있을 때: teal 배지 + "내 역할 전체 보기 →" 링크
- 역할 없을 때: 기존 카테고리 링크 (프레임워크/일정/노트) 유지

**WeeklyView — 대학생 시간표**
- role=student 시 주간 회고 위에 `<StudentTimetable />` 렌더
- `features/planners/StudentTimetable.tsx` 신규: 월~금 × 8교시 그리드, 셀 클릭 → 팝오버 편집, 6색 선택, localStorage 저장

**DailyView — 연구원 연구노트**
- role=researcher 시 노트 추가 그리드에 "연구노트" 5번째 버튼 노출
- 클릭 시 6행 코넬 노트 자동 생성: 연구질문·가설·방법·관찰·해석·다음스텝 사전 입력

**SQL 적용**
- `planners-role-system.sql` Supabase 실행 완료 (HTTP 201)
  - `planners_users.user_role TEXT CHECK(...)` 컬럼 추가
  - `planners_templates.role_tags TEXT[]` 컬럼 + 키워드 시드

### 다음 할 것
- `@excalidraw/excalidraw` 패키지 `package.json`에서 제거 (불필요 — tldraw 전환 후)
- 배포 후 기존 캔버스 "데이터 없음" 안내 또는 일괄 삭제 여부 결정

---

## 세션 100 핵심 성과 (2026-04-29)

### Planners — CanvasEditor Excalidraw → tldraw 마이그레이션
- Excalidraw v0.18 상용 라이선스 워터마크 문제 → tldraw v4.5.10 (MIT) 전환
- `CanvasEditor.tsx` 전체 재작성: `<Tldraw onMount>` + `editor.store.listen` + `getSnapshot/loadSnapshot`
- 썸네일: `editor.getSvgString()` + `getSvgAsImage()` → JPEG base64 → DB PATCH
- 기존 Excalidraw DB 데이터는 형식 불일치 → try/catch로 빈 캔버스 폴백

---

## 세션 98 핵심 성과 (2026-04-29)

### Planners — Daily ↔ Project 노트 일관성 통일
- 추가 노트 4종(기본·손글씨·캔버스·템플릿) 동작·구성·디자인 양쪽 통일
- 카드 = 미리보기(max-h-64 페이드), 편집 = 모달 (Daily 패턴)
- 자동 제목(`기본 노트 1`·`손글씨 1` 등) → 이탤릭·연한 회색 + "기본 제목입니다…" 부제 안내
- 모달에서 텍스트로/손글씨로 토글 제거 (생성 시 모드 고정 — Daily와 동일)
- Project 진입 시 "기본 노트 1" 자동 생성, ↑↓ 카드 위치 이동, X 닫기 제거, 삭제 confirm 통일

### Planners — 프로젝트 캔버스 노트 버그
- 프로젝트 [캔버스] 클릭 → 캔버스 페이지로 튕기던 동작 수정 → 노트 카드로 인라인 등록
- 마커: `<!-- planners:canvas={id} -->` (DB 마이그 없이 content 컬럼에 임베드)
- 카드 = 캔버스 진입 링크, 모달 = iframe 임베드

### Planners — 템플릿 모달에 "📈 추천" 탭 추가
- `lib/planners/template-recommendations.ts` → `TOP_RECOMMENDED` SSOT (라이브러리 추천과 동일 키)
- 일간/프로젝트 양쪽 템플릿 추가 모달에 추천 탭 노출

### Planners — AI 브리핑 카드 정리
- 우측 상단 "설정" 버튼 제거 (헤더 단순화)

### 세션 97 잔여 (이전 컨텍스트, 미커밋)
- `lib/planners/calendar-rules.ts` — `isVisible()` 미지 kind guard 추가 (`if (!rule) return false`)
- `monthlyDisplayMode()` optional chaining (`VISIBILITY[kind]?.monthly ?? "none"`)
- 원인: DB에 알 수 없는 `kind` 값이 있을 때 `VISIBILITY[kind].monthly`에서 `TypeError` 발생
- `DailyMiniMonth.tsx` useMemo 크래시 → 앱 전체 화이트스크린 차단

### 미완 업무 선택적 불러오기 모달 (`5aa42856`)
- `app/api/planners/daily/pending-tasks/route.ts` — 신규 API (과거 60일 미완료 태스크 날짜별 그룹)
- `DailyView.tsx` — 일괄 이월 버튼 → **선택 모달** 전환
  · 날짜별 섹션 + 체크박스 + 전체선택/해제
  · "오늘로 가져오기" → 선택 항목만 today tasks에 추가 + 원본 status='carried'
  · 이미 오늘에 있는 텍스트 중복 제외 (API 레벨)

### Weekly 뷰 재설계 (`21f00be7`)
- GPR(Goal/Plan/Result) · Vrief(What/Why/How) 섹션 완전 제거
- 새 레이아웃: 7일을 **세로 목록**으로 배치 (`divide-y` 경계선)
  · 좌측 32%: 날짜 헤더(요일·Today 배지) + 날씨 이모지·기온 + 음력 + 국경일/절기/기념일 칩 + 미팅 항목(클릭 가능) + 업무(완료 취소선)
  · 우측 flex-1: 노트 textarea (`planners_daily.notes` 동기화)
- 용기 최대 폭: `max-w-5xl` → `max-w-6xl`

### Daily·Weekly 버튼/모달 통일 (`0d69bb64`, `0b99127d`)
- 일정 추가 버튼: bordered text → 아이콘 전용 `p-1.5 rounded` 스타일 통일
- Weekly 새 일정 모달에 **업무 탭** 추가 (`onTaskCreated` + `activeProjects` props)
  · `handleTaskCreated()` — `calDefaultDate || today` 날짜 daily record에 저장 + `dayDataMap` 갱신

### 노트 레이블 통일 + 동기화 수정 (`e567b14a`, `cc33b1d4`)
- "기본 노트" → **"노트"** (DailyView makeDefaultCornellNote · add button 레이블)
- Weekly "메모" → **"노트"** (placeholder · 저장 기본 제목)
- Weekly ↔ Daily 노트 양방향 동기화 수정
  · 읽기: `_cornell` JSON 파싱 → `rows[].note` 조인 (이전: raw JSON 문자열 표시)
  · 쓰기: `JSON.stringify({_cornell:true, rows:[{id:"r1",cue:"",note:content}]})` (이전: plain string)

---

## 세션 96 핵심 성과 (2026-04-28)

### 협업자 RLS 권한 강제 (이월 작업 완료)
- `lib/planners/auth.ts` — `getMemberIdAndEmail()` email 반환 추가
- `app/api/planners/projects/[id]/route.ts` — `resolveRole()` 헬퍼 (owner/editor/viewer 3단계)
  · owner: `project.member_id === memberId`
  · editor/viewer: `project.collaborators[]` email 매칭
  · GET: `userRole` 반환 → 클라이언트 조건부 UI
  · PATCH: viewer → 403 / editor → `collaborators·visibility·public_token·member_id` 필드 차단
- `features/planners/ProjectDetailView.tsx` — `userRole` state + 역할 배지 + ShareField/CollaboratorField 오너만 노출
- `features/planners/ProjectsView.tsx` — 포트폴리오 링크 조건부 표시

### 이월 작업 전체 검증 완료
- TemplatesView Step 2b: 754줄 + 7개 grid 파일 분리 확인 (완료 상태)
- 포트폴리오 모드: `/planners/portfolio/[memberId]` 서버 컴포넌트 확인 (완료 상태)
- P3 #18 기업플랜: 유보 (결제 사업 시작 시)

### 배포 전 블로커 (사용자 액션 필요)
- `public/planners-icon-192.png`, `public/planners-icon-512.png` 생성
- Vercel 환경변수: `ANTHROPIC_API_KEY`, `TOSS_SECRET_KEY`, `VAPID_*`, `GOOGLE_CLIENT_ID/SECRET`
- Toss 가맹점 승인
- Google Cloud Console Redirect URI 등록
- Supabase Auth Redirect URL 추가

---

## 세션 94-95 핵심 성과 (2026-04-27)

### 프로젝트 메뉴 고도화 Phase 1-6 (통합 작업 공간 완성)
- **Phase 1 (`955b213d`)** 카테고리 9종 SSOT + 추천 템플릿 매핑 + DB 마이그레이션
  · `lib/planners/project-categories.ts` (학습/비즈니스/창작/헬스/여행/관계/재무/운영/커스텀)
  · `lib/planners/template-recommendations.ts` 카테고리 → 템플릿 키 매핑
  · planners_projects: category·custom_fields·tags·tracking_metrics·visibility · planners_project_milestones 신규
  · ProjectsView 카테고리 칩 + 카드 배지 / Cover 탭에 카테고리·트래킹 메트릭 편집
  · ProjectNotesTab 카테고리 기반 추천 템플릿 violet 박스
- **Phase 2 (`f10600b3`)** Daily Task ↔ project_id 연결
  · PlannerTask.project_id 필드 / Daily 추가 입력에 프로젝트 selector / TaskRow 배지
  · `/api/planners/projects/dashboard` (진행률·D-N·오늘 task)
  · DailyProjectsCard 강화 (카테고리·D-N·진행률 바·오늘 task)
  · `/api/planners/projects/[id]/tasks` + ProjectTasksTab (날짜그룹·필터·통계)
- **Phase 3 (`fbdc54a6`)** 트래킹 자동 시계열
  · `/api/planners/projects/[id]/tracking` (planners_daily 7종 컬럼 자동 매핑)
  · ProjectTrackingTab (SVG 스파크라인·avg/min/max·노트)
- **Phase 4 (`c1edda34`)** 마일스톤 + 간트 + 진행률
  · `/api/planners/projects/[id]/milestones` (CRUD)
  · ProjectMilestonesTab (체크리스트·간트차트·자동 진행률)
- **Phase 5 (`5b69b000`)** 5F 회고 + Identity Key Results 환류
  · planners_projects.retrospective jsonb · ProjectRetrospective 타입
  · ProjectRetroModal — Finding 줄단위 분리해 Identity로 환류
  · status=completed 자동 트리거
- **Phase 6 (`4fb7b863`)** 공개 링크 + 협업자
  · public_token UNIQUE + collaborators jsonb
  · `/api/planners/projects/[id]/share` (POST/DELETE) + `/api/planners/public/projects/[token]`
  · `/planners/p/[token]` 공개 Server Component 페이지 (인증 X)
  · ShareField (URL 복사·새 탭) + CollaboratorField (이메일·역할)

### 세션 94 후속 — UX 일관성 SSOT
- 4-View 헤더 통일 (Daily 패턴: < font-serif 2xl/3xl 제목 [상태 배지] >)
- CalendarEntryEditor 단일 입력 (양력 native + 음력 캘린더 팝오버)
- Weekly 셀 3섹션 (오늘의 일정 · Task · 메모) → planners_daily.tasks·notes 양방향 동기화
- 노트 카드 헤더 통일 + 인덱싱 (기본 노트 N · 손글씨 N)
- AI Briefing 상단 메뉴 제거 + Daily AI 정리 카드 (Haiku 4.5)
- 로고 폰트 serif 통일 (AI 위첨자 sans 유지)
- (Planners)/CLAUDE.md UX 일관성 가이드 SSOT 섹션 추가

### 기념일 확장 + 전체화면 모드
- HOLIDAYS commemoration 타입 + 2026/2027 정부지정 기념일 80여 종
  · 색상: holiday(rose-500) / memorial(rose-400) / commemoration(amber-600) / solar_term(emerald-600)
  · Yearly 우선순위: 사용자 입력 > 국가기념일 > 절기 (배경 X 폰트만)
- PlannersUtilityLinks에 Maximize/Minimize 전체화면 토글 (`document.fullscreenElement`)

### 음력 입력 확장
- LUNAR_YEARS_ANNIVERSARY (1950+) + 범위 외 근사 변환

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
