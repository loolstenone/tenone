// Certificate 모듈 타입 정의

export type CertificateStatus = 'draft' | 'issued' | 'revoked';
export type CertificateType = '수료증' | '인증서' | '참가확인서' | '상장' | '기타';

export interface Certificate {
  id: string;
  brandId: string;
  certificateNumber: string;
  title: string;
  type: CertificateType;
  status: CertificateStatus;
  recipientName: string;
  recipientEmail: string | null;
  courseOrEvent: string | null;
  description: string | null;
  issuedAt: string | null;
  revokedAt: string | null;
  issuerId: string | null;
  templateId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCertificateInput {
  brandId: string;
  title: string;
  type: CertificateType;
  status?: CertificateStatus;
  recipientName: string;
  recipientEmail?: string;
  courseOrEvent?: string;
  description?: string;
  issuedAt?: string;
  issuerId?: string;
  templateId?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateCertificateInput {
  title?: string;
  type?: CertificateType;
  status?: CertificateStatus;
  recipientName?: string;
  recipientEmail?: string;
  courseOrEvent?: string;
  description?: string;
  issuedAt?: string;
  revokedAt?: string;
  issuerId?: string;
  templateId?: string;
  metadata?: Record<string, unknown>;
}
