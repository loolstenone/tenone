# Myverse 브랜드 가이드

> **My Universe** — 디지털 속 나를 키운다. "Personal Black Box for the Digital Age"
>
> **3원칙**
> - 나의 일상을 기록하고 관리하고 성장하고
> - 내가 선택한 것들만 외부에 공유하고
> - 지금까지의 디지털 흔적은 나의 것이다

---

## 정체성

- **한 줄 소개**: 9 영역으로 자동 정리되는 개인 데이터 통합 + AI 코칭 + 선택 공개 핸들
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
- `app/(Myverse)/myverse/app/{me|log|plan|dream|work|ai|verse}/page.tsx` — 기존 7탭 (재편 예정)
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
| **Phase** | **세션 108 (2026-05-05)** — AI 브리핑 일일 한도(3회/일) rate limiting 추가 (`app/api/myverse/briefing/generate/route.ts`) · PWA 아이콘 인디고 M 로고 완료 (`public/planners-icon-192.png` · `planners-icon-512.png`) |
| **이전 Phase** | 세션 107 — Planner's Planner를 마이버스로 완전 흡수. DB(`planners_*` 29테이블+13함수 → `myverse_*` RENAME), API(71 라우트 이동), lib(21 모듈 병합), 라우트 미러링(28개), 미들웨어 308 redirect + /api rewrite, 풀 화면 앱 셸, 인디고 #6366F1 브랜딩 |
| **다음 Phase** | features/planners → features/myverse/planner 리네이밍 · Toss 가맹점 승인 · Notion TASK 템플릿 패턴 흡수("오늘 한 장 + 3버튼", "초집중모드", 한국형 태그) · 풀 화면 모드 4 Pillars 진입점 결정 |
| **위험 관리** | 모든 ALTER `IF NOT EXISTS` · 백필 별도 트랜잭션 · 기본 visibility=private · `/api/planners/*` 외부 호환 rewrite 유지 |
| **주요 결정 (세션 107)** | ① PP → 마이버스 단일화 (옵션 A) · ② 9 영역 SSOT 확립 · ③ DB·API·lib·route 4개 layer 모두 myverse 접두사 통일 · ④ planners.tenone.biz는 마이버스 콘텐츠 직접 서비스 · ⑤ AppTopNav를 마이버스 인디고로 리브랜딩 후 풀 화면 셸로 사용 · ⑥ HandNote 펜 선택 = 즉시 그리기 (토글 제거) · ⑦ /myverse/app/daily는 PP 일간 뷰, 9-domain '일상'은 /lifestyle |

---

## 절대 하지 말 것 (Myverse)

- ❌ 새 capture 테이블에 5축 메타데이터 컬럼·domain·visibility·capture_mode 누락
- ❌ visibility 기본값을 'public'으로 (반드시 'private')
- ❌ 자동 캡처 토글을 기본 ON (반드시 OFF·명시 동의)
- ❌ 핸들을 가입 즉시 강제 (첫 공개 시점)
- ❌ 분류 결과를 사용자 동의 없이 외부 LLM으로 보내기
- ❌ 9 영역 외 임의 도메인 키 추가 (lib/myverse/domains.ts SSOT 통과 필수)
