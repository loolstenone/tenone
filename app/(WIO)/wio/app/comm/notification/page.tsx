'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, Stamp, FolderKanban, MessageSquare, AlertTriangle, Settings, Check, CheckCheck } from 'lucide-react';
import { useWIO } from '../../layout';
import { createClient } from '@/lib/supabase/client';

type NotiType = 'approval' | 'project' | 'feedback' | 'system';
type Tab = 'all' | 'unread';
type Noti = { id: string; type: NotiType; title: string; body: string; time: string; read: boolean };

const NOTI_ICONS: Record<NotiType, typeof Bell> = { approval: Stamp, project: FolderKanban, feedback: MessageSquare, system: AlertTriangle };
const NOTI_COLORS: Record<NotiType, string> = { approval: 'text-indigo-400 bg-indigo-500/10', project: 'text-emerald-400 bg-emerald-500/10', feedback: 'text-amber-400 bg-amber-500/10', system: 'text-rose-400 bg-rose-500/10' };

const MOCK_NOTIS: Noti[] = [
  { id: 'n1', type: 'approval', title: '결재 요청', body: '김대표님이 "마케팅 예산 증액 요청"에 대한 결재를 요청했습니다.', time: '5분 전', read: false },
  { id: 'n2', type: 'project', title: '프로젝트 업데이트', body: 'WIO v2.2 스프린트가 시작되었습니다. 담당 태스크를 확인하세요.', time: '30분 전', read: false },
  { id: 'n3', type: 'feedback', title: '새 댓글', body: '박개발님이 "기술 아키텍처 문서"에 댓글을 남겼습니다.', time: '1시간 전', read: false },
  { id: 'n4', type: 'system', title: '보안 알림', body: '새로운 기기에서 로그인이 감지되었습니다.', time: '2시간 전', read: false },
  { id: 'n5', type: 'approval', title: '결재 승인', body: '"출장 경비 정산" 결재가 승인되었습니다.', time: '3시간 전', read: true },
  { id: 'n6', type: 'project', title: '마감 임박', body: '"LUKI 브랜드 가이드 v3" 태스크 마감이 내일입니다.', time: '4시간 전', read: true },
  { id: 'n7', type: 'feedback', title: 'GPR 피드백', body: '최인사님이 1분기 GPR 피드백을 등록했습니다.', time: '어제', read: true },
  { id: 'n8', type: 'system', title: '시스템 점검', body: '4월 5일(토) 02:00-06:00 시스템 점검이 예정되어 있습니다.', time: '어제', read: true },
  { id: 'n9', type: 'approval', title: '결재 반려', body: '"비품 구매 요청"이 반려되었습니다. 사유를 확인하세요.', time: '2일 전', read: true },
  { id: 'n10', type: 'project', title: '새 프로젝트', body: 'MAD League 대학 연합 프로젝트에 멤버로 초대되었습니다.', time: '2일 전', read: true },
  { id: 'n11', type: 'feedback', title: '멘션', body: '윤기획님이 게시글에서 회원님을 멘션했습니다.', time: '3일 전', read: true },
  { id: 'n12', type: 'system', title: '용량 알림', body: '스토리지 사용량이 80%에 도달했습니다.', time: '3일 전', read: true },
];

type SettingsConfig = Record<NotiType, boolean>;

export default function NotificationPage() {
  const { tenant } = useWIO();
  const [tab, setTab] = useState<Tab>('all');
  const [notis, setNotis] = useState(MOCK_NOTIS);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<SettingsConfig>({ approval: true, project: true, feedback: true, system: true });

  const [loading, setLoading] = useState(false);

  if (!tenant) return null;
  const isDemo = tenant.id === 'demo';

  // Supabase에서 알림 로드
  useEffect(() => {
    if (isDemo) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const sb = createClient();
        const { data, error } = await sb
          .from('notifications')
          .select('*')
          .eq('tenant_id', tenant!.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (!cancelled && data && data.length > 0) {
          setNotis(data.map((row: any): Noti => ({
            id: row.id,
            type: row.type || 'system',
            title: row.title || '',
            body: row.body || row.message || '',
            time: row.time_label || (row.created_at ? new Date(row.created_at).toLocaleString('ko-KR') : ''),
            read: row.read ?? false,
          })));
        }
        // 데이터 없으면 Mock 폴백 (초기값 유지)
      } catch {
        // 에러 시 Mock 폴백 (초기값 유지)
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isDemo, tenant]);

  const filtered = tab === 'unread' ? notis.filter(n => !n.read) : notis;
  const unreadCount = notis.filter(n => !n.read).length;

  const markRead = (id: string) => setNotis(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotis(prev => prev.map(n => ({ ...n, read: true })));
  const toggleSetting = (type: NotiType) => setSettings(prev => ({ ...prev, [type]: !prev[type] }));

  const TABS = [
    { id: 'all' as Tab, label: '전체' },
    { id: 'unread' as Tab, label: `읽지않음 (${unreadCount})` },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">알림센터</h1>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-1.5 rounded-lg border border-white/5 px-3 py-2 text-sm text-slate-400 hover:text-white hover:border-white/10 transition-all">
              <CheckCheck size={14} /> 모두 읽음
            </button>
          )}
          <button onClick={() => setShowSettings(!showSettings)} className="rounded-lg border border-white/5 p-2 text-slate-400 hover:text-white hover:border-white/10 transition-all">
            <Settings size={15} />
          </button>
        </div>
      </div>

      {isDemo && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 mb-4 text-sm text-amber-300">
          데모 모드입니다.
        </div>
      )}

      {showSettings && (
        <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <h3 className="text-sm font-semibold mb-3">알림 설정</h3>
          <div className="space-y-2">
            {(Object.entries(NOTI_ICONS) as [NotiType, typeof Bell][]).map(([type, Icon]) => (
              <div key={type} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${NOTI_COLORS[type]}`}>
                    <Icon size={13} />
                  </div>
                  <span className="text-sm capitalize">{type === 'approval' ? '결재' : type === 'project' ? '프로젝트' : type === 'feedback' ? '피드백' : '시스템'}</span>
                </div>
                <button onClick={() => toggleSetting(type)}
                  className={`w-10 h-5 rounded-full transition-colors ${settings[type] ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings[type] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-1.5 mb-4">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`rounded-lg px-3 py-2 text-sm transition-colors ${tab === t.id ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-1">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Bell size={32} className="mx-auto mb-3 text-slate-700" />
            <p className="text-sm text-slate-400">알림이 없습니다</p>
          </div>
        ) : filtered.map(n => {
          const Icon = NOTI_ICONS[n.type];
          return (
            <button key={n.id} onClick={() => markRead(n.id)}
              className={`w-full text-left flex items-start gap-3 rounded-lg border px-4 py-3 transition-colors ${!n.read ? 'border-l-2 border-l-indigo-500 border-white/5 bg-white/[0.03]' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'}`}>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 mt-0.5 ${NOTI_COLORS[n.type]}`}>
                <Icon size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${!n.read ? 'font-semibold' : ''}`}>{n.title}</span>
                  {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{n.body}</p>
                <span className="text-[10px] text-slate-600 mt-1 block">{n.time}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
