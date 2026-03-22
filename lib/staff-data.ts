import { StaffMember, Division } from '@/types/staff';
import type { SystemAccess } from '@/types/auth';

export const initialStaff: StaffMember[] = [
    // ═══════════════════════════════════════════
    // CEO
    // ═══════════════════════════════════════════
    {
        id: 's1', employeeId: '2019-0001', name: 'Cheonil Jeon', email: 'lools@tenone.biz',
        role: 'Admin', accessLevel: ['project', 'erp-hr', 'erp-finance', 'erp-admin', 'marketing', 'wiki'],
        division: 'Management', department: '경영기획', position: '대표',
        brandAssociation: ['tenone', 'luki', 'rook', 'hero', 'badak', 'madleap', 'madleague', 'youinone', 'fwn', '0gamja'],
        startDate: '2019-10-01', status: 'Active', phone: '010-0000-0001',
        avatarInitials: 'CJ', bio: '가치로 연결된 세계관을 만드는 사람',
        goals: '10,000명의 기획자를 발굴하고 연결한다', values: '본질, 속도, 이행',
        createdAt: '2019-10-01', updatedAt: '2026-03-01',
    },

    // ═══════════════════════════════════════════
    // C-Level (CBO, CHO, CFO)
    // ═══════════════════════════════════════════
    {
        id: 's2', employeeId: '2022-0001', name: 'Sarah Kim', email: 'sarah@tenone.biz',
        role: 'Admin', accessLevel: ['project', 'erp-hr', 'marketing', 'wiki'],
        division: 'Business', department: '사업총괄', position: '이사',
        brandAssociation: ['luki', 'badak', 'madleague', 'youinone'],
        startDate: '2022-03-01', status: 'Active', phone: '010-0000-0002',
        avatarInitials: 'SK', bio: 'CBO · 최고사업책임자',
        goals: '신규 사업 3건 런칭', values: '연결, 확장',
        createdAt: '2022-03-01', updatedAt: '2026-03-01',
    },
    {
        id: 's3', employeeId: '2023-0001', name: '김인사', email: 'hr@tenone.biz',
        role: 'Admin', accessLevel: ['project', 'erp-hr', 'erp-admin', 'wiki'],
        division: 'Management', department: '인사총괄', position: '이사',
        brandAssociation: ['tenone'],
        startDate: '2023-01-02', status: 'Active', phone: '010-0000-0003',
        avatarInitials: '김', bio: 'CHO · 최고인사책임자',
        createdAt: '2023-01-02', updatedAt: '2026-03-01',
    },
    {
        id: 's4', employeeId: '2023-0002', name: '이재무', email: 'finance@tenone.biz',
        role: 'Admin', accessLevel: ['project', 'erp-finance', 'erp-admin', 'wiki'],
        division: 'Management', department: '재무총괄', position: '이사',
        brandAssociation: ['tenone'],
        startDate: '2023-01-02', status: 'Active', phone: '010-0000-0004',
        avatarInitials: '이', bio: 'CFO · 최고재무책임자',
        createdAt: '2023-01-02', updatedAt: '2026-03-01',
    },

    // ═══════════════════════════════════════════
    // Management Division (관리부서)
    // ═══════════════════════════════════════════

    // --- 경영기획팀 ---
    {
        id: 's5', employeeId: '2023-0003', name: '박기획', email: 'park.plan@tenone.biz',
        role: 'Manager', accessLevel: ['project', 'erp-hr', 'erp-finance', 'wiki'],
        division: 'Management', department: '경영기획', position: '팀장',
        brandAssociation: ['tenone'], startDate: '2023-02-01', status: 'Active',
        avatarInitials: '박', createdAt: '2023-02-01', updatedAt: '2026-01-15',
    },
    {
        id: 's6', employeeId: '2024-0001', name: '정전략', email: 'jung.strategy@tenone.biz',
        role: 'Editor', accessLevel: ['project', 'wiki'],
        division: 'Management', department: '경영기획', position: '매니저',
        brandAssociation: ['tenone'], startDate: '2024-01-02', status: 'Active',
        avatarInitials: '정', createdAt: '2024-01-02', updatedAt: '2026-01-15',
    },
    {
        id: 's7', employeeId: '2025-0001', name: '한비서', email: 'han.sec@tenone.biz',
        role: 'Viewer', accessLevel: ['project', 'wiki'],
        division: 'Management', department: '경영기획', position: '사원',
        brandAssociation: ['tenone'], startDate: '2025-01-02', status: 'Active',
        avatarInitials: '한', createdAt: '2025-01-02', updatedAt: '2026-01-15',
    },

    // --- 인사팀 ---
    {
        id: 's8', employeeId: '2023-0004', name: '박채용', email: 'park.hr@tenone.biz',
        role: 'Manager', accessLevel: ['project', 'erp-hr', 'wiki'],
        division: 'Management', department: '인사', position: '팀장',
        brandAssociation: ['tenone'], startDate: '2023-03-01', status: 'Active',
        avatarInitials: '박', createdAt: '2023-03-01', updatedAt: '2026-01-15',
    },
    {
        id: 's9', employeeId: '2024-0002', name: '최교육', email: 'choi.edu@tenone.biz',
        role: 'Editor', accessLevel: ['project', 'erp-hr', 'wiki'],
        division: 'Management', department: '인사', position: '매니저',
        brandAssociation: ['tenone'], startDate: '2024-02-01', status: 'Active',
        avatarInitials: '최', bio: '교육 프로그램 기획 담당',
        createdAt: '2024-02-01', updatedAt: '2026-01-15',
    },
    {
        id: 's10', employeeId: '2024-0003', name: '윤인재', email: 'yoon.talent@tenone.biz',
        role: 'Editor', accessLevel: ['project', 'erp-hr', 'wiki'],
        division: 'Management', department: '인사', position: '선임',
        brandAssociation: ['tenone', 'hero'], startDate: '2024-03-01', status: 'Active',
        avatarInitials: '윤', bio: '인재개발·Talent Pool 운영',
        createdAt: '2024-03-01', updatedAt: '2026-01-15',
    },
    {
        id: 's11', employeeId: '2025-0002', name: '임노무', email: 'lim.labor@tenone.biz',
        role: 'Viewer', accessLevel: ['erp-hr', 'wiki'],
        division: 'Management', department: '인사', position: '주임',
        brandAssociation: ['tenone'], startDate: '2025-02-01', status: 'Active',
        avatarInitials: '임', createdAt: '2025-02-01', updatedAt: '2026-01-15',
    },

    // --- 회계/재무팀 ---
    {
        id: 's12', employeeId: '2023-0005', name: '강회계', email: 'kang.acc@tenone.biz',
        role: 'Manager', accessLevel: ['project', 'erp-finance', 'wiki'],
        division: 'Management', department: '회계/재무', position: '팀장',
        brandAssociation: ['tenone'], startDate: '2023-04-01', status: 'Active',
        avatarInitials: '강', createdAt: '2023-04-01', updatedAt: '2026-01-15',
    },
    {
        id: 's13', employeeId: '2024-0004', name: '송세무', email: 'song.tax@tenone.biz',
        role: 'Editor', accessLevel: ['erp-finance', 'wiki'],
        division: 'Management', department: '회계/재무', position: '매니저',
        brandAssociation: ['tenone'], startDate: '2024-04-01', status: 'Active',
        avatarInitials: '송', createdAt: '2024-04-01', updatedAt: '2026-01-15',
    },
    {
        id: 's14', employeeId: '2025-0003', name: '오경리', email: 'oh.fin@tenone.biz',
        role: 'Viewer', accessLevel: ['erp-finance', 'wiki'],
        division: 'Management', department: '회계/재무', position: '사원',
        brandAssociation: ['tenone'], startDate: '2025-03-01', status: 'Active',
        avatarInitials: '오', createdAt: '2025-03-01', updatedAt: '2026-01-15',
    },

    // ═══════════════════════════════════════════
    // Business Division (사업부서)
    // ═══════════════════════════════════════════

    // --- 브랜드관리팀 ---
    {
        id: 's15', employeeId: '2023-0006', name: '조브랜', email: 'jo.brand@tenone.biz',
        role: 'Manager', accessLevel: ['project', 'marketing', 'wiki'],
        division: 'Business', department: '브랜드관리', position: '팀장',
        brandAssociation: ['tenone', 'luki', 'rook'], startDate: '2023-05-01', status: 'Active',
        avatarInitials: '조', bio: '브랜드 전략·세계관 설계',
        createdAt: '2023-05-01', updatedAt: '2026-01-15',
    },
    {
        id: 's16', employeeId: '2024-0005', name: '나세계', email: 'na.universe@tenone.biz',
        role: 'Editor', accessLevel: ['project', 'marketing', 'wiki'],
        division: 'Business', department: '브랜드관리', position: '매니저',
        brandAssociation: ['tenone', 'luki'], startDate: '2024-05-01', status: 'Active',
        avatarInitials: '나', bio: 'Universe 브랜드 기획',
        createdAt: '2024-05-01', updatedAt: '2026-01-15',
    },
    {
        id: 's17', employeeId: '2024-0006', name: '문스토', email: 'moon.story@tenone.biz',
        role: 'Editor', accessLevel: ['project', 'marketing', 'wiki'],
        division: 'Business', department: '브랜드관리', position: '선임',
        brandAssociation: ['0gamja', 'fwn'], startDate: '2024-06-01', status: 'Active',
        avatarInitials: '문', bio: '콘텐츠 브랜딩·스토리텔링',
        createdAt: '2024-06-01', updatedAt: '2026-01-15',
    },
    {
        id: 's18', employeeId: '2025-0004', name: '배비주', email: 'bae.visual@tenone.biz',
        role: 'Viewer', accessLevel: ['project', 'wiki'],
        division: 'Business', department: '브랜드관리', position: '주임',
        brandAssociation: ['luki', 'rook'], startDate: '2025-04-01', status: 'Active',
        avatarInitials: '배', createdAt: '2025-04-01', updatedAt: '2026-01-15',
    },

    // --- 파트너십팀 ---
    {
        id: 's19', employeeId: '2023-0007', name: '유파트', email: 'yoo.partner@tenone.biz',
        role: 'Manager', accessLevel: ['project', 'marketing', 'wiki'],
        division: 'Business', department: '파트너십', position: '팀장',
        brandAssociation: ['youinone', 'badak'], startDate: '2023-06-01', status: 'Active',
        avatarInitials: '유', bio: '기업 파트너십·Alliance 구축',
        createdAt: '2023-06-01', updatedAt: '2026-01-15',
    },
    {
        id: 's20', employeeId: '2024-0007', name: '김준호', email: 'official@madleap.co.kr',
        role: 'Editor', accessLevel: ['project', 'marketing', 'wiki'],
        division: 'Business', department: '파트너십', position: '매니저',
        brandAssociation: ['madleap', 'madleague', 'youinone'],
        startDate: '2024-07-01', status: 'Active', phone: '010-1234-5678',
        avatarInitials: 'JH', bio: 'MADLeap 출신, 파트너십 매니저',
        createdAt: '2024-07-01', updatedAt: '2026-01-15',
    },
    {
        id: 's21', employeeId: '2025-0005', name: '권제휴', email: 'kwon.biz@tenone.biz',
        role: 'Viewer', accessLevel: ['project', 'marketing', 'wiki'],
        division: 'Business', department: '파트너십', position: '사원',
        brandAssociation: ['badak'], startDate: '2025-05-01', status: 'Active',
        avatarInitials: '권', createdAt: '2025-05-01', updatedAt: '2026-01-15',
    },

    // --- 영업팀 ---
    {
        id: 's22', employeeId: '2023-0008', name: '한마케', email: 'han.sales@tenone.biz',
        role: 'Manager', accessLevel: ['project', 'marketing', 'wiki'],
        division: 'Business', department: '영업', position: '팀장',
        brandAssociation: ['tenone', 'hero'], startDate: '2023-07-01', status: 'Active',
        avatarInitials: '한', bio: '마케팅·세일즈 총괄',
        createdAt: '2023-07-01', updatedAt: '2026-01-15',
    },
    {
        id: 's23', employeeId: '2024-0008', name: '유광고', email: 'yoo.ads@tenone.biz',
        role: 'Editor', accessLevel: ['project', 'marketing', 'wiki'],
        division: 'Business', department: '영업', position: '매니저',
        brandAssociation: ['tenone'], startDate: '2024-08-01', status: 'Active',
        avatarInitials: '유', bio: '퍼포먼스 마케팅·리드 관리',
        createdAt: '2024-08-01', updatedAt: '2026-01-15',
    },
    {
        id: 's24', employeeId: '2024-0009', name: '서영업', email: 'seo.sales@tenone.biz',
        role: 'Editor', accessLevel: ['project', 'marketing', 'wiki'],
        division: 'Business', department: '영업', position: '선임',
        brandAssociation: ['hero'], startDate: '2024-09-01', status: 'Active',
        avatarInitials: '서', createdAt: '2024-09-01', updatedAt: '2026-01-15',
    },
    {
        id: 's25', employeeId: '2025-0006', name: '장클라', email: 'jang.client@tenone.biz',
        role: 'Viewer', accessLevel: ['project', 'marketing', 'wiki'],
        division: 'Business', department: '영업', position: '주임',
        brandAssociation: ['tenone'], startDate: '2025-06-01', status: 'Active',
        avatarInitials: '장', createdAt: '2025-06-01', updatedAt: '2026-01-15',
    },
    {
        id: 's26', employeeId: '2026-0001', name: '안세일', email: 'an.sales@tenone.biz',
        role: 'Viewer', accessLevel: ['marketing', 'wiki'],
        division: 'Business', department: '영업', position: '사원',
        brandAssociation: [], startDate: '2026-01-02', status: 'Active',
        avatarInitials: '안', createdAt: '2026-01-02', updatedAt: '2026-03-01',
    },

    // ═══════════════════════════════════════════
    // Production Division (제작부서)
    // ═══════════════════════════════════════════

    // --- 콘텐츠제작팀 ---
    {
        id: 's27', employeeId: '2023-0009', name: '김콘텐', email: 'kim.content@tenone.biz',
        role: 'Manager', accessLevel: ['project', 'marketing', 'wiki'],
        division: 'Production', department: '콘텐츠제작', position: '팀장',
        brandAssociation: ['luki', 'rook', '0gamja'], startDate: '2023-08-01', status: 'Active',
        avatarInitials: '김', bio: '콘텐츠 디렉터·영상/텍스트 총괄',
        createdAt: '2023-08-01', updatedAt: '2026-01-15',
    },
    {
        id: 's28', employeeId: '2024-0010', name: '이영상', email: 'lee.video@tenone.biz',
        role: 'Editor', accessLevel: ['project', 'wiki'],
        division: 'Production', department: '콘텐츠제작', position: '매니저',
        brandAssociation: ['luki'], startDate: '2024-03-01', status: 'Active',
        avatarInitials: '이', bio: '영상 PD·LUKI MV 제작',
        createdAt: '2024-03-01', updatedAt: '2026-01-15',
    },
    {
        id: 's29', employeeId: '2024-0011', name: '진작가', email: 'jin.writer@tenone.biz',
        role: 'Editor', accessLevel: ['project', 'wiki'],
        division: 'Production', department: '콘텐츠제작', position: '선임',
        brandAssociation: ['0gamja', 'badak'], startDate: '2024-04-01', status: 'Active',
        avatarInitials: '진', bio: '카피라이터·콘텐츠 작가',
        createdAt: '2024-04-01', updatedAt: '2026-01-15',
    },
    {
        id: 's30', employeeId: '2025-0007', name: '노편집', email: 'noh.edit@tenone.biz',
        role: 'Viewer', accessLevel: ['project', 'wiki'],
        division: 'Production', department: '콘텐츠제작', position: '주임',
        brandAssociation: ['luki'], startDate: '2025-07-01', status: 'Active',
        avatarInitials: '노', createdAt: '2025-07-01', updatedAt: '2026-01-15',
    },
    {
        id: 's31', employeeId: '2025-0008', name: '하촬영', email: 'ha.photo@tenone.biz',
        role: 'Viewer', accessLevel: ['project', 'wiki'],
        division: 'Production', department: '콘텐츠제작', position: '사원',
        brandAssociation: ['fwn'], startDate: '2025-08-01', status: 'Active',
        avatarInitials: '하', createdAt: '2025-08-01', updatedAt: '2026-01-15',
    },
    {
        id: 's32', employeeId: '2026-0002', name: '고인턴', email: 'go.intern1@tenone.biz',
        role: 'Viewer', accessLevel: ['wiki'],
        division: 'Production', department: '콘텐츠제작', position: '인턴',
        brandAssociation: [], startDate: '2026-03-01', status: 'Active',
        avatarInitials: '고', createdAt: '2026-03-01', updatedAt: '2026-03-01',
    },

    // --- 디자인팀 ---
    {
        id: 's33', employeeId: '2023-0010', name: '박디자', email: 'park.design@tenone.biz',
        role: 'Manager', accessLevel: ['project', 'wiki'],
        division: 'Production', department: '디자인', position: '팀장',
        brandAssociation: ['tenone', 'luki', 'fwn'], startDate: '2023-09-01', status: 'Active',
        avatarInitials: '박', bio: '크리에이티브 디렉터·BI/BX 설계',
        createdAt: '2023-09-01', updatedAt: '2026-01-15',
    },
    {
        id: 's34', employeeId: '2024-0012', name: '양그래', email: 'yang.graphic@tenone.biz',
        role: 'Editor', accessLevel: ['project', 'wiki'],
        division: 'Production', department: '디자인', position: '매니저',
        brandAssociation: ['luki', '0gamja'], startDate: '2024-05-01', status: 'Active',
        avatarInitials: '양', bio: '그래픽 디자이너·일러스트',
        createdAt: '2024-05-01', updatedAt: '2026-01-15',
    },
    {
        id: 's35', employeeId: '2024-0013', name: '류웹디', email: 'ryu.web@tenone.biz',
        role: 'Editor', accessLevel: ['project', 'wiki'],
        division: 'Production', department: '디자인', position: '선임',
        brandAssociation: ['tenone'], startDate: '2024-06-01', status: 'Active',
        avatarInitials: '류', bio: 'UI/UX 디자이너',
        createdAt: '2024-06-01', updatedAt: '2026-01-15',
    },
    {
        id: 's36', employeeId: '2025-0009', name: '민모션', email: 'min.motion@tenone.biz',
        role: 'Viewer', accessLevel: ['project', 'wiki'],
        division: 'Production', department: '디자인', position: '주임',
        brandAssociation: ['luki'], startDate: '2025-09-01', status: 'Active',
        avatarInitials: '민', bio: '모션그래픽·영상 디자인',
        createdAt: '2025-09-01', updatedAt: '2026-01-15',
    },

    // --- AI크리에이티브팀 ---
    {
        id: 's37', employeeId: '2024-0014', name: '조에이', email: 'jo.ai@tenone.biz',
        role: 'Manager', accessLevel: ['project', 'wiki'],
        division: 'Production', department: 'AI크리에이티브', position: '팀장',
        brandAssociation: ['rook', 'luki'], startDate: '2024-01-01', status: 'Active',
        avatarInitials: '조', bio: 'AI 엔지니어·RooK 개발 리드',
        createdAt: '2024-01-01', updatedAt: '2026-01-15',
    },
    {
        id: 's38', employeeId: '2024-0015', name: '신프롬', email: 'shin.prompt@tenone.biz',
        role: 'Editor', accessLevel: ['project', 'wiki'],
        division: 'Production', department: 'AI크리에이티브', position: '매니저',
        brandAssociation: ['rook', 'luki'], startDate: '2024-07-01', status: 'Active',
        avatarInitials: '신', bio: '프롬프트 엔지니어·AI 콘텐츠',
        createdAt: '2024-07-01', updatedAt: '2026-01-15',
    },
    {
        id: 's39', employeeId: '2025-0010', name: '천데이', email: 'chun.data@tenone.biz',
        role: 'Editor', accessLevel: ['project', 'wiki'],
        division: 'Production', department: 'AI크리에이티브', position: '선임',
        brandAssociation: ['rook'], startDate: '2025-01-01', status: 'Active',
        avatarInitials: '천', bio: '데이터 분석·AI 모델 학습',
        createdAt: '2025-01-01', updatedAt: '2026-01-15',
    },
    {
        id: 's40', employeeId: '2026-0003', name: '피인턴', email: 'pi.intern@tenone.biz',
        role: 'Viewer', accessLevel: ['wiki'],
        division: 'Production', department: 'AI크리에이티브', position: '인턴',
        brandAssociation: [], startDate: '2026-03-01', status: 'Active',
        avatarInitials: '피', createdAt: '2026-03-01', updatedAt: '2026-03-01',
    },

    // ═══════════════════════════════════════════
    // Support Division (지원부서)
    // ═══════════════════════════════════════════

    // --- 커뮤니티운영팀 ---
    {
        id: 's41', employeeId: '2023-0011', name: '이수진', email: 'lee.community@tenone.biz',
        role: 'Manager', accessLevel: ['project', 'marketing', 'wiki'],
        division: 'Support', department: '커뮤니티운영', position: '팀장',
        brandAssociation: ['badak', 'youinone'], startDate: '2023-10-01', status: 'Active',
        avatarInitials: '이', bio: '커뮤니티 매니저·Badak 운영 총괄',
        createdAt: '2023-10-01', updatedAt: '2026-01-15',
    },
    {
        id: 's42', employeeId: '2024-0016', name: '홍소통', email: 'hong.comm@tenone.biz',
        role: 'Editor', accessLevel: ['project', 'marketing', 'wiki'],
        division: 'Support', department: '커뮤니티운영', position: '매니저',
        brandAssociation: ['badak'], startDate: '2024-10-01', status: 'Active',
        avatarInitials: '홍', bio: '온라인 커뮤니티 관리·이벤트 기획',
        createdAt: '2024-10-01', updatedAt: '2026-01-15',
    },
    {
        id: 's43', employeeId: '2025-0011', name: '도운영', email: 'do.ops@tenone.biz',
        role: 'Viewer', accessLevel: ['project', 'wiki'],
        division: 'Support', department: '커뮤니티운영', position: '주임',
        brandAssociation: ['badak'], startDate: '2025-10-01', status: 'Active',
        avatarInitials: '도', createdAt: '2025-10-01', updatedAt: '2026-01-15',
    },

    // --- 교육(Evolution School)팀 ---
    {
        id: 's44', employeeId: '2024-0017', name: '구교수', email: 'gu.edu@tenone.biz',
        role: 'Manager', accessLevel: ['project', 'wiki'],
        division: 'Support', department: '교육(Evolution School)', position: '팀장',
        brandAssociation: ['tenone', 'hero'], startDate: '2024-01-01', status: 'Active',
        avatarInitials: '구', bio: 'Evolution School 기획·커리큘럼 설계',
        createdAt: '2024-01-01', updatedAt: '2026-01-15',
    },
    {
        id: 's45', employeeId: '2024-0018', name: '백강사', email: 'baek.trainer@tenone.biz',
        role: 'Editor', accessLevel: ['project', 'wiki'],
        division: 'Support', department: '교육(Evolution School)', position: '매니저',
        brandAssociation: ['tenone'], startDate: '2024-08-01', status: 'Active',
        avatarInitials: '백', bio: 'VRIEF·GPR 교육 전문',
        createdAt: '2024-08-01', updatedAt: '2026-01-15',
    },
    {
        id: 's46', employeeId: '2025-0012', name: '탁학습', email: 'tak.learn@tenone.biz',
        role: 'Viewer', accessLevel: ['project', 'wiki'],
        division: 'Support', department: '교육(Evolution School)', position: '선임',
        brandAssociation: ['hero'], startDate: '2025-02-01', status: 'Active',
        avatarInitials: '탁', createdAt: '2025-02-01', updatedAt: '2026-01-15',
    },

    // --- MADLeague운영팀 ---
    {
        id: 's47', employeeId: '2024-0019', name: '마리그', email: 'ma.league@tenone.biz',
        role: 'Manager', accessLevel: ['project', 'marketing', 'wiki'],
        division: 'Support', department: 'MADLeague운영', position: '팀장',
        brandAssociation: ['madleague', 'madleap'], startDate: '2024-02-01', status: 'Active',
        avatarInitials: '마', bio: 'MADLeague 전국 운영 총괄',
        createdAt: '2024-02-01', updatedAt: '2026-01-15',
    },
    {
        id: 's48', employeeId: '2024-0020', name: '리멘토', email: 'lee.mentor@tenone.biz',
        role: 'Editor', accessLevel: ['project', 'marketing', 'wiki'],
        division: 'Support', department: 'MADLeague운영', position: '매니저',
        brandAssociation: ['madleague'], startDate: '2024-09-01', status: 'Active',
        avatarInitials: '리', bio: '멘토단 관리·리제로스 운영',
        createdAt: '2024-09-01', updatedAt: '2026-01-15',
    },
    {
        id: 's49', employeeId: '2025-0013', name: '강지역', email: 'kang.region@tenone.biz',
        role: 'Viewer', accessLevel: ['project', 'wiki'],
        division: 'Support', department: 'MADLeague운영', position: '주임',
        brandAssociation: ['madleague'], startDate: '2025-03-01', status: 'Active',
        avatarInitials: '강', bio: '지역 동아리 네트워킹·인사이트 투어링',
        createdAt: '2025-03-01', updatedAt: '2026-01-15',
    },
    {
        id: 's50', employeeId: '2026-0004', name: '루인턴', email: 'lu.intern@tenone.biz',
        role: 'Viewer', accessLevel: ['wiki'],
        division: 'Support', department: 'MADLeague운영', position: '인턴',
        brandAssociation: [], startDate: '2026-03-01', status: 'Active',
        avatarInitials: '루', createdAt: '2026-03-01', updatedAt: '2026-03-01',
    },
];

// 조직 구조
export const divisions: { id: Division; name: string; departments: string[] }[] = [
    { id: 'Management', name: '관리부서', departments: ['경영기획', '인사', '회계/재무'] },
    { id: 'Business', name: '사업부서', departments: ['브랜드관리', '파트너십', '영업'] },
    { id: 'Production', name: '제작부서', departments: ['콘텐츠제작', '디자인', 'AI크리에이티브'] },
    { id: 'Support', name: '지원부서', departments: ['커뮤니티운영', '교육(Evolution School)', 'MADLeague운영'] },
];

export const positions = ['대표', '이사', '팀장', '매니저', '선임', '주임', '사원', '인턴'];

// 부문별 기본 권한
export const divisionDefaultAccess: Record<Division, SystemAccess[]> = {
    Management: ['project', 'erp-hr', 'erp-finance', 'wiki'],
    Business: ['project', 'marketing', 'wiki'],
    Production: ['project', 'wiki'],
    Support: ['project', 'marketing', 'wiki'],
};

export const accessOptions = [
    { id: 'project', label: 'Project', desc: '프로젝트 관리, 스튜디오, 워크플로우' },
    { id: 'erp-hr', label: 'ERP · HR', desc: '인력관리, 목표/성과, 근태, 급여' },
    { id: 'erp-finance', label: 'ERP · Finance', desc: '경비, 법인카드, 청구/지급' },
    { id: 'erp-admin', label: 'ERP · Admin', desc: '시스템 설정, 권한 관리, 전체 데이터 접근' },
    { id: 'marketing', label: 'Marketing', desc: '캠페인, 리드, 딜, 콘텐츠 마케팅' },
    { id: 'wiki', label: 'Wiki', desc: '사내 위키 열람 및 편집' },
];

export const brandOptions = [
    { id: 'tenone', name: 'Ten:One™', logo: '/logos/tenone.png' },
    { id: 'luki', name: 'LUKI', logo: '/logos/luki.png' },
    { id: 'rook', name: 'RooK', logo: '/logos/rook.png' },
    { id: 'hero', name: 'HeRo', logo: '/logos/hero.png' },
    { id: 'badak', name: 'Badak', logo: '/logos/badak.png' },
    { id: 'madleap', name: 'MADLeap', logo: '/logos/madleap.png' },
    { id: 'madleague', name: 'MADLeague', logo: '/logos/madleague.png' },
    { id: 'youinone', name: 'YouInOne', logo: '/logos/youinone.png' },
    { id: 'fwn', name: 'FWN', logo: '/logos/fwn.png' },
    { id: '0gamja', name: '0gamja', logo: '/logos/0gamja.png' },
];
