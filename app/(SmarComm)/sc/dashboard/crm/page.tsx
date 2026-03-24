'use client';

import { useRouter } from 'next/navigation';
import { Search, Plus, Bell, Mail, MessageSquare, ChevronRight } from 'lucide-react';
import { MOCK_LEADS, getLeadStatusLabel, getLeadStatusColor } from '@/lib/smarcomm/dashboard-data';

export default function CRMPage() {
  const router = useRouter();
  const statusOrder = ['lead', 'meeting', 'progress', 'contract'] as const;
  const grouped = statusOrder.map(status => ({
    status,
    label: getLeadStatusLabel(status),
    color: getLeadStatusColor(status),
    leads: MOCK_LEADS.filter(l => l.status === status),
  }));

  return (
    <div className="max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text">고객 관리</h1>
          <p className="mt-1 text-xs text-text-muted">리드부터 계약까지, 고객 관계를 체계적으로 관리하세요</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-xl bg-text px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-sub">
          <Plus size={15} /> 고객 추가
        </button>
      </div>

      {/* CRM 채널 바로가기 */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {[
          { icon: Bell, label: '푸시 메시지', desc: '4건 발송 완료', href: '/sc/dashboard/crm/push', count: '37.8% 오픈율' },
          { icon: Mail, label: '이메일', desc: '5개 자동화 활성', href: '/sc/dashboard/crm/email', count: '42.1% 오픈율' },
          { icon: MessageSquare, label: '카카오 메시지', desc: '12건 캠페인', href: '/sc/dashboard/crm/kakao', count: '89.7% 읽음율' },
        ].map((channel, i) => (
          <div key={i} className="flex items-center justify-between rounded-2xl border border-border bg-white p-4 cursor-pointer hover:bg-surface" onClick={() => router.push(channel.href)}>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface"><channel.icon size={16} className="text-text-sub" /></div>
              <div>
                <div className="text-sm font-semibold text-text">{channel.label}</div>
                <div className="text-xs text-text-muted">{channel.desc}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium text-text">{channel.count}</div>
              <ChevronRight size={14} className="ml-auto text-text-muted" />
            </div>
          </div>
        ))}
      </div>

      {/* 파이프라인 요약 */}
      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        {grouped.map(g => (
          <div key={g.status} className="rounded-2xl border border-border bg-white p-5 text-center">
            <div className="text-3xl font-bold" style={{ color: g.color }}>{g.leads.length}</div>
            <div className="text-xs text-text-muted">{g.label}</div>
          </div>
        ))}
      </div>

      {/* 칸반 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {grouped.map(g => (
          <div key={g.status}>
            <div className="mb-3 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full" style={{ background: g.color }} />
              <span className="text-sm font-semibold text-text">{g.label}</span>
              <span className="text-xs text-text-muted">{g.leads.length}</span>
            </div>
            <div className="space-y-2">
              {g.leads.map(lead => (
                <div key={lead.id} className="rounded-xl border border-border bg-white p-4 hover:bg-surface cursor-pointer">
                  <div className="text-sm font-medium text-text">{lead.name}</div>
                  <div className="text-xs text-text-muted">{lead.company}</div>
                  <div className="mt-2 text-xs text-text-sub">{lead.note}</div>
                  <div className="mt-2 text-[10px] text-text-muted">최근: {lead.lastContact}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
