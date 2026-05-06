ALTER TABLE myverse_works ADD COLUMN IF NOT EXISTS quadrant TEXT DEFAULT '완중' CHECK (quadrant IN ('급중','급경','완중','완경'));
