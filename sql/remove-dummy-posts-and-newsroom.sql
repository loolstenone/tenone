-- 더미 게시글 26건 삭제 + 뉴스룸 폐지
-- 적용일: 2026-10-05 (Supabase MCP apply_migration: remove_dummy_posts_and_newsroom, 사용자 승인)
-- 대상: tenone notice·free·newsroom / badak community / madleague madzine / youinone notice·portfolio
--       (작성 회원 없는 시드 글, 날짜·내용 예시) — 남은 실데이터: tenone/works 35, fwn/articles 15
-- 뉴스룸: newsroom_items(시드 8건뿐) DROP, tenone/newsroom 게시판 삭제. /newsroom → / 308 (next.config.ts)

create temp table _dummy on commit drop as
select p.id from ums_posts p join ums_boards b on b.id=p.board_id join ums_sites s on s.id=b.site_id
where (s.slug,b.slug) in (('tenone','notice'),('tenone','free'),('tenone','newsroom'),('badak','community'),('madleague','madzine'),('youinone','notice'),('youinone','portfolio'));

delete from ums_comments where post_id in (select id from _dummy);
delete from likes where target_id::text in (select id::text from _dummy);
delete from bookmarks where post_id::text in (select id::text from _dummy);
delete from attachments where post_id::text in (select id::text from _dummy);
delete from ums_posts where id in (select id from _dummy);

delete from ums_boards b using ums_sites s where s.id=b.site_id and s.slug='tenone' and b.slug='newsroom';
drop table if exists public.newsroom_items;
