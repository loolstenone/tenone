/**
 * HIT B 심화 75문항 시딩 스크립트
 * - character_deep (CH Deep B맞춤) 45문항
 * - aptitude_deep (AP Deep B맞춤) 30문항
 *
 * 사용법: node scripts/seed-b-deep.js
 */

const https = require('https');

const PAT = 'sbp_c2190dad81b447c97952c7163fc2e2af30062b11';
const PROJECT_ID = 'ziotlxkdctlhiwkgmmsh';
const ENDPOINT = `https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query`;

// ── Supabase API 호출 ──────────────────────────────────────────────

function runSQL(sql, label) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const url = new URL(ENDPOINT);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAT}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log(`✅ [${label}] HTTP ${res.statusCode}`);
          try { resolve(JSON.parse(data)); } catch { resolve(data); }
        } else {
          console.error(`❌ [${label}] HTTP ${res.statusCode}: ${data}`);
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function s(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}
function j(obj) {
  return `'${JSON.stringify(obj).replace(/'/g, "''")}'::jsonb`;
}
function b(val) {
  return val ? 'true' : 'false';
}

// ── 문항 정의 ──────────────────────────────────────────────────────

// CH Deep B맞춤 — 45문항
const chDeepB = [
  // perfectionism (5)
  { id: 'chb_pf01', subscale: 'perfectionism', text: '과제 제출 전 사소한 오타까지 여러 번 확인한다.', reverse: false, alert: null },
  { id: 'chb_pf02', subscale: 'perfectionism', text: '남들은 괜찮다고 해도 내 기준에 미달이면 다시 한다.', reverse: true, alert: null },
  { id: 'chb_pf03', subscale: 'perfectionism', text: '발표 자료가 완벽하지 않으면 불안해서 시작하기 어렵다.', reverse: true, alert: null },
  { id: 'chb_pf04', subscale: 'perfectionism', text: '팀 프로젝트에서 내 파트의 품질이 가장 높아야 한다고 느낀다.', reverse: false, alert: 'NR' },
  { id: 'chb_pf05', subscale: 'perfectionism', text: '취업 준비 과정에서 \'이 정도면 됐다\'고 넘기기가 어렵다.', reverse: false, alert: null },

  // sensitivity (4)
  { id: 'chb_sn01', subscale: 'sensitivity', text: '선배의 피드백에 감정이 크게 흔들릴 때가 있다.', reverse: false, alert: null },
  { id: 'chb_sn02', subscale: 'sensitivity', text: '동기들의 분위기 변화를 빠르게 알아차린다.', reverse: false, alert: null },
  { id: 'chb_sn03', subscale: 'sensitivity', text: '취업 거절 메일을 받아도 금세 털어버리는 편이다.', reverse: true, alert: 'PP' },
  { id: 'chb_sn04', subscale: 'sensitivity', text: '면접에서 면접관의 표정 변화가 신경 쓰인다.', reverse: false, alert: null },

  // tension (4)
  { id: 'chb_tn01', subscale: 'tension', text: '면접 전날 잠을 설치는 편이다.', reverse: true, alert: null },
  { id: 'chb_tn02', subscale: 'tension', text: '동시에 여러 곳에 지원하면 머리가 복잡해진다.', reverse: true, alert: null },
  { id: 'chb_tn03', subscale: 'tension', text: '취업 준비 중 불확실한 상황에서도 편안하게 지낼 수 있다.', reverse: false, alert: 'PP' },
  { id: 'chb_tn04', subscale: 'tension', text: '합격 발표를 기다리는 동안 다른 일에 집중하기 어렵다.', reverse: true, alert: null },

  // warmth (3)
  { id: 'chb_wm01', subscale: 'warmth', text: '스터디 그룹에서 어려워하는 동기를 먼저 도와준다.', reverse: false, alert: null },
  { id: 'chb_wm02', subscale: 'warmth', text: '새로운 모임에서 처음 보는 사람에게 따뜻하게 다가간다.', reverse: false, alert: null },
  { id: 'chb_wm03', subscale: 'warmth', text: '조별 과제에서도 인간적 유대가 결과물 못지않게 중요하다.', reverse: false, alert: null },

  // social_boldness (3)
  { id: 'chb_sb01', subscale: 'social_boldness', text: '교수님이나 선배 앞에서도 내 의견을 당당하게 말할 수 있다.', reverse: false, alert: null },
  { id: 'chb_sb02', subscale: 'social_boldness', text: '발표 상황에서 주목받는 것이 부담보다 자연스럽다.', reverse: false, alert: 'NR' },
  { id: 'chb_sb03', subscale: 'social_boldness', text: '내 경험과 역량을 적극적으로 어필하는 데 거리낌이 없다.', reverse: false, alert: 'NR' },

  // optimism (3)
  { id: 'chb_op01', subscale: 'optimism', text: '불합격해도 \'다음엔 될 것\'이라고 생각하는 편이다.', reverse: false, alert: null },
  { id: 'chb_op02', subscale: 'optimism', text: '취업 준비가 힘들어도 유머로 분위기를 전환할 수 있다.', reverse: false, alert: null },
  { id: 'chb_op03', subscale: 'optimism', text: '취업이 안 되면 의욕을 쉽게 잃는 편이다.', reverse: true, alert: null },

  // control (3)
  { id: 'chb_ct01', subscale: 'control', text: '면접에서 긴장되어도 감정을 조절하며 답변할 수 있다.', reverse: false, alert: null },
  { id: 'chb_ct02', subscale: 'control', text: '친구가 먼저 취업하면 조급함에 충동적 결정을 할 때가 있다.', reverse: true, alert: null },
  { id: 'chb_ct03', subscale: 'control', text: '압박 면접 상황에서도 침착하게 대응할 수 있다.', reverse: false, alert: 'PP' },

  // self_discipline (2)
  { id: 'chb_sd01', subscale: 'self_discipline', text: '취업 준비 일정을 스스로 정하고 꾸준히 지킨다.', reverse: false, alert: null },
  { id: 'chb_sd02', subscale: 'self_discipline', text: '자기소개서 마감 전에 미리미리 준비하는 편이다.', reverse: false, alert: null },

  // independence (3)
  { id: 'chb_in01', subscale: 'independence', text: '부모님이나 주변의 의견보다 내 판단을 따르는 편이다.', reverse: false, alert: null },
  { id: 'chb_in02', subscale: 'independence', text: '친구들이 가는 대기업에 나도 지원해야 할 것 같은 압박을 느낀다.', reverse: true, alert: null },
  { id: 'chb_in03', subscale: 'independence', text: '유행하는 직무보다 내가 진심으로 원하는 방향을 선택할 수 있다.', reverse: false, alert: null },

  // suspicion (3)
  { id: 'chb_su01', subscale: 'suspicion', text: '면접관의 친절한 태도에 숨은 의도가 있을 수 있다고 생각한다.', reverse: true, alert: 'MK' },
  { id: 'chb_su02', subscale: 'suspicion', text: '취업 정보를 공유해주는 선배의 말을 쉽게 믿지 않는다.', reverse: true, alert: 'MK' },
  { id: 'chb_su03', subscale: 'suspicion', text: '새로운 멘토나 동기도 일단 신뢰하고 보는 편이다.', reverse: false, alert: null },

  // openness (4)
  { id: 'chb_op2_01', subscale: 'openness', text: '전공과 무관한 직무도 열린 마음으로 탐색해본다.', reverse: false, alert: null },
  { id: 'chb_op2_02', subscale: 'openness', text: '다양한 산업의 사람들을 만나는 것이 즐겁다.', reverse: false, alert: null },
  { id: 'chb_op2_03', subscale: 'openness', text: '기존에 생각하지 않던 새로운 커리어 경로도 고려할 수 있다.', reverse: false, alert: null },
  { id: 'chb_op2_04', subscale: 'openness', text: '내가 정한 진로 방향 외의 정보는 무시하는 편이다.', reverse: true, alert: null },

  // adventure (3)
  { id: 'chb_ad01', subscale: 'adventure', text: '경험해보지 않은 분야의 인턴에도 도전할 수 있다.', reverse: false, alert: null },
  { id: 'chb_ad02', subscale: 'adventure', text: '안정적인 대기업보다 성장 가능성 있는 스타트업에 끌린다.', reverse: false, alert: null },
  { id: 'chb_ad03', subscale: 'adventure', text: '실패 가능성이 있어도 도전하는 것이 안전한 선택보다 낫다.', reverse: false, alert: 'SP' },

  // intellect (3)
  { id: 'chb_iq01', subscale: 'intellect', text: '관심 분야의 책이나 강좌를 자발적으로 찾아 듣는다.', reverse: false, alert: null },
  { id: 'chb_iq02', subscale: 'intellect', text: '단순 스펙 쌓기보다 진짜 배우고 싶은 것을 공부한다.', reverse: false, alert: null },
  { id: 'chb_iq03', subscale: 'intellect', text: '취업과 직접 관련 없는 분야도 궁금하면 파고드는 편이다.', reverse: false, alert: null },

  // conscience (1)
  { id: 'chb_con01', subscale: 'conscience', text: '자기소개서에 사실을 과장하는 것이 마음에 걸린다.', reverse: false, alert: null },

  // decoy (1)
  { id: 'chb_val01', subscale: 'decoy', text: '나는 취업 준비 중 단 한 번도 불안을 느낀 적이 없다.', reverse: false, alert: null },
];

// AP Deep B맞춤 — 30문항
const apDeepB = [
  // R형 현실형 (5)
  { id: 'apb_r01', subscale: 'R', text: '실습 수업에서 장비를 빠르게 익힌다.' },
  { id: 'apb_r02', subscale: 'R', text: '물리적 공간을 정리하거나 배치하는 데 자신이 있다.' },
  { id: 'apb_r03', subscale: 'R', text: '손으로 직접 만드는 과제에서 좋은 결과를 낸다.' },
  { id: 'apb_r04', subscale: 'R', text: '안전 수칙을 지키면서 실습을 정확히 수행할 수 있다.' },
  { id: 'apb_r05', subscale: 'R', text: '실물 프로젝트를 기획부터 완성까지 해낸 경험이 있다.' },

  // I형 탐구형 (5)
  { id: 'apb_i01', subscale: 'I', text: '통계 과제나 데이터 분석에 자신이 있다.' },
  { id: 'apb_i02', subscale: 'I', text: '연구 방법론 수업 내용을 이해하고 적용할 수 있다.' },
  { id: 'apb_i03', subscale: 'I', text: '복잡한 정보를 체계적으로 정리하는 능력이 있다.' },
  { id: 'apb_i04', subscale: 'I', text: '레포트에서 논리적 근거를 갖춰 결론을 내릴 수 있다.' },
  { id: 'apb_i05', subscale: 'I', text: '혼자 오랜 시간 집중하여 조사·분석 과제를 수행할 수 있다.' },

  // A형 예술형 (5)
  { id: 'apb_a01', subscale: 'A', text: '수업이나 모임에서 독창적인 아이디어를 자주 제안한다.' },
  { id: 'apb_a02', subscale: 'A', text: 'PPT나 포스터를 시각적으로 보기 좋게 만드는 데 자신 있다.' },
  { id: 'apb_a03', subscale: 'A', text: '글이나 영상으로 스토리를 구성하는 능력이 있다.' },
  { id: 'apb_a04', subscale: 'A', text: '디자인 도구나 영상 편집 도구를 다룰 수 있다.' },
  { id: 'apb_a05', subscale: 'A', text: '추상적 컨셉을 구체적 결과물로 만드는 데 자신 있다.' },

  // S형 사회형 (5)
  { id: 'apb_s01', subscale: 'S', text: '조별 과제에서 갈등이 생기면 중재 역할을 잘 한다.' },
  { id: 'apb_s02', subscale: 'S', text: '동기의 고민을 들어주면 상대가 편안해한다.' },
  { id: 'apb_s03', subscale: 'S', text: '어려운 개념을 쉽게 설명하는 능력이 있다.' },
  { id: 'apb_s04', subscale: 'S', text: '처음 만난 사람과도 빠르게 친해질 수 있다.' },
  { id: 'apb_s05', subscale: 'S', text: '의기소침한 동기를 격려하여 의욕을 북돋운 경험이 있다.' },

  // E형 기업형 (5)
  { id: 'apb_e01', subscale: 'E', text: '학교 발표에서 청중을 설득하는 프레젠테이션을 할 수 있다.' },
  { id: 'apb_e02', subscale: 'E', text: '프로젝트 계획을 세우고 역할을 배분하는 데 자신 있다.' },
  { id: 'apb_e03', subscale: 'E', text: '동아리나 학회에서 리더 역할을 맡은 경험이 있다.' },
  { id: 'apb_e04', subscale: 'E', text: '한정된 예산으로 행사나 프로젝트를 기획할 수 있다.' },
  { id: 'apb_e05', subscale: 'E', text: '정답이 없는 상황에서도 결정을 내릴 수 있다.' },

  // C형 관습형 (5)
  { id: 'apb_c01', subscale: 'C', text: '엑셀이나 구글시트로 데이터를 정리하는 데 능숙하다.' },
  { id: 'apb_c02', subscale: 'C', text: '대량의 자료를 분류하고 관리하는 일을 잘 한다.' },
  { id: 'apb_c03', subscale: 'C', text: '오류 없이 정확하게 입력하고 처리하는 데 자신 있다.' },
  { id: 'apb_c04', subscale: 'C', text: '복잡한 일정을 관리하고 빠짐없이 처리할 수 있다.' },
  { id: 'apb_c05', subscale: 'C', text: '규정이나 양식에 맞춰 문서를 작성하는 데 자신 있다.' },
];

// ── SQL 행 생성 헬퍼 ───────────────────────────────────────────────

function buildChRow(q, idx) {
  const isDecoy = q.subscale === 'decoy';
  const scoringKey = isDecoy
    ? { section: 'ch_deep_b', subscale: 'decoy', decoy: true }
    : { section: 'ch_deep_b', subscale: q.subscale };
  if (q.alert && !isDecoy) scoringKey.dark_flag = q.alert;

  return (
    `  (${s(q.id)}, 'character_deep', 'B', 'likert7', ${idx}, ` +
    `${s(q.text)}, ${s(q.subscale)}, 'likert', ` +
    `${b(q.reverse)}, ${j(scoringKey)}, ${q.alert ? s(q.alert) : 'NULL'})`
  );
}

function buildApRow(q, idx) {
  const scoringKey = { section: 'ap_deep_b', subscale: q.subscale };
  return (
    `  (${s(q.id)}, 'aptitude_deep', 'B', 'likert7', ${idx}, ` +
    `${s(q.text)}, ${s(q.subscale)}, 'likert', ` +
    `false, ${j(scoringKey)}, NULL)`
  );
}

function buildInsert(rows, label) {
  return (
    `INSERT INTO public.hit_questions\n` +
    `  (id, module, layer_target, test_type, question_index, question_text,\n` +
    `   sub_domain, response_type, reverse_scored, scoring_key, alert_code)\nVALUES\n` +
    rows.join(',\n') + ';'
  );
}

// ── 배치 실행 ──────────────────────────────────────────────────────

async function main() {
  console.log('🚀 HIT B 심화 75문항 시딩 시작...\n');

  // Step 1: DELETE 기존 데이터
  await runSQL(
    `DELETE FROM public.hit_questions WHERE module IN ('character_deep','aptitude_deep') AND layer_target='B';`,
    'DELETE 기존 B deep 데이터'
  );

  // Step 2: CH Deep B — 배치 1 (1~15)
  const chRows = chDeepB.map((q, i) => buildChRow(q, i + 1));
  await runSQL(
    buildInsert(chRows.slice(0, 15), 'ch_batch1'),
    'CH Deep B 1~15'
  );

  // Step 3: CH Deep B — 배치 2 (16~30)
  await runSQL(
    buildInsert(chRows.slice(15, 30), 'ch_batch2'),
    'CH Deep B 16~30'
  );

  // Step 4: CH Deep B — 배치 3 (31~45)
  await runSQL(
    buildInsert(chRows.slice(30, 45), 'ch_batch3'),
    'CH Deep B 31~45'
  );

  // Step 5: AP Deep B — 배치 1 (1~15)
  const apRows = apDeepB.map((q, i) => buildApRow(q, i + 1));
  await runSQL(
    buildInsert(apRows.slice(0, 15), 'ap_batch1'),
    'AP Deep B 1~15'
  );

  // Step 6: AP Deep B — 배치 2 (16~30)
  await runSQL(
    buildInsert(apRows.slice(15, 30), 'ap_batch2'),
    'AP Deep B 16~30'
  );

  // Step 7: COUNT 확인
  const countResult = await runSQL(
    `SELECT module, layer_target, COUNT(*) AS cnt FROM public.hit_questions WHERE module IN ('character_deep','aptitude_deep') AND layer_target='B' GROUP BY module, layer_target ORDER BY module;`,
    'COUNT 확인'
  );
  console.log('\n📊 결과:');
  console.log(JSON.stringify(countResult, null, 2));

  console.log('\n✅ 시딩 완료!');
}

main().catch(err => {
  console.error('❌ 오류:', err.message);
  process.exit(1);
});
