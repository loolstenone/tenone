-- ============================================================================
-- STEP 3-B FIX: RLS 정책 (approvals는 drafter_id/approval_line 사용)
-- ============================================================================

-- 결재 (Prod 스키마: drafter_id, approval_line)
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "approvals_select" ON approvals;
CREATE POLICY "approvals_select" ON approvals FOR SELECT USING (
    drafter_id = auth_member_id()
    OR auth_is_staff()
);
DROP POLICY IF EXISTS "approvals_insert" ON approvals;
CREATE POLICY "approvals_insert" ON approvals FOR INSERT WITH CHECK (
    drafter_id = auth_member_id() OR auth_is_staff()
);
DROP POLICY IF EXISTS "approvals_update" ON approvals;
CREATE POLICY "approvals_update" ON approvals FOR UPDATE USING (
    drafter_id = auth_member_id()
    OR auth_is_staff()
);

-- 프로젝트 (모든 staff 읽기 가능)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "projects_select" ON projects;
CREATE POLICY "projects_select" ON projects FOR SELECT USING (auth_is_staff());
DROP POLICY IF EXISTS "projects_insert" ON projects;
CREATE POLICY "projects_insert" ON projects FOR INSERT WITH CHECK (auth_is_staff());
DROP POLICY IF EXISTS "projects_update" ON projects;
CREATE POLICY "projects_update" ON projects FOR UPDATE USING (auth_is_staff());

-- 프로젝트 멤버
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pm_select" ON project_members;
CREATE POLICY "pm_select" ON project_members FOR SELECT USING (
    member_id = auth_member_id() OR auth_is_staff()
);

-- 타임시트
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ts_select" ON timesheets;
CREATE POLICY "ts_select" ON timesheets FOR SELECT USING (
    member_id = auth_member_id() OR auth_is_staff()
);
DROP POLICY IF EXISTS "ts_upsert" ON timesheets;
CREATE POLICY "ts_upsert" ON timesheets FOR ALL USING (
    member_id = auth_member_id() OR auth_is_staff()
);

-- 경비
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "expenses_select" ON expenses;
CREATE POLICY "expenses_select" ON expenses FOR SELECT USING (
    member_id = auth_member_id() OR auth_is_staff()
);
DROP POLICY IF EXISTS "expenses_insert" ON expenses;
CREATE POLICY "expenses_insert" ON expenses FOR INSERT WITH CHECK (
    member_id = auth_member_id() OR auth_is_staff()
);

-- 급여
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "payroll_select" ON payroll;
CREATE POLICY "payroll_select" ON payroll FOR SELECT USING (
    member_id = auth_member_id() OR auth_is_staff()
);

-- 근태
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "attendance_select" ON attendance;
CREATE POLICY "attendance_select" ON attendance FOR SELECT USING (
    member_id = auth_member_id() OR auth_is_staff()
);
DROP POLICY IF EXISTS "attendance_upsert" ON attendance;
CREATE POLICY "attendance_upsert" ON attendance FOR ALL USING (
    member_id = auth_member_id() OR auth_is_staff()
);

-- GPR 목표
ALTER TABLE gpr_goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "gpr_select" ON gpr_goals;
CREATE POLICY "gpr_select" ON gpr_goals FOR SELECT USING (
    member_id = auth_member_id() OR auth_is_staff()
);
DROP POLICY IF EXISTS "gpr_insert" ON gpr_goals;
CREATE POLICY "gpr_insert" ON gpr_goals FOR INSERT WITH CHECK (
    member_id = auth_member_id() OR auth_is_staff()
);
DROP POLICY IF EXISTS "gpr_update" ON gpr_goals;
CREATE POLICY "gpr_update" ON gpr_goals FOR UPDATE USING (
    member_id = auth_member_id() OR auth_is_staff()
);

-- 게시판
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "posts_select" ON posts;
CREATE POLICY "posts_select" ON posts FOR SELECT USING (auth_is_staff());
DROP POLICY IF EXISTS "posts_insert" ON posts;
CREATE POLICY "posts_insert" ON posts FOR INSERT WITH CHECK (auth_is_staff());
DROP POLICY IF EXISTS "posts_update" ON posts;
CREATE POLICY "posts_update" ON posts FOR UPDATE USING (
    author_id = auth_member_id() OR auth_is_staff()
);

-- 댓글
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "comments_select" ON post_comments;
CREATE POLICY "comments_select" ON post_comments FOR SELECT USING (auth_is_staff());
DROP POLICY IF EXISTS "comments_insert" ON post_comments;
CREATE POLICY "comments_insert" ON post_comments FOR INSERT WITH CHECK (auth_is_staff());

-- 이벤트
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "events_select" ON events;
CREATE POLICY "events_select" ON events FOR SELECT USING (auth_is_staff());
DROP POLICY IF EXISTS "events_insert" ON events;
CREATE POLICY "events_insert" ON events FOR INSERT WITH CHECK (auth_is_staff());

-- 알림
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notif_select" ON notifications;
CREATE POLICY "notif_select" ON notifications FOR SELECT USING (
    member_id = auth_member_id()
);

-- 포인트 로그
ALTER TABLE point_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "points_log_select" ON point_logs;
CREATE POLICY "points_log_select" ON point_logs FOR SELECT USING (
    member_id = auth_member_id() OR auth_is_staff()
);

-- 교육 과정
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "courses_select" ON courses;
CREATE POLICY "courses_select" ON courses FOR SELECT USING (true);

-- 수강 이력
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "enrollments_select" ON enrollments;
CREATE POLICY "enrollments_select" ON enrollments FOR SELECT USING (
    member_id = auth_member_id() OR auth_is_staff()
);

-- CRM (staff만)
ALTER TABLE crm_people ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "crm_people_all" ON crm_people;
CREATE POLICY "crm_people_all" ON crm_people FOR ALL USING (auth_is_staff());

ALTER TABLE crm_organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "crm_orgs_all" ON crm_organizations;
CREATE POLICY "crm_orgs_all" ON crm_organizations FOR ALL USING (auth_is_staff());

ALTER TABLE crm_org_contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "crm_oc_all" ON crm_org_contacts;
CREATE POLICY "crm_oc_all" ON crm_org_contacts FOR ALL USING (auth_is_staff());

ALTER TABLE crm_deals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "crm_deals_all" ON crm_deals;
CREATE POLICY "crm_deals_all" ON crm_deals FOR ALL USING (auth_is_staff());

ALTER TABLE crm_activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "crm_activities_all" ON crm_activities;
CREATE POLICY "crm_activities_all" ON crm_activities FOR ALL USING (auth_is_staff());

-- Marketing (staff만)
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mkt_campaigns_all" ON marketing_campaigns;
CREATE POLICY "mkt_campaigns_all" ON marketing_campaigns FOR ALL USING (auth_is_staff());

ALTER TABLE marketing_leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mkt_leads_all" ON marketing_leads;
CREATE POLICY "mkt_leads_all" ON marketing_leads FOR ALL USING (auth_is_staff());

ALTER TABLE marketing_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mkt_content_all" ON marketing_content;
CREATE POLICY "mkt_content_all" ON marketing_content FOR ALL USING (auth_is_staff());

-- 설정
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "settings_own" ON user_settings;
CREATE POLICY "settings_own" ON user_settings FOR ALL USING (
    member_id = auth_member_id()
);

SELECT 'STEP 3-B FIX DONE: All RLS policies applied (approvals uses drafter_id)' AS result;
