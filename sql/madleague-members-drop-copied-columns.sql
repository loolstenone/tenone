-- MADLeague mad_members 복사 컬럼 삭제 — 2단계 (⚠️ madleague-members-core-link 적용 + 새 코드 배포 확인 후에만)
-- 배포 전 실행 시: 운영 중인 옛 코드가 mad_members.name 등을 읽다 실패한다.
-- 실행 전 확인: member_id IS NULL인 행 = 계정 미연결 옛 행 → 이름이 사라지므로 처리 방침 결정 후 실행

-- 컬럼 권한 정리 (phone·avatar_url은 더 이상 본인 수정 대상 아님)
REVOKE UPDATE (phone, avatar_url) ON public.mad_members FROM authenticated;

ALTER TABLE public.mad_members
    DROP COLUMN IF EXISTS name,
    DROP COLUMN IF EXISTS email,
    DROP COLUMN IF EXISTS phone,
    DROP COLUMN IF EXISTS avatar_url;
