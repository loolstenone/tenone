"use client";

/**
 * 3D 큐브 포탈 아이콘
 * enter: 화살표가 큐브 좌측면에서 출발 → 안으로
 * exit: 화살표가 큐브 우측면에서 출발 → 밖으로
 */
export function PortalIcon({
    direction = "enter",
    size = 28,
    darkBg = false,
}: {
    direction?: "enter" | "exit";
    size?: number;
    darkBg?: boolean;
}) {
    const isEnter = direction === "enter";

    const topFace = darkBg ? "#ccc" : "#555";
    const leftFace = darkBg ? "#aaa" : "#333";
    const rightFace = darkBg ? "#bbb" : "#444";
    const edgeColor = darkBg ? "#888" : "#222";
    const arrowColor = darkBg ? "#333" : "#fff";

    return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className="shrink-0">
            {/* 큐브 — 등각 투영 */}
            <polygon points="16,4 26,9 16,14 6,9" fill={topFace} />
            <polygon points="6,9 16,14 16,25 6,20" fill={leftFace} />
            <polygon points="26,9 16,14 16,25 26,20" fill={rightFace} />
            <polygon points="16,4 26,9 16,14 6,9" stroke={edgeColor} strokeWidth="0.5" fill="none" />
            <polygon points="6,9 16,14 16,25 6,20" stroke={edgeColor} strokeWidth="0.5" fill="none" />
            <polygon points="26,9 16,14 16,25 26,20" stroke={edgeColor} strokeWidth="0.5" fill="none" />

            {isEnter ? (
                <>
                    {/* 화살표: 큐브 좌측면(x=6)에서 출발 → 안으로(→) */}
                    <line x1="6" y1="17" x2="20" y2="17"
                        stroke={arrowColor} strokeWidth="1.5" strokeLinecap="round" />
                    <polyline points="17,14 20,17 17,20"
                        stroke={arrowColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </>
            ) : (
                <>
                    {/* 화살표: 큐브 우측면(x=26)에 닿음 ← 안에서 밖으로 */}
                    <line x1="12" y1="17" x2="26" y2="17"
                        stroke={arrowColor} strokeWidth="1.5" strokeLinecap="round" />
                    <polyline points="23,14 26,17 23,20"
                        stroke={arrowColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </>
            )}
        </svg>
    );
}
