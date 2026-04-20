/**
 * 이메일 발신자 레지스트리
 * DB: email_senders (SSOT) — 이 상수는 폴백/타입용
 * 용도별 발송 주소 표준화:
 *   - transactional : 가입·구독 인증
 *   - newsletter    : 정기 뉴스레터
 *   - crm           : CRM 마케팅 브로드캐스트
 *   - announcement  : 중요 공지·초대
 */

export type SenderPurpose = 'transactional' | 'newsletter' | 'crm' | 'announcement';

export interface EmailSender {
    id: string;
    fromAddr: string;
    fromName: string;
    replyTo: string;
    purpose: SenderPurpose;
    brandId?: string | null;
    dailyLimit: number;
    isActive: boolean;
}

/** 기본 발신자 세트 (DB email_senders와 동기화) */
export const DEFAULT_SENDERS: Record<string, EmailSender> = {
    noreply: {
        id: 'noreply',
        fromAddr: 'noreply@tenone.biz',
        fromName: 'Ten:One Universe',
        replyTo: 'lools@tenone.biz',
        purpose: 'transactional',
        dailyLimit: 2000,
        isActive: true,
    },
    news: {
        id: 'news',
        fromAddr: 'news@tenone.biz',
        fromName: 'Ten:One Universe',
        replyTo: 'lools@tenone.biz',
        purpose: 'newsletter',
        dailyLimit: 5000,
        isActive: true,
    },
    hello: {
        id: 'hello',
        fromAddr: 'hello@tenone.biz',
        fromName: 'Ten:One Universe',
        replyTo: 'lools@tenone.biz',
        purpose: 'crm',
        dailyLimit: 1000,
        isActive: true,
    },
    ceo: {
        id: 'ceo',
        fromAddr: 'ceo@tenone.biz',
        fromName: 'Ten:One Universe',
        replyTo: 'lools@tenone.biz',
        purpose: 'announcement',
        dailyLimit: 500,
        isActive: true,
    },
};

/** 브랜드명을 포함한 From 이름 생성 */
export function formatFromName(sender: EmailSender, brandName?: string): string {
    if (!brandName || brandName === 'Ten:One™ Universe' || brandName === 'Ten:One Universe') {
        return sender.fromName;
    }
    return `${brandName} · ${sender.fromName}`;
}

/** Resend emails.send()에 바로 꽂을 수 있는 from 헤더 */
export function buildFromHeader(sender: EmailSender, brandName?: string): string {
    return `${formatFromName(sender, brandName)} <${sender.fromAddr}>`;
}

/** 용도별 기본 발신자 선택 */
export function pickSender(purpose: SenderPurpose): EmailSender {
    switch (purpose) {
        case 'transactional': return DEFAULT_SENDERS.noreply;
        case 'newsletter':    return DEFAULT_SENDERS.news;
        case 'crm':           return DEFAULT_SENDERS.hello;
        case 'announcement':  return DEFAULT_SENDERS.ceo;
    }
}
