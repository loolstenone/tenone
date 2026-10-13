-- HIT F 역채점 방향 + 해설 정리 (2026-10-13 적용, F 응시 0건 상태)
-- 1) 사회적 연결 척도는 '필요(욕구)' — 해설 ES-BELONG/ROLE-HIGH = 강한 욕구, LOW = 독립·역할 초월.
--    욕구가 높다는 문항은 정방향, 낮다는 문항은 역채점이어야 하는데 6문항이 반대였다 (고독을 즐기는 사람이 '고립 위험' 해설을 받음).
--    e_bl03·e_bl05·e_rn02·e_rn10: true → false / e_bl10·e_rn07: false → true. 원본 시드 sql/seed-hit-v2/09-layer_e.sql(옛 E 번호)도 같이.
-- 2) 해설: EP-A~D 제목 등급 문자 → 구간 이름 · EL-SAT-LOW 상담 단정 완화 · ED-SOCIAL 근거 없는 '가장 높은 만족도' 제거
--    · ES-ROLE-HIGH '반드시 … 심리적 건강' 완화 · ES-BELONG-HIGH '고립 위험' 완화
-- 롤백: hit_report_modules_f_backup_20261013

UPDATE public.hit_questions SET reverse_scored = false WHERE id IN ('e_bl03', 'e_bl05', 'e_rn02', 'e_rn10');
UPDATE public.hit_questions SET reverse_scored = true  WHERE id IN ('e_bl10', 'e_rn07');

CREATE TABLE IF NOT EXISTS public.hit_report_modules_f_backup_20261013 AS
  SELECT id, title, content FROM public.hit_report_modules
  WHERE id IN ('EP-A','EP-B','EP-C','EP-D','EL-SAT-LOW','ED-SOCIAL','ES-ROLE-HIGH','ES-BELONG-HIGH');
ALTER TABLE public.hit_report_modules_f_backup_20261013 ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.hit_report_modules_f_backup_20261013 FROM anon, authenticated;
GRANT ALL ON public.hit_report_modules_f_backup_20261013 TO service_role;

UPDATE public.hit_report_modules m SET title = v.title, content = v.content, updated_at = now()
FROM (VALUES
  ('EP-A', '2막 준비도 — 준비 완료',
   $$시간, 건강, 재정, 관계 네 가지 준비가 모두 안정적입니다. 2막을 바로 시작할 수 있는 상태이니, 첫 석 달 동안 무엇을 할지 구체적인 계획을 세우고 실행에 옮기면 됩니다.$$),
  ('EP-B', '2막 준비도 — 대부분 준비됨',
   $$대부분 준비되었고, 재정 계획이나 가족과의 합의 같은 일부만 남았습니다. 나의 저니 체크리스트에서 남은 항목을 하나씩 채우면 몇 달 안에 2막을 시작할 수 있습니다.$$),
  ('EP-C', '2막 준비도 — 준비 진행 중',
   $$2막 준비를 시작했지만 갖출 것이 아직 남아 있습니다. 반년 정도의 준비 기간을 정하고, 방향을 찾는 일과 재정·건강·관계 같은 현실적인 준비를 함께 진행해 보세요.$$),
  ('EP-D', '2막 준비도 — 이제 시작',
   $$2막 준비는 이제 막 시작하는 단계입니다. 은퇴가 아직 멀게 느껴질 수도 있습니다. 관련 책 한 권, 먼저 은퇴한 사람과의 대화 한 번처럼 가벼운 탐색부터 시작해 보세요.$$),
  ('EL-SAT-LOW', '인생 만족도 — 아쉬움이 큰 편',
   $$지금까지의 삶에서 아쉬움을 크게 느낀다고 답했습니다. 이 아쉬움은 2막을 새롭게 설계하려는 힘이 되기도 하지만, 지난 일에 마음이 오래 머물면 앞으로를 그릴 에너지가 줄어들 수 있습니다.

아쉬운 일 중 지금이라도 해 볼 수 있는 것과 내려놓을 것을 나눠 적어 보세요. 마음이 많이 무겁다면 믿을 수 있는 사람이나 상담 창구와 이야기를 나누는 것도 방법입니다.$$),
  ('ED-SOCIAL', '2막 방향 — 사회공헌형',
   $$사회를 위해 기여하고 싶은 마음이 가장 큰 유형입니다. 봉사, 비영리 활동, 사회적 기업처럼 사회적 가치를 만드는 일에 끌립니다.

지금까지의 경험이 가장 잘 쓰일 수 있는 분야를 먼저 찾아보세요. 짧은 봉사나 재능 기부로 시작해 보면 오래 이어 갈 수 있는 활동이 무엇인지 보입니다.$$),
  ('ES-ROLE-HIGH', '역할 필요성 — 강한 역할 욕구',
   $$누군가에게 필요한 사람이 되고, 맡은 역할이 있을 때 힘이 나는 편입니다. 은퇴 뒤 갑자기 역할이 사라지면 허전함이 크게 느껴질 수 있습니다.

일이든 봉사든 교육이든, 꾸준히 맡을 수 있는 역할을 미리 하나 정해 두세요. 재취업형이나 멘토형 2막과 잘 맞습니다.$$),
  ('ES-BELONG-HIGH', '소속 욕구 — 강한 소속 욕구',
   $$어딘가에 속해 사람들과 함께하는 것이 마음의 안정에 중요한 편입니다. 직장을 떠나면 매일 만나던 사람들과의 연결이 줄어드는 만큼, 그 자리를 채울 곳을 미리 만들어 두는 것이 좋습니다.

동호회, 커뮤니티, 봉사단체처럼 정기적으로 모이는 곳 한두 곳을 은퇴 전부터 다녀 보세요.$$)
) AS v(id, title, content)
WHERE m.id = v.id;
