/**
 * 미리보기 이미지(next/og)용 한글 글꼴 — 화면에 쓰인 글자만 Google Fonts에서 받아 온다.
 * 실패하면 null (이미지는 그대로 만들어지되 한글이 빠질 수 있다)
 */
export async function loadKoreanFont(text: string, weight = 900): Promise<ArrayBuffer | null> {
    try {
        const css = await (await fetch(`https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@${weight}&text=${encodeURIComponent(text)}`)).text();
        const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
        if (!src) return null;
        const res = await fetch(src);
        return res.ok ? await res.arrayBuffer() : null;
    } catch {
        return null;
    }
}
