'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

interface Application {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  university: string;
  major: string | null;
  minor: string | null;
  cohort: number | null;
  activity_year: number | null;
  interested_industry: string | null;
  interested_job: string | null;
  motivation: string | null;
  portfolio_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface Props {
  clubId: string;
  clubSlug: string;
  applications: Application[];
  accentColor: string;
}

export function ManagePanel({ clubId, clubSlug, applications: initial, accentColor }: Props) {
  const [apps, setApps] = useState(initial);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  const filtered = apps.filter(a => a.status === activeTab);
  const pendingCount = apps.filter(a => a.status === 'pending').length;

  async function handleAction(appId: string, action: 'approve' | 'reject') {
    setLoading(appId);
    try {
      const res = await fetch(`/api/madleague/applications/${appId}/${action}`, { method: 'POST' });
      if (!res.ok) throw new Error('failed');
      setApps(prev => prev.map(a => a.id === appId
        ? { ...a, status: action === 'approve' ? 'approved' : 'rejected' }
        : a
      ));
      setExpanded(null);
    } catch {
      alert('처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(null);
    }
  }

  const tabs: { key: typeof activeTab; label: string; count: number }[] = [
    { key: 'pending', label: '대기 중', count: apps.filter(a => a.status === 'pending').length },
    { key: 'approved', label: '승인됨', count: apps.filter(a => a.status === 'approved').length },
    { key: 'rejected', label: '거절됨', count: apps.filter(a => a.status === 'rejected').length },
  ];

  return (
    <div>
      {/* 요약 배너 */}
      {pendingCount > 0 && (
        <div className="mb-6 flex items-center gap-3 border border-amber-600/40 bg-amber-950/30 px-4 py-3 text-sm text-amber-300">
          <Clock className="h-4 w-4 shrink-0" />
          대기 중인 지원서 <strong>{pendingCount}건</strong>이 있습니다. 검토 후 승인 또는 거절해주세요.
        </div>
      )}

      {/* 탭 */}
      <div className="flex border-b border-neutral-800 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-[#EC1D25] text-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                tab.key === 'pending' ? 'bg-amber-600 text-white' : 'bg-neutral-700 text-neutral-300'
              }`}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* 목록 */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-neutral-500 text-sm">
          {activeTab === 'pending' ? '대기 중인 지원서가 없습니다.' :
           activeTab === 'approved' ? '승인된 매드리거가 없습니다.' : '거절된 지원서가 없습니다.'}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(app => (
            <div key={app.id} className="border border-neutral-800 bg-neutral-950">
              {/* 헤더 행 */}
              <button
                className="w-full flex items-center gap-4 px-4 py-4 text-left hover:bg-neutral-900 transition-colors"
                onClick={() => setExpanded(expanded === app.id ? null : app.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{app.name}</span>
                    {app.cohort && (
                      <span className="text-xs text-neutral-500">{app.cohort}기</span>
                    )}
                    {app.activity_year && (
                      <span className="text-xs text-neutral-600">({app.activity_year}년 활동)</span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">{app.university}{app.major ? ` · ${app.major}` : ''}</p>
                </div>
                <div className="text-xs text-neutral-600 shrink-0">
                  {app.created_at.substring(0, 10)}
                </div>
                {expanded === app.id ? <ChevronUp className="h-4 w-4 text-neutral-500 shrink-0" /> : <ChevronDown className="h-4 w-4 text-neutral-500 shrink-0" />}
              </button>

              {/* 상세 */}
              {expanded === app.id && (
                <div className="border-t border-neutral-800 px-4 py-4 space-y-4">
                  <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                    <Info label="이메일" value={app.email} />
                    <Info label="연락처" value={app.phone ?? '-'} />
                    <Info label="부전공" value={app.minor ?? '-'} />
                    <Info label="관심 산업" value={app.interested_industry ?? '-'} />
                    <Info label="관심 직무" value={app.interested_job ?? '-'} />
                    {app.portfolio_url && (
                      <div>
                        <dt className="text-xs text-neutral-500 mb-0.5">포트폴리오</dt>
                        <dd>
                          <a href={app.portfolio_url} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-[#EC1D25] flex items-center gap-1 hover:underline">
                            링크 열기 <ExternalLink className="h-3 w-3" />
                          </a>
                        </dd>
                      </div>
                    )}
                  </dl>

                  {app.motivation && (
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">자기 소개</p>
                      <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap border border-neutral-800 p-3 bg-neutral-900">
                        {app.motivation}
                      </p>
                    </div>
                  )}

                  {app.status === 'pending' && (
                    <div className="flex gap-3 pt-2">
                      <button
                        disabled={loading === app.id}
                        onClick={() => handleAction(app.id, 'approve')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#EC1D25] hover:bg-[#d01820] disabled:bg-neutral-700 text-white text-sm font-bold transition"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {loading === app.id ? '처리 중...' : '승인'}
                      </button>
                      <button
                        disabled={loading === app.id}
                        onClick={() => handleAction(app.id, 'reject')}
                        className="flex items-center gap-2 px-5 py-2.5 border border-neutral-700 hover:border-neutral-500 disabled:opacity-50 text-neutral-300 text-sm font-bold transition"
                      >
                        <XCircle className="h-4 w-4" />
                        거절
                      </button>
                    </div>
                  )}

                  {app.status === 'approved' && (
                    <div className="flex items-center gap-2 text-sm text-green-400">
                      <CheckCircle2 className="h-4 w-4" /> 승인 완료 — 매드리거 커뮤니티 접근 가능
                    </div>
                  )}
                  {app.status === 'rejected' && (
                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                      <XCircle className="h-4 w-4" /> 거절됨
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-neutral-500 mb-0.5">{label}</dt>
      <dd className="text-sm text-neutral-200">{value}</dd>
    </div>
  );
}
