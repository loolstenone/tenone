/**
 * HIT B E2E 자동 테스트
 * 224문항 자동 응답 (실제 subscale 포함) → 채점 → 결과 확인
 */

const BASE = 'http://localhost:3000';
const fs = require('fs');
const subscaleMap = JSON.parse(fs.readFileSync('scripts/hit-b-subscale-map.json', 'utf8'));

async function test() {
  console.log('=== HIT B E2E 테스트 시작 ===\n');

  // 1. 세션 생성
  console.log('1. 세션 생성...');
  const sessionRes = await fetch(`${BASE}/api/hit/b/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const sessionData = await sessionRes.json();
  if (!sessionData.sessionToken) {
    console.error('❌ 세션 생성 실패:', sessionData);
    process.exit(1);
  }
  const { sessionToken } = sessionData;
  console.log(`   ✅ sessionToken: ${sessionToken}\n`);

  // 2. 실제 question ID + subscale 사용
  const questionIds = Object.keys(subscaleMap).sort();
  const totalQuestions = questionIds.length;
  console.log(`2. ${totalQuestions}문항 자동 응답 (실제 subscale)...`);

  for (let i = 0; i < questionIds.length; i++) {
    const qId = questionIds[i];
    const subscale = subscaleMap[qId];
    const module = qId.startsWith('personality') ? 'personality'
      : qId.startsWith('riasec') ? 'riasec'
      : qId.startsWith('comp') ? 'competency'
      : 'readiness';
    const likertValue = Math.floor(Math.random() * 7) + 1;

    const res = await fetch(`${BASE}/api/hit/b/response`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionToken,
        questionId: qId,
        module,
        questionIndex: i,
        selectedOption: likertValue - 1,
        optionValue: `${subscale}:${likertValue}`,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error(`   ❌ Q${i + 1} (${qId}):`, err.error);
      process.exit(1);
    }
    if ((i + 1) % 30 === 0 || i + 1 === totalQuestions) {
      process.stdout.write(`   ${i + 1}/${totalQuestions}\r`);
    }
  }
  console.log(`   ✅ ${totalQuestions}/${totalQuestions}문항 응답 완료\n`);

  // 3. 채점
  console.log('3. 채점 요청...');
  const scoreRes = await fetch(`${BASE}/api/hit/b/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionToken, competencyTrack: 'marketing_strategy' }),
  });
  const scoreData = await scoreRes.json();
  if (!scoreRes.ok) {
    console.error('❌ 채점 실패:', JSON.stringify(scoreData).substring(0, 500));
    process.exit(1);
  }
  console.log(`   ✅ resultId: ${scoreData.resultId}\n`);

  // 4. 결과 조회
  console.log('4. 결과 조회...');
  const resultRes = await fetch(`${BASE}/api/hit/b/result/${scoreData.resultId}`);
  const result = await resultRes.json();
  if (!resultRes.ok) {
    console.error('❌ 결과 조회 실패:', result);
    process.exit(1);
  }

  console.log('   ✅ 결과:');
  console.log(`   Holland 코드: ${result.holland_code}`);
  console.log(`   RIASEC: R${result.riasec_r} I${result.riasec_i} A${result.riasec_a} S${result.riasec_s} E${result.riasec_e} C${result.riasec_c}`);
  console.log(`   인성: ${JSON.stringify(result.personality_scores).substring(0, 120)}...`);
  console.log(`   준비도: ${result.readiness_grade} (${result.readiness_total}%)`);
  console.log(`   역량 트랙: ${result.competency_track}`);
  console.log(`   공통 역량: ${JSON.stringify(result.competency_common).substring(0, 120)}...`);
  console.log(`   트랙 역량: ${JSON.stringify(result.competency_track_scores).substring(0, 120)}...`);
  console.log(`   다크 트라이어드: ${JSON.stringify(result.dark_triad_flags)}`);
  console.log(`   AI 리포트: ${result.ai_report ? result.ai_report.substring(0, 80) + '...' : '없음'}`);
  console.log(`   여정 단계: ${result.journey_stage}`);

  // 5. 결과 페이지
  console.log('\n5. 결과 페이지 접근...');
  const pageRes = await fetch(`${BASE}/hero/hit/b/result/${scoreData.resultId}`);
  console.log(`   HTTP ${pageRes.status} (${pageRes.status === 200 ? '✅' : '❌'})`);

  console.log('\n=== HIT B E2E 테스트 완료 ===');
  console.log(`결과 URL: ${BASE}/hero/hit/b/result/${scoreData.resultId}`);
}

test().catch(err => {
  console.error('테스트 실패:', err.message);
  process.exit(1);
});
