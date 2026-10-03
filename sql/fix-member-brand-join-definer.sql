-- ============================================================
-- 회원 생성 실패 수정 — 2026-10-04 세션 156 (운영 DB 적용 완료)
--
-- 원인: members AFTER INSERT 트리거 fn_auto_member_brand_join()이 SECURITY INVOKER로
--       member_brand_joins에 INSERT → 해당 테이블 RLS(ALL: is_tenone_staff())에 막혀
--       일반 사용자의 members INSERT 전체가 롤백됨.
--       → 2026-03 이후 가입자 225명 전원 members row 없음.
-- 해결: 트리거 함수를 SECURITY DEFINER로 (NEW.id·NEW.origin_site만 기록하므로 안전)
-- ============================================================
ALTER FUNCTION public.fn_auto_member_brand_join() SECURITY DEFINER SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.fn_auto_member_brand_join() FROM PUBLIC, anon, authenticated;
