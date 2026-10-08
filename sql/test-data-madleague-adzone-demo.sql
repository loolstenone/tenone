-- test-data-madleague-adzone-demo.sql
-- ⚠️ 임시 테스트 데이터 (2026-10-08 세션 165, 사용자 요청 "가상 멤버 — 나중에 삭제")
-- 동아리 AD Zone(adzone)에 가상 회원 10명: 운영진 3(회장·부회장·총무) · 현역 5 · 심사 대기 지원자 2
-- 식별: members.email LIKE 'madtest-%@example.invalid' · 이름 '[테스트] …' · capability context.demo = true
-- 넣을 때 members 트리거(CRM 자동 복사·가입 UC·브랜드 자동 가입)는 이 트랜잭션에서만 끈다 (session_replication_role)
--
-- ▶ 삭제: 맨 아래 "정리" 블록 실행

-- ── 넣기 ──────────────────────────────────────────────
BEGIN;
SET LOCAL session_replication_role = replica;

WITH people(n, name, kind, position) AS (VALUES
  (1,  '[테스트] 김회장',  'officer', '회장'),
  (2,  '[테스트] 이부회장', 'officer', '부회장'),
  (3,  '[테스트] 박총무',  'officer', '총무'),
  (4,  '[테스트] 최현역',  'active',  NULL),
  (5,  '[테스트] 정현역',  'active',  NULL),
  (6,  '[테스트] 강현역',  'active',  NULL),
  (7,  '[테스트] 조현역',  'active',  NULL),
  (8,  '[테스트] 윤현역',  'active',  NULL),
  (9,  '[테스트] 장지원',  'applicant', NULL),
  (10, '[테스트] 임지원',  'applicant', NULL)
), ins AS (
  INSERT INTO public.members (name, email, account_type)
  SELECT name, format('madtest-%s@example.invalid', lpad(n::text, 2, '0')), 'member'
  FROM people
  RETURNING id, email
), joined AS (
  SELECT p.*, i.id AS member_id FROM people p JOIN ins i ON i.email = format('madtest-%s@example.invalid', lpad(p.n::text, 2, '0'))
), club AS (SELECT id FROM public.mad_clubs WHERE slug = 'adzone')
, roles AS (
  INSERT INTO public.member_capability_roles (member_id, brand_id, capability_key, role, context)
  SELECT j.member_id, 'madleague', 'club',
         CASE WHEN j.kind = 'officer' THEN '임원' ELSE '현역' END,
         CASE WHEN j.kind = 'officer'
              THEN jsonb_build_object('club_id', (SELECT id FROM club), 'position', j.position, 'term', '2026', 'year', 2026, 'demo', true)
              ELSE jsonb_build_object('club_id', (SELECT id FROM club), 'year', 2026, 'demo', true) END
  FROM joined j WHERE j.kind IN ('officer', 'active')
  RETURNING id
)
INSERT INTO public.mad_applications (member_id, club_id, applicant_role, name, email, year, activity_year, cohort, university, major, motivation, status)
SELECT j.member_id, (SELECT id FROM club), 'member', j.name, format('madtest-%s@example.invalid', lpad(j.n::text, 2, '0')),
       2026, 2026, 5, '[테스트] 충청대학교', '광고홍보학', '[테스트] 경쟁 PT에 꼭 참여해 보고 싶습니다.', 'pending'
FROM joined j WHERE j.kind = 'applicant';

COMMIT;

-- ── 정리 (삭제) ───────────────────────────────────────
-- BEGIN;
-- SET LOCAL session_replication_role = replica;
-- DELETE FROM public.mad_applications WHERE email LIKE 'madtest-%@example.invalid';
-- DELETE FROM public.mad_members WHERE member_id IN (SELECT id FROM public.members WHERE email LIKE 'madtest-%@example.invalid');
-- DELETE FROM public.member_capability_roles WHERE member_id IN (SELECT id FROM public.members WHERE email LIKE 'madtest-%@example.invalid');
-- DELETE FROM public.program_participants WHERE member_id IN (SELECT id FROM public.members WHERE email LIKE 'madtest-%@example.invalid');
-- DELETE FROM public.member_brand_joins WHERE member_id IN (SELECT id FROM public.members WHERE email LIKE 'madtest-%@example.invalid');
-- DELETE FROM public.members WHERE email LIKE 'madtest-%@example.invalid';
-- COMMIT;
