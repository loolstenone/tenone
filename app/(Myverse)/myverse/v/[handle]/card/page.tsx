// 레거시 경로 — /myverse/v/[handle]/card → /myverse/[handle]/card
// 기존 명함 QR 호환을 위해 ClientRedirect로 이전.

import { ClientRedirect } from "@/components/ClientRedirect";

interface Props {
    params: Promise<{ handle: string }>;
}

export default async function LegacyCardRedirect({ params }: Props) {
    const { handle } = await params;
    return <ClientRedirect to={`/myverse/${encodeURIComponent(handle)}/card`} />;
}
