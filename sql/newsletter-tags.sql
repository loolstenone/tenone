-- subscriber_tags: 구독자에게 태그를 부여하여 세그먼트 관리
CREATE TABLE IF NOT EXISTS subscriber_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID NOT NULL REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(subscriber_id, tag)
);
CREATE INDEX IF NOT EXISTS idx_subscriber_tags_tag ON subscriber_tags(tag);
CREATE INDEX IF NOT EXISTS idx_subscriber_tags_subscriber ON subscriber_tags(subscriber_id);

-- RLS
ALTER TABLE subscriber_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_all_subscriber_tags" ON subscriber_tags
  FOR ALL USING (
    EXISTS (SELECT 1 FROM members WHERE auth_id = auth.uid() AND role IN ('super_admin', 'admin'))
  );

-- newsletter_issues에 발송 메타 컬럼 추가
ALTER TABLE newsletter_issues ADD COLUMN IF NOT EXISTS from_name TEXT;
ALTER TABLE newsletter_issues ADD COLUMN IF NOT EXISTS target_site_ids UUID[];
ALTER TABLE newsletter_issues ADD COLUMN IF NOT EXISTS target_tags TEXT[];
