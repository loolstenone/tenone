import { createClient } from "@/lib/supabase/client";

export type MontzCreatorType = "model" | "actor" | "both";
export type MontzAvailability = "active" | "selective" | "inactive";
export type MontzAuditionType = "드라마" | "영화" | "뮤지컬" | "모델" | "광고" | "CF" | "기타";

export interface MontzCreator {
    id: string;
    user_id: string | null;
    handle: string;
    display_name: string;
    type: MontzCreatorType;
    avatar_url: string | null;
    cover_url: string | null;
    bio: string | null;
    height: number | null;
    bust: number | null;
    waist: number | null;
    hip: number | null;
    shoe_size: number | null;
    hair_color: string | null;
    eye_color: string | null;
    availability_status: MontzAvailability;
    follower_count: number;
    work_count: number;
    is_verified: boolean;
    portfolio_links: string[];
    created_at: string;
}

export interface MontzWork {
    id: string;
    creator_id: string;
    creator?: Pick<MontzCreator, "handle" | "display_name" | "avatar_url">;
    title: string;
    description: string | null;
    category: string;
    images: string[];
    tags: string[];
    likes_count: number;
    is_featured: boolean;
    created_at: string;
}

export interface MontzAudition {
    id: string;
    company: string;
    role: string;
    type: MontzAuditionType;
    tags: string[];
    deadline: string;
    pay: string | null;
    href: string | null;
    contact_email: string;
    is_active: boolean;
    is_pinned: boolean;
    sort_order: number;
    created_at: string;
}

// ── mock data ────────────────────────────────────────────────────

const mockCreators: MontzCreator[] = [
    {
        id: "1", user_id: null, handle: "jiwon.oh", display_name: "오지원",
        type: "model",
        avatar_url: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=800&fit=crop&crop=faces",
        cover_url: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&h=400&fit=crop",
        bio: "패션 모델 / 런웨이 · 화보 전문. 서울 기반 활동 중.",
        height: 174, bust: 82, waist: 59, hip: 88, shoe_size: 250,
        hair_color: "검정", eye_color: "갈색",
        availability_status: "active", follower_count: 1240, work_count: 38,
        is_verified: true, portfolio_links: [], created_at: "2025-01-10T09:00:00Z",
    },
    {
        id: "2", user_id: null, handle: "minho.k", display_name: "강민호",
        type: "actor",
        avatar_url: "https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=600&h=800&fit=crop&crop=faces",
        cover_url: null,
        bio: "연극·영화 배우. 홍익대 연극학과 졸업.",
        height: 181, bust: 95, waist: 76, hip: 97, shoe_size: 275,
        hair_color: "검정", eye_color: "갈색",
        availability_status: "selective", follower_count: 890, work_count: 22,
        is_verified: false, portfolio_links: [], created_at: "2025-02-14T09:00:00Z",
    },
    {
        id: "3", user_id: null, handle: "sora.lee", display_name: "이소라",
        type: "both",
        avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=800&fit=crop&crop=faces",
        cover_url: null,
        bio: "모델 & 배우. CF · 드라마 출연 가능.",
        height: 169, bust: 83, waist: 61, hip: 90, shoe_size: 240,
        hair_color: "갈색", eye_color: "갈색",
        availability_status: "active", follower_count: 2100, work_count: 55,
        is_verified: true, portfolio_links: [], created_at: "2024-12-01T09:00:00Z",
    },
    {
        id: "4", user_id: null, handle: "jaemin.yoon", display_name: "윤재민",
        type: "model",
        avatar_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&h=800&fit=crop&crop=faces",
        cover_url: null,
        bio: "남성 패션 모델. 런웨이·에디토리얼.",
        height: 185, bust: 98, waist: 79, hip: 99, shoe_size: 280,
        hair_color: "검정", eye_color: "검정",
        availability_status: "active", follower_count: 3400, work_count: 67,
        is_verified: true, portfolio_links: [], created_at: "2024-09-20T09:00:00Z",
    },
    {
        id: "5", user_id: null, handle: "hyunjoo.b", display_name: "박현주",
        type: "actor",
        avatar_url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=800&fit=crop&crop=faces",
        cover_url: null,
        bio: "뮤지컬 배우. 한국예술종합학교 졸업.",
        height: 163, bust: 80, waist: 57, hip: 85, shoe_size: 235,
        hair_color: "검정", eye_color: "검정",
        availability_status: "selective", follower_count: 750, work_count: 18,
        is_verified: false, portfolio_links: [], created_at: "2025-03-05T09:00:00Z",
    },
    {
        id: "6", user_id: null, handle: "dayeon.m", display_name: "문다연",
        type: "model",
        avatar_url: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&h=800&fit=crop&crop=faces",
        cover_url: null,
        bio: "상업·잡지 모델. 뷰티·패션 전문.",
        height: 171, bust: 85, waist: 63, hip: 92, shoe_size: 250,
        hair_color: "갈색", eye_color: "갈색",
        availability_status: "active", follower_count: 1820, work_count: 44,
        is_verified: true, portfolio_links: [], created_at: "2025-01-22T09:00:00Z",
    },
    {
        id: "7", user_id: null, handle: "sungjun.c", display_name: "최성준",
        type: "actor",
        avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=800&fit=crop&crop=faces",
        cover_url: null,
        bio: "영화·드라마 배우. 단편 영화 주연 다수.",
        height: 178, bust: 93, waist: 74, hip: 95, shoe_size: 270,
        hair_color: "검정", eye_color: "갈색",
        availability_status: "inactive", follower_count: 310, work_count: 12,
        is_verified: false, portfolio_links: [], created_at: "2025-04-01T09:00:00Z",
    },
    {
        id: "8", user_id: null, handle: "nara.shin", display_name: "신나라",
        type: "both",
        avatar_url: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&h=800&fit=crop&crop=faces",
        cover_url: null,
        bio: "모델·배우. 광고·CF 전문.",
        height: 167, bust: 84, waist: 60, hip: 88, shoe_size: 245,
        hair_color: "검정", eye_color: "갈색",
        availability_status: "active", follower_count: 2680, work_count: 71,
        is_verified: true, portfolio_links: [], created_at: "2024-11-15T09:00:00Z",
    },
];

const mockWorks: MontzWork[] = [
    {
        id: "w1", creator_id: "1",
        title: "봄 에디토리얼", description: null, category: "에디토리얼",
        images: ["https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=800&fit=crop"],
        tags: ["패션", "봄"], likes_count: 42, is_featured: true, created_at: "2025-03-10T09:00:00Z",
    },
    {
        id: "w2", creator_id: "1",
        title: "모노크롬 화보", description: null, category: "화보",
        images: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop"],
        tags: ["흑백"], likes_count: 28, is_featured: false, created_at: "2025-02-20T09:00:00Z",
    },
    {
        id: "w3", creator_id: "1",
        title: "스트리트 룩", description: null, category: "스트리트",
        images: ["https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600&h=800&fit=crop"],
        tags: ["스트리트", "캐주얼"], likes_count: 35, is_featured: false, created_at: "2025-01-15T09:00:00Z",
    },
    {
        id: "w4", creator_id: "1",
        title: "Studio Portrait", description: null, category: "스튜디오",
        images: ["https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=600&h=800&fit=crop"],
        tags: ["포트레이트"], likes_count: 19, is_featured: false, created_at: "2024-12-01T09:00:00Z",
    },
    {
        id: "w5", creator_id: "3",
        title: "CF 비하인드", description: null, category: "광고",
        images: ["https://images.unsplash.com/photo-1558171813-0de32e9a6f43?w=600&h=800&fit=crop"],
        tags: ["CF", "광고"], likes_count: 61, is_featured: true, created_at: "2025-03-25T09:00:00Z",
    },
    {
        id: "w6", creator_id: "4",
        title: "런웨이 컷", description: null, category: "런웨이",
        images: ["https://images.unsplash.com/photo-1550614000-4895a10e1bfd?w=600&h=800&fit=crop"],
        tags: ["런웨이", "컬렉션"], likes_count: 88, is_featured: true, created_at: "2025-04-01T09:00:00Z",
    },
];

const mockAuditions: MontzAudition[] = [
    {
        id: "a1", company: "KBS 드라마국", role: "주인공 상대역 (여, 20대)", type: "드라마",
        tags: ["TV드라마", "정규직", "주연급"], deadline: "2025.05.31", pay: "협의",
        href: null, contact_email: "casting@kbs.co.kr",
        is_active: true, is_pinned: true, sort_order: 1, created_at: "2025-04-01T09:00:00Z",
    },
    {
        id: "a2", company: "CJ ENM", role: "뮤지컬 앙상블 오디션", type: "뮤지컬",
        tags: ["뮤지컬", "앙상블", "주 4회"], deadline: "2025.06.15", pay: "회당 20~35만원",
        href: null, contact_email: "audition@cjenm.com",
        is_active: true, is_pinned: false, sort_order: 10, created_at: "2025-04-10T09:00:00Z",
    },
    {
        id: "a3", company: "ELLE Korea", role: "패션 화보 모델 (여, 168cm+)", type: "모델",
        tags: ["패션잡지", "에디토리얼", "화보"], deadline: "상시", pay: "협의",
        href: null, contact_email: "casting@elle.co.kr",
        is_active: true, is_pinned: false, sort_order: 20, created_at: "2025-04-12T09:00:00Z",
    },
    {
        id: "a4", company: "롯데백화점", role: "봄 시즌 광고 모델 (남·여 각 1인)", type: "광고",
        tags: ["광고", "상업", "비주얼"], deadline: "2025.05.20", pay: "500만원 이상",
        href: null, contact_email: "pr@lotte.com",
        is_active: true, is_pinned: false, sort_order: 30, created_at: "2025-04-14T09:00:00Z",
    },
    {
        id: "a5", company: "독립영화사 청어람", role: "단편영화 주연 (남, 30대)", type: "영화",
        tags: ["단편", "독립영화", "주연"], deadline: "2025.05.10", pay: "교통비 지원",
        href: null, contact_email: "film@cheong.kr",
        is_active: true, is_pinned: false, sort_order: 40, created_at: "2025-04-15T09:00:00Z",
    },
    {
        id: "a6", company: "Samsung Electronics", role: "갤럭시 신제품 CF 모델", type: "CF",
        tags: ["CF", "테크", "글로벌"], deadline: "2025.05.05", pay: "1,000만원 이상",
        href: null, contact_email: "casting@samsung.com",
        is_active: true, is_pinned: false, sort_order: 50, created_at: "2025-04-16T09:00:00Z",
    },
];

// ── query functions ───────────────────────────────────────────────

export async function getFeaturedCreators(limit = 8): Promise<MontzCreator[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("montz_creators")
        .select("*")
        .eq("availability_status", "active")
        .order("follower_count", { ascending: false })
        .limit(limit);
    if (error || !data?.length) return mockCreators.filter((c) => c.availability_status === "active").slice(0, limit);
    return data;
}

export async function getAllCreators(type?: MontzCreatorType, availability?: MontzAvailability): Promise<MontzCreator[]> {
    const supabase = createClient();
    let query = supabase.from("montz_creators").select("*").order("follower_count", { ascending: false });
    if (type) query = query.eq("type", type);
    if (availability) query = query.eq("availability_status", availability);
    const { data, error } = await query;
    if (error || !data?.length) {
        let mock = [...mockCreators];
        if (type) mock = mock.filter((c) => c.type === type || c.type === "both");
        if (availability) mock = mock.filter((c) => c.availability_status === availability);
        return mock;
    }
    return data;
}

export async function getCreatorByHandle(handle: string): Promise<MontzCreator | null> {
    const supabase = createClient();
    const { data, error } = await supabase.from("montz_creators").select("*").eq("handle", handle).single();
    if (error || !data) return mockCreators.find((c) => c.handle === handle) ?? null;
    return data;
}

export async function getCreatorWorks(creatorId: string): Promise<MontzWork[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("montz_works")
        .select("*")
        .eq("creator_id", creatorId)
        .order("created_at", { ascending: false });
    if (error || !data?.length) return mockWorks.filter((w) => w.creator_id === creatorId);
    return data;
}

export async function getActiveAuditions(): Promise<MontzAudition[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("montz_auditions")
        .select("*")
        .eq("is_active", true)
        .order("sort_order")
        .order("created_at", { ascending: false });
    if (error || !data?.length) return mockAuditions;
    return data;
}
