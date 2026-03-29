'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Settings, Users, Palette, Building2, Save, Check, Plus, Trash2,
  ChevronUp, ChevronDown, Pencil, ToggleLeft, ToggleRight, Search,
  GitBranch, GripVertical, UserPlus, ArrowRight, ChevronRight,
  Layers, Building, Zap, Clock, Shield, Play, FileText, Wrench,
  User,
} from 'lucide-react';
import { useWIO } from '../layout';
import { fetchTenantMembers, updateTenant, inviteMember, updateMemberRole, removeMember } from '@/lib/supabase/wio';
import {
  CATEGORY_CATALOG, MODULE_CATALOG, getModulesByCategory,
  loadOrbiConfig, saveOrbiConfig,
  type OrbiConfig,
} from '@/lib/wio-modules';
import type { WIOMember } from '@/types/wio';

const ROLE_LABELS: Record<string, string> = {
  owner: '소유자', admin: '관리자', manager: '매니저', member: '멤버', guest: '게스트',
};

type SettingsTab = 'modules' | 'tracks' | 'theme' | 'org' | 'members';

/* ═══════════════════════════════════════════════════════════
   EUS 8.1 — 3-Layer Workflow Mock Data
   ═══════════════════════════════════════════════════════════ */

// Layer 1: 전사 워크플로우
interface CompanyWorkflow {
  id: string;
  name: string;
  trigger: string;
  involvedTracks: string[];
  sla: string;
  status: 'active' | 'draft';
  steps: { order: number; name: string; role: string; track: string }[];
}

const COMPANY_WORKFLOWS: CompanyWorkflow[] = [
  {
    id: 'cw-approval', name: '전자결재', trigger: '결재 요청 시', involvedTracks: ['전 트랙'], sla: '48시간 이내',
    status: 'active',
    steps: [
      { order: 1, name: '기안 작성', role: '담당자', track: '해당 부서' },
      { order: 2, name: '팀장 승인', role: '팀장', track: '해당 부서' },
      { order: 3, name: '본부장 승인', role: '본부장', track: '운영·관리' },
      { order: 4, name: '최종 승인', role: '대표', track: '운영·관리' },
    ],
  },
  {
    id: 'cw-recruit', name: '채용', trigger: '채용 요청 시', involvedTracks: ['운영·관리', '해당 부서'], sla: '30일 이내',
    status: 'active',
    steps: [
      { order: 1, name: '채용 요청', role: '부서장', track: '해당 부서' },
      { order: 2, name: 'JD 작성/공고', role: 'HR 담당', track: '운영·관리' },
      { order: 3, name: '서류 심사', role: 'HR 담당', track: '운영·관리' },
      { order: 4, name: '면접 진행', role: '면접관', track: '해당 부서' },
      { order: 5, name: '최종 합격', role: 'HR 팀장', track: '운영·관리' },
    ],
  },
  {
    id: 'cw-onboard', name: '온보딩', trigger: '입사일 기준', involvedTracks: ['운영·관리', '시스템', '해당 부서'], sla: '입사 후 7일',
    status: 'active',
    steps: [
      { order: 1, name: '계정 생성', role: 'IT 관리자', track: '시스템' },
      { order: 2, name: '장비 지급', role: 'IT 관리자', track: '시스템' },
      { order: 3, name: 'HR 서류', role: 'HR 담당', track: '운영·관리' },
      { order: 4, name: '부서 배정', role: '부서장', track: '해당 부서' },
      { order: 5, name: '멘토 배정', role: '부서장', track: '해당 부서' },
    ],
  },
  {
    id: 'cw-resign', name: '퇴직', trigger: '퇴직 신청 시', involvedTracks: ['운영·관리', '시스템'], sla: '30일 전 통보',
    status: 'active',
    steps: [
      { order: 1, name: '퇴직 신청', role: '본인', track: '해당 부서' },
      { order: 2, name: '면담/인수인계', role: '부서장', track: '해당 부서' },
      { order: 3, name: '계정 정리', role: 'IT 관리자', track: '시스템' },
      { order: 4, name: '퇴직 처리', role: 'HR 담당', track: '운영·관리' },
    ],
  },
  {
    id: 'cw-purchase', name: '구매', trigger: '구매 요청 시', involvedTracks: ['생산', '운영·관리'], sla: '5영업일',
    status: 'active',
    steps: [
      { order: 1, name: '구매 요청', role: '담당자', track: '해당 부서' },
      { order: 2, name: '예산 확인', role: '재무 담당', track: '운영·관리' },
      { order: 3, name: '견적 비교', role: '구매 담당', track: '생산' },
      { order: 4, name: '발주', role: '구매 담당', track: '생산' },
    ],
  },
  {
    id: 'cw-budget', name: '예산', trigger: '분기/연간 예산 편성', involvedTracks: ['전 트랙', '운영·관리'], sla: '분기 시작 1개월 전',
    status: 'active',
    steps: [
      { order: 1, name: '부서별 예산 제출', role: '부서장', track: '전 트랙' },
      { order: 2, name: '검토/조정', role: '재무팀', track: '운영·관리' },
      { order: 3, name: '경영진 승인', role: '대표', track: '운영·관리' },
      { order: 4, name: '배정/집행', role: '재무팀', track: '운영·관리' },
    ],
  },
  {
    id: 'cw-eval', name: '평가', trigger: '평가 기간 도래', involvedTracks: ['전 트랙', '운영·관리'], sla: '평가 기간 2주',
    status: 'active',
    steps: [
      { order: 1, name: '자기 평가', role: '전 직원', track: '전 트랙' },
      { order: 2, name: '동료 평가', role: '전 직원', track: '전 트랙' },
      { order: 3, name: '상사 평가', role: '팀장/본부장', track: '전 트랙' },
      { order: 4, name: '보정/확정', role: 'HR 팀', track: '운영·관리' },
    ],
  },
  {
    id: 'cw-reward', name: '보상', trigger: '평가 확정 후', involvedTracks: ['운영·관리'], sla: '평가 후 1개월',
    status: 'draft',
    steps: [
      { order: 1, name: '보상 기준 설정', role: 'HR 팀', track: '운영·관리' },
      { order: 2, name: '개인별 산정', role: 'HR 팀', track: '운영·관리' },
      { order: 3, name: '경영진 승인', role: '대표', track: '운영·관리' },
      { order: 4, name: '급여 반영', role: '재무팀', track: '운영·관리' },
    ],
  },
  {
    id: 'cw-newprod', name: '신제품출시', trigger: '출시 기획 승인 시', involvedTracks: ['사업', '생산', '지원'], sla: '프로젝트별',
    status: 'draft',
    steps: [
      { order: 1, name: '기획/컨셉', role: '기획팀', track: '사업' },
      { order: 2, name: '디자인/개발', role: '개발/디자인팀', track: '지원' },
      { order: 3, name: '생산/QA', role: '생산팀', track: '생산' },
      { order: 4, name: '마케팅/런칭', role: '마케팅팀', track: '사업' },
    ],
  },
  {
    id: 'cw-compliance', name: '컴플라이언스', trigger: '규정 위반 감지', involvedTracks: ['전 트랙', '운영·관리'], sla: '즉시',
    status: 'active',
    steps: [
      { order: 1, name: '위반 감지/신고', role: '전 직원', track: '전 트랙' },
      { order: 2, name: '조사', role: '법무/감사', track: '운영·관리' },
      { order: 3, name: '시정 조치', role: '해당 부서장', track: '해당 부서' },
      { order: 4, name: '결과 보고', role: '법무/감사', track: '운영·관리' },
    ],
  },
];

// Layer 2: 부서별 워크플로우
interface DeptWorkflow {
  id: string;
  name: string;
  department: string;
  steps: { order: number; name: string; role: string }[];
}

const DEPT_WORKFLOW_MAP: Record<string, DeptWorkflow[]> = {
  '마케팅': [
    { id: 'dw-campaign', name: '캠페인 실행', department: '마케팅',
      steps: [{ order: 1, name: '기획', role: '매니저' }, { order: 2, name: '크리에이티브 제작', role: '디자이너' }, { order: 3, name: '매체 집행', role: '미디어 담당' }, { order: 4, name: '성과 분석', role: '데이터 분석가' }] },
    { id: 'dw-content', name: '콘텐츠 발행', department: '마케팅',
      steps: [{ order: 1, name: '주제 선정', role: '매니저' }, { order: 2, name: '콘텐츠 작성', role: '작성자' }, { order: 3, name: '검수/승인', role: '팀장' }, { order: 4, name: '발행', role: '담당자' }] },
  ],
  '영업': [
    { id: 'dw-deal', name: '딜 프로세스', department: '영업',
      steps: [{ order: 1, name: '리드 발굴', role: '영업 담당' }, { order: 2, name: '니즈 파악', role: '영업 담당' }, { order: 3, name: '제안/견적', role: '영업 매니저' }, { order: 4, name: '계약 체결', role: '영업 팀장' }] },
  ],
  '개발': [
    { id: 'dw-sprint', name: '스프린트', department: '개발',
      steps: [{ order: 1, name: '백로그 정리', role: 'PO' }, { order: 2, name: '스프린트 플래닝', role: '팀 전체' }, { order: 3, name: '개발/리뷰', role: '개발자' }, { order: 4, name: '데모/회고', role: '팀 전체' }] },
    { id: 'dw-incident', name: '장애 대응', department: '개발',
      steps: [{ order: 1, name: '장애 감지', role: '모니터링' }, { order: 2, name: '원인 분석', role: '시니어 개발자' }, { order: 3, name: '핫픽스', role: '개발자' }, { order: 4, name: '포스트모템', role: '팀장' }] },
  ],
  '디자인': [
    { id: 'dw-design-req', name: '디자인 요청', department: '디자인',
      steps: [{ order: 1, name: '요청 접수', role: '디자인 매니저' }, { order: 2, name: '시안 제작', role: '디자이너' }, { order: 3, name: '피드백', role: '요청자' }, { order: 4, name: '최종 납품', role: '디자이너' }] },
  ],
  '생산': [
    { id: 'dw-production', name: '생산 실행', department: '생산',
      steps: [{ order: 1, name: '작업 지시', role: '생산관리자' }, { order: 2, name: '자재 출고', role: '자재 담당' }, { order: 3, name: '생산 실행', role: '작업자' }, { order: 4, name: '검수', role: '품질 담당' }] },
    { id: 'dw-defect', name: '불량 처리', department: '생산',
      steps: [{ order: 1, name: '불량 발견', role: '검사자' }, { order: 2, name: '원인 분석', role: '품질 엔지니어' }, { order: 3, name: '시정 조치', role: '공정 담당' }, { order: 4, name: '재검증', role: '품질 담당' }] },
  ],
  '인사': [
    { id: 'dw-training', name: '교육 운영', department: '인사',
      steps: [{ order: 1, name: '교육 기획', role: 'HR 매니저' }, { order: 2, name: '일정/강사 확정', role: 'HR 담당' }, { order: 3, name: '수강/수료', role: '수강자' }, { order: 4, name: '효과 측정', role: 'HR 매니저' }] },
  ],
  '재무': [
    { id: 'dw-closing', name: '월 마감', department: '재무',
      steps: [{ order: 1, name: '전표 마감', role: '회계 담당' }, { order: 2, name: '계정 조정', role: '회계 담당' }, { order: 3, name: '재무제표 작성', role: '재무 매니저' }, { order: 4, name: '검토/확정', role: '재무 팀장' }] },
  ],
};

const DEPT_LIST = Object.keys(DEPT_WORKFLOW_MAP);

// Layer 3: 업무 도구
const PERSONAL_TOOLS = [
  { key: 'MY-HOME', label: 'My 홈', desc: '개인 대시보드' },
  { key: 'MY-HR',   label: 'My 인사', desc: '급여·근태·증명서' },
  { key: 'MY-EVL',  label: 'My 평가', desc: '내 평가·피드백' },
  { key: 'MY-WRK',  label: 'My 업무', desc: '내 업무 목록' },
  { key: 'MY-APR',  label: 'My 결재', desc: '내 결재 요청/대기' },
];

/* ═══════════════════════════════════════════════════════════ */

export default function SettingsPage() {
  const { tenant, member, refreshTenant, reloadConfig: reloadSidebar } = useWIO();
  const [tab, setTab] = useState<SettingsTab>('modules');

  // Module config
  const [config, setConfig] = useState<OrbiConfig>({ enabledModules: [], categories: [] });
  const [selectedCategory, setSelectedCategory] = useState('track6-common');
  const [editingCategoryName, setEditingCategoryName] = useState<string | null>(null);
  const [categoryNameInput, setCategoryNameInput] = useState('');
  const categoryNameRef = useRef<HTMLInputElement>(null);
  const [moduleSearch, setModuleSearch] = useState('');

  // Track tab — 3 layers
  const [trackLayer, setTrackLayer] = useState<1 | 2 | 3>(1);
  const [expandedWorkflow, setExpandedWorkflow] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState(DEPT_LIST[0]);

  // Theme
  const [editColor, setEditColor] = useState('#6366F1');

  // Org
  const [editName, setEditName] = useState('');
  const [editServiceName, setEditServiceName] = useState('');
  const [editDomain, setEditDomain] = useState('');

  // Members
  const [members, setMembers] = useState<WIOMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviting, setInviting] = useState(false);

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  // Init
  useEffect(() => {
    if (tenant) {
      setEditName(tenant.name);
      setEditServiceName(tenant.serviceName);
      setEditDomain(tenant.domain || '');
      setEditColor(tenant.primaryColor);
    }
    const cfg = loadOrbiConfig();
    setConfig(cfg);
    // if no category configs, initialize
    if (cfg.categories.length === 0) {
      const defaultCats = CATEGORY_CATALOG.map((c, i) => ({
        id: c.id, name: c.name, order: i, enabled: true,
      }));
      setConfig(prev => ({ ...prev, categories: defaultCats }));
    }
  }, [tenant]);

  useEffect(() => {
    if (tenant && tab === 'members' && tenant.id !== 'demo') {
      fetchTenantMembers(tenant.id).then(setMembers);
    }
  }, [tenant, tab]);

  // Focus category name input when editing
  useEffect(() => {
    if (editingCategoryName && categoryNameRef.current) categoryNameRef.current.focus();
  }, [editingCategoryName]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2000); };

  if (!tenant) return null;
  const isDemo = tenant.id === 'demo';

  // ── Module config handlers ──
  function toggleModule(key: string) {
    setConfig(prev => {
      const next = prev.enabledModules.includes(key)
        ? prev.enabledModules.filter(k => k !== key)
        : [...prev.enabledModules, key];
      const updated = { ...prev, enabledModules: next };
      saveOrbiConfig(updated);
      reloadSidebar();
      return updated;
    });
  }

  function enableAllInCategory(categoryId: string) {
    const catMods = getModulesByCategory(categoryId).map(m => m.key);
    setConfig(prev => {
      const next = [...new Set([...prev.enabledModules, ...catMods])];
      const updated = { ...prev, enabledModules: next };
      saveOrbiConfig(updated);
      reloadSidebar();
      return updated;
    });
  }

  function disableAllInCategory(categoryId: string) {
    const catMods = getModulesByCategory(categoryId).map(m => m.key);
    setConfig(prev => {
      const next = prev.enabledModules.filter(k => !catMods.includes(k) || k === 'home');
      const updated = { ...prev, enabledModules: next };
      saveOrbiConfig(updated);
      reloadSidebar();
      return updated;
    });
  }

  function moveCategory(categoryId: string, dir: -1 | 1) {
    setConfig(prev => {
      const sorted = [...prev.categories].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex(c => c.id === categoryId);
      if (idx < 0) return prev;
      const swapIdx = idx + dir;
      if (swapIdx < 0 || swapIdx >= sorted.length) return prev;
      const newOrder = [...sorted];
      [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];
      const updated = {
        ...prev,
        categories: newOrder.map((c, i) => ({ ...c, order: i })),
      };
      saveOrbiConfig(updated);
      reloadSidebar();
      return updated;
    });
  }

  function renameCategory(categoryId: string, newName: string) {
    setConfig(prev => {
      const updated = {
        ...prev,
        categories: prev.categories.map(c => c.id === categoryId ? { ...c, name: newName } : c),
      };
      saveOrbiConfig(updated);
      reloadSidebar();
      return updated;
    });
    setEditingCategoryName(null);
  }

  function getCategoryName(categoryId: string): string {
    const cc = config.categories.find(c => c.id === categoryId);
    if (cc) return cc.name;
    const cat = CATEGORY_CATALOG.find(c => c.id === categoryId);
    return cat?.name || categoryId;
  }

  function enabledCountForCategory(categoryId: string): number {
    const catMods = getModulesByCategory(categoryId).map(m => m.key);
    return config.enabledModules.filter(k => catMods.includes(k)).length;
  }

  // sort categories by order
  const sortedCategories = [...(config.categories.length > 0 ? config.categories : CATEGORY_CATALOG.map((c, i) => ({ id: c.id, name: c.name, order: i, enabled: true })))].sort((a, b) => a.order - b.order);

  // ── Org save ──
  async function saveOrg() {
    if (isDemo) { showToast('데모 모드에서는 저장할 수 없습니다'); return; }
    setSaving(true);
    const ok = await updateTenant(tenant!.id, { name: editName, serviceName: editServiceName, domain: editDomain || null } as any);
    setSaving(false);
    if (ok) { showToast('저장되었습니다'); refreshTenant?.(); } else showToast('저장 실패');
  }

  // ── Theme save ──
  async function saveTheme() {
    if (isDemo) { showToast('데모 모드에서는 저장할 수 없습니다'); return; }
    setSaving(true);
    const ok = await updateTenant(tenant!.id, { primaryColor: editColor } as any);
    setSaving(false);
    if (ok) { showToast('테마 저장됨'); refreshTenant?.(); } else showToast('저장 실패');
  }

  // ── Member handlers ──
  async function handleInvite() {
    if (!inviteEmail || isDemo) return;
    setInviting(true);
    const m = await inviteMember(tenant!.id, inviteEmail, inviteRole);
    setInviting(false);
    if (m) { setMembers(prev => [...prev, m]); setInviteEmail(''); showToast('초대 완료'); }
    else showToast('초대 실패');
  }
  async function handleRoleChange(memberId: string, role: string) {
    const ok = await updateMemberRole(memberId, role);
    if (ok) { setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role } as WIOMember : m)); showToast('역할 변경됨'); }
  }
  async function handleRemove(memberId: string) {
    const ok = await removeMember(memberId);
    if (ok) { setMembers(prev => prev.filter(m => m.id !== memberId)); showToast('멤버 제거됨'); }
  }

  const TABS: { id: SettingsTab; label: string; icon: typeof Settings }[] = [
    { id: 'modules', label: '모듈 설정', icon: Settings },
    { id: 'tracks', label: '트랙 설정', icon: GitBranch },
    { id: 'theme', label: '테마', icon: Palette },
    { id: 'org', label: '조직 정보', icon: Building2 },
    { id: 'members', label: '멤버 관리', icon: Users },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">설정</h1>
      <p className="text-xs text-slate-500 mb-5">Orbi 시스템 설정 센터</p>

      {isDemo && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 mb-5 text-sm text-amber-300">
          데모 모드입니다. 모듈 설정은 브라우저에 저장됩니다.
        </div>
      )}

      {/* Top tabs */}
      <div className="flex gap-1 mb-5 border-b border-white/5 pb-2">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm transition-colors ${tab === t.id ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      {/* ═══ 모듈 설정 ═══ */}
      {tab === 'modules' && (
        <div className="flex gap-5" style={{ minHeight: 'calc(100vh - 220px)' }}>
          {/* Left: Category list */}
          <div className="w-[250px] shrink-0 rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5">
              <span className="text-xs font-semibold text-slate-400">카테고리</span>
            </div>
            <div className="p-2 space-y-0.5">
              {sortedCategories.map((cc, idx) => {
                const catDef = CATEGORY_CATALOG.find(c => c.id === cc.id);
                if (!catDef) return null;
                const CatIcon = catDef.icon;
                const count = enabledCountForCategory(cc.id);
                const isSelected = selectedCategory === cc.id;

                return (
                  <div key={cc.id}
                    className={`group flex items-center gap-2 rounded-lg px-3 py-2.5 cursor-pointer transition-colors ${isSelected ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-400 hover:bg-white/5 hover:text-slate-300'}`}
                    onClick={() => setSelectedCategory(cc.id)}>
                    <CatIcon size={15} className="shrink-0" />
                    <div className="flex-1 min-w-0">
                      {editingCategoryName === cc.id ? (
                        <input ref={categoryNameRef} value={categoryNameInput}
                          onChange={e => setCategoryNameInput(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') renameCategory(cc.id, categoryNameInput); if (e.key === 'Escape') setEditingCategoryName(null); }}
                          onBlur={() => renameCategory(cc.id, categoryNameInput)}
                          className="w-full bg-transparent border-b border-indigo-500 text-sm text-white outline-none py-0"
                          onClick={e => e.stopPropagation()} />
                      ) : (
                        <span className="text-sm truncate block">{cc.name}</span>
                      )}
                    </div>
                    <span className={`text-[10px] ${count > 0 ? 'text-indigo-400' : 'text-slate-600'}`}>{count}</span>
                    {/* Reorder + rename buttons */}
                    <div className="hidden group-hover:flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
                      <button onClick={() => moveCategory(cc.id, -1)} disabled={idx === 0}
                        className="p-0.5 text-slate-600 hover:text-white disabled:opacity-20 transition"><ChevronUp size={12} /></button>
                      <button onClick={() => moveCategory(cc.id, 1)} disabled={idx === sortedCategories.length - 1}
                        className="p-0.5 text-slate-600 hover:text-white disabled:opacity-20 transition"><ChevronDown size={12} /></button>
                      <button onClick={() => { setEditingCategoryName(cc.id); setCategoryNameInput(cc.name); }}
                        className="p-0.5 text-slate-600 hover:text-white transition"><Pencil size={11} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Module catalog for selected category */}
          <div className="flex-1 min-w-0">
            {(() => {
              const catDef = CATEGORY_CATALOG.find(c => c.id === selectedCategory);
              if (!catDef) return null;
              const categoryModules = getModulesByCategory(selectedCategory);
              const allEnabled = categoryModules.every(m => config.enabledModules.includes(m.key));
              const filtered = moduleSearch
                ? categoryModules.filter(m => m.label.includes(moduleSearch) || m.description.includes(moduleSearch) || m.key.includes(moduleSearch))
                : categoryModules;

              return (
                <>
                  {/* Category header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-base font-bold">{getCategoryName(selectedCategory)}</h2>
                      <p className="text-xs text-slate-500 mt-0.5">{categoryModules.length}개 모듈 중 {enabledCountForCategory(selectedCategory)}개 활성</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Search */}
                      <div className="relative">
                        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600" />
                        <input value={moduleSearch} onChange={e => setModuleSearch(e.target.value)} placeholder="검색..."
                          className="pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none w-40" />
                      </div>
                      {/* Toggle all */}
                      <button onClick={() => allEnabled ? disableAllInCategory(selectedCategory) : enableAllInCategory(selectedCategory)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${allEnabled ? 'bg-slate-700/50 text-slate-400 hover:bg-slate-700' : 'bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20'}`}>
                        {allEnabled ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                        {allEnabled ? '전체 해제' : '전체 활성'}
                      </button>
                    </div>
                  </div>

                  {/* Module grid */}
                  <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                    {filtered.map(mod => {
                      const enabled = config.enabledModules.includes(mod.key);
                      const isHome = mod.key === 'home';
                      const Icon = mod.icon;
                      return (
                        <button key={mod.key}
                          onClick={() => !isHome && toggleModule(mod.key)}
                          disabled={isHome}
                          className={`relative flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                            enabled
                              ? 'border-indigo-500/30 bg-indigo-500/5 hover:border-indigo-500/50'
                              : 'border-white/5 bg-white/[0.01] opacity-50 hover:opacity-70 hover:border-white/10'
                          } ${isHome ? 'cursor-default' : 'cursor-pointer'}`}>
                          <div className={`shrink-0 flex h-9 w-9 items-center justify-center rounded-lg ${enabled ? 'bg-indigo-600/15 text-indigo-400' : 'bg-white/5 text-slate-500'}`}>
                            <Icon size={17} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-semibold ${enabled ? 'text-white' : 'text-slate-400'}`}>{mod.label}</span>
                              {isHome && <span className="text-[9px] text-slate-600 border border-slate-700 px-1.5 py-0.5 rounded">필수</span>}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{mod.description}</p>
                          </div>
                          {/* Toggle indicator */}
                          <div className={`absolute top-3 right-3 w-8 h-4.5 rounded-full transition-colors ${enabled ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                            <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform mt-[2px] ${enabled ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* ═══ 트랙 설정 — EUS 8.1 3-Layer 워크플로우 ═══ */}
      {tab === 'tracks' && (
        <div className="space-y-5">
          {/* 3-Layer 관계도 — EUS 8.6 */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Layers size={14} className="text-indigo-400" /> 3-Layer 워크플로우 구조 (EUS 8.1)
            </h3>
            <div className="flex items-stretch gap-3">
              {/* Layer 1 */}
              <button onClick={() => setTrackLayer(1)}
                className={`flex-1 rounded-xl border p-4 text-left transition-all ${trackLayer === 1 ? 'border-indigo-500/40 bg-indigo-500/10 ring-1 ring-indigo-500/20' : 'border-white/10 bg-white/[0.02] hover:border-white/20'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${trackLayer === 1 ? 'bg-indigo-600/30 text-indigo-400' : 'bg-white/5 text-slate-500'}`}>
                    <Building size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Layer 1</p>
                    <p className="text-[10px] text-slate-500">전사 워크플로우</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">경영기획/시스템관리자가 세팅. 전사 공통 프로세스 10종.</p>
                <div className="mt-2 flex items-center gap-1 text-[9px] text-slate-600">
                  <Shield size={9} /> 경영기획·시스템관리자 전용
                </div>
              </button>

              <div className="flex items-center"><ArrowRight size={14} className="text-slate-700" /></div>

              {/* Layer 2 */}
              <button onClick={() => setTrackLayer(2)}
                className={`flex-1 rounded-xl border p-4 text-left transition-all ${trackLayer === 2 ? 'border-violet-500/40 bg-violet-500/10 ring-1 ring-violet-500/20' : 'border-white/10 bg-white/[0.02] hover:border-white/20'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${trackLayer === 2 ? 'bg-violet-600/30 text-violet-400' : 'bg-white/5 text-slate-500'}`}>
                    <GitBranch size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Layer 2</p>
                    <p className="text-[10px] text-slate-500">부서별 워크플로우</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">부서장이 세팅. 부서 고유 업무 프로세스.</p>
                <div className="mt-2 flex items-center gap-1 text-[9px] text-slate-600">
                  <Users size={9} /> 부서장 전용
                </div>
              </button>

              <div className="flex items-center"><ArrowRight size={14} className="text-slate-700" /></div>

              {/* Layer 3 */}
              <button onClick={() => setTrackLayer(3)}
                className={`flex-1 rounded-xl border p-4 text-left transition-all ${trackLayer === 3 ? 'border-emerald-500/40 bg-emerald-500/10 ring-1 ring-emerald-500/20' : 'border-white/10 bg-white/[0.02] hover:border-white/20'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${trackLayer === 3 ? 'bg-emerald-600/30 text-emerald-400' : 'bg-white/5 text-slate-500'}`}>
                    <Wrench size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Layer 3</p>
                    <p className="text-[10px] text-slate-500">업무 도구</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">부서 공통 도구 + 개인 업무 도구.</p>
                <div className="mt-2 flex items-center gap-1 text-[9px] text-slate-600">
                  <User size={9} /> 전 직원
                </div>
              </button>
            </div>
          </div>

          {/* ── Layer 1: 전사 워크플로우 ── */}
          {trackLayer === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold flex items-center gap-2">
                    <Building size={16} className="text-indigo-400" /> 전사 워크플로우
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">경영기획/시스템관리자가 세팅하는 전사 공통 프로세스</p>
                </div>
                <span className="text-[10px] px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {COMPANY_WORKFLOWS.length}개 워크플로우
                </span>
              </div>

              <div className="grid gap-3 grid-cols-1 xl:grid-cols-2">
                {COMPANY_WORKFLOWS.map(wf => {
                  const isExpanded = expandedWorkflow === wf.id;
                  return (
                    <div key={wf.id}
                      className={`rounded-xl border transition-all ${isExpanded ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-white/5 bg-white/[0.02] hover:border-white/10'}`}>
                      {/* Card header */}
                      <button onClick={() => setExpandedWorkflow(isExpanded ? null : wf.id)}
                        className="w-full flex items-center gap-3 p-4 text-left">
                        <div className={`shrink-0 h-9 w-9 rounded-lg flex items-center justify-center ${wf.status === 'active' ? 'bg-indigo-600/15 text-indigo-400' : 'bg-amber-600/15 text-amber-400'}`}>
                          <Zap size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">{wf.name}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${wf.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                              {wf.status === 'active' ? '활성' : '초안'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] text-slate-500 flex items-center gap-1"><Play size={8} /> {wf.trigger}</span>
                            <span className="text-[10px] text-slate-500 flex items-center gap-1"><Clock size={8} /> {wf.sla}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-600">
                          {wf.involvedTracks.map(t => (
                            <span key={t} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5">{t}</span>
                          ))}
                        </div>
                        <ChevronRight size={14} className={`text-slate-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </button>

                      {/* Expanded: step flow */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-0">
                          <div className="border-t border-white/5 pt-3">
                            <p className="text-[10px] text-slate-500 mb-3 font-semibold">단계별 흐름</p>
                            <div className="flex items-center gap-1 overflow-x-auto pb-1">
                              {wf.steps.map((step, si) => (
                                <div key={si} className="flex items-center gap-1 shrink-0">
                                  <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 min-w-[110px]">
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <div className="h-5 w-5 rounded-full bg-indigo-600/20 flex items-center justify-center text-[9px] font-bold text-indigo-400">
                                        {step.order}
                                      </div>
                                      <span className="text-[11px] font-semibold text-white">{step.name}</span>
                                    </div>
                                    <p className="text-[9px] text-slate-500">{step.role}</p>
                                    <p className="text-[9px] text-indigo-400/60">{step.track}</p>
                                  </div>
                                  {si < wf.steps.length - 1 && (
                                    <ArrowRight size={10} className="text-slate-700 shrink-0" />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Layer 2: 부서별 워크플로우 ── */}
          {trackLayer === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold flex items-center gap-2">
                    <GitBranch size={16} className="text-violet-400" /> 부서별 워크플로우
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">부서장이 세팅하는 부서 고유 업무 프로세스</p>
                </div>
              </div>

              {/* Department selector */}
              <div className="flex gap-1 overflow-x-auto pb-1">
                {DEPT_LIST.map(dept => (
                  <button key={dept} onClick={() => setSelectedDept(dept)}
                    className={`shrink-0 px-4 py-2 rounded-lg text-xs transition-colors ${selectedDept === dept ? 'bg-violet-600/15 text-violet-400 font-semibold border border-violet-500/20' : 'text-slate-400 hover:bg-white/5 border border-transparent'}`}>
                    {dept}
                  </button>
                ))}
              </div>

              {/* Workflows for selected department */}
              <div className="space-y-3">
                {(DEPT_WORKFLOW_MAP[selectedDept] || []).map(wf => {
                  const isExpanded = expandedWorkflow === wf.id;
                  return (
                    <div key={wf.id}
                      className={`rounded-xl border transition-all ${isExpanded ? 'border-violet-500/30 bg-violet-500/5' : 'border-white/5 bg-white/[0.02] hover:border-white/10'}`}>
                      <button onClick={() => setExpandedWorkflow(isExpanded ? null : wf.id)}
                        className="w-full flex items-center gap-3 p-4 text-left">
                        <div className="shrink-0 h-9 w-9 rounded-lg flex items-center justify-center bg-violet-600/15 text-violet-400">
                          <GitBranch size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-semibold text-white">{wf.name}</span>
                          <p className="text-[10px] text-slate-500 mt-0.5">{wf.steps.length}단계</p>
                        </div>
                        <ChevronRight size={14} className={`text-slate-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-0">
                          <div className="border-t border-white/5 pt-3">
                            <div className="flex items-center gap-1 overflow-x-auto pb-1">
                              {wf.steps.map((step, si) => (
                                <div key={si} className="flex items-center gap-1 shrink-0">
                                  <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 min-w-[100px]">
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <div className="h-5 w-5 rounded-full bg-violet-600/20 flex items-center justify-center text-[9px] font-bold text-violet-400">
                                        {step.order}
                                      </div>
                                      <span className="text-[11px] font-semibold text-white">{step.name}</span>
                                    </div>
                                    <p className="text-[9px] text-slate-500">{step.role}</p>
                                  </div>
                                  {si < wf.steps.length - 1 && (
                                    <ArrowRight size={10} className="text-slate-700 shrink-0" />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Add workflow button */}
                <button className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 py-4 text-xs text-slate-600 hover:text-slate-400 hover:border-white/20 transition-colors">
                  <Plus size={14} /> 워크플로우 추가
                </button>
              </div>
            </div>
          )}

          {/* ── Layer 3: 업무 도구 ── */}
          {trackLayer === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <Wrench size={16} className="text-emerald-400" /> 업무 도구
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">부서 공통 도구와 개인 업무 도구</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Left: 부서 공통 도구 */}
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                  <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
                    <Building size={14} className="text-emerald-400" /> 부서 공통 도구
                  </h3>
                  <p className="text-[10px] text-slate-500 mb-4">부서장이 모듈 카탈로그에서 선택하여 활성화</p>

                  <div className="space-y-2">
                    {/* Show some representative modules from track2-biz as example */}
                    {MODULE_CATALOG.filter(m => ['mkt-strategy', 'mkt-campaign', 'sales', 'SAL-PIP', 'CRM-CST', 'crm-support', 'BD-PRJ'].includes(m.key)).map(mod => {
                      const Icon = mod.icon;
                      const enabled = config.enabledModules.includes(mod.key);
                      return (
                        <div key={mod.key}
                          className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${enabled ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-white/5 bg-white/[0.01] opacity-50'}`}>
                          <div className={`shrink-0 h-7 w-7 rounded-md flex items-center justify-center ${enabled ? 'bg-emerald-600/15 text-emerald-400' : 'bg-white/5 text-slate-600'}`}>
                            <Icon size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-medium text-white">{mod.label}</span>
                            <p className="text-[9px] text-slate-500">{mod.description}</p>
                          </div>
                          <div className={`w-6 h-3.5 rounded-full transition-colors ${enabled ? 'bg-emerald-600' : 'bg-slate-700'}`}>
                            <div className={`w-2.5 h-2.5 rounded-full bg-white transition-transform mt-[2px] ${enabled ? 'translate-x-[12px]' : 'translate-x-[2px]'}`} />
                          </div>
                        </div>
                      );
                    })}
                    <button className="w-full flex items-center justify-center gap-1 rounded-lg border border-dashed border-white/10 py-2.5 text-[10px] text-slate-600 hover:text-slate-400 hover:border-white/20 transition-colors">
                      <Plus size={11} /> 모듈 카탈로그에서 추가
                    </button>
                  </div>
                </div>

                {/* Right: 개인 업무 도구 */}
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                  <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
                    <User size={14} className="text-sky-400" /> 개인 업무 도구
                  </h3>
                  <p className="text-[10px] text-slate-500 mb-4">전 직원에게 자동으로 제공되는 도구 (비활성화 불가)</p>

                  <div className="space-y-2">
                    {PERSONAL_TOOLS.map(tool => {
                      const mod = MODULE_CATALOG.find(m => m.key === tool.key);
                      const Icon = mod?.icon || User;
                      return (
                        <div key={tool.key}
                          className="flex items-center gap-3 rounded-lg border border-sky-500/15 bg-sky-500/5 px-3 py-2.5">
                          <div className="shrink-0 h-7 w-7 rounded-md flex items-center justify-center bg-sky-600/15 text-sky-400">
                            <Icon size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-medium text-white">{tool.label}</span>
                            <p className="text-[9px] text-slate-500">{tool.desc}</p>
                          </div>
                          <span className="text-[8px] text-sky-500/60 border border-sky-500/15 px-1.5 py-0.5 rounded">자동 제공</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Placeholder notice */}
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-300/80">
            트랙 설정은 현재 미리보기입니다. 워크플로우 편집, 단계 추가/삭제, 권한 연동 기능은 추후 업데이트됩니다.
          </div>
        </div>
      )}

      {/* ═══ 테마 ═══ */}
      {tab === 'theme' && (
        <div className="max-w-2xl space-y-5">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <h2 className="text-sm font-semibold mb-1">앱 컬러 패턴</h2>
            <p className="text-xs text-slate-500 mb-4">브랜드에 맞는 컬러를 선택하세요.</p>
            <div className="grid grid-cols-5 gap-3">
              {[
                { name: 'Indigo',  color: '#6366F1', bg: '#1e1b4b', accent: '#818CF8', desc: '기본' },
                { name: 'Emerald', color: '#10B981', bg: '#022c22', accent: '#34D399', desc: '성장' },
                { name: 'Amber',   color: '#F59E0B', bg: '#1c1917', accent: '#FBBF24', desc: '에너지' },
                { name: 'Rose',    color: '#F43F5E', bg: '#1a0a0e', accent: '#FB7185', desc: '열정' },
                { name: 'Slate',   color: '#64748B', bg: '#0f172a', accent: '#94A3B8', desc: '모던' },
              ].map(p => (
                <button key={p.name} onClick={() => setEditColor(p.color)}
                  className={`relative rounded-xl border p-4 text-center transition-all ${editColor === p.color ? 'border-white/30 ring-1 ring-white/20' : 'border-white/5 hover:border-white/15'}`}>
                  <div className="rounded-lg overflow-hidden mb-3 border border-white/5" style={{ backgroundColor: p.bg }}>
                    <div className="h-2" style={{ backgroundColor: p.color }} />
                    <div className="p-2 space-y-1">
                      <div className="h-1.5 rounded-full w-3/4" style={{ backgroundColor: p.accent, opacity: 0.3 }} />
                      <div className="h-1.5 rounded-full w-1/2" style={{ backgroundColor: p.accent, opacity: 0.15 }} />
                      <div className="flex gap-1 mt-1.5">
                        <div className="h-4 w-4 rounded" style={{ backgroundColor: p.color }} />
                        <div className="h-4 flex-1 rounded" style={{ backgroundColor: `${p.accent}15` }} />
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-semibold" style={{ color: p.color }}>{p.name}</div>
                  <div className="text-[10px] text-slate-500">{p.desc}</div>
                  {editColor === p.color && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: p.color }}>
                      <Check size={10} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5">
              <span className="text-xs text-slate-500">커스텀:</span>
              <input type="color" value={editColor} onChange={e => setEditColor(e.target.value)}
                className="h-7 w-7 rounded cursor-pointer bg-transparent border-0" />
              <input value={editColor} onChange={e => setEditColor(e.target.value)}
                className="w-20 px-2 py-1 bg-white/5 border border-white/10 rounded text-xs font-mono text-slate-400 focus:outline-none" />
            </div>
          </div>
          {!isDemo && (
            <button onClick={saveTheme} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-white text-sm rounded-lg hover:opacity-90 transition disabled:opacity-50"
              style={{ backgroundColor: editColor }}>
              <Save size={14} /> {saving ? '저장 중...' : '테마 저장'}
            </button>
          )}
        </div>
      )}

      {/* ═══ 조직 정보 ═══ */}
      {tab === 'org' && (
        <div className="max-w-lg">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
            <h2 className="text-sm font-semibold mb-2">조직 정보</h2>
            <div>
              <label className="block text-xs text-slate-500 mb-1">조직 이름</label>
              <input value={editName} onChange={e => setEditName(e.target.value)} disabled={isDemo}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">서비스명</label>
              <input value={editServiceName} onChange={e => setEditServiceName(e.target.value)} disabled={isDemo}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">커스텀 도메인</label>
              <input value={editDomain} onChange={e => setEditDomain(e.target.value)} disabled={isDemo} placeholder="example.com"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none disabled:opacity-50" />
            </div>
            {!isDemo && (
              <div className="pt-2">
                <button onClick={saveOrg} disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-500 transition disabled:opacity-50">
                  <Save size={14} /> {saving ? '저장 중...' : '저장'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ 멤버 관리 ═══ */}
      {tab === 'members' && (
        <div className="max-w-2xl space-y-4">
          {isDemo && (
            <div className="rounded-lg border border-slate-700 bg-white/[0.02] px-4 py-6 text-center">
              <Users size={24} className="text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400">로그인 후 멤버를 관리할 수 있습니다.</p>
            </div>
          )}
          {!isDemo && (
            <>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <h3 className="text-sm font-semibold mb-3">멤버 초대</h3>
                <div className="flex gap-2">
                  <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="이메일 주소"
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none" />
                  <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none">
                    <option value="member" className="bg-[#0F0F23]">멤버</option>
                    <option value="manager" className="bg-[#0F0F23]">매니저</option>
                    <option value="admin" className="bg-[#0F0F23]">관리자</option>
                  </select>
                  <button onClick={handleInvite} disabled={inviting || !inviteEmail}
                    className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-500 transition disabled:opacity-50">
                    <Plus size={14} /> {inviting ? '...' : '초대'}
                  </button>
                </div>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
                <div className="px-5 py-3 border-b border-white/5">
                  <span className="text-sm font-semibold">멤버 ({members.length}명)</span>
                </div>
                <div className="divide-y divide-white/5">
                  {members.map((m: any) => (
                    <div key={m.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold">{m.displayName?.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{m.displayName}</div>
                        <div className="text-xs text-slate-500">{m.jobTitle || '-'}</div>
                      </div>
                      {m.role !== 'owner' ? (
                        <div className="flex items-center gap-2">
                          <select value={m.role} onChange={e => handleRoleChange(m.id, e.target.value)}
                            className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white focus:outline-none">
                            {Object.entries(ROLE_LABELS).filter(([k]) => k !== 'owner').map(([k, v]) => (
                              <option key={k} value={k} className="bg-[#0F0F23]">{v}</option>
                            ))}
                          </select>
                          <button onClick={() => handleRemove(m.id)} className="p-1 text-slate-600 hover:text-red-400 transition">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-violet-400 bg-violet-500/10">
                          {ROLE_LABELS[m.role]}
                        </span>
                      )}
                    </div>
                  ))}
                  {members.length === 0 && <p className="text-center py-6 text-slate-500 text-sm">멤버가 없습니다.</p>}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
