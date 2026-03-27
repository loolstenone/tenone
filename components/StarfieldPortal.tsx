"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * 팅커벨 포탈 v3
 * 1단계: 금빛/은빛 가루가 떨어짐 (3초)
 * 2단계: 빛이 중앙으로 소용돌이치며 빨려들어감
 * 3단계: 모인 빛 가운데가 동그랗게 열리며 포탈 형성
 * 4단계: 클릭 유도 (커서 포인터 + 펄스)
 * 5단계: 클릭 → 빛 폭발 → 인트라 이동
 */
export function StarfieldPortal({ isAuthenticated }: { isAuthenticated: boolean }) {
    const router = useRouter();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);
    const phaseRef = useRef<"falling" | "spiraling" | "portal" | "explode">("falling");
    const frameRef = useRef(0);
    const [portalReady, setPortalReady] = useState(false);
    const [portalActive, setPortalActive] = useState(false);
    const [orbHovered, setOrbHovered] = useState(false);

    const handlePortalClick = useCallback(() => {
        if (!portalReady) return;
        phaseRef.current = "explode";
        setPortalActive(true);
        setTimeout(() => {
            router.push("/intra/myverse");
        }, 1500);
    }, [router, portalReady]);

    useEffect(() => {
        if (!isAuthenticated) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        resize();
        window.addEventListener("resize", resize);

        interface Particle {
            x: number; y: number;
            vx: number; vy: number;
            size: number; alpha: number;
            color: string; angle: number;
            dist: number; // 중앙까지 거리
        }

        const particles: Particle[] = [];
        const cx = () => canvas.width / 2;
        const cy = () => canvas.height / 2;

        const colors = [
            "255,195,50", "255,180,30", "255,215,100",
            "255,230,160", "210,200,240", "240,235,255",
        ];

        let portalOpacity = 0;
        let portalRadius = 0;
        let ringPulse = 0;

        const spawnParticle = () => {
            // 화면 위/좌/우에서 랜덤 생성
            const side = Math.random();
            let x: number, y: number;
            if (side < 0.4) { x = Math.random() * canvas.width; y = -10; }
            else if (side < 0.7) { x = -10; y = Math.random() * canvas.height * 0.5; }
            else { x = canvas.width + 10; y = Math.random() * canvas.height * 0.5; }

            particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 2,
                vy: 1 + Math.random() * 2,
                size: Math.random() * 2.5 + 1,
                alpha: Math.random() * 0.5 + 0.5,
                color: colors[Math.floor(Math.random() * colors.length)],
                angle: Math.atan2(cy() - y, cx() - x),
                dist: 0,
            });
        }

        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            frameRef.current++;
            const f = frameRef.current;
            const centerX = cx();
            const centerY = cy();

            // Phase 전환
            if (f < 90) phaseRef.current = "falling";        // ~1.5초: 떨어지기
            else if (f < 240) phaseRef.current = "spiraling"; // ~2.5초: 소용돌이
            else if (phaseRef.current !== "explode") {
                phaseRef.current = "portal";
                setPortalReady(true);
            }

            const phase = phaseRef.current;

            // 파티클 생성 (falling/spiraling 단계)
            if (phase === "falling" && f % 2 === 0 && particles.length < 120) {
                spawnParticle(); spawnParticle();
            }
            if (phase === "spiraling" && f % 4 === 0 && particles.length < 80) {
                spawnParticle();
            }

            // 파티클 업데이트
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                const dx = centerX - p.x;
                const dy = centerY - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                p.dist = dist;

                if (phase === "falling") {
                    // 자유 낙하 + 약한 중앙 인력
                    p.x += p.vx;
                    p.y += p.vy;
                    if (f > 50) {
                        p.vx += (dx / dist) * 0.02;
                        p.vy += (dy / dist) * 0.02;
                    }
                } else if (phase === "spiraling" || phase === "portal") {
                    // 소용돌이: 접선 방향 + 중심 인력
                    const angle = Math.atan2(dy, dx);
                    const tangentX = -Math.sin(angle);
                    const tangentY = Math.cos(angle);
                    const spiralSpeed = Math.max(0.5, 8 - dist * 0.01);
                    const pullStrength = phase === "portal" ? 0.4 : 0.2;

                    p.vx = tangentX * spiralSpeed + (dx / dist) * pullStrength;
                    p.vy = tangentY * spiralSpeed + (dy / dist) * pullStrength;
                    p.vx *= 0.95;
                    p.vy *= 0.95;
                    p.x += p.vx;
                    p.y += p.vy;
                } else if (phase === "explode") {
                    // 폭발: 중심에서 바깥으로
                    const angle = Math.atan2(p.y - centerY, p.x - centerX);
                    p.vx = Math.cos(angle) * 15;
                    p.vy = Math.sin(angle) * 15;
                    p.x += p.vx;
                    p.y += p.vy;
                    p.alpha *= 0.95;
                }

                // 중앙 흡수 (spiraling/portal)
                if ((phase === "spiraling" || phase === "portal") && dist < 20) {
                    particles.splice(i, 1);
                    continue;
                }
                // 화면 밖 제거
                if (p.x < -50 || p.x > canvas.width + 50 || p.y > canvas.height + 50 || p.alpha < 0.01) {
                    particles.splice(i, 1);
                    continue;
                }

                // 파티클 그리기
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
                ctx.fill();

                // 꼬리 (이동 방향 반대로 작은 트레일)
                if (phase === "spiraling" || phase === "falling") {
                    ctx.beginPath();
                    ctx.arc(p.x - p.vx * 2, p.y - p.vy * 2, p.size * 0.5, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${p.color},${p.alpha * 0.3})`;
                    ctx.fill();
                }

                // 글로우
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.color},${p.alpha * 0.08})`;
                ctx.fill();
            }

            // ── 포탈 (3단계) ──
            if (phase === "portal" || phase === "explode") {
                portalOpacity = Math.min(1, portalOpacity + 0.02);
                portalRadius = Math.min(28, portalRadius + 0.5);
                ringPulse += 0.05;

                if (phase !== "explode") {
                    const pr = portalRadius;
                    const pulse = 1 + Math.sin(ringPulse) * 0.12;
                    const r = pr * pulse;

                    // 외곽 소용돌이 링
                    for (let ring = 0; ring < 3; ring++) {
                        const ringR = r * (2 + ring * 0.8);
                        const ringAlpha = (0.15 - ring * 0.04) * portalOpacity;
                        ctx.beginPath();
                        ctx.arc(centerX, centerY, ringR, 0, Math.PI * 2);
                        ctx.strokeStyle = `rgba(255,210,100,${ringAlpha})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }

                    // 중앙 열리는 원 (포탈 홀)
                    const holeGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, r * 1.5);
                    holeGrad.addColorStop(0, `rgba(20,15,40,${0.7 * portalOpacity})`);
                    holeGrad.addColorStop(0.5, `rgba(60,40,100,${0.3 * portalOpacity})`);
                    holeGrad.addColorStop(1, "rgba(0,0,0,0)");
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, r * 1.5, 0, Math.PI * 2);
                    ctx.fillStyle = holeGrad;
                    ctx.fill();

                    // 골드 림
                    const rimGrad = ctx.createRadialGradient(centerX, centerY, r * 0.8, centerX, centerY, r * 2);
                    rimGrad.addColorStop(0, "rgba(255,200,60,0)");
                    rimGrad.addColorStop(0.5, `rgba(255,210,80,${0.5 * portalOpacity * pulse})`);
                    rimGrad.addColorStop(1, "rgba(255,220,100,0)");
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, r * 2, 0, Math.PI * 2);
                    ctx.fillStyle = rimGrad;
                    ctx.fill();

                    // "Click" 텍스트 펄스
                    const textAlpha = (0.4 + Math.sin(ringPulse * 2) * 0.3) * portalOpacity;
                    ctx.font = "bold 10px sans-serif";
                    ctx.textAlign = "center";
                    ctx.fillStyle = `rgba(255,220,150,${textAlpha})`;
                    ctx.fillText("✦ ENTER", centerX, centerY + r * 3.5);

                    // 소용돌이 암 (회전하는 빛줄기)
                    for (let arm = 0; arm < 4; arm++) {
                        const armAngle = ringPulse * 2 + arm * (Math.PI / 2);
                        for (let dot = 0; dot < 8; dot++) {
                            const dotDist = r * 1.5 + dot * 6;
                            const dotAngle = armAngle + dot * 0.15;
                            const dotX = centerX + Math.cos(dotAngle) * dotDist;
                            const dotY = centerY + Math.sin(dotAngle) * dotDist;
                            const dotAlpha = (0.3 - dot * 0.035) * portalOpacity;
                            if (dotAlpha <= 0) continue;
                            ctx.beginPath();
                            ctx.arc(dotX, dotY, 1.2, 0, Math.PI * 2);
                            ctx.fillStyle = `rgba(255,215,100,${dotAlpha})`;
                            ctx.fill();
                        }
                    }
                }
            }

            // 폭발 후 페이드
            if (phase === "explode" && portalOpacity > 0) {
                portalOpacity -= 0.03;
            }

            animRef.current = requestAnimationFrame(animate);
        }

        animRef.current = requestAnimationFrame(animate);
        return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
    }, [isAuthenticated]);

    if (!isAuthenticated) return null;

    return (
        <>
            <canvas ref={canvasRef} className="fixed inset-0 z-[9998] pointer-events-none" />

            {/* 클릭 영역 — 포탈 준비되면 활성화 */}
            {portalReady && !portalActive && (
                <div
                    className="fixed z-[9999]"
                    style={{
                        left: "50%", top: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "120px", height: "120px",
                        borderRadius: "50%",
                        cursor: "pointer",
                    }}
                    onMouseEnter={() => setOrbHovered(true)}
                    onMouseLeave={() => setOrbHovered(false)}
                    onClick={handlePortalClick}
                >
                    {orbHovered && (
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
                            <span className="bg-black/80 text-amber-200 text-[11px] px-3 py-1.5 rounded-full backdrop-blur-sm font-medium">
                                ✦ Platform 10:01
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* 포탈 트랜지션 오버레이 */}
            {portalActive && (
                <div className="fixed inset-0 z-[10000]">
                    <div className="absolute inset-0 bg-black" style={{ animation: "portalBgIn 0.8s ease forwards" }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center" style={{ animation: "portalTextIn 1.5s ease forwards" }}>
                            <div className="text-amber-200/90 text-3xl font-bold tracking-[0.3em] mb-2">10:01</div>
                            <div className="text-white/30 text-[10px] tracking-[0.5em] uppercase">Entering the Universe</div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes portalBgIn {
                    0% { opacity: 0; }
                    100% { opacity: 1; }
                }
                @keyframes portalTextIn {
                    0%, 40% { opacity: 0; transform: scale(0.8); }
                    60% { opacity: 1; transform: scale(1.05); }
                    100% { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </>
    );
}
