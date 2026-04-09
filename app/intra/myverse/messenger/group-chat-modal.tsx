"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { divisions } from "@/lib/staff-data";
import { initialStaff } from "@/lib/staff-data";
import {
    currentUserId,
    getStaffName,
    youinoneMembers,
    allianceMembers,
    madleagueByClub,
    madleagueMembers,
} from "./messenger-data";

interface GroupChatModalProps {
    groupName: string;
    setGroupName: (v: string) => void;
    groupSelectedMembers: Set<string>;
    setGroupSelectedMembers: React.Dispatch<React.SetStateAction<Set<string>>>;
    groupExpandedDivs: Set<string>;
    setGroupExpandedDivs: React.Dispatch<React.SetStateAction<Set<string>>>;
    groupExpandedDepts: Set<string>;
    setGroupExpandedDepts: React.Dispatch<React.SetStateAction<Set<string>>>;
    onClose: () => void;
    onConfirm: () => void;
}

function toggleSet(setter: React.Dispatch<React.SetStateAction<Set<string>>>, key: string) {
    setter(prev => {
        const n = new Set(prev);
        if (n.has(key)) n.delete(key); else n.add(key);
        return n;
    });
}

export default function GroupChatModal({
    groupName,
    setGroupName,
    groupSelectedMembers,
    setGroupSelectedMembers,
    groupExpandedDivs,
    setGroupExpandedDivs,
    groupExpandedDepts,
    setGroupExpandedDepts,
    onClose,
    onConfirm,
}: GroupChatModalProps) {
    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white w-[400px] max-w-[95vw] max-h-[500px] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="px-5 py-3 border-b border-neutral-100">
                    <h3 className="text-sm font-semibold">그룹 채팅 만들기</h3>
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
                    <button onClick={onClose} className="px-4 py-1.5 text-xs text-neutral-500 hover:bg-neutral-100">취소</button>
                    <button onClick={onConfirm}
                        disabled={groupSelectedMembers.size < 1 || !groupName.trim()}
                        className="px-4 py-1.5 text-xs bg-neutral-900 text-white disabled:opacity-30 disabled:cursor-not-allowed">
                        생성 ({groupSelectedMembers.size}명 선택)
                    </button>
                </div>
            </div>
        </div>
    );
}
