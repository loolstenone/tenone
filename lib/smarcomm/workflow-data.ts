import { WorkflowTask, PipelineItem, BrandProject, AutomationRule } from '@/types/workflow';

// SmarComm 워크플로우용 채널/프로젝트 목록
export const workflowChannels = [
  { id: 'naver', name: '네이버' },
  { id: 'meta', name: '메타 (인스타/FB)' },
  { id: 'google', name: '구글' },
  { id: 'kakao', name: '카카오' },
  { id: 'youtube', name: '유튜브' },
  { id: 'blog', name: '블로그' },
  { id: 'general', name: '일반' },
];

export const initialTasks: WorkflowTask[] = [
  {
    id: 't1', title: '봄 시즌 네이버 SA 카피 작성', description: '봄 시즌 프로모션용 네이버 검색광고 카피 10종 작성',
    status: 'In Progress', priority: 'High', assignee: '김마케팅', brandId: 'naver',
    dueDate: '2026-03-25', tags: ['카피', 'SA'], createdAt: '2026-03-10', updatedAt: '2026-03-20',
  },
  {
    id: 't2', title: '인스타그램 배너 디자인', description: '봄 캠페인용 인스타그램 배너 3종 디자인',
    status: 'Todo', priority: 'High', assignee: '이디자이너', brandId: 'meta',
    dueDate: '2026-03-28', tags: ['배너', '디자인'], createdAt: '2026-03-15', updatedAt: '2026-03-15',
  },
  {
    id: 't3', title: 'GEO 개선 FAQ 스키마 추가', description: 'AI 검색 노출을 위한 FAQ 구조화 데이터 마크업',
    status: 'Review', priority: 'Medium', assignee: '박개발자', brandId: 'general',
    dueDate: '2026-03-22', tags: ['GEO', 'SEO'], createdAt: '2026-03-08', updatedAt: '2026-03-18',
  },
  {
    id: 't4', title: 'A/B 테스트 결과 분석', description: '랜딩 페이지 CTA 버튼 A/B 테스트 결과 정리 및 보고서',
    status: 'Done', priority: 'Medium', assignee: '김마케팅', brandId: 'general',
    tags: ['분석', 'CRO'], createdAt: '2026-03-01', updatedAt: '2026-03-15',
  },
  {
    id: 't5', title: '구글 디스플레이 캠페인 설정', description: '리마케팅 오디언스 세팅 및 배너 업로드',
    status: 'Backlog', priority: 'Low', assignee: '', brandId: 'google',
    tags: ['GDN', '리마케팅'], createdAt: '2026-03-18', updatedAt: '2026-03-18',
  },
  {
    id: 't6', title: '카카오톡 메시지 세그먼트 설정', description: '이탈 위험군 대상 카카오 알림톡 발송 준비',
    status: 'Todo', priority: 'Medium', assignee: '최CRM', brandId: 'kakao',
    dueDate: '2026-03-30', tags: ['CRM', '카카오'], createdAt: '2026-03-16', updatedAt: '2026-03-16',
  },
  {
    id: 't7', title: '유튜브 영상광고 소재 제작', description: '15초/30초 유튜브 프리롤 광고 소재 제작',
    status: 'In Progress', priority: 'Urgent', assignee: '이디자이너', brandId: 'youtube',
    dueDate: '2026-03-26', tags: ['영상', '광고'], createdAt: '2026-03-12', updatedAt: '2026-03-21',
  },
  {
    id: 't8', title: '블로그 SEO 콘텐츠 발행', description: '타겟 키워드 기반 블로그 포스트 3건 작성 및 발행',
    status: 'In Progress', priority: 'Medium', assignee: '김마케팅', brandId: 'blog',
    dueDate: '2026-03-27', tags: ['콘텐츠', 'SEO'], createdAt: '2026-03-10', updatedAt: '2026-03-19',
  },
];

export const initialPipelineItems: PipelineItem[] = [
  {
    id: 'p1', title: '봄 시즌 SA 카피 10종', type: 'Post', stage: 'Published',
    brandId: 'naver', assignee: '김마케팅', dueDate: '2026-03-20',
    aiGenerated: true, description: 'AI 생성 네이버 검색광고 카피', createdAt: '2026-03-05',
  },
  {
    id: 'p2', title: '인스타 봄 배너 3종', type: 'Post', stage: 'Scheduled',
    brandId: 'meta', assignee: '이디자이너', dueDate: '2026-03-28',
    aiGenerated: false, description: '봄 캠페인 인스타그램 배너 디자인', createdAt: '2026-03-12',
  },
  {
    id: 'p3', title: 'GEO/SEO 개선 블로그', type: 'Blog', stage: 'Scripting',
    brandId: 'blog', assignee: '김마케팅',
    aiGenerated: true, description: 'AI 검색 최적화 관련 블로그 시리즈', createdAt: '2026-03-15',
  },
  {
    id: 'p4', title: '유튜브 프리롤 15초', type: 'Video', stage: 'Production',
    brandId: 'youtube', assignee: '이디자이너', dueDate: '2026-03-26',
    aiGenerated: false, description: '유튜브 광고용 15초 영상 소재', createdAt: '2026-03-18',
  },
  {
    id: 'p5', title: '카카오 알림톡 시나리오', type: 'Post', stage: 'Review',
    brandId: 'kakao', assignee: '최CRM', dueDate: '2026-03-29',
    aiGenerated: false, description: '이탈 방지 알림톡 시나리오 3종', createdAt: '2026-03-16',
  },
  {
    id: 'p6', title: '리마케팅 배너 5종', type: 'Shorts', stage: 'Idea',
    brandId: 'google', assignee: '',
    aiGenerated: true, description: 'GDN 리마케팅용 배너 아이디어', createdAt: '2026-03-20',
  },
];

export const initialProjects: BrandProject[] = [
  {
    id: 'proj1', name: '봄 시즌 통합 캠페인', brandId: 'general',
    description: '봄 시즌 프로모션 — 네이버 SA + 메타 + 유튜브 3채널 통합 집행',
    status: 'Active', phase: 'Launch', taskIds: ['t1', 't2', 't7'],
    startDate: '2026-03-01', endDate: '2026-04-30', progress: 68,
  },
  {
    id: 'proj2', name: 'GEO/SEO 개선 프로젝트', brandId: 'general',
    description: 'AI 검색 노출 최적화 — 구조화 데이터, FAQ 스키마, 콘텐츠 갭 해소',
    status: 'Active', phase: 'Development', taskIds: ['t3', 't8'],
    startDate: '2026-03-05', endDate: '2026-04-15', progress: 42,
  },
  {
    id: 'proj3', name: 'CRM 자동화 구축', brandId: 'kakao',
    description: '이탈 방지 + 재방문 유도 자동화 시나리오 (카카오 + 이메일 + 푸시)',
    status: 'Active', phase: 'Planning', taskIds: ['t6'],
    startDate: '2026-03-15', endDate: '2026-05-01', progress: 18,
  },
  {
    id: 'proj4', name: '전환율 최적화 (CRO)', brandId: 'general',
    description: '랜딩 페이지 A/B 테스트 + 퍼널 분석 기반 전환율 개선',
    status: 'Active', phase: 'Review', taskIds: ['t4'],
    startDate: '2026-02-15', endDate: '2026-03-31', progress: 85,
  },
  {
    id: 'proj5', name: '구글 리마케팅 캠페인', brandId: 'google',
    description: 'GDN 리마케팅 + 동적 리마케팅 세팅 및 집행',
    status: 'On Hold', phase: 'Planning', taskIds: ['t5'],
    startDate: '2026-04-01', progress: 10,
  },
];

export const initialAutomations: AutomationRule[] = [
  {
    id: 'auto1', name: '캠페인 완료 알림', description: '캠페인 태스크가 완료되면 팀 전원에게 알림',
    trigger: { type: 'task_status_change', label: 'Task 완료', config: { targetStatus: 'Done' } },
    conditions: [{ field: 'priority', operator: 'equals', value: 'High' }],
    actions: [{ type: 'notify', label: '팀 알림', config: { channel: 'team', message: '중요 태스크 완료!' } }],
    enabled: true, brandId: 'general', lastTriggered: '2026-03-15', createdAt: '2026-03-01',
  },
  {
    id: 'auto2', name: '콘텐츠 리뷰 자동 태스크', description: '콘텐츠가 Review 단계에 진입하면 리뷰 태스크 자동 생성',
    trigger: { type: 'new_content', label: '콘텐츠 리뷰 진입', config: { stage: 'Review' } },
    conditions: [],
    actions: [{ type: 'create_task', label: '리뷰 태스크 생성', config: { title: 'Review: {content_title}', assignee: '김마케팅', priority: 'High' } }],
    enabled: true, brandId: 'general', createdAt: '2026-03-05',
  },
  {
    id: 'auto3', name: '주간 리포트 생성', description: '매주 월요일 오전 9시 주간 마케팅 리포트 자동 생성',
    trigger: { type: 'schedule', label: '주간 스케줄', config: { cron: '0 9 * * MON' } },
    conditions: [],
    actions: [{ type: 'create_task', label: '주간 리포트', config: { title: 'Weekly Report - {date}', assignee: '김마케팅', priority: 'Medium' } }],
    enabled: false, brandId: 'general', createdAt: '2026-03-08',
  },
  {
    id: 'auto4', name: '소재 발행 승인 플로우', description: '소재가 Scheduled로 이동 시 최종 승인 태스크 생성',
    trigger: { type: 'task_status_change', label: '소재 스케줄됨', config: { targetStatus: 'Scheduled' } },
    conditions: [{ field: 'brandId', operator: 'equals', value: 'meta' }],
    actions: [
      { type: 'create_task', label: '승인 태스크', config: { title: '최종 승인: {content_title}', assignee: '김마케팅', priority: 'Urgent' } },
      { type: 'notify', label: '관리자 알림', config: { channel: 'admin', message: '소재 최종 승인 필요' } },
    ],
    enabled: true, brandId: 'meta', lastTriggered: '2026-03-18', createdAt: '2026-03-10',
  },
];
