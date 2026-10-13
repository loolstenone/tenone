/**
 * HIT A 64유형 표기 SSOT — DB hit_hero_types (64개 완비, 인트라에서 관리).
 * 코드 안 type-matching.ts는 18개만 있고 나머지는 MBTI 공용 문구로 대체돼, 결과 카드에
 * "고민쟁이, 성직자, 예언자…" 같은 HeRo 유형과 무관한 별명이 나가던 결함 (2026-10-13).
 * 분류(category: 분석형·외교형 …)는 DB에 없어 코드 매칭표 값을 그대로 쓴다.
 */
import { createAdminClient } from '@/lib/supabase/admin';
import type { TypeProfile } from '@/types/hit';

interface HeroTypeRow {
  character_name: string | null;
  character_label: string | null;
  profile_overview: string | null;
  fit_direction: string | null;
}

/** profile_overview의 "라벨: 본문" 줄에서 본문만 — 없으면 null */
function overviewLine(overview: string | null | undefined, label: string): string | null {
  if (!overview) return null;
  const line = overview.split(/\n+/).map(s => s.trim()).find(s => s.startsWith(`${label}:`));
  return line ? line.slice(label.length + 1).trim() : null;
}

/** 코드 매칭표 결과에 DB 유형 표기를 덮어쓴다. DB에 없으면 매칭표 값 그대로 */
export async function applyHeroTypeFromDb(profile: TypeProfile): Promise<TypeProfile> {
  const { data } = await createAdminClient()
    .from('hit_hero_types')
    .select('character_name, character_label, profile_overview, fit_direction')
    .eq('type_code', profile.code)
    .maybeSingle();
  const row = data as HeroTypeRow | null;
  if (!row) return profile;
  return {
    ...profile,
    nameKo: row.character_name || profile.nameKo,
    nickname: row.character_label || profile.nickname,
    // 카드 '특성' = 빛나는 순간, '커리어 방향' = 성장 경로 (핵심 문장은 카드 아래 개요로 따로 나간다)
    traits: overviewLine(row.profile_overview, '빛나는 순간') ?? overviewLine(row.profile_overview, '핵심') ?? profile.traits,
    careers: row.fit_direction || profile.careers,
  };
}
