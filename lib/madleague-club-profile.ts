/**
 * 동아리 소개 템플릿 검증 — 운영진이 보낸 값을 그대로 저장하지 않는다 (길이·개수·링크 형식)
 * 개인 휴대폰 번호는 받지 않는다: 연락은 대표 이메일·채널만 (학생 개인정보 공개 방지)
 */
import { CLUB_LIST_SECTIONS, type ClubProfile, type ClubRecruit } from '@/types/madleague-club-profile';

const PHONE_RE = /01[016789][-\s.]?\d{3,4}[-\s.]?\d{4}/;

function str(v: unknown, max: number): string | undefined {
  if (typeof v !== 'string') return undefined;
  const t = v.trim().slice(0, max);
  return t || undefined;
}

function url(v: unknown): string | undefined {
  const t = str(v, 500);
  if (!t) return undefined;
  try {
    const u = new URL(t);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : undefined;
  } catch { return undefined; }
}

export interface ProfileCheck { profile: ClubProfile; errors: string[] }

export function sanitizeClubProfile(input: unknown): ProfileCheck {
  const src = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const errors: string[] = [];
  const out: ClubProfile = {
    full_name: str(src.full_name, 80),
    slogan: str(src.slogan, 120),
    universities: str(src.universities, 300),
    intro: str(src.intro, 3000),
  };

  for (const sec of CLUB_LIST_SECTIONS) {
    const raw = Array.isArray(src[sec.key]) ? (src[sec.key] as unknown[]) : [];
    const rows: Record<string, string>[] = [];
    for (const item of raw.slice(0, sec.maxItems)) {
      if (!item || typeof item !== 'object') continue;
      const r = item as Record<string, unknown>;
      const row: Record<string, string> = {};
      for (const f of sec.fields) {
        const v = f.url ? url(r[f.key]) : str(r[f.key], f.max);
        if (f.url && str(r[f.key], 500) && !v) errors.push(`${sec.title}: 링크는 https:// 로 시작해야 합니다`);
        if (v) row[f.key] = v;
      }
      if (sec.fields.every(f => !row[f.key])) continue; // 빈 줄은 버린다
      const missing = sec.fields.filter(f => f.required && !row[f.key]);
      if (missing.length) { errors.push(`${sec.title}: ${missing.map(f => f.label).join('·')}을(를) 채워 주세요`); continue; }
      rows.push(row);
    }
    if (rows.length) (out as Record<string, unknown>)[sec.key] = rows;
  }

  const rec = (src.recruit && typeof src.recruit === 'object' ? src.recruit : {}) as Record<string, unknown>;
  const recruit: ClubRecruit = {
    status: rec.status === 'open' ? 'open' : rec.status === 'closed' ? 'closed' : undefined,
    period: str(rec.period, 60),
    target: str(rec.target, 300),
    process: str(rec.process, 1000),
    link: url(rec.link),
  };
  if (str(rec.link, 500) && !recruit.link) errors.push('모집 안내: 지원 링크는 https:// 로 시작해야 합니다');
  if (Object.values(recruit).some(Boolean)) out.recruit = recruit;

  const email = str(src.contact_email, 120);
  if (email) {
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) out.contact_email = email;
    else errors.push('대표 이메일 형식이 올바르지 않습니다');
  }

  // 공개 페이지에 개인 휴대폰 번호가 들어가지 않게
  if (PHONE_RE.test(JSON.stringify(out))) errors.push('휴대폰 번호는 공개 페이지에 올릴 수 없습니다 — 대표 이메일·채널을 이용해 주세요');

  // undefined 키 제거
  const clean = JSON.parse(JSON.stringify(out)) as ClubProfile;
  return { profile: clean, errors };
}

/** 수상 내역 최근 연도순 */
export function sortByYearDesc<T extends { year?: string }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => (b.year ?? '').localeCompare(a.year ?? '', 'en', { numeric: true }));
}
