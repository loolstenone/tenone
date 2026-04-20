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

/* ── 구독 확인 메일 ── */

export interface ConfirmTemplateProps {
  nickname: string;
  brandName: string;       // e.g. "Mindle", "Ten:One™ Universe"
  brandColor: string;      // e.g. "#F5C518", "#000000"
  confirmUrl: string;
  siteUrl?: string;
}

export function renderConfirmHtml(props: ConfirmTemplateProps): string {
  const { nickname, brandName, brandColor, confirmUrl, siteUrl = 'https://tenone.biz' } = props;
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${brandName} 뉴스레터 구독 확인</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Apple SD Gothic Neo',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- 헤더 (Ten:One 로고) -->
          <tr>
            <td style="background:#fff;padding:32px 40px 20px 40px;text-align:center;border-left:1px solid #e8e8e8;border-right:1px solid #e8e8e8;border-top:1px solid #e8e8e8;">
              <img src="${siteUrl}/logo-horizontal.png" alt="Ten:One Universe" width="160" style="display:inline-block;max-width:160px;height:auto;"/>
              <p style="margin:14px 0 0 0;color:#999;font-size:10px;font-weight:700;letter-spacing:3px;">NEWSLETTER · ${brandName.toUpperCase()}</p>
            </td>
          </tr>

          <!-- 본문 -->
          <tr>
            <td style="background:#fff;padding:24px 40px 32px 40px;border-left:1px solid #e8e8e8;border-right:1px solid #e8e8e8;text-align:center;">
              <hr style="border:none;border-top:1px solid #f0f0f0;margin:0 0 32px 0;"/>
              <h1 style="margin:0 0 20px 0;font-size:22px;font-weight:800;color:#0a0a0a;line-height:1.4;">${nickname}님, 고맙습니다 🙏</h1>
              <p style="margin:0 0 14px 0;font-size:15px;color:#444;line-height:1.7;">
                <strong>${brandName}</strong> 뉴스레터를 신청해주셔서 감사합니다.<br/>
                앞으로 좋은 소식으로 찾아뵙겠습니다.
              </p>
              <p style="margin:0 0 32px 0;font-size:14px;color:#666;line-height:1.7;">
                구독을 완료하려면 아래 버튼을 눌러<br/>이메일 인증을 마쳐주세요.
              </p>
              <a href="${confirmUrl}" style="display:inline-block;background:${brandColor};color:${brandColor === '#000000' || brandColor === '#0a0a0a' ? '#fff' : '#000'};font-size:14px;font-weight:700;padding:16px 40px;text-decoration:none;letter-spacing:0.3px;">
                이메일 인증하기 →
              </a>
              <p style="margin:24px 0 0 0;font-size:11px;color:#bbb;line-height:1.6;">
                버튼이 작동하지 않으면 아래 링크를 복사해 브라우저에 붙여넣으세요.<br/>
                <a href="${confirmUrl}" style="color:#999;word-break:break-all;">${confirmUrl}</a>
              </p>
            </td>
          </tr>

          <!-- 푸터 -->
          <tr>
            <td style="background:#fff;padding:20px 40px 32px 40px;border-left:1px solid #e8e8e8;border-right:1px solid #e8e8e8;border-bottom:1px solid #e8e8e8;text-align:center;">
              <hr style="border:none;border-top:1px solid #f0f0f0;margin:0 0 20px 0;"/>
              <p style="margin:0 0 6px 0;font-size:11px;color:#999;">
                신청 사이트: <strong style="color:#666;">${brandName}</strong>
              </p>
              <p style="margin:0 0 6px 0;font-size:11px;color:#999;">
                Ten:One™ Universe · <a href="${siteUrl}" style="color:#999;text-decoration:none;">tenone.biz</a>
              </p>
              <p style="margin:0;font-size:11px;color:#bbb;">
                본인이 신청하지 않은 경우 이 메일을 무시하시면 됩니다.
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

export function renderConfirmText(props: ConfirmTemplateProps): string {
  const { nickname, brandName, confirmUrl } = props;
  return `${nickname}님, ${brandName} 뉴스레터를 신청해주셔서 감사합니다.

앞으로 좋은 소식으로 찾아뵙겠습니다.
아래 링크를 눌러 이메일 인증을 완료해주세요.

인증 링크: ${confirmUrl}

신청 사이트: ${brandName}
Ten:One™ Universe · tenone.biz

본인이 신청하지 않은 경우 이 메일을 무시하시면 됩니다.
`;
}
