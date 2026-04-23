/**
 * HeRo Journey 스테이지 승급 축하 이메일
 */

export interface HeroStageUpProps {
    name: string;
    fromStage: string;
    toStage: string;
    ucAwarded: number;
    journeyUrl: string;
}

const RED = '#E53935';
const DARK = '#0a0a0a';
const GRAY = '#6b7280';

const STAGE_EMOJI: Record<string, string> = {
    Dreamer: '✨',
    Challenger: '🚪',
    Trainee: '⚔️',
    Debut: '🚀',
    Star: '⭐',
    Legend: '👑',
};

const STAGE_SUBTITLE: Record<string, string> = {
    Dreamer: '꿈을 품다',
    Challenger: '도전하다',
    Trainee: '훈련하다',
    Debut: '데뷔하다',
    Star: '빛나다',
    Legend: '전설이 되다',
};

export function heroStageUpHtml(p: HeroStageUpProps): string {
    const toEmoji = STAGE_EMOJI[p.toStage] ?? '🎉';
    const toSubtitle = STAGE_SUBTITLE[p.toStage] ?? '';

    return `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;">

      <!-- 헤더 -->
      <tr>
        <td style="background:${RED};padding:32px 40px;text-align:center;">
          <p style="margin:0 0 8px 0;font-size:40px;">${toEmoji}</p>
          <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">스테이지 승급!</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:15px;">${p.toStage} · ${toSubtitle}</p>
        </td>
      </tr>

      <!-- 본문 -->
      <tr>
        <td style="padding:40px 40px 32px;">
          <p style="margin:0 0 24px;font-size:16px;color:${DARK};line-height:1.6;">
            안녕하세요, <strong>${p.name}</strong>님!<br>
            <strong>${p.fromStage}</strong>에서 <strong>${p.toStage}</strong>로 승급했습니다. 🎊
          </p>

          <!-- 승급 시각화 -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td style="background:#f5f5f5;border-radius:8px;padding:16px 24px;text-align:center;">
                <span style="font-size:18px;font-weight:700;color:${GRAY};">${p.fromStage}</span>
                <span style="margin:0 12px;font-size:20px;color:${RED};">→</span>
                <span style="font-size:18px;font-weight:800;color:${RED};">${p.toStage}</span>
              </td>
            </tr>
          </table>

          <!-- UC 적립 -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td style="background:#fff5f5;border:1px solid #fecaca;border-radius:8px;padding:16px 24px;">
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:${RED};letter-spacing:1px;text-transform:uppercase;">UC 적립</p>
                <p style="margin:0;font-size:22px;font-weight:800;color:${DARK};">+${p.ucAwarded.toLocaleString()} UC</p>
                <p style="margin:4px 0 0;font-size:13px;color:${GRAY};">승급 보상이 계정에 적립되었어요.</p>
              </td>
            </tr>
          </table>

          <p style="margin:0 0 28px;font-size:14px;color:${GRAY};line-height:1.6;">
            Journey를 계속 쌓아가세요. 다음 스테이지가 기다리고 있어요!
          </p>

          <!-- CTA -->
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="background:${RED};border-radius:8px;">
                <a href="${p.journeyUrl}" style="display:block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">내 Journey 보기 →</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- 푸터 -->
      <tr>
        <td style="background:#f9f9f9;padding:24px 40px;border-top:1px solid #e5e5e5;">
          <p style="margin:0;font-size:12px;color:${GRAY};line-height:1.6;">
            HeRo · Ten:One Universe<br>
            이 이메일은 Journey 스테이지 승급 시 자동으로 발송됩니다.
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}
