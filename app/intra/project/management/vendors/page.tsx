"use client";

import { useState } from "react";
import { Handshake, Plus, Search, Star, Phone, Mail } from "lucide-react";

interface Vendor {
    id: string;
    name: string;
    category: string;
    contactPerson: string;
    phone: string;
    email: string;
    rating: number;
    totalDeals: number;
    status: "활성" | "비활성" | "신규";
}

const mockVendors: Vendor[] = [
    { id: "1", name: "스튜디오 ABC", category: "촬영/임대", contactPerson: "박대표", phone: "02-1234-5678", email: "abc@studio.com", rating: 5, totalDeals: 8, status: "활성" },
    { id: "2", name: "음향스튜디오", category: "녹음/음향", contactPerson: "이음향", phone: "02-2345-6789", email: "sound@studio.com", rating: 4, totalDeals: 5, status: "활성" },
    { id: "3", name: "인쇄소 대한", category: "인쇄/출판", contactPerson: "김인쇄", phone: "02-3456-7890", email: "print@daehan.com", rating: 4, totalDeals: 3, status: "활성" },
    { id: "4", name: "장비 렌탈", category: "장비/렌탈", contactPerson: "최장비", phone: "02-4567-8901", email: "rental@equip.com", rating: 3, totalDeals: 2, status: "활성" },
    { id: "5", name: "디자인랩", category: "디자인", contactPerson: "정디자", phone: "02-5678-9012", email: "hello@designlab.com", rating: 5, totalDeals: 4, status: "활성" },
    { id: "6", name: "IT서비스", category: "IT/호스팅", contactPerson: "한서버", phone: "02-6789-0123", email: "support@itservice.com", rating: 4, totalDeals: 12, status: "활성" },
];

const statusColor: Record<string, string> = { "활성": "bg-green-50 text-green-600", "비활성": "bg-neutral-100 text-neutral-400", "신규": "bg-blue-50 text-blue-600" };

export default function VendorsPage() {
    const [search, setSearch] = useState("");
    const filtered = mockVendors.filter(v => v.name.includes(search) || v.category.includes(search));

    return (
        <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-1">협력사 관리</h1>
                    <p className="text-sm text-neutral-500">협력사 및 외주 업체를 관리합니다.</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                    <Plus className="h-3 w-3" /> 협력사 등록
                </button>
            </div>

            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full border border-neutral-200 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-neutral-400" placeholder="협력사명, 분류 검색..." />
            </div>

            <div className="border border-neutral-200 bg-white">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-neutral-100 text-xs text-neutral-400">
                            <th className="text-left p-3 font-medium">협력사명</th>
                            <th className="text-left p-3 font-medium">분류</th>
                            <th className="text-left p-3 font-medium">담당자</th>
                            <th className="text-left p-3 font-medium">연락처</th>
                            <th className="text-center p-3 font-medium">평가</th>
                            <th className="text-center p-3 font-medium">거래 건수</th>
                            <th className="text-center p-3 font-medium">상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(v => (
                            <tr key={v.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors cursor-pointer">
                                <td className="p-3 font-medium">{v.name}</td>
                                <td className="p-3"><span className="text-[10px] px-2 py-0.5 bg-neutral-100 rounded">{v.category}</span></td>
                                <td className="p-3 text-neutral-500">{v.contactPerson}</td>
                                <td className="p-3">
                                    <div className="flex items-center gap-2 text-neutral-400">
                                        <Phone className="h-3 w-3" />
                                        <span className="text-xs">{v.phone}</span>
                                    </div>
                                </td>
                                <td className="p-3 text-center">
                                    <div className="flex justify-center gap-0.5">
                                        {Array.from({ length: 5 }, (_, i) => (
                                            <Star key={i} className={`h-3 w-3 ${i < v.rating ? "text-yellow-400 fill-yellow-400" : "text-neutral-200"}`} />
                                        ))}
                                    </div>
                                </td>
                                <td className="p-3 text-center">{v.totalDeals}</td>
                                <td className="p-3 text-center"><span className={`text-[10px] px-2 py-0.5 rounded font-medium ${statusColor[v.status]}`}>{v.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
