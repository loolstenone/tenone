"use client";

import { useEffect, useState } from "react";
import { Loader2, Users, Plus, X, User, Phone, Mail, Tag, Search, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { DomainBackLink } from "@/features/myverse/app/DomainBackLink";
import { LaneHeader } from "@/features/myverse/app/LaneHeader";

interface Contact {
    id: string;
    name: string;
    phone?: string | null;
    email?: string | null;
    tags?: string[] | null;
    last_met?: string | null;
    note?: string | null;
}

interface Meeting {
    id: string;
    date: string;
    contact_id: string | null;
    contact_name: string;
    place?: string | null;
    note?: string | null;
}

export const dynamic = "force-dynamic";

export default function RelationPage() {
    const [tab, setTab] = useState<"contacts" | "meetings">("contacts");
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [addOpen, setAddOpen] = useState(false);
    const [addKind, setAddKind] = useState<"contact" | "meeting">("contact");
    const [memberId, setMemberId] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data } = await supabase.from("members").select("id").eq("auth_id", user.id).maybeSingle();
            setMemberId((data as { id: string } | null)?.id ?? null);
            await loadAll(supabase, (data as { id: string } | null)?.id ?? null);
        })();
    }, []);

    async function loadAll(supabase: ReturnType<typeof createClient>, mid: string | null) {
        if (!mid) { setLoading(false); return; }
        setLoading(true);
        try {
            const [c, m] = await Promise.all([
                supabase.from("myverse_contacts").select("id, name, phone, email, tags, last_met, note").eq("member_id", mid).order("name").limit(200),
                supabase.from("myverse_daily_routines").select("id, date, activity, note, body_data").eq("member_id", mid).eq("domain", "relation").order("date", { ascending: false }).limit(100),
            ]);
            setContacts((c.data ?? []) as Contact[]);
            setMeetings(((m.data ?? []) as Array<Record<string, unknown>>).map(r => ({
                id: r.id as string,
                date: r.date as string,
                contact_id: null,
                contact_name: (r.body_data as Record<string, unknown> | null)?.person as string ?? r.activity as string,
                place: (r.body_data as Record<string, unknown> | null)?.place as string | null ?? null,
                note: r.note as string | null ?? null,
            })));
        } finally {
            setLoading(false);
        }
    }

    function reload() {
        const supabase = createClient();
        loadAll(supabase, memberId);
    }

    const filteredContacts = contacts.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.tags ?? []).some(t => t.toLowerCase().includes(search.toLowerCase()))
    );

    function openAdd(kind: "contact" | "meeting") { setAddKind(kind); setAddOpen(true); }

    return (
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            <header className="px-5 sm:px-10 pt-8 pb-4 border-b border-neutral-200 bg-white">
                <LaneHeader
                    icon="diversity_3"
                    label="RELATION"
                    title="관계"
                    subtitle="사람과의 만남 기록"
                    accent="#EF4444"
                    backLink={<DomainBackLink domain="relation" />}
                    actions={
                        <>
                            <button onClick={() => openAdd("meeting")} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-neutral-200 text-neutral-600 hover:bg-neutral-50 rounded-lg">
                                <MessageSquare className="h-3.5 w-3.5" /> 만남 기록
                            </button>
                            <button onClick={() => openAdd("contact")} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-red-500 text-white hover:bg-red-600 rounded-lg">
                                <Plus className="h-3.5 w-3.5" /> 연락처
                            </button>
                        </>
                    }
                />

                {/* 탭 */}
                <div className="flex gap-1 mt-4 border-b border-neutral-200 -mx-5 px-5 sm:-mx-10 sm:px-10">
                    {([
                        { key: "contacts", label: `연락처 ${contacts.length}` },
                        { key: "meetings", label: `만남 기록 ${meetings.length}` },
                    ] as const).map(t => (
                        <button key={t.key} onClick={() => setTab(t.key)}
                            className={`relative px-3 py-2 text-sm transition-colors ${tab === t.key ? "text-red-500 font-semibold" : "text-neutral-400 hover:text-neutral-700"}`}>
                            {t.label}
                            {tab === t.key && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-red-500" />}
                        </button>
                    ))}
                </div>
            </header>

            {/* 검색 (연락처 탭만) */}
            {tab === "contacts" && (
                <div className="px-4 pt-3 pb-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="이름, 태그 검색…"
                            className="w-full pl-8 pr-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-red-300" />
                    </div>
                </div>
            )}

            <div className="p-4">
                {loading ? (
                    <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-neutral-300" /></div>
                ) : tab === "contacts" ? (
                    filteredContacts.length === 0 ? (
                        <EmptyRelation onAdd={() => openAdd("contact")} />
                    ) : (
                        <div className="space-y-2">
                            {filteredContacts.map(c => <ContactCard key={c.id} contact={c} />)}
                        </div>
                    )
                ) : (
                    meetings.length === 0 ? (
                        <div className="text-center py-14">
                            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-50 mb-3">
                                <MessageSquare className="h-5 w-5 text-red-300" />
                            </div>
                            <p className="text-sm text-neutral-400 mb-3">만남 기록이 없습니다</p>
                            <button onClick={() => openAdd("meeting")} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600">
                                <Plus className="h-3.5 w-3.5" /> 기록하기
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {meetings.map(m => <MeetingCard key={m.id} meeting={m} />)}
                        </div>
                    )
                )}
            </div>

            {addOpen && memberId && (
                addKind === "contact"
                    ? <AddContactModal memberId={memberId} onClose={() => setAddOpen(false)} onAdded={reload} />
                    : <AddMeetingModal memberId={memberId} contacts={contacts} onClose={() => setAddOpen(false)} onAdded={reload} />
            )}
        </div>
    );
}

function ContactCard({ contact: c }: { contact: Contact }) {
    const initials = c.name.slice(0, 2).toUpperCase();
    const lastMet = c.last_met ? new Date(c.last_met).toLocaleDateString("ko-KR", { month: "long", day: "numeric" }) : null;
    return (
        <div className="bg-white border border-neutral-200 rounded-xl p-4 flex items-center gap-3">
            <div className="shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-sm font-semibold text-red-600">
                {initials}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-neutral-900">{c.name}</p>
                    {lastMet && <span className="text-[10px] text-neutral-400">마지막 {lastMet}</span>}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                    {c.phone && (
                        <span className="flex items-center gap-1 text-[11px] text-neutral-500">
                            <Phone className="h-3 w-3" />{c.phone}
                        </span>
                    )}
                    {c.email && (
                        <span className="flex items-center gap-1 text-[11px] text-neutral-500 truncate">
                            <Mail className="h-3 w-3" />{c.email}
                        </span>
                    )}
                </div>
                {(c.tags ?? []).length > 0 && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                        {(c.tags ?? []).map(t => (
                            <span key={t} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-red-50 text-red-600 text-[10px]">
                                <Tag className="h-2.5 w-2.5" />{t}
                            </span>
                        ))}
                    </div>
                )}
                {c.note && <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1">{c.note}</p>}
            </div>
        </div>
    );
}

function MeetingCard({ meeting: m }: { meeting: Meeting }) {
    const dt = new Date(m.date + "T00:00:00+09:00");
    const label = `${dt.getMonth() + 1}/${dt.getDate()}`;
    return (
        <div className="bg-white border border-neutral-200 rounded-xl p-4 flex gap-3">
            <div className="shrink-0 text-[10px] text-neutral-400 tabular-nums w-8 text-center pt-1">{label}</div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-red-400 shrink-0" />
                    <p className="text-sm font-medium text-neutral-900">{m.contact_name}</p>
                </div>
                {m.place && <p className="text-[11px] text-neutral-500 mt-0.5">📍 {m.place}</p>}
                {m.note && <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2">{m.note}</p>}
            </div>
        </div>
    );
}

function EmptyRelation({ onAdd }: { onAdd: () => void }) {
    return (
        <div className="text-center py-14">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-50 mb-3">
                <Users className="h-5 w-5 text-red-300" />
            </div>
            <p className="text-sm text-neutral-500 mb-3">연락처가 없습니다</p>
            <button onClick={onAdd} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600">
                <Plus className="h-3.5 w-3.5" /> 추가하기
            </button>
        </div>
    );
}

/* ── 연락처 추가 모달 ── */
function AddContactModal({ memberId, onClose, onAdded }: { memberId: string; onClose: () => void; onAdded: () => void }) {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [tags, setTags] = useState("");
    const [note, setNote] = useState("");
    const [saving, setSaving] = useState(false);

    async function submit() {
        if (!name.trim()) return;
        setSaving(true);
        try {
            const supabase = createClient();
            await supabase.from("myverse_contacts").insert({
                member_id: memberId,
                name: name.trim(),
                phone: phone.trim() || null,
                email: email.trim() || null,
                tags: tags ? tags.split(",").map(s => s.trim()).filter(Boolean) : [],
                note: note.trim() || null,
            });
            onAdded();
            onClose();
        } finally {
            setSaving(false);
        }
    }

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
            <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-xl flex flex-col md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[440px] md:rounded-xl">
                <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
                    <h2 className="text-sm font-semibold text-neutral-900">연락처 추가</h2>
                    <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-700"><X className="h-4 w-4" /></button>
                </div>
                <div className="px-5 py-4 space-y-3">
                    {[
                        { label: "이름 *", value: name, onChange: setName, placeholder: "홍길동", type: "text" },
                        { label: "전화번호", value: phone, onChange: setPhone, placeholder: "010-0000-0000", type: "tel" },
                        { label: "이메일", value: email, onChange: setEmail, placeholder: "email@example.com", type: "email" },
                        { label: "태그 (쉼표 구분)", value: tags, onChange: setTags, placeholder: "동료, 대학친구, 고객", type: "text" },
                        { label: "메모", value: note, onChange: setNote, placeholder: "간단한 메모", type: "text" },
                    ].map(f => (
                        <div key={f.label}>
                            <label className="text-[11px] text-neutral-500">{f.label}</label>
                            <input type={f.type} value={f.value} onChange={e => f.onChange(e.target.value)} placeholder={f.placeholder}
                                className="mt-1 w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-red-300" />
                        </div>
                    ))}
                </div>
                <div className="px-5 pb-5">
                    <button onClick={submit} disabled={saving || !name.trim()}
                        className="w-full py-2.5 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 disabled:opacity-40 flex items-center justify-center gap-2">
                        {saving && <Loader2 className="h-4 w-4 animate-spin" />} 저장
                    </button>
                </div>
            </div>
        </>
    );
}

/* ── 만남 기록 모달 ── */
function AddMeetingModal({ memberId, contacts, onClose, onAdded }: {
    memberId: string; contacts: Contact[]; onClose: () => void; onAdded: () => void;
}) {
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
    const [date, setDate] = useState(today);
    const [person, setPerson] = useState("");
    const [place, setPlace] = useState("");
    const [note, setNote] = useState("");
    const [saving, setSaving] = useState(false);

    async function submit() {
        if (!person.trim()) return;
        setSaving(true);
        try {
            const supabase = createClient();
            await supabase.from("myverse_daily_routines").insert({
                member_id: memberId,
                date,
                activity: `${person} 만남`,
                note: note.trim() || null,
                domain: "relation",
                visibility: "private",
                body_data: { person: person.trim(), place: place.trim() || null },
            });
            // last_met 업데이트
            const matched = contacts.find(c => c.name === person.trim());
            if (matched) {
                await supabase.from("myverse_contacts").update({ last_met: date }).eq("id", matched.id);
            }
            onAdded();
            onClose();
        } finally {
            setSaving(false);
        }
    }

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
            <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-xl flex flex-col md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[440px] md:rounded-xl">
                <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
                    <h2 className="text-sm font-semibold text-neutral-900">만남 기록</h2>
                    <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-700"><X className="h-4 w-4" /></button>
                </div>
                <div className="px-5 py-4 space-y-3">
                    <div>
                        <label className="text-[11px] text-neutral-500">날짜</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)}
                            className="mt-1 w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-red-300" />
                    </div>
                    <div>
                        <label className="text-[11px] text-neutral-500">누구와 *</label>
                        <input list="contact-list" value={person} onChange={e => setPerson(e.target.value)} placeholder="이름 입력 또는 선택"
                            className="mt-1 w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-red-300" />
                        <datalist id="contact-list">
                            {contacts.map(c => <option key={c.id} value={c.name} />)}
                        </datalist>
                    </div>
                    <div>
                        <label className="text-[11px] text-neutral-500">장소</label>
                        <input type="text" value={place} onChange={e => setPlace(e.target.value)} placeholder="카페, 사무실, 온라인 등"
                            className="mt-1 w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-red-300" />
                    </div>
                    <div>
                        <label className="text-[11px] text-neutral-500">메모</label>
                        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="무슨 이야기를 했나요?" rows={3}
                            className="mt-1 w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-red-300" />
                    </div>
                </div>
                <div className="px-5 pb-5">
                    <button onClick={submit} disabled={saving || !person.trim()}
                        className="w-full py-2.5 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 disabled:opacity-40 flex items-center justify-center gap-2">
                        {saving && <Loader2 className="h-4 w-4 animate-spin" />} 저장
                    </button>
                </div>
            </div>
        </>
    );
}
