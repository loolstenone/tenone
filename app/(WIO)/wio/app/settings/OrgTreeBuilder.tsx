'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Building, ChevronRight, Plus, Trash2, Pencil, X, Check,
  Users, UserPlus, Crown, Search, Loader2, AlertTriangle,
  History, Download, ChevronDown, Briefcase, Star,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { WIOMember } from '@/types/wio';

/* ════════════════════════════════════════════════════════
   Types
   ════════════════════════════════════════════════════════ */

interface Department {
  id: string;
  tenant_id: string;
  name: string;
  parent_id: string | null;
  head_id: string | null;
  level: number;      // 0=본부, 1=팀, 2=파트
  sort_order: number;
}

interface UserAssignment {
  id: string;
  tenant_id: string;
  user_id: string;
  org_id: string;
  assignment_type: '주소속' | '겸직' | '파견' | '프로젝트';
  role_title: string;
  position_grade: string;
  is_org_head: boolean;
  start_date: string | null;
  end_date: string | null;
  status: 'active' | 'inactive';
  // joined from wio_members
  display_name?: string;
  avatar_url?: string | null;
}

interface Headcount {
  id: string;
  tenant_id: string;
  org_id: string;
  position_grade: string;
  count: number;
  filled_count: number;
  recruiting_count: number;
  effective_date: string;
  status: string;
}

interface TreeNode extends Department {
  children: TreeNode[];
  memberCount: number;
}

interface ChangeLog {
  newDepts: number;
  memberChanges: number;
}

/* ════════════════════════════════════════════════════════
   Level helpers
   ════════════════════════════════════════════════════════ */
const LEVEL_LABELS: Record<number, string> = { 0: '본부', 1: '팀', 2: '파트' };
const LEVEL_COLORS: Record<number, { bg: string; text: string; border: string }> = {
  0: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
  1: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  2: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
};

/* ════════════════════════════════════════════════════════
   7 Default Tracks
   ════════════════════════════════════════════════════════ */
const DEFAULT_TRACKS = [
  { name: 'Track 1 운영·관리', sort_order: 1 },
  { name: 'Track 2 사업', sort_order: 2 },
  { name: 'Track 3 생산', sort_order: 3 },
  { name: 'Track 4 지원', sort_order: 4 },
  { name: 'Track 5 파트너', sort_order: 5 },
  { name: 'Track 6 공통', sort_order: 6 },
  { name: 'Track 7 시스템', sort_order: 7 },
];

/* ════════════════════════════════════════════════════════
   Demo mock data
   ════════════════════════════════════════════════════════ */
function generateDemoData(): { departments: Department[]; assignments: UserAssignment[]; members: WIOMember[]; headcounts: Headcount[] } {
  const tid = 'demo';
  const departments: Department[] = [
    // Track 1
    { id: 'demo-t1', tenant_id: tid, name: 'Track 1 운영·관리', parent_id: null, head_id: null, level: 0, sort_order: 1 },
    { id: 'demo-hr', tenant_id: tid, name: '인사팀', parent_id: 'demo-t1', head_id: 'dm-2', level: 1, sort_order: 1 },
    { id: 'demo-hr-recruit', tenant_id: tid, name: '채용파트', parent_id: 'demo-hr', head_id: 'dm-6', level: 2, sort_order: 1 },
    { id: 'demo-fin', tenant_id: tid, name: '재무팀', parent_id: 'demo-t1', head_id: 'dm-7', level: 1, sort_order: 2 },
    { id: 'demo-strategy', tenant_id: tid, name: '전략기획팀', parent_id: 'demo-t1', head_id: 'dm-11', level: 1, sort_order: 3 },
    // Track 2
    { id: 'demo-t2', tenant_id: tid, name: 'Track 2 사업', parent_id: null, head_id: null, level: 0, sort_order: 2 },
    { id: 'demo-mkt', tenant_id: tid, name: '마케팅팀', parent_id: 'demo-t2', head_id: 'dm-21', level: 1, sort_order: 1 },
    { id: 'demo-sales', tenant_id: tid, name: '영업팀', parent_id: 'demo-t2', head_id: 'dm-25', level: 1, sort_order: 2 },
    { id: 'demo-crm', tenant_id: tid, name: 'CRM팀', parent_id: 'demo-t2', head_id: 'dm-28', level: 1, sort_order: 3 },
    // Track 3
    { id: 'demo-t3', tenant_id: tid, name: 'Track 3 생산', parent_id: null, head_id: null, level: 0, sort_order: 3 },
    { id: 'demo-manufacture', tenant_id: tid, name: '제조팀', parent_id: 'demo-t3', head_id: 'dm-31', level: 1, sort_order: 1 },
    { id: 'demo-logistics', tenant_id: tid, name: '물류팀', parent_id: 'demo-t3', head_id: 'dm-33', level: 1, sort_order: 2 },
    // Track 4
    { id: 'demo-t4', tenant_id: tid, name: 'Track 4 지원', parent_id: null, head_id: null, level: 0, sort_order: 4 },
    { id: 'demo-dev', tenant_id: tid, name: '개발팀', parent_id: 'demo-t4', head_id: 'dm-41', level: 1, sort_order: 1 },
    { id: 'demo-design', tenant_id: tid, name: '디자인팀', parent_id: 'demo-t4', head_id: 'dm-44', level: 1, sort_order: 2 },
    // Track 5
    { id: 'demo-t5', tenant_id: tid, name: 'Track 5 파트너', parent_id: null, head_id: null, level: 0, sort_order: 5 },
    // Track 6
    { id: 'demo-t6', tenant_id: tid, name: 'Track 6 공통', parent_id: null, head_id: null, level: 0, sort_order: 6 },
    // Track 7
    { id: 'demo-t7', tenant_id: tid, name: 'Track 7 시스템', parent_id: null, head_id: null, level: 0, sort_order: 7 },
    { id: 'demo-it', tenant_id: tid, name: 'IT인프라팀', parent_id: 'demo-t7', head_id: 'dm-61', level: 1, sort_order: 1 },
  ];

  const members: WIOMember[] = [
    { id: 'dm-1', tenantId: tid, userId: 'u1', displayName: '김경영', role: 'admin', jobTitle: '본부장', department: '경영관리본부', avatarUrl: null, moduleAccess: [], isActive: true, joinedAt: '' },
    { id: 'dm-2', tenantId: tid, userId: 'u2', displayName: '이인사', role: 'manager', jobTitle: '팀장', department: '인사팀', avatarUrl: null, moduleAccess: [], isActive: true, joinedAt: '' },
    { id: 'dm-3', tenantId: tid, userId: 'u3', displayName: '박채용', role: 'member', jobTitle: '사원', department: '인사팀', avatarUrl: null, moduleAccess: [], isActive: true, joinedAt: '' },
    { id: 'dm-4', tenantId: tid, userId: 'u4', displayName: '최교육', role: 'member', jobTitle: '사원', department: '인사팀', avatarUrl: null, moduleAccess: [], isActive: true, joinedAt: '' },
    { id: 'dm-5', tenantId: tid, userId: 'u5', displayName: '정복지', role: 'member', jobTitle: '사원', department: '인사팀', avatarUrl: null, moduleAccess: [], isActive: true, joinedAt: '' },
    { id: 'dm-6', tenantId: tid, userId: 'u6', displayName: '한근태', role: 'member', jobTitle: '파트장', department: '채용파트', avatarUrl: null, moduleAccess: [], isActive: true, joinedAt: '' },
    { id: 'dm-7', tenantId: tid, userId: 'u7', displayName: '강재무', role: 'manager', jobTitle: '팀장', department: '재무팀', avatarUrl: null, moduleAccess: [], isActive: true, joinedAt: '' },
    { id: 'dm-8', tenantId: tid, userId: 'u8', displayName: '윤회계', role: 'member', jobTitle: '사원', department: '재무팀', avatarUrl: null, moduleAccess: [], isActive: true, joinedAt: '' },
    { id: 'dm-9', tenantId: tid, userId: 'u9', displayName: '장세무', role: 'member', jobTitle: '사원', department: '재무팀', avatarUrl: null, moduleAccess: [], isActive: true, joinedAt: '' },
    { id: 'dm-10', tenantId: tid, userId: 'u10', displayName: '임자산', role: 'member', jobTitle: '사원', department: '재무팀', avatarUrl: null, moduleAccess: [], isActive: true, joinedAt: '' },
    { id: 'dm-11', tenantId: tid, userId: 'u11', displayName: '문전략', role: 'manager', jobTitle: '팀장', department: '전략기획팀', avatarUrl: null, moduleAccess: [], isActive: true, joinedAt: '' },
    { id: 'dm-12', tenantId: tid, userId: 'u12', displayName: '서기획', role: 'member', jobTitle: '사원', department: '전략기획팀', avatarUrl: null, moduleAccess: [], isActive: true, joinedAt: '' },
    { id: 'dm-13', tenantId: tid, userId: 'u13', displayName: '노분석', role: 'member', jobTitle: '사원', department: '전략기획팀', avatarUrl: null, moduleAccess: [], isActive: true, joinedAt: '' },
    { id: 'dm-21', tenantId: tid, userId: 'u21', displayName: '오마케', role: 'manager', jobTitle: '팀장', department: '마케팅팀', avatarUrl: null, moduleAccess: [], isActive: true, joinedAt: '' },
    { id: 'dm-22', tenantId: tid, userId: 'u22', displayName: '김콘텐', role: 'member', jobTitle: '사원', department: '마케팅팀', avatarUrl: null, moduleAccess: [], isActive: true, joinedAt: '' },
    { id: 'dm-23', tenantId: tid, userId: 'u23', displayName: '이소셜', role: 'member', jobTitle: '사원', department: '마케팅팀', avatarUrl: null, moduleAccess: [], isActive: true, joinedAt: '' },
    { id: 'dm-24', tenantId: tid, userId: 'u24', displayName: '박퍼포', role: 'member', jobTitle: '사원', department: '마케팅팀', avatarUrl: null, moduleAccess: [], isActive: true, joinedAt: '' },
    { id: 'dm-25', tenantId: tid, userId: 'u25', displayName: '유영업', role: 'manager', jobTitle: '팀장', department: '영업팀', avatarUrl: null, moduleAccess: [], isActive: true, joinedAt: '' },
    { id: 'dm-26', tenantId: tid, userId: 'u26', displayName: '신리드', role: 'member', jobTitle: '사원', department: '영업팀', avatarUrl: null, moduleAccess: [], isActive: true, joinedAt: '' },
    { id: 'dm-27', tenantId: tid, userId: 'u27', displayName: '홍계약', role: 'member', jobTitle: '사원', department: '영업팀', avatarUrl: null, moduleAccess: [], isActive: true, joinedAt: '' },
    { id: 'dm-28', tenantId: tid, userId: 'u28', displayName: '안고객', role: 'manager', jobTitle: '팀장', department: 'CRM팀', avatarUrl: null, moduleAccess: [], isActive: true, joinedAt: '' },
    { id: 'dm-29', tenantId: tid, userId: 'u29', displayName: '배서비', role: 'member', jobTitle: '사원', department: 'CRM팀', avatarUrl: null, moduleAccess: [], isActive: true, joinedAt: '' },
    { id: 'dm-31', tenantId: tid, userId: 'u31', displayName: '백제조', role: 'manager', jobTitle: '팀장', department: '제조팀', avatarUrl: null, moduleAccess: [], isActive: true, joinedAt: '' },
    { id: 'dm-32', tenantId: tid, userId: 'u32', displayName: '피품질', role: 'member', jobTitle: '사원', department: '제조팀', avatarUrl: null, moduleAccess: [], isActive: true, joinedAt: '' },
    { id: 'dm-33', tenantId: tid, userId: 'u33', displayName: '조물류', role: 'manager', jobTitle: '팀장', department: '물류팀', avatarUrl: null, moduleAccess: [], isActive: true, joinedAt: '' },
    { id: 'dm-34', tenantId: tid, userId: 'u34', displayName: '권운송', role: 'member', jobTitle: '사원', department: '물류팀', avatarUrl: null, moduleAccess: [], isActive: true, joinedAt: '' },
    { id: 'dm-41', tenantId: tid, userId: 'u41', displayName: '탁개발', role: 'manager', jobTitle: '팀장', department: '개발팀', avatarUrl: null, moduleAccess: [], isActive: true, joinedAt: '' },
    { id: 'dm-42', tenantId: tid, userId: 'u42', displayName: '심백엔', role: 'member', jobTitle: '사원', department: '개발팀', avatarUrl: null, moduleAccess: [], isActive: true, joinedAt: '' },
    { id: 'dm-43', tenantId: tid, userId: 'u43', displayName: '엄프론', role: 'member', jobTitle: '사원', department: '개발팀', avatarUrl: null, moduleAccess: [], isActive: true, joinedAt: '' },
    { id: 'dm-44', tenantId: tid, userId: 'u44', displayName: '공디자', role: 'manager', jobTitle: '팀장', department: '디자인팀', avatarUrl: null, moduleAccess: [], isActive: true, joinedAt: '' },
    { id: 'dm-45', tenantId: tid, userId: 'u45', displayName: '양UI', role: 'member', jobTitle: '사원', department: '디자인팀', avatarUrl: null, moduleAccess: [], isActive: true, joinedAt: '' },
    { id: 'dm-61', tenantId: tid, userId: 'u61', displayName: '성인프', role: 'manager', jobTitle: '팀장', department: 'IT인프라팀', avatarUrl: null, moduleAccess: [], isActive: true, joinedAt: '' },
    { id: 'dm-62', tenantId: tid, userId: 'u62', displayName: '구보안', role: 'member', jobTitle: '사원', department: 'IT인프라팀', avatarUrl: null, moduleAccess: [], isActive: true, joinedAt: '' },
  ];

  const assignments: UserAssignment[] = [
    // 인사팀
    { id: 'da-1', tenant_id: tid, user_id: 'dm-2', org_id: 'demo-hr', assignment_type: '주소속', role_title: '팀장', position_grade: 'M1', is_org_head: true, start_date: '2024-01-01', end_date: null, status: 'active', display_name: '이인사' },
    { id: 'da-2', tenant_id: tid, user_id: 'dm-3', org_id: 'demo-hr', assignment_type: '주소속', role_title: '사원', position_grade: 'S2', is_org_head: false, start_date: '2024-01-01', end_date: null, status: 'active', display_name: '박채용' },
    { id: 'da-3', tenant_id: tid, user_id: 'dm-4', org_id: 'demo-hr', assignment_type: '주소속', role_title: '사원', position_grade: 'S1', is_org_head: false, start_date: '2024-01-01', end_date: null, status: 'active', display_name: '최교육' },
    { id: 'da-4', tenant_id: tid, user_id: 'dm-5', org_id: 'demo-hr', assignment_type: '주소속', role_title: '사원', position_grade: 'S1', is_org_head: false, start_date: '2024-01-01', end_date: null, status: 'active', display_name: '정복지' },
    // 채용파트
    { id: 'da-5', tenant_id: tid, user_id: 'dm-6', org_id: 'demo-hr-recruit', assignment_type: '주소속', role_title: '파트장', position_grade: 'M2', is_org_head: true, start_date: '2024-01-01', end_date: null, status: 'active', display_name: '한근태' },
    { id: 'da-5b', tenant_id: tid, user_id: 'dm-3', org_id: 'demo-hr-recruit', assignment_type: '겸직', role_title: '사원', position_grade: 'S2', is_org_head: false, start_date: '2024-03-01', end_date: null, status: 'active', display_name: '박채용' },
    // 재무팀
    { id: 'da-6', tenant_id: tid, user_id: 'dm-7', org_id: 'demo-fin', assignment_type: '주소속', role_title: '팀장', position_grade: 'M1', is_org_head: true, start_date: '2024-01-01', end_date: null, status: 'active', display_name: '강재무' },
    { id: 'da-7', tenant_id: tid, user_id: 'dm-8', org_id: 'demo-fin', assignment_type: '주소속', role_title: '사원', position_grade: 'S2', is_org_head: false, start_date: '2024-01-01', end_date: null, status: 'active', display_name: '윤회계' },
    { id: 'da-8', tenant_id: tid, user_id: 'dm-9', org_id: 'demo-fin', assignment_type: '주소속', role_title: '사원', position_grade: 'S1', is_org_head: false, start_date: '2024-01-01', end_date: null, status: 'active', display_name: '장세무' },
    { id: 'da-9', tenant_id: tid, user_id: 'dm-10', org_id: 'demo-fin', assignment_type: '주소속', role_title: '사원', position_grade: 'S1', is_org_head: false, start_date: '2024-01-01', end_date: null, status: 'active', display_name: '임자산' },
    // 전략기획팀
    { id: 'da-10', tenant_id: tid, user_id: 'dm-11', org_id: 'demo-strategy', assignment_type: '주소속', role_title: '팀장', position_grade: 'M1', is_org_head: true, start_date: '2024-01-01', end_date: null, status: 'active', display_name: '문전략' },
    { id: 'da-11', tenant_id: tid, user_id: 'dm-12', org_id: 'demo-strategy', assignment_type: '주소속', role_title: '사원', position_grade: 'S2', is_org_head: false, start_date: '2024-01-01', end_date: null, status: 'active', display_name: '서기획' },
    { id: 'da-12', tenant_id: tid, user_id: 'dm-13', org_id: 'demo-strategy', assignment_type: '주소속', role_title: '사원', position_grade: 'S1', is_org_head: false, start_date: '2024-01-01', end_date: null, status: 'active', display_name: '노분석' },
    // 마케팅
    { id: 'da-13', tenant_id: tid, user_id: 'dm-21', org_id: 'demo-mkt', assignment_type: '주소속', role_title: '팀장', position_grade: 'M1', is_org_head: true, start_date: '2024-01-01', end_date: null, status: 'active', display_name: '오마케' },
    { id: 'da-14', tenant_id: tid, user_id: 'dm-22', org_id: 'demo-mkt', assignment_type: '주소속', role_title: '사원', position_grade: 'S2', is_org_head: false, start_date: '2024-01-01', end_date: null, status: 'active', display_name: '김콘텐' },
    { id: 'da-15', tenant_id: tid, user_id: 'dm-23', org_id: 'demo-mkt', assignment_type: '주소속', role_title: '사원', position_grade: 'S1', is_org_head: false, start_date: '2024-01-01', end_date: null, status: 'active', display_name: '이소셜' },
    { id: 'da-16', tenant_id: tid, user_id: 'dm-24', org_id: 'demo-mkt', assignment_type: '주소속', role_title: '사원', position_grade: 'S1', is_org_head: false, start_date: '2024-01-01', end_date: null, status: 'active', display_name: '박퍼포' },
    // 영업
    { id: 'da-17', tenant_id: tid, user_id: 'dm-25', org_id: 'demo-sales', assignment_type: '주소속', role_title: '팀장', position_grade: 'M1', is_org_head: true, start_date: '2024-01-01', end_date: null, status: 'active', display_name: '유영업' },
    { id: 'da-18', tenant_id: tid, user_id: 'dm-26', org_id: 'demo-sales', assignment_type: '주소속', role_title: '사원', position_grade: 'S2', is_org_head: false, start_date: '2024-01-01', end_date: null, status: 'active', display_name: '신리드' },
    { id: 'da-19', tenant_id: tid, user_id: 'dm-27', org_id: 'demo-sales', assignment_type: '주소속', role_title: '사원', position_grade: 'S1', is_org_head: false, start_date: '2024-01-01', end_date: null, status: 'active', display_name: '홍계약' },
    // CRM
    { id: 'da-20', tenant_id: tid, user_id: 'dm-28', org_id: 'demo-crm', assignment_type: '주소속', role_title: '팀장', position_grade: 'M1', is_org_head: true, start_date: '2024-01-01', end_date: null, status: 'active', display_name: '안고객' },
    { id: 'da-21', tenant_id: tid, user_id: 'dm-29', org_id: 'demo-crm', assignment_type: '주소속', role_title: '사원', position_grade: 'S2', is_org_head: false, start_date: '2024-01-01', end_date: null, status: 'active', display_name: '배서비' },
    // 개발
    { id: 'da-22', tenant_id: tid, user_id: 'dm-41', org_id: 'demo-dev', assignment_type: '주소속', role_title: '팀장', position_grade: 'M1', is_org_head: true, start_date: '2024-01-01', end_date: null, status: 'active', display_name: '탁개발' },
    { id: 'da-23', tenant_id: tid, user_id: 'dm-42', org_id: 'demo-dev', assignment_type: '주소속', role_title: '사원', position_grade: 'S2', is_org_head: false, start_date: '2024-01-01', end_date: null, status: 'active', display_name: '심백엔' },
    { id: 'da-24', tenant_id: tid, user_id: 'dm-43', org_id: 'demo-dev', assignment_type: '주소속', role_title: '사원', position_grade: 'S2', is_org_head: false, start_date: '2024-01-01', end_date: null, status: 'active', display_name: '엄프론' },
    // 디자인
    { id: 'da-25', tenant_id: tid, user_id: 'dm-44', org_id: 'demo-design', assignment_type: '주소속', role_title: '팀장', position_grade: 'M1', is_org_head: true, start_date: '2024-01-01', end_date: null, status: 'active', display_name: '공디자' },
    { id: 'da-26', tenant_id: tid, user_id: 'dm-45', org_id: 'demo-design', assignment_type: '주소속', role_title: '사원', position_grade: 'S2', is_org_head: false, start_date: '2024-01-01', end_date: null, status: 'active', display_name: '양UI' },
    // 제조
    { id: 'da-27', tenant_id: tid, user_id: 'dm-31', org_id: 'demo-manufacture', assignment_type: '주소속', role_title: '팀장', position_grade: 'M1', is_org_head: true, start_date: '2024-01-01', end_date: null, status: 'active', display_name: '백제조' },
    { id: 'da-28', tenant_id: tid, user_id: 'dm-32', org_id: 'demo-manufacture', assignment_type: '주소속', role_title: '사원', position_grade: 'S2', is_org_head: false, start_date: '2024-01-01', end_date: null, status: 'active', display_name: '피품질' },
    // 물류
    { id: 'da-29', tenant_id: tid, user_id: 'dm-33', org_id: 'demo-logistics', assignment_type: '주소속', role_title: '팀장', position_grade: 'M1', is_org_head: true, start_date: '2024-01-01', end_date: null, status: 'active', display_name: '조물류' },
    { id: 'da-30', tenant_id: tid, user_id: 'dm-34', org_id: 'demo-logistics', assignment_type: '주소속', role_title: '사원', position_grade: 'S2', is_org_head: false, start_date: '2024-01-01', end_date: null, status: 'active', display_name: '권운송' },
    // IT
    { id: 'da-31', tenant_id: tid, user_id: 'dm-61', org_id: 'demo-it', assignment_type: '주소속', role_title: '팀장', position_grade: 'M1', is_org_head: true, start_date: '2024-01-01', end_date: null, status: 'active', display_name: '성인프' },
    { id: 'da-32', tenant_id: tid, user_id: 'dm-62', org_id: 'demo-it', assignment_type: '주소속', role_title: '사원', position_grade: 'S2', is_org_head: false, start_date: '2024-01-01', end_date: null, status: 'active', display_name: '구보안' },
  ];

  const headcounts: Headcount[] = [
    { id: 'dh-1', tenant_id: tid, org_id: 'demo-hr', position_grade: 'ALL', count: 6, filled_count: 4, recruiting_count: 2, effective_date: '2024-01-01', status: 'active' },
    { id: 'dh-2', tenant_id: tid, org_id: 'demo-fin', position_grade: 'ALL', count: 5, filled_count: 4, recruiting_count: 1, effective_date: '2024-01-01', status: 'active' },
    { id: 'dh-3', tenant_id: tid, org_id: 'demo-strategy', position_grade: 'ALL', count: 4, filled_count: 3, recruiting_count: 1, effective_date: '2024-01-01', status: 'active' },
    { id: 'dh-4', tenant_id: tid, org_id: 'demo-mkt', position_grade: 'ALL', count: 5, filled_count: 4, recruiting_count: 1, effective_date: '2024-01-01', status: 'active' },
    { id: 'dh-5', tenant_id: tid, org_id: 'demo-dev', position_grade: 'ALL', count: 8, filled_count: 3, recruiting_count: 5, effective_date: '2024-01-01', status: 'active' },
  ];

  return { departments, assignments, members, headcounts };
}

/* ════════════════════════════════════════════════════════
   Build tree from flat
   ════════════════════════════════════════════════════════ */
function buildTree(departments: Department[], assignmentCounts: Record<string, number>): TreeNode[] {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  // create nodes
  departments.forEach(d => {
    map.set(d.id, { ...d, children: [], memberCount: assignmentCounts[d.id] || 0 });
  });

  // attach children
  departments.forEach(d => {
    const node = map.get(d.id)!;
    if (d.parent_id && map.has(d.parent_id)) {
      map.get(d.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  // sort children
  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => a.sort_order - b.sort_order);
    nodes.forEach(n => sortNodes(n.children));
  };
  sortNodes(roots);

  return roots;
}

/* ════════════════════════════════════════════════════════
   Component Props
   ════════════════════════════════════════════════════════ */
interface OrgTreeBuilderProps {
  tenantId: string;
  isDemo: boolean;
  showToast: (msg: string) => void;
}

/* ════════════════════════════════════════════════════════
   Main Component
   ════════════════════════════════════════════════════════ */
export default function OrgTreeBuilder({ tenantId, isDemo, showToast }: OrgTreeBuilderProps) {
  const supabase = createClient();

  // ── Core data ──
  const [departments, setDepartments] = useState<Department[]>([]);
  const [assignments, setAssignments] = useState<UserAssignment[]>([]);
  const [allMembers, setAllMembers] = useState<WIOMember[]>([]);
  const [headcounts, setHeadcounts] = useState<Headcount[]>([]);
  const [loading, setLoading] = useState(true);
  const [opLoading, setOpLoading] = useState(false);

  // ── UI state ──
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [addingTo, setAddingTo] = useState<string | null>(null); // parent id for new dept
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptLevel, setNewDeptLevel] = useState(1);

  // ── Member assignment modal ──
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [assignType, setAssignType] = useState<UserAssignment['assignment_type']>('주소속');
  const [assignRole, setAssignRole] = useState('');
  const [assignGrade, setAssignGrade] = useState('');
  const [selectedMemberForAssign, setSelectedMemberForAssign] = useState<WIOMember | null>(null);

  // ── Headcount edit ──
  const [editingHeadcount, setEditingHeadcount] = useState(false);
  const [headcountEdit, setHeadcountEdit] = useState(0);

  // ── Change log ──
  const [changeLog, setChangeLog] = useState<ChangeLog>({ newDepts: 0, memberChanges: 0 });

  const editInputRef = useRef<HTMLInputElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

  // ── Computed ──
  const assignmentCounts = useCallback(() => {
    const counts: Record<string, number> = {};
    assignments.filter(a => a.status === 'active').forEach(a => {
      counts[a.org_id] = (counts[a.org_id] || 0) + 1;
    });
    return counts;
  }, [assignments]);

  const tree = buildTree(departments, assignmentCounts());

  const selectedOrg = departments.find(d => d.id === selectedOrgId) || null;
  const selectedOrgAssignments = assignments.filter(a => a.org_id === selectedOrgId && a.status === 'active');
  const selectedOrgHeadcount = headcounts.find(h => h.org_id === selectedOrgId);
  const hasChildren = (id: string) => departments.some(d => d.parent_id === id);

  // ═══════════════════════════════════════
  // Data fetching
  // ═══════════════════════════════════════

  const loadData = useCallback(async () => {
    setLoading(true);
    if (isDemo) {
      const demo = generateDemoData();
      setDepartments(demo.departments);
      setAssignments(demo.assignments);
      setAllMembers(demo.members);
      setHeadcounts(demo.headcounts);
      // Expand top-level by default
      setExpandedNodes(new Set(demo.departments.filter(d => !d.parent_id).map(d => d.id)));
      setLoading(false);
      return;
    }

    try {
      const [deptRes, assignRes, memberRes, hcRes] = await Promise.all([
        supabase.from('wio_departments').select('*').eq('tenant_id', tenantId).order('sort_order'),
        supabase.from('wio_user_assignments').select('*, wio_members!inner(display_name, avatar_url)').eq('tenant_id', tenantId).eq('status', 'active'),
        supabase.from('wio_members').select('*').eq('tenant_id', tenantId).eq('is_active', true),
        supabase.from('wio_headcount').select('*').eq('tenant_id', tenantId),
      ]);

      setDepartments(deptRes.data || []);
      // Flatten joined member data
      setAssignments((assignRes.data || []).map((a: any) => ({
        ...a,
        display_name: a.wio_members?.display_name || '',
        avatar_url: a.wio_members?.avatar_url || null,
      })));
      setAllMembers((memberRes.data || []).map((r: any) => ({
        id: r.id,
        tenantId: r.tenant_id,
        userId: r.user_id,
        displayName: r.display_name,
        role: r.role,
        jobTitle: r.job_title,
        department: r.department,
        avatarUrl: r.avatar_url,
        moduleAccess: r.module_access || [],
        isActive: r.is_active,
        joinedAt: r.joined_at,
      })));
      setHeadcounts(hcRes.data || []);

      // Expand top-level
      if (deptRes.data) {
        setExpandedNodes(new Set(deptRes.data.filter((d: Department) => !d.parent_id).map((d: Department) => d.id)));
      }
    } catch (err) {
      console.error('loadData:', err);
      showToast('데이터 로드 실패');
    }
    setLoading(false);
  }, [tenantId, isDemo, supabase, showToast]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (editingNodeId && editInputRef.current) editInputRef.current.focus();
  }, [editingNodeId]);

  useEffect(() => {
    if (addingTo && addInputRef.current) addInputRef.current.focus();
  }, [addingTo]);

  // ═══════════════════════════════════════
  // CRUD: Create default tracks
  // ═══════════════════════════════════════

  async function createDefaultTracks() {
    setOpLoading(true);
    if (isDemo) {
      const newDepts: Department[] = DEFAULT_TRACKS.map((t, i) => ({
        id: `demo-new-${Date.now()}-${i}`,
        tenant_id: 'demo',
        name: t.name,
        parent_id: null,
        head_id: null,
        level: 0,
        sort_order: t.sort_order,
      }));
      setDepartments(newDepts);
      setExpandedNodes(new Set(newDepts.map(d => d.id)));
      setChangeLog(prev => ({ ...prev, newDepts: prev.newDepts + 7 }));
      showToast('기본 트랙 7개가 생성되었습니다');
      setOpLoading(false);
      return;
    }

    const inserts = DEFAULT_TRACKS.map(t => ({
      tenant_id: tenantId,
      name: t.name,
      parent_id: null,
      head_id: null,
      level: 0,
      sort_order: t.sort_order,
    }));

    const { error } = await supabase.from('wio_departments').insert(inserts);
    if (error) { showToast('트랙 생성 실패'); console.error(error); }
    else {
      showToast('기본 트랙 7개가 생성되었습니다');
      setChangeLog(prev => ({ ...prev, newDepts: prev.newDepts + 7 }));
      await loadData();
    }
    setOpLoading(false);
  }

  // ═══════════════════════════════════════
  // CRUD: Add department
  // ═══════════════════════════════════════

  async function addDepartment(parentId: string | null) {
    if (!newDeptName.trim()) return;
    setOpLoading(true);

    const parentDept = parentId ? departments.find(d => d.id === parentId) : null;
    const siblings = departments.filter(d => d.parent_id === parentId);
    const sortOrder = siblings.length > 0 ? Math.max(...siblings.map(s => s.sort_order)) + 1 : 1;
    const level = parentDept ? Math.min(parentDept.level + 1, 2) : 0;

    if (isDemo) {
      const newDept: Department = {
        id: `demo-new-${Date.now()}`,
        tenant_id: 'demo',
        name: newDeptName.trim(),
        parent_id: parentId,
        head_id: null,
        level: newDeptLevel !== undefined ? newDeptLevel : level,
        sort_order: sortOrder,
      };
      setDepartments(prev => [...prev, newDept]);
      if (parentId) setExpandedNodes(prev => new Set([...prev, parentId]));
      setChangeLog(prev => ({ ...prev, newDepts: prev.newDepts + 1 }));
      showToast(`"${newDeptName.trim()}" 생성됨`);
    } else {
      const { error } = await supabase.from('wio_departments').insert({
        tenant_id: tenantId,
        name: newDeptName.trim(),
        parent_id: parentId,
        head_id: null,
        level: newDeptLevel !== undefined ? newDeptLevel : level,
        sort_order: sortOrder,
      });
      if (error) { showToast('부서 생성 실패'); console.error(error); }
      else {
        showToast(`"${newDeptName.trim()}" 생성됨`);
        setChangeLog(prev => ({ ...prev, newDepts: prev.newDepts + 1 }));
        await loadData();
      }
    }

    setAddingTo(null);
    setNewDeptName('');
    setNewDeptLevel(1);
    setOpLoading(false);
  }

  // ═══════════════════════════════════════
  // CRUD: Edit department name
  // ═══════════════════════════════════════

  async function saveDeptName(deptId: string) {
    if (!editingName.trim()) { setEditingNodeId(null); return; }
    setOpLoading(true);

    if (isDemo) {
      setDepartments(prev => prev.map(d => d.id === deptId ? { ...d, name: editingName.trim() } : d));
      showToast('이름 변경됨');
    } else {
      const { error } = await supabase.from('wio_departments').update({ name: editingName.trim() }).eq('id', deptId);
      if (error) { showToast('이름 변경 실패'); console.error(error); }
      else { showToast('이름 변경됨'); await loadData(); }
    }
    setEditingNodeId(null);
    setEditingName('');
    setOpLoading(false);
  }

  // ═══════════════════════════════════════
  // CRUD: Delete department
  // ═══════════════════════════════════════

  async function deleteDepartment(deptId: string) {
    if (hasChildren(deptId)) { showToast('하위 조직이 있어 삭제할 수 없습니다'); return; }
    if (!confirm('이 조직을 삭제하시겠습니까?')) return;
    setOpLoading(true);

    if (isDemo) {
      setDepartments(prev => prev.filter(d => d.id !== deptId));
      setAssignments(prev => prev.filter(a => a.org_id !== deptId));
      if (selectedOrgId === deptId) setSelectedOrgId(null);
      showToast('조직 삭제됨');
    } else {
      // Deactivate assignments first
      await supabase.from('wio_user_assignments').update({ status: 'inactive' }).eq('org_id', deptId);
      const { error } = await supabase.from('wio_departments').delete().eq('id', deptId);
      if (error) { showToast('삭제 실패'); console.error(error); }
      else {
        showToast('조직 삭제됨');
        if (selectedOrgId === deptId) setSelectedOrgId(null);
        await loadData();
      }
    }
    setOpLoading(false);
  }

  // ═══════════════════════════════════════
  // CRUD: Assign member
  // ═══════════════════════════════════════

  async function assignMember() {
    if (!selectedMemberForAssign || !selectedOrgId) return;
    setOpLoading(true);

    const newAssignment: UserAssignment = {
      id: isDemo ? `da-new-${Date.now()}` : '',
      tenant_id: tenantId,
      user_id: selectedMemberForAssign.id,
      org_id: selectedOrgId,
      assignment_type: assignType,
      role_title: assignRole || '사원',
      position_grade: assignGrade || 'S1',
      is_org_head: false,
      start_date: new Date().toISOString().split('T')[0],
      end_date: null,
      status: 'active',
      display_name: selectedMemberForAssign.displayName,
      avatar_url: selectedMemberForAssign.avatarUrl,
    };

    if (isDemo) {
      setAssignments(prev => [...prev, newAssignment]);
      setChangeLog(prev => ({ ...prev, memberChanges: prev.memberChanges + 1 }));
      showToast(`${selectedMemberForAssign.displayName} 배치 완료`);
    } else {
      const { id, display_name, avatar_url, ...insert } = newAssignment;
      const { error } = await supabase.from('wio_user_assignments').insert(insert);
      if (error) { showToast('배치 실패'); console.error(error); }
      else {
        showToast(`${selectedMemberForAssign.displayName} 배치 완료`);
        setChangeLog(prev => ({ ...prev, memberChanges: prev.memberChanges + 1 }));
        await loadData();
      }
    }

    setShowAssignModal(false);
    setSelectedMemberForAssign(null);
    setAssignRole('');
    setAssignGrade('');
    setMemberSearch('');
    setOpLoading(false);
  }

  // ═══════════════════════════════════════
  // CRUD: Remove assignment
  // ═══════════════════════════════════════

  async function removeAssignment(assignmentId: string) {
    setOpLoading(true);
    if (isDemo) {
      setAssignments(prev => prev.map(a => a.id === assignmentId ? { ...a, status: 'inactive' as const } : a));
      setChangeLog(prev => ({ ...prev, memberChanges: prev.memberChanges + 1 }));
      showToast('인원 해제됨');
    } else {
      const { error } = await supabase.from('wio_user_assignments').update({ status: 'inactive' }).eq('id', assignmentId);
      if (error) { showToast('해제 실패'); console.error(error); }
      else {
        showToast('인원 해제됨');
        setChangeLog(prev => ({ ...prev, memberChanges: prev.memberChanges + 1 }));
        await loadData();
      }
    }
    setOpLoading(false);
  }

  // ═══════════════════════════════════════
  // CRUD: Set org head
  // ═══════════════════════════════════════

  async function setOrgHead(assignmentId: string) {
    if (!selectedOrgId) return;
    setOpLoading(true);

    if (isDemo) {
      setAssignments(prev => prev.map(a => {
        if (a.org_id === selectedOrgId) return { ...a, is_org_head: a.id === assignmentId };
        return a;
      }));
      const person = assignments.find(a => a.id === assignmentId);
      if (person) {
        setDepartments(prev => prev.map(d =>
          d.id === selectedOrgId ? { ...d, head_id: person.user_id } : d
        ));
      }
      showToast('조직장 지정됨');
    } else {
      // Clear current head
      await supabase.from('wio_user_assignments').update({ is_org_head: false }).eq('org_id', selectedOrgId).eq('status', 'active');
      // Set new head
      const { error } = await supabase.from('wio_user_assignments').update({ is_org_head: true }).eq('id', assignmentId);
      if (error) { showToast('조직장 지정 실패'); console.error(error); }
      else {
        // Update department head_id
        const person = assignments.find(a => a.id === assignmentId);
        if (person) {
          await supabase.from('wio_departments').update({ head_id: person.user_id }).eq('id', selectedOrgId);
        }
        showToast('조직장 지정됨');
        await loadData();
      }
    }
    setOpLoading(false);
  }

  // ═══════════════════════════════════════
  // CRUD: Update headcount
  // ═══════════════════════════════════════

  async function updateHeadcount(newCount: number) {
    if (!selectedOrgId) return;
    setOpLoading(true);

    if (isDemo) {
      const existing = headcounts.find(h => h.org_id === selectedOrgId);
      if (existing) {
        setHeadcounts(prev => prev.map(h => h.org_id === selectedOrgId ? { ...h, count: newCount } : h));
      } else {
        setHeadcounts(prev => [...prev, {
          id: `dh-new-${Date.now()}`, tenant_id: 'demo', org_id: selectedOrgId,
          position_grade: 'ALL', count: newCount, filled_count: selectedOrgAssignments.length,
          recruiting_count: 0, effective_date: new Date().toISOString().split('T')[0], status: 'active',
        }]);
      }
      showToast('정원 업데이트됨');
    } else {
      const existing = headcounts.find(h => h.org_id === selectedOrgId);
      if (existing) {
        const { error } = await supabase.from('wio_headcount').update({ count: newCount }).eq('id', existing.id);
        if (error) showToast('정원 업데이트 실패');
        else { showToast('정원 업데이트됨'); await loadData(); }
      } else {
        const { error } = await supabase.from('wio_headcount').insert({
          tenant_id: tenantId, org_id: selectedOrgId, position_grade: 'ALL',
          count: newCount, filled_count: selectedOrgAssignments.length,
          recruiting_count: 0, effective_date: new Date().toISOString().split('T')[0], status: 'active',
        });
        if (error) showToast('정원 생성 실패');
        else { showToast('정원 업데이트됨'); await loadData(); }
      }
    }
    setEditingHeadcount(false);
    setOpLoading(false);
  }

  // ═══════════════════════════════════════
  // Toggle expand
  // ═══════════════════════════════════════

  function toggleExpand(id: string) {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  // ═══════════════════════════════════════
  // Render tree node (recursive)
  // ═══════════════════════════════════════

  function renderNode(node: TreeNode, depth: number) {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedOrgId === node.id;
    const isEditing = editingNodeId === node.id;
    const lc = LEVEL_COLORS[node.level] || LEVEL_COLORS[0];

    return (
      <div key={node.id}>
        <div
          className={`group flex items-center gap-2 rounded-lg px-2 py-1.5 cursor-pointer transition-all text-xs
            ${isSelected ? `${lc.bg} ${lc.border} border` : 'hover:bg-white/5 border border-transparent'}`}
          style={{ paddingLeft: 8 + depth * 18 }}
          onClick={() => { setSelectedOrgId(node.id); }}
        >
          {/* Expand arrow */}
          {node.children.length > 0 ? (
            <button onClick={(e) => { e.stopPropagation(); toggleExpand(node.id); }} className="shrink-0">
              <ChevronRight size={12} className={`text-slate-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </button>
          ) : (
            <span className="w-3 shrink-0" />
          )}

          {/* Level badge */}
          <span className={`text-[9px] px-1.5 py-0.5 rounded ${lc.bg} ${lc.text} shrink-0`}>
            {LEVEL_LABELS[node.level] || '기타'}
          </span>

          {/* Name (editable) */}
          {isEditing ? (
            <input
              ref={editInputRef}
              value={editingName}
              onChange={e => setEditingName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveDeptName(node.id); if (e.key === 'Escape') setEditingNodeId(null); }}
              onBlur={() => saveDeptName(node.id)}
              className="flex-1 min-w-0 bg-white/10 border border-indigo-500/30 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none"
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <span
              className="font-medium text-white truncate flex-1 min-w-0"
              onDoubleClick={(e) => { e.stopPropagation(); setEditingNodeId(node.id); setEditingName(node.name); }}
            >
              {node.name}
            </span>
          )}

          {/* Member count */}
          {node.memberCount > 0 && (
            <span className="text-[10px] text-slate-500 shrink-0">{node.memberCount}명</span>
          )}

          {/* Actions (visible on hover) */}
          <div className="hidden group-hover:flex items-center gap-0.5 shrink-0 ml-1">
            <button
              onClick={(e) => { e.stopPropagation(); setAddingTo(node.id); setNewDeptName(''); setNewDeptLevel(Math.min(node.level + 1, 2)); }}
              className="p-0.5 rounded hover:bg-white/10 text-slate-600 hover:text-indigo-400 transition"
              title="하위 부서 추가"
            >
              <Plus size={11} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setEditingNodeId(node.id); setEditingName(node.name); }}
              className="p-0.5 rounded hover:bg-white/10 text-slate-600 hover:text-amber-400 transition"
              title="이름 수정"
            >
              <Pencil size={11} />
            </button>
            {!hasChildren(node.id) && (
              <button
                onClick={(e) => { e.stopPropagation(); deleteDepartment(node.id); }}
                className="p-0.5 rounded hover:bg-white/10 text-slate-600 hover:text-red-400 transition"
                title="삭제"
              >
                <Trash2 size={11} />
              </button>
            )}
          </div>
        </div>

        {/* Inline add child */}
        {addingTo === node.id && (
          <div className="flex items-center gap-2 px-2 py-1.5 ml-5" style={{ paddingLeft: 8 + (depth + 1) * 18 }}>
            <select
              value={newDeptLevel}
              onChange={e => setNewDeptLevel(Number(e.target.value))}
              className="bg-white/5 border border-white/10 rounded px-1.5 py-1 text-[10px] text-white focus:outline-none focus:border-indigo-500"
            >
              {[0, 1, 2].map(l => (
                <option key={l} value={l} className="bg-[#0F0F23]">{LEVEL_LABELS[l]}</option>
              ))}
            </select>
            <input
              ref={addInputRef}
              value={newDeptName}
              onChange={e => setNewDeptName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addDepartment(node.id); if (e.key === 'Escape') setAddingTo(null); }}
              placeholder="부서명 입력..."
              className="flex-1 bg-white/10 border border-indigo-500/30 rounded px-2 py-1 text-xs text-white placeholder:text-slate-600 focus:outline-none"
            />
            <button onClick={() => addDepartment(node.id)}
              className="p-1 rounded bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 transition">
              <Check size={12} />
            </button>
            <button onClick={() => setAddingTo(null)}
              className="p-1 rounded bg-white/5 text-slate-500 hover:bg-white/10 transition">
              <X size={12} />
            </button>
          </div>
        )}

        {/* Children */}
        {isExpanded && node.children.map(child => renderNode(child, depth + 1))}
      </div>
    );
  }

  // ═══════════════════════════════════════
  // Filtered members for assignment modal
  // ═══════════════════════════════════════

  const filteredMembers = allMembers.filter(m => {
    if (!memberSearch) return true;
    return m.displayName.includes(memberSearch) || (m.jobTitle && m.jobTitle.includes(memberSearch));
  });

  // already assigned to this org
  const alreadyAssignedIds = new Set(selectedOrgAssignments.map(a => a.user_id));

  // ═══════════════════════════════════════
  // Find head name
  // ═══════════════════════════════════════
  function getHeadName(orgId: string): string | null {
    const headAssignment = assignments.find(a => a.org_id === orgId && a.is_org_head && a.status === 'active');
    return headAssignment?.display_name || null;
  }

  // ═══════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-indigo-400" />
        <span className="ml-2 text-sm text-slate-500">조직 데이터 로딩 중...</span>
      </div>
    );
  }

  // Empty state
  if (departments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Building size={48} className="text-slate-700 mb-4" />
        <h3 className="text-sm font-semibold text-white mb-2">조직 구조를 설정해주세요</h3>
        <p className="text-xs text-slate-500 mb-6 max-w-xs">
          아직 조직이 없습니다. 기본 7트랙을 생성하여 조직 설계를 시작하세요.
        </p>
        <button
          onClick={createDefaultTracks}
          disabled={opLoading}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-500 transition disabled:opacity-50"
        >
          {opLoading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          시작하기 - 기본 트랙 생성
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-4" style={{ minHeight: 'calc(100vh - 380px)' }}>

        {/* ─── LEFT: Org Tree (60%) ─── */}
        <div className="w-[60%] shrink-0 rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">조직 트리</span>
              <span className="text-[10px] text-slate-600">{departments.length}개 조직</span>
            </div>
            <button
              onClick={() => { setAddingTo('__root__'); setNewDeptName(''); setNewDeptLevel(0); }}
              className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 transition"
            >
              <Plus size={11} /> 최상위 추가
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {/* Root-level add */}
            {addingTo === '__root__' && (
              <div className="flex items-center gap-2 px-2 py-1.5">
                <select
                  value={newDeptLevel}
                  onChange={e => setNewDeptLevel(Number(e.target.value))}
                  className="bg-white/5 border border-white/10 rounded px-1.5 py-1 text-[10px] text-white focus:outline-none focus:border-indigo-500"
                >
                  {[0, 1, 2].map(l => (
                    <option key={l} value={l} className="bg-[#0F0F23]">{LEVEL_LABELS[l]}</option>
                  ))}
                </select>
                <input
                  ref={addInputRef}
                  value={newDeptName}
                  onChange={e => setNewDeptName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addDepartment(null); if (e.key === 'Escape') setAddingTo(null); }}
                  placeholder="조직명 입력..."
                  className="flex-1 bg-white/10 border border-indigo-500/30 rounded px-2 py-1 text-xs text-white placeholder:text-slate-600 focus:outline-none"
                />
                <button onClick={() => addDepartment(null)}
                  className="p-1 rounded bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 transition">
                  <Check size={12} />
                </button>
                <button onClick={() => setAddingTo(null)}
                  className="p-1 rounded bg-white/5 text-slate-500 hover:bg-white/10 transition">
                  <X size={12} />
                </button>
              </div>
            )}

            {tree.map(node => renderNode(node, 0))}
          </div>
        </div>

        {/* ─── RIGHT: Selected Org Detail (40%) ─── */}
        <div className="flex-1 min-w-0 rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden flex flex-col">
          {selectedOrg ? (
            <>
              {/* Header */}
              <div className="px-5 py-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-600/15 flex items-center justify-center">
                    <Building size={18} className="text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white">{selectedOrg.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded ${(LEVEL_COLORS[selectedOrg.level] || LEVEL_COLORS[0]).bg} ${(LEVEL_COLORS[selectedOrg.level] || LEVEL_COLORS[0]).text}`}>
                        {LEVEL_LABELS[selectedOrg.level] || '기타'}
                      </span>
                      {getHeadName(selectedOrg.id) && (
                        <>
                          <span className="text-[10px] text-slate-600">|</span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Crown size={9} className="text-amber-400" /> {getHeadName(selectedOrg.id)}
                          </span>
                        </>
                      )}
                      <span className="text-[10px] text-slate-600">|</span>
                      <span className="text-[10px] text-slate-500">{selectedOrgAssignments.length}명</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="flex items-center gap-1 text-[10px] px-3 py-1.5 rounded-lg bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 transition"
                  >
                    <UserPlus size={11} /> 직원 추가
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {/* 1. 기본 정보 */}
                <section>
                  <h4 className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                    <Building size={12} /> 기본 정보
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
                      <span className="text-[9px] text-slate-600 block">조직명</span>
                      <span className="text-xs text-white">{selectedOrg.name}</span>
                    </div>
                    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
                      <span className="text-[9px] text-slate-600 block">코드</span>
                      <span className="text-xs text-white font-mono">{selectedOrg.name.replace(/[^a-zA-Z가-힣]/g, '').slice(0, 6).toUpperCase() || 'ORG'}</span>
                    </div>
                    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
                      <span className="text-[9px] text-slate-600 block">레벨</span>
                      <span className="text-xs text-white">{LEVEL_LABELS[selectedOrg.level] || '기타'}</span>
                    </div>
                    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
                      <span className="text-[9px] text-slate-600 block">상위 조직</span>
                      <span className="text-xs text-white">{departments.find(d => d.id === selectedOrg.parent_id)?.name || '-'}</span>
                    </div>
                  </div>
                </section>

                {/* 2. 정원 */}
                <section>
                  <h4 className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                    <Users size={12} /> 정원
                  </h4>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 rounded-lg border border-white/5 bg-white/[0.02] p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-slate-500">정원</span>
                        {editingHeadcount ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={headcountEdit}
                              onChange={e => setHeadcountEdit(Number(e.target.value))}
                              onKeyDown={e => { if (e.key === 'Enter') updateHeadcount(headcountEdit); if (e.key === 'Escape') setEditingHeadcount(false); }}
                              className="w-14 bg-white/10 border border-indigo-500/30 rounded px-1.5 py-0.5 text-xs text-white text-center focus:outline-none"
                              min={0}
                            />
                            <button onClick={() => updateHeadcount(headcountEdit)} className="p-0.5 text-indigo-400 hover:text-indigo-300"><Check size={11} /></button>
                            <button onClick={() => setEditingHeadcount(false)} className="p-0.5 text-slate-500 hover:text-slate-400"><X size={11} /></button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditingHeadcount(true); setHeadcountEdit(selectedOrgHeadcount?.count || 0); }}
                            className="text-[9px] text-indigo-400 hover:text-indigo-300"
                          >
                            <Pencil size={9} />
                          </button>
                        )}
                      </div>
                      <div className="flex items-end gap-4">
                        <div>
                          <span className="text-lg font-bold text-white">{selectedOrgHeadcount?.count || 0}</span>
                          <span className="text-[10px] text-slate-500 ml-1">명</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px]">
                          <span className="text-emerald-400">충원 {selectedOrgHeadcount?.filled_count ?? selectedOrgAssignments.length}</span>
                          <span className="text-amber-400">채용중 {selectedOrgHeadcount?.recruiting_count || 0}</span>
                          <span className="text-red-400">공석 {Math.max(0, (selectedOrgHeadcount?.count || 0) - (selectedOrgHeadcount?.filled_count ?? selectedOrgAssignments.length))}</span>
                        </div>
                      </div>
                      {/* Progress bar */}
                      {(selectedOrgHeadcount?.count || 0) > 0 && (
                        <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{ width: `${Math.min(100, ((selectedOrgHeadcount?.filled_count ?? selectedOrgAssignments.length) / (selectedOrgHeadcount?.count || 1)) * 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* 3. 소속 인원 */}
                <section>
                  <h4 className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                    <Users size={12} /> 소속 인원 ({selectedOrgAssignments.length}명)
                  </h4>
                  <div className="space-y-1">
                    {selectedOrgAssignments.map(a => (
                      <div key={a.id}
                        className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 hover:bg-white/5 transition group">
                        <div className="h-7 w-7 rounded-full bg-indigo-600/20 flex items-center justify-center text-[10px] font-bold text-indigo-400 shrink-0">
                          {(a.display_name || '?').charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium text-white">{a.display_name}</span>
                            {a.is_org_head && (
                              <Crown size={10} className="text-amber-400 shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-500">{a.role_title}</span>
                            <span className="text-[9px] text-slate-600">{a.position_grade}</span>
                            {a.assignment_type !== '주소속' && (
                              <span className="text-[9px] px-1 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                {a.assignment_type}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                          {!a.is_org_head && (
                            <button
                              onClick={() => setOrgHead(a.id)}
                              className="p-1 rounded hover:bg-amber-500/10 text-slate-600 hover:text-amber-400 transition"
                              title="조직장 지정"
                            >
                              <Crown size={11} />
                            </button>
                          )}
                          <button
                            onClick={() => removeAssignment(a.id)}
                            className="p-1 rounded hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition"
                            title="인원 해제"
                          >
                            <X size={11} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {selectedOrgAssignments.length === 0 && (
                      <p className="text-center py-6 text-[10px] text-slate-600">소속 인원이 없습니다</p>
                    )}
                  </div>
                </section>
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
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 mt-4">
        {(changeLog.newDepts > 0 || changeLog.memberChanges > 0) && (
          <div className="flex items-center gap-3 mr-4 text-[10px]">
            {changeLog.newDepts > 0 && (
              <span className="text-emerald-400">신설 {changeLog.newDepts}</span>
            )}
            {changeLog.memberChanges > 0 && (
              <span className="text-blue-400">인원변동 {changeLog.memberChanges}</span>
            )}
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => showToast('변경이력')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 text-slate-400 text-[11px] rounded-lg hover:bg-white/10 transition border border-white/10">
            <History size={12} /> 변경이력
          </button>
          <button onClick={() => showToast('내보내기')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 text-slate-400 text-[11px] rounded-lg hover:bg-white/10 transition border border-white/10">
            <Download size={12} /> 내보내기
          </button>
        </div>
      </div>

      {/* ═══ Member Assignment Modal ═══ */}
      {showAssignModal && selectedOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowAssignModal(false)}>
          <div className="bg-[#0F0F23] border border-white/10 rounded-2xl w-[520px] max-h-[80vh] overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">직원 배치</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">{selectedOrg.name}에 인원 배치</p>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-500 hover:text-white transition">
                <X size={16} />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 py-3 border-b border-white/5">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  value={memberSearch}
                  onChange={e => setMemberSearch(e.target.value)}
                  placeholder="이름 검색..."
                  className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Member list */}
            <div className="max-h-[250px] overflow-y-auto px-5 py-2">
              {filteredMembers.map(m => {
                const isAlready = alreadyAssignedIds.has(m.id);
                const isChosen = selectedMemberForAssign?.id === m.id;
                return (
                  <button key={m.id}
                    onClick={() => !isAlready && setSelectedMemberForAssign(m)}
                    disabled={isAlready}
                    className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left transition ${
                      isChosen ? 'bg-indigo-500/10 border border-indigo-500/20' :
                      isAlready ? 'opacity-40 cursor-not-allowed' :
                      'hover:bg-white/5 border border-transparent'
                    }`}>
                    <div className="h-7 w-7 rounded-full bg-indigo-600/20 flex items-center justify-center text-[10px] font-bold text-indigo-400 shrink-0">
                      {m.displayName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-white">{m.displayName}</span>
                      <span className="text-[10px] text-slate-500 ml-2">{m.jobTitle || ''}</span>
                    </div>
                    {isAlready && <span className="text-[9px] text-slate-600">이미 소속</span>}
                    {isChosen && <Check size={12} className="text-indigo-400" />}
                  </button>
                );
              })}
              {filteredMembers.length === 0 && (
                <p className="text-center py-6 text-[10px] text-slate-600">멤버가 없습니다</p>
              )}
            </div>

            {/* Assignment config */}
            {selectedMemberForAssign && (
              <div className="px-5 py-3 border-t border-white/5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-indigo-600/20 flex items-center justify-center text-[11px] font-bold text-indigo-400">
                    {selectedMemberForAssign.displayName.charAt(0)}
                  </div>
                  <span className="text-xs font-semibold text-white">{selectedMemberForAssign.displayName}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[9px] text-slate-600 mb-1">배치 유형</label>
                    <select
                      value={assignType}
                      onChange={e => setAssignType(e.target.value as any)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      {['주소속', '겸직', '파견', '프로젝트'].map(t => (
                        <option key={t} value={t} className="bg-[#0F0F23]">{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-600 mb-1">직책</label>
                    <input
                      value={assignRole}
                      onChange={e => setAssignRole(e.target.value)}
                      placeholder="예: 팀장"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-600 mb-1">직급</label>
                    <input
                      value={assignGrade}
                      onChange={e => setAssignGrade(e.target.value)}
                      placeholder="예: M1, S2"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Modal footer */}
            <div className="px-5 py-3 border-t border-white/5 flex justify-end gap-2">
              <button onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 text-xs text-slate-400 rounded-lg hover:bg-white/5 transition border border-white/10">
                취소
              </button>
              <button
                onClick={assignMember}
                disabled={!selectedMemberForAssign || opLoading}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-500 transition disabled:opacity-50"
              >
                {opLoading ? <Loader2 size={12} className="animate-spin" /> : <UserPlus size={12} />}
                배치
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
