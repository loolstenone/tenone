-- HIT - Archetype DISC 방식별 강도 (R7, 2026-10-12)
-- 기존 disc_*_score는 네 방식의 '비중'(합 100)이라 15~40%에 모여 "36%가 대표 유형?"으로 읽혔다.
-- 강도 = 그 방식 문항(bt_{d|i|s|c}_01~10) 응답 평균 → (평균−1)/6×100. 다른 점수와 같은 0~100 척도. 채점: lib/hit/scoring.ts scoreBT
-- 롤백: ALTER TABLE public.hit_a_results DROP COLUMN IF EXISTS disc_intensity;

ALTER TABLE public.hit_a_results ADD COLUMN IF NOT EXISTS disc_intensity jsonb;
COMMENT ON COLUMN public.hit_a_results.disc_intensity IS 'DISC 방식별 강도 0~100 {D,I,S,C} — (문항 평균-1)/6*100. disc_*_score(비중, 합 100)와 별개';

-- 기존 결과 채우기 (응답 원본에서 다시 계산)
WITH v AS (
  SELECT ar.id,
         upper(substr(hr.question_id, 4, 1)) AS t,
         avg(nullif(hr.option_value, '')::numeric) AS a
  FROM public.hit_a_results ar
  JOIN public.hit_responses hr ON hr.session_id = ar.session_id
  WHERE hr.module = 'behavior_type' AND hr.question_id ~ '^bt_[disc]_[0-9]+$' AND hr.option_value ~ '^[1-7]$'
  GROUP BY ar.id, upper(substr(hr.question_id, 4, 1))
)
UPDATE public.hit_a_results ar
SET disc_intensity = x.j
FROM (
  SELECT id, jsonb_object_agg(t, round((a - 1) / 6 * 100)) AS j FROM v GROUP BY id
) x
WHERE ar.id = x.id AND ar.disc_intensity IS NULL;
