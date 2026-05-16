-- SmarComm Entity 자동 등록 트리거 — Phase 5 Item 2
-- marketing_campaigns.status = 'Completed' 전환 시 smarcomm_brand_assets에 Service entity 자동 INSERT

-- ── 트리거 함수
CREATE OR REPLACE FUNCTION smarcomm_auto_assetize_on_campaign_complete()
RETURNS TRIGGER AS $$
DECLARE
  v_base_slug TEXT;
  v_slug      TEXT;
  v_counter   INT := 0;
BEGIN
  -- Completed 전환 시에만 실행
  IF NEW.status <> 'Completed' OR OLD.status = 'Completed' THEN
    RETURN NEW;
  END IF;

  -- 슬러그 생성: 영문·숫자·한글·공백 유지 → 공백을 '-'로, 소문자화
  v_base_slug := lower(trim(regexp_replace(
    regexp_replace(NEW.name, '[^a-zA-Z0-9\s가-힣]', '', 'g'),
    '\s+', '-', 'g'
  )));

  IF v_base_slug = '' OR v_base_slug = '-' THEN
    v_base_slug := 'campaign';
  END IF;
  IF length(v_base_slug) > 80 THEN
    v_base_slug := left(v_base_slug, 80);
  END IF;

  v_slug := v_base_slug;

  -- 슬러그 충돌 회피
  WHILE EXISTS (
    SELECT 1 FROM smarcomm_brand_assets
    WHERE tenant_id = NEW.tenant_id AND slug = v_slug
  ) LOOP
    v_counter := v_counter + 1;
    v_slug    := v_base_slug || '-' || v_counter::text;
    IF v_counter > 99 THEN EXIT; END IF;
  END LOOP;

  -- Service Entity INSERT (이미 같은 캠페인 ID로 자산이 있으면 skip)
  INSERT INTO smarcomm_brand_assets (
    tenant_id,
    entity_type,
    name,
    slug,
    description,
    schema_jsonld,
    source_campaign_id,
    is_public,
    persistence_score
  )
  SELECT
    NEW.tenant_id,
    'Service',
    NEW.name,
    v_slug,
    COALESCE(NEW.target_audience, NEW.name || ' 캠페인 산출물'),
    jsonb_build_object(
      '@context',    'https://schema.org',
      '@type',       'Service',
      'name',        NEW.name,
      'serviceType', NEW.type,
      'audience',    jsonb_build_object(
        '@type',       'Audience',
        'audienceType', COALESCE(NEW.target_audience, '')
      )
    ),
    NEW.id,
    false,
    0
  WHERE NOT EXISTS (
    SELECT 1 FROM smarcomm_brand_assets
    WHERE tenant_id = NEW.tenant_id
      AND source_campaign_id = NEW.id
      AND entity_type = 'Service'
      AND valid_until IS NULL
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 트리거 등록 (재실행 안전)
DROP TRIGGER IF EXISTS smarcomm_campaign_complete_assetize ON marketing_campaigns;

CREATE TRIGGER smarcomm_campaign_complete_assetize
  AFTER UPDATE OF status ON marketing_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION smarcomm_auto_assetize_on_campaign_complete();
