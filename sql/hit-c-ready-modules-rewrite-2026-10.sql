-- HIT C 종합 준비도 해설 READY-A~D 재작성 (2026-10-13 적용)
-- 결함: 제목이 'A등급' 등 등급 문자(화면 구간 이름과 다름) · D가 막 시작한 학생에게 "커리어 방향 재검토 필요·대면 상담 추천"
--       · C가 근거 없이 "기본 방향은 잡혀 있고" 단정 · 옛 명칭 'HIT A'.
-- 기준: 화면 구간 이름(뚜렷함 75+ / 갖춰짐 50~74 / 보완하면 좋음 25~49 / 우선 보완 25 미만)과 같은 말, 다음 행동 한두 가지.
-- 롤백: hit_report_modules_ready_backup_20261013

CREATE TABLE IF NOT EXISTS public.hit_report_modules_ready_backup_20261013 AS
  SELECT id, title, content FROM public.hit_report_modules WHERE id LIKE 'READY-%';
ALTER TABLE public.hit_report_modules_ready_backup_20261013 ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.hit_report_modules_ready_backup_20261013 FROM anon, authenticated;
GRANT ALL ON public.hit_report_modules_ready_backup_20261013 TO service_role;

UPDATE public.hit_report_modules m SET title = v.title, content = v.content, updated_at = now()
FROM (VALUES
  ('READY-A', '취업 준비도 — 준비가 뚜렷함',
   $$자기 이해부터 결과물, 면접, 실행까지 대부분의 준비가 되어 있다고 느낍니다. 지금은 준비보다 실제로 부딪혀 볼 때입니다.

관심 기업 몇 곳에 직접 지원해 보고, 면접에서 받은 질문과 반응을 기록해 다음 지원에 반영하세요. HeRo 오디션처럼 실전에서 내 준비를 확인해 볼 수 있는 기회도 활용해 보세요.$$),
  ('READY-B', '취업 준비도 — 갖춰짐',
   $$기본 준비는 되어 있고, 몇몇 영역만 보완하면 됩니다. 위 점수에서 가장 낮은 영역이 지금 가장 먼저 채울 곳입니다.

그 영역 하나에 한 달을 집중해 보세요. 결과물이 부족하면 프로젝트 하나를 정리하고, 면접이 부족하면 예상 질문 다섯 개에 답을 써서 소리 내어 연습하는 식으로, 작고 구체적인 목표가 가장 빨리 점수를 올립니다.$$),
  ('READY-C', '취업 준비도 — 보완하면 좋음',
   $$준비를 시작한 단계입니다. 아직 결과물이나 면접 준비보다, 어떤 직무로 갈지와 그 직무가 무엇을 원하는지를 알아 가는 시기일 수 있습니다.

희망 직무의 채용 공고 다섯 개를 모아 공통으로 요구하는 것을 적어 보세요. 그중 지금 할 수 있는 한 가지(강의 하나, 프로젝트 하나)를 골라 이번 학기 목표로 삼으면 준비가 구체적으로 움직이기 시작합니다.$$),
  ('READY-D', '취업 준비도 — 이제 시작',
   $$아직 취업 준비를 본격적으로 시작하지 않았다고 느낍니다. 학년이나 상황에 따라 자연스러운 단계이고, 지금 출발해도 충분합니다.

먼저 HIT - Archetype과 HIT - Bounce 결과에서 내가 끌리고 자신 있는 분야를 확인해 보세요. 그 분야의 현직자 이야기를 하나 찾아 읽거나 듣는 것, 관련 동아리나 강의 하나에 참여해 보는 것이 첫걸음으로 좋습니다.$$)
) AS v(id, title, content)
WHERE m.id = v.id;
