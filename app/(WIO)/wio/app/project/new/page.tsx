'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useWIO } from '../../layout';
import { createProject, generateProjectCode } from '@/lib/supabase/wio';
import type { ProjectType } from '@/types/wio';

export default function NewProjectPage() {
  const router = useRouter();
  const { tenant, member } = useWIO();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ProjectType>('client');
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant || !member || !title.trim()) return;
    setSubmitting(true);

    const code = await generateProjectCode(tenant.id, type);
    const result = await createProject({
      tenantId: tenant.id,
      code,
      title: title.trim(),
      type,
      description: description.trim() || null,
      clientName: clientName.trim() || null,
      budget: budget ? Number(budget) * 10000 : 0,
      pmId: member.id,
      status: 'draft',
      deadline: deadline || null,
    });

    if (result) {
      router.push(`/wio/app/project/${result.id}`);
    } else {
      alert('프로젝트 생성 실패');
      setSubmitting(false);
    }
  };

  const TYPES = [
    { value: 'client', label: '클라이언트', desc: '외부 의뢰 프로젝트' },
    { value: 'internal', label: '내부', desc: '사내 프로젝트' },
    { value: 'community', label: '커뮤니티', desc: '커뮤니티/네트워크' },
    { value: 'personal', label: '개인', desc: '개인 과제' },
  ];

  return (
    <div className="max-w-xl">
      <Link href="/wio/app/project" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-white mb-6"><ArrowLeft size={14} /> 프로젝트</Link>
      <h1 className="text-xl font-bold mb-6">새 프로젝트</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-300">유형</label>
          <div className="grid grid-cols-2 gap-2">
            {TYPES.map(t => (
              <button key={t.value} type="button" onClick={() => setType(t.value as ProjectType)}
                className={`rounded-lg border p-3 text-left transition-colors ${type === t.value ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/5 hover:border-white/10'}`}>
                <div className="text-sm font-medium">{t.label}</div>
                <div className="text-xs text-slate-500">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-300">프로젝트명 *</label>
          <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="프로젝트 이름"
            className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
        </div>

        {type === 'client' && (
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-300">클라이언트명</label>
            <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="예: 삼성전자"
              className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-300">설명</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="프로젝트 개요"
            className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm resize-none focus:border-indigo-500 focus:outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-300">예산 (만원)</label>
            <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="0"
              className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-300">마감일</label>
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
              className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
          </div>
        </div>

        <button type="submit" disabled={!title.trim() || submitting}
          className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors">
          {submitting ? '생성 중...' : '프로젝트 생성'}
        </button>
      </form>
    </div>
  );
}
