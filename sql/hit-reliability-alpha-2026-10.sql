-- HIT 신뢰도 점검 — 척도별 내적 일관성(Cronbach α) 자동 계산 (R10, 2026-10-12)
-- 근거: docs/HIT_Reliability_Validity_Review_2026-10.md (목표 α ≥ 0.70). 실데이터가 쌓이면 바로 돌려 본다.
-- 대상: 완료 세션(hit_sessions.status='completed')의 7점 응답. 역문항은 8-값으로 뒤집어 계산.
--   option_value 형식: A '1'~'7' / B~G 'subscale:값[:r]' → 숫자만 꺼내고 역채점은 hit_questions.reverse_scored 기준
-- 척도 = (test_type, module, sub_domain) — A는 같은 글자(I·E·S·C·A)가 성격·행동·흥미 모듈에 겹쳐 module까지 묶어야 한다. 모든 문항에 답한 응답자만 사용. 응답자 min_n 미만 척도는 제외 (기본 30)
-- 권한: service_role만 실행 (응답 원본을 읽으므로). 인트라에서는 서버 API로 호출
-- 사용: SELECT * FROM public.hit_reliability_alpha(30);
-- 롤백: DROP FUNCTION IF EXISTS public.hit_reliability_alpha(integer);

DROP FUNCTION IF EXISTS public.hit_reliability_alpha(integer);
CREATE OR REPLACE FUNCTION public.hit_reliability_alpha(min_n integer DEFAULT 30)
RETURNS TABLE (test_type text, module text, sub_domain text, items integer, respondents integer, alpha numeric)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  WITH item AS (
    SELECT s.id AS session_id, q.test_type::text AS test_type, q.module::text AS module, q.sub_domain::text AS sub_domain, q.id AS question_id,
           CASE WHEN q.reverse_scored THEN 8 - v.val ELSE v.val END AS score
    FROM hit_responses r
    JOIN hit_sessions s ON s.id = r.session_id AND s.status = 'completed'
    JOIN hit_questions q ON q.id = r.question_id
    CROSS JOIN LATERAL (
      SELECT NULLIF(substring(r.option_value FROM '(?:^|:)([1-7])(?::r)?$'), '')::numeric AS val
    ) v
    WHERE v.val IS NOT NULL AND q.sub_domain IS NOT NULL AND q.sub_domain <> 'DECOY'
  ),
  scale_k AS (  -- 척도별 문항 수 (실제 응답된 문항 기준)
    SELECT test_type, module, sub_domain, count(DISTINCT question_id) AS k FROM item GROUP BY 1, 2, 3
  ),
  complete AS ( -- 그 척도의 모든 문항에 답한 응답자만
    SELECT i.* FROM item i
    JOIN scale_k sk USING (test_type, module, sub_domain)
    WHERE (SELECT count(DISTINCT question_id) FROM item i2 WHERE i2.session_id = i.session_id AND i2.test_type = i.test_type AND i2.module = i.module AND i2.sub_domain = i.sub_domain) = sk.k
  ),
  item_var AS (
    SELECT test_type, module, sub_domain, question_id, var_samp(score) AS v FROM complete GROUP BY 1, 2, 3, 4
  ),
  totals AS (
    SELECT test_type, module, sub_domain, session_id, sum(score) AS total FROM complete GROUP BY 1, 2, 3, 4
  ),
  agg AS (
    SELECT t.test_type, t.module, t.sub_domain, count(*) AS n, var_samp(t.total) AS vt,
           (SELECT sum(iv.v) FROM item_var iv WHERE iv.test_type = t.test_type AND iv.module = t.module AND iv.sub_domain = t.sub_domain) AS sv,
           (SELECT k FROM scale_k sk WHERE sk.test_type = t.test_type AND sk.module = t.module AND sk.sub_domain = t.sub_domain) AS k
    FROM totals t GROUP BY 1, 2, 3
  )
  SELECT test_type, module, sub_domain, k::integer, n::integer,
         CASE WHEN k > 1 AND vt > 0 THEN round((k::numeric / (k - 1)) * (1 - sv / vt), 3) END AS alpha
  FROM agg
  WHERE n >= min_n
  ORDER BY test_type, module, sub_domain;
$$;

REVOKE ALL ON FUNCTION public.hit_reliability_alpha(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.hit_reliability_alpha(integer) TO service_role;
