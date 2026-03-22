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
                <h2 className="text-2xl font-bold">Students</h2>
                <p className="mt-2 text-neutral-500">MADLeague / MADLeap 대학생 멤버 관리</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="border border-neutral-200 bg-white p-4 text-center">
                    <p className="text-2xl font-bold">{students.length}</p>
                    <p className="text-xs text-neutral-400">Total Students</p>
                </div>
                <div className="border border-neutral-200 bg-white p-4 text-center">
                    <p className="text-2xl font-bold">{students.filter(s => s.status === 'Active').length}</p>
                    <p className="text-xs text-neutral-400">Active</p>
                </div>
                <div className="border border-neutral-200 bg-white p-4 text-center">
                    <p className="text-2xl font-bold">{cohorts.length}</p>
                    <p className="text-xs text-neutral-400">Cohorts</p>
                </div>
            </div>

            {cohorts.map(cohort => (
                <div key={cohort} className="border border-neutral-200 bg-white">
                    <div className="px-6 py-4 border-b border-neutral-200 flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-neutral-500" />
                        <h3 className="text-sm font-semibold">{cohort}</h3>
                        <span className="text-xs text-neutral-400">({students.filter(s => s.cohort === cohort).length}명)</span>
                    </div>
                    <ul className="divide-y divide-neutral-100">
                        {students.filter(s => s.cohort === cohort).map(s => (
                            <li key={s.id} className="px-6 py-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-7 w-7 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center text-xs font-bold">{s.avatarInitials}</div>
                                    <div><p className="text-sm">{s.name}</p><p className="text-xs text-neutral-400">{s.company} · {s.position}</p></div>
                                </div>
                                <span className="text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-500 font-medium">{s.status}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}
