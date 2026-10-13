-- ============================================================
-- HeRo 인재 제안 (기업 → 인재 면접·인터뷰 제안) — 2026-10-13 적용 (MCP apply_migration)
--
-- 흐름: 인재가 '제안 받기'를 켠다(hero_offer_settings) → 기업이 인재상을 입력하면 조건에 맞는 인원수(익명)를 본다
--       → 기업이 제안 요청(hero_offers.status='requested') → 운영자 검토·결제 확인 → 발송(status='sent', 수신자 행 생성·알림)
--       → 인재가 응하면 이력서·(선택)HIT 결과 제공 동의(provision_consent) → 기업이 응한 사람만 열람
--
-- 법적 전제 (사용자 결정 2026-10-13): 유료직업소개사업 등록 · 통신판매업 신고 후 공개.
--   발송은 서버 스위치 HERO_OFFERS_LIVE=true 일 때만 (직원 검토 화면은 항상).
-- 개인정보: 설정 = 수집·이용 동의(제15조, consent_version) · 응할 때 = 제3자 제공 동의(제17조, provision_consent)
-- 채용절차법: 기업 열람 기한 destroy_due (응답일 + 180일) 이후 기업 화면에서 이력서 비공개
-- ============================================================

-- 1. 인재: 제안 받기 설정 (회원 1명 1행)
CREATE TABLE IF NOT EXISTS public.hero_offer_settings (
    member_id       uuid PRIMARY KEY REFERENCES public.members(id) ON DELETE CASCADE,
    is_open         boolean NOT NULL DEFAULT false,          -- 제안 받기 켜짐
    job_functions   text[]  NOT NULL DEFAULT '{}',           -- lib/badak-constants JOB_FUNCTIONS
    industries      text[]  NOT NULL DEFAULT '{}',           -- INDUSTRIES (비면 무관)
    career_level    text,                                    -- JOB_LEVELS
    work_mode       text,                                    -- remote | hybrid | onsite | any
    locations       text[]  NOT NULL DEFAULT '{}',           -- seoul | gyeonggi | ... | any
    consent_version text,
    consented_at    timestamptz,
    brand_id        text NOT NULL DEFAULT 'hero',
    tenant_id       text NOT NULL DEFAULT 'tenone',
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS hero_offer_settings_open_idx ON public.hero_offer_settings (is_open) WHERE is_open;

-- 2. 기업: 제안
CREATE TABLE IF NOT EXISTS public.hero_offers (
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id       uuid NOT NULL REFERENCES public.hero_companies(id) ON DELETE CASCADE,
    sender_member_id uuid REFERENCES public.members(id) ON DELETE SET NULL,
    jd_id            uuid REFERENCES public.hero_jd(id) ON DELETE SET NULL,
    offer_type       text NOT NULL DEFAULT 'interview' CHECK (offer_type IN ('interview', 'coffee_chat')),
    title            text NOT NULL,
    message          text NOT NULL,
    criteria         jsonb NOT NULL DEFAULT '{}'::jsonb,     -- 인재상 조건 스냅숏
    target_count     integer NOT NULL DEFAULT 0,             -- 요청 시점 조건 맞는 인원
    status           text NOT NULL DEFAULT 'requested'
                     CHECK (status IN ('requested', 'sent', 'rejected', 'closed', 'canceled')),
    review_note      text,                                   -- 운영자 메모 (반려 사유는 기업에 보임)
    reviewed_by      uuid REFERENCES public.members(id) ON DELETE SET NULL,
    reviewed_at      timestamptz,
    paid_at          timestamptz,                            -- 결제 확인 (PG 연동 전엔 운영자가 확인)
    sent_at          timestamptz,
    respond_by       date,                                   -- 응답 마감일
    closed_at        timestamptz,
    brand_id         text NOT NULL DEFAULT 'hero',
    tenant_id        text NOT NULL DEFAULT 'tenone',
    created_at       timestamptz NOT NULL DEFAULT now(),
    updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS hero_offers_company_idx ON public.hero_offers (company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS hero_offers_status_idx ON public.hero_offers (status);

-- 3. 제안 수신자 (발송 시 생성)
CREATE TABLE IF NOT EXISTS public.hero_offer_recipients (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id          uuid NOT NULL REFERENCES public.hero_offers(id) ON DELETE CASCADE,
    member_id         uuid REFERENCES public.members(id) ON DELETE SET NULL,   -- 탈퇴 시 연결만 끊고 기록은 익명 보존 (직업소개 장부)
    status            text NOT NULL DEFAULT 'sent'
                      CHECK (status IN ('sent', 'viewed', 'accepted', 'declined', 'expired')),
    resume_id         uuid REFERENCES public.resumes(id) ON DELETE SET NULL,
    talent_message    text,
    provision_consent jsonb,                                 -- {recipient, purpose, items[], retention, version, agreed_at}
    viewed_at         timestamptz,
    responded_at      timestamptz,
    company_status    text NOT NULL DEFAULT 'new'
                      CHECK (company_status IN ('new', 'reviewing', 'interview', 'passed', 'hold', 'closed')),
    company_note      text,
    destroy_due       date,                                  -- 기업 열람 기한 (채용절차법)
    brand_id          text NOT NULL DEFAULT 'hero',
    tenant_id         text NOT NULL DEFAULT 'tenone',
    created_at        timestamptz NOT NULL DEFAULT now(),
    updated_at        timestamptz NOT NULL DEFAULT now(),
    UNIQUE (offer_id, member_id)
);
CREATE INDEX IF NOT EXISTS hero_offer_recipients_member_idx ON public.hero_offer_recipients (member_id, created_at DESC);

-- 4. RLS — 쓰기는 서버 API(service_role)만. 브라우저는 본인 행 읽기 + 직원
ALTER TABLE public.hero_offer_settings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_offers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_offer_recipients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS hero_offer_settings_self_staff_read ON public.hero_offer_settings;
CREATE POLICY hero_offer_settings_self_staff_read ON public.hero_offer_settings
    FOR SELECT TO authenticated USING (member_id = public.hero_current_member_id() OR public.auth_is_staff());

DROP POLICY IF EXISTS hero_offers_company_staff_read ON public.hero_offers;
CREATE POLICY hero_offers_company_staff_read ON public.hero_offers
    FOR SELECT TO authenticated USING (
        public.auth_is_staff() OR EXISTS (
            SELECT 1 FROM public.hero_company_members cm
            WHERE cm.company_id = hero_offers.company_id
              AND cm.member_id = public.hero_current_member_id()
              AND cm.status = 'active'
        )
    );

DROP POLICY IF EXISTS hero_offer_recipients_self_staff_read ON public.hero_offer_recipients;
CREATE POLICY hero_offer_recipients_self_staff_read ON public.hero_offer_recipients
    FOR SELECT TO authenticated USING (member_id = public.hero_current_member_id() OR public.auth_is_staff());

-- 5. GRANT (2026-10-30 정책 — 부록 D). anon 읽기 없음 (개인 데이터)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hero_offer_settings   TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hero_offers           TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hero_offer_recipients TO authenticated;
GRANT ALL ON public.hero_offer_settings   TO service_role;
GRANT ALL ON public.hero_offers           TO service_role;
GRANT ALL ON public.hero_offer_recipients TO service_role;

-- 6. 조건 맞는 인재 (제안 받기 켠 사람만) — 서버(service_role) 전용. 직무명에 쉼표·괄호가 있어 PostgREST 필터 대신 SQL
--    criteria: { job_functions[], industries[], career_levels[], work_mode, locations[], require_hit_a }
--    인재 쪽 빈 값(산업·지역 미선택, 근무 형태 any)은 '무관'으로 본다. 해당 기업 소속 회원은 제외
CREATE OR REPLACE FUNCTION public.hero_offer_candidates(_criteria jsonb, _exclude_company uuid DEFAULT NULL)
RETURNS TABLE (member_id uuid)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
    WITH c AS (
        SELECT
            COALESCE(ARRAY(SELECT jsonb_array_elements_text(_criteria -> 'job_functions')), '{}') AS jf,
            COALESCE(ARRAY(SELECT jsonb_array_elements_text(_criteria -> 'industries')), '{}')    AS ind,
            COALESCE(ARRAY(SELECT jsonb_array_elements_text(_criteria -> 'career_levels')), '{}') AS lv,
            NULLIF(_criteria ->> 'work_mode', '')                                                 AS wm,
            COALESCE(ARRAY(SELECT jsonb_array_elements_text(_criteria -> 'locations')), '{}')     AS loc,
            COALESCE((_criteria ->> 'require_hit_a')::boolean, false)                             AS hit_a
    )
    SELECT s.member_id
    FROM hero_offer_settings s, c
    WHERE s.is_open AND s.consented_at IS NOT NULL
      AND cardinality(c.jf) > 0 AND s.job_functions && c.jf
      AND (cardinality(c.ind) = 0 OR cardinality(s.industries) = 0 OR s.industries && c.ind)
      AND (cardinality(c.lv)  = 0 OR s.career_level = ANY (c.lv))
      AND (c.wm IS NULL OR c.wm = 'any' OR s.work_mode IS NULL OR s.work_mode IN ('any', c.wm))
      AND (cardinality(c.loc) = 0 OR cardinality(s.locations) = 0 OR 'any' = ANY (s.locations) OR s.locations && c.loc)
      AND (NOT c.hit_a OR EXISTS (SELECT 1 FROM hit_a_results r WHERE r.member_id = s.member_id))
      AND (_exclude_company IS NULL OR NOT EXISTS (
            SELECT 1 FROM hero_company_members cm WHERE cm.company_id = _exclude_company AND cm.member_id = s.member_id))
$$;
REVOKE ALL ON FUNCTION public.hero_offer_candidates(jsonb, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.hero_offer_candidates(jsonb, uuid) TO service_role;

-- ── [선택] 성향 통계 포함 동의 (2026-10-13 적용, MCP apply_migration hero_offer_settings_share_traits)
-- 원칙: 개인 HIT 결과는 본인만 본다(자기 개발·성장용). 기업에는 '원하는 성향의 인재가 어느 정도인지' 묶음 통계만,
-- 그것도 본인이 따로 동의한 경우에만 포함 (기본 off)
ALTER TABLE public.hero_offer_settings
  ADD COLUMN IF NOT EXISTS share_traits boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS traits_consented_at timestamptz,
  ADD COLUMN IF NOT EXISTS traits_consent_version text;
