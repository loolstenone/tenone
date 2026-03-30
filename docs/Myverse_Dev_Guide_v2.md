# Myverse 개발 기획서 v2 (Claude Code용)

> 이 문서는 Claude Code가 읽고 개발하기 위한 기획서다.
> 이전 버전(v1)에서 MVP 범위를 "기록 퍼스트"로 재구성.
> 마지막 업데이트: 2026-03-30

---

## 프로젝트 개요

### 한 줄 정의
**Myverse는 Personal Blackbox — 사진 찍으면 AI가 캘린더와 대조해서 맥락을 붙여주고, 내 모든 디지털 흔적의 원본을 보관하는 앱.**

### MVP 컨셉 — "기록 퍼스트"
Myverse MVP의 핵심은 **기록이 의미 있게 정리되는 경험**이다. 소셜 공유는 Phase 2.

MVP의 와우 모먼트:
```
📷 사진을 찍는다
  ↓
🤖 AI가 캘린더와 대조한다
  → "서울숲 카페, 오후 2시, 수진이랑 점심"
  ↓
📋 태그가 자동으로 붙은 채 LOG에 쌓인다
  ↓
😊 기분과 한 줄 메모를 덧붙인다 (선택)
  ↓
🌙 저녁에 AI가 하루를 한 줄로 정리해준다
  ↓
🔁 매일 반복 → 쌓이면 나의 우주
```

**소셜 공유가 빠진 이유:** Personal Blackbox의 핵심 가치는 "내 기록이 정리된다"이지 "편하게 공유한다"가 아니다. 기록이 쌓여야 공유할 것이 생긴다. 소셜 공유는 Phase 2에서 기록이 충분히 쌓인 후 자연스럽게 붙인다.

### 제조사
WIO (Work In One · World In One · We In One) — Ten:One™ Universe

---

## 기술 스택

```
[앱]
프레임워크:   React Native (Expo) — SDK 52+
언어:         TypeScript (strict mode)
네비게이션:   Expo Router (파일 기반 라우팅)
상태 관리:    Zustand
UI:           NativeWind (Tailwind CSS for React Native)
아이콘:       lucide-react-native

[백엔드]
BaaS:         Supabase (★ Myverse 전용 프로젝트 — tenone.biz와 분리)
인증:         Supabase Auth (Email, Google, Apple, Kakao)
DB:           PostgreSQL (Supabase)
스토리지:     Supabase Storage (사진, 영상)
실시간:       Supabase Realtime (향후)

[AI]
엔진:         Anthropic Claude API
모델:         Haiku (사진 분류, 태깅, 하루 요약) / Sonnet (대화, 분석 — Phase 3 이후)
프록시:       Supabase Edge Functions (API 키 보호)

[배포]
iOS:          App Store (Expo EAS Build)
Android:      Google Play (Expo EAS Build)
```

### ★ 인프라 결정: Supabase 분리

**Myverse 전용 Supabase 프로젝트를 새로 만든다.** tenone.biz Supabase와 분리.

이유:
1. **데이터 격리** — 앱(개인 기록)과 웹(Orbi 조직 운영)은 본질적으로 다른 데이터
2. **독립 배포** — Myverse 앱 업데이트가 tenone.biz에 영향 주지 않음
3. **스토리지 비용 분리** — 사진/영상 스토리지 비용 추적이 깔끔
4. **RLS 단순화** — 앱 전용 RLS가 훨씬 간결

tenone.biz에서 가져오는 것:
- Auth 설정 패턴 (Google/Apple/Kakao OAuth 구현 참고)
- Claude API 호출 패턴 (lib/agent/claude.ts 참고)
- Google Calendar 연동 패턴 (lib/integrations/google-calendar.ts 참고)
- 코드를 복사해서 Myverse 프로젝트에 맞게 수정. 의존성은 없음.

---

## 전체 로드맵 — MVP에서 완성형까지

### 한눈에 보기

```
Phase 1 — 기록의 시작 (4주)        ← MVP. 이것만 작동하면 출시
Phase 2 — 공유와 확산 (4주)        ← 소셜 공유 + 바이럴 엔진
Phase 3 — AI가 나를 안다 (4주)     ← AI 대화 + 인사이트 + Pro 전환
Phase 4 — 과거를 끌어모은다 (4주)   ← 소셜 백업 + 갤러리 전체 가져오기
Phase 5 — 목표와 일 (4주)          ← DREAM + WORK + GPR/Vrief 엔진
Phase 6 — 내 우주가 보인다 (4주)    ← VERSE 타임라인 + 패턴 시각화
Phase 7 — 함께 일한다 (6주)        ← Orbi 연동
Phase 8 — 영원히 남는다 (4주)      ← 디지털 유산 + 종단간 암호화
```

---

## Phase 1 — 기록의 시작 (MVP, 4주)

### MVP에 있는 것
1. ✅ 로그인/가입 (Google, Apple, Kakao, Email)
2. ✅ AI 온보딩 (3개 질문 → 프로필 생성)
3. ✅ ME 탭 (홈 — 오늘 기분, 최근 기록, 이번 주 요약)
4. ✅ LOG 탭 (사진/글/감정 기록 + AI 자동 분류)
5. ✅ AI 자동 분류 (캘린더 연동 맥락 태깅) ← MVP의 핵심
6. ✅ PLAN 탭 기본 (캘린더 동기화 — AI 분류에 필수)
7. ✅ 하루 요약 알림 (매일 저녁 AI가 한 줄 정리)
8. ✅ 푸시 알림 (아침 브리핑, 저녁 요약)

### MVP에 없는 것 (전부 나중)
- ❌ 소셜 공유 (Phase 2)
- ❌ AI 대화 탭 (Phase 3)
- ❌ 소셜 백업/가져오기 (Phase 4)
- ❌ DREAM, WORK 탭 (Phase 5)
- ❌ VERSE 타임라인 (Phase 6)
- ❌ Orbi 연동 (Phase 7)
- ❌ 디지털 유산 (Phase 8)
- ❌ 스토리지/Pro 구독 결제 (Phase 3)

### PLAN 탭이 MVP에 들어간 이유

AI 자동 분류의 핵심이 **캘린더 대조**다.
사진을 찍으면 AI가 "오늘 캘린더에 '수진이랑 점심'이 있으니 이 사진은 수진과 함께 찍은 것"이라고 추론한다.
이 추론이 작동하려면 캘린더 데이터가 있어야 한다.
따라서 PLAN 탭(캘린더 동기화)은 AI 분류의 인프라이므로 MVP에 포함.

단, PLAN 탭 MVP 범위는 최소:
- Google Calendar 동기화 (읽기 전용)
- 오늘/이번 주 일정 표시
- 투두리스트, 타임박싱, 루틴 관리 → 전부 나중

---

## 앱 구조

### 디렉토리 구조 (Expo Router)

```
myverse/
├── app/
│   ├── _layout.tsx              # Root layout (Auth provider + Navigation)
│   ├── (auth)/
│   │   ├── login.tsx            # 로그인 화면
│   │   └── onboarding.tsx       # AI 온보딩 대화
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Bottom Tab Navigator
│   │   ├── index.tsx            # ME 탭 (홈) — 기본 탭
│   │   ├── log.tsx              # LOG 탭 (일상 기록)
│   │   ├── plan.tsx             # PLAN 탭 (캘린더)
│   │   ├── dream.tsx            # DREAM 탭 (Phase 5)
│   │   ├── work.tsx             # WORK 탭 (Phase 5)
│   │   ├── ai.tsx               # AI 탭 (Phase 3)
│   │   └── verse.tsx            # VERSE 탭 (Phase 6)
│   ├── log/
│   │   ├── [id].tsx             # 기록 상세
│   │   └── new.tsx              # 새 기록 작성
│   └── settings/
│       ├── index.tsx            # 설정 메인
│       ├── profile.tsx          # 프로필 편집
│       └── security.tsx         # 보안 설정
├── components/
│   ├── LogCard.tsx              # 기록 카드 UI
│   ├── LogEditor.tsx            # 기록 작성/편집
│   ├── PhotoPicker.tsx          # 카메라/갤러리 선택
│   ├── AITagBadge.tsx           # AI 태그 뱃지
│   ├── MoodPicker.tsx           # 감정 선택 UI
│   ├── TimelineView.tsx         # 타임라인 뷰
│   ├── CalendarSync.tsx         # 캘린더 일정 표시
│   └── DailySummaryCard.tsx     # 하루 요약 카드
├── lib/
│   ├── supabase.ts              # Supabase 클라이언트
│   ├── auth.ts                  # 인증 로직
│   ├── ai.ts                    # Claude API 호출 (Edge Function 경유)
│   ├── calendar.ts              # Google Calendar 연동
│   ├── camera.ts                # 카메라/갤러리 접근
│   ├── location.ts              # 위치 서비스
│   ├── notifications.ts         # 푸시 알림
│   └── offline.ts               # 오프라인 큐 (AsyncStorage)
├── stores/
│   ├── authStore.ts             # 인증 상태
│   ├── logStore.ts              # 기록 상태
│   ├── calendarStore.ts         # 캘린더 상태
│   └── settingsStore.ts         # 설정 상태
├── types/
│   └── index.ts                 # 타입 정의
└── constants/
    └── index.ts                 # 상수 (색상, API URL 등)
```

### 탭 네비게이션 (하단)

MVP에서는 3개 탭만 활성. 나머지는 "Coming Soon" 표시.

```
[ME]  [LOG]  [PLAN]  [DREAM]  [WORK]  [AI]  [VERSE]
 ✅    ✅     ✅      🔒       🔒     🔒     🔒

✅ = MVP에서 활성
🔒 = 탭은 보이되, 누르면 "곧 열립니다" + 어떤 기능인지 한 줄 안내
```

하단 탭 노출: ME, LOG, PLAN 3개 + [더보기] 버튼으로 나머지 묶기.

---

## 화면 상세 (MVP)

### 1. 로그인 (auth/login.tsx)

```
┌─────────────────────────────┐
│                             │
│        [Myverse 로고]        │
│    Personal Blackbox        │
│                             │
│   [Google로 시작하기]        │
│   [Apple로 시작하기]         │
│   [카카오로 시작하기]        │
│   [이메일로 시작하기]        │
│                             │
│   이용약관 · 개인정보처리방침  │
└─────────────────────────────┘
```

- Supabase Auth 사용
- Google, Apple, Kakao OAuth + 이메일/비밀번호
- 첫 가입 시 → 온보딩으로 이동

### 2. 온보딩 (auth/onboarding.tsx)

AI가 3개 질문을 대화형으로 묻는다. 답변으로 ME 프로필 초안 생성.

```
AI: "반가워요! 당신의 블랙박스를 만들어볼까요?
     먼저 간단한 질문."

Q1: "지금 하는 일이 뭐예요?"
     [직장인] [학생] [프리랜서] [기타: 직접 입력]

Q2: "요즘 가장 많이 하는 활동은?"
     [카페/맛집] [여행] [운동] [업무/공부] [가족] [기타]

Q3: "오늘 기분은?"
     [😊] [😐] [😔] [🔥] [😴]

AI: "좋아요! 준비 완료.
     캘린더를 연결하면 AI가 사진을 더 똑똑하게 정리해요."
     [캘린더 연결하기] [나중에]

AI: "그럼 사진 한 장 올려볼래요?"
     [카메라 열기] [갤러리에서 선택] [나중에]
```

- Claude Haiku 호출로 대화 생성
- 답변 → profiles 테이블에 저장
- 캘린더 연결을 온보딩에서 권유 (AI 분류 품질을 위해 중요)
- 강제는 아님. "나중에" 선택 가능

### 3. ME 탭 — 홈 (tabs/index.tsx)

```
┌─────────────────────────────┐
│ 안녕 [이름].                 │
│ 오늘 기분은? [😊 😐 😔 🔥]   │
│                             │
│ 📅 오늘                     │
│   10:00 팀 미팅              │
│   12:00 수진이랑 점심         │
│   15:00 디자인 리뷰           │
│   [캘린더 미연동 시            │
│    "캘린더 연결하면 AI가       │
│     사진을 자동 정리해요"]     │
│                             │
│ 📝 최근 기록                 │
│   [LogCard] 어제 — 카페 📷   │
│   [LogCard] 그저께 — 메모 ✏️  │
│                             │
│ 📊 이번 주                   │
│   기록 5개 · 사진 12장        │
│   가장 많이 간 곳: 회사       │
│                             │
│ 🌙 어제 한 줄                │
│   "생각이 많은 수요일"        │
└─────────────────────────────┘
```

- 상단: 이름 + 오늘 기분 선택 (MoodPicker)
- 중단: 오늘 캘린더 일정 (Google Calendar 연동 시)
- 하단: 최근 LOG 카드 + 이번 주 집계 (쿼리 기반)
- AI 하루 요약 카드 표시 (전날 것)

### 4. LOG 탭 — 일상 기록 (tabs/log.tsx)

**메인 화면: 타임라인**

```
┌─────────────────────────────┐
│ 📝 LOG            [📷] [✏️] │
│                             │
│ ── 오늘 (3/30 월) ────────  │
│                             │
│ [LogCard]                   │
│  📷 [사진 크게 표시]          │
│  🏷️ 📍서울숲 카페            │
│     👤수진                   │
│     🗂️일상 > 식사 > 카페     │
│  ⏰ 14:00                   │
│  "오늘 수진이랑 점심..."      │
│  😊                         │
│                             │
│ [LogCard]                   │
│  ✏️ "오늘 회의에서..."       │
│  😐                         │
│  ⏰ 17:30                   │
│                             │
│ ── 어제 (3/29 일) ────────  │
│  🌙 "생각이 많은 일요일"      │
│                             │
│ [LogCard] ...               │
└─────────────────────────────┘
```

- 시간 역순 타임라인
- 상단 우측: 카메라 버튼 [📷] + 글쓰기 버튼 [✏️]
- 각 LogCard에 AI 태그 뱃지 표시 (📍위치, 👤사람, 🗂️카테고리)
- 날짜 구분선에 AI 하루 요약 표시
- **사진이 주인공.** 카드에서 사진이 가장 크게 보임

**새 기록 작성 (log/new.tsx)**

```
┌─────────────────────────────┐
│ [✕]  새 기록           [저장]│
│                             │
│ [📷 사진/영상 추가]          │
│  ┌──────────────────────┐   │
│  │   선택한 사진 미리보기  │   │
│  │                      │   │
│  │  🏷️ AI 태그:          │   │
│  │  📍 서울숲 카페        │   │
│  │  👤 수진              │   │
│  │  🗂️ 일상 > 식사 > 카페 │   │
│  │  📅 오늘 14:00        │   │
│  │                      │   │
│  │  [태그 수정]           │   │
│  └──────────────────────┘   │
│                             │
│ [글 입력 영역]               │
│ "오늘 수진이랑 점심..."      │
│                             │
│ 기분: [😊] [😐] [😔] [🔥]   │
│                             │
└─────────────────────────────┘
```

- 사진 선택 시 → AI 자동 분류 호출 (비동기, 로딩 스피너)
- AI 태그는 수정 가능 (사용자가 틀린 태그 고칠 수 있음)
- 글 + 감정은 선택 입력 (사진만으로도 기록 완성)
- 저장 시 logs 테이블에 INSERT
- **소셜 공유 버튼 없음 (Phase 2)**

### 5. PLAN 탭 — 캘린더 (tabs/plan.tsx) (MVP 최소)

```
┌─────────────────────────────┐
│ 📅 PLAN                     │
│                             │
│ ── 오늘 (3/30 월) ────────  │
│                             │
│  10:00  팀 미팅              │
│  12:00  수진이랑 점심         │
│  15:00  디자인 리뷰           │
│                             │
│ ── 내일 (3/31 화) ────────  │
│                             │
│  09:00  전체 회의             │
│  14:00  클라이언트 미팅       │
│                             │
│ ── 모레 (4/1 수) ──────── │
│                             │
│  종일  분기 시작              │
│                             │
│ [캘린더 미연동 시]            │
│  "캘린더를 연결하면           │
│   AI가 사진 속 맥락을         │
│   자동으로 파악해요"          │
│  [Google Calendar 연결하기]  │
└─────────────────────────────┘
```

MVP에서의 PLAN 탭:
- Google Calendar 읽기 전용 동기화
- 오늘 + 이번 주 일정 표시
- 일정 생성/수정은 없음 (구글 캘린더 앱에서)
- 핵심 목적: AI 사진 분류를 위한 캘린더 데이터 확보

---

## 데이터베이스 (Supabase)

### 테이블 설계

```sql
-- 사용자 프로필 (Supabase Auth의 auth.users와 연동)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  occupation TEXT,             -- 직업/하는 일
  interests TEXT[],            -- 관심사 태그 배열
  onboarding_answers JSONB,    -- 온보딩 답변 저장
  daily_mood TEXT,             -- 오늘 기분 (😊, 😐, 😔, 🔥, 😴)
  mood_updated_at TIMESTAMPTZ,
  timezone TEXT DEFAULT 'Asia/Seoul',
  storage_used_bytes BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 기록 (LOG 탭 — 핵심 테이블)
CREATE TABLE logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- 콘텐츠
  content_type TEXT NOT NULL CHECK (content_type IN ('photo', 'text', 'mood', 'video', 'link')),
  text_content TEXT,            -- 글 내용
  mood TEXT,                    -- 감정 (😊, 😐, 😔, 🔥, 😴)
  
  -- 미디어
  media_urls TEXT[],            -- Supabase Storage URL 배열
  thumbnail_urls TEXT[],        -- 썸네일 URL 배열
  media_count INT DEFAULT 0,
  
  -- AI 자동 분류
  ai_tags JSONB,               -- { location, person, category, summary }
  ai_processed BOOLEAN DEFAULT false,
  ai_processed_at TIMESTAMPTZ,
  
  -- 위치
  latitude FLOAT,
  longitude FLOAT,
  location_name TEXT,           -- "서울숲 6길 10"
  
  -- 캘린더 연동
  calendar_event_id TEXT,       -- 구글 캘린더 이벤트 ID
  calendar_event_title TEXT,    -- "수진이랑 점심"
  
  -- 메타
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_private BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 캘린더 이벤트 캐시 (Google Calendar 동기화)
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  google_event_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  location TEXT,
  attendees JSONB,             -- [{ name, email }]
  
  synced_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, google_event_id)
);

-- 일별 자동 요약
CREATE TABLE daily_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  date DATE NOT NULL,
  
  -- AI 요약
  ai_one_line TEXT,             -- "생각이 많은 수요일"
  ai_daily_summary TEXT,        -- 상세 요약
  
  -- 집계
  log_count INT DEFAULT 0,
  photo_count INT DEFAULT 0,
  dominant_mood TEXT,           -- 그날 가장 많이 선택한 감정
  locations_visited JSONB,      -- 방문 장소 목록
  
  -- 캘린더
  calendar_events_count INT DEFAULT 0,
  
  generated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- 오프라인 큐 (동기화 대기)
-- 이 테이블은 클라이언트 AsyncStorage에도 미러링
CREATE TABLE sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  action TEXT NOT NULL CHECK (action IN ('create_log', 'update_log', 'delete_log', 'update_mood')),
  payload JSONB NOT NULL,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'syncing', 'completed', 'failed')),
  retry_count INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  synced_at TIMESTAMPTZ
);

-- 인덱스
CREATE INDEX idx_logs_user_recorded ON logs(user_id, recorded_at DESC);
CREATE INDEX idx_logs_user_type ON logs(user_id, content_type);
CREATE INDEX idx_logs_ai_processed ON logs(user_id, ai_processed) WHERE ai_processed = false;
CREATE INDEX idx_calendar_events_user_date ON calendar_events(user_id, start_at);
CREATE INDEX idx_daily_summaries_user_date ON daily_summaries(user_id, date DESC);

-- RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 본인 데이터만 접근
CREATE POLICY "Users can manage own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage own logs" ON logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own calendar" ON calendar_events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own summaries" ON daily_summaries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own sync queue" ON sync_queue FOR ALL USING (auth.uid() = user_id);
```

### Supabase Storage 버킷

```
myverse-media/
├── {user_id}/
│   ├── photos/          -- 사진 원본
│   └── thumbnails/      -- 사진 썸네일 (클라이언트에서 리사이즈 후 업로드)
```

- 버킷 정책: 본인만 읽기/쓰기
- 썸네일: 클라이언트에서 expo-image-manipulator로 리사이즈 (300px) 후 별도 업로드
- Free 5GB 제한: profiles.storage_used_bytes로 추적

---

## AI 연동

### Edge Function: AI 사진 분류 (MVP 핵심)

```typescript
// supabase/functions/classify-photo/index.ts

import { serve } from 'https://deno.land/std/http/server.ts';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

serve(async (req) => {
  const { imageBase64, userId, timestamp, latitude, longitude, locationName } = await req.json();
  
  // Supabase에서 오늘 캘린더 이벤트 가져오기
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  const today = new Date(timestamp);
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
  
  const { data: calendarEvents } = await supabase
    .from('calendar_events')
    .select('title, start_at, end_at, location, attendees')
    .eq('user_id', userId)
    .gte('start_at', startOfDay)
    .lte('start_at', endOfDay)
    .order('start_at');
  
  const anthropic = new Anthropic({
    apiKey: Deno.env.get('ANTHROPIC_API_KEY'),
  });

  const calendarContext = calendarEvents?.length
    ? calendarEvents.map(e => {
        const time = new Date(e.start_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        const attendeeNames = e.attendees?.map((a: any) => a.name).filter(Boolean).join(', ') || '';
        return `- ${time} ${e.title}${attendeeNames ? ` (${attendeeNames})` : ''}${e.location ? ` @ ${e.location}` : ''}`;
      }).join('\n')
    : '캘린더 일정 없음';

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 },
        },
        {
          type: 'text',
          text: `이 사진을 분류해줘. 캘린더 일정과 대조해서 맥락을 추론해.

촬영 시간: ${new Date(timestamp).toLocaleString('ko-KR')}
위치: ${locationName || '알 수 없음'}${latitude ? ` (${latitude}, ${longitude})` : ''}

오늘 캘린더:
${calendarContext}

JSON으로만 응답 (설명 없이 JSON만):
{
  "location": "장소명 (위치 데이터 + 캘린더 위치에서 추론)",
  "person": "함께한 사람 (캘린더 참석자에서 추론, 없으면 null)",
  "category": "대분류 > 소분류 (예: 일상 > 식사 > 카페)",
  "summary": "한 줄 설명 (예: 서울숲 카페에서 수진이랑 점심)",
  "matched_event": "매칭된 캘린더 일정 제목 (없으면 null)"
}`,
        },
      ],
    }],
  });

  const aiText = response.content[0].type === 'text' ? response.content[0].text : '';
  
  // JSON 파싱 (```json 래핑 제거)
  const cleanJson = aiText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  let parsed;
  try {
    parsed = JSON.parse(cleanJson);
  } catch {
    // 파싱 실패 시 기본값
    parsed = {
      location: locationName || null,
      person: null,
      category: '일상',
      summary: null,
      matched_event: null,
    };
  }

  return new Response(JSON.stringify(parsed), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

### Edge Function: 하루 요약 (Cron)

```typescript
// supabase/functions/daily-summary/index.ts
// Supabase pg_cron 또는 외부 cron으로 매일 21:00 KST 실행

// 1. 각 사용자의 오늘 logs 가져오기
// 2. 오늘 calendar_events 가져오기
// 3. Claude Haiku에게 한 줄 요약 요청
//    프롬프트: "오늘의 기록과 일정을 보고 한 줄로 요약해줘. 시적이고 짧게."
// 4. daily_summaries 테이블에 UPSERT
// 5. expo-notifications으로 푸시 알림 전송
//    "🌙 오늘 한 줄: '생각이 많은 월요일.'"
```

### Edge Function: 캘린더 동기화

```typescript
// supabase/functions/sync-calendar/index.ts
// 사용자가 캘린더 연결 시 + 매일 아침 06:00 KST Cron

// 1. Google Calendar API로 오늘~7일 후 이벤트 가져오기
// 2. calendar_events 테이블에 UPSERT (google_event_id 기준)
// 3. 삭제된 이벤트 처리 (캘린더에 없는데 DB에 있는 것 제거)
```

### AI 호출 시점 (MVP)

| 시점 | 모델 | 용도 | 트리거 |
|------|------|------|--------|
| 사진 업로드 | Haiku | 캘린더 대조 맥락 분류 | 사용자가 사진 저장 |
| 매일 06:00 | — | 캘린더 동기화 | Cron |
| 매일 21:00 | Haiku | 하루 한 줄 요약 | Cron |
| 온보딩 | Haiku | 대화형 프로필 생성 | 최초 가입 시 |

---

## 카메라 및 파일 접근

```typescript
// lib/camera.ts

import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as ImageManipulator from 'expo-image-manipulator';

// 카메라 촬영
export async function takePhoto() {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) return null;
  
  const result = await ImagePicker.launchCameraAsync({
    quality: 0.8,
    allowsEditing: false,
    exif: true,
  });
  
  if (result.canceled) return null;
  
  return {
    uri: result.assets[0].uri,
    exif: result.assets[0].exif,
    width: result.assets[0].width,
    height: result.assets[0].height,
  };
}

// 갤러리에서 선택
export async function pickFromGallery() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;
  
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
    allowsMultipleSelection: true,
    selectionLimit: 10,
    exif: true,
  });
  
  if (result.canceled) return null;
  return result.assets;
}

// 현재 위치
export async function getCurrentLocation() {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (!permission.granted) return null;
  
  const location = await Location.getCurrentPositionAsync({});
  const [address] = await Location.reverseGeocodeAsync({
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  });
  
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    name: address ? `${address.city || ''} ${address.street || ''}`.trim() : null,
  };
}

// 썸네일 생성
export async function createThumbnail(uri: string): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 300 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );
  return result.uri;
}
```

---

## Google Calendar 연동

```typescript
// lib/calendar.ts

import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

// Google OAuth로 Calendar 읽기 권한 획득
export function useGoogleCalendarAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    // Expo 설정에서 clientId 가져옴
  });
  
  return { request, response, promptAsync };
}

// 캘린더 연결 상태 확인
// access_token은 Supabase profiles.calendar_token에 암호화 저장
// refresh_token으로 만료 시 자동 갱신

// 캘린더 이벤트 동기화는 Edge Function에서 처리
// 클라이언트는 calendar_events 테이블에서 읽기만
```

---

## 오프라인 대응

```typescript
// lib/offline.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// 오프라인 시 로컬에 기록 저장
export async function saveLogOffline(logData: LogInput) {
  const queue = await getOfflineQueue();
  queue.push({
    id: generateUUID(),
    action: 'create_log',
    payload: logData,
    createdAt: new Date().toISOString(),
  });
  await AsyncStorage.setItem('offline_queue', JSON.stringify(queue));
}

// 네트워크 복귀 시 동기화
export function setupSyncListener() {
  NetInfo.addEventListener(state => {
    if (state.isConnected) {
      syncOfflineQueue();
    }
  });
}

// 큐에 있는 항목 순서대로 Supabase에 전송
async function syncOfflineQueue() {
  const queue = await getOfflineQueue();
  for (const item of queue) {
    try {
      // Supabase에 전송
      await syncItem(item);
      // 성공 시 큐에서 제거
      await removeFromQueue(item.id);
    } catch {
      // 실패 시 다음 시도에서 재시도
      break;
    }
  }
}
```

---

## 푸시 알림 (MVP)

```typescript
// expo-notifications 사용

알림 스케줄 (MVP):
  매일 아침 08:00: "좋은 아침! 오늘 일정: [캘린더 첫 일정]"
  매일 저녁 21:00: "🌙 오늘 한 줄: [AI 요약]"

// 아침 알림은 로컬 스케줄 (calendar_events 테이블에서)
// 저녁 알림은 Edge Function daily-summary에서 발송
```

---

## 디자인 가이드

### 색상
```
Primary:     #000000 (Black)
Background:  #FFFFFF (White)
Surface:     #F8F8F8 (Light Gray)
Border:      #E5E5E5
Text:        #0F0F0F
Text Muted:  #888888
Tag BG:      #F0F0F0 (AI 태그 뱃지 배경)
Tag Text:    #555555
Accent:      사진의 대표색에서 추출 (동적) 또는 기본값 #2D2D2D
```

Ten:One™ 흑백 모노톤 기반. 사진이 주인공이므로 배경과 UI를 최대한 비워서 사진이 돋보이게.

### 폰트
```
iOS: SF Pro (시스템 기본)
Android: Roboto (시스템 기본)
→ 커스텀 폰트 없이 시스템 폰트 사용 (MVP)
```

### UI 원칙
1. **사진이 주인공.** LogCard에서 사진이 가장 크게 보임. 인스타 피드 비율.
2. **AI 태그는 겸손하게.** 작은 뱃지로 사진 하단에 배치. 오버레이 아님.
3. **기분 선택은 간결하게.** 이모지 5개. 탭 한 번이면 끝.
4. **빈 상태가 예쁘게.** 기록 없는 날도 보기 좋은 빈 화면 + "사진 한 장 올려볼까요?" CTA.
5. **로딩은 스켈레톤.** AI 분류 중일 때 태그 영역에 스켈레톤 애니메이션.
6. **에러보다 빈 상태.** AI 분류 실패 → 태그 없이 저장. "태그를 직접 추가해보세요" 안내.

---

## MVP 개발 순서 (4주)

### Week 1: 뼈대 + 인증

```
□ Expo 프로젝트 생성 (npx create-expo-app myverse --template tabs)
□ Myverse 전용 Supabase 프로젝트 생성
□ DB 마이그레이션 실행 (위 SQL)
□ Supabase Storage 버킷 생성 (myverse-media)
□ Supabase Auth 설정 (Google, Apple, Kakao, Email)
□ 로그인 화면 구현
□ 온보딩 화면 구현 (AI 대화형 — classify-photo Edge Function 먼저 배포)
□ NativeWind 설정 + 기본 디자인 토큰
□ Zustand 스토어 기본 구조
□ 하단 탭 네비게이션 (ME, LOG, PLAN + 잠금 탭)
```

### Week 2: 기록의 심장 — LOG

```
□ LOG 탭 타임라인 UI (TimelineView + LogCard)
□ 카메라/갤러리 접근 (PhotoPicker — expo-image-picker)
□ 위치 서비스 (expo-location)
□ 사진 Supabase Storage 업로드 + 썸네일 생성
□ 글/감정 기록 기능 (LogEditor + MoodPicker)
□ logs 테이블 CRUD
□ 기록 상세 화면 (log/[id].tsx)
□ 오프라인 큐 기본 구현 (AsyncStorage)
```

### Week 3: AI가 분류한다 — 핵심 파이프라인

```
□ classify-photo Edge Function 배포 (위 코드)
□ Google Calendar OAuth 연동
□ sync-calendar Edge Function 배포
□ calendar_events 테이블 동기화
□ PLAN 탭 기본 (캘린더 일정 표시)
□ 사진 업로드 → AI 분류 → 태그 저장 파이프라인 연결
□ AI 태그 뱃지 UI (AITagBadge)
□ 태그 수동 수정 기능
□ ME 탭 구현 (오늘 기분 + 캘린더 + 최근 기록 + 주간 집계)
```

### Week 4: 요약 + 알림 + 안정화

```
□ daily-summary Edge Function 배포 (Cron 21:00)
□ DailySummaryCard UI
□ 푸시 알림 구현 (expo-notifications)
  - 아침 08:00 로컬 알림
  - 저녁 21:00 서버 발송
□ 오프라인 동기화 안정화
□ UI 다듬기 (로딩, 에러, 빈 상태, 스켈레톤)
□ 성능 최적화 (이미지 리사이즈, 리스트 가상화, 캐싱)
□ EAS Build 설정 + TestFlight / Internal Testing
□ MADLeague 학생 30~50명 테스트 배포
□ 피드백 수집 → Phase 2 우선순위 정리
```

---

## Phase 2 — 공유와 확산 (MVP 이후, 4주)

### 추가되는 것
- 소셜 공유 기능 (OS Share Sheet → 각 플랫폼)
- 공유 기록 추적 (social_shares 테이블)
- AI 캡션 생성 (플랫폼별)
- "from Myverse" 워터마크 (바이럴)
- 소셜 계정 연결 설정

### 추가 테이블
```sql
CREATE TABLE social_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  log_id UUID REFERENCES logs(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'x', 'threads', 'facebook', 'linkedin')),
  caption TEXT,
  shared_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'shared',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE social_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  handle TEXT,
  is_connected BOOLEAN DEFAULT true,
  connected_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, platform)
);
```

### 추가 화면
- log/share.tsx — 소셜 공유 바텀시트
- settings/social.tsx — 소셜 계정 연결

### 추가 Edge Function
- generate-caption: 사진 + 글을 받아 플랫폼별 캡션 생성 (Haiku)

---

## Phase 3 — AI가 나를 안다 (8주 후, 4주)

### 추가되는 것
- AI 탭 활성화 (Claude Sonnet 대화)
- 주간·월간 AI 리뷰 자동 생성
- 패턴 분석 ("당신은 화요일에 가장 활발합니다")
- Pro 구독 결제 (인앱 결제)
- Free → Pro 전환 유도 (3개월 데이터 후 인사이트 맛보기)

### Pro 구독 범위
| Free | Pro (9,900원/월) |
|------|-----------------|
| 기록 무제한 | Free 전부 + |
| AI 자동 분류 | AI 무제한 대화 |
| 캘린더 동기화 | 매일 브리핑·요약 |
| 소셜 공유 월 5회 | 주간·월간 리뷰 |
| 5GB 저장 | 패턴 분석 |
| | 소셜 공유 무제한 |
| | 100GB 저장 |

---

## Phase 4 — 과거를 끌어모은다 (12주 후, 4주)

### 추가되는 것
- 소셜 백업 (인스타/X/유튜브 데이터 다운로드 파일 → Myverse로 가져오기)
- 스마트폰 갤러리 전체 가져오기 (일괄 AI 분류)
- 구글 포토 연동 (Google Photos API)
- 과거 기록 타임라인 재구성

---

## Phase 5 — 목표와 일 (16주 후, 4주)

### 추가되는 것
- DREAM 탭 활성화 (인생 목표, 버킷리스트, GPR 엔진)
- WORK 탭 활성화 (프로젝트 관리, Vrief 엔진)
- PLAN 탭 고도화 (투두리스트, 타임박싱, 루틴)

---

## Phase 6 — 내 우주가 보인다 (20주 후, 4주)

### 추가되는 것
- VERSE 탭 활성화
- 인생 타임라인 시각화
- 키워드 변화 그래프
- 관계 변화 (누구와 가장 많이)
- 성장 그래프 (목표 달성률)
- "1년 전 오늘" 기능

---

## Phase 7 — 함께 일한다 (24주 후, 6주)

### 추가되는 것
- Orbi 웹 서비스 연동
- Myverse ↔ Orbi 데이터 권한 (개인 비공개, 업무만 공유)
- 조직 프로젝트가 WORK 탭에 표시
- Community Orbi 무료 (MADLeague, 동아리)
- Team/Business Orbi 유료

---

## Phase 8 — 영원히 남는다 (30주 후, 4주)

### 추가되는 것
- 디지털 유산 (수신자 지정, 공개 범위, 공개 시점)
- 종단간 암호화 고도화
- Storage+ (1TB, 월 4,900원) / Vault (무제한, 월 9,900원)
- Myverse 웹 보조 (PC에서 긴 작업)

---

## 환경 변수

```env
# .env (Expo)
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx
EXPO_PUBLIC_APP_NAME=Myverse
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=xxxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=xxxx.apps.googleusercontent.com
```

```env
# supabase/functions/.env (Edge Functions용)
ANTHROPIC_API_KEY=sk-ant-xxxx
GOOGLE_CALENDAR_API_KEY=xxxx
```

---

## 핵심 원칙 (Claude Code가 기억해야 할 것)

1. **MVP = 사진 + AI 캘린더 맥락 분류 + 하루 요약.** 이 3개가 매끄럽게 작동하는 게 전부. 소셜 공유는 Phase 2.
2. **사진이 주인공.** UI에서 사진이 가장 크게 보여야 함. 텍스트와 태그는 보조.
3. **AI는 조용히 일한다.** 사진 올리면 알아서 태깅되어 있는 경험. "AI야 해줘"가 아님.
4. **캘린더 연동이 AI의 두뇌.** 캘린더 없으면 AI 분류 품질이 크게 떨어짐. 온보딩에서 적극 권유.
5. **기본 비공개.** 모든 데이터는 Private. 공유는 Phase 2부터, 사용자가 명시적으로 선택할 때만.
6. **Supabase RLS 필수.** 모든 테이블에 Row Level Security. 본인 데이터만 접근. 예외 없음.
7. **에러보다 빈 상태가 낫다.** AI 분류 실패 → 태그 없이 저장. "태그를 직접 추가해보세요."
8. **오프라인 대응.** 네트워크 없을 때 AsyncStorage에 저장 → 연결되면 동기화.
9. **Supabase는 Myverse 전용.** tenone.biz와 분리. 코드 참고만 하고 의존성 없음.
10. **Ten:One™ 디자인.** 흑백 모노톤. 사진이 유일한 색채. 장식 없이 깔끔하게.

---

*Myverse 개발 기획서 v2.0*
*Claude Code 전달용 — 기록 퍼스트 MVP*
*Ten:One™ Universe · 2026.03.30*
*WIO (Work In One · World In One · We In One)*
