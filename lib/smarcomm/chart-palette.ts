// 차트 컬러 팔레트 시스템

export interface ChartPalette {
  id: string;
  name: string;
  colors: string[];
  preview: string[]; // 미리보기용 5색
}

export const CHART_PALETTES: ChartPalette[] = [
  {
    id: 'mono',
    name: '모노 계열',
    colors: ['#111827', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB', '#E5E7EB', '#F3F4F6'],
    preview: ['#111827', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB'],
  },
  {
    id: 'red',
    name: '레드 계열',
    colors: ['#991B1B', '#DC2626', '#EF4444', '#F87171', '#FCA5A5', '#FECACA', '#FEE2E2'],
    preview: ['#991B1B', '#DC2626', '#EF4444', '#F87171', '#FCA5A5'],
  },
  {
    id: 'blue',
    name: '블루 계열',
    colors: ['#1E3A8A', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'],
    preview: ['#1E3A8A', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD'],
  },
  {
    id: 'yellow',
    name: '옐로우 계열',
    colors: ['#92400E', '#D97706', '#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A', '#FEF3C7'],
    preview: ['#92400E', '#D97706', '#F59E0B', '#FBBF24', '#FCD34D'],
  },
  {
    id: 'green',
    name: '그린 계열',
    colors: ['#065F46', '#059669', '#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5'],
    preview: ['#065F46', '#059669', '#10B981', '#34D399', '#6EE7B7'],
  },
  {
    id: 'rainbow',
    name: '5색 계열',
    colors: ['#DC2626', '#F97316', '#FBBF24', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'],
    preview: ['#DC2626', '#F97316', '#FBBF24', '#10B981', '#3B82F6'],
  },
];

export function getChartPalette(): ChartPalette {
  if (typeof window === 'undefined') return CHART_PALETTES[0];
  const saved = localStorage.getItem('smarcomm_chart_palette');
  if (saved) {
    const found = CHART_PALETTES.find(p => p.id === saved);
    if (found) return found;
  }
  return CHART_PALETTES[0]; // 기본: 모노
}

export function setChartPalette(id: string) {
  localStorage.setItem('smarcomm_chart_palette', id);
}

export function getChartColors(count: number = 7): string[] {
  return getChartPalette().colors.slice(0, count);
}

export function getChartColor(index: number): string {
  const palette = getChartPalette();
  return palette.colors[index % palette.colors.length];
}
