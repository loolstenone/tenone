import { CertificatesAdmin } from "@/components/intra/programs/CertificatesAdmin";

// MADLeague › 인증서 발급 (사이트 매드리거 › "인증서 발급" 버튼 — lib/brand-site-menus.ts)
export default function MadCertificatesPage() {
    return <CertificatesAdmin brand="madleague" title="인증서 발급" />;
}
