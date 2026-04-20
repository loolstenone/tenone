/**
 * CRM 브로드캐스트 이메일 템플릿 + 변수 치환
 */

export interface CrmTemplateProps {
    subject: string;
    preheader?: string;
    bodyHtml: string;         // 이미 변수 치환된 HTML 단편
    bodyText: string;
    buttonLabel?: string;
    buttonUrl?: string;
    brandName?: string;
    brandColor?: string;
    siteUrl?: string;
    unsubscribeUrl: string;
}

export interface VariableContext {
    name?: string | null;
    email?: string;
    company?: string | null;
    position?: string | null;
    brand?: string | null;
    [key: string]: unknown;
}

/**
 * {{name}} 치환 — 지원 변수: name, email, company, position, brand
 * 알 수 없는 변수는 빈 문자열로 교체
 */
export function applyVariables(template: string, ctx: VariableContext): string {
    return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => {
        const v = ctx[key];
        if (v === undefined || v === null) return '';
        return String(v);
    });
}

/** text → HTML 단락 변환 (줄바꿈 유지) */
function textToParagraphs(text: string): string {
    return text
        .split('\n\n')
        .filter(Boolean)
        .map(p => `<p style="margin:0 0 16px 0;line-height:1.7;color:#1a1a1a;font-size:15px;">${p.replace(/\n/g, '<br/>')}</p>`)
        .join('');
}

export function renderCrmHtml(props: CrmTemplateProps): string {
    const {
        subject, preheader, bodyHtml, buttonLabel, buttonUrl,
        brandName, brandColor = '#171717',
        siteUrl = 'https://tenone.biz', unsubscribeUrl,
    } = props;

    const buttonTextColor = brandColor === '#000000' || brandColor === '#171717' || brandColor === '#0a0a0a' ? '#fff' : '#000';

    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Apple SD Gothic Neo',sans-serif;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>` : ''}
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <tr><td style="background:#fff;padding:32px 40px 20px 40px;text-align:center;border:1px solid #e8e8e8;border-bottom:none;">
          <img src="${siteUrl}/logo-horizontal.png" alt="Ten:One Universe" width="140" style="display:inline-block;max-width:140px;height:auto;"/>
          ${brandName ? `<p style="margin:10px 0 0 0;color:#999;font-size:10px;font-weight:700;letter-spacing:2px;">${brandName.toUpperCase()}</p>` : ''}
        </td></tr>
        <tr><td style="background:#fff;padding:8px 40px 32px 40px;border:1px solid #e8e8e8;border-top:none;border-bottom:none;">
          <hr style="border:none;border-top:1px solid #f0f0f0;margin:0 0 28px 0;"/>
          ${bodyHtml}
          ${buttonLabel && buttonUrl ? `
            <div style="text-align:center;margin:32px 0 8px 0;">
              <a href="${buttonUrl}" style="display:inline-block;background:${brandColor};color:${buttonTextColor};font-size:14px;font-weight:700;padding:14px 36px;text-decoration:none;letter-spacing:0.3px;">
                ${buttonLabel}
              </a>
            </div>` : ''}
        </td></tr>
        <tr><td style="background:#fff;padding:20px 40px 32px 40px;border:1px solid #e8e8e8;border-top:none;text-align:center;">
          <hr style="border:none;border-top:1px solid #f0f0f0;margin:0 0 20px 0;"/>
          <p style="margin:0 0 6px 0;font-size:11px;color:#999;">Ten:One™ Universe · <a href="${siteUrl}" style="color:#999;text-decoration:none;">tenone.biz</a></p>
          <p style="margin:0;font-size:11px;color:#bbb;">
            더 이상 이 메일을 받지 않으려면 <a href="${unsubscribeUrl}" style="color:#999;text-decoration:underline;">수신거부</a>하세요.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function renderCrmText(props: CrmTemplateProps): string {
    const { subject, bodyText, buttonLabel, buttonUrl, unsubscribeUrl } = props;
    return `${subject}

${bodyText}
${buttonLabel && buttonUrl ? `\n${buttonLabel}: ${buttonUrl}\n` : ''}
---
Ten:One™ Universe · tenone.biz
수신거부: ${unsubscribeUrl}
`;
}

/** text 본문을 HTML로 감쌀 때 쓰는 헬퍼 */
export function wrapBodyAsHtml(text: string): string {
    return textToParagraphs(text);
}
