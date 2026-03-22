"use client";

import { useState } from "react";
import { Heart, Plus, Edit2, Trash2, Shield, X } from "lucide-react";

interface FamilyMember {
    id: string;
    name: string;
    relation: string;
    birthDate: string;
    phone?: string;
    isDependent: boolean;
    healthInsurance: boolean;
}

const mockFamily: FamilyMember[] = [
    { id: "1", name: "김배우자", relation: "배우자", birthDate: "1990-05-15", phone: "010-2345-6789", isDependent: true, healthInsurance: true },
    { id: "2", name: "전자녀1", relation: "자녀", birthDate: "2018-08-20", isDependent: true, healthInsurance: true },
    { id: "3", name: "전어머니", relation: "부모", birthDate: "1960-03-10", isDependent: true, healthInsurance: false },
];

export default function FamilyPage() {
    const [family] = useState(mockFamily);
    const [showForm, setShowForm] = useState(false);

    return (
        <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-1">가족관리</h1>
                    <p className="text-sm text-neutral-500">가족 및 부양가족 정보를 관리합니다.</p>
                </div>
                <button onClick={() => setShowForm(true)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                    <Plus className="h-3 w-3" /> 가족 등록
                </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: "등록 가족", value: `${family.length}명` },
                    { label: "부양가족", value: `${family.filter(f => f.isDependent).length}명` },
                    { label: "건강보험 피부양자", value: `${family.filter(f => f.healthInsurance).length}명` },
                ].map(s => (
                    <div key={s.label} className="border border-neutral-200 bg-white p-4">
                        <p className="text-xs text-neutral-400 mb-1">{s.label}</p>
                        <p className="text-lg font-bold">{s.value}</p>
                    </div>
                ))}
            </div>

            <div className="space-y-3">
                {family.map(member => (
                    <div key={member.id} className="border border-neutral-200 bg-white p-5 hover:border-neutral-300 transition-colors group">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center">
                                    <Heart className="h-4 w-4 text-neutral-400" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-bold">{member.name}</h3>
                                        <span className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded">{member.relation}</span>
                                    </div>
                                    <p className="text-xs text-neutral-400 mt-0.5">생년월일: {member.birthDate}</p>
                                    {member.phone && <p className="text-xs text-neutral-400">연락처: {member.phone}</p>}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1.5 text-neutral-400 hover:text-neutral-900 transition-colors">
                                    <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors">
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center gap-4">
                            {member.isDependent && (
                                <span className="flex items-center gap-1 text-xs text-blue-600">
                                    <Shield className="h-3 w-3" /> 부양가족
                                </span>
                            )}
                            {member.healthInsurance && (
                                <span className="flex items-center gap-1 text-xs text-green-600">
                                    <Shield className="h-3 w-3" /> 건강보험 피부양자
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Simple form modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">가족 등록</h2>
                            <button onClick={() => setShowForm(false)} className="text-neutral-400 hover:text-neutral-900">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {["이름", "관계", "생년월일", "연락처"].map(label => (
                                <div key={label}>
                                    <label className="text-xs text-neutral-500 mb-1 block">{label}</label>
                                    <input className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-400" placeholder={label} />
                                </div>
                            ))}
                            <div className="flex items-center gap-4 pt-2">
                                <label className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" className="accent-neutral-900" /> 부양가족
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" className="accent-neutral-900" /> 건강보험 피부양자
                                </label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-neutral-200 hover:bg-neutral-50 transition-colors">취소</button>
                            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">등록</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
