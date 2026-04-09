'use client';

import { Save } from 'lucide-react';
import {
  SERVICE_CATALOG, SERVICE_PRESETS, getModulesByService,
  loadOrbiConfig, saveOrbiConfigDB,
} from '@/lib/wio-modules';

interface ServiceTabProps {
  selectedPreset: string;
  setSelectedPreset: (id: string) => void;
  enabledServices: string[];
  setEnabledServices: React.Dispatch<React.SetStateAction<string[]>>;
  reloadSidebar: (() => void) | undefined;
  showToast: (msg: string) => void;
}

export default function ServiceTab({
  selectedPreset,
  setSelectedPreset,
  enabledServices,
  setEnabledServices,
  reloadSidebar,
  showToast,
}: ServiceTabProps) {
  return (
    <div className="space-y-6">
      {/* 프리셋 선택 */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3">업종 프리셋</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {SERVICE_PRESETS.map(preset => (
            <button key={preset.id} onClick={() => {
              setSelectedPreset(preset.id);
              if (preset.id !== 'custom') {
                setEnabledServices(preset.services);
              }
            }}
              className={`rounded-xl border p-4 text-left transition-all ${
                selectedPreset === preset.id
                  ? 'border-indigo-500/40 bg-indigo-500/10 ring-1 ring-indigo-500/20'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/20'
              }`}>
              <p className={`text-sm font-semibold ${selectedPreset === preset.id ? 'text-white' : 'text-slate-400'}`}>{preset.label}</p>
              <p className="text-[11px] text-slate-500 mt-1">{preset.description}</p>
              {preset.id !== 'custom' && (
                <p className="text-[10px] text-slate-600 mt-2">{preset.services.length}개 서비스</p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 서비스 토글 그리드 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-300">서비스 ({enabledServices.length}/{SERVICE_CATALOG.length})</h3>
          <button onClick={() => {
            const moduleKeys = enabledServices.flatMap(sId => getModulesByService(sId).map(m => m.key));
            const config = loadOrbiConfig();
            config.enabledServices = enabledServices;
            config.enabledModules = moduleKeys;
            saveOrbiConfigDB(config);
            reloadSidebar?.();
            showToast('서비스 설정이 저장되었습니다');
          }}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-500 transition">
            <Save size={13} /> 저장
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {SERVICE_CATALOG.map(svc => {
            const isEnabled = enabledServices.includes(svc.id);
            const SvcIcon = svc.icon;
            const moduleCount = getModulesByService(svc.id).length;
            return (
              <div key={svc.id}
                onClick={() => {
                  setSelectedPreset('custom');
                  setEnabledServices(prev =>
                    isEnabled ? prev.filter(s => s !== svc.id) : [...prev, svc.id]
                  );
                }}
                className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
                  isEnabled
                    ? 'border-indigo-500/30 bg-indigo-500/5'
                    : 'border-white/5 bg-white/[0.02] opacity-50 hover:opacity-70'
                }`}>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${
                  isEnabled ? 'bg-indigo-600/20 text-indigo-400' : 'bg-white/5 text-slate-500'
                }`}>
                  <SvcIcon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${isEnabled ? 'text-white' : 'text-slate-400'}`}>{svc.label}</p>
                  <p className="text-[11px] text-slate-500 truncate">{svc.description}</p>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <div className={`w-9 h-5 rounded-full transition-colors ${isEnabled ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                    <div className={`w-4 h-4 mt-0.5 rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-[9px] text-slate-600 mt-1">{moduleCount}개 모듈</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
