-- ============================================================
-- 서비스 생애주기 + 브랜드 가입·동의 기록 (CLAUDE.md §0.1 데이터 계약 4·5조)
-- 2026-10-05 세션 157
--
-- 1) ums_sites: tier(핵심/집중/실험/보관) · lifecycle(운영/동결/종료 예정/보관) · hosting · 종료일
-- 2) universe_label 표기 통일 → 'Ten:One™ Universe'
-- 3) resolve_site_slug(): 호스트명·표시명 → ums_sites.slug 정규화
-- 4) member_brand_joins: brand_id를 slug로 정규화 + FK + 약관 버전·동의 시각·상태
-- 5) member_brand_withdrawals: brand_id FK + scope(브랜드만/계정 전체)
-- 6) fn_auto_member_brand_join: origin_site(호스트명)를 slug로 변환해서 기록
-- ============================================================

-- ── 1) 서비스 생애주기 ─────────────────────────────────────
ALTER TABLE public.ums_sites
  ADD COLUMN IF NOT EXISTS tier           text,
  ADD COLUMN IF NOT EXISTS lifecycle      text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS hosting        text NOT NULL DEFAULT 'vercel',
  ADD COLUMN IF NOT EXISTS sunset_at      timestamptz,
  ADD COLUMN IF NOT EXISTS lifecycle_note text;

DO $$ BEGIN
  ALTER TABLE public.ums_sites ADD CONSTRAINT ums_sites_tier_check
    CHECK (tier IS NULL OR tier IN ('core', 'focus', 'experiment', 'archive'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.ums_sites ADD CONSTRAINT ums_sites_lifecycle_check
    CHECK (lifecycle IN ('active', 'frozen', 'sunsetting', 'archived'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.ums_sites ADD CONSTRAINT ums_sites_hosting_check
    CHECK (hosting IN ('vercel', 'external'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

COMMENT ON COLUMN public.ums_sites.tier      IS '브랜드 Tier (CLAUDE.md §0.1): core | focus | experiment | archive. NULL = 미결정';
COMMENT ON COLUMN public.ums_sites.lifecycle IS 'active 운영 | frozen 동결(신규 투자 없음) | sunsetting 종료 절차 중(sunset_at 필수) | archived 보관(접속·API 차단)';
COMMENT ON COLUMN public.ums_sites.hosting   IS 'vercel 이 서버 | external 외부 서버(이전 전)';

-- 2026-10-05 Tier 확정분 (CLAUDE.md §0.1 Tier 표)
UPDATE public.ums_sites SET tier = 'core',  lifecycle = 'active', hosting = 'vercel'   WHERE slug = 'tenone';
UPDATE public.ums_sites SET tier = 'focus', lifecycle = 'active', hosting = 'vercel'   WHERE slug = 'hero';
UPDATE public.ums_sites SET tier = 'focus', lifecycle = 'active', hosting = 'external' WHERE slug IN ('madleague', 'madleap', 'badak');
-- 그 외: Tier 미결정 · 동결 (개별 결정 전까지 신규 투자 없음). 내부 도구(dokdae·wiki)는 운영 유지
UPDATE public.ums_sites SET lifecycle = 'frozen'
 WHERE slug NOT IN ('tenone', 'hero', 'madleague', 'madleap', 'badak', 'dokdae', 'wiki');

-- ── 2) 유니버스 표기 통일 ──────────────────────────────────
UPDATE public.ums_sites SET universe_label = 'Ten:One™ Universe'
 WHERE universe_label IN ('Powered by Ten:One™', 'Part of Ten:One™ Universe');

-- myverse.kr 도메인 누락 보정 (Vercel 연결 도메인)
UPDATE public.ums_sites
   SET domains = domains || '[{"type":"independent","domain":"myverse.kr","status":"connected"}]'::jsonb
 WHERE slug = 'myverse' AND NOT domains @> '[{"domain":"myverse.kr"}]'::jsonb;

-- ── 3) 호스트명·표시명 → slug ─────────────────────────────
CREATE OR REPLACE FUNCTION public.resolve_site_slug(p_origin text)
RETURNS text
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  WITH o AS (
    SELECT lower(regexp_replace(regexp_replace(coalesce(p_origin, ''), '^https?://', ''), '^www\.', '')) AS v
  )
  SELECT s.slug
  FROM ums_sites s, o
  WHERE o.v <> ''
    AND (
      s.slug = o.v
      OR lower(s.name) = o.v
      OR regexp_replace(lower(coalesce(s.domain, '')), '^www\.', '') = o.v
      OR EXISTS (
        SELECT 1 FROM jsonb_array_elements(coalesce(s.domains, '[]'::jsonb)) d
        WHERE regexp_replace(lower(d->>'domain'), '^www\.', '') = o.v
      )
      OR (o.v LIKE '%.tenone.biz' AND s.slug = split_part(o.v, '.', 1))
    )
  ORDER BY (s.slug = o.v) DESC
  LIMIT 1
$$;
GRANT EXECUTE ON FUNCTION public.resolve_site_slug(text) TO authenticated, service_role;

-- ── 4) member_brand_joins 정규화 + 동의 기록 ───────────────
-- 기존 표시명(MADLeague, WIO Orbi, Evolution School …) → slug
UPDATE public.member_brand_joins j
   SET brand_id = coalesce(
         public.resolve_site_slug(j.brand_id),
         CASE j.brand_id WHEN 'WIO Orbi' THEN 'wio' WHEN 'Evolution School' THEN 'evschool' END,
         j.brand_id)
 WHERE NOT EXISTS (SELECT 1 FROM public.ums_sites s WHERE s.slug = j.brand_id);

ALTER TABLE public.member_brand_joins
  ADD COLUMN IF NOT EXISTS terms_version   text,
  ADD COLUMN IF NOT EXISTS terms_agreed_at timestamptz,
  ADD COLUMN IF NOT EXISTS status          text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS withdrawn_at    timestamptz;

DO $$ BEGIN
  ALTER TABLE public.member_brand_joins ADD CONSTRAINT member_brand_joins_status_check
    CHECK (status IN ('active', 'withdrawn'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.member_brand_joins ADD CONSTRAINT member_brand_joins_brand_fkey
    FOREIGN KEY (brand_id) REFERENCES public.ums_sites(slug) ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

COMMENT ON COLUMN public.member_brand_joins.brand_id      IS 'ums_sites.slug (호스트명·표시명 금지 — resolve_site_slug() 사용)';
COMMENT ON COLUMN public.member_brand_joins.terms_version IS '동의한 브랜드 약관 버전 (데이터 계약 4조)';

-- ── 5) member_brand_withdrawals ───────────────────────────
ALTER TABLE public.member_brand_withdrawals
  ADD COLUMN IF NOT EXISTS scope text NOT NULL DEFAULT 'brand';
DO $$ BEGIN
  ALTER TABLE public.member_brand_withdrawals ADD CONSTRAINT member_brand_withdrawals_scope_check
    CHECK (scope IN ('brand', 'account'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.member_brand_withdrawals ADD CONSTRAINT member_brand_withdrawals_brand_fkey
    FOREIGN KEY (brand_id) REFERENCES public.ums_sites(slug) ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
COMMENT ON COLUMN public.member_brand_withdrawals.scope IS 'brand = 이 브랜드만 탈퇴 | account = 계정 전체 탈퇴 (brand_id는 요청이 들어온 브랜드)';

-- ── 6) 가입 시 브랜드 자동 기록: 호스트명 → slug ──────────
CREATE OR REPLACE FUNCTION public.fn_auto_member_brand_join()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_slug text;
BEGIN
    IF NEW.account_type IN ('member', 'subscriber') AND NEW.origin_site IS NOT NULL THEN
        -- 등록 안 된 tenone 계열 호스트(intra. 등)는 tenone으로
        v_slug := coalesce(public.resolve_site_slug(NEW.origin_site),
                           CASE WHEN NEW.origin_site ILIKE '%tenone.biz%' THEN 'tenone' END);
        IF v_slug IS NOT NULL THEN
            INSERT INTO member_brand_joins (member_id, brand_id, joined_at, origin)
            VALUES (NEW.id, v_slug, now(), 'signup')
            ON CONFLICT (member_id, brand_id) DO NOTHING;
        END IF;
    END IF;
    RETURN NEW;
END;
$function$;
