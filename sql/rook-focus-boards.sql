-- RooK 집중 브랜드 승격 + 게시판 구성 (2026-10-07, 세션 160 — 사용자 요청 "티어 중점으로")
-- 외부 서버(www.rook.co.kr, 아임웹) 운영 중 → Vercel 버전은 비공개 스테이징 (§0.1 원칙 6, "새로 제작, 이전 없음")
-- 운영사 콘텐츠(Works·Artist)만 이전, 회원·자유게시판 글은 이전하지 않음 (개인정보보호법 제17·18조)
-- 재실행 가능

-- 1) 사이트 Tier·호스팅
UPDATE public.ums_sites
   SET tier = 'focus', lifecycle = 'active', hosting = 'external',
       lifecycle_note = '2026-10-07 집중 승격. www.rook.co.kr(아임웹) 운영 중 → Vercel 새로 제작, DNS 전환 시 hosting=vercel',
       updated_at = now()
 WHERE slug = 'rook';

-- 2) 게시판: works = 공식 작품(직원 작성) · artist = AI 아티스트(직원 작성) · freeboard = 자유게시판(회원 작성)
UPDATE public.ums_boards b
   SET name = 'Works', description = '루크가 작업한 제작물',
       write_permission = 'admin'::bums_permission,
       categories = '["Music","Meme","Contents","AD","Art work"]'::jsonb,
       updated_at = now()
  FROM public.ums_sites s
 WHERE s.id = b.site_id AND s.slug = 'rook' AND b.slug = 'works';

INSERT INTO public.ums_boards (site_id, tenant_id, name, slug, board_type, visibility, description,
       list_permission, read_permission, write_permission, comment_permission, allow_comments, categories, sort_order)
SELECT s.id, 'tenone', v.name, v.slug, 'general'::bums_board_type, 'public'::bums_board_visibility, v.description,
       'all'::bums_permission, 'all'::bums_permission, v.write_permission::bums_permission, 'member'::bums_permission,
       true, v.categories::jsonb, v.sort_order
  FROM public.ums_sites s,
       (VALUES
         ('AI Artist', 'artist', '루크 소속 인공지능 모델', 'admin',
          '["Woman","Man","High teen","Kids","Baby","Senior","Animal","Character","Musician"]', 1),
         ('Free board', 'freeboard', '누구나 작성할 수 있는 자랑게시판', 'member', '[]', 2)
       ) AS v(name, slug, description, write_permission, categories, sort_order)
 WHERE s.slug = 'rook'
ON CONFLICT (site_id, slug) DO NOTHING;
