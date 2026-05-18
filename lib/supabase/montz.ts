import { createClient } from "@/lib/supabase/client";

export type MontzCreatorType = "model" | "actor" | "both";
export type MontzAvailability = "active" | "selective" | "inactive";
export type MontzAuditionType = "드라마" | "영화" | "뮤지컬" | "모델" | "광고" | "CF" | "기타";
export type MontzGender = "female" | "male";
export type MontzAgeGroup = "어린이" | "10대" | "20~30대" | "40~50대" | "60대+";
export type MontzSpecialty = "전신" | "부분" | "피팅" | "나레이터";

export type MontzHeroMode = "latest" | "followers" | "verified" | "manual";

export interface MontzCreator {
    id: string;
    user_id: string | null;
    handle: string;
    display_name: string;
    type: MontzCreatorType;
    gender: MontzGender | null;
    age_group: MontzAgeGroup | null;
    specialties: MontzSpecialty[];
    avatar_url: string | null;
    cover_url: string | null;
    bio: string | null;
    height: number | null;
    // 몸무게: 본인이 공개 동의한 경우에만 표시 (show_weight=true)
    weight: number | null;
    show_weight: boolean;
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
    birth_year: number | null;
    birth_month: number | null;
    description: string | null;
    career: string | null;
    tags: string[];
    portfolio_links: string[];
    is_hero: boolean;
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

const MOCK_DEFAULTS = { birth_year: null, birth_month: null, description: null, career: null, tags: [] };

const mockCreators: MontzCreator[] = ([
    {
        id: "1", user_id: null, handle: "jiwon.oh", display_name: "오지원",
        type: "model", gender: "female", age_group: "20~30대",
        specialties: ["전신", "피팅"],
        avatar_url: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=800&fit=crop&crop=faces",
        cover_url: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&h=400&fit=crop",
        bio: "패션 모델 / 런웨이 · 화보 전문. 서울 기반 활동 중.",
        height: 174, weight: null, show_weight: false,
        bust: 82, waist: 59, hip: 88, shoe_size: 250,
        hair_color: "검정", eye_color: "갈색",
        availability_status: "active", follower_count: 1240, work_count: 38,
        is_verified: true, portfolio_links: [], is_hero: false, created_at: "2025-01-10T09:00:00Z",
    },
    {
        id: "2", user_id: null, handle: "minho.k", display_name: "강민호",
        type: "actor", gender: "male", age_group: "20~30대",
        specialties: ["전신", "나레이터"],
        avatar_url: "https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=600&h=800&fit=crop&crop=faces",
        cover_url: null,
        bio: "연극·영화 배우. 홍익대 연극학과 졸업.",
        height: 181, weight: 75, show_weight: true,
        bust: null, waist: null, hip: null, shoe_size: 275,
        hair_color: "검정", eye_color: "갈색",
        availability_status: "selective", follower_count: 890, work_count: 22,
        is_verified: false, portfolio_links: [], is_hero: false, created_at: "2025-02-14T09:00:00Z",
    },
    {
        id: "3", user_id: null, handle: "sora.lee", display_name: "이소라",
        type: "both", gender: "female", age_group: "20~30대",
        specialties: ["전신", "피팅", "나레이터"],
        avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=800&fit=crop&crop=faces",
        cover_url: null,
        bio: "모델 & 배우. CF · 드라마 출연 가능.",
        height: 169, weight: null, show_weight: false,
        bust: 83, waist: 61, hip: 90, shoe_size: 240,
        hair_color: "갈색", eye_color: "갈색",
        availability_status: "active", follower_count: 2100, work_count: 55,
        is_verified: true, portfolio_links: [], is_hero: false, created_at: "2024-12-01T09:00:00Z",
    },
    {
        id: "4", user_id: null, handle: "jaemin.yoon", display_name: "윤재민",
        type: "model", gender: "male", age_group: "20~30대",
        specialties: ["전신", "피팅"],
        avatar_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&h=800&fit=crop&crop=faces",
        cover_url: null,
        bio: "남성 패션 모델. 런웨이·에디토리얼.",
        height: 185, weight: 78, show_weight: true,
        bust: null, waist: null, hip: null, shoe_size: 280,
        hair_color: "검정", eye_color: "검정",
        availability_status: "active", follower_count: 3400, work_count: 67,
        is_verified: true, portfolio_links: [], is_hero: false, created_at: "2024-09-20T09:00:00Z",
    },
    {
        id: "5", user_id: null, handle: "hyunjoo.b", display_name: "박현주",
        type: "actor", gender: "female", age_group: "20~30대",
        specialties: ["전신", "부분"],
        avatar_url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=800&fit=crop&crop=faces",
        cover_url: null,
        bio: "뮤지컬 배우. 한국예술종합학교 졸업.",
        height: 163, weight: null, show_weight: false,
        bust: 80, waist: 57, hip: 85, shoe_size: 235,
        hair_color: "검정", eye_color: "검정",
        availability_status: "selective", follower_count: 750, work_count: 18,
        is_verified: false, portfolio_links: [], is_hero: false, created_at: "2025-03-05T09:00:00Z",
    },
    {
        id: "6", user_id: null, handle: "dayeon.m", display_name: "문다연",
        type: "model", gender: "female", age_group: "20~30대",
        specialties: ["부분", "피팅"],
        avatar_url: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&h=800&fit=crop&crop=faces",
        cover_url: null,
        bio: "상업·잡지 모델. 뷰티·패션 전문.",
        height: 171, weight: null, show_weight: false,
        bust: 85, waist: 63, hip: 92, shoe_size: 250,
        hair_color: "갈색", eye_color: "갈색",
        availability_status: "active", follower_count: 1820, work_count: 44,
        is_verified: true, portfolio_links: [], is_hero: false, created_at: "2025-01-22T09:00:00Z",
    },
    {
        id: "7", user_id: null, handle: "sungjun.c", display_name: "최성준",
        type: "actor", gender: "male", age_group: "40~50대",
        specialties: ["전신", "나레이터"],
        avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=800&fit=crop&crop=faces",
        cover_url: null,
        bio: "영화·드라마 배우. 단편 영화 주연 다수.",
        height: 178, weight: 72, show_weight: true,
        bust: null, waist: null, hip: null, shoe_size: 270,
        hair_color: "검정", eye_color: "갈색",
        availability_status: "inactive", follower_count: 310, work_count: 12,
        is_verified: false, portfolio_links: [], is_hero: false, created_at: "2025-04-01T09:00:00Z",
    },
    {
        id: "8", user_id: null, handle: "nara.shin", display_name: "신나라",
        type: "both", gender: "female", age_group: "20~30대",
        specialties: ["피팅", "나레이터"],
        avatar_url: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&h=800&fit=crop&crop=faces",
        cover_url: null,
        bio: "모델·배우. 광고·CF 전문.",
        height: 167, weight: null, show_weight: false,
        bust: 84, waist: 60, hip: 88, shoe_size: 245,
        hair_color: "검정", eye_color: "갈색",
        availability_status: "active", follower_count: 2680, work_count: 71,
        is_verified: true, portfolio_links: [], is_hero: false, created_at: "2024-11-15T09:00:00Z",
    },
] as Omit<MontzCreator, "birth_year"|"birth_month"|"description"|"career"|"tags">[]).map((c) => ({
    ...MOCK_DEFAULTS, ...c,
})) as MontzCreator[];

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

export async function getCreatorsPaged(offset: number, limit = 12): Promise<{ creators: MontzCreator[]; hasMore: boolean }> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("montz_creators")
        .select("*")
        .order("follower_count", { ascending: false })
        .range(offset, offset + limit - 1);
    if (error || !data) {
        const sliced = mockCreators.slice(offset, offset + limit);
        return { creators: sliced, hasMore: offset + limit < mockCreators.length };
    }
    return { creators: data, hasMore: data.length === limit };
}

export interface CreatorFilters {
    type?: MontzCreatorType;
    gender?: MontzGender;
    ageGroup?: MontzAgeGroup;
    specialty?: MontzSpecialty;
}

export async function getAllCreators(filters: CreatorFilters = {}): Promise<MontzCreator[]> {
    const supabase = createClient();
    let query = supabase.from("montz_creators").select("*").order("follower_count", { ascending: false });
    if (filters.type) query = query.eq("type", filters.type);
    if (filters.gender) query = query.eq("gender", filters.gender);
    if (filters.ageGroup) query = query.eq("age_group", filters.ageGroup);
    if (filters.specialty) query = query.contains("specialties", [filters.specialty]);
    const { data, error } = await query;
    if (error) {
        let mock = [...mockCreators];
        if (filters.type) mock = mock.filter((c) => c.type === filters.type || c.type === "both");
        if (filters.gender) mock = mock.filter((c) => c.gender === filters.gender);
        if (filters.ageGroup) mock = mock.filter((c) => c.age_group === filters.ageGroup);
        if (filters.specialty) mock = mock.filter((c) => c.specialties.includes(filters.specialty!));
        return mock;
    }
    return data ?? [];
}

export async function getCreatorByUserId(userId: string): Promise<MontzCreator | null> {
    const supabase = createClient();
    const { data, error } = await supabase.from("montz_creators").select("*").eq("user_id", userId).single();
    if (error || !data) return null;
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

export async function getHeroCreator(): Promise<MontzCreator | null> {
    const supabase = createClient();
    // 수동 지정된 히어로 먼저
    const { data: hero } = await supabase
        .from("montz_creators")
        .select("*")
        .eq("is_hero", true)
        .single();
    if (hero) return hero;
    // 폴백: 팔로워 최다
    const { data } = await supabase
        .from("montz_creators")
        .select("*")
        .order("follower_count", { ascending: false })
        .limit(1)
        .single();
    return data ?? mockCreators[0] ?? null;
}

export async function setHeroCreator(creatorId: string): Promise<void> {
    const supabase = createClient();
    await supabase.from("montz_creators").update({ is_hero: false }).neq("id", creatorId);
    await supabase.from("montz_creators").update({ is_hero: true }).eq("id", creatorId);
}

// ── admin functions ───────────────────────────────────────────────

export async function getAllMontzCreatorsAdmin(): Promise<MontzCreator[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("montz_creators")
        .select("*")
        .order("created_at", { ascending: false });
    if (error) return mockCreators;
    return data ?? [];
}

export async function getAllMontzAuditions(): Promise<MontzAudition[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("montz_auditions")
        .select("*")
        .order("sort_order")
        .order("created_at", { ascending: false });
    if (error) return mockAuditions;
    return data ?? [];
}

export async function upsertMontzAudition(
    draft: Omit<MontzAudition, "created_at"> & { id?: string }
): Promise<MontzAudition | null> {
    const supabase = createClient();
    const { id, ...rest } = draft;
    if (id) {
        const { data } = await supabase.from("montz_auditions").update(rest).eq("id", id).select().single();
        return data ?? null;
    }
    const { data } = await supabase.from("montz_auditions").insert(rest).select().single();
    return data ?? null;
}

export async function deleteMontzAudition(id: string): Promise<void> {
    const supabase = createClient();
    await supabase.from("montz_auditions").delete().eq("id", id);
}

// ── 작품 업로드 (공급자: 모델·배우) ─────────────────────────────────

/** 클라이언트에서 이미지를 montz-works 버킷에 업로드하고 public URL 반환 */
export async function uploadWorkImage(userId: string, file: File): Promise<string> {
    const supabase = createClient();
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("montz-works").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
    });
    if (error) throw new Error(`업로드 실패: ${error.message}`);
    const { data } = supabase.storage.from("montz-works").getPublicUrl(path);
    return data.publicUrl;
}

export interface CreateWorkInput {
    title: string;
    description?: string;
    category: string;
    images: string[];      // 업로드된 이미지 URL 배열
    tags?: string[];
}

/** 본인 montz_creators 레코드를 찾아 작품 INSERT. 크리에이터 없으면 에러. */
export async function createMyWork(userId: string, input: CreateWorkInput): Promise<MontzWork> {
    const supabase = createClient();
    const creator = await getCreatorByUserId(userId);
    if (!creator) throw new Error("크리에이터 프로필이 없습니다. 먼저 프로필을 등록해주세요.");

    const { data, error } = await supabase
        .from("montz_works")
        .insert({
            creator_id: creator.id,
            title: input.title,
            description: input.description ?? null,
            category: input.category,
            images: input.images,
            tags: input.tags ?? [],
        })
        .select()
        .single();

    if (error || !data) throw new Error(`작품 등록 실패: ${error?.message ?? "unknown"}`);
    return data as MontzWork;
}

/** 본인 작품 목록 (최신순) */
export async function getMyWorks(userId: string): Promise<MontzWork[]> {
    const supabase = createClient();
    const creator = await getCreatorByUserId(userId);
    if (!creator) return [];
    const { data, error } = await supabase
        .from("montz_works")
        .select("*")
        .eq("creator_id", creator.id)
        .order("created_at", { ascending: false });
    if (error) return [];
    return (data ?? []) as MontzWork[];
}

/** 본인 작품 삭제 (creator_id 일치 검증) */
export async function deleteMyWork(userId: string, workId: string): Promise<void> {
    const supabase = createClient();
    const creator = await getCreatorByUserId(userId);
    if (!creator) throw new Error("크리에이터 프로필이 없습니다.");
    const { error } = await supabase
        .from("montz_works")
        .delete()
        .eq("id", workId)
        .eq("creator_id", creator.id);
    if (error) throw new Error(`삭제 실패: ${error.message}`);
}

// ── 캐스팅 컨택 (수요자: 캐스팅 디렉터 → 모델·배우) ────────────────

export interface MontzContactRequest {
    id: string;
    target_creator_id: string;
    sender_user_id: string | null;
    sender_name: string;
    sender_email: string;
    sender_company: string | null;
    role_title: string | null;
    message: string;
    status: "pending" | "seen" | "accepted" | "declined";
    created_at: string;
    responded_at: string | null;
    // 조인용
    target?: Pick<MontzCreator, "handle" | "display_name">;
}

export interface SendContactInput {
    targetCreatorId: string;
    senderName: string;
    senderEmail: string;
    senderCompany?: string;
    roleTitle?: string;
    message: string;
}

/** 캐스팅 제안 발송 — 비로그인 캐스팅 디렉터도 가능. 본인이면 user_id 자동 첨부. */
export async function sendContactRequest(input: SendContactInput): Promise<MontzContactRequest> {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id ?? null;

    const { data, error } = await supabase
        .from("montz_contact_requests")
        .insert({
            target_creator_id: input.targetCreatorId,
            sender_user_id: userId,
            sender_name: input.senderName,
            sender_email: input.senderEmail,
            sender_company: input.senderCompany ?? null,
            role_title: input.roleTitle ?? null,
            message: input.message,
            status: "pending",
        })
        .select()
        .single();

    if (error || !data) throw new Error(`전송 실패: ${error?.message ?? "unknown"}`);
    return data as MontzContactRequest;
}

/** 본인이 받은 캐스팅 제안 목록 (모델·배우 본인 my 페이지용) */
export async function getMyReceivedContacts(userId: string): Promise<MontzContactRequest[]> {
    const supabase = createClient();
    const creator = await getCreatorByUserId(userId);
    if (!creator) return [];
    const { data, error } = await supabase
        .from("montz_contact_requests")
        .select("*")
        .eq("target_creator_id", creator.id)
        .order("created_at", { ascending: false });
    if (error) return [];
    return (data ?? []) as MontzContactRequest[];
}

/** 받은 컨택 상태 변경 (seen / accepted / declined) */
export async function updateContactStatus(
    userId: string,
    contactId: string,
    status: "seen" | "accepted" | "declined",
): Promise<void> {
    const supabase = createClient();
    const creator = await getCreatorByUserId(userId);
    if (!creator) throw new Error("권한 없음");
    const patch: Record<string, unknown> = { status };
    if (status !== "seen") patch.responded_at = new Date().toISOString();
    const { error } = await supabase
        .from("montz_contact_requests")
        .update(patch)
        .eq("id", contactId)
        .eq("target_creator_id", creator.id);
    if (error) throw new Error(`상태 변경 실패: ${error.message}`);
}

// ── 오디션 신청 (공급자: 모델·배우 → 오디션 공고) ───────────────────

export interface MontzApplication {
    id: string;
    audition_id: string;
    creator_id: string;
    message: string | null;
    status: "pending" | "seen" | "shortlisted" | "rejected" | "cast";
    applicant_email: string | null;
    created_at: string;
    reviewed_at: string | null;
    // 조인용
    audition?: Pick<MontzAudition, "company" | "role" | "type" | "deadline">;
}

export interface ApplyAuditionInput {
    auditionId: string;
    message?: string;
    applicantEmail?: string;     // 캐스팅 디렉터 컨택용 (선택, auth 이메일 fallback)
}

/** 본인이 오디션에 신청 (UNIQUE audition_id+creator_id로 중복 방지) */
export async function applyAudition(userId: string, input: ApplyAuditionInput): Promise<MontzApplication> {
    const supabase = createClient();
    const creator = await getCreatorByUserId(userId);
    if (!creator) throw new Error("크리에이터 프로필이 필요합니다.");

    // auth.user.email 폴백
    let email = input.applicantEmail;
    if (!email) {
        const { data: userData } = await supabase.auth.getUser();
        email = userData.user?.email ?? undefined;
    }

    const { data, error } = await supabase
        .from("montz_audition_applications")
        .insert({
            audition_id: input.auditionId,
            creator_id: creator.id,
            message: input.message ?? null,
            applicant_email: email ?? null,
            status: "pending",
        })
        .select()
        .single();

    if (error || !data) {
        if (error?.code === "23505") throw new Error("이미 신청하신 오디션입니다.");
        throw new Error(`신청 실패: ${error?.message ?? "unknown"}`);
    }
    return data as MontzApplication;
}

/** 본인이 신청한 오디션 목록 */
export async function getMyApplications(userId: string): Promise<MontzApplication[]> {
    const supabase = createClient();
    const creator = await getCreatorByUserId(userId);
    if (!creator) return [];
    const { data, error } = await supabase
        .from("montz_audition_applications")
        .select(`*, audition:montz_auditions(company, role, type, deadline)`)
        .eq("creator_id", creator.id)
        .order("created_at", { ascending: false });
    if (error) return [];
    return (data ?? []) as MontzApplication[];
}
