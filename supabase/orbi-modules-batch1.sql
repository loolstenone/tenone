-- =============================================================================
-- WIO Orbi Modules - Batch 1
-- HR / Finance / Communication / Partner / System
-- Run in Supabase SQL Editor
-- =============================================================================

-- =====================
-- 1. HR MODULES
-- =====================

CREATE TABLE IF NOT EXISTS hr_job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  title TEXT NOT NULL,
  department TEXT,
  level TEXT,
  description TEXT,
  status TEXT DEFAULT 'open',
  deadline TIMESTAMPTZ,
  applicants_count INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hr_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  status TEXT DEFAULT 'normal',
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hr_payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  user_id UUID NOT NULL,
  month TEXT NOT NULL,
  base_salary INTEGER DEFAULT 0,
  allowance INTEGER DEFAULT 0,
  deduction INTEGER DEFAULT 0,
  net_pay INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hr_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  user_id UUID NOT NULL,
  period TEXT NOT NULL,
  what_score DECIMAL,
  how_score DECIMAL,
  total_score DECIMAL,
  grade TEXT,
  evaluator_id UUID,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hr_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  from_user_id UUID NOT NULL,
  to_user_id UUID NOT NULL,
  type TEXT NOT NULL,
  core_value TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hr_org_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  parent_id UUID,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'team',
  head_name TEXT,
  headcount INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- 2. FINANCE MODULES
-- =====================

CREATE TABLE IF NOT EXISTS fin_journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  debit_account TEXT,
  credit_account TEXT,
  amount INTEGER NOT NULL,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fin_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  type TEXT NOT NULL,
  counterparty TEXT NOT NULL,
  amount INTEGER NOT NULL,
  tax_amount INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  due_date DATE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fin_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  department TEXT NOT NULL,
  year INTEGER NOT NULL,
  quarter INTEGER,
  allocated INTEGER DEFAULT 0,
  spent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fin_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  acquisition_cost INTEGER DEFAULT 0,
  depreciation INTEGER DEFAULT 0,
  book_value INTEGER DEFAULT 0,
  acquired_at DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fin_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  title TEXT NOT NULL,
  counterparty TEXT,
  amount INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- 3. COMMUNICATION MODULES
-- =====================

CREATE TABLE IF NOT EXISTS comm_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'text',
  file_url TEXT,
  file_name TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comm_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name TEXT,
  type TEXT DEFAULT 'dm',
  members UUID[] DEFAULT '{}',
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comm_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  all_day BOOLEAN DEFAULT false,
  location TEXT,
  color TEXT DEFAULT '#6366F1',
  attendees UUID[] DEFAULT '{}',
  recurrence TEXT,
  reminder INTEGER,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comm_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  folder TEXT DEFAULT 'general',
  category TEXT,
  version INTEGER DEFAULT 1,
  created_by UUID,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comm_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- 4. PARTNER MODULE
-- =====================

CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'vendor',
  grade TEXT,
  score DECIMAL,
  contact_name TEXT,
  contact_email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- 5. SYSTEM MODULES
-- =====================

CREATE TABLE IF NOT EXISTS sys_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  user_id UUID,
  user_name TEXT,
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  detail TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sys_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  trigger_type TEXT,
  steps JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE hr_job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_org_units ENABLE ROW LEVEL SECURITY;

ALTER TABLE fin_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE fin_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE fin_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE fin_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE fin_contracts ENABLE ROW LEVEL SECURITY;

ALTER TABLE comm_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE comm_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE comm_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE comm_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE comm_notifications ENABLE ROW LEVEL SECURITY;

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

ALTER TABLE sys_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sys_workflows ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- OPEN POLICIES (replace with tenant-based policies later)
-- =============================================================================

CREATE POLICY "hr_job_postings_all" ON hr_job_postings FOR ALL USING (true);
CREATE POLICY "hr_attendance_all" ON hr_attendance FOR ALL USING (true);
CREATE POLICY "hr_payroll_all" ON hr_payroll FOR ALL USING (true);
CREATE POLICY "hr_evaluations_all" ON hr_evaluations FOR ALL USING (true);
CREATE POLICY "hr_feedback_all" ON hr_feedback FOR ALL USING (true);
CREATE POLICY "hr_org_units_all" ON hr_org_units FOR ALL USING (true);

CREATE POLICY "fin_journals_all" ON fin_journals FOR ALL USING (true);
CREATE POLICY "fin_invoices_all" ON fin_invoices FOR ALL USING (true);
CREATE POLICY "fin_budgets_all" ON fin_budgets FOR ALL USING (true);
CREATE POLICY "fin_assets_all" ON fin_assets FOR ALL USING (true);
CREATE POLICY "fin_contracts_all" ON fin_contracts FOR ALL USING (true);

CREATE POLICY "comm_messages_all" ON comm_messages FOR ALL USING (true);
CREATE POLICY "comm_conversations_all" ON comm_conversations FOR ALL USING (true);
CREATE POLICY "comm_events_all" ON comm_events FOR ALL USING (true);
CREATE POLICY "comm_documents_all" ON comm_documents FOR ALL USING (true);
CREATE POLICY "comm_notifications_all" ON comm_notifications FOR ALL USING (true);

CREATE POLICY "partners_all" ON partners FOR ALL USING (true);

CREATE POLICY "sys_audit_logs_all" ON sys_audit_logs FOR ALL USING (true);
CREATE POLICY "sys_workflows_all" ON sys_workflows FOR ALL USING (true);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- HR indexes
CREATE INDEX idx_hr_job_postings_tenant ON hr_job_postings(tenant_id);
CREATE INDEX idx_hr_job_postings_status ON hr_job_postings(tenant_id, status);
CREATE INDEX idx_hr_attendance_tenant ON hr_attendance(tenant_id);
CREATE INDEX idx_hr_attendance_user ON hr_attendance(tenant_id, user_id, date);
CREATE INDEX idx_hr_payroll_tenant ON hr_payroll(tenant_id);
CREATE INDEX idx_hr_payroll_user ON hr_payroll(tenant_id, user_id, month);
CREATE INDEX idx_hr_evaluations_tenant ON hr_evaluations(tenant_id);
CREATE INDEX idx_hr_evaluations_user ON hr_evaluations(tenant_id, user_id);
CREATE INDEX idx_hr_feedback_tenant ON hr_feedback(tenant_id);
CREATE INDEX idx_hr_feedback_to ON hr_feedback(tenant_id, to_user_id);
CREATE INDEX idx_hr_org_units_tenant ON hr_org_units(tenant_id);
CREATE INDEX idx_hr_org_units_parent ON hr_org_units(tenant_id, parent_id);

-- Finance indexes
CREATE INDEX idx_fin_journals_tenant ON fin_journals(tenant_id);
CREATE INDEX idx_fin_journals_date ON fin_journals(tenant_id, date);
CREATE INDEX idx_fin_invoices_tenant ON fin_invoices(tenant_id);
CREATE INDEX idx_fin_invoices_status ON fin_invoices(tenant_id, status);
CREATE INDEX idx_fin_budgets_tenant ON fin_budgets(tenant_id);
CREATE INDEX idx_fin_budgets_dept ON fin_budgets(tenant_id, department, year);
CREATE INDEX idx_fin_assets_tenant ON fin_assets(tenant_id);
CREATE INDEX idx_fin_contracts_tenant ON fin_contracts(tenant_id);
CREATE INDEX idx_fin_contracts_status ON fin_contracts(tenant_id, status);

-- Communication indexes
CREATE INDEX idx_comm_messages_tenant ON comm_messages(tenant_id);
CREATE INDEX idx_comm_messages_conv ON comm_messages(conversation_id, created_at);
CREATE INDEX idx_comm_conversations_tenant ON comm_conversations(tenant_id);
CREATE INDEX idx_comm_events_tenant ON comm_events(tenant_id);
CREATE INDEX idx_comm_events_range ON comm_events(tenant_id, start_at, end_at);
CREATE INDEX idx_comm_documents_tenant ON comm_documents(tenant_id);
CREATE INDEX idx_comm_documents_folder ON comm_documents(tenant_id, folder);
CREATE INDEX idx_comm_notifications_tenant ON comm_notifications(tenant_id);
CREATE INDEX idx_comm_notifications_user ON comm_notifications(user_id, is_read, created_at);

-- Partner indexes
CREATE INDEX idx_partners_tenant ON partners(tenant_id);
CREATE INDEX idx_partners_type ON partners(tenant_id, type);

-- System indexes
CREATE INDEX idx_sys_audit_logs_tenant ON sys_audit_logs(tenant_id);
CREATE INDEX idx_sys_audit_logs_created ON sys_audit_logs(tenant_id, created_at);
CREATE INDEX idx_sys_audit_logs_module ON sys_audit_logs(tenant_id, module);
CREATE INDEX idx_sys_workflows_tenant ON sys_workflows(tenant_id);
