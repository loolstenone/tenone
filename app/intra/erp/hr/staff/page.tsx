"use client";

import { useStaff } from "@/lib/staff-context";
import { brandOptions } from "@/lib/staff-data";
import Link from "next/link";
import { Plus, Shield, UserCheck } from "lucide-react";

export default function StaffListPage() {
    const { staff } = useStaff();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Staff Management</h2>
                    <p className="mt-1 text-sm text-neutral-500">직원 등록 및 권한 관리</p>
                </div>
                <Link href="/intra/erp/hr/staff/register" className="flex items-center gap-2 bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors">
                    <Plus className="h-4 w-4" /> 직원 등록
                </Link>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="border border-neutral-200 bg-white p-4 flex items-center gap-4">
                    <UserCheck className="h-5 w-5 text-neutral-400" />
                    <div>
                        <p className="text-2xl font-bold">{staff.filter(s => s.status === 'Active').length}</p>
                        <p className="text-xs text-neutral-500">Active Staff</p>
                    </div>
                </div>
                <div className="border border-neutral-200 bg-white p-4 flex items-center gap-4">
                    <Shield className="h-5 w-5 text-neutral-400" />
                    <div>
                        <p className="text-2xl font-bold">{staff.filter(s => s.accessLevel.some(a => a.startsWith('erp'))).length}</p>
                        <p className="text-xs text-neutral-500">ERP Access</p>
                    </div>
                </div>
                <div className="border border-neutral-200 bg-white p-4 flex items-center gap-4">
                    <Shield className="h-5 w-5 text-neutral-400" />
                    <div>
                        <p className="text-2xl font-bold">{staff.filter(s => s.accessLevel.includes('project')).length}</p>
                        <p className="text-xs text-neutral-500">Project Access</p>
                    </div>
                </div>
            </div>

            <div className="border border-neutral-200 bg-white overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-neutral-200 text-xs text-neutral-500 uppercase tracking-wider">
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
                    <tbody className="divide-y divide-neutral-100">
                        {staff.map(member => (
                            <tr key={member.id} className="hover:bg-neutral-50 transition-colors">
                                <td className="px-6 py-4 text-xs font-mono text-neutral-400">{member.employeeId}</td>
                                <td className="px-4 py-4">
                                    <Link href={`/erp/hr/staff/${member.id}`} className="flex items-center gap-3 hover:text-neutral-600 transition-colors">
                                        <div className="h-8 w-8 rounded-full bg-neutral-900 flex items-center justify-center text-xs font-bold text-white">{member.avatarInitials}</div>
                                        <div>
                                            <p className="text-sm font-medium">{member.name}</p>
                                            <p className="text-xs text-neutral-400">{member.email}</p>
                                        </div>
                                    </Link>
                                </td>
                                <td className="px-4 py-4 text-sm text-neutral-500">{member.department}</td>
                                <td className="px-4 py-4 text-sm text-neutral-500">{member.position}</td>
                                <td className="px-4 py-4"><span className="text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-500 font-medium">{member.role}</span></td>
                                <td className="px-4 py-4 text-xs text-neutral-600">{member.division}</td>
                                <td className="px-4 py-4">
                                    <div className="flex gap-1 flex-wrap">
                                        {member.brandAssociation.slice(0, 3).map(b => {
                                            const brand = brandOptions.find(bo => bo.id === b);
                                            return <span key={b} className="text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-500">{brand?.name ?? b}</span>;
                                        })}
                                        {member.brandAssociation.length > 3 && <span className="text-xs text-neutral-400">+{member.brandAssociation.length - 3}</span>}
                                    </div>
                                </td>
                                <td className="px-4 py-4"><span className="text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-500 font-medium">{member.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
