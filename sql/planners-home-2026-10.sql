-- Planner's 첫 화면 관리 — 배너(아임웹 키비주얼) · 진열대(아임웹 쇼핑 기획전) — 2026-10-14
-- 적용: 2026-10-14 MCP apply_migration `planners_home_2026_10` (사용자 승인) · 재실행 가능
--
-- 원칙 (CMS 비전: 코드로 만들고 운영 콘텐츠는 인트라에서)
--   - 공개 기간(starts_at~ends_at) 안 + is_published 인 것만 사이트에 보인다 — 예: 2027 플래너 출시 배너를 날짜에 맞춰 자동 노출
--   - 누구나 읽기(공개분), 쓰기는 직원만 (인트라 /intra/ums/planners/{banners,showcases}, API /api/intra/planners/home)
--   - 사진은 공개 버킷 planners-media (업로드 = /api/intra/planners/files prepare target=media)
--   - 진열대 상품 = planners_files id 목록(순서 그대로). 지워진 상품은 화면에서 건너뜀

CREATE TABLE IF NOT EXISTS public.planners_banners (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id      text NOT NULL DEFAULT 'planners',
    title         text NOT NULL,                 -- 큰 문구
    subtitle      text,                          -- 작은 문구
    image_url     text,                          -- 오른쪽 사진 (없으면 문구만)
    link_url      text,                          -- 버튼 링크 (/planners/pad/… 또는 https://…)
    button_label  text,
    sort_order    int NOT NULL DEFAULT 0,
    is_published  boolean NOT NULL DEFAULT false,
    starts_at     timestamptz,
    ends_at       timestamptz,
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.planners_showcases (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id      text NOT NULL DEFAULT 'planners',
    title         text NOT NULL,                 -- 진열대 제목 (예: 2026 플래너'스 플래너)
    description   text,
    file_ids      uuid[] NOT NULL DEFAULT '{}',  -- planners_files.id (순서 = 진열 순서)
    sort_order    int NOT NULL DEFAULT 0,
    is_published  boolean NOT NULL DEFAULT false,
    starts_at     timestamptz,
    ends_at       timestamptz,
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.planners_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planners_showcases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS planners_banners_read ON public.planners_banners;
CREATE POLICY planners_banners_read ON public.planners_banners FOR SELECT TO anon, authenticated
    USING ((is_published AND (starts_at IS NULL OR starts_at <= now()) AND (ends_at IS NULL OR ends_at > now())) OR auth_is_staff());
DROP POLICY IF EXISTS planners_banners_staff_write ON public.planners_banners;
CREATE POLICY planners_banners_staff_write ON public.planners_banners FOR ALL TO authenticated USING (auth_is_staff()) WITH CHECK (auth_is_staff());

DROP POLICY IF EXISTS planners_showcases_read ON public.planners_showcases;
CREATE POLICY planners_showcases_read ON public.planners_showcases FOR SELECT TO anon, authenticated
    USING ((is_published AND (starts_at IS NULL OR starts_at <= now()) AND (ends_at IS NULL OR ends_at > now())) OR auth_is_staff());
DROP POLICY IF EXISTS planners_showcases_staff_write ON public.planners_showcases;
CREATE POLICY planners_showcases_staff_write ON public.planners_showcases FOR ALL TO authenticated USING (auth_is_staff()) WITH CHECK (auth_is_staff());

-- 시드: 지금 첫 화면에 코드로 박혀 있던 '2026 플래너' 진열대를 데이터로 (있으면 건너뜀)
INSERT INTO public.planners_showcases (title, description, file_ids, sort_order, is_published)
SELECT '2026 플래너''스 플래너', '연간·주간·All in One — 하이퍼링크로 오가는 기획자의 플래너',
       ARRAY(SELECT id FROM public.planners_files WHERE legacy_badak_no IN (182, 184, 183) ORDER BY array_position(ARRAY[182,184,183], legacy_badak_no)),
       10, true
WHERE NOT EXISTS (SELECT 1 FROM public.planners_showcases WHERE title = '2026 플래너''스 플래너');

-- GRANT (부록 D)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.planners_banners TO authenticated;
GRANT SELECT ON public.planners_banners TO anon;
GRANT ALL ON public.planners_banners TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.planners_showcases TO authenticated;
GRANT SELECT ON public.planners_showcases TO anon;
GRANT ALL ON public.planners_showcases TO service_role;

-- 되돌리기: DROP TABLE IF EXISTS public.planners_banners; DROP TABLE IF EXISTS public.planners_showcases;
