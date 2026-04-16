-- MADLeague 경쟁PT 수상작 아카이브 데이터 삽입
-- 2024~2025 실적

DO $$
DECLARE
  v_comp_id UUID;
  v_abc     UUID := (SELECT id FROM mad_clubs WHERE slug = 'abc'     LIMIT 1);
  v_madleap UUID := (SELECT id FROM mad_clubs WHERE slug = 'madleap' LIMIT 1);
  v_adlle   UUID := (SELECT id FROM mad_clubs WHERE slug = 'adlle'   LIMIT 1);
  v_pam     UUID := (SELECT id FROM mad_clubs WHERE slug = 'pam'     LIMIT 1);
BEGIN

  -- ─── 2025년 2차: 리제로스 ──────────────────────────────────────────
  INSERT INTO mad_competitions (tenant_id, title, client_name, year, status, presentation_date)
  VALUES ('tenone',
          '2025년 2차 경쟁PT — 리제로스',
          '리제로스',
          2025,
          'completed',
          '2025-10-01')
  RETURNING id INTO v_comp_id;

  INSERT INTO mad_competition_results (competition_id, club_id, team_name, rank, is_crown, award_name)
  VALUES
    (v_comp_id, v_abc,     'ABC 팀',     1, true,  'MAD Crown'),
    (v_comp_id, v_madleap, 'MADLeap 팀', 2, false, '은상'),
    (v_comp_id, v_adlle,   'ADlle 팀',   3, false, '동상');

  -- ─── 2025년 1차: 대성학원 ──────────────────────────────────────────
  INSERT INTO mad_competitions (tenant_id, title, client_name, year, status, presentation_date)
  VALUES ('tenone',
          '2025년 1차 경쟁PT — 대성학원',
          '대성학원',
          2025,
          'completed',
          '2025-04-01')
  RETURNING id INTO v_comp_id;

  INSERT INTO mad_competition_results (competition_id, club_id, team_name, rank, is_crown, award_name)
  VALUES
    (v_comp_id, v_abc,     'ABC 팀',     1, true,  'MAD Crown'),
    (v_comp_id, v_adlle,   'ADlle 팀',   2, false, '은상'),
    (v_comp_id, v_madleap, 'MADLeap 팀', 3, false, '동상'),
    (v_comp_id, v_pam,     'PAM 팀',     4, false, NULL);

  -- ─── 2024년: 지평주조 ─────────────────────────────────────────────
  INSERT INTO mad_competitions (tenant_id, title, client_name, year, status, presentation_date)
  VALUES ('tenone',
          '2024년 경쟁PT — 지평주조',
          '지평주조',
          2024,
          'completed',
          '2024-10-01')
  RETURNING id INTO v_comp_id;

  INSERT INTO mad_competition_results (competition_id, club_id, team_name, rank, is_crown, award_name)
  VALUES
    (v_comp_id, v_adlle,   'ADlle 팀',   1, true,  'MAD Crown'),
    (v_comp_id, v_madleap, 'MADLeap 팀', 2, false, '은상'),
    (v_comp_id, v_pam,     'PAM 팀',     3, false, '동상');

END $$;
