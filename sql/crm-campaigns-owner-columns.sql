-- Phase 3.1 (옵션 A): crm_campaigns에 SmarComm 격리용 owner 컬럼 추가
-- 기존 인트라 발송 경로에 영향 없음 (created_by_service DEFAULT='intra').
-- SmarComm 사용자는 본인 캠페인만 SELECT/INSERT/UPDATE/DELETE 가능.

ALTER TABLE crm_campaigns
  ADD COLUMN IF NOT EXISTS created_by_service TEXT NOT NULL DEFAULT 'intra'
    CHECK (created_by_service IN ('intra','smarcomm')),
  ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_crm_campaigns_service_owner
  ON crm_campaigns(created_by_service, owner_user_id)
  WHERE created_by_service = 'smarcomm';

-- SmarComm 사용자 본인 캠페인 한정 RLS
DROP POLICY IF EXISTS "crm_campaigns smarcomm owner" ON crm_campaigns;
CREATE POLICY "crm_campaigns smarcomm owner" ON crm_campaigns FOR ALL USING (
  created_by_service = 'smarcomm'
  AND owner_user_id = auth.uid()
) WITH CHECK (
  created_by_service = 'smarcomm'
  AND owner_user_id = auth.uid()
);
