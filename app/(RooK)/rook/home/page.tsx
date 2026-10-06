import { redirect } from "next/navigation";

/** 원본 rook.co.kr/home 경로 호환 (DNS 전환 대비) */
export default function RooKHomeAlias() {
    redirect("/rook");
}
