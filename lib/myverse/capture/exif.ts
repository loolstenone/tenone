// 사진/영상 EXIF → 5축 메타 추출 (클라이언트 사이드)
//
// exifr 사용 — DateTimeOriginal·GPS·카메라 정보 등 추출.
// 추출된 5축은 서버로 전송되어 분류 엔진의 입력으로 사용됨.

import exifr from "exifr";
import type { TimeAxis, GeoAxis } from "../domains";

export interface ExtractedMeta {
    time_axis: TimeAxis;
    geo_axis: GeoAxis;
    /** 원본 파일 정보 (디버깅용) */
    raw?: {
        camera?: string;
        orientation?: number;
        width?: number;
        height?: number;
    };
}

/** 파일에서 EXIF 추출 — 실패 시 best-effort */
export async function extractExif(file: File): Promise<ExtractedMeta> {
    const time_axis: TimeAxis = {};
    const geo_axis: GeoAxis = {};
    const raw: ExtractedMeta["raw"] = {};

    // 파일 modifiedDate fallback
    if (file.lastModified) {
        time_axis.at = new Date(file.lastModified).toISOString();
    }

    if (!file.type.startsWith("image/")) {
        // 영상은 EXIF 추출 불가 — lastModified만 사용
        return { time_axis, geo_axis, raw };
    }

    try {
        const data = await exifr.parse(file, {
            tiff: true, exif: true, gps: true,
            // 'pick' 으로 필요한 것만
            pick: ["DateTimeOriginal", "CreateDate", "OffsetTimeOriginal", "Make", "Model", "Orientation", "ImageWidth", "ImageHeight", "latitude", "longitude"],
        });

        if (data) {
            // 시간
            const dt = data.DateTimeOriginal ?? data.CreateDate;
            if (dt instanceof Date) {
                time_axis.at = dt.toISOString();
                time_axis.date = isoToDate(dt);
                time_axis.day_of_week = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][dt.getDay()];
                time_axis.period = hourToPeriod(dt.getHours());
            }

            // 위치
            if (typeof data.latitude === "number" && typeof data.longitude === "number") {
                geo_axis.lat = data.latitude;
                geo_axis.lng = data.longitude;
            }

            // 원본
            if (data.Make && data.Model) raw.camera = `${data.Make} ${data.Model}`;
            if (data.Orientation) raw.orientation = data.Orientation;
            if (data.ImageWidth) raw.width = data.ImageWidth;
            if (data.ImageHeight) raw.height = data.ImageHeight;
        }
    } catch { /* silent */ }

    return { time_axis, geo_axis, raw };
}

function isoToDate(d: Date): string {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Seoul",
        year: "numeric", month: "2-digit", day: "2-digit",
    }).format(d);
}

function hourToPeriod(h: number): TimeAxis["period"] {
    if (h < 6) return "dawn";
    if (h < 12) return "morning";
    if (h < 18) return "afternoon";
    if (h < 22) return "evening";
    return "night";
}
