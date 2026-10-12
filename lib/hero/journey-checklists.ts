/**
 * Journey 준비 체크리스트 — 검사에서 분리한 "상태형" 항목 (2026-10-12, docs/HIT_Structure_Consulting_2026-10.md §2.5)
 *
 *   검사 점수는 "지금의 나"를 재고, 체크리스트는 "지금까지 한 일"을 센다.
 *   이력서·면접·타이밍·재정·레퍼런스 같은 항목은 7점 척도로 잴 것이 아니라 예/아니오로 두고 언제든 갱신한다.
 *   완료율은 생애주기 검사 결과의 "준비도" 점수로 쓴다 (`app/api/hit/{d,e,f,gap}/score`).
 *
 * 항목 key = 옛 문항 id (hit_questions test_type '{X}_checklist'로 보존). 문구를 고치려면 여기서.
 * 저장: hero_journey_checklist_items(member_id, stage, item_key, checked_at)
 */
import type { SupabaseClient } from '@supabase/supabase-js';

export type ChecklistStage = 'c' | 'd' | 'e' | 'f' | 'gap';

export interface ChecklistItem { key: string; group: string; text: string }

const C: ChecklistItem[] = [
  { key: 'b_ar01', group: '서류', text: '이력서가 최신 상태로 준비되어 있다' },
  { key: 'b_ar02', group: '서류', text: '자기소개서를 기업별로 맞춤 작성할 수 있다' },
  { key: 'b_sr03', group: '서류', text: '포트폴리오나 결과물을 제출할 수 있는 상태다' },
  { key: 'b_ar03', group: '면접', text: '면접에서 자기 소개를 자신 있게 할 수 있다' },
  { key: 'b_ar04', group: '면접', text: '면접 예상 질문에 대한 답변을 준비했다' },
  { key: 'b_sr01', group: '역량', text: '희망 직무 관련 자격증이나 수료증이 있다' },
  { key: 'b_sr02', group: '역량', text: '인턴·아르바이트·프로젝트 등 실무 경험이 있다' },
  { key: 'b_sr04', group: '역량', text: '희망 직무에 필요한 도구(소프트웨어·장비)를 다룰 수 있다' },
  { key: 'b_sr05', group: '역량', text: '역량 갭을 알고 있고 보완 계획이 있다' },
  { key: 'b_sr06', group: '역량', text: '관련 분야 스터디·동아리·커뮤니티에 참여한 적이 있다' },
  { key: 'b_sr08', group: '역량', text: '부족한 영역을 보완하기 위해 지금 하고 있는 활동이 있다' },
  { key: 'b_ar05', group: '활동', text: '취업 관련 네트워킹(OB 방문·박람회 등)에 참여한 적이 있다' },
  { key: 'b_ar06', group: '활동', text: '구직 활동에 쓰는 시간을 정기적으로 확보하고 있다' },
  { key: 'b_ar08', group: '활동', text: '취업 활동을 지지해 주는 가족·친구·멘토가 있다' },
];

const D: ChecklistItem[] = [
  { key: 'c_dc01', group: '서류', text: '최신 이력서가 준비되어 있다' },
  { key: 'c_dc03', group: '서류', text: '포트폴리오·성과 자료를 체계적으로 정리해 두었다' },
  { key: 'c_dc04', group: '서류', text: '자기소개서를 목표 기업에 맞게 고칠 수 있다' },
  { key: 'c_dc05', group: '서류', text: '링크드인·직무 플랫폼 프로필이 최신 상태다' },
  { key: 'c_dc02', group: '면접', text: '이직 사유를 긍정적이고 설득력 있게 설명할 수 있다' },
  { key: 'c_iv01', group: '면접', text: '경력 기반 면접(STAR)에 대비하고 있다' },
  { key: 'c_iv02', group: '면접', text: '"왜 이직하려 하는가"에 대한 답이 준비되어 있다' },
  { key: 'c_iv03', group: '면접', text: '연봉 협상 전략이 있다' },
  { key: 'c_iv04', group: '면접', text: '모의 면접이나 피드백을 받아 본 적이 있다' },
  { key: 'c_iv05', group: '면접', text: '내 강점을 구체적 사례와 함께 설명할 수 있다' },
  { key: 'c_tm01', group: '타이밍', text: '이직 시점을 전략적으로 정했다' },
  { key: 'c_tm02', group: '타이밍', text: '이직 활동에 쓸 시간을 확보했다' },
  { key: 'c_tm03', group: '타이밍', text: '현 직장 퇴사 절차를 계획했다' },
  { key: 'c_tm04', group: '타이밍', text: '이직이 늦어질 경우의 플랜 B가 있다' },
  { key: 'c_tm05', group: '타이밍', text: '이직 기간의 생활비를 감당할 재정 여유가 있다' },
  { key: 'c_ps02', group: '지지', text: '가족이나 가까운 사람이 이직 계획을 지지한다' },
  { key: 'c_ps04', group: '지지', text: '이직 후 후회할 가능성을 충분히 생각해 보았다' },
];

const E: ChecklistItem[] = [
  { key: 'd_po01', group: '포지셔닝', text: '"왜 지금 이직하는가"에 대한 설득력 있는 답이 있다' },
  { key: 'd_po02', group: '포지셔닝', text: '내 경력 스토리를 3분 안에 전달할 수 있다' },
  { key: 'd_po03', group: '포지셔닝', text: '목표 기업이 나를 뽑아야 하는 이유를 설명할 수 있다' },
  { key: 'd_po04', group: '포지셔닝', text: '과거 이직 경험을 성장 스토리로 설명할 수 있다' },
  { key: 'd_po05', group: '포지셔닝', text: '고년차의 강점(경험·안정성·네트워크)을 어필할 수 있다' },
  { key: 'd_cm01', group: '보상', text: '내 시장 가치(연봉 수준)를 객관적으로 파악했다' },
  { key: 'd_cm02', group: '보상', text: '연봉 외 조건(직급·권한·성과급)도 협상할 준비가 되어 있다' },
  { key: 'd_cm04', group: '보상', text: '기대 연봉의 합리적 근거를 제시할 수 있다' },
  { key: 'd_rf01', group: '레퍼런스·절차', text: '레퍼런스 체크에 대비했다' },
  { key: 'd_rf02', group: '레퍼런스·절차', text: '비경쟁 조항 등 법적 이슈를 확인했다' },
  { key: 'd_rf04', group: '레퍼런스·절차', text: '현 직장 퇴사 프로세스를 계획했다' },
  { key: 'd_rf05', group: '레퍼런스·절차', text: '이직이 현 직장에 미칠 영향을 고려했다' },
];

const F: ChecklistItem[] = [
  { key: 'e_fr02', group: '재정', text: '은퇴 후 예상 지출을 계산해 보았다' },
  { key: 'e_fr03', group: '재정', text: '연금·저축·투자 등 노후 자금 계획이 있다' },
  { key: 'e_fr01', group: '재정', text: '소득이 없어도 최소 2년은 생활할 수 있다' },
  { key: 'e_fr06', group: '재정', text: '재정 상담을 받았거나 받을 계획이다' },
  { key: 'e_tr01', group: '시간', text: '은퇴 후 하루 일과를 구체적으로 그려 보았다' },
  { key: 'e_tr03', group: '시간', text: '자유 시간이 많아지면 할 일의 목록이 있다' },
  { key: 'e_tr06', group: '시간', text: '아침에 일어날 이유가 직장 외에도 있다' },
  { key: 'e_er05', group: '건강', text: '건강 검진을 정기적으로 받고 있다' },
  { key: 'e_er02', group: '건강', text: '스트레스를 관리하는 나만의 방법이 있다' },
  { key: 'e_er06', group: '건강', text: '2막을 시작할 체력을 만들기 위해 노력하고 있다' },
  { key: 'e_rr01', group: '관계', text: '배우자·가족과 은퇴 후 생활에 대해 충분히 대화했다' },
  { key: 'e_rr02', group: '관계', text: '직장 동료가 아닌 친구·지인 관계가 충분하다' },
  { key: 'e_rr04', group: '관계', text: '은퇴 후 배우자와의 관계 변화를 준비하고 있다' },
];

const GAP: ChecklistItem[] = [
  { key: 'f_su01', group: '스킬', text: '복귀 대상 직무에 필요한 현재 스킬을 파악했다' },
  { key: 'f_su02', group: '스킬', text: '갭을 메우기 위한 학습 계획이 있다' },
  { key: 'f_su03', group: '스킬', text: '온라인 강좌·부트캠프 등을 수강했거나 수강 중이다' },
  { key: 'f_su05', group: '스킬', text: '단기간 집중 학습할 환경을 확보했다' },
  { key: 'f_nw01', group: '네트워크', text: '이전 직장·업계 인맥과 연락이 가능하다' },
  { key: 'f_nw02', group: '네트워크', text: '복귀를 도와줄 멘토나 조력자가 있다' },
  { key: 'f_nw04', group: '네트워크', text: '네트워크를 다시 살리기 위한 활동을 시작했다' },
  { key: 'f_nw05', group: '네트워크', text: '경력단절자 커뮤니티나 지원 모임에 참여하고 있다' },
  { key: 'f_sp02', group: '자기 표현', text: '이력서에 공백 기간을 어떻게 쓸지 준비했다' },
  { key: 'f_sp03', group: '자기 표현', text: '면접에서 단절 사유를 긍정적으로 설명할 수 있다' },
  { key: 'f_sp05', group: '자기 표현', text: '포트폴리오·성과 자료를 준비하고 있다' },
  { key: 'f_fl01', group: '현장 감각', text: '현재 업계 용어와 트렌드를 파악하고 있다' },
  { key: 'f_fl04', group: '현장 감각', text: '요즘 채용 프로세스(온라인 지원·AI 면접 등)를 이해하고 있다' },
];

export const JOURNEY_CHECKLISTS: Record<ChecklistStage, ChecklistItem[]> = { c: C, d: D, e: E, f: F, gap: GAP };

export function isChecklistStage(s: string): s is ChecklistStage {
  return s === 'c' || s === 'd' || s === 'e' || s === 'f' || s === 'gap';
}

/** 서버용 — 완료율 (0~100). 항목이 없으면 0 */
export async function getStageChecklistProgress(
  sb: SupabaseClient,
  memberId: string,
  stage: ChecklistStage,
): Promise<{ total: number; done: number; percent: number }> {
  const items = JOURNEY_CHECKLISTS[stage];
  const { data } = await sb
    .from('hero_journey_checklist_items')
    .select('item_key')
    .eq('member_id', memberId)
    .eq('stage', stage)
    .not('checked_at', 'is', null);
  const keys = new Set((data ?? []).map((r: { item_key: string }) => r.item_key));
  const done = items.filter(i => keys.has(i.key)).length;
  return { total: items.length, done, percent: items.length ? Math.round((done / items.length) * 100) : 0 };
}
