-- MADLeague 동아리 7개 복원 (archive → public) — 2026-10-06 사용자 결정 · 운영 적용 (migration madleague_restore_clubs)
-- 세션 158에서 시드 샘플로 분류돼 archive로 이동됐으나 이름은 실제 MAD League 동아리 (TenOne 연혁 근거).
-- 소개 문구는 샘플 문장이라 비움(NULL). 기수(archive.mad_cohorts 14건)는 근거 확인 전까지 복원하지 않음.
-- archive 원본은 그대로 둔다.

INSERT INTO public.mad_clubs (id, tenant_id, slug, name, region, description, logo_url, cover_url, color, status,
                              established_year, joined_madleague_year, sort_order, created_at, updated_at, president_member_id)
SELECT id, tenant_id, slug, name, region, NULL, logo_url, cover_url, color, status,
       established_year, joined_madleague_year, sort_order, created_at, now(), president_member_id
FROM archive.mad_clubs a
WHERE NOT EXISTS (SELECT 1 FROM public.mad_clubs p WHERE p.id = a.id OR p.slug = a.slug);
