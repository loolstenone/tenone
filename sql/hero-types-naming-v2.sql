-- ────────────────────────────────────────────────────────────────
-- HeRo 64 유형 네이밍 v2 (2026-04-23)
--
-- 변경:
--   1. character_name: 영화 IP 참조 제거, "The + 현대 직업 원형" 형식 통일
--   2. character_label: [MBTI 특성] + [DISC 방향성] 구조로 전환
--      (기존 C그룹 "신중한 ~" 반복 문제 해결)
--   3. 부정어 제거 (Melancholy/Timid/Stubborn 등)
--
-- DISC 동사화:
--   D = Lead   (앞에서 이끈다)
--   I = Influence (옆에서 영향을 준다)
--   S = Sustain (뒤에서 받친다)
--   C = Check  (위에서 검증한다)
-- ────────────────────────────────────────────────────────────────

-- D 그룹 (Lead)
UPDATE hit_hero_types SET character_name='The Movement Leader',       character_label='비전으로 사람을 이끄는 선도자'        WHERE type_code='D-ENFJ';
UPDATE hit_hero_types SET character_name='The Founder Evangelist',    character_label='열정으로 새 판을 여는 개척자'          WHERE type_code='D-ENFP';
UPDATE hit_hero_types SET character_name='The Global Executive',      character_label='큰 그림을 짜는 경영 전략가'            WHERE type_code='D-ENTJ';
UPDATE hit_hero_types SET character_name='The Disruption Architect',  character_label='낡은 틀을 부수는 혁신 설계자'          WHERE type_code='D-ENTP';
UPDATE hit_hero_types SET character_name='The Team Captain',          character_label='사람과 성과를 함께 책임지는 주장'      WHERE type_code='D-ESFJ';
UPDATE hit_hero_types SET character_name='The Frontline Driver',      character_label='현장에서 분위기를 일으키는 돌파자'     WHERE type_code='D-ESFP';
UPDATE hit_hero_types SET character_name='The Executive Director',    character_label='체계로 조직을 몰아가는 총괄자'         WHERE type_code='D-ESTJ';
UPDATE hit_hero_types SET character_name='The Crisis Operative',      character_label='실전에서 길을 여는 행동가'             WHERE type_code='D-ESTP';
UPDATE hit_hero_types SET character_name='The Cause Architect',       character_label='신념으로 흐름을 설계하는 지도자'       WHERE type_code='D-INFJ';
UPDATE hit_hero_types SET character_name='The Silent Advocate',       character_label='조용히 신념을 관철하는 옹호자'         WHERE type_code='D-INFP';
UPDATE hit_hero_types SET character_name='The Systems Founder',       character_label='미래를 독립 설계하는 창립자'           WHERE type_code='D-INTJ';
UPDATE hit_hero_types SET character_name='The R&D Director',          character_label='깊은 사유로 판을 바꾸는 연구 총괄'     WHERE type_code='D-INTP';
UPDATE hit_hero_types SET character_name='The Mission Guardian',      character_label='묵묵한 헌신으로 지키는 책임자'         WHERE type_code='D-ISFJ';
UPDATE hit_hero_types SET character_name='The Independent Creator',   character_label='자기 길로 작품을 세우는 창작자'        WHERE type_code='D-ISFP';
UPDATE hit_hero_types SET character_name='The Principal Officer',     character_label='원칙으로 밀어붙이는 실행자'            WHERE type_code='D-ISTJ';
UPDATE hit_hero_types SET character_name='The Lead Engineer',         character_label='결정적 순간의 해결 엔지니어'           WHERE type_code='D-ISTP';

-- I 그룹 (Influence)
UPDATE hit_hero_types SET character_name='The People Coach',          character_label='성장을 이끄는 관계 전문가'             WHERE type_code='I-ENFJ';
UPDATE hit_hero_types SET character_name='The Brand Storyteller',     character_label='마음을 여는 이야기꾼'                  WHERE type_code='I-ENFP';
UPDATE hit_hero_types SET character_name='The Partnership Lead',      character_label='관계로 전략을 완성하는 기획자'         WHERE type_code='I-ENTJ';
UPDATE hit_hero_types SET character_name='The Idea Broadcaster',      character_label='토론으로 생각을 여는 크리에이터'       WHERE type_code='I-ENTP';
UPDATE hit_hero_types SET character_name='The Community Host',        character_label='사람을 연결하는 분위기 조율자'         WHERE type_code='I-ESFJ';
UPDATE hit_hero_types SET character_name='The Stage Performer',       character_label='존재로 에너지를 주는 퍼포머'           WHERE type_code='I-ESFP';
UPDATE hit_hero_types SET character_name='The Sales Commander',       character_label='숫자와 사람을 함께 움직이는 영업 리더' WHERE type_code='I-ESTJ';
UPDATE hit_hero_types SET character_name='The Field Closer',          character_label='현장에서 계약을 닫는 실전가'           WHERE type_code='I-ESTP';
UPDATE hit_hero_types SET character_name='The Quiet Counselor',       character_label='깊은 통찰로 곁을 지키는 상담가'        WHERE type_code='I-INFJ';
UPDATE hit_hero_types SET character_name='The Empathic Writer',       character_label='말하지 못한 것을 대신 쓰는 작가'       WHERE type_code='I-INFP';
UPDATE hit_hero_types SET character_name='The Insight Strategist',    character_label='관계 속에서 통찰을 뽑는 기획자'        WHERE type_code='I-INTJ';
UPDATE hit_hero_types SET character_name='The Curious Creator',       character_label='호기심을 콘텐츠로 바꾸는 창작자'       WHERE type_code='I-INTP';
UPDATE hit_hero_types SET character_name='The Warm Collaborator',     character_label='묵묵히 팀을 데우는 조력자'             WHERE type_code='I-ISFJ';
UPDATE hit_hero_types SET character_name='The Lyric Designer',        character_label='자기 색으로 공간을 칠하는 디자이너'    WHERE type_code='I-ISFP';
UPDATE hit_hero_types SET character_name='The Trusted Chronicler',    character_label='관계를 기록으로 남기는 연결자'         WHERE type_code='I-ISTJ';
UPDATE hit_hero_types SET character_name='The Hands-on Maker',        character_label='손으로 연결을 만드는 실용가'           WHERE type_code='I-ISTP';

-- S 그룹 (Sustain)
UPDATE hit_hero_types SET character_name='The Growth Partner',        character_label='꾸준히 사람을 키우는 파트너'           WHERE type_code='S-ENFJ';
UPDATE hit_hero_types SET character_name='The Warm Companion',        character_label='관계를 피어나게 하는 동반자'           WHERE type_code='S-ENFP';
UPDATE hit_hero_types SET character_name='The Steady Director',       character_label='꾸준함으로 조직을 키우는 경영인'       WHERE type_code='S-ENTJ';
UPDATE hit_hero_types SET character_name='The Balanced Innovator',    character_label='지키며 바꾸는 균형 혁신가'             WHERE type_code='S-ENTP';
UPDATE hit_hero_types SET character_name='The Care Manager',          character_label='세심히 챙기는 돌봄 책임자'             WHERE type_code='S-ESFJ';
UPDATE hit_hero_types SET character_name='The Sunshine Colleague',    character_label='팀을 부드럽게 만드는 동료'             WHERE type_code='S-ESFP';
UPDATE hit_hero_types SET character_name='The Operations Lead',       character_label='안정적으로 운영을 지키는 책임자'       WHERE type_code='S-ESTJ';
UPDATE hit_hero_types SET character_name='The Field Supporter',       character_label='현장에서 꾸준히 받쳐주는 실전가'       WHERE type_code='S-ESTP';
UPDATE hit_hero_types SET character_name='The Peaceful Counselor',    character_label='조용한 공감으로 받치는 상담가'         WHERE type_code='S-INFJ';
UPDATE hit_hero_types SET character_name='The Gentle Archivist',      character_label='소중한 것을 지키는 기록자'             WHERE type_code='S-INFP';
UPDATE hit_hero_types SET character_name='The Knowledge Keeper',      character_label='긴 호흡으로 쌓는 지식 보유자'          WHERE type_code='S-INTJ';
UPDATE hit_hero_types SET character_name='The Quiet Analyst',         character_label='꾸준히 진리에 다가가는 분석가'         WHERE type_code='S-INTP';
UPDATE hit_hero_types SET character_name='The Devoted Caregiver',     character_label='자리에서 빛을 내는 헌신가'             WHERE type_code='S-ISFJ';
UPDATE hit_hero_types SET character_name='The Quiet Craftsperson',    character_label='묵묵히 완성하는 장인'                  WHERE type_code='S-ISFP';
UPDATE hit_hero_types SET character_name='The Reliable Administrator',character_label='시간이 증명하는 신뢰 관리자'           WHERE type_code='S-ISTJ';
UPDATE hit_hero_types SET character_name='The Steady Technician',     character_label='꾸준한 손끝의 기술자'                  WHERE type_code='S-ISTP';

-- C 그룹 (Check)
UPDATE hit_hero_types SET character_name='The Principled Mentor',     character_label='깊이로 사람을 읽는 멘토'               WHERE type_code='C-ENFJ';
UPDATE hit_hero_types SET character_name='The Meticulous Explorer',   character_label='완성도를 꿈꾸는 탐험가'                WHERE type_code='C-ENFP';
UPDATE hit_hero_types SET character_name='The Precision Strategist',  character_label='숫자로 증명하는 경영 전략가'           WHERE type_code='C-ENTJ';
UPDATE hit_hero_types SET character_name='The Critical Innovator',    character_label='허점을 찾는 날카로운 혁신가'           WHERE type_code='C-ENTP';
UPDATE hit_hero_types SET character_name='The Quality Coordinator',   character_label='기준과 사람을 함께 지키는 조율자'      WHERE type_code='C-ESFJ';
UPDATE hit_hero_types SET character_name='The Attentive Producer',    character_label='디테일로 감동을 만드는 연출자'         WHERE type_code='C-ESFP';
UPDATE hit_hero_types SET character_name='The Audit Director',        character_label='기준으로 조직을 지키는 감사 책임자'    WHERE type_code='C-ESTJ';
UPDATE hit_hero_types SET character_name='The Precision Operator',    character_label='현장에서 정확히 맞추는 실행가'         WHERE type_code='C-ESTP';
UPDATE hit_hero_types SET character_name='The Insight Researcher',    character_label='내면을 깊이 읽는 연구자'               WHERE type_code='C-INFJ';
UPDATE hit_hero_types SET character_name='The Principled Idealist',   character_label='작은 것까지 지키는 이상가'             WHERE type_code='C-INFP';
UPDATE hit_hero_types SET character_name='The Precision Architect',   character_label='철저히 설계하는 전략가'                WHERE type_code='C-INTJ';
UPDATE hit_hero_types SET character_name='The Logic Analyst',         character_label='빈틈없는 논리로 답을 찾는 분석가'      WHERE type_code='C-INTP';
UPDATE hit_hero_types SET character_name='The Methodical Caregiver',  character_label='디테일로 곁을 지키는 지원가'           WHERE type_code='C-ISFJ';
UPDATE hit_hero_types SET character_name='The Delicate Artisan',      character_label='섬세한 손길의 창작자'                  WHERE type_code='C-ISFP';
UPDATE hit_hero_types SET character_name='The Rigorous Specialist',   character_label='원칙을 지키는 꼼꼼한 실무자'           WHERE type_code='C-ISTJ';
UPDATE hit_hero_types SET character_name='The Analytic Engineer',     character_label='관찰로 문제를 푸는 엔지니어'           WHERE type_code='C-ISTP';
