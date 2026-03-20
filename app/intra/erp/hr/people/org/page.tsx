"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, User, Mail, Phone } from "lucide-react";
import clsx from "clsx";

interface OrgPerson {
    name: string;
    title: string;
    email?: string;
    phone?: string;
    avatar?: string;
}

interface OrgNode {
    id: string;
    name: string;           // 부서/팀 이름 또는 직책
    type: 'executive' | 'division' | 'team' | 'member';
    person?: OrgPerson;     // type=executive|member 일 때
    children?: OrgNode[];
}

const orgData: OrgNode[] = [
    {
        id: 'ceo', name: 'CEO', type: 'executive',
        person: { name: 'Cheonil Jeon', title: '대표이사 · 기업 총괄', email: 'cj@tenone.biz' },
        children: [
            {
                id: 'cho', name: 'CHO', type: 'executive',
                person: { name: '김인사', title: '최고인사책임자 · 인사인재 총괄', email: 'hr@tenone.biz' },
                children: [
                    {
                        id: 'hr-team', name: '인사팀', type: 'team',
                        children: [
                            { id: 'hr-1', name: '박채용', type: 'member', person: { name: '박채용', title: '인사 매니저', email: 'park@tenone.biz' } },
                            { id: 'hr-2', name: '최교육', type: 'member', person: { name: '최교육', title: '교육 담당', email: 'choi@tenone.biz' } },
                        ],
                    },
                    {
                        id: 'talent-team', name: '인재개발팀', type: 'team',
                        children: [
                            { id: 'td-1', name: '정개발', type: 'member', person: { name: '정개발', title: '인재개발 매니저', email: 'jung@tenone.biz' } },
                        ],
                    },
                ],
            },
            {
                id: 'cfo', name: 'CFO', type: 'executive',
                person: { name: '이재무', title: '최고재무책임자 · 재무회계 총괄', email: 'finance@tenone.biz' },
                children: [
                    {
                        id: 'finance-team', name: '재무팀', type: 'team',
                        children: [
                            { id: 'fin-1', name: '강회계', type: 'member', person: { name: '강회계', title: '재무 매니저', email: 'kang@tenone.biz' } },
                            { id: 'fin-2', name: '송세무', type: 'member', person: { name: '송세무', title: '회계 담당', email: 'song@tenone.biz' } },
                        ],
                    },
                ],
            },
            {
                id: 'cbo', name: 'CBO', type: 'executive',
                person: { name: 'Sarah Kim', title: '최고사업책임자 · 프로젝트 총괄', email: 'sarah@tenone.biz' },
                children: [
                    {
                        id: 'studio-div', name: '제작본부', type: 'division',
                        children: [
                            {
                                id: 'content-team', name: '콘텐츠팀', type: 'team',
                                children: [
                                    { id: 'ct-1', name: '김콘텐', type: 'member', person: { name: '김콘텐', title: '콘텐츠 디렉터', email: 'content@tenone.biz' } },
                                    { id: 'ct-2', name: '이영상', type: 'member', person: { name: '이영상', title: '영상 PD', email: 'lee@tenone.biz' } },
                                    { id: 'ct-3', name: '박디자', type: 'member', person: { name: '박디자', title: '디자이너', email: 'design@tenone.biz' } },
                                ],
                            },
                            {
                                id: 'ai-team', name: 'AI팀', type: 'team',
                                children: [
                                    { id: 'ai-1', name: '조에이', type: 'member', person: { name: '조에이', title: 'AI 엔지니어', email: 'ai@tenone.biz' } },
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
                                    { id: 'mk-1', name: '한마케', type: 'member', person: { name: '한마케', title: '마케팅 매니저', email: 'marketing@tenone.biz' } },
                                    { id: 'mk-2', name: '유광고', type: 'member', person: { name: '유광고', title: '퍼포먼스 마케터', email: 'ads@tenone.biz' } },
                                ],
                            },
                            {
                                id: 'partnership-team', name: '파트너십팀', type: 'team',
                                children: [
                                    { id: 'pt-1', name: '김준호', type: 'member', person: { name: '김준호', title: '파트너십 매니저', email: 'partner@tenone.biz' } },
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
                                    { id: 'cm-1', name: '이수진', type: 'member', person: { name: '이수진', title: '커뮤니티 매니저', email: 'community@tenone.biz' } },
                                ],
                            },
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

const typeStyles: Record<string, { bg: string; border: string; badge: string }> = {
    executive: { bg: 'bg-neutral-900', border: 'border-neutral-900', badge: 'bg-neutral-900 text-white' },
    division: { bg: 'bg-white', border: 'border-neutral-300', badge: 'bg-neutral-200 text-neutral-700' },
    team: { bg: 'bg-white', border: 'border-neutral-200', badge: 'bg-blue-50 text-blue-600' },
    member: { bg: 'bg-white', border: 'border-neutral-100', badge: 'bg-neutral-100 text-neutral-500' },
};

const typeLabels: Record<string, string> = {
    executive: '임원',
    division: '본부',
    team: '팀',
    member: '',
};

function OrgTreeNode({ node, depth = 0 }: { node: OrgNode; depth?: number }) {
    const [expanded, setExpanded] = useState(depth < 2);
    const hasChildren = node.children && node.children.length > 0;
    const memberCount = countMembers(node);
    const style = typeStyles[node.type];

    if (node.type === 'member' && node.person) {
        return (
            <div className="ml-6 flex items-center gap-3 py-2 px-3 rounded hover:bg-neutral-50 transition-colors group">
                <div className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center text-[10px] font-bold text-neutral-500 shrink-0">
                    {node.person.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{node.person.name}</p>
                    <p className="text-[10px] text-neutral-400">{node.person.title}</p>
                </div>
                <div className="hidden group-hover:flex items-center gap-2">
                    {node.person.email && (
                        <a href={`mailto:${node.person.email}`} className="text-neutral-400 hover:text-neutral-900">
                            <Mail className="h-3 w-3" />
                        </a>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={clsx(depth > 0 && "ml-4")}>
            <button onClick={() => hasChildren && setExpanded(!expanded)}
                className={clsx(
                    "w-full flex items-center gap-3 py-2.5 px-4 rounded border transition-all",
                    style.border,
                    node.type === 'executive' ? 'bg-neutral-900 text-white hover:bg-neutral-800' : 'bg-white hover:bg-neutral-50',
                    hasChildren && "cursor-pointer"
                )}>
                {hasChildren && (
                    expanded
                        ? <ChevronDown className={clsx("h-4 w-4 shrink-0", node.type === 'executive' ? 'text-neutral-400' : 'text-neutral-400')} />
                        : <ChevronRight className={clsx("h-4 w-4 shrink-0", node.type === 'executive' ? 'text-neutral-400' : 'text-neutral-400')} />
                )}
                {node.person && (
                    <div className={clsx(
                        "h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                        node.type === 'executive' ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-500'
                    )}>
                        {node.person.name[0]}
                    </div>
                )}
                <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2">
                        {node.type !== 'member' && typeLabels[node.type] && (
                            <span className={clsx("text-[9px] px-1.5 py-0.5 rounded font-medium shrink-0", style.badge)}>
                                {node.name}
                            </span>
                        )}
                        {node.person ? (
                            <span className={clsx("text-sm font-medium truncate", node.type === 'executive' ? 'text-white' : '')}>
                                {node.person.name}
                            </span>
                        ) : (
                            <span className="text-sm font-medium">{node.name}</span>
                        )}
                    </div>
                    {node.person && (
                        <p className={clsx("text-[10px] truncate", node.type === 'executive' ? 'text-neutral-400' : 'text-neutral-400')}>
                            {node.person.title}
                        </p>
                    )}
                </div>
                {hasChildren && (
                    <span className={clsx(
                        "text-[10px] shrink-0",
                        node.type === 'executive' ? 'text-neutral-500' : 'text-neutral-400'
                    )}>
                        {memberCount}명
                    </span>
                )}
            </button>

            {expanded && hasChildren && (
                <div className={clsx(
                    "mt-1 space-y-1",
                    depth < 3 && "pl-2 ml-4 border-l border-neutral-200"
                )}>
                    {node.children!.map(child => (
                        <OrgTreeNode key={child.id} node={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function OrgChartPage() {
    const totalMembers = orgData.reduce((sum, n) => sum + countMembers(n), 0);

    return (
        <div className="max-w-4xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">조직도</h1>
                <p className="text-sm text-neutral-500 mt-1">Ten:One™ 조직 구조 · 총 {totalMembers}명</p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mb-6 text-[10px] text-neutral-400">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-neutral-900 rounded" /> 임원 (C-Level)</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-neutral-200 rounded border border-neutral-300" /> 본부</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-blue-50 rounded border border-blue-200" /> 팀</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-white rounded border border-neutral-200" /> 팀원</span>
            </div>

            {/* Tree */}
            <div className="space-y-2">
                {orgData.map(node => (
                    <OrgTreeNode key={node.id} node={node} depth={0} />
                ))}
            </div>
        </div>
    );
}
