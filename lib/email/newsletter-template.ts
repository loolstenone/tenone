/**
 * Ten:One™ 뉴스레터 이메일 HTML 템플릿
 * Resend를 통해 발송
 */

export interface NewsletterTemplateProps {
  title: string;
  content: string;             // 뉴스레터 본문 (plain text or markdown)
  issueNumber?: number;
  unsubscribeUrl: string;
  siteUrl?: string;
}

/** plain text → 간단한 HTML 단락 변환 */
function textToHtml(text: string): string {
  return text
    .split('\n\n')
    .filter(Boolean)
    .map(para => `<p style="margin:0 0 16px 0;line-height:1.7;color:#1a1a1a;">${
      para.replace(/\n/g, '<br/>')
    }</p>`)
    .join('');
}

export function renderNewsletterHtml(props: NewsletterTemplateProps): string {
  const { title, content, issueNumber, unsubscribeUrl, siteUrl = 'https://tenone.biz' } = props;
  const dateStr = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Apple SD Gothic Neo',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- 헤더 -->
          <tr>
            <td style="background:#000;padding:28px 40px;text-align:center;">
              <a href="${siteUrl}" style="text-decoration:none;">
                <span style="display:inline-block;background:#fff;color:#000;font-size:11px;font-weight:800;letter-spacing:2px;padding:6px 12px;">TEN:ONE™</span>
              </a>
              ${issueNumber ? `<p style="margin:8px 0 0 0;color:#666;font-size:11px;letter-spacing:1px;">ISSUE #${String(issueNumber).padStart(3, '0')}</p>` : ''}
            </td>
          </tr>

          <!-- 제목 -->
          <tr>
            <td style="background:#fff;padding:40px 40px 0 40px;border-left:1px solid #e8e8e8;border-right:1px solid #e8e8e8;">
              <p style="margin:0 0 8px 0;font-size:11px;color:#999;letter-spacing:1px;text-transform:uppercase;">${dateStr}</p>
              <h1 style="margin:0 0 24px 0;font-size:24px;font-weight:800;color:#0a0a0a;line-height:1.3;">${title}</h1>
              <hr style="border:none;border-top:2px solid #000;margin:0 0 32px 0;width:40px;margin-left:0;"/>
            </td>
          </tr>

          <!-- 본문 -->
          <tr>
            <td style="background:#fff;padding:0 40px 40px 40px;border-left:1px solid #e8e8e8;border-right:1px solid #e8e8e8;font-size:15px;">
              ${textToHtml(content)}
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="background:#fff;padding:0 40px 40px 40px;border-left:1px solid #e8e8e8;border-right:1px solid #e8e8e8;text-align:center;">
              <a href="${siteUrl}" style="display:inline-block;background:#000;color:#fff;font-size:13px;font-weight:700;padding:14px 32px;text-decoration:none;letter-spacing:0.5px;">
                Universe 방문하기 →
              </a>
            </td>
          </tr>

          <!-- 구분선 -->
          <tr>
            <td style="background:#fff;padding:0 40px;border-left:1px solid #e8e8e8;border-right:1px solid #e8e8e8;">
              <hr style="border:none;border-top:1px solid #f0f0f0;margin:0;"/>
            </td>
          </tr>

          <!-- 푸터 -->
          <tr>
            <td style="background:#fff;padding:24px 40px 32px 40px;border-left:1px solid #e8e8e8;border-right:1px solid #e8e8e8;border-bottom:1px solid #e8e8e8;text-align:center;">
              <p style="margin:0 0 8px 0;font-size:11px;color:#999;">
                Ten:One™ Universe · <a href="${siteUrl}" style="color:#999;text-decoration:none;">tenone.biz</a>
              </p>
              <p style="margin:0;font-size:11px;color:#bbb;">
                더 이상 뉴스레터를 받지 않으려면 <a href="${unsubscribeUrl}" style="color:#999;text-decoration:underline;">수신거부</a>하세요.
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

/** plain text 버전 (스팸 방지용) */
export function renderNewsletterText(props: NewsletterTemplateProps): string {
  const { title, content, unsubscribeUrl, siteUrl = 'https://tenone.biz' } = props;
  return `${title}

${content}

---
Ten:One™ Universe · ${siteUrl}
수신거부: ${unsubscribeUrl}
`;
}
