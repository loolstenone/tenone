import { BoardContentList } from "@/components/intra/BoardContentList";

export default function TenoneWorksPage() {
    return (
        <BoardContentList
            site="tenone"
            board="works"
            title="Works"
            description="tenone.biz/works — 유니버스가 만든 브랜드·프로젝트 포트폴리오"
            editPath="/intra/ums/tenone/works/edit"
            publicPath="/works"
        />
    );
}
