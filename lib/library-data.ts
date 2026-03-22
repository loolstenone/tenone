import type { LibraryItem, LibraryBookmark } from '@/types/library';

export const initialLibraryItems: LibraryItem[] = [
    // ═══════════════════════════════════════════════════
    // Wiki Library — 기존 가이드 + 레퍼런스 통합 + 템플릿 통합
    // ═══════════════════════════════════════════════════

    // ── 전략·기획 ──
    { id: 'wiki-01', title: 'VRIEF 프레임워크 가이드', description: 'Ten:One™ 핵심 업무 방법론. 조사분석→가설검증→전략수립 3단계 프레임워크 상세 설명', category: '전략·기획', source: 'wiki', format: 'PDF', fileSize: '2.8 MB', tags: ['VRIEF', '방법론', '필수'], author: 'Cheonil Jeon', authorId: 'user-ceo', createdAt: '2026-01-05', updatedAt: '2026-03-01', permission: 'all', bookmarkCount: 32, viewCount: 215 },
    { id: 'wiki-10', title: '리드 발굴~딜 클로징 프로세스', description: '영업 파이프라인 전 과정 가이드. 리드 소스별 접근법 포함', category: '전략·기획', source: 'wiki', format: 'PDF', fileSize: '2.0 MB', tags: ['영업', '리드', '마케팅'], author: '한마케', authorId: 'staff-19', createdAt: '2026-02-25', updatedAt: '2026-03-11', permission: 'staff', projectCode: 'PRJ-2026-0004', projectName: 'Brand Gravity', bookmarkCount: 14, viewCount: 89 },
    { id: 'wiki-r6', title: 'VRIEF vs 기존 기획 프레임워크 비교', description: 'Design Thinking, Lean Startup, AARRR 등과 VRIEF의 비교 분석. 각 프레임워크별 적합 상황 정리', category: '전략·기획', source: 'wiki', format: 'URL', tags: ['VRIEF', '방법론', '비교'], author: '백강사', authorId: 'staff-30', createdAt: '2026-02-01', updatedAt: '2026-03-01', permission: 'all', bookmarkCount: 18, viewCount: 95 },

    // ── 템플릿·양식 ──
    { id: 'wiki-02', title: 'GPR 작성 템플릿 (GPR III)', description: '개인 단위 GPR 작성 양식. Goal→Plan→Result 구조와 3차원 평가 기준 포함', category: '템플릿·양식', source: 'wiki', format: 'XLSX', fileSize: '156 KB', tags: ['GPR', '평가', '템플릿'], author: 'Cheonil Jeon', authorId: 'user-ceo', createdAt: '2026-01-10', updatedAt: '2026-02-20', permission: 'staff', bookmarkCount: 28, viewCount: 187 },
    { id: 'wiki-05', title: '프로젝트 제안서 템플릿', description: '클라이언트 제안서 표준 양식. 표지, 목차, 본문 구조 포함', category: '템플릿·양식', source: 'wiki', format: 'PPTX', fileSize: '4.1 MB', tags: ['제안서', '템플릿', '클라이언트'], author: '박기획', authorId: 'staff-05', createdAt: '2026-01-15', updatedAt: '2026-03-12', permission: 'staff', bookmarkCount: 41, viewCount: 256 },
    { id: 'wiki-t1', title: '프로젝트 기획서 양식', description: '프로젝트 초기 기획 문서 표준 양식. 배경, 목적, 범위, 일정, 예산 포함', category: '템플릿·양식', source: 'wiki', format: 'DOCX', fileSize: '220 KB', tags: ['기획서', '양식', '프로젝트'], author: '박기획', authorId: 'staff-05', createdAt: '2025-12-01', updatedAt: '2026-02-15', permission: 'staff', bookmarkCount: 38, viewCount: 201 },
    { id: 'wiki-t4', title: '주간 업무보고서 양식', description: '주간 업무 진행 현황, 이슈, 다음 주 계획 보고 양식', category: '템플릿·양식', source: 'wiki', format: 'DOCX', fileSize: '98 KB', tags: ['보고서', '주간', '양식'], author: '정전략', authorId: 'staff-08', createdAt: '2025-11-20', updatedAt: '2026-01-10', permission: 'staff', bookmarkCount: 22, viewCount: 167 },
    { id: 'wiki-t5', title: '경비 청구서 양식', description: '경비 정산 및 청구 표준 양식. 증빙 첨부란 포함', category: '템플릿·양식', source: 'wiki', format: 'XLSX', fileSize: '75 KB', tags: ['경비', '청구', '양식'], author: '강회계', authorId: 'staff-25', createdAt: '2025-10-15', updatedAt: '2026-01-05', permission: 'staff', bookmarkCount: 15, viewCount: 152 },
    { id: 'wiki-t7', title: '콘텐츠 브리프 양식', description: '콘텐츠 제작 의뢰 시 사용하는 브리프 양식. 목적, 대상, 메시지, 참고자료 포함', category: '템플릿·양식', source: 'wiki', format: 'DOCX', fileSize: '110 KB', tags: ['콘텐츠', '브리프', '양식'], author: '김콘텐', authorId: 'staff-14', createdAt: '2026-01-05', updatedAt: '2026-02-20', permission: 'all', bookmarkCount: 20, viewCount: 118 },
    { id: 'wiki-t8', title: '미팅 회의록 양식', description: '회의 일시, 참석자, 안건, 결정사항, Action Item 기록 양식', category: '템플릿·양식', source: 'wiki', format: 'DOCX', fileSize: '85 KB', tags: ['회의록', '미팅', '양식'], author: '한비서', authorId: 'staff-35', createdAt: '2025-11-01', updatedAt: '2026-01-15', permission: 'all', bookmarkCount: 30, viewCount: 210 },

    // ── 레퍼런스·벤치마크 ──
    { id: 'wiki-r1', title: '대학내일 성장 스토리 분석', description: '대학내일의 창업부터 미디어 플랫폼 확장까지 성장 전략 분석. 커뮤니티 기반 사업 모델 벤치마크', category: '레퍼런스·벤치마크', source: 'wiki', format: 'URL', tags: ['벤치마크', '마케팅', '대학내일'], author: 'Cheonil Jeon', authorId: 'user-ceo', createdAt: '2026-01-10', updatedAt: '2026-03-05', permission: 'all', bookmarkCount: 24, viewCount: 128 },
    { id: 'wiki-r2', title: '글로벌 AI 아이돌 시장 현황 2026', description: 'AI 생성 아이돌/인플루언서 시장 규모, 주요 플레이어, 기술 동향, 수익 모델 분석', category: '레퍼런스·벤치마크', source: 'wiki', format: 'PDF', fileSize: '3.5 MB', tags: ['AI', 'LUKI', '시장분석'], author: '나세계', authorId: 'staff-28', createdAt: '2026-02-05', updatedAt: '2026-03-10', permission: 'all', bookmarkCount: 31, viewCount: 176 },
    { id: 'wiki-r3', title: '커뮤니티 플라이휠 모델 사례', description: 'Ten:One™ Wheel과 유사한 커뮤니티 플라이휠 사례. Reddit, Product Hunt, Notion 커뮤니티 분석', category: '레퍼런스·벤치마크', source: 'wiki', format: 'URL', tags: ['커뮤니티', '전략', '플라이휠'], author: '이수진', authorId: 'staff-22', createdAt: '2026-01-20', updatedAt: '2026-02-28', permission: 'all', bookmarkCount: 16, viewCount: 87 },
    { id: 'wiki-r4', title: 'Z세대 마케팅 트렌드 리포트', description: '2026년 Z세대 소비 트렌드, 미디어 소비 패턴, 커뮤니케이션 선호 채널 조사 리포트', category: '레퍼런스·벤치마크', source: 'wiki', format: 'PDF', fileSize: '4.8 MB', tags: ['트렌드', 'Z세대', '마케팅'], author: '유광고', authorId: 'staff-18', createdAt: '2026-02-10', updatedAt: '2026-03-12', permission: 'all', bookmarkCount: 27, viewCount: 163 },
    { id: 'wiki-r5', title: '프로스포츠 신인 드래프트 시스템 분석', description: 'MLB/NFL 드래프트와 HeRo DAM(Digital Asset Management) 비교. 인재 발굴 파이프라인 벤치마크', category: '레퍼런스·벤치마크', source: 'wiki', format: 'URL', tags: ['HeRo', 'DAM', '인재'], author: 'Cheonil Jeon', authorId: 'user-ceo', createdAt: '2026-01-15', updatedAt: '2026-02-20', permission: 'staff', bookmarkCount: 12, viewCount: 64 },
    { id: 'wiki-r7', title: '패션위크 네트워킹 플라이휠 벤치마크', description: '패션위크의 네트워킹 구조를 FWN(Fashion Week Network)에 적용하기 위한 분석 자료', category: '레퍼런스·벤치마크', source: 'wiki', format: 'URL', tags: ['FWN', '패션', '벤치마크'], author: '문스토', authorId: 'staff-32', createdAt: '2026-02-15', updatedAt: '2026-03-08', permission: 'all', bookmarkCount: 8, viewCount: 43 },

    // ── 브랜드·디자인 ──
    { id: 'wiki-03', title: 'Brand Gravity 브랜드 가이드라인', description: 'Brand Gravity 서비스 브랜딩 가이드. 로고, 색상, 타이포, 톤앤매너 정의', category: '브랜드·디자인', source: 'wiki', format: 'PDF', fileSize: '12.4 MB', tags: ['브랜딩', 'Brand Gravity', 'BI'], author: '이디자', authorId: 'staff-12', createdAt: '2026-01-20', updatedAt: '2026-03-05', permission: 'all', bookmarkCount: 15, viewCount: 98 },
    { id: 'wiki-t6', title: '브랜드 가이드라인 양식', description: '브랜드 BI 가이드라인 작성 양식. 로고, 색상, 서체, 적용 사례 포함', category: '브랜드·디자인', source: 'wiki', format: 'PDF', fileSize: '2.1 MB', tags: ['브랜딩', '가이드라인', 'BI'], author: '조브랜', authorId: 'staff-33', createdAt: '2025-12-10', updatedAt: '2026-02-01', permission: 'all', bookmarkCount: 25, viewCount: 135 },

    // ── 마케팅·콘텐츠 ──
    { id: 'wiki-08', title: 'SNS 콘텐츠 운영 매뉴얼', description: '인스타그램, 유튜브, TikTok 채널별 운영 가이드라인', category: '마케팅·콘텐츠', source: 'wiki', format: 'DOCX', fileSize: '2.3 MB', tags: ['SNS', '콘텐츠', '마케팅'], author: '유광고', authorId: 'staff-18', createdAt: '2026-02-15', updatedAt: '2026-03-08', permission: 'all', bookmarkCount: 17, viewCount: 121 },
    { id: 'wiki-t2', title: '클라이언트 제안서 양식 (SmarComm.)', description: 'SmarComm. 대행 제안서 표준 양식. 시장분석, 전략, 실행, 예산 섹션 포함', category: '마케팅·콘텐츠', source: 'wiki', format: 'PPTX', fileSize: '5.2 MB', tags: ['제안서', 'SmarComm.', '대행'], author: '한마케', authorId: 'staff-19', createdAt: '2026-01-01', updatedAt: '2026-03-05', permission: 'staff', bookmarkCount: 35, viewCount: 189 },

    // ── 커뮤니티·교육 ──
    { id: 'wiki-04', title: 'MADLeague 시즌 운영 매뉴얼', description: '전국 5개 동아리 연합 시즌 운영 가이드. 리제로스 포함', category: '커뮤니티·교육', source: 'wiki', format: 'DOCX', fileSize: '3.2 MB', tags: ['MADLeague', '리제로스', '커뮤니티'], author: '마리그', authorId: 'staff-20', createdAt: '2026-02-01', updatedAt: '2026-03-10', permission: 'all', bookmarkCount: 19, viewCount: 134 },
    { id: 'wiki-09', title: 'Badak 밋업 운영 가이드', description: 'Badak 네트워킹 밋업 기획부터 후기까지 전체 프로세스', category: '커뮤니티·교육', source: 'wiki', format: 'PDF', fileSize: '1.8 MB', tags: ['Badak', '네트워킹', '밋업'], author: '이수진', authorId: 'staff-22', createdAt: '2026-02-20', updatedAt: '2026-03-14', permission: 'all', bookmarkCount: 11, viewCount: 76 },
    { id: 'wiki-t3', title: '리제로스 경쟁PT 제안서 양식', description: 'MADLeague 리제로스 경쟁PT 참가 팀 제안서 양식. 심사 기준별 섹션 구성', category: '커뮤니티·교육', source: 'wiki', format: 'PPTX', fileSize: '3.8 MB', tags: ['리제로스', 'MADLeague', '경쟁PT'], author: '마리그', authorId: 'staff-20', createdAt: '2025-12-15', updatedAt: '2026-02-10', permission: 'all', bookmarkCount: 28, viewCount: 145 },
    { id: 'wiki-t9', title: '인사이트 투어링 보고서 양식', description: 'MADLeague 인사이트 투어링 결과 보고서 양식. 방문지, 인사이트, 액션아이템 포함', category: '커뮤니티·교육', source: 'wiki', format: 'PPTX', fileSize: '2.5 MB', tags: ['MADLeague', '인사이트', '보고서'], author: '강지역', authorId: 'staff-36', createdAt: '2026-01-20', updatedAt: '2026-03-01', permission: 'all', bookmarkCount: 10, viewCount: 62 },

    // ── 인사·재무 ──
    { id: 'wiki-07', title: '경비 정산 가이드', description: '경비 처리 절차, 증빙 요건, 법인카드 사용 기준 안내', category: '인사·재무', source: 'wiki', format: 'PDF', fileSize: '1.1 MB', tags: ['경비', '재무', '정산'], author: '강회계', authorId: 'staff-25', createdAt: '2026-01-25', updatedAt: '2026-02-28', permission: 'staff', bookmarkCount: 23, viewCount: 178 },

    // ── 기술·도구 ──
    { id: 'wiki-06', title: 'AI 이미지 생성 프롬프트 가이드', description: 'Midjourney, DALL·E, Stable Diffusion 프롬프트 작성법 및 실전 예시', category: '기술·도구', source: 'wiki', format: 'PDF', fileSize: '5.6 MB', tags: ['AI', '프롬프트', '이미지생성'], author: '조에이', authorId: 'staff-15', createdAt: '2026-02-10', updatedAt: '2026-03-15', permission: 'all', bookmarkCount: 52, viewCount: 312 },

    // ── 계약·법무 ──
    { id: 'wiki-t10', title: 'NDA (비밀유지계약서) 양식', description: '외부 파트너/클라이언트와의 NDA 표준 양식. 기밀정보 범위, 기간, 벌칙조항 포함', category: '계약·법무', source: 'wiki', format: 'PDF', fileSize: '180 KB', tags: ['NDA', '계약', '법무'], author: '이재무', authorId: 'staff-37', createdAt: '2025-10-01', updatedAt: '2026-01-20', permission: 'staff', bookmarkCount: 18, viewCount: 95 },

    // ═══════════════════════════════════════════════════
    // CMS Library
    // ═══════════════════════════════════════════════════
    { id: 'cms-01', title: 'Newsletter 발행 가이드', description: 'Ten:One™ Newsletter 작성 및 발행 프로세스. 디자인 템플릿 포함', category: '마케팅·콘텐츠', source: 'cms', format: 'PDF', fileSize: '3.4 MB', tags: ['뉴스레터', '발행', 'CMS'], author: '김콘텐', authorId: 'staff-14', createdAt: '2026-02-05', updatedAt: '2026-03-10', permission: 'staff', bookmarkCount: 8, viewCount: 54 },
    { id: 'cms-02', title: '콘텐츠 캘린더 템플릿 (2026 Q2)', description: '2분기 콘텐츠 발행 일정 템플릿. 채널별 주간 계획 포함', category: '템플릿·양식', source: 'cms', format: 'XLSX', fileSize: '89 KB', tags: ['캘린더', '일정', '콘텐츠'], author: '유광고', authorId: 'staff-18', createdAt: '2026-03-01', updatedAt: '2026-03-15', permission: 'staff', bookmarkCount: 12, viewCount: 67 },
    { id: 'cms-03', title: '브랜드별 톤앤매너 레퍼런스', description: 'LUKI, RooK, Badak 등 브랜드별 커뮤니케이션 톤앤매너 정리', category: '브랜드·디자인', source: 'cms', format: 'PDF', fileSize: '6.2 MB', tags: ['톤앤매너', '브랜드', '커뮤니케이션'], author: '이디자', authorId: 'staff-12', createdAt: '2026-01-30', updatedAt: '2026-03-05', permission: 'all', bookmarkCount: 20, viewCount: 143 },

    // ═══════════════════════════════════════════════════
    // Myverse Library (개인)
    // ═══════════════════════════════════════════════════
    { id: 'my-01', title: '브랜딩 전략 스터디 노트', description: '「브랜드의 탄생」 읽고 정리한 핵심 인사이트', category: '레퍼런스·벤치마크', source: 'myverse', format: 'DOCX', fileSize: '450 KB', tags: ['브랜딩', '스터디', '독서'], author: 'Cheonil Jeon', authorId: 'user-ceo', createdAt: '2026-03-05', updatedAt: '2026-03-05', permission: 'admin', bookmarkCount: 0, viewCount: 3 },
    { id: 'my-02', title: 'Q1 성과 보고 자료', description: '2026년 1분기 경영성과 내부 보고 자료', category: '전략·기획', source: 'myverse', format: 'PPTX', fileSize: '8.7 MB', tags: ['성과', '보고', 'Q1'], author: 'Cheonil Jeon', authorId: 'user-ceo', createdAt: '2026-03-18', updatedAt: '2026-03-18', permission: 'admin', bookmarkCount: 0, viewCount: 1 },
    { id: 'my-03', title: 'MADLeap 5기 커리큘럼 초안', description: 'MADLeap 5기 활동 커리큘럼 기획 초안', category: '커뮤니티·교육', source: 'myverse', format: 'DOCX', fileSize: '320 KB', tags: ['MADLeap', '커리큘럼', '기획'], author: 'Cheonil Jeon', authorId: 'user-ceo', createdAt: '2026-03-10', updatedAt: '2026-03-15', permission: 'admin', bookmarkCount: 0, viewCount: 5 },
];

export const initialBookmarks: LibraryBookmark[] = [
    { id: 'bm-01', userId: 'user-ceo', itemId: 'wiki-05', source: 'wiki', createdAt: '2026-03-10' },
    { id: 'bm-02', userId: 'user-ceo', itemId: 'wiki-06', source: 'wiki', createdAt: '2026-03-12' },
    { id: 'bm-03', userId: 'user-ceo', itemId: 'wiki-03', source: 'wiki', createdAt: '2026-03-14' },
    { id: 'bm-04', userId: 'user-ceo', itemId: 'cms-03', source: 'cms', createdAt: '2026-03-15' },
    { id: 'bm-05', userId: 'user-ceo', itemId: 'wiki-r2', source: 'wiki', createdAt: '2026-03-16' },
    { id: 'bm-06', userId: 'user-ceo', itemId: 'wiki-t1', source: 'wiki', createdAt: '2026-03-17' },
];
