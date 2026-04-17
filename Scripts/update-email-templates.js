/**
 * Supabase Auth 이메일 템플릿 일괄 업데이트
 *
 * - 한국어 + Ten:One Universe 브랜딩 (로고 이미지 사용)
 * - token_hash OTP 방식 (PKCE 대체) → 크로스 디바이스/탭 지원
 * 실행: node Scripts/update-email-templates.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// .env.local 파싱
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
});

const PAT = env.SUPABASE_ACCESS_TOKEN;
const PROJECT_REF = 'ziotlxkdctlhiwkgmmsh';

if (!PAT) {
    console.error('❌ SUPABASE_ACCESS_TOKEN not found in .env.local');
    process.exit(1);
}

// ── 공통 브랜드 래퍼 (로고 이미지 사용) ──
const brandWrapper = (title, body, buttonText, buttonHref) => `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Roboto, 'Malgun Gothic', '맑은 고딕', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; color: #171717; background: #ffffff;">
  <div style="text-align: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #e5e5e5;">
    <img src="https://tenone.biz/logo-horizontal.png" alt="Ten:One Universe" width="180" style="height: auto; display: inline-block;" />
  </div>
  <h2 style="font-size: 18px; font-weight: 700; margin: 0 0 16px 0; color: #171717; letter-spacing: -0.2px;">${title}</h2>
  <div style="font-size: 14px; line-height: 1.7; color: #404040;">${body}</div>
  ${buttonText && buttonHref ? `
  <div style="text-align: center; margin: 32px 0 16px 0;">
    <a href="${buttonHref}" style="display: inline-block; padding: 14px 40px; background: #171717; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 4px; letter-spacing: -0.1px;">${buttonText}</a>
  </div>
  <p style="font-size: 12px; color: #a3a3a3; text-align: center; margin: 8px 0 0 0;">
    버튼이 작동하지 않으면 아래 링크를 브라우저에 복사하세요:<br>
    <span style="word-break: break-all; color: #737373;">${buttonHref}</span>
  </p>
  ` : ''}
  <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e5e5; font-size: 11px; color: #a3a3a3; text-align: center; line-height: 1.6;">
    이 메일은 Ten:One Universe에서 발송되었습니다.<br>
    요청하지 않으셨다면 이 메일을 무시하셔도 됩니다.<br>
    <a href="https://tenone.biz" style="color: #737373; text-decoration: none;">tenone.biz</a>
  </div>
</div>
`.trim();

// ── OTP token_hash 기반 URL (PKCE 대체, 크로스 디바이스 지원) ──
const otpUrl = (type, next) =>
    `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=${type}&next=${encodeURIComponent(next)}`;

// ── 템플릿 정의 ──
const payload = {
    // 제목 (한국어)
    mailer_subjects_confirmation: '[Ten:One] 이메일 인증을 완료해주세요',
    mailer_subjects_recovery: '[Ten:One] 비밀번호 재설정 안내',
    mailer_subjects_magic_link: '[Ten:One] 로그인 링크',
    mailer_subjects_invite: '[Ten:One] Universe에 초대되셨습니다',
    mailer_subjects_email_change: '[Ten:One] 이메일 변경 확인',
    mailer_subjects_reauthentication: '[Ten:One] 재인증 요청',

    // 본문 템플릿 — 모두 token_hash OTP 방식
    mailer_templates_confirmation_content: brandWrapper(
        '이메일 인증을 완료해주세요',
        '<p>Ten:One Universe 가입을 환영합니다.<br>아래 버튼을 눌러 이메일 인증을 완료해주세요.</p>',
        '이메일 인증하기',
        otpUrl('email', '/')
    ),

    mailer_templates_recovery_content: brandWrapper(
        '비밀번호 재설정',
        '<p>비밀번호 재설정 요청을 받았습니다.<br>아래 버튼을 눌러 새 비밀번호를 설정해주세요.</p><p style="font-size: 12px; color: #737373; margin-top: 16px;">본인이 요청하지 않으셨다면 이 메일을 무시하시면 됩니다. 비밀번호는 변경되지 않습니다.</p>',
        '비밀번호 재설정하기',
        otpUrl('recovery', '/reset-password')
    ),

    mailer_templates_magic_link_content: brandWrapper(
        '로그인 링크',
        '<p>아래 버튼을 눌러 Ten:One Universe에 로그인하세요.<br>이 링크는 일회성으로, 사용 후 만료됩니다.</p>',
        '로그인하기',
        otpUrl('magiclink', '/')
    ),

    mailer_templates_invite_content: brandWrapper(
        'Ten:One Universe에 초대되셨습니다',
        '<p>반갑습니다.<br>Ten:One Universe에 초대되셨습니다. 아래 버튼을 눌러 가입을 완료하세요.</p>',
        '초대 수락하기',
        otpUrl('invite', '/')
    ),

    mailer_templates_email_change_content: brandWrapper(
        '이메일 변경 확인',
        '<p>이메일 주소 변경 요청을 받았습니다.<br>{{ .Email }} → <strong>{{ .NewEmail }}</strong></p><p>아래 버튼을 눌러 변경을 확정해주세요.</p>',
        '변경 확인하기',
        otpUrl('email_change', '/')
    ),

    mailer_templates_reauthentication_content: brandWrapper(
        '재인증 코드',
        '<p>아래 코드를 입력하여 재인증을 완료해주세요.</p><div style="text-align: center; margin: 24px 0;"><div style="display: inline-block; padding: 16px 32px; background: #f5f5f5; border-radius: 6px; font-size: 28px; font-weight: 700; letter-spacing: 4px; font-family: monospace;">{{ .Token }}</div></div>',
        null,
        null
    ),
};

// ── API 호출 ──
const data = JSON.stringify(payload);
const req = https.request({
    hostname: 'api.supabase.com',
    path: `/v1/projects/${PROJECT_REF}/config/auth`,
    method: 'PATCH',
    headers: {
        'Authorization': `Bearer ${PAT}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
    },
}, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        if (res.statusCode === 200) {
            console.log('✅ Email templates updated successfully');
            console.log(`   HTTP ${res.statusCode}`);
            console.log(`   Subjects: 6 updated`);
            console.log(`   Templates: 6 updated (token_hash OTP + logo)`);
        } else {
            console.log(`❌ HTTP ${res.statusCode}`);
            console.log(body);
        }
    });
});

req.on('error', (e) => console.error('❌ Request error:', e.message));
req.write(data);
req.end();
