"use client";

import { useStaff } from "@/lib/staff-context";
import { brandOptions } from "@/lib/staff-data";
import Link from "next/link";
import { Plus, Shield, UserCheck } from "lucide-react";

const roleColor: Record<string, string> = { Admin: 'text-red-400 bg-red-500/10', Manager: 'text-amber-400 bg-amber-500/10', Editor: 'text-blue-400 bg-blue-500/10', Viewer: 'text-zinc-400 bg-zinc-800' };
const statusColor: Record<string, string> = { Active: 'text-emerald-400 bg-emerald-500/10', 'On Leave': 'text-amber-400 bg-amber-500/10', Resigned: 'text-red-400 bg-red-500/10' };
const divisionColor: Record<string, string> = { Management: 'text-red-400', Business: 'text-amber-400', Production: 'text-blue-400', Support: 'text-emerald-400' };

export default function StaffListPage() {
    const { staff } = useStaff();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Staff Management</h2>
                    <p className="mt-2 text-zinc-400">직원 등록 및 권한 관리</p>
                </div>
                <Link href="/intra/erp/hr/staff/register" className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors">
                    <Plus className="h-4 w-4" /> 직원 등록
                </Link>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 flex items-center gap-4">
                    <UserCheck className="h-8 w-8 text-emerald-500" />
                    <div>
                        <p className="text-2xl font-bold text-white">{staff.filter(s => s.status === 'Active').length}</p>
                        <p className="text-xs text-zinc-500">Active Staff</p>
                    </div>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 flex items-center gap-4">
                    <Shield className="h-8 w-8 text-indigo-500" />
                    <div>
                        <p className="text-2xl font-bold text-white">{staff.filter(s => s.accessLevel.some(a => a.startsWith('erp'))).length}</p>
                        <p className="text-xs text-zinc-500">ERP Access</p>
                    </div>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 flex items-center gap-4">
                    <Shield className="h-8 w-8 text-blue-500" />
                    <div>
                        <p className="text-2xl font-bold text-white">{staff.filter(s => s.accessLevel.includes('office')).length}</p>
                        <p className="text-xs text-zinc-500">Office Access</p>
                    </div>
                </div>
            </div>

            {/* Staff Table */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-wider">
                            <th className="px-6 py-3 text-left">사번</th>
                            <th className="px-4 py-3 text-left">이름</th>
                            <th className="px-4 py-3 text-left">부서</th>
                            <th className="px-4 py-3 text-left">직위</th>
                            <th className="px-4 py-3 text-left">권한</th>
                            <th className="px-4 py-3 text-left">부문</th>
                            <th className="px-4 py-3 text-left">소속 브랜드</th>
                            <th className="px-4 py-3 text-left">상태</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                        {staff.map(member => (
                            <tr key={member.id} className="hover:bg-zinc-900/50 transition-colors">
                                <td className="px-6 py-4 text-xs font-mono text-zinc-500">{member.employeeId}</td>
                                <td className="px-4 py-4">
                                    <Link href={`/erp/hr/staff/${member.id}`} className="flex items-center gap-3 hover:text-indigo-400 transition-colors">
                                        <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white">{member.avatarInitials}</div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{member.name}</p>
                                            <p className="text-xs text-zinc-500">{member.email}</p>
                                        </div>
                                    </Link>
                                </td>
                                <td className="px-4 py-4 text-sm text-zinc-400">{member.department}</td>
                                <td className="px-4 py-4 text-sm text-zinc-400">{member.position}</td>
                                <td className="px-4 py-4"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColor[member.role]}`}>{member.role}</span></td>
                                <td className={`px-4 py-4 text-xs font-medium ${divisionColor[member.division] ?? 'text-zinc-400'}`}>{member.division}</td>
                                <td className="px-4 py-4">
                                    <div className="flex gap-1 flex-wrap">
                                        {member.brandAssociation.slice(0, 3).map(b => {
                                            const brand = brandOptions.find(bo => bo.id === b);
                                            return <span key={b} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">{brand?.name ?? b}</span>;
                                        })}
                                        {member.brandAssociation.length > 3 && <span className="text-[10px] text-zinc-600">+{member.brandAssociation.length - 3}</span>}
                                    </div>
                                </td>
                                <td className="px-4 py-4"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[member.status]}`}>{member.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
