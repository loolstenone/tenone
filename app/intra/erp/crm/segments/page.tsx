"use client";

import { useCrm } from "@/lib/crm-context";
import { Tags, Users } from "lucide-react";

const segments = [
    { id: 'seg1', name: 'MADLeague 학생', filter: 'type=Student', color: 'text-blue-400 bg-blue-500/10' },
    { id: 'seg2', name: 'Badak 현업자', filter: 'type=Professional', color: 'text-emerald-400 bg-emerald-500/10' },
    { id: 'seg3', name: 'YouInOne 멘토', filter: 'type=Mentor', color: 'text-purple-400 bg-purple-500/10' },
    { id: 'seg4', name: '활성 고객', filter: 'status=Active', color: 'text-emerald-400 bg-emerald-500/10' },
    { id: 'seg5', name: '리드 (잠재)', filter: 'status=Lead', color: 'text-amber-400 bg-amber-500/10' },
    { id: 'seg6', name: '비활성', filter: 'status=Inactive', color: 'text-zinc-400 bg-zinc-800' },
];

export default function SegmentsPage() {
    const { people } = useCrm();

    const getCount = (filter: string) => {
        const [key, val] = filter.split('=');
        return people.filter(p => (p as unknown as Record<string, unknown>)[key] === val).length;
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Segments</h2>
                <p className="mt-2 text-zinc-400">고객을 세그먼트로 분류하여 관리합니다.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {segments.map(seg => (
                    <div key={seg.id} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:border-zinc-600 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`rounded-lg p-2 ${seg.color.split(' ')[1]}`}>
                                <Tags className={`h-5 w-5 ${seg.color.split(' ')[0]}`} />
                            </div>
                            <div className="flex items-center gap-1 text-xs text-zinc-500">
                                <Users className="h-3 w-3" />
                                {getCount(seg.filter)}명
                            </div>
                        </div>
                        <h3 className="text-sm font-semibold text-white">{seg.name}</h3>
                        <p className="text-xs text-zinc-600 font-mono mt-1">{seg.filter}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
