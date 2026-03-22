import { CmsPost } from '@/types/cms';

export const initialPosts: CmsPost[] = [
    {
        id: 'cms-1', title: 'LUKI — AI 4인조 걸그룹 데뷔',
        summary: "파괴된 행성 '루미나'의 빛의 조각이 되어 지구에 불시착한 네 명의 소녀들. 하이틴 판타지와 SF를 결합한 AI 아이돌 그룹이 데뷔했습니다.",
        body: '', category: '브랜드', channels: ['works', 'newsroom'], status: 'Published',
        date: '2025-08-31', brandId: 'luki', image: 'LUKI 데뷔 비주얼 이미지',
        externalLink: 'https://youtube.com/@LUKI-AIdol', tags: ['AI', 'K-Pop', '데뷔'],
        createdAt: '2025-08-31', updatedAt: '2025-08-31'
    },
    {
        id: 'cms-2', title: 'RooK — 인공지능 크리에이터 플랫폼 런칭',
        summary: '인공지능으로 다양한 창작 활동을 하는 사람들과 만나보자는 생각에 인공지능 크리에이터 루크를 만들었습니다.',
        body: '', category: '브랜드', channels: ['works', 'newsroom'], status: 'Published',
        date: '2025-08-29', brandId: 'rook', image: 'RooK 플랫폼 키 비주얼',
        externalLink: 'http://RooK.co.kr', tags: ['AI', '크리에이터'],
        createdAt: '2025-08-29', updatedAt: '2025-08-29'
    },
    {
        id: 'cms-3', title: 'MADzine — 마케팅/광고 매거진 창간',
        summary: '마케팅, 광고에 미친(MAD) 우리들의 이야기. 형식도, 주기도 없는 새로운 마케팅/광고 매거진이 창간되었습니다.',
        body: '', category: '콘텐츠', channels: ['newsroom'], status: 'Published',
        date: '2025-04-03', image: 'MADzine 창간호 표지', tags: ['매거진', '마케팅'],
        createdAt: '2025-04-03', updatedAt: '2025-04-03'
    },
    {
        id: 'cms-4', title: 'DAM Be — MAD League 캐릭터 개발',
        summary: '최상위 포식자이자 영리한 한국의 노란목 담비를 MAD League의 캐릭터로 상징화했습니다.',
        body: '', category: '브랜드', channels: ['newsroom'], status: 'Published',
        date: '2025-03-31', image: 'DAM Be 캐릭터 일러스트', tags: ['캐릭터', '브랜딩'],
        createdAt: '2025-03-31', updatedAt: '2025-03-31'
    },
    {
        id: 'cms-5', title: '전국 5개 권역 네트워크 완성',
        summary: '제주 수작이 합류하며 서울경기, 대구경북, 부산경남, 광주전남, 제주까지 전국 MAD League 네트워크가 완성되었습니다.',
        body: '', category: '네트워크', channels: ['newsroom'], status: 'Published',
        date: '2025-01-13', image: '전국 네트워크 지도', tags: ['네트워크', 'MAD League'],
        createdAt: '2025-01-13', updatedAt: '2025-01-13'
    },
    {
        id: 'cms-6', title: 'MAD League X 지평주조 — 경쟁 PT',
        summary: '지평주조 탄생 100주년을 맞아 전국 3개 연합 동아리가 마케팅 계획 경쟁 PT를 진행했습니다.',
        body: '', category: '프로젝트', channels: ['newsroom'], status: 'Published',
        date: '2024-09-27', image: '경쟁 PT 현장 사진', tags: ['경쟁PT', '프로젝트'],
        createdAt: '2024-09-27', updatedAt: '2024-09-27'
    },
    {
        id: 'cms-7', title: 'ChangeUp — 인공지능 시대 인재 양성',
        summary: '기업가 정신을 가르치는 선생님들과 함께 학생들의 창업 아이디어를 실현하도록 돕는 프로그램을 시작했습니다.',
        body: '', category: '교육', channels: ['works', 'newsroom'], status: 'Published',
        date: '2024-05-18', brandId: 'youinone', image: 'ChangeUp 프로그램 현장',
        externalLink: 'http://ChangeUp.company', tags: ['인재양성', '창업'],
        createdAt: '2024-05-18', updatedAt: '2024-05-18'
    },
    {
        id: 'cms-8', title: '0gamja — 캐릭터 브랜드 런칭',
        summary: '인공지능 시대일수록 사람이어야만 하는 이유. 하찮지만 귀여운 감자들의 공감 이야기.',
        body: '', category: '브랜드', channels: ['works', 'newsroom'], status: 'Published',
        date: '2024-01-17', brandId: '0gamja', image: '0gamja 캐릭터 일러스트',
        externalLink: 'http://0gamja.com', tags: ['캐릭터', '브랜드'],
        createdAt: '2024-01-17', updatedAt: '2024-01-17'
    },
    {
        id: 'cms-9', title: 'FWN — 패션 위크 네트워크',
        summary: '전세계 패션 위크를 네트워킹하고 한국 브랜드의 세계 진출을 돕는 패션 산업의 나침반.',
        body: '', category: '브랜드', channels: ['works', 'newsroom'], status: 'Published',
        date: '2023-09-25', brandId: 'fwn', image: 'FWN 패션위크 현장',
        externalLink: 'http://FWN.co.kr', tags: ['패션', '네트워크'],
        createdAt: '2023-09-25', updatedAt: '2023-09-25'
    },
    {
        id: 'cms-10', title: 'YouInOne — 프로젝트 그룹 출범',
        summary: '사회와 기업의 고민을 해결하는 프로젝트 그룹. 소규모 기업 연합 얼라이언스로 연대합니다.',
        body: '', category: '브랜드', channels: ['works', 'newsroom'], status: 'Published',
        date: '2023-05-15', brandId: 'youinone', image: 'YouInOne 팀 사진',
        externalLink: 'http://YouInOne.com', tags: ['프로젝트', '연합'],
        createdAt: '2023-05-15', updatedAt: '2023-05-15'
    },
    {
        id: 'cms-11', title: 'MAD League — 대학생 프로젝트 연합 출범',
        summary: '실전 프로젝트를 통해 마케팅/광고 업계로 진출하고자 하는 학생들에게 기회를 제공합니다.',
        body: '', category: '네트워크', channels: ['works', 'newsroom'], status: 'Published',
        date: '2022-07-18', brandId: 'madleague', image: 'MAD League 출범 현장',
        externalLink: 'http://MADLeague.net', tags: ['대학생', '연합'],
        createdAt: '2022-07-18', updatedAt: '2022-07-18'
    },
    {
        id: 'cms-12', title: 'Badak.biz — 네트워킹 커뮤니티 오픈',
        summary: '바닥 좁다고 했잖아. 마케팅/광고 업계 다양한 사람들을 만나고 이야기할 수 있는 커뮤니티.',
        body: '', category: '브랜드', channels: ['works', 'newsroom'], status: 'Published',
        date: '2021-02-08', brandId: 'badak', image: 'Badak 밋업 현장 사진',
        externalLink: 'http://badak.biz', tags: ['네트워킹', '커뮤니티'],
        createdAt: '2021-02-08', updatedAt: '2021-02-08'
    },
    {
        id: 'cms-13', title: 'Ten:One™ Universe — 세계관의 시작',
        summary: '과거의 아이디어와 계획들을 세상에 꺼내 놓기로 결심하며 Ten:One™ 사이트를 오픈했습니다.',
        body: '', category: '브랜드', channels: ['works', 'newsroom'], status: 'Published',
        date: '2020-03-11', brandId: 'tenone', image: 'Ten:One™ 오리지널 사이트',
        tags: ['시작', '세계관'],
        createdAt: '2020-03-11', updatedAt: '2020-03-11'
    },
];
