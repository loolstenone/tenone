import { BoardPostEditor } from "@/components/intra/BoardPostEditor";

/** 통합 콘텐츠 점검에서 글 수정 (전 사이트) */
export default function ContentEditPage() {
    return <BoardPostEditor listPath="/intra/ums/sites/content" />;
}
