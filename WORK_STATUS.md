# 작업 현황

> 마지막 업데이트: 2026-04-23 (세션 81 종료 — HeRo Journey 워크스페이스 3일치 + 브랜드 컨셉 교체)

---

## 이번 세션 핵심 성과

### 1) HIT 64 영웅 유형 SSOT 전면 개편 (DB 실측)
- **character_name 64개 리네이밍**: "The + 현대 직업 원형" 형식 · 영화 IP 참조 0
  - 예: D-ENTJ → "The Global Executive" · C-INTJ → "The Precision Architect"
- **character_label 64개**: `[MBTI 특성] + [DISC 방향성]` 구조로 변별력 확보 (기존 C그룹 "신중한 ~" 반복 문제 해소)
- **profile_overview 64개**: 4문단 표준 (핵심 · 빛나는 순간 · 경계할 그림자 · 잘 맞는 환경)
- **strengths/cautions/fit_direction 64개**: 긍정·성장 언어 통일, JSONB 배열로 표준화
- **디자인 시스템 문서**: `docs/hero-types-design-system.md` · `docs/hero-types-pilot-prompts.md` (Midjourney/DALL-E/Nano Banana 파일럿 4종 원샷 프롬프트)
- **인트라 /intra/hero/hero-types 필터 수정**: 잘못된 C/P 그룹 → DISC 정확한 D/I/S/C형

### 2) Journey 워크스페이스 3일치 구축 (리텐션 엔진)
**포지셔닝 전환**: 설명 페이지 아님 · 실제로 커리어를 빌드업하는 도구 · 매일 방문하도록 설계

- **DB 인프라**
  - `hero_daily_checkins` (에너지 · 한 줄 성과, 하루 1회)
  - `hero_goals` + `hero_goal_checkins` (Vrief × GPR 이중축 + 주간 체크인)
  - `hero_journey_stage()` · `hero_streak()` 함수
  - `uc_earn_rules` 시드 8종 (brand_id='hero')

- **API**
  - GET/POST `/api/hero/journey/status` · `/checkin`
  - GET/POST/PATCH/DEL `/api/hero/goals[/id][/checkin]`
  - GET `/api/hero/jobs/feed` — JH 기반 매칭 정렬

- **사용자 측**
  - `/hero/journey` 단일 URL · auth 분기 (비로그인=6단계 마케팅 / 로그인=워크스페이스)
  - 탭 6개: **Today · Hero Type · 목표·성취 · 기록 · 채용 피드 · 매칭**
  - Today 위젯: Journey 지도 · 스트릭 · 해금 체크리스트 · 오늘의 미션 · 30초 체크인 · 받은 매칭
  - 스트릭 배지: 7일 🔥 · 30일 ⭐ · 100일 🏆
  - UC 적립 토스트 + 스트릭 마일스톤 자동 지급

- **헤더**: ABOUT · Journey · Profile · Logout · 공유 · 검색 순서 (UniverseUtilityBar workspacePath 위치 재배치)
- **/hero/career** → `/hero/journey` 301 redirect

### 3) 브랜드 컨셉 전면 교체
- **OLD**: "Hidden Intelligence & Real Opportunity" / 인재 발굴·성장 플랫폼
- **NEW**: **"Human enhancement & Recruit Optimization"** / **Talent Agency**
- HeRo 재정의: "플랫폼" → "인재 기획사" (연예 기획사 원형)
- 적용: `features/hero/HeRoFooter.tsx` · `app/(HeRo)/hero/about/page.tsx` · `lib/site-config.ts` · `sql/site-configs-table.sql` · DB `ums_sites` 실시간 갱신

### 4) HeRo 랜딩 페이지 디테일 수정
- 히어로 서브카피 "당신의 숨겨진 재능을 발견하고, 멋진 무대를 찾습니다"
- "HeRo는 인재 기획사입니다" 섹션 삭제
- 서비스 #3 "기업 매칭" → "써치 라이트 (기업-인재)" + `/hero/search-light` 연결
- "64가지 마케팅 유형" → "64가지 영웅 유형" + DISC 실제 데이터 (D-ENTJ/I-ENFP 등)
- 64 유형 카드 전체 클릭 가능 Link로 변환
- CTA "HeRo 오디션 지원" → `/hero/talent-agent/apply`, "기업 문의" → `/hero/search-light`
- 씨치 라이트 → 써치 라이트 전체 통일 (헤더·푸터·인트라)

### 5) 빌드 에러 수정
- `lib/hit/data/{c,d,e,f}-questions.ts` 삭제된 `./personality-questions` → `@/types/hit` 경로 교정
- `app/api/hero/matching/[id]/report/route.ts` createServerClient → createClient 별칭 + await 추가

---

## 이월 작업 — 집에서 이어갈 구체 리스트

> 집에서 `cd C:/Projects/tenone && git checkout master && git pull origin master` 후 WORK_STATUS.md 읽고 이어갈 것.

### 🟥 P0 — 리텐션 엔진 완성 (이번 주)

#### A. 주간 이메일 리포트 (3~4h)
- **목적**: 월요일 아침 발송 → 이탈자 소환 · 방문 루프 완성
- **구현**:
  1. Resend 템플릿: `emails/hero-weekly-report.tsx`
  2. Supabase pg_cron 또는 Vercel Cron 매주 월 09:00 KST
  3. API: `POST /api/hero/journey/weekly-report` (전 active 회원 대상 배치)
  4. 콘텐츠: 스트릭 · 적립 UC · 신규 매칭 · Vrief 진척 · 미완료 HIT 유도
- **필수 데이터**: 이미 hero_daily_checkins·hero_matches·hero_goals 다 있음
- **테스트**: 1명 대상 수동 호출로 검증 → 크론 연결

#### B. 채용 피드 "관심 있어요" 버튼 연결 (1h)
- 현재 `features/hero/JobsTab.tsx` JobCard 버튼은 UI만 · 동작 X
- **구현**: 버튼 onClick → `POST /api/hero/matching` (body: `{ companyId, memberId, source: 'jobs_feed' }`)
- `hero_matches` INSERT (status='contacted') · Intra 대시보드 건수 증가

#### C. 성과 한 줄 캡처 (기록 탭, 2h)
- 현재 `RecordTab`에 placeholder만 (V2 제공 예정)
- **DB**: `hero_achievements(id, member_id, content, tags, achieved_at, created_at)`
- **API**: GET/POST `/api/hero/achievements`
- **UI**: 기록 탭 상단에 "지금 기록하기" 텍스트박스 + 리스트 + 태그

### 🟧 P1 — 주요 기능 보강

#### D. 스테이지 승급 축하 이벤트 (2h)
- `hero_journey_stage()`가 이전 스테이지 → 현재 비교는 상태 조회만
- **구현**:
  1. `members.profile_metadata` 또는 `hero_profiles.current_stage` 컬럼 추가
  2. status API가 저장된 스테이지 vs 계산 스테이지 비교 → 승급 감지
  3. 승급 시: UC 3,000 지급(`hero_stage_up`) + 이메일 축하 + 모달 표시
  4. 저장된 스테이지 업데이트

#### E. 코칭 세션 이력 탭 (4h)
- **DB**: `hero_coaching_sessions(id, member_id, type('ai'|'expert'), coach_name, content, action_items_jsonb, ended_at)`
- **UI**: 목표·성취 탭 안에 "코칭 기록" 서브섹션 or 별도 탭
- 타임라인 형식 · 각 세션의 액션 아이템 체크박스

#### F. 월간 회고 템플릿 (3h)
- **DB**: `hero_reflections(id, member_id, month, answers_jsonb)`
- **UI**: 매월 첫 주 알림 + 5문항 (OKR 스타일)
- 월간 리포트 이메일과 연동

### 🟨 P2 — 고아 페이지 정리

| 경로 | 처리 |
|------|------|
| `/hero/audition` | 콘텐츠 점검 후 → `/hero/talent-agent` 내부 섹션 흡수 또는 redirect |
| `/hero/for-business` | → `/hero/search-light` redirect |
| `/hero/company` | 헤더에 로그인+기업 담당자 조건부 메뉴 노출 |
| `/hero/branding` · `/hero/mentor` | 현재 `/hero/coaching` redirect로 유지 (외부 링크 보호) |

### 🟦 P3 — UI/UX SSOT 전 페이지 적용 (HeRo CLAUDE.md §색·클릭 규약)

| 순위 | 경로 | 주요 이슈 |
|-----|------|---------|
| 1 | `/hero/hit` 랜딩 | 빨강 8+ 지점 · 태그·순번·아이콘 전반 재정비 |
| 2 | `/hero/hit/{a~f}/*` 검사·결과 | 태그·아이콘 |
| 3 | `/hero/my` | 프로필 카드 클릭 영역 |
| 4 | `/hero/coaching`·서브탭 | 서브탭 상태 |
| 5 | `/hero/search-light` · `/jh` · `/jd` · `/company` | 폼 칩 |

### 🟪 인프라·엔진 (언제든)

- **`hero_company_members` 테이블 신설**: 기업 담당자–기업 관계 (현재 미구현, DB 원칙 §2 위반)
- **HIT 질문 DB 단일화 (Phase 5)**: 현재 `lib/hit/data/*.ts` 24파일 하드코딩 → `hit_questions` SSOT
- **Reputation Vector 연동**: `hero_companies`에 JobPlanet/Blind/Mindle 외부 지표 집계
- **Vrief 역량 사전 seed**: 64 HIT 유형별 추천 역량 템플릿 `vrief_competency_library`
- **64 HeRo 캐릭터 일러스트 양산**: 파일럿 4종(`docs/hero-types-pilot-prompts.md`) → 스타일 확정 후 Nano Banana로 일괄
- **TIH 질문 INDUSTRIES/JOB_FUNCTIONS 공통 상수 교체**: 현재 자체 정의 16/21개 → Universe 공통 31/37개

### 🟫 Intra 관리 페이지 (신설 필요)

| 경로 | 역할 | 상태 |
|------|------|-----|
| `/intra/hero/jd` | 기업 JD 관리 | ❌ 신설 필요 |
| `/intra/hero/jh` | 개인 JH 응답 | ❌ 신설 필요 |
| `/intra/hero/companies` | 기업 풀 | ❌ 신설 필요 |
| `/intra/hero/report-modules` | 324 리포트 모듈 편집 | ❌ 신설 필요 |
| `/intra/hero/ai-prompts` | AI 프롬프트 SSOT 편집 | ❌ 신설 필요 |
| `/intra/hero/funnel` | Funnel 전환율 | ❌ 신설 필요 |
| `/intra/hero/talent-agent/applications` | 탤런트 에이전시 신청 심사 | ❌ 이월 (세션 80에서 요청됨) |
| `lib/action-hub-registry.ts` | `hero_talent_applications` entry 추가 | ❌ 이월 |

### 💰 결제·유료 게이팅 (사업 시작 시점)

- Stripe/Toss 결제 PG 연동
- HIT PDF 다운로드 유료 gate (페이지는 있음, 결제 연결 대기)
- AI 상담 구독 게이팅
- 환불 정책 확정

### 🔍 유지보수·QA

- 전 브랜드 /my 페이지 HitProfileBadge 일괄 삽입 (21개 · 세션 78 이월)
- 실기기 E2E 검증 7개 시나리오
- HIT A 더미 member_id NULL 정리 (6건 전부 NULL — `/api/hit/link-member` 호출 확인)

---

## 집에서 이어받기 — 구체 명령

```bash
cd C:/Projects/tenone
git checkout master
git pull origin master

# 현황 브리핑
cat WORK_STATUS.md | head -60
tail -40 CHANGELOG.md

# Dev
npm run dev
```

### 가장 먼저 해볼 것
```bash
# 1. 주간 이메일 리포트 (P0-A) 부터 착수
#    Resend 템플릿 + pg_cron 설정
# 2. 채용 피드 관심 있어요 연결 (P0-B) — 1시간 안에 가능
```

---

## 세션 81 커밋 이력 (집에서 git log 참고용)

| SHA | 내용 |
|-----|------|
| `0e69ff9e` | fix(hero/hit): DB→코드 일관성 5개 버그 수정 + 매칭 엔진 v3 (이전 세션 이월분) |
| `a1182974` | fix(hero): 영웅 유형 그룹 필터 D/I/S/C형으로 수정 |
| `01a9b76e` | fix(hit): personality-questions import + HeRo 64 유형 텍스트 개편 |
| `9e215bc1` | fix(hero): report route createServerClient 교체 |
| `cc3e3a1e` | feat(hero): Journey Day 1 MVP |
| `cc540ee1` | feat(hero): Journey Day 2 목표·성취 (Vrief × GPR) |
| `db2f514a` | refactor(hero): 브랜드 컨셉 Talent Agency로 전면 교체 |
| `fc7317fc` | feat(hero): Journey Day 3 채용 피드 + UC + 스트릭 배지 |
