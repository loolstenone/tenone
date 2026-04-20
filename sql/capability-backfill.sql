-- Capability 데이터 백필
-- 기존 Jakka / Badak / MADLeague 회원 → member_capability_roles 이관
-- 실행 이력: 2026-04-20

-- ── 1. Jakka 크리에이터 → portfolio/creator ──
INSERT INTO member_capability_roles (member_id, brand_id, capability_key, role)
SELECT m.id, 'jakka', 'portfolio', 'creator'
FROM jakka_creators jc
JOIN members m ON m.auth_id = jc.user_id
WHERE NOT EXISTS (
    SELECT 1 FROM member_capability_roles x
    WHERE x.member_id = m.id
      AND x.brand_id = 'jakka'
      AND x.capability_key = 'portfolio'
      AND x.role = 'creator'
      AND x.valid_until IS NULL
);

-- ── 2. Jakka 크리에이터 → community/member ──
INSERT INTO member_capability_roles (member_id, brand_id, capability_key, role)
SELECT m.id, 'jakka', 'community', 'member'
FROM jakka_creators jc
JOIN members m ON m.auth_id = jc.user_id
WHERE NOT EXISTS (
    SELECT 1 FROM member_capability_roles x
    WHERE x.member_id = m.id
      AND x.brand_id = 'jakka'
      AND x.capability_key = 'community'
      AND x.role = 'member'
      AND x.valid_until IS NULL
);

-- ── 3. Badak 프로필 → community/member ──
INSERT INTO member_capability_roles (member_id, brand_id, capability_key, role)
SELECT m.id, 'badak', 'community', 'member'
FROM badak_profiles bp
JOIN members m ON m.auth_id = bp.id
WHERE bp.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM member_capability_roles x
    WHERE x.member_id = m.id
      AND x.brand_id = 'badak'
      AND x.capability_key = 'community'
      AND x.role = 'member'
      AND x.valid_until IS NULL
);

-- ── 4. Badak 프로필 → meetup/participant ──
INSERT INTO member_capability_roles (member_id, brand_id, capability_key, role)
SELECT m.id, 'badak', 'meetup', 'participant'
FROM badak_profiles bp
JOIN members m ON m.auth_id = bp.id
WHERE bp.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM member_capability_roles x
    WHERE x.member_id = m.id
      AND x.brand_id = 'badak'
      AND x.capability_key = 'meetup'
      AND x.role = 'participant'
      AND x.valid_until IS NULL
);

-- ── 5. MADLeague 승인 지원자 → club/현역 ──
INSERT INTO member_capability_roles (member_id, brand_id, capability_key, role)
SELECT m.id, 'madleague', 'club', '현역'
FROM mad_applications ma
JOIN members m ON lower(m.email) = lower(ma.email)
WHERE ma.status = 'accepted'
  AND NOT EXISTS (
    SELECT 1 FROM member_capability_roles x
    WHERE x.member_id = m.id
      AND x.brand_id = 'madleague'
      AND x.capability_key = 'club'
      AND x.valid_until IS NULL
);

-- ── 6. MADLeague 승인 지원자 → community/member ──
INSERT INTO member_capability_roles (member_id, brand_id, capability_key, role)
SELECT m.id, 'madleague', 'community', 'member'
FROM mad_applications ma
JOIN members m ON lower(m.email) = lower(ma.email)
WHERE ma.status = 'accepted'
  AND NOT EXISTS (
    SELECT 1 FROM member_capability_roles x
    WHERE x.member_id = m.id
      AND x.brand_id = 'madleague'
      AND x.capability_key = 'community'
      AND x.role = 'member'
      AND x.valid_until IS NULL
);
