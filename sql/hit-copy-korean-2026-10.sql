-- HIT 문구 정비 — 한국어 우선 표기·AI 투 문구 교체 (2026-10-13 적용, 사용자 결정 "전부 추천안")
-- 1) 검사 이름: 'HIT - Archetype' 등 영어 이름 → 한국어 이름 (lib/hit/stages.ts ko와 같게) · '나의 저니' → '나의 성장 기록'
-- 2) 해설(hit_report_modules): 무기·빛나·진정한·시너지·Push/Pull·'자리' 같은 번역투·AI 투 표현을 일상 표현으로. 직무 전문 용어(인사이트·고객 여정 지도 등 TRK-*)는 그대로
-- 3) 문항(hit_questions): 뜻·방향(역채점)은 그대로, 표현만. 직무 역량 문항(comp_*·ready_*)의 업계 용어는 그대로
-- 4) 64유형(hit_hero_types.profile_overview): 표제 '빛나는 순간' → '강점이 드러나는 일', '경계할 그림자' → '주의할 점' (lib/hit/hero-type.ts 두 표제 모두 읽음)
-- 롤백: hit_questions_copy_backup_20261013 · hit_report_modules_copy_backup_20261013 · hit_hero_types_copy_backup_20261013

-- ── 백업 ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.hit_report_modules_copy_backup_20261013 AS
  SELECT id, title, content FROM public.hit_report_modules;
CREATE TABLE IF NOT EXISTS public.hit_questions_copy_backup_20261013 AS
  SELECT id, question_text FROM public.hit_questions;
CREATE TABLE IF NOT EXISTS public.hit_hero_types_copy_backup_20261013 AS
  SELECT type_code, character_label, profile_overview FROM public.hit_hero_types;
ALTER TABLE public.hit_report_modules_copy_backup_20261013 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hit_questions_copy_backup_20261013 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hit_hero_types_copy_backup_20261013 ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.hit_report_modules_copy_backup_20261013, public.hit_questions_copy_backup_20261013, public.hit_hero_types_copy_backup_20261013 FROM anon, authenticated;
GRANT ALL ON public.hit_report_modules_copy_backup_20261013, public.hit_questions_copy_backup_20261013, public.hit_hero_types_copy_backup_20261013 TO service_role;

-- ── 1) 검사 이름 · 나의 저니 (해설 전체) ─────────────────────────────
UPDATE public.hit_report_modules SET
  content = replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(content,
    'HIT - Archetype', '기본 성향 검사'), 'HIT - Bounce', '역량·방향 검사'), 'HIT - Challenger', '사회 진입 검사'),
    'HIT - Departure', '이직 검사'), 'HIT - Elevate', '리더 전환 검사'), 'HIT - Flourish', '인생 2막 검사'),
    'HIT - Gap', '경력 공백 복귀 검사'), '나의 저니', '나의 성장 기록'),
    '검사과 ', '검사와 '), '검사을 ', '검사를 '), '검사은 ', '검사는 '),
  updated_at = now()
WHERE content ~ '(HIT - (Archetype|Bounce|Challenger|Departure|Elevate|Flourish|Gap)|나의 저니)';

-- ── 2) 해설 문장 ────────────────────────────────────────────────────
UPDATE public.hit_report_modules m SET
  title = coalesce(v.title, m.title),
  content = replace(m.content, v.old, v.new),
  updated_at = now()
FROM (VALUES
  ('CM-BALANCED', '이직 동기 — 양쪽이 비슷함', 'Push와 Pull이 비슷한 강도로 나타났습니다.', '떠나고 싶은 이유와 새 곳에 끌리는 이유가 비슷한 크기로 나타났습니다.'),
  ('CM-PULL-DOMINANT', '이직 동기 — 새 기회에 끌림', 'Pull(유인) 요인이 강하게 나타났습니다. 현재 환경이 나쁘지 않지만, 더 나은 기회를 향해 적극적으로 움직이는 유형입니다.', '새 기회에 끌리는 마음이 강하게 나타났습니다. 지금 환경이 나쁘지 않아도 더 나은 기회를 찾아 적극적으로 움직이는 편입니다.'),
  ('CM-PUSH-DOMINANT', '이직 동기 — 떠나고 싶은 마음이 큼', 'Push(이탈) 요인이 Pull(유인) 요인보다 강하게 나타났습니다. 현재 환경에 대한 불만족이 이직의 주된 원동력입니다.', '새 곳에 끌리는 마음보다 지금 회사를 떠나고 싶은 마음이 더 크게 나타났습니다. 지금 환경에 대한 불만이 이직을 생각하게 하는 가장 큰 이유입니다.'),
  ('COMM-I', NULL, '열정이 전달력의 핵심 무기입니다.', '열정이 말을 잘 전하게 하는 가장 큰 힘입니다.'),
  ('CORE-AGILE-A', NULL, '가장 큰 무기가 됩니다.', '가장 큰 도움이 됩니다.'),
  ('CORE-COMM-A', NULL, '발표·설득·조율이 필요한 자리에서', '발표·설득·조율이 필요한 상황에서'),
  ('CR-D', NULL, '지금 자리에서 경력 자본을 정리하고', '지금 회사에서 쌓은 경력을 정리하고'),
  ('CTYPE-EXPLORER', NULL, '지금 자리에서 해 볼 수 있는 변화', '지금 회사에서 해 볼 수 있는 변화'),
  ('CTYPE-STRATEGIC', NULL, '그 역량을 다른 자리에서도 쓸 수 있다고 봅니다. 이직을 생각하는 이유도 지금 자리에서 더 자랄 공간이 줄어들었기 때문인 경우가 많습니다.', '그 역량을 다른 회사에서도 쓸 수 있다고 봅니다. 이직을 생각하는 이유도 지금 회사에서 더 성장할 여지가 줄었기 때문인 경우가 많습니다.'),
  ('DISC-C', NULL, '신중성이 빛나는 환경:', '신중성이 잘 맞는 환경:'),
  ('DISC-D', NULL, '주도성이 빛나는 환경:', '주도성이 잘 맞는 환경:'),
  ('DISC-I', NULL, '사교성이 빛나는 환경:', '사교성이 잘 맞는 환경:'),
  ('DISC-S', NULL, '안정성이 빛나는 환경:', '안정성이 잘 맞는 환경:'),
  ('DISC-DI', NULL, 'C 성향이 강한 팀원과 협업하면 시너지가 납니다.', 'C 성향이 강한 팀원과 함께하면 서로 부족한 점을 채울 수 있습니다.'),
  ('DISC-DS', NULL, '위기 상황에서 특히 빛을 발하며', '위기 상황에서 특히 돋보이며'),
  ('EMOTIONAL-HIGH', NULL, '진정한 안정입니다.', '건강한 안정입니다.'),
  ('ER-SHARE-HIGH', NULL, '다양한 채널을 통해 지식을 전수할 준비가 되어 있습니다. 이 동기는 2막의 핵심 축이 될 수 있습니다.', '여러 방법으로 지식을 나눌 준비가 되어 있습니다. 이 마음이 2막의 중심이 될 수 있습니다.'),
  ('FL-GAP-MINIMAL', NULL, '(육아, 간병 등은 그 자체로 full-time 역할)', '(육아·간병은 그것만으로도 하루를 다 쓰는 일입니다)'),
  ('FR-NARRATIVE-POS', NULL, '이 긍정적 자기 서사는 면접과 네트워킹에서 가장 강력한 무기입니다.', '이렇게 내 경험을 긍정적으로 설명할 수 있다는 점이 면접과 네트워킹에서 가장 큰 강점입니다.'),
  ('MBTI-F-STRONG', NULL, '진정한 배려입니다.', '더 깊은 배려입니다.'),
  ('RIASEC-AIR', NULL, '기술과 예술의 경계에서 빛나는 유형이며', '기술과 예술 사이에서 강점이 드러나는 유형이며'),
  ('RIASEC-SIA', NULL, '상담과 교육에서 자연스럽게 빛나며', '상담과 교육에서 자연스럽게 강점이 드러나며'),
  ('RIASEC-ECA', NULL, '조직의 신뢰를 얻는 가장 큰 무기입니다.', '조직의 신뢰를 얻는 가장 큰 힘입니다.'),
  ('RIASEC-AES', NULL, '무대 위에서든 기획 자리에서든', '무대 위에서든 기획 회의에서든'),
  ('RIASEC-RIS', NULL, '이론 설명을 길게 해야 하는 자리는', '이론을 길게 설명해야 하는 상황은'),
  ('RIASEC-CER', NULL, '현장의 목소리를 정기적으로 듣는 자리를', '현장의 목소리를 정기적으로 듣는 기회를'),
  ('RIASEC-TOP-S', NULL, '사람과 직접 닿는 역할', '사람을 직접 만나는 역할'),
  ('RIASEC-ASE', NULL, '크리에이티브 리더 또는 소셜 크리에이터.', '창작을 이끄는 리더나 사람들과 소통하는 크리에이터에 어울립니다.'),
  ('RIASEC-SAE', NULL, '따뜻한 창의적 리더.', '따뜻하게 사람을 이끄는 창의적인 리더형입니다.'),
  ('RIASEC-CEI', NULL, '조직의 시스템을 관리하고 개선하는 역할.', '조직이 돌아가는 방식을 관리하고 개선하는 역할에 어울립니다.'),
  ('SP-CONNECT-GROWTH', NULL, '관계를 통해 시너지를 만드는', '관계로 더 큰 결과를 만드는'),
  ('SP-CREATE', NULL, '이 강점이 빛나는 역할:', '이 강점이 잘 쓰이는 역할:'),
  ('SP-EXECUTE', NULL, '이 강점이 빛나는 역할:', '이 강점이 잘 쓰이는 역할:'),
  ('SP-STRATEGIC', NULL, '이 강점이 빛나는 역할:', '이 강점이 잘 쓰이는 역할:'),
  ('SP-HARMONY', NULL, '갈등 해결 역할에서 빛납니다.', '갈등 해결 역할에서 잘 드러납니다.'),
  ('UF-FAMILY-LOW', '가정환경 — 스스로 버팀목을 만들어 온 경험', '그런 환경에서 자기만의 자리를 만들어 온 경험은 그 자체로 힘이 됩니다.', '그런 환경에서 자기만의 공간을 스스로 만들어 온 경험은 그것만으로도 힘이 됩니다.'),
  ('UF-PEER-HIGH', NULL, '사람들 속에서 자기 자리를 찾아 온 경험입니다.', '사람들 속에서 내 역할을 찾아 온 경험입니다.'),
  ('UF-SIBLING-LOW', NULL, '협업이 필요한 자리에서는', '함께 일할 때는')
) AS v(id, title, old, new)
WHERE m.id = v.id;

-- 같은 모듈의 두 번째 표현 (VALUES 한 줄당 한 번만 바뀌므로 따로)
UPDATE public.hit_report_modules SET content = replace(content, '어디서든 좋으니 여기만 아니면 된다', '어디든 좋으니 여기만 아니면 된다'), updated_at = now() WHERE id = 'CM-PUSH-DOMINANT';
UPDATE public.hit_report_modules SET content = replace(content, '"무엇을 향해 가는가"를 명확히 정의한 뒤', '"어디로 가고 싶은가"를 분명히 정한 뒤'), updated_at = now() WHERE id = 'CM-PUSH-DOMINANT';
UPDATE public.hit_report_modules SET content = replace(content, '타이밍 관점에서 전략적으로 판단하는 것이 유리합니다', '시기를 따져 보고 정하는 것이 좋습니다'), updated_at = now() WHERE id = 'CM-BALANCED';
UPDATE public.hit_report_modules SET content = replace(content, ' — 가르치면 내 것이 됩니다.', '. 가르쳐 보면 확실히 내 것이 됩니다.'), updated_at = now() WHERE id = 'CORE-AGILE-A';
UPDATE public.hit_report_modules SET content = replace(replace(content, '큰 무기가 됩니다.', '큰 강점이 됩니다.'), ' — 임원용 한 줄, 실무자용 세 줄처럼요.', '. 임원에게는 한 줄로, 실무자에게는 세 줄로 말해 보는 식입니다.'), updated_at = now() WHERE id = 'CORE-COMM-A';
UPDATE public.hit_report_modules SET content = replace(content, '지금 자리에서의 변화가 답인지', '지금 회사 안에서 바꿔 보는 것이 답인지'), updated_at = now() WHERE id = 'CR-D';
UPDATE public.hit_report_modules SET content = replace(content, '다음 자리에서 그 전문성이', '다음 회사에서 그 전문성이'), updated_at = now() WHERE id = 'CTYPE-STRATEGIC';
UPDATE public.hit_report_modules SET content = replace(content, '주도성의 힘이 독단이 아닌 리더십으로 전환됩니다', '주도성이 고집이 아니라 리더십으로 보이게 됩니다'), updated_at = now() WHERE id = 'DISC-D';
UPDATE public.hit_report_modules SET content = replace(replace(content, '프레젠테이션과 설득의 장면에서 빛납니다', '발표와 설득이 필요한 순간에 돋보입니다'), '브레인스토밍의 불꽃을 튀기는 것은', '아이디어를 쏟아내는 것은'), updated_at = now() WHERE id = 'DISC-I';
UPDATE public.hit_report_modules SET content = replace(content, '경력 단절/실패를', '경력 단절이나 실패를'), updated_at = now() WHERE id = 'FR-NARRATIVE-POS';
UPDATE public.hit_report_modules SET content = replace(content, '최대 가치를 창출합니다', '가장 큰 힘을 냅니다'), updated_at = now() WHERE id = 'SP-STRATEGIC';
UPDATE public.hit_report_modules SET content = replace(content, '진정한 조화입니다', '제대로 된 조화입니다'), updated_at = now() WHERE id = 'SP-HARMONY';

-- ── 3) 문항 표현 (뜻·역채점 그대로) ────────────────────────────────
UPDATE public.hit_questions q SET question_text = v.t
FROM (VALUES
  ('apc_i01', '업무 데이터를 분석해 쓸 만한 시사점을 찾는 데 자신 있다.'),
  ('apd_i01', '사업 데이터를 분석해 전략에 쓸 시사점을 찾을 수 있다.'),
  ('chd_op2_02', '다른 산업의 경영 사례에서 배울 점을 찾는다.'),
  ('riasec_015', '업계 리포트나 연구 논문을 읽으며 새로 알게 되는 것이 즐겁다.'),
  ('b_sr05', '부족한 역량이 무엇인지 알고, 채울 계획이 있다.'),
  ('c_ac10', '지금 직무에서 낸 성과가 다른 산업에서도 인정받을 것 같다.'),
  ('c_mf02', '내 경력 수준에 맞는 일자리가 지금 채용 시장에 있다.'),
  ('c_mf04', '내 경력이 가고 싶은 회사에서 매력적으로 보일 것 같다.'),
  ('c_pl01', '새로운 일에 도전하며 더 성장하고 싶다.'),
  ('c_re08', '지금 회사에서 만든 인맥이 이직 후에도 도움이 될 것 같다.'),
  ('c_re10', '업계에서 내 평판이 좋은 편이다.'),
  ('c_st03', '지금 내 역량과 목표 직무 사이에 무엇이 부족한지 알고 있다.'),
  ('c_st04', '부족한 부분을 채우기 위한 구체적인 학습 계획이 있다.'),
  ('c_st12', '부족한 역량을 채우는 데 드는 시간과 비용을 현실적으로 가늠할 수 있다.'),
  ('d_is01', '"나는 OO 전문가다"라는 생각이 매우 강하다.'),
  ('d_is04', '직무가 바뀌면 내가 어떤 사람인지 혼란스러울 것 같다.'),
  ('d_pb08', '이직할 때 지금 회사 이름이나 내 이름값이 유리하게 작용할 것 같다.'),
  ('d_wt08', '나를 모르는 사람에게도 내 생각과 일을 알릴 수 있는 채널(글·강연·SNS 등)이 있다.'),
  ('e_pt03', '직업이나 직함 없이도 나를 소개할 수 있다.'),
  ('e_re04', '내 경험을 필요로 하는 곳이 있을 것 같다.'),
  ('e_sc04', '봉사활동을 하며 삶의 의미를 찾을 수 있을 것 같다.'),
  ('f_cr03', '예전 직무의 전문성을 다시 되찾는 것이 현실적으로 가능하다고 본다.'),
  ('f_fs05', '예전 직업으로 나를 설명하던 방식을 완전히 내려놓을 준비가 되었다.'),
  ('f_ga06', '개인 블로그, SNS, 포트폴리오 등으로 내 활동을 꾸준히 보여 왔다.'),
  ('f_hc02', '육아나 간병을 하면서 인내심과 여러 일을 동시에 처리하는 능력이 늘었다.'),
  ('f_hc03', '집안 살림이나 가정 운영에서 계획·정리·예산 관리 능력을 발휘했다.'),
  ('f_hc04', '자원봉사나 지역 활동 등으로 사람들과 어울리는 감각을 유지했다.'),
  ('f_jv01', '예전에 하던 직무가 지금도 채용 시장에 있다.'),
  ('f_jv07', '예전 직장이나 비슷한 회사가 지금도 잘 운영되고 있다.'),
  ('f_sn07', '경력 단절로 ''나는 어떤 사람인가''에 대한 생각이 크게 흔들렸다.'),
  ('ready_md_005', '의료인이 되려는 이유를 내 말로 설명할 수 있다.'),
  ('comp_ux_004', '사용자가 서비스를 쓰는 과정을 단계별로 그린 지도(사용자 여정 지도)를 만들어 본 적이 있다.')
) AS v(id, t)
WHERE q.id = v.id;

-- ── 4) 64유형 개요 표제·표현 ───────────────────────────────────────
UPDATE public.hit_hero_types SET profile_overview = replace(replace(replace(profile_overview,
  '빛나는 순간:', '강점이 드러나는 일:'), '경계할 그림자:', '주의할 점:'), '에서 빛납니다.', '에서 강점이 드러납니다.');
UPDATE public.hit_hero_types SET character_label = '맡은 일을 끝까지 지키는 헌신가',
  profile_overview = replace(profile_overview, '자리에서 빛을 내는 헌신가입니다.', '맡은 일을 끝까지 지키는 헌신가입니다.')
WHERE type_code = 'S-ISFJ';
