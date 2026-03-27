-- ============================================
-- WIO Networking Module
-- Badak-style networking events & RSVPs
-- ============================================

-- networking_events table
CREATE TABLE IF NOT EXISTS networking_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT DEFAULT 'meetup', -- meetup, party, workshop, conference
    status TEXT DEFAULT 'draft', -- draft, upcoming, open, ongoing, completed
    location TEXT,
    online_url TEXT,
    start_at TIMESTAMPTZ,
    end_at TIMESTAMPTZ,
    max_attendees INT,
    ticket_price INT DEFAULT 0, -- 0 = free
    cover_image TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- networking_rsvps table
CREATE TABLE IF NOT EXISTS networking_rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES networking_events(id) ON DELETE CASCADE,
    user_id UUID,
    name TEXT NOT NULL,
    email TEXT,
    company TEXT,
    position TEXT,
    status TEXT DEFAULT 'registered', -- registered, confirmed, attended, cancelled
    checked_in_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE networking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE networking_rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events_read" ON networking_events FOR SELECT USING (true);
CREATE POLICY "events_write" ON networking_events FOR INSERT WITH CHECK (true);
CREATE POLICY "events_update" ON networking_events FOR UPDATE USING (true);
CREATE POLICY "rsvps_read" ON networking_rsvps FOR SELECT USING (true);
CREATE POLICY "rsvps_write" ON networking_rsvps FOR INSERT WITH CHECK (true);
CREATE POLICY "rsvps_update" ON networking_rsvps FOR UPDATE USING (true);
