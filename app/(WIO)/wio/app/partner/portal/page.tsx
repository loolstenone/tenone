'use client';

import { useState } from 'react';
import { Globe, FileText, FolderOpen, Activity, Eye } from 'lucide-react';
import { useWIO } from '../../layout';

type SharedItem = {
  id: string;
  partner: string;
  type: 'document' | 'project' | 'report' | 'dashboard';
  title: string;
  sharedDate: string;
  lastViewed: string;
  accessLevel: 'view' | 'edit';
  status: 'active' | 'expired';
};

const TYPE_MAP: Record<string, { icon: any; color: string }> = {
  document: { icon: FileText, color: 'text-blue-400 bg-blue-500/10' },
  project: { icon: FolderOpen, color: 'text-purple-400 bg-purple-500/10' },
  report: { icon: Activity, color: 'text-emerald-400 bg-emerald-500/10' },
  dashboard: { icon: Eye, color: 'text-amber-400 bg-amber-500/10' },
};

const TYPE_LABELS: Record<string, string> = {
  document: '문서',
  project: '프로젝트',
  report: '리포트',
  dashboard: '대시보드',
};

const MOCK_SHARED: SharedItem[] = [
  { id: 'SH-001', partner: '글로벌테크', type: 'project', title: 'AI 컨설팅 프로젝트 현황', sharedDate: '2026-03-01', lastViewed: '2026-03-28', accessLevel: 'view', status: 'active' },
  { id: 'SH-002', partner: '(주)스마트미디어', type: 'report', title: '3월 마케팅 캠페인 성과 리포트', sharedDate: '2026-03-15', lastViewed: '2026-03-27', accessLevel: 'view', status: 'active' },
  { id: 'SH-003', partner: '클라우드코리아', type: 'document', title: 'SLA 계약서 초안', sharedDate: '2026-03-10', lastViewed: '2026-03-25', accessLevel: 'edit', status: 'active' },
  { id: 'SH-004', partner: '디자인웍스', type: 'dashboard', title: '브랜드 디자인 진행 현황판', sharedDate: '2026-02-20', lastViewed: '2026-03-20', accessLevel: 'view', status: 'active' },
];

export default function PartnerPortalPage() {
  const { tenant } = useWIO();
  const isDemo = tenant?.id === 'demo';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">파트너포털</h1>
          <p className="text-xs text-slate-500 mt-0.5">PTN-PRT &middot; Partner Portal</p>
        </div>
      </div>

      {/* 안내 배너 */}
      <div className="mb-6 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.03] p-4">
        <div className="flex items-center gap-2 mb-1">
          <Globe size={16} className="text-indigo-400" />
          <span className="text-sm font-semibold text-indigo-400">외부 파트너 전용 뷰</span>
        </div>
        <p className="text-xs text-slate-400">파트너에게 공유된 문서, 프로젝트 현황, 리포트를 확인할 수 있습니다.</p>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {Object.entries(TYPE_MAP).map(([key, val]) => {
          const Icon = val.icon;
          const count = MOCK_SHARED.filter(s => s.type === key).length;
          return (
            <div key={key} className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
              <Icon size={18} className={`mx-auto mb-1 ${val.color.split(' ')[0]}`} />
              <div className="text-lg font-bold">{count}</div>
              <div className="text-[10px] text-slate-500">{TYPE_LABELS[key]}</div>
            </div>
          );
        })}
      </div>

      {/* 공유 항목 목록 */}
      <div className="space-y-2">
        {MOCK_SHARED.map(item => {
          const typeInfo = TYPE_MAP[item.type];
          const Icon = typeInfo.icon;
          return (
            <div key={item.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${typeInfo.color.split(' ')[1]}`}>
                    <Icon size={18} className={typeInfo.color.split(' ')[0]} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.title}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeInfo.color}`}>
                        {TYPE_LABELS[item.type]}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{item.partner}</div>
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.accessLevel === 'edit' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 bg-white/5'}`}>
                  {item.accessLevel === 'edit' ? '편집 가능' : '보기 전용'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>공유일 {item.sharedDate}</span>
                <span>마지막 조회 {item.lastViewed}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
