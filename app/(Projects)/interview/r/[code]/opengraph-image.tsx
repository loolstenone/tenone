/** 결과 공유 미리보기 이미지 (카카오톡·SNS 링크 카드) — 판정 도장 + 제목 */
import { ImageResponse } from "next/og";
import { buildNotice, isValidCode, SITE } from "@/lib/projects/interview";
import { loadKoreanFont } from "@/lib/projects/og-font";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "AI 면접 예행연습 결과 통지서";

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
    const { code } = await params;
    const n = isValidCode(code) ? buildNotice(code) : null;
    const status = n?.verdict.status ?? "불합격";
    const title = n?.verdict.title ?? SITE.title;
    const summary = n?.verdict.summary ?? SITE.tagline;
    const text = `${SITE.eyebrow}면접 결과 통지서${status}${title}${summary}나도 미리 떨어져 보기 ${SITE.host}${n?.applicantNo ?? ""}`;
    const font = await loadKoreanFont(text);

    return new ImageResponse(
        (
            <div style={{ width: "100%", height: "100%", display: "flex", backgroundColor: "#0B0F0C", padding: 48, fontFamily: "NotoSansKR" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "#F7F5EF", borderRadius: 12, padding: "48px 56px", position: "relative" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "4px solid #111", paddingBottom: 18, marginBottom: 28 }}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <div style={{ fontSize: 24, color: "#777" }}>{SITE.eyebrow}</div>
                            <div style={{ fontSize: 44, color: "#111" }}>면접 결과 통지서</div>
                        </div>
                        <div style={{ fontSize: 22, color: "#777", display: "flex", alignItems: "flex-end" }}>{n?.applicantNo ?? ""}</div>
                    </div>
                    <div style={{ fontSize: 66, color: "#111", marginBottom: 16, maxWidth: 640, lineHeight: 1.15 }}>{title}</div>
                    <div style={{ fontSize: 30, color: "#333", maxWidth: 640, lineHeight: 1.4 }}>{summary}</div>
                    <div style={{ position: "absolute", right: 56, top: 190, transform: "rotate(-14deg)", border: "6px solid #D7263D", color: "#D7263D", borderRadius: 10, padding: "8px 22px", fontSize: 56 }}>
                        {status}
                    </div>
                    <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", fontSize: 24, color: "#555" }}>
                        <div style={{ display: "flex" }}>나도 미리 떨어져 보기</div>
                        <div style={{ display: "flex" }}>{SITE.host}</div>
                    </div>
                </div>
            </div>
        ),
        { ...size, fonts: font ? [{ name: "NotoSansKR", data: font, weight: 900, style: "normal" }] : [] },
    );
}
