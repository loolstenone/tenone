"use client";

import { useState } from "react";
import { Shield, ChevronDown, ChevronUp, Save } from "lucide-react";

type AccessLevel = "none" | "read" | "write";

interface DeptPermission {
    department: string;
    modules: Record<string, AccessLevel>;
}

interface RolePermission {
    role: string;
    label: string;
    description: string;
    permissions: string[];
}

const MODULES = [
    { key: "erp-hr", label: "ERP-HR" },
    { key: "erp-finance", label: "ERP-Finance" },
    { key: "erp-gpr", label: "ERP-GPR" },
    { key: "project", label: "Project" },
    { key: "marketing", label: "Marketing" },
    { key: "studio", label: "Studio" },
    { key: "wiki", label: "Wiki" },
    { key: "bums", label: "BUMS" },
];

const DEPARTMENTS = ["관리부서", "사업부서", "제작부서", "지원부서"];

const initialDeptPermissions: DeptPermission[] = DEPARTMENTS.map((dept) => ({
    department: dept,
    modules: Object.fromEntries(
        MODULES.map(({ key }) => {
            if (dept === "관리부서") return [key, "write" as AccessLevel];
            if (dept === "사업부서")
                return [
                    key,
                    ["project", "marketing", "studio"].includes(key)
                        ? ("write" as AccessLevel)
                        : ("read" as AccessLevel),
                ];
            if (dept === "제작부서")
                return [
                    key,
                    ["studio", "cms", "wiki"].includes(key)
                        ? ("write" as AccessLevel)
                        : key === "project"
                          ? ("read" as AccessLevel)
                          : ("none" as AccessLevel),
                ];
            // 지원부서
            return [
                key,
                ["wiki", "erp-hr"].includes(key)
                    ? ("write" as AccessLevel)
                    : ["erp-finance", "erp-gpr"].includes(key)
                      ? ("read" as AccessLevel)
                      : ("none" as AccessLevel),
            ];
        })
    ),
}));

const initialRoles: RolePermission[] = [
    {
        role: "admin",
        label: "Admin",
        description: "시스템 전체 관리 권한",
        permissions: [
            "모든 모듈 읽기/쓰기",
            "권한 설정 변경",
            "사용자 관리",
            "시스템 설정",
            "데이터 삭제",
            "감사 로그 조회",
        ],
    },
    {
        role: "manager",
        label: "Manager",
        description: "부서 관리 및 승인 권한",
        permissions: [
            "소속 부서 모듈 읽기/쓰기",
            "결재 승인",
            "부서원 관리",
            "리포트 조회",
            "예산 관리",
        ],
    },
    {
        role: "staff",
        label: "Staff",
        description: "일반 업무 수행 권한",
        permissions: [
            "할당된 모듈 읽기/쓰기",
            "문서 작성",
            "결재 요청",
            "일정 관리",
        ],
    },
    {
        role: "intern",
        label: "Intern",
        description: "제한된 조회 권한",
        permissions: [
            "할당된 모듈 읽기 전용",
            "위키 열람",
            "일정 조회",
        ],
    },
];

const ACCESS_LABELS: Record<AccessLevel, string> = {
    none: "없음",
    read: "읽기",
    write: "쓰기",
};

const ACCESS_COLORS: Record<AccessLevel, string> = {
    none: "bg-neutral-100 text-neutral-400",
    read: "bg-blue-50 text-blue-600",
    write: "bg-emerald-50 text-emerald-600",
};

function cycleAccess(current: AccessLevel): AccessLevel {
    if (current === "none") return "read";
    if (current === "read") return "write";
    return "none";
}

export default function PermissionsPage() {
    const [deptPermissions, setDeptPermissions] =
        useState<DeptPermission[]>(initialDeptPermissions);
    const [expandedRole, setExpandedRole] = useState<string | null>("admin");
    const [saved, setSaved] = useState(false);

    const handleToggle = (deptIndex: number, moduleKey: string) => {
        setDeptPermissions((prev) => {
            const next = [...prev];
            const dept = { ...next[deptIndex] };
            dept.modules = { ...dept.modules };
            dept.modules[moduleKey] = cycleAccess(
                dept.modules[moduleKey] as AccessLevel
            );
            next[deptIndex] = dept;
            return next;
        });
        setSaved(false);
    };

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold">권한 설정</h2>
                    <p className="mt-1 text-sm text-neutral-500">
                        시스템 접근 권한을 관리합니다
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors"
                >
                    <Save className="h-4 w-4" />
                    {saved ? "저장 완료" : "저장"}
                </button>
            </div>

            {/* Department × Module Matrix */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-neutral-400" />
                    <h3 className="text-sm font-semibold">부서별 모듈 접근 권한</h3>
                </div>
                <div className="border border-neutral-200 bg-white overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                        <thead>
                            <tr className="border-b border-neutral-200">
                                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-32">
                                    부서
                                </th>
                                {MODULES.map((m) => (
                                    <th
                                        key={m.key}
                                        className="px-2 py-3 text-center text-[11px] font-medium text-neutral-500 uppercase tracking-wider"
                                    >
                                        {m.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {deptPermissions.map((dept, deptIdx) => (
                                <tr
                                    key={dept.department}
                                    className="hover:bg-neutral-50 transition-colors"
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-neutral-700">
                                        {dept.department}
                                    </td>
                                    {MODULES.map((m) => {
                                        const level = (dept.modules[m.key] ||
                                            "none") as AccessLevel;
                                        return (
                                            <td
                                                key={m.key}
                                                className="px-2 py-3 text-center"
                                            >
                                                <button
                                                    onClick={() =>
                                                        handleToggle(
                                                            deptIdx,
                                                            m.key
                                                        )
                                                    }
                                                    className={`inline-block min-w-[48px] px-2 py-1 text-[11px] font-medium rounded transition-colors cursor-pointer ${ACCESS_COLORS[level]}`}
                                                    title={`클릭하여 변경: 없음 → 읽기 → 쓰기`}
                                                >
                                                    {ACCESS_LABELS[level]}
                                                </button>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="mt-2 text-[11px] text-neutral-400">
                    셀을 클릭하면 없음 → 읽기 → 쓰기 순으로 권한이 변경됩니다
                </p>
            </div>

            {/* Role-based Permissions */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-neutral-400" />
                    <h3 className="text-sm font-semibold">역할별 권한</h3>
                </div>
                <div className="space-y-2">
                    {initialRoles.map((role) => {
                        const isOpen = expandedRole === role.role;
                        return (
                            <div
                                key={role.role}
                                className="border border-neutral-200 bg-white"
                            >
                                <button
                                    onClick={() =>
                                        setExpandedRole(
                                            isOpen ? null : role.role
                                        )
                                    }
                                    className="w-full flex items-center justify-between px-5 py-3 hover:bg-neutral-50 transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-600 font-semibold uppercase tracking-wider rounded">
                                            {role.label}
                                        </span>
                                        <span className="text-sm text-neutral-700">
                                            {role.description}
                                        </span>
                                    </div>
                                    {isOpen ? (
                                        <ChevronUp className="h-4 w-4 text-neutral-400" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4 text-neutral-400" />
                                    )}
                                </button>
                                {isOpen && (
                                    <div className="px-5 pb-4 border-t border-neutral-100">
                                        <ul className="mt-3 space-y-1.5">
                                            {role.permissions.map((perm, i) => (
                                                <li
                                                    key={i}
                                                    className="flex items-center gap-2 text-xs text-neutral-600"
                                                >
                                                    <span className="h-1 w-1 rounded-full bg-neutral-300 shrink-0" />
                                                    {perm}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
