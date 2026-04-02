-- ============================================================
-- Phase 0-A: tenant_id 일괄 추가
-- 날짜: 2026-04-03
-- 목적: 8원칙 #6 위반 테이블에 tenant_id 추가 (DEFAULT 'tenone')
-- 원칙: 기존 코드·동작 영향 없음. 격리 구조만 씌운다.
-- ============================================================

-- 제외 대상 (시스템/글로벌 테이블 — tenant_id 불필요):
--   brands          → 글로벌 브랜드 레지스트리
--   site_configs    → 글로벌 사이트 설정
--   wio_tenants     → 테넌트 레지스트리 자체
--   wio_subscription_plans → 플랜 카탈로그
--   sso_tokens      → 인증 인프라

-- ============================================================
-- STEP 1: tenant_id 컬럼 추가 (80개 테이블)
-- ============================================================

-- ERP 핵심
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE payroll ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE timesheets ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE timesheet_weeks ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE gpr_goals ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE biz_plans ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE project_members ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE revenue ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';

-- 사람 (People/Members)
ALTER TABLE members ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE member_roles ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE org_members ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE guests ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE tenone_staff_profiles ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';

-- 에이전트
ALTER TABLE agent_messages ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';

-- 게시판/콘텐츠 (BUMS)
ALTER TABLE board_configs ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE bums_boards ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE bums_comments ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE bums_member_access ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE bums_posts ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE bums_widgets ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE post_attachments ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE post_bookmarks ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE post_comments ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE post_likes ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE contents ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE content_drafts ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE comments ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';

-- 커뮤니케이션
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE chat_threads ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';

-- 교육/코스
ALTER TABLE courses ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';

-- 부킹/이벤트
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE events ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';

-- 기타 공통
ALTER TABLE attachments ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE likes ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE point_logs ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';

-- 뉴스레터/Mindle
ALTER TABLE newsletter_issues ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE mindle_sources ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE mindle_trends ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE digests ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE daily_stats ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE collected_data ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE crawler_status ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE url_archive ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';

-- 브랜드별 프로필 (유니버스 내부)
ALTER TABLE badak_connections ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE badak_feedbacks ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE badak_profiles ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE badak_stars ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE career_profiles ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE hero_profiles ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE madleague_profiles ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE evolution_enrollments ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE evolution_profiles ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE smarcomm_billing_history ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE smarcomm_profiles ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE competition_teams ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';

-- 커머스
ALTER TABLE shop_orders ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE shop_products ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';

-- 네트워킹/봇
ALTER TABLE networking_rsvps ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE bot_responses ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';

-- 기타
ALTER TABLE hit_results ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE library_bookmarks ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE th_insights ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE th_opportunities ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';

-- WIO 누락 테이블
ALTER TABLE wio_chat_messages ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';

-- CRM 누락
ALTER TABLE crm_org_contacts ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone';

-- ============================================================
-- STEP 2: 기존 행 NULL → 'tenone' 채우기
-- ============================================================

DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'approvals','expenses','attendance','payroll','timesheets','timesheet_weeks',
    'gpr_goals','biz_plans','jobs','projects','project_members','revenue',
    'members','member_roles','org_members','guests','tenone_staff_profiles',
    'agent_messages',
    'board_configs','bums_boards','bums_comments','bums_member_access','bums_posts','bums_widgets',
    'posts','post_attachments','post_bookmarks','post_comments','post_likes',
    'contents','content_drafts','comments',
    'chat_messages','chat_threads','notifications',
    'courses','enrollments','bookings','events',
    'attachments','audit_log','bookmarks','likes','point_logs','user_settings',
    'subscriptions','promotions','resumes',
    'newsletter_issues','newsletter_subscribers','mindle_sources','mindle_trends',
    'digests','daily_stats','collected_data','crawler_status','url_archive',
    'badak_connections','badak_feedbacks','badak_profiles','badak_stars',
    'career_profiles','hero_profiles','madleague_profiles',
    'evolution_enrollments','evolution_profiles',
    'smarcomm_billing_history','smarcomm_profiles','competition_teams',
    'shop_orders','shop_products','networking_rsvps','bot_responses',
    'hit_results','library_bookmarks','th_insights','th_opportunities','contact_submissions',
    'wio_chat_messages','crm_org_contacts'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('UPDATE %I SET tenant_id = ''tenone'' WHERE tenant_id IS NULL', t);
  END LOOP;
END $$;

-- ============================================================
-- STEP 3: tenant_id 인덱스 추가 (자주 쿼리되는 핵심 테이블)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_approvals_tenant ON approvals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_expenses_tenant ON expenses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_attendance_tenant ON attendance(tenant_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_tenant ON timesheets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_projects_tenant ON projects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_members_tenant ON members(tenant_id);
CREATE INDEX IF NOT EXISTS idx_posts_tenant ON posts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bums_posts_tenant ON bums_posts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_tenant ON notifications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_chat_threads_tenant ON chat_threads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_wio_chat_messages_tenant ON wio_chat_messages(tenant_id);
