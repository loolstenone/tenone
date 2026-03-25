"use client";

import { useCrm } from "@/lib/crm-context";
import { Tags, Users } from "lucide-react";

const segments = [
    { id: 'seg1', name: 'MADLeague 학생', filter: 'type=Student' },
    { id: 'seg2', name: 'Badak 현업자', filter: 'type=Professional' },
    { id: 'seg3', name: 'YouInOne 멘토', filter: 'type=Mentor' },
    { id: 'seg4', name: '활성 고객', filter: 'status=Active' },
    { id: 'seg5', name: '리드 (잠재)', filter: 'status=Lead' },
    { id: 'seg6', name: '비활성', filter: 'status=Inactive' },
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
                <h2 className="text-xl font-bold">Segments</h2>
                <p className="mt-2 text-neutral-500">고객을 세그먼트로 분류하여 관리합니다.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {segments.map(seg => (
                    <div key={seg.id} className="border border-neutral-200 bg-white p-5 hover:border-neutral-400 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-neutral-100 p-2">
                                <Tags className="h-5 w-5 text-neutral-500" />
                            </div>
                            <div className="flex items-center gap-1 text-xs text-neutral-400">
                                <Users className="h-3 w-3" />
                                {getCount(seg.filter)}명
                            </div>
                        </div>
                        <h3 className="text-sm font-semibold">{seg.name}</h3>
                        <p className="text-xs text-neutral-300 font-mono mt-1">{seg.filter}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
