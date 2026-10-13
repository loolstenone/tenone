-- HIT E 해설 단정 표현 정리 (2026-10-13 적용)
-- DROLE-PIVOT "장기적으로 가장 높은 만족도" · DI-FLEXIBLE "성공 가능성이 높습니다" — 근거 없는 예측
-- DROLE-STARTUP "대기업 경험" — 응답자의 출신을 가정 · DN-WEAK-LOW "심각한 제약" — 과한 경고
-- 롤백: hit_report_modules_e_backup_20261013

CREATE TABLE IF NOT EXISTS public.hit_report_modules_e_backup_20261013 AS
  SELECT id, title, content FROM public.hit_report_modules WHERE id IN ('DROLE-PIVOT','DROLE-STARTUP','DI-FLEXIBLE','DN-WEAK-LOW');
ALTER TABLE public.hit_report_modules_e_backup_20261013 ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.hit_report_modules_e_backup_20261013 FROM anon, authenticated;
GRANT ALL ON public.hit_report_modules_e_backup_20261013 TO service_role;

UPDATE public.hit_report_modules m SET content = v.content, updated_at = now()
FROM (VALUES
  ('DROLE-PIVOT', $$기존 경력과 다른 분야에서 새 역할에 도전하는 길입니다. 나를 새로 정의하려는 의지와 새 역할에 대한 열린 마음이 이 길의 바탕이 됩니다.

처음에는 직급이나 보상이 줄 수 있으니, 얼마나 감수할 수 있는지 미리 정해 두세요. 쌓아 온 경험 중 새 분야에서도 통하는 것 두세 가지를 찾아 "다른 분야에서 온 사람만의 강점"으로 내세우면 출발이 빨라집니다.$$),
  ('DROLE-STARTUP', $$지금까지 쌓은 경험을 스타트업의 속도와 결합하는 길입니다. 체계를 만들고, 규모를 키우고, 조직을 세우는 단계에서 특히 기여할 수 있습니다.

다만 스타트업은 불확실성이 크고 자원이 부족한 경우가 많습니다. 합류 전에 회사의 재무 상황과 내가 맡을 역할의 범위를 구체적으로 확인하고, 그 환경을 감당할 수 있는지 스스로 점검해 보세요.$$),
  ('DI-FLEXIBLE', $$지금의 직함에 크게 묶여 있지 않고, 새로운 역할과 환경에 열려 있습니다. "나는 무엇을 하는 사람"보다 "나는 어떤 가치를 만드는 사람"으로 자신을 설명하는 편입니다.

이 유연성은 경력 전환을 시작할 때 큰 힘이 됩니다. 다만 열려 있는 만큼 방향이 흩어질 수 있으니, 지켜야 할 핵심 가치 한두 가지를 정해 두고 그 기준으로 선택지를 고르세요.$$),
  ('DN-WEAK-LOW', $$업계 밖이나 온라인에서 이어진 느슨한 연결이 아직 적은 편입니다. 경력이 쌓일수록 새로운 기회는 공개 채용보다 아는 사람을 통해 오는 경우가 많아, 이 부분을 넓혀 두면 선택지가 크게 늘어납니다.

헤드헌터 한두 명과 연락을 이어 두고, 업계 커뮤니티나 행사 한 곳부터 꾸준히 나가 보세요.$$)
) AS v(id, content)
WHERE m.id = v.id;
