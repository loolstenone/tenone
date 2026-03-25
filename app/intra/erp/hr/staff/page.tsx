"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, UserCheck, Users, Shield } from "lucide-react";
import { PageHeader, PrimaryButton, StatCard, Card, Badge, Spinner } from "@/components/intra/IntraUI";
import * as erpDb from "@/lib/supabase/erp";

export default function StaffListPage() {
    const [staff, setStaff] = useState<Record<string, unknown>[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        erpDb.fetchStaff()
            .then(data => setStaff(data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Spinner />;

    const active = staff.filter(s => s.account_type === 'staff');
    const withModules = staff.filter(s => (s.module_access as string[])?.length > 5);

    return (
        <div className="space-y-6">
            <PageHeader title="Staff Management" description="직원 등록 및 권한 관리">
                <PrimaryButton href="/intra/erp/hr/staff/register">
                    <Plus className="h-4 w-4" /> 직원 등록
                </PrimaryButton>
            </PageHeader>

            <div className="grid grid-cols-3 gap-4">
                <StatCard label="Active Staff" value={active.length} icon={<UserCheck className="h-4 w-4" />} />
                <StatCard label="전체 Staff" value={staff.length} icon={<Users className="h-4 w-4" />} />
                <StatCard label="Full Access" value={withModules.length} icon={<Shield className="h-4 w-4" />} />
            </div>

            <Card padding={false}>
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-neutral-200 text-xs text-neutral-500 uppercase tracking-wider">
                            <th className="px-6 py-3 text-left">이름</th>
                            <th className="px-4 py-3 text-left">이메일</th>
                            <th className="px-4 py-3 text-left">역할</th>
                            <th className="px-4 py-3 text-left">모듈 접근</th>
                            <th className="px-4 py-3 text-left">가입일</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {staff.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-neutral-400">등록된 직원이 없습니다</td></tr>
                        ) : staff.map(member => (
                            <tr key={member.id as string} className="hover:bg-neutral-50 transition-colors">
                                <td className="px-6 py-4">
                                    <Link href={`/intra/erp/hr/staff/${member.id}`} className="flex items-center gap-3 hover:text-neutral-600 transition-colors">
                                        <div className="h-8 w-8 rounded-full bg-neutral-900 flex items-center justify-center text-xs font-bold text-white">
                                            {((member.name as string) || '?').substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-medium">{member.name as string}</span>
                                    </Link>
                                </td>
                                <td className="px-4 py-4 text-sm text-neutral-500">{member.email as string}</td>
                                <td className="px-4 py-4">
                                    <Badge label={(member.primary_type as string) || 'staff'} variant="info" />
                                </td>
                                <td className="px-4 py-4">
                                    <span className="text-xs text-neutral-500">{((member.module_access as string[]) || []).length}개 모듈</span>
                                </td>
                                <td className="px-4 py-4 text-xs text-neutral-400">
                                    {((member.created_at as string) || '').substring(0, 10)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}
