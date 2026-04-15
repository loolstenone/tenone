// MADLeague 경쟁PT 결과 + 아카이브 + 아티클 시드
const fs = require('fs');
const path = require('path');

const PROD = 'ziotlxkdctlhiwkgmmsh';
const env = Object.fromEntries(
  fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8')
    .split('\n').map(l => l.match(/^([^#=]+)=(.+)$/)).filter(Boolean)
    .map(m => [m[1].trim(), m[2].trim().replace(/^['"]|['"]$/g, '')])
);

async function sql(q, label) {
  const r = await fetch(`https://api.supabase.com/v1/projects/${PROD}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.SUPABASE_ACCESS_TOKEN}`, 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ query: q }),
  });
  const t = await r.text();
  if (!r.ok) throw new Error(`${label}: ${r.status} ${t.slice(0,300)}`);
  console.log(`OK ${label}`);
  return t;
}

async function main() {
  // 경쟁PT 결과 — 각 대회마다 1~3등 + MAD Crown
  await sql(`
    DELETE FROM mad_competition_results;

    INSERT INTO mad_competition_results (competition_id, team_name, club_id, rank, is_crown, award_name)
    SELECT c.id, t.team_name, cl.id, t.rank, t.is_crown, t.award_name
    FROM mad_competitions c
    JOIN (VALUES
      ('2024-jipyeong', '막걸리혁명', 'madleap', 1, true,  '대상 · MAD Crown'),
      ('2024-jipyeong', 'ZIPYEONG',    'pam',     2, false, '최우수상'),
      ('2024-jipyeong', '전통의 재해석', 'adlle',   3, false, '우수상'),
      ('2025-daesung',  'ONE SHOT',     'madleap', 1, true,  '대상 · MAD Crown'),
      ('2025-daesung',  '대성대박',      'abc',     2, false, '최우수상'),
      ('2025-daesung',  '수능혁명',      'pad',     3, false, '우수상'),
      ('2025-rizeros',  'GLOW UP',      'suzak',   1, true,  '대상 · MAD Crown'),
      ('2025-rizeros',  '피부의 답',     'pam',     2, false, '최우수상'),
      ('2025-rizeros',  'RIZE',         'adzone',  3, false, '우수상')
    ) t(comp_slug, team_name, club_slug, rank, is_crown, award_name)
      ON c.slug = t.comp_slug
    JOIN mad_clubs cl ON cl.slug = t.club_slug;
  `, 'competition_results');

  // 아카이브 (경쟁PT 수상작 + 프로그램 활동)
  await sql(`
    DELETE FROM mad_archive;

    INSERT INTO mad_archive (title, description, type, club_id, competition_id, year, award, is_featured, tags)
    SELECT t.title, t.descr, 'competition', cl.id, c.id, t.yr, t.award, t.featured,
           ARRAY[t.tag1, t.tag2]
    FROM (VALUES
      ('2024 지평주조 — 막걸리혁명', '전통주의 Z세대 리브랜딩. 막걸리를 칵테일 베이스로 재정의.', 'madleap', '2024-jipyeong', 2024, '대상', true,  '전통주', '리브랜딩'),
      ('2024 지평주조 — ZIPYEONG',   '지역 농산물 연계 프리미엄 라인업 전략.', 'pam', '2024-jipyeong', 2024, '최우수상', false, '프리미엄', '지역'),
      ('2025 대성학원 — ONE SHOT',   '재수생 인사이트에서 출발한 SNS 캠페인.', 'madleap', '2025-daesung', 2025, '대상', true, '교육', 'SNS'),
      ('2025 대성학원 — 대성대박',    '학부모 타겟 유튜브 쇼츠 시리즈.', 'abc', '2025-daesung', 2025, '최우수상', false, '유튜브', '학부모'),
      ('2025 리제로스 — GLOW UP',    'Gen Z 스킨케어 루틴 커뮤니티 전략.', 'suzak', '2025-rizeros', 2025, '대상', true, '뷰티', '커뮤니티'),
      ('2025 리제로스 — 피부의 답',   'AI 피부 진단 퍼널 마케팅.', 'pam', '2025-rizeros', 2025, '최우수상', false, 'AI', '퍼널')
    ) t(title, descr, club_slug, comp_slug, yr, award, featured, tag1, tag2)
    JOIN mad_clubs cl ON cl.slug = t.club_slug
    JOIN mad_competitions c ON c.slug = t.comp_slug;
  `, 'archive');

  // MADzine 아티클
  await sql(`
    DELETE FROM mad_articles;

    INSERT INTO mad_articles (slug, title, subtitle, content, category, club_id, author_name, tags, year, is_featured)
    SELECT t.slug, t.title, t.subtitle, t.content, t.category, cl.id, t.author, ARRAY[t.tag1,t.tag2], t.yr, t.featured
    FROM (VALUES
      ('2025-daesung-winner-interview', '2025 대성학원 대상 수상 인터뷰 — ONE SHOT',
       'MADLeap 최윤서 팀장, "재수생의 마음을 읽는 법"', '대상을 받은 ONE SHOT 팀의 비하인드 스토리...', 'interview', 'madleap', '편집부', '수상', '인터뷰', 2025, true),
      ('suzak-president-2025', 'SUZAK 회장 인터뷰 — 제주에서 피어난 리그 우승',
       '섬에서 준비한 365일의 도전', '제주 SUZAK이 리제로스 경쟁PT에서 MAD Crown을 거머쥔 배경...', 'interview', 'suzak', '편집부', '회장', '동아리', 2025, true),
      ('case-dam-2024', '2024 DAM 파티 케이스 리포트',
       '현업 200명, 학생 400명, 기업 30개. 1박 2일의 연결', '(본문 준비 중)', 'case', NULL, '편집부', 'DAM', '네트워킹', 2024, false),
      ('report-gen-z-marketing', '리포트 — Gen Z 마케팅 키워드 TOP 10',
       '2026 상반기 트렌드 분석', '(본문 준비 중)', 'report', NULL, '편집부', '트렌드', 'GenZ', 2026, false),
      ('news-madleap-new-cohort', 'MADLeap 2026 신입 모집 시작',
       '3월 15일까지 서류 접수', '(본문 준비 중)', 'news', 'madleap', '편집부', '모집', 'MADLeap', 2026, false),
      ('pam-case-jipyeong', 'PAM의 도전 — 지평주조 ZIPYEONG 프로젝트',
       '지역 농산물로 만든 프리미엄 전략', '(본문 준비 중)', 'case', 'pam', '편집부', '케이스', 'PAM', 2024, false)
    ) t(slug, title, subtitle, content, category, club_slug, author, tag1, tag2, yr, featured)
    LEFT JOIN mad_clubs cl ON cl.slug = t.club_slug;
  `, 'articles');

  // cohort member_count 업데이트 (통계용)
  await sql(`
    UPDATE mad_cohorts SET member_count = 18 WHERE club_id = (SELECT id FROM mad_clubs WHERE slug='madleap');
    UPDATE mad_cohorts SET member_count = 15 WHERE club_id = (SELECT id FROM mad_clubs WHERE slug='pam');
    UPDATE mad_cohorts SET member_count = 12 WHERE club_id = (SELECT id FROM mad_clubs WHERE slug='adlle');
    UPDATE mad_cohorts SET member_count = 14 WHERE club_id = (SELECT id FROM mad_clubs WHERE slug='abc');
    UPDATE mad_cohorts SET member_count = 9  WHERE club_id = (SELECT id FROM mad_clubs WHERE slug='suzak');
    UPDATE mad_cohorts SET member_count = 8  WHERE club_id = (SELECT id FROM mad_clubs WHERE slug='pad');
    UPDATE mad_cohorts SET member_count = 10 WHERE club_id = (SELECT id FROM mad_clubs WHERE slug='adzone');
  `, 'cohort counts');

  const v = await sql(`SELECT
    (SELECT COUNT(*) FROM mad_competition_results) AS results,
    (SELECT COUNT(*) FROM mad_archive) AS archive,
    (SELECT COUNT(*) FROM mad_articles) AS articles;`, 'verify');
  console.log(v);
}
main().catch(e => { console.error(e); process.exit(1); });
