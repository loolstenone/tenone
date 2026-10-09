/**
 * MADLeague 경쟁 PT 인증서 이미지 — 배경 디자인(public/madleague/certificates) 위에 글자를 그린다 (브라우저 전용)
 *   참가 확인서(COA) · 수상 확인서(MCP: 1등·2등·3등·본선 리본)
 *   좌표는 원본 디자인 720×1040 기준, SCALE배로 그려 인쇄용 해상도를 확보한다
 */

export interface PtCertificate {
    code: string;
    type: "participation" | "award";
    result: string | null;        // 1등 · 2등 · 3등 · 본선 (수상) / 참가
    issued_at: string;            // 대장 발급일 = 인증서 표기 날짜
    name: string;
    birthdate: string | null;     // YYYY-MM-DD
    university: string | null;
    major: string | null;
    club: string | null;          // 소속 동아리
    cohort: string | null;        // 기수
    client: string | null;        // 주최 (대성학원 · 리제로스 …)
    title: string;                // 대회명 (예: 리제로스 경쟁 PT)
    year: number | null;
}

const W = 720, H = 1040, SCALE = 3;
const FONT = "MADCert";
const BG: Record<string, string> = {
    participation: "/madleague/certificates/bg-coa.png",
    "1등": "/madleague/certificates/bg-mcp-1.png",
    "2등": "/madleague/certificates/bg-mcp-2.png",
    "3등": "/madleague/certificates/bg-mcp-3.png",
    본선: "/madleague/certificates/bg-mcp-final.png",
};
const LOGO = "/logos/madleague/footer_Logo.png";

let fontsReady: Promise<void> | null = null;
function loadFonts(): Promise<void> {
    fontsReady ??= Promise.all([
        new FontFace(FONT, "url(/fonts/Pretendard-Bold.subset.woff2)", { weight: "700" }).load(),
        new FontFace(FONT, "url(/fonts/Pretendard-Medium.subset.woff2)", { weight: "500" }).load(),
    ]).then(faces => { faces.forEach(f => document.fonts.add(f)); }).catch(() => undefined);
    return fontsReady;
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`이미지를 불러오지 못했습니다: ${src}`));
        img.src = src;
    });
}

/** 받침 있으면 '이', 없으면 '가' */
function iGa(word: string): string {
    const c = word.trim().slice(-1).charCodeAt(0);
    if (c < 0xac00 || c > 0xd7a3) return "이(가)";
    return (c - 0xac00) % 28 ? "이" : "가";
}

/** 발급일 — 한국 시간 날짜 (DB는 UTC로 돌려준다: 2025-09-05 00:00 KST = 2025-09-04T15:00Z) */
const dot = (iso: string) => {
    const [y, m, d] = new Date(iso).toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" }).split("-");
    return `${y}. ${m}. ${d}.`;
};
const birth = (iso: string) => {
    const [y, m, d] = iso.split("-");
    return `${y}. ${m}. ${d} 생`;
};

export function certBackground(c: Pick<PtCertificate, "type" | "result">): string {
    return c.type === "award" ? BG[c.result ?? ""] ?? BG["본선"] : BG.participation;
}

export async function renderPtCertificate(c: PtCertificate): Promise<HTMLCanvasElement> {
    await loadFonts();
    const [bg, logo] = await Promise.all([loadImage(certBackground(c)), loadImage(LOGO)]);
    const canvas = document.createElement("canvas");
    canvas.width = W * SCALE;
    canvas.height = H * SCALE;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(SCALE, SCALE);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bg, 0, 0, W, H);

    ctx.fillStyle = "#fff";
    ctx.textBaseline = "alphabetic";
    const text = (s: string, x: number, y: number, size: number, weight = 700, align: CanvasTextAlign = "center", spacing = 0) => {
        ctx.font = `${weight} ${size}px ${FONT}, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif`;
        ctx.textAlign = align;
        if ("letterSpacing" in ctx) (ctx as unknown as { letterSpacing: string }).letterSpacing = `${spacing}px`;
        ctx.fillText(s, x, y);
    };

    // 일련번호
    text(c.code, 683, 108, 14, 500, "right");

    const award = c.type === "award";
    if (award) {
        text(c.result ?? "본선", W / 2, 245, 72);
        text("Competitive Presentation", W / 2, 307, 18);
        text(`${c.year ?? ""} MADLeague`, W / 2, 333, 18);
    } else {
        text("CERTIFICATE", W / 2, 262, 18, 700, "center", 7);
        text("of Attendance", W / 2, 287, 18, 500);
        text(`${c.title} 참가 확인서`, W / 2, 330, 25);
    }

    // 인적 사항
    const group = [c.club, c.cohort].filter(Boolean).join(" ");
    if (group) text(group, W / 2, 420, 14);
    text(c.name, W / 2, 487, 50, 500);
    ctx.fillRect(180, 515, 360, 2);
    if (c.birthdate) text(birth(c.birthdate), W / 2, 551, 15);
    const school = [c.university, c.major].filter(Boolean).join(": ");
    if (school) text(school, W / 2, 581, 14);

    // 본문
    const client = c.client ?? "";
    const line1 = client ? `위 학생은 매드리그가 주관하고 ${client}${iGa(client)} 주최한` : "위 학생은 매드리그가 주관한";
    text(line1, W / 2, 668, 19);
    text(`${c.year ?? ""}년 ${c.title}${award ? "에서" : "에"}`, W / 2, 695, 19);
    text(award ? "수상하였음을 확인합니다." : "참가하였음을 확인합니다.", W / 2, 722, 19);

    // 날짜 · 로고
    text(dot(c.issued_at), W / 2, 880, 20, 500, "center", 1);
    ctx.drawImage(logo, 271, 908, 178, 37);
    return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: "image/png" | "image/jpeg", quality?: number): Promise<Blob> {
    return new Promise((resolve, reject) => canvas.toBlob(b => (b ? resolve(b) : reject(new Error("이미지 생성 실패"))), type, quality));
}

/** JPEG 한 장을 담은 1쪽 PDF — 외부 라이브러리 없이 (이미지 비율 그대로, 폭 A4) */
export async function canvasToPdf(canvas: HTMLCanvasElement): Promise<Blob> {
    const jpeg = new Uint8Array(await (await canvasToBlob(canvas, "image/jpeg", 0.95)).arrayBuffer());
    const pw = 595.28, ph = +(pw * canvas.height / canvas.width).toFixed(2);
    const enc = new TextEncoder();
    const parts: Uint8Array[] = [];
    const offsets: number[] = [];
    let len = 0;
    const push = (p: Uint8Array | string) => { const b = typeof p === "string" ? enc.encode(p) : p; parts.push(b); len += b.length; };
    const obj = (n: number, body: () => void) => { offsets[n] = len; push(`${n} 0 obj\n`); body(); push("\nendobj\n"); };

    const content = `q ${pw} 0 0 ${ph} 0 0 cm /Im0 Do Q`;
    push("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
    obj(1, () => push("<< /Type /Catalog /Pages 2 0 R >>"));
    obj(2, () => push("<< /Type /Pages /Kids [3 0 R] /Count 1 >>"));
    obj(3, () => push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pw} ${ph}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`));
    obj(4, () => {
        push(`<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`);
        push(jpeg);
        push("\nendstream");
    });
    obj(5, () => push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`));
    const xref = len;
    push(`xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(o => `${String(o).padStart(10, "0")} 00000 n \n`).join("")}`);
    push(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
    return new Blob(parts as BlobPart[], { type: "application/pdf" });
}
