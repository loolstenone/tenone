/**
 * HIT A E2E 자동 테스트
 * 127문항 자동 응답 → 채점 → 결과 확인
 */

const BASE = 'http://localhost:3000';

async function test() {
  console.log('=== HIT A E2E 테스트 시작 ===\n');

  // 1. 세션 생성
  console.log('1. 세션 생성...');
  const sessionRes = await fetch(`${BASE}/api/hit/a/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ _ts: Date.now() - 5000, _hp: '' }),
  });
  const sessionData = await sessionRes.json();
  if (!sessionData.sessionToken) {
    console.error('❌ 세션 생성 실패:', sessionData);
    process.exit(1);
  }
  const { sessionToken } = sessionData;
  console.log(`   ✅ sessionToken: ${sessionToken}\n`);

  // 2. 문항 수 (base 7 + mbti 80 + disc 40 = 127)
  const modules = [
    { name: 'base', count: 7, optionCount: 4 },
    { name: 'mbti', count: 80, optionCount: 2 },
    { name: 'disc', count: 40, optionCount: 4 },
  ];
  const totalQuestions = modules.reduce((s, m) => s + m.count, 0);
  console.log(`2. ${totalQuestions}문항 자동 응답 시작...`);

  let globalIndex = 0;
  for (const mod of modules) {
    for (let i = 0; i < mod.count; i++) {
      const questionId = `${mod.name}_${String(i + 1).padStart(3, '0')}`;
      const selectedOption = Math.floor(Math.random() * mod.optionCount);
      // DISC/base: D=0,I=1,S=2,C=3 / MBTI: first=0, second=1
      const optionValues = mod.name === 'mbti'
        ? ['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P'][Math.floor(Math.random() * 8)]
        : ['D', 'I', 'S', 'C'][selectedOption];

      const res = await fetch(`${BASE}/api/hit/a/response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken,
          questionId,
          module: mod.name,
          questionIndex: globalIndex,
          selectedOption,
          optionValue: optionValues,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error(`   ❌ Q${globalIndex + 1} (${questionId}):`, err.error);
        process.exit(1);
      }
      globalIndex++;
      process.stdout.write(`   ${globalIndex}/${totalQuestions}\r`);
    }
  }
  console.log(`   ✅ ${globalIndex}/${totalQuestions}문항 응답 완료\n`);

  // 3. 채점
  console.log('3. 채점 요청...');
  const scoreRes = await fetch(`${BASE}/api/hit/a/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionToken }),
  });
  const scoreData = await scoreRes.json();
  if (!scoreRes.ok) {
    console.error('❌ 채점 실패:', scoreData);
    process.exit(1);
  }
  console.log(`   ✅ resultId: ${scoreData.resultId}\n`);

  // 4. 결과 조회
  console.log('4. 결과 조회...');
  const resultRes = await fetch(`${BASE}/api/hit/a/result/${scoreData.resultId}`);
  const result = await resultRes.json();
  if (!resultRes.ok) {
    console.error('❌ 결과 조회 실패:', result);
    process.exit(1);
  }

  console.log('   ✅ 결과:');
  console.log(`   유형: ${result.type_code} (${result.type_name_ko})`);
  console.log(`   MBTI: ${result.mbti_type} (E${result.mbti_e_score} S${result.mbti_s_score} T${result.mbti_t_score} J${result.mbti_j_score})`);
  console.log(`   DISC: ${result.disc_primary}(${result.disc_subtype}) D${result.disc_d_score} I${result.disc_i_score} S${result.disc_s_score} C${result.disc_c_score}`);
  console.log(`   S-Power:`, result.s_power_scores ? JSON.stringify(result.s_power_scores) : 'null');
  console.log(`   AI 내러티브: ${result.ai_narrative ? result.ai_narrative.substring(0, 80) + '...' : '없음'}`);
  console.log(`   기저요인: ${result.base_summary || '없음'}`);

  // 5. 결과 페이지 접근 확인
  console.log('\n5. 결과 페이지 접근...');
  const pageRes = await fetch(`${BASE}/hero/hit/a/result/${scoreData.resultId}`);
  console.log(`   HTTP ${pageRes.status} (${pageRes.status === 200 ? '✅' : '❌'})`);

  console.log('\n=== HIT A E2E 테스트 완료 ===');
  console.log(`결과 URL: ${BASE}/hero/hit/a/result/${scoreData.resultId}`);
}

test().catch(err => {
  console.error('테스트 실패:', err.message);
  process.exit(1);
});
