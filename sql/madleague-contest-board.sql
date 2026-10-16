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

-- ── 외부 등록 + 운영진 확인 후 게시 (2026-10-16 사용자 결정) ──────────────────
-- 공모전/프로젝트는 외부 기관·사람이 올리는 게시판: 로그인 회원 작성 → 'pending'(검토 대기) → 직원 승인 시 'published'
-- 공통 게시판 옵션 options.review = true 인 게시판에만 적용 (lib/supabase/board.ts BoardRule.review)
ALTER TYPE public.bums_post_status ADD VALUE IF NOT EXISTS 'pending';

UPDATE public.ums_boards b
SET write_permission = 'member',
    options = COALESCE(b.options, '{}'::jsonb) || '{"review": true}'::jsonb,
    description = '마케팅·광고 공모전과 대학생 프로젝트 소식 — 누구나 올릴 수 있고, 운영진 확인 후 게시'
FROM public.ums_sites s
WHERE s.id = b.site_id AND s.slug = 'madleague' AND b.slug = 'contest';
