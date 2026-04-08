/**
 * 뉴스레터 블록 타입 정의 + 매거진 HTML 렌더러
 */

/* ── 블록 타입 ── */

export interface HeroBlock {
    type: 'hero';
    brand: string;           // 'Mindle' | 'Ten:One™ Universe' | 'HeRo' 등
    brandColor: string;      // '#F5C518'
    title: string;
    summary: string;
    imageUrl?: string;
    linkUrl?: string;
    linkLabel?: string;
}

export interface CardItem {
    title: string;
    summary: string;
    imageUrl?: string;
    linkUrl?: string;
}

export interface CardRowBlock {
    type: 'card_row';
    heading?: string;
    items: CardItem[];      // 1~3개
}

export interface TextBlock {
    type: 'text';
    content: string;
}

export interface UniverseFeedBlock {
    type: 'universe_feed';
    items: Array<{
        brand: string;
        title: string;
        linkUrl?: string;
    }>;
}

export type NewsletterBlock =
    | HeroBlock
    | CardRowBlock
    | TextBlock
    | UniverseFeedBlock;

/* ── 유틸 ── */

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function imgTag(url: string, alt = ''): string {
    return `<img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" width="100%" style="display:block;width:100%;border:0;line-height:1;" />`;
}

/* ── 블록 → HTML 렌더러 ── */

function renderHero(b: HeroBlock): string {
    const bg = b.brandColor || '#000';
    const fg = bg === '#000000' || bg === '#0a0a0a' ? '#ffffff' : '#000000';
    return `
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:0;">
  <tr>
    <td style="background:${bg};padding:40px 40px 36px 40px;">
      <p style="margin:0 0 10px 0;font-size:10px;font-weight:700;letter-spacing:2px;color:${fg};opacity:0.6;text-transform:uppercase;">${escapeHtml(b.brand)}</p>
      <h1 style="margin:0 0 16px 0;font-size:28px;font-weight:900;color:${fg};line-height:1.25;">${escapeHtml(b.title)}</h1>
      <p style="margin:0 0 24px 0;font-size:15px;color:${fg};opacity:0.8;line-height:1.65;">${escapeHtml(b.summary)}</p>
      ${b.linkUrl ? `<a href="${escapeHtml(b.linkUrl)}" style="display:inline-block;background:${fg};color:${bg};font-size:13px;font-weight:700;padding:12px 28px;text-decoration:none;letter-spacing:0.3px;">${escapeHtml(b.linkLabel || '자세히 보기')} →</a>` : ''}
    </td>
  </tr>
  ${b.imageUrl ? `<tr><td style="padding:0;">${imgTag(b.imageUrl, b.title)}</td></tr>` : ''}
</table>`;
}

function renderCardRow(b: CardRowBlock): string {
    const colWidth = b.items.length === 1 ? '100%' : b.items.length === 2 ? '50%' : '33.33%';
    const cards = b.items.map((item) => `
      <td width="${colWidth}" valign="top" style="padding:0 8px 16px 8px;">
        ${item.imageUrl ? `<div style="margin-bottom:12px;background:#f5f5f5;">${imgTag(item.imageUrl, item.title)}</div>` : ''}
        <h3 style="margin:0 0 6px 0;font-size:14px;font-weight:700;color:#0a0a0a;line-height:1.3;">${escapeHtml(item.title)}</h3>
        <p style="margin:0 0 10px 0;font-size:12px;color:#666;line-height:1.6;">${escapeHtml(item.summary)}</p>
        ${item.linkUrl ? `<a href="${escapeHtml(item.linkUrl)}" style="font-size:11px;color:#0a0a0a;font-weight:600;text-decoration:underline;">읽기 →</a>` : ''}
      </td>`).join('');

    return `
<table width="100%" cellpadding="0" cellspacing="0" style="border-left:1px solid #e8e8e8;border-right:1px solid #e8e8e8;">
  <tr>
    <td style="padding:28px 32px 12px 32px;">
      ${b.heading ? `<h2 style="margin:0 0 20px 0;font-size:13px;font-weight:700;color:#0a0a0a;letter-spacing:0.5px;text-transform:uppercase;border-bottom:2px solid #0a0a0a;padding-bottom:8px;display:inline-block;">${escapeHtml(b.heading)}</h2>` : ''}
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr style="margin:0 -8px;">${cards}</tr>
      </table>
    </td>
  </tr>
</table>`;
}

function renderText(b: TextBlock): string {
    const paras = b.content.split('\n\n').filter(Boolean).map(
        (p) => `<p style="margin:0 0 16px 0;font-size:15px;color:#1a1a1a;line-height:1.7;">${p.replace(/\n/g, '<br/>')}</p>`
    ).join('');
    return `
<table width="100%" cellpadding="0" cellspacing="0" style="border-left:1px solid #e8e8e8;border-right:1px solid #e8e8e8;">
  <tr><td style="padding:28px 40px;">${paras}</td></tr>
</table>`;
}

function renderUniverseFeed(b: UniverseFeedBlock): string {
    const items = b.items.map((item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
          <span style="font-size:10px;font-weight:700;color:#999;letter-spacing:1px;text-transform:uppercase;margin-right:8px;">${escapeHtml(item.brand)}</span>
          ${item.linkUrl
            ? `<a href="${escapeHtml(item.linkUrl)}" style="font-size:13px;color:#0a0a0a;text-decoration:none;">${escapeHtml(item.title)}</a>`
            : `<span style="font-size:13px;color:#0a0a0a;">${escapeHtml(item.title)}</span>`}
        </td>
      </tr>`).join('');

    return `
<table width="100%" cellpadding="0" cellspacing="0" style="border-left:1px solid #e8e8e8;border-right:1px solid #e8e8e8;background:#fafafa;">
  <tr>
    <td style="padding:24px 40px;">
      <p style="margin:0 0 14px 0;font-size:10px;font-weight:700;letter-spacing:2px;color:#999;text-transform:uppercase;">Ten:One™ Universe</p>
      <table width="100%" cellpadding="0" cellspacing="0">${items}</table>
    </td>
  </tr>
</table>`;
}

/* ── 전체 이메일 조립 ── */

export interface MagazineEmailProps {
    blocks: NewsletterBlock[];
    unsubscribeUrl: string;
    siteUrl?: string;
    issueNumber?: number;
}

export function renderMagazineHtml(props: MagazineEmailProps): string {
    const { blocks, unsubscribeUrl, siteUrl = 'https://tenone.biz', issueNumber } = props;

    const blocksHtml = blocks.map((b) => {
        switch (b.type) {
            case 'hero':         return renderHero(b);
            case 'card_row':     return renderCardRow(b);
            case 'text':         return renderText(b);
            case 'universe_feed': return renderUniverseFeed(b);
        }
    }).join('');

    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Newsletter</title>
</head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Apple SD Gothic Neo',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f0f0;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- 상단 바 -->
          <tr>
            <td style="background:#000;padding:16px 40px;border-bottom:1px solid #222;text-align:right;">
              <a href="${siteUrl}" style="text-decoration:none;">
                <span style="font-size:10px;font-weight:800;letter-spacing:2px;color:#fff;">TEN:ONE™</span>
              </a>
              ${issueNumber ? `<span style="font-size:10px;color:#666;margin-left:12px;">#${String(issueNumber).padStart(3,'0')}</span>` : ''}
            </td>
          </tr>

          <!-- 블록들 -->
          ${blocksHtml}

          <!-- 푸터 -->
          <tr>
            <td style="background:#fff;padding:20px 40px 28px 40px;border:1px solid #e8e8e8;border-top:none;text-align:center;">
              <hr style="border:none;border-top:1px solid #f0f0f0;margin:0 0 16px 0;"/>
              <p style="margin:0 0 6px 0;font-size:11px;color:#999;">
                Ten:One™ Universe · <a href="${siteUrl}" style="color:#999;text-decoration:none;">tenone.biz</a>
              </p>
              <p style="margin:0;font-size:11px;color:#bbb;">
                더 이상 받지 않으시려면 <a href="${unsubscribeUrl}" style="color:#999;text-decoration:underline;">수신거부</a>하세요.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function renderMagazineText(props: MagazineEmailProps): string {
    const { blocks, unsubscribeUrl, siteUrl = 'https://tenone.biz' } = props;
    const lines: string[] = [];
    for (const b of blocks) {
        if (b.type === 'hero') { lines.push(b.title, b.summary, b.linkUrl || ''); }
        else if (b.type === 'card_row') { b.items.forEach((i) => lines.push(i.title, i.summary, i.linkUrl || '')); }
        else if (b.type === 'text') { lines.push(b.content); }
        else if (b.type === 'universe_feed') { b.items.forEach((i) => lines.push(`[${i.brand}] ${i.title}`)); }
        lines.push('');
    }
    return `${lines.join('\n')}\n---\nTen:One™ Universe · ${siteUrl}\n수신거부: ${unsubscribeUrl}`;
}
