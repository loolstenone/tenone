-- myverse_works: 업무 (Work) 단위
CREATE TABLE IF NOT EXISTS myverse_works (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id   UUID    NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  title       TEXT    NOT NULL,
  description TEXT,
  start_date  DATE,
  due_date    DATE,
  color       TEXT    DEFAULT '#3B82F6',
  status      TEXT    DEFAULT 'active' CHECK (status IN ('active','completed','archived')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_myverse_works_member ON myverse_works(member_id);

ALTER TABLE myverse_works ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS myverse_works_self ON myverse_works;
CREATE POLICY myverse_works_self ON myverse_works
  FOR ALL USING (member_id = (
    SELECT id FROM members WHERE auth_id = auth.uid() LIMIT 1
  ));

-- myverse_work_tasks: 업무 안의 Task
CREATE TABLE IF NOT EXISTS myverse_work_tasks (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  work_id     UUID    NOT NULL REFERENCES myverse_works(id) ON DELETE CASCADE,
  member_id   UUID    NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  title       TEXT    NOT NULL,
  due_date    DATE,
  due_time    TEXT,                       -- HH:MM
  assignee    TEXT,                       -- 누구와
  method      TEXT,                       -- 어떻게 (계획)
  -- 경중완급 사분면: 급중|급경|완중|완경
  quadrant    TEXT    DEFAULT '완중'
              CHECK (quadrant IN ('급중','급경','완중','완경')),
  status      TEXT    DEFAULT 'todo'
              CHECK (status IN ('todo','done','cancelled')),
  memo        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_myverse_work_tasks_work   ON myverse_work_tasks(work_id);
CREATE INDEX IF NOT EXISTS idx_myverse_work_tasks_member ON myverse_work_tasks(member_id);
CREATE INDEX IF NOT EXISTS idx_myverse_work_tasks_date   ON myverse_work_tasks(due_date);

ALTER TABLE myverse_work_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS myverse_work_tasks_self ON myverse_work_tasks;
CREATE POLICY myverse_work_tasks_self ON myverse_work_tasks
  FOR ALL USING (member_id = (
    SELECT id FROM members WHERE auth_id = auth.uid() LIMIT 1
  ));
