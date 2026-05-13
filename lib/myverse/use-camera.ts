"use client";

import { useRef, useState, useCallback } from "react";

export type CameraMode = "photo" | "video";
export type CameraFacing = "environment" | "user";
export type CameraState = "idle" | "requesting" | "previewing" | "recording" | "stopping";

export interface CameraResult {
    file: File;
    objectUrl: string;
    mimeType: string;
    mode: CameraMode;
    durationSec?: number;
}

export interface UseCamera {
    state: CameraState;
    facingMode: CameraFacing;
    error: string | null;
    startPreview: (mode: CameraMode, videoEl: HTMLVideoElement) => Promise<void>;
    capturePhoto: (videoEl: HTMLVideoElement) => Promise<CameraResult | null>;
    startRecording: () => void;
    stopRecording: () => Promise<CameraResult | null>;
    flipCamera: (videoEl: HTMLVideoElement) => Promise<void>;
    cancel: () => void;
}

function pickVideoMime(): string {
    const types = [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm",
        "video/mp4",
    ];
    for (const t of types) {
        if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) return t;
    }
    return "video/webm";
}

function friendlyError(e: unknown): string {
    if (e instanceof DOMException) {
        if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError")
            return "카메라 권한이 거부됐어요. 브라우저 설정에서 허용해 주세요.";
        if (e.name === "NotFoundError" || e.name === "DevicesNotFoundError")
            return "카메라 장치를 찾을 수 없어요.";
        if (e.name === "NotReadableError" || e.name === "TrackStartError")
            return "카메라가 다른 앱에서 사용 중이에요.";
        if (e.name === "OverconstrainedError")
            return "요청한 카메라 설정을 지원하지 않아요.";
    }
    return "카메라를 열 수 없어요.";
}

export function useCamera(): UseCamera {
    const [state, setState] = useState<CameraState>("idle");
    const [facingMode, setFacingMode] = useState<CameraFacing>("environment");
    const [error, setError] = useState<string | null>(null);

    const streamRef = useRef<MediaStream | null>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const modeRef = useRef<CameraMode>("photo");
    const startedAtRef = useRef<number>(0);
    const resolveCaptureRef = useRef<((result: CameraResult | null) => void) | null>(null);

    const stopStream = useCallback(() => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
    }, []);

    const startPreview = useCallback(async (mode: CameraMode, videoEl: HTMLVideoElement) => {
        setError(null);
        setState("requesting");
        modeRef.current = mode;
        try {
            const constraints: MediaStreamConstraints = {
                video: {
                    facingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: mode === "video",
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;
            videoEl.srcObject = stream;
            await videoEl.play();
            setState("previewing");
        } catch (e) {
            stopStream();
            setError(friendlyError(e));
            setState("idle");
        }
    }, [facingMode, stopStream]);

    const capturePhoto = useCallback(async (videoEl: HTMLVideoElement): Promise<CameraResult | null> => {
        if (!streamRef.current || state !== "previewing") return null;
        try {
            const canvas = document.createElement("canvas");
            canvas.width = videoEl.videoWidth || 1280;
            canvas.height = videoEl.videoHeight || 720;
            const ctx = canvas.getContext("2d");
            if (!ctx) return null;
            ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
            return new Promise<CameraResult | null>(resolve => {
                canvas.toBlob(blob => {
                    if (!blob) { resolve(null); return; }
                    const file = new File([blob], `photo_${Date.now()}.jpg`, { type: "image/jpeg" });
                    const objectUrl = URL.createObjectURL(file);
                    resolve({ file, objectUrl, mimeType: "image/jpeg", mode: "photo" });
                }, "image/jpeg", 0.92);
            });
        } catch {
            return null;
        }
    }, [state]);

    const startRecording = useCallback(() => {
        if (!streamRef.current || state !== "previewing") return;
        chunksRef.current = [];
        const mimeType = pickVideoMime();
        const rec = new MediaRecorder(streamRef.current, { mimeType });
        recorderRef.current = rec;
        rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
        rec.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: mimeType });
            const ext = mimeType.includes("mp4") ? "mp4" : "webm";
            const file = new File([blob], `video_${Date.now()}.${ext}`, { type: mimeType });
            const objectUrl = URL.createObjectURL(file);
            const durationSec = (Date.now() - startedAtRef.current) / 1000;
            resolveCaptureRef.current?.({ file, objectUrl, mimeType, mode: "video", durationSec });
            resolveCaptureRef.current = null;
            setState("previewing");
        };
        rec.start(200);
        startedAtRef.current = Date.now();
        setState("recording");
    }, [state]);

    const stopRecording = useCallback((): Promise<CameraResult | null> => {
        return new Promise(resolve => {
            if (!recorderRef.current || recorderRef.current.state === "inactive") {
                resolve(null);
                return;
            }
            setState("stopping");
            resolveCaptureRef.current = resolve;
            recorderRef.current.stop();
        });
    }, []);

    const flipCamera = useCallback(async (videoEl: HTMLVideoElement) => {
        const newFacing: CameraFacing = facingMode === "environment" ? "user" : "environment";
        stopStream();
        setFacingMode(newFacing);
        setState("requesting");
        try {
            const constraints: MediaStreamConstraints = {
                video: {
                    facingMode: newFacing,
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: modeRef.current === "video",
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;
            videoEl.srcObject = stream;
            await videoEl.play();
            setState("previewing");
        } catch (e) {
            stopStream();
            setError(friendlyError(e));
            setState("idle");
        }
    }, [facingMode, stopStream]);

    const cancel = useCallback(() => {
        if (recorderRef.current && recorderRef.current.state !== "inactive") {
            recorderRef.current.ondataavailable = null;
            recorderRef.current.onstop = null;
            recorderRef.current.stop();
        }
        recorderRef.current = null;
        chunksRef.current = [];
        resolveCaptureRef.current = null;
        stopStream();
        setError(null);
        setState("idle");
    }, [stopStream]);

    return { state, facingMode, error, startPreview, capturePhoto, startRecording, stopRecording, flipCamera, cancel };
}
