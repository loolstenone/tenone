"use client";

import clsx from "clsx";
import {
    Search, Bell, ChevronDown, ChevronRight, MoreVertical, Users,
} from "lucide-react";
import { divisions } from "@/lib/staff-data";
import * as chatDb from "@/lib/supabase/chat";
import type { StaffMember } from "@/types/staff";
import type { AgentProfileExtended, MessengerServiceHook } from "@/types/messenger";
import {
    currentUserId,
    getStaffInitials,
    activeCrewMembers,
    youinoneMembers,
    allianceMembers,
    madleagueByClub,
    madleagueMembers,
} from "./messenger-data";
import type { ChatThread } from "./messenger-data";
import AgentTab from "./agent-tab";
import ServiceTab from "./service-tab";

interface MessengerSidebarProps {
    activeTab: 'channels' | 'chats' | 'people' | 'agents' | 'services';
    setActiveTab: (v: 'channels' | 'chats' | 'people' | 'agents' | 'services') => void;
    searchQuery: string;
    setSearchQuery: (v: string) => void;
    selectedChat: string | null;
    selectedChannel: chatDb.ChatThread | null;
    setSelectedChannel: (ch: chatDb.ChatThread | null) => void;
    channels: chatDb.ChatThread[];
    filteredChats: ChatThread[];
    filteredStaff: StaffMember[];
    unreadChats: number;
    unreadNotifications: number;
    chatMenuOpen: string | null;
    setChatMenuOpen: (id: string | null) => void;
    editingChatName: string | null;
    setEditingChatName: (id: string | null) => void;
    editChatNameValue: string;
    setEditChatNameValue: (v: string) => void;
    expandedDivisions: Set<string>;
    setExpandedDivisions: React.Dispatch<React.SetStateAction<Set<string>>>;
    expandedDepts: Set<string>;
    setExpandedDepts: React.Dispatch<React.SetStateAction<Set<string>>>;
    expandedCrew: Set<string>;
    setExpandedCrew: React.Dispatch<React.SetStateAction<Set<string>>>;
    expandedCrewSubs: Set<string>;
    setExpandedCrewSubs: React.Dispatch<React.SetStateAction<Set<string>>>;
    mobileView: 'list' | 'chat' | 'profile';
    setMobileView: (v: 'list' | 'chat' | 'profile') => void;
    onSelectChat: (id: string) => void;
    onStartChatWith: (personId: string) => void;
    onShowNewGroupModal: () => void;
    onShowBroadcastModal: () => void;
    onDeleteChat: (id: string) => void;
    onLeaveChat: (id: string) => void;
    onRenameChatConfirm: (id: string) => void;
    // Phase 1: 에이전트/서비스 탭
    agentProfiles: AgentProfileExtended[];
    selectedAgentDM: string | null;
    onSelectAgent: (agent: AgentProfileExtended) => void;
    serviceHooks: MessengerServiceHook[];
    selectedService: string | null;
    onSelectService: (service: MessengerServiceHook) => void;
    serviceUnreadCounts: Record<string, number>;
}

function toggleSet(setter: React.Dispatch<React.SetStateAction<Set<string>>>, key: string) {
    setter(prev => {
        const n = new Set(prev);
        if (n.has(key)) n.delete(key); else n.add(key);
        return n;
    });
}

export default function MessengerSidebar({
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    selectedChat,
    selectedChannel,
    setSelectedChannel,
    channels,
    filteredChats,
    filteredStaff,
    unreadChats,
    unreadNotifications,
    chatMenuOpen,
    setChatMenuOpen,
    editingChatName,
    setEditingChatName,
    editChatNameValue,
    setEditChatNameValue,
    expandedDivisions,
    setExpandedDivisions,
    expandedDepts,
    setExpandedDepts,
    expandedCrew,
    setExpandedCrew,
    expandedCrewSubs,
    setExpandedCrewSubs,
    mobileView,
    setMobileView,
    onSelectChat,
    onStartChatWith,
    onShowNewGroupModal,
    onShowBroadcastModal,
    onDeleteChat,
    onLeaveChat,
    onRenameChatConfirm,
    agentProfiles,
    selectedAgentDM,
    onSelectAgent,
    serviceHooks,
    selectedService,
    onSelectService,
    serviceUnreadCounts,
}: MessengerSidebarProps) {
    const toggleDivision = (id: string) => {
        setExpandedDivisions(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    return (
        <div className={clsx(
            "border-r border-neutral-200 bg-white flex flex-col shrink-0 transition-transform duration-300 ease-in-out",
            // 데스크탑
            "md:w-[260px] md:relative md:translate-x-0",
            // 모바일: 전체 폭, 슬라이드
            "w-full absolute inset-0 z-20",
            mobileView === 'list' ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}>
            {/* 탭 — 5탭: 채널 | 대화 | 에이전트 | 서비스 | 조직도 */}
            <div className="flex border-b border-neutral-200 overflow-x-auto">
                {([
                    { key: 'channels' as const, label: '채널' },
                    { key: 'chats' as const, label: '대화', badge: unreadChats },
                    { key: 'agents' as const, label: 'AI' },
                    { key: 'services' as const, label: '서비스' },
                    { key: 'people' as const, label: '조직도' },
                ]).map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={clsx("flex-1 py-2.5 text-[11px] font-medium transition-colors whitespace-nowrap",
                            activeTab === tab.key ? 'text-neutral-900 border-b-2 border-neutral-900' : 'text-neutral-400'
                        )}>
                        {tab.label}
                        {tab.badge && tab.badge > 0 ? <span className="ml-1 px-1 py-0.5 text-[10px] bg-red-500 text-white rounded-full">{tab.badge}</span> : null}
                    </button>
                ))}
            </div>

            {/* 검색 */}
            <div className="p-2">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-neutral-300" />
                    <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        placeholder="검색..." className="w-full pl-7 pr-3 py-1.5 text-[11px] border border-neutral-200 focus:outline-none focus:border-neutral-400" />
                </div>
            </div>

            {/* 컨텐츠 */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === 'channels' ? (
                    <div>
                        <div className="px-3 py-2 text-[10px] text-neutral-400 uppercase tracking-wider">에이전트 채널</div>
                        {channels.map(ch => (
                            <button key={ch.id}
                                onClick={() => { setSelectedChannel(ch); onSelectChat(''); setMobileView('chat'); }}
                                className={clsx(
                                    "w-full text-left px-3 py-2.5 border-b border-neutral-50 hover:bg-neutral-50 transition-colors",
                                    selectedChannel?.id === ch.id && 'bg-neutral-100'
                                )}>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-neutral-700"># {ch.name}</span>
                                    {ch.agent_name && (
                                        <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded">{ch.agent_name}</span>
                                    )}
                                </div>
                                {ch.description && (
                                    <p className="text-[11px] text-neutral-400 mt-0.5 truncate">{ch.description}</p>
                                )}
                            </button>
                        ))}
                        {channels.length === 0 && (
                            <p className="px-3 py-8 text-center text-xs text-neutral-400">채널이 없습니다</p>
                        )}
                    </div>
                ) : activeTab === 'chats' ? (
                    <div>
                        {/* 그룹 / 일괄 버튼 */}
                        <div className="flex gap-1.5 px-3 py-1.5 border-b border-neutral-100">
                            <button onClick={onShowNewGroupModal}
                                className="flex-1 py-1.5 text-xs font-medium text-neutral-500 border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 transition-colors">
                                + 그룹 채팅
                            </button>
                            <button onClick={onShowBroadcastModal}
                                className="flex-1 py-1.5 text-xs font-medium text-neutral-500 border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 transition-colors">
                                일괄 메시지
                            </button>
                        </div>

                        {/* 알림 */}
                        <button onClick={() => onSelectChat('notifications')}
                            className={clsx("w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors",
                                selectedChat === 'notifications' ? 'bg-neutral-100' : 'hover:bg-neutral-50')}>
                            <div className="h-8 w-8 bg-amber-50 flex items-center justify-center shrink-0">
                                <Bell className="h-3.5 w-3.5 text-amber-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-medium">알림</span>
                                    {unreadNotifications > 0 && <span className="text-[10px] px-1 py-0.5 bg-red-500 text-white rounded-full">{unreadNotifications}</span>}
                                </div>
                                <p className="text-[11px] text-neutral-400 truncate">업무 · 프로젝트 · 결재</p>
                            </div>
                        </button>

                        {/* 채팅 목록 */}
                        {filteredChats.map(chat => {
                            const lastMsg = chat.messages[chat.messages.length - 1];
                            const hasUnread = chat.messages.some(m => !m.read && m.from !== currentUserId);
                            const unreadCount = chat.messages.filter(m => !m.read && m.from !== currentUserId).length;
                            const menuOpen = chatMenuOpen === chat.id;
                            return (
                                <div key={chat.id} className={clsx("relative group flex items-center",
                                    selectedChat === chat.id ? 'bg-neutral-100' : 'hover:bg-neutral-50')}>
                                    {editingChatName === chat.id ? (
                                        <div className="flex-1 px-3 py-2 flex items-center gap-1.5">
                                            <input value={editChatNameValue} onChange={e => setEditChatNameValue(e.target.value)}
                                                autoFocus onKeyDown={e => { if (e.key === 'Enter') onRenameChatConfirm(chat.id); if (e.key === 'Escape') setEditingChatName(null); }}
                                                className="flex-1 px-2 py-1 text-xs border border-neutral-300 focus:outline-none focus:border-neutral-500" />
                                            <button onClick={() => onRenameChatConfirm(chat.id)} className="text-[11px] text-neutral-500 hover:text-neutral-900">확인</button>
                                            <button onClick={() => setEditingChatName(null)} className="text-[11px] text-neutral-400">취소</button>
                                        </div>
                                    ) : (
                                        <>
                                            <button onClick={() => onSelectChat(chat.id)}
                                                className="flex-1 flex items-center gap-2.5 px-3 py-2 text-left min-w-0">
                                                <div className={clsx("h-8 w-8 flex items-center justify-center text-[11px] font-bold shrink-0",
                                                    chat.isGroup ? 'bg-neutral-200 text-neutral-500' : 'bg-neutral-100 text-neutral-400')}>
                                                    {chat.isGroup ? <Users className="h-3.5 w-3.5" /> : getStaffInitials(chat.participants.find(p => p !== currentUserId) || '')}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <span className={clsx("text-[11px] truncate max-w-[120px]", hasUnread ? 'font-bold' : 'font-medium')}>
                                                            {chat.name}
                                                            {chat.isGroup && <span className="text-[10px] text-neutral-300 ml-1">({chat.participants.length})</span>}
                                                        </span>
                                                        <span className="text-[10px] text-neutral-300 shrink-0">{chat.lastActive}</span>
                                                    </div>
                                                    <p className={clsx("text-[11px] truncate", hasUnread ? 'text-neutral-600' : 'text-neutral-400')}>{lastMsg?.text}</p>
                                                </div>
                                                {unreadCount > 0 && (
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-red-500 text-white rounded-full shrink-0 min-w-[18px] text-center">
                                                        {unreadCount}
                                                    </span>
                                                )}
                                            </button>
                                            <button onClick={e => { e.stopPropagation(); setChatMenuOpen(menuOpen ? null : chat.id); }}
                                                className="p-1.5 mr-1 opacity-0 group-hover:opacity-100 hover:bg-neutral-200 transition-all shrink-0">
                                                <MoreVertical className="h-3 w-3 text-neutral-400" />
                                            </button>
                                            {menuOpen && (
                                                <div className="absolute right-2 top-8 z-30 bg-white border border-neutral-200 py-1 w-28"
                                                    onClick={e => e.stopPropagation()}>
                                                    {chat.isGroup && (
                                                        <button onClick={() => { setEditingChatName(chat.id); setEditChatNameValue(chat.name); setChatMenuOpen(null); }}
                                                            className="w-full text-left px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50">이름 수정</button>
                                                    )}
                                                    {chat.isGroup && (
                                                        <button onClick={() => onLeaveChat(chat.id)}
                                                            className="w-full text-left px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50">나가기</button>
                                                    )}
                                                    <button onClick={() => onDeleteChat(chat.id)}
                                                        className="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-red-50">삭제</button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : activeTab === 'agents' ? (
                    <AgentTab
                        agents={agentProfiles}
                        selectedAgentDM={selectedAgentDM}
                        onSelectAgent={onSelectAgent}
                    />
                ) : activeTab === 'services' ? (
                    <ServiceTab
                        services={serviceHooks}
                        selectedService={selectedService}
                        onSelectService={onSelectService}
                        unreadCounts={serviceUnreadCounts}
                    />
                ) : (
                    /* ── 조직도 탭 ── */
                    <div className="py-1">
                        {divisions.map(div => {
                            const divStaff = filteredStaff.filter(s => s.division === div.id);
                            const divExpanded = expandedDivisions.has(div.id);
                            return (
                                <div key={div.id} className="mb-0.5">
                                    <button onClick={() => toggleDivision(div.id)}
                                        className="w-full flex items-center gap-1 px-3 py-1.5 hover:bg-neutral-50">
                                        {divExpanded ? <ChevronDown className="h-3 w-3 text-neutral-400" /> : <ChevronRight className="h-3 w-3 text-neutral-400" />}
                                        <span className="text-xs font-medium text-neutral-600">{div.name}</span>
                                        <span className="text-[10px] text-neutral-300 ml-auto pr-1">{divStaff.length}</span>
                                    </button>
                                    {divExpanded && div.departments.map(dept => {
                                        const deptStaff = divStaff.filter(s => s.department === dept);
                                        if (deptStaff.length === 0) return null;
                                        const deptKey = `people-${div.id}-${dept}`;
                                        const deptExpanded = expandedDepts.has(deptKey);
                                        return (
                                            <div key={dept} className="ml-4">
                                                <button onClick={() => toggleSet(setExpandedDepts, deptKey)}
                                                    className="w-full flex items-center gap-1 px-2 py-1 hover:bg-neutral-50">
                                                    {deptExpanded ? <ChevronDown className="h-2.5 w-2.5 text-neutral-300" /> : <ChevronRight className="h-2.5 w-2.5 text-neutral-300" />}
                                                    <span className="text-[11px] text-neutral-500">{dept}</span>
                                                    <span className="text-[10px] text-neutral-300 ml-auto pr-1">{deptStaff.length}</span>
                                                </button>
                                                {deptExpanded && deptStaff.map(s => (
                                                    <button key={s.id} onClick={() => onStartChatWith(s.id)}
                                                        className="w-full flex items-center gap-2 px-3 py-1 ml-4 text-left hover:bg-neutral-50 transition-colors">
                                                        <div className="h-5 w-5 bg-neutral-100 flex items-center justify-center text-[7px] font-bold text-neutral-400 shrink-0 relative">
                                                            {s.avatarInitials}
                                                            <span className={clsx("absolute -bottom-px -right-px h-1.5 w-1.5 border border-white",
                                                                s.status === 'Active' ? 'bg-green-400' : 'bg-neutral-300')} />
                                                        </div>
                                                        <span className="text-xs truncate">{s.name}</span>
                                                        <span className="text-[10px] text-neutral-300 ml-auto shrink-0">{s.position}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}

                        {/* Crew */}
                        <div className="mt-1 border-t border-neutral-100 pt-1">
                            <button onClick={() => toggleSet(setExpandedCrew, 'crew')}
                                className="w-full flex items-center gap-1 px-3 py-1.5 hover:bg-neutral-50">
                                {expandedCrew.has('crew') ? <ChevronDown className="h-3 w-3 text-neutral-400" /> : <ChevronRight className="h-3 w-3 text-neutral-400" />}
                                <span className="text-xs font-medium text-neutral-600">Crew</span>
                                <span className="text-[10px] text-neutral-300 ml-auto pr-1">{activeCrewMembers.length}명</span>
                            </button>
                            {expandedCrew.has('crew') && (
                                <>
                                    {/* YouInOne */}
                                    {youinoneMembers.length > 0 && (
                                        <div className="ml-4">
                                            <button onClick={() => toggleSet(setExpandedCrewSubs, 'youinone')}
                                                className="w-full flex items-center gap-1 px-2 py-1 hover:bg-neutral-50">
                                                {expandedCrewSubs.has('youinone') ? <ChevronDown className="h-2.5 w-2.5 text-neutral-300" /> : <ChevronRight className="h-2.5 w-2.5 text-neutral-300" />}
                                                <span className="text-[11px] text-neutral-500">YouInOne</span>
                                                <span className="text-[10px] text-neutral-300 ml-auto pr-1">{youinoneMembers.length}</span>
                                            </button>
                                            {expandedCrewSubs.has('youinone') && youinoneMembers.map(p => (
                                                <button key={p.id} onClick={() => onStartChatWith(p.id)}
                                                    className="w-full flex items-center gap-2 px-3 py-1 ml-4 text-left hover:bg-neutral-50 transition-colors">
                                                    <div className="h-5 w-5 bg-neutral-100 flex items-center justify-center text-[7px] font-bold text-neutral-400 shrink-0">
                                                        {p.avatarInitials}
                                                    </div>
                                                    <span className="text-xs truncate">{p.name}</span>
                                                    <span className="text-[10px] text-neutral-300 ml-auto shrink-0">{p.crewRole || ''}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {/* Alliance */}
                                    {allianceMembers.length > 0 && (
                                        <div className="ml-4">
                                            <button onClick={() => toggleSet(setExpandedCrewSubs, 'alliance')}
                                                className="w-full flex items-center gap-1 px-2 py-1 hover:bg-neutral-50">
                                                {expandedCrewSubs.has('alliance') ? <ChevronDown className="h-2.5 w-2.5 text-neutral-300" /> : <ChevronRight className="h-2.5 w-2.5 text-neutral-300" />}
                                                <span className="text-[11px] text-neutral-500">YouInOne Alliance</span>
                                                <span className="text-[10px] text-neutral-300 ml-auto pr-1">{allianceMembers.length}</span>
                                            </button>
                                            {expandedCrewSubs.has('alliance') && allianceMembers.map(p => (
                                                <button key={p.id} onClick={() => onStartChatWith(p.id)}
                                                    className="w-full flex items-center gap-2 px-3 py-1 ml-4 text-left hover:bg-neutral-50 transition-colors">
                                                    <div className="h-5 w-5 bg-neutral-100 flex items-center justify-center text-[7px] font-bold text-neutral-400 shrink-0">
                                                        {p.avatarInitials}
                                                    </div>
                                                    <span className="text-xs truncate">{p.name}</span>
                                                    <span className="text-[10px] text-neutral-300 ml-auto shrink-0">{p.crewRole || ''}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {/* MADLeague */}
                                    {madleagueByClub.length > 0 && (
                                        <div className="ml-4">
                                            <button onClick={() => toggleSet(setExpandedCrewSubs, 'madleague')}
                                                className="w-full flex items-center gap-1 px-2 py-1 hover:bg-neutral-50">
                                                {expandedCrewSubs.has('madleague') ? <ChevronDown className="h-2.5 w-2.5 text-neutral-300" /> : <ChevronRight className="h-2.5 w-2.5 text-neutral-300" />}
                                                <span className="text-[11px] text-neutral-500">MADLeague</span>
                                                <span className="text-[10px] text-neutral-300 ml-auto pr-1">{madleagueMembers.length}</span>
                                            </button>
                                            {expandedCrewSubs.has('madleague') && madleagueByClub.map(({ club, members }) => (
                                                <div key={club.id} className="ml-4">
                                                    <button onClick={() => toggleSet(setExpandedCrewSubs, `mad-${club.id}`)}
                                                        className="w-full flex items-center gap-1 px-2 py-1 hover:bg-neutral-50">
                                                        {expandedCrewSubs.has(`mad-${club.id}`) ? <ChevronDown className="h-2.5 w-2.5 text-neutral-300" /> : <ChevronRight className="h-2.5 w-2.5 text-neutral-300" />}
                                                        <span className="text-[11px] text-neutral-500">{club.name}</span>
                                                        <span className="text-[7px] text-neutral-300 ml-1">{club.region}</span>
                                                        <span className="text-[10px] text-neutral-300 ml-auto pr-1">{members.length}</span>
                                                    </button>
                                                    {expandedCrewSubs.has(`mad-${club.id}`) && members.map(p => (
                                                        <button key={p.id} onClick={() => onStartChatWith(p.id)}
                                                            className="w-full flex items-center gap-2 px-3 py-1 ml-4 text-left hover:bg-neutral-50 transition-colors">
                                                            <div className="h-5 w-5 bg-neutral-100 flex items-center justify-center text-[7px] font-bold text-neutral-400 shrink-0">
                                                                {p.avatarInitials}
                                                            </div>
                                                            <span className="text-xs truncate">{p.name}</span>
                                                            <span className="text-[10px] text-neutral-300 ml-auto shrink-0">{p.crewRole || ''}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
