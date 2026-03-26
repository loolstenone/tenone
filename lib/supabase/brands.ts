import { createClient } from './client';

export interface Brand {
  id: string;
  name: string;
  status: 'active' | 'dev' | 'incubating';
  modules: string[];
  settings: Record<string, unknown>;
  plan: 'free' | 'starter' | 'pro' | 'business' | 'enterprise';
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  brand_id: string;
  bio: string | null;
  tags: string[];
  custom_data: Record<string, unknown>;
  created_at: string;
}

// 전체 브랜드 목록 (active만)
export async function fetchActiveBrands(): Promise<Brand[]> {
  const sb = createClient();
  const { data } = await sb.from('brands').select('*').eq('status', 'active').order('name');
  return (data || []) as Brand[];
}

// 단일 브랜드 조회
export async function fetchBrand(brandId: string): Promise<Brand | null> {
  const sb = createClient();
  const { data } = await sb.from('brands').select('*').eq('id', brandId).single();
  return data as Brand | null;
}

// 브랜드가 특정 모듈을 가지고 있는지
export function brandHasModule(brand: Brand, moduleId: string): boolean {
  return brand.modules.includes(moduleId);
}

// 내 프로필 조회 (특정 브랜드)
export async function fetchMyProfile(brandId: string): Promise<Profile | null> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data } = await sb.from('profiles').select('*').eq('user_id', user.id).eq('brand_id', brandId).single();
  return data as Profile | null;
}

// 프로필 생성/업데이트
export async function upsertProfile(brandId: string, updates: Partial<Pick<Profile, 'bio' | 'tags' | 'custom_data'>>): Promise<Profile | null> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data } = await sb.from('profiles').upsert({
    user_id: user.id,
    brand_id: brandId,
    ...updates,
  }, { onConflict: 'user_id,brand_id' }).select().single();
  return data as Profile | null;
}
