-- 코어 프로그램 모듈 3단계 — 인증서 (2026-10-08 적용, migration program_certificates)
-- 로그인한 본인이 직접 발급·다운로드. 첫 발급 때만 생년월일·출신 대학·전공을 받고, 발급 시점 값을 snapshot에 고정한다.
-- 인트라 관리 컬럼: 구분(type) · 코드(code) · 발급일(issued_at) · 비고(note) · 결과(result). 전화번호는 받지 않는다 (최소 수집).
-- 공개: 코드 진위 확인만 (서버 API — 이름 마스킹, 생년월일·대학·전공 비공개). 테이블은 anon·authenticated 권한 없음.
-- 탈퇴: member_id NULL + snapshot의 생년월일·대학·전공 삭제·이름 마스킹 (진위 확인용 익명 기록만 유지 — 제21조, docs/Data_Lifecycle.md)
-- 옛 mad_certificates(0건)·mad_eligible_certificates·mad_gen_cert_code는 배포 후 program-module-drop-mad.sql에서 정리

CREATE TABLE IF NOT EXISTS public.program_certificates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id text NOT NULL DEFAULT 'tenone',
    brand_id text NOT NULL REFERENCES public.ums_sites(slug),
    round_id uuid REFERENCES public.program_rounds(id) ON DELETE RESTRICT,   -- NULL = 브랜드 활동 인증 (MADLeague 동아리 활동 연도 등)
    member_id uuid REFERENCES public.members(id) ON DELETE SET NULL,
    cert_key text NOT NULL,            -- 중복 발급 방지 키: round:{id} · activity:{year}
    type text NOT NULL CHECK (type IN ('participation', 'award', 'activity', 'completion')),
    code text NOT NULL UNIQUE,
    result text,                       -- 결과 (대상 · 2위 · 본선 진출 · 참가 · 활동 완료)
    note text,                         -- 비고 (인트라)
    snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,   -- 발급 시점 값: name·birthdate·university·major·group_name·cohort·team_name·round_title·year·client_name·brand_name
    issued_at timestamptz NOT NULL DEFAULT now(),
    revoked_at timestamptz,
    revoked_reason text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS program_certificates_member_key_uniq
    ON public.program_certificates (member_id, brand_id, cert_key) WHERE revoked_at IS NULL AND member_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS program_certificates_brand_idx ON public.program_certificates (brand_id, issued_at DESC);
CREATE INDEX IF NOT EXISTS program_certificates_round_idx ON public.program_certificates (round_id);

ALTER TABLE public.program_certificates ENABLE ROW LEVEL SECURITY;
-- 정책 없음 = anon·authenticated 접근 불가. 서버 API(service_role)만.
REVOKE ALL ON public.program_certificates FROM anon, authenticated;
GRANT ALL ON public.program_certificates TO service_role;
