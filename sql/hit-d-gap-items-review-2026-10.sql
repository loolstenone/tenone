-- HIT D·G 문항 재검토 (2026-10-13 적용, 사용자 결정 "전부 추천안") — D·G 실응답 없음(운영자 테스트뿐)
-- D
--   c_st11 "전혀 다른 분야로의 전환도 고려 중이다" — 전환 '의향'이 '역량 이전' 점수를 올림 → 삭제 (의향은 Pull c_pl02가 이미 측정)
--   c_de05 "현재 역할에서 더 배울 것이 없다고 느낄 때가 있다" — 역채점으로 숙련자의 전문성을 깎음 → Push(이탈)·정방향, 성장 한계 하위 점수에 포함 (scoring-d.ts)
-- G
--   f_jv11 "단절 기간이 채용 과정에서 불이익이 될 것이 걱정된다" — '걱정'이 직무 유효성·CVI를 깎음 → 삭제 (f_sn06이 같은 걱정을 측정)
--   f_jv12 "이전 직무와 유사한 분야에서 일하고 싶다" — '희망'이 직무 유효성을 올림 → 경력 복원(career_restoration)·정방향
--   f_sc08 "하드 스킬보다 소프트 스킬이 더 유효하다고 본다" — 방향 모호 → 삭제
-- 문항 수: D 100 → 99 · G 128 → 126 (lib/hit/stages.ts approxQuestions)

DELETE FROM public.hit_questions WHERE id IN ('c_st11', 'f_jv11', 'f_sc08');

UPDATE public.hit_questions
SET sub_domain = 'push', reverse_scored = false,
    scoring_key = coalesce(scoring_key, '{}'::jsonb) || '{"subscale":"push","moved_from":"domain_expertise"}'::jsonb
WHERE id = 'c_de05';

UPDATE public.hit_questions
SET sub_domain = 'career_restoration', reverse_scored = false,
    scoring_key = coalesce(scoring_key, '{}'::jsonb) || '{"subscale":"career_restoration","moved_from":"job_viability"}'::jsonb
WHERE id = 'f_jv12';
