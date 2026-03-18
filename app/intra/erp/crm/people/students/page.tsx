"use client";

import { useCrm } from "@/lib/crm-context";
import { GraduationCap } from "lucide-react";

export default function StudentsPage() {
    const { people } = useCrm();
    const students = people.filter(p => p.type === 'Student');
    const cohorts = [...new Set(students.map(s => s.cohort).filter(Boolean))] as string[];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Students</h2>
                <p className="mt-2 text-zinc-400">MADLeague / MADLeap 대학생 멤버 관리</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
                    <p className="text-2xl font-bold text-white">{students.length}</p>
                    <p className="text-xs text-zinc-500">Total Students</p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
                    <p className="text-2xl font-bold text-white">{students.filter(s => s.status === 'Active').length}</p>
                    <p className="text-xs text-zinc-500">Active</p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
                    <p className="text-2xl font-bold text-white">{cohorts.length}</p>
                    <p className="text-xs text-zinc-500">Cohorts</p>
                </div>
            </div>

            {cohorts.map(cohort => (
                <div key={cohort} className="rounded-xl border border-zinc-800 bg-zinc-900/30">
                    <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-blue-400" />
                        <h3 className="text-sm font-semibold text-white">{cohort}</h3>
                        <span className="text-xs text-zinc-500">({students.filter(s => s.cohort === cohort).length}명)</span>
                    </div>
                    <ul className="divide-y divide-zinc-800/50">
                        {students.filter(s => s.cohort === cohort).map(s => (
                            <li key={s.id} className="px-6 py-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-7 w-7 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center text-xs font-bold">{s.avatarInitials}</div>
                                    <div><p className="text-sm text-white">{s.name}</p><p className="text-xs text-zinc-500">{s.company} · {s.position}</p></div>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${s.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>{s.status}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}
