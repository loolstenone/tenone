'use client';

import { useState, useEffect } from 'react';
import {
  Settings, Palette, Building2, Save, Check, Plus, X,
  ChevronRight, Building, Zap, Clock, Shield,
  Search, GripVertical, UserPlus,
  Undo2, History, Download, Workflow, Blocks, LayoutGrid,
} from 'lucide-react';
import { useWIO } from '../layout';
import OrgTreeBuilder from './OrgTreeBuilder';
import { fetchTenantMembers, updateTenant, inviteMember, updateMemberRole, removeMember } from '@/lib/supabase/wio';
import {
  SERVICE_CATALOG, getModulesByService,
  loadOrbiConfig, saveOrbiConfigDB,
} from '@/lib/wio-modules';
import type { WIOMember } from '@/types/wio';

import {
  TRACKS, MOCK_ORG_TREE, MODULE_BLOCKS, MOCK_ASSIGNED_MODULES,
  APPROVAL_FLOW_TEMPLATE, MOCK_PERMISSION_ROLES,
  type OrgNode, type TrackDef, type PermissionRole, type WfNode, type WfEdge, type WorkflowTemplate,
} from './settings-data';
import ServiceTab from './service-tab';
import WorkflowCanvas from './workflow-canvas';
import PermissionsTab from './permissions-tab';
import ThemeTab from './theme-tab';
import SystemTab from './system-tab';

type SettingsTab = 'settings' | 'permissions' | 'theme' | 'system';
type SettingsMode = 'service' | 'org' | 'module' | 'workflow';

export default function SettingsPage() {
  const { tenant, member, refreshTenant, reloadConfig: reloadSidebar } = useWIO();
  const [tab, setTab] = useState<SettingsTab>('settings');

  // Settings tab state
  const [settingsMode, setSettingsMode] = useState<SettingsMode>('service');
  const [selectedPreset, setSelectedPreset] = useState<string>('full');
  const [enabledServices, setEnabledServices] = useState<string[]>(() => SERVICE_CATALOG.map(s => s.id));
  const [expandedTracks, setExpandedTracks] = useState<string[]>(['track1']);
  const [expandedOrgs, setExpandedOrgs] = useState<string[]>([]);
  const [selectedOrgNode, setSelectedOrgNode] = useState<OrgNode | null>(null);
  const [moduleFilterTrack, setModuleFilterTrack] = useState<string | null>(null);
  const [modulePaletteSearch, setModulePaletteSearch] = useState('');
  const [assignedModules, setAssignedModules] = useState<Record<string, string[]>>(MOCK_ASSIGNED_MODULES);
  const [draggedModule, setDraggedModule] = useState<string | null>(null);
  const [dragOverOrg, setDragOverOrg] = useState<string | null>(null);

  // Workflow state
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate>(APPROVAL_FLOW_TEMPLATE);
  const [selectedWfNode, setSelectedWfNode] = useState<WfNode | null>(null);
  const [selectedWfEdge, setSelectedWfEdge] = useState<WfEdge | null>(null);
  const [testRunning, setTestRunning] = useState(false);
  const [testStep, setTestStep] = useState(-1);

  // Permissions state
  const [permRoles, setPermRoles] = useState<PermissionRole[]>(MOCK_PERMISSION_ROLES);
  const [selectedRole, setSelectedRole] = useState<string>('super-admin');
  const [simUser, setSimUser] = useState('');

  // Theme state
  const [editColor, setEditColor] = useState('#6366F1');

  // System state
  const [editName, setEditName] = useState('');
  const [editServiceName, setEditServiceName] = useState('');
  const [editDomain, setEditDomain] = useState('');
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
  }, [tenant]);

  useEffect(() => {
    if (tenant && tab === 'system' && tenant.id !== 'demo') {
      fetchTenantMembers(tenant.id).then(setMembers);
    }
  }, [tenant, tab]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2000); };

  if (!tenant) return null;
  const isDemo = tenant.id === 'demo';

  // ── Org save ──
  async function saveOrg() {
    if (isDemo) { showToast('데모 모드에서는 저장할 수 없습니다'); return; }
    setSaving(true);
    const ok = await updateTenant(tenant!.id, { name: editName, serviceName: editServiceName, domain: editDomain || null } as Parameters<typeof updateTenant>[1]);
    setSaving(false);
    if (ok) { showToast('저장되었습니다'); refreshTenant?.(); } else showToast('저장 실패');
  }

  // ── Theme save ──
  async function saveTheme() {
    if (isDemo) { showToast('데모 모드에서는 저장할 수 없습니다'); return; }
    setSaving(true);
    const ok = await updateTenant(tenant!.id, { primaryColor: editColor } as Parameters<typeof updateTenant>[1]);
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

  // ── Track / Org tree helpers ──
  function toggleTrack(trackId: string) {
    setExpandedTracks(prev => prev.includes(trackId) ? prev.filter(t => t !== trackId) : [...prev, trackId]);
  }
  function toggleOrg(orgId: string) {
    setExpandedOrgs(prev => prev.includes(orgId) ? prev.filter(o => o !== orgId) : [...prev, orgId]);
  }

  function getAssignedCount(orgId: string): number {
    return assignedModules[orgId]?.length || 0;
  }

  function handleDropModule(orgId: string) {
    if (!draggedModule) return;
    setAssignedModules(prev => {
      const current = prev[orgId] || [];
      if (current.includes(draggedModule)) return prev;
      return { ...prev, [orgId]: [...current, draggedModule] };
    });
    setDraggedModule(null);
    setDragOverOrg(null);
    showToast('모듈 할당됨');
  }

  function removeModuleFromOrg(orgId: string, moduleCode: string) {
    setAssignedModules(prev => {
      const current = prev[orgId] || [];
      return { ...prev, [orgId]: current.filter(c => c !== moduleCode) };
    });
    showToast('모듈 제거됨');
  }

  // ── Workflow test run ──
  function startTestRun() {
    setTestRunning(true);
    setTestStep(0);
    const nodes = selectedTemplate.nodes;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step >= nodes.length) {
        clearInterval(interval);
        setTestRunning(false);
        setTestStep(-1);
        showToast('테스트 실행 완료');
      } else {
        setTestStep(step);
      }
    }, 800);
  }

  // ── Permission handlers ──
  function togglePermission(roleId: string, moduleCode: string, field: 'read' | 'write' | 'delete' | 'admin') {
    setPermRoles(prev => prev.map(r => {
      if (r.id !== roleId) return r;
      const mod = { ...r.modules[moduleCode] };
      mod[field] = !mod[field];
      return { ...r, modules: { ...r.modules, [moduleCode]: mod } };
    }));
  }

  function setDataScope(roleId: string, scope: PermissionRole['dataScope']) {
    setPermRoles(prev => prev.map(r => r.id === roleId ? { ...r, dataScope: scope } : r));
  }

  // ── Org tree renderer ──
  function renderOrgTree(nodes: OrgNode[], depth: number, track: TrackDef): React.ReactNode {
    return nodes.map(node => {
      const isExpanded = expandedOrgs.includes(node.id);
      const isSelected = selectedOrgNode?.id === node.id;
      const isDragOver = dragOverOrg === node.id;
      const assignedCount = getAssignedCount(node.id);

      return (
        <div key={node.id} style={{ paddingLeft: depth * 16 }}>
          <div
            className={`flex items-center gap-2 rounded-lg px-2 py-1.5 cursor-pointer transition-all text-xs
              ${isSelected ? `${track.colorBg} ${track.colorBorder} border` : 'hover:bg-white/5 border border-transparent'}
              ${isDragOver ? 'ring-2 ring-indigo-500/50 bg-indigo-500/10' : ''}`}
            onClick={() => { setSelectedOrgNode(node); if (node.children?.length) toggleOrg(node.id); }}
            onDragOver={e => { e.preventDefault(); setDragOverOrg(node.id); }}
            onDragLeave={() => setDragOverOrg(null)}
            onDrop={e => { e.preventDefault(); handleDropModule(node.id); }}
          >
            {node.children && node.children.length > 0 ? (
              <ChevronRight size={12} className={`text-slate-600 transition-transform shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
            ) : (
              <span className="w-3 shrink-0" />
            )}
            <span className={`text-[9px] px-1 py-0.5 rounded ${track.colorBg} ${track.color}`}>
              {node.type}
            </span>
            <span className="font-medium text-white truncate">{node.name}</span>
            <span className="text-[10px] text-slate-600 ml-auto shrink-0">{node.head}</span>
            <span className="text-[10px] text-slate-600 shrink-0">{node.memberCount}명</span>
            {settingsMode === 'module' && assignedCount > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 shrink-0">
                {assignedCount}
              </span>
            )}
          </div>
          {/* Module pills under org in module mode */}
          {settingsMode === 'module' && isSelected && assignedCount > 0 && (
            <div className="flex flex-wrap gap-1 ml-8 mt-1 mb-1">
              {(assignedModules[node.id] || []).map(code => {
                const block = MODULE_BLOCKS.find(b => b.code === code);
                if (!block) return null;
                return (
                  <div key={code} className="group flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] border border-white/10 bg-white/[0.03]">
                    <div className={`w-1.5 h-1.5 rounded-sm ${block.trackColor}`} />
                    <span className="text-white/70">{block.code}</span>
                    <button onClick={(e) => { e.stopPropagation(); removeModuleFromOrg(node.id, code); }}
                      className="hidden group-hover:block text-slate-600 hover:text-red-400 ml-0.5">
                      <X size={8} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          {isExpanded && node.children && renderOrgTree(node.children, depth + 1, track)}
        </div>
      );
    });
  }

  // ── Track accordion (left panel for module/workflow modes) ──
  function renderTrackAccordion() {
    return (
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {TRACKS.map(track => {
          const isExpanded = expandedTracks.includes(track.id);
          const orgNodes = MOCK_ORG_TREE[track.id] || [];
          return (
            <div key={track.id}>
              <button onClick={() => toggleTrack(track.id)}
                className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors hover:bg-white/5 ${track.color}`}>
                <ChevronRight size={12} className={`text-slate-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                <div className={`w-2 h-2 rounded-full ${track.colorBg.replace('/10', '')}`} />
                {track.name}
                <span className="ml-auto text-[10px] text-slate-600 font-normal">
                  {orgNodes.length > 0 ? `${orgNodes.reduce((sum, n) => sum + n.memberCount, 0)}명` : '-'}
                </span>
              </button>
              {isExpanded && orgNodes.length > 0 && (
                <div className="ml-2 mt-0.5 space-y-0.5">
                  {renderOrgTree(orgNodes, 0, track)}
                </div>
              )}
              {isExpanded && orgNodes.length === 0 && (
                <div className="ml-6 py-2 text-[10px] text-slate-600">조직 없음</div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  const TABS: { id: SettingsTab; label: string; icon: typeof Settings }[] = [
    { id: 'settings', label: '세팅', icon: Settings },
    { id: 'permissions', label: '권한', icon: Shield },
    { id: 'theme', label: '테마', icon: Palette },
    { id: 'system', label: '시스템', icon: Building2 },
  ];

  const MODE_BUTTONS: { id: SettingsMode; label: string; icon: typeof Building; desc: string }[] = [
    { id: 'service', label: '서비스', icon: LayoutGrid, desc: '서비스 활성화' },
    { id: 'org', label: '조직', icon: Building, desc: '조직 구조 설계' },
    { id: 'module', label: '모듈', icon: Blocks, desc: '모듈 배치' },
    { id: 'workflow', label: '워크플로우', icon: Workflow, desc: '업무 흐름 설계' },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">설정</h1>
      <p className="text-xs text-slate-500 mb-5">Orbi 시스템 설정 센터</p>

      {isDemo && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 mb-5 text-sm text-amber-300">
          데모 모드입니다. 변경 사항은 브라우저에 저장됩니다.
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

      {/* ═══════════════════════════════════════════════
          TAB 1: 세팅
          ═══════════════════════════════════════════════ */}
      {tab === 'settings' && (
        <div className="space-y-4">
          {/* Mode toggle buttons */}
          <div className="flex items-center gap-2">
            {MODE_BUTTONS.map((vm) => (
              <button key={vm.id} onClick={() => setSettingsMode(vm.id)}
                className={`flex items-center gap-2 rounded-xl border px-5 py-3 transition-all ${
                  settingsMode === vm.id
                    ? 'border-indigo-500/40 bg-indigo-500/10 ring-1 ring-indigo-500/20'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                }`}>
                <vm.icon size={16} className={settingsMode === vm.id ? 'text-indigo-400' : 'text-slate-500'} />
                <div>
                  <p className={`text-sm font-semibold ${settingsMode === vm.id ? 'text-white' : 'text-slate-400'}`}>{vm.label}</p>
                  <p className="text-[10px] text-slate-600">{vm.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* 서비스 모드 */}
          {settingsMode === 'service' && (
            <ServiceTab
              selectedPreset={selectedPreset}
              setSelectedPreset={setSelectedPreset}
              enabledServices={enabledServices}
              setEnabledServices={setEnabledServices}
              reloadSidebar={reloadSidebar}
              showToast={showToast}
            />
          )}

          {/* 조직 모드 */}
          {settingsMode === 'org' && (
            <OrgTreeBuilder
              tenantId={tenant?.id || 'demo'}
              isDemo={isDemo}
              showToast={showToast}
            />
          )}

          {/* 모듈/워크플로우 모드: 좌우 패널 */}
          {settingsMode !== 'org' && settingsMode !== 'service' && (
            <div className="flex gap-4" style={{ minHeight: 'calc(100vh - 340px)' }}>
              {/* LEFT PANEL: track accordion */}
              <div className={`shrink-0 rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden flex flex-col ${
                settingsMode === 'workflow' ? 'w-[240px]' : 'w-[60%]'
              }`}>
                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">
                    {settingsMode === 'module' ? '조직 + 모듈' : '트랙'}
                  </span>
                </div>
                {renderTrackAccordion()}
              </div>

              {/* RIGHT PANEL */}
              <div className="flex-1 min-w-0 rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden flex flex-col">

                {/* 모듈 모드: Right = Module palette */}
                {settingsMode === 'module' && (
                  <>
                    <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3">
                      <span className="text-xs font-semibold text-slate-400">모듈 팔레트</span>
                      <div className="relative flex-1 max-w-[200px]">
                        <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-600" />
                        <input value={modulePaletteSearch} onChange={e => setModulePaletteSearch(e.target.value)}
                          placeholder="모듈 검색..."
                          className="w-full pl-7 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[11px] text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none" />
                      </div>
                      <div className="flex items-center gap-1 ml-auto">
                        <button onClick={() => setModuleFilterTrack(null)}
                          className={`text-[10px] px-2 py-1 rounded-md transition ${!moduleFilterTrack ? 'bg-indigo-500/15 text-indigo-400' : 'text-slate-500 hover:bg-white/5'}`}>
                          전체
                        </button>
                        {TRACKS.filter(t => t.id !== 'track5').map(t => (
                          <button key={t.id} onClick={() => setModuleFilterTrack(t.id)}
                            className={`text-[10px] px-2 py-1 rounded-md transition ${moduleFilterTrack === t.id ? `${t.colorBg} ${t.color}` : 'text-slate-500 hover:bg-white/5'}`}>
                            {t.name.split(' ').pop()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                      {/* Color legend */}
                      <div className="flex items-center gap-3 mb-4 text-[10px] text-slate-500">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-500" /> 운영</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-green-500" /> 사업</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-orange-500" /> 생산</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-purple-500" /> 지원</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-slate-500" /> 공통</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-rose-500" /> 시스템</span>
                      </div>

                      <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                        {MODULE_BLOCKS
                          .filter(b => !moduleFilterTrack || b.trackId === moduleFilterTrack)
                          .filter(b => !modulePaletteSearch || b.name.includes(modulePaletteSearch) || b.code.includes(modulePaletteSearch.toUpperCase()))
                          .map(block => {
                            const isAssigned = selectedOrgNode && (assignedModules[selectedOrgNode.id] || []).includes(block.code);
                            return (
                              <div key={block.code}
                                draggable
                                onDragStart={() => setDraggedModule(block.code)}
                                onDragEnd={() => { setDraggedModule(null); setDragOverOrg(null); }}
                                onClick={() => {
                                  if (selectedOrgNode && !isAssigned) {
                                    setAssignedModules(prev => ({
                                      ...prev,
                                      [selectedOrgNode.id]: [...(prev[selectedOrgNode.id] || []), block.code],
                                    }));
                                    showToast(`${block.name} 할당됨`);
                                  }
                                }}
                                className={`relative flex flex-col items-center gap-1.5 rounded-xl border p-3 cursor-grab transition-all hover:border-white/20 active:scale-95 ${
                                  isAssigned
                                    ? 'border-indigo-500/30 bg-indigo-500/5 opacity-50'
                                    : 'border-white/5 bg-white/[0.02] hover:bg-white/5'
                                }`}>
                                <div className={`w-3 h-3 rounded-md ${block.trackColor}`} />
                                <span className="text-[11px] font-bold text-white">{block.code}</span>
                                <span className="text-[9px] text-slate-500">{block.name}</span>
                                {isAssigned && (
                                  <span className="absolute top-1 right-1 text-indigo-400">
                                    <Check size={10} />
                                  </span>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </>
                )}

                {/* 워크플로우 모드: WorkflowCanvas component */}
                {settingsMode === 'workflow' && (
                  <WorkflowCanvas
                    selectedTemplate={selectedTemplate}
                    setSelectedTemplate={setSelectedTemplate}
                    selectedWfNode={selectedWfNode}
                    setSelectedWfNode={setSelectedWfNode}
                    selectedWfEdge={selectedWfEdge}
                    setSelectedWfEdge={setSelectedWfEdge}
                    testRunning={testRunning}
                    testStep={testStep}
                    startTestRun={startTestRun}
                  />
                )}
              </div>
            </div>
          )}

          {/* Bottom bar */}
          <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
            <button onClick={() => showToast('저장되었습니다')}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-500 transition">
              <Save size={13} /> 저장
            </button>
            <button onClick={() => showToast('되돌리기 완료')}
              className="flex items-center gap-1.5 px-4 py-2 bg-white/5 text-slate-400 text-xs rounded-lg hover:bg-white/10 transition border border-white/10">
              <Undo2 size={13} /> 되돌리기
            </button>
            <button onClick={() => showToast('변경이력 표시')}
              className="flex items-center gap-1.5 px-4 py-2 bg-white/5 text-slate-400 text-xs rounded-lg hover:bg-white/10 transition border border-white/10">
              <History size={13} /> 변경이력
            </button>
            <button onClick={() => showToast('내보내기 완료')}
              className="flex items-center gap-1.5 px-4 py-2 bg-white/5 text-slate-400 text-xs rounded-lg hover:bg-white/10 transition border border-white/10">
              <Download size={13} /> 내보내기
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          TAB 2: 권한
          ═══════════════════════════════════════════════ */}
      {tab === 'permissions' && (
        <PermissionsTab
          permRoles={permRoles}
          selectedRole={selectedRole}
          setSelectedRole={setSelectedRole}
          simUser={simUser}
          setSimUser={setSimUser}
          togglePermission={togglePermission}
          setDataScope={setDataScope}
          showToast={showToast}
        />
      )}

      {/* ═══════════════════════════════════════════════
          TAB 3: 테마
          ═══════════════════════════════════════════════ */}
      {tab === 'theme' && (
        <ThemeTab
          editColor={editColor}
          setEditColor={setEditColor}
          isDemo={isDemo}
          saving={saving}
          saveTheme={saveTheme}
        />
      )}

      {/* ═══════════════════════════════════════════════
          TAB 4: 시스템
          ═══════════════════════════════════════════════ */}
      {tab === 'system' && (
        <SystemTab
          editName={editName}
          setEditName={setEditName}
          editServiceName={editServiceName}
          setEditServiceName={setEditServiceName}
          editDomain={editDomain}
          setEditDomain={setEditDomain}
          members={members}
          inviteEmail={inviteEmail}
          setInviteEmail={setInviteEmail}
          inviteRole={inviteRole}
          setInviteRole={setInviteRole}
          inviting={inviting}
          saving={saving}
          isDemo={isDemo}
          saveOrg={saveOrg}
          handleInvite={handleInvite}
          handleRoleChange={handleRoleChange}
          handleRemove={handleRemove}
        />
      )}
    </div>
  );
}
