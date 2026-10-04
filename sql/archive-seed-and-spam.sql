-- ============================================================
-- 인트라 정리 1단계 — 시드(샘플) 데이터·봇 스팸 아카이브
-- 적용: 2026-10-05 (MCP apply_migration: archive_seed_and_spam) · 1회 실행용
--
-- 방식: 삭제 전 archive 스키마로 전량 복사(archived_at 기록) → public에서 삭제.
--       archive 스키마는 PostgREST 미노출 + anon/authenticated 권한 없음 (service_role·DB 관리자만).
-- 복원: INSERT INTO public.X SELECT (archived_at 제외 컬럼) FROM archive.X;
--
-- 결과: 52개 테이블 3,342행 이동 (봇 구독자 457·문의 1,529·확인메일 기록 473·지원서 37 + 샘플)
-- 주의: jakka_creators.featured_work_id는 이동 전 NULL 처리돼 archive에도 NULL
-- 유지: 실제 계정과 연결된 데이터 (badak_members.user_id 있는 2명, mad_members 2, mad_applications 1),
--       설정 테이블 (badak_fee_configs, badak_level_criteria), 한글 이름 구독자 1명, mad_competitions.
-- ============================================================

CREATE SCHEMA IF NOT EXISTS archive;
REVOKE ALL ON SCHEMA archive FROM anon, authenticated, public;

CREATE OR REPLACE FUNCTION archive._move(p_table text, p_where text DEFAULT 'true')
RETURNS bigint LANGUAGE plpgsql AS $$
DECLARE n bigint;
BEGIN
    EXECUTE format('CREATE TABLE IF NOT EXISTS archive.%I AS SELECT now() AS archived_at, * FROM public.%I WITH NO DATA', p_table, p_table);
    EXECUTE format('INSERT INTO archive.%I SELECT now(), * FROM public.%I WHERE %s', p_table, p_table, p_where);
    EXECUTE format('DELETE FROM public.%I WHERE %s', p_table, p_where);
    GET DIAGNOSTICS n = ROW_COUNT;
    RAISE NOTICE 'archive % : %', p_table, n;
    RETURN n;
END $$;
REVOKE ALL ON FUNCTION archive._move(text, text) FROM public, anon, authenticated;

DO $$
DECLARE bot text := $w$coalesce(name,'') !~ '[가-힣]' AND email NOT ILIKE '%@tenone.biz'$w$;
BEGIN
    -- ── 봇 스팸 ──────────────────────────────────────────
    PERFORM archive._move('email_sends', format('subscriber_id IN (SELECT id FROM public.newsletter_subscribers WHERE %s)', bot));
    PERFORM archive._move('subscriber_tags', format('subscriber_id IN (SELECT id FROM public.newsletter_subscribers WHERE %s)', bot));
    PERFORM archive._move('newsletter_subscribers', bot);
    PERFORM archive._move('contact_submissions', $w$form_type IN ('partner','crew')$w$);
    PERFORM archive._move('hero_talent_applications');

    -- ── 업무 시드 (ERP·프로젝트·일정) ─────────────────────
    PERFORM archive._move(t) FROM unnest(ARRAY[
        'approvals','expenses','card_usage','invoices','revenue','monthly_forecasts','incentives',
        'attendance','gpr_goals','staff_education','project_bids','project_vendors','biz_plans',
        'promotions','events','comm_events','workflow_tasks','workflow_automations','content_pipeline'
    ]) AS t;
    PERFORM archive._move('projects');
    PERFORM archive._move('shop_products');

    -- ── Badak 샘플 (실계정 badak_members 2명 유지) ────────
    PERFORM archive._move(t) FROM unnest(ARRAY[
        'badak_community_likes','badak_community_comments','badak_community_views','badak_community_posts',
        'badak_notifications','badak_stories','badak_traces','badak_bookmarks',
        'badak_group_comments','badak_group_posts','badak_group_likes','badak_group_reviews','badak_group_members',
        'badak_wants','badak_groups','badak_need_interests','badak_needs_interests','badak_needs'
    ]) AS t;
    PERFORM archive._move('badak_members', 'user_id IS NULL');

    -- ── MoNTZ·Jakka 샘플 ─────────────────────────────────
    PERFORM archive._move(t) FROM unnest(ARRAY[
        'montz_audition_applications','montz_contact_requests','montz_works','montz_auditions','montz_creators',
        'jakka_showcase_approvals','jakka_showcase_artists','jakka_showcase_guestbook','jakka_showcase_interests',
        'jakka_showcase_members','jakka_showcase_updates','jakka_showcase_work_comments','jakka_showcase_work_likes',
        'jakka_showcase_works','jakka_showcases','jakka_likes','jakka_notices',
        'jakka_product_likes','jakka_product_notify','jakka_product_qna','jakka_products'
    ]) AS t;
    UPDATE public.jakka_creators SET featured_work_id = NULL WHERE featured_work_id IS NOT NULL;
    PERFORM archive._move('jakka_works');
    PERFORM archive._move('jakka_creators');

    -- ── MADLeague 콘텐츠 (mad_members·mad_applications는 club/cohort FK SET NULL) ──
    PERFORM archive._move(t) FROM unnest(ARRAY[
        'mad_competition_results','mad_article_comments','mad_article_likes','mad_articles','mad_archive',
        'mad_cohorts','mad_clubs'
    ]) AS t;
END $$;
