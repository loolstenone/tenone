-- 미사용 게시판·테스트 지원서 정리 — 세션 161, 2026-10-07 (사용자 결정)
-- 근거 (적용 직전 확인): 대상 게시판 8개 모두 글 0건 · 위젯 0건 · 코드 참조 없음
--   RooK      : challenge · feedback (옛 구성 잔재 — 현재 works·artist·freeboard만 사용)
--   MADLeague : board · gallery · faq · madzine · competition · notice (사이트는 mad_posts·mad_articles 사용)
--   테스트 지원서: mad_applications test@test.com (2026-04-15, 계정·동아리 미연결, 'accepted')
-- 안전장치: 글이 하나라도 생겼으면 지우지 않고 중단
-- 적용: 2026-10-07 MCP apply_migration `cleanup_unused_boards_test_application` (잔여: RooK works·artist·freeboard, MADLeague ums_boards 0, 테스트 지원서 삭제)

DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n
  FROM ums_posts p JOIN ums_boards b ON b.id = p.board_id JOIN ums_sites s ON s.id = b.site_id
  WHERE (s.slug = 'rook' AND b.slug IN ('challenge', 'feedback'))
     OR (s.slug = 'madleague' AND b.slug IN ('board', 'gallery', 'faq', 'madzine', 'competition', 'notice'));
  IF n > 0 THEN RAISE EXCEPTION '대상 게시판에 글 %건 존재 — 정리 중단', n; END IF;

  DELETE FROM ums_boards b USING ums_sites s
  WHERE s.id = b.site_id
    AND ((s.slug = 'rook' AND b.slug IN ('challenge', 'feedback'))
      OR (s.slug = 'madleague' AND b.slug IN ('board', 'gallery', 'faq', 'madzine', 'competition', 'notice')));

  DELETE FROM mad_applications
  WHERE email = 'test@test.com' AND member_id IS NULL AND club_id IS NULL AND created_at::date = '2026-04-15';
END $$;
