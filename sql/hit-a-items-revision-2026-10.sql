-- HIT A 문항·해설 개정 (2026-10-13 적용, 학생 응시 전 — 실응답 0건·더미 삭제 상태에서 실행)
-- 근거: 세션 171 문항 감사. 사용자 결정 "전부 추천안".
--
-- 1. 윤리성(ethics): 타인 신뢰 3문항(ch_x05·x06·x08) 삭제 → 신중한 사람이 '윤리성 낮음'을 받던 결함.
--    대인관계의 소신 문항 ch_r05 → ch_x09로 이동, 새 문항 ch_x10(R)·ch_x11 추가. 척도 = 원칙·정직·소신 8문항.
-- 2. 대인관계(relational): 외향성 문항 ch_r03·r07 삭제(성격 E/I와 이중 측정), 배려·공감 문항 ch_r09~r11 추가. 8문항 유지.
-- 3. 성장 배경(base): uf_006(외동 보조)·uf_024(성향 문항)·uf_042·uf_045(전환점 '사건 유무' 중복) 삭제.
--    uf_040 정방향 문항으로 교체. uf_041은 '큰 위기 경험' 게이트(점수 합산 X) — 4점 이상일 때만 uf_043·044로 회복 자원 점수.
-- 4. hit_a_results.uf_trauma_exposure: 게이트 결과 저장 (false = 큰 위기 없음 → UF-TRAUMA-NONE 해설).
-- 5. 해설: UF-TRAUMA 4종(NONE 신설)·UF-CULTURE 3종(영향 인식 기준, 삭제된 종교 언급 제거)·RELATION-LOW·ETHICS-HIGH/MID.
-- 코드: lib/hit/scoring.ts(scoreUF 게이트·결측·'해당 없음'), report-assembler.ts, HitTestUI(성장 배경 '해당 없음' 선택지), a-modules.ts(49→45).

BEGIN;

-- 1·2. 성품 문항 ------------------------------------------------------------
DELETE FROM public.hit_questions WHERE id IN ('ch_x05', 'ch_x06', 'ch_x08', 'ch_r03', 'ch_r07');

UPDATE public.hit_questions
SET id = 'ch_x09', sub_domain = 'ethics',
    scoring_key = '{"area":"ethics","darkTag":null,"subDomain":"independence"}'::jsonb
WHERE id = 'ch_r05';

INSERT INTO public.hit_questions (id, module, test_type, question_index, question_text, sub_domain, response_type, reverse_scored, scoring_key, layer_target, tenant_id) VALUES
  ('ch_x10', 'character_core', 'A', 40, '남이 보지 않으면 작은 규칙은 어겨도 된다고 생각한다.', 'ethics', 'likert7', true,  '{"area":"ethics","darkTag":null,"subDomain":"conscience"}', 'A', 'tenone'),
  ('ch_x11', 'character_core', 'A', 41, '잘못을 알게 되면 불이익이 있어도 바로잡는다.',       'ethics', 'likert7', false, '{"area":"ethics","darkTag":null,"subDomain":"conscience"}', 'A', 'tenone'),
  ('ch_r09', 'character_core', 'A', 42, '갈등이 생기면 상대의 입장을 먼저 정리해 본다.',       'relational', 'likert7', false, '{"area":"relational","darkTag":null,"subDomain":"perspective"}', 'A', 'tenone'),
  ('ch_r10', 'character_core', 'A', 43, '내 의견이 관철될 때도 상대가 체면을 잃지 않게 신경 쓴다.', 'relational', 'likert7', false, '{"area":"relational","darkTag":null,"subDomain":"consideration"}', 'A', 'tenone'),
  ('ch_r11', 'character_core', 'A', 44, '팀에서 소외되는 사람이 없도록 챙기는 편이다.',         'relational', 'likert7', false, '{"area":"relational","darkTag":null,"subDomain":"warmth"}', 'A', 'tenone')
ON CONFLICT (id) DO NOTHING;

-- 3. 성장 배경 문항 ------------------------------------------------------------
DELETE FROM public.hit_questions WHERE id IN ('uf_006', 'uf_024', 'uf_042', 'uf_045');

UPDATE public.hit_questions
SET question_text = '성장기에 필요한 교육·활동 기회를 대체로 누릴 수 있었다.',
    reverse_scored = false,
    scoring_key = '{"axis":"economic","aspect":"opportunity","weight":1}'::jsonb
WHERE id = 'uf_040';

-- 큰 위기 경험 게이트: 점수에 더하지 않고 4점 이상이면 '경험 있음'
UPDATE public.hit_questions
SET scoring_key = '{"axis":"trauma","role":"gate","note":"presence_not_severity"}'::jsonb
WHERE id = 'uf_041';

-- 4. 결과 컬럼 ----------------------------------------------------------------
ALTER TABLE public.hit_a_results ADD COLUMN IF NOT EXISTS uf_trauma_exposure boolean;
COMMENT ON COLUMN public.hit_a_results.uf_trauma_exposure IS '성장 배경 전환점 게이트(uf_041 ≥ 4). false = 큰 위기 없음, null = 미응답';

-- 5. 해설 모듈 ----------------------------------------------------------------
INSERT INTO public.hit_report_modules (id, category, title, content, tenant_id) VALUES
  ('UF-TRAUMA-NONE', 'uf', '전환점 — 점진적 성장',
   '인생의 방향을 바꿀 만한 큰 위기나 상실 없이 자라 왔습니다. 꾸준한 환경에서 쌓인 안정감이 지금의 나를 받치고 있으며, 급격한 변화보다 조금씩 나아지는 방식에 강합니다.

큰 전환점이 없었다는 것은 부족함이 아닙니다. 앞으로 만날 변화를 선입견 없이 새로 배워 갈 여지가 많다는 뜻입니다.', 'tenone')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, category = EXCLUDED.category, updated_at = now();

UPDATE public.hit_report_modules SET title = '전환점 — 시련을 성장으로', updated_at = now(), content =
'큰 시련을 겪었고, 곁에 도움을 준 사람이 있었으며, 그 경험을 지금의 강점으로 바꿔 냈습니다. 위기에서 회복한 경험은 다음 위기에서 흔들리지 않는 힘이 되고, 비슷한 일을 겪는 사람을 이해하는 깊이가 됩니다.

다만 "이미 극복했다"는 생각이 무리하게 버티는 습관으로 이어지지 않도록, 힘들 때는 힘들다고 말하는 것도 성장의 일부입니다.'
WHERE id = 'UF-TRAUMA-HIGH';

UPDATE public.hit_report_modules SET title = '전환점 — 회복 진행 중', updated_at = now(), content =
'큰 시련을 겪었고, 그 경험을 소화해 가는 중입니다. 도움을 준 사람이 있었거나 일부는 강점으로 바뀌었지만, 아직 정리되지 않은 부분도 남아 있습니다. 이런 상태는 자연스럽습니다.

그 일이 나에게 무엇을 남겼는지 글로 적어 보거나 믿을 수 있는 사람에게 이야기해 보면 정리가 빨라집니다.'
WHERE id = 'UF-TRAUMA-MID';

UPDATE public.hit_report_modules SET title = '전환점 — 기댈 곳이 적었던 경험', updated_at = now(), content =
'큰 시련을 겪었지만 그때 기댈 사람이 적었거나, 그 경험을 아직 의미 있게 정리하지 못했다고 느낍니다. 이런 경험은 특정 상황에서 예상치 못한 감정으로 올라올 수 있습니다.

혼자 감당하려 하기보다 믿을 수 있는 사람, 또는 학교나 직장의 상담 창구에 이야기해 보는 것도 방법입니다. 이 결과는 자기보고 문항 몇 개로 본 참고일 뿐 진단이 아닙니다.'
WHERE id = 'UF-TRAUMA-LOW';

UPDATE public.hit_report_modules SET title = '문화·세대 영향 — 크게 인식', updated_at = now(), content =
'지역, 학교 교육, 부모 세대와의 가치관 차이, 내 세대의 특성이 지금의 나에게 영향을 주었다고 분명히 느낍니다. 자기를 둘러싼 환경을 의식하는 사람은 다른 배경의 사람을 이해하는 폭이 넓고, 조직 문화나 세대 차이를 읽는 데 강합니다.

다만 "나는 원래 이런 환경에서 자라서"가 선택의 한계로 작동하지 않도록, 환경과 내 선택을 구분해 보는 습관이 도움이 됩니다.'
WHERE id = 'UF-CULTURE-HIGH';

UPDATE public.hit_report_modules SET title = '문화·세대 영향 — 보통', updated_at = now(), content =
'환경의 영향을 어느 정도 느끼지만, 그것이 나를 결정한다고 보지는 않습니다. 배경과 자기 판단 사이에서 균형을 잡고 있어, 세대나 지역이 다른 사람과 일할 때 유연하게 맞출 수 있습니다.'
WHERE id = 'UF-CULTURE-MID';

UPDATE public.hit_report_modules SET title = '문화·세대 영향 — 작게 인식', updated_at = now(), content =
'지역, 교육, 세대 같은 환경이 나에게 준 영향을 크게 의식하지 않습니다. 자기 기준으로 판단하는 힘이 강하다는 뜻일 수 있습니다.

다만 환경이 다른 사람의 행동을 이해해야 할 때는, 그 사람의 배경을 먼저 떠올려 보는 것이 소통에 도움이 됩니다.'
WHERE id = 'UF-CULTURE-LOW';

UPDATE public.hit_report_modules SET updated_at = now(), content =
'다른 사람의 감정이나 입장을 살피는 데 에너지를 많이 쓰지 않는 편입니다. 일에 집중하고 감정에 휘둘리지 않는다는 장점이 있지만, 상대는 "내 상황을 모른다"고 느낄 수 있습니다.

대화를 시작하기 전에 "이 사람은 지금 어떤 상황일까?"를 한 번 떠올리고, 의견을 말할 때 상대가 체면을 잃지 않을 표현을 고르는 것부터 연습해 보세요. 작은 배려가 협업의 질을 크게 바꿉니다.'
WHERE id = 'RELATION-LOW';

UPDATE public.hit_report_modules SET updated_at = now(), content =
'정직과 공정에 대한 내적 기준이 분명하고, 옳다고 믿는 것은 반대가 있어도 지키는 소신이 있습니다. 규칙을 지키는 것이 습관이며, 이익이 되더라도 비윤리적인 방법은 선택하지 않습니다. 팀에서 "이것은 옳지 않다"고 말할 수 있는 사람입니다. 이 윤리성과 소신이 장기적 신뢰의 핵심입니다.

주의할 점은 자신의 기준을 타인에게 강요하지 않는 것입니다. 기준이 다른 사람도 나름의 이유가 있을 수 있습니다.'
WHERE id = 'ETHICS-HIGH';

UPDATE public.hit_report_modules SET updated_at = now(), content =
'기본적인 윤리 의식이 있으며, 명백한 규칙 위반은 하지 않습니다. 다만 회색 지대에서의 판단이 상황에 따라 달라질 수 있고, 옳다고 생각해도 분위기에 따라 말을 아낄 때가 있습니다.

"이것이 합법이면 괜찮은 건가, 아니면 옳은 것과 합법인 것이 다를 수 있는가?"를 스스로에게 물어보는 습관이 윤리적 판단력을 키웁니다.'
WHERE id = 'ETHICS-MID';

COMMIT;
