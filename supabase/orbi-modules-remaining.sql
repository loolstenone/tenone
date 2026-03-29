-- =============================================================================
-- WIO Orbi Modules - Remaining Tables
-- Strategy / Sales / BD / HR Extensions / Production / Data-BI /
-- Workflow / Culture / System / Holding
-- Run in Supabase SQL Editor (idempotent)
-- =============================================================================

-- =====================
-- 1. STRATEGY
-- =====================

CREATE TABLE IF NOT EXISTS wio_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'annual',
  content JSONB DEFAULT '{}',
  fiscal_year INTEGER NOT NULL,
  status TEXT DEFAULT 'draft',
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wio_kpi_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  strategy_id UUID REFERENCES wio_strategies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_value DECIMAL NOT NULL,
  current_value DECIMAL DEFAULT 0,
  unit TEXT DEFAULT '%',
  period TEXT NOT NULL,
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- 2. SALES
-- =====================

CREATE TABLE IF NOT EXISTS wio_sales_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  company TEXT,
  value INTEGER DEFAULT 0,
  stage TEXT DEFAULT 'lead',
  probability INTEGER DEFAULT 0,
  assigned_to UUID,
  expected_close DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wio_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  pipeline_id UUID REFERENCES wio_sales_pipeline(id) ON DELETE SET NULL,
  quote_number TEXT NOT NULL,
  items JSONB DEFAULT '[]',
  subtotal INTEGER DEFAULT 0,
  tax INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',
  valid_until DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wio_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  quote_id UUID REFERENCES wio_quotes(id) ON DELETE SET NULL,
  order_number TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  delivery_date DATE,
  total INTEGER DEFAULT 0,
  payment_status TEXT DEFAULT 'unpaid',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- 3. BD (Business Development)
-- =====================

CREATE TABLE IF NOT EXISTS wio_bd_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  market_size TEXT,
  feasibility_score DECIMAL,
  stage TEXT DEFAULT 'research',
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- 4. HR EXTENSIONS
-- =====================

CREATE TABLE IF NOT EXISTS wio_work_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  title TEXT NOT NULL,
  assignee_id UUID NOT NULL,
  delegator_id UUID,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wio_incentive_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'bonus',
  formula JSONB DEFAULT '{}',
  effective_from DATE,
  effective_to DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wio_incentive_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  member_id UUID NOT NULL,
  policy_id UUID REFERENCES wio_incentive_policies(id) ON DELETE SET NULL,
  period TEXT NOT NULL,
  amount INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wio_recognitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  from_member_id UUID NOT NULL,
  to_member_id UUID NOT NULL,
  badge_type TEXT DEFAULT 'kudos',
  message TEXT,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- 5. PRODUCTION / SCM
-- =====================

CREATE TABLE IF NOT EXISTS wio_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  contact JSONB DEFAULT '{}',
  category TEXT,
  rating DECIMAL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wio_purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  po_number TEXT NOT NULL,
  supplier_id UUID REFERENCES wio_suppliers(id) ON DELETE SET NULL,
  items JSONB DEFAULT '[]',
  total INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',
  requester_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wio_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  item_name TEXT NOT NULL,
  sku TEXT,
  quantity INTEGER DEFAULT 0,
  unit TEXT DEFAULT 'ea',
  min_stock INTEGER DEFAULT 0,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wio_inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  inventory_id UUID REFERENCES wio_inventory(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  reference TEXT,
  member_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wio_production_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'planned',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wio_quality_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  type TEXT NOT NULL,
  product_id UUID,
  result TEXT DEFAULT 'pending',
  inspector_id UUID,
  inspected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wio_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  type TEXT,
  status TEXT DEFAULT 'active',
  last_maintenance DATE,
  next_maintenance DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- 6. DATA / BI
-- =====================

CREATE TABLE IF NOT EXISTS wio_bi_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  metric_key TEXT NOT NULL,
  value DECIMAL NOT NULL,
  period TEXT NOT NULL,
  snapshot_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wio_content_hub (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  source_type TEXT NOT NULL,
  source_id UUID,
  title TEXT NOT NULL,
  preview TEXT,
  tags TEXT[] DEFAULT '{}',
  author_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- 7. WORKFLOW ENGINE
-- =====================

CREATE TABLE IF NOT EXISTS wio_workflow_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  layer TEXT DEFAULT 'module',
  trigger_type TEXT DEFAULT 'manual',
  steps JSONB DEFAULT '[]',
  sla_hours INTEGER,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wio_workflow_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  definition_id UUID REFERENCES wio_workflow_definitions(id) ON DELETE CASCADE,
  current_step INTEGER DEFAULT 0,
  status TEXT DEFAULT 'running',
  started_by UUID,
  context JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- 8. CULTURE
-- =====================

CREATE TABLE IF NOT EXISTS wio_culture_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  weight DECIMAL DEFAULT 1.0,
  behaviors JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wio_culture_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  member_id UUID NOT NULL,
  value_id UUID REFERENCES wio_culture_values(id) ON DELETE CASCADE,
  score DECIMAL NOT NULL,
  period TEXT NOT NULL,
  evidence TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wio_culture_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  metric_key TEXT NOT NULL,
  value DECIMAL NOT NULL,
  period TEXT NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- 9. SYSTEM EXTENSIONS
-- =====================

CREATE TABLE IF NOT EXISTS wio_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  parent_id UUID,
  head_id UUID,
  level INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wio_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  level INTEGER DEFAULT 0,
  department_id UUID REFERENCES wio_departments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wio_role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  role TEXT NOT NULL,
  module_key TEXT NOT NULL,
  can_read BOOLEAN DEFAULT true,
  can_write BOOLEAN DEFAULT false,
  can_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wio_system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  config_key TEXT NOT NULL,
  config_value JSONB DEFAULT '{}',
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wio_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  provider TEXT NOT NULL,
  credentials JSONB DEFAULT '{}',
  status TEXT DEFAULT 'inactive',
  last_sync TIMESTAMPTZ,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- 10. HOLDING
-- =====================

CREATE TABLE IF NOT EXISTS wio_holding_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  brand_name TEXT NOT NULL,
  category TEXT,
  status TEXT DEFAULT 'active',
  metrics JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wio_market_intel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'news',
  content TEXT,
  source TEXT,
  tags TEXT[] DEFAULT '{}',
  relevance_score DECIMAL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

-- Strategy
ALTER TABLE wio_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_kpi_targets ENABLE ROW LEVEL SECURITY;

-- Sales
ALTER TABLE wio_sales_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_orders ENABLE ROW LEVEL SECURITY;

-- BD
ALTER TABLE wio_bd_projects ENABLE ROW LEVEL SECURITY;

-- HR Extensions
ALTER TABLE wio_work_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_incentive_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_incentive_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_recognitions ENABLE ROW LEVEL SECURITY;

-- Production
ALTER TABLE wio_purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_production_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_quality_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_equipment ENABLE ROW LEVEL SECURITY;

-- Data/BI
ALTER TABLE wio_bi_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_content_hub ENABLE ROW LEVEL SECURITY;

-- Workflow
ALTER TABLE wio_workflow_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_workflow_instances ENABLE ROW LEVEL SECURITY;

-- Culture
ALTER TABLE wio_culture_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_culture_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_culture_metrics ENABLE ROW LEVEL SECURITY;

-- System
ALTER TABLE wio_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_integrations ENABLE ROW LEVEL SECURITY;

-- Holding
ALTER TABLE wio_holding_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_market_intel ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- OPEN POLICIES (replace with tenant-based RLS later)
-- =============================================================================

-- Strategy
CREATE POLICY "wio_strategies_all" ON wio_strategies FOR ALL USING (true);
CREATE POLICY "wio_kpi_targets_all" ON wio_kpi_targets FOR ALL USING (true);

-- Sales
CREATE POLICY "wio_sales_pipeline_all" ON wio_sales_pipeline FOR ALL USING (true);
CREATE POLICY "wio_quotes_all" ON wio_quotes FOR ALL USING (true);
CREATE POLICY "wio_orders_all" ON wio_orders FOR ALL USING (true);

-- BD
CREATE POLICY "wio_bd_projects_all" ON wio_bd_projects FOR ALL USING (true);

-- HR Extensions
CREATE POLICY "wio_work_assignments_all" ON wio_work_assignments FOR ALL USING (true);
CREATE POLICY "wio_incentive_policies_all" ON wio_incentive_policies FOR ALL USING (true);
CREATE POLICY "wio_incentive_records_all" ON wio_incentive_records FOR ALL USING (true);
CREATE POLICY "wio_recognitions_all" ON wio_recognitions FOR ALL USING (true);

-- Production
CREATE POLICY "wio_purchase_orders_all" ON wio_purchase_orders FOR ALL USING (true);
CREATE POLICY "wio_suppliers_all" ON wio_suppliers FOR ALL USING (true);
CREATE POLICY "wio_inventory_all" ON wio_inventory FOR ALL USING (true);
CREATE POLICY "wio_inventory_movements_all" ON wio_inventory_movements FOR ALL USING (true);
CREATE POLICY "wio_production_plans_all" ON wio_production_plans FOR ALL USING (true);
CREATE POLICY "wio_quality_inspections_all" ON wio_quality_inspections FOR ALL USING (true);
CREATE POLICY "wio_equipment_all" ON wio_equipment FOR ALL USING (true);

-- Data/BI
CREATE POLICY "wio_bi_snapshots_all" ON wio_bi_snapshots FOR ALL USING (true);
CREATE POLICY "wio_content_hub_all" ON wio_content_hub FOR ALL USING (true);

-- Workflow
CREATE POLICY "wio_workflow_definitions_all" ON wio_workflow_definitions FOR ALL USING (true);
CREATE POLICY "wio_workflow_instances_all" ON wio_workflow_instances FOR ALL USING (true);

-- Culture
CREATE POLICY "wio_culture_values_all" ON wio_culture_values FOR ALL USING (true);
CREATE POLICY "wio_culture_scores_all" ON wio_culture_scores FOR ALL USING (true);
CREATE POLICY "wio_culture_metrics_all" ON wio_culture_metrics FOR ALL USING (true);

-- System
CREATE POLICY "wio_departments_all" ON wio_departments FOR ALL USING (true);
CREATE POLICY "wio_positions_all" ON wio_positions FOR ALL USING (true);
CREATE POLICY "wio_role_permissions_all" ON wio_role_permissions FOR ALL USING (true);
CREATE POLICY "wio_system_config_all" ON wio_system_config FOR ALL USING (true);
CREATE POLICY "wio_integrations_all" ON wio_integrations FOR ALL USING (true);

-- Holding
CREATE POLICY "wio_holding_brands_all" ON wio_holding_brands FOR ALL USING (true);
CREATE POLICY "wio_market_intel_all" ON wio_market_intel FOR ALL USING (true);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Strategy
CREATE INDEX idx_wio_strategies_tenant ON wio_strategies(tenant_id);
CREATE INDEX idx_wio_strategies_year ON wio_strategies(tenant_id, fiscal_year);
CREATE INDEX idx_wio_kpi_targets_tenant ON wio_kpi_targets(tenant_id);
CREATE INDEX idx_wio_kpi_targets_strategy ON wio_kpi_targets(strategy_id);

-- Sales
CREATE INDEX idx_wio_sales_pipeline_tenant ON wio_sales_pipeline(tenant_id);
CREATE INDEX idx_wio_sales_pipeline_stage ON wio_sales_pipeline(tenant_id, stage);
CREATE INDEX idx_wio_sales_pipeline_assigned ON wio_sales_pipeline(tenant_id, assigned_to);
CREATE INDEX idx_wio_quotes_tenant ON wio_quotes(tenant_id);
CREATE INDEX idx_wio_quotes_pipeline ON wio_quotes(pipeline_id);
CREATE INDEX idx_wio_quotes_status ON wio_quotes(tenant_id, status);
CREATE INDEX idx_wio_orders_tenant ON wio_orders(tenant_id);
CREATE INDEX idx_wio_orders_status ON wio_orders(tenant_id, status);

-- BD
CREATE INDEX idx_wio_bd_projects_tenant ON wio_bd_projects(tenant_id);
CREATE INDEX idx_wio_bd_projects_stage ON wio_bd_projects(tenant_id, stage);

-- HR Extensions
CREATE INDEX idx_wio_work_assignments_tenant ON wio_work_assignments(tenant_id);
CREATE INDEX idx_wio_work_assignments_assignee ON wio_work_assignments(tenant_id, assignee_id);
CREATE INDEX idx_wio_work_assignments_status ON wio_work_assignments(tenant_id, status);
CREATE INDEX idx_wio_incentive_policies_tenant ON wio_incentive_policies(tenant_id);
CREATE INDEX idx_wio_incentive_records_tenant ON wio_incentive_records(tenant_id);
CREATE INDEX idx_wio_incentive_records_member ON wio_incentive_records(tenant_id, member_id);
CREATE INDEX idx_wio_recognitions_tenant ON wio_recognitions(tenant_id);
CREATE INDEX idx_wio_recognitions_to ON wio_recognitions(tenant_id, to_member_id);

-- Production
CREATE INDEX idx_wio_purchase_orders_tenant ON wio_purchase_orders(tenant_id);
CREATE INDEX idx_wio_purchase_orders_status ON wio_purchase_orders(tenant_id, status);
CREATE INDEX idx_wio_suppliers_tenant ON wio_suppliers(tenant_id);
CREATE INDEX idx_wio_suppliers_category ON wio_suppliers(tenant_id, category);
CREATE INDEX idx_wio_inventory_tenant ON wio_inventory(tenant_id);
CREATE INDEX idx_wio_inventory_sku ON wio_inventory(tenant_id, sku);
CREATE INDEX idx_wio_inventory_movements_tenant ON wio_inventory_movements(tenant_id);
CREATE INDEX idx_wio_inventory_movements_inv ON wio_inventory_movements(inventory_id);
CREATE INDEX idx_wio_production_plans_tenant ON wio_production_plans(tenant_id);
CREATE INDEX idx_wio_production_plans_status ON wio_production_plans(tenant_id, status);
CREATE INDEX idx_wio_quality_inspections_tenant ON wio_quality_inspections(tenant_id);
CREATE INDEX idx_wio_equipment_tenant ON wio_equipment(tenant_id);
CREATE INDEX idx_wio_equipment_status ON wio_equipment(tenant_id, status);

-- Data/BI
CREATE INDEX idx_wio_bi_snapshots_tenant ON wio_bi_snapshots(tenant_id);
CREATE INDEX idx_wio_bi_snapshots_key ON wio_bi_snapshots(tenant_id, metric_key, period);
CREATE INDEX idx_wio_content_hub_tenant ON wio_content_hub(tenant_id);
CREATE INDEX idx_wio_content_hub_source ON wio_content_hub(tenant_id, source_type);

-- Workflow
CREATE INDEX idx_wio_workflow_definitions_tenant ON wio_workflow_definitions(tenant_id);
CREATE INDEX idx_wio_workflow_definitions_status ON wio_workflow_definitions(tenant_id, status);
CREATE INDEX idx_wio_workflow_instances_tenant ON wio_workflow_instances(tenant_id);
CREATE INDEX idx_wio_workflow_instances_def ON wio_workflow_instances(definition_id);
CREATE INDEX idx_wio_workflow_instances_status ON wio_workflow_instances(tenant_id, status);

-- Culture
CREATE INDEX idx_wio_culture_values_tenant ON wio_culture_values(tenant_id);
CREATE INDEX idx_wio_culture_scores_tenant ON wio_culture_scores(tenant_id);
CREATE INDEX idx_wio_culture_scores_member ON wio_culture_scores(tenant_id, member_id);
CREATE INDEX idx_wio_culture_scores_value ON wio_culture_scores(value_id);
CREATE INDEX idx_wio_culture_metrics_tenant ON wio_culture_metrics(tenant_id);
CREATE INDEX idx_wio_culture_metrics_key ON wio_culture_metrics(tenant_id, metric_key, period);

-- System
CREATE INDEX idx_wio_departments_tenant ON wio_departments(tenant_id);
CREATE INDEX idx_wio_departments_parent ON wio_departments(tenant_id, parent_id);
CREATE INDEX idx_wio_positions_tenant ON wio_positions(tenant_id);
CREATE INDEX idx_wio_positions_dept ON wio_positions(department_id);
CREATE INDEX idx_wio_role_permissions_tenant ON wio_role_permissions(tenant_id);
CREATE INDEX idx_wio_role_permissions_role ON wio_role_permissions(tenant_id, role);
CREATE INDEX idx_wio_system_config_tenant ON wio_system_config(tenant_id);
CREATE INDEX idx_wio_system_config_key ON wio_system_config(tenant_id, config_key);
CREATE INDEX idx_wio_integrations_tenant ON wio_integrations(tenant_id);
CREATE INDEX idx_wio_integrations_provider ON wio_integrations(tenant_id, provider);

-- Holding
CREATE INDEX idx_wio_holding_brands_tenant ON wio_holding_brands(tenant_id);
CREATE INDEX idx_wio_holding_brands_status ON wio_holding_brands(tenant_id, status);
CREATE INDEX idx_wio_market_intel_tenant ON wio_market_intel(tenant_id);
CREATE INDEX idx_wio_market_intel_type ON wio_market_intel(tenant_id, type);

-- =============================================================================
-- UNIQUE CONSTRAINTS
-- =============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS uq_wio_system_config_key ON wio_system_config(tenant_id, config_key);
CREATE UNIQUE INDEX IF NOT EXISTS uq_wio_role_permissions_role_module ON wio_role_permissions(tenant_id, role, module_key);
CREATE UNIQUE INDEX IF NOT EXISTS uq_wio_inventory_sku ON wio_inventory(tenant_id, sku) WHERE sku IS NOT NULL;
