-- HIT 해설 커버리지 정리 (2026-10-13, 적용일 2026-10-13)
-- "나올 수 있는 결과마다 준비된 해설이 있는가" 점검 후속
--   ① D 주요 동기 3종(CM-PUSH-GROWTH·CM-PUSH-CULTURE·CM-PULL-VALUES) 연결 — 하위 점수 저장 컬럼
--   ② 성품 해설 DB 단일화 — ETHICS-LOW 문안 교체 (훈계조 → 행동 제안)
--   ③ D 이직 준비도 CR-A~D 연결 — CR-A 문안을 D 체크리스트 묶음(서류·면접·타이밍·지지)에 맞춤
--   ④ 어떤 선택 규칙에도 연결되지 않는 옛 모듈 보관 처리 (삭제하지 않고 category 앞에 'archived:')
-- 선택 규칙: lib/hit/report-assembler.ts(A·B) · lib/hit/stage-report-modules.ts(C~GAP)

-- ① D 이직 동기 하위 점수 (pushGrowth·pushCulture·pullGrowth·pullReward·pullValues, 0~100) — lib/hit/scoring-d.ts scorePushPullSubs
ALTER TABLE public.hit_d_results ADD COLUMN IF NOT EXISTS motivation_subs jsonb;
COMMENT ON COLUMN public.hit_d_results.motivation_subs IS 'Push/Pull 하위 점수 {pushGrowth,pushCulture,pullGrowth,pullReward,pullValues} 0~100 — 주요 동기 해설 선택 (75 이상)';

-- ② 윤리성 낮음 — 점수가 낮다고 사람을 단정하지 않고, 기준을 세우는 행동으로 안내
UPDATE public.hit_report_modules SET content = '상황과 결과를 먼저 보고 판단하는 실용적인 편입니다. 규칙이 비효율적으로 느껴지면 다른 길을 찾고 싶어질 수 있습니다. 이 유연함은 장점이 되기도 하지만, 일에서의 신뢰는 "이 사람은 어떤 상황에서도 선을 지킨다"는 믿음에서 쌓입니다. 나만의 원칙 세 가지를 적어 두고, 애매한 순간에 그 기준으로 판단해 보세요. 기준이 분명할수록 결정도 빨라지고 주변의 신뢰도 커집니다.', updated_at = now()
WHERE id = 'ETHICS-LOW';

-- ③ 이직 준비도 A — D 체크리스트 묶음과 같은 말로
UPDATE public.hit_report_modules SET content = '서류·면접·타이밍·주변의 지지까지 준비가 전반적으로 갖춰졌습니다. 이제 시장에 나서도 되는 상태이며, 원하는 기회를 고르고 타이밍을 잡는 데 집중하면 됩니다. 준비가 잘 되어 있을수록 점검을 멈추기 쉬우니, 지원 직전에 모의 면접 한 번으로 감을 유지하세요.', updated_at = now()
WHERE id = 'CR-A';

-- ④ 보관 — COMP-*(B 옛 6영역, CORE-*로 대체) 24 · cross_*(옛 A×B 교차, 선택 규칙 없음) 22 · PERSONALITY-*(옛 인성 산식 메모, 현재 채점과 다름) 2
UPDATE public.hit_report_modules SET category = 'archived:' || category, updated_at = now()
WHERE (id LIKE 'COMP-%' OR id LIKE 'cross\_%' OR id LIKE 'PERSONALITY-%')
  AND category NOT LIKE 'archived:%';
