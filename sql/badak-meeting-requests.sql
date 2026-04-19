CREATE TABLE IF NOT EXISTS badak_meeting_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_member_id uuid REFERENCES badak_members(id) ON DELETE CASCADE,
  to_member_id uuid REFERENCES badak_members(id) ON DELETE CASCADE,
  need_id uuid REFERENCES badak_needs(id) ON DELETE CASCADE,
  message text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(from_member_id, to_member_id, need_id)
);

ALTER TABLE badak_meeting_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meeting_requests_select" ON badak_meeting_requests FOR SELECT USING (true);
CREATE POLICY "meeting_requests_insert" ON badak_meeting_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "meeting_requests_update" ON badak_meeting_requests FOR UPDATE USING (true);
