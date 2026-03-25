"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import * as chatDb from '@/lib/supabase/chat';
import { initialStaff, divisions } from "@/lib/staff-data";
import { initialPeople, madleagueClubs } from "@/lib/people-data";
import {
    Search, Send, ChevronDown, ChevronRight, ChevronLeft, Bell, MessageSquareText,
    Paperclip, Smile, MoreVertical, Pin, Circle, Calendar, Target,
    CheckCheck, AlertCircle, Stamp, FolderKanban, Users, X, Image, FileText
} from "lucide-react";
import clsx from "clsx";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   데이터 준비
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const activeCrewMembers = initialPeople.filter(p => p.category === 'crew' && p.membershipStatus === 'active');
const youinoneMembers = activeCrewMembers.filter(p => p.type === 'youinone');
const allianceMembers = activeCrewMembers.filter(p => p.type === 'youinone-alliance');
const madleagueMembers = activeCrewMembers.filter(p => p.type === 'madleague-leader' || p.type === 'madleague-member');
const madleagueByClub = madleagueClubs.map(club => ({
    club,
    members: madleagueMembers.filter(m => m.clubId === club.id),
})).filter(g => g.members.length > 0);

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   타입 정의
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
interface Message {
    id: string;
    from: string;
    text: string;
    time: string;
    type: 'chat' | 'notification';
    read: boolean;
}

interface ChatThread {
    id: string;
    name: string;
    participants: string[];
    messages: Message[];
    isGroup: boolean;
    lastActive: string;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Mock 데이터 생성
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function generateNotifications(): Message[] {
    return [
        { id: 'n1', from: 'system', text: 'GPR 2026 Q1 자기평가 마감 D-3', time: '09:00', type: 'notification', read: false },
        { id: 'n2', from: 'system', text: '결재 요청: MADLeague 인사이트 투어링 예산 품의', time: '09:15', type: 'notification', read: false },
        { id: 'n3', from: 'system', text: '프로젝트 LUKI 2nd Single: 뮤직비디오 촬영 D-5', time: '어제', type: 'notification', read: true },
        { id: 'n4', from: 'system', text: '오늘 14:00 주간 팀 회의', time: '08:30', type: 'notification', read: true },
        { id: 'n5', from: 'system', text: 'Badak 3월 밋업 참석자 18/25명', time: '어제', type: 'notification', read: true },
    ];
}

function generateMockChats(): ChatThread[] {
    return [
        {
            id: 'c1', name: 'Sarah Kim', participants: ['s1', 's2'], isGroup: false, lastActive: '10:32',
            messages: [
                { id: 'm1', from: 's2', text: '대표님, LUKI 2nd Single 컨셉 회의 일정 잡았습니다. 내일 오후 2시 어떠세요?', time: '10:15', type: 'chat', read: true },
                { id: 'm2', from: 's1', text: '좋아요. 김콘텐 팀장도 같이 참석하도록 해주세요.', time: '10:20', type: 'chat', read: true },
                { id: 'm3', from: 's2', text: '네, 콘텐츠팀이랑 AI팀도 같이 부를게요. 회의실 예약하겠습니다.', time: '10:32', type: 'chat', read: false },
            ],
        },
        {
            id: 'c2', name: '김준호', participants: ['s1', 's20'], isGroup: false, lastActive: '09:45',
            messages: [
                { id: 'm4', from: 's20', text: 'MADLeap 5기 1차 정기모임 참석자 30명 확정했습니다!', time: '09:30', type: 'chat', read: true },
                { id: 'm5', from: 's1', text: '수고했어요. 모임 장소는 어디로 잡았어요?', time: '09:35', type: 'chat', read: true },
                { id: 'm6', from: 's20', text: '성수동 위워크 4층 세미나룸이요. 케이터링도 진행 예정입니다.', time: '09:45', type: 'chat', read: true },
            ],
        },
        {
            id: 'c3', name: '경영진 회의', participants: ['s1', 's2', 's3', 's4'], isGroup: true, lastActive: '어제',
            messages: [
                { id: 'm7', from: 's3', text: '이번 달 신규 채용 2명 진행 중입니다.', time: '16:00', type: 'chat', read: true },
                { id: 'm8', from: 's4', text: '3월 경비 집행률 78%입니다.', time: '16:05', type: 'chat', read: true },
                { id: 'm9', from: 's2', text: '리제로스 시즌2 스폰서 기업 3곳 미팅 완료.', time: '16:15', type: 'chat', read: true },
                { id: 'm10', from: 's1', text: '좋아요. 스폰서 건은 이번 주 내로 제안서 보내주세요.', time: '16:20', type: 'chat', read: true },
            ],
        },
        {
            id: 'c4', name: 'LUKI 프로젝트', participants: ['s1', 's2', 's27', 's28', 's37', 's38'], isGroup: true, lastActive: '어제',
            messages: [
                { id: 'm11', from: 's27', text: '뮤직비디오 스토리보드 1차 완성했습니다.', time: '15:00', type: 'chat', read: true },
                { id: 'm12', from: 's37', text: 'AI 생성 배경 이미지 3종 테스트 완료.', time: '15:30', type: 'chat', read: true },
                { id: 'm13', from: 's28', text: '촬영 일정 다음 주 화~수로 잡을게요.', time: '15:45', type: 'chat', read: true },
            ],
        },
        {
            id: 'c5', name: '박기획', participants: ['s1', 's5'], isGroup: false, lastActive: '3/18',
            messages: [
                { id: 'm14', from: 's5', text: '2분기 사업계획서 초안 작성 완료했습니다.', time: '11:00', type: 'chat', read: true },
                { id: 'm15', from: 's1', text: '확인했어요. 코멘트 남겼으니 수정 후 다시 보내주세요.', time: '14:30', type: 'chat', read: true },
            ],
        },
    ];
}

const todaySchedule = [
    { time: '10:00', title: '주간 팀 회의', type: '회의' },
    { time: '14:00', title: 'LUKI 컨셉 회의', type: '프로젝트' },
    { time: '16:00', title: 'Badak 밋업 준비', type: '이벤트' },
];

const activeProjects = [
    { name: 'LUKI 2nd Single', progress: 45, dday: 'D-12' },
    { name: 'MADLeap 5기 운영', progress: 25, dday: '진행중' },
    { name: '리제로스 시즌2', progress: 10, dday: '기획중' },
];

const pendingApprovals = [
    { title: '인사이트 투어링 예산', from: '한마케', amount: '5,000,000원' },
    { title: '콘텐츠팀 장비 구매', from: '김콘텐', amount: '2,300,000원' },
];

const emojiGroups = [
    { group: '자주 쓰는', items: ['👍', '👏', '🙏', '💪', '🔥', '✅', '❤️', '😊'] },
    { group: '반응', items: ['😂', '🤔', '😮', '👀', '🎉', '💡', '⭐', '🚀'] },
    { group: '업무', items: ['📋', '📌', '📊', '💼', '🗓️', '⏰', '📎', '✏️'] },
    { group: '상태', items: ['🟢', '🟡', '🔴', '⏳', '✔️', '❌', '⚠️', '🔔'] },
];

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   헬퍼 함수
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const currentUserId = 's1';

const getStaff = (id: string) => initialStaff.find(s => s.id === id);
const getCrewPerson = (id: string) => activeCrewMembers.find(p => p.id === id);
const getAnyPerson = (id: string) => getStaff(id) || getCrewPerson(id);
const getStaffName = (id: string) => {
    const s = getStaff(id);
    if (s) return s.name;
    const c = getCrewPerson(id);
    if (c) return c.name;
    return '알 수 없음';
};
const getStaffInitials = (id: string) => {
    const s = getStaff(id);
    if (s) return s.avatarInitials;
    const c = getCrewPerson(id);
    if (c) return c.avatarInitials;
    return '?';
};
const getStaffPosition = (id: string) => {
    const s = getStaff(id);
    if (s) return `${s.department} · ${s.position}`;
    const c = getCrewPerson(id);
    if (c) return c.crewRole || c.type;
    return '';
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   메인 컴포넌트
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function MessengerPage() {
    const { user } = useAuth();

    // 기본 상태
    const [selectedChat, setSelectedChat] = useState<string | null>('c1');
    const [searchQuery, setSearchQuery] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [chats, setChats] = useState<ChatThread[]>(generateMockChats);
    const [notifications] = useState<Message[]>(generateNotifications);
    const [activeTab, setActiveTab] = useState<'chats' | 'people'>('chats');

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
                if (threads.length > 0) {
                    // DB 스레드 → 로컬 ChatThread 형태로 변환
                    const converted: ChatThread[] = threads.map(t => ({
                        id: t.id,
                        name: t.name || '대화',
                        participants: t.participants,
                        messages: [], // 메시지는 스레드 선택 시 로드
                        isGroup: t.is_group,
                        lastActive: new Date(t.updated_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
                    }));
                    setChats(converted);
                    setDbLoaded(true);
                } else {
                    // DB에 스레드 없으면 Mock 유지
                    setDbLoaded(false);
                }
            } catch {
                // DB 에러 시 Mock 유지
                setDbLoaded(false);
            }
        })();
        return () => { cancelled = true; };
    }, [user?.id]);

    // ── DB: 전체 스레드 실시간 구독 (새 메시지 → 스레드 목록 갱신) ──
    useEffect(() => {
        if (!user?.id || !dbLoaded) return;
        const unsub = chatDb.subscribeToAllThreads(user.id, (newMsg) => {
            // 현재 선택된 스레드에 메시지가 오면 messages에 추가
            setChats(prev => prev.map(c => {
                if (c.id !== newMsg.thread_id) return c;
                // 이미 존재하는 메시지면 무시 (optimistic update 중복 방지)
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

        // 이전 구독 해제
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

                // 읽음 처리
                chatDb.markAsRead(selectedChat, user.id);
            } catch {
                // 에러 시 기존 메시지 유지
            }
        })();

        // 개별 스레드 실시간 구독
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
            // 새 메시지 읽음 처리
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

    // 대화 내 메시지 검색 필터
    const chatSearchResults = selectedThread && chatSearchQuery.trim()
        ? selectedThread.messages.filter(m => m.text.toLowerCase().includes(chatSearchQuery.toLowerCase()))
        : [];

    // 1:1 상대 정보
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
    const toggleDivision = (id: string) => {
        setExpandedDivisions(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const toggleSet = (setter: React.Dispatch<React.SetStateAction<Set<string>>>, key: string) => {
        setter(prev => {
            const n = new Set(prev);
            if (n.has(key)) n.delete(key); else n.add(key);
            return n;
        });
    };

    const selectChat = (chatId: string) => {
        setSelectedChat(chatId);
        setChatMenuOpen(null);
        setMobileView('chat');
        // DB 모드: 읽음 처리
        if (user?.id && dbLoaded && chatId !== 'notifications') {
            chatDb.markAsRead(chatId, user.id);
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

        // Optimistic update
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

        // DB 전송 (로그인 + DB 연동 시)
        if (user?.id && dbLoaded) {
            const sent = await chatDb.sendMessage({
                threadId: selectedThread.id,
                senderId: user.id,
                senderName: user.name || '나',
                content,
            });
            // DB 전송 성공 시 optimistic 메시지 ID를 실제 ID로 교체
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
            // Mock 모드: 자동 응답 (1.5초 후)
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
            // DB 모드: 스레드 생성
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
            // Mock 모드
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
            // DB 모드
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
            // Mock 모드
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
        <div className="flex h-[calc(100vh-140px)] -m-8 border-t border-neutral-100 overflow-hidden relative">

            {/* ══════════════════════════════════
                1열: 대화 목록 / 조직도
               ══════════════════════════════════ */}
            <div className={clsx(
                "border-r border-neutral-200 bg-white flex flex-col shrink-0 transition-transform duration-300 ease-in-out",
                // 데스크탑
                "md:w-[260px] md:relative md:translate-x-0",
                // 모바일: 전체 폭, 슬라이드
                "w-full absolute inset-0 z-20",
                mobileView === 'list' ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            )}>
                {/* 탭 */}
                <div className="flex border-b border-neutral-100">
                    <button onClick={() => setActiveTab('chats')}
                        className={clsx("flex-1 py-2.5 text-xs font-medium transition-colors",
                            activeTab === 'chats' ? 'text-neutral-900 border-b-2 border-neutral-900' : 'text-neutral-400'
                        )}>
                        대화 {unreadChats > 0 && <span className="ml-1 px-1.5 py-0.5 text-[11px] bg-red-500 text-white rounded-full">{unreadChats}</span>}
                    </button>
                    <button onClick={() => setActiveTab('people')}
                        className={clsx("flex-1 py-2.5 text-xs font-medium transition-colors",
                            activeTab === 'people' ? 'text-neutral-900 border-b-2 border-neutral-900' : 'text-neutral-400'
                        )}>
                        조직도
                    </button>
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
                    {activeTab === 'chats' ? (
                        <div>
                            {/* 그룹 / 일괄 버튼 */}
                            <div className="flex gap-1.5 px-3 py-1.5 border-b border-neutral-100">
                                <button onClick={() => setShowNewGroupModal(true)}
                                    className="flex-1 py-1.5 text-xs font-medium text-neutral-500 border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 transition-colors">
                                    + 그룹 채팅
                                </button>
                                <button onClick={() => setShowBroadcastModal(true)}
                                    className="flex-1 py-1.5 text-xs font-medium text-neutral-500 border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 transition-colors">
                                    일괄 메시지
                                </button>
                            </div>

                            {/* 알림 */}
                            <button onClick={() => selectChat('notifications')}
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
                                                    autoFocus onKeyDown={e => { if (e.key === 'Enter') renameChatConfirm(chat.id); if (e.key === 'Escape') setEditingChatName(null); }}
                                                    className="flex-1 px-2 py-1 text-xs border border-neutral-300 focus:outline-none focus:border-neutral-500" />
                                                <button onClick={() => renameChatConfirm(chat.id)} className="text-[11px] text-neutral-500 hover:text-neutral-900">확인</button>
                                                <button onClick={() => setEditingChatName(null)} className="text-[11px] text-neutral-400">취소</button>
                                            </div>
                                        ) : (
                                            <>
                                                <button onClick={() => selectChat(chat.id)}
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
                                                            <button onClick={() => leaveChat(chat.id)}
                                                                className="w-full text-left px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50">나가기</button>
                                                        )}
                                                        <button onClick={() => deleteChat(chat.id)}
                                                            className="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-red-50">삭제</button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
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
                                                        <button key={s.id} onClick={() => startChatWith(s.id)}
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
                                                    <button key={p.id} onClick={() => startChatWith(p.id)}
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
                                                    <button key={p.id} onClick={() => startChatWith(p.id)}
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
                                                            <button key={p.id} onClick={() => startChatWith(p.id)}
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

            {/* ══════════════════════════════════
                2열: 대화창
               ══════════════════════════════════ */}
            <div className={clsx(
                "flex-1 flex flex-col bg-neutral-50 min-w-0 max-w-2xl transition-transform duration-300 ease-in-out",
                // 데스크탑
                "md:relative md:translate-x-0",
                // 모바일
                "w-full absolute inset-0 z-30",
                mobileView === 'chat' ? 'translate-x-0' : mobileView === 'profile' ? '-translate-x-full' : 'translate-x-full',
                "md:translate-x-0"
            )}>
                {selectedChat === 'notifications' ? (
                    /* ── 알림 뷰 ── */
                    <>
                        <div className="px-4 py-2.5 bg-white border-b border-neutral-100 flex items-center gap-2.5">
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
                        <div className="px-4 py-2.5 bg-white border-b border-neutral-100 flex items-center justify-between">
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
                            <div className="px-4 py-2 bg-white border-b border-neutral-100 flex items-center gap-2">
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
                        <div className="bg-white border-t border-neutral-100">
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
                                    className={clsx("p-1.5 transition-colors", showAttachMenu ? 'bg-neutral-200' : 'hover:bg-neutral-100')}>
                                    <Paperclip className="h-3.5 w-3.5 text-neutral-400" />
                                </button>
                                <input value={newMessage} onChange={e => setNewMessage(e.target.value)}
                                    placeholder="메시지 입력..."
                                    className="flex-1 px-3 py-1.5 text-[11px] border border-neutral-200 focus:outline-none focus:border-neutral-400"
                                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                                    onClick={() => { setShowEmoji(false); setShowAttachMenu(false); }} />
                                <button onClick={() => { setShowEmoji(!showEmoji); setShowAttachMenu(false); }}
                                    className={clsx("p-1.5 transition-colors", showEmoji ? 'bg-neutral-200' : 'hover:bg-neutral-100')}>
                                    <Smile className="h-3.5 w-3.5 text-neutral-400" />
                                </button>
                                <button onClick={sendMessage}
                                    className={clsx("p-1.5 transition-colors",
                                        newMessage.trim() ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-300')}>
                                    <Send className="h-3.5 w-3.5" />
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
                // 데스크탑
                "md:w-[280px] md:relative md:translate-x-0 md:flex-1",
                // 모바일
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
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowNewGroupModal(false)}>
                    <div className="bg-white w-[400px] max-w-[95vw] max-h-[500px] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="px-5 py-3 border-b border-neutral-100">
                            <h3 className="text-sm font-bold">그룹 채팅 만들기</h3>
                            <p className="text-xs text-neutral-400">2명 이상 선택하세요</p>
                        </div>
                        <div className="px-5 py-3 border-b border-neutral-100">
                            <input value={groupName} onChange={e => setGroupName(e.target.value)}
                                placeholder="그룹 이름..."
                                className="w-full px-3 py-1.5 text-xs border border-neutral-200 focus:outline-none focus:border-neutral-400" />
                            {groupSelectedMembers.size > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {Array.from(groupSelectedMembers).map(id => (
                                        <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] bg-neutral-100">
                                            {getStaffName(id)}
                                            <button onClick={() => setGroupSelectedMembers(prev => { const n = new Set(prev); n.delete(id); return n; })}
                                                className="text-neutral-400 hover:text-red-500">×</button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto px-5 py-2 max-h-[320px]">
                            {/* Staff divisions */}
                            {divisions.map(div => {
                                const divStaff = initialStaff.filter(s => s.division === div.id && s.id !== currentUserId);
                                const allDivSelected = divStaff.every(s => groupSelectedMembers.has(s.id));
                                const someDivSelected = divStaff.some(s => groupSelectedMembers.has(s.id));
                                const divExpanded = groupExpandedDivs.has(div.id);
                                return (
                                    <div key={div.id} className="mb-0.5">
                                        <div className="flex items-center gap-1 px-1 py-1.5 hover:bg-neutral-50">
                                            <button onClick={() => toggleSet(setGroupExpandedDivs, div.id)} className="p-0.5">
                                                {divExpanded ? <ChevronDown className="h-3 w-3 text-neutral-400" /> : <ChevronRight className="h-3 w-3 text-neutral-400" />}
                                            </button>
                                            <label className="flex items-center gap-2 flex-1 cursor-pointer">
                                                <input type="checkbox" checked={allDivSelected}
                                                    ref={el => { if (el) el.indeterminate = someDivSelected && !allDivSelected; }}
                                                    onChange={e => {
                                                        setGroupSelectedMembers(prev => {
                                                            const n = new Set(prev);
                                                            divStaff.forEach(s => e.target.checked ? n.add(s.id) : n.delete(s.id));
                                                            return n;
                                                        });
                                                    }}
                                                    className="h-3 w-3 border-neutral-300" />
                                                <span className="text-xs font-medium text-neutral-600">{div.name}</span>
                                            </label>
                                            <span className="text-[10px] text-neutral-300 pr-1">{divStaff.filter(s => groupSelectedMembers.has(s.id)).length}/{divStaff.length}</span>
                                        </div>
                                        {divExpanded && div.departments.map(dept => {
                                            const deptStaff = divStaff.filter(s => s.department === dept);
                                            if (deptStaff.length === 0) return null;
                                            const allDeptSelected = deptStaff.every(s => groupSelectedMembers.has(s.id));
                                            const someDeptSelected = deptStaff.some(s => groupSelectedMembers.has(s.id));
                                            const deptKey = `${div.id}-${dept}`;
                                            const deptExpanded = groupExpandedDepts.has(deptKey);
                                            return (
                                                <div key={dept} className="ml-5">
                                                    <div className="flex items-center gap-1 px-1 py-1 hover:bg-neutral-50">
                                                        <button onClick={() => toggleSet(setGroupExpandedDepts, deptKey)} className="p-0.5">
                                                            {deptExpanded ? <ChevronDown className="h-2.5 w-2.5 text-neutral-300" /> : <ChevronRight className="h-2.5 w-2.5 text-neutral-300" />}
                                                        </button>
                                                        <label className="flex items-center gap-2 flex-1 cursor-pointer">
                                                            <input type="checkbox" checked={allDeptSelected}
                                                                ref={el => { if (el) el.indeterminate = someDeptSelected && !allDeptSelected; }}
                                                                onChange={e => {
                                                                    setGroupSelectedMembers(prev => {
                                                                        const n = new Set(prev);
                                                                        deptStaff.forEach(s => e.target.checked ? n.add(s.id) : n.delete(s.id));
                                                                        return n;
                                                                    });
                                                                }}
                                                                className="h-3 w-3 border-neutral-300" />
                                                            <span className="text-[11px] text-neutral-500">{dept}</span>
                                                        </label>
                                                        <span className="text-[10px] text-neutral-300 pr-1">{deptStaff.filter(s => groupSelectedMembers.has(s.id)).length}/{deptStaff.length}</span>
                                                    </div>
                                                    {deptExpanded && deptStaff.map(s => (
                                                        <label key={s.id} className="flex items-center gap-2 px-2 py-1 ml-5 hover:bg-neutral-50 cursor-pointer">
                                                            <input type="checkbox" checked={groupSelectedMembers.has(s.id)}
                                                                onChange={e => {
                                                                    setGroupSelectedMembers(prev => {
                                                                        const n = new Set(prev);
                                                                        if (e.target.checked) n.add(s.id); else n.delete(s.id);
                                                                        return n;
                                                                    });
                                                                }}
                                                                className="h-3 w-3 border-neutral-300" />
                                                            <div className="h-4 w-4 bg-neutral-100 flex items-center justify-center text-[6px] font-bold text-neutral-400 shrink-0">
                                                                {s.avatarInitials}
                                                            </div>
                                                            <span className="text-[11px]">{s.name}</span>
                                                            <span className="text-[7px] text-neutral-300 ml-auto">{s.position}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}

                            {/* Crew in modal */}
                            <div className="mt-1 pt-1 border-t border-neutral-100">
                                {/* YouInOne */}
                                {youinoneMembers.length > 0 && (() => {
                                    const allSelected = youinoneMembers.every(p => groupSelectedMembers.has(p.id));
                                    const someSelected = youinoneMembers.some(p => groupSelectedMembers.has(p.id));
                                    const expanded = groupExpandedDivs.has('crew-youinone');
                                    return (
                                        <div className="mb-0.5">
                                            <div className="flex items-center gap-1 px-1 py-1.5 hover:bg-neutral-50">
                                                <button onClick={() => toggleSet(setGroupExpandedDivs, 'crew-youinone')} className="p-0.5">
                                                    {expanded ? <ChevronDown className="h-3 w-3 text-neutral-400" /> : <ChevronRight className="h-3 w-3 text-neutral-400" />}
                                                </button>
                                                <label className="flex items-center gap-2 flex-1 cursor-pointer">
                                                    <input type="checkbox" checked={allSelected}
                                                        ref={el => { if (el) el.indeterminate = someSelected && !allSelected; }}
                                                        onChange={e => {
                                                            setGroupSelectedMembers(prev => {
                                                                const n = new Set(prev);
                                                                youinoneMembers.forEach(p => e.target.checked ? n.add(p.id) : n.delete(p.id));
                                                                return n;
                                                            });
                                                        }}
                                                        className="h-3 w-3 border-neutral-300" />
                                                    <span className="text-xs font-medium text-neutral-600">YouInOne</span>
                                                </label>
                                                <span className="text-[10px] text-neutral-300 pr-1">{youinoneMembers.filter(p => groupSelectedMembers.has(p.id)).length}/{youinoneMembers.length}</span>
                                            </div>
                                            {expanded && youinoneMembers.map(p => (
                                                <label key={p.id} className="flex items-center gap-2 px-2 py-1 ml-5 hover:bg-neutral-50 cursor-pointer">
                                                    <input type="checkbox" checked={groupSelectedMembers.has(p.id)}
                                                        onChange={e => {
                                                            setGroupSelectedMembers(prev => {
                                                                const n = new Set(prev);
                                                                if (e.target.checked) n.add(p.id); else n.delete(p.id);
                                                                return n;
                                                            });
                                                        }}
                                                        className="h-3 w-3 border-neutral-300" />
                                                    <div className="h-4 w-4 bg-neutral-100 flex items-center justify-center text-[6px] font-bold text-neutral-400 shrink-0">
                                                        {p.avatarInitials}
                                                    </div>
                                                    <span className="text-[11px]">{p.name}</span>
                                                    <span className="text-[7px] text-neutral-300 ml-auto">{p.crewRole || ''}</span>
                                                </label>
                                            ))}
                                        </div>
                                    );
                                })()}

                                {/* Alliance */}
                                {allianceMembers.length > 0 && (() => {
                                    const allSelected = allianceMembers.every(p => groupSelectedMembers.has(p.id));
                                    const someSelected = allianceMembers.some(p => groupSelectedMembers.has(p.id));
                                    const expanded = groupExpandedDivs.has('crew-alliance');
                                    return (
                                        <div className="mb-0.5">
                                            <div className="flex items-center gap-1 px-1 py-1.5 hover:bg-neutral-50">
                                                <button onClick={() => toggleSet(setGroupExpandedDivs, 'crew-alliance')} className="p-0.5">
                                                    {expanded ? <ChevronDown className="h-3 w-3 text-neutral-400" /> : <ChevronRight className="h-3 w-3 text-neutral-400" />}
                                                </button>
                                                <label className="flex items-center gap-2 flex-1 cursor-pointer">
                                                    <input type="checkbox" checked={allSelected}
                                                        ref={el => { if (el) el.indeterminate = someSelected && !allSelected; }}
                                                        onChange={e => {
                                                            setGroupSelectedMembers(prev => {
                                                                const n = new Set(prev);
                                                                allianceMembers.forEach(p => e.target.checked ? n.add(p.id) : n.delete(p.id));
                                                                return n;
                                                            });
                                                        }}
                                                        className="h-3 w-3 border-neutral-300" />
                                                    <span className="text-xs font-medium text-neutral-600">YouInOne Alliance</span>
                                                </label>
                                                <span className="text-[10px] text-neutral-300 pr-1">{allianceMembers.filter(p => groupSelectedMembers.has(p.id)).length}/{allianceMembers.length}</span>
                                            </div>
                                            {expanded && allianceMembers.map(p => (
                                                <label key={p.id} className="flex items-center gap-2 px-2 py-1 ml-5 hover:bg-neutral-50 cursor-pointer">
                                                    <input type="checkbox" checked={groupSelectedMembers.has(p.id)}
                                                        onChange={e => {
                                                            setGroupSelectedMembers(prev => {
                                                                const n = new Set(prev);
                                                                if (e.target.checked) n.add(p.id); else n.delete(p.id);
                                                                return n;
                                                            });
                                                        }}
                                                        className="h-3 w-3 border-neutral-300" />
                                                    <div className="h-4 w-4 bg-neutral-100 flex items-center justify-center text-[6px] font-bold text-neutral-400 shrink-0">
                                                        {p.avatarInitials}
                                                    </div>
                                                    <span className="text-[11px]">{p.name}</span>
                                                    <span className="text-[7px] text-neutral-300 ml-auto">{p.crewRole || ''}</span>
                                                </label>
                                            ))}
                                        </div>
                                    );
                                })()}

                                {/* MADLeague */}
                                {madleagueByClub.length > 0 && (() => {
                                    const allMadMembers = madleagueMembers;
                                    const allSelected = allMadMembers.every(p => groupSelectedMembers.has(p.id));
                                    const someSelected = allMadMembers.some(p => groupSelectedMembers.has(p.id));
                                    const expanded = groupExpandedDivs.has('crew-madleague');
                                    return (
                                        <div className="mb-0.5">
                                            <div className="flex items-center gap-1 px-1 py-1.5 hover:bg-neutral-50">
                                                <button onClick={() => toggleSet(setGroupExpandedDivs, 'crew-madleague')} className="p-0.5">
                                                    {expanded ? <ChevronDown className="h-3 w-3 text-neutral-400" /> : <ChevronRight className="h-3 w-3 text-neutral-400" />}
                                                </button>
                                                <label className="flex items-center gap-2 flex-1 cursor-pointer">
                                                    <input type="checkbox" checked={allSelected}
                                                        ref={el => { if (el) el.indeterminate = someSelected && !allSelected; }}
                                                        onChange={e => {
                                                            setGroupSelectedMembers(prev => {
                                                                const n = new Set(prev);
                                                                allMadMembers.forEach(p => e.target.checked ? n.add(p.id) : n.delete(p.id));
                                                                return n;
                                                            });
                                                        }}
                                                        className="h-3 w-3 border-neutral-300" />
                                                    <span className="text-xs font-medium text-neutral-600">MADLeague</span>
                                                </label>
                                                <span className="text-[10px] text-neutral-300 pr-1">{allMadMembers.filter(p => groupSelectedMembers.has(p.id)).length}/{allMadMembers.length}</span>
                                            </div>
                                            {expanded && madleagueByClub.map(({ club, members }) => {
                                                const clubAllSelected = members.every(p => groupSelectedMembers.has(p.id));
                                                const clubSomeSelected = members.some(p => groupSelectedMembers.has(p.id));
                                                const clubKey = `crew-mad-${club.id}`;
                                                const clubExpanded = groupExpandedDepts.has(clubKey);
                                                return (
                                                    <div key={club.id} className="ml-5">
                                                        <div className="flex items-center gap-1 px-1 py-1 hover:bg-neutral-50">
                                                            <button onClick={() => toggleSet(setGroupExpandedDepts, clubKey)} className="p-0.5">
                                                                {clubExpanded ? <ChevronDown className="h-2.5 w-2.5 text-neutral-300" /> : <ChevronRight className="h-2.5 w-2.5 text-neutral-300" />}
                                                            </button>
                                                            <label className="flex items-center gap-2 flex-1 cursor-pointer">
                                                                <input type="checkbox" checked={clubAllSelected}
                                                                    ref={el => { if (el) el.indeterminate = clubSomeSelected && !clubAllSelected; }}
                                                                    onChange={e => {
                                                                        setGroupSelectedMembers(prev => {
                                                                            const n = new Set(prev);
                                                                            members.forEach(p => e.target.checked ? n.add(p.id) : n.delete(p.id));
                                                                            return n;
                                                                        });
                                                                    }}
                                                                    className="h-3 w-3 border-neutral-300" />
                                                                <span className="text-[11px] text-neutral-500">{club.name}</span>
                                                                <span className="text-[7px] text-neutral-300 ml-1">{club.region}</span>
                                                            </label>
                                                            <span className="text-[10px] text-neutral-300 pr-1">{members.filter(p => groupSelectedMembers.has(p.id)).length}/{members.length}</span>
                                                        </div>
                                                        {clubExpanded && members.map(p => (
                                                            <label key={p.id} className="flex items-center gap-2 px-2 py-1 ml-5 hover:bg-neutral-50 cursor-pointer">
                                                                <input type="checkbox" checked={groupSelectedMembers.has(p.id)}
                                                                    onChange={e => {
                                                                        setGroupSelectedMembers(prev => {
                                                                            const n = new Set(prev);
                                                                            if (e.target.checked) n.add(p.id); else n.delete(p.id);
                                                                            return n;
                                                                        });
                                                                    }}
                                                                    className="h-3 w-3 border-neutral-300" />
                                                                <div className="h-4 w-4 bg-neutral-100 flex items-center justify-center text-[6px] font-bold text-neutral-400 shrink-0">
                                                                    {p.avatarInitials}
                                                                </div>
                                                                <span className="text-[11px]">{p.name}</span>
                                                                <span className="text-[7px] text-neutral-300 ml-auto">{p.crewRole || ''}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                        <div className="px-5 py-3 border-t border-neutral-100 flex justify-end gap-2">
                            <button onClick={() => setShowNewGroupModal(false)} className="px-4 py-1.5 text-xs text-neutral-500 hover:bg-neutral-100">취소</button>
                            <button onClick={createGroupChat}
                                disabled={groupSelectedMembers.size < 1 || !groupName.trim()}
                                className="px-4 py-1.5 text-xs bg-neutral-900 text-white disabled:opacity-30 disabled:cursor-not-allowed">
                                생성 ({groupSelectedMembers.size}명 선택)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════
                모달: 일괄 메시지
               ══════════════════════════════════ */}
            {showBroadcastModal && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowBroadcastModal(false)}>
                    <div className="bg-white w-[420px] max-w-[95vw]" onClick={e => e.stopPropagation()}>
                        <div className="px-5 py-3 border-b border-neutral-100">
                            <h3 className="text-sm font-bold">일괄 메시지</h3>
                            <p className="text-xs text-neutral-400">대상을 선택하고 메시지를 보내세요</p>
                        </div>
                        <div className="px-5 py-4 space-y-3">
                            <div>
                                <p className="text-xs font-medium text-neutral-500 mb-1.5">대상</p>
                                <div className="flex gap-1.5">
                                    {[
                                        { key: 'all' as const, label: `전 직원 (${initialStaff.length - 1}명)` },
                                        { key: 'division' as const, label: '부문별' },
                                        { key: 'department' as const, label: '부서별' },
                                    ].map(t => (
                                        <button key={t.key} onClick={() => setBroadcastTarget(t.key)}
                                            className={clsx("px-3 py-1.5 text-xs border transition-colors",
                                                broadcastTarget === t.key ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 hover:border-neutral-400')}>
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {broadcastTarget === 'division' && (
                                <div>
                                    <p className="text-xs font-medium text-neutral-500 mb-1.5">부문 선택</p>
                                    <div className="flex gap-1.5 flex-wrap">
                                        {divisions.map(d => (
                                            <button key={d.id} onClick={() => setBroadcastDivision(d.id)}
                                                className={clsx("px-3 py-1 text-xs border transition-colors",
                                                    broadcastDivision === d.id ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 hover:border-neutral-400')}>
                                                {d.name} ({initialStaff.filter(s => s.division === d.id && s.id !== currentUserId).length}명)
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {broadcastTarget === 'department' && (
                                <div>
                                    <p className="text-xs font-medium text-neutral-500 mb-1.5">부서 선택</p>
                                    <div className="flex gap-1 flex-wrap">
                                        {allDepartments.map(dept => {
                                            const count = initialStaff.filter(s => s.department === dept && s.id !== currentUserId).length;
                                            if (count === 0) return null;
                                            return (
                                                <button key={dept} onClick={() => setBroadcastDept(dept)}
                                                    className={clsx("px-2.5 py-1 text-[11px] border transition-colors",
                                                        broadcastDept === dept ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 hover:border-neutral-400')}>
                                                    {dept} ({count})
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            <div>
                                <p className="text-xs font-medium text-neutral-500 mb-1.5">메시지</p>
                                <textarea value={broadcastMessage} onChange={e => setBroadcastMessage(e.target.value)}
                                    placeholder="전달할 메시지를 입력하세요..."
                                    rows={4}
                                    className="w-full px-3 py-2 text-xs border border-neutral-200 resize-none focus:outline-none focus:border-neutral-400" />
                            </div>
                        </div>
                        <div className="px-5 py-3 border-t border-neutral-100 flex justify-end gap-2">
                            <button onClick={() => setShowBroadcastModal(false)} className="px-4 py-1.5 text-xs text-neutral-500 hover:bg-neutral-100">취소</button>
                            <button onClick={sendBroadcast}
                                disabled={!broadcastMessage.trim()}
                                className="px-4 py-1.5 text-xs bg-neutral-900 text-white disabled:opacity-30 disabled:cursor-not-allowed">
                                전송
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
