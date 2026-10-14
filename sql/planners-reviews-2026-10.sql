-- 플래너스 PAD 후기 (아임웹 '구매평' 자리) — 2026-10-14
-- 적용: 2026-10-14 MCP apply_migration `planners_reviews_2026_10` (사용자 승인) · 재실행 가능
--
-- 원칙
--   - 읽기·쓰기 모두 서버만 (service_role) — 사이트 상품 상세는 서버가 공개 후기만 가린 이름으로 렌더, 회원 글쓰기는 /api/planners-library/{id}/reviews (로그인 회원) · 직원은 RLS로 직접 관리 가능
--   - 바닥상회에서 옮긴 후기(source='badak'): 이름을 '첫 글자 + **'로 가리고 회원 연결 정보(회원 코드·주문 번호)는 가져오지 않음 = 익명 정보 (개인정보보호법 제58조의2)
--     → CLAUDE.md §0.1 '회원 데이터 이전 없음'의 사용자 승인 예외 (2026-10-14, 후기만 · 문의는 옮기지 않음)
--   - 사이트 후기(source='site'): member_id만 저장, 화면 이름은 읽을 때 members.name을 가려서 만든다 (계정 정보 복사 금지 — 데이터 계약 1조)
--   - edition = 원래 판 이름 (예: '2024 All in One 플래너'스 플래너 Ver1.1') — 옛 연도 판 후기를 같은 시리즈의 최신 판에 붙일 때 표시

CREATE TABLE IF NOT EXISTS public.planners_reviews (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id        text NOT NULL DEFAULT 'planners',
    file_id         uuid NOT NULL REFERENCES public.planners_files(id) ON DELETE CASCADE,
    source          text NOT NULL CHECK (source IN ('badak', 'site')),
    member_id       uuid REFERENCES public.members(id) ON DELETE CASCADE,   -- site 후기만 (탈퇴 시 함께 삭제)
    masked_name     text,                                                   -- badak 후기만 (이미 가린 이름)
    edition         text,
    rating          int NOT NULL CHECK (rating BETWEEN 1 AND 5),
    body            text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
    is_visible      boolean NOT NULL DEFAULT true,
    admin_reply     text,
    admin_replied_at timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    CHECK ((source = 'site' AND member_id IS NOT NULL) OR (source = 'badak' AND member_id IS NULL))
);

CREATE INDEX IF NOT EXISTS planners_reviews_file_idx ON public.planners_reviews (file_id, created_at DESC) WHERE is_visible;
-- 회원 1명 = 상품 1개당 후기 1개
CREATE UNIQUE INDEX IF NOT EXISTS planners_reviews_member_file_uq ON public.planners_reviews (file_id, member_id) WHERE member_id IS NOT NULL;

ALTER TABLE public.planners_reviews ENABLE ROW LEVEL SECURITY;

-- 브라우저 직접 읽기 없음 — 사이트는 서버(service_role)가 member_id를 빼고 가린 이름만 내려준다 (member_id 노출 방지)
DROP POLICY IF EXISTS planners_reviews_read ON public.planners_reviews;

DROP POLICY IF EXISTS planners_reviews_staff_write ON public.planners_reviews;
CREATE POLICY planners_reviews_staff_write ON public.planners_reviews
    FOR ALL TO authenticated
    USING (auth_is_staff()) WITH CHECK (auth_is_staff());

-- GRANT (부록 D)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.planners_reviews TO authenticated;
GRANT SELECT ON public.planners_reviews TO anon;
GRANT ALL ON public.planners_reviews TO service_role;

-- 되돌리기: DROP TABLE IF EXISTS public.planners_reviews;
