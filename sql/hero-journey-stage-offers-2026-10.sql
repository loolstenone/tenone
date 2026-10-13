-- ============================================================
-- HeRo 성장 단계 — 매칭 인박스 → 받은 제안 통합 (2026-10-13 적용, MCP apply_migration hero_journey_stage_offers)
-- has_match = 제안을 받음(hero_offer_recipients) 또는 옛 hero_matches
-- has_active_match = 제안에 응함(status='accepted') 또는 옛 hero_matches hired/trial
-- 권한: sql/security-definer-rpc-lockdown.sql (REVOKE/GRANT) 그대로
-- ============================================================
CREATE OR REPLACE FUNCTION public.hero_journey_stage(_member_id uuid)
 RETURNS TABLE(stage text, stage_index integer, has_hit_a boolean, has_hit_b boolean, has_resume boolean, has_jh boolean, has_match boolean, has_active_match boolean)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_has_hit_a BOOL;
  v_has_hit_b BOOL;
  v_has_resume BOOL;
  v_has_jh BOOL;
  v_has_match BOOL;
  v_has_active_match BOOL;
  v_stage TEXT;
  v_index INT;
BEGIN
  SELECT EXISTS(SELECT 1 FROM hit_a_results WHERE member_id = _member_id) INTO v_has_hit_a;
  SELECT EXISTS(SELECT 1 FROM hit_b_results WHERE member_id = _member_id) INTO v_has_hit_b;
  v_has_resume := FALSE;
  BEGIN
    SELECT EXISTS(SELECT 1 FROM resumes WHERE member_id = _member_id) INTO v_has_resume;
  EXCEPTION WHEN undefined_table THEN
    v_has_resume := FALSE;
  END;
  SELECT EXISTS(SELECT 1 FROM hero_jh_responses WHERE member_id = _member_id AND status = 'active') INTO v_has_jh;
  SELECT EXISTS(SELECT 1 FROM hero_offer_recipients WHERE member_id = _member_id)
      OR EXISTS(SELECT 1 FROM hero_matches WHERE profile_member_id = _member_id) INTO v_has_match;
  SELECT EXISTS(SELECT 1 FROM hero_offer_recipients WHERE member_id = _member_id AND status = 'accepted')
      OR EXISTS(SELECT 1 FROM hero_matches WHERE profile_member_id = _member_id AND match_status IN ('hired','trial')) INTO v_has_active_match;

  IF v_has_active_match THEN
    v_stage := 'Star'; v_index := 5;
  ELSIF v_has_match AND v_has_jh AND v_has_resume AND v_has_hit_b THEN
    v_stage := 'Debut'; v_index := 4;
  ELSIF v_has_hit_a AND v_has_hit_b AND v_has_resume THEN
    v_stage := 'Trainee'; v_index := 3;
  ELSIF v_has_hit_a THEN
    v_stage := 'Challenger'; v_index := 2;
  ELSE
    v_stage := 'Dreamer'; v_index := 1;
  END IF;

  RETURN QUERY SELECT v_stage, v_index, v_has_hit_a, v_has_hit_b, v_has_resume, v_has_jh, v_has_match, v_has_active_match;
END;
$function$;
