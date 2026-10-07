-- ============================================================
-- 유니버스 공통 신청 폼 모듈 (구글 폼형) — forms · form_responses
-- 작성: 2026-10-07 (MADLeague 크리에이지·DAM 파티 참가 신청 → 이벤트마다 새 폼)
-- 적용: 2026-10-07 MCP apply_migration `forms_module` + `forms_module_grant_tighten`
--
-- 왜 공통인가: MADLeague 행사 신청 + RooK RooKie 지원 등 집중 브랜드 2곳 이상이 같은 기능 필요 (데이터 계약 3조)
-- 데이터 계약:
--   1조 회원 응답은 member_id(UUID)로만 연결. 비회원 응답만 respondent_email로 식별
--   2조 권한은 auth_is_staff() 한 곳 (브랜드 자체 권한 컬럼 없음)
--   4조 동의는 폼마다 (목적·항목·보관기간을 폼에 저장, 응답에 동의 버전 기록)
-- 보안: 응답 INSERT/UPDATE는 API(service_role)만 — Turnstile·설정(로그인·기간·정원) 검증을 서버에서 강제
-- ============================================================

-- 1) 폼 정의 ---------------------------------------------------
CREATE TABLE IF NOT EXISTS public.forms (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id     text NOT NULL REFERENCES public.ums_sites(slug) ON UPDATE CASCADE,
    slug         text NOT NULL,                       -- 주소: /{brand}/forms/{slug}
    program      text,                                -- 연결 프로그램 페이지 키 (예: dam, creazy) — 페이지가 이 키의 열린 폼을 버튼으로 노출
    title        text NOT NULL,
    description  text,
    status       text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','open','closed')),
    opens_at     timestamptz,
    closes_at    timestamptz,
    questions    jsonb NOT NULL DEFAULT '[]'::jsonb,  -- [{id,type,label,help,required,options[],allowOther,maxFiles}]
    settings     jsonb NOT NULL DEFAULT '{}'::jsonb,  -- {require_login, allow_edit, one_per_user, max_responses, confirmation, notify_emails[]}
    privacy      jsonb NOT NULL DEFAULT '{}'::jsonb,  -- {purpose, retention} — 동의 문구는 질문 항목에서 자동 생성
    created_by   uuid REFERENCES public.members(id) ON DELETE SET NULL,
    created_at   timestamptz NOT NULL DEFAULT now(),
    updated_at   timestamptz NOT NULL DEFAULT now(),
    UNIQUE (brand_id, slug)
);
CREATE INDEX IF NOT EXISTS forms_brand_program_idx ON public.forms (brand_id, program, status);

-- 2) 응답 -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.form_responses (
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id          uuid NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
    brand_id         text NOT NULL REFERENCES public.ums_sites(slug) ON UPDATE CASCADE,
    member_id        uuid REFERENCES public.members(id) ON DELETE SET NULL,  -- 로그인 응답자 (데이터 계약 1조)
    respondent_email text,                                                   -- 비회원 응답자 식별용만
    answers          jsonb NOT NULL DEFAULT '{}'::jsonb,                     -- {questionId: value}
    attachments      jsonb NOT NULL DEFAULT '[]'::jsonb,                     -- [{questionId,name,size,type,path}] (비공개 버킷 contact-attachments, forms/ 경로)
    consent          jsonb NOT NULL,                                         -- {version, agreed_at, purpose, items, retention}
    status           text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','cancelled')),
    staff_note       text,
    created_at       timestamptz NOT NULL DEFAULT now(),
    updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS form_responses_form_idx   ON public.form_responses (form_id, created_at DESC);
CREATE INDEX IF NOT EXISTS form_responses_member_idx ON public.form_responses (member_id) WHERE member_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS form_responses_status_idx ON public.form_responses (brand_id, status);

-- 3) RLS ------------------------------------------------------
ALTER TABLE public.forms          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_responses ENABLE ROW LEVEL SECURITY;

-- 폼 정의: 공개(open·closed)는 누구나 읽기, 초안은 직원만. 쓰기는 직원만
DROP POLICY IF EXISTS forms_public_read ON public.forms;
CREATE POLICY forms_public_read ON public.forms FOR SELECT TO anon, authenticated
    USING (status IN ('open','closed') OR auth_is_staff());
DROP POLICY IF EXISTS forms_staff_write ON public.forms;
CREATE POLICY forms_staff_write ON public.forms FOR ALL TO authenticated
    USING (auth_is_staff()) WITH CHECK (auth_is_staff());

-- 응답: 본인 응답 읽기 + 직원 전체. 쓰기는 API(service_role, RLS 우회)만 → 사용자 INSERT/UPDATE 정책 없음
DROP POLICY IF EXISTS form_responses_own_read ON public.form_responses;
CREATE POLICY form_responses_own_read ON public.form_responses FOR SELECT TO authenticated
    USING (
        auth_is_staff()
        OR member_id IN (SELECT m.id FROM public.members m WHERE m.auth_id = auth.uid())
    );
DROP POLICY IF EXISTS form_responses_staff_write ON public.form_responses;
CREATE POLICY form_responses_staff_write ON public.form_responses FOR UPDATE TO authenticated
    USING (auth_is_staff()) WITH CHECK (auth_is_staff());

-- 4) updated_at ------------------------------------------------
CREATE OR REPLACE FUNCTION public.forms_touch_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END $$;
DROP TRIGGER IF EXISTS forms_touch ON public.forms;
CREATE TRIGGER forms_touch BEFORE UPDATE ON public.forms FOR EACH ROW EXECUTE FUNCTION public.forms_touch_updated_at();
DROP TRIGGER IF EXISTS form_responses_touch ON public.form_responses;
CREATE TRIGGER form_responses_touch BEFORE UPDATE ON public.form_responses FOR EACH ROW EXECUTE FUNCTION public.forms_touch_updated_at();

-- 5) GRANT (부록 D) — 응답은 anon 권한 없음 -------------------
-- 기본 권한(default privileges)이 anon·authenticated에 ALL을 자동 부여하므로 먼저 회수 (2026-10-07 적용 시 발견)
REVOKE ALL ON public.forms FROM anon, authenticated;
REVOKE ALL ON public.form_responses FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.forms TO authenticated;
GRANT SELECT ON public.forms TO anon;
GRANT ALL ON public.forms TO service_role;
GRANT SELECT, UPDATE ON public.form_responses TO authenticated;
GRANT ALL ON public.form_responses TO service_role;

-- 6) 시드 — madleague.net 신청서 4종을 초안(draft)으로 (직원이 일정·기간을 넣고 '열기') ----
INSERT INTO public.forms (brand_id, slug, program, title, description, status, questions, settings, privacy) VALUES
('madleague', 'creazy', 'creazy', '크리에이지 참가 신청',
 '나의 크리에이티브 함으로 세상에 도전한다 — 글로벌 광고제 출품 프로젝트 참가 신청서입니다.',
 'draft',
 '[{"id":"name","type":"short","label":"이름","required":true},
   {"id":"phone","type":"phone","label":"연락처","required":true},
   {"id":"email","type":"email","label":"이메일","required":true},
   {"id":"intro","type":"long","label":"자기 소개 (대학, 전공 / 관심 분야, 활동 분야)","required":true},
   {"id":"motivation","type":"long","label":"지원 동기와 마음가짐","required":true},
   {"id":"field","type":"radio","label":"지원 분야","required":true,"options":["기획 (조사, 전략)","제작 (카피, 아트)"]},
   {"id":"resume","type":"file","label":"이력서","maxFiles":1},
   {"id":"portfolio","type":"file","label":"포트폴리오","maxFiles":2},
   {"id":"pledge","type":"agree","label":"성실한 참여와 책임감 있는 활동을 약속합니다. (1년여간의 대장정 프로그램입니다)","required":true}]',
 '{"require_login":false,"allow_edit":false,"one_per_user":false,"confirmation":"신청이 접수되었습니다. 검토 후 개별로 연락드리겠습니다."}',
 '{"purpose":"크리에이지 프로그램 참가자 선발·운영 연락","retention":"프로그램 종료 후 1년"}'),
('madleague', 'dam-student', 'dam', 'DAM 파티 학생 참가 신청', '대학생·취업 준비생 참가 신청서입니다.', 'draft',
 '[{"id":"name","type":"short","label":"이름","required":true},
   {"id":"phone","type":"phone","label":"연락처","required":true},
   {"id":"email","type":"email","label":"이메일","required":true},
   {"id":"university","type":"short","label":"대학교","required":true},
   {"id":"major","type":"short","label":"전공 (학년, 휴학, 졸업 예정, 졸업 등)","required":true},
   {"id":"interest","type":"checkbox","label":"관심 분야","options":["마케팅 전략","광고 전략/기획","광고 크리에이티브","매체","상품/서비스 기획","콘텐츠 마케팅","퍼포먼스 마케팅"],"allowOther":true},
   {"id":"speech","type":"radio","label":"3분 스피치 신청","help":"필수가 아니며 희망자에 한해 자기PR 기회로 참여를 권장합니다.","options":["포트폴리오 전시 하고 싶어요","참여 하지 않겠습니다."]},
   {"id":"club","type":"short","label":"활동 동아리 (없으면 없음)"},
   {"id":"intro","type":"long","label":"간단한 자기 소개"}]',
 '{"require_login":false,"allow_edit":false,"one_per_user":false,"confirmation":"신청이 접수되었습니다. 내부 검토 후 참가 확정되신 분께 개별로 안내드립니다."}',
 '{"purpose":"DAM 파티 참가자 선정·행사 운영 연락","retention":"행사 종료 후 1년"}'),
('madleague', 'dam-worker', 'dam', 'DAM 파티 현업 참가 신청', '광고·마케팅 현업 선배 참가 신청서입니다.', 'draft',
 '[{"id":"name","type":"short","label":"이름","required":true},
   {"id":"phone","type":"phone","label":"연락처","required":true},
   {"id":"email","type":"email","label":"이메일","required":true},
   {"id":"intro","type":"long","label":"담당 업무 및 자기 소개 (직무, 연차, 전문 분야 등)","required":true},
   {"id":"together","type":"long","label":"학생들과 함께 하고 싶으신 일이 있으신가요? (후원, 강의, 멘토 등)"}]',
 '{"require_login":false,"allow_edit":false,"one_per_user":false,"confirmation":"신청이 접수되었습니다. 개별로 안내드리겠습니다."}',
 '{"purpose":"DAM 파티 참가자 선정·행사 운영 연락","retention":"행사 종료 후 1년"}'),
('madleague', 'dam-corporate', 'dam', 'DAM 파티 기업 참가 신청', '채용을 고려하는 기업의 참가 신청서입니다.', 'draft',
 '[{"id":"company","type":"short","label":"기업 명","required":true},
   {"id":"name","type":"short","label":"담당자 성명","required":true},
   {"id":"phone","type":"phone","label":"담당자 연락처","required":true},
   {"id":"email","type":"email","label":"담당자 이메일","required":true},
   {"id":"hiring","type":"long","label":"채용을 고려하고 있는 포지션과 규모"},
   {"id":"about","type":"long","label":"간단한 기업 소개"},
   {"id":"homepage","type":"url","label":"홈페이지"},
   {"id":"deck","type":"file","label":"스피치 기업 소개 자료 (차후 별도 전달 가능)","maxFiles":1},
   {"id":"together","type":"long","label":"매드리그와 함께 하고 싶으신 일이 있으신가요? (프로젝트, 인턴, 후원 등)"}]',
 '{"require_login":false,"allow_edit":false,"one_per_user":false,"confirmation":"신청이 접수되었습니다. 개별로 안내드리겠습니다."}',
 '{"purpose":"DAM 파티 참가 기업 선정·행사 운영 연락","retention":"행사 종료 후 1년"}')
ON CONFLICT (brand_id, slug) DO NOTHING;

-- 롤백:
--   DROP TABLE IF EXISTS public.form_responses; DROP TABLE IF EXISTS public.forms;
--   DROP FUNCTION IF EXISTS public.forms_touch_updated_at();
