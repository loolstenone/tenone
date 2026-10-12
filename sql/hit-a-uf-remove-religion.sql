-- HIT A 기저요인(UF) 종교 문항 삭제 — 2026-10-12 운영 적용 (세션 169, 사용자 승인)
-- 사유: 종교·신앙은 개인정보보호법 제23조 민감정보 → 별도 동의 없이 수집 불가. 진로 진단 목적에 필수 아님.
-- 삭제 시점 응답 0건 (UF는 2026-10-12까지 출제되지 않았음).
-- 이후 UF = 49문항 (회원 전용 출제, 회원 리포트 전용 — S-Power·매칭에 사용하지 않음)

DELETE FROM public.hit_questions
WHERE test_type = 'A'
  AND module = 'base'
  AND scoring_key->>'aspect' = 'religion';

-- 롤백 (필요 시):
-- INSERT INTO public.hit_questions (id, module, test_type, question_index, question_text, sub_domain, response_type, reverse_scored, scoring_key)
-- VALUES ('uf_046', 'base', 'A', 45, '성장기에 종교나 신앙이 가치관 형성에 큰 영향을 미쳤다.', 'cultural', 'likert7', false, '{"axis":"cultural","aspect":"religion","weight":1}');
