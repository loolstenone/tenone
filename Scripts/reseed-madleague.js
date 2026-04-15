// MADLeague 시드 재적용 (Korean UTF-8 복구)
// 이전 curl 경로에서 인코딩 깨짐 → Node fetch로 직접 재시드
const fs = require('fs');
const path = require('path');

const PROD_PROJECT_ID = 'ziotlxkdctlhiwkgmmsh';

function loadEnv() {
  const envPath = path.join(__dirname, '../.env.local');
  const env = {};
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([^#=]+)=["']?(.+?)["']?\s*$/);
    if (m) env[m[1].trim()] = m[2].trim();
  }
  return env;
}

async function runSQL(pat, sql, label) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROD_PROJECT_ID}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${pat}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({ query: sql }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${label} HTTP ${res.status}: ${text.slice(0, 300)}`);
  console.log(`OK ${label} → ${text.slice(0, 200)}`);
  return text;
}

async function main() {
  const { SUPABASE_ACCESS_TOKEN } = loadEnv();
  if (!SUPABASE_ACCESS_TOKEN) throw new Error('SUPABASE_ACCESS_TOKEN 없음');

  // 1) 기존 시드 전부 제거
  await runSQL(SUPABASE_ACCESS_TOKEN, `
    DELETE FROM mad_competition_results;
    DELETE FROM mad_competitions;
    DELETE FROM mad_cohorts;
    DELETE FROM mad_clubs;
  `, 'cleanup');

  // 2) 동아리 재시드
  const clubs = [
    ['madleap', 'MADLeap', '수도권', '수도권 거점 동아리. 서울·경기·인천 대학생 멤버로 구성.', '#EC1D25', 1],
    ['pam',     'PAM',     '부산/경남', '부산·경남 거점 동아리. 남부권 광고·마케팅 인재의 허브.', '#0066CC', 2],
    ['adlle',   'ADlle',   '대구/경북', '대구·경북 거점 동아리. 지역 기반 크리에이티브 도전.', '#FF6B35', 3],
    ['abc',     'ABC',     '광주/전남', '광주·전남 거점 동아리. 호남권 마케팅 커뮤니티.', '#00A86B', 4],
    ['suzak',   'SUZAK',   '제주',     '제주 거점 동아리. 섬에서 피어나는 아이디어.', '#FFC000', 5],
    ['pad',     'P:ad',    '강원',     '강원 거점 동아리. 자연과 크리에이티브의 만남.', '#4A90E2', 6],
    ['adzone',  'AD Zone', '충청',     '충청 거점 동아리. 중부권 광고·마케팅 도전.', '#9B59B6', 7],
  ];
  const clubValues = clubs.map(([slug, name, region, desc, color, sort]) =>
    `('${slug}','${name}','${region.replace(/'/g, "''")}','${desc.replace(/'/g, "''")}','${color}','active',${sort})`
  ).join(',\n  ');
  await runSQL(SUPABASE_ACCESS_TOKEN, `
    INSERT INTO mad_clubs (slug, name, region, description, color, status, sort_order) VALUES
    ${clubValues};
  `, 'insert clubs');

  // 3) cohorts 2024/2025
  await runSQL(SUPABASE_ACCESS_TOKEN, `
    INSERT INTO mad_cohorts (club_id, year, status, start_date, end_date)
    SELECT id, 2025, 'active', '2025-03-01', '2025-12-31' FROM mad_clubs;
    INSERT INTO mad_cohorts (club_id, year, status, start_date, end_date)
    SELECT id, 2024, 'completed', '2024-03-01', '2024-12-31' FROM mad_clubs;
  `, 'insert cohorts');

  // 4) 경쟁PT
  await runSQL(SUPABASE_ACCESS_TOKEN, `
    INSERT INTO mad_competitions (slug, title, year, client_name, status, presentation_date) VALUES
    ('2024-jipyeong', '2024 지평주조 경쟁PT', 2024, '지평주조', 'completed', '2024-11-15'),
    ('2025-daesung',  '2025 대성학원 경쟁PT', 2025, '대성학원', 'completed', '2025-06-20'),
    ('2025-rizeros',  '2025 리제로스 경쟁PT', 2025, '리제로스', 'completed', '2025-11-10');
  `, 'insert competitions');

  // 5) 검증
  const verify = await runSQL(SUPABASE_ACCESS_TOKEN,
    `SELECT slug, name, region FROM mad_clubs ORDER BY sort_order;`,
    'verify clubs'
  );
  console.log('\n=== VERIFY ===\n' + verify);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
