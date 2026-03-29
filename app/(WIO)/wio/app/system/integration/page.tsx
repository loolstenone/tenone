'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plug, Check, X, AlertCircle, RefreshCw, ExternalLink,
  Calendar, MessageCircle, Hash, GitBranch, BookOpen, Palette, Clock, Zap,
} from 'lucide-react';
import { useWIO } from '../../layout';

// ─── 타입 ─────────────────────────────────────────────────────

type IntStatus = 'connected' | 'disconnected' | 'error' | 'checking';

type IntegrationType = 'oauth' | 'webhook' | 'apikey';

type Integration = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: IntStatus;
  type: IntegrationType;
  provider: string; // DB provider 키
  lastSync?: string;
  errorCount?: number;
  errorMessage?: string;
  // OAuth 연동용
  authUrl?: string;
  // Webhook 연동용
  webhookUrl?: string;
  // API Key 연동용
  apiKey?: string;
  // 기능 설명
  features: string[];
};

// ─── 상태 설정 ────────────────────────────────────────────────

const STATUS_CONFIG: Record<IntStatus, { label: string; color: string; icon: typeof Check }> = {
  connected: { label: '연결됨', color: 'text-emerald-400 bg-emerald-500/10', icon: Check },
  disconnected: { label: '미연결', color: 'text-slate-400 bg-slate-500/10', icon: X },
  error: { label: '오류', color: 'text-rose-400 bg-rose-500/10', icon: AlertCircle },
  checking: { label: '확인 중', color: 'text-amber-400 bg-amber-500/10', icon: RefreshCw },
};

// ─── 초기 연동 목록 ───────────────────────────────────────────

const INTEGRATIONS_CONFIG: Integration[] = [
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: '캘린더 이벤트 동기화 · 일정 관리',
    icon: <Calendar size={18} className="text-blue-400" />,
    status: 'checking',
    type: 'oauth',
    provider: 'google_calendar',
    features: ['캘린더 이벤트 조회', '일정 생성/수정/삭제', 'Orbi 일정 동기화'],
  },
  {
    id: 'kakao',
    name: 'Kakao',
    description: '카카오톡 메시지 · 알림 전송',
    icon: <MessageCircle size={18} className="text-yellow-400" />,
    status: 'checking',
    type: 'apikey',
    provider: 'kakao',
    features: ['카카오톡 알림 메시지', '친구에게 메시지 전송', '채널 메시지 (바당쇠)'],
  },
  {
    id: 'slack',
    name: 'Slack',
    description: '팀 메시지 · 알림 포워딩',
    icon: <Hash size={18} className="text-purple-400" />,
    status: 'checking',
    type: 'webhook',
    provider: 'slack',
    features: ['웹훅 알림 전송', 'Bot 채널 메시지', '이벤트 수신 (멘션 등)'],
  },
  {
    id: 'github',
    name: 'GitHub',
    description: '코드 저장소 · 이슈 연동',
    icon: <GitBranch size={18} className="text-slate-300" />,
    status: 'disconnected',
    type: 'oauth',
    provider: 'github',
    features: ['저장소 연동', '이슈/PR 추적', '커밋 알림'],
  },
  {
    id: 'notion',
    name: 'Notion',
    description: '문서 · 위키 동기화',
    icon: <BookOpen size={18} className="text-slate-300" />,
    status: 'disconnected',
    type: 'oauth',
    provider: 'notion',
    features: ['문서 동기화', '데이터베이스 연동', '위키 자동 업데이트'],
  },
  {
    id: 'figma',
    name: 'Figma',
    description: '디자인 파일 연동',
    icon: <Palette size={18} className="text-pink-400" />,
    status: 'disconnected',
    type: 'oauth',
    provider: 'figma',
    features: ['디자인 파일 임베드', '코멘트 알림', '에셋 자동 추출'],
  },
];

// ─── 메인 컴포넌트 ────────────────────────────────────────────

export default function IntegrationPage() {
  const { tenant } = useWIO();
  const [integrations, setIntegrations] = useState<Integration[]>(INTEGRATIONS_CONFIG);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [webhookInput, setWebhookInput] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');

  const isDemo = tenant?.id === 'demo';

  // ─── 연동 상태 실시간 확인 ──────────────────────────

  const checkIntegrationStatus = useCallback(async () => {
    // 실제 API 호출로 연동 상태 확인
    // 현재는 환경변수 기반으로 판단 (클라이언트 사이드)
    try {
      const res = await fetch('/api/integrations/status');
      if (res.ok) {
        const data = await res.json();
        setIntegrations(prev => prev.map(int => {
          const status = data.integrations?.[int.provider];
          if (status) {
            return {
              ...int,
              status: status.status as IntStatus,
              lastSync: status.lastSync,
              errorCount: status.errorCount,
              errorMessage: status.errorMessage,
              authUrl: status.authUrl,
              webhookUrl: status.webhookUrl,
            };
          }
          // API가 상태를 반환하지 않은 경우 disconnected로 표시
          return { ...int, status: 'disconnected' as IntStatus };
        }));
      } else {
        // API 없으면 전부 disconnected
        setIntegrations(prev => prev.map(int => ({ ...int, status: 'disconnected' as IntStatus })));
      }
    } catch {
      // 네트워크 오류 시 disconnected
      setIntegrations(prev => prev.map(int => ({ ...int, status: 'disconnected' as IntStatus })));
    }
  }, []);

  useEffect(() => {
    checkIntegrationStatus();
  }, [checkIntegrationStatus]);

  if (!tenant) return null;

  const detail = integrations.find(i => i.id === selected);

  // ─── OAuth 연결 시작 ────────────────────────────────

  const handleOAuthConnect = async (integration: Integration) => {
    if (isDemo) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/integrations/${integration.provider}/auth-url`);
      if (res.ok) {
        const { url } = await res.json();
        window.location.href = url;
      } else {
        // fallback: 직접 auth URL 생성
        if (integration.provider === 'google_calendar') {
          const res2 = await fetch('/api/integrations/google/auth-url');
          if (res2.ok) {
            const { url } = await res2.json();
            window.location.href = url;
          }
        }
      }
    } catch (err) {
      console.error('OAuth 연결 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Webhook 저장 ───────────────────────────────────

  const handleSaveWebhook = async (integration: Integration) => {
    if (isDemo || !webhookInput.trim()) return;
    setLoading(true);

    try {
      // TODO: Supabase에 webhook URL 저장
      setIntegrations(prev => prev.map(i =>
        i.id === integration.id
          ? { ...i, status: 'connected', webhookUrl: webhookInput, lastSync: new Date().toISOString().slice(0, 16).replace('T', ' ') }
          : i
      ));
    } finally {
      setLoading(false);
    }
  };

  // ─── API Key 저장 ──────────────────────────────────

  const handleSaveApiKey = async (integration: Integration) => {
    if (isDemo || !apiKeyInput.trim()) return;
    setLoading(true);

    try {
      // TODO: Supabase에 API Key 저장 (암호화)
      setIntegrations(prev => prev.map(i =>
        i.id === integration.id
          ? { ...i, status: 'connected', apiKey: apiKeyInput.slice(0, 8) + '***', lastSync: new Date().toISOString().slice(0, 16).replace('T', ' ') }
          : i
      ));
    } finally {
      setLoading(false);
    }
  };

  // ─── 연결 해제 ──────────────────────────────────────

  const handleDisconnect = async (integration: Integration) => {
    if (isDemo) return;
    setLoading(true);

    try {
      // TODO: Supabase에서 토큰/키 삭제
      setIntegrations(prev => prev.map(i =>
        i.id === integration.id
          ? { ...i, status: 'disconnected', lastSync: undefined, errorCount: undefined, errorMessage: undefined }
          : i
      ));
    } finally {
      setLoading(false);
    }
  };

  // ─── 동기화 실행 ────────────────────────────────────

  const handleSync = async (integration: Integration) => {
    if (isDemo) return;
    setLoading(true);

    try {
      if (integration.provider === 'google_calendar') {
        const res = await fetch('/api/integrations/google/calendar?action=sync', { method: 'POST' });
        if (res.ok) {
          setIntegrations(prev => prev.map(i =>
            i.id === integration.id
              ? { ...i, lastSync: new Date().toISOString().slice(0, 16).replace('T', ' ') }
              : i
          ));
        }
      }
    } catch (err) {
      console.error('동기화 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  // ─── 렌더링 ─────────────────────────────────────────

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">외부연동</h1>
        <button
          onClick={checkIntegrationStatus}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <RefreshCw size={12} /> 상태 새로고침
        </button>
      </div>

      {isDemo && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 mb-4 text-sm text-amber-300">
          데모 모드입니다. 실제 연동은 수행되지 않습니다.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 서비스 목록 */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.map(int => {
            const cfg = STATUS_CONFIG[int.status];
            const StatusIcon = cfg.icon;
            return (
              <button
                key={int.id}
                onClick={() => {
                  setSelected(int.id);
                  setWebhookInput(int.webhookUrl || '');
                  setApiKeyInput('');
                }}
                className={`w-full text-left rounded-xl border p-4 transition-colors ${
                  selected === int.id
                    ? 'border-indigo-500/30 bg-indigo-500/5'
                    : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
                    {int.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">{int.name}</div>
                    <div className="text-xs text-slate-500 truncate">{int.description}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${cfg.color}`}>
                    <StatusIcon size={10} className={int.status === 'checking' ? 'animate-spin' : ''} />
                    {cfg.label}
                  </span>
                  <div className="flex items-center gap-2">
                    {int.errorCount !== undefined && int.errorCount > 0 && (
                      <span className="text-[10px] text-rose-400 flex items-center gap-0.5">
                        <AlertCircle size={9} /> {int.errorCount}
                      </span>
                    )}
                    {int.lastSync && (
                      <span className="text-[10px] text-slate-600 flex items-center gap-0.5">
                        <Clock size={9} /> {int.lastSync.slice(5)}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* 설정 패널 */}
        <div className="lg:col-span-1">
          {detail ? (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-4 sticky top-4">
              {/* 헤더 */}
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                  {detail.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{detail.name}</h3>
                  <span className={`text-[10px] ${STATUS_CONFIG[detail.status].color}`}>
                    {STATUS_CONFIG[detail.status].label}
                  </span>
                </div>
              </div>

              {/* 기능 목록 */}
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">주요 기능</label>
                <div className="space-y-1">
                  {detail.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Zap size={10} className="text-indigo-400 flex-shrink-0" /> {f}
                    </div>
                  ))}
                </div>
              </div>

              {/* 연결 상태 상세 */}
              {detail.status === 'connected' && detail.lastSync && (
                <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/10 px-3 py-2">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                    <Check size={11} /> 마지막 동기화: {detail.lastSync}
                  </div>
                </div>
              )}

              {/* 에러 상세 */}
              {detail.status === 'error' && detail.errorMessage && (
                <div className="rounded-lg bg-rose-500/5 border border-rose-500/10 px-3 py-2">
                  <div className="text-xs text-rose-400">
                    <div className="flex items-center gap-1 font-semibold mb-0.5">
                      <AlertCircle size={11} /> 오류 발생
                      {detail.errorCount ? ` (${detail.errorCount}회)` : ''}
                    </div>
                    <div className="text-rose-400/70">{detail.errorMessage}</div>
                  </div>
                </div>
              )}

              {/* 연동 타입별 입력 필드 */}
              {detail.status !== 'connected' && (
                <>
                  {/* OAuth 타입: 연결하기 버튼만 */}
                  {detail.type === 'oauth' && (
                    <div className="text-xs text-slate-500">
                      OAuth 인증으로 연결합니다. 아래 버튼을 클릭하면 인증 페이지로 이동합니다.
                    </div>
                  )}

                  {/* Webhook 타입: URL 입력 */}
                  {detail.type === 'webhook' && (
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">웹훅 URL</label>
                      <input
                        value={webhookInput}
                        onChange={e => setWebhookInput(e.target.value)}
                        placeholder="https://hooks.slack.com/services/..."
                        className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm font-mono focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  )}

                  {/* API Key 타입: 키 입력 */}
                  {detail.type === 'apikey' && (
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">API 키</label>
                      <input
                        value={apiKeyInput}
                        onChange={e => setApiKeyInput(e.target.value)}
                        placeholder="API Key 입력"
                        type="password"
                        className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm font-mono focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  )}
                </>
              )}

              {/* 액션 버튼 */}
              <div className="flex gap-2">
                {detail.status === 'connected' ? (
                  <>
                    <button
                      onClick={() => handleDisconnect(detail)}
                      disabled={loading || isDemo}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold bg-rose-600/10 text-rose-400 hover:bg-rose-600/20 transition-colors disabled:opacity-50"
                    >
                      <X size={14} /> 연결 해제
                    </button>
                    <button
                      onClick={() => handleSync(detail)}
                      disabled={loading || isDemo}
                      className="flex items-center justify-center gap-1 rounded-lg border border-white/5 px-3 py-2 text-sm text-slate-400 hover:text-white hover:border-white/10 transition-all disabled:opacity-50"
                    >
                      <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      if (detail.type === 'oauth') handleOAuthConnect(detail);
                      else if (detail.type === 'webhook') handleSaveWebhook(detail);
                      else if (detail.type === 'apikey') handleSaveApiKey(detail);
                    }}
                    disabled={loading || isDemo}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <><RefreshCw size={14} className="animate-spin" /> 연결 중...</>
                    ) : detail.type === 'oauth' ? (
                      <><ExternalLink size={14} /> 연결하기</>
                    ) : (
                      <><Plug size={14} /> 저장 및 연결</>
                    )}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center">
              <Plug size={24} className="mx-auto mb-2 text-slate-700" />
              <p className="text-sm text-slate-500">서비스를 선택하세요</p>
              <p className="text-xs text-slate-600 mt-1">연동 설정 및 상태를 확인합니다</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
