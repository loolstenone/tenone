'use client';

import { Save, Upload, Type, Check } from 'lucide-react';

interface ThemeTabProps {
  editColor: string;
  setEditColor: (color: string) => void;
  isDemo: boolean;
  saving: boolean;
  saveTheme: () => void;
}

export default function ThemeTab({ editColor, setEditColor, isDemo, saving, saveTheme }: ThemeTabProps) {
  const colorPresets = [
    { name: 'Indigo',  color: '#6366F1', bg: '#1e1b4b', accent: '#818CF8', desc: '기본' },
    { name: 'Emerald', color: '#10B981', bg: '#022c22', accent: '#34D399', desc: '성장' },
    { name: 'Amber',   color: '#F59E0B', bg: '#1c1917', accent: '#FBBF24', desc: '에너지' },
    { name: 'Rose',    color: '#F43F5E', bg: '#1a0a0e', accent: '#FB7185', desc: '열정' },
    { name: 'Slate',   color: '#64748B', bg: '#0f172a', accent: '#94A3B8', desc: '모던' },
  ];

  return (
    <div className="max-w-2xl space-y-5">
      {/* Color picker */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
        <h2 className="text-sm font-semibold mb-1">앱 컬러 패턴</h2>
        <p className="text-xs text-slate-500 mb-4">브랜드에 맞는 컬러를 선택하세요.</p>
        <div className="grid grid-cols-5 gap-3">
          {colorPresets.map(p => (
            <button key={p.name} onClick={() => setEditColor(p.color)}
              className={`relative rounded-xl border p-4 text-center transition-all ${editColor === p.color ? 'border-white/30 ring-1 ring-white/20' : 'border-white/5 hover:border-white/15'}`}>
              <div className="rounded-lg overflow-hidden mb-3 border border-white/5" style={{ backgroundColor: p.bg }}>
                <div className="h-2" style={{ backgroundColor: p.color }} />
                <div className="p-2 space-y-1">
                  <div className="h-1.5 rounded-full w-3/4" style={{ backgroundColor: p.accent, opacity: 0.3 }} />
                  <div className="h-1.5 rounded-full w-1/2" style={{ backgroundColor: p.accent, opacity: 0.15 }} />
                  <div className="flex gap-1 mt-1.5">
                    <div className="h-4 w-4 rounded" style={{ backgroundColor: p.color }} />
                    <div className="h-4 flex-1 rounded" style={{ backgroundColor: `${p.accent}15` }} />
                  </div>
                </div>
              </div>
              <div className="text-xs font-semibold" style={{ color: p.color }}>{p.name}</div>
              <div className="text-[10px] text-slate-500">{p.desc}</div>
              {editColor === p.color && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: p.color }}>
                  <Check size={10} className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5">
          <span className="text-xs text-slate-500">커스텀:</span>
          <input type="color" value={editColor} onChange={e => setEditColor(e.target.value)}
            className="h-7 w-7 rounded cursor-pointer bg-transparent border-0" />
          <input value={editColor} onChange={e => setEditColor(e.target.value)}
            className="w-20 px-2 py-1 bg-white/5 border border-white/10 rounded text-xs font-mono text-slate-400 focus:outline-none" />
        </div>
      </div>

      {/* Logo upload area */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
        <h2 className="text-sm font-semibold mb-1">브랜딩</h2>
        <p className="text-xs text-slate-500 mb-4">로고, 파비콘, 폰트를 설정하세요.</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-dashed border-white/10 p-6 text-center hover:border-white/20 transition cursor-pointer">
            <Upload size={24} className="mx-auto mb-2 text-slate-600" />
            <p className="text-xs text-slate-400">로고 업로드</p>
            <p className="text-[10px] text-slate-600 mt-1">PNG, SVG 권장 (최대 2MB)</p>
          </div>
          <div className="rounded-lg border border-dashed border-white/10 p-6 text-center hover:border-white/20 transition cursor-pointer">
            <Upload size={24} className="mx-auto mb-2 text-slate-600" />
            <p className="text-xs text-slate-400">파비콘 업로드</p>
            <p className="text-[10px] text-slate-600 mt-1">32x32 ICO/PNG</p>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-xs text-slate-500 mb-2">
            <Type size={12} className="inline mr-1" /> 폰트 선택
          </label>
          <select className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none">
            <option className="bg-[#0F0F23]">Pretendard (기본)</option>
            <option className="bg-[#0F0F23]">Noto Sans KR</option>
            <option className="bg-[#0F0F23]">Spoqa Han Sans Neo</option>
            <option className="bg-[#0F0F23]">Inter</option>
          </select>
        </div>
      </div>

      {!isDemo && (
        <button onClick={saveTheme} disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 text-white text-sm rounded-lg hover:opacity-90 transition disabled:opacity-50"
          style={{ backgroundColor: editColor }}>
          <Save size={14} /> {saving ? '저장 중...' : '테마 저장'}
        </button>
      )}
    </div>
  );
}
