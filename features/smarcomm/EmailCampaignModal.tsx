'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Send, Eye, Edit3, ChevronDown } from 'lucide-react';

interface Sender {
    id: string;
    name: string;
    email: string;
}

interface Segment {
    id: string;
    name: string;
    description?: string;
    count?: number;
    color?: string;
}

interface EmailCampaignModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
    senders: Sender[];
}

const EMPTY_FORM = {
    name: '',
    subject: '',
    preheader: '',
    body_text: '',
    sender_id: '',
    segment_id: '',
    person_ids_raw: '',
};

export default function EmailCampaignModal({ isOpen, onClose, onCreated, senders }: EmailCampaignModalProps) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [segments, setSegments] = useState<Segment[]>([]);
    const [bodyTab, setBodyTab] = useState<'write' | 'preview'>('write');
    const [testEmail, setTestEmail] = useState('');
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [error, setError] = useState('');
    const [testResult, setTestResult] = useState('');

    const fetchSegments = useCallback(async () => {
        try {
            const res = await fetch('/api/smarcomm/crm/segments');
            if (res.ok) {
                const data = await res.json();
                setSegments(data.segments ?? []);
            }
        } catch {
            // 세그먼트 로드 실패 시 빈 목록으로 진행
        }
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        setForm(EMPTY_FORM);
        setBodyTab('write');
        setTestEmail('');
        setError('');
        setTestResult('');
        fetchSegments();
    }, [isOpen, fetchSegments]);

    const set = (field: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm(prev => ({ ...prev, [field]: e.target.value }));

    function validate() {
        if (!form.name.trim()) return '캠페인 이름을 입력하세요.';
        if (!form.subject.trim()) return '이메일 제목을 입력하세요.';
        if (!form.body_text.trim()) return '본문을 입력하세요.';
        return '';
    }

    async function createDraft(): Promise<string | null> {
        const person_ids = form.person_ids_raw
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);

        const res = await fetch('/api/smarcomm/email/campaigns', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: form.name.trim(),
                subject: form.subject.trim(),
                body_text: form.body_text.trim(),
                preheader: form.preheader.trim() || undefined,
                sender_id: form.sender_id || undefined,
                segment_id: form.segment_id || undefined,
                person_ids: person_ids.length > 0 ? person_ids : undefined,
            }),
        });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error ?? '캠페인 생성에 실패했습니다.');
        }
        const { id } = await res.json();
        return id;
    }

    async function handleSave() {
        const err = validate();
        if (err) { setError(err); return; }
        setError('');
        setSaving(true);
        try {
            await createDraft();
            onCreated();
            onClose();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : '오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    }

    async function handleTest() {
        const err = validate();
        if (err) { setError(err); return; }
        if (!testEmail.trim()) { setError('테스트 발송할 이메일 주소를 입력하세요.'); return; }
        setError('');
        setTestResult('');
        setTesting(true);
        try {
            const campaignId = await createDraft();
            const res = await fetch('/api/smarcomm/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ campaignId, testEmails: [testEmail.trim()] }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error ?? '테스트 발송에 실패했습니다.');
            setTestResult(`✓ ${testEmail}로 테스트 메일이 발송됐습니다. 초안이 목록에 저장됐어요.`);
            onCreated();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : '테스트 발송 중 오류가 발생했습니다.');
        } finally {
            setTesting(false);
        }
    }

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            onClick={onClose}
        >
            <div
                className="relative flex flex-col w-full max-w-2xl max-h-[90vh] rounded-2xl border border-border bg-white shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                    <h2 className="text-base font-bold text-text">새 이메일 캠페인</h2>
                    <button onClick={onClose} className="rounded-lg p-1 text-text-muted hover:text-text hover:bg-surface transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* 본문 스크롤 영역 */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                    {/* 기본 정보 */}
                    <section className="space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">기본 정보</h3>

                        <div>
                            <label className="block text-xs font-medium text-text-sub mb-1">캠페인 이름 <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={set('name')}
                                placeholder="예: 5월 뉴스레터"
                                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-text/20"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-text-sub mb-1">이메일 제목 <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={form.subject}
                                onChange={set('subject')}
                                placeholder="받은편지함에 표시되는 제목"
                                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-text/20"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-text-sub mb-1">프리헤더 <span className="text-text-muted font-normal">(선택)</span></label>
                            <input
                                type="text"
                                value={form.preheader}
                                onChange={set('preheader')}
                                placeholder="제목 아래 미리보기 텍스트 (약 90자)"
                                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-text/20"
                            />
                        </div>
                    </section>

                    {/* 본문 */}
                    <section className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">본문 <span className="text-red-500">*</span></h3>
                            <div className="flex gap-1 rounded-lg border border-border bg-surface p-0.5">
                                <button
                                    onClick={() => setBodyTab('write')}
                                    className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${bodyTab === 'write' ? 'bg-white text-text shadow-sm' : 'text-text-sub hover:text-text'}`}
                                >
                                    <Edit3 size={11} />
                                    작성
                                </button>
                                <button
                                    onClick={() => setBodyTab('preview')}
                                    className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${bodyTab === 'preview' ? 'bg-white text-text shadow-sm' : 'text-text-sub hover:text-text'}`}
                                >
                                    <Eye size={11} />
                                    미리보기
                                </button>
                            </div>
                        </div>

                        {bodyTab === 'write' ? (
                            <textarea
                                value={form.body_text}
                                onChange={set('body_text')}
                                placeholder="이메일 본문을 입력하세요. 줄바꿈은 그대로 반영됩니다."
                                rows={8}
                                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-text/20 resize-y font-mono"
                            />
                        ) : (
                            <div className="min-h-[12rem] rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text whitespace-pre-wrap leading-relaxed">
                                {form.body_text || <span className="text-text-muted italic">본문을 입력하면 여기에 미리보기가 표시됩니다.</span>}
                            </div>
                        )}
                    </section>

                    {/* 발신자 & 수신 대상 */}
                    <section className="space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">발신자 & 수신 대상</h3>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-text-sub mb-1">발신자</label>
                                <div className="relative">
                                    <select
                                        value={form.sender_id}
                                        onChange={set('sender_id')}
                                        className="w-full appearance-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-text/20 pr-8"
                                    >
                                        <option value="">기본 발신자 (hello)</option>
                                        {senders.map(s => (
                                            <option key={s.id} value={s.id}>{s.name} &lt;{s.email}&gt;</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-text-sub mb-1">세그먼트</label>
                                <div className="relative">
                                    <select
                                        value={form.segment_id}
                                        onChange={set('segment_id')}
                                        className="w-full appearance-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-text/20 pr-8"
                                    >
                                        <option value="">전체 수신자</option>
                                        {segments.map(seg => (
                                            <option key={seg.id} value={seg.id}>
                                                {seg.name}{seg.count != null ? ` (${seg.count}명)` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-text-sub mb-1">
                                개별 수신자 ID <span className="text-text-muted font-normal">(쉼표로 구분, 선택)</span>
                            </label>
                            <input
                                type="text"
                                value={form.person_ids_raw}
                                onChange={set('person_ids_raw')}
                                placeholder="person_id1, person_id2, ..."
                                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-text/20"
                            />
                        </div>
                    </section>

                    {/* 테스트 발송 */}
                    <section className="rounded-xl border border-border bg-surface p-4 space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">테스트 발송</h3>
                        <p className="text-xs text-text-sub">실제 발송 전에 특정 주소로 미리 확인하세요. 초안이 자동 생성됩니다.</p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                value={testEmail}
                                onChange={e => setTestEmail(e.target.value)}
                                placeholder="test@example.com"
                                className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-text/20"
                            />
                            <button
                                onClick={handleTest}
                                disabled={testing || saving}
                                className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-text hover:bg-surface disabled:opacity-50 transition-colors"
                            >
                                <Send size={13} />
                                {testing ? '발송 중…' : '테스트'}
                            </button>
                        </div>
                        {testResult && (
                            <p className="text-xs text-emerald-600 font-medium">{testResult}</p>
                        )}
                    </section>

                    {/* 오류 */}
                    {error && (
                        <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">{error}</p>
                    )}
                </div>

                {/* 푸터 */}
                <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border shrink-0 bg-white">
                    <button
                        onClick={onClose}
                        disabled={saving || testing}
                        className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-sub hover:text-text hover:bg-surface disabled:opacity-50 transition-colors"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || testing}
                        className="rounded-lg bg-text px-4 py-2 text-sm font-semibold text-white hover:bg-accent-sub disabled:opacity-50 transition-colors"
                    >
                        {saving ? '저장 중…' : '초안으로 저장'}
                    </button>
                </div>
            </div>
        </div>
    );
}
