'use client';

import { useState } from 'react';
import { Activity, Cpu, HardDrive, MemoryStick, AlertTriangle, Users, Zap, Clock, RefreshCw } from 'lucide-react';
import { useWIO } from '../../layout';

type LogLevel = 'error' | 'warning' | 'info';
type ErrorLog = { id: string; level: LogLevel; message: string; module: string; time: string };

const MOCK_SERVER = {
  cpu: 42, memory: 68, disk: 55,
  uptime: '15일 4시간 23분',
  activeUsers: 18, apiCalls: 12450, avgResponseTime: 120,
};

const MOCK_API_CHART = [
  { time: '00:00', ms: 95 }, { time: '04:00', ms: 88 }, { time: '08:00', ms: 145 },
  { time: '09:00', ms: 210 }, { time: '10:00', ms: 185 }, { time: '11:00', ms: 160 },
  { time: '12:00', ms: 130 }, { time: '13:00', ms: 175 }, { time: '14:00', ms: 155 },
  { time: '15:00', ms: 120 },
];

const MOCK_ERRORS: ErrorLog[] = [
  { id: 'el1', level: 'error', message: 'Database connection timeout (pool exhausted)', module: 'DB', time: '14:32:15' },
  { id: 'el2', level: 'error', message: 'Failed to send email notification', module: 'Mail', time: '14:28:03' },
  { id: 'el3', level: 'warning', message: 'API rate limit approaching (80%)', module: 'API', time: '14:15:42' },
  { id: 'el4', level: 'info', message: 'Scheduled backup completed successfully', module: 'Backup', time: '14:00:00' },
  { id: 'el5', level: 'error', message: 'File upload failed: storage quota exceeded', module: 'Storage', time: '13:45:22' },
  { id: 'el6', level: 'warning', message: 'High memory usage detected (>70%)', module: 'System', time: '13:30:11' },
  { id: 'el7', level: 'info', message: 'Cache cleared: 2.4GB freed', module: 'Cache', time: '13:15:00' },
  { id: 'el8', level: 'error', message: 'Authentication service: token refresh failed', module: 'Auth', time: '13:10:55' },
  { id: 'el9', level: 'warning', message: 'Slow query detected (>5s): user_analytics', module: 'DB', time: '12:55:30' },
  { id: 'el10', level: 'info', message: 'Auto-scaling: instance count increased to 3', module: 'Infra', time: '12:45:00' },
  { id: 'el11', level: 'error', message: 'Webhook delivery failed: endpoint unreachable', module: 'Webhook', time: '12:30:18' },
  { id: 'el12', level: 'warning', message: 'SSL certificate expires in 30 days', module: 'Security', time: '12:00:00' },
  { id: 'el13', level: 'info', message: 'Deploy v2.1.3 completed', module: 'Deploy', time: '11:30:00' },
  { id: 'el14', level: 'error', message: 'Payment gateway: connection refused', module: 'Payment', time: '11:15:45' },
  { id: 'el15', level: 'info', message: 'CRON job: daily report generated', module: 'Scheduler', time: '10:00:00' },
  { id: 'el16', level: 'warning', message: 'Disk usage warning: /data at 55%', module: 'Disk', time: '09:00:00' },
  { id: 'el17', level: 'error', message: 'Image processing timeout', module: 'Media', time: '08:45:12' },
  { id: 'el18', level: 'info', message: 'Daily database vacuum completed', module: 'DB', time: '06:00:00' },
  { id: 'el19', level: 'warning', message: 'Unusual login pattern detected', module: 'Security', time: '03:22:00' },
  { id: 'el20', level: 'info', message: 'System health check: all services operational', module: 'Monitor', time: '00:00:00' },
];

const LEVEL_COLORS: Record<LogLevel, string> = { error: 'text-rose-400 bg-rose-500/10', warning: 'text-amber-400 bg-amber-500/10', info: 'text-blue-400 bg-blue-500/10' };

export default function MonitorPage() {
  const { tenant } = useWIO();
  const [logFilter, setLogFilter] = useState<'all' | LogLevel>('all');

  if (!tenant) return null;
  const isDemo = tenant.id === 'demo';

  const filteredLogs = logFilter === 'all' ? MOCK_ERRORS : MOCK_ERRORS.filter(e => e.level === logFilter);
  const maxMs = Math.max(...MOCK_API_CHART.map(c => c.ms));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">시스템 모니터링</h1>
        <button className="flex items-center gap-1.5 rounded-lg border border-white/5 px-3 py-2 text-sm text-slate-400 hover:text-white hover:border-white/10 transition-all">
          <RefreshCw size={14} /> 새로고침
        </button>
      </div>

      {isDemo && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 mb-4 text-sm text-amber-300">
          데모 모드입니다. Mock 데이터가 표시됩니다.
        </div>
      )}

      {/* 서버 상태 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'CPU', value: `${MOCK_SERVER.cpu}%`, icon: Cpu, color: MOCK_SERVER.cpu > 80 ? 'text-rose-400' : 'text-emerald-400' },
          { label: '메모리', value: `${MOCK_SERVER.memory}%`, icon: MemoryStick, color: MOCK_SERVER.memory > 80 ? 'text-rose-400' : MOCK_SERVER.memory > 60 ? 'text-amber-400' : 'text-emerald-400' },
          { label: '디스크', value: `${MOCK_SERVER.disk}%`, icon: HardDrive, color: 'text-emerald-400' },
          { label: '업타임', value: MOCK_SERVER.uptime, icon: Clock, color: 'text-blue-400' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon size={14} className="text-slate-500" />
              <span className="text-xs text-slate-500">{s.label}</span>
            </div>
            <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
            {s.label !== '업타임' && (
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-2">
                <div className={`h-full rounded-full ${s.color.replace('text-', 'bg-').replace('-400', '-500')}`} style={{ width: s.value }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 사용량 + API 응답시간 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <h3 className="text-sm font-semibold mb-4">사용량</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <Users size={18} className="mx-auto mb-1 text-indigo-400" />
              <div className="text-lg font-bold">{MOCK_SERVER.activeUsers}</div>
              <div className="text-[10px] text-slate-500">활성 사용자</div>
            </div>
            <div className="text-center">
              <Zap size={18} className="mx-auto mb-1 text-emerald-400" />
              <div className="text-lg font-bold">{MOCK_SERVER.apiCalls.toLocaleString()}</div>
              <div className="text-[10px] text-slate-500">API 호출 (오늘)</div>
            </div>
            <div className="text-center">
              <Activity size={18} className="mx-auto mb-1 text-amber-400" />
              <div className="text-lg font-bold">{MOCK_SERVER.avgResponseTime}ms</div>
              <div className="text-[10px] text-slate-500">평균 응답시간</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <h3 className="text-sm font-semibold mb-4">API 응답시간 (ms)</h3>
          <div className="flex items-end gap-1 h-24">
            {MOCK_API_CHART.map(c => (
              <div key={c.time} className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-full rounded-t ${c.ms > 180 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                  style={{ height: `${(c.ms / maxMs) * 100}%` }} />
                <span className="text-[8px] text-slate-600">{c.time.slice(0, 2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 에러 로그 */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-sm font-semibold">에러 로그 (최근 20건)</h3>
          <div className="flex gap-1">
            {(['all', 'error', 'warning', 'info'] as const).map(f => (
              <button key={f} onClick={() => setLogFilter(f)}
                className={`px-2 py-1 rounded text-[10px] transition-colors ${logFilter === f ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-500 hover:bg-white/5'}`}>
                {f === 'all' ? '전체' : f}
              </button>
            ))}
          </div>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {filteredLogs.map(log => (
            <div key={log.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5 hover:bg-white/[0.02] transition-colors">
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${LEVEL_COLORS[log.level]}`}>{log.level.toUpperCase()}</span>
              <span className="text-[10px] text-slate-600 font-mono w-16 shrink-0">{log.time}</span>
              <span className="text-[10px] text-slate-500 w-16 shrink-0">[{log.module}]</span>
              <span className="text-xs text-slate-300 truncate">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
