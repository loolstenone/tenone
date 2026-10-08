import { ptQuestions } from '@/lib/hit/data/pt-questions';
import { discQuestions } from '@/lib/hit/data/disc-questions';
import heroTypes from '@/lib/hit/data/hero-types-full.json';
import { HitTasteClient, type TasteDisc, type TasteLikert, type TasteType } from '@/features/madleague/HitTasteClient';

/**
 * HIT 미니 — MADLeague에서 맛보는 HeRo HIT (2026-10-09 사용자 결정: 맛보기는 MADLeague 안에서 바로 체험).
 * 정식 HIT A(127문항·약 20분)에서 성격유형 16문항(축별 4) + 행동유형 상황 4문항만 골라 영웅 유형을 미리 본다.
 *
 * - 결과는 브라우저에서만 계산하고 어디에도 저장하지 않는다 → 개인정보 수집 없음 (동의 불필요)
 * - 정식 결과·풀 리포트는 HeRo에서 (같은 Ten:One ID). 맛보기 결과를 HeRo로 넘기는 건 서비스 간 연계 동의가 생긴 뒤
 * - 문항·유형 원천은 HeRo 데이터(lib/hit/data) 그대로 — 여기서 문구를 고치지 않는다
 */

// 축별 양쪽 방향 2문항씩 = 축당 4문항
const PT_PICK = ['pt_e01', 'pt_e03', 'pt_i01', 'pt_i04', 'pt_n01', 'pt_n03', 'pt_s01', 'pt_s04', 'pt_t01', 'pt_t02', 'pt_f02', 'pt_f04', 'pt_j01', 'pt_j05', 'pt_p02', 'pt_p03'];
const DISC_PICK = ['disc_001', 'disc_004', 'disc_007', 'disc_015'];

type HeroTypeRow = { type_code: string; character_name: string; character_label: string; profile_overview: string; strengths: { title: string }[] };

export function HitTaste() {
  const likert: TasteLikert[] = PT_PICK.map((id) => {
    const q = ptQuestions.find((x) => x.id === id);
    if (!q) throw new Error(`HIT 미니 문항 없음: ${id}`);
    return { id: q.id, text: q.text, direction: q.direction as TasteLikert['direction'], reverse: q.reverse };
  });
  const disc: TasteDisc[] = DISC_PICK.map((id) => {
    const q = discQuestions.find((x) => x.id === id);
    if (!q) throw new Error(`HIT 미니 문항 없음: ${id}`);
    return { id: q.id, text: q.text, options: q.options.map((o) => ({ value: o.value, label: o.label })) };
  });
  // 클라이언트로는 결과 카드에 필요한 필드만 (원본 JSON 230KB를 번들에 넣지 않는다)
  const types: Record<string, TasteType> = Object.fromEntries(
    (heroTypes as HeroTypeRow[]).map((t) => [t.type_code, {
      name: t.character_name,
      label: t.character_label,
      overview: t.profile_overview.split('\n\n')[0],
      strengths: t.strengths.slice(0, 3).map((s) => s.title),
    }]),
  );
  return <HitTasteClient likert={likert} disc={disc} types={types} />;
}
