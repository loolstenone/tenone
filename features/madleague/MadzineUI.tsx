import Link from 'next/link';
import { madzineCategoryLabel } from '@/lib/madzine-categories';

/**
 * MADzine 에디토리얼 디자인 공통 — 목록·기사·관련 글이 같은 규칙을 쓴다
 * 검정 바탕 · 세리프 헤드라인(--font-mz-display/--font-mz-serif, madzine/layout.tsx) · 자간 넓은 대문자 라벨 · 얇은 선 · 레드 포인트 · 둥근 모서리 없음
 */

export const MZ_SERIF = 'font-[family-name:var(--font-mz-serif)] break-keep';
export const MZ_DISPLAY = 'font-[family-name:var(--font-mz-display)]';
export const MZ_KICKER = 'text-[11px] font-bold tracking-[0.3em] uppercase';
export const MZ_RULE = 'border-white/15';

export interface MadzineCardArticle {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  excerpt?: string | null;
  category: string;
  thumbnail_url: string | null;
  published_at: string;
}

export function formatMzDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function Thumb({ src, alt, ratio, category }: { src: string | null; alt: string; ratio: string; category: string }) {
  return (
    <div className={`${ratio} bg-neutral-900 overflow-hidden`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover grayscale-[15%] group-hover:grayscale-0 group-hover:scale-[1.03] transition duration-700" />
      ) : (
        <div className={`h-full w-full flex items-center justify-center text-neutral-700 text-3xl italic ${MZ_DISPLAY}`}>
          {madzineCategoryLabel(category)}
        </div>
      )}
    </div>
  );
}

/** 세로형(4:5) 기사 카드 — 목록 그리드·관련 글 공통 */
export function MadzineCard({ article, index }: { article: MadzineCardArticle; index?: number }) {
  const blurb = article.subtitle ?? article.excerpt;
  return (
    <Link href={`/madleague/madzine/${article.slug}`} className="group block">
      <Thumb src={article.thumbnail_url} alt={article.title} ratio="aspect-[4/5]" category={article.category} />
      <div className="mt-5 flex items-baseline gap-3">
        {index !== undefined && (
          <span className={`text-sm italic text-neutral-500 ${MZ_DISPLAY}`}>{String(index).padStart(2, '0')}</span>
        )}
        <span className={`${MZ_KICKER} text-[#EC1D25]`}>{madzineCategoryLabel(article.category)}</span>
      </div>
      <h3 className={`mt-3 text-xl leading-snug font-bold text-white group-hover:text-[#EC1D25] transition ${MZ_SERIF}`}>
        {article.title}
      </h3>
      {blurb && <p className="mt-3 text-sm leading-relaxed text-neutral-400 line-clamp-2">{blurb}</p>}
      <div className="mt-4 text-[11px] tracking-[0.2em] text-neutral-500">{formatMzDate(article.published_at)}</div>
    </Link>
  );
}

/** 썸네일 왼쪽·텍스트 오른쪽 카드 — 커버 옆 세컨드 스토리 */
export function MadzineSideCard({ article }: { article: MadzineCardArticle }) {
  return (
    <Link href={`/madleague/madzine/${article.slug}`} className="group grid grid-cols-5 gap-5 items-start">
      <div className="col-span-2">
        <Thumb src={article.thumbnail_url} alt={article.title} ratio="aspect-[4/5]" category={article.category} />
      </div>
      <div className="col-span-3">
        <span className={`${MZ_KICKER} text-[#EC1D25]`}>{madzineCategoryLabel(article.category)}</span>
        <h3 className={`mt-3 text-lg leading-snug font-bold text-white group-hover:text-[#EC1D25] transition ${MZ_SERIF}`}>
          {article.title}
        </h3>
        <div className="mt-3 text-[11px] tracking-[0.2em] text-neutral-500">{formatMzDate(article.published_at)}</div>
      </div>
    </Link>
  );
}
