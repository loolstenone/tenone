'use client';

import { useState } from 'react';
import { Rocket, CheckCircle, XCircle, Clock, RotateCcw, GitBranch, Play } from 'lucide-react';
import { useWIO } from '../../layout';

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  success: { label: '성공', color: 'text-emerald-400 bg-emerald-500/10', icon: CheckCircle },
  failed: { label: '실패', color: 'text-red-400 bg-red-500/10', icon: XCircle },
  deploying: { label: '배포중', color: 'text-amber-400 bg-amber-500/10', icon: Clock },
  rolled_back: { label: '롤백', color: 'text-orange-400 bg-orange-500/10', icon: RotateCcw },
};

const MOCK_RELEASES = [
  { id: 'REL-v2.4.1', version: 'v2.4.1', environment: 'production', status: 'success', deployer: '박상현', branch: 'release/2.4.1', deployedAt: '2026-03-28 14:30', duration: '3분 42초', ciStatus: 'pass', tests: { passed: 248, failed: 0, skipped: 3 }, changelog: ['결제 타임아웃 수정', 'NPS 대시보드 추가'] },
  { id: 'REL-v2.4.0', version: 'v2.4.0', environment: 'production', status: 'rolled_back', deployer: '김지은', branch: 'release/2.4.0', deployedAt: '2026-03-26 10:15', duration: '4분 18초', ciStatus: 'pass', tests: { passed: 245, failed: 2, skipped: 4 }, changelog: ['대시보드 리뉴얼', '실시간 알림'] },
  { id: 'REL-stg-432', version: 'v2.5.0-beta', environment: 'staging', status: 'success', deployer: '이하은', branch: 'develop', deployedAt: '2026-03-28 16:00', duration: '2분 55초', ciStatus: 'pass', tests: { passed: 252, failed: 0, skipped: 5 }, changelog: ['OAuth 카카오 로그인', 'PDF 내보내기'] },
  { id: 'REL-v2.3.5', version: 'v2.3.5', environment: 'production', status: 'success', deployer: '박상현', branch: 'hotfix/2.3.5', deployedAt: '2026-03-20 09:00', duration: '3분 10초', ciStatus: 'pass', tests: { passed: 240, failed: 0, skipped: 2 }, changelog: ['CSV 인코딩 패치'] },
  { id: 'REL-stg-431', version: 'v2.4.1-rc', environment: 'staging', status: 'failed', deployer: '정현우', branch: 'release/2.4.1', deployedAt: '2026-03-27 18:30', duration: '1분 20초', ciStatus: 'fail', tests: { passed: 230, failed: 15, skipped: 6 }, changelog: ['결제 모듈 업데이트'] },
];

export default function DeployPage() {
  const { tenant } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [envFilter, setEnvFilter] = useState('all');

  const filtered = MOCK_RELEASES.filter(r => envFilter === 'all' || r.environment === envFilter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">배포관리</h1>
          <p className="text-xs text-slate-500 mt-0.5">DEV-REL &middot; CI/CD &amp; 릴리즈</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          <Play size={15} /> 수동 배포
        </button>
      </div>

      {/* CI/CD 상태 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-slate-500">Production</p>
          <p className="text-sm font-bold mt-1 text-emerald-400">v2.4.1</p>
          <p className="text-[10px] text-slate-600 mt-0.5">3/28 14:30</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-slate-500">Staging</p>
          <p className="text-sm font-bold mt-1 text-blue-400">v2.5.0-beta</p>
          <p className="text-[10px] text-slate-600 mt-0.5">3/28 16:00</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-slate-500">성공률</p>
          <p className="text-2xl font-bold mt-1 text-emerald-400">{Math.round(MOCK_RELEASES.filter(r => r.status === 'success').length / MOCK_RELEASES.length * 100)}%</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-slate-500">평균 배포 시간</p>
          <p className="text-2xl font-bold mt-1">3분</p>
        </div>
      </div>

      {/* 환경 필터 */}
      <div className="flex gap-1 mb-4">
        {['all', 'production', 'staging'].map(e => (
          <button key={e} onClick={() => setEnvFilter(e)}
            className={`text-[10px] px-2.5 py-1 rounded-full ${envFilter === e ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-500 hover:bg-white/5'}`}>
            {e === 'all' ? '전체' : e.charAt(0).toUpperCase() + e.slice(1)}
          </button>
        ))}
      </div>

      {/* 릴리즈 목록 */}
      <div className="space-y-3">
        {filtered.map(r => {
          const st = STATUS_MAP[r.status];
          const Icon = st.icon;
          return (
            <div key={r.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon size={14} className={st.color.split(' ')[0]} />
                  <span className="text-sm font-bold">{r.version}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${r.environment === 'production' ? 'text-emerald-400 bg-emerald-500/10' : 'text-blue-400 bg-blue-500/10'}`}>{r.environment}</span>
                </div>
                {r.status === 'success' && r.environment === 'production' && (
                  <button className="flex items-center gap-1 text-[10px] text-orange-400 hover:underline"><RotateCcw size={10} />롤백</button>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 mb-2">
                <span className="flex items-center gap-1"><GitBranch size={10} />{r.branch}</span>
                <span>{r.deployer}</span>
                <span>{r.deployedAt}</span>
                <span>{r.duration}</span>
              </div>

              <div className="flex items-center gap-4">
                <span className={`text-[10px] font-semibold ${r.ciStatus === 'pass' ? 'text-emerald-400' : 'text-red-400'}`}>CI: {r.ciStatus.toUpperCase()}</span>
                <span className="text-[10px] text-slate-500">Tests: {r.tests.passed} pass / {r.tests.failed} fail / {r.tests.skipped} skip</span>
              </div>

              {r.changelog.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {r.changelog.map(c => (
                    <span key={c} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400">{c}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
