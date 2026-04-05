/** HIT A — UF(Underlying Factors) 기저요인 검사 50문항
 *  7점 리커트 (1=전혀 아니다 ~ 7=매우 그렇다)
 *  9영역: sibling, parent, family, peer, self, temperament, economic, trauma, cultural
 */
import type { LikertQuestion } from "@/types/hit";

export const ufQuestions: LikertQuestion[] = [
  // ── 영역 1: 형제관계·협력 (sibling) — 5문항 ──
  { id: "uf_001", text: "나는 형제자매와 협력적이고 우호적인 관계를 유지했다.", subscale: "sibling" },
  { id: "uf_002", text: "형제자매와 경쟁심보다는 서로 격려하는 마음이 더 컸다.", subscale: "sibling" },
  { id: "uf_003", text: "집에서 나는 '중재자'나 '조정자' 역할을 자주 맡았다.", subscale: "sibling" },
  { id: "uf_004", text: "내 의견은 형제자매 사이에서 중요하게 받아들여졌다.", subscale: "sibling" },
  { id: "uf_005", text: "형제자매와의 갈등이 오래 지속되는 편이었다.", subscale: "sibling", reverse: true },

  // ── 영역 2: 부모관계·정서 (parent) — 5문항 ──
  { id: "uf_006", text: "부모님은 내 감정 표현을 긍정적으로 받아들여 주셨다.", subscale: "parent" },
  { id: "uf_007", text: "부모님은 실수보다 노력 자체를 칭찬해 주셨다.", subscale: "parent" },
  { id: "uf_008", text: "부모님은 갈등이 생겼을 때 대화를 통해 해결하려 하셨다.", subscale: "parent" },
  { id: "uf_009", text: "부모님은 나에게 일관된 규칙과 기준을 제시하셨다.", subscale: "parent" },
  { id: "uf_010", text: "부모님의 기대가 부담스럽다고 느꼈다.", subscale: "parent", reverse: true },

  // ── 영역 3: 가정 정서·자원 (family) — 10문항 ──
  { id: "uf_011", text: "우리 가족은 함께 보내는 시간이 충분했다고 느낀다.", subscale: "family" },
  { id: "uf_012", text: "가족 구성원끼리 애정을 신체적·언어적으로 자주 표현했다.", subscale: "family" },
  { id: "uf_013", text: "가족 행사나 여행은 즐거운 추억으로 기억된다.", subscale: "family" },
  { id: "uf_014", text: "집은 나에게 정서적으로 안전한 공간이었다.", subscale: "family" },
  { id: "uf_015", text: "가족과의 소통이 단절돼 있다고 느낀 적이 많다.", subscale: "family", reverse: true },
  { id: "uf_016", text: "어려운 일을 겪을 때 가족이 나를 적극적으로 도와주었다.", subscale: "family" },
  { id: "uf_017", text: "어린 시절 스스로 결정권을 행사할 기회가 많았다.", subscale: "family" },
  { id: "uf_018", text: "집안일이나 책임을 맡으면서 성취감을 느꼈다.", subscale: "family" },
  { id: "uf_019", text: "부모님은 실패를 학습 기회로 여기도록 도와주셨다.", subscale: "family" },
  { id: "uf_020", text: "나는 가정교육 방식이 내 성장에 부정적 영향을 주었다고 생각한다.", subscale: "family", reverse: true },

  // ── 영역 4: 또래·학교 (peer) — 10문항 ──
  { id: "uf_021", text: "학교에서 나는 친구들 사이에서 인정받는 편이었다.", subscale: "peer" },
  { id: "uf_022", text: "또래 집단 안에서 나는 주로 리더 역할을 맡았다.", subscale: "peer" },
  { id: "uf_023", text: "학창 시절 나를 진심으로 이해해주는 친구가 있었다.", subscale: "peer" },
  { id: "uf_024", text: "학교 선생님 중 나에게 긍정적 영향을 준 분이 있었다.", subscale: "peer" },
  { id: "uf_025", text: "또래에게 따돌림이나 배제를 경험한 적이 있다.", subscale: "peer", reverse: true },
  { id: "uf_026", text: "학교생활에서 성취감을 자주 느꼈다.", subscale: "peer" },
  { id: "uf_027", text: "또래 친구들과 갈등이 생기면 대화로 해결하는 편이었다.", subscale: "peer" },
  { id: "uf_028", text: "다양한 배경의 친구들과 잘 어울렸다.", subscale: "peer" },
  { id: "uf_029", text: "학교에서의 경험이 현재 나의 자신감에 긍정적 영향을 주었다.", subscale: "peer" },
  { id: "uf_030", text: "학교는 나에게 불안하거나 불편한 공간이었다.", subscale: "peer", reverse: true },

  // ── 영역 5: 자기개념·사회역량 (self) — 5문항 ──
  { id: "uf_031", text: "나는 나 자신의 강점과 약점을 비교적 잘 파악하고 있다.", subscale: "self" },
  { id: "uf_032", text: "다른 사람의 입장에서 생각해보는 편이다.", subscale: "self" },
  { id: "uf_033", text: "어려운 상황에서도 스스로 해결 방법을 찾으려 노력한다.", subscale: "self" },
  { id: "uf_034", text: "실패 후에도 비교적 빠르게 회복하는 편이다.", subscale: "self" },
  { id: "uf_035", text: "새로운 환경에 적응하는 것이 어렵다고 느낀다.", subscale: "self", reverse: true },

  // ── 영역 6: 기질적 본능 (temperament) — 3문항 ──
  { id: "uf_041", text: "어릴 때부터 가만히 앉아 있기보다 몸을 움직이는 활동을 선호했다.", subscale: "temperament" },
  { id: "uf_042", text: "작은 자극에도 강하게 반응하는 편이다 (소음, 온도, 감정 등).", subscale: "temperament" },
  { id: "uf_043", text: "새로운 환경이나 낯선 상황에 빠르게 적응하는 편이다.", subscale: "temperament" },

  // ── 영역 7: 경제적 환경 (economic) — 2문항 ──
  { id: "uf_044", text: "성장기에 원하는 교육이나 활동을 경제적 이유로 포기한 경험이 있다.", subscale: "economic", reverse: true },
  { id: "uf_045", text: "우리 집의 경제적 상황은 내가 도전하고 시도하는 데 충분한 여유를 주었다.", subscale: "economic" },

  // ── 영역 8: 트라우마·전환점 (trauma) — 2문항 ──
  { id: "uf_046", text: "큰 실패나 상실을 겪은 후 오히려 더 단단해졌다고 느낀다.", subscale: "trauma" },
  { id: "uf_047", text: "내 인생의 방향을 근본적으로 바꾼 사건이 있다.", subscale: "trauma" },

  // ── 영역 9: 문화·세대·교육 맥락 (cultural) — 3문항 ──
  { id: "uf_048", text: "성장 과정에서 종교나 신앙이 가치관 형성에 중요한 역할을 했다.", subscale: "cultural" },
  { id: "uf_049", text: "부모 세대와 나의 세대는 일과 성공에 대한 관점이 크게 다르다고 느낀다.", subscale: "cultural" },
  { id: "uf_050", text: "학교 밖에서의 경험(여행, 동아리, 아르바이트, 봉사 등)이 학교 교육보다 나를 더 성장시켰다.", subscale: "cultural" },
];

/** @deprecated 하위 호환용 — 새 코드에서는 ufQuestions 사용 */
export const baseQuestions = ufQuestions;
