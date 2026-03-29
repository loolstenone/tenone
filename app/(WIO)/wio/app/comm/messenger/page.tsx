'use client';

import { useState } from 'react';
import { MessageSquare, Users, Hash, Send, Plus, Search, X } from 'lucide-react';
import { useWIO } from '../../layout';

type RoomType = 'dm' | 'group' | 'channel';
type Room = { id: string; name: string; type: RoomType; members: string[]; lastMessage: string; lastTime: string; unread: number };
type Message = { id: string; roomId: string; sender: string; text: string; time: string; isMine: boolean };

const MOCK_ROOMS: Room[] = [
  { id: 'r1', name: '김대표', type: 'dm', members: ['김대표', '나'], lastMessage: '내일 회의 자료 확인 부탁드립니다', lastTime: '14:32', unread: 2 },
  { id: 'r2', name: '개발팀', type: 'group', members: ['박개발', '이프론트', '정백엔드', '나'], lastMessage: '배포 완료했습니다!', lastTime: '11:20', unread: 0 },
  { id: 'r3', name: '#공지사항', type: 'channel', members: ['전체'], lastMessage: '4월 워크숍 일정 안내', lastTime: '09:15', unread: 1 },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  r1: [
    { id: 'msg1', roomId: 'r1', sender: '김대표', text: '내일 전략 회의 준비 상황은 어때요?', time: '14:20', isMine: false },
    { id: 'msg2', roomId: 'r1', sender: '나', text: '자료 80% 완성했습니다. 오늘 밤까지 마무리할게요.', time: '14:25', isMine: true },
    { id: 'msg3', roomId: 'r1', sender: '김대표', text: '좋습니다. 시장 분석 파트 좀 더 보완해 주세요.', time: '14:28', isMine: false },
    { id: 'msg4', roomId: 'r1', sender: '나', text: '네, 경쟁사 데이터 업데이트하겠습니다.', time: '14:30', isMine: true },
    { id: 'msg5', roomId: 'r1', sender: '김대표', text: '내일 회의 자료 확인 부탁드립니다', time: '14:32', isMine: false },
  ],
  r2: [
    { id: 'msg6', roomId: 'r2', sender: '박개발', text: 'v2.1 스테이징 배포 시작합니다', time: '10:50', isMine: false },
    { id: 'msg7', roomId: 'r2', sender: '이프론트', text: 'QA 체크리스트 준비 완료', time: '10:55', isMine: false },
    { id: 'msg8', roomId: 'r2', sender: '나', text: '대시보드 성능 테스트 결과 공유합니다. 로딩 시간 40% 개선!', time: '11:05', isMine: true },
    { id: 'msg9', roomId: 'r2', sender: '정백엔드', text: 'API 응답 시간도 평균 120ms로 안정적입니다', time: '11:15', isMine: false },
    { id: 'msg10', roomId: 'r2', sender: '박개발', text: '배포 완료했습니다!', time: '11:20', isMine: false },
  ],
  r3: [
    { id: 'msg11', roomId: 'r3', sender: '최인사', text: '안녕하세요, 4월 워크숍 관련 안내드립니다.', time: '09:00', isMine: false },
    { id: 'msg12', roomId: 'r3', sender: '최인사', text: '일시: 4월 11일(금) 14:00-18:00', time: '09:05', isMine: false },
    { id: 'msg13', roomId: 'r3', sender: '최인사', text: '장소: 강남 코워킹스페이스 3층', time: '09:07', isMine: false },
    { id: 'msg14', roomId: 'r3', sender: '최인사', text: '주제: "AI 시대의 팀 협업"', time: '09:10', isMine: false },
    { id: 'msg15', roomId: 'r3', sender: '최인사', text: '4월 워크숍 일정 안내', time: '09:15', isMine: false },
  ],
};

export default function MessengerPage() {
  const { tenant } = useWIO();
  const [rooms] = useState(MOCK_ROOMS);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [selectedRoom, setSelectedRoom] = useState<string>('r1');
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  if (!tenant) return null;
  const isDemo = tenant.id === 'demo';

  const currentRoom = rooms.find(r => r.id === selectedRoom);
  const currentMessages = messages[selectedRoom] || [];

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const msg: Message = {
      id: `msg${Date.now()}`, roomId: selectedRoom, sender: '나',
      text: newMessage.trim(), time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }), isMine: true,
    };
    setMessages(prev => ({ ...prev, [selectedRoom]: [...(prev[selectedRoom] || []), msg] }));
    setNewMessage('');
  };

  const roomIcon = (type: RoomType) => {
    if (type === 'dm') return <MessageSquare size={14} />;
    if (type === 'group') return <Users size={14} />;
    return <Hash size={14} />;
  };

  const filteredRooms = searchQuery
    ? rooms.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : rooms;

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">메신저</h1>

      {isDemo && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 mb-4 text-sm text-amber-300">
          데모 모드입니다. 메시지는 로컬에서만 유지됩니다.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-200px)]">
        {/* 채팅방 목록 */}
        <div className="lg:col-span-1 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col overflow-hidden">
          <div className="p-3 border-b border-white/5">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="채팅방 검색..."
                className="w-full rounded-lg border border-white/5 bg-white/[0.03] pl-9 pr-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredRooms.map(room => (
              <button key={room.id} onClick={() => setSelectedRoom(room.id)}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 transition-colors ${selectedRoom === room.id ? 'bg-indigo-600/10' : 'hover:bg-white/[0.04]'}`}>
                <div className={`flex h-9 w-9 items-center justify-center rounded-full ${room.type === 'dm' ? 'bg-indigo-600' : room.type === 'group' ? 'bg-emerald-600' : 'bg-slate-600'} text-white`}>
                  {roomIcon(room.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{room.name}</span>
                    <span className="text-[10px] text-slate-600 shrink-0">{room.lastTime}</span>
                  </div>
                  <div className="text-xs text-slate-500 truncate">{room.lastMessage}</div>
                </div>
                {room.unread > 0 && (
                  <span className="text-[10px] bg-indigo-600 text-white rounded-full px-1.5 py-0.5 shrink-0">{room.unread}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 채팅 영역 */}
        <div className="lg:col-span-3 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col overflow-hidden">
          {currentRoom ? (
            <>
              <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full ${currentRoom.type === 'dm' ? 'bg-indigo-600' : currentRoom.type === 'group' ? 'bg-emerald-600' : 'bg-slate-600'} text-white`}>
                  {roomIcon(currentRoom.type)}
                </div>
                <div>
                  <div className="text-sm font-semibold">{currentRoom.name}</div>
                  <div className="text-[10px] text-slate-500">{currentRoom.members.join(', ')}</div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {currentMessages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-xl px-3.5 py-2.5 ${msg.isMine ? 'bg-indigo-600 text-white' : 'bg-white/[0.06] text-slate-200'}`}>
                      {!msg.isMine && <div className="text-[10px] text-slate-400 mb-1">{msg.sender}</div>}
                      <div className="text-sm">{msg.text}</div>
                      <div className={`text-[10px] mt-1 ${msg.isMine ? 'text-indigo-200' : 'text-slate-500'}`}>{msg.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-white/5 flex gap-2">
                <input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="메시지 입력..."
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  className="flex-1 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
                <button onClick={handleSend} disabled={!newMessage.trim()}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors">
                  <Send size={15} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">채팅방을 선택하세요</div>
          )}
        </div>
      </div>
    </div>
  );
}
