"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import * as chatDb from '@/lib/supabase/chat';
import { initialStaff, divisions } from "@/lib/staff-data";
import {
    Search, Send, ChevronLeft, Bell, MessageSquareText,
    Paperclip, Smile, Pin, Circle, Calendar, Target,
    CheckCheck, AlertCircle, Stamp, FolderKanban, Users, X, Image, FileText, Bot, Loader2,
} from "lucide-react";
import clsx from "clsx";
import { PageHeader } from "@/components/intra/IntraUI";
import type { AgentProfileExtended, MessengerServiceHook, MessengerMessage, ActionButton } from "@/types/messenger";

import {
    Message, ChatThread,
    generateNotifications, generateMockChats,
    todaySchedule, activeProjects, pendingApprovals, emojiGroups,
    currentUserId,
    getStaff, getCrewPerson, getAnyPerson, getStaffName, getStaffInitials, getStaffPosition,
} from "./messenger-data";
import GroupChatModal from "./group-chat-modal";
import BroadcastModal from "./broadcast-modal";
import MessengerSidebar from "./messenger-sidebar";
import ActionCard from "./action-card";
import MentionInput from "./mention-input";

export default function MessengerPage() {
    const { user } = useAuth();

    // 기본 상태
    const [selectedChat, setSelectedChat] = useState<string | null>('c1');
    const [searchQuery, setSearchQuery] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [chats, setChats] = useState<ChatThread[]>([]);
    const [notifications] = useState<Message[]>(generateNotifications);
    const [activeTab, setActiveTab] = useState<'channels' | 'chats' | 'people' | 'agents' | 'services'>('channels');
    const [channels, setChannels] = useState<chatDb.ChatThread[]>([]);
    const [channelMessages, setChannelMessages] = useState<chatDb.ChatMessage[]>([]);
    const [selectedChannel, setSelectedChannel] = useState<chatDb.ChatThread | null>(null);

    // Phase 1: 에이전트 독대 + 서비스
    const [agentDMMessages, setAgentDMMessages] = useState<chatDb.ChatMessage[]>([]);
    const [selectedAgentDM, setSelectedAgentDM] = useState<string | null>(null);
    const [agentDMThreadId, setAgentDMThreadId] = useState<string | null>(null);
    const [agentTyping, setAgentTyping] = useState(false);
    const [serviceHooks, setServiceHooks] = useState<MessengerServiceHook[]>([]);
    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [serviceMessages, setServiceMessages] = useState<chatDb.ChatMessage[]>([]);
    const [serviceThreadId, setServiceThreadId] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [serviceUnreadCounts, setServiceUnreadCounts] = useState<Record<string, number>>({});

    // 모바일 뷰 상태
    const [mobileView, setMobileView] = useState<'list' | 'chat' | 'profile'>('list');

    // UI 토글
    const [showEmoji, setShowEmoji] = useState(false);
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const [showNewGroupModal, setShowNewGroupModal] = useState(false);
    const [showBroadcastModal, setShowBroadcastModal] = useState(false);
    const [chatMenuOpen, setChatMenuOpen] = useState<string | null>(null);
    const [editingChatName, setEditingChatName] = useState<string | null>(null);
    const [editChatNameValue, setEditChatNameValue] = useState('');

    // 조직도 펼침 상태
    const [expandedDivisions, setExpandedDivisions] = useState<Set<string>>(new Set(['Management', 'Business', 'Production', 'Support']));
    const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());
    const [expandedCrew, setExpandedCrew] = useState<Set<string>>(new Set(['crew']));
    const [expandedCrewSubs, setExpandedCrewSubs] = useState<Set<string>>(new Set());

    // 그룹 채팅 모달
    const [groupSelectedMembers, setGroupSelectedMembers] = useState<Set<string>>(new Set());
    const [groupName, setGroupName] = useState('');
    const [groupExpandedDivs, setGroupExpandedDivs] = useState<Set<string>>(new Set());
    const [groupExpandedDepts, setGroupExpandedDepts] = useState<Set<string>>(new Set());

    // 일괄 메시지 모달
    const [broadcastTarget, setBroadcastTarget] = useState<'all' | 'division' | 'department'>('all');
    const [broadcastDivision, setBroadcastDivision] = useState('');
    const [broadcastDept, setBroadcastDept] = useState('');
    const [broadcastMessage, setBroadcastMessage] = useState('');

    // 대화 내 메시지 검색
    const [chatSearchQuery, setChatSearchQuery] = useState('');
    const [showChatSearch, setShowChatSearch] = useState(false);

    // DB 연동 상태
    const [dbLoaded, setDbLoaded] = useState(false);

    // 에이전트 프로필
    const [agentProfiles, setAgentProfiles] = useState<AgentProfileExtended[]>([]);

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const msgCounter = useRef(100);
    const realtimeUnsub = useRef<(() => void) | null>(null);

    // ── DB: 초기 스레드 로드 ──
    useEffect(() => {
        if (!user?.id) return;
        let cancelled = false;
        (async () => {
            try {
                const threads = await chatDb.fetchThreads(user.id);
                if (cancelled) return;
                const converted: ChatThread[] = threads.map(t => ({
                    id: t.id,
                    name: t.name || '대화',
                    participants: t.participants,
                    messages: [],
                    isGroup: t.is_group,
                    lastActive: new Date(t.updated_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
                }));
                setChats(converted);
                setDbLoaded(threads.length > 0);
            } catch {
                setDbLoaded(false);
            }
        })();
        return () => { cancelled = true; };
    }, [user?.id]);

    // ── DB: 채널 로드 ──
    useEffect(() => {
        chatDb.fetchChannels().then(ch => { if (ch.length > 0) setChannels(ch); });
    }, []);

    // ── 에이전트 프로필 로드 ──
    useEffect(() => {
        fetch('/api/agent/profiles').then(r => r.json()).then(data => {
            if (Array.isArray(data)) setAgentProfiles(data);
        }).catch(() => {});
        // 서비스 훅 + 미읽 카운트 로드
        chatDb.fetchServiceHooks().then(hooks => setServiceHooks(hooks));
        chatDb.fetchServiceThreads().then(threads => {
            const counts: Record<string, number> = {};
            Promise.all(threads.map(async t => {
                if (!t.service_name) return;
                const msgs = await chatDb.fetchMessages(t.id, 50);
                const unread = msgs.filter(m =>
                    m.sender_type !== 'human' && !m.read_by?.includes(user?.id || '')
                ).length;
                if (unread > 0) counts[t.service_name] = unread;
            })).then(() => setServiceUnreadCounts(counts));
        });
    }, [user?.id]);

    // 채널 선택 시 메시지 로드
    useEffect(() => {
        if (!selectedChannel) return;
        chatDb.fetchMessages(selectedChannel.id, 100).then(setChannelMessages);
        const unsub = chatDb.subscribeToMessages(selectedChannel.id, (msg) => {
            setChannelMessages(prev => [...prev, msg]);
        });
        return unsub;
    }, [selectedChannel?.id]);

    // ── DB: 전체 스레드 실시간 구독 ──
    useEffect(() => {
        if (!user?.id || !dbLoaded) return;
        const unsub = chatDb.subscribeToAllThreads(user.id, (newMsg) => {
            setChats(prev => prev.map(c => {
                if (c.id !== newMsg.thread_id) return c;
                if (c.messages.some(m => m.id === newMsg.id)) return c;
                const converted: Message = {
                    id: newMsg.id,
                    from: newMsg.sender_id,
                    text: newMsg.content,
                    time: new Date(newMsg.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
                    type: 'chat',
                    read: newMsg.read_by?.includes(user.id) || false,
                };
                return { ...c, messages: [...c.messages, converted], lastActive: converted.time };
            }));
        });
        return () => unsub();
    }, [user?.id, dbLoaded]);

    // ── DB: 스레드 선택 시 메시지 로드 + 개별 구독 + 읽음 처리 ──
    useEffect(() => {
        if (!user?.id || !dbLoaded || !selectedChat || selectedChat === 'notifications') return;
        let cancelled = false;

        if (realtimeUnsub.current) {
            realtimeUnsub.current();
            realtimeUnsub.current = null;
        }

        (async () => {
            try {
                const msgs = await chatDb.fetchMessages(selectedChat);
                if (cancelled) return;
                const converted: Message[] = msgs.map(m => ({
                    id: m.id,
                    from: m.sender_id,
                    text: m.content,
                    time: new Date(m.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
                    type: 'chat' as const,
                    read: m.read_by?.includes(user.id) || false,
                }));
                setChats(prev => prev.map(c =>
                    c.id === selectedChat ? { ...c, messages: converted } : c
                ));
                chatDb.markAsRead(selectedChat, user.id);
            } catch {
                // 에러 시 기존 메시지 유지
            }
        })();

        realtimeUnsub.current = chatDb.subscribeToMessages(selectedChat, (newMsg) => {
            if (cancelled) return;
            setChats(prev => prev.map(c => {
                if (c.id !== selectedChat) return c;
                if (c.messages.some(m => m.id === newMsg.id)) return c;
                const converted: Message = {
                    id: newMsg.id,
                    from: newMsg.sender_id,
                    text: newMsg.content,
                    time: new Date(newMsg.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
                    type: 'chat',
                    read: newMsg.read_by?.includes(user.id) || false,
                };
                return { ...c, messages: [...c.messages, converted], lastActive: converted.time };
            }));
            chatDb.markAsRead(selectedChat, user.id);
        });

        return () => {
            cancelled = true;
            if (realtimeUnsub.current) {
                realtimeUnsub.current();
                realtimeUnsub.current = null;
            }
        };
    }, [selectedChat, user?.id, dbLoaded]);

    // 스크롤 → 최신 메시지
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedChat, chats]);

    // 외부 클릭 시 메뉴 닫기
    useEffect(() => {
        const handler = () => setChatMenuOpen(null);
        if (chatMenuOpen) window.addEventListener('click', handler);
        return () => window.removeEventListener('click', handler);
    }, [chatMenuOpen]);

    if (!user) return null;

    /* ── 파생 데이터 ── */
    const filteredStaff = initialStaff.filter(s =>
        s.id !== currentUserId &&
        (searchQuery === '' || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.department.includes(searchQuery))
    );
    const selectedThread = chats.find(c => c.id === selectedChat);
    const unreadNotifications = notifications.filter(n => !n.read).length;
    const unreadChats = chats.filter(c => c.messages.some(m => !m.read && m.from !== currentUserId)).length;

    const filteredChats = chats.filter(c => {
        if (searchQuery === '') return true;
        const q = searchQuery.toLowerCase();
        if (c.name.toLowerCase().includes(q)) return true;
        if (c.messages.some(m => m.text.toLowerCase().includes(q))) return true;
        if (c.participants.some(p => getStaffName(p).toLowerCase().includes(q))) return true;
        return false;
    });

    const chatSearchResults = selectedThread && chatSearchQuery.trim()
        ? selectedThread.messages.filter(m => m.text.toLowerCase().includes(chatSearchQuery.toLowerCase()))
        : [];

    const chatPartnerId = selectedThread && !selectedThread.isGroup
        ? selectedThread.participants.find(p => p !== currentUserId) || ''
        : '';
    const chatPartnerStaff = getStaff(chatPartnerId);
    const chatPartnerCrew = getCrewPerson(chatPartnerId);
    const chatPartner = chatPartnerStaff
        ? { name: chatPartnerStaff.name, avatarInitials: chatPartnerStaff.avatarInitials, subtitle: `${chatPartnerStaff.department} · ${chatPartnerStaff.position}`, email: chatPartnerStaff.email }
        : chatPartnerCrew
            ? { name: chatPartnerCrew.name, avatarInitials: chatPartnerCrew.avatarInitials, subtitle: chatPartnerCrew.crewRole || chatPartnerCrew.type, email: chatPartnerCrew.email }
            : null;

    const allDepartments = divisions.flatMap(d => d.departments);

    /* ── 액션 핸들러 ── */
    const selectChat = (chatId: string) => {
        setSelectedChat(chatId);
        setSelectedChannel(null);
        setSelectedAgentDM(null);
        setSelectedService(null);
        setChatMenuOpen(null);
        setMobileView('chat');
        if (user?.id && dbLoaded && chatId !== 'notifications') {
            chatDb.markAsRead(chatId, user.id);
        }
    };

    // 에이전트 DM 선택
    const selectAgentDM = async (agent: AgentProfileExtended) => {
        setSelectedChat(null);
        setSelectedChannel(null);
        setSelectedService(null);
        setSelectedAgentDM(agent.name);
        setAgentDMMessages([]);
        setMobileView('chat');

        // 기존 DM 스레드 찾거나 생성
        if (user?.id) {
            const thread = await chatDb.findOrCreateAgentDM({
                userId: user.id,
                agentName: agent.name,
                agentRuntime: (agent.runtime || 'cloud') as 'cloud' | 'local',
            });
            if (thread) {
                setAgentDMThreadId(thread.id);
                const msgs = await chatDb.fetchMessages(thread.id, 100);
                setAgentDMMessages(msgs);
            }
        }
    };

    // 에이전트에게 메시지 전송
    const sendAgentDMMessage = async () => {
        if (!newMessage.trim() || !selectedAgentDM) return;
        const content = newMessage.trim();
        setNewMessage('');

        const agent = agentProfiles.find(a => a.name === selectedAgentDM);
        const userId = user?.id || 'anonymous';
        const userName = user?.name || '나';

        // Optimistic: 사용자 메시지 즉시 표시
        const optimisticMsg: chatDb.ChatMessage = {
            id: `temp-${Date.now()}`,
            thread_id: agentDMThreadId || '',
            sender_id: userId,
            sender_name: userName,
            content,
            type: 'text',
            sender_type: 'human',
            message_format: 'text',
            read_by: [userId],
            created_at: new Date().toISOString(),
        };
        setAgentDMMessages(prev => [...prev, optimisticMsg]);

        // DB에 사용자 메시지 저장
        if (agentDMThreadId) {
            await chatDb.sendMessage({
                threadId: agentDMThreadId,
                senderId: userId,
                senderName: userName,
                content,
            });
        }

        // Agent Hub 호출
        setAgentTyping(true);
        try {
            const res = await fetch('/api/agent/hub', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentName: selectedAgentDM,
                    message: content,
                    userId,
                }),
            });
            const data = await res.json();
            const agentResponse = data.response || data.error || '응답 없음';

            // 에이전트 응답을 DB에 저장하고 UI에 표시
            if (agentDMThreadId) {
                await chatDb.sendAgentMessage({
                    threadId: agentDMThreadId,
                    agentName: selectedAgentDM,
                    content: agentResponse,
                    senderType: agent?.runtime === 'local' ? 'local_agent' : 'agent',
                });
            }

            const agentMsg: chatDb.ChatMessage = {
                id: `agent-${Date.now()}`,
                thread_id: agentDMThreadId || '',
                sender_id: '00000000-0000-0000-0000-000000000000',
                sender_name: agent?.display_name || selectedAgentDM,
                content: agentResponse,
                type: 'text',
                sender_type: agent?.runtime === 'local' ? 'local_agent' : 'agent',
                message_format: 'text',
                read_by: [],
                created_at: new Date().toISOString(),
            };
            setAgentDMMessages(prev => [...prev, agentMsg]);
        } catch {
            const errMsg: chatDb.ChatMessage = {
                id: `err-${Date.now()}`,
                thread_id: agentDMThreadId || '',
                sender_id: 'system',
                sender_name: 'System',
                content: '에이전트 응답을 받지 못했습니다.',
                type: 'system',
                sender_type: 'system',
                message_format: 'text',
                read_by: [],
                created_at: new Date().toISOString(),
            };
            setAgentDMMessages(prev => [...prev, errMsg]);
        } finally {
            setAgentTyping(false);
        }
    };

    // 서비스 선택
    const selectService = async (service: MessengerServiceHook) => {
        setSelectedChat(null);
        setSelectedChannel(null);
        setSelectedAgentDM(null);
        setSelectedService(service.service_name);
        setServiceMessages([]);
        setMobileView('chat');

        // 서비스 스레드 찾기
        const threads = await chatDb.fetchServiceThreads();
        const svcThread = threads.find(t => t.service_name === service.service_name);
        if (svcThread) {
            setServiceThreadId(svcThread.id);
            const msgs = await chatDb.fetchMessages(svcThread.id, 100);
            setServiceMessages(msgs);
        } else {
            setServiceThreadId(null);
        }
    };

    // Action Card 버튼 클릭
    const handleActionClick = async (messageId: string, action: ActionButton) => {
        if (action.type === 'navigate' && action.url) {
            window.location.href = action.url;
            return;
        }
        if (action.type === 'dismiss') {
            chatDb.updateActionStatus(messageId, action.id, user?.id || 'admin');
            // 로컬 업데이트
            setServiceMessages(prev => prev.map(m => {
                if (m.id !== messageId || !m.action_payload) return m;
                return { ...m, action_payload: { ...m.action_payload, status: 'acted', acted_action_id: action.id, acted_at: new Date().toISOString() } };
            }));
            return;
        }

        setActionLoading(messageId);
        try {
            const res = await fetch('/api/messenger/action-callback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message_id: messageId,
                    thread_id: serviceThreadId,
                    action_id: action.id,
                }),
            });
            if (res.ok) {
                // 상태 업데이트
                setServiceMessages(prev => prev.map(m => {
                    if (m.id !== messageId || !m.action_payload) return m;
                    return { ...m, action_payload: { ...m.action_payload, status: 'acted', acted_action_id: action.id, acted_at: new Date().toISOString() } };
                }));
                // 후속 메시지 리로드
                if (serviceThreadId) {
                    const msgs = await chatDb.fetchMessages(serviceThreadId, 100);
                    setServiceMessages(msgs);
                }
            }
        } finally {
            setActionLoading(null);
        }
    };

    // @멘션 위임: 대화 중 @에이전트 메시지 → 에이전트에게 전달
    const handleMentionSend = async (target: { type: string; name: string; displayName: string }, message: string) => {
        if (target.type === "agent") {
            // 현재 대화에 사용자 메시지 표시
            const now = new Date();
            const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
            const msg: Message = {
                id: `msg-${msgCounter.current++}`,
                from: currentUserId,
                text: `@${target.name} ${message}`,
                time: timeStr,
                type: 'chat',
                read: false,
            };
            if (selectedThread) {
                setChats(prev => prev.map(c =>
                    c.id === selectedChat ? { ...c, messages: [...c.messages, msg], lastActive: timeStr } : c
                ));
            }
            setNewMessage('');

            // Agent Hub 호출
            try {
                const res = await fetch('/api/agent/hub', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ agentName: target.name, message, userId: user?.id }),
                });
                const data = await res.json();

                const reply: Message = {
                    id: `msg-${msgCounter.current++}`,
                    from: 'agent',
                    text: `[${target.displayName}] ${data.response || '응답 없음'}`,
                    time: timeStr,
                    type: 'chat',
                    read: false,
                };
                if (selectedThread) {
                    setChats(prev => prev.map(c =>
                        c.id === selectedChat ? { ...c, messages: [...c.messages, reply] } : c
                    ));
                }
            } catch {
                // 에러 무시
            }
        }
    };

    const goMobileBack = () => {
        if (mobileView === 'profile') setMobileView('chat');
        else if (mobileView === 'chat') setMobileView('list');
    };

    const insertEmoji = (emoji: string) => {
        setNewMessage(prev => prev + emoji);
        setShowEmoji(false);
    };

    const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0 || !selectedThread) return;
        const fileNames = Array.from(files).map(f => f.name).join(', ');
        const now = new Date();
        const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
        const msg: Message = {
            id: `msg-${msgCounter.current++}`,
            from: currentUserId,
            text: `📎 파일 첨부: ${fileNames}`,
            time: timeStr,
            type: 'chat',
            read: false,
        };
        setChats(prev => prev.map(c =>
            c.id === selectedChat ? { ...c, messages: [...c.messages, msg], lastActive: timeStr } : c
        ));
        setShowAttachMenu(false);
        e.target.value = '';
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedThread) return;
        const now = new Date();
        const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
        const content = newMessage.trim();

        const optimisticId = `msg-${msgCounter.current++}`;
        const msg: Message = {
            id: optimisticId,
            from: currentUserId,
            text: content,
            time: timeStr,
            type: 'chat',
            read: false,
        };
        setChats(prev => prev.map(c =>
            c.id === selectedChat
                ? { ...c, messages: [...c.messages, msg], lastActive: timeStr }
                : c
        ));
        setNewMessage('');

        if (user?.id && dbLoaded) {
            const sent = await chatDb.sendMessage({
                threadId: selectedThread.id,
                senderId: user.id,
                senderName: user.name || '나',
                content,
            });
            if (sent) {
                setChats(prev => prev.map(c => {
                    if (c.id !== selectedChat) return c;
                    return {
                        ...c,
                        messages: c.messages.map(m =>
                            m.id === optimisticId ? { ...m, id: sent.id } : m
                        ),
                    };
                }));
            }
        } else {
            const threadRef = selectedThread;
            const chatRef = selectedChat;
            setTimeout(() => {
                const otherParticipant = threadRef.participants.find(p => p !== currentUserId);
                if (!otherParticipant) return;
                const replies = [
                    '네, 알겠습니다!', '확인했습니다.', '좋은 생각이에요.', '바로 처리하겠습니다.',
                    '내일까지 정리해서 공유드릴게요.', '감사합니다!', '동의합니다.',
                ];
                const reply: Message = {
                    id: `msg-${msgCounter.current++}`,
                    from: otherParticipant,
                    text: replies[Math.floor(Math.random() * replies.length)],
                    time: timeStr,
                    type: 'chat',
                    read: false,
                };
                setChats(prev => prev.map(c =>
                    c.id === chatRef ? { ...c, messages: [...c.messages, reply] } : c
                ));
            }, 1500);
        }
    };

    const startChatWith = async (personId: string) => {
        const existing = chats.find(c => !c.isGroup && c.participants.includes(personId) && c.participants.includes(currentUserId));
        if (existing) {
            setSelectedChat(existing.id);
        } else if (user?.id && dbLoaded) {
            const person = getAnyPerson(personId);
            const thread = await chatDb.createThread({
                isGroup: false,
                participants: [user.id, personId],
                createdBy: user.id,
            });
            if (thread) {
                const newChat: ChatThread = {
                    id: thread.id,
                    name: person?.name || '새 대화',
                    participants: thread.participants,
                    messages: [],
                    isGroup: false,
                    lastActive: '방금',
                };
                setChats(prev => [newChat, ...prev]);
                setSelectedChat(thread.id);
            }
        } else {
            const person = getAnyPerson(personId);
            const newChat: ChatThread = {
                id: `c-new-${personId}`,
                name: person?.name || '새 대화',
                participants: [currentUserId, personId],
                messages: [],
                isGroup: false,
                lastActive: '방금',
            };
            setChats(prev => [newChat, ...prev]);
            setSelectedChat(newChat.id);
        }
        setActiveTab('chats');
        setMobileView('chat');
    };

    const createGroupChat = async () => {
        if (groupSelectedMembers.size < 1 || !groupName.trim()) return;
        const participants = [currentUserId, ...Array.from(groupSelectedMembers)];
        const name = groupName.trim();

        if (user?.id && dbLoaded) {
            const thread = await chatDb.createThread({
                name,
                isGroup: true,
                participants,
                createdBy: user.id,
            });
            if (thread) {
                const systemMsg: Message = {
                    id: `msg-${msgCounter.current++}`,
                    from: 'system',
                    text: `그룹 채팅이 생성되었습니다. (${participants.length}명)`,
                    time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
                    type: 'chat',
                    read: true,
                };
                const newChat: ChatThread = {
                    id: thread.id,
                    name,
                    participants: thread.participants,
                    messages: [systemMsg],
                    isGroup: true,
                    lastActive: '방금',
                };
                setChats(prev => [newChat, ...prev]);
                setSelectedChat(thread.id);
            }
        } else {
            const newChat: ChatThread = {
                id: `c-group-${Date.now()}`,
                name,
                participants,
                messages: [{
                    id: `msg-${msgCounter.current++}`,
                    from: 'system',
                    text: `그룹 채팅이 생성되었습니다. (${participants.length}명)`,
                    time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
                    type: 'chat',
                    read: true,
                }],
                isGroup: true,
                lastActive: '방금',
            };
            setChats(prev => [newChat, ...prev]);
            setSelectedChat(newChat.id);
        }
        setShowNewGroupModal(false);
        setGroupSelectedMembers(new Set());
        setGroupName('');
        setActiveTab('chats');
        setMobileView('chat');
    };

    const sendBroadcast = () => {
        if (!broadcastMessage.trim()) return;
        let targetStaff: typeof initialStaff = [];
        let label = '';

        if (broadcastTarget === 'all') {
            targetStaff = initialStaff.filter(s => s.id !== currentUserId);
            label = '전 직원';
        } else if (broadcastTarget === 'division' && broadcastDivision) {
            targetStaff = initialStaff.filter(s => s.division === broadcastDivision && s.id !== currentUserId);
            label = divisions.find(d => d.id === broadcastDivision)?.name || broadcastDivision;
        } else if (broadcastTarget === 'department' && broadcastDept) {
            targetStaff = initialStaff.filter(s => s.department === broadcastDept && s.id !== currentUserId);
            label = broadcastDept;
        }
        if (targetStaff.length === 0) return;

        const now = new Date();
        const timeStr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        const newChat: ChatThread = {
            id: `c-broadcast-${Date.now()}`,
            name: `📢 ${label} 공지`,
            participants: [currentUserId, ...targetStaff.map(s => s.id)],
            messages: [{
                id: `msg-${msgCounter.current++}`,
                from: currentUserId,
                text: broadcastMessage.trim(),
                time: timeStr,
                type: 'chat',
                read: false,
            }],
            isGroup: true,
            lastActive: '방금',
        };
        setChats(prev => [newChat, ...prev]);
        setSelectedChat(newChat.id);
        setShowBroadcastModal(false);
        setBroadcastMessage('');
        setBroadcastTarget('all');
        setActiveTab('chats');
        setMobileView('chat');
    };

    const deleteChat = (chatId: string) => {
        setChats(prev => prev.filter(c => c.id !== chatId));
        if (selectedChat === chatId) { setSelectedChat('notifications'); setMobileView('list'); }
        setChatMenuOpen(null);
    };

    const leaveChat = (chatId: string) => {
        setChats(prev => prev.map(c =>
            c.id === chatId
                ? {
                    ...c,
                    participants: c.participants.filter(p => p !== currentUserId),
                    messages: [...c.messages, {
                        id: `msg-${msgCounter.current++}`,
                        from: 'system',
                        text: `${user?.name || '나'}님이 나갔습니다.`,
                        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
                        type: 'chat' as const,
                        read: true,
                    }],
                }
                : c
        ).filter(c => c.participants.length > 1 || !c.isGroup));
        if (selectedChat === chatId) { setSelectedChat('notifications'); setMobileView('list'); }
        setChatMenuOpen(null);
    };

    const renameChatConfirm = (chatId: string) => {
        if (!editChatNameValue.trim()) return;
        setChats(prev => prev.map(c => c.id === chatId ? { ...c, name: editChatNameValue.trim() } : c));
        setEditingChatName(null);
        setEditChatNameValue('');
    };

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       렌더링
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    return (
        <>
        <PageHeader title="메신저" description="팀원 · 조직 · 결재 실시간 소통" />
        <div className="flex overflow-hidden relative border border-neutral-200" style={{ height: "calc(100vh - 240px)", minHeight: 480 }}>

            {/* ══════════════════════════════════
                1열: 대화 목록 / 조직도
               ══════════════════════════════════ */}
            <MessengerSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedChat={selectedChat}
                selectedChannel={selectedChannel}
                setSelectedChannel={setSelectedChannel}
                channels={channels}
                filteredChats={filteredChats}
                filteredStaff={filteredStaff}
                unreadChats={unreadChats}
                unreadNotifications={unreadNotifications}
                chatMenuOpen={chatMenuOpen}
                setChatMenuOpen={setChatMenuOpen}
                editingChatName={editingChatName}
                setEditingChatName={setEditingChatName}
                editChatNameValue={editChatNameValue}
                setEditChatNameValue={setEditChatNameValue}
                expandedDivisions={expandedDivisions}
                setExpandedDivisions={setExpandedDivisions}
                expandedDepts={expandedDepts}
                setExpandedDepts={setExpandedDepts}
                expandedCrew={expandedCrew}
                setExpandedCrew={setExpandedCrew}
                expandedCrewSubs={expandedCrewSubs}
                setExpandedCrewSubs={setExpandedCrewSubs}
                mobileView={mobileView}
                setMobileView={setMobileView}
                onSelectChat={selectChat}
                onStartChatWith={startChatWith}
                onShowNewGroupModal={() => setShowNewGroupModal(true)}
                onShowBroadcastModal={() => setShowBroadcastModal(true)}
                onDeleteChat={deleteChat}
                onLeaveChat={leaveChat}
                onRenameChatConfirm={renameChatConfirm}
                agentProfiles={agentProfiles}
                selectedAgentDM={selectedAgentDM}
                onSelectAgent={selectAgentDM}
                serviceHooks={serviceHooks}
                selectedService={selectedService}
                onSelectService={selectService}
                serviceUnreadCounts={serviceUnreadCounts}
            />

            {/* ══════════════════════════════════
                2열: 대화창
               ══════════════════════════════════ */}
            <div className={clsx(
                "flex-1 flex flex-col bg-neutral-50 min-w-0 max-w-2xl transition-transform duration-300 ease-in-out",
                "md:relative md:translate-x-0",
                "w-full absolute inset-0 z-30",
                mobileView === 'chat' ? 'translate-x-0' : mobileView === 'profile' ? '-translate-x-full' : 'translate-x-full',
                "md:translate-x-0"
            )}>
                {selectedChannel ? (
                    /* ── 채널 뷰 ── */
                    <>
                        <div className="px-4 py-2.5 bg-white border-b border-neutral-200 flex items-center gap-2.5">
                            <button onClick={() => { setSelectedChannel(null); setMobileView('list'); }} className="md:hidden p-1 hover:bg-neutral-100">
                                <ChevronLeft className="h-4 w-4 text-neutral-500" />
                            </button>
                            <span className="text-sm font-medium text-neutral-700"># {selectedChannel.name}</span>
                            {selectedChannel.agent_name && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded">{selectedChannel.agent_name}</span>
                            )}
                        </div>
                        {selectedChannel.description && (
                            <div className="px-4 py-2 bg-white border-b border-neutral-100 text-[11px] text-neutral-400">
                                {selectedChannel.description}
                            </div>
                        )}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {channelMessages.length === 0 && (
                                <p className="text-center text-xs text-neutral-400 py-8">아직 메시지가 없습니다</p>
                            )}
                            {channelMessages.map(msg => (
                                <div key={msg.id} className="flex gap-2.5">
                                    <div className={clsx(
                                        "h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                                        msg.sender_type === 'agent' ? 'bg-neutral-800 text-white' : 'bg-neutral-200 text-neutral-600'
                                    )}>
                                        {msg.sender_type === 'agent' ? 'AI' : (msg.sender_name || '?').slice(0, 1)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={clsx("text-[11px] font-medium", msg.sender_type === 'agent' ? 'text-neutral-800' : 'text-neutral-600')}>
                                                {msg.sender_name || '알 수 없음'}
                                            </span>
                                            <span className="text-[10px] text-neutral-300">
                                                {new Date(msg.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="text-xs text-neutral-700 mt-0.5 whitespace-pre-wrap">{msg.content}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : selectedAgentDM ? (
                    /* ── 에이전트 DM 뷰 ── */
                    (() => {
                        const agent = agentProfiles.find(a => a.name === selectedAgentDM);
                        return (
                            <>
                                <div className="px-4 py-2.5 bg-white border-b border-neutral-200 flex items-center gap-2.5">
                                    <button onClick={() => { setSelectedAgentDM(null); setMobileView('list'); }} className="md:hidden p-1 hover:bg-neutral-100">
                                        <ChevronLeft className="h-4 w-4 text-neutral-500" />
                                    </button>
                                    <div className="relative">
                                        <div className="h-7 w-7 bg-neutral-100 flex items-center justify-center">
                                            <Bot className="h-4 w-4 text-neutral-500" />
                                        </div>
                                        <span className={clsx("absolute -bottom-0.5 -right-0.5 h-2 w-2 border border-white rounded-full",
                                            agent?.runtime === 'local' ? 'bg-neutral-300' : 'bg-green-400'
                                        )} />
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-neutral-700">{agent?.display_name || selectedAgentDM}</span>
                                        <span className="text-[10px] text-neutral-400 ml-2">
                                            {agent?.runtime === 'local' ? 'PC 로컬' : 'Cloud'} · {agent?.agent_type}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {agentDMMessages.length === 0 && !agentTyping && (
                                        <div className="text-center py-12">
                                            <Bot className="h-8 w-8 text-neutral-200 mx-auto mb-3" />
                                            <p className="text-xs text-neutral-400">{agent?.display_name}에게 메시지를 보내보세요</p>
                                            {agent?.runtime === 'local' && (
                                                <div className="mt-4 mx-auto max-w-xs p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                                    <p className="text-[11px] text-amber-700 font-medium">로컬 AI 에이전트</p>
                                                    <p className="text-[10px] text-amber-600 mt-1">
                                                        PC가 켜져 있고 {agent.display_name}이 실행 중이어야 응답합니다.
                                                        오프라인 시 {agent.fallback_agent || '1001'}이 대신 응답합니다.
                                                    </p>
                                                    {agent.fallback_agent && (
                                                        <button
                                                            onClick={() => {
                                                                const fallback = agentProfiles.find(a => a.name === agent.fallback_agent);
                                                                if (fallback) selectAgentDM(fallback);
                                                            }}
                                                            className="mt-2 px-3 py-1 text-[10px] font-medium bg-amber-100 text-amber-800 hover:bg-amber-200 rounded transition-colors"
                                                        >
                                                            {agent.fallback_agent}에게 보내기
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {agentDMMessages.map(msg => (
                                        <div key={msg.id} className={clsx("flex gap-2.5",
                                            msg.sender_type === 'human' ? 'justify-end' : ''
                                        )}>
                                            {msg.sender_type !== 'human' && (
                                                <div className="h-7 w-7 bg-neutral-800 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                                                    AI
                                                </div>
                                            )}
                                            <div className={clsx("max-w-[80%] min-w-0",
                                                msg.sender_type === 'human'
                                                    ? 'bg-neutral-800 text-white px-3 py-2 rounded-lg'
                                                    : msg.sender_type === 'system'
                                                        ? 'text-center text-xs text-neutral-400 w-full'
                                                        : 'bg-white border border-neutral-200 px-3 py-2 rounded-lg'
                                            )}>
                                                <div className="text-xs whitespace-pre-wrap">{msg.content}</div>
                                                <div className={clsx("text-[10px] mt-1",
                                                    msg.sender_type === 'human' ? 'text-neutral-400' : 'text-neutral-300'
                                                )}>
                                                    {new Date(msg.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {agentTyping && (
                                        <div className="flex gap-2.5 items-center">
                                            <div className="h-7 w-7 bg-neutral-800 text-white flex items-center justify-center text-[10px] font-bold shrink-0">AI</div>
                                            <div className="flex items-center gap-1 px-3 py-2 bg-white border border-neutral-200 rounded-lg">
                                                <Loader2 className="h-3 w-3 animate-spin text-neutral-400" />
                                                <span className="text-xs text-neutral-400">응답 중...</span>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                                {/* 입력창 */}
                                <div className="p-3 bg-white border-t border-neutral-200">
                                    <div className="flex items-center gap-2">
                                        <input
                                            value={newMessage}
                                            onChange={e => setNewMessage(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAgentDMMessage(); } }}
                                            placeholder={`${agent?.display_name || selectedAgentDM}에게 메시지...`}
                                            className="flex-1 px-3 py-2 text-xs border border-neutral-200 focus:outline-none focus:border-neutral-400"
                                            disabled={agentTyping}
                                        />
                                        <button
                                            onClick={sendAgentDMMessage}
                                            disabled={!newMessage.trim() || agentTyping}
                                            className="p-2 bg-neutral-900 text-white hover:bg-neutral-800 disabled:bg-neutral-300 transition-colors"
                                        >
                                            <Send className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        );
                    })()
                ) : selectedService ? (
                    /* ── 서비스 뷰 ── */
                    (() => {
                        const svc = serviceHooks.find(s => s.service_name === selectedService);
                        return (
                            <>
                                <div className="px-4 py-2.5 bg-white border-b border-neutral-200 flex items-center gap-2.5">
                                    <button onClick={() => { setSelectedService(null); setMobileView('list'); }} className="md:hidden p-1 hover:bg-neutral-100">
                                        <ChevronLeft className="h-4 w-4 text-neutral-500" />
                                    </button>
                                    <div className="h-7 w-7 flex items-center justify-center rounded" style={{ backgroundColor: `${svc?.color || '#666'}15` }}>
                                        <span className="text-[11px] font-bold" style={{ color: svc?.color || '#666' }}>
                                            {(svc?.display_name || '?')[0]}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-neutral-700">{svc?.display_name || selectedService}</span>
                                        <span className="text-[10px] text-neutral-400 ml-2">{svc?.events.length || 0}개 이벤트</span>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {serviceMessages.length === 0 && (
                                        <div className="text-center py-12">
                                            <p className="text-xs text-neutral-400">{svc?.display_name}에서 아직 알림이 없습니다</p>
                                            <p className="text-[10px] text-neutral-300 mt-1">서비스에서 이벤트가 발생하면 여기에 표시됩니다</p>
                                        </div>
                                    )}
                                    {serviceMessages.map((msg, idx) => {
                                        const isActionCard = msg.message_format === 'action_card' && msg.action_payload;
                                        const prevMsg = idx > 0 ? serviceMessages[idx - 1] : null;
                                        const showCorrelationDivider = msg.correlation_id &&
                                            prevMsg?.correlation_id &&
                                            msg.correlation_id !== prevMsg.correlation_id;
                                        const isNewCorrelation = msg.correlation_id &&
                                            (!prevMsg || prevMsg.correlation_id !== msg.correlation_id);

                                        return (
                                            <div key={msg.id}>
                                                {showCorrelationDivider && (
                                                    <div className="flex items-center gap-2 my-2">
                                                        <div className="flex-1 h-px bg-neutral-200" />
                                                        <span className="text-[9px] text-neutral-300">새 작업 흐름</span>
                                                        <div className="flex-1 h-px bg-neutral-200" />
                                                    </div>
                                                )}
                                                {isNewCorrelation && (
                                                    <div className="mb-1">
                                                        <span className="text-[9px] px-1.5 py-0.5 bg-neutral-100 text-neutral-400 rounded">
                                                            작업 #{msg.correlation_id?.slice(0, 8)}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex gap-2.5">
                                                    <div className="h-7 w-7 rounded flex items-center justify-center text-[10px] font-bold shrink-0"
                                                        style={{ backgroundColor: `${svc?.color || '#666'}15`, color: svc?.color || '#666' }}>
                                                        {(svc?.display_name || '?')[0]}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[11px] font-medium" style={{ color: svc?.color || '#666' }}>
                                                                {msg.sender_name}
                                                            </span>
                                                            <span className="text-[10px] text-neutral-300">
                                                                {new Date(msg.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        {isActionCard ? (
                                                            <div className="mt-1">
                                                                <ActionCard
                                                                    payload={msg.action_payload!}
                                                                    messageId={msg.id}
                                                                    senderName={msg.sender_name}
                                                                    metadata={msg.metadata}
                                                                    onAction={handleActionClick}
                                                                    isLoading={actionLoading === msg.id}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="text-xs text-neutral-700 mt-0.5 whitespace-pre-wrap">{msg.content}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>
                            </>
                        );
                    })()
                ) : selectedChat === 'notifications' ? (
                    /* ── 알림 뷰 ── */
                    <>
                        <div className="px-4 py-2.5 bg-white border-b border-neutral-200 flex items-center gap-2.5">
                            <button onClick={goMobileBack} className="md:hidden p-1 hover:bg-neutral-100">
                                <ChevronLeft className="h-4 w-4 text-neutral-500" />
                            </button>
                            <Bell className="h-4 w-4 text-amber-500" />
                            <h3 className="text-xs font-medium">알림</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
                            {notifications.map(n => (
                                <div key={n.id} className={clsx("flex items-start gap-2.5 p-2.5",
                                    n.read ? 'bg-white' : 'bg-amber-50 border border-amber-100')}>
                                    {!n.read ? <AlertCircle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" /> : <CheckCheck className="h-3.5 w-3.5 text-neutral-300 mt-0.5 shrink-0" />}
                                    <div className="flex-1">
                                        <p className={clsx("text-[11px]", n.read ? 'text-neutral-500' : 'text-neutral-700 font-medium')}>{n.text}</p>
                                        <p className="text-[10px] text-neutral-300 mt-0.5">{n.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : selectedThread ? (
                    /* ── 대화 뷰 ── */
                    <>
                        {/* 헤더 */}
                        <div className="px-4 py-2.5 bg-white border-b border-neutral-200 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <button onClick={goMobileBack} className="md:hidden p-1 hover:bg-neutral-100">
                                    <ChevronLeft className="h-4 w-4 text-neutral-500" />
                                </button>
                                <button
                                    onClick={() => { if (!selectedThread.isGroup && chatPartner) setMobileView('profile'); }}
                                    className={clsx("h-7 w-7 flex items-center justify-center text-[11px] font-bold",
                                        selectedThread.isGroup ? 'bg-neutral-200 text-neutral-500' : 'bg-neutral-100 text-neutral-400',
                                        !selectedThread.isGroup && 'md:cursor-default cursor-pointer'
                                    )}>
                                    {selectedThread.isGroup ? <Users className="h-3.5 w-3.5" /> : getStaffInitials(selectedThread.participants.find(p => p !== currentUserId) || '')}
                                </button>
                                <div>
                                    <h3 className="text-xs font-medium">{selectedThread.name}</h3>
                                    <p className="text-[11px] text-neutral-400">
                                        {selectedThread.isGroup
                                            ? `${selectedThread.participants.length}명 참여`
                                            : getStaffPosition(selectedThread.participants.find(p => p !== currentUserId) || '')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-0.5">
                                <button onClick={() => { setShowChatSearch(!showChatSearch); setChatSearchQuery(''); }}
                                    className={clsx("p-1.5 hover:bg-neutral-100", showChatSearch && 'bg-neutral-100')}>
                                    <Search className="h-3.5 w-3.5 text-neutral-400" />
                                </button>
                                {selectedThread.isGroup && (
                                    <button onClick={() => {
                                        setShowNewGroupModal(true);
                                        setGroupName(selectedThread.name + ' (수정)');
                                        setGroupSelectedMembers(new Set(selectedThread.participants.filter(p => p !== currentUserId)));
                                    }} className="p-1.5 hover:bg-neutral-100" title="멤버 관리">
                                        <Users className="h-3.5 w-3.5 text-neutral-400" />
                                    </button>
                                )}
                                <button className="p-1.5 hover:bg-neutral-100" title="고정">
                                    <Pin className="h-3.5 w-3.5 text-neutral-400" />
                                </button>
                            </div>
                        </div>

                        {/* 대화 내 검색 바 */}
                        {showChatSearch && (
                            <div className="px-4 py-2 bg-white border-b border-neutral-200 flex items-center gap-2">
                                <Search className="h-3 w-3 text-neutral-300 shrink-0" />
                                <input value={chatSearchQuery} onChange={e => setChatSearchQuery(e.target.value)}
                                    placeholder="대화 내 검색..." autoFocus
                                    className="flex-1 text-[11px] focus:outline-none" />
                                {chatSearchQuery && (
                                    <span className="text-[10px] text-neutral-400 shrink-0">{chatSearchResults.length}건</span>
                                )}
                                <button onClick={() => { setShowChatSearch(false); setChatSearchQuery(''); }}
                                    className="p-0.5 hover:bg-neutral-100">
                                    <X className="h-3 w-3 text-neutral-400" />
                                </button>
                            </div>
                        )}

                        {/* 메시지 영역 */}
                        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
                            {selectedThread.messages.map(msg => {
                                const isMe = msg.from === currentUserId;
                                const isSystem = msg.from === 'system';
                                const isHighlighted = chatSearchQuery.trim() && msg.text.toLowerCase().includes(chatSearchQuery.toLowerCase());

                                if (isSystem) {
                                    return (
                                        <div key={msg.id} className="flex justify-center">
                                            <span className="text-[10px] text-neutral-400 bg-neutral-100 px-3 py-1">{msg.text}</span>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={msg.id} className={clsx("flex gap-2", isMe ? 'flex-row-reverse' : '')}>
                                        {!isMe && (
                                            <div className="h-6 w-6 bg-neutral-200 flex items-center justify-center text-[10px] font-bold text-neutral-500 shrink-0 mt-0.5">
                                                {getStaffInitials(msg.from)}
                                            </div>
                                        )}
                                        <div className="max-w-[65%]">
                                            {!isMe && selectedThread.isGroup && (
                                                <p className="text-[10px] text-neutral-400 mb-0.5 ml-1">{getStaffName(msg.from)}</p>
                                            )}
                                            <div className={clsx(
                                                "px-3 py-1.5 text-[11px] leading-relaxed",
                                                isMe ? 'bg-neutral-900 text-white' : 'bg-white border border-neutral-200',
                                                isHighlighted && 'ring-2 ring-amber-300'
                                            )}>
                                                {msg.text}
                                            </div>
                                            <div className={clsx("flex items-center gap-1 mt-0.5", isMe ? 'justify-end' : '')}>
                                                <span className="text-[10px] text-neutral-300">{msg.time}</span>
                                                {isMe && <CheckCheck className={clsx("h-2.5 w-2.5", msg.read ? 'text-blue-400' : 'text-neutral-300')} />}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* 입력 영역 */}
                        <div className="bg-white border-t border-neutral-200">
                            {/* 이모지 피커 */}
                            {showEmoji && (
                                <div className="px-4 py-2.5 border-b border-neutral-100 bg-neutral-50">
                                    {emojiGroups.map(group => (
                                        <div key={group.group} className="mb-2">
                                            <p className="text-[10px] text-neutral-400 mb-1">{group.group}</p>
                                            <div className="flex gap-1 flex-wrap">
                                                {group.items.map(e => (
                                                    <button key={e} onClick={() => insertEmoji(e)}
                                                        className="h-7 w-7 flex items-center justify-center hover:bg-neutral-200 text-sm transition-colors">
                                                        {e}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {/* 첨부 메뉴 */}
                            {showAttachMenu && (
                                <div className="px-4 py-2 border-b border-neutral-100 bg-neutral-50 flex gap-2">
                                    <button onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-neutral-200 hover:bg-white transition-colors">
                                        <FileText className="h-3 w-3 text-neutral-400" /> 파일
                                    </button>
                                    <button onClick={() => { fileInputRef.current?.setAttribute('accept', 'image/*'); fileInputRef.current?.click(); }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-neutral-200 hover:bg-white transition-colors">
                                        <Image className="h-3 w-3 text-neutral-400" /> 이미지
                                    </button>
                                    <button onClick={() => setShowAttachMenu(false)}
                                        className="ml-auto text-[11px] text-neutral-400 hover:text-neutral-600">닫기</button>
                                </div>
                            )}
                            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileAttach} />
                            <div className="px-4 py-2.5 flex items-center gap-1.5">
                                <button onClick={() => { setShowAttachMenu(!showAttachMenu); setShowEmoji(false); }}
                                    className={clsx("p-1.5 transition-colors shrink-0", showAttachMenu ? 'bg-neutral-200' : 'hover:bg-neutral-100')}>
                                    <Paperclip className="h-3.5 w-3.5 text-neutral-400" />
                                </button>
                                <div className="flex-1">
                                    <MentionInput
                                        value={newMessage}
                                        onChange={setNewMessage}
                                        onSend={sendMessage}
                                        onMentionSend={handleMentionSend}
                                        agents={agentProfiles}
                                        services={serviceHooks}
                                        placeholder="메시지 입력... (@로 멘션)"
                                    />
                                </div>
                                <button onClick={() => { setShowEmoji(!showEmoji); setShowAttachMenu(false); }}
                                    className={clsx("p-1.5 transition-colors shrink-0", showEmoji ? 'bg-neutral-200' : 'hover:bg-neutral-100')}>
                                    <Smile className="h-3.5 w-3.5 text-neutral-400" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    /* ── 빈 상태 ── */
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <button onClick={goMobileBack} className="md:hidden mb-4 p-2 hover:bg-neutral-100 mx-auto">
                                <ChevronLeft className="h-4 w-4 text-neutral-400" />
                            </button>
                            <MessageSquareText className="h-10 w-10 text-neutral-200 mx-auto mb-2" />
                            <p className="text-xs text-neutral-400">대화를 선택하세요</p>
                        </div>
                    </div>
                )}
            </div>

            {/* ══════════════════════════════════
                3열: 정보 패널 (프로필 + 일정/프로젝트/결재/GPR)
               ══════════════════════════════════ */}
            <div className={clsx(
                "border-l border-neutral-200 bg-white flex flex-col shrink-0 overflow-y-auto transition-transform duration-300 ease-in-out",
                "md:w-[280px] md:relative md:translate-x-0 md:flex-1",
                "w-full absolute inset-0 z-40",
                mobileView === 'profile' ? 'translate-x-0' : 'translate-x-full',
                "md:translate-x-0"
            )}>
                {/* 모바일 뒤로가기 헤더 */}
                <div className="md:hidden px-4 py-2.5 border-b border-neutral-100 flex items-center gap-2">
                    <button onClick={goMobileBack} className="p-1 hover:bg-neutral-100">
                        <ChevronLeft className="h-4 w-4 text-neutral-500" />
                    </button>
                    <span className="text-xs font-medium">정보</span>
                </div>

                {selectedChannel ? (
                    /* ── 채널 정보 패널 ── */
                    <>
                        <div className="p-4 border-b border-neutral-100">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-semibold text-neutral-800"># {selectedChannel.name}</span>
                                {selectedChannel.thread_type && (
                                    <span className="text-[9px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500 uppercase tracking-wider rounded">
                                        {selectedChannel.thread_type}
                                    </span>
                                )}
                            </div>
                            {selectedChannel.description && (
                                <p className="text-[11px] text-neutral-500 leading-relaxed">{selectedChannel.description}</p>
                            )}
                        </div>

                        {/* 담당 에이전트 */}
                        {selectedChannel.agent_name && (() => {
                            const agent = agentProfiles.find(a => a.name === selectedChannel.agent_name);
                            return (
                                <div className="p-4 border-b border-neutral-100">
                                    <div className="flex items-center gap-1.5 mb-3">
                                        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">담당 에이전트</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-neutral-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                                            AI
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-neutral-800">{agent?.display_name || selectedChannel.agent_name}</p>
                                            {agent?.agent_type && <p className="text-[11px] text-neutral-400 mt-0.5">L{agent.layer} · {agent.agent_type}</p>}
                                            <div className="flex items-center gap-1 mt-1">
                                                <Circle className="h-2 w-2 fill-green-400 text-green-400" />
                                                <span className="text-[10px] text-green-600">활성</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* 최근 채널 활동 */}
                        <div className="p-4 border-b border-neutral-100">
                            <div className="flex items-center gap-1.5 mb-3">
                                <MessageSquareText className="h-3.5 w-3.5 text-neutral-400" />
                                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">최근 활동</span>
                                <span className="text-[10px] text-neutral-300 ml-auto">{channelMessages.length}건</span>
                            </div>
                            {channelMessages.length === 0 ? (
                                <p className="text-[11px] text-neutral-300 text-center py-2">아직 활동 없음</p>
                            ) : (
                                <div className="space-y-2">
                                    {channelMessages.slice(-4).map(msg => (
                                        <div key={msg.id} className="flex items-start gap-2">
                                            <div className={clsx(
                                                "h-5 w-5 flex items-center justify-center text-[8px] font-bold shrink-0 mt-0.5",
                                                msg.sender_type === 'agent' ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-500'
                                            )}>
                                                {msg.sender_type === 'agent' ? 'AI' : (msg.sender_name || '?').slice(0, 1)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10px] font-medium text-neutral-600">{msg.sender_name}</span>
                                                    <span className="text-[9px] text-neutral-300">
                                                        {new Date(msg.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-neutral-500 truncate">{msg.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    /* ── 일반 대화 패널 ── */
                    <>
                        {/* 상대 프로필 (1:1) */}
                        {chatPartner && (
                            <div className="p-4 border-b border-neutral-100 text-center">
                                <div className="h-12 w-12 bg-neutral-100 flex items-center justify-center text-sm font-bold text-neutral-400 mx-auto mb-2">
                                    {chatPartner.avatarInitials}
                                </div>
                                <p className="text-xs font-medium">{chatPartner.name}</p>
                                <p className="text-[11px] text-neutral-400">{chatPartner.subtitle}</p>
                                {chatPartner.email && <p className="text-[11px] text-neutral-300 mt-1">{chatPartner.email}</p>}
                                <div className="flex gap-2 justify-center mt-3">
                                    <button className="px-3 py-1 text-[11px] border border-neutral-200 hover:bg-neutral-50 transition-colors">메시지</button>
                                    <button className="px-3 py-1 text-[11px] border border-neutral-200 hover:bg-neutral-50 transition-colors">프로필</button>
                                </div>
                            </div>
                        )}

                        {/* 그룹 참여자 (그룹 대화 시) */}
                        {selectedThread?.isGroup && (
                            <div className="p-4 border-b border-neutral-100">
                                <div className="flex items-center gap-1.5 mb-3">
                                    <Users className="h-3.5 w-3.5 text-neutral-400" />
                                    <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">참여자</span>
                                    <span className="text-[10px] text-neutral-300 ml-auto">{selectedThread.participants.length}명</span>
                                </div>
                                <div className="space-y-1">
                                    {selectedThread.participants.map(pid => (
                                        <div key={pid} className="flex items-center gap-2 py-1">
                                            <div className="h-5 w-5 bg-neutral-100 flex items-center justify-center text-[7px] font-bold text-neutral-400 shrink-0">
                                                {getStaffInitials(pid)}
                                            </div>
                                            <span className="text-xs truncate">{getStaffName(pid)}</span>
                                            {pid === currentUserId && <span className="text-[10px] text-neutral-300 ml-auto">나</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* 오늘 일정 */}
                <div className="p-4 border-b border-neutral-100">
                    <div className="flex items-center gap-1.5 mb-3">
                        <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">오늘 일정</span>
                    </div>
                    <div className="space-y-2">
                        {todaySchedule.map((s, i) => (
                            <div key={i} className="flex items-start gap-2">
                                <span className="text-[11px] text-neutral-300 w-10 shrink-0 pt-0.5">{s.time}</span>
                                <div>
                                    <p className="text-xs font-medium text-neutral-700">{s.title}</p>
                                    <p className="text-[10px] text-neutral-400">{s.type}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 프로젝트 */}
                <div className="p-4 border-b border-neutral-100">
                    <div className="flex items-center gap-1.5 mb-3">
                        <FolderKanban className="h-3.5 w-3.5 text-neutral-400" />
                        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">프로젝트</span>
                    </div>
                    <div className="space-y-2.5">
                        {activeProjects.map((p, i) => (
                            <div key={i}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-medium text-neutral-700">{p.name}</span>
                                    <span className="text-[10px] text-neutral-400">{p.dday}</span>
                                </div>
                                <div className="h-1 bg-neutral-100">
                                    <div className="h-1 bg-neutral-400 transition-all" style={{ width: `${p.progress}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 결재 대기 */}
                <div className="p-4 border-b border-neutral-100">
                    <div className="flex items-center gap-1.5 mb-3">
                        <Stamp className="h-3.5 w-3.5 text-neutral-400" />
                        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">결재 대기</span>
                        <span className="text-[10px] px-1 py-0.5 bg-red-50 text-red-500 ml-auto">{pendingApprovals.length}</span>
                    </div>
                    <div className="space-y-2">
                        {pendingApprovals.map((a, i) => (
                            <div key={i} className="p-2 border border-neutral-100">
                                <p className="text-xs font-medium text-neutral-700">{a.title}</p>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-[10px] text-neutral-400">{a.from}</span>
                                    <span className="text-[11px] font-medium text-neutral-600">{a.amount}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* GPR */}
                <div className="p-4">
                    <div className="flex items-center gap-1.5 mb-3">
                        <Target className="h-3.5 w-3.5 text-neutral-400" />
                        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">GPR</span>
                    </div>
                    <div className="text-center py-2">
                        <p className="text-2xl font-bold text-neutral-900">38%</p>
                        <p className="text-[11px] text-neutral-400">2026 Q1 달성률</p>
                        <p className="text-[11px] text-neutral-300 mt-1">자기평가 마감 D-3</p>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════
                모달: 그룹 채팅 생성
               ══════════════════════════════════ */}
            {showNewGroupModal && (
                <GroupChatModal
                    groupName={groupName}
                    setGroupName={setGroupName}
                    groupSelectedMembers={groupSelectedMembers}
                    setGroupSelectedMembers={setGroupSelectedMembers}
                    groupExpandedDivs={groupExpandedDivs}
                    setGroupExpandedDivs={setGroupExpandedDivs}
                    groupExpandedDepts={groupExpandedDepts}
                    setGroupExpandedDepts={setGroupExpandedDepts}
                    onClose={() => setShowNewGroupModal(false)}
                    onConfirm={createGroupChat}
                />
            )}

            {/* ══════════════════════════════════
                모달: 일괄 메시지
               ══════════════════════════════════ */}
            {showBroadcastModal && (
                <BroadcastModal
                    broadcastTarget={broadcastTarget}
                    setBroadcastTarget={setBroadcastTarget}
                    broadcastDivision={broadcastDivision}
                    setBroadcastDivision={setBroadcastDivision}
                    broadcastDept={broadcastDept}
                    setBroadcastDept={setBroadcastDept}
                    broadcastMessage={broadcastMessage}
                    setBroadcastMessage={setBroadcastMessage}
                    allDepartments={allDepartments}
                    onClose={() => setShowBroadcastModal(false)}
                    onSend={sendBroadcast}
                />
            )}
        </div>
        </>
    );
}
