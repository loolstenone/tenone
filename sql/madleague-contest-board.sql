-- MAD League 공모전/프로젝트 게시판 (2026-10-16) — 옛 madleague.net/pinboard 이전, MADzine 하위 메뉴
-- 공통 게시판 ums_boards/ums_posts (site madleague, slug contest). 운영사 글만 (직원 작성), 댓글 없음
-- 이전: scripts/madleague-pinboard-import.mjs · 재실행 가능
INSERT INTO public.ums_boards (site_id, name, slug, board_type, skin_type, visibility, description,
    list_permission, read_permission, write_permission, comment_permission,
    allow_comments, allow_attachments, allow_secret, categories, sort_order, tenant_id)
SELECT s.id, '공모전/프로젝트', 'contest', 'general', 'list', 'public',
    '마케팅·광고 공모전과 대학생 프로젝트 소식',
    'all', 'all', 'admin', 'member',
    false, true, false, '["공모전", "프로젝트"]'::jsonb, 0, 'tenone'
FROM public.ums_sites s
WHERE s.slug = 'madleague'
  AND NOT EXISTS (SELECT 1 FROM public.ums_boards b WHERE b.site_id = s.id AND b.slug = 'contest');
