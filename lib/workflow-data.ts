import { WorkflowTask, PipelineItem, BrandProject, AutomationRule } from '@/types/workflow';

export const initialTasks: WorkflowTask[] = [
    {
        id: 't1', title: 'LUKI 2nd Single MV 기획', description: 'LUKI 두 번째 싱글 뮤직비디오 콘셉트 및 스토리보드 작성',
        status: 'In Progress', priority: 'High', assignee: 'Cheonil Jeon', brandId: 'luki',
        dueDate: '2025-11-15', tags: ['MV', 'Creative'], createdAt: '2025-09-01', updatedAt: '2025-09-10',
    },
    {
        id: 't2', title: 'RooK 전시회 공간 섭외', description: '메타버스 전시 플랫폼 선정 및 계약',
        status: 'Todo', priority: 'High', assignee: 'Sarah Kim', brandId: 'rook',
        dueDate: '2025-10-01', tags: ['Event', 'Metaverse'], createdAt: '2025-08-20', updatedAt: '2025-08-20',
    },
    {
        id: 't3', title: 'Badak 네트워킹 나이트 후기', description: '행사 사진/영상 정리 및 SNS 업로드',
        status: 'Review', priority: 'Medium', assignee: 'Minji Park', brandId: 'badak',
        dueDate: '2025-09-15', tags: ['SNS', 'Content'], createdAt: '2025-09-06', updatedAt: '2025-09-08',
    },
    {
        id: 't4', title: 'MAD League Season 1 규정 작성', description: '시즌 1 참가 자격 및 심사 기준 문서화',
        status: 'Done', priority: 'Medium', assignee: 'Cheonil Jeon', brandId: 'madleague',
        tags: ['Document', 'Rules'], createdAt: '2025-08-01', updatedAt: '2025-08-25',
    },
    {
        id: 't5', title: 'Ten:One™ 브랜드 가이드라인 업데이트', description: '로고, 컬러, 타이포그래피 가이드라인 v2',
        status: 'Backlog', priority: 'Low', assignee: '', brandId: 'tenone',
        tags: ['Branding', 'Design'], createdAt: '2025-09-10', updatedAt: '2025-09-10',
    },
    {
        id: 't6', title: 'LUKI 팬 커뮤니티 오픈', description: '공식 팬 커뮤니티 플랫폼 구축',
        status: 'Todo', priority: 'Medium', assignee: 'Cheonil Jeon', brandId: 'luki',
        dueDate: '2025-12-01', tags: ['Community', 'Platform'], createdAt: '2025-09-05', updatedAt: '2025-09-05',
    },
    {
        id: 't7', title: 'HeRo 에이전시 계약서 검토', description: 'AI 아이돌 매니지먼트 표준 계약서 초안 리뷰',
        status: 'In Progress', priority: 'Urgent', assignee: 'Sarah Kim', brandId: 'hero',
        dueDate: '2025-09-20', tags: ['Legal', 'Contract'], createdAt: '2025-09-08', updatedAt: '2025-09-12',
    },
    {
        id: 't8', title: '0gamja 웹툰 에피소드 5 작업', description: '감자 이야기 시리즈 다섯 번째 에피소드 제작',
        status: 'In Progress', priority: 'Medium', assignee: 'Cheonil Jeon', brandId: '0gamja',
        dueDate: '2025-10-10', tags: ['Webtoon', 'Content'], createdAt: '2025-09-01', updatedAt: '2025-09-11',
    },
];

export const initialPipelineItems: PipelineItem[] = [
    {
        id: 'p1', title: 'LUKI Debut Teaser', type: 'Video', stage: 'Published',
        brandId: 'luki', assignee: 'Cheonil Jeon', dueDate: '2025-08-15',
        aiGenerated: true, description: 'AI 생성 데뷔 티저 영상', createdAt: '2025-07-20',
    },
    {
        id: 'p2', title: 'RooK Concept Art Reveal', type: 'Post', stage: 'Scheduled',
        brandId: 'rook', assignee: 'David Lee', dueDate: '2025-10-01',
        aiGenerated: false, description: '사이버펑크 컨셉 아트 공개 포스트', createdAt: '2025-09-01',
    },
    {
        id: 'p3', title: 'Weekly AI News', type: 'Blog', stage: 'Scripting',
        brandId: 'tenone', assignee: 'Cheonil Jeon',
        aiGenerated: true, description: 'AI 관련 주간 뉴스 블로그', createdAt: '2025-09-05',
    },
    {
        id: 'p4', title: 'Lumi Dance Challenge', type: 'Shorts', stage: 'Idea',
        brandId: 'luki', assignee: '',
        aiGenerated: false, description: 'LUKI 루미 캐릭터 댄스 챌린지 쇼츠', createdAt: '2025-09-08',
    },
    {
        id: 'p5', title: 'LUKI 2nd Single MV', type: 'Music', stage: 'Production',
        brandId: 'luki', assignee: 'Cheonil Jeon', dueDate: '2025-12-01',
        aiGenerated: true, description: '두 번째 싱글 뮤직비디오 제작', createdAt: '2025-09-10',
    },
    {
        id: 'p6', title: 'Badak Networking Recap', type: 'Video', stage: 'Review',
        brandId: 'badak', assignee: 'Minji Park', dueDate: '2025-09-20',
        aiGenerated: false, description: '네트워킹 나이트 행사 리캡 영상', createdAt: '2025-09-07',
    },
];

export const initialProjects: BrandProject[] = [
    {
        id: 'proj1', name: 'LUKI Debut Campaign', brandId: 'luki',
        description: 'LUKI 4인조 AI 걸그룹 데뷔 전체 캠페인 기획 및 실행',
        status: 'Active', phase: 'Launch', taskIds: ['t1', 't6'],
        startDate: '2025-06-01', endDate: '2025-12-31', progress: 72,
    },
    {
        id: 'proj2', name: 'RooK Cyber Punk Exhibition', brandId: 'rook',
        description: '메타버스 기반 사이버펑크 디지털 아트 전시회',
        status: 'Active', phase: 'Development', taskIds: ['t2'],
        startDate: '2025-08-01', endDate: '2025-10-15', progress: 45,
    },
    {
        id: 'proj3', name: 'MAD League Season 1', brandId: 'madleague',
        description: '대학생 프로젝트 대회 시즌 1 운영',
        status: 'Active', phase: 'Review', taskIds: ['t4'],
        startDate: '2025-07-01', endDate: '2025-11-20', progress: 80,
    },
    {
        id: 'proj4', name: 'HeRo Agency Launch', brandId: 'hero',
        description: 'AI 아이돌/크리에이터 전문 에이전시 공식 론칭',
        status: 'Active', phase: 'Planning', taskIds: ['t7'],
        startDate: '2025-09-01', endDate: '2026-03-01', progress: 15,
    },
    {
        id: 'proj5', name: '0gamja Webtoon Series', brandId: '0gamja',
        description: '감자 캐릭터 웹툰 시리즈 연재',
        status: 'Active', phase: 'Development', taskIds: ['t8'],
        startDate: '2025-05-01', progress: 55,
    },
];

export const initialAutomations: AutomationRule[] = [
    {
        id: 'auto1', name: 'Task 완료 시 알림', description: '태스크가 Done으로 이동하면 팀에게 알림 전송',
        trigger: { type: 'task_status_change', label: 'Task Status Changed', config: { targetStatus: 'Done' } },
        conditions: [{ field: 'priority', operator: 'equals', value: 'High' }],
        actions: [{ type: 'notify', label: 'Send Notification', config: { channel: 'team', message: 'High priority task completed!' } }],
        enabled: true, brandId: 'tenone', lastTriggered: '2025-09-10', createdAt: '2025-08-01',
    },
    {
        id: 'auto2', name: '콘텐츠 리뷰 자동 태스크', description: '새 콘텐츠가 Review 단계에 진입하면 리뷰 태스크 자동 생성',
        trigger: { type: 'new_content', label: 'New Content in Review', config: { stage: 'Review' } },
        conditions: [],
        actions: [{ type: 'create_task', label: 'Create Review Task', config: { title: 'Review: {content_title}', assignee: 'Cheonil Jeon', priority: 'High' } }],
        enabled: true, brandId: 'tenone', createdAt: '2025-08-15',
    },
    {
        id: 'auto3', name: '주간 리포트 생성', description: '매주 월요일 오전 9시에 주간 활동 리포트 생성',
        trigger: { type: 'schedule', label: 'Weekly Schedule', config: { cron: '0 9 * * MON' } },
        conditions: [],
        actions: [{ type: 'create_task', label: 'Generate Weekly Report', config: { title: 'Weekly Report - {date}', assignee: 'Cheonil Jeon', priority: 'Medium' } }],
        enabled: false, brandId: 'tenone', createdAt: '2025-09-01',
    },
    {
        id: 'auto4', name: 'LUKI 콘텐츠 승인 플로우', description: 'LUKI 브랜드 콘텐츠가 Scheduled로 이동 시 최종 승인 태스크 생성',
        trigger: { type: 'task_status_change', label: 'Content Scheduled', config: { targetStatus: 'Scheduled' } },
        conditions: [{ field: 'brandId', operator: 'equals', value: 'luki' }],
        actions: [
            { type: 'create_task', label: 'Create Approval Task', config: { title: 'Final Approval: {content_title}', assignee: 'Cheonil Jeon', priority: 'Urgent' } },
            { type: 'notify', label: 'Notify Admin', config: { channel: 'admin', message: 'LUKI content requires approval' } },
        ],
        enabled: true, brandId: 'luki', lastTriggered: '2025-09-08', createdAt: '2025-08-20',
    },
];
