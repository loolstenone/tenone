"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Mail, Phone, Building2, User } from "lucide-react";
import clsx from "clsx";

interface OrgPerson {
    name: string;
    title: string;
    email?: string;
    phone?: string;
    department?: string;
    employeeId?: string;
}

interface OrgNode {
    id: string;
    name: string;
    type: 'executive' | 'division' | 'team' | 'member';
    person?: OrgPerson;
    children?: OrgNode[];
}

const orgData: OrgNode[] = [
    {
        id: 'ceo', name: 'CEO', type: 'executive',
        person: { name: 'Cheonil Jeon', title: '대표이사 · 기업 총괄', email: 'cj@tenone.biz', phone: '010-0000-0001', department: 'CEO Office', employeeId: '2019-0001' },
        children: [
            {
                id: 'cbo', name: 'CBO', type: 'executive',
                person: { name: 'Sarah Kim', title: '최고사업책임자 · 프로젝트 총괄', email: 'sarah@tenone.biz', phone: '010-0000-0004', department: '사업부문', employeeId: '2024-0001' },
                children: [
                    {
                        id: 'studio-div', name: '제작본부', type: 'division',
                        children: [
                            {
                                id: 'content-team', name: '콘텐츠팀', type: 'team',
                                children: [
                                    { id: 'ct-1', name: '김콘텐', type: 'member', person: { name: '김콘텐', title: '콘텐츠 디렉터', email: 'content@tenone.biz', department: '콘텐츠팀', employeeId: '2024-0002' } },
                                    { id: 'ct-2', name: '이영상', type: 'member', person: { name: '이영상', title: '영상 PD', email: 'lee@tenone.biz', department: '콘텐츠팀', employeeId: '2024-0003' } },
                                    { id: 'ct-3', name: '박디자', type: 'member', person: { name: '박디자', title: '디자이너', email: 'design@tenone.biz', department: '콘텐츠팀', employeeId: '2025-0001' } },
                                ],
                            },
                            {
                                id: 'ai-team', name: 'AI팀', type: 'team',
                                children: [
                                    { id: 'ai-1', name: '조에이', type: 'member', person: { name: '조에이', title: 'AI 엔지니어', email: 'ai@tenone.biz', department: 'AI팀', employeeId: '2025-0002' } },
                                ],
                            },
                        ],
                    },
                    {
                        id: 'biz-div', name: '사업본부', type: 'division',
                        children: [
                            {
                                id: 'marketing-team', name: '마케팅팀', type: 'team',
                                children: [
                                    { id: 'mk-1', name: '한마케', type: 'member', person: { name: '한마케', title: '마케팅 매니저', email: 'marketing@tenone.biz', department: '마케팅팀', employeeId: '2024-0004' } },
                                    { id: 'mk-2', name: '유광고', type: 'member', person: { name: '유광고', title: '퍼포먼스 마케터', email: 'ads@tenone.biz', department: '마케팅팀', employeeId: '2025-0003' } },
                                ],
                            },
                            {
                                id: 'partnership-team', name: '파트너십팀', type: 'team',
                                children: [
                                    { id: 'pt-1', name: '김준호', type: 'member', person: { name: '김준호', title: '파트너십 매니저', email: 'partner@tenone.biz', department: '파트너십팀', employeeId: '2024-0005' } },
                                ],
                            },
                        ],
                    },
                    {
                        id: 'network-div', name: '네트워크본부', type: 'division',
                        children: [
                            {
                                id: 'community-team', name: '커뮤니티팀', type: 'team',
                                children: [
                                    { id: 'cm-1', name: '이수진', type: 'member', person: { name: '이수진', title: '커뮤니티 매니저', email: 'community@tenone.biz', department: '커뮤니티팀', employeeId: '2025-0004' } },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 'cho', name: 'CHO', type: 'executive',
                person: { name: '김인사', title: '최고인사책임자 · 인사인재 총괄', email: 'hr@tenone.biz', phone: '010-0000-0002', department: '관리부문', employeeId: '2023-0001' },
                children: [
                    {
                        id: 'hr-team', name: '인사팀', type: 'team',
                        children: [
                            { id: 'hr-1', name: '박채용', type: 'member', person: { name: '박채용', title: '인사 매니저', email: 'park@tenone.biz', department: '인사팀', employeeId: '2024-0006' } },
                            { id: 'hr-2', name: '최교육', type: 'member', person: { name: '최교육', title: '교육 담당', email: 'choi@tenone.biz', department: '인사팀', employeeId: '2024-0007' } },
                        ],
                    },
                    {
                        id: 'talent-team', name: '인재개발팀', type: 'team',
                        children: [
                            { id: 'td-1', name: '정개발', type: 'member', person: { name: '정개발', title: '인재개발 매니저', email: 'jung@tenone.biz', department: '인재개발팀', employeeId: '2024-0008' } },
                        ],
                    },
                ],
            },
            {
                id: 'cfo', name: 'CFO', type: 'executive',
                person: { name: '이재무', title: '최고재무책임자 · 재무회계 총괄', email: 'finance@tenone.biz', phone: '010-0000-0003', department: '관리부문', employeeId: '2023-0002' },
                children: [
                    {
                        id: 'finance-team', name: '재무팀', type: 'team',
                        children: [
                            { id: 'fin-1', name: '강회계', type: 'member', person: { name: '강회계', title: '재무 매니저', email: 'kang@tenone.biz', department: '재무팀', employeeId: '2024-0009' } },
                            { id: 'fin-2', name: '송세무', type: 'member', person: { name: '송세무', title: '회계 담당', email: 'song@tenone.biz', department: '재무팀', employeeId: '2024-0010' } },
                        ],
                    },
                ],
            },
        ],
    },
];

function countMembers(node: OrgNode): number {
    if (node.type === 'member') return 1;
    return (node.children || []).reduce((sum, child) => sum + countMembers(child), 0);
}

function findPersonById(nodes: OrgNode[], id: string): OrgPerson | null {
    for (const node of nodes) {
        if (node.id === id && node.person) return node.person;
        if (node.children) {
            const found = findPersonById(node.children, id);
            if (found) return found;
        }
    }
    return null;
}

function findNodeById(nodes: OrgNode[], id: string): OrgNode | null {
    for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
            const found = findNodeById(node.children, id);
            if (found) return found;
        }
    }
    return null;
}

const typeLabels: Record<string, string> = {
    executive: '임원',
    division: '본부',
    team: '팀',
    member: '팀원',
};

function OrgTreeNode({ node, depth = 0, selectedId, onSelect }: {
    node: OrgNode; depth?: number; selectedId: string | null; onSelect: (id: string) => void;
}) {
    const [expanded, setExpanded] = useState(depth < 2);
    const hasChildren = node.children && node.children.length > 0;
    const memberCount = countMembers(node);
    const isSelected = node.id === selectedId;

    if (node.type === 'member' && node.person) {
        return (
            <button
                onClick={() => onSelect(node.id)}
                className={clsx(
                    "w-full ml-4 flex items-center gap-2.5 py-1.5 px-2.5 rounded text-left transition-colors",
                    isSelected ? "bg-neutral-100" : "hover:bg-neutral-50"
                )}
            >
                <div className="h-6 w-6 rounded-full bg-neutral-200 flex items-center justify-center text-[11px] font-bold text-neutral-500 shrink-0">
                    {node.person.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{node.person.name}</p>
                    <p className="text-[11px] text-neutral-400 truncate">{node.person.title}</p>
                </div>
            </button>
        );
    }

    return (
        <div className={clsx(depth > 0 && "ml-3")}>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => hasChildren && setExpanded(!expanded)}
                    className={clsx(
                        "flex-1 flex items-center gap-2 py-1.5 px-2.5 rounded text-left transition-all text-xs",
                        node.type === 'executive'
                            ? (isSelected ? 'bg-neutral-200 border border-neutral-300' : 'bg-neutral-100 border border-neutral-200 hover:bg-neutral-150')
                            : (isSelected ? 'bg-neutral-100 border border-neutral-300' : 'bg-white border border-neutral-200 hover:bg-neutral-50'),
                        hasChildren && "cursor-pointer"
                    )}
                >
                    {hasChildren && (
                        expanded
                            ? <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
                            : <ChevronRight className="h-3 w-3 shrink-0 opacity-50" />
                    )}
                    {node.person && (
                        <div className={clsx(
                            "h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                            node.type === 'executive' ? 'bg-neutral-300 text-neutral-600' : 'bg-neutral-200 text-neutral-500'
                        )}>
                            {node.person.name[0]}
                        </div>
                    )}
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        {node.type !== 'member' && (
                            <span className={clsx(
                                "text-[10px] px-1 py-px rounded font-medium shrink-0",
                                node.type === 'executive' ? 'bg-neutral-300 text-neutral-600' : 'bg-neutral-100 text-neutral-500'
                            )}>
                                {node.name}
                            </span>
                        )}
                        {node.person ? (
                            <span className="font-medium truncate">{node.person.name}</span>
                        ) : (
                            <span className="font-medium truncate">{node.name}</span>
                        )}
                    </div>
                    {hasChildren && (
                        <span className="text-[11px] opacity-50 shrink-0">{memberCount}</span>
                    )}
                </button>
                {node.person && (
                    <button
                        onClick={() => onSelect(node.id)}
                        className={clsx(
                            "p-1.5 rounded transition-colors",
                            isSelected ? "bg-neutral-200" : "hover:bg-neutral-100"
                        )}
                        title="상세 보기"
                    >
                        <User className="h-3 w-3 text-neutral-400" />
                    </button>
                )}
            </div>

            {expanded && hasChildren && (
                <div className={clsx("mt-0.5 space-y-0.5", depth < 3 && "pl-1 ml-3 border-l border-neutral-200")}>
                    {node.children!.map(child => (
                        <OrgTreeNode key={child.id} node={child} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function OrgChartPage() {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const totalMembers = orgData.reduce((sum, n) => sum + countMembers(n), 0);

    const selectedNode = selectedId ? findNodeById(orgData, selectedId) : null;
    const selectedPerson = selectedNode?.person || null;

    return (
        <div className="flex gap-5 h-full max-w-4xl">
            {/* 좌측: 조직도 트리 */}
            <div className="w-[55%] min-w-0">
                <div className="mb-4">
                    <h1 className="text-xl font-bold">조직도</h1>
                    <p className="text-xs text-neutral-500 mt-0.5">Ten:One™ 조직 구조 · 총 {totalMembers}명</p>
                </div>

                <div className="flex items-center gap-3 mb-4 text-[11px] text-neutral-400">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-neutral-200 rounded border border-neutral-300" /> 임원</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-neutral-200 rounded border border-neutral-300" /> 본부</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-50 rounded border border-blue-200" /> 팀</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-white rounded border border-neutral-200" /> 팀원</span>
                </div>

                <div className="space-y-0.5">
                    {orgData.map(node => (
                        <OrgTreeNode key={node.id} node={node} depth={0} selectedId={selectedId} onSelect={setSelectedId} />
                    ))}
                </div>
            </div>

            {/* 우측: 선택된 인물 정보 */}
            <div className="w-[45%] min-w-0">
                {selectedPerson ? (
                    <div className="border border-neutral-200 p-6 bg-white sticky top-4">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-14 w-14 rounded-full bg-neutral-100 flex items-center justify-center text-lg font-bold text-neutral-400">
                                {selectedPerson.name[0]}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    {selectedNode && selectedNode.type === 'executive' && (
                                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-600 font-medium border border-neutral-300">
                                            {selectedNode.name}
                                        </span>
                                    )}
                                    <h2 className="text-lg font-bold">{selectedPerson.name}</h2>
                                </div>
                                <p className="text-xs text-neutral-500 mt-0.5">{selectedPerson.title}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {selectedPerson.employeeId && (
                                <div className="flex items-center gap-3 py-2 border-b border-neutral-100">
                                    <span className="text-xs text-neutral-400 w-16 shrink-0">사번</span>
                                    <span className="text-sm font-mono">{selectedPerson.employeeId}</span>
                                </div>
                            )}
                            {selectedPerson.department && (
                                <div className="flex items-center gap-3 py-2 border-b border-neutral-100">
                                    <span className="text-xs text-neutral-400 w-16 shrink-0">소속</span>
                                    <div className="flex items-center gap-1.5">
                                        <Building2 className="h-3 w-3 text-neutral-400" />
                                        <span className="text-sm">{selectedPerson.department}</span>
                                    </div>
                                </div>
                            )}
                            {selectedPerson.email && (
                                <div className="flex items-center gap-3 py-2 border-b border-neutral-100">
                                    <span className="text-xs text-neutral-400 w-16 shrink-0">이메일</span>
                                    <div className="flex items-center gap-1.5">
                                        <Mail className="h-3 w-3 text-neutral-400" />
                                        <a href={`mailto:${selectedPerson.email}`} className="text-sm text-blue-600 hover:underline">
                                            {selectedPerson.email}
                                        </a>
                                    </div>
                                </div>
                            )}
                            {selectedPerson.phone && (
                                <div className="flex items-center gap-3 py-2 border-b border-neutral-100">
                                    <span className="text-xs text-neutral-400 w-16 shrink-0">연락처</span>
                                    <div className="flex items-center gap-1.5">
                                        <Phone className="h-3 w-3 text-neutral-400" />
                                        <span className="text-sm">{selectedPerson.phone}</span>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-3 py-2">
                                <span className="text-xs text-neutral-400 w-16 shrink-0">유형</span>
                                <span className="text-xs px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                                    {selectedNode ? typeLabels[selectedNode.type] : ''}
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="border border-dashed border-neutral-200 rounded-lg p-12 flex flex-col items-center justify-center text-center sticky top-4">
                        <User className="h-10 w-10 text-neutral-200 mb-3" />
                        <p className="text-sm text-neutral-400">구성원을 클릭하면</p>
                        <p className="text-sm text-neutral-400">기본 정보가 표시됩니다</p>
                    </div>
                )}
            </div>
        </div>
    );
}
