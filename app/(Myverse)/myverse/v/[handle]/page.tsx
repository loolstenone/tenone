// 레거시 경로 — /myverse/v/[handle] → /myverse/[handle]
// QR·외부 링크 호환을 위해 ClientRedirect로 이전.

import { ClientRedirect } from "@/components/ClientRedirect";

interface Props {
    params: Promise<{ handle: string }>;
}

export default async function LegacyVerseRedirect({ params }: Props) {
    const { handle } = await params;
    return <ClientRedirect to={`/myverse/${encodeURIComponent(handle)}`} />;
}
