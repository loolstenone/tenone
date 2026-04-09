// ── Track definitions ──
export interface TrackDef {
  id: string;
  name: string;
  color: string;
  colorBg: string;
  colorBorder: string;
}

export const TRACKS: TrackDef[] = [
  { id: 'track1', name: 'Track 1 운영·관리', color: 'text-blue-400', colorBg: 'bg-blue-500/10', colorBorder: 'border-blue-500/20' },
  { id: 'track2', name: 'Track 2 사업', color: 'text-green-400', colorBg: 'bg-green-500/10', colorBorder: 'border-green-500/20' },
  { id: 'track3', name: 'Track 3 생산', color: 'text-orange-400', colorBg: 'bg-orange-500/10', colorBorder: 'border-orange-500/20' },
  { id: 'track4', name: 'Track 4 지원', color: 'text-purple-400', colorBg: 'bg-purple-500/10', colorBorder: 'border-purple-500/20' },
  { id: 'track5', name: 'Track 5 파트너', color: 'text-cyan-400', colorBg: 'bg-cyan-500/10', colorBorder: 'border-cyan-500/20' },
  { id: 'track6', name: 'Track 6 공통', color: 'text-slate-400', colorBg: 'bg-slate-500/10', colorBorder: 'border-slate-500/20' },
  { id: 'track7', name: 'Track 7 시스템', color: 'text-rose-400', colorBg: 'bg-rose-500/10', colorBorder: 'border-rose-500/20' },
];

// ── Org tree ──
export interface OrgNode {
  id: string;
  name: string;
  type: '본부' | '팀' | '파트';
  head: string;
  memberCount: number;
  trackId: string;
  children?: OrgNode[];
  members?: { id: string; name: string; role: string; level: 'Team Lead' | 'Sub-Lead' | 'Member' }[];
}

export const MOCK_ORG_TREE: Record<string, OrgNode[]> = {
  track1: [
    {
      id: 'org-ops-hq', name: '경영관리본부', type: '본부', head: '김경영', memberCount: 18, trackId: 'track1',
      members: [
        { id: 'm1', name: '김경영', role: '본부장', level: 'Team Lead' },
      ],
      children: [
        {
          id: 'org-hr', name: '인사팀', type: '팀', head: '이인사', memberCount: 5, trackId: 'track1',
          members: [
            { id: 'm2', name: '이인사', role: '팀장', level: 'Team Lead' },
            { id: 'm3', name: '박채용', role: '사원', level: 'Member' },
            { id: 'm4', name: '최교육', role: '사원', level: 'Member' },
            { id: 'm5', name: '정복지', role: '사원', level: 'Member' },
            { id: 'm6', name: '한근태', role: '파트장', level: 'Sub-Lead' },
          ],
          children: [
            {
              id: 'org-hr-recruit', name: '채용파트', type: '파트', head: '한근태', memberCount: 2, trackId: 'track1',
              members: [
                { id: 'm6', name: '한근태', role: '파트장', level: 'Sub-Lead' },
                { id: 'm3', name: '박채용', role: '사원', level: 'Member' },
              ],
            },
          ],
        },
        {
          id: 'org-fin', name: '재무팀', type: '팀', head: '강재무', memberCount: 4, trackId: 'track1',
          members: [
            { id: 'm7', name: '강재무', role: '팀장', level: 'Team Lead' },
            { id: 'm8', name: '윤회계', role: '사원', level: 'Member' },
            { id: 'm9', name: '장세무', role: '사원', level: 'Member' },
            { id: 'm10', name: '임자산', role: '사원', level: 'Member' },
          ],
        },
        {
          id: 'org-strategy', name: '전략기획팀', type: '팀', head: '문전략', memberCount: 3, trackId: 'track1',
          members: [
            { id: 'm11', name: '문전략', role: '팀장', level: 'Team Lead' },
            { id: 'm12', name: '서기획', role: '사원', level: 'Member' },
            { id: 'm13', name: '노분석', role: '사원', level: 'Member' },
          ],
        },
      ],
    },
  ],
  track2: [
    {
      id: 'org-biz-hq', name: '사업본부', type: '본부', head: '정사업', memberCount: 22, trackId: 'track2',
      members: [{ id: 'm20', name: '정사업', role: '본부장', level: 'Team Lead' }],
      children: [
        {
          id: 'org-mkt', name: '마케팅팀', type: '팀', head: '오마케', memberCount: 7, trackId: 'track2',
          members: [
            { id: 'm21', name: '오마케', role: '팀장', level: 'Team Lead' },
            { id: 'm22', name: '김콘텐', role: '사원', level: 'Member' },
            { id: 'm23', name: '이소셜', role: '사원', level: 'Member' },
            { id: 'm24', name: '박퍼포', role: '사원', level: 'Member' },
          ],
        },
        {
          id: 'org-sales', name: '영업팀', type: '팀', head: '유영업', memberCount: 8, trackId: 'track2',
          members: [
            { id: 'm25', name: '유영업', role: '팀장', level: 'Team Lead' },
            { id: 'm26', name: '신리드', role: '사원', level: 'Member' },
            { id: 'm27', name: '홍계약', role: '사원', level: 'Member' },
          ],
        },
        {
          id: 'org-crm', name: 'CRM팀', type: '팀', head: '안고객', memberCount: 4, trackId: 'track2',
          members: [
            { id: 'm28', name: '안고객', role: '팀장', level: 'Team Lead' },
            { id: 'm29', name: '배서비', role: '사원', level: 'Member' },
          ],
        },
      ],
    },
  ],
  track3: [
    {
      id: 'org-prod-hq', name: '생산본부', type: '본부', head: '류생산', memberCount: 15, trackId: 'track3',
      members: [{ id: 'm30', name: '류생산', role: '본부장', level: 'Team Lead' }],
      children: [
        {
          id: 'org-manufacture', name: '제조팀', type: '팀', head: '백제조', memberCount: 8, trackId: 'track3',
          members: [
            { id: 'm31', name: '백제조', role: '팀장', level: 'Team Lead' },
            { id: 'm32', name: '피품질', role: '사원', level: 'Member' },
          ],
        },
        {
          id: 'org-logistics', name: '물류팀', type: '팀', head: '조물류', memberCount: 5, trackId: 'track3',
          members: [
            { id: 'm33', name: '조물류', role: '팀장', level: 'Team Lead' },
            { id: 'm34', name: '권운송', role: '사원', level: 'Member' },
          ],
        },
      ],
    },
  ],
  track4: [
    {
      id: 'org-support-hq', name: '지원본부', type: '본부', head: '차지원', memberCount: 20, trackId: 'track4',
      members: [{ id: 'm40', name: '차지원', role: '본부장', level: 'Team Lead' }],
      children: [
        {
          id: 'org-dev', name: '개발팀', type: '팀', head: '탁개발', memberCount: 10, trackId: 'track4',
          members: [
            { id: 'm41', name: '탁개발', role: '팀장', level: 'Team Lead' },
            { id: 'm42', name: '심백엔', role: '사원', level: 'Member' },
            { id: 'm43', name: '엄프론', role: '사원', level: 'Member' },
          ],
        },
        {
          id: 'org-design', name: '디자인팀', type: '팀', head: '공디자', memberCount: 5, trackId: 'track4',
          members: [
            { id: 'm44', name: '공디자', role: '팀장', level: 'Team Lead' },
            { id: 'm45', name: '양UI', role: '사원', level: 'Member' },
          ],
        },
      ],
    },
  ],
  track5: [
    {
      id: 'org-partner-hq', name: '파트너관리', type: '본부', head: '임파트', memberCount: 3, trackId: 'track5',
      members: [{ id: 'm50', name: '임파트', role: '본부장', level: 'Team Lead' }],
      children: [],
    },
  ],
  track6: [],
  track7: [
    {
      id: 'org-system-hq', name: '시스템관리', type: '본부', head: '전시스', memberCount: 4, trackId: 'track7',
      members: [{ id: 'm60', name: '전시스', role: '본부장', level: 'Team Lead' }],
      children: [
        {
          id: 'org-it', name: 'IT인프라팀', type: '팀', head: '성인프', memberCount: 3, trackId: 'track7',
          members: [
            { id: 'm61', name: '성인프', role: '팀장', level: 'Team Lead' },
            { id: 'm62', name: '구보안', role: '사원', level: 'Member' },
          ],
        },
      ],
    },
  ],
};

// ── Module palette blocks ──
export interface ModuleBlock {
  code: string;
  name: string;
  trackId: string;
  trackColor: string;
}

export const MODULE_BLOCKS: ModuleBlock[] = [
  // Track 1 운영 (파랑)
  { code: 'HR', name: '인사', trackId: 'track1', trackColor: 'bg-blue-500' },
  { code: 'FIN', name: '재무', trackId: 'track1', trackColor: 'bg-blue-500' },
  { code: 'STR', name: '전략', trackId: 'track1', trackColor: 'bg-blue-500' },
  { code: 'GPR', name: 'GPR', trackId: 'track1', trackColor: 'bg-blue-500' },
  { code: 'PAY', name: '급여', trackId: 'track1', trackColor: 'bg-blue-500' },
  { code: 'EVL', name: '평가', trackId: 'track1', trackColor: 'bg-blue-500' },
  { code: 'ATT', name: '근태', trackId: 'track1', trackColor: 'bg-blue-500' },
  { code: 'LRN', name: '교육', trackId: 'track1', trackColor: 'bg-blue-500' },
  { code: 'AUD', name: '감사', trackId: 'track1', trackColor: 'bg-blue-500' },
  { code: 'LEG', name: '법무', trackId: 'track1', trackColor: 'bg-blue-500' },
  // Track 2 사업 (초록)
  { code: 'MKT', name: '마케팅', trackId: 'track2', trackColor: 'bg-green-500' },
  { code: 'SAL', name: '영업', trackId: 'track2', trackColor: 'bg-green-500' },
  { code: 'CRM', name: 'CRM', trackId: 'track2', trackColor: 'bg-green-500' },
  { code: 'BD', name: '사업개발', trackId: 'track2', trackColor: 'bg-green-500' },
  { code: 'CMP', name: '캠페인', trackId: 'track2', trackColor: 'bg-green-500' },
  { code: 'CDP', name: 'CDP', trackId: 'track2', trackColor: 'bg-green-500' },
  // Track 3 생산 (주황)
  { code: 'PRD', name: '제조', trackId: 'track3', trackColor: 'bg-orange-500' },
  { code: 'PRC', name: '구매', trackId: 'track3', trackColor: 'bg-orange-500' },
  { code: 'INV', name: '재고', trackId: 'track3', trackColor: 'bg-orange-500' },
  { code: 'QC', name: '품질', trackId: 'track3', trackColor: 'bg-orange-500' },
  { code: 'LOG', name: '물류', trackId: 'track3', trackColor: 'bg-orange-500' },
  // Track 4 지원 (보라)
  { code: 'DEV', name: '개발', trackId: 'track4', trackColor: 'bg-purple-500' },
  { code: 'DSN', name: '디자인', trackId: 'track4', trackColor: 'bg-purple-500' },
  { code: 'RND', name: 'R&D', trackId: 'track4', trackColor: 'bg-purple-500' },
  { code: 'CNT', name: '콘텐츠', trackId: 'track4', trackColor: 'bg-purple-500' },
  { code: 'DAM', name: 'DAM', trackId: 'track4', trackColor: 'bg-purple-500' },
  // Track 6 공통 (회색)
  { code: 'TLK', name: '게시판', trackId: 'track6', trackColor: 'bg-slate-500' },
  { code: 'APR', name: '결재', trackId: 'track6', trackColor: 'bg-slate-500' },
  { code: 'PRJ', name: '프로젝트', trackId: 'track6', trackColor: 'bg-slate-500' },
  { code: 'MSG', name: '메신저', trackId: 'track6', trackColor: 'bg-slate-500' },
  { code: 'WIK', name: '위키', trackId: 'track6', trackColor: 'bg-slate-500' },
  { code: 'AI', name: 'AI', trackId: 'track6', trackColor: 'bg-slate-500' },
  { code: 'CAL', name: '캘린더', trackId: 'track6', trackColor: 'bg-slate-500' },
  // Track 7 시스템 (로즈)
  { code: 'USR', name: '사용자', trackId: 'track7', trackColor: 'bg-rose-500' },
  { code: 'ROL', name: '권한', trackId: 'track7', trackColor: 'bg-rose-500' },
  { code: 'SEC', name: '보안', trackId: 'track7', trackColor: 'bg-rose-500' },
  { code: 'MON', name: '모니터', trackId: 'track7', trackColor: 'bg-rose-500' },
];

// ── Assigned modules per org ──
export const MOCK_ASSIGNED_MODULES: Record<string, string[]> = {
  'org-hr': ['HR', 'EVL', 'ATT', 'PAY', 'LRN'],
  'org-fin': ['FIN', 'AUD', 'LEG'],
  'org-strategy': ['STR', 'GPR'],
  'org-mkt': ['MKT', 'CMP', 'CNT'],
  'org-sales': ['SAL', 'CRM'],
  'org-crm': ['CRM', 'CDP'],
  'org-manufacture': ['PRD', 'QC', 'INV'],
  'org-logistics': ['LOG', 'PRC'],
  'org-dev': ['DEV', 'RND'],
  'org-design': ['DSN', 'DAM', 'CNT'],
  'org-it': ['USR', 'ROL', 'SEC', 'MON'],
};

// ── Workflow nodes ──
export type WfNodeType = 'start' | 'end' | 'task' | 'condition' | 'approval' | 'parallel' | 'timer' | 'action' | 'notify';

export interface WfNode {
  id: string;
  type: WfNodeType;
  label: string;
  x: number;
  y: number;
  assignee?: string;
  timeout?: string;
  escalation?: string;
}

export interface WfEdge {
  from: string;
  to: string;
  condition?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  nodes: WfNode[];
  edges: WfEdge[];
}

export const WF_NODE_TYPES: { type: WfNodeType; icon: string; label: string }[] = [
  { type: 'start', icon: '○', label: '시작' },
  { type: 'end', icon: '○', label: '종료' },
  { type: 'task', icon: '□', label: '작업' },
  { type: 'condition', icon: '◇', label: '조건분기' },
  { type: 'approval', icon: '▮', label: '승인' },
  { type: 'parallel', icon: '═', label: '병렬' },
  { type: 'timer', icon: '⏱', label: '타이머' },
  { type: 'action', icon: '⚡', label: '자동액션' },
  { type: 'notify', icon: '🔔', label: '알림' },
];

export const APPROVAL_FLOW_TEMPLATE: WorkflowTemplate = {
  id: 'tpl-approval', name: '전자결재',
  description: '표준 4단계 결재 프로세스 (기안→팀장→본부장→최종)',
  nodes: [
    { id: 'n1', type: 'start', label: '기안 시작', x: 60, y: 200 },
    { id: 'n2', type: 'task', label: '기안 작성', x: 200, y: 200, assignee: '담당자' },
    { id: 'n3', type: 'approval', label: '팀장 승인', x: 380, y: 200, assignee: '팀장', timeout: '24시간' },
    { id: 'n4', type: 'condition', label: '금액 확인', x: 560, y: 200 },
    { id: 'n5', type: 'approval', label: '본부장 승인', x: 740, y: 120, assignee: '본부장', timeout: '48시간', escalation: '대표이사' },
    { id: 'n6', type: 'notify', label: '알림 발송', x: 740, y: 280 },
    { id: 'n7', type: 'approval', label: '최종 승인', x: 920, y: 200, assignee: '대표', timeout: '72시간' },
    { id: 'n8', type: 'action', label: '결재 완료 처리', x: 1100, y: 200 },
    { id: 'n9', type: 'end', label: '완료', x: 1260, y: 200 },
  ],
  edges: [
    { from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3' }, { from: 'n3', to: 'n4' },
    { from: 'n4', to: 'n5', condition: '100만원 이상' }, { from: 'n4', to: 'n6', condition: '100만원 미만' },
    { from: 'n5', to: 'n7' }, { from: 'n6', to: 'n8' }, { from: 'n7', to: 'n8' }, { from: 'n8', to: 'n9' },
  ],
};

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  APPROVAL_FLOW_TEMPLATE,
  {
    id: 'tpl-recruit', name: '채용', description: '채용 요청→서류→면접→합격 프로세스',
    nodes: [
      { id: 'r1', type: 'start', label: '채용 요청', x: 60, y: 150 },
      { id: 'r2', type: 'task', label: 'JD 작성', x: 200, y: 150, assignee: 'HR' },
      { id: 'r3', type: 'task', label: '서류 심사', x: 380, y: 150, assignee: 'HR' },
      { id: 'r4', type: 'task', label: '면접', x: 560, y: 150, assignee: '면접관' },
      { id: 'r5', type: 'approval', label: '최종 합격', x: 740, y: 150, assignee: 'HR팀장' },
      { id: 'r6', type: 'end', label: '완료', x: 900, y: 150 },
    ],
    edges: [
      { from: 'r1', to: 'r2' }, { from: 'r2', to: 'r3' }, { from: 'r3', to: 'r4' },
      { from: 'r4', to: 'r5' }, { from: 'r5', to: 'r6' },
    ],
  },
  {
    id: 'tpl-purchase', name: '구매', description: '구매 요청→예산→견적→발주',
    nodes: [
      { id: 'p1', type: 'start', label: '구매 요청', x: 60, y: 150 },
      { id: 'p2', type: 'approval', label: '예산 확인', x: 220, y: 150, assignee: '재무' },
      { id: 'p3', type: 'task', label: '견적 비교', x: 400, y: 150, assignee: '구매 담당' },
      { id: 'p4', type: 'task', label: '발주', x: 580, y: 150, assignee: '구매 담당' },
      { id: 'p5', type: 'end', label: '완료', x: 740, y: 150 },
    ],
    edges: [
      { from: 'p1', to: 'p2' }, { from: 'p2', to: 'p3' }, { from: 'p3', to: 'p4' }, { from: 'p4', to: 'p5' },
    ],
  },
  {
    id: 'tpl-onboard', name: '온보딩', description: '입사 후 계정→장비→서류→부서 배정',
    nodes: [
      { id: 'o1', type: 'start', label: '입사', x: 60, y: 150 },
      { id: 'o2', type: 'parallel', label: '병렬 처리', x: 220, y: 150 },
      { id: 'o3', type: 'task', label: '계정 생성', x: 400, y: 80, assignee: 'IT' },
      { id: 'o4', type: 'task', label: '장비 지급', x: 400, y: 220, assignee: 'IT' },
      { id: 'o5', type: 'task', label: '부서 배정', x: 580, y: 150, assignee: '부서장' },
      { id: 'o6', type: 'end', label: '완료', x: 740, y: 150 },
    ],
    edges: [
      { from: 'o1', to: 'o2' }, { from: 'o2', to: 'o3' }, { from: 'o2', to: 'o4' },
      { from: 'o3', to: 'o5' }, { from: 'o4', to: 'o5' }, { from: 'o5', to: 'o6' },
    ],
  },
  {
    id: 'tpl-resign', name: '퇴직', description: '퇴직 신청→면담→인수인계→계정 정리',
    nodes: [
      { id: 'q1', type: 'start', label: '퇴직 신청', x: 60, y: 150 },
      { id: 'q2', type: 'task', label: '면담', x: 220, y: 150, assignee: '부서장' },
      { id: 'q3', type: 'task', label: '인수인계', x: 400, y: 150, assignee: '담당자' },
      { id: 'q4', type: 'action', label: '계정 비활성화', x: 580, y: 150 },
      { id: 'q5', type: 'end', label: '완료', x: 740, y: 150 },
    ],
    edges: [
      { from: 'q1', to: 'q2' }, { from: 'q2', to: 'q3' }, { from: 'q3', to: 'q4' }, { from: 'q4', to: 'q5' },
    ],
  },
  {
    id: 'tpl-budget', name: '예산', description: '예산 편성→검토→승인→배정',
    nodes: [
      { id: 'b1', type: 'start', label: '예산 제출', x: 60, y: 150 },
      { id: 'b2', type: 'task', label: '검토/조정', x: 220, y: 150, assignee: '재무팀' },
      { id: 'b3', type: 'approval', label: '경영진 승인', x: 400, y: 150, assignee: '대표' },
      { id: 'b4', type: 'action', label: '배정/집행', x: 580, y: 150 },
      { id: 'b5', type: 'end', label: '완료', x: 740, y: 150 },
    ],
    edges: [
      { from: 'b1', to: 'b2' }, { from: 'b2', to: 'b3' }, { from: 'b3', to: 'b4' }, { from: 'b4', to: 'b5' },
    ],
  },
  {
    id: 'tpl-eval', name: '평가', description: '자기평가→동료평가→상사평가→보정',
    nodes: [
      { id: 'e1', type: 'start', label: '평가 시작', x: 60, y: 150 },
      { id: 'e2', type: 'task', label: '자기평가', x: 220, y: 150, assignee: '전 직원' },
      { id: 'e3', type: 'task', label: '동료평가', x: 400, y: 150, assignee: '전 직원' },
      { id: 'e4', type: 'task', label: '상사평가', x: 580, y: 150, assignee: '팀장/본부장' },
      { id: 'e5', type: 'approval', label: '보정/확정', x: 760, y: 150, assignee: 'HR팀' },
      { id: 'e6', type: 'end', label: '완료', x: 920, y: 150 },
    ],
    edges: [
      { from: 'e1', to: 'e2' }, { from: 'e2', to: 'e3' }, { from: 'e3', to: 'e4' },
      { from: 'e4', to: 'e5' }, { from: 'e5', to: 'e6' },
    ],
  },
];

// ── Permission roles ──
export interface PermissionRole {
  id: string;
  name: string;
  description: string;
  dataScope: 'all' | 'division' | 'team' | 'self';
  modules: Record<string, { read: boolean; write: boolean; delete: boolean; admin: boolean }>;
}

export const MOCK_PERMISSION_ROLES: PermissionRole[] = [
  {
    id: 'super-admin', name: 'Super Admin', description: '전체 시스템 관리자. 모든 권한 보유',
    dataScope: 'all',
    modules: Object.fromEntries(MODULE_BLOCKS.map(m => [m.code, { read: true, write: true, delete: true, admin: true }])),
  },
  {
    id: 'track-admin', name: 'Track Admin', description: '트랙(본부) 단위 관리자',
    dataScope: 'division',
    modules: Object.fromEntries(MODULE_BLOCKS.map(m => [m.code, { read: true, write: true, delete: true, admin: false }])),
  },
  {
    id: 'org-admin', name: 'Org Admin', description: '부서 단위 관리자',
    dataScope: 'team',
    modules: Object.fromEntries(MODULE_BLOCKS.map(m => [m.code, { read: true, write: true, delete: false, admin: false }])),
  },
  {
    id: 'team-lead', name: 'Team Lead', description: '팀장급. 팀 데이터 접근',
    dataScope: 'team',
    modules: Object.fromEntries(MODULE_BLOCKS.map(m => [m.code, { read: true, write: true, delete: false, admin: false }])),
  },
  {
    id: 'member', name: 'Member', description: '일반 멤버. 본인 데이터만 접근',
    dataScope: 'self',
    modules: Object.fromEntries(MODULE_BLOCKS.map(m => [m.code, { read: true, write: false, delete: false, admin: false }])),
  },
];
