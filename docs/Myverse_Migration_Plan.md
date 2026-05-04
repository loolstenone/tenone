# Planner's Planner → Myverse 통합 마이그레이션 계획

> 작성: 2026-05-04 · 세션 106
>
> **핵심 명제**: 현 Planner's Planner AI(`/planners/app`)를 Myverse 단일 브랜드의 메인 앱(`/myverse/app`)으로 통합한다.
> 5 채집 → 9 영역 → 7 시스템의 SSOT 아키텍처로 재편한다.

---

## 0. 의사결정 (확정)

| # | 결정 | 값 |
|---|---|---|
| 1 | 단일화 방향 | **옵션 A — Myverse로 단일화** |
| 2 | 메인 도메인 | `myverse.kr` (개인 핸들 라우트 `/@handle`) |
| 3 | 4 Pillars 멘탈 모델 | 합의 — UX 사이드바 그룹핑 단위 |
| 4 | 외부 SNS 공유 | 사용자가 선택한 콘텐츠를 외부 SNS로 (Web Intent + Kakao SDK + Web Share API) |
| 5 | 9 영역 SSOT | BODY · 업무 · 공부 · 일상 · 일정 · 여행 · 이동 · 관계 + 사람(횡단축) |
| 6 | 사생활 3티어 | 능동=ON · 자동수집=OFF·동의필수 · 상시감시=금지 |
| 7 | 능동/자동 비중 | 자동 70 · 능동 30 |
| 8 | MVP 연동 4 Phase | 갤러리 자동 → Google Timeline → 헬스킷 → 음식 인식 |

---

## 1. 9 영역 SSOT (한국어·영문 키·기본 색상·자동 분류 단서)

| key | 한국어 | 색상(hex) | 자동 분류 우선 단서 | 대표 데이터 |
|---|---|---|---|---|
| `body` | BODY (운동·식사·수면) | `#10B981` emerald | 헬스킷·구글핏·헬스장 GPS·음식 사진 | 운동 셀카, 음식 사진, 수면 세션 |
| `work` | 업무 | `#3B82F6` blue | 캘린더 미팅·근무 시간대·노션 임포트 | 미팅 음성, 업무 노트, 프로젝트 |
| `study` | 공부 | `#A855F7` purple | 강의 영상·OCR 텍스트·반복 학습 위치 | 필기 사진, 강의 PDF, 코스 진도 |
| `daily` | 일상 | `#F59E0B` amber | 자유 기록·집/카페 위치·여가 시간대 | 일기, 모먼트, 한 줄 |
| `schedule` | 일정 | `#0F766E` teal | 캘린더 직접 입력 | 미팅, 약속, 행사 |
| `travel` | 여행 | `#EC4899` pink | 평소 거점에서 30km+ 이탈 + 1박 이상 | 여행 사진 묶음, 동선 |
| `move` | 이동 | `#6B7280` gray | GPS 백그라운드 자동 | 이동 거리·수단·시간 |
| `relation` | 관계 | `#EF4444` red | 얼굴 인식·contacts 매칭·미팅 참석자 | 사람과의 만남 누적 |
| `_people` | 사람(횡단축) | `#0EA5E9` sky | contacts.id 배열로 모든 영역 횡단 | 한 사람의 모든 흔적 보기 |

**SSOT 위치**: `lib/myverse/domains.ts` (신규)

---

## 2. 5축 메타데이터 (모든 capture 테이블 공통)

| 축 | 컬럼 | 추출원 | 예시 |
|---|---|---|---|
| 시간 | `time_axis JSONB` | EXIF DateTimeOriginal · 캘린더 매칭 | `{at: '2026-05-04T10:30+09', day_of_week: 'sun', period: 'morning', calendar_match_id: 'evt_123'}` |
| 위치 | `geo_axis JSONB` | EXIF GPS · 디바이스 GPS · 거점 매칭 | `{lat:37.55, lng:126.97, base_id:'office', reverse_address:'서울 마포구 ...'}` |
| 사람 | `people_axis UUID[]` | 얼굴 인식 · 미팅 참석자 · contacts 매칭 | `['contact_1', 'contact_2']` |
| 내용 | `content_axis TEXT` | OCR · STT · 본문 텍스트 | "오늘 김홍균 PM과 관광공사 미팅 ..." |
| 컨텍스트 | `context_axis JSONB` | 직전·직후 활동 · 캘린더 · 반복 패턴 | `{prev_routine_id:'r_1', next_routine_id:'r_2', recurring_pattern:'weekly_mon_10am'}` |

추가 공통 컬럼:
- `domain TEXT NOT NULL DEFAULT 'daily'` — 9 영역 enum
- `sub_tags TEXT[] DEFAULT '{}'` — AI 자동 태그
- `capture_mode TEXT DEFAULT 'active'` — `'active' | 'auto' | 'imported'`
- `visibility TEXT DEFAULT 'private'` — `'private' | 'friends' | 'public'`
- `share_count INT DEFAULT 0` — 외부 SNS 공유 횟수
- `classification_version INT DEFAULT 0` — 분류 엔진 버전 (재분류 추적)

---

## 3. DB 마이그레이션 — Phase별 SQL

### Phase 0-A: 핵심 테이블에 공통 컬럼 일괄 추가

```sql
-- sql/myverse-phase0-common-columns.sql
DO $$
DECLARE
    t TEXT;
    targets TEXT[] := ARRAY[
        'planners_daily_moments',
        'planners_daily_places',
        'planners_daily_routines',
        'planners_daily',          -- task·notes·places JSON 컨테이너
        'planners_calendar_entries',
        'planners_projects',
        'planners_contacts'
    ];
BEGIN
    FOREACH t IN ARRAY targets LOOP
        EXECUTE format('
            ALTER TABLE %I
                ADD COLUMN IF NOT EXISTS domain TEXT DEFAULT ''daily'',
                ADD COLUMN IF NOT EXISTS sub_tags TEXT[] DEFAULT ''{}'',
                ADD COLUMN IF NOT EXISTS capture_mode TEXT DEFAULT ''active'',
                ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT ''private'',
                ADD COLUMN IF NOT EXISTS share_count INT DEFAULT 0,
                ADD COLUMN IF NOT EXISTS classification_version INT DEFAULT 0,
                ADD COLUMN IF NOT EXISTS time_axis JSONB,
                ADD COLUMN IF NOT EXISTS geo_axis JSONB,
                ADD COLUMN IF NOT EXISTS people_axis UUID[] DEFAULT ''{}'',
                ADD COLUMN IF NOT EXISTS content_axis TEXT,
                ADD COLUMN IF NOT EXISTS context_axis JSONB
        ', t);
    END LOOP;
END $$;

-- 9 영역 검증 CHECK
ALTER TABLE planners_daily_moments
    ADD CONSTRAINT moments_domain_check
    CHECK (domain IN ('body','work','study','daily','schedule','travel','move','relation'));
-- 동일 패턴 다른 테이블에도

-- visibility CHECK
ALTER TABLE planners_daily_moments
    ADD CONSTRAINT moments_visibility_check
    CHECK (visibility IN ('private','friends','public'));

-- 백필: 기존 데이터의 도메인·캡처모드 추정
UPDATE planners_daily_moments SET domain='daily' WHERE domain IS NULL;
UPDATE planners_daily_routines SET domain=
    CASE category
        WHEN 'work' THEN 'work'
        WHEN 'study' THEN 'study'
        WHEN 'exercise' THEN 'body'
        WHEN 'meal' THEN 'body'
        WHEN 'transport' THEN 'move'
        ELSE 'daily'
    END WHERE domain='daily';
```

### Phase 0-B: handle 시스템

```sql
-- sql/myverse-handles.sql
ALTER TABLE members ADD COLUMN IF NOT EXISTS handle TEXT UNIQUE;

-- 핸들 규칙: 영문 소문자+숫자+언더스코어, 3~20자
ALTER TABLE members ADD CONSTRAINT members_handle_format
    CHECK (handle IS NULL OR handle ~ '^[a-z0-9_]{3,20}$');

CREATE INDEX IF NOT EXISTS idx_members_handle ON members(handle) WHERE handle IS NOT NULL;

-- 공개 페이지 RLS view (anon 접근 가능)
CREATE OR REPLACE VIEW myverse_public_handles AS
SELECT
    m.id AS member_id,
    m.handle,
    m.name,
    m.avatar_url,
    m.bio,
    m.affiliations
FROM members m
WHERE m.handle IS NOT NULL;

GRANT SELECT ON myverse_public_handles TO anon;
```

### Phase 0-C: 분류 결과 캐시 + 자동 캡처 큐

```sql
-- sql/myverse-classification.sql
CREATE TABLE myverse_classification_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    target_table TEXT NOT NULL,    -- 'planners_daily_moments' 등
    target_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued',  -- queued | running | done | failed
    classifier_version INT NOT NULL DEFAULT 1,
    result JSONB,                  -- {domain, sub_tags[], confidence, axes_extracted}
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_class_jobs_status ON myverse_classification_jobs(status, created_at)
    WHERE status IN ('queued','running');
CREATE INDEX idx_class_jobs_member ON myverse_classification_jobs(member_id, created_at DESC);

ALTER TABLE myverse_classification_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY class_jobs_self ON myverse_classification_jobs
    FOR ALL USING (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

-- 자동 캡처 임포트 로그
CREATE TABLE myverse_imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    source TEXT NOT NULL,           -- 'gallery_scan' | 'instagram' | 'facebook' | 'google_timeline' | 'healthkit' | 'apple_photos'
    items_imported INT DEFAULT 0,
    items_skipped INT DEFAULT 0,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    summary JSONB                   -- 영역별 분류 분포 등
);
```

### Phase 0-D: 사용자 동의 토글

```sql
-- sql/myverse-consent.sql
ALTER TABLE planners_users ADD COLUMN IF NOT EXISTS auto_capture_consent JSONB DEFAULT '{
    "gallery": false,
    "gps_background": false,
    "calendar_sync": false,
    "healthkit": false,
    "google_fit": false,
    "email_receipts": false
}'::jsonb;
```

---

## 4. 코드 구조 변경

### 4-A. 파일 이동 매핑

| 현재 | 이전 후 |
|---|---|
| `app/(Planners)/planners/app/*` | `app/(Myverse)/myverse/app/*` (신규 라우트) |
| `features/planners/*` | `features/myverse/*` (점진 이전, 별칭 export 유지) |
| `lib/planners/*` | `lib/myverse/*` (도메인·5축·분류 추가) |
| `app/api/planners/*` | `app/api/myverse/*` (점진, 기존 유지) |

**원칙**: 신규 코드는 myverse 네임스페이스로. 기존 planners 라우트는 30일 redirect 유지 후 제거.

### 4-B. 신규 모듈 (lib/myverse/)

```
lib/myverse/
├── domains.ts             # 9 영역 SSOT (key·label·color·rules)
├── classification/
│   ├── engine.ts          # 분류 엔진 진입점 (ML+rule 하이브리드)
│   ├── rules.ts           # 결정적 룰 (시간·위치·거점)
│   ├── ml-router.ts       # Haiku 4.5 라우팅 (모호한 케이스)
│   └── feedback.ts        # 사용자 수정→학습 데이터화
├── capture/
│   ├── exif.ts            # 사진 EXIF 5축 추출
│   ├── gallery-scan.ts    # PWA File API 갤러리 스캔
│   ├── stt.ts             # Web Speech API + Whisper 폴백
│   ├── ocr.ts             # Tesseract.js → 서버 Vision API 폴백
│   └── vision.ts          # Claude Vision 분석
├── importers/
│   ├── meta-zip.ts        # Instagram/Facebook (이미 구현)
│   ├── google-timeline.ts # Takeout JSON
│   ├── apple-photos.ts    # Photos export
│   └── healthkit.ts       # iOS Capacitor 브리지 (Phase 7)
├── timeline/
│   ├── verse.ts           # 통합 타임라인 (전 영역 시간순)
│   ├── on-this-day.ts     # X년 전 오늘
│   └── insights.ts        # 교차 인사이트
├── handle/
│   ├── validate.ts        # 핸들 형식·예약어 검증
│   ├── public-page.ts     # /@handle 데이터 집계
│   └── share.ts           # 외부 SNS 공유 URL 생성
└── privacy/
    ├── consent.ts         # 자동 캡처 동의 토글
    └── data-export.ts     # 일괄 다운로드/삭제
```

### 4-C. 사이드바 재편 — 4 Pillars + 9 영역

```tsx
// features/myverse/MyverseSidebar.tsx
const PILLARS = [
    {
        key: "me",
        label: "나",
        icon: User,
        domains: ["body", "daily", "relation"],
        children: [
            { domain: "body",     label: "BODY",  href: "/myverse/app/body" },
            { domain: "daily",    label: "일상",  href: "/myverse/app/daily" },
            { domain: "relation", label: "관계",  href: "/myverse/app/relation" },
        ],
    },
    {
        key: "do",
        label: "일",
        icon: Briefcase,
        domains: ["work", "study"],
        children: [
            { domain: "work",  label: "업무",   href: "/myverse/app/work" },
            { domain: "study", label: "공부",   href: "/myverse/app/study" },
        ],
    },
    {
        key: "time",
        label: "시간",
        icon: Clock,
        domains: ["schedule", "move", "travel"],
        children: [
            { domain: "schedule", label: "일정",  href: "/myverse/app/schedule" },
            { domain: "move",     label: "이동",  href: "/myverse/app/move" },
            { domain: "travel",   label: "여행",  href: "/myverse/app/travel" },
        ],
    },
    {
        key: "share",
        label: "나누기",
        icon: Share2,
        children: [
            { label: "Verse 타임라인", href: "/myverse/app/verse" },
            { label: "@handle 공개페이지", href: "/myverse/app/handle" },
        ],
    },
];
```

기존 4-View(Daily/Weekly/Monthly/Yearly)는 **시간 줌**으로 별도 노출 — 어느 영역 페이지에서도 줌 토글로 접근.

### 4-D. Quick Capture 시트

전역 우상단 `+` 버튼 (모든 화면) → 모달:
1. 📷 사진/영상
2. 🎤 음성 메모
3. ✍️ 글
4. 📍 위치 체크인

각 항목은 즉시 자동 분류 → 영역 라우팅 + visibility=private 기본.

---

## 5. Phase 로드맵 (Total ~12-14주)

### Phase 0 — 기반 (1주)
- [ ] DB Phase 0-A·B·C·D SQL 적용
- [ ] `lib/myverse/domains.ts` SSOT 작성
- [ ] 기존 데이터 도메인 백필 마이그레이션
- [ ] CLAUDE.md에 9 영역·5축·visibility 추가
- [ ] 핸들 등록 모달 (가입 직후·또는 첫 공개 시점)

### Phase 1 — 라우트 + 사이드바 재편 (1주)
- [ ] `app/(Myverse)/myverse/app/*` 라우트 생성 (PP 라우트 미러)
- [ ] MyverseSidebar 4 Pillars 컴포넌트
- [ ] PP 라우트 → 새 라우트 redirect (30일 한시)
- [ ] 9 영역 페이지 골격 (각 영역의 카드 grid)
- [ ] visibility 토글 UI (모먼트·프로젝트·노트·이력)

### Phase 2 — 자동 캡처 v1 (2주) ★최대 ROI
- [ ] **갤러리 자동 스캔**: PWA File System Access API + IndexedDB 캐시
- [ ] EXIF 5축 자동 추출 (`lib/myverse/capture/exif.ts`)
- [ ] 분류 엔진 v1 (룰 기반) — 시간/위치/거점만으로 9 영역 라우팅
- [ ] 동의 토글 UI (`/myverse/app/settings/privacy`)
- [ ] **Quick Capture 시트** 전역 `+`
- [ ] 첫 진입 매직 모먼트: 갤러리 권한 → "오늘 사진 12장이 자동 분류됨"

### Phase 3 — @handle 공개 페이지 (1주)
- [ ] `app/(Myverse)/myverse/[handle]/page.tsx` (regex `^@`)
- [ ] 5섹션 렌더 — 헤더·프로페셔널·포트폴리오·다이어리·외부링크
- [ ] visibility=public 필터로만 노출
- [ ] OG 이미지·SEO 메타·structured data
- [ ] 단축 URL `myverse.kr/@h/m/{moment_id}` 라우트

### Phase 4 — 외부 SNS 공유 (1주)
- [ ] Share2 시트 모달 (`features/myverse/ShareSheet.tsx`)
- [ ] Web Intent: X·Threads·LinkedIn
- [ ] Kakao SDK: `Kakao.Share.sendDefault`
- [ ] Web Share API 폴백
- [ ] 공유 시 자동 visibility=public 토글 + share_count++
- [ ] 비공개 전환 시 단축 URL dead

### Phase 5 — STT / OCR / Vision (2주)
- [ ] Web Speech API (브라우저 STT) → 모바일 Whisper API 폴백
- [ ] Tesseract.js OCR → 서버 Google Vision API 폴백
- [ ] Claude Vision: 음식 인식·운동 장비·풍경 태깅
- [ ] 결과를 `content_axis`로 저장 (검색 인덱스)
- [ ] 분류 엔진 v2: ML 라우팅 (Haiku 4.5)

### Phase 6 — AI 코칭 + 교차 인사이트 (2주)
- [ ] 5가지 교차 질문 답변 엔진 (BMC v3에 명시된 것)
- [ ] 사용자별 RAG 인덱스 (pgvector + 임베딩)
- [ ] "나와의 대화" 채팅 인터페이스
- [ ] 일·주·월 자동 브리핑 (현 PP 브리핑 확장)
- [ ] 무료/유료 경계 적용 — 인사이트는 유료

### Phase 7 — BODY 영역 + 헬스 동기화 (2주)
- [ ] 헬스킷·구글핏 OAuth + 데이터 동기화
- [ ] BODY 페이지: 운동·식사·수면 통합 뷰
- [ ] 음식 사진 인식 (Open Food Facts + Vision)
- [ ] 수면 세션 (헬스킷 동기화)
- [ ] 운동 연속 일수·주간 빈도 계산

### Phase 8 — Verse 통합 타임라인 (1주)
- [ ] `/myverse/app/verse` 모든 영역 시간순 통합
- [ ] 6단계 줌: 일/주/월/분기/년/평생
- [ ] "X년 전 오늘" 카드
- [ ] 사람 횡단축 필터: "이 사람과의 모든 흔적"

### Phase 9 — Google Timeline / Apple Photos 임포트 (1주)
- [ ] Takeout JSON 파서 (이미 만든 Meta ZIP 패턴 재사용)
- [ ] Apple Photos export 파서
- [ ] 임포트 후 일괄 분류 큐 등록

### Phase 10 — 도메인 통합 + 마케팅 (1주)
- [ ] `myverse.kr` 도메인 메인 라우팅
- [ ] 기존 `myverse.kr/{philosophy,service,technology,roadmap,team}` 콘텐츠 활용
- [ ] `planners.tenone.biz/`는 PDF 도구 마케팅 채널로만 유지
- [ ] OG·메타·llms.txt·sitemap 일괄 갱신
- [ ] BMC 무료/유료 경계 결제 연동

---

## 6. 보존 / 폐기 / 흡수 매트릭스

### 보존 (그대로 유지)
- 4-View 시간 줌 (Daily/Weekly/Monthly/Yearly) — 어느 영역에서도 호출 가능한 줌 도구
- 능동 AI 브리핑 (`lib/planners/briefing.ts`)
- Templates / Canvas / HandNote
- contacts 전체
- 결제 (Toss) — Myverse 구독으로 라벨 변경
- PWA 인프라

### 흡수 (네이밍·UI 변경, 데이터 그대로)
- `planners_users` → `myverse_users` (rename) 또는 view 별칭
- `planners_*` 테이블 prefix는 유지 (이미 데이터 많음, 위험)
- `Planner's Planner` → `Myverse Plan` 모듈명

### 폐기 / 일몰
- Mindle 등의 별도 시스템과의 중복 기능 (해당 없음)
- "Personal Identity" 라벨 → "프로페셔널" + "@handle 공개"로 분화
- `app/(Planners)/planners/app/*` 라우트 (Phase 10 이후 30일)

### 신규
- 9 영역 페이지 8개 (`/myverse/app/{body,work,study,daily,schedule,move,travel,relation}`)
- `/myverse/app/verse` 통합 타임라인
- `/myverse/[handle]` 공개 페이지
- Quick Capture 시트
- 자동 캡처 동의 화면
- 분류 엔진 (룰 v1 → ML v2)

---

## 7. 위험과 완화

| 위험 | 완화 |
|---|---|
| 기존 PP 사용자(텐원 본인) 데이터 손실 | 모든 ALTER는 IF NOT EXISTS · 백필은 별도 트랜잭션 · DB 스냅샷 백업 후 진행 |
| 도메인 분류 오답으로 사용자 짜증 | 사용자 수정 시 즉시 학습 + 분류 신뢰도 표시 + "자동 분류" 라벨 |
| 자동 캡처 사생활 우려 | 첫 진입 시 명시 동의·기본 OFF·로컬 우선 처리 명시 |
| 30분 분류 작업이 무거움 | 큐 기반 비동기 (Edge Function · 1분 cron) · UI는 "분류 중" 표시 |
| `myverse_classification_jobs` 폭증 | 90일 후 `result.status='done'` 자동 정리 cron |
| Vision/STT API 비용 | 사용자 일일 quota · 자동은 무료 티어만 · 능동 호출은 즉시 처리 |
| LinkedIn-like 공개 페이지 SEO 경쟁 | 5축 메타로 풍부한 structured data · 핸들이 짧음 (`@cheonse`) |
| 핸들 squatting | 14일 미사용 핸들 회수 정책 + 예약어 차단 |

---

## 8. 첫 1주 구체 작업 (Phase 0)

| 일 | 작업 | 산출물 |
|---|---|---|
| 1 | DB SQL 4파일 작성·dry-run·적용 | `sql/myverse-phase0-{common-columns,handles,classification,consent}.sql` |
| 2 | `lib/myverse/domains.ts` SSOT + 9 영역 enum + 색상·라벨·룰 | 1개 파일, 60줄 |
| 3 | 백필 SQL — 기존 routines·moments·places의 도메인·캡처모드 추정 | 1개 파일 |
| 4 | 핸들 등록 모달 (`/myverse/app/onboarding/handle`) | 컴포넌트 + API |
| 5 | CLAUDE.md `(Myverse)` 브랜드 가이드 9 영역·5축·visibility로 갱신 | docs |
| 6 | Phase 1 작업 시작 (`/myverse/app/*` 라우트 생성) | 라우트 골격 |
| 7 | 통합 테스트 + commit + push | 1 PR |

---

## 9. 작업 시작 전 확인 5가지

1. **myverse.kr 도메인** — Vercel·Supabase Redirect URLs 등록 상태 확인
2. **구독 테이블 명칭** — Myverse로 라벨 변경 시 결제 RPC도 업데이트해야
3. **핸들 강제 시점** — 가입 즉시 vs 첫 공개 토글 시 (권장: 후자)
4. **PP 마케팅 사이트(`planners.tenone.biz/`) 운명** — 유지 vs `/myverse/products/planner`로 흡수
5. **현재 PP 사용자(텐원 본인)** 데이터 — 백필 시 영향 검토 (1세션 데모)

---

## 10. 참고

- 비전 v3: 사용자 메시지 (5채집·9영역·5축·12년 누적·7시스템)
- BMC v3: (별도 문서)
- 현 PP 코드: `app/(Planners)/planners/app/*` · `features/planners/*` · `sql/planners-*.sql`
- 현 Myverse 코드: `app/(Myverse)/myverse/*` · 마케팅 5p + 미동작 7탭
- 마이버스 브랜드 가이드: `app/(Myverse)/CLAUDE.md` (9 영역·5축으로 갱신 예정)
