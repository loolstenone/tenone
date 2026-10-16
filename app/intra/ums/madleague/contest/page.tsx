import { BoardContentList } from "@/components/intra/BoardContentList";
import { adminTitle } from "@/lib/brand-site-menus";
import { brandSiteUrl } from "@/lib/domain-registry";

/** MAD League 공모전/프로젝트 — 공통 게시판 (site madleague, board contest). 사이트 MADzine › 공모전/프로젝트 */
export default function MadleagueContestPage() {
    return (
        <BoardContentList
            site="madleague"
            board="contest"
            title={adminTitle("/intra/ums/madleague/contest", "공모전/프로젝트")}
            description="사이트 /madleague/madzine/contest — 공모전·대학생 프로젝트 소식 (옛 madleague.net/pinboard 24건 이전)"
            editPath="/intra/ums/madleague/contest/edit"
            publicPath={brandSiteUrl("madleague", "/madleague/madzine/contest")}
        />
    );
}
