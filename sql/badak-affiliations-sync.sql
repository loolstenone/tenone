-- badak_members → members.affiliations 동기화
-- is_active=true인 기존 badak_members 행을 members.affiliations에 반영

UPDATE members m
SET affiliations = array_append(
  COALESCE(m.affiliations, ARRAY[]::text[]),
  'badak'
)
FROM badak_members bm
WHERE m.auth_id = bm.user_id
  AND bm.is_active = true
  AND NOT (COALESCE(m.affiliations, ARRAY[]::text[]) @> ARRAY['badak']);
