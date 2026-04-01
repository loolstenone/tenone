const https = require('https');

const PAT = process.env.SUPABASE_ACCESS_TOKEN || 'sbp_36c62ea88ada59834815c671dc114306aa202b77';
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
  // ── invoices ──────────────────────────────────────────────────
  `INSERT INTO invoices (invoice_no, client_name, project_name, amount, tax_amount, issue_date, status, brand_id)
   SELECT v.invoice_no, v.client_name, v.project_name, v.amount::bigint, v.tax_amount::bigint, v.issue_date::date, v.status, 'tenone'
   FROM (VALUES
     ('INV-2026-001', 'OO기관', '홍보영상 제작', '5000000', '500000', '2026-03-05', '발행'),
     ('INV-2026-002', 'XX대학교', '브랜드 필름', '3000000', '300000', '2026-03-10', '수금완료'),
     ('INV-2026-003', 'YY그룹', '사내 교육 콘텐츠', '8000000', '800000', '2026-03-15', '발행'),
     ('INV-2026-004', 'ZZ엔터', '아티스트 MV', '12000000', '1200000', '2026-02-28', '수금완료'),
     ('INV-2026-005', 'AA브랜드', '브랜드 가이드북', '2500000', '250000', '2026-03-20', '임시저장')
   ) AS v(invoice_no, client_name, project_name, amount, tax_amount, issue_date, status)
   WHERE NOT EXISTS (SELECT 1 FROM invoices WHERE invoices.invoice_no = v.invoice_no)`,

  // ── card_usage ────────────────────────────────────────────────
  `INSERT INTO card_usage (holder_name, card_last4, merchant, category, amount, used_at, brand_id)
   SELECT v.holder_name, v.card_last4, v.merchant, v.category, v.amount::bigint, v.used_at::timestamptz, 'tenone'
   FROM (VALUES
     ('전천일', '1234', '스타벅스 강남점', '식비', '14500', '2026-03-20 09:30:00+09'),
     ('전천일', '1234', '쿠팡', '소모품', '89000', '2026-03-19 14:00:00+09'),
     ('Sarah Kim', '5678', '홍대 회의실 예약', '회의비', '50000', '2026-03-18 10:00:00+09'),
     ('Sarah Kim', '5678', '이마트 세종점', '소모품', '32000', '2026-03-17 16:30:00+09'),
     ('전천일', '1234', '네이버 광고', '광고비', '200000', '2026-03-15 09:00:00+09'),
     ('김준호', '9012', 'GS25 편의점', '식비', '8500', '2026-03-14 12:00:00+09')
   ) AS v(holder_name, card_last4, merchant, category, amount, used_at)
   WHERE NOT EXISTS (SELECT 1 FROM card_usage WHERE card_usage.merchant = v.merchant AND card_usage.used_at::date = v.used_at::timestamptz::date)`,

  // ── incentives ────────────────────────────────────────────────
  `INSERT INTO incentives (period, grade, bonus_rate, amount, type, paid_at, brand_id)
   SELECT v.period, v.grade, v.bonus_rate::numeric, v.amount::bigint, v.type, v.paid_at::timestamptz, 'tenone'
   FROM (VALUES
     ('2026-Q1', 'S', '0.15', '1500000', '성과급', '2026-03-31 00:00:00+09'),
     ('2026-Q1', 'A', '0.10', '1000000', '성과급', '2026-03-31 00:00:00+09'),
     ('2026-Q1', 'B', '0.05', '500000', '성과급', '2026-03-31 00:00:00+09'),
     ('2025-연간', 'S', '0.20', '2000000', '연간보상', '2025-12-31 00:00:00+09')
   ) AS v(period, grade, bonus_rate, amount, type, paid_at)
   WHERE NOT EXISTS (SELECT 1 FROM incentives WHERE incentives.period = v.period AND incentives.grade = v.grade AND incentives.type = v.type)`,

  // ── monthly_forecasts ─────────────────────────────────────────
  `INSERT INTO monthly_forecasts (year, month, item, plan, forecast_1, forecast_2, forecast_3)
   SELECT v.year::int, v.month::int, v.item, v.plan::bigint, v.f1::bigint, v.f2::bigint, v.f3::bigint
   FROM (VALUES
     ('2026','1','매출',  '80000000','82000000','80500000','79000000'),
     ('2026','1','인건비','40000000','40000000','40000000','40000000'),
     ('2026','1','운영비','10000000', '9800000','10200000','10000000'),
     ('2026','2','매출',  '90000000','88000000','91000000','90000000'),
     ('2026','2','인건비','40000000','40000000','40000000','41000000'),
     ('2026','2','운영비','10000000','10500000', '9500000','10000000'),
     ('2026','3','매출', '100000000','95000000','98000000','100000000'),
     ('2026','3','인건비','42000000','42000000','42000000','42000000'),
     ('2026','3','운영비','11000000','10800000','11200000','11000000')
   ) AS v(year, month, item, plan, f1, f2, f3)
   WHERE NOT EXISTS (SELECT 1 FROM monthly_forecasts WHERE monthly_forecasts.year = v.year::int AND monthly_forecasts.month = v.month::int AND monthly_forecasts.item = v.item)`,

  // ── workflow_tasks ────────────────────────────────────────────
  `INSERT INTO workflow_tasks (title, description, status, priority, assignee, brand_id, due_date)
   SELECT v.title, v.description, v.status, v.priority, v.assignee, 'tenone', v.due_date::date
   FROM (VALUES
     ('LUKI 2nd 싱글 제작 기획서', 'AI 아이돌 2nd 앨범 콘셉트 및 제작 계획 수립', 'in_progress', 'high', 'Sarah Kim', '2026-04-10'),
     ('MADLeague S3 브랜드 가이드', '시즌3 비주얼 아이덴티티 가이드 완성', 'todo', 'medium', '이수진', '2026-04-15'),
     ('Badak 밋업 이벤트 기획', '4월 네트워킹 이벤트 기획 및 준비', 'done', 'high', '김준호', '2026-03-28'),
     ('TenOne 뉴스레터 발행', '4월 1호 뉴스레터 콘텐츠 편집', 'in_progress', 'medium', '박영상', '2026-04-05'),
     ('WIO 사용 가이드 작성', 'WIO 모듈별 사용 가이드 문서 작성', 'todo', 'low', 'Sarah Kim', '2026-04-20'),
     ('HeRo HIT 분석 보고서', '1분기 인재 매칭 성과 분석', 'review', 'medium', '전천일', '2026-04-01')
   ) AS v(title, description, status, priority, assignee, due_date)
   WHERE NOT EXISTS (SELECT 1 FROM workflow_tasks WHERE workflow_tasks.title = v.title)`,

  // ── content_pipeline ─────────────────────────────────────────
  `INSERT INTO content_pipeline (title, type, stage, brand_id, assignee, due_date, ai_generated)
   SELECT v.title, v.type, v.stage, v.brand_id, v.assignee, v.due_date::date, v.ai_generated::boolean
   FROM (VALUES
     ('LUKI 공식 유튜브 쇼츠 #12', 'video', 'editing', 'luki', '박영상', '2026-04-03', 'true'),
     ('MADLeague 활동 브이로그', 'video', 'filming', 'madleague', '김준호', '2026-04-05', 'false'),
     ('Badak 4월 밋업 리캡', 'blog', 'writing', 'badak', 'Sarah Kim', '2026-04-08', 'true'),
     ('TenOne Universe 소개 영상', 'video', 'planning', 'tenone', '전천일', '2026-04-15', 'false'),
     ('LUKI 신보 티저 이미지', 'image', 'review', 'luki', '이수진', '2026-04-02', 'true'),
     ('WIO 솔루션 소개 블로그', 'blog', 'published', 'tenone', 'Sarah Kim', '2026-03-25', 'true')
   ) AS v(title, type, stage, brand_id, assignee, due_date, ai_generated)
   WHERE NOT EXISTS (SELECT 1 FROM content_pipeline WHERE content_pipeline.title = v.title)`,

  // ── workflow_automations ──────────────────────────────────────
  `INSERT INTO workflow_automations (name, description, trigger, conditions, actions, enabled, brand_id)
   SELECT v.name, v.description, v.trigger::jsonb, v.conditions::jsonb, v.actions::jsonb, v.enabled::boolean, 'tenone'
   FROM (VALUES
     ('콘텐츠 발행 알림', '콘텐츠가 published 상태로 변경되면 Slack 알림', '{"event":"status_change","from":"review","to":"published"}', '{}', '[{"type":"slack","message":"새 콘텐츠가 발행되었습니다."}]', 'true'),
     ('마감 3일 전 리마인더', '마감일 3일 전 담당자에게 이메일 발송', '{"event":"due_date_approaching","days":3}', '{}', '[{"type":"email","to":"assignee","template":"deadline_reminder"}]', 'true'),
     ('결재 요청 자동 처리', '50만원 이하 경비는 팀장 자동 승인', '{"event":"approval_requested"}', '[{"field":"amount","op":"lte","value":500000}]', '[{"type":"auto_approve","role":"team_lead"}]', 'false')
   ) AS v(name, description, trigger, conditions, actions, enabled)
   WHERE NOT EXISTS (SELECT 1 FROM workflow_automations WHERE workflow_automations.name = v.name)`,

  // ── shop_products ─────────────────────────────────────────────
  `INSERT INTO shop_products (site, name, description, price, stock, category, status)
   SELECT v.site, v.name, v.description, v.price::int, v.stock::int, v.category, v.status
   FROM (VALUES
     ('tenone', 'TenOne 로고 후디', 'TenOne Universe 공식 후드티', '59000', '50', '의류', 'active'),
     ('tenone', 'LUKI 포토카드 세트', 'LUKI 공식 포토카드 6종 세트', '15000', '200', '굿즈', 'active'),
     ('tenone', 'MADLeague 보틀', 'MADLeague 공식 텀블러 350ml', '28000', '100', '생활용품', 'active'),
     ('tenone', 'Badak 스티커팩', 'Badak 캐릭터 스티커 10종', '5000', '500', '문구', 'active'),
     ('tenone', 'TenOne 캡모자', 'TenOne 공식 볼캡', '35000', '80', '의류', 'active')
   ) AS v(site, name, description, price, stock, category, status)
   WHERE NOT EXISTS (SELECT 1 FROM shop_products WHERE shop_products.name = v.name AND shop_products.site = v.site)`,

  // ── promotions ────────────────────────────────────────────────
  `INSERT INTO promotions (site, name, code, type, value, min_order, start_date, end_date, max_uses, used_count, is_active)
   SELECT v.site, v.name, v.code, v.type, v.value::int, v.min_order::int, v.start_date::date, v.end_date::date, v.max_uses::int, v.used_count::int, v.is_active::boolean
   FROM (VALUES
     ('tenone', '신규가입 10% 할인', 'WELCOME10', 'percent', '10', '0', '2026-01-01', '2026-12-31', '1000', '42', 'true'),
     ('tenone', '3만원 이상 5천원 할인', 'SPRING5K', 'fixed', '5000', '30000', '2026-03-01', '2026-04-30', '500', '128', 'true'),
     ('tenone', 'MADLeague 멤버 15% 할인', 'MAD15', 'percent', '15', '0', '2026-01-01', '2026-12-31', '200', '67', 'true'),
     ('tenone', '시즌 오프 20% 세일', 'OFF20', 'percent', '20', '0', '2025-12-01', '2026-01-31', '300', '289', 'false')
   ) AS v(site, name, code, type, value, min_order, start_date, end_date, max_uses, used_count, is_active)
   WHERE NOT EXISTS (SELECT 1 FROM promotions WHERE promotions.code = v.code)`
];

(async () => {
  for (let i = 0; i < queries.length; i++) {
    const r = await runSQL(queries[i]);
    const short = queries[i].substring(0, 50).replace(/\n/g, ' ');
    const ok = [200, 201].includes(r.status);
    console.log(`${i+1}/${queries.length} ${ok ? 'OK' : 'ERR'} ${short}${ok ? '' : '\n  -> ' + r.body.substring(0, 200)}`);
  }
  console.log('Done.');
})();
