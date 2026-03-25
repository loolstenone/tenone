"use client";

import { useState } from "react";
import { Plus, ChevronDown, ChevronRight, Clock, History } from "lucide-react";
import clsx from "clsx";
import { PageHeader, PrimaryButton, Badge, Card } from "@/components/intra/IntraUI";

type TodoCategory = '일반' | '프로젝트' | '기타';
type TodoPriority = '높음' | '중간' | '낮음';
type TodoStatus = '대기' | '진행중' | '완료' | '승인대기' | '반려';

interface HistoryEntry { id: string; date: string; action: string; actor: string; comment?: string; }

interface TodoItem {
    id: string; title: string; category: TodoCategory; priority: TodoPriority; status: TodoStatus;
    dueDate: string; assignedBy?: string; project?: string; description?: string;
    history: HistoryEntry[]; createdAt: string;
}

const initialTodos: TodoItem[] = [
    { id: 't1', title: 'LUKI 2nd Single 컨셉 기획안 작성', category: '프로젝트', priority: '높음', status: '진행중', dueDate: '2026-03-25', assignedBy: 'Sarah Kim', project: 'LUKI 2nd Single', description: '2nd 싱글 앨범 컨셉 방향성 기획. AI 생성 비주얼과 스토리라인 포함.', createdAt: '2026-03-15', history: [{ id: 'h1', date: '03-15 09:00', action: '업무 생성', actor: 'Sarah Kim' }, { id: 'h2', date: '03-18 14:30', action: '진행중으로 변경', actor: 'Cheonil Jeon', comment: '컨셉 리서치 시작' }] },
    { id: 't2', title: 'Q2 사업계획서 최종 검토', category: '일반', priority: '높음', status: '진행중', dueDate: '2026-03-28', assignedBy: '박기획', description: '2분기 사업계획서 최종 검토. 예산 항목 재확인.', createdAt: '2026-03-17', history: [{ id: 'h3', date: '03-17 10:00', action: '업무 생성', actor: '박기획' }] },
    { id: 't3', title: 'MADLeague 스폰서 제안서 발송', category: '프로젝트', priority: '높음', status: '승인대기', dueDate: '2026-03-22', assignedBy: 'Sarah Kim', project: '리제로스 시즌2', createdAt: '2026-03-14', history: [{ id: 'h4', date: '03-14 11:00', action: '업무 생성', actor: 'Sarah Kim' }, { id: 'h5', date: '03-20 09:00', action: '완료 보고', actor: 'Cheonil Jeon', comment: '3개 기업 발송 완료' }] },
    { id: 't4', title: '뮤직비디오 스토리보드 리뷰', category: '프로젝트', priority: '중간', status: '진행중', dueDate: '2026-03-23', project: 'LUKI 2nd Single', assignedBy: '김콘텐', createdAt: '2026-03-18', history: [{ id: 'h7', date: '03-18 15:00', action: '업무 생성', actor: '김콘텐' }] },
    { id: 't5', title: 'MADLeap 5기 OT 자료 준비', category: '프로젝트', priority: '중간', status: '대기', dueDate: '2026-03-26', project: 'MADLeap 5기', assignedBy: '김준호', createdAt: '2026-03-19', history: [{ id: 'h8', date: '03-19 10:00', action: '업무 생성', actor: '김준호' }] },
    { id: 't6', title: 'Badak 3월 밋업 후기 콘텐츠', category: '일반', priority: '낮음', status: '대기', dueDate: '2026-03-30', assignedBy: '이수진', createdAt: '2026-03-20', history: [{ id: 'h9', date: '03-20 11:00', action: '업무 생성', actor: '이수진' }] },
    { id: 't7', title: 'AI 배경 이미지 최종 선정', category: '프로젝트', priority: '높음', status: '완료', dueDate: '2026-03-20', project: 'LUKI 2nd Single', assignedBy: '조에이', createdAt: '2026-03-16', history: [{ id: 'h10', date: '03-16 09:00', action: '업무 생성', actor: '조에이' }, { id: 'h11', date: '03-19 16:00', action: '완료', actor: 'Cheonil Jeon', comment: '2번 안 확정' }, { id: 'h12', date: '03-19 17:00', action: '승인', actor: 'Sarah Kim' }] },
    { id: 't8', title: 'GPR Q1 자기평가 작성', category: '기타', priority: '중간', status: '진행중', dueDate: '2026-03-31', createdAt: '2026-03-01', history: [{ id: 'h13', date: '03-01 09:00', action: '자동 생성', actor: 'System' }] },
    { id: 't9', title: '정보보안 필수 교육 이수', category: '기타', priority: '낮음', status: '대기', dueDate: '2026-04-15', createdAt: '2026-03-10', history: [{ id: 'h14', date: '03-10 09:00', action: '자동 생성', actor: 'System' }] },
    { id: 't10', title: 'Evolution School 커리큘럼 검토', category: '일반', priority: '중간', status: '대기', dueDate: '2026-04-05', assignedBy: '구교수', createdAt: '2026-03-20', history: [{ id: 'h15', date: '03-20 14:00', action: '업무 생성', actor: '구교수' }] },
];

const priorityColor: Record<TodoPriority, string> = { '높음': 'bg-red-400', '중간': 'bg-amber-400', '낮음': 'bg-blue-300' };
const statusBadge: Record<TodoStatus, "default" | "success" | "warning" | "danger" | "info"> = { '대기': 'default', '진행중': 'info', '완료': 'success', '승인대기': 'warning', '반려': 'danger' };
const categoryStyle: Record<TodoCategory, string> = { '일반': 'bg-neutral-100 text-neutral-600', '프로젝트': 'bg-violet-50 text-violet-600', '기타': 'bg-sky-50 text-sky-600' };
let counter = 100;

export default function TodoPage() {
    const [todos, setTodos] = useState<TodoItem[]>(initialTodos);
    const [filter, setFilter] = useState<'전체' | TodoCategory>('전체');
    const [statusFilter, setStatusFilter] = useState<'전체' | TodoStatus>('전체');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showHistory, setShowHistory] = useState<string | null>(null);
    const [showAdd, setShowAdd] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newCategory, setNewCategory] = useState<TodoCategory>('일반');
    const [newPriority, setNewPriority] = useState<TodoPriority>('중간');
    const [newDue, setNewDue] = useState('');
    const [newDesc, setNewDesc] = useState('');

    const filtered = todos.filter(t => {
        if (filter !== '전체' && t.category !== filter) return false;
        if (statusFilter !== '전체' && t.status !== statusFilter) return false;
        return true;
    });

    const counts = { total: todos.length, active: todos.filter(t => ['진행중', '대기'].includes(t.status)).length, done: todos.filter(t => t.status === '완료').length, pending: todos.filter(t => t.status === '승인대기').length };

    const toggleStatus = (id: string) => {
        setTodos(prev => prev.map(t => {
            if (t.id !== id) return t;
            const next: TodoStatus = t.status === '완료' ? '진행중' : '완료';
            return { ...t, status: next, history: [...t.history, { id: `h-${counter++}`, date: new Date().toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }), action: `${t.status} → ${next}`, actor: 'Cheonil Jeon' }] };
        }));
    };

    const addTodo = () => {
        if (!newTitle.trim()) return;
        const now = new Date().toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
        setTodos(prev => [{ id: `t-${counter++}`, title: newTitle.trim(), category: newCategory, priority: newPriority, status: '대기' as TodoStatus, dueDate: newDue, description: newDesc || undefined, createdAt: now, history: [{ id: `h-${counter++}`, date: now, action: '업무 생성', actor: 'Cheonil Jeon' }] }, ...prev]);
        setNewTitle(''); setNewDesc(''); setNewDue(''); setShowAdd(false);
    };

    return (
        <div className="max-w-4xl">
            <PageHeader title="Todo" description="업무 관리 · 체크리스트">
                <PrimaryButton onClick={() => setShowAdd(!showAdd)}>
                    <Plus className="h-4 w-4" /> 새 할 일
                </PrimaryButton>
            </PageHeader>

            {showAdd && (
                <Card className="mb-4" padding={false}><div className="p-4 space-y-3">
                    <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="할 일 제목..." autoFocus
                        className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400"
                        onKeyDown={e => { if (e.key === 'Enter') addTodo(); }} />
                    <div className="flex gap-3 items-center">
                        <select value={newCategory} onChange={e => setNewCategory(e.target.value as TodoCategory)} className="px-2 py-1.5 text-[11px] border border-neutral-200 rounded">
                            <option>일반</option><option>프로젝트</option><option>기타</option>
                        </select>
                        <select value={newPriority} onChange={e => setNewPriority(e.target.value as TodoPriority)} className="px-2 py-1.5 text-[11px] border border-neutral-200 rounded">
                            <option>높음</option><option>중간</option><option>낮음</option>
                        </select>
                        <input type="date" value={newDue} onChange={e => setNewDue(e.target.value)} className="px-2 py-1.5 text-[11px] border border-neutral-200 rounded" />
                        <div className="flex-1" />
                        <button onClick={() => setShowAdd(false)} className="text-[11px] text-neutral-400">취소</button>
                        <button onClick={addTodo} disabled={!newTitle.trim()} className="px-3 py-1.5 text-[11px] bg-neutral-900 text-white disabled:opacity-30">추가</button>
                    </div>
                    <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="상세 내용 (선택)..." rows={2}
                        className="w-full px-3 py-2 text-[11px] border border-neutral-200 rounded resize-none focus:outline-none focus:border-neutral-400" />
                </div></Card>
            )}

            <div className="grid grid-cols-4 gap-3 mb-4">
                {[{ l: '전체', v: counts.total }, { l: '진행중', v: counts.active }, { l: '완료', v: counts.done }, { l: '승인대기', v: counts.pending }].map(c => (
                    <Card key={c.l} padding={false} className="p-3 text-center">
                        <p className="text-lg font-bold">{c.v}</p>
                        <p className="text-[11px] text-neutral-400">{c.l}</p>
                    </Card>
                ))}
            </div>

            <div className="flex items-center gap-4 mb-4">
                <div className="flex gap-1">
                    {(['전체', '일반', '프로젝트', '기타'] as const).map(c => (
                        <button key={c} onClick={() => setFilter(c)} className={clsx("px-2.5 py-1 text-xs rounded border", filter === c ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 hover:border-neutral-400')}>{c}</button>
                    ))}
                </div>
                <div className="h-4 w-px bg-neutral-200" />
                <div className="flex gap-1">
                    {(['전체', '대기', '진행중', '완료', '승인대기'] as const).map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)} className={clsx("px-2.5 py-1 text-xs rounded border", statusFilter === s ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 hover:border-neutral-400')}>{s}</button>
                    ))}
                </div>
            </div>

            <div className="space-y-1">
                {filtered.length === 0 && <div className="text-center py-12 text-sm text-neutral-300">해당하는 할 일이 없습니다</div>}
                {filtered.map(todo => {
                    const isExp = expandedId === todo.id;
                    const isHist = showHistory === todo.id;
                    return (
                        <Card key={todo.id} padding={false}>
                            <div className="flex items-center gap-2.5 px-4 py-2.5">
                                <button onClick={() => toggleStatus(todo.id)}
                                    className={clsx("h-4 w-4 rounded border-2 flex items-center justify-center shrink-0",
                                        todo.status === '완료' ? 'bg-green-500 border-green-500 text-white' : 'border-neutral-300 hover:border-neutral-500')}>
                                    {todo.status === '완료' && <span className="text-[11px]">✓</span>}
                                </button>
                                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${priorityColor[todo.priority]}`} />
                                <button onClick={() => setExpandedId(isExp ? null : todo.id)}
                                    className={clsx("flex-1 text-left text-xs min-w-0", todo.status === '완료' ? 'line-through text-neutral-400' : '')}>
                                    {todo.title}
                                </button>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${categoryStyle[todo.category]}`}>{todo.category}</span>
                                {todo.project && <span className="text-[10px] text-neutral-300 shrink-0 max-w-20 truncate">{todo.project}</span>}
                                <Badge label={todo.status} variant={statusBadge[todo.status]} />
                                {todo.dueDate && <span className="flex items-center gap-0.5 text-[10px] text-neutral-300 shrink-0"><Clock className="h-2.5 w-2.5" />{todo.dueDate.slice(5)}</span>}
                                <button onClick={() => setShowHistory(isHist ? null : todo.id)} className={clsx("p-1 rounded shrink-0", isHist ? 'bg-neutral-200' : 'hover:bg-neutral-100')}>
                                    <History className="h-3 w-3 text-neutral-400" />
                                </button>
                                <button onClick={() => setExpandedId(isExp ? null : todo.id)} className="p-0.5 shrink-0">
                                    {isExp ? <ChevronDown className="h-3 w-3 text-neutral-300" /> : <ChevronRight className="h-3 w-3 text-neutral-300" />}
                                </button>
                            </div>
                            {isExp && (
                                <div className="px-4 pb-3 border-t border-neutral-50">
                                    <div className="flex gap-4 py-2 text-xs">
                                        {todo.assignedBy && <div><span className="text-neutral-400">지시: </span>{todo.assignedBy}</div>}
                                        <div><span className="text-neutral-400">우선순위: </span>{todo.priority}</div>
                                        <div><span className="text-neutral-400">생성: </span>{todo.createdAt}</div>
                                    </div>
                                    {todo.description && <p className="text-[11px] text-neutral-500 leading-relaxed">{todo.description}</p>}
                                </div>
                            )}
                            {isHist && (
                                <div className="px-4 pb-3 border-t border-neutral-50 bg-neutral-50/50">
                                    <p className="text-[11px] font-medium text-neutral-500 py-2 uppercase tracking-wider">변경 이력 ({todo.history.length})</p>
                                    <div className="relative pl-4">
                                        <div className="absolute left-[5px] top-0 bottom-0 w-px bg-neutral-200" />
                                        {todo.history.map((h, i) => (
                                            <div key={h.id} className="relative flex gap-3 pb-2 last:pb-0">
                                                <div className={clsx("absolute left-[-11px] top-1 h-2 w-2 rounded-full border-2 border-white", i === todo.history.length - 1 ? 'bg-neutral-400' : 'bg-neutral-200')} />
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[11px] font-medium text-neutral-600">{h.action}</span>
                                                        <span className="text-[10px] text-neutral-300">{h.actor} · {h.date}</span>
                                                    </div>
                                                    {h.comment && <p className="text-[11px] text-neutral-400 italic mt-0.5">&ldquo;{h.comment}&rdquo;</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
