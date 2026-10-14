// 공개 이미지 크기 규칙 SSOT (2026-10-15) — 서버 업로드 API와 정리 스크립트(scripts/storage-image-shrink.mjs)가 같이 쓴다
// 원본(수 MB)을 그대로 공개 버킷에 두면 크롤러가 반복해서 받아 Supabase 전송량이 바닥난다 (RooK 이미지 1GB/일 사고)
// 규칙: 긴 변 최대 2000px · WebP 품질 80 · 움직이는 GIF는 움직이는 WebP로 (첫 장만 남기지 않는다)

export const IMAGE_MAX_DIMENSION = 2000;
export const IMAGE_WEBP_QUALITY = 80;

/**
 * 이미지 버퍼 → 웹용 WebP 버퍼. 읽을 수 없는 형식(SVG 등)이면 null
 * @param {any} sharp sharp 모듈 (호출하는 쪽이 넘긴다 — 스크립트·서버의 sharp 위치가 다름)
 * @param {Buffer} buffer
 * @returns {Promise<Buffer | null>}
 */
export async function shrinkImage(sharp, buffer) {
    try {
        const img = sharp(buffer, { animated: true, limitInputPixels: false });
        const meta = await img.metadata();
        if (!meta.format || meta.format === 'svg') return null;
        return await img
            .rotate() // 휴대폰 사진 방향(EXIF) 반영
            .resize(IMAGE_MAX_DIMENSION, IMAGE_MAX_DIMENSION, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: IMAGE_WEBP_QUALITY, effort: 4 })
            .toBuffer();
    } catch {
        return null;
    }
}
