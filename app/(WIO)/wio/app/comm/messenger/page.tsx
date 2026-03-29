'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageSquare, Users, Hash, Send, Plus, Search, Paperclip, Smile,
  Settings, Phone, Video, MoreVertical, Image, FileText, Download,
  ChevronLeft, X, Check, CheckCheck, AtSign
} from 'lucide-react';
import { useWIO } from '../../layout';

/* ───── Types ───── */
type ConvType = 'dm' | 'group' | 'channel';
type TabFilter = 'all' | 'dm' | 'group' | 'channel';
type MsgType = 'text' | 'file' | 'image' | 'system';

interface Conversation {
  id: string;
  name: string;
  type: ConvType;
  members: string[];
  avatar?: string;
  lastMessage: string;
  lastTime: string;
  lastDate: string;
  unread: number;
  online?: boolean;
  typing?: string | null;
}

interface Message {
  id: string;
  convId: string;
  sender: string;
  senderInitial: string;
  type: MsgType;
  text: string;
  fileName?: string;
  fileSize?: string;
  imageUrl?: string;
  time: string;
  date: string;
  isMine: boolean;
  read?: boolean;
}

/* ───── Mock Data ───── */
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1', name: '김민지', type: 'dm',
    members: ['김민지', '나'],
    lastMessage: '프레젠테이션 자료 확인해 주세요', lastTime: '14:32', lastDate: '2026-03-29',
    unread: 2, online: true,
  },
  {
    id: 'c2', name: '박서준', type: 'dm',
    members: ['박서준', '나'],
    lastMessage: '내일 점심 같이 하실래요?', lastTime: '13:05', lastDate: '2026-03-29',
    unread: 0, online: false,
  },
  {
    id: 'c3', name: '개발팀', type: 'group',
    members: ['김민지', '박서준', '이하은', '정우석', '나'],
    lastMessage: '이하은: 배포 완료했습니다!', lastTime: '11:45', lastDate: '2026-03-29',
    unread: 5, typing: '이하은',
  },
  {
    id: 'c4', name: '2분기 전략 TF', type: 'group',
    members: ['김민지', '윤채린', '정우석', '나'],
    lastMessage: '윤채린: 리서치 결과 공유합니다', lastTime: '09:30', lastDate: '2026-03-29',
    unread: 0,
  },
  {
    id: 'c5', name: '#공지사항', type: 'channel',
    members: ['전체'],
    lastMessage: '4월 워크숍 일정 안내', lastTime: '어제', lastDate: '2026-03-28',
    unread: 1,
  },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  c1: [
    { id: 'm1', convId: 'c1', sender: '시스템', senderInitial: '', type: 'system', text: '2026년 3월 29일', time: '', date: '2026-03-29', isMine: false },
    { id: 'm2', convId: 'c1', sender: '김민지', senderInitial: '민', type: 'text', text: '안녕하세요! 어제 회의 때 말씀드린 2분기 마케팅 전략 자료 정리했어요.', time: '09:15', date: '2026-03-29', isMine: false },
    { id: 'm3', convId: 'c1', sender: '나', senderInitial: '나', type: 'text', text: '감사합니다! 빨리 봐야겠네요. 어제 논의된 타겟 세그먼트 부분도 포함됐나요?', time: '09:20', date: '2026-03-29', isMine: true, read: true },
    { id: 'm4', convId: 'c1', sender: '김민지', senderInitial: '민', type: 'text', text: '네, Z세대 타겟팅 부분 상세하게 넣었습니다. 그리고 예산 시뮬레이션도 3가지 시나리오로 만들었어요.', time: '09:25', date: '2026-03-29', isMine: false },
    { id: 'm5', convId: 'c1', sender: '김민지', senderInitial: '민', type: 'file', text: '', fileName: 'Q2_마케팅전략_v3.pdf', fileSize: '4.2 MB', time: '09:26', date: '2026-03-29', isMine: false },
    { id: 'm6', convId: 'c1', sender: '나', senderInitial: '나', type: 'text', text: '완벽하네요! 오후 회의 전에 리뷰하고 코멘트 달아놓겠습니다.', time: '09:30', date: '2026-03-29', isMine: true, read: true },
    { id: 'm7', convId: 'c1', sender: '김민지', senderInitial: '민', type: 'image', text: '', imageUrl: '', fileName: '경쟁사_분석_차트.png', time: '14:20', date: '2026-03-29', isMine: false },
    { id: 'm8', convId: 'c1', sender: '김민지', senderInitial: '민', type: 'text', text: '추가로 경쟁사 분석 시각화한 차트도 첨부합니다. 그리고 프레젠테이션 자료도 거의 완성됐어요.', time: '14:25', date: '2026-03-29', isMine: false },
    { id: 'm9', convId: 'c1', sender: '나', senderInitial: '나', type: 'text', text: '차트 잘 만드셨네요! 한 가지 궁금한 게 있는데, 경쟁사 B의 매출 데이터 출처가 어디인가요?', time: '14:28', date: '2026-03-29', isMine: true, read: true },
    { id: 'm10', convId: 'c1', sender: '김민지', senderInitial: '민', type: 'text', text: '프레젠테이션 자료 확인해 주세요', time: '14:32', date: '2026-03-29', isMine: false },
  ],
  c2: [
    { id: 'm20', convId: 'c2', sender: '시스템', senderInitial: '', type: 'system', text: '2026년 3월 28일', time: '', date: '2026-03-28', isMine: false },
    { id: 'm21', convId: 'c2', sender: '박서준', senderInitial: '서', type: 'text', text: '지난 스프린트 회고 때 나온 이슈 정리해서 Jira에 올려놨어요.', time: '16:30', date: '2026-03-28', isMine: false },
    { id: 'm22', convId: 'c2', sender: '나', senderInitial: '나', type: 'text', text: '고마워요! 확인하겠습니다. 인프라 이슈도 포함됐나요?', time: '16:35', date: '2026-03-28', isMine: true, read: true },
    { id: 'm23', convId: 'c2', sender: '박서준', senderInitial: '서', type: 'text', text: '네, CI/CD 파이프라인 개선 건이랑 모니터링 알림 설정 건 둘 다 있습니다.', time: '16:40', date: '2026-03-28', isMine: false },
    { id: 'm24', convId: 'c2', sender: '시스템', senderInitial: '', type: 'system', text: '2026년 3월 29일', time: '', date: '2026-03-29', isMine: false },
    { id: 'm25', convId: 'c2', sender: '나', senderInitial: '나', type: 'text', text: '어제 올려준 Jira 확인했어요. 잘 정리했네요!', time: '10:00', date: '2026-03-29', isMine: true, read: true },
    { id: 'm26', convId: 'c2', sender: '박서준', senderInitial: '서', type: 'text', text: '감사합니다. 오늘 중으로 우선순위 조정해서 공유할게요.', time: '10:15', date: '2026-03-29', isMine: false },
    { id: 'm27', convId: 'c2', sender: '박서준', senderInitial: '서', type: 'text', text: '그리고 내일 점심 같이 하실래요? 새로 생긴 맛집 가보고 싶어서요', time: '13:05', date: '2026-03-29', isMine: false },
  ],
  c3: [
    { id: 'm30', convId: 'c3', sender: '시스템', senderInitial: '', type: 'system', text: '2026년 3월 29일', time: '', date: '2026-03-29', isMine: false },
    { id: 'm31', convId: 'c3', sender: '정우석', senderInitial: '우', type: 'text', text: '오늘 v2.3 배포 가능한가요? QA 테스트 다 통과했습니다.', time: '09:00', date: '2026-03-29', isMine: false },
    { id: 'm32', convId: 'c3', sender: '박서준', senderInitial: '서', type: 'text', text: '스테이징 환경 배포는 이미 끝났고, 프로덕션은 오후에 할게요.', time: '09:15', date: '2026-03-29', isMine: false },
    { id: 'm33', convId: 'c3', sender: '나', senderInitial: '나', type: 'text', text: '좋습니다. 대시보드 성능 최적화도 같이 나가죠.', time: '09:30', date: '2026-03-29', isMine: true, read: true },
    { id: 'm34', convId: 'c3', sender: '김민지', senderInitial: '민', type: 'text', text: '프론트엔드 번들 사이즈 15% 줄였습니다. 커밋 올려놨어요.', time: '10:00', date: '2026-03-29', isMine: false },
    { id: 'm35', convId: 'c3', sender: '정우석', senderInitial: '우', type: 'text', text: 'API 응답시간도 평균 95ms로 개선했습니다.', time: '10:20', date: '2026-03-29', isMine: false },
    { id: 'm36', convId: 'c3', sender: '나', senderInitial: '나', type: 'text', text: '성능 지표 좋네요! 정우석님 API 캐싱 전략이 효과 있었나 봐요.', time: '10:30', date: '2026-03-29', isMine: true, read: true },
    { id: 'm37', convId: 'c3', sender: '정우석', senderInitial: '우', type: 'file', text: '', fileName: '성능_테스트_리포트.xlsx', fileSize: '1.8 MB', time: '10:45', date: '2026-03-29', isMine: false },
    { id: 'm38', convId: 'c3', sender: '박서준', senderInitial: '서', type: 'text', text: '프로덕션 배포 시작합니다. 약 10분 소요 예상.', time: '11:20', date: '2026-03-29', isMine: false },
    { id: 'm39', convId: 'c3', sender: '시스템', senderInitial: '', type: 'system', text: '박서준님이 정우석님을 초대했습니다', time: '11:25', date: '2026-03-29', isMine: false },
    { id: 'm40', convId: 'c3', sender: '이하은', senderInitial: '하', type: 'text', text: '모니터링 확인 중입니다. 에러율 0%, 응답 정상!', time: '11:35', date: '2026-03-29', isMine: false },
    { id: 'm41', convId: 'c3', sender: '이하은', senderInitial: '하', type: 'text', text: '배포 완료했습니다! 전체 서비스 정상 작동 확인. 수고하셨습니다!', time: '11:45', date: '2026-03-29', isMine: false },
  ],
  c4: [
    { id: 'm50', convId: 'c4', sender: '시스템', senderInitial: '', type: 'system', text: '2026년 3월 28일', time: '', date: '2026-03-28', isMine: false },
    { id: 'm51', convId: 'c4', sender: '윤채린', senderInitial: '채', type: 'text', text: '2분기 전략 방향에 대해 사전 리서치 자료 공유합니다.', time: '15:00', date: '2026-03-28', isMine: false },
    { id: 'm52', convId: 'c4', sender: '윤채린', senderInitial: '채', type: 'file', text: '', fileName: '2분기_시장리서치.pdf', fileSize: '6.1 MB', time: '15:01', date: '2026-03-28', isMine: false },
    { id: 'm53', convId: 'c4', sender: '정우석', senderInitial: '우', type: 'text', text: '좋은 자료네요. 경쟁사 동향 부분이 특히 도움됩니다.', time: '15:30', date: '2026-03-28', isMine: false },
    { id: 'm54', convId: 'c4', sender: '나', senderInitial: '나', type: 'text', text: '리서치 잘 봤습니다. 시장 규모 전망 수치가 예상보다 높네요.', time: '16:00', date: '2026-03-28', isMine: true, read: true },
    { id: 'm55', convId: 'c4', sender: '시스템', senderInitial: '', type: 'system', text: '2026년 3월 29일', time: '', date: '2026-03-29', isMine: false },
    { id: 'm56', convId: 'c4', sender: '김민지', senderInitial: '민', type: 'text', text: '오전 중으로 마케팅 예산 시뮬레이션 3안 공유하겠습니다.', time: '08:50', date: '2026-03-29', isMine: false },
    { id: 'm57', convId: 'c4', sender: '윤채린', senderInitial: '채', type: 'text', text: '리서치 결과 공유합니다', time: '09:30', date: '2026-03-29', isMine: false },
  ],
  c5: [
    { id: 'm60', convId: 'c5', sender: '시스템', senderInitial: '', type: 'system', text: '2026년 3월 27일', time: '', date: '2026-03-27', isMine: false },
    { id: 'm61', convId: 'c5', sender: '최인사', senderInitial: '인', type: 'text', text: '전 직원 대상 공지입니다.\n\n3월 급여 지급일이 31일(월)에서 28일(금)으로 앞당겨집니다. 주말/공휴일 관계로 변경되었으니 참고 바랍니다.', time: '10:00', date: '2026-03-27', isMine: false },
    { id: 'm62', convId: 'c5', sender: '시스템', senderInitial: '', type: 'system', text: '2026년 3월 28일', time: '', date: '2026-03-28', isMine: false },
    { id: 'm63', convId: 'c5', sender: '최인사', senderInitial: '인', type: 'text', text: '안녕하세요, 4월 워크숍 일정 안내드립니다.\n\n일시: 4월 11일(금) 14:00-18:00\n장소: 강남 코워킹스페이스 3층\n주제: "AI 시대의 팀 협업"\n\n참석 여부를 이번 주까지 회신해 주세요.', time: '09:00', date: '2026-03-28', isMine: false },
    { id: 'm64', convId: 'c5', sender: '최인사', senderInitial: '인', type: 'file', text: '', fileName: '4월_워크숍_상세안내.pdf', fileSize: '2.3 MB', time: '09:05', date: '2026-03-28', isMine: false },
    { id: 'm65', convId: 'c5', sender: '시스템', senderInitial: '', type: 'system', text: '2026년 3월 29일', time: '', date: '2026-03-29', isMine: false },
    { id: 'm66', convId: 'c5', sender: '최인사', senderInitial: '인', type: 'text', text: '4월 워크숍 일정 안내', time: '09:15', date: '2026-03-29', isMine: false },
  ],
};

/* ───── Helpers ───── */
const AVATAR_COLORS: Record<string, string> = {
  '김민지': 'bg-rose-600', '박서준': 'bg-sky-600', '이하은': 'bg-emerald-600',
  '정우석': 'bg-amber-600', '윤채린': 'bg-violet-600', '최인사': 'bg-teal-600',
};
const getInitial = (name: string) => name.charAt(name.length > 1 ? name.length - 2 : 0);
const getAvatarColor = (name: string) => AVATAR_COLORS[name] || 'bg-slate-600';

const EMOJI_LIST = ['😊', '👍', '🎉', '❤️', '😂', '🔥', '👏', '💡', '✅', '🙏', '😮', '💪'];

/* ───── Component ───── */
export default function MessengerPage() {
  const { tenant } = useWIO();
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [activeConv, setActiveConv] = useState<string>('c1');
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [tabFilter, setTabFilter] = useState<TabFilter>('all');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!tenant) return null;
  const isDemo = tenant.id === 'demo';

  const currentConv = conversations.find(c => c.id === activeConv);
  const currentMessages = messages[activeConv] || [];

  /* scroll to bottom */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [currentMessages.length, scrollToBottom]);

  /* mark as read */
  useEffect(() => {
    if (activeConv) {
      setConversations(prev => prev.map(c =>
        c.id === activeConv ? { ...c, unread: 0 } : c
      ));
    }
  }, [activeConv]);

  /* auto-grow textarea */
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  /* send */
  const handleSend = () => {
    if (!newMessage.trim()) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
    const msg: Message = {
      id: `msg_${Date.now()}`, convId: activeConv, sender: '나', senderInitial: '나',
      type: 'text', text: newMessage.trim(), time: timeStr, date: '2026-03-29', isMine: true, read: false,
    };
    setMessages(prev => ({ ...prev, [activeConv]: [...(prev[activeConv] || []), msg] }));
    setConversations(prev => prev.map(c =>
      c.id === activeConv ? { ...c, lastMessage: newMessage.trim(), lastTime: timeStr } : c
    ));
    setNewMessage('');
    if (textareaRef.current) { textareaRef.current.style.height = 'auto'; }
    setShowEmoji(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const openConversation = (id: string) => {
    setActiveConv(id);
    setShowMobileChat(true);
  };

  /* filter */
  const filtered = conversations
    .filter(c => tabFilter === 'all' || c.type === tabFilter)
    .filter(c => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const tabs: { key: TabFilter; label: string }[] = [
    { key: 'all', label: '전체' }, { key: 'dm', label: '1:1' },
    { key: 'group', label: '그룹' }, { key: 'channel', label: '채널' },
  ];

  /* ───── Render helpers ───── */
  const renderConvIcon = (type: ConvType) => {
    if (type === 'dm') return <MessageSquare size={14} />;
    if (type === 'group') return <Users size={14} />;
    return <Hash size={14} />;
  };

  const renderMessage = (msg: Message, idx: number) => {
    if (msg.type === 'system') {
      return (
        <div key={msg.id} className="flex justify-center my-3">
          <span className="text-[11px] text-slate-500 bg-white/[0.03] px-3 py-1 rounded-full">{msg.text}</span>
        </div>
      );
    }

    const showSender = !msg.isMine && (idx === 0 || currentMessages[idx - 1]?.sender !== msg.sender || currentMessages[idx - 1]?.type === 'system');

    if (msg.isMine) {
      return (
        <div key={msg.id} className="flex justify-end gap-2 group">
          <div className="flex flex-col items-end">
            <div className="flex items-end gap-1.5">
              <span className="text-[10px] text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 pb-1">
                {msg.read ? <span className="flex items-center gap-0.5 text-indigo-400"><CheckCheck size={10} /> 읽음</span> : <Check size={10} />}
              </span>
              <div className="max-w-[380px] rounded-2xl rounded-br-md bg-indigo-600 px-3.5 py-2.5">
                {msg.type === 'file' && (
                  <div className="flex items-center gap-2.5 bg-indigo-700/50 rounded-lg p-2.5 mb-1">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/30">
                      <FileText size={16} className="text-indigo-200" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{msg.fileName}</p>
                      <p className="text-[10px] text-indigo-300">{msg.fileSize}</p>
                    </div>
                    <Download size={14} className="text-indigo-300 shrink-0 cursor-pointer hover:text-white" />
                  </div>
                )}
                {msg.type === 'image' && (
                  <div className="mb-1 rounded-lg overflow-hidden bg-indigo-700/30 flex items-center justify-center h-36 w-52">
                    <Image size={24} className="text-indigo-300" />
                    <span className="text-xs text-indigo-300 ml-2">{msg.fileName}</span>
                  </div>
                )}
                {msg.text && <p className="text-sm text-white whitespace-pre-wrap">{msg.text}</p>}
                <p className="text-[10px] text-indigo-300 mt-1">{msg.time}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={msg.id} className="flex gap-2.5 group">
        {showSender ? (
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold ${getAvatarColor(msg.sender)}`}>
            {getInitial(msg.sender)}
          </div>
        ) : (
          <div className="w-8 shrink-0" />
        )}
        <div className="max-w-[380px]">
          {showSender && <p className="text-xs text-slate-400 mb-1 font-medium">{msg.sender}</p>}
          <div className="rounded-2xl rounded-bl-md bg-white/[0.06] px-3.5 py-2.5">
            {msg.type === 'file' && (
              <div className="flex items-center gap-2.5 bg-white/[0.05] rounded-lg p-2.5 mb-1">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.08]">
                  <FileText size={16} className="text-slate-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-200 truncate">{msg.fileName}</p>
                  <p className="text-[10px] text-slate-500">{msg.fileSize}</p>
                </div>
                <Download size={14} className="text-slate-500 shrink-0 cursor-pointer hover:text-white" />
              </div>
            )}
            {msg.type === 'image' && (
              <div className="mb-1 rounded-lg overflow-hidden bg-white/[0.04] flex items-center justify-center h-36 w-52">
                <Image size={24} className="text-slate-500" />
                <span className="text-xs text-slate-500 ml-2">{msg.fileName}</span>
              </div>
            )}
            {msg.text && <p className="text-sm text-slate-200 whitespace-pre-wrap">{msg.text}</p>}
            <p className="text-[10px] text-slate-600 mt-1">{msg.time}</p>
          </div>
        </div>
        <span className="text-[10px] text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity self-end pb-1">{msg.time}</span>
      </div>
    );
  };

  /* ───── Conversation List Panel ───── */
  const ConversationList = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 p-3 space-y-3 border-b border-white/5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold">메신저</h2>
          <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors text-white">
            <Plus size={14} />
          </button>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="대화 검색..."
            className="w-full rounded-lg border border-white/5 bg-white/[0.03] pl-9 pr-3 py-2 text-sm focus:border-indigo-500/50 focus:outline-none placeholder:text-slate-600"
          />
        </div>
        <div className="flex gap-1">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTabFilter(t.key)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${tabFilter === t.key ? 'bg-indigo-600/15 text-indigo-400' : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="p-6 text-center text-xs text-slate-600">대화가 없습니다</div>
        )}
        {filtered.map(conv => (
          <button key={conv.id} onClick={() => openConversation(conv.id)}
            className={`w-full text-left flex items-center gap-3 px-4 py-3 transition-colors border-b border-white/[0.02] ${activeConv === conv.id ? 'bg-indigo-600/8 border-l-2 border-l-indigo-500' : 'hover:bg-white/[0.03]'}`}>
            <div className="relative">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full text-white text-sm font-bold ${conv.type === 'dm' ? getAvatarColor(conv.name) : conv.type === 'group' ? 'bg-emerald-600' : 'bg-slate-600'}`}>
                {conv.type === 'dm' ? getInitial(conv.name) : renderConvIcon(conv.type)}
              </div>
              {conv.online && (
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className={`text-sm truncate ${conv.unread > 0 ? 'font-bold text-white' : 'font-medium text-slate-300'}`}>{conv.name}</span>
                <span className={`text-[10px] shrink-0 ml-2 ${conv.unread > 0 ? 'text-indigo-400' : 'text-slate-600'}`}>{conv.lastTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs truncate ${conv.unread > 0 ? 'text-slate-300' : 'text-slate-500'}`}>
                  {conv.typing ? (
                    <span className="text-indigo-400">{conv.typing}님이 입력 중...</span>
                  ) : conv.lastMessage}
                </span>
                {conv.unread > 0 && (
                  <span className="ml-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white shrink-0">
                    {conv.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  /* ───── Chat View Panel ───── */
  const ChatView = () => {
    if (!currentConv) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
          <MessageSquare size={40} className="mb-3 text-slate-700" />
          <p className="text-sm">대화를 선택하세요</p>
          <p className="text-xs text-slate-600 mt-1">좌측 목록에서 대화를 선택하거나 새 대화를 시작하세요</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        {/* Chat Header */}
        <div className="shrink-0 px-4 py-3 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile back button */}
            <button onClick={() => setShowMobileChat(false)} className="md:hidden p-1 text-slate-400 hover:text-white">
              <ChevronLeft size={20} />
            </button>
            <div className="relative">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full text-white text-sm font-bold ${currentConv.type === 'dm' ? getAvatarColor(currentConv.name) : currentConv.type === 'group' ? 'bg-emerald-600' : 'bg-slate-600'}`}>
                {currentConv.type === 'dm' ? getInitial(currentConv.name) : renderConvIcon(currentConv.type)}
              </div>
              {currentConv.online && (
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-500" />
              )}
            </div>
            <div>
              <div className="text-sm font-semibold">{currentConv.name}</div>
              <div className="text-[10px] text-slate-500">
                {currentConv.type === 'dm'
                  ? (currentConv.online ? '온라인' : '오프라인')
                  : `${currentConv.members.length}명 참여`
                }
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2 text-slate-500 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors"><Phone size={16} /></button>
            <button className="p-2 text-slate-500 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors"><Video size={16} /></button>
            <button className="p-2 text-slate-500 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors"><Search size={16} /></button>
            <button className="p-2 text-slate-500 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors"><MoreVertical size={16} /></button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {currentMessages.map((msg, idx) => renderMessage(msg, idx))}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing indicator */}
        {currentConv.typing && (
          <div className="px-4 py-1.5">
            <span className="text-xs text-slate-500">{currentConv.typing}님이 입력 중
              <span className="inline-flex ml-1">
                <span className="animate-bounce inline-block" style={{ animationDelay: '0ms' }}>.</span>
                <span className="animate-bounce inline-block" style={{ animationDelay: '150ms' }}>.</span>
                <span className="animate-bounce inline-block" style={{ animationDelay: '300ms' }}>.</span>
              </span>
            </span>
          </div>
        )}

        {/* Input */}
        <div className="shrink-0 p-3 border-t border-white/5">
          {/* Emoji picker */}
          {showEmoji && (
            <div className="mb-2 p-2 rounded-lg bg-white/[0.05] border border-white/5 flex flex-wrap gap-1">
              {EMOJI_LIST.map(em => (
                <button key={em} onClick={() => { setNewMessage(prev => prev + em); setShowEmoji(false); textareaRef.current?.focus(); }}
                  className="h-8 w-8 flex items-center justify-center rounded hover:bg-white/[0.08] text-lg transition-colors">
                  {em}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-end gap-2">
            <button className="shrink-0 p-2 text-slate-500 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors mb-0.5">
              <Paperclip size={18} />
            </button>
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={newMessage}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="메시지를 입력하세요..."
                rows={1}
                className="w-full resize-none rounded-xl border border-white/5 bg-white/[0.03] px-4 py-2.5 text-sm focus:border-indigo-500/50 focus:outline-none placeholder:text-slate-600 max-h-[120px]"
              />
            </div>
            <button onClick={() => setShowEmoji(!showEmoji)}
              className="shrink-0 p-2 text-slate-500 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors mb-0.5">
              <Smile size={18} />
            </button>
            <button onClick={handleSend} disabled={!newMessage.trim()}
              className="shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-30 disabled:hover:bg-indigo-600 transition-colors mb-0.5">
              <Send size={16} />
            </button>
          </div>
          <p className="text-[10px] text-slate-600 mt-1.5 ml-11">Enter 전송 / Shift+Enter 줄바꿈</p>
        </div>
      </div>
    );
  };

  /* ───── Main Render ───── */
  return (
    <div className="h-[calc(100vh-theme(spacing.20))] md:h-[calc(100vh-theme(spacing.24))]">
      {isDemo && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-2.5 mb-3 text-xs text-amber-300">
          데모 모드 &mdash; 메시지는 로컬에서만 유지됩니다.
        </div>
      )}

      <div className="flex h-[calc(100%-theme(spacing.10))] rounded-xl border border-white/5 bg-white/[0.01] overflow-hidden">
        {/* Left: Conversation List */}
        <div className={`${showMobileChat ? 'hidden md:flex' : 'flex'} w-full md:w-[280px] md:min-w-[280px] md:max-w-[280px] flex-col border-r border-white/5`}>
          <ConversationList />
        </div>

        {/* Right: Chat View */}
        <div className={`${showMobileChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col min-w-0`}>
          <ChatView />
        </div>
      </div>
    </div>
  );
}
