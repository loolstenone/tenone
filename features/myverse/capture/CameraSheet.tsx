"use client";

import { useEffect, useRef, useState } from "react";
import { X, RotateCcw, Camera, Video, Circle, Square } from "lucide-react";
import { useCamera, CameraMode } from "@/lib/myverse/use-camera";

interface CameraSheetProps {
    mode: CameraMode;
    onCapture: (file: File) => void;
    onClose: () => void;
}

export function CameraSheet({ mode, onCapture, onClose }: CameraSheetProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const { state, facingMode, error, startPreview, capturePhoto, startRecording, stopRecording, flipCamera, cancel } = useCamera();

    const [recSec, setRecSec] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (videoRef.current) startPreview(mode, videoRef.current);
        return () => {
            cancel();
            if (timerRef.current) clearInterval(timerRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handleClose() {
        cancel();
        onClose();
    }

    async function handleFlip() {
        if (videoRef.current) await flipCamera(videoRef.current);
    }

    async function handleShutter() {
        if (mode === "photo") {
            if (!videoRef.current) return;
            const result = await capturePhoto(videoRef.current);
            if (result) { onCapture(result.file); onClose(); }
        } else {
            if (state === "previewing") {
                startRecording();
                setRecSec(0);
                timerRef.current = setInterval(() => setRecSec(s => s + 1), 1000);
            } else if (state === "recording") {
                if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
                const result = await stopRecording();
                if (result) { onCapture(result.file); onClose(); }
            }
        }
    }

    const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

    return (
        <div className="fixed inset-0 z-[9500] bg-black flex flex-col select-none">
            {/* Viewfinder */}
            <div className="relative flex-1 overflow-hidden">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ transform: facingMode === "user" ? "scaleX(-1)" : undefined }}
                />

                {/* Loading overlay */}
                {(state === "idle" || state === "requesting") && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                )}

                {/* Error overlay */}
                {error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 px-8 text-center">
                        <Camera className="w-10 h-10 text-white/40" />
                        <p className="text-white/80 text-sm leading-relaxed">{error}</p>
                        <button
                            onClick={handleClose}
                            className="mt-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm"
                        >
                            닫기
                        </button>
                    </div>
                )}

                {/* Top bar */}
                <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-safe-top pb-3 bg-gradient-to-b from-black/50">
                    <button
                        onClick={handleClose}
                        className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-white active:scale-95"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Recording timer */}
                    {state === "recording" && (
                        <div className="flex items-center gap-1.5 bg-black/40 rounded-full px-3 py-1">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-white text-sm font-mono tabular-nums">{fmtTime(recSec)}</span>
                        </div>
                    )}

                    <div className="w-10" />
                </div>

                {/* Flip button */}
                {!error && state !== "recording" && (
                    <button
                        onClick={handleFlip}
                        disabled={state === "requesting" || state === "stopping"}
                        className="absolute bottom-28 right-6 w-11 h-11 rounded-full bg-black/30 flex items-center justify-center text-white active:scale-95 disabled:opacity-40"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Bottom controls */}
            <div className="flex items-center justify-center gap-8 pb-safe-bottom py-6 bg-black">
                {/* Shutter / Record */}
                <button
                    onClick={handleShutter}
                    disabled={state === "requesting" || state === "stopping" || !!error}
                    className="active:scale-95 disabled:opacity-40 transition-transform"
                    aria-label={mode === "photo" ? "촬영" : state === "recording" ? "녹화 중지" : "녹화 시작"}
                >
                    {mode === "photo" ? (
                        <div className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-white" />
                        </div>
                    ) : state === "recording" ? (
                        <div className="w-16 h-16 rounded-full border-4 border-red-500 flex items-center justify-center">
                            <Square className="w-7 h-7 fill-red-500 text-red-500" />
                        </div>
                    ) : (
                        <div className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center">
                            <Circle className="w-8 h-8 fill-red-500 text-red-500" />
                        </div>
                    )}
                </button>
            </div>
        </div>
    );
}
