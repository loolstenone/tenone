"use client";

import { BoardPage } from "@/components/board";

export default function WorksPage() {
    return <BoardPage site="tenone" board="works" title="Works" description="Ten:One™ Universe에서 발굴하고 연결하여 만들어낸 브랜드와 프로젝트들입니다." accentColor="#171717" showWriteButton={false} />;
}
