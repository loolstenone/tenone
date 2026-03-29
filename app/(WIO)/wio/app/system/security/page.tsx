'use client';

import { useState } from 'react';
import { Shield, Lock, Globe, Clock, AlertTriangle, Check, Key, Smartphone, Eye } from 'lucide-react';
import { useWIO } from '../../layout';

type AccessLog = { id: string; user: string; ip: string; action: string; time: string; success: boolean; location: string };

const MOCK_POLICIES = [
  { id: 'p1', name: '2단계 인증 (2FA)', description: '로그인 시 추가 인증 필수', enabled: true, icon: Smartphone },
  { id: 'p2', name: 'IP 접근 제한', description: '허용된 IP만 접속 가능', enabled: false, icon: Globe },
  { id: 'p3', name: '세션 타임아웃', description: '30분 비활성 시 자동 로그아웃', enabled: true, icon: Clock },
  { id: 'p4', name: '비밀번호 정책', description: '8자 이상, 대소문자+숫자+특수문자', enabled: true, icon: Key },
  { id: 'p5', name: '로그인 실패 잠금', description: '5회 실패 시 30분 계정 잠금', enabled: true, icon: Lock },
];

const MOCK_LOGS: AccessLog[] = Array.from({ length: 50 }, (_, i) => {
  const users = ['김대표', '박개발', '이마케팅', '정디자인', '최인사', '한재무', '이프론트', '정백엔드', '윤기획', '시스템'];
  const actions = ['로그인', '로그아웃', '비밀번호 변경', '설정 변경', '파일 다운로드', 'API 키 생성', '멤버 초대', '역할 변경'];
  const ips = ['211.234.56.78', '175.123.45.67', '121.178.90.12', '59.12.34.56', '210.99.88.77'];
  const locations = ['서울', '서울', '부산', '대전', '인천'];
  return {
    id: `al${i}`,
    user: users[i % users.length],
    ip: ips[i % ips.length],
    action: actions[i % actions.length],
    time: `2026-03-${String(29 - Math.floor(i / 10)).padStart(2, '0')} ${String(14 - (i % 12)).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}`,
    success: i !== 3 && i !== 15 && i !== 27,
    location: locations[i % locations.length],
  };
});

const MOCK_ALERTS = [
  { id: 'sa1', message: '비정상 로그인 시도 감지: 미등록 IP에서 5회 연속 실패', time: '14:30', severity: 'high' },
  { id: 'sa2', message: 'SSL 인증서 만료 30일 전', time: '12:00', severity: 'medium' },
  { id: 'sa3', message: '관리자 계정 비밀번호 90일 미변경', time: '09:00', severity: 'low' },
];

export default function SecurityPage() {
  const { tenant } = useWIO();
  const [policies, setPolicies] = useState(MOCK_POLICIES);
  const [logPage, setLogPage] = useState(0);
  const logsPerPage = 15;

  if (!tenant) return null;
  const isDemo = tenant.id === 'demo';

  const togglePolicy = (id: string) => {
    setPolicies(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  };

  const pagedLogs = MOCK_LOGS.slice(logPage * logsPerPage, (logPage + 1) * logsPerPage);
  const totalPages = Math.ceil(MOCK_LOGS.length / logsPerPage);

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">보안관리</h1>

      {isDemo && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 mb-4 text-sm text-amber-300">
          데모 모드입니다.
        </div>
      )}

      {/* 보안 알림 */}
      {MOCK_ALERTS.length > 0 && (
        <div className="space-y-2 mb-6">
          {MOCK_ALERTS.map(a => (
            <div key={a.id} className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm ${a.severity === 'high' ? 'border-rose-500/20 bg-rose-500/5 text-rose-300' : a.severity === 'medium' ? 'border-amber-500/20 bg-amber-500/5 text-amber-300' : 'border-blue-500/20 bg-blue-500/5 text-blue-300'}`}>
              <AlertTriangle size={14} />
              <span className="flex-1">{a.message}</span>
              <span className="text-[10px] opacity-60">{a.time}</span>
            </div>
          ))}
        </div>
      )}

      {/* 보안 정책 */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 mb-6">
        <h2 className="text-sm font-semibold mb-4">보안 정책 현황</h2>
        <div className="space-y-3">
          {policies.map(p => (
            <div key={p.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${p.enabled ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-500/10 text-slate-500'}`}>
                  <p.icon size={14} />
                </div>
                <div>
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-xs text-slate-500">{p.description}</div>
                </div>
              </div>
              <button onClick={() => togglePolicy(p.id)}
                className={`w-10 h-5 rounded-full transition-colors ${p.enabled ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${p.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 접근 로그 */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5">
          <h3 className="text-sm font-semibold">접근 로그 (최근 50건)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 text-[10px] text-slate-500 uppercase tracking-wider">
                <th className="text-left px-4 py-2">시간</th>
                <th className="text-left px-4 py-2">사용자</th>
                <th className="text-left px-4 py-2">액션</th>
                <th className="text-left px-4 py-2">IP</th>
                <th className="text-left px-4 py-2">위치</th>
                <th className="text-left px-4 py-2">상태</th>
              </tr>
            </thead>
            <tbody>
              {pagedLogs.map(log => (
                <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-2 text-xs text-slate-500 font-mono">{log.time.slice(11)}</td>
                  <td className="px-4 py-2 text-xs">{log.user}</td>
                  <td className="px-4 py-2 text-xs text-slate-400">{log.action}</td>
                  <td className="px-4 py-2 text-xs text-slate-500 font-mono">{log.ip}</td>
                  <td className="px-4 py-2 text-xs text-slate-500">{log.location}</td>
                  <td className="px-4 py-2">
                    {log.success ? (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-0.5"><Check size={10} /> 성공</span>
                    ) : (
                      <span className="text-[10px] text-rose-400 flex items-center gap-0.5"><AlertTriangle size={10} /> 실패</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
          <span>{logPage * logsPerPage + 1}-{Math.min((logPage + 1) * logsPerPage, MOCK_LOGS.length)} / {MOCK_LOGS.length}건</span>
          <div className="flex gap-1">
            <button onClick={() => setLogPage(p => Math.max(0, p - 1))} disabled={logPage === 0} className="px-2 py-1 rounded hover:bg-white/5 disabled:opacity-30">이전</button>
            <button onClick={() => setLogPage(p => Math.min(totalPages - 1, p + 1))} disabled={logPage >= totalPages - 1} className="px-2 py-1 rounded hover:bg-white/5 disabled:opacity-30">다음</button>
          </div>
        </div>
      </div>
    </div>
  );
}
