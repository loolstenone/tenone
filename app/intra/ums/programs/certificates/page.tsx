import { CertificatesAdmin } from "@/components/intra/programs/CertificatesAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

// 통합 관리 › 인증서 — 전 브랜드 발급 기록 (코어 program_certificates)
export default async function CertificatesIntegratedPage() {
    const { data: brands } = await createAdminClient().from("ums_sites").select("slug, name").or("tier.in.(core,focus),slug.eq.planners").order("name");
    return <CertificatesAdmin brands={brands ?? []} />;
}
