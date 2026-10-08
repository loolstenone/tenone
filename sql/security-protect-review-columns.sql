-- security-protect-review-columns.sql
-- 적용: 2026-10-08 (세션 165) — MCP apply_migration `security_protect_review_columns`
--
-- 문제 (점검 축3 H-4): 본인 UPDATE/ALL 정책이 심사·승인 컬럼까지 허용 → 자기 승인.
--   brand_membership_applications — 본인이 status='approved' → trg_approve_membership가 member_brand_joins 생성 (승인 멤버십 가입 성립)
--   jakka_showcases               — 본인이 status='approved'·approved_at 수정 (3인 승인 우회)
--   approvals                     — 기안자가 status 수정 (자기 결재)
-- 수정: members 보호 트리거(protect-member-privileged-columns.sql)와 같은 방식의 공용 트리거.
--   컬럼 REVOKE는 인트라 직원 화면(같은 authenticated 역할)도 막으므로 쓰지 않는다.
--   통과: service_role·postgres(서버) · 다른 트리거 안의 변경(pg_trigger_depth()>1 — 예: Jakka 3인 승인 집계)
--         · 직원(auth_is_staff()) · (brand_membership_applications만) 그 브랜드 관리자 has_brand_admin_access(brand_id)
--   그 외 본인: status는 TG_ARGV[0] 허용 목록(쉼표) 안에서만, TG_ARGV[1..] 컬럼은 INSERT 시 NULL·UPDATE 시 원래 값
-- 대상 행: 3 테이블 모두 0행 (2026-10-08)
-- 이후 별도: wio_subscriptions·wio_tenants(자가 구독·업그레이드) · wio_approvals/timesheets/points · /api/approvals/[id] 필드 화이트리스트
--   → WIO 테넌트 자가 가입 항목과 함께. montz_creators.is_verified 등 나머지 H-4 항목도 이후
-- 롤백: DROP TRIGGER protect_review_columns ON (3 테이블); DROP FUNCTION public.protect_review_columns();

CREATE OR REPLACE FUNCTION public.protect_review_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  allowed text[] := string_to_array(TG_ARGV[0], ',');
  n jsonb;
  o jsonb;
  i int;
BEGIN
  IF coalesce(auth.role(), '') NOT IN ('authenticated', 'anon') THEN
    RETURN NEW;
  END IF;
  IF pg_trigger_depth() > 1 THEN
    RETURN NEW;
  END IF;
  IF public.auth_is_staff() THEN
    RETURN NEW;
  END IF;

  n := to_jsonb(NEW);

  -- 테이블마다 컬럼이 달라 NEW.brand_id 대신 jsonb로 읽는다 (plpgsql은 AND를 단락 평가하지 않음)
  IF TG_TABLE_NAME = 'brand_membership_applications' AND public.has_brand_admin_access(n->>'brand_id') THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NOT (n->>'status' = ANY (allowed)) THEN
      n := jsonb_set(n, '{status}', to_jsonb(allowed[1]));
    END IF;
    FOR i IN 1 .. TG_NARGS - 1 LOOP
      n := jsonb_set(n, ARRAY[TG_ARGV[i]], 'null'::jsonb);
    END LOOP;
  ELSE
    o := to_jsonb(OLD);
    IF (n->>'status') IS DISTINCT FROM (o->>'status') AND NOT (n->>'status' = ANY (allowed)) THEN
      n := jsonb_set(n, '{status}', o->'status');
    END IF;
    FOR i IN 1 .. TG_NARGS - 1 LOOP
      n := jsonb_set(n, ARRAY[TG_ARGV[i]], coalesce(o->TG_ARGV[i], 'null'::jsonb));
    END LOOP;
  END IF;

  NEW := jsonb_populate_record(NEW, n);
  RETURN NEW;
END;
$$;

-- (trigger 반환 함수는 직접 호출 불가 — 실행 권한 REVOKE 불필요)

DROP TRIGGER IF EXISTS protect_review_columns ON public.brand_membership_applications;
CREATE TRIGGER protect_review_columns
  BEFORE INSERT OR UPDATE ON public.brand_membership_applications
  FOR EACH ROW EXECUTE FUNCTION public.protect_review_columns('pending,withdrawn', 'reviewed_at', 'reviewed_by', 'reviewer_note');

DROP TRIGGER IF EXISTS protect_review_columns ON public.jakka_showcases;
CREATE TRIGGER protect_review_columns
  BEFORE INSERT OR UPDATE ON public.jakka_showcases
  FOR EACH ROW EXECUTE FUNCTION public.protect_review_columns('pending', 'approved_at', 'rejected_at', 'admin_user_id');

DROP TRIGGER IF EXISTS protect_review_columns ON public.approvals;
CREATE TRIGGER protect_review_columns
  BEFORE INSERT OR UPDATE ON public.approvals
  FOR EACH ROW EXECUTE FUNCTION public.protect_review_columns('draft,pending,cancelled', 'completed_at');
