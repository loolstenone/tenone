/**
 * HeRo 주간 리포트 이메일 HTML 템플릿
 * 매주 월요일 09:00 KST 발송
 */

export interface HeroWeeklyReportProps {
    name: string;
    streak: number;
    weeklyCheckins: number;   // 지난 7일 체크인 수
    weeklyUC: number;         // 지난 7일 적립 UC
    newMatches: number;       // 지난 7일 신규 매칭
    activeGoals: number;      // 현재 활성 목표 수
    missingHIT: 'a' | 'b' | 'both' | null;  // 미완료 HIT 종류
    journeyUrl: string;
    unsubscribeUrl?: string;
}

const RED = '#E53935';
const DARK = '#0a0a0a';
const GRAY = '#6b7280';

function streakBadge(streak: number): string {
    if (streak >= 100) return `🏆 ${streak}일 연속`;
    if (streak >= 30)  return `⭐ ${streak}일 연속`;
    if (streak >= 7)   return `🔥 ${streak}일 연속`;
    return `${streak}일 연속`;
}

function hitNudge(missing: HeroWeeklyReportProps['missingHIT']): string {
    if (!missing) return '';
    const label = missing === 'both' ? 'HIT A · B 검사'
        : missing === 'a' ? 'HIT A 검사'
        : 'HIT B 검사';
    return `
      <tr>
        <td style="background:#fff5f5;border-left:3px solid ${RED};padding:14px 20px;border-radius:4px;margin-bottom:16px;display:block;">
          <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;color:${RED};letter-spacing:1px;text-transform:uppercase;">미완료 · ${label}</p>
          <p style="margin:0;font-size:14px;color:${DARK};">검사를 완료하면 더 정확한 매칭과 커리어 인사이트를 받을 수 있어요.</p>
        </td>
      </tr>
      <tr><td style="height:16px;"></td></tr>
    `;
}

export function renderHeroWeeklyReportHtml(props: HeroWeeklyReportProps): string {
    const {
        name, streak, weeklyCheckins, weeklyUC,
        newMatches, activeGoals, missingHIT,
        journeyUrl, unsubscribeUrl,
    } = props;

    const dateStr = new Date().toLocaleDateString('ko-KR', {
        year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
    });
    const hasActivity = weeklyCheckins > 0 || weeklyUC > 0 || newMatches > 0;

    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>HeRo 주간 리포트 — ${name}님</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Apple SD Gothic Neo',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- 헤더 -->
          <tr>
            <td style="background:#000;padding:24px 40px;text-align:center;">
              <a href="https://hero.ne.kr" style="text-decoration:none;">
                <span style="display:inline-block;background:${RED};color:#fff;font-size:13px;font-weight:800;letter-spacing:3px;padding:6px 14px;">HeRo</span>
              </a>
              <p style="margin:8px 0 0 0;color:#999;font-size:11px;letter-spacing:1px;">WEEKLY REPORT</p>
            </td>
          </tr>

          <!-- 인사 -->
          <tr>
            <td style="background:#fff;padding:36px 40px 0 40px;border-left:1px solid #e8e8e8;border-right:1px solid #e8e8e8;">
              <p style="margin:0 0 6px 0;font-size:11px;color:#999;letter-spacing:1px;">${dateStr}</p>
              <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:800;color:${DARK};line-height:1.3;">
                ${name}님의 이번 주 커리어 현황
              </h1>
              <hr style="border:none;border-top:2px solid ${RED};width:32px;margin:0 0 28px 0;margin-left:0;"/>
            </td>
          </tr>

          <!-- 스트릭 배너 -->
          <tr>
            <td style="background:#fff;padding:0 40px;border-left:1px solid #e8e8e8;border-right:1px solid #e8e8e8;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#0a0a0a;padding:16px 20px;border-radius:8px;text-align:center;">
                    <span style="font-size:20px;font-weight:800;color:#fff;">${streakBadge(streak)}</span>
                    <span style="font-size:13px;color:#aaa;margin-left:8px;">Journey 스트릭</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 이번 주 통계 -->
          <tr>
            <td style="background:#fff;padding:24px 40px;border-left:1px solid #e8e8e8;border-right:1px solid #e8e8e8;">
              <p style="margin:0 0 16px 0;font-size:11px;font-weight:700;color:${GRAY};letter-spacing:1px;text-transform:uppercase;">이번 주 활동</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="25%" style="text-align:center;padding:16px 8px;background:#f9f9f9;border-radius:8px;">
                    <div style="font-size:26px;font-weight:800;color:${RED};">${weeklyCheckins}</div>
                    <div style="font-size:11px;color:${GRAY};margin-top:4px;">체크인</div>
                  </td>
                  <td width="4%"></td>
                  <td width="25%" style="text-align:center;padding:16px 8px;background:#f9f9f9;border-radius:8px;">
                    <div style="font-size:26px;font-weight:800;color:${RED};">${weeklyUC.toLocaleString('ko-KR')}</div>
                    <div style="font-size:11px;color:${GRAY};margin-top:4px;">UC 적립</div>
                  </td>
                  <td width="4%"></td>
                  <td width="25%" style="text-align:center;padding:16px 8px;background:#f9f9f9;border-radius:8px;">
                    <div style="font-size:26px;font-weight:800;color:${RED};">${newMatches}</div>
                    <div style="font-size:11px;color:${GRAY};margin-top:4px;">신규 매칭</div>
                  </td>
                  <td width="4%"></td>
                  <td width="25%" style="text-align:center;padding:16px 8px;background:#f9f9f9;border-radius:8px;">
                    <div style="font-size:26px;font-weight:800;color:${DARK};">${activeGoals}</div>
                    <div style="font-size:11px;color:${GRAY};margin-top:4px;">진행 목표</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 활동 없을 때 격려 메시지 -->
          ${!hasActivity ? `
          <tr>
            <td style="background:#fff;padding:0 40px;border-left:1px solid #e8e8e8;border-right:1px solid #e8e8e8;">
              <div style="background:#f9f9f9;border-radius:8px;padding:20px;text-align:center;">
                <p style="margin:0 0 6px 0;font-size:15px;font-weight:700;color:${DARK};">이번 주는 조용했네요 😊</p>
                <p style="margin:0;font-size:13px;color:${GRAY};">30초 체크인부터 시작해 보세요. 작은 기록이 쌓여 큰 커리어가 됩니다.</p>
              </div>
            </td>
          </tr>
          <tr><td style="height:16px;"></td></tr>
          ` : ''}

          <!-- HIT 유도 -->
          ${missingHIT ? `
          <tr>
            <td style="background:#fff;padding:0 40px;border-left:1px solid #e8e8e8;border-right:1px solid #e8e8e8;">
              ${hitNudge(missingHIT)}
            </td>
          </tr>
          ` : ''}

          <!-- CTA -->
          <tr>
            <td style="background:#fff;padding:28px 40px 40px 40px;border-left:1px solid #e8e8e8;border-right:1px solid #e8e8e8;border-bottom:1px solid #e8e8e8;text-align:center;">
              <a href="${journeyUrl}"
                 style="display:inline-block;background:${RED};color:#fff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none;letter-spacing:0.5px;">
                Journey 바로가기 →
              </a>
              <p style="margin:16px 0 0 0;font-size:12px;color:#aaa;">
                오늘의 30초 체크인이 기다리고 있어요.
              </p>
            </td>
          </tr>

          <!-- 푸터 -->
          <tr>
            <td style="padding:24px 40px;text-align:center;">
              <p style="margin:0 0 4px 0;font-size:11px;color:#aaa;">
                HeRo — Human enhancement &amp; Recruit Optimization
              </p>
              <p style="margin:0;font-size:11px;color:#ccc;">
                <a href="https://hero.ne.kr" style="color:#aaa;text-decoration:none;">hero.ne.kr</a>
                ${unsubscribeUrl ? ` · <a href="${unsubscribeUrl}" style="color:#aaa;text-decoration:none;">수신 거부</a>` : ''}
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

/** 이메일 제목 생성 */
export function heroWeeklySubject(name: string, streak: number, newMatches: number): string {
    if (newMatches > 0) return `${name}님, 이번 주 새 매칭 ${newMatches}건이 도착했어요 🎯`;
    if (streak >= 7)    return `${name}님, ${streak}일 연속 스트릭 달성 중 🔥`;
    return `${name}님의 이번 주 HeRo Journey 리포트`;
}
