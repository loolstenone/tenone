/**
 * WIO People — Matching Engine
 *
 * 크로스 브랜드 사람 매칭 엔진. Badak이 첫 소비자이며, HeRo·MADLeague 등
 * 다른 브랜드도 임포트해서 사용한다.
 *
 * 핵심 컨셉: 니즈(Need)와 니즈(Need)가 만나 원츠(Want)가 된다.
 *   - Need = 한 사람의 부족·욕구·지향 (unidirectional)
 *   - Want = 두 사람 이상의 니즈가 만나 생긴 공동 지향 (bidirectional)
 *
 * 지원 모드:
 *   - needs_match: 같은 니즈를 가진 사람
 *   - mutual:      내가 원하는 것 ↔ 상대가 줄 수 있는 것
 *   - network:     같은 산업/직무/유니버스 활동
 */

export type MatchMode = 'needs_match' | 'mutual' | 'network';

export interface PersonSignals {
  userId: string;
  industry?: string | null;
  jobFunction?: string | null;
  experienceYears?: number | null;
  lookingFor?: string[];
  canOffer?: string[];
  interestTags?: string[];
  affiliations?: string[];
  /** 이 사람이 공감/관심 표현한 니즈 ID 목록 */
  needIds?: string[];
  /** 이 사람이 제출한(생성한) 니즈 ID 목록 */
  authoredNeedIds?: string[];
  /** 이 사람이 참여한 모임 ID 목록 */
  groupIds?: string[];
  /** 모드별 수용 여부 */
  openToNeeds?: boolean;
  openToPartner?: boolean;
  openToNetwork?: boolean;
  profilePublic?: boolean;
}

export interface MatchReason {
  label: string;
  weight: number;
}

export interface MatchScore {
  peerId: string;
  mode: MatchMode;
  score: number;
  reasons: MatchReason[];
}

// 모드별 가중치 매트릭스 (기획서 §4.3)
const WEIGHTS: Record<MatchMode, {
  sameNeedInterest: number;
  sameNeedAuthored: number;
  needOffer: number;
  sameIndustry: number;
  sameJobFunction: number;
  sharedAffiliation: number;
  sharedGroup: number;
}> = {
  needs_match: {
    sameNeedInterest: 3,
    sameNeedAuthored: 3,
    needOffer: 1,
    sameIndustry: 1,
    sameJobFunction: 1,
    sharedAffiliation: 1,
    sharedGroup: 2,
  },
  mutual: {
    sameNeedInterest: 1,
    sameNeedAuthored: 1,
    needOffer: 3,
    sameIndustry: 1,
    sameJobFunction: 1,
    sharedAffiliation: 2,
    sharedGroup: 2,
  },
  network: {
    sameNeedInterest: 1,
    sameNeedAuthored: 0,
    needOffer: 1,
    sameIndustry: 3,
    sameJobFunction: 2,
    sharedAffiliation: 2,
    sharedGroup: 2,
  },
};

// 상대방이 해당 모드 매칭을 수락하는지 체크
function peerAcceptsMode(peer: PersonSignals, mode: MatchMode): boolean {
  if (peer.profilePublic === false) return false;
  if (mode === 'needs_match') return peer.openToNeeds !== false;
  if (mode === 'mutual') return peer.openToPartner === true;
  if (mode === 'network') return peer.openToNetwork !== false;
  return false;
}

function intersectCount(a: string[] | undefined, b: string[] | undefined): number {
  if (!a || !b) return 0;
  const setB = new Set(b);
  let count = 0;
  for (const x of a) if (setB.has(x)) count++;
  return count;
}

function fuzzyMatch(need: string, offer: string): boolean {
  const n = need.toLowerCase().trim();
  const o = offer.toLowerCase().trim();
  if (!n || !o) return false;
  return n === o || n.includes(o) || o.includes(n);
}

function needOfferOverlap(lookingFor: string[] | undefined, canOffer: string[] | undefined): number {
  if (!lookingFor || !canOffer) return 0;
  let count = 0;
  for (const need of lookingFor) {
    for (const offer of canOffer) {
      if (fuzzyMatch(need, offer)) { count++; break; }
    }
  }
  return count;
}

/**
 * 한 사람(self) 대비 후보(peer)의 매칭 점수를 계산한다.
 */
export function computeMatchScore(
  self: PersonSignals,
  peer: PersonSignals,
  mode: MatchMode,
): MatchScore | null {
  if (self.userId === peer.userId) return null;
  if (!peerAcceptsMode(peer, mode)) return null;

  const W = WEIGHTS[mode];
  const reasons: MatchReason[] = [];
  let score = 0;

  // 같은 니즈에 관심 표현
  const sameNeedInterest = intersectCount(self.needIds, peer.needIds);
  if (sameNeedInterest > 0 && W.sameNeedInterest > 0) {
    const w = sameNeedInterest * W.sameNeedInterest;
    score += w;
    reasons.push({ label: `같은 니즈 ${sameNeedInterest}개에 관심`, weight: w });
  }

  // 같은 니즈 작성
  const sameNeedAuthored = intersectCount(self.authoredNeedIds, peer.authoredNeedIds);
  if (sameNeedAuthored > 0 && W.sameNeedAuthored > 0) {
    const w = sameNeedAuthored * W.sameNeedAuthored;
    score += w;
    reasons.push({ label: `같은 니즈 ${sameNeedAuthored}개 직접 제출`, weight: w });
  }

  // 내 need ↔ 상대 offer + 상대 need ↔ 내 offer (상호)
  const myNeedTheirOffer = needOfferOverlap(self.lookingFor, peer.canOffer);
  const theirNeedMyOffer = needOfferOverlap(peer.lookingFor, self.canOffer);
  const mutualTotal = myNeedTheirOffer + theirNeedMyOffer;
  if (mutualTotal > 0 && W.needOffer > 0) {
    const w = mutualTotal * W.needOffer;
    score += w;
    const hasBothSides = myNeedTheirOffer > 0 && theirNeedMyOffer > 0;
    reasons.push({
      label: hasBothSides ? '서로에게 도움되는 관계' : `도움 주고받을 수 있음 (${mutualTotal})`,
      weight: w,
    });
  }

  // 같은 산업
  if (self.industry && peer.industry && self.industry === peer.industry && W.sameIndustry > 0) {
    score += W.sameIndustry;
    reasons.push({ label: `같은 업계 (${self.industry})`, weight: W.sameIndustry });
  }

  // 같은 직무
  if (self.jobFunction && peer.jobFunction && self.jobFunction === peer.jobFunction && W.sameJobFunction > 0) {
    score += W.sameJobFunction;
    reasons.push({ label: `같은 직무 (${self.jobFunction})`, weight: W.sameJobFunction });
  }

  // 공통 유니버스 활동 (badak 제외 — 당연한 것)
  const affiliationOverlap = (self.affiliations ?? [])
    .filter((a) => a !== 'badak')
    .filter((a) => peer.affiliations?.includes(a));
  if (affiliationOverlap.length > 0 && W.sharedAffiliation > 0) {
    const w = affiliationOverlap.length * W.sharedAffiliation;
    score += w;
    reasons.push({ label: `유니버스 ${affiliationOverlap.length}곳 공통 활동`, weight: w });
  }

  // 같은 모임 참여 이력
  const sharedGroup = intersectCount(self.groupIds, peer.groupIds);
  if (sharedGroup > 0 && W.sharedGroup > 0) {
    const w = sharedGroup * W.sharedGroup;
    score += w;
    reasons.push({ label: `같은 모임 ${sharedGroup}개 참여`, weight: w });
  }

  if (score === 0) return null;

  return {
    peerId: peer.userId,
    mode,
    score,
    reasons: reasons.sort((a, b) => b.weight - a.weight),
  };
}

/**
 * 여러 후보 중 Top N 매칭을 반환한다. 임계값 미만은 제외.
 */
export function topMatches(
  self: PersonSignals,
  peers: PersonSignals[],
  mode: MatchMode,
  options: { limit?: number; minScore?: number } = {},
): MatchScore[] {
  const { limit = 20, minScore = 1 } = options;
  const scores: MatchScore[] = [];
  for (const peer of peers) {
    const s = computeMatchScore(self, peer, mode);
    if (s && s.score >= minScore) scores.push(s);
  }
  return scores.sort((a, b) => b.score - a.score).slice(0, limit);
}

// ─────────────────────────────────────────────────────────────
// Wants 생성 (니즈×니즈 → 공동 지향)
// ─────────────────────────────────────────────────────────────

export interface WantCandidate {
  /** 이 Want에 기여한 니즈 ID 배열 */
  needIds: string[];
  /** 이 Want을 구성할 멤버 user ID 배열 (자신 포함 2명 이상) */
  memberIds: string[];
  mode: MatchMode;
  score: number;
  reasons: MatchReason[];
  /** 시스템이 제안하는 공동 목표 (AI 교체 예정) */
  suggestedTitle: string;
}

/**
 * 매칭 결과 + 공유 니즈로부터 Wants 후보를 생성한다.
 * 실시간 계산 (배치 안 씀). 사용자가 탐색을 요청할 때마다 즉시 산출.
 */
export function generateWants(
  self: PersonSignals,
  matches: MatchScore[],
  allPeers: PersonSignals[],
  options: {
    /** ID → 표시 텍스트 매핑 (니즈 텍스트 렌더링용) */
    needTextById?: Record<string, string>;
    /** 최대 Want 수 */
    limit?: number;
  } = {},
): WantCandidate[] {
  const { needTextById = {}, limit = 10 } = options;
  const peerMap = new Map(allPeers.map((p) => [p.userId, p]));
  const wants: WantCandidate[] = [];

  for (const m of matches) {
    const peer = peerMap.get(m.peerId);
    if (!peer) continue;

    const sharedNeeds = (self.needIds ?? []).filter((id) => peer.needIds?.includes(id));

    // needs_match 모드: 공유 니즈가 있으면 그것을 기반으로 Want 생성
    if (m.mode === 'needs_match' && sharedNeeds.length > 0) {
      const needTexts = sharedNeeds
        .map((id) => needTextById[id])
        .filter(Boolean)
        .slice(0, 2);
      const title = needTexts.length > 0
        ? `"${needTexts.join('·')}" 같이 풀어볼래요?`
        : '같은 니즈 — 함께 해결해요';
      wants.push({
        needIds: sharedNeeds,
        memberIds: [self.userId, m.peerId],
        mode: m.mode,
        score: m.score,
        reasons: m.reasons,
        suggestedTitle: title,
      });
      continue;
    }

    // mutual 모드: 상호 보완
    if (m.mode === 'mutual') {
      wants.push({
        needIds: sharedNeeds,
        memberIds: [self.userId, m.peerId],
        mode: m.mode,
        score: m.score,
        reasons: m.reasons,
        suggestedTitle: '서로 도움 주고받기 — 1:1 파트너',
      });
      continue;
    }

    // network 모드
    if (m.mode === 'network') {
      const label = self.jobFunction && self.jobFunction === peer.jobFunction
        ? `같은 ${self.jobFunction} 피어 네트워킹`
        : '업계 네트워킹';
      wants.push({
        needIds: sharedNeeds,
        memberIds: [self.userId, m.peerId],
        mode: m.mode,
        score: m.score,
        reasons: m.reasons,
        suggestedTitle: label,
      });
    }
  }

  return wants.sort((a, b) => b.score - a.score).slice(0, limit);
}
