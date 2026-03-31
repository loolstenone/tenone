-- ============================================================
-- approval_templates: 결재라인 템플릿 관리
-- Supabase SQL Editor에서 실행
-- ============================================================

CREATE TABLE IF NOT EXISTS approval_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    brand_id TEXT NOT NULL DEFAULT 'tenone',
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT '기안'
        CHECK (type IN ('기안', '품의', '보고')),
    factor TEXT NOT NULL DEFAULT '일반'
        CHECK (factor IN ('일반', '프로젝트', '타임시트', '경비', '구매', '인사', '계약')),
    steps JSONB NOT NULL DEFAULT '[]',   -- [{"role": "기안자"}, {"role": "팀장"}]
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_approval_templates_brand ON approval_templates(brand_id);
CREATE INDEX IF NOT EXISTS idx_approval_templates_type ON approval_templates(type);
CREATE INDEX IF NOT EXISTS idx_approval_templates_factor ON approval_templates(factor);

ALTER TABLE approval_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "approval_templates_read" ON approval_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "approval_templates_write" ON approval_templates FOR ALL TO authenticated USING (auth_is_staff()) WITH CHECK (auth_is_staff());

-- 기본 템플릿 초기 데이터
INSERT INTO approval_templates (name, type, factor, steps) VALUES
  ('일반 기안', '기안', '일반', '[{"role":"기안자"},{"role":"팀장"},{"role":"부서장"}]'),
  ('경비 품의', '품의', '경비', '[{"role":"기안자"},{"role":"팀장"},{"role":"CFO"}]'),
  ('구매 품의 (100만원 이상)', '품의', '구매', '[{"role":"기안자"},{"role":"팀장"},{"role":"CFO"},{"role":"CEO"}]'),
  ('업무 보고', '보고', '일반', '[{"role":"기안자"},{"role":"팀장"}]'),
  ('타임시트 마감 승인', '보고', '타임시트', '[{"role":"기안자"},{"role":"PM"}]'),
  ('프로젝트 기안', '기안', '프로젝트', '[{"role":"기안자"},{"role":"PM"},{"role":"부서장"},{"role":"CEO"}]'),
  ('채용 기안', '기안', '인사', '[{"role":"기안자"},{"role":"HR 검토"},{"role":"CEO"}]'),
  ('계약 체결', '기안', '계약', '[{"role":"기안자"},{"role":"법무검토"},{"role":"CEO"}]')
ON CONFLICT DO NOTHING;
