-- MADLeague 동아리 부원 공동 모집 — 동아리별 지원서 초안 (2026-10-10 적용)
-- forms.program = 'club-recruit:{slug}' (lib/madleague-recruit.ts) · status 'draft' — 인트라 MADLeague › 참가 신청에서 기간 설정 후 열기
-- 응답 열람 = 그 동아리 운영진(/madleague/clubs/{slug}/manage) + 직원. 이름·이메일은 계정(members)에서 — 질문으로 받지 않음
-- 재실행 안전: 이미 그 동아리 모집 폼이 있으면 건너뜀

INSERT INTO forms (brand_id, slug, program, title, description, status, questions, settings, privacy)
SELECT 'madleague', 'recruit-' || c.slug, 'club-recruit:' || c.slug, c.name || ' 신입 부원 지원서',
  'MAD League 동아리 공동 모집 — ' || c.name || '(' || c.region || ') 지원서입니다. 지원서는 ' || c.name || ' 운영진과 MAD League 운영진만 봅니다.',
  'draft',
  '[
    {"id":"q1","type":"section","label":"기본 정보"},
    {"id":"q2","type":"short","label":"대학교","required":true,"maxLength":60},
    {"id":"q3","type":"short","label":"전공","required":true,"maxLength":60},
    {"id":"q4","type":"select","label":"학년","required":true,"options":["1학년","2학년","3학년","4학년","휴학","졸업 유예"]},
    {"id":"q5","type":"phone","label":"연락처","help":"면접 일정 안내에만 씁니다","required":true},
    {"id":"q6","type":"section","label":"지원 내용"},
    {"id":"q7","type":"short","label":"지원 팀·부서","help":"동아리 소개의 팀 구성을 참고해 주세요","maxLength":60},
    {"id":"q8","type":"long","label":"지원 동기","required":true,"maxLength":500},
    {"id":"q9","type":"long","label":"광고·마케팅 관련 경험","help":"공모전·프로젝트·동아리 활동 등 (없으면 비워 두세요)","maxLength":800},
    {"id":"q10","type":"url","label":"포트폴리오 링크","help":"있다면 https:// 주소"},
    {"id":"q11","type":"long","label":"면접 가능한 일정","maxLength":200}
  ]'::jsonb,
  '{"require_login":true,"one_per_user":true,"allow_edit":true,"confirmation":"지원이 접수되었습니다. 동아리 운영진이 검토 후 연락드립니다."}'::jsonb,
  jsonb_build_object('purpose', c.name || ' 신입 부원 선발·면접 안내 (지원한 동아리 운영진과 MAD League 운영진이 열람)', 'retention', '모집 종료 후 1년')
FROM mad_clubs c
WHERE c.status = 'active'
  AND NOT EXISTS (SELECT 1 FROM forms f WHERE f.brand_id = 'madleague' AND f.program = 'club-recruit:' || c.slug);
