# Myverse 브랜드 가이드

> **Myverse** — 나를 운영하는 OS · Personal OS
>
> **3원칙 (OS 톤)**
> - **운영한다** — 사진·메모·일정·관계가 자동으로 정리되는 시스템
> - **소유한다** — 내 데이터, 내 OS, 내 결정 (서비스는 사라져도 나의 기록은 남는다)
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

### 인앱 카메라 + 캡쳐 구도 연구 (세션 135) — OS 파일 피커 탈피
| 파일 | 역할 |
|------|------|
| `lib/myverse/use-camera.ts` | **신규** — `getUserMedia` + Canvas(사진) + MediaRecorder(영상) hook. use-recorder.ts와 동일 state machine(idle→requesting→previewing→recording→stopping). 전·후면 토글 + MIME 자동 선택(webm/vp9→vp8→mp4) + 친화 에러 + 언마운트 안전 정리 |
| `features/myverse/capture/CameraSheet.tsx` | **신규** — 풀스크린 카메라 오버레이(z-9500). 라이브 viewfinder + 셔터/녹화 버튼 + 카메라 뒤집기 + mm:ss 타이머. 전면 카메라 `scaleX(-1)` 거울 미리보기 |
| `features/myverse/capture/CaptureView.tsx` | 인앱 카메라 wiring — `openComposer("photo"|"video")`가 `isCameraSupported` 시 `setCameraSheet(mode)`, 미지원 시 기존 `<input type="file">` fallback. 캡처 결과는 기존 `uploadMedia(file)` 재사용 |

### 캡쳐 Phase 2 + 모바일 하단 네비 + 녹음 (세션 134) — 캡쳐 페이지 완성도 + 모바일 IA 강화
| 파일 | 역할 |
|------|------|
| `lib/myverse/auto-checkin.ts` | **신규** — GPS 자동 체크인 hook. 10분 폴링 + 300m 이동 dedup + 30분 슬롯 dedup + Visibility API 일시정지 + localStorage 영속화. PWA 한계로 foreground only |
| `lib/myverse/use-recorder.ts` | **신규** — MediaRecorder hook. MIME 자동 선택(webm/opus 우선) + getUserMedia 권한 + 거부/미지원/마이크 부재 에러 분기 + 언마운트 안전 정리 |
| `sql/myverse-routines-structured-fields.sql` | **신규** — `myverse_daily_routines` ADD kcal(INT) + heart_rate(INT) + composition(TEXT). 운동·식사 구조화 입력용 (Prod 적용) |
| `sql/myverse-moments-audio.sql` | **신규** — moments media_type CHECK 교체 → `IN ('image','video','text','audio')`. url_required CHECK도 audio 포함 (Prod 적용) |
| `features/myverse/capture/CaptureView.tsx` | **대폭 확장** — (1) 프로젝트 선택 모달(노트/마일스톤 2모드, 자동 제목/본문) · (2) 자동 체크인 토글 + 상태 배지 · (3) 식사/운동 전용 구조화 폼(시작/종료/구성/칼로리, 운동은 강도 1~5 + 심박수) · (4) 녹음 도크 버튼(rose 인디케이터+타이머) · (5) 도크 밑 퀵 메뉴 칩 5개(캔버스·연락처·메일·퍼스널·인사이트) · (6) TraceCard audio 렌더(`<audio controls>`) |
| `features/myverse/app/MobileBottomNav.tsx` | `ALL_NAV_OPTIONS`에 capture/mail 추가. `MOBILE_NAV_DEFAULT` → `["projects","today","capture","feed","card"]`. 5슬롯 모드 가운데 슬롯 강조(Material BottomAppBar FAB — 위로 솟은 원형 + accent fill + 흰 ring) |
| `features/myverse/app/AppSideNav.tsx` | 좌하단 footer 통째 삭제(설정·도움말·앱 설치). `InstallButton` import 제거. ⚠ 진입점 부재 — UtilityBar 아바타 드롭다운으로 이전 예정 |
| `app/api/myverse/routines/route.ts` | POST/PATCH가 kcal/heart_rate/composition 수용 + 정수 정규화 |
| `app/api/myverse/moments/route.ts` | POST validation에 'audio' 허용 (`media_type` + `media_url` 필수 검사 확장) |
| `app/api/myverse/traces/route.ts` | UnifiedTrace.media_type에 'audio' 추가. routine select에 kcal/heart_rate/composition 추가 + category별 nutrition(meal)/exercise(exercise) JSON으로 surface. 보너스: moment select에 nutrition/exercise JSON 컬럼 추가(AI 분석 후 카드 즉시 표시) |
| `app/(Myverse)/myverse/app/settings/tech/page.tsx` | import 경로를 `planner/MobileBottomNav` → `app/MobileBottomNav` 라이브 버전으로 교체 |
| **삭제** | `features/myverse/planner/{DailyMoments,DailyPlacesCard,DailyRoutinesCard,DailyHealthStats,SnsPostComposer,MobileBottomNav}.tsx` — 6개 파일 외부 import 0 확인 후 일괄 삭제 |

### 캡쳐 통합 페이지 + 구독 만료 SSOT (세션 133) — 5 채집을 한 곳에서, 만료 검증 6곳 일관 처리
| 파일 | 역할 |
|------|------|
| `lib/myverse/subscription.ts` | **신규 SSOT** — `isMyverseSubscriberActive()` + `effectiveSubscriptionStatus()` (subscription_status='active' + subscription_expires_at 함께 검증) |
| `app/(Myverse)/myverse/app/layout.tsx` | 만료 검증 헬퍼 호출 + 감지 시 DB best-effort UPDATE (다음 호출부터 정확) |
| `app/api/myverse/chat/route.ts` | `subscription_expires_at` 함께 조회 + 헬퍼 판정 → 만료자도 free 한도 적용 |
| `app/api/myverse/cron/briefings/route.ts` | 시간 필터는 SQL, 만료 검증은 헬퍼 (PostgREST `.or()` 두 번 chain 모호성 회피) → 만료자에게 브리핑 발송 X |
| `features/myverse/planner/PurchaseView.tsx` | "활성 구독" 박스/재결제 버튼 — 만료자에게도 재결제 버튼 노출 |
| `app/(Myverse)/myverse/app/capture/page.tsx` | **신규 라우트** — /myverse/app/capture |
| `features/myverse/capture/CaptureView.tsx` | **신규** — 빠른 도크 6버튼(메모·사진·영상·식사·운동·체크인) + traces API 통합 카드 리스트(moments+places+routines, source별 배지) + AI 액션 칩(분석·Task로·프로젝트로·검색·공유·삭제) |
| `features/myverse/app/AppSideNav.tsx` | "캡쳐" 메뉴 추가 — INSIDE > ENGINE 그룹 "오늘" 위, `bolt` 아이콘 |
| `features/myverse/planner/DailyView.tsx` | TodaySceneCard 정의 + 사용처 + 관련 import 6개 제거 (캡쳐로 이관). 약 70줄 감소 |

**도크 → 테이블 매핑**: 메모/사진/영상 → moments · 식사/운동 → routines(category) · 체크인 → places(GPS 자동) — 자동 미러링 양방향 동작

### Notion Mail 통합 (세션 132) — Gmail 인박스/본문/필터/Daily 임베드/답장·작성·라벨 동기화
| 파일 | 역할 |
|------|------|
| `sql/myverse-email-imports-body.sql` | **신규** — body_text/html, body_fetched_at, is_read, is_starred 컬럼 (Prod 적용) |
| `app/api/myverse/email-imports/[id]/route.ts` | **신규** — GET (본문 on-demand fetch + Gmail full payload 재귀 파싱 + base64url 디코딩 + DB 캐시), PATCH (read/star/triage) |
| `app/(Myverse)/myverse/app/mail/page.tsx` | **신규 라우트** — /myverse/app/mail |
| `features/myverse/mail/MailView.tsx` | **신규** — 3패널(카테고리 사이드바 + 메일 목록 + 본문) + 필터 패널(읽지않음/날짜/발신인) + 답장·새 메일 composer + Daily 임베드 + Gmail 라벨 동기화 |
| `app/api/myverse/integrations/gmail/send/route.ts` | **신규** — RFC 822 + base64url + In-Reply-To/References + threadId + RFC 2047 한글 인코딩 |
| `app/api/myverse/integrations/gmail/modify/route.ts` | **신규** — archive/mark_read/mark_unread/star/unstar → INBOX/UNREAD/STARRED 라벨 add/remove |
| `lib/myverse/google-calendar.ts` | OAuth SCOPES에 `gmail.send` + `gmail.modify` 추가 (기존 사용자 재연결 필요) |
| `features/myverse/app/AppSideNav.tsx` | "메일" 메뉴 추가 (Mail 아이콘) |
| `features/myverse/planner/settings/SettingsIntegrations.tsx` | "Connected emails" / "Connected calendars" 그룹 분리 + Gmail row (Google OAuth 공유) |
| `features/myverse/planner/DailyView.tsx` | NoteItem 'email' 타입 + email_id + email_meta. type==='email' 카드 렌더(rose 그라디언트, sender 아바타, snippet 4줄, Gmail 원본 링크) |

### Hotfix (세션 132)
| 파일 | 변경 |
|------|------|
| `app/(Myverse)/myverse/page.tsx` | `/Myverse/app/daily` (대문자 M) 하드코딩 → `/myverse/app/daily` 정정 (Next.js URL case-sensitive 404 fix) |
| `app/(Myverse)/myverse/story/page.tsx` | `href="/Myverse"` → `/myverse` |
| `app/(Myverse)/myverse/app/layout.tsx` | 인라인 스크립트에 `myverse-sidebar-collapsed` 클래스 부착 추가 (FOUC 방지) |
| `features/myverse/app/SidebarCollapseContext.tsx` | useState 초기값을 함수로 (HTML 클래스 검사) + toggle 시 localStorage + HTML 클래스 동시 동기화 |

### 마인드맵 export·노드→Task·OKR 시각화·회사 필터·노트 적용 (세션 131)
| 파일 | 역할 |
|------|------|
| `features/myverse/planner/MindmapEditor.tsx` | **PNG/SVG export** (`exportMindmap` + 툴바 PNG/SVG 버튼). `data-mindmap-ui` 속성 가진 UI 요소(툴바·도움말·color picker·모달) 캡처 제외. 선택 노드 우상단에 **+Task** 버튼 (`onPromoteText` prop) |
| `features/myverse/planner/CanvasStudio.tsx` | `handlePromoteText`를 MindmapEditor에도 전달 (CanvasEditor와 동일 콜백) |
| `features/myverse/planner/TemplatesView.tsx` | **마인드맵으로** 버튼 (본문 → `parseTextToMindmap` → POST canvases + `data.mindmap` 시드 → router.push). **applyMode** 라디오 추가 — 마일스톤(기존)/프로젝트 노트 이중 모드. 노트 모드는 본문 통째로 `/projects/{id}/notes` POST |
| `features/myverse/planner/ContactsView.tsx` | `useSearchParams`로 `?company=ID` 필터. Contact 타입에 `company_id` 추가. 헤더에 활성 필터 칩(회사명 + X) |
| `features/myverse/planner/CompaniesView.tsx` | 회사 행에 ExternalLink 버튼 (contact_count > 0 시) → `/contacts?company={id}` 이동 |

### 마인드맵 import·회사 관리·간트 의존성 위반·프레임워크 4종 (세션 130)
| 파일 | 역할 |
|------|------|
| `features/myverse/planner/MindmapEditor.tsx` | **텍스트 import** (`parseTextToMindmap`/`buildTreeFromItems` — 마크다운/들여쓰기 자동 감지) + **Apply 모달** (1단계 자식 → 마일스톤, 손자 → description 평탄화). 툴바: FileInput / Target 버튼 |
| `features/myverse/planner/CompaniesView.tsx` | **신규** — 회사 엔티티 CRUD + 검색 + 펼침으로 소속 인원 미리보기 + 컬러/로고 편집 + 삭제 확인 |
| `app/(Myverse)/myverse/app/contacts/companies/page.tsx` | **신규 라우트** — `/myverse/app/contacts/companies` |
| `features/myverse/planner/ContactsView.tsx` | 헤더에 "회사 (N)" 링크 배지 추가 |
| `features/myverse/planner/ProjectTasksTab.tsx` | **간트 의존성 위반 감지** (dashed rose marker + ⚠ AlertTriangle + 상단 배너 + 자동 일정 조정 5-pass 위상정렬). **PNG/SVG export** (`chartRef` + html-to-image의 toPng/toSvg) |
| `sql/myverse-templates-frameworks-v2.sql` | **신규** — RACI / Pre-mortem / OKR Roll-up / SAFe PI Planning 4종 시드 (Prod 적용) |

### 간트 의존성·마인드맵·템플릿 변수·Company Stage 2·DigitalCard 캡처 (세션 129)
| 파일 | 역할 |
|------|------|
| `features/myverse/planner/ProjectTasksTab.tsx` | **간트 의존성 화살표** (SVG 직각 경로 + arrow marker), **좌측 시작일 핸들** (`resize-left` 모드, 끝점 고정), **마일스톤 ◆ 드래그**(due_date PATCH), **ProjectKanbanView DnD**, 편집 팝오버에 의존성 picker (chip + Unlink + select) |
| `features/myverse/planner/MindmapEditor.tsx` | **신규** — SVG 방사형 마인드맵. 자동 레이아웃(360° → ±75° sector) + 노드 수동 드래그(position) + 8색 컬러 picker + 위치 리셋 + 키보드(Tab/Enter/Space/F2/Del) + 휠 줌 + 1.5초 디바운스 자동 저장 |
| `features/myverse/planner/CanvasStudio.tsx` | `canvas.data.mindmap` 감지 → MindmapEditor 분기. `data.ppcanvas`와 양립. `handleMindmapSave` 신규 |
| `features/myverse/planner/CanvasListView.tsx` | **새 마인드맵** 버튼 추가, 카드 좌상단 인디고 배지, 빈 썸네일 GitBranch 아이콘. `kind: "canvas"|"mindmap"` 응답 활용 |
| `app/api/myverse/canvases/route.ts` | GET 응답에 `kind` 필드 추가(data는 응답에서 제외), POST에 `body.data` 인자 받게 확장 |
| `features/myverse/planner/TemplatesView.tsx` | **변수 치환** — body_md → `expandVariables` 렌더. 모달 상단 인디고 안내. **마일스톤 자동 변환** 모달 — `extractMilestones` → 프로젝트 선택 → `myverse_project_milestones` 일괄 INSERT. settings에서 user name fetch |
| `lib/myverse/templates.ts` | `buildDefaultVarContext`/`expandVariables`/`extractVariables`/`extractMilestones` 4개 신규 함수. `{{var\|fallback}}` 패턴 파서 |
| `sql/myverse-templates-variables.sql` | **신규** — daily_log/weekly_review/project_kickoff 본문에 `{{today}}/{{weekday}}/{{user}}/{{year}}/{{week}}` 주입 + `quarterly_kickoff` 신규 시드 (Prod 적용) |
| `sql/myverse-companies.sql` | **신규** — `myverse_companies` 테이블 + `contacts.company_id` FK + 기존 `company_name` 자동 백필 (Prod 적용) |
| `app/api/myverse/companies/route.ts` | **신규** — Company CRUD + find-or-create + 회사별 contact 카운트 |
| `app/api/myverse/contacts/route.ts` | 단일 insert에 `person_type/company_name/company_id/role/tags/avatar_url` 받게 확장 |
| `features/myverse/planner/ContactsView.tsx` | `<datalist id="myverse-companies-datalist">` 회사 autocomplete (메인 폼 + bulk edit). save 시 새 회사면 `/api/myverse/companies` find-or-create → company_id 자동 연결 |
| `components/DigitalCard.tsx` | PNG 캡처 강화 — 외부 이미지(아바타·로고·QR) `fetch→blob→dataURL`로 prefetch 후 toPng. CORS로 누락되던 brand 자산 캡처 성공 |
| `lib/myverse/types.ts` | `PlannerTask.depends_on?: string[]` 신규 필드 |

### 프로젝트·간트·칸반·미완 트리 (세션 128)
| 파일 | 역할 |
|------|------|
| `features/myverse/planner/DailyKanban.tsx` | **신규** — 칸반(계획/진행/완료) + 미팅 시간 헤더 그룹핑 + 메인/서브 카드 + 드래그&드롭 status 변경 + 프로젝트 태그 |
| `features/myverse/planner/DailyView.tsx` | 리스트/칸반 토글, SubtaskRow 컴포넌트(리스트 위계), 공휴일/절기 제외, 경중완급 UI 제거 |
| `features/myverse/planner/DailyTaskRow.tsx` | PRIORITY_META/QUADRANT_CYCLE/PriorityBadge/PriorityPicker 삭제 |
| `features/myverse/planner/CalendarEntryEditor.tsx` | 2×2 사분면 피커 제거 |
| `features/myverse/planner/ProjectsView.tsx` | 새 프로젝트 → **팝업 모달**, 일정/목표/마일스톤 입력 → milestones API로 등록, 종료일 → calendar 자동 등록 |
| `features/myverse/planner/ProjectTasksTab.tsx` | **리스트/칸반/간트 toggle**, ms_ 마커 필터, ProjectKanbanView, ProjectGanttView(드래그/리사이즈/팝오버/오늘선/마일스톤◆/자율헤더) |
| `app/(Myverse)/myverse/app/projects/[id]/page.tsx` | **신규 라우트** — 이전 404 해결 |
| `features/myverse/planner/CanvasEditor.tsx` | `onPromoteText` prop — 텍스트 도구바에 ＋태스크 |
| `features/myverse/planner/CanvasStudio.tsx` | `handlePromoteText()` 연결 |
| `features/myverse/planner/TemplatesView.tsx` | 모달에 "태스크로 승격" 버튼 |
| `features/myverse/app/AppSideNav.tsx` | 접기 토글 → 우측 상단 absolute (공간 0) |
| `app/api/myverse/daily/[date]/task/[taskId]/route.ts` | **신규** PATCH/DELETE — 단일 task 패치, 날짜 이동 시 daily 행 간 자동 이관 |
| `app/api/myverse/daily/pending-tasks/route.ts` | 미완 메인 + 서브(완료/취소 포함) 동반 반환 |
| `lib/myverse/types.ts` (PlannerTask) | `duration_days` 추가, status에 `doing` 추가 |
| `app/layout.tsx` | `<html>`에 `suppressHydrationWarning` (다크모드 flash 방지 스크립트와 충돌 fix) |
| 폐기: `features/myverse/planner/TimeBlockTimeline.tsx` | 삭제. API/DB는 미사용 잔존 |

### Personal OS 통합 (세션 127) — Note→Task 승격 / 캘린더 양방향 / 브랜드 자산 SSOT / TimeBlock / Person 정규화
| 파일 | 역할 |
|------|------|
| `lib/myverse/google-calendar-push.ts` | `myverse_calendar_entries` → Google Calendar 양방향 헬퍼 (push/update/delete) |
| `app/api/myverse/calendar/route.ts` | POST 시 Google에 자동 푸시 (meeting/anniversary) |
| `app/api/myverse/calendar/[id]/route.ts` | PATCH/DELETE 시 Google에도 반영 |
| `app/api/myverse/email-imports/route.ts` | Triage `task` → `myverse_daily.tasks` INSERT, Triage `event` → `myverse_calendar_entries` INSERT |
| `components/DigitalCard.tsx` | `brandAssets` prop — 로고/태그라인/팔레트/링크 자동 노출 |
| `app/(Myverse)/myverse/app/card/page.tsx` | `show_on_card=true` 자산 fetch → DigitalCard에 전달 |
| `app/(Myverse)/myverse/[handle]/page.tsx` | `show_on_portfolio=true + visibility=public` 자산을 hero에 렌더 (태그라인·로고·팔레트·미션·외부링크) |
| `lib/myverse/handle/public-page.ts` | `getPublicPageData` 가 `brand_assets` 도 반환 |
| `sql/myverse-brand-assets-bucket.sql` | `brand-assets` Storage 버킷 (public, 5MB, RLS = 본인 폴더만) |
| `features/myverse/personal/BrandAssetsView.tsx` | 파일 업로드 UI 추가 (`storage.from('brand-assets').upload()`) |
| `app/api/myverse/tasks/route.ts` | **POST 추가** — Note/Email/Inbox에서 Task 승격 + source 메타 |
| `features/myverse/planner/DailyView.tsx` (CornellRowsInline) | 행마다 "Task로 보내기" 버튼 (playlist_add_check 아이콘) |
| `lib/myverse/types.ts` (PlannerTask) | **확장** — `type/amount/currency/assignee_person_id/source*` 필드 |
| `sql/myverse-calendar-google-link.sql` | `google_event_id`/`google_synced_at` 컬럼 |
| `sql/myverse-contacts-person-normalize.sql` | `person_type(self/internal/external)` + `company_name/role/tags/avatar_url` |
| `sql/myverse-timeblocks.sql` | `myverse_timeblocks` 신설 — Task ↔ 시간 슬롯 (Today 타임라인) |
| `app/api/myverse/timeblocks/route.ts` | TimeBlock CRUD |
| `sql/myverse-templates-personal-os.sql` | Daily/Weekly Review/Project Kickoff 템플릿 시드 |
| `app/api/myverse/integrations/gmail/sync/route.ts` | Claude Haiku LLM 분류 (confidence<0.6 시 키워드 fallback) |

### 사이드바 접힘 + 브랜드 자산 + 메일/캘린더 (세션 126)
| 파일 | 역할 |
|------|------|
| `features/myverse/app/SidebarCollapseContext.tsx` | 사이드바 접힘 상태 SSOT (localStorage 영속화) |
| `features/myverse/app/MainContent.tsx` | 메인 컨텐츠 좌측 여백 동적 (`md:ml-52` ↔ `md:ml-14`) |
| `features/myverse/app/AppSideNav.tsx` | 접힘 시 아이콘만 + hover tooltip + 토글 버튼 |
| `features/myverse/personal/BrandAssetsView.tsx` | 브랜드 자산 SSOT — logo/palette/typography/tagline/mission/image/link/template |
| `app/api/myverse/brand-assets/route.ts` | CRUD API — `myverse_brand_assets` |
| `sql/myverse-brand-assets.sql` | DDL + RLS + 트리거 |
| `sql/myverse-email-imports.sql` | Gmail 임포트 캐시 (메타·snippet만) + Triage state |
| `app/api/myverse/integrations/google/calendar/event/route.ts` | 캘린더 이벤트 POST/PATCH/DELETE (2-way sync write) |
| `app/api/myverse/integrations/gmail/sync/route.ts` | Gmail 최근 7일 메타 임포트 + 키워드 분류 (receipt/invite/newsletter) |
| `app/api/myverse/email-imports/route.ts` | 임포트된 메일 조회 + Triage (inbox→task/event/archive) |
| `features/myverse/app/GoogleCalendarIntegration.tsx` | 캘린더 연결 UI |
| `features/myverse/app/GmailIntegration.tsx` | 메일 연결 UI + Triage |
| `lib/myverse/google-calendar.ts` | SCOPES에 `gmail.readonly` 추가 — **기존 사용자는 재연결 필요** |
| 사이드바 PERSONAL | 비전하우스 / 이력서 / 브랜드 / 포트폴리오 |
| 설정 > 외부 연결 | Google 캘린더 · Gmail · Google Photos · Apple Health |

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
| **Phase** | **세션 135 (2026-05-14)** — 인앱 카메라(`getUserMedia` + Canvas + MediaRecorder) — `<input type="file">` OS picker 탈피. `use-camera.ts` hook + `CameraSheet.tsx` 풀스크린 오버레이. 전·후면 토글·MIME 자동·미지원 환경 fallback 유지. + 캡쳐 구도 연구(5층 파이프라인 진단 + PWA 한계 솔직 정리 + 캡쳐·흔적·타임캡슐 시간축 관계 정리 + 타임캡슐 제안 스키마) |
| **세션 134 (2026-05-13)** | 캡쳐 Phase 2 일괄 처리(프로젝트 선택 모달 · GPS 자동 체크인 hook(foreground only) · 운동·식사 전용 폼(DB kcal/heart_rate/composition) · DailyView dead code 5파일 삭제 · 좌하단 footer 삭제) + 모바일 하단 네비(`MOBILE_NAV_DEFAULT` → projects/today/**capture**/feed/card, 가운데 슬롯 강조 FAB) + 캡쳐 녹음(audio media_type 신설) + 도크 밑 퀵 메뉴 5개 |
| **세션 133 (2026-05-13)** | 이월 정리(Storage `planners-moments`→`myverse-moments` 4객체 이전, 구독 만료 SSOT 6곳 일관 처리) + 캡쳐 페이지 신규(`/myverse/app/capture` — 빠른 도크 6버튼 + traces 통합 카드 + AI 액션 칩) + DailyView 3카드 제거(캡쳐로 이관) |
| **세션 132 (2026-05-12)** | Notion Mail 통합 1~4단계: Gmail 인박스(3패널: 카테고리+목록+본문) + 본문 on-demand fetch+캐시 + 필터(읽지않음/날짜/발신인) + Daily 임베드(NoteItem 'email') + 답장/작성 composer(RFC 822+base64url) + Gmail 라벨 동기화(archive/read/star) + OAuth scope 확장(send+modify). Hotfix: 대문자 /Myverse 404 + 사이드바 접힘 FOUC |
| **세션 131 (2026-05-12)** | 마인드맵 PNG/SVG export + 선택 노드 → +Task 버튼 + 템플릿 본문 → 마인드맵 시각화(parseTextToMindmap 재사용) + 회사 클릭 → ContactsView 필터(`?company=ID` + 활성 칩) + 템플릿 적용 모달에 "마일스톤/프로젝트 노트" 이중 모드 (Pre-mortem·RACI·SAFe 본문 보존) |
| **세션 130 (2026-05-12)** | 마인드맵 텍스트 import(마크다운/들여쓰기 자동 감지) + 회사 관리 페이지(`/contacts/companies` CRUD + 인원 펼침) + 간트 의존성 위반 감지(dashed rose + ⚠ + 5-pass 자동 일정 조정) + 마인드맵→프로젝트(1단계 자식→마일스톤) + 간트 PNG/SVG export + 신규 프레임워크 4종(RACI·Pre-mortem·OKR Roll-up·SAFe PI Planning) |
| **세션 129 (2026-05-12)** | 간트 의존성 화살표(SVG 직각 경로)·좌측 시작일 핸들·마일스톤 ◆ 드래그·ProjectKanban DnD + 마인드맵 신규(SVG 방사형 + 노드 드래그 + 컬러 picker + 1.5s 자동 저장) + 템플릿 변수 치환·마일스톤 자동 변환 + Company Stage 2 + DigitalCard PNG 캡처 외부이미지 dataURL prefetch + 시드 템플릿 변수 주입 |
| **세션 128 (2026-05-13)** | 일정&업무 칸반/리스트 토글 + 메인/서브 위계 트리 + 경중완급 폐기 + 프로젝트 모달화·간트 4단계 고도화(드래그/리사이즈/팝오버/자율헤더+오늘선+마일스톤◆) + 미완 호출 시 메인+서브 동반 + 사이드바 토글 우측 상단 absolute + Hydration suppressHydrationWarning + TimeBlock UI 폐기 |
| **세션 127 (2026-05-11)** | Personal OS 통합 — 사이드바 접힘 + 브랜드 자산 SSOT + 메일/캘린더 양방향 + 무끼 LLM 확장 + 마케팅 페이지 통합(story+philosophy+about) + DailyView 3,158줄 분할 |
| **세션 124 (2026-05-11)** | IA 재구성(INSIDE/OUTSIDE) + 핸들 URL 정비(`/v` 폐기 → `/[handle]`) + 디지털 명함 SSOT(DigitalCard) + 노트 4종 미리보기 통일(h-48) + 캔버스 저장 버그 수정(unmount flush) + 모달 템플릿 입력 버그 수정(TemplateGridEditor) + 템플릿 그리드 Instagram 비례 + ViewToggle 4 페이지 공통 + PP→CanvasEditor 리네이밍 |
| **세션 123 (2026-05-10)** | 사이트↔앱 통합 + Personal OS 메시지 정렬 + 마케팅 5p 허구성 정비 + LinkedIn 벤치마킹 (노션 친화 5 패턴) |
| **세션 122 (2026-05-09)** | Myverse Stitch 디자인 1차 — 폰트(Hanken Grotesk·Inter·Material Symbols) + LaneHeader SSOT + Today/Coach 재디자인 + Traces 타임라인 마커 |
| **세션 121** | IA QA 6건 수정 — 5-Lane 마감 |
| **이전 Phase** | 세션 119 — IA 재구성 (4-Pillar mess → 5-Lane), LaneSubNav, traces ?domain= 딥링크 |
| **Phase 118** | **세션 118 (2026-05-08)** — 올가미 선택·리사이즈 실시간·PP흔적·보안점검 |
| **이전 Phase** | 세션 117 — Canvas Engine Phase 2 (image, export, 레이어, 텍스트 서식) / 세션 116 — Planners → Myverse 인프라 마이그레이션 Phase 4 |
| **다음 Phase** | 캡쳐 Phase 3 (100% 가능한 것부터): (1) EXIF 자동 파싱(`exifr`, 비용 0) · (2) X년 전 오늘 카드(SQL EXTRACT, 비용 0) · (3) AI 회상 칩(Claude Haiku, 구독 게이트) · (4) 9영역 LLM 자동 분류(Claude Haiku, 구독 게이트) · (5) PWA shortcuts 4개 + share_target(Android Chrome) / Phase 4 타임캡슐 MVP: `myverse_capsules` 테이블(trace_refs JSONB + unlock_at + locked) + CRUD API + 캡슐 페이지 UI + unlock 푸시·캡쳐 배너 / 별도 결정 필요: Whisper STT(OpenAI/Deepgram API key 결제), 네이티브 앱(Apple Health·iOS 위젯·백그라운드 GPS 진짜 하려면 React Native or Swift) / 이월: Toss 가맹점 승인 + Vercel · Supabase Dashboard `planners-moments` 수동 삭제 · Gmail 재연결 공지 |
| **세션 118 결정** | ① 올가미 선택(lasso): ray casting `pointInPolygon()`, SVG polyline 시각화 · ② resize 실시간: SVG DOM translate/scale/translate 직접 적용 · ③ PP 흔적 제거: CommunityView 텍스트, globals.css 죽은 블록, CanvasStudio div 클래스 · ④ 전체화면 노트 뷰: DailyView/ProjectNotesTab z-[9100] + 타입 배지 pill + 취소/저장 버튼 |
| **세션 117 결정** | ① Canvas Engine image 지원: 파일 피커 + Ctrl+V · ② PNG/SVG 내보내기: `lib/canvas-engine/export.ts` · ③ 레이어 정렬 4종(bringToFront/Forward/Backward/Back) + 단축키 · ④ TextElement bold/italic + 플로팅 서식 바 + Ctrl+B/I |
| **세션 116 결정** | ① Planner's 브랜드 유지 확정 — Myverse 코드 내부 흔적만 제거 · ② DB 마커(handwriting/tpl/canvas) 즉시 실행 완료 (PAT만으로 가능) · ③ Storage 실 파일 이전은 service role key 필요 → 스크립트로 이월 · ④ myverse-sw.js v3 — planners-sw(v1/v2) + myverse(v2) 캐시 모두 삭제 |
| **위험 관리** | 모든 ALTER `IF NOT EXISTS` · 백필 별도 트랜잭션 · 기본 visibility=private · `/api/planners/*` 외부 호환 rewrite 유지 · server `redirect()` 금지 (Next.js 16 dev router prefetch 무한 큐 트리거) — 인증 게이트는 `<ClientRedirect>` 사용 |
| **세션 135 결정** | ① 사진/영상 캡쳐 = `<input type="file">` OS picker가 아닌 **앱 안 카메라 viewfinder** — `getUserMedia` + Canvas(사진) + MediaRecorder(영상)로 자체 구현. 사용자 결정: "마이버스는 스마트폰의 카메라 기능을 이용하여 사용할 수 있어야 한다" · ② `use-camera.ts`는 `use-recorder.ts`와 동일 state machine 패턴 — idle/requesting/previewing/recording/stopping. 일관성 유지 + 두 hook이 같은 mental model · ③ 캡처 결과는 기존 `uploadMedia(file)`로 흘러감 — moments 테이블·AI 분석·traces 파이프라인 변경 0. 인터페이스 안정 · ④ 미지원 환경(데스크톱 일부·구형 브라우저) fallback은 기존 hidden `<input type="file">` 보존. `isCameraSupported = navigator.mediaDevices?.getUserMedia` 체크로 분기 · ⑤ 전면 카메라는 `transform: scaleX(-1)`로 거울 미리보기. 저장본은 미러링 X (실제 좌우 보존) · ⑥ MIME 자동 선택(webm/vp9 → vp8 → mp4) — iOS Safari 호환 확보. iOS는 webm 못 받아도 mp4로 fallback · ⑦ `cancel()`이 `getTracks().forEach(t => t.stop())` 호출 → 카메라 indicator light 즉시 꺼짐. 사생활 시그널 명확 · ⑧ **PWA 한계 솔직 정리**: Apple Health·iOS 홈 위젯·iOS Shortcuts·상시 음성 명령·백그라운드 GPS(iOS)·상시 녹음 = 네이티브 앱(React Native or Swift) 필요. 별도 결정 사안 · ⑨ **Whisper STT는 별도 API key 결제** — Anthropic API에 STT 없음. OpenAI Whisper or Deepgram 결제 의사결정 전 보류 · ⑩ **캡쳐·흔적·타임캡슐 시간축 관계**: 캡쳐(t=지금 입구) · 흔적(t<지금 자동 누적 궤적) · 타임캡슐(t>지금 미래 봉인 큐레이션). 데이터는 moments/places/routines 3테이블 SSOT — 캡쳐 INSERT, 흔적 SELECT, 캡슐 trace_refs JSONB 참조 + unlock_at 잠금 메타 한 층 · ⑪ 캡쳐 페이지는 입구+오늘만 유지 — 흔적·캡슐 끌어들이지 않음. 예외 2개: AI 회상 카드(상단 1~3장), unlock된 캡슐 배너(1줄) · ⑫ 타임캡슐 우선순위: AI 회상 카드 → X년 전 오늘 → 타임캡슐 MVP → unlock 푸시·배너 |
| **세션 134 결정** | ① 프로젝트 선택 모달은 노트/마일스톤 2모드 — 캡쳐의 짧은 텍스트도 의미 손실 없이 보존(노트). 일정 추적 필요 시 마일스톤 · ② GPS 자동 체크인은 foreground only — PWA 한계로 진짜 백그라운드 불가, UI에 "(앱 열려있을 때만)" 명시. 10분 폴링 + 300m 이동 dedup + 30분 슬롯 dedup + Visibility 일시정지 · ③ routines 구조화 필드는 plain 컬럼(kcal/heart_rate/composition) — JSON 묶지 않음. 차후 통계 쿼리 용이 · ④ traces가 routine을 nutrition/exercise JSON으로 surface — UnifiedTrace 인터페이스 안 깨고 카드 렌더 통일. moment AI 분석(nutrition/exercise JSONB)과도 형태 호환 · ⑤ 좌하단 footer 통째 삭제(사용자 결정) — 차기 세션에서 UtilityBar 아바타 드롭다운으로 이전 · ⑥ 모바일 하단 네비 가운데 슬롯 강조는 Material BottomAppBar FAB 패턴(위로 솟은 원형). `navItems.length === 5 && idx === 2`일 때만 적용 — 사용자가 4개로 줄이면 균등 렌더 · ⑦ 녹음 audio는 moments 테이블 media_type 확장으로 통합 — 별도 audio 테이블 만들지 않음. UnifiedTrace 일관성 · ⑧ MobileBottomNav SSOT는 `features/myverse/app/MobileBottomNav.tsx` — planner 버전은 옛 잔재로 삭제. settings/tech 경로도 일관 정리 · ⑨ 퀵 메뉴 5개(캔버스·연락처·메일·퍼스널·인사이트)는 좁은 모바일 진입 보강 — 사이드바 footer 삭제 후 후속책 |
| **세션 133 결정** | ① 구독 만료 검증은 SSOT 헬퍼 1개로 통일 — 6곳 인라인 분기 대신 `lib/myverse/subscription.ts`. `subscription_status='active'` + `subscription_expires_at > now`를 함께 본다 · ② layout.tsx에서 만료 감지 시 DB best-effort UPDATE — Promise.then 비동기 fire-and-forget으로 응답 지연 없이 다음 호출에서 정확 · ③ cron API는 PostgREST `.or()` 두 번 chain의 모호성 회피 — 시간 필터만 SQL, 만료 검증은 코드측 filter. ④ 캡쳐 페이지 데이터 소스는 traces API(moments+places+routines UNION) — 한 페이지에서 통합 표시. 자동 미러링은 기존 places/routines API 그대로. ⑤ 캡쳐 도크 매핑: 메모/사진/영상→moments · 식사/운동→routines(category='meal'/'exercise') · 체크인→places(GPS 자동). ⑥ AI 액션 분기 — 도메인 + sub_tags/caption/body/activity blob에서 FOOD/EXERCISE/CELEBRATION hints 매칭. 첫 매치만 primary 액션. ⑦ DailyView 3카드 제거(캡쳐로 이관). 컴포넌트 파일 자체는 보존 — 다른 페이지 import 가능성 때문에 다음 세션 dead code 정리. ⑧ 캡쳐 사이드바 아이콘은 `bolt`(번개) — Quick Capture의 즉시성. `photo_camera`(카메라)는 사진만 의미해 좁음 |
| **세션 132 결정** | ① Notion Mail UX = 3패널(카테고리·목록·본문). 메일은 별도 페이지(`/myverse/app/mail`)로 — Daily에서 호출 X · ② 본문은 on-demand fetch + DB 캐시. snippet만 caching하면 메일 미리보기에서 끝, 본문은 클릭한 메일만 fetch. 캡: text 100KB / html 500KB (XSS 안전성 위해 iframe sandbox 렌더) · ③ Gmail OAuth scope 확장은 1회 재연결 필요 — 사용자 안내 + API에 403 insufficient_scope 응답 표시 · ④ 답장은 In-Reply-To/References 헤더로 thread 묶음. RFC 2047 한글 제목 base64 인코딩 필수 · ⑤ Gmail 라벨 동기화는 best-effort (Promise.all + catch) — 로컬 DB 상태가 진실, Gmail 동기화 실패해도 로컬 보존 · ⑥ Daily 임베드 = 본문 복제 X. email_id 참조 + email_meta 캐시(sender/subject/snippet/external_id)만 보관 → 이메일 원본은 Gmail 또는 myverse_email_imports에 그대로 · ⑦ 필터는 client-side만(메일 50개 limit). 서버 q= 검색은 다음 세션 · ⑧ "Connected emails / Connected calendars" 그룹 분리 — Gmail/Calendar 같은 OAuth 공유지만 UI는 독립 표시 (Notion Mail 패턴) · ⑨ FOUC 방지는 다크모드 패턴 재사용 — 인라인 스크립트로 HTML 클래스 부착 + useState 초기값 함수가 클래스 검사. SSR/client 첫 페인트 동일 |
| **세션 131 결정** | ① 마인드맵 export 캡처 제외는 `data-mindmap-ui` 속성으로 마킹 + `filter` 옵션 — UI 요소(툴바·도움말·picker·모달)를 깔끔히 빼서 회의 자료용 결과물 생성 · ② 노드 → Task는 CanvasEditor와 동일한 `onPromoteText` prop 패턴 재사용 — 일관성 유지, 별도 API 불필요 · ③ 템플릿 → 마인드맵은 새 캔버스 생성 후 router.push (모달 내 미리보기 X) — 마인드맵은 큰 화면이 필요한 도구라 새 페이지가 자연 · ④ 회사 필터는 URL query(`?company=ID`)로 stateless — 북마크·공유 가능. 활성 필터 칩으로 명확한 시그널 · ⑤ Pre-mortem/RACI/SAFe 같은 구조 보존 템플릿은 "노트 모드"로 통째로 저장 — 마일스톤 분해는 의미 손실. 사용자가 모드 선택. 헤딩 없어도 본문 있으면 노트 모드로 적용 가능 · ⑥ apply 모달이 milestones·note 양쪽을 같은 함수에서 처리 — 분기는 applyMode state로 단순화 |
| **세션 130 결정** | ① 마인드맵 텍스트 import는 자동 감지(`#`로 시작 → 마크다운 / 들여쓰기 있음 → outline). 스택 기반 트리 구성. 모드 선택 강제하지 않음 · ② 회사 관리는 ContactsView와 별도 페이지로 분리 — 자동완성으로 부족할 때만 manual. `<datalist>` SSOT는 그대로 유지 · ③ 의존성 위반 감지는 클라이언트 측 계산(별도 API 불필요). dashed rose + ⚠ 시각 신호 + 옵션형 auto-fix · ④ Auto-fix는 5-pass 위상정렬로 단순화 — 사이클 발생 시 더 깊은 검증 없이 종료(상위에서 합리적 의존 관계 가정) · ⑤ 마인드맵 → 프로젝트는 1단계 자식만 마일스톤, 손자 트리는 description으로 평탄화. 너무 깊은 자동 변환은 의미 손실 — 사용자가 1단계 구성을 의도적으로 정리하도록 유도 · ⑥ 간트 export는 차트 컨테이너만 ref로 캡처(범례·배너 제외). pixelRatio: PNG=2, SVG=1 · ⑦ 신규 프레임워크 시드는 변수 패턴 적극 활용 — OKR Roll-up에 `{{quarter}}/{{year}}/{{user}}`, RACI/Pre-mortem에 `{{today}}` |
| **세션 129 결정** | ① 간트 의존성은 PlannerTask JSONB에 `depends_on: string[]` 추가로 마이그레이션 없이 즉시 구현. SVG 직각 경로 + arrow marker · ② 좌측 시작일 핸들은 끝점 고정(duration 자동 보정), 우측 핸들은 끝점 이동(duration만), 본문은 전체 이동(date만). 3가지 모드 명확히 분리 · ③ 마인드맵은 캔버스 엔진 재사용하지 않고 별도 SVG 컴포넌트 `MindmapEditor.tsx`로 구현. 캔버스 data 컬럼 안에 `data.mindmap` vs `data.ppcanvas` 키로 분기 — DB 마이그레이션 0 · ④ 노드 수동 드래그 좌표는 `(dx/zoom)`로 줌 보정 필수 — 줌 in/out 상태에서도 정확 이동 · ⑤ 템플릿 변수는 `{{var\|fallback}}` 패턴. 자동 컨텍스트는 `buildDefaultVarContext()` SSOT로 모든 호출지점 통일 · ⑥ 마일스톤 추출은 `## 헤딩` 우선, `- [ ]` 보조. `(YYYY-MM-DD)` 패턴은 자동 due_date 인식 · ⑦ Stage 2 Company는 `company_name`(자유 텍스트) legacy fallback 유지 + `company_id` FK 신규. 점진 마이그레이션. ContactsView는 `<datalist>` SSOT로 모든 폼에서 자동완성 · ⑧ DigitalCard PNG 캡처는 외부 이미지 CORS로 누락되던 문제 — `fetch→blob→FileReader.readAsDataURL`로 prefetch + onload 대기(1.5s 타임아웃) + 캡처 후 src 복원 |
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
