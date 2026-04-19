'use client';

import { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft, Calendar, MapPin, Users, Banknote, ChevronRight,
  Heart, Share2, Bell, CheckCircle2, Clock, Lock, Bookmark,
  Star, X, Send, MessageCircle,
} from 'lucide-react';
import { MemberProfileSheet } from '@/features/badak/MemberProfileSheet';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';

// ── 타입 정의 ──────────────────────────────────────────
interface GroupSession {
  number: number;
  title: string;
  description: string;
  date?: string;
}

interface GroupReview {
  id: string;
  author: string;
  avatar_url: string | null;
  job_function: string | null;
  rating: number;
  content: string;
  created_at: string;
  season_number?: number | null;  // 상속된 후기의 시즌 번호
}

interface GroupMember {
  id: string;
  display_name: string;
  job_function: string | null;
  avatar_url: string | null;
}

interface GroupDetail {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string | null;        // 소개 탭
  intro_who: string | null;          // 소개 탭 - 이런 분께 추천
  structure: GroupSession[] | null;  // 구성 탭
  guide: string | null;              // 상세 안내 탭
  notice: string | null;             // 주요 공지
  status: string;
  join_type: 'firstcome' | 'approval';
  meeting_type: 'onetime' | 'series' | 'recurring' | null;
  series_count?: number | null;
  parent_group_id?: string | null;
  parent_slug?: string | null;
  season_number?: number | null;
  show_leader_reviews?: boolean;
  leader_career?: string | null;
  leader_reason?: string | null;
  max_members: number;
  current_members: number;
  event_date: string | null;
  schedule: string | null;
  location: string | null;
  location_detail: string | null;
  fee: number;
  tags: string[];
  cover_image_url: string | null;
  created_at?: string;
  leader: {
    id: string; display_name: string; job_function: string;
    experience_years: number; bio?: string | null; avatar_url?: string | null;
  } | null;
  need: { id: string; display_text: string; count: number } | null;
  members: GroupMember[];
  reviews: GroupReview[];
  related: { slug: string; title: string; current_members: number; max_members: number; tags: string[]; cover_image_url?: string | null }[];
}

// ── Mock 데이터 (slug 기반) ──────────────────────────────
const MOCK: Record<string, GroupDetail> = {
  'b2b-marketing-weekly': {
    id: 'g1', slug: 'b2b-marketing-weekly',
    title: 'B2B 마케팅 실무 모임',
    tagline: 'B2B SaaS 마케터들의 케이스 스터디 & 실전 네트워킹',
    notice: '다음 모임은 4/26(토) 오후 2시, 강남역 스타벅스 2층입니다. 발표자는 사전에 슬랙에 자료 공유 부탁드립니다.',
    description: 'B2B SaaS 마케팅 전략과 실무를 나누는 정기 모임입니다.\n\n리드 제너레이션, ABM, 콘텐츠 마케팅, 파트너십까지 다양한 B2B 마케팅 전략을 실제 케이스 중심으로 공부합니다. 이론보다 현장에서 바로 쓸 수 있는 인사이트를 나눕니다.',
    intro_who: '• B2B SaaS 또는 기업 솔루션 마케터\n• B2B 마케팅으로 커리어 전환을 준비 중인 분\n• 실전 케이스를 공유하고 피드백받고 싶은 분\n• 같은 고민을 나눌 동료가 필요한 분',
    structure: [
      { number: 1, title: '킥오프 — 소개 & 주제 선정', description: '첫 모임. 참여자 소개, 각자의 B2B 마케팅 고민 공유, 앞으로의 발표 주제 리스트 작성' },
      { number: 2, title: '리드 제너레이션 케이스', description: '실제 집행 중인 캠페인 1건 발표. 목표 KPI, 실제 성과, 배운 것, 개선 포인트 발표 후 Q&A' },
      { number: 3, title: 'ABM 전략 딥다이브', description: 'Account-Based Marketing 실전 사례. 타겟 선정, 콘텐츠 전략, 영업팀과의 협업 방식 공유' },
      { number: 4, title: '콘텐츠 마케팅 케이스', description: '블로그, 웨비나, 케이스스터디 등 콘텐츠 에셋 제작 경험 공유 + 배포 전략' },
      { number: 5, title: '파이프라인 분석 & 자유 주제', description: '실제 파이프라인 데이터 기반으로 MQL→SQL 전환율 개선 사례 + 참여자 자유 주제' },
      { number: 6, title: '시즌 마무리 & 다음 시즌 준비', description: '지난 5회 리뷰. 가장 도움이 된 인사이트 공유, 다음 시즌 주제 투표, 네트워킹' },
    ],
    guide: '📍 장소\n강남역 2번 출구 도보 3분 · 스타벅스 강남점 2층 (세미 프라이빗 공간 예약)\n\n📅 일정\n매주 토요일 오후 2시~4시 (120분). 부득이한 경우 슬랙에서 사전 공지.\n\n💰 회비\n무료. 음료는 각자 구매.\n\n📋 참여 조건\n• 발표 순서가 돌아오면 반드시 발표 (거르면 다음 시즌 참여 불가)\n• 모임 3회 이상 무단 불참 시 제외\n• 실명 기반 (닉네임 X)\n\n🎒 준비물\n노트북 또는 태블릿. 발표 자료 PPT/Notion 가능.',
    status: 'completed', join_type: 'firstcome', meeting_type: 'recurring',
    season_number: 1,
    max_members: 20, current_members: 20,
    event_date: '2026-03-01T14:00:00', schedule: '매주 토 14:00~16:00 (6회 완료)', location: '강남역', location_detail: '스타벅스 강남점 2층',
    fee: 0, tags: ['B2B', '마케팅', 'SaaS', '케이스스터디'],
    cover_image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=860&h=400&fit=crop&auto=format',
    leader: { id: 'l1', display_name: '마케터J', job_function: '퍼포먼스 마케팅', experience_years: 3, bio: 'B2B SaaS 스타트업 3년차 마케터. 리드 제너레이션과 ABM 전략을 직접 운영 중입니다.', avatar_url: null },
    need: { id: 'n1', display_text: 'B2B 마케팅 같이 공부하고 싶어', count: 28 },
    members: [
      { id: 'm1', display_name: '마케터J', job_function: '퍼포먼스 마케팅', avatar_url: null },
      { id: 'm2', display_name: '그로스K', job_function: '그로스 마케터', avatar_url: null },
      { id: 'm3', display_name: '브랜드S', job_function: '브랜드 매니저', avatar_url: null },
      { id: 'm4', display_name: '콘텐츠Y', job_function: 'SNS 마케터', avatar_url: null },
      { id: 'm5', display_name: '데이터P', job_function: '데이터 분석가', avatar_url: null },
      { id: 'm6', display_name: '스타트업L', job_function: '스타트업 대표', avatar_url: null },
    ],
    reviews: [
      { id: 'r1', author: '그로스K', avatar_url: null, job_function: '그로스 마케터', rating: 5, content: '실제 캠페인 데이터를 들고 나오는 사람들 덕분에 이론 책에서 배울 수 없는 것들을 얻었어요. 특히 ABM 케이스는 정말 인상적이었습니다.', created_at: '2026-04-08', season_number: 1 },
      { id: 'r2', author: '콘텐츠Y', avatar_url: null, job_function: 'SNS 마케터', rating: 5, content: 'B2C만 하다가 B2B로 전환하는 중인데, 이 모임에서 배운 리드 스코어링 방식이 실무에 바로 적용됐어요. 다음 시즌도 꼭 참여할 거예요.', created_at: '2026-04-01', season_number: 1 },
      { id: 'r3', author: '데이터P', avatar_url: null, job_function: '데이터 분석가', rating: 4, content: '마케터들이 데이터를 어떻게 보는지 배울 수 있어서 좋았습니다. 분석가 입장에서도 얻을 게 많은 모임이에요.', created_at: '2026-03-22', season_number: 1 },
      { id: 'r4', author: '스타트업L', avatar_url: null, job_function: '스타트업 대표', rating: 5, content: '파이프라인 분석 회차가 가장 좋았어요. 우리 팀 SQL→MQL 전환 문제를 정확히 짚어줬고 덕분에 다음 분기 전략을 완전히 바꿨습니다.', created_at: '2026-03-29', season_number: 1 },
      { id: 'r5', author: '브랜드S', avatar_url: null, job_function: '브랜드 매니저', rating: 4, content: 'B2B는 처음이라 걱정했는데 다들 친절하게 설명해줘서 따라갈 수 있었어요. 마케터J 바닥장이 분위기를 잘 만들어줬습니다.', created_at: '2026-04-05', season_number: 1 },
    ],
    related: [
      { slug: 'b2b-marketing-weekly-s2', title: 'B2B 마케팅 실무 모임 시즌 2', current_members: 7, max_members: 20, tags: ['B2B', '마케팅', 'SaaS'], cover_image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=120&fit=crop' },
      { slug: 'ai-prompt-engineering', title: 'AI 프롬프트 엔지니어링 스터디', current_members: 11, max_members: 15, tags: ['AI', '마케팅'], cover_image_url: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=200&h=120&fit=crop' },
    ],
  },
  'b2b-marketing-weekly-s2': {
    id: 'g1s2', slug: 'b2b-marketing-weekly-s2',
    title: 'B2B 마케팅 실무 모임 시즌 2',
    tagline: '시즌 1 참여자들의 강추로 돌아온 B2B 마케팅 케이스 스터디',
    notice: '시즌 1 참여자 우선 신청 기간: 4/20(일)까지. 이후 일반 모집 진행합니다.',
    description: '시즌 1에서 진행한 리드 제너레이션·ABM·콘텐츠 마케팅에 이어, 시즌 2는 더 깊은 주제를 다룹니다.\n\n이번 시즌은 실제 ICP(이상 고객 프로필) 정의와 타겟 세그멘테이션, 세일즈 인에이블먼트, 그리고 마케팅-영업 얼라인먼트를 집중적으로 파고듭니다.',
    intro_who: '• 시즌 1 참여 경험이 있는 B2B 마케터 (우선 모집)\n• B2B SaaS 또는 기업 솔루션 마케터\n• ICP 정의부터 세일즈 협업까지 실전을 배우고 싶은 분\n• 케이스 발표 경험이 있거나 준비된 분',
    structure: [
      { number: 1, title: 'ICP 정의 & 세그멘테이션', description: '이상 고객 프로필(ICP)을 데이터 기반으로 정의하는 실전 방법론. 각자 ICP 초안 발표 후 피드백' },
      { number: 2, title: '세일즈 이네이블먼트 케이스', description: '마케팅이 세일즈에 건네는 콘텐츠·도구·인사이트. 실제 배틀카드, 케이스스터디 제작 사례 공유' },
      { number: 3, title: 'PLG vs SLG 전략 비교', description: 'Product-Led Growth와 Sales-Led Growth의 차이. SaaS 회사들의 실제 선택과 그 배경 분석' },
      { number: 4, title: 'ABM 2.0 — 실전 계정 관리', description: '시즌 1에서 배운 ABM을 실제로 어떻게 운용하는지. 계정 리스트업, 개인화 콘텐츠, 성과 측정' },
      { number: 5, title: '마케팅-영업 얼라인먼트', description: 'MQL 정의 충돌, 리드 퀄리티 이슈 해결 사례. 두 팀이 같은 목표를 바라보게 만드는 방법' },
      { number: 6, title: '시즌 2 마무리 & 시즌 3 기획', description: '지난 5회 케이스 총정리. 가장 인상 깊은 인사이트 공유, 시즌 3 주제 투표, 파티' },
    ],
    guide: '📍 장소\n강남역 2번 출구 도보 3분 · 스타벅스 강남점 2층 (시즌 1과 동일)\n\n📅 일정\n매주 토요일 오후 2시~4시 (120분). 부득이한 경우 슬랙에서 사전 공지.\n\n💰 회비\n무료. 음료는 각자 구매.\n\n📋 참여 조건\n• 발표 순서가 돌아오면 반드시 발표\n• 모임 3회 이상 무단 불참 시 제외\n• 실명 기반 (닉네임 X)',
    status: 'recruiting', join_type: 'firstcome', meeting_type: 'recurring',
    season_number: 2,
    parent_group_id: 'g1',
    parent_slug: 'b2b-marketing-weekly',
    max_members: 20, current_members: 7,
    event_date: '2026-04-26T14:00:00', schedule: '매주 토 14:00~16:00', location: '강남역', location_detail: '스타벅스 강남점 2층',
    fee: 0, tags: ['B2B', '마케팅', 'SaaS', '케이스스터디', 'ABM'],
    cover_image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=860&h=400&fit=crop&auto=format',
    leader: { id: 'l1', display_name: '마케터J', job_function: '퍼포먼스 마케팅', experience_years: 3, bio: 'B2B SaaS 스타트업 3년차 마케터. 시즌 1에서 6회 전부 함께한 참여자들의 요청으로 시즌 2를 엽니다.', avatar_url: null },
    need: { id: 'n1', display_text: 'B2B 마케팅 같이 공부하고 싶어', count: 28 },
    members: [
      { id: 'm1', display_name: '마케터J', job_function: '퍼포먼스 마케팅', avatar_url: null },
      { id: 'm2', display_name: '그로스K', job_function: '그로스 마케터', avatar_url: null },
      { id: 'm3', display_name: '콘텐츠Y', job_function: 'SNS 마케터', avatar_url: null },
      { id: 'm4', display_name: '데이터P', job_function: '데이터 분석가', avatar_url: null },
      { id: 'm5', display_name: '스타트업L', job_function: '스타트업 대표', avatar_url: null },
      { id: 'm6', display_name: '브랜드S', job_function: '브랜드 매니저', avatar_url: null },
      { id: 'm7', display_name: '신입마케E', job_function: 'B2B 마케터', avatar_url: null },
    ],
    // 시즌 1 후기가 시즌 번호와 함께 표시됨
    reviews: [
      { id: 'r1', author: '그로스K', avatar_url: null, job_function: '그로스 마케터', rating: 5, content: '실제 캠페인 데이터를 들고 나오는 사람들 덕분에 이론 책에서 배울 수 없는 것들을 얻었어요. 특히 ABM 케이스는 정말 인상적이었습니다.', created_at: '2026-04-08', season_number: 1 },
      { id: 'r2', author: '콘텐츠Y', avatar_url: null, job_function: 'SNS 마케터', rating: 5, content: 'B2C만 하다가 B2B로 전환하는 중인데, 이 모임에서 배운 리드 스코어링 방식이 실무에 바로 적용됐어요. 다음 시즌도 꼭 참여할 거예요.', created_at: '2026-04-01', season_number: 1 },
      { id: 'r3', author: '데이터P', avatar_url: null, job_function: '데이터 분석가', rating: 4, content: '마케터들이 데이터를 어떻게 보는지 배울 수 있어서 좋았습니다. 분석가 입장에서도 얻을 게 많은 모임이에요.', created_at: '2026-03-22', season_number: 1 },
      { id: 'r4', author: '스타트업L', avatar_url: null, job_function: '스타트업 대표', rating: 5, content: '파이프라인 분석 회차가 가장 좋았어요. 우리 팀 SQL→MQL 전환 문제를 정확히 짚어줬고 덕분에 다음 분기 전략을 완전히 바꿨습니다.', created_at: '2026-03-29', season_number: 1 },
      { id: 'r5', author: '브랜드S', avatar_url: null, job_function: '브랜드 매니저', rating: 4, content: 'B2B는 처음이라 걱정했는데 다들 친절하게 설명해줘서 따라갈 수 있었어요. 마케터J 바닥장이 분위기를 잘 만들어줬습니다.', created_at: '2026-04-05', season_number: 1 },
    ],
    related: [
      { slug: 'b2b-marketing-weekly', title: 'B2B 마케팅 실무 모임 시즌 1', current_members: 20, max_members: 20, tags: ['B2B', '마케팅'], cover_image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=120&fit=crop' },
      { slug: 'ai-prompt-engineering', title: 'AI 프롬프트 엔지니어링 스터디', current_members: 11, max_members: 15, tags: ['AI', '마케팅'], cover_image_url: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=200&h=120&fit=crop' },
    ],
  },
  'ai-prompt-engineering': {
    id: 'g5', slug: 'ai-prompt-engineering',
    title: 'AI 프롬프트 엔지니어링 스터디',
    tagline: 'ChatGPT·Claude를 마케팅 무기로 만드는 실전 스터디',
    notice: '4/27(일) 오후 3시, 패스트파이브 강남점. 노트북 필참!',
    description: 'AI 도구를 마케팅에 실제로 쓰는 방법을 공부합니다.\n\n프롬프트 하나가 업무 2시간을 줄일 수 있어요. 매주 하나의 마케팅 태스크를 정해 실습하고, 서로의 프롬프트를 비교·개선합니다. 누적된 프롬프트 라이브러리는 멤버 전원이 공유합니다.',
    intro_who: '• AI 도구를 써보려 했지만 어떻게 시작할지 모르는 분\n• 이미 ChatGPT를 쓰지만 더 잘 활용하고 싶은 마케터\n• 업무 자동화로 시간을 절약하고 싶은 분\n• 프롬프트 엔지니어링을 체계적으로 배우고 싶은 분',
    structure: [
      { number: 1, title: '기초 — 프롬프트의 원리', description: '좋은 프롬프트 vs 나쁜 프롬프트. 역할 지정, 컨텍스트 제공, 출력 형식 지정 실습' },
      { number: 2, title: '콘텐츠 작성 자동화', description: 'SNS 카피, 블로그 초안, 이메일 뉴스레터를 AI로 초안 생성 + 인간 편집하는 워크플로 구축' },
      { number: 3, title: '데이터 분석 & 인사이트 추출', description: 'GA 데이터, 고객 리뷰 등 정형/비정형 데이터를 AI로 분석하고 보고서 초안 만들기' },
      { number: 4, title: '경쟁사 모니터링 & 리서치', description: '경쟁사 웹사이트, 광고, SNS를 AI로 분석하는 자동화 파이프라인 설계' },
      { number: 5, title: '캠페인 기획 & A/B테스트 아이디어', description: 'AI로 광고 카피 10개 생성 → 최적 조합 선택 → 실제 테스트 결과 리뷰' },
      { number: 6, title: '나만의 AI 워크플로 발표', description: '각자 구축한 AI 워크플로를 발표하고 라이브러리로 집대성. 시즌 2 주제 투표' },
    ],
    guide: '📍 장소\n패스트파이브 강남점 (강남역 1번 출구 도보 5분)\n\n📅 일정\n매주 일요일 오후 3시~5시. 부득이 온라인 전환 시 슬랙 48시간 전 공지.\n\n💰 회비\n1만원/회 (장소 대관비). 사전 송금 방식.\n\n🎒 준비물\n노트북 필참. ChatGPT Plus 또는 Claude Pro 구독 권장 (무료 버전도 가능).\n\n📋 규칙\n배운 프롬프트는 공유 노션 문서에 기록. 무단결석 2회 이상 시 다음 시즌 신청 불가.',
    status: 'recruiting', join_type: 'firstcome', meeting_type: 'recurring',
    max_members: 15, current_members: 11,
    event_date: '2026-04-27T15:00:00', schedule: '매주 일 15:00~17:00', location: '강남역', location_detail: '패스트파이브 강남점',
    fee: 10000, tags: ['AI', '프롬프트', 'ChatGPT', '마케팅'],
    cover_image_url: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=860&h=400&fit=crop&auto=format',
    leader: { id: 'l5', display_name: 'AI마스터', job_function: '그로스 마케터', experience_years: 5, bio: 'AI 마케팅 전도사. 프롬프트 엔지니어링으로 업무 효율 3배를 직접 경험하고 나눕니다.', avatar_url: null },
    need: { id: 'n5', display_text: 'AI 마케팅 같이 공부하고 싶어', count: 45 },
    members: [
      { id: 'm1', display_name: 'AI마스터', job_function: '그로스 마케터', avatar_url: null },
      { id: 'm2', display_name: '카피Q', job_function: '카피라이터', avatar_url: null },
      { id: 'm3', display_name: '기획F', job_function: '마케팅 기획자', avatar_url: null },
      { id: 'm4', display_name: '데이터H', job_function: '데이터 분석가', avatar_url: null },
      { id: 'm5', display_name: 'SNS마케R', job_function: 'SNS 마케터', avatar_url: null },
    ],
    reviews: [
      { id: 'r1', author: '카피Q', avatar_url: null, job_function: '카피라이터', rating: 5, content: '카피 작업 시간이 절반으로 줄었어요. 프롬프트 라이브러리를 시즌이 끝나도 계속 쓰고 있습니다.', created_at: '2026-04-10' },
      { id: 'r2', author: '기획F', avatar_url: null, job_function: '마케팅 기획자', rating: 5, content: '단순히 ChatGPT 사용법이 아니라 워크플로로 연결하는 방법을 배운 게 핵심이었어요. 실무에서 바로 써먹었습니다.', created_at: '2026-04-03' },
    ],
    related: [
      { slug: 'b2b-marketing-weekly', title: 'B2B 마케팅 실무 모임', current_members: 13, max_members: 20, tags: ['마케팅'], cover_image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=120&fit=crop' },
      { slug: 'performance-case-study', title: '퍼포먼스 마케팅 케이스 스터디', current_members: 4, max_members: 12, tags: ['퍼포먼스'], cover_image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=120&fit=crop' },
    ],
  },
  'copywriting-practice': {
    id: 'g2', slug: 'copywriting-practice',
    title: '카피라이팅 같이 연습할래?',
    tagline: '매주 써보고, 피드백받고, 실력을 키우는 카피 스터디',
    notice: '4/20(일) 오후 7시, 성수동. 이번 주 테마: 앱스토어 리뷰 유도 카피',
    description: '광고 카피, SNS 카피, 브랜드 슬로건 등 카피라이팅 실력을 함께 키워봐요.\n\n매주 하나의 테마를 정해 각자 카피를 써옵니다. 다양한 시각으로 같은 주제를 바라보며 서로의 카피에 솔직한 피드백을 주고받습니다.',
    intro_who: '• 광고 기획자, 카피라이터 지망생\n• 브랜드 메시지를 더 날카롭게 만들고 싶은 마케터\n• "어떻게 쓰지?"에서 "이렇게 쓰면 되겠다"로 가고 싶은 분',
    structure: [
      { number: 1, title: '카피의 원칙', description: '좋은 카피와 나쁜 카피의 차이. 국내외 레퍼런스 분석. 첫 번째 과제 발표' },
      { number: 2, title: '감성 카피 vs 논리 카피', description: '브랜드 성격에 따른 톤 앤 매너 설정. 각자 작성한 카피 리뷰' },
      { number: 3, title: '한 줄 슬로건 챌린지', description: '동일한 브랜드를 10가지 방식으로 표현. 가장 강한 한 줄 선정' },
      { number: 4, title: '디지털 광고 카피', description: 'Meta, 구글 광고 카피의 특성과 제한. 실제 광고 카피 작성 실습' },
    ],
    guide: '📍 장소\n성수동 (구체적 장소는 슬랙으로 확정 전달)\n\n💰 회비\n5,000원/회 (음료 제공)\n\n📋 규칙\n매주 과제 미제출 시 경고 1회. 경고 2회 시 다음 시즌 참여 불가.\n모든 피드백은 작품을 평가하는 것이지 사람을 평가하지 않습니다.',
    status: 'confirmed', join_type: 'approval', meeting_type: 'recurring',
    max_members: 12, current_members: 12,
    event_date: '2026-04-20T19:00:00', schedule: '매주 일 19:00~21:00', location: '성수동', location_detail: null,
    fee: 5000, tags: ['카피', '글쓰기', '광고'],
    cover_image_url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=860&h=400&fit=crop&auto=format',
    leader: { id: 'l2', display_name: '카피장인', job_function: '브랜드 마케터', experience_years: 7, bio: null, avatar_url: null },
    need: { id: 'n2', display_text: '카피라이팅 스터디', count: 35 },
    members: [
      { id: 'm1', display_name: '카피장인', job_function: '브랜드 마케터', avatar_url: null },
      { id: 'm2', display_name: '글쟁이A', job_function: '카피라이터', avatar_url: null },
      { id: 'm3', display_name: '광고기획B', job_function: '광고 기획자', avatar_url: null },
    ],
    reviews: [
      { id: 'r1', author: '글쟁이A', avatar_url: null, job_function: '카피라이터', rating: 5, content: '혼자 쓰면 독이 오르는데, 여럿이 같은 주제로 쓰니까 완전히 다른 접근들을 볼 수 있었어요. 시각이 엄청 넓어졌습니다.', created_at: '2026-04-12' },
    ],
    related: [
      { slug: 'sns-content-studio', title: 'SNS 콘텐츠 기획 & 제작', current_members: 6, max_members: 10, tags: ['SNS', '콘텐츠'], cover_image_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=120&fit=crop' },
      { slug: 'brand-strategy-reading', title: '브랜드 전략 독서 모임', current_members: 8, max_members: 8, tags: ['브랜딩'], cover_image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=120&fit=crop' },
    ],
  },
  // 나머지 그룹들 (간략 버전)
  'sns-content-studio': {
    id: 'g3', slug: 'sns-content-studio',
    title: 'SNS 콘텐츠 기획 & 제작 스터디',
    tagline: '인스타·유튜브·틱톡 콘텐츠를 함께 만들고 성장해요',
    notice: null,
    description: '인스타그램·유튜브·틱톡 콘텐츠 기획부터 촬영, 편집까지 함께 배워요.\n\n매주 한 플랫폼을 집중 분석하고, 실제 콘텐츠를 만들어보고 피드백합니다.',
    intro_who: '• SNS 마케터 또는 콘텐츠 크리에이터\n• 팔로워 성장 전략을 배우고 싶은 분\n• 실제 콘텐츠 제작을 배우고 싶은 분',
    structure: [
      { number: 1, title: '인스타그램 릴스 공략', description: '알고리즘 분석 + 바이럴 릴스 해부 + 직접 기획 실습' },
      { number: 2, title: '유튜브 쇼츠 전략', description: '쇼츠 vs 일반 영상 전략 비교 + 썸네일과 제목 최적화' },
      { number: 3, title: '틱톡 트렌드 읽기', description: '트렌드 사이클 분석 + 브랜드 활용 사례 + 직접 기획' },
      { number: 4, title: '콘텐츠 캘린더 만들기', description: '한 달치 콘텐츠 캘린더 설계 + 서로 피드백' },
    ],
    guide: '📍 홍대입구 · 공유오피스 3층\n💰 무료\n📋 매주 콘텐츠 1개 제작해오기 (형식 무관)',
    status: 'recruiting', join_type: 'firstcome', meeting_type: 'recurring',
    max_members: 10, current_members: 6,
    event_date: '2026-04-25T19:30:00', schedule: '격주 금 19:30', location: '홍대입구', location_detail: '공유오피스 3층',
    fee: 0, tags: ['SNS', '콘텐츠', '인스타그램', '유튜브'],
    cover_image_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=860&h=400&fit=crop&auto=format',
    leader: { id: 'l3', display_name: '콘텐츠크리에이터K', job_function: 'SNS 마케터', experience_years: 4, bio: '현직 SNS 마케터. 인스타 팔로워 10만 달성 노하우를 나눕니다.', avatar_url: null },
    need: { id: 'n3', display_text: 'SNS 콘텐츠 같이 만들고 싶어', count: 22 },
    members: [{ id: 'm1', display_name: '콘텐츠크리에이터K', job_function: 'SNS 마케터', avatar_url: null }],
    reviews: [],
    related: [
      { slug: 'copywriting-practice', title: '카피라이팅 같이 연습할래?', current_members: 12, max_members: 12, tags: ['카피'], cover_image_url: null },
      { slug: 'ai-prompt-engineering', title: 'AI 프롬프트 엔지니어링', current_members: 11, max_members: 15, tags: ['AI'], cover_image_url: null },
    ],
  },
  'performance-case-study': {
    id: 'g4', slug: 'performance-case-study',
    title: '퍼포먼스 마케팅 케이스 스터디',
    tagline: 'Facebook·Google·카카오 광고 실전 데이터를 함께 분석',
    notice: null,
    description: '페이스북/구글/카카오 광고 실전 케이스를 함께 분석합니다.\n\n실제 집행 데이터 기반으로 ROAS 개선 포인트를 찾고, 최적화 전략을 공유합니다.',
    intro_who: '• 퍼포먼스 마케터, 그로스 마케터\n• 광고 효율을 높이고 싶은 분\n• 다양한 데이터를 보며 인사이트를 키우고 싶은 분',
    structure: [
      { number: 1, title: 'FB 광고 케이스', description: '실제 ROAS 데이터와 최적화 과정 발표' },
      { number: 2, title: '구글 광고 케이스', description: '검색 광고 + pMax 운용 전략 비교' },
    ],
    guide: '📍 온라인 (Zoom)\n💰 무료\n📋 월 2회. 일정은 슬랙에서 투표로 결정',
    status: 'needs_gathering', join_type: 'firstcome', meeting_type: 'recurring',
    max_members: 12, current_members: 4,
    event_date: null, schedule: '월 2회 (일정 미정)', location: '온라인', location_detail: null,
    fee: 0, tags: ['퍼포먼스', 'Facebook광고', '구글광고', 'ROAS'],
    cover_image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=860&h=400&fit=crop&auto=format',
    leader: { id: 'l4', display_name: '광고전문P', job_function: '퍼포먼스 마케터', experience_years: 6, bio: null, avatar_url: null },
    need: { id: 'n4', display_text: '퍼포먼스 마케팅 실무 배우고 싶어', count: 17 },
    members: [{ id: 'm1', display_name: '광고전문P', job_function: '퍼포먼스 마케터', avatar_url: null }],
    reviews: [],
    related: [
      { slug: 'b2b-marketing-weekly', title: 'B2B 마케팅 실무 모임', current_members: 13, max_members: 20, tags: ['마케팅'], cover_image_url: null },
      { slug: 'data-analytics-meetup', title: '데이터 분석 마케터 모임', current_members: 10, max_members: 10, tags: ['데이터'], cover_image_url: null },
    ],
  },
  'startup-marketer-club': {
    id: 'g6', slug: 'startup-marketer-club',
    title: '스타트업 마케터 네트워킹 클럽',
    tagline: '리소스 없이도 성과내는 스타트업 마케터들의 모임',
    notice: null,
    description: '스타트업에서 일하는 마케터들의 정보 교류 모임입니다.\n\n번아웃, 리소스 부족, ROI 증명, 혼자 다 해야 하는 현실... 같은 고민을 나누는 사람들이 여기 있습니다.',
    intro_who: '• 스타트업 또는 초기 기업의 마케터\n• 혼자 마케팅 전부를 담당하고 있는 분\n• 같은 처지의 동료를 만나고 싶은 분',
    structure: [
      { number: 1, title: '자기소개 & 현재 회사 이야기', description: '각자 회사 규모, 마케팅 현황, 가장 큰 고민 공유' },
      { number: 2, title: '주제별 딥다이브', description: '당월 투표로 선정된 주제 (예: 소규모 예산 광고, 퇴사 방지 캠페인)' },
    ],
    guide: '📍 합정역 · 루프탑 카페\n💰 15,000원 (음료 + 스낵)\n📋 월 1회. 최대한 솔직한 이야기를 나누는 자리입니다.',
    status: 'recruiting', join_type: 'approval', meeting_type: 'recurring',
    max_members: 20, current_members: 14,
    event_date: '2026-05-03T18:00:00', schedule: '월 1회 토 18:00', location: '합정역', location_detail: '루프탑 카페',
    fee: 15000, tags: ['스타트업', '네트워킹', '마케터'],
    cover_image_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=860&h=400&fit=crop&auto=format',
    leader: { id: 'l6', display_name: '스타트업마케터S', job_function: '그로스 마케터', experience_years: 5, bio: '시리즈B 스타트업 마케팅 리드. 0→1 마케팅 경험 공유.', avatar_url: null },
    need: { id: 'n6', display_text: '스타트업 마케터끼리 만나고 싶어', count: 33 },
    members: [
      { id: 'm1', display_name: '스타트업마케터S', job_function: '그로스 마케터', avatar_url: null },
      { id: 'm2', display_name: '그로스K', job_function: '그로스 해커', avatar_url: null },
    ],
    reviews: [],
    related: [
      { slug: 'b2b-marketing-weekly', title: 'B2B 마케팅 실무 모임', current_members: 13, max_members: 20, tags: ['마케팅'], cover_image_url: null },
      { slug: 'ai-prompt-engineering', title: 'AI 프롬프트 엔지니어링', current_members: 11, max_members: 15, tags: ['AI'], cover_image_url: null },
    ],
  },
  'brand-strategy-reading': {
    id: 'g7', slug: 'brand-strategy-reading',
    title: '브랜드 전략 독서 모임',
    tagline: '매달 한 권, 브랜드 전략을 함께 읽고 실무에 연결',
    notice: '이번 달 책: 《포지셔닝》(알 리스/잭 트라우트). 4/28까지 읽어오세요!',
    description: '브랜딩, 마케팅 전략 관련 책을 함께 읽고 토론합니다.\n\n매월 1권 선정 → 각자 읽고 → 인상 깊은 구절 + 실무 연결점 발표',
    intro_who: '• 브랜딩·마케팅 전략을 깊이 공부하고 싶은 분\n• 책을 읽어도 실무 연결이 안 되는 분\n• 다른 사람의 인사이트를 통해 새 시각을 원하는 분',
    structure: [
      { number: 1, title: '선정 & 소개', description: '이번 달 책 선정 이유 공유. 각자 기대 포인트 이야기' },
      { number: 2, title: '독후감 발표', description: '각자 인상 깊은 구절 1~2개 + 실무 연결 포인트 발표' },
      { number: 3, title: '토론 & 다음 책 선정', description: '공통 인사이트 도출. 다음 달 책 투표' },
    ],
    guide: '📍 교대역 (장소는 슬랙 공지)\n💰 무료\n📋 책 미독 시 참여 불가 (예외 없음)',
    status: 'confirmed', join_type: 'approval', meeting_type: 'recurring',
    max_members: 8, current_members: 8,
    event_date: '2026-04-28T20:00:00', schedule: '월 1회 월 20:00', location: '교대역', location_detail: null,
    fee: 0, tags: ['브랜딩', '독서', '전략'],
    cover_image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=860&h=400&fit=crop&auto=format',
    leader: { id: 'l7', display_name: '브랜드스토리텔러', job_function: '브랜드 매니저', experience_years: 8, bio: '브랜드를 이야기로 만드는 사람.', avatar_url: null },
    need: { id: 'n7', display_text: '브랜드 전략 같이 공부하고 싶어', count: 14 },
    members: [{ id: 'm1', display_name: '브랜드스토리텔러', job_function: '브랜드 매니저', avatar_url: null }],
    reviews: [],
    related: [
      { slug: 'copywriting-practice', title: '카피라이팅 같이 연습할래?', current_members: 12, max_members: 12, tags: ['카피'], cover_image_url: null },
      { slug: 'startup-marketer-club', title: '스타트업 마케터 네트워킹', current_members: 14, max_members: 20, tags: ['네트워킹'], cover_image_url: null },
    ],
  },
  'data-analytics-meetup': {
    id: 'g8', slug: 'data-analytics-meetup',
    title: '데이터 분석 마케터 모임',
    tagline: 'GA4·Mixpanel·Amplitude 실전 활용 스터디',
    notice: null,
    description: 'GA4, Mixpanel, Amplitude 등 마케팅 분석 도구를 함께 공부합니다.\n\n데이터 드리븐 마케팅을 지향하는 분들의 실무 스터디',
    intro_who: '• 데이터 분석에 관심 있는 마케터\n• GA4 전환 후 혼란스러운 분\n• 코호트 분석, 퍼널 분석을 배우고 싶은 분',
    structure: [
      { number: 1, title: 'GA4 완전 정복', description: 'UA에서 GA4로의 전환. 핵심 리포트 읽기' },
      { number: 2, title: 'Mixpanel 실습', description: '이벤트 기반 분석. 코호트 분석 실습' },
    ],
    guide: '📍 삼성역 (구체 장소 슬랙 공지)\n💰 15,000원\n📋 1회성 모임. 노트북 필참',
    status: 'confirmed', join_type: 'firstcome', meeting_type: 'onetime',
    max_members: 10, current_members: 10,
    event_date: '2026-04-19T14:00:00', schedule: null, location: '삼성역', location_detail: null,
    fee: 15000, tags: ['데이터', 'GA4', '분석'],
    cover_image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=860&h=400&fit=crop&auto=format',
    leader: { id: 'l8', display_name: '데이터M', job_function: '데이터 분석가', experience_years: 4, bio: null, avatar_url: null },
    need: { id: 'n8', display_text: '데이터 분석 배우고 싶어', count: 19 },
    members: [],
    reviews: [],
    related: [
      { slug: 'performance-case-study', title: '퍼포먼스 마케팅 케이스', current_members: 4, max_members: 12, tags: ['퍼포먼스'], cover_image_url: null },
      { slug: 'b2b-marketing-weekly', title: 'B2B 마케팅 실무 모임', current_members: 13, max_members: 20, tags: ['마케팅'], cover_image_url: null },
    ],
  },
  'career-transition-agency-inhouse': {
    id: 'g9', slug: 'career-transition-agency-inhouse',
    title: '이직 준비 — 에이전시↔인하우스 경험 나누기',
    tagline: '에이전시와 인하우스를 오간 마케터들의 솔직한 이직 이야기 4회차 시리즈',
    notice: '4/22(화) 오후 7시 30분, 강남역 3번 출구 도보 2분 · 모노하우스 B1. 노트북 없어도 됩니다.',
    description: '에이전시와 인하우스를 오간 마케터들이 실제 이직 경험을 솔직하게 나누는 4회차 시리즈 모임입니다.\n\n"에이전시에서 인하우스로 가면 어떤 점이 달라지나요?" "반대로 인하우스에서 에이전시로 가면 어떤가요?" 이 모임은 이론이 아닌 실제 경험자들의 이야기로 채워집니다.\n\n이직을 준비 중이거나, 결정을 앞두고 고민 중인 마케터라면 누구나 환영합니다. 단, 경험을 나눌 준비가 된 분들을 위한 자리입니다.',
    intro_who: '• 에이전시에서 인하우스로 이직을 고민 중인 마케터\n• 인하우스에서 에이전시로의 전환을 생각 중인 분\n• 이직 경험이 있고 솔직한 이야기를 나누고 싶은 분\n• 커리어 방향을 고민하는 3~7년차 마케터',
    structure: [
      { number: 1, title: '킥오프 — 각자의 커리어 맵 공유', description: '참여자 소개 + 에이전시·인하우스 경험 타임라인 그리기. "나는 왜 이직을 결심했나" 3분 발표', date: '2026-04-22' },
      { number: 2, title: '실패 경험 공유 — 이직 후 현실 충격', description: '이직 후 예상과 달랐던 점, 힘들었던 순간 솔직 공유. 판단 없이 듣는 자리. 토론 중심', date: '2026-04-29' },
      { number: 3, title: '에이전시 vs 인하우스 — 실전 비교표 만들기', description: '성장, 연봉, 워크라이프밸런스, 커리어 전문성 4가지 축으로 직접 비교. 나만의 기준 찾기', date: '2026-05-06' },
      { number: 4, title: '성공 이직 로드맵 — 지금 해야 할 것들', description: '이직을 성공시킨 경험자들의 준비 과정 공유. 포트폴리오, 면접, 연봉 협상 실전 팁', date: '2026-05-13' },
    ],
    guide: '📍 장소\n강남역 3번 출구 도보 2분 · 모노하우스 B1층 세미나실\n\n📅 일정\n매주 화요일 오후 7시 30분~9시 (4회 연속). 결석 시 다음 회차부터 참여 가능 (자료 공유)\n\n💰 회비\n무료. 음료는 각자 구매.\n\n📋 참여 조건\n• 에이전시 또는 인하우스 마케터 경력 2년 이상\n• 4회 중 3회 이상 참석 가능한 분\n• 자신의 경험을 솔직하게 나눌 의향이 있는 분\n• 타인의 경험을 경청하고 존중하는 분',
    status: 'recruiting', join_type: 'firstcome', meeting_type: 'series', series_count: 4,
    max_members: 25, current_members: 23,
    event_date: '2026-04-22T19:30:00', schedule: '매주 화 19:30~21:00 (4회)', location: '강남역', location_detail: '모노하우스 B1',
    fee: 0, tags: ['이직', '에이전시', '인하우스', '커리어'],
    cover_image_url: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=860&h=400&fit=crop&auto=format',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    leader: {
      id: 'l9', display_name: '박서연', job_function: '브랜드 마케터', experience_years: 7,
      bio: '에이전시 4년(종합광고대행사 AE → 디지털에이전시 팀장) + 인하우스 3년(스타트업 마케팅 리드 → 현재 중견 브랜드팀 매니저)을 거친 마케터입니다.\n\n두 번의 이직 모두 "이 선택이 맞나?" 수백 번 고민했고, 실제로 실패도 했어요. 지금은 그 경험들이 제 커리어의 가장 큰 자산이 됐다고 생각합니다.\n\n이 모임을 만든 이유는 하나예요. 저처럼 고민하는 마케터들이 혼자 결정하지 않았으면 해서요. 같이 고민하면 더 좋은 선택을 할 수 있거든요.',
      avatar_url: null,
    },
    need: { id: 'n9', display_text: '이직 준비 같이 하고 싶어', count: 51 },
    members: [
      { id: 'm1', display_name: '박서연', job_function: '브랜드 마케터', avatar_url: null },
      { id: 'm2', display_name: '퍼포먼스T', job_function: '퍼포먼스 마케터', avatar_url: null },
      { id: 'm3', display_name: '그로스Y', job_function: '그로스 마케터', avatar_url: null },
      { id: 'm4', display_name: '콘텐츠H', job_function: '콘텐츠 마케터', avatar_url: null },
      { id: 'm5', display_name: 'SNS마케L', job_function: 'SNS 마케터', avatar_url: null },
    ],
    reviews: [
      { id: 'r1', author: '퍼포먼스T', avatar_url: null, job_function: '퍼포먼스 마케터', rating: 5, content: '1회차에서 각자의 커리어 맵을 그려보는 시간이 생각보다 엄청난 자극이 됐어요. 다들 솔직하게 이야기해줘서 오히려 더 깊은 대화가 됐습니다. 2회차도 엄청 기대돼요.', created_at: '2026-04-23' },
      { id: 'r2', author: '그로스Y', avatar_url: null, job_function: '그로스 마케터', rating: 5, content: '박서연 바닥장이 판단 없이 다 들어주는 분위기를 만들어줘서 평소엔 말 못했던 이직 실패 경험도 편하게 나눌 수 있었어요. 이런 모임이 진짜 필요했습니다.', created_at: '2026-04-24' },
    ],
    related: [
      { slug: 'startup-marketer-club', title: '스타트업 마케터 네트워킹 클럽', current_members: 14, max_members: 20, tags: ['스타트업', '네트워킹'], cover_image_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=200&h=120&fit=crop' },
      { slug: 'b2b-marketing-weekly', title: 'B2B 마케팅 실무 모임', current_members: 13, max_members: 20, tags: ['마케팅'], cover_image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=120&fit=crop' },
    ],
  },
};

// 구 ID → 슬러그 호환 맵
const ID_TO_SLUG: Record<string, string> = {
  g1: 'b2b-marketing-weekly', g2: 'copywriting-practice',
  g3: 'sns-content-studio', g4: 'performance-case-study',
  g5: 'ai-prompt-engineering', g6: 'startup-marketer-club',
  g7: 'brand-strategy-reading', g8: 'data-analytics-meetup',
  g9: 'career-transition-agency-inhouse',
};

// ── 컬러 팔레트 ──
const AVATAR_COLORS = [
  { bg: 'rgba(255,217,61,0.15)', text: '#ffd93d' },
  { bg: 'rgba(99,102,241,0.15)', text: '#a5b4fc' },
  { bg: 'rgba(74,222,128,0.12)', text: '#4ade80' },
  { bg: 'rgba(251,146,60,0.15)', text: '#fb923c' },
  { bg: 'rgba(236,72,153,0.12)', text: '#f472b6' },
  { bg: 'rgba(34,211,238,0.12)', text: '#22d3ee' },
];

// ── 탭 정의 ──
const TABS = ['소개', '구성', '상세 안내', '후기', '참여 이력', '추천 모임'] as const;
type TabName = typeof TABS[number];

// ── 상태 메타 ──
const STATUS_META: Record<string, { label: string; bg: string; color: string }> = {
  recruiting: { label: '모집중', bg: 'rgba(74,222,128,0.12)', color: '#4ade80' },
  confirmed: { label: '모임 확정', bg: 'rgba(99,102,241,0.12)', color: '#a5b4fc' },
  needs_gathering: { label: '니즈 모이는 중', bg: 'rgba(255,217,61,0.08)', color: '#ffd93d' },
  closed: { label: '마감', bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' },
  ended: { label: '종료', bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' },
};

type JoinState = 'idle' | 'applying' | 'submitted' | 'joined' | 'waitlisted';

// ── 아바타 컴포넌트 ──
function Avatar({ name, avatarUrl, idx, size = 40 }: {
  name: string; avatarUrl?: string | null; idx: number; size?: number;
}) {
  const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
  if (avatarUrl) {
    return (
      <Image src={avatarUrl} alt={name} width={size} height={size}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }} />
    );
  }
  return (
    <div className="flex shrink-0 items-center justify-center rounded-full font-bold"
      style={{ width: size, height: size, fontSize: size * 0.35, background: color.bg, color: color.text }}>
      {name.charAt(0)}
    </div>
  );
}

// ── 별점 ──
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className="h-3.5 w-3.5"
          style={{ fill: i <= rating ? '#ffd93d' : 'transparent', color: i <= rating ? '#ffd93d' : 'rgba(255,255,255,0.15)' }} />
      ))}
    </div>
  );
}

// ── 메인 컴포넌트 ──
export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawSlug } = use(params);
  const { isAuthenticated } = useAuth();

  // slug 또는 구 ID 모두 지원
  const slug = ID_TO_SLUG[rawSlug] || rawSlug;

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [activeTab, setActiveTab] = useState<TabName>('소개');
  const [joinState, setJoinState] = useState<JoinState>('idle');
  const [applyMessage, setApplyMessage] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showLeaderProfile, setShowLeaderProfile] = useState(false);
  const [showNotice, setShowNotice] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [myMemberId, setMyMemberId] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [bookmarkId, setBookmarkId] = useState<string | null>(null);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [myPastGroups, setMyPastGroups] = useState<{
    id: string; slug: string; title: string; status: string;
    event_date: string | null; schedule: string | null; cover_image_url: string | null;
    season_number: number | null;
  }[]>([]);
  const [myPastLoading, setMyPastLoading] = useState(true);

  // 섹션 refs
  const sectionRefs = useRef<Record<TabName, HTMLElement | null>>({
    소개: null, 구성: null, '상세 안내': null, 후기: null, '참여 이력': null, '추천 모임': null,
  });
  const tabBarRef = useRef<HTMLDivElement>(null);

  // 데이터 로드
  useEffect(() => {
    fetch(`/api/badak/groups/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.group) {
          const g = data.group;
          setGroupId(g.id);
          setGroup({
            ...g,
            members: g.members ?? [],
            reviews: [],  // 별도 useEffect에서 /reviews API로 로드
            related: g.related ?? [],
          });
        } else {
          setGroup(MOCK[slug] ?? null);
        }
      })
      .catch(() => setGroup(MOCK[slug] ?? null));
  }, [slug]);

  // 좋아요 + 참여 상태 로드
  useEffect(() => {
    if (!groupId) return;
    const load = async () => {
      const { data: { session } } = await createClient().auth.getSession();
      const token = session?.access_token;
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const [likeRes, joinRes, reviewRes, bookmarkRes] = await Promise.all([
        fetch(`/api/badak/groups/${groupId}/like`, { headers }),
        fetch(`/api/badak/groups/${groupId}/join`, { headers }),
        fetch(`/api/badak/groups/${groupId}/reviews`),
        token ? fetch('/api/badak/bookmarks', { headers }) : Promise.resolve(null),
      ]);

      if (likeRes.ok) {
        const d = await likeRes.json();
        setIsLiked(d.liked);
        setLikeCount(d.count);
      }
      if (joinRes.ok) {
        const d = await joinRes.json();
        if (d.status === 'leader' || d.status === 'approved') setJoinState('joined');
        else if (d.status === 'applied') setJoinState('submitted');
        if (d.memberId) setMyMemberId(d.memberId);
      }
      if (reviewRes.ok) {
        const d = await reviewRes.json();
        if (d.reviews?.length > 0) {
          setGroup(prev => prev ? { ...prev, reviews: d.reviews } : prev);
        }
      }
      if (bookmarkRes?.ok) {
        const d = await bookmarkRes.json();
        const existing = d.bookmarks?.find((b: { item_type: string; item_id: string; id: string }) =>
          b.item_type === 'group' && b.item_id === groupId
        );
        if (existing) {
          setIsBookmarked(true);
          setBookmarkId(existing.id);
        }
      }
    };
    load();
  }, [groupId]);

  // IntersectionObserver — 스크롤 위치에 따라 활성 탭 업데이트
  useEffect(() => {
    if (!group) return;
    const headerH = (tabBarRef.current?.getBoundingClientRect().bottom ?? 112);
    const observers: IntersectionObserver[] = [];

    TABS.forEach(tab => {
      const el = sectionRefs.current[tab];
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveTab(tab); },
        { rootMargin: `-${headerH}px 0px -50% 0px` }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, [group]);

  // 내 참여 이력 로드 (인증된 경우만)
  useEffect(() => {
    if (!isAuthenticated) return;
    setMyPastLoading(true);
    (async () => {
      const { data: { session } } = await createClient().auth.getSession();
      const token = session?.access_token;
      if (!token) { setMyPastLoading(false); return; }
      const res = await fetch('/api/badak/groups?member=me&status=completed', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const d = await res.json();
        setMyPastGroups(d.groups ?? []);
      }
      setMyPastLoading(false);
    })();
  }, [isAuthenticated]);

  function scrollToTab(tab: TabName) {
    const el = sectionRefs.current[tab];
    if (!el) return;
    const offset = (tabBarRef.current?.getBoundingClientRect().height ?? 44) + 56 + 8;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
    setActiveTab(tab);
  }

  function handleShare() {
    if (navigator.share) { navigator.share({ title: group?.title, url: window.location.href }); return; }
    navigator.clipboard.writeText(window.location.href);
    setToast('링크가 복사됐어요');
    setTimeout(() => setToast(null), 2500);
  }

  if (!group) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a1a2e]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-amber-400" />
      </div>
    );
  }

  const isFull = group.current_members >= group.max_members;
  const isClosed = group.status === 'closed' || group.status === 'ended';
  const isNeedsGathering = group.status === 'needs_gathering';
  const fillPct = Math.round((group.current_members / group.max_members) * 100);
  const remaining = group.max_members - group.current_members;
  const remainingPct = remaining / group.max_members;
  const isClosingSoon = !isFull && !isClosed && remainingPct <= 0.10;
  const isHot = !isFull && !isClosed && !isClosingSoon && remainingPct <= 0.40;
  const isNew = group.created_at ? (Date.now() - new Date(group.created_at).getTime()) < 7 * 24 * 60 * 60 * 1000 : false;
  const statusMeta = STATUS_META[group.status] ?? { label: group.status, bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' };
  const ctaDone = joinState === 'joined' || joinState === 'submitted' || joinState === 'waitlisted';
  const ctaDisabled = isClosed || (isFull && !isNeedsGathering);

  const ctaLabel = ctaDone
    ? (joinState === 'joined' ? '참여 완료' : joinState === 'submitted' ? '신청 완료 — 승인 대기' : '관심 등록 완료')
    : isClosed ? '모집 종료'
    : isFull && !isNeedsGathering ? '정원 마감'
    : isNeedsGathering ? '관심 표시하기'
    : group.join_type === 'approval' ? '참여 신청하기'
    : '바로 참여하기';

  async function handleLike() {
    if (!isAuthenticated || !groupId) return;
    const { data: { session } } = await createClient().auth.getSession();
    const token = session?.access_token;
    if (!token) return;
    const res = await fetch(`/api/badak/groups/${groupId}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const d = await res.json();
      setIsLiked(d.liked);
      setLikeCount(d.count);
    }
  }

  async function handleSubmitReview() {
    if (!isAuthenticated || !groupId || reviewSubmitting) return;
    if (!reviewContent.trim()) return;
    setReviewSubmitting(true);
    const { data: { session } } = await createClient().auth.getSession();
    const token = session?.access_token;
    if (!token) { setReviewSubmitting(false); return; }
    const res = await fetch(`/api/badak/groups/${groupId}/reviews`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: reviewRating, content: reviewContent.trim() }),
    });
    if (res.ok) {
      // 제출 후 목록 재조회 — POST 응답에는 author 정보 없음
      const reviewsRes = await fetch(`/api/badak/groups/${groupId}/reviews`);
      if (reviewsRes.ok) {
        const d = await reviewsRes.json();
        setGroup(prev => prev ? { ...prev, reviews: d.reviews ?? [] } : prev);
      }
      setReviewContent('');
      setReviewRating(5);
      setShowReviewForm(false);
    } else {
      const errData = await res.json().catch(() => ({}));
      const msg = errData?.error ?? '';
      if (msg.includes('unique') || msg.includes('duplicate') || res.status === 409) {
        setToast('이미 이 모임에 후기를 남기셨어요');
        setShowReviewForm(false);
      } else if (res.status === 404) {
        setToast('바닥 멤버 프로필이 없습니다. 바닥 가입 후 이용해주세요');
      } else {
        setToast('후기 등록에 실패했습니다. 다시 시도해주세요');
      }
    }
    setReviewSubmitting(false);
  }

  async function handleJoin() {
    if (!isAuthenticated || !group || !groupId) return;
    if (isNeedsGathering) { setJoinState('waitlisted'); return; }
    if (group.join_type === 'approval') { setJoinState('applying'); return; }
    setIsJoining(true);
    const { data: { session } } = await createClient().auth.getSession();
    const token = session?.access_token;
    if (!token) { setIsJoining(false); return; }
    const res = await fetch(`/api/badak/groups/${groupId}/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (res.ok) {
      const d = await res.json();
      setJoinState(d.status === 'approved' ? 'joined' : 'submitted');
    }
    setIsJoining(false);
  }

  async function handleApplySubmit() {
    if (!applyMessage.trim() || !groupId || isJoining) return;
    setIsJoining(true);
    const { data: { session } } = await createClient().auth.getSession();
    const token = session?.access_token;
    if (!token) { setIsJoining(false); return; }
    const res = await fetch(`/api/badak/groups/${groupId}/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: applyMessage }),
    });
    if (res.ok) setJoinState('submitted');
    setIsJoining(false);
  }

  async function handleBookmark() {
    if (!isAuthenticated || !groupId || isBookmarkLoading) return;
    const { data: { session } } = await createClient().auth.getSession();
    const token = session?.access_token;
    if (!token) return;
    setIsBookmarkLoading(true);
    if (isBookmarked && bookmarkId) {
      const res = await fetch(`/api/badak/bookmarks?id=${bookmarkId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setIsBookmarked(false);
        setBookmarkId(null);
        setToast('북마크 해제됐어요');
        setTimeout(() => setToast(null), 2500);
      }
    } else {
      const res = await fetch('/api/badak/bookmarks', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_type: 'group', item_id: groupId, title: group?.title }),
      });
      if (res.ok) {
        const d = await res.json();
        setIsBookmarked(true);
        setBookmarkId(d.bookmark?.id ?? null);
        setToast('북마크에 저장됐어요');
        setTimeout(() => setToast(null), 2500);
      }
    }
    setIsBookmarkLoading(false);
  }

  return (
    <div className="mx-auto min-h-screen max-w-[640px] bg-[#1a1a2e] pb-28 text-white">

      {/* ── 히어로 ── */}
      <div className="relative">
        {group.cover_image_url ? (
          <img src={group.cover_image_url} alt={group.title}
            className={`h-64 w-full object-cover ${isClosed ? 'opacity-40 grayscale' : ''}`} />
        ) : (
          <div className="h-44 w-full"
            style={{ background: 'linear-gradient(135deg, rgba(255,217,61,0.1),rgba(139,92,246,0.1),rgba(59,130,246,0.08))' }} />
        )}
        {/* 그라디언트 오버레이 */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, #1a1a2e 0%, rgba(26,26,46,0.45) 55%, transparent 100%)' }} />

        {/* 상단 액션 바 */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-16">
          <Link href="/badak/groups"
            className="flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm"
            style={{ background: 'rgba(0,0,0,0.35)' }}>
            <ArrowLeft className="h-4 w-4 text-white/80" />
          </Link>
          <div className="flex gap-1.5">
            <button onClick={handleBookmark} disabled={isBookmarkLoading}
              className="flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm"
              style={{ background: 'rgba(0,0,0,0.35)' }}>
              <Bookmark className="h-4 w-4"
                style={{ color: isBookmarked ? '#ffd93d' : 'rgba(255,255,255,0.7)', fill: isBookmarked ? '#ffd93d' : 'none' }} />
            </button>
            <button onClick={handleShare}
              className="flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm"
              style={{ background: 'rgba(0,0,0,0.35)' }}>
              <Share2 className="h-4 w-4 text-white/70" />
            </button>
          </div>
        </div>

        {/* 히어로 하단 — 타이틀 + 배지 */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
          <div className="mb-2 flex flex-wrap gap-1.5">
            <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-sm"
              style={{ background: statusMeta.bg, color: statusMeta.color }}>
              {statusMeta.label}
            </span>
            {group.meeting_type && (
              <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs backdrop-blur-sm"
                style={{ background: 'rgba(0,0,0,0.35)', color: 'rgba(255,255,255,0.55)' }}>
                {group.meeting_type === 'recurring' ? '정기 모임' : group.meeting_type === 'series' ? `${group.series_count ?? ''}회 시리즈` : '1회 모임'}
              </span>
            )}
            {group.join_type === 'approval' && (
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs backdrop-blur-sm"
                style={{ background: 'rgba(0,0,0,0.35)', color: 'rgba(255,255,255,0.45)' }}>
                <Lock className="h-3 w-3" />승인제
              </span>
            )}
            {isClosingSoon && (
              <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold backdrop-blur-sm"
                style={{ background: 'rgba(251,146,60,0.2)', color: '#fb923c' }}>🔥 마감임박</span>
            )}
            {isHot && (
              <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-sm"
                style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>Hot</span>
            )}
            {isNew && (
              <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-sm"
                style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80' }}>New</span>
            )}
          </div>
          <h1 className="text-xl font-extrabold leading-tight text-white drop-shadow">{group.title}</h1>
          {group.tagline && <p className="mt-1 text-sm text-white/55 drop-shadow">{group.tagline}</p>}
        </div>
      </div>

      {/* ── 퀵 스탯 바 ── */}
      <div className="flex divide-x divide-white/8 border-b border-white/10 px-2"
        style={{ background: 'rgba(255,255,255,0.04)' }}>
        {[
          { icon: <Users className="h-4 w-4" />, label: `${group.current_members}/${group.max_members}명`, color: isFull ? '#f87171' : 'rgba(255,255,255,0.80)' },
          group.location && { icon: <MapPin className="h-4 w-4" />, label: group.location, color: 'rgba(255,255,255,0.75)' },
          { icon: <Banknote className="h-4 w-4" />, label: group.fee > 0 ? `${group.fee.toLocaleString()}원` : '무료', color: group.fee === 0 ? '#4ade80' : 'rgba(255,255,255,0.75)' },
          (group.schedule || group.event_date) && {
            icon: <Calendar className="h-4 w-4" />,
            label: group.schedule ?? new Date(group.event_date!).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }),
            color: 'rgba(255,255,255,0.75)',
          },
        ].filter(Boolean).map((item, i) => (item &&
          <div key={i} className="flex flex-1 items-center justify-center gap-1.5 py-3">
            <span style={{ color: (item as {color: string}).color, opacity: 0.7 }}>{item.icon}</span>
            <span className="text-xs font-medium" style={{ color: (item as {color: string}).color }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* ── 잔여석 강조 바 ── */}
      {!isFull && !isClosed && (
        <div className="mx-4 mt-3 flex items-center justify-between rounded-xl px-4 py-2.5"
          style={{ background: isClosingSoon ? 'rgba(251,146,60,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isClosingSoon ? 'rgba(251,146,60,0.3)' : 'rgba(255,255,255,0.09)'}` }}>
          <span className="text-xs" style={{ color: isClosingSoon ? '#fb923c' : 'rgba(255,255,255,0.45)' }}>
            {isClosingSoon ? '🔥 마감임박 · 서두르세요!' : '잔여석'}
          </span>
          <span className="text-sm font-bold" style={{ color: isClosingSoon ? '#fb923c' : '#fb923c' }}>
            {remaining}자리
          </span>
        </div>
      )}

      {/* ── 주요 공지 ── */}
      {group.notice && showNotice && (
        <div className="mx-4 mt-4 flex gap-3 rounded-xl px-4 py-3"
          style={{ background: 'rgba(255,217,61,0.07)', border: '1px solid rgba(255,217,61,0.18)' }}>
          <Bell className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <p className="flex-1 text-sm leading-relaxed text-white/70">{group.notice}</p>
          <button onClick={() => setShowNotice(false)} className="shrink-0 text-white/20 hover:text-white/40">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── 정원 프로그레스 ── */}
      <div className="mx-4 mt-4 rounded-xl px-4 py-3"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="mb-1.5 flex justify-between text-xs">
          <span className="text-white/40">모집 현황</span>
          <span style={{ color: isFull ? '#f87171' : 'rgba(255,255,255,0.65)' }}>
            {group.current_members}/{group.max_members}명
            {!isFull && !isClosed && <span className="ml-1.5 text-white/25">· {group.max_members - group.current_members}자리 남음</span>}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div className="h-full rounded-full"
            style={{ width: `${fillPct}%`, background: isFull ? 'linear-gradient(90deg,#f87171,#fb923c)' : 'linear-gradient(90deg,#ffd93d,#ff9f43)', transition: 'width 0.7s' }} />
        </div>
      </div>

      {/* ── 일시·장소 요약 ── */}
      {(group.event_date || group.schedule || group.location) && (
        <div className="mx-4 mt-3 flex items-center gap-3 rounded-xl px-4 py-3"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {(group.event_date || group.schedule) && (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Calendar className="h-4 w-4 shrink-0 text-amber-400/70" />
              <span className="truncate text-sm font-medium text-white/75">
                {group.schedule ?? new Date(group.event_date!).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
              </span>
            </div>
          )}
          {group.location && (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <MapPin className="h-4 w-4 shrink-0 text-amber-400/70" />
              <span className="truncate text-sm font-medium text-white/75">
                {group.location}{group.location_detail ? ` · ${group.location_detail}` : ''}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── 스티키 탭 바 ── */}
      <div ref={tabBarRef} className="sticky z-20 mt-4 border-b border-white/6"
        style={{ top: 56, background: '#1a1a2e' }}>
        <div className="flex">
          {TABS.map(tab => (
            <button key={tab} onClick={() => scrollToTab(tab)}
              className="flex-1 py-3 text-sm font-medium transition-colors text-center"
              style={{
                color: activeTab === tab ? '#ffd93d' : 'rgba(255,255,255,0.4)',
                borderBottom: activeTab === tab ? '2px solid #ffd93d' : '2px solid transparent',
                marginBottom: -1,
              }}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── 섹션 컨테이너 ── */}
      <div className="px-4">

        {/* ── 소개 ── */}
        <section ref={el => { sectionRefs.current['소개'] = el; }} className="pt-6 pb-2">
          <h2 className="mb-4 text-base font-bold text-white/85">소개</h2>

          {/* 모임 설명 */}
          {group.description && (
            <div className="mb-4 rounded-xl px-4 py-4"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-sm leading-7 text-white/60 whitespace-pre-line">{group.description}</p>
            </div>
          )}

          {/* 이런 분께 추천 */}
          {group.intro_who && (
            <div className="mb-4 rounded-xl px-4 py-4"
              style={{ background: 'rgba(255,217,61,0.04)', border: '1px solid rgba(255,217,61,0.1)' }}>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-amber-400/50">이런 분께 추천해요</div>
              <p className="text-sm leading-7 text-white/60 whitespace-pre-line">{group.intro_who}</p>
            </div>
          )}

          {/* 연결된 니즈 */}
          {group.need && (
            <div className="mb-4 rounded-xl px-4 py-3"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-white/25">연결된 니즈</div>
              <p className="text-sm text-white/65">"{group.need.display_text}"</p>
              <p className="mt-0.5 text-[11px] text-amber-400/50">{group.need.count}명이 같은 니즈를 가지고 있어요</p>
            </div>
          )}

          {/* 바닥장 */}
          {group.leader && (
            <button type="button" onClick={() => setShowLeaderProfile(true)}
              className="w-full flex items-start gap-3.5 rounded-xl p-4 text-left transition-colors hover:border-amber-400/20"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <Avatar name={group.leader.display_name} avatarUrl={group.leader.avatar_url} idx={0} size={48} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white/85">{group.leader.display_name}</span>
                  <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400">바닥장</span>
                </div>
                <div className="mt-0.5 text-xs text-white/35">{group.leader.job_function} · {group.leader.experience_years}년차</div>
                {group.leader_career && <p className="mt-1 text-xs text-white/40 line-clamp-1">{group.leader_career}</p>}
                {group.leader_reason && <p className="mt-1 text-xs leading-relaxed text-amber-400/50 line-clamp-2">{group.leader_reason}</p>}
                {!group.leader_career && !group.leader_reason && group.leader.bio && <p className="mt-1.5 text-xs leading-relaxed text-white/40 line-clamp-2">{group.leader.bio}</p>}
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-white/20 mt-1" />
            </button>
          )}
        </section>

        {/* ── 구성 ── */}
        <section ref={el => { sectionRefs.current['구성'] = el; }} className="pt-6 pb-2">
          <h2 className="mb-4 text-base font-bold text-white/85">구성</h2>
          {group.structure?.length ? (
            <div className="relative">
              {/* 타임라인 라인 */}
              <div className="absolute left-[19px] top-2 bottom-2 w-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
              <div className="space-y-1">
                {group.structure.map(session => (
                  <div key={session.number} className="flex gap-4">
                    {/* 번호 원 */}
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold z-10"
                      style={{ background: '#1a1a2e', border: '1.5px solid rgba(255,217,61,0.3)', color: '#ffd93d' }}>
                      {session.number}
                    </div>
                    <div className="flex-1 pb-6 pt-1.5">
                      <div className="text-sm font-semibold text-white/80">{session.title}</div>
                      <div className="mt-1 text-xs leading-relaxed text-white/45">{session.description}</div>
                      {session.date && <div className="mt-1 text-[11px] text-amber-400/40">{session.date}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl px-4 py-8 text-center"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-sm text-white/30">구성 안내가 준비 중입니다</p>
            </div>
          )}
        </section>

        {/* ── 상세 안내 ── */}
        <section ref={el => { sectionRefs.current['상세 안내'] = el; }} className="pt-6 pb-2">
          <h2 className="mb-4 text-base font-bold text-white/85">상세 안내</h2>

          {/* 모임 정보 그리드 */}
          <div className="mb-4 rounded-xl px-4 py-4 space-y-3"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {[
              group.event_date && {
                icon: <Calendar className="h-3.5 w-3.5 text-amber-400/60" />,
                label: new Date(group.event_date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit' }),
              },
              group.schedule && { icon: <Clock className="h-3.5 w-3.5 text-amber-400/60" />, label: group.schedule },
              group.location && {
                icon: <MapPin className="h-3.5 w-3.5 text-amber-400/60" />,
                label: `${group.location}${group.location_detail ? ` · ${group.location_detail}` : ''}`,
              },
              { icon: <Banknote className="h-3.5 w-3.5 text-amber-400/60" />, label: group.fee > 0 ? `회비 ${group.fee.toLocaleString()}원` : '무료' },
              { icon: <Users className="h-3.5 w-3.5 text-amber-400/60" />, label: `최대 ${group.max_members}명` },
            ].filter(Boolean).map((item, i) => (item &&
              <div key={i} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-lg shrink-0"
                  style={{ background: 'rgba(255,217,61,0.08)' }}>{item.icon}</div>
                <span className="text-sm text-white/60">{item.label}</span>
              </div>
            ))}
          </div>

          {/* 상세 안내 텍스트 */}
          {group.guide && (
            <div className="rounded-xl px-4 py-4"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="text-sm leading-7 text-white/55 whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: group.guide.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white/75 font-medium">$1</strong>') }} />
            </div>
          )}

          {/* 태그 */}
          {group.tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {group.tags.map(tag => (
                <span key={tag} className="rounded-full px-3 py-1.5 text-xs text-white/40"
                  style={{ background: 'rgba(255,255,255,0.05)' }}>#{tag}</span>
              ))}
            </div>
          )}
        </section>

        {/* ── 후기 ── */}
        <section ref={el => { sectionRefs.current['후기'] = el; }} className="pt-6 pb-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-white/85">후기</h2>
            {group.reviews.length > 0 && (
              <div className="flex items-center gap-1.5">
                <StarRating rating={Math.round(group.reviews.reduce((s, r) => s + r.rating, 0) / group.reviews.length)} />
                <span className="text-xs text-white/40">
                  {(group.reviews.reduce((s, r) => s + r.rating, 0) / group.reviews.length).toFixed(1)}
                  <span className="ml-1">({group.reviews.length})</span>
                </span>
              </div>
            )}
          </div>

          {/* 후기 작성 버튼 — 종료된 모임 + 참여자만 */}
          {isAuthenticated && group.status === 'completed' && (joinState === 'joined' || !groupId) && !showReviewForm && (
            <button onClick={() => setShowReviewForm(true)}
              className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium"
              style={{ background: 'rgba(255,217,61,0.08)', border: '1px solid rgba(255,217,61,0.15)', color: 'rgba(255,217,61,0.75)' }}>
              <Star className="h-4 w-4" />후기 남기기
            </button>
          )}

          {/* 후기 작성 폼 */}
          {showReviewForm && (
            <div className="mb-4 rounded-xl px-4 py-4 space-y-3"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,217,61,0.15)' }}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white/75">후기 작성</span>
                <button onClick={() => setShowReviewForm(false)} className="text-white/25 hover:text-white/50">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {/* 별점 선택 */}
              <div className="flex gap-1">
                {[1,2,3,4,5].map(i => (
                  <button key={i} onClick={() => setReviewRating(i)}>
                    <Star className="h-6 w-6"
                      style={{ fill: i <= reviewRating ? '#ffd93d' : 'transparent', color: i <= reviewRating ? '#ffd93d' : 'rgba(255,255,255,0.2)' }} />
                  </button>
                ))}
              </div>
              <textarea value={reviewContent} onChange={e => setReviewContent(e.target.value)}
                placeholder="모임 참여 경험을 솔직하게 남겨주세요"
                className="w-full rounded-xl px-3 py-2.5 text-sm text-white/70 placeholder-white/25 resize-none outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', minHeight: 80 }} />
              <button onClick={handleSubmitReview} disabled={!reviewContent.trim() || reviewSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold disabled:opacity-30"
                style={{ background: '#ffd93d', color: '#1a1a2e' }}>
                <Send className="h-4 w-4" />
                {reviewSubmitting ? '제출 중...' : '후기 등록'}
              </button>
            </div>
          )}

          {/* 이전 시즌 후기 포함 안내 배너 */}
          {group.parent_group_id && group.reviews.length > 0 && (
            <div className="mb-3 flex items-center gap-2 rounded-lg px-3 py-2.5"
              style={{ background: 'rgba(255,217,61,0.05)', border: '1px solid rgba(255,217,61,0.12)' }}>
              <span className="text-[11px] text-amber-400/60">
                시즌 {(group.season_number ?? 2) - 1} 참여자들의 후기가 함께 표시됩니다
              </span>
              {group.parent_slug && (
                <Link href={`/badak/groups/${group.parent_slug}`}
                  className="ml-auto shrink-0 text-[11px] text-amber-400/50 hover:text-amber-400/80 transition-colors">
                  시즌 1 보기 →
                </Link>
              )}
            </div>
          )}

          {group.reviews.length > 0 ? (
            <div className="space-y-3">
              {group.reviews.map((review, i) => {
                const isInherited = group.parent_group_id && review.season_number != null && review.season_number < (group.season_number ?? 1);
                return (
                  <div key={review.id} className="rounded-xl px-4 py-4 space-y-2"
                    style={{
                      background: isInherited ? 'rgba(255,217,61,0.025)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isInherited ? 'rgba(255,217,61,0.08)' : 'rgba(255,255,255,0.07)'}`,
                    }}>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={review.author} avatarUrl={review.avatar_url} idx={i + 1} size={32} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white/75">{review.author}</span>
                          {review.job_function && <span className="text-[11px] text-white/30">{review.job_function}</span>}
                        </div>
                        <StarRating rating={review.rating} />
                      </div>
                      <div className="ml-auto flex flex-col items-end gap-1">
                        {isInherited && (
                          <span className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                            style={{ background: 'rgba(255,217,61,0.1)', color: 'rgba(255,217,61,0.6)', border: '1px solid rgba(255,217,61,0.15)' }}>
                            시즌 {review.season_number}
                          </span>
                        )}
                        <span className="text-[11px] text-white/20">
                          {new Date(review.created_at).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-white/55">{review.content}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl px-4 py-10 text-center"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <MessageCircle className="mx-auto mb-2 h-8 w-8 text-white/10" />
              <p className="text-sm text-white/30">아직 후기가 없어요</p>
              <p className="mt-1 text-xs text-white/20">첫 번째 후기를 남겨보세요</p>
            </div>
          )}
        </section>

        {/* ── 참여 이력 ── */}
        <section ref={el => { sectionRefs.current['참여 이력'] = el; }} className="pt-6 pb-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-white/85">내 참여 이력</h2>
            {myPastGroups.length > 0 && (
              <span className="text-xs text-white/30">총 {myPastGroups.length}개</span>
            )}
          </div>
          {!isAuthenticated ? (
            <div className="rounded-xl px-4 py-10 text-center"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-white/10" />
              <p className="text-sm text-white/30">로그인하면 내 참여 이력을 볼 수 있어요</p>
            </div>
          ) : myPastLoading ? (
            <div className="space-y-2">
              {[0, 1].map(i => (
                <div key={i} className="h-16 animate-pulse rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.04)' }} />
              ))}
            </div>
          ) : myPastGroups.length > 0 ? (
            <div className="space-y-2">
              {myPastGroups.map(pg => (
                <Link key={pg.id} href={`/badak/groups/${pg.slug}`}
                  className="flex items-center gap-3 overflow-hidden rounded-xl transition-opacity hover:opacity-80"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  {pg.cover_image_url ? (
                    <img src={pg.cover_image_url} alt="" className="h-14 w-20 shrink-0 object-cover" />
                  ) : (
                    <div className="h-14 w-16 shrink-0"
                      style={{ background: 'rgba(255,255,255,0.05)' }} />
                  )}
                  <div className="flex-1 min-w-0 py-2">
                    <p className="truncate text-sm font-medium text-white/75">{pg.title}</p>
                    {pg.schedule && (
                      <p className="mt-0.5 truncate text-[11px] text-white/30">{pg.schedule}</p>
                    )}
                  </div>
                  <div className="shrink-0 pr-3 text-right">
                    <span className="rounded-full px-2 py-0.5 text-[10px]"
                      style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      종료됨
                    </span>
                    {pg.season_number && pg.season_number > 1 && (
                      <div className="mt-1 text-[10px]" style={{ color: 'rgba(255,217,61,0.5)' }}>
                        시즌 {pg.season_number}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl px-4 py-10 text-center"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-white/10" />
              <p className="text-sm text-white/30">아직 완료한 모임이 없어요</p>
              <p className="mt-1 text-xs text-white/20">모임에 참여해보세요</p>
            </div>
          )}
        </section>

        {/* ── 추천 모임 ── */}
        <section ref={el => { sectionRefs.current['추천 모임'] = el; }} className="pt-6 pb-8">
          <h2 className="mb-4 text-base font-bold text-white/85">추천 모임</h2>
          {group.related.length > 0 ? (
            <div className="space-y-3">
              {group.related.map(rel => {
                const relFull = rel.current_members >= rel.max_members;
                return (
                  <Link key={rel.slug} href={`/badak/groups/${rel.slug}`}
                    className="flex items-center gap-3 overflow-hidden rounded-xl transition-colors"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    {rel.cover_image_url && (
                      <img src={rel.cover_image_url} alt="" className="h-16 w-20 shrink-0 object-cover" />
                    )}
                    <div className={`flex flex-1 min-w-0 flex-col py-3 ${rel.cover_image_url ? '' : 'px-4'}`}>
                      <p className="truncate text-sm text-white/70">{rel.title}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {rel.tags.slice(0, 2).map(t => (
                          <span key={t} className="text-[10px] text-white/30">#{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="shrink-0 px-3 text-right">
                      <div className="text-xs" style={{ color: relFull ? '#f87171' : 'rgba(255,255,255,0.35)' }}>
                        {rel.current_members}/{rel.max_members}명
                      </div>
                    </div>
                    <ChevronRight className="mr-3 h-4 w-4 shrink-0 text-white/20" />
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-white/30 text-center py-6">추천 모임을 준비 중입니다</p>
          )}
        </section>
      </div>

      {/* ── 참여 신청 시트 (승인제) ── */}
      {joinState === 'applying' && (
        <div className="fixed inset-0 z-40 flex items-end"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={e => { if (e.target === e.currentTarget) setJoinState('idle'); }}>
          <div className="w-full max-w-[640px] mx-auto rounded-t-2xl px-5 pb-10 pt-5 space-y-4"
            style={{ background: '#1e1e38', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white/85">참여 신청 — {group.title}</h3>
              <button onClick={() => setJoinState('idle')} className="text-white/30 hover:text-white/60">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-white/40">
              이 모임은 <span className="text-amber-400/70">승인제</span>입니다. 간단한 자기소개와 참여 동기를 남겨주세요.
            </p>
            <div className="flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[11px]"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <span className="text-white/55 font-medium">신청 제출</span>
              <span className="text-white/20">→</span>
              <span className="text-white/55 font-medium">바닥장 검토 (1~2일)</span>
              <span className="text-white/20">→</span>
              <span className="text-white/55 font-medium">참여 확정 알림</span>
            </div>
            <textarea value={applyMessage} onChange={e => setApplyMessage(e.target.value)}
              placeholder="예: 퍼포먼스 마케터 3년차입니다. B2B SaaS 케이스를 함께 공부하고 싶어 신청합니다."
              className="w-full rounded-xl px-4 py-3 text-sm text-white/75 placeholder-white/25 resize-none outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', minHeight: 100 }} />
            <button onClick={handleApplySubmit}
              disabled={!applyMessage.trim() || isJoining}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold disabled:opacity-30"
              style={{ background: '#ffd93d', color: '#1a1a2e' }}>
              {isJoining ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#1a1a2e]/30 border-t-[#1a1a2e]" /> : <Send className="h-4 w-4" />}
              {isJoining ? '처리 중…' : '신청 보내기'}
            </button>
          </div>
        </div>
      )}

      {/* ── 하단 고정 CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-6 pt-3"
        style={{ background: 'linear-gradient(to top, #1a1a2e 70%, transparent 100%)' }}>
        <div className="mx-auto max-w-[640px]">
          {joinState === 'submitted' && (
            <div className="mb-2.5 rounded-xl px-4 py-3"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-400" />
                <p className="text-xs font-semibold text-indigo-300">신청 완료</p>
              </div>
              {/* 신청 → 검토 → 확정 흐름 */}
              <div className="flex items-center gap-1.5">
                <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{ background: 'rgba(99,102,241,0.25)', color: '#a5b4fc' }}>① 신청 완료</span>
                <span className="text-white/20 text-xs">→</span>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' }}>② 바닥장 검토</span>
                <span className="text-white/20 text-xs">→</span>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.25)' }}>③ 알림 발송</span>
              </div>
              <p className="mt-2 text-[11px] text-indigo-300/50">승인되면 알림으로 알려드릴게요. 보통 1~2일 내 검토됩니다.</p>
            </div>
          )}
          {joinState === 'waitlisted' && (
            <div className="mb-2.5 flex items-center gap-2 rounded-xl px-4 py-2.5"
              style={{ background: 'rgba(255,217,61,0.08)', border: '1px solid rgba(255,217,61,0.15)' }}>
              <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-400" />
              <p className="text-xs text-amber-400/70">관심 등록 완료! 모임 개설 시 알림으로 알려드릴게요.</p>
            </div>
          )}
          <div className="flex gap-2">
            {/* 좋아요 버튼 */}
            <button onClick={handleLike}
              className="flex h-12 shrink-0 items-center justify-center gap-1.5 rounded-xl px-3 transition-colors"
              style={{
                background: isLiked ? 'rgba(255,100,130,0.12)' : 'rgba(255,255,255,0.06)',
                border: isLiked ? '1px solid rgba(255,100,130,0.25)' : '1px solid rgba(255,255,255,0.1)',
              }}>
              <Heart className="h-5 w-5"
                style={{ color: isLiked ? '#ff6482' : 'rgba(255,255,255,0.35)', fill: isLiked ? '#ff6482' : 'none' }} />
              {likeCount > 0 && (
                <span className="text-xs font-medium" style={{ color: isLiked ? '#ff6482' : 'rgba(255,255,255,0.3)' }}>
                  {likeCount}
                </span>
              )}
            </button>
            {/* 잔여 석 */}
            {!isClosed && !isFull && (
              <div className="flex h-12 shrink-0 items-center justify-center rounded-xl px-3"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <span className="text-xs text-white/40">잔여</span>
                <span className="ml-1 text-sm font-bold text-white/65">{group.max_members - group.current_members}</span>
                <span className="ml-0.5 text-xs text-white/30">석</span>
              </div>
            )}
            {/* 참여 CTA */}
            <button onClick={handleJoin} disabled={ctaDisabled || ctaDone || isJoining}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold disabled:cursor-default"
              style={{
                background: ctaDone ? 'rgba(255,255,255,0.06)' : ctaDisabled ? 'rgba(255,255,255,0.05)' : '#ffd93d',
                color: ctaDone ? 'rgba(255,255,255,0.35)' : ctaDisabled ? 'rgba(255,255,255,0.2)' : '#1a1a2e',
                border: ctaDone || ctaDisabled ? '1px solid rgba(255,255,255,0.08)' : 'none',
              }}>
              {isJoining ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#1a1a2e]/30 border-t-[#1a1a2e]" /> : ctaDone ? <CheckCircle2 className="h-4 w-4" /> : isNeedsGathering ? <Bell className="h-4 w-4" /> : group.join_type === 'approval' ? <Lock className="h-4 w-4" /> : <Users className="h-4 w-4" />}
              {isJoining ? '처리 중…' : ctaLabel}
            </button>
          </div>
          {group.fee > 0 && !ctaDone && !ctaDisabled && (
            <p className="mt-2 text-center text-[11px] text-white/25">참여 시 회비 {group.fee.toLocaleString()}원이 발생합니다</p>
          )}
          {!ctaDone && !ctaDisabled && !isNeedsGathering && (
            <p className="mt-1.5 text-center text-[11px] text-white/20">
              {group.join_type === 'approval'
                ? '승인제 · 바닥장이 신청서를 검토 후 참여 확정'
                : '선착순 · 신청 즉시 자동 확정 · 정원 차면 마감'}
            </p>
          )}
        </div>
      </div>

      {/* ── 토스트 ── */}
      {toast && (
        <div className="fixed bottom-28 left-1/2 z-50 -translate-x-1/2 rounded-full px-4 py-2 text-sm font-medium text-white/90 shadow-xl"
          style={{ background: 'rgba(30,30,56,0.95)', border: '1px solid rgba(255,255,255,0.12)', whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}

      {/* ── 바닥장 프로필 시트 ── */}
      {showLeaderProfile && group.leader && (
        <MemberProfileSheet
          memberId={group.leader.id}
          displayName={group.leader.display_name}
          job={`${group.leader.job_function} · ${group.leader.experience_years}년차`}
          isLeader
          onClose={() => setShowLeaderProfile(false)}
        />
      )}
    </div>
  );
}
