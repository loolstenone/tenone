-- =============================================
-- Dev DB Setup PART 2: RLS + Functions + Triggers
-- Part 1 실행 후 이것을 실행
-- =============================================

-- ── RLS 활성화 ──
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheet_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_org_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- ── Members RLS ──
CREATE POLICY "authenticated_read" ON members FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_update" ON members FOR UPDATE TO authenticated USING (auth_id = auth.uid());
CREATE POLICY "anon_read_members" ON members FOR SELECT TO anon USING (true);

-- ── Projects / Jobs / Project Members ──
CREATE POLICY "authenticated_read" ON projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read" ON jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read" ON project_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "projects_write" ON projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "jobs_write" ON jobs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "project_members_write" ON project_members FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── Approvals ──
CREATE POLICY "authenticated_read" ON approvals FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert" ON approvals FOR INSERT TO authenticated WITH CHECK (true);

-- ── Posts (게시판) ──
CREATE POLICY "posts_read_published" ON posts FOR SELECT USING (status = 'published' OR status = 'draft');
CREATE POLICY "posts_insert" ON posts FOR INSERT WITH CHECK (true);
CREATE POLICY "posts_update" ON posts FOR UPDATE USING (
    auth.uid() = author_id OR author_type = 'guest' OR auth.jwt()->>'role' = 'admin'
);
CREATE POLICY "posts_delete" ON posts FOR DELETE USING (
    auth.uid() = author_id OR auth.jwt()->>'role' = 'admin'
);

-- ── Comments ──
CREATE POLICY "comments_read" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "comments_update" ON comments FOR UPDATE USING (auth.uid() = author_id OR author_type = 'guest');
CREATE POLICY "comments_delete" ON comments FOR DELETE USING (auth.uid() = author_id OR auth.jwt()->>'role' = 'admin');

-- ── Attachments ──
CREATE POLICY "attachments_read" ON attachments FOR SELECT USING (true);
CREATE POLICY "attachments_insert" ON attachments FOR INSERT WITH CHECK (true);

-- ── Likes / Bookmarks ──
CREATE POLICY "likes_read" ON likes FOR SELECT USING (true);
CREATE POLICY "likes_insert" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete" ON likes FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "bookmarks_read" ON bookmarks FOR SELECT USING (true);
CREATE POLICY "bookmarks_insert" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookmarks_delete" ON bookmarks FOR DELETE USING (auth.uid() = user_id);

-- ── Board Configs ──
CREATE POLICY "board_configs_read" ON board_configs FOR SELECT USING (true);
CREATE POLICY "board_configs_write" ON board_configs FOR ALL USING (auth.jwt()->>'role' = 'admin');

-- ── Events / Contents / Courses / Enrollments ──
CREATE POLICY "authenticated_read" ON events FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read" ON contents FOR SELECT TO authenticated USING (true);
CREATE POLICY "public_read_contents" ON contents FOR SELECT TO anon USING (status = 'published');
CREATE POLICY "authenticated_read" ON courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read" ON enrollments FOR SELECT TO authenticated USING (true);

-- ── Library ──
CREATE POLICY "authenticated_read" ON library_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read" ON library_bookmarks FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert" ON library_bookmarks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_delete_bookmarks" ON library_bookmarks FOR DELETE TO authenticated
    USING (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

-- ── Notifications ──
CREATE POLICY "authenticated_read" ON notifications FOR SELECT TO authenticated
    USING (auth.uid() = (SELECT auth_id FROM members WHERE id = member_id));

-- ── Point Logs ──
CREATE POLICY "authenticated_read" ON point_logs FOR SELECT TO authenticated USING (true);

-- ── Newsletter ──
CREATE POLICY "public_read_newsletter" ON newsletter_subscribers FOR INSERT TO anon WITH CHECK (true);

-- ── Timesheets ──
CREATE POLICY "authenticated_read" ON timesheets FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert" ON timesheets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_read" ON timesheet_weeks FOR SELECT TO authenticated USING (true);

-- ── CRM (전체 접근) ──
CREATE POLICY "crm_people_all" ON crm_people FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "crm_orgs_all" ON crm_organizations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "crm_deals_all" ON crm_deals FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "crm_activities_all" ON crm_activities FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "crm_org_contacts_all" ON crm_org_contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "crm_people_anon_read" ON crm_people FOR SELECT TO anon USING (true);
CREATE POLICY "crm_orgs_anon_read" ON crm_organizations FOR SELECT TO anon USING (true);
CREATE POLICY "crm_deals_anon_read" ON crm_deals FOR SELECT TO anon USING (true);
CREATE POLICY "crm_activities_anon_read" ON crm_activities FOR SELECT TO anon USING (true);
CREATE POLICY "crm_org_contacts_anon_read" ON crm_org_contacts FOR SELECT TO anon USING (true);

-- ── Marketing (전체 접근) ──
CREATE POLICY "auth read campaigns" ON marketing_campaigns FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth read leads" ON marketing_leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth read content" ON marketing_content FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth read deals" ON marketing_deals FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth write campaigns" ON marketing_campaigns FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth write leads" ON marketing_leads FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth write content" ON marketing_content FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth write deals" ON marketing_deals FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── User Settings (본인만) ──
CREATE POLICY "users read own settings" ON user_settings FOR SELECT TO authenticated
    USING (auth.uid() = user_id);
CREATE POLICY "users write own settings" ON user_settings FOR ALL TO authenticated
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =============================================
-- Functions & Triggers (게시판)
-- =============================================

CREATE OR REPLACE FUNCTION increment_post_view(p_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE posts SET view_count = view_count + 1 WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION sync_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET comment_count = (
            SELECT COUNT(*) FROM comments WHERE post_id = NEW.post_id AND status = 'active'
        ) WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET comment_count = (
            SELECT COUNT(*) FROM comments WHERE post_id = OLD.post_id AND status = 'active'
        ) WHERE id = OLD.post_id;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE posts SET comment_count = (
            SELECT COUNT(*) FROM comments WHERE post_id = NEW.post_id AND status = 'active'
        ) WHERE id = NEW.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_sync_comment_count
AFTER INSERT OR UPDATE OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION sync_comment_count();

CREATE OR REPLACE FUNCTION sync_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.target_type = 'post' THEN
            UPDATE posts SET like_count = (
                SELECT COUNT(*) FROM likes WHERE target_type = 'post' AND target_id = NEW.target_id
            ) WHERE id = NEW.target_id;
        ELSIF NEW.target_type = 'comment' THEN
            UPDATE comments SET like_count = (
                SELECT COUNT(*) FROM likes WHERE target_type = 'comment' AND target_id = NEW.target_id
            ) WHERE id = NEW.target_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.target_type = 'post' THEN
            UPDATE posts SET like_count = (
                SELECT COUNT(*) FROM likes WHERE target_type = 'post' AND target_id = OLD.target_id
            ) WHERE id = OLD.target_id;
        ELSIF OLD.target_type = 'comment' THEN
            UPDATE comments SET like_count = (
                SELECT COUNT(*) FROM likes WHERE target_type = 'comment' AND target_id = OLD.target_id
            ) WHERE id = OLD.target_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_sync_like_count
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION sync_like_count();

CREATE OR REPLACE FUNCTION sync_bookmark_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET bookmark_count = (
            SELECT COUNT(*) FROM bookmarks WHERE post_id = NEW.post_id
        ) WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET bookmark_count = (
            SELECT COUNT(*) FROM bookmarks WHERE post_id = OLD.post_id
        ) WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_sync_bookmark_count
AFTER INSERT OR DELETE ON bookmarks
FOR EACH ROW EXECUTE FUNCTION sync_bookmark_count();
