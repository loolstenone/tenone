-- HIT - Bounce 미디어/방송 트랙 '프로그램 기획' 역량 키 분리 (2026-10-12 적용)
-- 원인: media_broadcast 트랙 문항 5개가 광고 트랙과 같은 sub_domain 'media_planning'을 써서
--       결과 화면에 광고 '미디어 플래닝' 이름·해설(TRK-media_planning-*)이 나왔다.
-- 라벨: lib/hit/track-competency-labels.ts program_planning
-- 재실행 가능.
UPDATE public.hit_questions
SET sub_domain = 'program_planning', scoring_key = jsonb_set(scoring_key, '{axis}', '"program_planning"')
WHERE track_id = 'media_broadcast' AND sub_domain = 'media_planning';
