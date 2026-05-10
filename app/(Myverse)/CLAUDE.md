# Myverse 브랜드 가이드

> **Myverse** — 나를 운영하는 OS · Personal OS
>
> **3원칙 (OS 톤)**
> - **운영한다** — 사진·메모·일정·관계가 자동으로 정리되는 시스템
> - **소유한다** — 내 데이터, 내 OS, 내 결정 (서비스가 사라져도 기록은 남는다)
> - **성장한다** — AI가 패턴을 보여주고, 나는 더 잘 살 수 있도록
>
> **메타포 레이어** — 외부 마케팅: Personal OS / 내부 철학: Personal Black Box (philosophy 페이지에서만 사용)

---

## 정체성

- **한 줄 소개**: 나를 운영하는 OS — 9 영역 자동 정리 + AI 코칭 + 선택 공개 핸들
- **포지셔닝**: Personal OS (외부) / Personal Black Box (내부 철학)
- **톤앤매너**: 미래적·개인화·신뢰. 데이터 주권.
- **주 컬러**: 인디고 `#6366F1`
- **메인 도메인**: `myverse.kr` (개인 공개 페이지: `myverse.kr/@handle`)
- **단일 브랜드 통합**: Planner's Planner의 모든 기능을 흡수하여 Myverse 단일 앱으로 통합 진행 중 (세션 107~)

---

## 5 채집 → 9 영역 → 7 시스템 (SSOT)

### 5 채집 행동
사용자가 무의식적으로 하는 채집:
1. **사진** (Capture)
2. **영상** (Capture)
3. **위치** (GPS·체크인)
4. **음성** (메모·미팅·통화)
5. **글쓰기** (메모·노트·메시지)

### 9 영역 (자동 분류 결과)
| key | 한국어 | 색상 | 분류 단서 |
|---|---|---|---|
| `body` | BODY | `#10B981` | 헬스킷·구글핏·운동 GPS·음식 사진 |
| `work` | 업무 | `#3B82F6` | 캘린더 미팅·근무 시간대·노션 임포트 |
| `study` | 공부 | `#A855F7` | 강의 영상·OCR·반복 학습 위치 |
| `daily` | 일상 | `#F59E0B` | 자유 기록·집·여가 (기본값) |
| `schedule` | 일정 | `#0F766E` | 캘린더 직접 입력 |
| `travel` | 여행 | `#EC4899` | 평소 거점에서 30km+ + 1박 |
| `move` | 이동 | `#6B7280` | GPS 백그라운드 |
| `relation` | 관계 | `#EF4444` | 얼굴 인식·contacts 매칭 |
| `_people` | 사람(횡단축) | `#0EA5E9` | 모든 영역 가로지름 |

**SSOT 파일**: `lib/myverse/domains.ts` — 9 도메인 enum·라벨·색상·분류 룰

### 5축 메타데이터 (모든 capture 테이블 공통 컬럼)
- `time_axis JSONB` — EXIF·캘린더 매칭
- `geo_axis JSONB` — GPS·반복 거점 매칭
- `people_axis UUID[]` — 얼굴 인식·contacts·미팅 참석자
- `content_axis TEXT` — OCR·STT·본문 검색 인덱스
- `context_axis JSONB` — 직전·직후 활동·캘린더·반복 패턴

추가 컬럼: `domain` · `sub_tags[]` · `capture_mode` · `visibility` · `share_count` · `classification_version`

### 7 시스템
1. **채집** (Capture): Quick Capture·Share Sheet·갤러리 자동·GPS·OAuth 임포트
2. **분류 엔진** (Classification): 5축 추출 → 9 영역 + N 태그
3. **통합 저장소** (Blackbox): 로컬 우선·클라우드 백업·영구 보존
4. **시간축** (Timeline): 일/주/월/분기/년/평생 6단계 + "X년 전 오늘"
5. **관계** (Relations): 사람 단위 모든 영역 횡단
6. **AI 코칭** (RAG): 나와의 대화·교차 인사이트·자동 브리핑
7. **공개 시스템** (VERSE): 슬쩍 토글·`@handle`·외부 SNS 공유

---

## 사이드바 — 4 Pillars 멘탈 모델

```
■ 나   (BODY · 일상 · 관계)
■ 일   (업무 · 공부)
■ 시간 (일정 · 이동 · 여행)
■ 나누기 (Verse 통합 타임라인 · @handle 공개 페이지)
```

기존 4-View 시간 줌(Daily/Weekly/Monthly/Yearly)은 어떤 영역에서도 호출 가능한 줌 도구로 유지.

---

## 접근 모델

- **유형**: 오픈 + 구독 (기본 기능 자유, 교차 인사이트·AI 코칭은 유료)
- **무료**: 채집·정리·6단계 시각화
- **유료**: 교차 인사이트 + AI 코칭 + 외부 자동 임포트 1개+
- **가입 경로**: 회원가입 → 자동 캡처 동의(선택) → 첫 공개 시 `@handle` 등록
- **핸들 강제 시점**: 가입 즉시가 아닌 **첫 visibility=public 토글 시점** (자연스러운 흐름)

---

## 사생활 3티어

| 티어 | 기본값 | 적용 |
|---|---|---|
| **기본 ON** | 사용자가 직접 입력·업로드 | 능동 캡처 전부 |
| **기본 OFF·명시 동의** | 백그라운드 자동 수집 | 갤러리·GPS·헬스·메일·OCR·STT·Vision |
| **절대 금지** | — | 마이크 상시 녹음·화면 캡처·키보드 모니터링 |

- 모든 `auto_capture_consent` 토글: `planners_users.auto_capture_consent JSONB`
- 변경 이력: `myverse_consent_log` 테이블 (감사 추적)
- 영역별 독립 토글 (위치만 OFF, 사진만 OFF 가능)
- 데이터 일괄 다운로드/영구 삭제 항상 1탭 거리

---

## 권한 체계

- **role 종류**: member · subscriber · admin
- **context**: `brand:myverse`
- **데이터 주권**: 사용자가 자신의 데이터 100% 소유 + 언제든 삭제 가능

---

## UC 정책 특이사항

- **브랜드 전용 액션** (예정):
  - `connect_service` (월 3회, 무료)
  - `unlock_ai_insights` (월 1회, 5000 UC)
- **brand_id 지정**: `brand_id = 'myverse'`

---

## 핵심 파일

### IA SSOT — 5 Lane (세션 119~120)

> 사용자 멘탈 모델은 **오늘 / 기록 / AI / 연결 / 도구** 5동사로 수렴 → Lane으로 표현.
> PILLARS는 Lane "기록" 안의 9영역 그룹핑으로만 의미를 가짐 (사용자에게 직접 노출 X).

| 파일 | 역할 |
|------|------|
| `lib/myverse/domains.ts` | LANES·LANE_PATHS·laneForPath SSOT (5 Lane: today/record/ai/connect/work) |
| `features/myverse/planner/AppTopNav.tsx` | 1차 네비 (5 Lane + 커뮤니티 외부) — 데스크톱 탭 + 모바일 햄버거 (lane별 서브탭 펼침) |
| `features/myverse/app/LaneSubNav.tsx` | 2차 네비 SSOT — `AI_LANE_TABS`·`CONNECT_LANE_TABS`·`WORK_LANE_TABS` |
| `features/myverse/app/DomainBackLink.tsx` | 9영역 → traces 역방향 CTA — `?domain=` 필터로 복귀 |

**Lane 별 서브탭:**
- AI: 묻기·코치·일기 초안·인사이트·캡슐
- 연결: 피드·DM·Verse·알림
- 도구: 프로젝트·할 일·캔버스·템플릿·연락처·퍼스널

**ask vs coach 구분 카피 (세션 120):**
- ask = "내가 묻는 즉시 답하는 1:1 대화"
- coach = "묻지 않아도 먼저 보내는 일일 브리핑·주간 리포트"

### Phase 0 (완료)
| 파일 | 역할 |
|------|------|
| `lib/myverse/domains.ts` | 9 영역 SSOT (DomainKey·DomainMeta·Pillars·5축 타입) |
| `app/api/myverse/handle/route.ts` | 핸들 등록·검증 API |
| `features/myverse/HandleRegisterModal.tsx` | 핸들 등록 모달 |
| `sql/myverse-phase0-common-columns.sql` | 7개 capture 테이블 공통 컬럼 |
| `sql/myverse-phase0-handles.sql` | members.handle + 예약어 + view |
| `sql/myverse-phase0-classification.sql` | 분류 큐 + 임포트 로그 |
| `sql/myverse-phase0-consent.sql` | auto_capture_consent JSONB + 감사 |
| `sql/myverse-phase0-backfill.sql` | 기존 데이터 도메인 추정 백필 |

### 마케팅 (보존)
| 파일 | 역할 |
|------|------|
| `app/(Myverse)/layout.tsx` | generateMetadata |
| `app/(Myverse)/myverse/page.tsx` | 메인 (랜딩) |
| `app/(Myverse)/myverse/{philosophy,service,technology,roadmap,team}/page.tsx` | 5p 콘텐츠 |
| `features/myverse/MyVerseHeader.tsx` · `MyVerseFooter.tsx` | 공통 헤더·푸터 |

### 앱 (Phase 1~ 진행)
- `app/(Myverse)/myverse/app/layout.tsx` — 앱 셸 (auth gate + sidebar + AppTopNav)
- `app/(Myverse)/myverse/app/onboarding/page.tsx` — 온보딩 (5단계)
- `features/myverse/MyverseSidebar.tsx` — 4Pillars + 9영역 SSOT 사이드바 (**세션114 복원**)
- `features/myverse/app/AppTopNav.tsx` — 상단 네비 (LayoutGrid 드롭다운 SSOT 연결)
- `lib/myverse/domains.ts` — 9영역 SSOT (app_href 포함)
- `lib/myverse-supabase.ts` — 기존 직접 Supabase 호출 (API 라우트로 전환 예정)

---

## 참고 문서

- **마이그레이션 계획서**: `docs/Myverse_Migration_Plan.md` — Phase 0~10 (~12-14주)
- 루트 CLAUDE.md § 1.4 (접근 모델 6종)
- 루트 CLAUDE.md § 1.3.1 (Capability 모델)
- docs/Universe_Coin_Policy.md
- docs/Universe_OS_Plan.md

---

## 현재 상태

| 항목 | 내용 |
|------|------|
| **Phase** | **세션 125 (2026-05-11)** — 무끼 플로팅(MukkiFab) + SNS 포스팅 시스템(moments text 타입 + SnsPostComposer + 미러 저장) + 3 카드 분리(TodayScene/Places/Routines) + 흔적 통합 API(/traces UNION) + 레이아웃 fixed 전환(TopNav/SideNav/MonthBar) + 코넬 UX + Verse 용어 폐기 |
| **세션 124 (2026-05-11)** | IA 재구성(INSIDE/OUTSIDE) + 핸들 URL 정비(`/v` 폐기 → `/[handle]`) + 디지털 명함 SSOT(DigitalCard) + 노트 4종 미리보기 통일(h-48) + 캔버스 저장 버그 수정(unmount flush) + 모달 템플릿 입력 버그 수정(TemplateGridEditor) + 템플릿 그리드 Instagram 비례 + ViewToggle 4 페이지 공통 + PP→CanvasEditor 리네이밍 |
| **세션 123 (2026-05-10)** | 사이트↔앱 통합 + Personal OS 메시지 정렬 + 마케팅 5p 허구성 정비 + LinkedIn 벤치마킹 (노션 친화 5 패턴) |
| **세션 122 (2026-05-09)** | Myverse Stitch 디자인 1차 — 폰트(Hanken Grotesk·Inter·Material Symbols) + LaneHeader SSOT + Today/Coach 재디자인 + Traces 타임라인 마커 |
| **세션 121** | IA QA 6건 수정 — 5-Lane 마감 |
| **이전 Phase** | 세션 119 — IA 재구성 (4-Pillar mess → 5-Lane), LaneSubNav, traces ?domain= 딥링크 |
| **Phase 118** | **세션 118 (2026-05-08)** — 올가미 선택·리사이즈 실시간·PP흔적·보안점검 |
| **이전 Phase** | 세션 117 — Canvas Engine Phase 2 (image, export, 레이어, 텍스트 서식) / 세션 116 — Planners → Myverse 인프라 마이그레이션 Phase 4 |
| **다음 Phase** | (1) `scripts/migrate-moments-bucket.js` 실행 (SUPABASE_SERVICE_ROLE_KEY 필요) · (2) Toss 가맹점 승인 + Vercel 환경변수 |
| **세션 118 결정** | ① 올가미 선택(lasso): ray casting `pointInPolygon()`, SVG polyline 시각화 · ② resize 실시간: SVG DOM translate/scale/translate 직접 적용 · ③ PP 흔적 제거: CommunityView 텍스트, globals.css 죽은 블록, CanvasStudio div 클래스 · ④ 전체화면 노트 뷰: DailyView/ProjectNotesTab z-[9100] + 타입 배지 pill + 취소/저장 버튼 |
| **세션 117 결정** | ① Canvas Engine image 지원: 파일 피커 + Ctrl+V · ② PNG/SVG 내보내기: `lib/canvas-engine/export.ts` · ③ 레이어 정렬 4종(bringToFront/Forward/Backward/Back) + 단축키 · ④ TextElement bold/italic + 플로팅 서식 바 + Ctrl+B/I |
| **세션 116 결정** | ① Planner's 브랜드 유지 확정 — Myverse 코드 내부 흔적만 제거 · ② DB 마커(handwriting/tpl/canvas) 즉시 실행 완료 (PAT만으로 가능) · ③ Storage 실 파일 이전은 service role key 필요 → 스크립트로 이월 · ④ myverse-sw.js v3 — planners-sw(v1/v2) + myverse(v2) 캐시 모두 삭제 |
| **위험 관리** | 모든 ALTER `IF NOT EXISTS` · 백필 별도 트랜잭션 · 기본 visibility=private · `/api/planners/*` 외부 호환 rewrite 유지 · server `redirect()` 금지 (Next.js 16 dev router prefetch 무한 큐 트리거) — 인증 게이트는 `<ClientRedirect>` 사용 |
| **세션 125 결정** | ① 무끼(AI 묻기/일기/코치)는 사이드바에서 빼고 우측 하단 그라디언트 FAB로 통합 — 대화는 저장 X, 의도(일정·연락처 등)만 마이버스 서비스에 자동 반영 · ② "오늘의 한 장면"이 SNS 포스팅 (자유 글/사진/영상). DB `myverse_daily_moments`에 `media_type='text'` + `body` 컬럼 + `media_url` nullable. 피드 공개 토글 + Web Share API · ③ DailyView 3 카드 독립: TodaySceneCard / DailyPlacesCard / DailyRoutinesCard. 한 컴포저에서 입력해도 places·routines 미러 저장 · ④ 흔적 통합: `/api/myverse/traces` (moments + places + routines UNION). UnifiedTrace 정규화 형태 + happened_at 정렬 · ⑤ 레이아웃 전부 fixed: TopNav `fixed top-0 z-40` / SideNav `fixed top-12 left-0 bottom-0 z-30` / MonthBar `fixed top-12 right-0 bottom-0 z-30`. main에 `pt-12 md:ml-52 md:mr-10` 보정 · ⑥ "Verse" 용어 폐기 — "내 페이지" / "피드에 공개하기"로 통일. `/myverse/v/{handle}` 옛 링크는 `/myverse/{handle}`로 · ⑦ 코넬 노트 제목에서 Enter → 첫 단서 자동 포커스 · ⑧ 사이드바 footer `mt-auto` 부동 수정 |
| **세션 124 결정** | ① IA INSIDE(ENGINE/PERSONAL/BLACKBOX/MUKKI) + OUTSIDE(피드/프로필/명함) — 5 Lane 폐기 · ② `/today` → `/daily` 메인 통합. 메뉴 라벨은 "오늘", 라우트는 `/daily`. 시간 줌 4 페이지 ViewToggle 공통 노출 · ③ `/myverse/v/[handle]` 폐기 → `/myverse/[handle]` (`HandleSubNav` [공개 흔적][프로필][명함]) · ④ DigitalCard SSOT (myverse·wio 양쪽). publicUrl 컨벤션: `myverse.kr/{handle}/card` · ⑤ 노트 4종 `h-48 + Maximize2 hover overlay` 통일. 캔버스 미리보기 = 콘텐츠 only(CanvasPreview) · ⑥ 캔버스 저장 unmount flush (PpCanvas/CanvasEditor) · ⑦ 모달 템플릿 입력은 `TemplateGridEditor` 컴포넌트로 격리, useState로 즉시 재렌더 · ⑧ 템플릿 그리드 `aspect-square` 제거, `grid-cols-1 sm:grid-cols-2` Instagram 패턴 · ⑨ PP 잔재: `PpCanvas`→`CanvasEditor`, `PpCanvasToolbar`→`CanvasEditorToolbar` (DB `data.ppcanvas` 키만 호환 유지) |
| **주요 결정 (세션 114)** | ① 9영역 통합 옵션A 선택: `MyverseSidebar` 복원 + `AppTopNav` LayoutGrid 드롭다운 SSOT 연결 · ② `lib/myverse/domains.ts`에 `app_href` 추가 (daily→/lifestyle 특이 케이스 주의) · ③ `getAuthState()` anon 우선 → admin 재시도 구조로 변경 (SERVICE_ROLE_KEY 의존 제거) · ④ 로그인 강제 `/intra` 리다이렉트 제거 (CLAUDE.md 원칙 1.2.1 준수) · ⑤ social login `isAuthPage` endsWith('/login') 추가 → 브랜드 로그인 페이지에서 `?redirect=` 보존 |
| **주요 결정 (세션 111)** | ① 무한 깜빡임 진짜 원인 = stale FK 이름 → REST join 실패 → plannerUser=null 오판 (이전 세션들이 잡지 못한 root cause) · ② 온보딩 URL `/myverse/onboarding` → `/myverse/app/onboarding` 이전 (앱 셸 하위) · ③ middleware x-pathname 헤더 주입으로 layout 경로 식별 · ④ members 조회 auth_id 우선 (email은 중복 row 방어 fallback) · ⑤ SW v2로 옛 PWA 사용자 자가 업그레이드 · ⑥ /planners 매칭은 정확 경로만 (정적 자산 보호) |
| **주요 결정 (세션 112)** | ① `/myverse/login` 전용 페이지 신규 생성 (LoginModal indigo) · ② middleware에 myverse.kr/login → /myverse/login 리라이트 추가 · ③ PlannersHeader·CommunityView loginHref → myverse 직접 URL |
| **주요 결정 (세션 107)** | ① PP → 마이버스 단일화 (옵션 A) · ② 9 영역 SSOT 확립 · ③ DB·API·lib·route 4개 layer 모두 myverse 접두사 통일 · ④ planners.tenone.biz는 마이버스 콘텐츠 직접 서비스 · ⑤ AppTopNav를 마이버스 인디고로 리브랜딩 후 풀 화면 셸로 사용 · ⑥ HandNote 펜 선택 = 즉시 그리기 (토글 제거) · ⑦ /myverse/app/daily는 PP 일간 뷰, 9-domain '일상'은 /lifestyle |

---

## 절대 하지 말 것 (Myverse)

- ❌ 새 capture 테이블에 5축 메타데이터 컬럼·domain·visibility·capture_mode 누락
- ❌ visibility 기본값을 'public'으로 (반드시 'private')
- ❌ 자동 캡처 토글을 기본 ON (반드시 OFF·명시 동의)
- ❌ 핸들을 가입 즉시 강제 (첫 공개 시점)
- ❌ 분류 결과를 사용자 동의 없이 외부 LLM으로 보내기
- ❌ 9 영역 외 임의 도메인 키 추가 (lib/myverse/domains.ts SSOT 통과 필수)
- ❌ `/myverse/app/*` layout·page에서 server `redirect()` 사용 (Next.js 16 dev router prefetch 무한 큐 트리거) — 반드시 `<ClientRedirect to="...">` 사용
- ❌ Supabase REST join hint를 옛 `planners_*_member_id_fkey` 이름으로 작성 (세션 111에서 모두 `myverse_*_member_id_fkey`로 RENAME 완료)
- ❌ members 조회를 email만으로 (중복 row 시 잘못된 row 반환) — 반드시 `auth_id` 우선
- ❌ middleware의 `/planners` redirect를 `startsWith('/planners')`로 (정적 자산 `/planners-sw.js`·`/planners-icon-*.png` 까지 잡힘) — 반드시 `=== '/planners'` 또는 `startsWith('/planners/')`
- ❌ 1차 네비에 새 lane 추가 — 5 Lane SSOT(`LANES`)에 추가하고 `LANE_PATHS`에 prefix 등록할 것
- ❌ 새 페이지가 lane 안에 있을 때 `LaneSubNav` 누락 — 사용자가 lane 안 서브탭 전환 못 함
- ❌ 9영역 페이지에서 `DomainBackLink` 누락 — traces 회유 동선 끊김
- ❌ 도구 lane을 드롭다운으로 만들기 — 서브메뉴 패턴(LaneSubNav)이 SSOT
