const https = require('https');

const PAT = process.env.SUPABASE_ACCESS_TOKEN || 'sbp_90bb7c58ad501107c9f350cf8db042c438569acc';
const PROJECT = 'ziotlxkdctlhiwkgmmsh';

async function runSQL(query) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query });
    const options = {
      hostname: 'api.supabase.com',
      path: '/v1/projects/' + PROJECT + '/database/query',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + PAT,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const queries = [
  // staff_education indexes + RLS
  `CREATE INDEX IF NOT EXISTS idx_staff_edu_member ON staff_education(member_id)`,
  `CREATE INDEX IF NOT EXISTS idx_staff_edu_status ON staff_education(status)`,
  `CREATE INDEX IF NOT EXISTS idx_staff_edu_brand ON staff_education(brand_id)`,
  `ALTER TABLE staff_education ENABLE ROW LEVEL SECURITY`,
  `DROP POLICY IF EXISTS "staff_education_read" ON staff_education`,
  `CREATE POLICY "staff_education_read" ON staff_education FOR SELECT USING (true)`,
  `DROP POLICY IF EXISTS "staff_education_write" ON staff_education`,
  `CREATE POLICY "staff_education_write" ON staff_education FOR ALL USING (true)`,
  // staff_education seed
  `INSERT INTO staff_education (member_name, department, course_name, category, hours, status, mandatory)
SELECT v.member_name, v.department, v.course_name, v.category, v.hours, v.status, v.mandatory
FROM (VALUES
  ('Cheonil Jeon', '경영기획', 'VRIEF Orientation', '필수', 4, '수료', true),
  ('Cheonil Jeon', '경영기획', 'GPR 프레임워크 이해', '필수', 6, '수료', true),
  ('Cheonil Jeon', '경영기획', 'Mind Set: 본질·속도·이행', '필수', 4, '진행중', true),
  ('Sarah Kim', '브랜드관리', 'VRIEF Orientation', '필수', 4, '수료', true),
  ('Sarah Kim', '브랜드관리', 'GPR 프레임워크 이해', '필수', 6, '예정', true),
  ('Sarah Kim', '브랜드관리', '리더십 과정 3기', '리더십', 20, '수료', false),
  ('김준호', '커뮤니티운영', 'VRIEF Orientation', '필수', 4, '미수료', true),
  ('김준호', '커뮤니티운영', 'AI 활용 실무', 'AI/기술', 16, '진행중', false),
  ('박영상', '콘텐츠제작', 'VRIEF Orientation', '필수', 4, '수료', true),
  ('박영상', '콘텐츠제작', '프로젝트 매니지먼트 심화', '직무', 30, '진행중', false),
  ('이수진', '디자인', 'VRIEF Orientation', '필수', 4, '수료', true),
  ('이수진', '디자인', '비즈니스 영어 회화', '어학', 48, '예정', false)
) AS v(member_name, department, course_name, category, hours, status, mandatory)
WHERE NOT EXISTS (
  SELECT 1 FROM staff_education
  WHERE staff_education.member_name = v.member_name
  AND staff_education.course_name = v.course_name
)`,
  // project_bids table
  `CREATE TABLE IF NOT EXISTS project_bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    client TEXT NOT NULL DEFAULT '',
    type TEXT NOT NULL DEFAULT '공개입찰',
    submit_deadline DATE,
    estimated_amount BIGINT DEFAULT 0,
    status TEXT NOT NULL DEFAULT '준비중',
    assignee TEXT DEFAULT '',
    brand_id TEXT DEFAULT 'tenone',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS idx_project_bids_status ON project_bids(status)`,
  `CREATE INDEX IF NOT EXISTS idx_project_bids_brand ON project_bids(brand_id)`,
  `ALTER TABLE project_bids ENABLE ROW LEVEL SECURITY`,
  `DROP POLICY IF EXISTS "project_bids_read" ON project_bids`,
  `CREATE POLICY "project_bids_read" ON project_bids FOR SELECT USING (true)`,
  `DROP POLICY IF EXISTS "project_bids_write" ON project_bids`,
  `CREATE POLICY "project_bids_write" ON project_bids FOR ALL USING (true)`,
  // project_bids seed
  `INSERT INTO project_bids (title, client, type, submit_deadline, estimated_amount, status, assignee)
SELECT v.title, v.client, v.type, v.submit_deadline::date, v.estimated_amount::bigint, v.status, v.assignee
FROM (VALUES
  ('2026 OO기관 홍보영상 제작', 'OO기관', '공개입찰', '2026-03-25', '80000000', '준비중', 'Sarah Kim'),
  ('XX대학교 브랜드 필름', 'XX대학교', '제한입찰', '2026-03-20', '30000000', '제출완료', '김콘텐'),
  ('YY그룹 사내 교육 콘텐츠', 'YY그룹', '수의계약', '2026-03-15', '50000000', '낙찰', 'Cheonil Jeon'),
  ('ZZ엔터 아티스트 MV', 'ZZ엔터', '제한입찰', '2026-03-10', '120000000', '유찰', '이영상')
) AS v(title, client, type, submit_deadline, estimated_amount, status, assignee)
WHERE NOT EXISTS (SELECT 1 FROM project_bids WHERE project_bids.title = v.title)`,
  // project_vendors table
  `CREATE TABLE IF NOT EXISTS project_vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL DEFAULT '기타',
    name TEXT NOT NULL,
    contact_person TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    email TEXT DEFAULT '',
    biz_number TEXT DEFAULT '',
    bank_info TEXT DEFAULT '',
    deal_count INTEGER DEFAULT 0,
    avg_rating NUMERIC(3,1) DEFAULT 0,
    status TEXT NOT NULL DEFAULT '활성',
    address TEXT,
    note TEXT,
    evaluations JSONB DEFAULT '[]',
    registered_at DATE DEFAULT CURRENT_DATE,
    brand_id TEXT DEFAULT 'tenone',
    created_at TIMESTAMPTZ DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS idx_vendors_status ON project_vendors(status)`,
  `CREATE INDEX IF NOT EXISTS idx_vendors_brand ON project_vendors(brand_id)`,
  `CREATE INDEX IF NOT EXISTS idx_vendors_category ON project_vendors(category)`,
  `ALTER TABLE project_vendors ENABLE ROW LEVEL SECURITY`,
  `DROP POLICY IF EXISTS "project_vendors_read" ON project_vendors`,
  `CREATE POLICY "project_vendors_read" ON project_vendors FOR SELECT USING (true)`,
  `DROP POLICY IF EXISTS "project_vendors_write" ON project_vendors`,
  `CREATE POLICY "project_vendors_write" ON project_vendors FOR ALL USING (true)`,
  // project_vendors seed
  `INSERT INTO project_vendors (category, name, contact_person, phone, email, biz_number, deal_count, avg_rating, status, registered_at)
SELECT v.category, v.name, v.contact_person, v.phone, v.email, v.biz_number, v.deal_count::int, v.avg_rating::numeric, v.status, v.registered_at::date
FROM (VALUES
  ('제작사', '(주)크리에이팅 프로덕션', '정프로', '02-1234-5678', 'jp@creating.co.kr', '123-45-67890', '12', '4.5', '활성', '2024-03-15'),
  ('매체사', '메가미디어', '한매체', '02-2345-6789', 'media@mega.co.kr', '234-56-78901', '8', '4.0', '활성', '2024-06-01'),
  ('프리랜서', '박영상 PD', '박영상', '010-3456-7890', 'park.pd@gmail.com', '345-67-89012', '5', '4.8', '활성', '2025-01-10'),
  ('이벤트사', '라이브커넥트', '강이벤', '02-6789-0123', 'kang@liveconnect.kr', '678-90-12345', '4', '4.3', '활성', '2025-03-20'),
  ('촬영스튜디오', '스튜디오 W', '임촬영', '02-7890-1234', 'lim@studiow.kr', '789-01-23456', '7', '4.6', '활성', '2024-04-10')
) AS v(category, name, contact_person, phone, email, biz_number, deal_count, avg_rating, status, registered_at)
WHERE NOT EXISTS (SELECT 1 FROM project_vendors WHERE project_vendors.name = v.name)`
];

(async () => {
  for (let i = 0; i < queries.length; i++) {
    const r = await runSQL(queries[i]);
    const short = queries[i].substring(0, 60).replace(/\n/g, ' ');
    const ok = r.status === 200;
    console.log(`${i+1}/${queries.length} ${ok ? 'OK' : 'ERR'} ${short}${ok ? '' : '\n  -> ' + r.body.substring(0, 150)}`);
  }
  console.log('Done.');
})();
