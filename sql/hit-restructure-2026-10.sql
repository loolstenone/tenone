-- hit-restructure-2026-10.sql
-- 적용: (승인 후 기입) — MCP apply_migration `hit_restructure_2026_10`
--
-- HIT 체계 재편 (사용자 결정 2026-10-12, docs/HIT_Structure_Consulting_2026-10.md)
--   공통  A 정체성 · B 역량과 방향 (전 회원)
--   단계  C 진입(신설) · D 전환(옛 C) · E 리더십(옛 D) · F 2막(옛 E)
--   상황  GAP 경력 공백·복귀(옛 F)
--   체크리스트  검사에서 뺀 상태형 문항 → test_type '{X}_checklist' 보존, Journey 체크리스트(hero_journey_checklist_items)
--   폐지  A 심화(character_deep·aptitude_deep) · B 성격 84·RIASEC 60 → '{X}_retired' 보존 (삭제 아님)
--
-- 데이터 영향: 완료 세션 0건 · hit_c~f_results 0행 · hero_profiles 0행 → 이관 없음. hit_questions는 행 삭제 없이 test_type/module만 바꾼다.
-- 롤백: 파일 끝 "ROLLBACK 참고" 블록 (역순 UPDATE + 테이블 이름 되돌리기)

BEGIN;

-- ─────────────────────────────────────────────────────────────
-- 1. hit_sessions.test_type 허용값 (C~F는 CHECK 때문에 세션 생성이 아예 불가능했음)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.hit_sessions DROP CONSTRAINT IF EXISTS hit_sessions_test_type_check;
ALTER TABLE public.hit_sessions ADD CONSTRAINT hit_sessions_test_type_check
  CHECK (test_type IN ('A', 'B', 'C', 'D', 'E', 'F', 'GAP'));

-- ─────────────────────────────────────────────────────────────
-- 2. 결과 테이블 문자 재배치 (충돌 방지: F→GAP → E→F → D→E → C→D)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.hit_f_results RENAME TO hit_gap_results;
ALTER TABLE public.hit_e_results RENAME TO hit_f_results;
ALTER TABLE public.hit_d_results RENAME TO hit_e_results;
ALTER TABLE public.hit_c_results RENAME TO hit_d_results;

ALTER POLICY hit_f_results_own_read ON public.hit_gap_results RENAME TO hit_gap_results_own_read;
ALTER POLICY hit_e_results_own_read ON public.hit_f_results   RENAME TO hit_f_results_own_read;
ALTER POLICY hit_d_results_own_read ON public.hit_e_results   RENAME TO hit_e_results_own_read;
ALTER POLICY hit_c_results_own_read ON public.hit_d_results   RENAME TO hit_d_results_own_read;

ALTER TABLE public.hero_profiles RENAME COLUMN hit_f_result_id TO hit_gap_result_id;
ALTER TABLE public.hero_profiles RENAME COLUMN hit_e_result_id TO hit_f_result_id;
ALTER TABLE public.hero_profiles RENAME COLUMN hit_d_result_id TO hit_e_result_id;
ALTER TABLE public.hero_profiles RENAME COLUMN hit_c_result_id TO hit_d_result_id;
ALTER TABLE public.hero_profiles RENAME CONSTRAINT hero_profiles_hit_f_result_id_fkey TO hero_profiles_hit_gap_result_id_fkey;
ALTER TABLE public.hero_profiles RENAME CONSTRAINT hero_profiles_hit_e_result_id_fkey TO hero_profiles_hit_f_result_id_fkey;
ALTER TABLE public.hero_profiles RENAME CONSTRAINT hero_profiles_hit_d_result_id_fkey TO hero_profiles_hit_e_result_id_fkey;
ALTER TABLE public.hero_profiles RENAME CONSTRAINT hero_profiles_hit_c_result_id_fkey TO hero_profiles_hit_d_result_id_fkey;

-- ─────────────────────────────────────────────────────────────
-- 3. C 진입 결과 테이블 (신설)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.hit_c_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL DEFAULT 'tenone',
  session_id uuid NOT NULL UNIQUE REFERENCES public.hit_sessions(id) ON DELETE CASCADE,
  member_id uuid REFERENCES public.members(id) ON DELETE SET NULL,
  hit_a_result_id uuid REFERENCES public.hit_a_results(id) ON DELETE SET NULL,
  track_id text REFERENCES public.hit_competency_tracks(id),
  readiness_scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  readiness_total integer,
  readiness_grade text CHECK (readiness_grade IN ('A', 'B', 'C', 'D')),
  readiness_gaps jsonb NOT NULL DEFAULT '[]'::jsonb,
  checklist_percent integer,
  onboarding_scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  onboarding_total integer,
  career_decision integer,
  ai_report text,
  journey_stage text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS hit_c_results_member_idx ON public.hit_c_results (member_id, created_at DESC);
ALTER TABLE public.hit_c_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS hit_c_results_own_read ON public.hit_c_results;
CREATE POLICY hit_c_results_own_read ON public.hit_c_results FOR SELECT TO authenticated USING (member_id = auth_member_id());
DROP POLICY IF EXISTS p1_staff_all ON public.hit_c_results;
CREATE POLICY p1_staff_all ON public.hit_c_results FOR ALL TO authenticated USING (auth_is_staff()) WITH CHECK (auth_is_staff());
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hit_c_results TO authenticated;
GRANT SELECT ON public.hit_c_results TO anon;
GRANT ALL ON public.hit_c_results TO service_role;

ALTER TABLE public.hero_profiles ADD COLUMN IF NOT EXISTS hit_c_result_id uuid REFERENCES public.hit_c_results(id) ON DELETE SET NULL;

-- ─────────────────────────────────────────────────────────────
-- 4. B 결과 — 재정의 컬럼 (옛 personality/riasec/readiness 컬럼은 nullable로 남김)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.hit_b_results
  ADD COLUMN IF NOT EXISTS efficacy_scores jsonb,
  ADD COLUMN IF NOT EXISTS efficacy_top3 text,
  ADD COLUMN IF NOT EXISTS interest_efficacy_matrix jsonb,
  ADD COLUMN IF NOT EXISTS insight_self integer,
  ADD COLUMN IF NOT EXISTS insight_job integer,
  ADD COLUMN IF NOT EXISTS insight_total integer;

DROP VIEW IF EXISTS public.hit_b_results_safe;
CREATE VIEW public.hit_b_results_safe WITH (security_invoker = true) AS
  SELECT id, session_id, member_id, hit_a_result_id,
         competency_common, competency_track, competency_track_scores,
         efficacy_scores, efficacy_top3, interest_efficacy_matrix,
         insight_self, insight_job, insight_total,
         ai_report, journey_stage, created_at, tenant_id
  FROM public.hit_b_results;
GRANT SELECT ON public.hit_b_results_safe TO authenticated, anon, service_role;

-- ─────────────────────────────────────────────────────────────
-- 5. Journey 준비 체크리스트 (검사에서 분리한 상태형 항목)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.hero_journey_checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL DEFAULT 'tenone',
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  stage text NOT NULL CHECK (stage IN ('c', 'd', 'e', 'f', 'gap')),
  item_key text NOT NULL,
  checked_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (member_id, stage, item_key)
);
CREATE INDEX IF NOT EXISTS hero_journey_checklist_items_member_idx ON public.hero_journey_checklist_items (member_id, stage);
ALTER TABLE public.hero_journey_checklist_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS hero_journey_checklist_own ON public.hero_journey_checklist_items;
CREATE POLICY hero_journey_checklist_own ON public.hero_journey_checklist_items FOR SELECT TO authenticated USING (member_id = auth_member_id());
DROP POLICY IF EXISTS hero_journey_checklist_staff ON public.hero_journey_checklist_items;
CREATE POLICY hero_journey_checklist_staff ON public.hero_journey_checklist_items FOR ALL TO authenticated USING (auth_is_staff()) WITH CHECK (auth_is_staff());
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hero_journey_checklist_items TO authenticated;
GRANT SELECT ON public.hero_journey_checklist_items TO anon;
GRANT ALL ON public.hero_journey_checklist_items TO service_role;

-- ─────────────────────────────────────────────────────────────
-- 6. 문항 은행 재배치 (행 삭제 없음)
-- ─────────────────────────────────────────────────────────────
-- 6-1. 폐지 보존
UPDATE public.hit_questions SET test_type = 'A_retired' WHERE test_type = 'A' AND module IN ('character_deep', 'aptitude_deep');
UPDATE public.hit_questions SET test_type = 'B_retired' WHERE test_type = 'B' AND module IN ('personality', 'riasec');

-- 6-2. 생애주기 문자 재배치 (옛 C→D, D→E, E→F, F→GAP) — B→C 이동보다 먼저
UPDATE public.hit_questions
   SET test_type = CASE test_type WHEN 'C' THEN 'D' WHEN 'D' THEN 'E' WHEN 'E' THEN 'F' WHEN 'F' THEN 'GAP' END,
       module    = CASE module WHEN 'layer_c' THEN 'layer_d' WHEN 'layer_d' THEN 'layer_e' WHEN 'layer_e' THEN 'layer_f' WHEN 'layer_f' THEN 'layer_gap' ELSE module END
 WHERE test_type IN ('C', 'D', 'E', 'F');

-- 6-3. 상태형 문항 → 체크리스트 보존 (DECOY도 A로 통합)
UPDATE public.hit_questions SET test_type = 'D_checklist'   WHERE test_type = 'D'   AND sub_domain IN ('doc', 'interview', 'timing', 'psychological', 'DECOY');
UPDATE public.hit_questions SET test_type = 'E_checklist'   WHERE test_type = 'E'   AND sub_domain IN ('positioning', 'reference', 'compensation', 'senior_psych', 'DECOY');
UPDATE public.hit_questions SET test_type = 'F_checklist'   WHERE test_type = 'F'   AND sub_domain IN ('financial_readiness', 'time_readiness', 'energy_readiness', 'relationship_readiness', 'DECOY');
UPDATE public.hit_questions SET test_type = 'GAP_checklist' WHERE test_type = 'GAP' AND sub_domain IN ('network', 'field_language', 'self_presentation', 'skill_update', 'DECOY');

-- 6-4. B 진입 전용 → C
UPDATE public.hit_questions SET test_type = 'C' WHERE test_type = 'B' AND module = 'readiness';
UPDATE public.hit_questions SET test_type = 'C', module = 'readiness' WHERE test_type = 'B' AND module = 'readiness_core' AND sub_domain IN ('skill_readiness', 'action_readiness');
-- 6-5. B 자기·직무 이해
UPDATE public.hit_questions SET module = 'career_insight' WHERE test_type = 'B' AND module = 'readiness_core';

-- 6-6. B 핵심역량 +12 (영역당 5문항)
INSERT INTO public.hit_questions (id, module, test_type, question_index, question_text, sub_domain, response_type, reverse_scored, scoring_key) VALUES
  ('comp_c_019', 'competency_core', 'B', 18, '문제를 해결한 뒤 같은 문제가 반복되지 않도록 원인을 정리한다.', 'problem_solving', 'likert7', false, '{"axis":"problem_solving","weight":1}'),
  ('comp_c_020', 'competency_core', 'B', 19, '정보가 부족해도 가능한 해결안을 몇 가지 만들어 비교한다.', 'problem_solving', 'likert7', false, '{"axis":"problem_solving","weight":1}'),
  ('comp_c_021', 'competency_core', 'B', 20, '회의에서 논의된 내용을 요약해 다음 할 일로 정리할 수 있다.', 'communication', 'likert7', false, '{"axis":"communication","weight":1}'),
  ('comp_c_022', 'competency_core', 'B', 21, '상대의 반응을 보며 설명 방식을 바꾼다.', 'communication', 'likert7', false, '{"axis":"communication","weight":1}'),
  ('comp_c_023', 'competency_core', 'B', 22, '맡은 범위 밖이라도 팀에 필요하면 먼저 제안한다.', 'initiative', 'likert7', false, '{"axis":"initiative","weight":1}'),
  ('comp_c_024', 'competency_core', 'B', 23, '일이 막히면 기다리지 않고 도움을 구하거나 대안을 찾는다.', 'initiative', 'likert7', false, '{"axis":"initiative","weight":1}'),
  ('comp_c_025', 'competency_core', 'B', 24, '팀원이 어려움을 겪으면 내 일을 조정해 돕는다.', 'collaboration', 'likert7', false, '{"axis":"collaboration","weight":1}'),
  ('comp_c_026', 'competency_core', 'B', 25, '의견 충돌이 있어도 결정된 뒤에는 함께 실행한다.', 'collaboration', 'likert7', false, '{"axis":"collaboration","weight":1}'),
  ('comp_c_027', 'competency_core', 'B', 26, '집중이 필요한 시간을 확보하고 방해 요소를 관리한다.', 'self_management', 'likert7', false, '{"axis":"self_management","weight":1}'),
  ('comp_c_028', 'competency_core', 'B', 27, '일의 진행 상황을 스스로 점검하고 조정한다.', 'self_management', 'likert7', false, '{"axis":"self_management","weight":1}'),
  ('comp_c_029', 'competency_core', 'B', 28, '피드백을 받으면 방어하기보다 적용할 점을 찾는다.', 'learning_agility', 'likert7', false, '{"axis":"learning_agility","weight":1}'),
  ('comp_c_030', 'competency_core', 'B', 29, '익숙한 방식이 통하지 않으면 다른 방법을 시도한다.', 'learning_agility', 'likert7', false, '{"axis":"learning_agility","weight":1}')
ON CONFLICT (id) DO NOTHING;

-- 6-7. B 효능감 36 (RIASEC "할 수 있다" — A의 흥미 "끌린다"와 교차)
INSERT INTO public.hit_questions (id, module, test_type, question_index, question_text, sub_domain, response_type, reverse_scored, scoring_key) VALUES
  ('eff_r01', 'efficacy', 'B', 0,  '도구나 장비를 설명서를 보고 스스로 다룰 수 있다.', 'R', 'likert7', false, '{"axis":"R"}'),
  ('eff_r02', 'efficacy', 'B', 1,  '기계·설비의 간단한 고장은 원인을 찾아 직접 고칠 수 있다.', 'R', 'likert7', false, '{"axis":"R"}'),
  ('eff_r03', 'efficacy', 'B', 2,  '몸을 쓰는 작업을 오래 해도 일정한 품질을 유지할 수 있다.', 'R', 'likert7', false, '{"axis":"R"}'),
  ('eff_r04', 'efficacy', 'B', 3,  '도면이나 설계도를 보고 실제로 만들거나 조립할 수 있다.', 'R', 'likert7', false, '{"axis":"R"}'),
  ('eff_r05', 'efficacy', 'B', 4,  '현장에서 안전 규칙을 지키며 작업을 완수할 수 있다.', 'R', 'likert7', false, '{"axis":"R"}'),
  ('eff_r06', 'efficacy', 'B', 5,  '공간과 물건을 효율적으로 배치하고 정리할 수 있다.', 'R', 'likert7', false, '{"axis":"R"}'),
  ('eff_i01', 'efficacy', 'B', 6,  '복잡한 자료에서 핵심 원인을 찾아낼 수 있다.', 'I', 'likert7', false, '{"axis":"I"}'),
  ('eff_i02', 'efficacy', 'B', 7,  '가설을 세우고 데이터로 검증하는 과정을 혼자 설계할 수 있다.', 'I', 'likert7', false, '{"axis":"I"}'),
  ('eff_i03', 'efficacy', 'B', 8,  '전문 자료나 논문을 읽고 요점을 정리할 수 있다.', 'I', 'likert7', false, '{"axis":"I"}'),
  ('eff_i04', 'efficacy', 'B', 9,  '숫자와 통계를 해석해 결론을 끌어낼 수 있다.', 'I', 'likert7', false, '{"axis":"I"}'),
  ('eff_i05', 'efficacy', 'B', 10, '처음 보는 문제도 원리를 이해해 접근 방법을 만들 수 있다.', 'I', 'likert7', false, '{"axis":"I"}'),
  ('eff_i06', 'efficacy', 'B', 11, '서로 다른 정보를 비교해 논리적으로 판단할 수 있다.', 'I', 'likert7', false, '{"axis":"I"}'),
  ('eff_a01', 'efficacy', 'B', 12, '글·이미지·영상으로 생각을 표현해 다른 사람에게 전달할 수 있다.', 'A', 'likert7', false, '{"axis":"A"}'),
  ('eff_a02', 'efficacy', 'B', 13, '정해진 형식이 없어도 새로운 아이디어를 구체적인 결과물로 만들 수 있다.', 'A', 'likert7', false, '{"axis":"A"}'),
  ('eff_a03', 'efficacy', 'B', 14, '디자인이나 구성의 좋고 나쁨을 판단하고 개선안을 낼 수 있다.', 'A', 'likert7', false, '{"axis":"A"}'),
  ('eff_a04', 'efficacy', 'B', 15, '콘텐츠를 기획부터 완성까지 혼자 끌고 갈 수 있다.', 'A', 'likert7', false, '{"axis":"A"}'),
  ('eff_a05', 'efficacy', 'B', 16, '다른 사람의 창작물에서 배울 점을 찾아 내 작업에 적용할 수 있다.', 'A', 'likert7', false, '{"axis":"A"}'),
  ('eff_a06', 'efficacy', 'B', 17, '색·소리·언어 같은 감각적 요소를 목적에 맞게 조절할 수 있다.', 'A', 'likert7', false, '{"axis":"A"}'),
  ('eff_s01', 'efficacy', 'B', 18, '다른 사람의 고민을 듣고 실질적인 도움을 줄 수 있다.', 'S', 'likert7', false, '{"axis":"S"}'),
  ('eff_s02', 'efficacy', 'B', 19, '모르는 사람에게 내용을 이해하기 쉽게 가르칠 수 있다.', 'S', 'likert7', false, '{"axis":"S"}'),
  ('eff_s03', 'efficacy', 'B', 20, '갈등이 있는 사람들 사이를 조율할 수 있다.', 'S', 'likert7', false, '{"axis":"S"}'),
  ('eff_s04', 'efficacy', 'B', 21, '팀의 분위기를 읽고 필요한 말과 행동을 할 수 있다.', 'S', 'likert7', false, '{"axis":"S"}'),
  ('eff_s05', 'efficacy', 'B', 22, '상대의 성장을 돕는 피드백을 줄 수 있다.', 'S', 'likert7', false, '{"axis":"S"}'),
  ('eff_s06', 'efficacy', 'B', 23, '여러 사람의 의견을 모아 합의를 만들 수 있다.', 'S', 'likert7', false, '{"axis":"S"}'),
  ('eff_e01', 'efficacy', 'B', 24, '사람들을 설득해 내 제안대로 움직이게 할 수 있다.', 'E', 'likert7', false, '{"axis":"E"}'),
  ('eff_e02', 'efficacy', 'B', 25, '목표를 정하고 팀을 이끌어 결과를 낼 수 있다.', 'E', 'likert7', false, '{"axis":"E"}'),
  ('eff_e03', 'efficacy', 'B', 26, '협상에서 서로 이익이 되는 조건을 찾아낼 수 있다.', 'E', 'likert7', false, '{"axis":"E"}'),
  ('eff_e04', 'efficacy', 'B', 27, '시장의 기회를 포착해 사업 아이디어로 구체화할 수 있다.', 'E', 'likert7', false, '{"axis":"E"}'),
  ('eff_e05', 'efficacy', 'B', 28, '불확실한 상황에서도 결정을 내리고 책임질 수 있다.', 'E', 'likert7', false, '{"axis":"E"}'),
  ('eff_e06', 'efficacy', 'B', 29, '처음 만난 사람에게 내 일이나 제품을 소개하고 관심을 끌 수 있다.', 'E', 'likert7', false, '{"axis":"E"}'),
  ('eff_c01', 'efficacy', 'B', 30, '많은 자료를 규칙에 따라 빠짐없이 정리할 수 있다.', 'C', 'likert7', false, '{"axis":"C"}'),
  ('eff_c02', 'efficacy', 'B', 31, '숫자와 문서의 오류를 꼼꼼히 찾아낼 수 있다.', 'C', 'likert7', false, '{"axis":"C"}'),
  ('eff_c03', 'efficacy', 'B', 32, '절차와 규정을 정확히 따라 업무를 처리할 수 있다.', 'C', 'likert7', false, '{"axis":"C"}'),
  ('eff_c04', 'efficacy', 'B', 33, '일정과 예산을 계획대로 관리할 수 있다.', 'C', 'likert7', false, '{"axis":"C"}'),
  ('eff_c05', 'efficacy', 'B', 34, '반복되는 업무를 효율적인 체계로 만들 수 있다.', 'C', 'likert7', false, '{"axis":"C"}'),
  ('eff_c06', 'efficacy', 'B', 35, '기록과 문서를 다른 사람이 찾기 쉽게 관리할 수 있다.', 'C', 'likert7', false, '{"axis":"C"}')
ON CONFLICT (id) DO NOTHING;

-- 6-8. C 진입 신규 — 첫 직무 적응 20 · 진로 결정 확신 10 (초안, 사용자 검수)
INSERT INTO public.hit_questions (id, module, test_type, question_index, question_text, sub_domain, response_type, reverse_scored, scoring_key) VALUES
  ('ent_oa01', 'onboarding', 'C', 0,  '새 조직의 규칙과 문화를 빨리 파악하고 맞춘다.', 'org_adaptation', 'likert7', false, '{"axis":"org_adaptation"}'),
  ('ent_oa02', 'onboarding', 'C', 1,  '모르는 것을 질문하는 데 주저하지 않는다.', 'org_adaptation', 'likert7', false, '{"axis":"org_adaptation"}'),
  ('ent_oa03', 'onboarding', 'C', 2,  '상사·선배의 일하는 방식을 관찰해 내 방식에 반영한다.', 'org_adaptation', 'likert7', false, '{"axis":"org_adaptation"}'),
  ('ent_oa04', 'onboarding', 'C', 3,  '조직의 말하지 않는 기대(보고 방식·시간 약속)를 알아차린다.', 'org_adaptation', 'likert7', false, '{"axis":"org_adaptation"}'),
  ('ent_oa05', 'onboarding', 'C', 4,  '첫 몇 달의 어려움을 성장 과정으로 받아들인다.', 'org_adaptation', 'likert7', false, '{"axis":"org_adaptation"}'),
  ('ent_ls01', 'onboarding', 'C', 5,  '새 업무를 설명 한 번 듣고 대부분 수행한다.', 'learning_speed', 'likert7', false, '{"axis":"learning_speed"}'),
  ('ent_ls02', 'onboarding', 'C', 6,  '업무 도구와 시스템을 빠르게 익힌다.', 'learning_speed', 'likert7', false, '{"axis":"learning_speed"}'),
  ('ent_ls03', 'onboarding', 'C', 7,  '실수에서 배운 것을 메모하고 정리해 둔다.', 'learning_speed', 'likert7', false, '{"axis":"learning_speed"}'),
  ('ent_ls04', 'onboarding', 'C', 8,  '모르는 용어나 개념을 스스로 찾아 익힌다.', 'learning_speed', 'likert7', false, '{"axis":"learning_speed"}'),
  ('ent_ls05', 'onboarding', 'C', 9,  '배운 것을 바로 실제 업무에 적용한다.', 'learning_speed', 'likert7', false, '{"axis":"learning_speed"}'),
  ('ent_rb01', 'onboarding', 'C', 10, '새 동료와 업무 외 대화도 자연스럽게 한다.', 'relationship_building', 'likert7', false, '{"axis":"relationship_building"}'),
  ('ent_rb02', 'onboarding', 'C', 11, '도움을 받은 사람에게 결과를 공유한다.', 'relationship_building', 'likert7', false, '{"axis":"relationship_building"}'),
  ('ent_rb03', 'onboarding', 'C', 12, '팀 밖 사람과도 필요한 관계를 만든다.', 'relationship_building', 'likert7', false, '{"axis":"relationship_building"}'),
  ('ent_rb04', 'onboarding', 'C', 13, '선배에게 조언을 구하는 것이 어렵지 않다.', 'relationship_building', 'likert7', false, '{"axis":"relationship_building"}'),
  ('ent_rb05', 'onboarding', 'C', 14, '갈등이 생기면 쌓아 두지 않고 풀려고 한다.', 'relationship_building', 'likert7', false, '{"axis":"relationship_building"}'),
  ('ent_fa01', 'onboarding', 'C', 15, '지적을 받으면 감정보다 내용에 집중한다.', 'feedback_acceptance', 'likert7', false, '{"axis":"feedback_acceptance"}'),
  ('ent_fa02', 'onboarding', 'C', 16, '먼저 피드백을 요청하는 편이다.', 'feedback_acceptance', 'likert7', false, '{"axis":"feedback_acceptance"}'),
  ('ent_fa03', 'onboarding', 'C', 17, '부족한 점을 인정하고 보완 계획을 세운다.', 'feedback_acceptance', 'likert7', false, '{"axis":"feedback_acceptance"}'),
  ('ent_fa04', 'onboarding', 'C', 18, '같은 지적을 두 번 받지 않으려 노력한다.', 'feedback_acceptance', 'likert7', false, '{"axis":"feedback_acceptance"}'),
  ('ent_fa05', 'onboarding', 'C', 19, '칭찬보다 개선점이 더 유용하다고 느낀다.', 'feedback_acceptance', 'likert7', false, '{"axis":"feedback_acceptance"}'),
  ('ent_cd01', 'career_decision', 'C', 0, '내가 원하는 첫 직무를 분명히 말할 수 있다.', 'career_decision', 'likert7', false, '{"axis":"career_decision"}'),
  ('ent_cd02', 'career_decision', 'C', 1, '그 직무를 선택한 이유를 설명할 수 있다.', 'career_decision', 'likert7', false, '{"axis":"career_decision"}'),
  ('ent_cd03', 'career_decision', 'C', 2, '다른 선택지와 비교해 보고 결정했다.', 'career_decision', 'likert7', false, '{"axis":"career_decision"}'),
  ('ent_cd04', 'career_decision', 'C', 3, '주변의 기대보다 내 판단으로 정했다.', 'career_decision', 'likert7', false, '{"axis":"career_decision"}'),
  ('ent_cd05', 'career_decision', 'C', 4, '그 직무가 맞지 않을 경우의 대안도 생각해 두었다.', 'career_decision', 'likert7', false, '{"axis":"career_decision"}'),
  ('ent_cd06', 'career_decision', 'C', 5, '첫 직장을 고르는 기준(성장·안정·보수 등)이 정해져 있다.', 'career_decision', 'likert7', false, '{"axis":"career_decision"}'),
  ('ent_cd07', 'career_decision', 'C', 6, '진로 결정에 대해 불안보다 기대가 크다.', 'career_decision', 'likert7', false, '{"axis":"career_decision"}'),
  ('ent_cd08', 'career_decision', 'C', 7, '진로를 바꿔야 할 때 그것을 실패로 보지 않는다.', 'career_decision', 'likert7', false, '{"axis":"career_decision"}'),
  ('ent_cd09', 'career_decision', 'C', 8, '현재 준비 상태가 목표에 맞는지 점검한 적이 있다.', 'career_decision', 'likert7', false, '{"axis":"career_decision"}'),
  ('ent_cd10', 'career_decision', 'C', 9, '목표 직무의 첫 1년을 구체적으로 상상할 수 있다.', 'career_decision', 'likert7', false, '{"axis":"career_decision"}')
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- ─────────────────────────────────────────────────────────────
-- 검증 (적용 후)
--   SELECT test_type, module, count(*) FROM hit_questions GROUP BY 1,2 ORDER BY 1,2;
--   기대: A 221 · B competency_core 30 / competency 510 / efficacy 36 / career_insight 16 · C readiness 240(공통 36 + 트랙 204) / onboarding 20 / career_decision 10
--         D layer_d 100 · E layer_e 120 · F layer_f 107 · GAP layer_gap 118 · *_checklist / *_retired 보존
-- ─────────────────────────────────────────────────────────────
-- ROLLBACK 참고 (적용 역순)
--   DELETE FROM hit_questions WHERE id LIKE 'ent_%' OR id LIKE 'eff_%' OR id IN ('comp_c_019',…,'comp_c_030');
--   UPDATE hit_questions SET module='readiness_core' WHERE test_type='B' AND module='career_insight';
--   UPDATE hit_questions SET test_type='B', module='readiness_core' WHERE test_type='C' AND sub_domain IN ('skill_readiness','action_readiness');
--   UPDATE hit_questions SET test_type='B' WHERE test_type='C' AND module='readiness';
--   UPDATE hit_questions SET test_type = replace(test_type,'_checklist','') WHERE test_type LIKE '%\_checklist';
--   UPDATE hit_questions SET test_type = CASE test_type WHEN 'GAP' THEN 'F' WHEN 'F' THEN 'E' WHEN 'E' THEN 'D' WHEN 'D' THEN 'C' END,
--          module = CASE module WHEN 'layer_gap' THEN 'layer_f' WHEN 'layer_f' THEN 'layer_e' WHEN 'layer_e' THEN 'layer_d' WHEN 'layer_d' THEN 'layer_c' ELSE module END
--    WHERE test_type IN ('D','E','F','GAP');
--   UPDATE hit_questions SET test_type='B' WHERE test_type='B_retired'; UPDATE hit_questions SET test_type='A' WHERE test_type='A_retired';
--   DROP TABLE hero_journey_checklist_items; ALTER TABLE hero_profiles DROP COLUMN hit_c_result_id; DROP TABLE hit_c_results;
--   ALTER TABLE hit_d_results RENAME TO hit_c_results; … (역순 rename) · hero_profiles 컬럼 역순 rename · hit_b_results_safe 옛 정의로 재생성
