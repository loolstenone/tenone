-- 누구나 INSERT 가능한 정책 정리 3차 — 세션 161, 2026-10-07
-- 2차(sql/security-open-insert-lockdown.sql)에서 코드 변경이 필요해 남긴 6개
-- 적용: (미적용)

-- ===== A (지금 — 배포된 코드가 이 정책에 의존하지 않음) =====
-- MADLeague HeRo 신청 동의 기록 컬럼 (추가만 — 옛 코드 영향 없음)
ALTER TABLE public.mad_hero_applications ADD COLUMN IF NOT EXISTS consent jsonb;

-- MoNTZ 캐스팅 제안: 화면은 이미 /api/montz/contact(service_role) 사용. 브라우저 직접 INSERT 함수는 코드에서 제거
DROP POLICY IF EXISTS montz_contact_insert ON public.montz_contact_requests;
-- Townity 댓글: 쓰는 화면 없음. 로그인 회원 누구나 author_id 위조 INSERT 가능하던 정책 (직원용 comments_insert는 유지)
DROP POLICY IF EXISTS authenticated_insert ON public.post_comments;
-- HeRo Search Light 대기·기업 문의: 화면에서 호출하는 곳 없음 (API 파일은 남아 있으나 INSERT 불가 → 사실상 비활성)
DROP POLICY IF EXISTS anyone_insert_waitlist ON public.hero_search_light_waitlist;
DROP POLICY IF EXISTS "누구나 INSERT" ON public.hero_business_inquiries;

-- ===== B (배포 후 — 배포된 옛 API가 사용자 세션 클라이언트로 INSERT 중) =====
-- 새 코드: /api/hero/coaching-waitlist = requireMember + service_role, /api/madleague/hero = Turnstile + 동의 + service_role
-- DROP POLICY IF EXISTS "본인 INSERT" ON public.coaching_waitlist;
-- DROP POLICY IF EXISTS mad_hero_insert ON public.mad_hero_applications;
