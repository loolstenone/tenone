// Myverse EXIF — 서버 사이드 메타데이터 추출
// exifr 라이브러리 사용. JPEG/HEIC/PNG 지원.

import exifr from "exifr";

export interface ExifMeta {
    /** 촬영 일시 (ISO 8601) */
    happened_at: string | null;
    /** GPS 좌표 (있을 때) */
    gps: { lat: number; lon: number } | null;
    /** EXIF 픽셀 크기 */
    width: number | null;
    height: number | null;
    /** 카메라/기기 정보 (간단) */
    make: string | null;
    model: string | null;
}

const EMPTY: ExifMeta = {
    happened_at: null, gps: null, width: null, height: null, make: null, model: null,
};

export async function extractExif(buffer: ArrayBuffer | Buffer): Promise<ExifMeta> {
    try {
        const parsed = await exifr.parse(buffer, true);
        if (!parsed) return EMPTY;

        const date: Date | undefined =
            parsed.DateTimeOriginal ??
            parsed.CreateDate ??
            parsed.ModifyDate ??
            parsed.DateTime;

        const lat = typeof parsed.latitude === "number" ? parsed.latitude : null;
        const lon = typeof parsed.longitude === "number" ? parsed.longitude : null;

        return {
            happened_at: date instanceof Date && !isNaN(date.getTime()) ? date.toISOString() : null,
            gps: lat != null && lon != null ? { lat, lon } : null,
            width: typeof parsed.ExifImageWidth === "number" ? parsed.ExifImageWidth : (typeof parsed.ImageWidth === "number" ? parsed.ImageWidth : null),
            height: typeof parsed.ExifImageHeight === "number" ? parsed.ExifImageHeight : (typeof parsed.ImageHeight === "number" ? parsed.ImageHeight : null),
            make: typeof parsed.Make === "string" ? parsed.Make.slice(0, 50) : null,
            model: typeof parsed.Model === "string" ? parsed.Model.slice(0, 80) : null,
        };
    } catch (e) {
        console.warn("[exif] parse failed:", (e as Error).message);
        return EMPTY;
    }
}

/** GPS → "위도, 경도" 짧은 문자열 (역지오코딩 fallback) */
export function gpsToLabel(gps: { lat: number; lon: number }): string {
    return `${gps.lat.toFixed(4)}, ${gps.lon.toFixed(4)}`;
}

/** Nominatim 역지오코딩 — 무료, rate-limited(1/s). 실패해도 좌표 fallback. */
export async function reverseGeocode(gps: { lat: number; lon: number }): Promise<string> {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${gps.lat}&lon=${gps.lon}&format=json&accept-language=ko&zoom=14`;
        const res = await fetch(url, {
            headers: { "User-Agent": "Myverse/1.0 (myverse.kr)" },
            signal: AbortSignal.timeout(3000),
        });
        if (!res.ok) return gpsToLabel(gps);
        const data = await res.json() as { display_name?: string; address?: Record<string, string> };
        const a = data.address ?? {};
        const parts = [
            a.suburb ?? a.neighbourhood ?? a.city_district ?? a.borough,
            a.city ?? a.town ?? a.village ?? a.county,
        ].filter(Boolean);
        return parts.length > 0 ? parts.join(", ") : (data.display_name ?? gpsToLabel(gps));
    } catch {
        return gpsToLabel(gps);
    }
}
