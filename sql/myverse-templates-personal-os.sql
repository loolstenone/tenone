-- Personal OS 기본 템플릿 — Daily / Weekly Review / Project Kickoff
-- 각 사용자는 이걸 클릭만 하면 빈 노트가 채워진 채로 생성됨

INSERT INTO myverse_templates (key, category, subcategory, label, description, body_md, role_tags) VALUES

-- ─── Daily 회고 ───
('daily_log', 'note', 'personal_os', '오늘 한 줄',
 '하루 한 줄 회고 + 내일 한 줄',
'## 오늘
- 잘한 것 1:
- 배운 것 1:
- 아쉬운 것 1:

## 내일
- 가장 먼저 할 일:
- 비워두지 않을 시간:
',
 ARRAY['student','employee','leader','entrepreneur','creator']),

-- ─── Weekly Review ───
('weekly_review', 'note', 'personal_os', '주간 리뷰',
 'PARA + GTD 기반 주간 점검',
'## 지난 주
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

## 이번 주
- 최우선 Project 3개:
- 매일 반복할 1가지:
- 시간 블록을 잡을 일:
',
 ARRAY['employee','leader','entrepreneur','creator']),

-- ─── Project Kickoff ───
('project_kickoff', 'note', 'personal_os', '프로젝트 킥오프',
 '새 프로젝트를 시작할 때 30분 안에 채우는 PARA 보드',
'## 한 줄 정의
- 이 프로젝트는 ___ 까지 ___ 을 달성한다.

## 왜
- 이걸 안 하면 어떤 손실?:
- 이걸 하면 어떤 이득?:

## 누구
- Owner (나·다른 사람):
- 협업자 (외부 포함):
- 이해관계자:

## 무엇 (산출물)
- 최종 산출물 (눈에 보이는 결과):
- 중간 마일스톤 3개:

## 언제
- 시작일:
- 마감일 (이걸 못 지키면 어떻게 되나?):

## 얼마나
- 예상 비용:
- 예상 시간:
- 예상 위험:

## 첫 행동 (Next action)
- 오늘/내일 안에 할 1가지:
',
 ARRAY['employee','leader','entrepreneur','creator'])

ON CONFLICT (key) DO UPDATE SET
    label = EXCLUDED.label,
    description = EXCLUDED.description,
    body_md = EXCLUDED.body_md;
