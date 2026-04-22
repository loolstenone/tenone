-- HIT A 가상 더미 데이터 5건
-- member_id = NULL (비회원도 열람 가능, 가입 시 자동 연결 가능)
-- 2026-04-23 확정 모델 기준 (UF + MBTI + DISC + 인성 + 적성 → S-Power + 64유형)

INSERT INTO hit_a_results (
  id, session_id, member_id, tenant_id,
  mbti_type, mbti_e_score, mbti_s_score, mbti_t_score, mbti_j_score,
  disc_primary, disc_subtype, disc_d_score, disc_i_score, disc_s_score, disc_c_score,
  base_summary, base_scores,
  type_code, type_name_ko, type_nickname, type_category, type_traits, type_careers,
  ai_narrative, s_power_scores,
  uf_sibling, uf_parent, uf_family, uf_peer, uf_self, uf_temperament, uf_economic, uf_trauma, uf_cultural, uf_summary,
  ch_integrity, ch_relational, ch_emotional, ch_ethics, ch_growth,
  ap_top3_code, ap_scores,
  modules_used,
  created_at
) VALUES

-- ───────── 1. D-INTJ · Iron Innovator (전략적 리더) ─────────
(
  'aaaaaaaa-0001-4a01-a001-000000000001', NULL, NULL, 'tenone',
  'INTJ', 28, 22, 78, 82,
  'D', 'DC', 74, 38, 42, 66,
  'DC 배합의 D형. 목표 지향성이 강하며 논리적 분석으로 방향을 설계합니다. 관계보다 결과에 먼저 반응하는 편으로, 신뢰하는 동료 앞에서는 따뜻함이 드러납니다.',
  '{"D":74,"I":38,"S":42,"C":66}'::jsonb,
  'D-INTJ', '전략적인 목표 달성가', 'Iron Innovator', '분석형',
  '복잡한 목표를 효율적으로 계획하고 단호하게 실행하여 성과를 창출합니다',
  '전략 컨설턴트, 사업개발, CTO, 스타트업 공동 창업자',
  'D유형의 목표 지향성과 INTJ의 전략적 비전이 결합된 유형입니다. 거대한 그림을 그리고 실행까지 밀어붙이는 전략가형 리더. 감정보다 논리, 관습보다 효율을 우선하며, 자신이 설계한 시스템으로 세상을 바꾸려 합니다.
이 유형의 에너지가 긍정적으로 발현되면 토니 스타크가 됩니다. 천재적 두뇌와 결단력으로 문제를 해결하고, 자기 비전을 현실로 만듭니다. 같은 에너지가 극단으로 가면 렉스 루터가 됩니다. 지적 우월감이 타인을 도구화하고, 통제 욕구가 관계를 파괴합니다.
능력은 같습니다. 그것을 누구를 위해 쓰느냐가 영웅과 악당을 나눕니다.',
  '{"strategic":88,"execution":82,"creativity":72,"interpersonal":48,"analytical":90,"harmony":42,"breakthrough":80,"guard":68}'::jsonb,
  3, 4, 4, 3, 5, 4, 3, 2, 4,
  '독립적 기질(5)과 안정적 가족 환경(4)이 결합되어 자기 확신과 목표 집중력이 두드러집니다. 또래 관계(3)보다는 내면 탐색을 선호하며, 이것이 전략적 깊이의 바탕입니다.',
  78, 55, 48, 75, 82,
  'IER',
  '{"R":55,"I":88,"A":62,"S":42,"E":76,"C":70}'::jsonb,
  ARRAY['DISC-D','DISC-DC','MBTI-I-STRONG','MBTI-N-STRONG','MBTI-T-STRONG','MBTI-J-STRONG','CROSS-D-T','CROSS-D-J','SP-STRATEGIC','SP-ANALYTIC','SP-BREAK','SP-HARMONY-GROWTH','COMM-D'],
  now() - interval '2 days'
),

-- ───────── 2. I-ENFP · Trailblazer Bunny-Cop (낙천적 개척자) ─────────
(
  'aaaaaaaa-0002-4a01-a002-000000000002', NULL, NULL, 'tenone',
  'ENFP', 82, 28, 30, 25,
  'I', 'ID', 52, 82, 56, 34,
  'ID 배합의 I형. 사람을 통해 에너지를 얻고 가능성을 좇는 낙천가. 스피드와 아이디어로 조직에 활력을 불어넣으며, 지루한 디테일보다는 큰 그림을 봅니다.',
  '{"D":52,"I":82,"S":56,"C":34}'::jsonb,
  'I-ENFP', '영감을 주는 낙천가', 'Trailblazer Bunny-Cop', '사교형',
  '사람과 가능성을 믿고 새로운 길을 먼저 여는 개척자',
  '브랜드 마케터, 창업가, 크리에이터, 커뮤니티 빌더, 코치',
  'I유형의 사교성과 ENFP의 직관적 비전이 결합된 유형입니다. 사람에 대한 호기심과 가능성에 대한 믿음으로 움직이며, "다르게 할 수 있다"를 증명하는 개척자.
긍정적으로 발현되면 리더십에 영감을 불어넣는 동료가 됩니다. 어두운 자리에서 에너지를 살리고, 멈춘 프로젝트에 다시 불을 붙입니다. 극단으로 가면 산만한 몽상가가 되기 쉽습니다. 시작은 많고 마무리는 적으며, 감정이 앞서 현실을 놓칩니다.
방향을 잡아줄 동료와 마감을 관리해줄 시스템이 있을 때 이 유형은 가장 빛납니다.',
  '{"strategic":62,"execution":48,"creativity":92,"interpersonal":90,"analytical":50,"harmony":78,"breakthrough":70,"guard":38}'::jsonb,
  4, 5, 4, 5, 4, 5, 3, 2, 3,
  '따뜻한 부모 관계(5)와 활발한 또래 관계(5)가 만들어낸 사회적 자신감. 감정 표현이 자연스럽고 타인과의 연결에서 에너지를 얻는 패턴이 뚜렷합니다.',
  72, 85, 80, 68, 78,
  'AES',
  '{"R":30,"I":58,"A":90,"S":82,"E":75,"C":35}'::jsonb,
  ARRAY['DISC-I','DISC-ID','MBTI-E-STRONG','MBTI-N-STRONG','MBTI-F-STRONG','MBTI-P-STRONG','CROSS-I-E','SP-CREATE','SP-CONNECT','SP-HARMONY','SP-EXECUTE-GROWTH','SP-GUARD-GROWTH','COMM-I'],
  now() - interval '4 days'
),

-- ───────── 3. S-ISFJ · Memory Matriarch (헌신적 지원가) ─────────
(
  'aaaaaaaa-0003-4a01-a003-000000000003', NULL, NULL, 'tenone',
  'ISFJ', 30, 78, 32, 72,
  'S', 'SC', 32, 45, 78, 68,
  'SC 배합의 S형. 조화로운 관계와 안정적인 질서를 가장 소중히 여깁니다. 조용하지만 강한 책임감이 있으며, 세부와 맥락을 함께 읽는 섬세함이 강점입니다.',
  '{"D":32,"I":45,"S":78,"C":68}'::jsonb,
  'S-ISFJ', '헌신적인 지원가', 'Memory Matriarch', '지원형',
  '공동체를 돌보고 세부를 챙기며 조용히 조직의 안정을 떠받칩니다',
  'HR, CS 리더, 교사, 간호사, 사서, 회계·감사, 고객 성공',
  'S유형의 안정 지향과 ISFJ의 돌봄 감수성이 결합된 유형입니다. 눈에 띄지 않지만 없으면 바로 티가 나는, 조직의 기둥.
긍정적으로 발현되면 관계의 앵커가 됩니다. 갈등 상황에서 감정을 잘 읽고 중재하며, 디테일에 대한 집요함이 품질을 지켜냅니다. 극단으로 가면 변화 거부와 과도한 자기 희생이 됩니다. "내가 참으면 된다"가 쌓이다 어느 날 갑자기 무너지는 패턴.
"아니오"를 말할 용기와 자기 돌봄을 배울 때 이 유형은 진짜 힘을 발휘합니다.',
  '{"strategic":48,"execution":78,"creativity":55,"interpersonal":82,"analytical":72,"harmony":92,"breakthrough":40,"guard":88}'::jsonb,
  5, 5, 5, 4, 3, 3, 4, 2, 5,
  '형제·부모·가족 모두 안정적이고 따뜻한 환경(각 5)에서 자란 전형적인 돌봄 수혜자. 이 안정감이 타인을 돌보는 감각의 원천이 되었습니다.',
  88, 90, 72, 85, 65,
  'SCE',
  '{"R":42,"I":55,"A":60,"S":90,"E":52,"C":82}'::jsonb,
  ARRAY['DISC-S','DISC-SC','MBTI-I-STRONG','MBTI-S-STRONG','MBTI-F-STRONG','MBTI-J-STRONG','CROSS-S-J','SP-HARMONY','SP-GUARD','SP-EXECUTE','SP-BREAK-GROWTH','SP-STRATEGIC-GROWTH','COMM-S'],
  now() - interval '6 days'
),

-- ───────── 4. C-INTP · Q-Lab Engineer (논리 분석가) ─────────
(
  'aaaaaaaa-0004-4a01-a004-000000000004', NULL, NULL, 'tenone',
  'INTP', 25, 30, 82, 30,
  'C', 'CD', 58, 32, 40, 85,
  'CD 배합의 C형. 감정보다 논리, 속도보다 정확도를 우선합니다. 혼자만의 사고 공간에서 해법을 끝까지 파고드는 기질이 두드러집니다.',
  '{"D":58,"I":32,"S":40,"C":85}'::jsonb,
  'C-INTP', '철두철미한 논리 분석가', 'Q-Lab Engineer', '분석형',
  '본질을 끝까지 파고들어 모순 없는 설계를 만들어냅니다',
  'R&D 엔지니어, 데이터 사이언티스트, 퀀트, 법률 분석, 리서처',
  'C유형의 정확성과 INTP의 이론적 호기심이 결합된 유형입니다. "이게 왜 이렇게 되어야 하지?"를 끝까지 묻는 탐구자.
긍정적으로 발현되면 조직의 모순을 발견하고 정리하는 시스템 빌더가 됩니다. 남들이 놓치는 허점을 잡아내고, 원리적으로 견고한 해법을 설계합니다. 극단으로 가면 분석 마비에 빠집니다. 결정을 미루고, 완벽이 아니면 공개하지 않으며, 타인의 감정을 데이터 결함으로만 봅니다.
"충분히 좋은 것은 완벽의 적이 아니라 친구"임을 받아들일 때 이 유형은 세상에 기여하기 시작합니다.',
  '{"strategic":78,"execution":58,"creativity":82,"interpersonal":42,"analytical":92,"harmony":48,"breakthrough":62,"guard":85}'::jsonb,
  2, 3, 3, 2, 5, 5, 3, 3, 3,
  '독립적 기질(5)과 강한 자기 인식(5)이 두드러집니다. 또래 관계(2)보다는 내면 탐구를 선호했고, 이 경험이 깊이 있는 분석 역량의 토대가 되었습니다.',
  85, 42, 38, 78, 72,
  'IRA',
  '{"R":65,"I":92,"A":78,"S":32,"E":55,"C":82}'::jsonb,
  ARRAY['DISC-C','DISC-CD','MBTI-I-STRONG','MBTI-N-STRONG','MBTI-T-STRONG','MBTI-P-STRONG','CROSS-C-N','SP-ANALYTIC','SP-GUARD','SP-CREATE','SP-CONNECT-GROWTH','SP-EXECUTE-GROWTH','COMM-C'],
  now() - interval '8 days'
),

-- ───────── 5. D-ESTJ · Academy Marshal (조직 관리자) ─────────
(
  'aaaaaaaa-0005-4a01-a005-000000000005', NULL, NULL, 'tenone',
  'ESTJ', 72, 75, 68, 82,
  'D', 'DI', 78, 62, 48, 55,
  'DI 배합의 D형. 원칙과 결과를 모두 챙기는 전통적 리더. 질서·규율에 대한 감각이 뛰어나고, 조직이 제대로 돌아가는지 항상 살핍니다.',
  '{"D":78,"I":62,"S":48,"C":55}'::jsonb,
  'D-ESTJ', '강력한 조직 관리자', 'Academy Marshal', '조직형',
  '명확한 기준과 책임으로 조직을 움직여 성과를 만듭니다',
  '운영 총괄, COO, 프로덕트 오너, 영업 본부장, 공공기관 관리자',
  'D유형의 주도성과 ESTJ의 규율이 결합된 유형입니다. "해야 할 일을 해내는 사람"의 전형.
긍정적으로 발현되면 일정·예산·품질을 모두 맞추는 신뢰받는 관리자가 됩니다. 팀원의 경력과 조직의 목표를 동시에 지킬 줄 알며, 위기 상황에서도 흔들림이 적습니다. 극단으로 가면 경직됩니다. 규칙이 목적이 되고, 이견을 반항으로 읽으며, 숫자에 가려 사람을 잃습니다.
유연성과 공감이 추가될 때 이 유형은 존경받는 리더로 자랍니다.',
  '{"strategic":72,"execution":90,"creativity":48,"interpersonal":68,"analytical":75,"harmony":62,"breakthrough":72,"guard":85}'::jsonb,
  4, 4, 5, 4, 4, 4, 4, 3, 4,
  '안정적 가정(5)에서 책임과 질서를 일찍 학습했습니다. 부모·또래 관계가 고르게 양호해 리더십을 자연스럽게 익혔고, 기대에 부응하는 경험이 누적된 패턴.',
  82, 68, 58, 80, 72,
  'ECS',
  '{"R":72,"I":60,"A":38,"S":65,"E":85,"C":78}'::jsonb,
  ARRAY['DISC-D','DISC-DI','MBTI-E-STRONG','MBTI-S-STRONG','MBTI-T-STRONG','MBTI-J-STRONG','CROSS-D-J','CROSS-S-J','SP-EXECUTE','SP-GUARD','SP-STRATEGIC','SP-CREATE-GROWTH','SP-HARMONY-GROWTH','COMM-D'],
  now() - interval '10 days'
);

-- 확인
SELECT id, type_code, type_nickname, array_length(modules_used, 1) AS modules FROM hit_a_results ORDER BY created_at DESC;
