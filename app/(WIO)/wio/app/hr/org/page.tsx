'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Network, Users, ChevronRight, ChevronDown, Plus, Search,
  Building2, User, ArrowRight, Calendar, LayoutGrid, TreePine,
  UserSearch, ClipboardList, History, AlertTriangle, X, Mail,
  FileText, Check, Clock, Shield, Phone,
} from 'lucide-react';
import { useWIO } from '../../layout';
import { createClient } from '@/lib/supabase/client';

/* ─────────────────────── Types ─────────────────────── */

interface Person {
  id: string;
  name: string;
  title: string;
  grade: string;
  email: string;
  phone: string;
  skills: string[];
  avatar?: string;
  departmentId: string;
  reportTo?: string;
}

interface OrgUnit {
  id: string;
  name: string;
  type: 'company' | 'track' | 'division' | 'team' | 'part';
  headId?: string;
  head: string;
  headCount: number;
  capacity: number;
  parentId?: string | null;
  children?: OrgUnit[];
  members?: Person[];
}

interface PersonnelOrder {
  id: string;
  orderNumber: string;
  type: 'transfer' | 'promotion' | 'new_hire' | 'resignation' | 'grade_change' | 'org_change';
  personName: string;
  personId: string;
  fromOrg: string;
  toOrg: string;
  fromPosition?: string;
  toPosition?: string;
  fromGrade?: string;
  toGrade?: string;
  effectiveDate: string;
  status: 'pending' | 'approved' | 'executing' | 'completed';
  reason: string;
  approvals: { step: string; approver: string; date: string; status: 'approved' | 'pending' | 'rejected' }[];
  createdAt: string;
}

interface OrgChangeHistory {
  id: string;
  date: string;
  changeType: 'create' | 'rename' | 'move' | 'dissolve';
  orgName: string;
  description: string;
  approvedBy: string;
}

interface HeadcountRow {
  departmentId: string;
  departmentName: string;
  capacity: number;
  current: number;
  vacant: number;
  recruiting: number;
  fillRate: number;
}

/* ─────────────────────── Constants ─────────────────────── */

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  company: { label: '회사', color: 'text-rose-400 bg-rose-500/10' },
  track: { label: '트랙', color: 'text-violet-400 bg-violet-500/10' },
  division: { label: '본부', color: 'text-blue-400 bg-blue-500/10' },
  team: { label: '팀', color: 'text-emerald-400 bg-emerald-500/10' },
  part: { label: '파트', color: 'text-amber-400 bg-amber-500/10' },
};

const ORDER_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  transfer: { label: '전환배치', color: 'text-blue-400 bg-blue-500/10' },
  promotion: { label: '승진', color: 'text-emerald-400 bg-emerald-500/10' },
  new_hire: { label: '신규입사', color: 'text-violet-400 bg-violet-500/10' },
  resignation: { label: '퇴사', color: 'text-red-400 bg-red-500/10' },
  grade_change: { label: '직급변경', color: 'text-amber-400 bg-amber-500/10' },
  org_change: { label: '조직변경', color: 'text-cyan-400 bg-cyan-500/10' },
};

const ORDER_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: '대기', color: 'text-amber-400 bg-amber-500/10' },
  approved: { label: '승인', color: 'text-blue-400 bg-blue-500/10' },
  executing: { label: '시행', color: 'text-violet-400 bg-violet-500/10' },
  completed: { label: '완료', color: 'text-emerald-400 bg-emerald-500/10' },
};

const CHANGE_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  create: { label: '신설', color: 'text-emerald-400 bg-emerald-500/10' },
  rename: { label: '개명', color: 'text-blue-400 bg-blue-500/10' },
  move: { label: '이동', color: 'text-amber-400 bg-amber-500/10' },
  dissolve: { label: '해체', color: 'text-red-400 bg-red-500/10' },
};

const TABS = [
  { key: 'org', label: '조직도', icon: Network },
  { key: 'headcount', label: '정원 관리', icon: Users },
  { key: 'orders', label: '인사발령', icon: ClipboardList },
  { key: 'history', label: '변경 이력', icon: History },
] as const;
type TabKey = (typeof TABS)[number]['key'];

/* ─────────────────────── Mock People ─────────────────────── */

const MOCK_PEOPLE: Person[] = [
  { id: 'p01', name: '천대표', title: '대표이사', grade: 'C-Level', email: 'ceo@tenone.biz', phone: '010-0000-0001', skills: ['경영전략', '리더십'], departmentId: 'root' },
  // T1 사업
  { id: 'p02', name: '김사업', title: '트랙장', grade: 'VP', email: 'kim.biz@tenone.biz', phone: '010-0000-0002', skills: ['사업개발', 'BD'], departmentId: 't1' },
  { id: 'p03', name: '이제품', title: '본부장', grade: 'Director', email: 'lee.product@tenone.biz', phone: '010-0000-0003', skills: ['PM', 'Agile'], departmentId: 'd1' },
  { id: 'p04', name: '박프론트', title: '팀장', grade: 'Senior', email: 'park.fe@tenone.biz', phone: '010-0000-0004', skills: ['React', 'TypeScript', 'Next.js'], departmentId: 'fe' },
  { id: 'p05', name: '김리액트', title: '프론트엔드 개발자', grade: 'Junior', email: 'kim.react@tenone.biz', phone: '010-0000-0005', skills: ['React', 'CSS'], departmentId: 'fe' },
  { id: 'p06', name: '나뷰어', title: '프론트엔드 개발자', grade: 'Associate', email: 'na.vue@tenone.biz', phone: '010-0000-0006', skills: ['Vue', 'React'], departmentId: 'fe' },
  { id: 'p07', name: '오타입', title: '프론트엔드 개발자', grade: 'Associate', email: 'oh.ts@tenone.biz', phone: '010-0000-0007', skills: ['TypeScript', 'Testing'], departmentId: 'fe' },
  { id: 'p08', name: '서넥스트', title: '프론트엔드 개발자', grade: 'Junior', email: 'seo.next@tenone.biz', phone: '010-0000-0008', skills: ['Next.js', 'Tailwind'], departmentId: 'fe' },
  { id: 'p09', name: '윤디자', title: 'UI/UX 디자이너', grade: 'Associate', email: 'yoon.design@tenone.biz', phone: '010-0000-0009', skills: ['Figma', 'Design System'], departmentId: 'fe' },
  { id: 'p10', name: '최백엔드', title: '팀장', grade: 'Senior', email: 'choi.be@tenone.biz', phone: '010-0000-0010', skills: ['Node.js', 'PostgreSQL'], departmentId: 'be' },
  { id: 'p11', name: '강노드', title: '백엔드 개발자', grade: 'Associate', email: 'kang.node@tenone.biz', phone: '010-0000-0011', skills: ['Node.js', 'Express'], departmentId: 'be' },
  { id: 'p12', name: '한파이썬', title: '백엔드 개발자', grade: 'Junior', email: 'han.py@tenone.biz', phone: '010-0000-0012', skills: ['Python', 'FastAPI'], departmentId: 'be' },
  { id: 'p13', name: '임고랭', title: '백엔드 개발자', grade: 'Associate', email: 'im.go@tenone.biz', phone: '010-0000-0013', skills: ['Go', 'gRPC'], departmentId: 'be' },
  { id: 'p14', name: '송디비', title: 'DBA', grade: 'Senior', email: 'song.db@tenone.biz', phone: '010-0000-0014', skills: ['PostgreSQL', 'Supabase'], departmentId: 'be' },
  { id: 'p15', name: '정큐에이', title: '팀장', grade: 'Senior', email: 'jung.qa@tenone.biz', phone: '010-0000-0015', skills: ['QA', '자동화 테스트'], departmentId: 'qa' },
  { id: 'p16', name: '배테스트', title: 'QA 엔지니어', grade: 'Associate', email: 'bae.test@tenone.biz', phone: '010-0000-0016', skills: ['Cypress', 'Jest'], departmentId: 'qa' },
  { id: 'p17', name: '유자동', title: 'QA 엔지니어', grade: 'Junior', email: 'yu.auto@tenone.biz', phone: '010-0000-0017', skills: ['Selenium', 'Performance'], departmentId: 'qa' },
  { id: 'p18', name: '조검증', title: 'QA 엔지니어', grade: 'Junior', email: 'jo.verify@tenone.biz', phone: '010-0000-0018', skills: ['Manual QA', 'Bug Tracking'], departmentId: 'qa' },
  // T1 사업본부
  { id: 'p19', name: '강사업', title: '본부장', grade: 'Director', email: 'kang.biz@tenone.biz', phone: '010-0000-0019', skills: ['전략기획', 'Sales'], departmentId: 'd2' },
  { id: 'p20', name: '한영업', title: '팀장', grade: 'Senior', email: 'han.sales@tenone.biz', phone: '010-0000-0020', skills: ['B2B Sales', 'Account Mgmt'], departmentId: 'sales' },
  { id: 'p21', name: '문거래', title: '영업 매니저', grade: 'Associate', email: 'moon.deal@tenone.biz', phone: '010-0000-0021', skills: ['Negotiation', 'CRM'], departmentId: 'sales' },
  { id: 'p22', name: '양계약', title: '영업 담당', grade: 'Junior', email: 'yang.contract@tenone.biz', phone: '010-0000-0022', skills: ['Contract', 'Proposal'], departmentId: 'sales' },
  { id: 'p23', name: '백파트너', title: '영업 담당', grade: 'Junior', email: 'baek.partner@tenone.biz', phone: '010-0000-0023', skills: ['Partnership', 'BD'], departmentId: 'sales' },
  { id: 'p24', name: '오마케팅', title: '팀장', grade: 'Senior', email: 'oh.mkt@tenone.biz', phone: '010-0000-0024', skills: ['Digital Marketing', 'Branding'], departmentId: 'mkt' },
  { id: 'p25', name: '임콘텐츠', title: '파트장', grade: 'Associate', email: 'im.content@tenone.biz', phone: '010-0000-0025', skills: ['콘텐츠 기획', 'SEO'], departmentId: 'mkt-c' },
  { id: 'p26', name: '차작가', title: '콘텐츠 크리에이터', grade: 'Junior', email: 'cha.writer@tenone.biz', phone: '010-0000-0026', skills: ['Copywriting', 'Blog'], departmentId: 'mkt-c' },
  { id: 'p27', name: '송퍼포', title: '파트장', grade: 'Associate', email: 'song.perf@tenone.biz', phone: '010-0000-0027', skills: ['퍼포먼스 마케팅', 'GA'], departmentId: 'mkt-p' },
  { id: 'p28', name: '권광고', title: '마케팅 담당', grade: 'Junior', email: 'kwon.ads@tenone.biz', phone: '010-0000-0028', skills: ['Google Ads', 'Meta Ads'], departmentId: 'mkt-p' },
  { id: 'p29', name: '윤씨에스', title: '팀장', grade: 'Senior', email: 'yoon.cs@tenone.biz', phone: '010-0000-0029', skills: ['CS Management', 'VOC'], departmentId: 'cs' },
  { id: 'p30', name: '고상담', title: 'CS 매니저', grade: 'Associate', email: 'go.counsel@tenone.biz', phone: '010-0000-0030', skills: ['고객응대', 'CRM'], departmentId: 'cs' },
  { id: 'p31', name: '피응대', title: 'CS 담당', grade: 'Junior', email: 'pi.support@tenone.biz', phone: '010-0000-0031', skills: ['Zendesk', 'Support'], departmentId: 'cs' },
  { id: 'p32', name: '허해결', title: 'CS 담당', grade: 'Junior', email: 'heo.resolve@tenone.biz', phone: '010-0000-0032', skills: ['Troubleshooting', 'FAQ'], departmentId: 'cs' },
  // T2 지원
  { id: 'p33', name: '김지원', title: '트랙장', grade: 'VP', email: 'kim.support@tenone.biz', phone: '010-0000-0033', skills: ['경영지원', '총무'], departmentId: 't2' },
  { id: 'p34', name: '조경영', title: '본부장', grade: 'Director', email: 'jo.mgmt@tenone.biz', phone: '010-0000-0034', skills: ['재무', 'HR'], departmentId: 'd3' },
  { id: 'p35', name: '나인사', title: '팀장', grade: 'Senior', email: 'na.hr@tenone.biz', phone: '010-0000-0035', skills: ['채용', '인사관리', '조직문화'], departmentId: 'hr' },
  { id: 'p36', name: '도채용', title: 'HR 매니저', grade: 'Associate', email: 'do.recruit@tenone.biz', phone: '010-0000-0036', skills: ['Recruiting', 'Onboarding'], departmentId: 'hr' },
  { id: 'p37', name: '마급여', title: 'HR 담당', grade: 'Junior', email: 'ma.payroll@tenone.biz', phone: '010-0000-0037', skills: ['급여', '4대보험'], departmentId: 'hr' },
  { id: 'p38', name: '유재무', title: '팀장', grade: 'Senior', email: 'yu.finance@tenone.biz', phone: '010-0000-0038', skills: ['재무관리', '회계'], departmentId: 'finance' },
  { id: 'p39', name: '라회계', title: '재무 매니저', grade: 'Associate', email: 'ra.acct@tenone.biz', phone: '010-0000-0039', skills: ['회계', '세무'], departmentId: 'finance' },
  { id: 'p40', name: '가예산', title: '재무 담당', grade: 'Junior', email: 'ga.budget@tenone.biz', phone: '010-0000-0040', skills: ['예산관리', 'ERP'], departmentId: 'finance' },
  { id: 'p41', name: '서인프라', title: '팀장', grade: 'Senior', email: 'seo.infra@tenone.biz', phone: '010-0000-0041', skills: ['AWS', 'GCP', 'Kubernetes'], departmentId: 'infra' },
  { id: 'p42', name: '태클라우드', title: 'DevOps 엔지니어', grade: 'Associate', email: 'tae.cloud@tenone.biz', phone: '010-0000-0042', skills: ['Docker', 'CI/CD', 'Terraform'], departmentId: 'infra' },
  { id: 'p43', name: '하보안', title: '보안 엔지니어', grade: 'Associate', email: 'ha.sec@tenone.biz', phone: '010-0000-0043', skills: ['Security', 'IAM'], departmentId: 'infra' },
  { id: 'p44', name: '주네트워크', title: 'IT 엔지니어', grade: 'Junior', email: 'ju.net@tenone.biz', phone: '010-0000-0044', skills: ['Networking', 'Monitoring'], departmentId: 'infra' },
  // T3~T7
  { id: 'p45', name: '민크리에이티브', title: '트랙장', grade: 'VP', email: 'min.creative@tenone.biz', phone: '010-0000-0045', skills: ['Creative Direction', 'Branding'], departmentId: 't3' },
  { id: 'p46', name: '신디자인', title: '본부장', grade: 'Director', email: 'shin.design@tenone.biz', phone: '010-0000-0046', skills: ['UI/UX', 'Design System'], departmentId: 'd4' },
  { id: 'p47', name: '안브랜드', title: '팀장', grade: 'Senior', email: 'an.brand@tenone.biz', phone: '010-0000-0047', skills: ['Branding', 'CI/BI'], departmentId: 'brand' },
  { id: 'p48', name: '표영상', title: '팀장', grade: 'Senior', email: 'pyo.video@tenone.biz', phone: '010-0000-0048', skills: ['영상제작', 'After Effects'], departmentId: 'media' },
  { id: 'p49', name: '구AI', title: '트랙장', grade: 'VP', email: 'gu.ai@tenone.biz', phone: '010-0000-0049', skills: ['AI/ML', 'LLM', 'Data Science'], departmentId: 't4' },
  { id: 'p50', name: '장데이터', title: '본부장', grade: 'Director', email: 'jang.data@tenone.biz', phone: '010-0000-0050', skills: ['Data Engineering', 'ETL'], departmentId: 'd5' },
  { id: 'p51', name: '석엠엘', title: '팀장', grade: 'Senior', email: 'seok.ml@tenone.biz', phone: '010-0000-0051', skills: ['PyTorch', 'LLM Fine-tuning'], departmentId: 'ml' },
  { id: 'p52', name: '변파이프', title: '팀장', grade: 'Senior', email: 'byun.pipe@tenone.biz', phone: '010-0000-0052', skills: ['Airflow', 'Spark'], departmentId: 'datapipe' },
  { id: 'p53', name: '우교육', title: '트랙장', grade: 'VP', email: 'woo.edu@tenone.biz', phone: '010-0000-0053', skills: ['교육기획', '커리큘럼'], departmentId: 't5' },
  { id: 'p54', name: '홍커뮤', title: '트랙장', grade: 'VP', email: 'hong.comm@tenone.biz', phone: '010-0000-0054', skills: ['커뮤니티', '이벤트'], departmentId: 't6' },
  { id: 'p55', name: '공글로벌', title: '트랙장', grade: 'VP', email: 'gong.global@tenone.biz', phone: '010-0000-0055', skills: ['해외사업', 'Localization'], departmentId: 't7' },
];

/* ─────────────────────── Mock Org ─────────────────────── */

const MOCK_ORG: OrgUnit[] = [
  {
    id: 'root', name: 'TenOne Universe', type: 'company', head: '천대표', headId: 'p01', headCount: 55, capacity: 70,
    children: [
      {
        id: 't1', name: 'T1 사업 트랙', type: 'track', head: '김사업', headId: 'p02', headCount: 31, capacity: 38, parentId: 'root',
        children: [
          {
            id: 'd1', name: '제품본부', type: 'division', head: '이제품', headId: 'p03', headCount: 16, capacity: 20, parentId: 't1',
            children: [
              { id: 'fe', name: '프론트엔드팀', type: 'team', head: '박프론트', headId: 'p04', headCount: 6, capacity: 8, parentId: 'd1' },
              { id: 'be', name: '백엔드팀', type: 'team', head: '최백엔드', headId: 'p10', headCount: 5, capacity: 6, parentId: 'd1' },
              { id: 'qa', name: 'QA팀', type: 'team', head: '정큐에이', headId: 'p15', headCount: 4, capacity: 5, parentId: 'd1' },
            ],
          },
          {
            id: 'd2', name: '사업본부', type: 'division', head: '강사업', headId: 'p19', headCount: 14, capacity: 17, parentId: 't1',
            children: [
              { id: 'sales', name: '영업팀', type: 'team', head: '한영업', headId: 'p20', headCount: 4, capacity: 5, parentId: 'd2' },
              {
                id: 'mkt', name: '마케팅팀', type: 'team', head: '오마케팅', headId: 'p24', headCount: 5, capacity: 6, parentId: 'd2',
                children: [
                  { id: 'mkt-c', name: '콘텐츠파트', type: 'part', head: '임콘텐츠', headId: 'p25', headCount: 2, capacity: 3, parentId: 'mkt' },
                  { id: 'mkt-p', name: '퍼포먼스파트', type: 'part', head: '송퍼포', headId: 'p27', headCount: 2, capacity: 3, parentId: 'mkt' },
                ],
              },
              { id: 'cs', name: 'CS팀', type: 'team', head: '윤씨에스', headId: 'p29', headCount: 4, capacity: 5, parentId: 'd2' },
            ],
          },
        ],
      },
      {
        id: 't2', name: 'T2 지원 트랙', type: 'track', head: '김지원', headId: 'p33', headCount: 12, capacity: 15, parentId: 'root',
        children: [
          {
            id: 'd3', name: '경영지원본부', type: 'division', head: '조경영', headId: 'p34', headCount: 11, capacity: 14, parentId: 't2',
            children: [
              { id: 'hr', name: 'HR팀', type: 'team', head: '나인사', headId: 'p35', headCount: 3, capacity: 4, parentId: 'd3' },
              { id: 'finance', name: '재무팀', type: 'team', head: '유재무', headId: 'p38', headCount: 3, capacity: 4, parentId: 'd3' },
              { id: 'infra', name: 'IT인프라팀', type: 'team', head: '서인프라', headId: 'p41', headCount: 4, capacity: 5, parentId: 'd3' },
            ],
          },
        ],
      },
      {
        id: 't3', name: 'T3 크리에이티브 트랙', type: 'track', head: '민크리에이티브', headId: 'p45', headCount: 4, capacity: 6, parentId: 'root',
        children: [
          {
            id: 'd4', name: '디자인본부', type: 'division', head: '신디자인', headId: 'p46', headCount: 3, capacity: 5, parentId: 't3',
            children: [
              { id: 'brand', name: '브랜드팀', type: 'team', head: '안브랜드', headId: 'p47', headCount: 1, capacity: 3, parentId: 'd4' },
              { id: 'media', name: '미디어팀', type: 'team', head: '표영상', headId: 'p48', headCount: 1, capacity: 3, parentId: 'd4' },
            ],
          },
        ],
      },
      {
        id: 't4', name: 'T4 AI 트랙', type: 'track', head: '구AI', headId: 'p49', headCount: 4, capacity: 6, parentId: 'root',
        children: [
          {
            id: 'd5', name: 'AI연구본부', type: 'division', head: '장데이터', headId: 'p50', headCount: 3, capacity: 5, parentId: 't4',
            children: [
              { id: 'ml', name: 'ML팀', type: 'team', head: '석엠엘', headId: 'p51', headCount: 1, capacity: 3, parentId: 'd5' },
              { id: 'datapipe', name: '데이터파이프라인팀', type: 'team', head: '변파이프', headId: 'p52', headCount: 1, capacity: 3, parentId: 'd5' },
            ],
          },
        ],
      },
      { id: 't5', name: 'T5 교육 트랙', type: 'track', head: '우교육', headId: 'p53', headCount: 1, capacity: 3, parentId: 'root' },
      { id: 't6', name: 'T6 커뮤니티 트랙', type: 'track', head: '홍커뮤', headId: 'p54', headCount: 1, capacity: 3, parentId: 'root' },
      { id: 't7', name: 'T7 글로벌 트랙', type: 'track', head: '공글로벌', headId: 'p55', headCount: 1, capacity: 3, parentId: 'root' },
    ],
  },
];

/* ─────────────────────── Mock Personnel Orders ─────────────────────── */

const MOCK_ORDERS: PersonnelOrder[] = [
  {
    id: 'o1', orderNumber: 'HR-2026-001', type: 'transfer', personName: '강노드', personId: 'p11',
    fromOrg: '백엔드팀', toOrg: '프론트엔드팀', fromPosition: '백엔드 개발자', toPosition: '풀스택 개발자',
    effectiveDate: '2026-04-01', status: 'approved', reason: '풀스택 역량 강화를 위한 전환배치',
    approvals: [
      { step: '1차 승인 (팀장)', approver: '최백엔드', date: '2026-03-20', status: 'approved' },
      { step: '2차 승인 (본부장)', approver: '이제품', date: '2026-03-22', status: 'approved' },
      { step: '3차 승인 (HR)', approver: '나인사', date: '2026-03-25', status: 'approved' },
    ],
    createdAt: '2026-03-18',
  },
  {
    id: 'o2', orderNumber: 'HR-2026-002', type: 'promotion', personName: '오마케팅', personId: 'p24',
    fromOrg: '마케팅팀', toOrg: '사업본부', fromPosition: '팀장', toPosition: '부본부장', fromGrade: 'Senior', toGrade: 'Director',
    effectiveDate: '2026-04-15', status: 'pending', reason: '마케팅 전략 성과 우수 / 사업본부 부본부장 승진',
    approvals: [
      { step: '1차 승인 (본부장)', approver: '강사업', date: '2026-03-28', status: 'approved' },
      { step: '2차 승인 (트랙장)', approver: '김사업', date: '', status: 'pending' },
      { step: '3차 승인 (대표)', approver: '천대표', date: '', status: 'pending' },
    ],
    createdAt: '2026-03-26',
  },
  {
    id: 'o3', orderNumber: 'HR-2026-003', type: 'new_hire', personName: '신입사원A', personId: 'new1',
    fromOrg: '-', toOrg: 'ML팀', toPosition: 'ML 엔지니어', toGrade: 'Junior',
    effectiveDate: '2026-04-07', status: 'executing', reason: 'AI 트랙 인력 확충',
    approvals: [
      { step: '1차 승인 (팀장)', approver: '석엠엘', date: '2026-03-15', status: 'approved' },
      { step: '2차 승인 (HR)', approver: '나인사', date: '2026-03-17', status: 'approved' },
    ],
    createdAt: '2026-03-10',
  },
  {
    id: 'o4', orderNumber: 'HR-2026-004', type: 'resignation', personName: '한파이썬', personId: 'p12',
    fromOrg: '백엔드팀', toOrg: '-', fromPosition: '백엔드 개발자',
    effectiveDate: '2026-03-31', status: 'completed', reason: '개인 사유 퇴사',
    approvals: [
      { step: '퇴사 접수 (팀장)', approver: '최백엔드', date: '2026-03-10', status: 'approved' },
      { step: 'HR 처리', approver: '나인사', date: '2026-03-12', status: 'approved' },
    ],
    createdAt: '2026-03-08',
  },
  {
    id: 'o5', orderNumber: 'HR-2026-005', type: 'grade_change', personName: '도채용', personId: 'p36',
    fromOrg: 'HR팀', toOrg: 'HR팀', fromPosition: 'HR 매니저', toPosition: 'HR 리드', fromGrade: 'Associate', toGrade: 'Senior',
    effectiveDate: '2026-04-01', status: 'completed', reason: '3년 근속 + 채용 프로세스 혁신 공로',
    approvals: [
      { step: '1차 승인 (팀장)', approver: '나인사', date: '2026-03-05', status: 'approved' },
      { step: '2차 승인 (본부장)', approver: '조경영', date: '2026-03-07', status: 'approved' },
    ],
    createdAt: '2026-03-01',
  },
];

/* ─────────────────────── Mock Org Change History ─────────────────────── */

const MOCK_HISTORY: OrgChangeHistory[] = [
  { id: 'h1', date: '2026-03-25', changeType: 'create', orgName: '데이터파이프라인팀', description: 'AI연구본부 산하 데이터 엔지니어링 전담팀 신설', approvedBy: '천대표' },
  { id: 'h2', date: '2026-03-20', changeType: 'create', orgName: 'ML팀', description: 'AI연구본부 산하 머신러닝 전담팀 신설', approvedBy: '천대표' },
  { id: 'h3', date: '2026-03-15', changeType: 'rename', orgName: '퍼포먼스파트', description: '구 "광고운영파트" → "퍼포먼스파트" 개명 (직무 범위 확장)', approvedBy: '강사업' },
  { id: 'h4', date: '2026-03-10', changeType: 'create', orgName: 'T7 글로벌 트랙', description: '해외사업 전담 트랙 신설', approvedBy: '천대표' },
  { id: 'h5', date: '2026-03-01', changeType: 'move', orgName: 'IT인프라팀', description: 'IT인프라팀을 제품본부에서 경영지원본부로 이관', approvedBy: '천대표' },
  { id: 'h6', date: '2026-02-20', changeType: 'create', orgName: 'T4 AI 트랙', description: 'AI 연구·개발 전담 트랙 신설 + AI연구본부 편제', approvedBy: '천대표' },
  { id: 'h7', date: '2026-02-10', changeType: 'dissolve', orgName: '전략기획실', description: '전략기획실 해체, 기능을 사업본부로 이관', approvedBy: '천대표' },
  { id: 'h8', date: '2026-01-15', changeType: 'create', orgName: 'T3 크리에이티브 트랙', description: '디자인·미디어 전담 트랙 신설', approvedBy: '천대표' },
];

/* ─────────────────────── Mock Headcount ─────────────────────── */

function buildHeadcountData(orgTree: OrgUnit[]): HeadcountRow[] {
  const rows: HeadcountRow[] = [];
  const walk = (unit: OrgUnit) => {
    if (unit.type !== 'company') {
      const recruiting = unit.type === 'team' || unit.type === 'part' ? Math.max(0, Math.floor((unit.capacity - unit.headCount) * 0.5)) : 0;
      rows.push({
        departmentId: unit.id,
        departmentName: unit.name,
        capacity: unit.capacity,
        current: unit.headCount,
        vacant: unit.capacity - unit.headCount,
        recruiting,
        fillRate: unit.capacity > 0 ? Math.round((unit.headCount / unit.capacity) * 100) : 100,
      });
    }
    unit.children?.forEach(walk);
  };
  orgTree.forEach(walk);
  return rows;
}

/* ─────────────────────── Helpers ─────────────────────── */

function getPeopleByDept(deptId: string): Person[] {
  return MOCK_PEOPLE.filter(p => p.departmentId === deptId);
}

function flattenOrg(units: OrgUnit[]): OrgUnit[] {
  const result: OrgUnit[] = [];
  const walk = (u: OrgUnit) => { result.push(u); u.children?.forEach(walk); };
  units.forEach(walk);
  return result;
}

/* ─────────────────────── PersonCard Popup ─────────────────────── */

function PersonCard({ person, onClose, allOrg }: { person: Person; onClose: () => void; allOrg: OrgUnit[] }) {
  const dept = allOrg.find(u => u.id === person.departmentId);
  const reportToPerson = person.reportTo ? MOCK_PEOPLE.find(p => p.id === person.reportTo) : (dept?.headId && dept.headId !== person.id ? MOCK_PEOPLE.find(p => p.id === dept.headId) : null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#1a1a2e] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600/30 text-lg font-bold text-indigo-300">
              {person.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-bold">{person.name}</h3>
              <p className="text-xs text-slate-400">{person.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/5 transition-colors">
            <X size={16} className="text-slate-400" />
          </button>
        </div>
        <div className="space-y-2.5 text-sm">
          <div className="flex items-center gap-2 text-slate-300">
            <Shield size={13} className="text-slate-500 shrink-0" /> <span className="text-slate-500 w-14 shrink-0">직급</span> {person.grade}
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Building2 size={13} className="text-slate-500 shrink-0" /> <span className="text-slate-500 w-14 shrink-0">소속</span> {dept?.name || '-'}
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Mail size={13} className="text-slate-500 shrink-0" /> <span className="text-slate-500 w-14 shrink-0">이메일</span> <span className="truncate">{person.email}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Phone size={13} className="text-slate-500 shrink-0" /> <span className="text-slate-500 w-14 shrink-0">연락처</span> {person.phone}
          </div>
          {reportToPerson && (
            <div className="flex items-center gap-2 text-slate-300">
              <User size={13} className="text-slate-500 shrink-0" /> <span className="text-slate-500 w-14 shrink-0">보고선</span> {reportToPerson.name} ({reportToPerson.title})
            </div>
          )}
          <div className="pt-2 border-t border-white/5">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Skills</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {person.skills.map(s => (
                <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── Tab 1: 조직도 ─────────────────────── */

type OrgViewMode = 'tree' | 'card' | 'search';

function OrgTreeNode({ unit, depth = 0, allOrg, onPersonClick }: { unit: OrgUnit; depth?: number; allOrg: OrgUnit[]; onPersonClick: (p: Person) => void }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const [showMembers, setShowMembers] = useState(false);
  const hasChildren = unit.children && unit.children.length > 0;
  const typeInfo = TYPE_LABELS[unit.type] || TYPE_LABELS.team;
  const members = getPeopleByDept(unit.id);

  return (
    <div className={depth > 0 ? 'ml-4 border-l border-white/5 pl-3' : ''}>
      <div className="flex items-center gap-1">
        <button
          onClick={() => hasChildren ? setExpanded(!expanded) : setShowMembers(!showMembers)}
          className="flex-1 flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/[0.03]"
        >
          {hasChildren ? (
            expanded ? <ChevronDown size={13} className="text-slate-500 shrink-0" /> : <ChevronRight size={13} className="text-slate-500 shrink-0" />
          ) : (
            <div className="w-[13px] shrink-0" />
          )}
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${typeInfo.color}`}>{typeInfo.label}</span>
          <span className="text-sm font-medium flex-1 truncate">{unit.name}</span>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] text-slate-500 flex items-center gap-1"><User size={10} />{unit.head}</span>
            <span className="text-[10px] text-slate-600">{unit.headCount}/{unit.capacity}</span>
          </div>
        </button>
        {members.length > 0 && (
          <button
            onClick={() => setShowMembers(!showMembers)}
            className={`rounded-md p-1 text-slate-500 hover:text-indigo-400 hover:bg-white/5 transition-colors ${showMembers ? 'text-indigo-400 bg-indigo-500/10' : ''}`}
            title="멤버 보기"
          >
            <Users size={13} />
          </button>
        )}
      </div>

      {/* Members list */}
      {showMembers && members.length > 0 && (
        <div className="ml-8 mt-1 mb-2 space-y-0.5">
          {members.map(m => (
            <button
              key={m.id}
              onClick={() => onPersonClick(m)}
              className="w-full flex items-center gap-2 rounded-lg px-3 py-1.5 text-left hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-700/50 text-[10px] font-bold text-slate-300 shrink-0">
                {m.name.charAt(0)}
              </div>
              <span className="text-xs font-medium flex-1 truncate">{m.name}</span>
              <span className="text-[10px] text-slate-500">{m.title}</span>
              <span className="text-[10px] text-slate-600 bg-white/5 px-1.5 py-0.5 rounded">{m.grade}</span>
            </button>
          ))}
        </div>
      )}

      {expanded && hasChildren && (
        <div className="mt-0.5">
          {unit.children!.map(child => (
            <OrgTreeNode key={child.id} unit={child} depth={depth + 1} allOrg={allOrg} onPersonClick={onPersonClick} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrgCardView({ orgTree, trackFilter, searchText, onPersonClick, allOrg }: {
  orgTree: OrgUnit[]; trackFilter: string; searchText: string;
  onPersonClick: (p: Person) => void; allOrg: OrgUnit[];
}) {
  const flat = useMemo(() => flattenOrg(orgTree), [orgTree]);
  const departments = useMemo(() => {
    let items = flat.filter(u => u.type === 'team' || u.type === 'part' || u.type === 'division');
    if (trackFilter) {
      const trackIds = new Set<string>();
      const collectIds = (u: OrgUnit) => { trackIds.add(u.id); u.children?.forEach(collectIds); };
      const track = flat.find(u => u.id === trackFilter);
      if (track) collectIds(track);
      items = items.filter(u => trackIds.has(u.id));
    }
    if (searchText) {
      const q = searchText.toLowerCase();
      items = items.filter(u => u.name.toLowerCase().includes(q));
    }
    return items;
  }, [flat, trackFilter, searchText]);

  const tracks = useMemo(() => flat.filter(u => u.type === 'track'), [flat]);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => {/* handled by parent */}}
          className={`text-[11px] px-3 py-1.5 rounded-full transition-colors ${!trackFilter ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
        >전체</button>
        {tracks.map(t => (
          <button key={t.id}
            className={`text-[11px] px-3 py-1.5 rounded-full transition-colors ${trackFilter === t.id ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
          >{t.name.replace(/^T\d\s/, '')}</button>
        ))}
      </div>
      {departments.length === 0 ? (
        <div className="text-center py-8"><p className="text-sm text-slate-400">검색 결과가 없습니다</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {departments.map(dept => {
            const members = getPeopleByDept(dept.id);
            const pct = dept.capacity > 0 ? (dept.headCount / dept.capacity) * 100 : 0;
            return (
              <div key={dept.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${(TYPE_LABELS[dept.type] || TYPE_LABELS.team).color}`}>
                    {(TYPE_LABELS[dept.type] || TYPE_LABELS.team).label}
                  </span>
                  <span className="text-sm font-bold flex-1 truncate">{dept.name}</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <User size={11} className="text-slate-500" />
                  <span className="text-xs text-slate-400">{dept.head}</span>
                  <span className="text-[10px] text-slate-600 ml-auto">{dept.headCount}/{dept.capacity}명</span>
                </div>
                {/* Headcount bar */}
                <div className="h-1.5 rounded-full bg-white/5 mb-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${pct >= 90 ? 'bg-emerald-500' : pct >= 60 ? 'bg-blue-500' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                {/* Members */}
                {members.length > 0 && (
                  <div className="space-y-1">
                    {members.slice(0, 5).map(m => (
                      <button
                        key={m.id}
                        onClick={() => onPersonClick(m)}
                        className="w-full flex items-center gap-2 rounded-md px-2 py-1 text-left hover:bg-white/[0.03] transition-colors"
                      >
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-700/50 text-[9px] font-bold text-slate-300 shrink-0">
                          {m.name.charAt(0)}
                        </div>
                        <span className="text-[11px] flex-1 truncate">{m.name}</span>
                        <span className="text-[10px] text-slate-500">{m.grade}</span>
                      </button>
                    ))}
                    {members.length > 5 && (
                      <p className="text-[10px] text-slate-500 pl-2">+{members.length - 5}명 더</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function OrgPeopleSearch({ allOrg, onPersonClick }: { allOrg: OrgUnit[]; onPersonClick: (p: Person) => void }) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return MOCK_PEOPLE.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.grade.toLowerCase().includes(q) ||
      p.skills.some(s => s.toLowerCase().includes(q))
    );
  }, [query]);

  return (
    <div>
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="이름, 직급, 스킬로 검색..."
          className="w-full rounded-lg border border-white/5 bg-white/[0.03] pl-9 pr-4 py-2.5 text-sm placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
        />
      </div>
      {!query.trim() ? (
        <div className="text-center py-8">
          <UserSearch size={32} className="mx-auto mb-3 text-slate-700" />
          <p className="text-sm text-slate-400">이름, 직급, 스킬로 검색하세요</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-8"><p className="text-sm text-slate-400">검색 결과가 없습니다</p></div>
      ) : (
        <div className="space-y-1">
          {results.map(p => {
            const dept = allOrg.find(u => u.id === p.departmentId);
            return (
              <button
                key={p.id}
                onClick={() => onPersonClick(p)}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600/20 text-xs font-bold text-indigo-300 shrink-0">
                  {p.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{p.name}</span>
                    <span className="text-[10px] text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">{p.grade}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{p.title} | {dept?.name || '-'}</p>
                </div>
                <div className="flex flex-wrap gap-1 max-w-[180px] justify-end shrink-0 hidden sm:flex">
                  {p.skills.slice(0, 3).map(s => (
                    <span key={s} className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-700/50 text-slate-400">{s}</span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function OrgTab({ org }: { org: OrgUnit[] }) {
  const [viewMode, setViewMode] = useState<OrgViewMode>('tree');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [trackFilter, setTrackFilter] = useState('');
  const [cardSearch, setCardSearch] = useState('');
  const allOrg = useMemo(() => flattenOrg(org), [org]);
  const tracks = useMemo(() => allOrg.filter(u => u.type === 'track'), [allOrg]);

  const VIEW_MODES = [
    { key: 'tree' as const, label: '트리 뷰', icon: TreePine },
    { key: 'card' as const, label: '카드 뷰', icon: LayoutGrid },
    { key: 'search' as const, label: '인물 검색', icon: UserSearch },
  ];

  return (
    <div>
      {/* View mode selector */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {VIEW_MODES.map(v => (
          <button
            key={v.key}
            onClick={() => setViewMode(v.key)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors
              ${viewMode === v.key ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
          >
            <v.icon size={13} /> {v.label}
          </button>
        ))}

        {viewMode === 'card' && (
          <div className="ml-auto flex items-center gap-2">
            <select
              value={trackFilter}
              onChange={e => setTrackFilter(e.target.value)}
              className="rounded-lg border border-white/5 bg-white/[0.03] px-2 py-1.5 text-xs text-slate-300 focus:outline-none"
            >
              <option value="">전체 트랙</option>
              {tracks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <div className="relative">
              <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={cardSearch}
                onChange={e => setCardSearch(e.target.value)}
                placeholder="조직 검색"
                className="rounded-lg border border-white/5 bg-white/[0.03] pl-7 pr-3 py-1.5 text-xs w-32 placeholder:text-slate-600 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {viewMode === 'tree' && (
        <div className="space-y-1">
          {org.length === 0 ? (
            <div className="text-center py-8">
              <Building2 size={32} className="mx-auto mb-3 text-slate-700" />
              <p className="text-sm text-slate-400">조직이 없습니다</p>
            </div>
          ) : (
            org.map(unit => <OrgTreeNode key={unit.id} unit={unit} allOrg={allOrg} onPersonClick={setSelectedPerson} />)
          )}
        </div>
      )}

      {viewMode === 'card' && (
        <OrgCardView orgTree={org} trackFilter={trackFilter} searchText={cardSearch} onPersonClick={setSelectedPerson} allOrg={allOrg} />
      )}

      {viewMode === 'search' && (
        <OrgPeopleSearch allOrg={allOrg} onPersonClick={setSelectedPerson} />
      )}

      {selectedPerson && (
        <PersonCard person={selectedPerson} onClose={() => setSelectedPerson(null)} allOrg={allOrg} />
      )}
    </div>
  );
}

/* ─────────────────────── Tab 2: 정원 관리 ─────────────────────── */

function HeadcountTab({ org }: { org: OrgUnit[] }) {
  const allOrg = useMemo(() => flattenOrg(org), [org]);
  const [selectedDept, setSelectedDept] = useState('');
  const allRows = useMemo(() => buildHeadcountData(org), [org]);

  const filteredRows = useMemo(() => {
    if (!selectedDept) return allRows;
    // Show selected dept and its children
    const childIds = new Set<string>();
    const collectChildren = (u: OrgUnit) => { childIds.add(u.id); u.children?.forEach(collectChildren); };
    const dept = allOrg.find(u => u.id === selectedDept);
    if (dept) collectChildren(dept);
    return allRows.filter(r => childIds.has(r.departmentId));
  }, [allRows, selectedDept, allOrg]);

  const totals = useMemo(() => {
    const t = filteredRows.reduce((acc, r) => ({
      capacity: acc.capacity + r.capacity,
      current: acc.current + r.current,
      vacant: acc.vacant + r.vacant,
      recruiting: acc.recruiting + r.recruiting,
    }), { capacity: 0, current: 0, vacant: 0, recruiting: 0 });
    return { ...t, fillRate: t.capacity > 0 ? Math.round((t.current / t.capacity) * 100) : 100 };
  }, [filteredRows]);

  const selectableDepts = useMemo(() => allOrg.filter(u => u.type !== 'company'), [allOrg]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          value={selectedDept}
          onChange={e => setSelectedDept(e.target.value)}
          className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm text-slate-300 focus:outline-none min-w-[200px]"
        >
          <option value="">전체 조직</option>
          {selectableDepts.map(d => (
            <option key={d.id} value={d.id}>
              {'  '.repeat(d.type === 'track' ? 0 : d.type === 'division' ? 1 : d.type === 'team' ? 2 : 3)}{d.name}
            </option>
          ))}
        </select>
        <button className="ml-auto flex items-center gap-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 px-3 py-2 text-xs font-medium hover:bg-indigo-600/30 transition-colors">
          <FileText size={13} /> 정원 변경 기안
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
        {[
          { label: '정원', value: totals.capacity, color: 'text-slate-300' },
          { label: '현원', value: totals.current, color: 'text-blue-400' },
          { label: '공석', value: totals.vacant, color: 'text-amber-400' },
          { label: '채용중', value: totals.recruiting, color: 'text-violet-400' },
          { label: '충원율', value: `${totals.fillRate}%`, color: totals.fillRate >= 80 ? 'text-emerald-400' : 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
            <p className="text-[10px] text-slate-500 mb-1">{s.label}</p>
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-slate-400">부서</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 text-center">정원</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 text-center">현원</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 text-center">공석</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 text-center">채용중</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 w-40">충원율</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map(r => (
                <tr key={r.departmentId} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-2.5 font-medium">{r.departmentName}</td>
                  <td className="px-4 py-2.5 text-center text-slate-300">{r.capacity}</td>
                  <td className="px-4 py-2.5 text-center text-blue-400">{r.current}</td>
                  <td className="px-4 py-2.5 text-center text-amber-400">{r.vacant}</td>
                  <td className="px-4 py-2.5 text-center text-violet-400">{r.recruiting}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${r.fillRate >= 80 ? 'bg-emerald-500' : r.fillRate >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min(r.fillRate, 100)}%` }}
                        />
                      </div>
                      <span className={`text-xs w-10 text-right ${r.fillRate < 80 ? 'text-red-400' : 'text-slate-400'}`}>
                        {r.fillRate}%
                      </span>
                      {r.fillRate < 80 && <AlertTriangle size={12} className="text-amber-500" />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── Tab 3: 인사발령 ─────────────────────── */

function OrdersTab({ orders }: { orders: PersonnelOrder[] }) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<PersonnelOrder | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return orders;
    return orders.filter(o => o.status === statusFilter);
  }, [orders, statusFilter]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {['all', 'pending', 'approved', 'executing', 'completed'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`text-[11px] px-3 py-1.5 rounded-full transition-colors ${statusFilter === s ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
          >
            {s === 'all' ? '전체' : ORDER_STATUS_LABELS[s]?.label || s}
          </button>
        ))}
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="ml-auto flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
        >
          <Plus size={13} /> 새 발령
        </button>
      </div>

      {/* New order form */}
      {showNewForm && (
        <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <h3 className="text-sm font-semibold mb-3">새 인사발령</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <select className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm text-slate-300 focus:outline-none">
              <option value="">발령 유형</option>
              {Object.entries(ORDER_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <input placeholder="대상자" className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm placeholder:text-slate-600 focus:outline-none" />
            <input placeholder="현 소속" className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm placeholder:text-slate-600 focus:outline-none" />
            <input placeholder="변경 소속" className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm placeholder:text-slate-600 focus:outline-none" />
            <input placeholder="직위" className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm placeholder:text-slate-600 focus:outline-none" />
            <input placeholder="직급" className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm placeholder:text-slate-600 focus:outline-none" />
            <input type="date" className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm text-slate-300 focus:outline-none" />
            <input placeholder="사유" className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm placeholder:text-slate-600 focus:outline-none sm:col-span-2" />
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button onClick={() => setShowNewForm(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">취소</button>
            <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">기안 등록</button>
          </div>
        </div>
      )}

      {/* Orders table */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-slate-400">발령번호</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400">유형</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400">대상자</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400">변동</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400">시행일</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400">상태</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(o => {
                const typeInfo = ORDER_TYPE_LABELS[o.type] || { label: o.type, color: 'text-slate-400 bg-white/5' };
                const statusInfo = ORDER_STATUS_LABELS[o.status] || { label: o.status, color: 'text-slate-400 bg-white/5' };
                return (
                  <tr
                    key={o.id}
                    onClick={() => setSelectedOrder(selectedOrder?.id === o.id ? null : o)}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-2.5 text-xs text-slate-400 font-mono">{o.orderNumber}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${typeInfo.color}`}>{typeInfo.label}</span>
                    </td>
                    <td className="px-4 py-2.5 font-medium">{o.personName}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs text-slate-400 flex items-center gap-1.5">
                        <span className="truncate max-w-[80px]">{o.fromOrg}</span>
                        <ArrowRight size={11} className="text-slate-600 shrink-0" />
                        <span className="truncate max-w-[80px]">{o.toOrg}</span>
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-400">{o.effectiveDate}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${statusInfo.color}`}>{statusInfo.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail panel */}
      {selectedOrder && (
        <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold">{selectedOrder.orderNumber} 상세</h3>
            <button onClick={() => setSelectedOrder(null)} className="rounded-lg p-1.5 hover:bg-white/5 transition-colors">
              <X size={14} className="text-slate-400" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-5">
            <div>
              <span className="text-[10px] text-slate-500">대상자</span>
              <p className="font-medium">{selectedOrder.personName}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500">유형</span>
              <p className="font-medium">{ORDER_TYPE_LABELS[selectedOrder.type]?.label || selectedOrder.type}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500">변동</span>
              <p className="font-medium">{selectedOrder.fromOrg} → {selectedOrder.toOrg}</p>
            </div>
            {selectedOrder.fromGrade && (
              <div>
                <span className="text-[10px] text-slate-500">직급 변경</span>
                <p className="font-medium">{selectedOrder.fromGrade} → {selectedOrder.toGrade}</p>
              </div>
            )}
            <div className="sm:col-span-2">
              <span className="text-[10px] text-slate-500">사유</span>
              <p className="text-slate-300">{selectedOrder.reason}</p>
            </div>
          </div>

          {/* Approval timeline */}
          <h4 className="text-xs font-semibold text-slate-400 mb-3">결재 흐름</h4>
          <div className="space-y-0">
            {selectedOrder.approvals.map((a, i) => {
              const isLast = i === selectedOrder.approvals.length - 1;
              return (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full shrink-0 ${
                      a.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                      a.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                      'bg-slate-700/50 text-slate-500'
                    }`}>
                      {a.status === 'approved' ? <Check size={12} /> :
                       a.status === 'rejected' ? <X size={12} /> :
                       <Clock size={12} />}
                    </div>
                    {!isLast && <div className="w-px flex-1 bg-white/5 my-1" />}
                  </div>
                  <div className={`pb-3 ${isLast ? '' : ''}`}>
                    <p className="text-xs font-medium">{a.step}</p>
                    <p className="text-[10px] text-slate-500">{a.approver} {a.date ? `| ${a.date}` : '| 대기중'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── Tab 4: 변경 이력 ─────────────────────── */

function HistoryTab({ history }: { history: OrgChangeHistory[] }) {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filtered = useMemo(() => {
    let items = history;
    if (typeFilter !== 'all') items = items.filter(h => h.changeType === typeFilter);
    if (dateFrom) items = items.filter(h => h.date >= dateFrom);
    if (dateTo) items = items.filter(h => h.date <= dateTo);
    return items;
  }, [history, typeFilter, dateFrom, dateTo]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {['all', 'create', 'rename', 'move', 'dissolve'].map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`text-[11px] px-3 py-1.5 rounded-full transition-colors ${typeFilter === t ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
          >
            {t === 'all' ? '전체' : CHANGE_TYPE_LABELS[t]?.label || t}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="rounded-lg border border-white/5 bg-white/[0.03] px-2 py-1.5 text-xs text-slate-300 focus:outline-none"
          />
          <span className="text-slate-600 text-xs">~</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="rounded-lg border border-white/5 bg-white/[0.03] px-2 py-1.5 text-xs text-slate-300 focus:outline-none"
          />
        </div>
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <div className="text-center py-8"><p className="text-sm text-slate-400">변경 이력이 없습니다</p></div>
      ) : (
        <div className="space-y-0">
          {filtered.map((h, i) => {
            const isLast = i === filtered.length - 1;
            const typeInfo = CHANGE_TYPE_LABELS[h.changeType] || { label: h.changeType, color: 'text-slate-400 bg-white/5' };
            return (
              <div key={h.id} className="flex gap-4">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full shrink-0 ${typeInfo.color.replace('text-', 'bg-').replace(/bg-\w+-400/, 'bg-slate-800')} border border-white/5`}>
                    {h.changeType === 'create' ? <Plus size={14} className={typeInfo.color.split(' ')[0]} /> :
                     h.changeType === 'rename' ? <FileText size={14} className={typeInfo.color.split(' ')[0]} /> :
                     h.changeType === 'move' ? <ArrowRight size={14} className={typeInfo.color.split(' ')[0]} /> :
                     <X size={14} className={typeInfo.color.split(' ')[0]} />}
                  </div>
                  {!isLast && <div className="w-px flex-1 bg-white/5 my-1" />}
                </div>
                {/* Content */}
                <div className="pb-5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-slate-500">{h.date}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${typeInfo.color}`}>{typeInfo.label}</span>
                  </div>
                  <p className="text-sm font-bold mb-0.5">{h.orgName}</p>
                  <p className="text-xs text-slate-400">{h.description}</p>
                  <p className="text-[10px] text-slate-500 mt-1">승인: {h.approvedBy}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── Main Page ─────────────────────── */

export default function OrgPage() {
  const { tenant, member, isDemo: wioIsDemo } = useWIO();
  const isDemo = wioIsDemo || !tenant || tenant.id === 'demo';
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('org');
  const [org, setOrg] = useState<OrgUnit[]>([]);
  const [orders, setOrders] = useState<PersonnelOrder[]>([]);
  const [history, setHistory] = useState<OrgChangeHistory[]>([]);
  const isAdmin = member?.role === 'admin' || member?.role === 'owner';

  const loadData = useCallback(async () => {
    if (isDemo) {
      setOrg(MOCK_ORG);
      setOrders(MOCK_ORDERS);
      setHistory(MOCK_HISTORY);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const sb = createClient();
      // Org tree
      const { data: orgData } = await sb
        .from('wio_departments')
        .select('*')
        .eq('tenant_id', tenant!.id)
        .order('created_at', { ascending: true });

      if (orgData && orgData.length > 0) {
        const flat = orgData.map((row: any) => ({
          id: row.id, name: row.name || '', type: row.type || 'team',
          head: row.head_name || '', headId: row.head_id || '', headCount: row.head_count || 0,
          capacity: row.capacity || 0, parentId: row.parent_id || null,
        }));
        const byId = new Map(flat.map((n: any) => [n.id, { ...n, children: [] as OrgUnit[] }]));
        const roots: OrgUnit[] = [];
        flat.forEach((n: any) => {
          const node = byId.get(n.id)!;
          if (n.parentId && byId.has(n.parentId)) {
            byId.get(n.parentId)!.children!.push(node);
          } else {
            roots.push(node);
          }
        });
        setOrg(roots.length > 0 ? roots : MOCK_ORG);
      } else {
        setOrg(MOCK_ORG);
      }

      // Personnel orders
      const { data: orderData } = await sb
        .from('wio_personnel_orders')
        .select('*')
        .eq('tenant_id', tenant!.id)
        .order('created_at', { ascending: false });

      if (orderData && orderData.length > 0) {
        setOrders(orderData.map((r: any) => ({
          id: r.id, orderNumber: r.order_number, type: r.type, personName: r.person_name,
          personId: r.person_id, fromOrg: r.from_org || '-', toOrg: r.to_org || '-',
          fromPosition: r.from_position, toPosition: r.to_position,
          fromGrade: r.from_grade, toGrade: r.to_grade,
          effectiveDate: r.effective_date, status: r.status, reason: r.reason || '',
          approvals: r.approvals || [], createdAt: r.created_at,
        })));
      } else {
        setOrders(MOCK_ORDERS);
      }

      // Change history
      const { data: historyData } = await sb
        .from('wio_org_change_history')
        .select('*')
        .eq('tenant_id', tenant!.id)
        .order('date', { ascending: false });

      if (historyData && historyData.length > 0) {
        setHistory(historyData.map((r: any) => ({
          id: r.id, date: r.date, changeType: r.change_type,
          orgName: r.org_name, description: r.description, approvedBy: r.approved_by,
        })));
      } else {
        setHistory(MOCK_HISTORY);
      }
    } catch {
      setOrg(MOCK_ORG);
      setOrders(MOCK_ORDERS);
      setHistory(MOCK_HISTORY);
    } finally {
      setLoading(false);
    }
  }, [isDemo, tenant]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalHeadCount = org.reduce((sum, o) => sum + o.headCount, 0);

  if (loading) {
    return (
      <div>
        <h1 className="text-xl font-bold mb-6">조직관리</h1>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 animate-pulse">
              <div className="h-4 w-2/3 bg-white/5 rounded mb-2" />
              <div className="h-3 w-1/3 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">조직관리</h1>
          <p className="text-xs text-slate-500 mt-0.5">HR-ORG | 총 {totalHeadCount}명{isDemo ? ' (데모)' : ''}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5 border-b border-white/5 overflow-x-auto pb-px">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px
                ${activeTab === tab.key
                  ? 'text-indigo-400 border-indigo-400'
                  : 'text-slate-500 border-transparent hover:text-slate-300'
                }`}
            >
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
        {activeTab === 'org' && <OrgTab org={org} />}
        {activeTab === 'headcount' && <HeadcountTab org={org} />}
        {activeTab === 'orders' && <OrdersTab orders={orders} />}
        {activeTab === 'history' && <HistoryTab history={history} />}
      </div>
    </div>
  );
}
