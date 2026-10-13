/** 첫 화면 공유 미리보기 이미지 */
import { ImageResponse } from "next/og";
import { SITE } from "@/lib/projects/interview";
import { loadKoreanFont } from "@/lib/projects/og-font";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${SITE.eyebrow} — ${SITE.title}`;

export default async function Image() {
    const font = await loadKoreanFont(`${SITE.eyebrow}${SITE.title}${SITE.tagline}${SITE.host}면접관 HR-0 연결됨●`);
    return new ImageResponse(
        (
            <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", backgroundColor: "#0B0F0C", padding: "72px 88px", fontFamily: "NotoSansKR" }}>
                <div style={{ fontSize: 26, color: "#3DDC84", marginBottom: 24, display: "flex" }}>● 면접관 HR-0 연결됨</div>
                <div style={{ fontSize: 34, color: "#3DDC84", marginBottom: 12, display: "flex" }}>{SITE.eyebrow}</div>
                <div style={{ fontSize: 96, color: "#F5F5F5", marginBottom: 20, display: "flex" }}>{SITE.title}</div>
                <div style={{ fontSize: 38, color: "#BDBDBD", display: "flex" }}>{SITE.tagline}</div>
                <div style={{ marginTop: "auto", fontSize: 26, color: "#6B8F76", display: "flex" }}>{SITE.host}</div>
            </div>
        ),
        { ...size, fonts: font ? [{ name: "NotoSansKR", data: font, weight: 900, style: "normal" }] : [] },
    );
}
