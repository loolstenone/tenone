import type { LikertQuestion } from './personality-questions';

/**
 * HIT F — 단절·재도전 검사 (경력단절·인생 재도전자)
 * 원본 152문항 · 7점 리커트
 *
 * 모듈1: 공백 역량 발굴 (32문항)
 *   - disruption_context (단절 맥락) — 8문항
 *   - hidden_competency (숨겨진 역량) — 12문항
 *   - gap_activities (공백 기간 활동) — 12문항
 *
 * 모듈2: 경력 유효성 진단 (36문항)
 *   - job_viability (직무 유효성) — 12문항
 *   - skill_currency (스킬 현재성) — 12문항
 *   - market_reentry (시장 재진입) — 12문항
 *
 * 모듈3: 심리적 회복력 (28문항)
 *   - self_narrative (자기 서사) — 10문항
 *   - self_esteem (자존감) — 8문항
 *   - retry_willingness (재도전 의지) — 10문항
 *
 * 모듈4: 재도전 방향 결정 (32문항)
 *   - career_restoration (경력 복원) — 10문항
 *   - career_pivot (경력 전환) — 12문항
 *   - fresh_start (새 출발) — 10문항
 *
 * 모듈5: 재진입 준비도 (24문항)
 *   - skill_update (스킬 업데이트) — 6문항
 *   - network_status (네트워크 상태) — 6문항
 *   - self_presentation (자기 표현) — 6문항
 *   - field_language (현장 언어) — 6문항
 */

// ── 모듈1: 공백 역량 발굴 (32문항) ──────────────────────────────────

export const latentCapabilityQuestions: LikertQuestion[] = [
  // === disruption_context (단절 맥락) — 8문항 ===
  { id: 'hit_f_001', text: '경력 공백의 주된 이유를 명확하게 설명할 수 있다.', subscale: 'disruption_context' },
  { id: 'hit_f_002', text: '경력 단절은 나의 선택이었다(또는 불가피한 상황이었다).', subscale: 'disruption_context' },
  { id: 'hit_f_003', text: '공백 기간 동안에도 나름의 성장을 했다고 생각한다.', subscale: 'disruption_context' },
  { id: 'hit_f_004', text: '단절 기간이 예상보다 길어졌다.', subscale: 'disruption_context' },
  { id: 'hit_f_005', text: '단절의 원인이 해소되었거나 해소될 전망이 있다.', subscale: 'disruption_context' },
  { id: 'hit_f_006', text: '단절 기간 동안 직업 세계와 완전히 단절되었다.', subscale: 'disruption_context', reverse: true },
  { id: 'hit_f_007', text: '경력 공백에 대해 부끄러움이나 죄책감을 느낀다.', subscale: 'disruption_context', reverse: true },
  { id: 'hit_f_008', text: '단절 기간에도 업계 동향을 파악하려고 노력했다.', subscale: 'disruption_context' },

  // === hidden_competency (숨겨진 역량) — 12문항 ===
  { id: 'hit_f_009', text: '육아/간병 경험을 통해 인내심과 위기관리 능력이 강해졌다.', subscale: 'hidden_competency' },
  { id: 'hit_f_010', text: '한정된 자원(시간, 돈, 에너지)을 효율적으로 관리하는 법을 배웠다.', subscale: 'hidden_competency' },
  { id: 'hit_f_011', text: '여러 일을 동시에 처리하는 멀티태스킹 능력이 향상되었다.', subscale: 'hidden_competency' },
  { id: 'hit_f_012', text: '타인의 감정을 읽고 대응하는 능력이 성장했다.', subscale: 'hidden_competency' },
  { id: 'hit_f_013', text: '스트레스 상황에서도 평정을 유지하는 법을 체득했다.', subscale: 'hidden_competency' },
  { id: 'hit_f_014', text: '문제 해결 능력이 직장 밖 경험을 통해 더 강해졌다.', subscale: 'hidden_competency' },
  { id: 'hit_f_015', text: '의사결정을 혼자 내려야 하는 상황이 많아 결단력이 키워졌다.', subscale: 'hidden_competency' },
  { id: 'hit_f_016', text: '계획대로 되지 않을 때 유연하게 대처하는 법을 배웠다.', subscale: 'hidden_competency' },
  { id: 'hit_f_017', text: '다양한 사람(의사, 교사, 행정기관 등)과 소통하는 경험이 늘었다.', subscale: 'hidden_competency' },
  { id: 'hit_f_018', text: '단절 기간 동안 자기 자신에 대해 더 깊이 이해하게 되었다.', subscale: 'hidden_competency' },
  { id: 'hit_f_019', text: '새로운 분야(IT, 온라인 마켓, 부동산 등)를 독학한 경험이 있다.', subscale: 'hidden_competency' },
  { id: 'hit_f_020', text: '직장 밖에서 쌓은 역량을 이력서에 어떻게 쓸지 모르겠다.', subscale: 'hidden_competency', reverse: true },

  // === gap_activities (공백 기간 활동) — 12문항 ===
  { id: 'hit_f_021', text: '공백 기간 동안 자격증, 수료증 등을 취득한 적이 있다.', subscale: 'gap_activities' },
  { id: 'hit_f_022', text: '봉사활동이나 커뮤니티 활동에 참여한 경험이 있다.', subscale: 'gap_activities' },
  { id: 'hit_f_023', text: '프리랜서, 부업, 아르바이트 등 수입 활동을 한 적이 있다.', subscale: 'gap_activities' },
  { id: 'hit_f_024', text: '온라인 강좌나 교육 프로그램을 수강한 적이 있다.', subscale: 'gap_activities' },
  { id: 'hit_f_025', text: '직접 사업을 시도해본 적이 있다(규모 무관).', subscale: 'gap_activities' },
  { id: 'hit_f_026', text: '블로그, SNS, 유튜브 등 콘텐츠를 만든 경험이 있다.', subscale: 'gap_activities' },
  { id: 'hit_f_027', text: '건강 관리(운동, 식단 등)에 집중한 시간이 있었다.', subscale: 'gap_activities' },
  { id: 'hit_f_028', text: '독서, 학습 등 자기계발에 시간을 투자했다.', subscale: 'gap_activities' },
  { id: 'hit_f_029', text: '가족이나 주변 사람의 문제를 해결하는 역할을 했다.', subscale: 'gap_activities' },
  { id: 'hit_f_030', text: '공백 기간에 아무것도 하지 못했다는 느낌이 있다.', subscale: 'gap_activities', reverse: true },
  { id: 'hit_f_031', text: '단절 기간의 경험을 긍정적으로 프레이밍할 수 있다.', subscale: 'gap_activities' },
  { id: 'hit_f_032', text: '공백 기간 활동이 향후 경력에 도움이 될 것이라 생각한다.', subscale: 'gap_activities' },
];

// ── 모듈2: 경력 유효성 진단 (36문항) ───────────────────────────────

export const viabilityQuestions: LikertQuestion[] = [
  // === job_viability (직무 유효성) — 12문항 ===
  { id: 'hit_f_033', text: '단절 전 직무가 현재 시장에서도 존재한다.', subscale: 'job_viability' },
  { id: 'hit_f_034', text: '해당 직무의 채용 공고를 최근에 확인해보았다.', subscale: 'job_viability' },
  { id: 'hit_f_035', text: '단절 전 직무의 핵심 업무 내용이 크게 변하지 않았다.', subscale: 'job_viability' },
  { id: 'hit_f_036', text: '해당 분야에서 요구하는 새로운 기술/도구가 많아졌다.', subscale: 'job_viability', reverse: true },
  { id: 'hit_f_037', text: '단절 전 보유했던 자격증이나 인증이 여전히 유효하다.', subscale: 'job_viability' },
  { id: 'hit_f_038', text: '같은 직무를 다시 할 수 있는 자신감이 있다.', subscale: 'job_viability' },
  { id: 'hit_f_039', text: '공백 기간 동안 해당 분야의 변화를 어느 정도 파악하고 있다.', subscale: 'job_viability' },
  { id: 'hit_f_040', text: '단절 전 직무 경험이 3년 이상이었다.', subscale: 'job_viability' },
  { id: 'hit_f_041', text: '해당 직무의 전문 용어와 업무 프로세스를 여전히 기억한다.', subscale: 'job_viability' },
  { id: 'hit_f_042', text: '복귀한다면 교육 없이 바로 업무에 투입될 수 있다.', subscale: 'job_viability' },
  { id: 'hit_f_043', text: '해당 분야에서 나의 경력 수준(연차)이 경쟁력이 있다.', subscale: 'job_viability' },
  { id: 'hit_f_044', text: '단절 기간이 3년 이상이다.', subscale: 'job_viability', reverse: true },

  // === skill_currency (스킬 현재성) — 12문항 ===
  { id: 'hit_f_045', text: '단절 전에 사용하던 도구/소프트웨어를 여전히 다룰 수 있다.', subscale: 'skill_currency' },
  { id: 'hit_f_046', text: '해당 분야에서 새로 등장한 도구/기술을 알고 있다.', subscale: 'skill_currency' },
  { id: 'hit_f_047', text: '새 도구를 배우는 데 걸리는 시간을 현실적으로 예측할 수 있다.', subscale: 'skill_currency' },
  { id: 'hit_f_048', text: '기술 변화 속도가 빨라 따라잡기 어렵다고 느낀다.', subscale: 'skill_currency', reverse: true },
  { id: 'hit_f_049', text: '단절 기간에도 관련 기술을 부분적으로 유지했다.', subscale: 'skill_currency' },
  { id: 'hit_f_050', text: '업데이트가 필요한 스킬 목록을 구체적으로 작성할 수 있다.', subscale: 'skill_currency' },
  { id: 'hit_f_051', text: '스킬 업데이트를 위한 교육 프로그램을 찾아본 적이 있다.', subscale: 'skill_currency' },
  { id: 'hit_f_052', text: '기본기(core fundamentals)는 변하지 않아 여전히 유효하다.', subscale: 'skill_currency' },
  { id: 'hit_f_053', text: '디지털 리터러시(기본 IT 활용 능력)에 자신이 있다.', subscale: 'skill_currency' },
  { id: 'hit_f_054', text: '산업 전체가 구조적으로 변해 기존 스킬이 무의미해졌다.', subscale: 'skill_currency', reverse: true },
  { id: 'hit_f_055', text: '스킬 갭을 6개월 이내에 메울 수 있다고 생각한다.', subscale: 'skill_currency' },
  { id: 'hit_f_056', text: '현장 언어(업계 용어, 약어 등)가 낯설어졌다.', subscale: 'skill_currency', reverse: true },

  // === market_reentry (시장 재진입) — 12문항 ===
  { id: 'hit_f_057', text: '경력 단절자를 채용하는 기업이나 프로그램이 있다는 것을 안다.', subscale: 'market_reentry' },
  { id: 'hit_f_058', text: '재취업 지원 프로그램(정부, 기관)을 알아본 적이 있다.', subscale: 'market_reentry' },
  { id: 'hit_f_059', text: '단절 전 업계에 아직 연락 가능한 사람이 있다.', subscale: 'market_reentry' },
  { id: 'hit_f_060', text: '채용 시장에서 경력 단절에 대한 인식이 예전보다 나아졌다고 느낀다.', subscale: 'market_reentry' },
  { id: 'hit_f_061', text: '파트타임이나 계약직으로라도 복귀할 의지가 있다.', subscale: 'market_reentry' },
  { id: 'hit_f_062', text: '단절 전보다 낮은 직급/급여도 수용할 수 있다.', subscale: 'market_reentry' },
  { id: 'hit_f_063', text: '새로운 분야로의 전환도 열려 있다.', subscale: 'market_reentry' },
  { id: 'hit_f_064', text: '내 경력 공백을 긍정적으로 설명할 수 있는 스토리가 있다.', subscale: 'market_reentry' },
  { id: 'hit_f_065', text: '재취업에 성공한 비슷한 상황의 롤모델이 있다.', subscale: 'market_reentry' },
  { id: 'hit_f_066', text: '현재 거주 지역에서 재취업 기회가 충분하다.', subscale: 'market_reentry' },
  { id: 'hit_f_067', text: '원격 근무(재택근무) 포지션도 적극 고려하고 있다.', subscale: 'market_reentry' },
  { id: 'hit_f_068', text: '재취업이 현실적으로 어렵다고 느낀다.', subscale: 'market_reentry', reverse: true },
];

// ── 모듈3: 심리적 회복력 (28문항) ──────────────────────────────────

export const resilienceQuestions: LikertQuestion[] = [
  // === self_narrative (자기 서사) — 10문항 ===
  { id: 'hit_f_069', text: '경력 단절/실패를 내 탓으로만 돌리지 않는다.', subscale: 'self_narrative' },
  { id: 'hit_f_070', text: '이 경험을 통해 더 강해졌다고 느낀다.', subscale: 'self_narrative' },
  { id: 'hit_f_071', text: '내 이야기를 부끄러워하지 않고 말할 수 있다.', subscale: 'self_narrative' },
  { id: 'hit_f_072', text: '단절 전의 나보다 지금의 내가 더 나은 부분이 있다.', subscale: 'self_narrative' },
  { id: 'hit_f_073', text: '실패한 경험에서 구체적으로 배운 교훈이 있다.', subscale: 'self_narrative' },
  { id: 'hit_f_074', text: '다른 사람의 시선이 두려워 재도전을 망설인다.', subscale: 'self_narrative', reverse: true },
  { id: 'hit_f_075', text: '내 가치가 직업적 성공에만 달려있지 않다고 믿는다.', subscale: 'self_narrative' },
  { id: 'hit_f_076', text: '과거의 경력을 흑역사가 아닌 자산으로 본다.', subscale: 'self_narrative' },
  { id: 'hit_f_077', text: '지금의 상황이 영원히 계속되지는 않을 것이다.', subscale: 'self_narrative' },
  { id: 'hit_f_078', text: '나를 긍정적으로 평가해주는 사람이 주변에 있다.', subscale: 'self_narrative' },

  // === self_esteem (자존감) — 8문항 ===
  { id: 'hit_f_079', text: '경력 공백에도 불구하고 나는 유능한 사람이다.', subscale: 'self_esteem' },
  { id: 'hit_f_080', text: '나를 채용하는 곳은 좋은 선택을 한 것이다.', subscale: 'self_esteem' },
  { id: 'hit_f_081', text: '면접에서 자신 있게 나를 어필할 수 있다.', subscale: 'self_esteem' },
  { id: 'hit_f_082', text: '경력 단절 때문에 나는 다른 지원자보다 불리하다.', subscale: 'self_esteem', reverse: true },
  { id: 'hit_f_083', text: '내가 가진 경험의 총합은 여전히 가치가 있다.', subscale: 'self_esteem' },
  { id: 'hit_f_084', text: '나이가 들었다는 이유로 기회가 줄었다고 느낀다.', subscale: 'self_esteem', reverse: true },
  { id: 'hit_f_085', text: '새로운 환경에서도 나만의 방식으로 기여할 수 있다.', subscale: 'self_esteem' },
  { id: 'hit_f_086', text: '다시 시작할 자격이 충분하다고 느낀다.', subscale: 'self_esteem' },

  // === retry_willingness (재도전 의지) — 10문항 ===
  { id: 'hit_f_087', text: '어떤 형태로든 다시 일하고 싶다는 의지가 강하다.', subscale: 'retry_willingness' },
  { id: 'hit_f_088', text: '재도전에 대한 두려움보다 기대감이 크다.', subscale: 'retry_willingness' },
  { id: 'hit_f_089', text: '거절당해도 다시 지원할 수 있다.', subscale: 'retry_willingness' },
  { id: 'hit_f_090', text: '작은 것부터 시작해도 괜찮다.', subscale: 'retry_willingness' },
  { id: 'hit_f_091', text: '재도전을 위해 필요한 노력을 기꺼이 할 수 있다.', subscale: 'retry_willingness' },
  { id: 'hit_f_092', text: '실패해도 다시 도전하는 것이 포기하는 것보다 낫다.', subscale: 'retry_willingness' },
  { id: 'hit_f_093', text: '주변에서 재도전을 응원해주는 사람이 있다.', subscale: 'retry_willingness' },
  { id: 'hit_f_094', text: '구체적인 재도전 계획을 세우기 시작했다.', subscale: 'retry_willingness' },
  { id: 'hit_f_095', text: '완벽하지 않아도 일단 시작하는 것이 중요하다고 생각한다.', subscale: 'retry_willingness' },
  { id: 'hit_f_096', text: '3개월 이내에 구체적인 행동을 시작할 수 있다.', subscale: 'retry_willingness' },
];

// ── 모듈4: 재도전 방향 결정 (32문항) ───────────────────────────────

export const directionQuestions: LikertQuestion[] = [
  // === career_restoration (경력 복원) — 10문항 ===
  { id: 'hit_f_097', text: '단절 전과 같은 직무로 돌아가고 싶다.', subscale: 'career_restoration' },
  { id: 'hit_f_098', text: '기존 경력을 살려 같은 업계에서 재취업하고 싶다.', subscale: 'career_restoration' },
  { id: 'hit_f_099', text: '이전 직장(또는 비슷한 곳)에 복귀할 수 있다면 좋겠다.', subscale: 'career_restoration' },
  { id: 'hit_f_100', text: '경력 공백을 메우고 원래 경력 트랙으로 돌아가고 싶다.', subscale: 'career_restoration' },
  { id: 'hit_f_101', text: '기존 전문성을 유지하고 발전시키는 것이 최선이다.', subscale: 'career_restoration' },
  { id: 'hit_f_102', text: '이전 분야의 사람들과 다시 연결되고 싶다.', subscale: 'career_restoration' },
  { id: 'hit_f_103', text: '경력 단절 전의 직급/보상 수준을 회복하고 싶다.', subscale: 'career_restoration' },
  { id: 'hit_f_104', text: '기존 경력이 나의 정체성의 핵심이다.', subscale: 'career_restoration' },
  { id: 'hit_f_105', text: '같은 분야에서 최신 기술/트렌드를 빠르게 따라잡을 수 있다.', subscale: 'career_restoration' },
  { id: 'hit_f_106', text: '복귀 후 단절 전보다 더 잘할 자신이 있다.', subscale: 'career_restoration' },

  // === career_pivot (경력 전환) — 12문항 ===
  { id: 'hit_f_107', text: '이전과는 다른 분야에서 새로 시작하고 싶다.', subscale: 'career_pivot' },
  { id: 'hit_f_108', text: '단절 기간에 새롭게 관심이 생긴 분야가 있다.', subscale: 'career_pivot' },
  { id: 'hit_f_109', text: '이전 직무의 한계를 절감했기 때문에 전환이 필요하다.', subscale: 'career_pivot' },
  { id: 'hit_f_110', text: '새로운 분야를 배우는 것이 기존 분야로 돌아가는 것보다 끌린다.', subscale: 'career_pivot' },
  { id: 'hit_f_111', text: '기존 역량의 일부를 새 분야에 융합할 수 있다.', subscale: 'career_pivot' },
  { id: 'hit_f_112', text: '전환하고 싶은 구체적인 직무나 산업이 있다.', subscale: 'career_pivot' },
  { id: 'hit_f_113', text: '급여가 줄더라도 하고 싶은 일을 선택하겠다.', subscale: 'career_pivot' },
  { id: 'hit_f_114', text: '단절이 오히려 새로운 방향을 발견하는 계기가 되었다.', subscale: 'career_pivot' },
  { id: 'hit_f_115', text: '기존 경력에 미련이 없다.', subscale: 'career_pivot' },
  { id: 'hit_f_116', text: '인턴이나 수습 과정부터 다시 시작할 수 있다.', subscale: 'career_pivot' },
  { id: 'hit_f_117', text: '새 분야에서 경쟁력을 갖추기 위한 교육 계획이 있다.', subscale: 'career_pivot' },
  { id: 'hit_f_118', text: '이전 경력과 전혀 무관한 일도 해볼 의지가 있다.', subscale: 'career_pivot' },

  // === fresh_start (새 출발) — 10문항 ===
  { id: 'hit_f_119', text: '직장 생활이 아닌 다른 삶의 형태(창업, 프리랜서, 자영업)를 원한다.', subscale: 'fresh_start' },
  { id: 'hit_f_120', text: '과거 경력을 깨끗이 잊고 완전히 다시 시작하고 싶다.', subscale: 'fresh_start' },
  { id: 'hit_f_121', text: '직업 자체보다 삶의 질과 행복이 더 중요하다.', subscale: 'fresh_start' },
  { id: 'hit_f_122', text: '기존의 성공 기준과 다른 나만의 기준을 만들고 싶다.', subscale: 'fresh_start' },
  { id: 'hit_f_123', text: '돈보다 의미 있는 일을 하고 싶다.', subscale: 'fresh_start' },
  { id: 'hit_f_124', text: '조직에 소속되지 않고 독립적으로 살고 싶다.', subscale: 'fresh_start' },
  { id: 'hit_f_125', text: '이전 삶과 완전히 다른 환경(지역, 국가)에서 새 출발하고 싶다.', subscale: 'fresh_start' },
  { id: 'hit_f_126', text: '사회적 기대나 체면보다 내면의 소리를 따르겠다.', subscale: 'fresh_start' },
  { id: 'hit_f_127', text: '작은 규모라도 내가 주인인 일을 하고 싶다.', subscale: 'fresh_start' },
  { id: 'hit_f_128', text: '단절을 통해 인생에서 정말 중요한 것이 무엇인지 알게 되었다.', subscale: 'fresh_start' },
];

// ── 모듈5: 재진입 준비도 (24문항) ──────────────────────────────────

export const reentryReadinessQuestions: LikertQuestion[] = [
  // === skill_update (스킬 업데이트) — 6문항 ===
  { id: 'hit_f_129', text: '복귀에 필요한 핵심 스킬을 파악하고 있다.', subscale: 'skill_update' },
  { id: 'hit_f_130', text: '스킬 업데이트를 위한 교육/학습을 시작했다(또는 계획이 있다).', subscale: 'skill_update' },
  { id: 'hit_f_131', text: '온라인 교육 플랫폼을 활용하여 학습할 수 있다.', subscale: 'skill_update' },
  { id: 'hit_f_132', text: '실무 감각을 되살리기 위한 구체적인 방법이 있다.', subscale: 'skill_update' },
  { id: 'hit_f_133', text: '학습에 투자할 시간과 비용을 확보하고 있다.', subscale: 'skill_update' },
  { id: 'hit_f_134', text: '현재 기술 수준으로는 바로 복귀하기 어렵다.', subscale: 'skill_update', reverse: true },

  // === network_status (네트워크 상태) — 6문항 ===
  { id: 'hit_f_135', text: '단절 전 인맥 중 연락 가능한 사람이 있다.', subscale: 'network_status' },
  { id: 'hit_f_136', text: '새로운 인맥을 만들기 위한 활동을 하고 있다.', subscale: 'network_status' },
  { id: 'hit_f_137', text: '재취업 관련 커뮤니티나 모임에 참여하고 있다.', subscale: 'network_status' },
  { id: 'hit_f_138', text: '도움을 요청하는 것이 어렵지 않다.', subscale: 'network_status' },
  { id: 'hit_f_139', text: '경력 단절자 대상 프로그램(정부지원 등)을 알고 있다.', subscale: 'network_status' },
  { id: 'hit_f_140', text: '사회적으로 고립된 느낌이 있다.', subscale: 'network_status', reverse: true },

  // === self_presentation (자기 표현) — 6문항 ===
  { id: 'hit_f_141', text: '경력 공백을 자연스럽고 긍정적으로 설명할 수 있다.', subscale: 'self_presentation' },
  { id: 'hit_f_142', text: '이력서에 공백 기간을 어떻게 채울지 알고 있다.', subscale: 'self_presentation' },
  { id: 'hit_f_143', text: '면접에서 "왜 다시 일하려 하는가"에 설득력 있게 답할 수 있다.', subscale: 'self_presentation' },
  { id: 'hit_f_144', text: '나의 강점을 3가지 이상 명확하게 말할 수 있다.', subscale: 'self_presentation' },
  { id: 'hit_f_145', text: '경력 단절이 오히려 나를 더 매력적인 후보로 만들 수 있다.', subscale: 'self_presentation' },
  { id: 'hit_f_146', text: '포트폴리오나 성과 자료를 정리할 수 있다.', subscale: 'self_presentation' },

  // === field_language (현장 언어) — 6문항 ===
  { id: 'hit_f_147', text: '목표 분야의 최신 트렌드와 키워드를 알고 있다.', subscale: 'field_language' },
  { id: 'hit_f_148', text: '업계 뉴스나 미디어를 정기적으로 확인한다.', subscale: 'field_language' },
  { id: 'hit_f_149', text: '업무 관련 대화에서 자연스럽게 참여할 수 있다.', subscale: 'field_language' },
  { id: 'hit_f_150', text: '채용 공고의 요구사항을 정확하게 이해할 수 있다.', subscale: 'field_language' },
  { id: 'hit_f_151', text: '업계 커뮤니티의 토론이나 글을 이해하는 데 어려움이 없다.', subscale: 'field_language' },
  { id: 'hit_f_152', text: '단절 기간이 길어져 현장 감각이 많이 떨어졌다.', subscale: 'field_language', reverse: true },
];

// ── 전체 통합 export ──────────────────────────────────────────────

export const allHitFQuestions: LikertQuestion[] = [
  ...latentCapabilityQuestions,
  ...viabilityQuestions,
  ...resilienceQuestions,
  ...directionQuestions,
  ...reentryReadinessQuestions,
];

/** @deprecated allHitFQuestions 사용 권장 */
export const allFQuestions = allHitFQuestions;

/**
 * 테스트 페이지 호환용 모듈 배열
 * key는 FModuleType ('break_context' | 'latent_skills' | 'resilience' | 'reentry')에 대응
 */
export const hitFModules = [
  { key: 'break_context',  questions: latentCapabilityQuestions },
  { key: 'latent_skills',  questions: viabilityQuestions },
  { key: 'resilience',     questions: resilienceQuestions },
  { key: 'reentry',        questions: [...directionQuestions, ...reentryReadinessQuestions] },
] as const;
