-- HIT E 역채점 방향 수정 (2026-10-13 적용, E 응시 0건 상태)
-- 1) identity_strength(역할 정체성 = 지금 역할에 묶인 정도). 정체성 유연성 = (100 − 역할 정체성 + 새 역할 개방 + 정체성 재구성) / 3.
--    d_is03·04·06·10은 '직업과 나를 동일시'하는 문항 = 역할 정체성이 강하다는 뜻 → 정방향이어야 한다.
--    역채점이면 직업에 묶인 사람일수록 '유연하다'로 반대 판정되었다.
-- 2) d_wt10 "넓은 네트워크보다 깊은 네트워크가 중요" — weak_ties(넓은 연결) 반대 방향 → 역채점.
-- 옛 값: d_is03·04·06·10 reverse_scored=true, d_wt10=false. 원본 시드: sql/seed-hit-v2/08-layer_d.sql(옛 D 번호 체계)도 같이 고침.

UPDATE public.hit_questions SET reverse_scored = false WHERE id IN ('d_is03', 'd_is04', 'd_is06', 'd_is10');
UPDATE public.hit_questions SET reverse_scored = true  WHERE id = 'd_wt10';
