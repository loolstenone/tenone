/**
 * 경쟁 PT 수상 배지 — 옛 배지 이미지(public/logos/madleague/*gold.png 등)와 같은 모양을 SVG로 그린다
 * 인트라에서 결과를 발표한 새 회차(program_results)에 자동으로 붙는다. 옛 회차는 원본 이미지를 쓴다.
 * 1위 금 · 2위 은 · 3위 동 · 그 외(본선·특별상) 은
 */
const TONES: Record<'gold' | 'silver' | 'bronze', [string, string]> = {
  gold: ['#F6D365', '#C99A1E'],
  silver: ['#DADADA', '#8E8E8E'],
  bronze: ['#F2A66B', '#C4621C'],
};

function tone(rank: number | null): [string, string] {
  if (rank === 1) return TONES.gold;
  if (rank === 3) return TONES.bronze;
  return TONES.silver;
}

/** 별 꼭짓점 — 바깥 5개·안쪽 5개 번갈아 (위쪽부터 시계방향) */
function starPoints(cx: number, cy: number, R: number, r: number) {
  return Array.from({ length: 10 }, (_, i) => {
    const rad = (i * Math.PI) / 5 - Math.PI / 2;
    const len = i % 2 === 0 ? R : r;
    return [cx + len * Math.cos(rad), cy + len * Math.sin(rad)] as const;
  });
}

interface Props {
  year: number | string;
  rank: number | null;
  logoUrl?: string | null;
  clubName: string;
  className?: string;
}

export function CompetitionBadge({ year, rank, logoUrl, clubName, className }: Props) {
  const [light, dark] = tone(rank);
  const cx = 166, cy = 372;
  const pts = starPoints(cx, cy, 128, 52);
  // 꼭짓점마다 왼쪽 면 밝게 · 오른쪽 면 어둡게 (입체감)
  const facets = pts.flatMap((p, i) => {
    if (i % 2 !== 0) return [];
    const prev = pts[(i + 9) % 10];
    const next = pts[(i + 1) % 10];
    return [
      { d: `M${cx},${cy} L${prev[0]},${prev[1]} L${p[0]},${p[1]} Z`, fill: light },
      { d: `M${cx},${cy} L${p[0]},${p[1]} L${next[0]},${next[1]} Z`, fill: dark },
    ];
  });

  return (
    <svg viewBox="0 0 332 500" className={className} role="img" aria-label={`${year} 경쟁 PT ${rank ? `${rank}위` : '수상'} — ${clubName}`}>
      {/* 깃발 */}
      <path d="M8,48 H324 V262 L166,330 L8,262 Z" fill="#fff" stroke="#000" strokeWidth="8" strokeLinejoin="round" />
      <rect x="4" y="4" width="324" height="48" rx="4" fill="#000" />
      <text x="166" y="38" textAnchor="middle" fill="#fff" fontSize="25" fontWeight="700" fontFamily="Arial, sans-serif">Proposal Competition</text>
      <text x="166" y="118" textAnchor="middle" fill="#000" fontSize="34" fontWeight="900" fontFamily="Arial, sans-serif">{year}</text>
      {logoUrl
        ? <image href={logoUrl} x="76" y="138" width="180" height="88" preserveAspectRatio="xMidYMid meet" />
        : <text x="166" y="196" textAnchor="middle" fill="#000" fontSize="34" fontWeight="900" fontFamily="Arial, sans-serif">{clubName}</text>}
      {/* 별 */}
      {facets.map((f, i) => <path key={i} d={f.d} fill={f.fill} />)}
      {/* MAD League 원형 */}
      <circle cx={cx} cy={cy} r="30" fill="#EC1D25" />
      <text x={cx} y={cy - 2} textAnchor="middle" fill="#fff" fontSize="17" fontWeight="900" fontFamily="Arial, sans-serif">MAD</text>
      <text x={cx} y={cy + 15} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700" fontFamily="Arial, sans-serif">LEAGUE</text>
    </svg>
  );
}
