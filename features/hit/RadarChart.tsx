'use client';

interface RadarDataPoint {
  label: string;
  value: number; // 0-100
}

interface RadarChartProps {
  data: RadarDataPoint[];
  size?: number;
}

export default function RadarChart({ data, size = 300 }: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.35;
  const labelOffset = size * 0.46;
  const n = data.length;
  const levels = 5;

  // Get vertex coordinates at given radius
  function getPoint(index: number, r: number): [number, number] {
    // Start from top (-90 deg)
    const angle = (2 * Math.PI * index) / n - Math.PI / 2;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  }

  // Grid polygons
  const gridPolygons = Array.from({ length: levels }, (_, level) => {
    const r = (radius * (level + 1)) / levels;
    const points = Array.from({ length: n }, (_, i) => getPoint(i, r).join(',')).join(' ');
    return points;
  });

  // Axis lines
  const axisLines = Array.from({ length: n }, (_, i) => ({
    from: [cx, cy] as [number, number],
    to: getPoint(i, radius),
  }));

  // Data polygon
  const dataPoints = data.map((d, i) => {
    const r = (d.value / 100) * radius;
    return getPoint(i, r);
  });
  const dataPolygon = dataPoints.map((p) => p.join(',')).join(' ');

  // Label positions
  const labelPositions = data.map((_, i) => getPoint(i, labelOffset));

  // Value label positions (slightly inside the data point)
  const valuePositions = data.map((d, i) => {
    const r = (d.value / 100) * radius + 14;
    return getPoint(i, r);
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto"
    >
      {/* Grid */}
      {gridPolygons.map((points, i) => (
        <polygon
          key={`grid-${i}`}
          points={points}
          fill="none"
          stroke="#e5e5e5"
          strokeWidth="1"
        />
      ))}

      {/* Axis lines */}
      {axisLines.map((line, i) => (
        <line
          key={`axis-${i}`}
          x1={line.from[0]}
          y1={line.from[1]}
          x2={line.to[0]}
          y2={line.to[1]}
          stroke="#e5e5e5"
          strokeWidth="1"
        />
      ))}

      {/* Data area */}
      <polygon
        points={dataPolygon}
        fill="#E53935"
        fillOpacity="0.2"
        stroke="#E53935"
        strokeWidth="2"
      />

      {/* Data dots */}
      {dataPoints.map((point, i) => (
        <circle
          key={`dot-${i}`}
          cx={point[0]}
          cy={point[1]}
          r="4"
          fill="#E53935"
        />
      ))}

      {/* Labels */}
      {labelPositions.map((pos, i) => (
        <text
          key={`label-${i}`}
          x={pos[0]}
          y={pos[1]}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-neutral-700 text-xs font-medium"
          fontSize="12"
        >
          {data[i].label}
        </text>
      ))}

      {/* Value labels */}
      {valuePositions.map((pos, i) => (
        <text
          key={`value-${i}`}
          x={pos[0]}
          y={pos[1]}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-[#E53935] text-[10px] font-semibold"
          fontSize="10"
        >
          {data[i].value}
        </text>
      ))}
    </svg>
  );
}
