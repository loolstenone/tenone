-- ═══════════════════════════════════════════════════════════════
-- Planner's Planner AI — Templates 라이브러리 (20종 MVP)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS myverse_templates (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key          TEXT UNIQUE NOT NULL,
  category     TEXT NOT NULL CHECK (category IN ('schedule', 'note', 'framework')),
  subcategory  TEXT,
  label        TEXT NOT NULL,
  description  TEXT,
  body_md      TEXT NOT NULL,
  is_builtin   BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_myverse_templates_category ON myverse_templates(category);

-- ── MVP 20종 시드 ───────────────────────────────────────────────

INSERT INTO myverse_templates(key, category, subcategory, label, description, body_md) VALUES
-- ── Framework (10종) ───────────────────────────────────────────
('swot', 'framework', 'strategy', 'SWOT 분석',
 '강점·약점·기회·위협을 4분면으로 정리',
 '## SWOT 분석

### Strengths (강점)
-

### Weaknesses (약점)
-

### Opportunities (기회)
-

### Threats (위협)
-

### 도출 전략
- '),

('mandala', 'framework', 'ideation', '만다라트',
 '핵심 목표 1개를 9분면으로 확장하는 발상법 (오타니 쇼헤이)',
 '## 만다라트

**핵심 목표:**

### 8개 요소
1.
2.
3.
4.
5.
6.
7.
8.

> 각 요소마다 다시 8개의 세부 실행안을 쪼개 보세요.'),

('okr', 'framework', 'strategy', 'OKR',
 '목표(Objective)와 핵심 결과(Key Results)',
 '## OKR

### Objective
_큰 방향. 정성적·영감적._



### Key Results
_측정 가능한 결과. 3~5개._

1.
2.
3.

### 실행 계획
- '),

('quadrant', 'framework', 'decision', '4분면 매트릭스',
 '2축으로 항목을 배치·우선순위 결정',
 '## 4분면 매트릭스

**X축:**
**Y축:**

### 1사분면 (높음·높음)
-

### 2사분면 (낮음·높음)
-

### 3사분면 (낮음·낮음)
-

### 4사분면 (높음·낮음)
- '),

('business_canvas', 'framework', 'business', '비즈니스 모델 캔버스',
 '9블록으로 비즈니스 모델 구조화',
 '## Business Model Canvas

### 1. Customer Segments (고객 세그먼트)


### 2. Value Propositions (가치 제안)


### 3. Channels (채널)


### 4. Customer Relationships (고객 관계)


### 5. Revenue Streams (수익원)


### 6. Key Resources (핵심 자원)


### 7. Key Activities (핵심 활동)


### 8. Key Partnerships (핵심 파트너)


### 9. Cost Structure (비용 구조)
'),

('lean_canvas', 'framework', 'business', '린 캔버스',
 '스타트업용 1페이지 비즈니스 모델',
 '## Lean Canvas

### Problem (해결할 문제)
1.
2.
3.

### Customer Segments (타겟 고객)


### Unique Value Proposition (핵심 가치 제안)


### Solution (해결책)
1.
2.
3.

### Unfair Advantage (경쟁 우위)


### Channels (유통 채널)


### Revenue Streams (수익 흐름)


### Cost Structure (비용 구조)


### Key Metrics (핵심 지표)
'),

('5w1h', 'framework', 'analysis', '5W1H',
 '누가·언제·어디서·무엇을·왜·어떻게',
 '## 5W1H

### Who (누가)


### When (언제)


### Where (어디서)


### What (무엇을)


### Why (왜)


### How (어떻게)
'),

('pest', 'framework', 'analysis', 'PEST 분석',
 '정치·경제·사회·기술 거시 환경 분석',
 '## PEST 분석

### Political (정치·법률)
-

### Economic (경제)
-

### Social (사회·문화)
-

### Technological (기술)
-

### 인사이트
'),

('ikigai', 'framework', 'personal', 'Ikigai (이키가이)',
 '좋아하는 것·잘하는 것·돈 되는 것·세상이 필요로 하는 것',
 '## Ikigai

### 1. 좋아하는 것 (What you love)


### 2. 잘하는 것 (What you are good at)


### 3. 돈이 되는 것 (What you can be paid for)


### 4. 세상이 필요로 하는 것 (What the world needs)


### 교집합 (Ikigai)
_네 가지가 만나는 지점은?_
'),

('persona', 'framework', 'user', '사용자 페르소나',
 '타겟 사용자의 가상 인물 프로필',
 '## User Persona

### 이름·나이·직업


### 배경 스토리


### 목표 / 욕구
-

### 고충 (Pain Points)
-

### 자주 쓰는 도구·채널
-

### 대표 인용문 (Quote)
> '),

-- ── Schedule (5종) ─────────────────────────────────────────────
('time_block', 'schedule', 'daily', '타임블록 (시간대별)',
 '아침·오전·오후·저녁으로 나눈 시간 배분',
 '## 타임블록

### 아침 (6~9시)
-

### 오전 (9~12시)
-

### 점심 (12~13시)
-

### 오후 (13~18시)
-

### 저녁 (18~22시)
- '),

('weekly_review', 'schedule', 'weekly', '주간 리뷰',
 '한 주의 성과·교훈·다음 주 준비',
 '## Weekly Review

### 이번 주 잘된 것
-

### 이번 주 아쉬운 것
-

### 배운 것
-

### 다음 주에 집중할 것
-

### 다음 주 한 단어
_한 단어로 다음 주를 정의한다면?_
'),

('monthly_theme', 'schedule', 'monthly', '월간 테마',
 '이달의 한 줄 테마 + 3가지 집중',
 '## 월간 테마

**테마:**

### 이달의 3가지 집중
1.
2.
3.

### 피해야 할 것
-

### 월말 자기 평가 기준
- '),

('quarterly', 'schedule', 'quarterly', '분기 계획',
 '3개월 단위 OKR + 마일스톤',
 '## Quarterly Plan

### 이번 분기 테마


### 3대 목표 (O)
1.
2.
3.

### 핵심 마일스톤 (월별)
**Month 1:**
**Month 2:**
**Month 3:**

### 리스크·전제
- '),

('daily_design', 'schedule', 'daily', '하루 설계',
 '가장 중요한 일 1개 + 서포트 3개',
 '## 오늘의 설계

### Most Important Thing (MIT)
_오늘 이것만은 꼭 한다._


### Supporting Tasks (3개)
1.
2.
3.

### 에너지 예측
- 최고 집중 시간대:
- 휴식 시간:

### 오늘의 한 문장
'),

-- ── Note (5종) ────────────────────────────────────────────────
('cornell', 'note', 'study', '코넬 노트',
 '큐·노트·요약 3분할 학습 노트',
 '## Cornell Note

### Cue / Question (질문·키워드)
-

### Notes (본문)


### Summary (요약)
'),

('meeting', 'note', 'meeting', '회의록',
 '참석자·안건·결정·액션',
 '## Meeting Note

**일시:**
**참석자:**
**목적:**

### 안건
1.
2.
3.

### 논의·결정사항
-

### Action Items
- [ ] @누구 /
- [ ] @누구 /

### 다음 회의 일정
'),

('brainstorm', 'note', 'ideation', '브레인스토밍',
 '양을 먼저, 질은 나중에',
 '## 브레인스토밍

**주제:**

### 아이디어 (판단 없이 모두)
1.
2.
3.
4.
5.
6.
7.
8.
9.
10.

### 묶기 (카테고리별 그룹핑)


### 우선순위 TOP 3
1.
2.
3. '),

('decision_log', 'note', 'decision', '의사결정 로그',
 '무엇을·왜·대안·근거',
 '## Decision Log

**일시:**
**결정 사항:**

### 배경·맥락


### 고려한 대안
1.
2.
3.

### 선택한 이유


### 예상 리스크


### 되돌릴 수 있는가


### 재검토 시점
'),

('retrospective', 'note', 'retro', '회고 (KPT)',
 'Keep·Problem·Try 3단',
 '## 회고 (KPT)

### Keep (계속할 것)
-

### Problem (문제)
-

### Try (시도할 것)
- ')

ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  body_md = EXCLUDED.body_md;

-- RLS (읽기는 모두에게 허용)
ALTER TABLE myverse_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "모두 읽기" ON myverse_templates;
CREATE POLICY "모두 읽기" ON myverse_templates FOR SELECT USING (true);
