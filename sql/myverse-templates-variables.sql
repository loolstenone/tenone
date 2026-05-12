-- 시드 템플릿에 변수 예시 주입 — {{today}}, {{weekday}}, {{year}}, {{week}}, {{quarter}}, {{user|이름}}
-- 변수는 본문 렌더 시점에 lib/myverse/templates.ts의 expandVariables()로 자동 치환된다.
-- 새 사용자가 템플릿을 열면 "오늘 날짜·이번 주차·내 이름"이 이미 채워져 있는 경험.

INSERT INTO myverse_templates (key, category, subcategory, label, description, body_md, role_tags) VALUES

-- ─── Daily 회고 (변수 적용) ───
('daily_log', 'note', 'personal_os', '오늘 한 줄',
 '하루 한 줄 회고 + 내일 한 줄. {{today}}/{{weekday}}/{{user}} 변수 자동 치환.',
'# {{today}} ({{weekday}}요일) — {{user|나}}의 하루

## 오늘
- 잘한 것 1:
- 배운 것 1:
- 아쉬운 것 1:

## 내일
- 가장 먼저 할 일:
- 비워두지 않을 시간:
',
 ARRAY['student','employee','leader','entrepreneur','creator']),

-- ─── Weekly Review (변수 적용) ───
('weekly_review', 'note', 'personal_os', '주간 리뷰',
 'PARA + GTD 기반 주간 점검. {{year}}/{{week}} 변수 자동 치환.',
'# {{year}}년 {{week}}주차 리뷰 — {{user|나}}

## 지난 주
- 완료한 Task 수:
- 이월된 Task 수:
- 가장 큰 성취:
- 가장 큰 막힘:

## PARA 점검
### Projects
- 진행 중인 프로젝트 (Next action 있는가?)
- 막힌 프로젝트 (왜?)

### Areas
- 잘 관리되고 있는 영역:
- 손이 가지 않는 영역:

### Resources
- 이번 주에 새로 모은 자료:

## 이번 주 ({{year}}-W{{week}})
- 최우선 Project 3개:
- 매일 반복할 1가지:
- 시간 블록을 잡을 일:
',
 ARRAY['employee','leader','entrepreneur','creator']),

-- ─── Project Kickoff (변수 적용) ───
('project_kickoff', 'note', 'personal_os', '프로젝트 킥오프',
 '새 프로젝트를 시작할 때 30분 안에 채우는 PARA 보드. {{today}}/{{user}} 변수 자동 치환.',
'# 프로젝트 킥오프 — {{today}}

## 한 줄 정의
- 이 프로젝트는 ___ 까지 ___ 을 달성한다.

## 왜
- 이걸 안 하면 어떤 손실?:
- 이걸 하면 어떤 이득?:

## 누구
- Owner: {{user|이름 미설정}}
- 협업자 (외부 포함):
- 이해관계자:

## 무엇 (산출물)
- 최종 산출물 (눈에 보이는 결과):
- 중간 마일스톤 3개:

## 언제
- 시작일: {{today}}
- 마감일 (이걸 못 지키면 어떻게 되나?):

## 얼마나
- 예상 비용:
- 예상 시간:
- 예상 위험:

## 첫 행동 (Next action)
- 오늘/내일 안에 할 1가지:
',
 ARRAY['employee','leader','entrepreneur','creator']),

-- ─── 신규: 분기 킥오프 (변수 풀 활용 예제) ───
('quarterly_kickoff', 'note', 'personal_os', '분기 킥오프',
 '분기 시작 30분 회의. {{year}}/{{quarter}} 변수로 자동 헤더.',
'# {{year}} {{quarter}} 분기 킥오프 — {{user|나}}

## 지난 분기 회고 한 줄
- 잘된 것:
- 개선할 것:

## 이번 분기 ({{quarter}}) 한 문장 목표
- ___ 을 달성한다.

## 핵심 결과 (KR 3개)
1.
2.
3.

## 위험·전제
- 이게 깨지면 분기가 무너진다:
- 도움 받을 사람:

## 첫 2주 액션
- Week 1 ({{today}} 시작):
- Week 2:
',
 ARRAY['employee','leader','entrepreneur'])

ON CONFLICT (key) DO UPDATE SET
    label = EXCLUDED.label,
    description = EXCLUDED.description,
    body_md = EXCLUDED.body_md,
    role_tags = EXCLUDED.role_tags;
