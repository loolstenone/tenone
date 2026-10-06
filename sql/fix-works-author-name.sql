-- Works 작성자 표기 정리
-- 적용일: 2026-10-05 (Supabase MCP execute_sql)
-- 이전 이관 시 인코딩 깨진 author_name 2건(U+FFFD) + 비어 있던 20건 → 'Ten:One' (운영진 작성 콘텐츠, 회원 글 아님)
update ums_posts p set author_name='Ten:One'
from ums_boards b join ums_sites s on s.id=b.site_id
where b.id=p.board_id and s.slug='tenone' and b.slug='works' and p.author_id is null
  and (p.author_name is null or p.author_name like '%' || chr(65533) || '%');
