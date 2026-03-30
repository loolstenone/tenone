'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Settings, Users, Palette, Building2, Save, Check, Plus, Trash2,
  ChevronUp, ChevronDown, Pencil, ToggleLeft, ToggleRight, Search,
  GripVertical, UserPlus, ArrowRight, ChevronRight,
  Building, Zap, Clock, Shield, Play,
  User, Eye, X, Undo2, History, Download, Circle, Square, Diamond,
  Timer, Bell, Workflow, MousePointer, Grip, CircleDot, Blocks,
  Upload, Type, Lock, Globe, Mail, CheckSquare, Database, LayoutGrid,
} from 'lucide-react';
import { useWIO } from '../layout';
import OrgTreeBuilder from './OrgTreeBuilder';
import { fetchTenantMembers, updateTenant, inviteMember, updateMemberRole, removeMember } from '@/lib/supabase/wio';
import {
  CATEGORY_CATALOG, MODULE_CATALOG, getModulesByCategory,
  SERVICE_CATALOG, SERVICE_PRESETS, getModulesByService,
  loadOrbiConfig, saveOrbiConfig,
  type OrbiConfig,
} from '@/lib/wio-modules';
import type { WIOMember } from '@/types/wio';

const ROLE_LABELS: Record<string, string> = {
  owner: '소유자', admin: '관리자', manager: '매니저', member: '멤버', guest: '게스트',
};

type SettingsTab = 'settings' | 'permissions' | 'theme' | 'system';
type SettingsMode = 'service' | 'org' | 'module' | 'workflow';

/* ═══════════════════════════════════════════════════════════
   Mock Data — EUS v2.0 Part 15.6
   ═══════════════════════════════════════════════════════════ */

// ── Track definitions ──
interface TrackDef {
  id: string;
  name: string;
  color: string;
  colorBg: string;
  colorBorder: string;
}

const TRACKS: TrackDef[] = [
  { id: 'track1', name: 'Track 1 운영·관리', color: 'text-blue-400', colorBg: 'bg-blue-500/10', colorBorder: 'border-blue-500/20' },
  { id: 'track2', name: 'Track 2 사업', color: 'text-green-400', colorBg: 'bg-green-500/10', colorBorder: 'border-green-500/20' },
  { id: 'track3', name: 'Track 3 생산', color: 'text-orange-400', colorBg: 'bg-orange-500/10', colorBorder: 'border-orange-500/20' },
  { id: 'track4', name: 'Track 4 지원', color: 'text-purple-400', colorBg: 'bg-purple-500/10', colorBorder: 'border-purple-500/20' },
  { id: 'track5', name: 'Track 5 파트너', color: 'text-cyan-400', colorBg: 'bg-cyan-500/10', colorBorder: 'border-cyan-500/20' },
  { id: 'track6', name: 'Track 6 공통', color: 'text-slate-400', colorBg: 'bg-slate-500/10', colorBorder: 'border-slate-500/20' },
  { id: 'track7', name: 'Track 7 시스템', color: 'text-rose-400', colorBg: 'bg-rose-500/10', colorBorder: 'border-rose-500/20' },
];

// ── Org tree ──
interface OrgNode {
  id: string;
  name: string;
  type: '본부' | '팀' | '파트';
  head: string;
  memberCount: number;
  trackId: string;
  children?: OrgNode[];
  members?: { id: string; name: string; role: string; level: 'Team Lead' | 'Sub-Lead' | 'Member' }[];
}

const MOCK_ORG_TREE: Record<string, OrgNode[]> = {
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
interface ModuleBlock {
  code: string;
  name: string;
  trackId: string;
  trackColor: string;
}

const MODULE_BLOCKS: ModuleBlock[] = [
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
const MOCK_ASSIGNED_MODULES: Record<string, string[]> = {
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
type WfNodeType = 'start' | 'end' | 'task' | 'condition' | 'approval' | 'parallel' | 'timer' | 'action' | 'notify';

interface WfNode {
  id: string;
  type: WfNodeType;
  label: string;
  x: number;
  y: number;
  assignee?: string;
  timeout?: string;
  escalation?: string;
}

interface WfEdge {
  from: string;
  to: string;
  condition?: string;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  nodes: WfNode[];
  edges: WfEdge[];
}

const WF_NODE_TYPES: { type: WfNodeType; icon: string; label: string }[] = [
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

const APPROVAL_FLOW_TEMPLATE: WorkflowTemplate = {
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

const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
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
interface PermissionRole {
  id: string;
  name: string;
  description: string;
  dataScope: 'all' | 'division' | 'team' | 'self';
  modules: Record<string, { read: boolean; write: boolean; delete: boolean; admin: boolean }>;
}

const MOCK_PERMISSION_ROLES: PermissionRole[] = [
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

/* ═══════════════════════════════════════════════════════════ */

export default function SettingsPage() {
  const { tenant, member, refreshTenant, reloadConfig: reloadSidebar } = useWIO();
  const [tab, setTab] = useState<SettingsTab>('settings');

  // Settings tab: 3-mode
  const [settingsMode, setSettingsMode] = useState<SettingsMode>('service');
  const [selectedPreset, setSelectedPreset] = useState<string>('full');
  const [enabledServices, setEnabledServices] = useState<string[]>(() => SERVICE_CATALOG.map(s => s.id));
  const [expandedTracks, setExpandedTracks] = useState<string[]>(['track1']);
  const [expandedOrgs, setExpandedOrgs] = useState<string[]>([]);
  const [selectedOrgNode, setSelectedOrgNode] = useState<OrgNode | null>(null);
  const [moduleFilterTrack, setModuleFilterTrack] = useState<string | null>(null);
  const [modulePaletteSearch, setModulePaletteSearch] = useState('');
  const [assignedModules, setAssignedModules] = useState<Record<string, string[]>>(MOCK_ASSIGNED_MODULES);
  const [draggedModule, setDraggedModule] = useState<string | null>(null);
  const [dragOverOrg, setDragOverOrg] = useState<string | null>(null);

  // Workflow mode
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate>(APPROVAL_FLOW_TEMPLATE);
  const [selectedWfNode, setSelectedWfNode] = useState<WfNode | null>(null);
  const [selectedWfEdge, setSelectedWfEdge] = useState<WfEdge | null>(null);
  const [testRunning, setTestRunning] = useState(false);
  const [testStep, setTestStep] = useState(-1);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Permissions tab
  const [permRoles, setPermRoles] = useState<PermissionRole[]>(MOCK_PERMISSION_ROLES);
  const [selectedRole, setSelectedRole] = useState<string>('super-admin');
  const [simUser, setSimUser] = useState('');

  // Theme
  const [editColor, setEditColor] = useState('#6366F1');

  // System tab (org info + members)
  const [editName, setEditName] = useState('');
  const [editServiceName, setEditServiceName] = useState('');
  const [editDomain, setEditDomain] = useState('');
  const [members, setMembers] = useState<WIOMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviting, setInviting] = useState(false);

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  // Init
  useEffect(() => {
    if (tenant) {
      setEditName(tenant.name);
      setEditServiceName(tenant.serviceName);
      setEditDomain(tenant.domain || '');
      setEditColor(tenant.primaryColor);
    }
  }, [tenant]);

  useEffect(() => {
    if (tenant && tab === 'system' && tenant.id !== 'demo') {
      fetchTenantMembers(tenant.id).then(setMembers);
    }
  }, [tenant, tab]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2000); };

  if (!tenant) return null;
  const isDemo = tenant.id === 'demo';

  // ── Org save ──
  async function saveOrg() {
    if (isDemo) { showToast('데모 모드에서는 저장할 수 없습니다'); return; }
    setSaving(true);
    const ok = await updateTenant(tenant!.id, { name: editName, serviceName: editServiceName, domain: editDomain || null } as any);
    setSaving(false);
    if (ok) { showToast('저장되었습니다'); refreshTenant?.(); } else showToast('저장 실패');
  }

  // ── Theme save ──
  async function saveTheme() {
    if (isDemo) { showToast('데모 모드에서는 저장할 수 없습니다'); return; }
    setSaving(true);
    const ok = await updateTenant(tenant!.id, { primaryColor: editColor } as any);
    setSaving(false);
    if (ok) { showToast('테마 저장됨'); refreshTenant?.(); } else showToast('저장 실패');
  }

  // ── Member handlers ──
  async function handleInvite() {
    if (!inviteEmail || isDemo) return;
    setInviting(true);
    const m = await inviteMember(tenant!.id, inviteEmail, inviteRole);
    setInviting(false);
    if (m) { setMembers(prev => [...prev, m]); setInviteEmail(''); showToast('초대 완료'); }
    else showToast('초대 실패');
  }
  async function handleRoleChange(memberId: string, role: string) {
    const ok = await updateMemberRole(memberId, role);
    if (ok) { setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role } as WIOMember : m)); showToast('역할 변경됨'); }
  }
  async function handleRemove(memberId: string) {
    const ok = await removeMember(memberId);
    if (ok) { setMembers(prev => prev.filter(m => m.id !== memberId)); showToast('멤버 제거됨'); }
  }

  // ── Track / Org tree helpers ──
  function toggleTrack(trackId: string) {
    setExpandedTracks(prev => prev.includes(trackId) ? prev.filter(t => t !== trackId) : [...prev, trackId]);
  }
  function toggleOrg(orgId: string) {
    setExpandedOrgs(prev => prev.includes(orgId) ? prev.filter(o => o !== orgId) : [...prev, orgId]);
  }

  function getAssignedCount(orgId: string): number {
    return assignedModules[orgId]?.length || 0;
  }

  function handleDropModule(orgId: string) {
    if (!draggedModule) return;
    setAssignedModules(prev => {
      const current = prev[orgId] || [];
      if (current.includes(draggedModule)) return prev;
      return { ...prev, [orgId]: [...current, draggedModule] };
    });
    setDraggedModule(null);
    setDragOverOrg(null);
    showToast('모듈 할당됨');
  }

  function removeModuleFromOrg(orgId: string, moduleCode: string) {
    setAssignedModules(prev => {
      const current = prev[orgId] || [];
      return { ...prev, [orgId]: current.filter(c => c !== moduleCode) };
    });
    showToast('모듈 제거됨');
  }

  // ── Workflow test run ──
  function startTestRun() {
    setTestRunning(true);
    setTestStep(0);
    const nodes = selectedTemplate.nodes;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step >= nodes.length) {
        clearInterval(interval);
        setTestRunning(false);
        setTestStep(-1);
        showToast('테스트 실행 완료');
      } else {
        setTestStep(step);
      }
    }, 800);
  }

  // ── Node rendering helpers ──
  function getNodeColor(type: WfNodeType): string {
    switch (type) {
      case 'start': return 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400';
      case 'end': return 'bg-red-500/20 border-red-500/40 text-red-400';
      case 'task': return 'bg-blue-500/20 border-blue-500/40 text-blue-400';
      case 'condition': return 'bg-amber-500/20 border-amber-500/40 text-amber-400';
      case 'approval': return 'bg-violet-500/20 border-violet-500/40 text-violet-400';
      case 'parallel': return 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400';
      case 'timer': return 'bg-orange-500/20 border-orange-500/40 text-orange-400';
      case 'action': return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400';
      case 'notify': return 'bg-pink-500/20 border-pink-500/40 text-pink-400';
    }
  }

  function getNodeIcon(type: WfNodeType) {
    switch (type) {
      case 'start': return <Circle size={14} />;
      case 'end': return <CircleDot size={14} />;
      case 'task': return <Square size={14} />;
      case 'condition': return <Diamond size={14} />;
      case 'approval': return <Shield size={14} />;
      case 'parallel': return <Grip size={14} />;
      case 'timer': return <Timer size={14} />;
      case 'action': return <Zap size={14} />;
      case 'notify': return <Bell size={14} />;
    }
  }

  // ── Permission toggle ──
  function togglePermission(roleId: string, moduleCode: string, field: 'read' | 'write' | 'delete' | 'admin') {
    setPermRoles(prev => prev.map(r => {
      if (r.id !== roleId) return r;
      const mod = { ...r.modules[moduleCode] };
      mod[field] = !mod[field];
      return { ...r, modules: { ...r.modules, [moduleCode]: mod } };
    }));
  }

  function setDataScope(roleId: string, scope: PermissionRole['dataScope']) {
    setPermRoles(prev => prev.map(r => r.id === roleId ? { ...r, dataScope: scope } : r));
  }

  // ── Org tree renderer ──
  function renderOrgTree(nodes: OrgNode[], depth: number, track: TrackDef) {
    return nodes.map(node => {
      const isExpanded = expandedOrgs.includes(node.id);
      const isSelected = selectedOrgNode?.id === node.id;
      const isDragOver = dragOverOrg === node.id;
      const assignedCount = getAssignedCount(node.id);

      return (
        <div key={node.id} style={{ paddingLeft: depth * 16 }}>
          <div
            className={`flex items-center gap-2 rounded-lg px-2 py-1.5 cursor-pointer transition-all text-xs
              ${isSelected ? `${track.colorBg} ${track.colorBorder} border` : 'hover:bg-white/5 border border-transparent'}
              ${isDragOver ? 'ring-2 ring-indigo-500/50 bg-indigo-500/10' : ''}`}
            onClick={() => { setSelectedOrgNode(node); if (node.children?.length) toggleOrg(node.id); }}
            onDragOver={e => { e.preventDefault(); setDragOverOrg(node.id); }}
            onDragLeave={() => setDragOverOrg(null)}
            onDrop={e => { e.preventDefault(); handleDropModule(node.id); }}
          >
            {node.children && node.children.length > 0 ? (
              <ChevronRight size={12} className={`text-slate-600 transition-transform shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
            ) : (
              <span className="w-3 shrink-0" />
            )}
            <span className={`text-[9px] px-1 py-0.5 rounded ${track.colorBg} ${track.color}`}>
              {node.type}
            </span>
            <span className="font-medium text-white truncate">{node.name}</span>
            <span className="text-[10px] text-slate-600 ml-auto shrink-0">{node.head}</span>
            <span className="text-[10px] text-slate-600 shrink-0">{node.memberCount}명</span>
            {settingsMode === 'module' && assignedCount > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 shrink-0">
                {assignedCount}
              </span>
            )}
          </div>
          {/* Module pills under org in module mode */}
          {settingsMode === 'module' && isSelected && assignedCount > 0 && (
            <div className="flex flex-wrap gap-1 ml-8 mt-1 mb-1">
              {(assignedModules[node.id] || []).map(code => {
                const block = MODULE_BLOCKS.find(b => b.code === code);
                if (!block) return null;
                return (
                  <div key={code} className="group flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] border border-white/10 bg-white/[0.03]">
                    <div className={`w-1.5 h-1.5 rounded-sm ${block.trackColor}`} />
                    <span className="text-white/70">{block.code}</span>
                    <button onClick={(e) => { e.stopPropagation(); removeModuleFromOrg(node.id, code); }}
                      className="hidden group-hover:block text-slate-600 hover:text-red-400 ml-0.5">
                      <X size={8} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          {isExpanded && node.children && renderOrgTree(node.children, depth + 1, track)}
        </div>
      );
    });
  }

  // ── Render track accordion (shared for left panel in all 3 modes) ──
  function renderTrackAccordion() {
    return (
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {TRACKS.map(track => {
          const isExpanded = expandedTracks.includes(track.id);
          const orgNodes = MOCK_ORG_TREE[track.id] || [];
          return (
            <div key={track.id}>
              <button onClick={() => toggleTrack(track.id)}
                className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors hover:bg-white/5 ${track.color}`}>
                <ChevronRight size={12} className={`text-slate-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                <div className={`w-2 h-2 rounded-full ${track.colorBg.replace('/10', '')}`} />
                {track.name}
                <span className="ml-auto text-[10px] text-slate-600 font-normal">
                  {orgNodes.length > 0 ? `${orgNodes.reduce((sum, n) => sum + n.memberCount, 0)}명` : '-'}
                </span>
              </button>
              {isExpanded && orgNodes.length > 0 && (
                <div className="ml-2 mt-0.5 space-y-0.5">
                  {renderOrgTree(orgNodes, 0, track)}
                </div>
              )}
              {isExpanded && orgNodes.length === 0 && (
                <div className="ml-6 py-2 text-[10px] text-slate-600">조직 없음</div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  const TABS: { id: SettingsTab; label: string; icon: typeof Settings }[] = [
    { id: 'settings', label: '세팅', icon: Settings },
    { id: 'permissions', label: '권한', icon: Shield },
    { id: 'theme', label: '테마', icon: Palette },
    { id: 'system', label: '시스템', icon: Building2 },
  ];

  const MODE_BUTTONS: { id: SettingsMode; label: string; icon: typeof Building; desc: string }[] = [
    { id: 'service', label: '서비스', icon: LayoutGrid, desc: '서비스 활성화' },
    { id: 'org', label: '조직', icon: Building, desc: '조직 구조 설계' },
    { id: 'module', label: '모듈', icon: Blocks, desc: '모듈 배치' },
    { id: 'workflow', label: '워크플로우', icon: Workflow, desc: '업무 흐름 설계' },
  ];

  const currentRole = permRoles.find(r => r.id === selectedRole);

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">설정</h1>
      <p className="text-xs text-slate-500 mb-5">Orbi 시스템 설정 센터</p>

      {isDemo && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 mb-5 text-sm text-amber-300">
          데모 모드입니다. 변경 사항은 브라우저에 저장됩니다.
        </div>
      )}

      {/* Top tabs */}
      <div className="flex gap-1 mb-5 border-b border-white/5 pb-2">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm transition-colors ${tab === t.id ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          TAB 1: 세팅 (3 modes on ONE page)
          ═══════════════════════════════════════════════ */}
      {tab === 'settings' && (
        <div className="space-y-4">
          {/* Mode toggle buttons */}
          <div className="flex items-center gap-2">
            {MODE_BUTTONS.map((vm) => (
              <button key={vm.id} onClick={() => setSettingsMode(vm.id)}
                className={`flex items-center gap-2 rounded-xl border px-5 py-3 transition-all ${
                  settingsMode === vm.id
                    ? 'border-indigo-500/40 bg-indigo-500/10 ring-1 ring-indigo-500/20'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                }`}>
                <vm.icon size={16} className={settingsMode === vm.id ? 'text-indigo-400' : 'text-slate-500'} />
                <div>
                  <p className={`text-sm font-semibold ${settingsMode === vm.id ? 'text-white' : 'text-slate-400'}`}>{vm.label}</p>
                  <p className="text-[10px] text-slate-600">{vm.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* ══ 서비스 모드: 프리셋 + 서비스 토글 ══ */}
          {settingsMode === 'service' && (
            <div className="space-y-6">
              {/* 프리셋 선택 */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3">업종 프리셋</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {SERVICE_PRESETS.map(preset => (
                    <button key={preset.id} onClick={() => {
                      setSelectedPreset(preset.id);
                      if (preset.id !== 'custom') {
                        setEnabledServices(preset.services);
                      }
                    }}
                      className={`rounded-xl border p-4 text-left transition-all ${
                        selectedPreset === preset.id
                          ? 'border-indigo-500/40 bg-indigo-500/10 ring-1 ring-indigo-500/20'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                      }`}>
                      <p className={`text-sm font-semibold ${selectedPreset === preset.id ? 'text-white' : 'text-slate-400'}`}>{preset.label}</p>
                      <p className="text-[11px] text-slate-500 mt-1">{preset.description}</p>
                      {preset.id !== 'custom' && (
                        <p className="text-[10px] text-slate-600 mt-2">{preset.services.length}개 서비스</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 서비스 토글 그리드 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-300">서비스 ({enabledServices.length}/{SERVICE_CATALOG.length})</h3>
                  <button onClick={() => {
                    // 서비스 저장
                    const moduleKeys = enabledServices.flatMap(sId => getModulesByService(sId).map(m => m.key));
                    const config = loadOrbiConfig();
                    config.enabledServices = enabledServices;
                    config.enabledModules = moduleKeys;
                    saveOrbiConfig(config);
                    reloadSidebar();
                    showToast('서비스 설정이 저장되었습니다');
                  }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-500 transition">
                    <Save size={13} /> 저장
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {SERVICE_CATALOG.map(svc => {
                    const isEnabled = enabledServices.includes(svc.id);
                    const SvcIcon = svc.icon;
                    const moduleCount = getModulesByService(svc.id).length;
                    return (
                      <div key={svc.id}
                        onClick={() => {
                          setSelectedPreset('custom');
                          setEnabledServices(prev =>
                            isEnabled ? prev.filter(s => s !== svc.id) : [...prev, svc.id]
                          );
                        }}
                        className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
                          isEnabled
                            ? 'border-indigo-500/30 bg-indigo-500/5'
                            : 'border-white/5 bg-white/[0.02] opacity-50 hover:opacity-70'
                        }`}>
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${
                          isEnabled ? 'bg-indigo-600/20 text-indigo-400' : 'bg-white/5 text-slate-500'
                        }`}>
                          <SvcIcon size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold ${isEnabled ? 'text-white' : 'text-slate-400'}`}>{svc.label}</p>
                          <p className="text-[11px] text-slate-500 truncate">{svc.description}</p>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                          <div className={`w-9 h-5 rounded-full transition-colors ${isEnabled ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                            <div className={`w-4 h-4 mt-0.5 rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                          </div>
                          <span className="text-[9px] text-slate-600 mt-1">{moduleCount}개 모듈</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 조직 모드: OrgTreeBuilder 컴포넌트 사용 */}
          {settingsMode === 'org' && (
            <OrgTreeBuilder
              tenantId={tenant?.id || 'demo'}
              isDemo={isDemo}
              showToast={showToast}
            />
          )}

          {/* 모듈/워크플로우 모드: 기존 좌우 패널 */}
          {settingsMode !== 'org' && (
          <div className="flex gap-4" style={{ minHeight: 'calc(100vh - 340px)' }}>

            {/* ─── LEFT PANEL: Always shows tracks ─── */}
            <div className={`shrink-0 rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden flex flex-col ${
              settingsMode === 'workflow' ? 'w-[240px]' : 'w-[60%]'
            }`}>
              <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">
                  {settingsMode === 'module' ? '조직 + 모듈' : '트랙'}
                </span>
                {settingsMode === 'org' && (
                  <button className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 transition">
                    <Plus size={11} /> 부서 추가
                  </button>
                )}
              </div>
              {renderTrackAccordion()}
            </div>

            {/* ─── RIGHT PANEL: Changes by mode ─── */}
            <div className={`flex-1 min-w-0 rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden flex flex-col`}>

              {/* ══ 조직 모드: OrgTreeBuilder에서 처리 ══ */}

              {/* ══ 모듈 모드 시작 전 placeholder ══ */}
              {false && (
                <>
                  {selectedOrgNode ? (
                    <>
                      <div className="px-5 py-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-indigo-600/15 flex items-center justify-center">
                            <Building size={18} className="text-indigo-400" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white">{selectedOrgNode.name}</h3>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-[10px] text-slate-500">{selectedOrgNode.type}</span>
                              <span className="text-[10px] text-slate-500">|</span>
                              <span className="text-[10px] text-slate-500">장: {selectedOrgNode.head}</span>
                              <span className="text-[10px] text-slate-500">|</span>
                              <span className="text-[10px] text-slate-500">{selectedOrgNode.memberCount}명</span>
                            </div>
                          </div>
                          <div className="ml-auto flex items-center gap-1">
                            <button className="text-[10px] px-2 py-1 rounded-lg bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 transition">
                              <UserPlus size={11} className="inline mr-1" /> 직원 추가
                            </button>
                            <button className="text-[10px] px-2 py-1 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 transition">
                              장 지정
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4">
                        <p className="text-xs font-semibold text-slate-400 mb-3">멤버 목록</p>
                        <div className="space-y-1">
                          {(selectedOrgNode.members || []).map((m, i) => (
                            <div key={m.id + i}
                              className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 hover:bg-white/5 transition group">
                              <GripVertical size={12} className="text-slate-700 group-hover:text-slate-500 cursor-grab" />
                              <div className="h-7 w-7 rounded-full bg-indigo-600/20 flex items-center justify-center text-[10px] font-bold text-indigo-400">
                                {m.name.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-xs font-medium text-white">{m.name}</span>
                                <span className="text-[10px] text-slate-500 ml-2">{m.role}</span>
                              </div>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                                m.level === 'Team Lead' ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' :
                                m.level === 'Sub-Lead' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                                'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                              }`}>
                                {m.level}
                              </span>
                            </div>
                          ))}
                          {(!selectedOrgNode.members || selectedOrgNode.members.length === 0) && (
                            <p className="text-center py-6 text-[10px] text-slate-600">멤버가 없습니다</p>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-600">
                      <div className="text-center">
                        <Building size={32} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm">왼쪽에서 조직을 선택하세요</p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ══ 모듈 모드: Right = Module palette ══ */}
              {settingsMode === 'module' && (
                <>
                  <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-400">모듈 팔레트</span>
                    <div className="relative flex-1 max-w-[200px]">
                      <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-600" />
                      <input value={modulePaletteSearch} onChange={e => setModulePaletteSearch(e.target.value)}
                        placeholder="모듈 검색..."
                        className="w-full pl-7 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[11px] text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none" />
                    </div>
                    <div className="flex items-center gap-1 ml-auto">
                      <button onClick={() => setModuleFilterTrack(null)}
                        className={`text-[10px] px-2 py-1 rounded-md transition ${!moduleFilterTrack ? 'bg-indigo-500/15 text-indigo-400' : 'text-slate-500 hover:bg-white/5'}`}>
                        전체
                      </button>
                      {TRACKS.filter(t => t.id !== 'track5').map(t => (
                        <button key={t.id} onClick={() => setModuleFilterTrack(t.id)}
                          className={`text-[10px] px-2 py-1 rounded-md transition ${moduleFilterTrack === t.id ? `${t.colorBg} ${t.color}` : 'text-slate-500 hover:bg-white/5'}`}>
                          {t.name.split(' ').pop()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4">
                    {/* Color legend */}
                    <div className="flex items-center gap-3 mb-4 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-500" /> 운영</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-green-500" /> 사업</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-orange-500" /> 생산</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-purple-500" /> 지원</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-slate-500" /> 공통</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-rose-500" /> 시스템</span>
                    </div>

                    <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                      {MODULE_BLOCKS
                        .filter(b => !moduleFilterTrack || b.trackId === moduleFilterTrack)
                        .filter(b => !modulePaletteSearch || b.name.includes(modulePaletteSearch) || b.code.includes(modulePaletteSearch.toUpperCase()))
                        .map(block => {
                          const isAssigned = selectedOrgNode && (assignedModules[selectedOrgNode.id] || []).includes(block.code);
                          return (
                            <div key={block.code}
                              draggable
                              onDragStart={() => setDraggedModule(block.code)}
                              onDragEnd={() => { setDraggedModule(null); setDragOverOrg(null); }}
                              onClick={() => {
                                if (selectedOrgNode && !isAssigned) {
                                  setAssignedModules(prev => ({
                                    ...prev,
                                    [selectedOrgNode.id]: [...(prev[selectedOrgNode.id] || []), block.code],
                                  }));
                                  showToast(`${block.name} 할당됨`);
                                }
                              }}
                              className={`relative flex flex-col items-center gap-1.5 rounded-xl border p-3 cursor-grab transition-all hover:border-white/20 active:scale-95 ${
                                isAssigned
                                  ? 'border-indigo-500/30 bg-indigo-500/5 opacity-50'
                                  : 'border-white/5 bg-white/[0.02] hover:bg-white/5'
                              }`}>
                              <div className={`w-3 h-3 rounded-md ${block.trackColor}`} />
                              <span className="text-[11px] font-bold text-white">{block.code}</span>
                              <span className="text-[9px] text-slate-500">{block.name}</span>
                              {isAssigned && (
                                <span className="absolute top-1 right-1 text-indigo-400">
                                  <Check size={10} />
                                </span>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </>
              )}

              {/* ══ 워크플로우 모드: Right = workflow canvas ══ */}
              {settingsMode === 'workflow' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Template selector at top */}
                  <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2 overflow-x-auto">
                    <span className="text-[10px] text-slate-500 shrink-0">템플릿:</span>
                    {WORKFLOW_TEMPLATES.map(tpl => (
                      <button key={tpl.id} onClick={() => { setSelectedTemplate(tpl); setSelectedWfNode(null); setSelectedWfEdge(null); }}
                        className={`shrink-0 text-[11px] px-3 py-1.5 rounded-lg transition ${
                          selectedTemplate.id === tpl.id
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            : 'text-slate-400 hover:bg-white/5 border border-transparent'
                        }`}>
                        {tpl.name}
                      </button>
                    ))}
                    <div className="ml-auto shrink-0">
                      <button onClick={startTestRun} disabled={testRunning}
                        className="flex items-center gap-1 text-[10px] px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition disabled:opacity-50">
                        <Play size={10} /> {testRunning ? '실행 중...' : '테스트 실행'}
                      </button>
                    </div>
                  </div>

                  {/* Node type palette */}
                  <div className="flex items-center gap-1.5 px-4 py-2 border-b border-white/5">
                    <span className="text-[10px] text-slate-500 mr-1">노드:</span>
                    {WF_NODE_TYPES.map(nt => (
                      <div key={nt.type}
                        className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 cursor-grab text-[10px] text-slate-400 hover:bg-white/5 hover:text-white transition">
                        <span>{nt.icon}</span>
                        <span>{nt.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Canvas + properties side panel */}
                  <div className="flex-1 flex overflow-hidden">
                    {/* Canvas area */}
                    <div ref={canvasRef}
                      className="flex-1 relative bg-[#0a0a1a] overflow-auto"
                      style={{ minHeight: 350 }}>
                      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                          </pattern>
                          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                            <polygon points="0 0, 8 3, 0 6" fill="rgba(255,255,255,0.15)" />
                          </marker>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />

                        {selectedTemplate.edges.map((edge, i) => {
                          const fromNode = selectedTemplate.nodes.find(n => n.id === edge.from);
                          const toNode = selectedTemplate.nodes.find(n => n.id === edge.to);
                          if (!fromNode || !toNode) return null;
                          const isSelected = selectedWfEdge?.from === edge.from && selectedWfEdge?.to === edge.to;
                          const midX = (fromNode.x + 60 + toNode.x) / 2;
                          return (
                            <g key={i} onClick={() => { setSelectedWfEdge(edge); setSelectedWfNode(null); }} className="cursor-pointer">
                              <path
                                d={`M ${fromNode.x + 60} ${fromNode.y} C ${midX} ${fromNode.y}, ${midX} ${toNode.y}, ${toNode.x} ${toNode.y}`}
                                fill="none"
                                stroke={isSelected ? '#818cf8' : 'rgba(255,255,255,0.1)'}
                                strokeWidth={isSelected ? 2 : 1.5}
                                markerEnd="url(#arrowhead)"
                              />
                              {edge.condition && (
                                <text x={midX} y={Math.min(fromNode.y, toNode.y) - 8}
                                  fill={isSelected ? '#818cf8' : 'rgba(255,255,255,0.25)'}
                                  fontSize="9" textAnchor="middle">
                                  {edge.condition}
                                </text>
                              )}
                            </g>
                          );
                        })}
                      </svg>

                      {selectedTemplate.nodes.map((node, i) => {
                        const isSelected = selectedWfNode?.id === node.id;
                        const isTestActive = testRunning && testStep === i;
                        return (
                          <div key={node.id}
                            onClick={() => { setSelectedWfNode(node); setSelectedWfEdge(null); }}
                            className={`absolute flex items-center gap-2 rounded-xl border px-3 py-2 cursor-pointer transition-all select-none ${getNodeColor(node.type)} ${
                              isSelected ? 'ring-2 ring-indigo-500/60 scale-105' : ''
                            } ${isTestActive ? 'ring-2 ring-emerald-400 animate-pulse' : ''}`}
                            style={{ left: node.x - 50, top: node.y - 18, minWidth: 100 }}>
                            {getNodeIcon(node.type)}
                            <div>
                              <p className="text-[11px] font-semibold">{node.label}</p>
                              {node.assignee && <p className="text-[9px] opacity-60">{node.assignee}</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Properties slide-in panel */}
                    <div className="w-[220px] shrink-0 border-l border-white/5 bg-white/[0.01] overflow-y-auto p-3 space-y-3">
                      <p className="text-xs font-semibold text-slate-400">속성</p>
                      {selectedWfNode ? (
                        <>
                          <div>
                            <label className="block text-[10px] text-slate-500 mb-1">노드 타입</label>
                            <div className={`rounded-lg border px-2 py-1.5 text-xs ${getNodeColor(selectedWfNode.type)}`}>
                              {WF_NODE_TYPES.find(t => t.type === selectedWfNode.type)?.icon} {WF_NODE_TYPES.find(t => t.type === selectedWfNode.type)?.label}
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-500 mb-1">라벨</label>
                            <input value={selectedWfNode.label} readOnly
                              className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none" />
                          </div>
                          {selectedWfNode.assignee && (
                            <div>
                              <label className="block text-[10px] text-slate-500 mb-1">담당자 규칙</label>
                              <input value={selectedWfNode.assignee} readOnly
                                className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none" />
                            </div>
                          )}
                          {selectedWfNode.timeout && (
                            <div>
                              <label className="block text-[10px] text-slate-500 mb-1">타임아웃</label>
                              <input value={selectedWfNode.timeout} readOnly
                                className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none" />
                            </div>
                          )}
                          {selectedWfNode.escalation && (
                            <div>
                              <label className="block text-[10px] text-slate-500 mb-1">에스컬레이션</label>
                              <input value={selectedWfNode.escalation} readOnly
                                className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none" />
                            </div>
                          )}
                        </>
                      ) : selectedWfEdge ? (
                        <>
                          <div>
                            <label className="block text-[10px] text-slate-500 mb-1">연결선</label>
                            <div className="text-xs text-white">
                              {selectedTemplate.nodes.find(n => n.id === selectedWfEdge.from)?.label}
                              {' → '}
                              {selectedTemplate.nodes.find(n => n.id === selectedWfEdge.to)?.label}
                            </div>
                          </div>
                          {selectedWfEdge.condition && (
                            <div>
                              <label className="block text-[10px] text-slate-500 mb-1">조건</label>
                              <input value={selectedWfEdge.condition} readOnly
                                className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none" />
                            </div>
                          )}
                          <div>
                            <label className="block text-[10px] text-slate-500 mb-1">조건 타입</label>
                            <select className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none">
                              <option className="bg-[#0F0F23]">금액 기준</option>
                              <option className="bg-[#0F0F23]">유형 기준</option>
                              <option className="bg-[#0F0F23]">직급 기준</option>
                              <option className="bg-[#0F0F23]">부서 기준</option>
                            </select>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8 text-[10px] text-slate-600">
                          <MousePointer size={20} className="mx-auto mb-2 opacity-30" />
                          노드 또는 연결선을 클릭하세요
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          )}

          {/* Bottom bar */}
          <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
            <button onClick={() => showToast('저장되었습니다')}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-500 transition">
              <Save size={13} /> 저장
            </button>
            <button onClick={() => showToast('되돌리기 완료')}
              className="flex items-center gap-1.5 px-4 py-2 bg-white/5 text-slate-400 text-xs rounded-lg hover:bg-white/10 transition border border-white/10">
              <Undo2 size={13} /> 되돌리기
            </button>
            <button onClick={() => showToast('변경이력 표시')}
              className="flex items-center gap-1.5 px-4 py-2 bg-white/5 text-slate-400 text-xs rounded-lg hover:bg-white/10 transition border border-white/10">
              <History size={13} /> 변경이력
            </button>
            <button onClick={() => showToast('내보내기 완료')}
              className="flex items-center gap-1.5 px-4 py-2 bg-white/5 text-slate-400 text-xs rounded-lg hover:bg-white/10 transition border border-white/10">
              <Download size={13} /> 내보내기
            </button>
          </div>
        </div>
      )}


      {/* ═══════════════════════════════════════════════
          TAB 2: 권한
          ═══════════════════════════════════════════════ */}
      {tab === 'permissions' && (
        <div className="space-y-5">
          {/* Role templates */}
          <div className="flex gap-4" style={{ minHeight: 'calc(100vh - 280px)' }}>
            {/* Left: Role list */}
            <div className="w-[260px] shrink-0 rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-white/5">
                <span className="text-xs font-semibold text-slate-400">역할 템플릿</span>
                <span className="ml-2 text-[10px] text-slate-600">{permRoles.length}개</span>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {permRoles.map(r => (
                  <button key={r.id} onClick={() => setSelectedRole(r.id)}
                    className={`w-full text-left rounded-lg px-3 py-3 transition-colors ${
                      selectedRole === r.id
                        ? 'bg-indigo-500/10 border border-indigo-500/20'
                        : 'hover:bg-white/5 border border-transparent'
                    }`}>
                    <div className="flex items-center gap-2">
                      <Shield size={13} className={selectedRole === r.id ? 'text-indigo-400' : 'text-slate-500'} />
                      <span className="text-xs font-semibold text-white">{r.name}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 ml-5">{r.description}</p>
                    <div className="flex items-center gap-2 mt-2 ml-5">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                        r.dataScope === 'all' ? 'bg-violet-500/10 text-violet-400' :
                        r.dataScope === 'division' ? 'bg-blue-500/10 text-blue-400' :
                        r.dataScope === 'team' ? 'bg-green-500/10 text-green-400' :
                        'bg-slate-500/10 text-slate-400'
                      }`}>
                        {r.dataScope === 'all' ? '전체' : r.dataScope === 'division' ? '본부' : r.dataScope === 'team' ? '팀' : '본인'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Permission matrix + simulator */}
            <div className="flex-1 min-w-0 space-y-4 overflow-y-auto">
              {currentRole && (
                <>
                  {/* Data scope selector */}
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <h3 className="text-xs font-semibold text-slate-400 mb-3">데이터 범위</h3>
                    <div className="flex gap-2">
                      {(['all', 'division', 'team', 'self'] as const).map(scope => (
                        <button key={scope} onClick={() => setDataScope(currentRole.id, scope)}
                          className={`text-[11px] px-3 py-2 rounded-lg border transition ${
                            currentRole.dataScope === scope
                              ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400'
                              : 'border-white/10 bg-white/[0.02] text-slate-400 hover:bg-white/5'
                          }`}>
                          {scope === 'all' ? '전체 데이터' : scope === 'division' ? '본부 데이터' : scope === 'team' ? '팀 데이터' : '본인 데이터'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Module access matrix */}
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/5">
                      <span className="text-xs font-semibold text-slate-400">모듈 접근 권한</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-white/5">
                            <th className="text-left px-4 py-2 text-slate-500 font-medium w-32">모듈</th>
                            <th className="px-4 py-2 text-slate-500 font-medium text-center w-20">읽기</th>
                            <th className="px-4 py-2 text-slate-500 font-medium text-center w-20">쓰기</th>
                            <th className="px-4 py-2 text-slate-500 font-medium text-center w-20">삭제</th>
                            <th className="px-4 py-2 text-slate-500 font-medium text-center w-20">관리</th>
                          </tr>
                        </thead>
                        <tbody>
                          {MODULE_BLOCKS.slice(0, 15).map(mod => {
                            const perm = currentRole.modules[mod.code];
                            if (!perm) return null;
                            return (
                              <tr key={mod.code} className="border-b border-white/5 hover:bg-white/[0.02]">
                                <td className="px-4 py-2">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-sm ${mod.trackColor}`} />
                                    <span className="text-white font-medium">{mod.code}</span>
                                    <span className="text-slate-500">{mod.name}</span>
                                  </div>
                                </td>
                                {(['read', 'write', 'delete', 'admin'] as const).map(field => (
                                  <td key={field} className="px-4 py-2 text-center">
                                    <button onClick={() => togglePermission(currentRole.id, mod.code, field)}
                                      className={`w-5 h-5 rounded border flex items-center justify-center transition ${
                                        perm[field]
                                          ? 'bg-indigo-600 border-indigo-500 text-white'
                                          : 'border-white/10 bg-white/5 text-transparent hover:border-white/20'
                                      }`}>
                                      <Check size={10} />
                                    </button>
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Permission simulator */}
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <h3 className="text-xs font-semibold text-slate-400 mb-3">
                      <Eye size={12} className="inline mr-1" />
                      권한 시뮬레이터
                    </h3>
                    <p className="text-[10px] text-slate-500 mb-3">이 역할의 사용자가 무엇을 볼 수 있는지 미리 확인</p>
                    <div className="flex gap-2 mb-4">
                      <div className="relative flex-1">
                        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600" />
                        <input value={simUser} onChange={e => setSimUser(e.target.value)}
                          placeholder="사용자 이름으로 검색..."
                          className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none" />
                      </div>
                      <button onClick={() => showToast('시뮬레이션 실행')}
                        className="px-4 py-2 bg-indigo-600/10 text-indigo-400 text-xs rounded-lg hover:bg-indigo-600/20 transition border border-indigo-500/20">
                        <Play size={11} className="inline mr-1" /> 시뮬레이션
                      </button>
                    </div>
                    {/* Preview result */}
                    <div className="rounded-lg border border-white/5 bg-[#0a0a1a] p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-600/20 flex items-center justify-center text-xs font-bold text-indigo-400">
                          {currentRole.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-white">{currentRole.name}</p>
                          <p className="text-[10px] text-slate-500">
                            데이터 범위: {currentRole.dataScope === 'all' ? '전체' : currentRole.dataScope === 'division' ? '본부' : currentRole.dataScope === 'team' ? '팀' : '본인'}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2">
                          <p className="text-[10px] text-emerald-400 font-semibold mb-1">접근 가능</p>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(currentRole.modules).filter(([, v]) => v.read).slice(0, 8).map(([code]) => (
                              <span key={code} className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">{code}</span>
                            ))}
                            {Object.entries(currentRole.modules).filter(([, v]) => v.read).length > 8 && (
                              <span className="text-[9px] text-emerald-400">+{Object.entries(currentRole.modules).filter(([, v]) => v.read).length - 8}</span>
                            )}
                          </div>
                        </div>
                        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-2">
                          <p className="text-[10px] text-red-400 font-semibold mb-1">접근 불가</p>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(currentRole.modules).filter(([, v]) => !v.read).slice(0, 8).map(([code]) => (
                              <span key={code} className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">{code}</span>
                            ))}
                            {Object.entries(currentRole.modules).filter(([, v]) => !v.read).length === 0 && (
                              <span className="text-[9px] text-slate-600">없음</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}


      {/* ═══════════════════════════════════════════════
          TAB 3: 테마
          ═══════════════════════════════════════════════ */}
      {tab === 'theme' && (
        <div className="max-w-2xl space-y-5">
          {/* Color picker */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <h2 className="text-sm font-semibold mb-1">앱 컬러 패턴</h2>
            <p className="text-xs text-slate-500 mb-4">브랜드에 맞는 컬러를 선택하세요.</p>
            <div className="grid grid-cols-5 gap-3">
              {[
                { name: 'Indigo',  color: '#6366F1', bg: '#1e1b4b', accent: '#818CF8', desc: '기본' },
                { name: 'Emerald', color: '#10B981', bg: '#022c22', accent: '#34D399', desc: '성장' },
                { name: 'Amber',   color: '#F59E0B', bg: '#1c1917', accent: '#FBBF24', desc: '에너지' },
                { name: 'Rose',    color: '#F43F5E', bg: '#1a0a0e', accent: '#FB7185', desc: '열정' },
                { name: 'Slate',   color: '#64748B', bg: '#0f172a', accent: '#94A3B8', desc: '모던' },
              ].map(p => (
                <button key={p.name} onClick={() => setEditColor(p.color)}
                  className={`relative rounded-xl border p-4 text-center transition-all ${editColor === p.color ? 'border-white/30 ring-1 ring-white/20' : 'border-white/5 hover:border-white/15'}`}>
                  <div className="rounded-lg overflow-hidden mb-3 border border-white/5" style={{ backgroundColor: p.bg }}>
                    <div className="h-2" style={{ backgroundColor: p.color }} />
                    <div className="p-2 space-y-1">
                      <div className="h-1.5 rounded-full w-3/4" style={{ backgroundColor: p.accent, opacity: 0.3 }} />
                      <div className="h-1.5 rounded-full w-1/2" style={{ backgroundColor: p.accent, opacity: 0.15 }} />
                      <div className="flex gap-1 mt-1.5">
                        <div className="h-4 w-4 rounded" style={{ backgroundColor: p.color }} />
                        <div className="h-4 flex-1 rounded" style={{ backgroundColor: `${p.accent}15` }} />
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-semibold" style={{ color: p.color }}>{p.name}</div>
                  <div className="text-[10px] text-slate-500">{p.desc}</div>
                  {editColor === p.color && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: p.color }}>
                      <Check size={10} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5">
              <span className="text-xs text-slate-500">커스텀:</span>
              <input type="color" value={editColor} onChange={e => setEditColor(e.target.value)}
                className="h-7 w-7 rounded cursor-pointer bg-transparent border-0" />
              <input value={editColor} onChange={e => setEditColor(e.target.value)}
                className="w-20 px-2 py-1 bg-white/5 border border-white/10 rounded text-xs font-mono text-slate-400 focus:outline-none" />
            </div>
          </div>

          {/* Logo upload area */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <h2 className="text-sm font-semibold mb-1">브랜딩</h2>
            <p className="text-xs text-slate-500 mb-4">로고, 파비콘, 폰트를 설정하세요.</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-dashed border-white/10 p-6 text-center hover:border-white/20 transition cursor-pointer">
                <Upload size={24} className="mx-auto mb-2 text-slate-600" />
                <p className="text-xs text-slate-400">로고 업로드</p>
                <p className="text-[10px] text-slate-600 mt-1">PNG, SVG 권장 (최대 2MB)</p>
              </div>
              <div className="rounded-lg border border-dashed border-white/10 p-6 text-center hover:border-white/20 transition cursor-pointer">
                <Upload size={24} className="mx-auto mb-2 text-slate-600" />
                <p className="text-xs text-slate-400">파비콘 업로드</p>
                <p className="text-[10px] text-slate-600 mt-1">32x32 ICO/PNG</p>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-xs text-slate-500 mb-2">
                <Type size={12} className="inline mr-1" /> 폰트 선택
              </label>
              <select className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none">
                <option className="bg-[#0F0F23]">Pretendard (기본)</option>
                <option className="bg-[#0F0F23]">Noto Sans KR</option>
                <option className="bg-[#0F0F23]">Spoqa Han Sans Neo</option>
                <option className="bg-[#0F0F23]">Inter</option>
              </select>
            </div>
          </div>

          {!isDemo && (
            <button onClick={saveTheme} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-white text-sm rounded-lg hover:opacity-90 transition disabled:opacity-50"
              style={{ backgroundColor: editColor }}>
              <Save size={14} /> {saving ? '저장 중...' : '테마 저장'}
            </button>
          )}
        </div>
      )}


      {/* ═══════════════════════════════════════════════
          TAB 4: 시스템 (조직 정보 + 멤버 관리 합침)
          ═══════════════════════════════════════════════ */}
      {tab === 'system' && (
        <div className="max-w-3xl space-y-5">
          {/* Company info */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Building2 size={14} className="text-slate-400" /> 조직 정보
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">조직 이름</label>
                <input value={editName} onChange={e => setEditName(e.target.value)} disabled={isDemo}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">서비스명</label>
                <input value={editServiceName} onChange={e => setEditServiceName(e.target.value)} disabled={isDemo}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">커스텀 도메인</label>
                <input value={editDomain} onChange={e => setEditDomain(e.target.value)} disabled={isDemo} placeholder="example.com"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none disabled:opacity-50" />
              </div>
            </div>
            {!isDemo && (
              <div className="pt-2">
                <button onClick={saveOrg} disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-500 transition disabled:opacity-50">
                  <Save size={14} /> {saving ? '저장 중...' : '저장'}
                </button>
              </div>
            )}
          </div>

          {/* Member management */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
            <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Users size={14} className="text-slate-400" /> 멤버 관리
              </h2>
            </div>

            {isDemo ? (
              <div className="px-4 py-8 text-center">
                <Users size={24} className="text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-400">로그인 후 멤버를 관리할 수 있습니다.</p>
              </div>
            ) : (
              <>
                {/* Invite */}
                <div className="px-5 py-4 border-b border-white/5 bg-white/[0.01]">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                      <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="이메일 주소"
                        className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none" />
                    </div>
                    <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none">
                      <option value="member" className="bg-[#0F0F23]">멤버</option>
                      <option value="manager" className="bg-[#0F0F23]">매니저</option>
                      <option value="admin" className="bg-[#0F0F23]">관리자</option>
                    </select>
                    <button onClick={handleInvite} disabled={inviting || !inviteEmail}
                      className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-500 transition disabled:opacity-50">
                      <Plus size={14} /> {inviting ? '...' : '초대'}
                    </button>
                  </div>
                </div>

                {/* Member list */}
                <div className="divide-y divide-white/5">
                  {members.map((m: any) => (
                    <div key={m.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold">{m.displayName?.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{m.displayName}</div>
                        <div className="text-xs text-slate-500">{m.jobTitle || '-'}</div>
                      </div>
                      {m.role !== 'owner' ? (
                        <div className="flex items-center gap-2">
                          <select value={m.role} onChange={e => handleRoleChange(m.id, e.target.value)}
                            className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white focus:outline-none">
                            {Object.entries(ROLE_LABELS).filter(([k]) => k !== 'owner').map(([k, v]) => (
                              <option key={k} value={k} className="bg-[#0F0F23]">{v}</option>
                            ))}
                          </select>
                          <button onClick={() => handleRemove(m.id)} className="p-1 text-slate-600 hover:text-red-400 transition">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-violet-400 bg-violet-500/10">
                          {ROLE_LABELS[m.role]}
                        </span>
                      )}
                    </div>
                  ))}
                  {members.length === 0 && <p className="text-center py-6 text-slate-500 text-sm">멤버가 없습니다.</p>}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
