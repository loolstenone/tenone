"use client";

interface Cover {
    key: string;
    label: string;
    pattern: 'solid' | 'gradient' | 'grid' | 'dot' | 'paper' | 'line' | 'stripe' | 'circle';
    primary_color: string;
    accent_color: string | null;
    emoji: string | null;
}

export function CoverRender({ cover, size = "md", showLabel = false }: { cover: Cover; size?: "sm" | "md" | "lg"; showLabel?: boolean }) {
    const dims = size === "sm" ? "w-10 h-14" : size === "lg" ? "w-40 h-56" : "w-20 h-28";
    const emojiSize = size === "sm" ? "text-base" : size === "lg" ? "text-5xl" : "text-2xl";
    const labelSize = size === "lg" ? "text-sm" : "text-[9px]";

    return (
        <div
            className={`${dims} rounded-md shadow-sm flex flex-col items-center justify-center relative overflow-hidden`}
            style={getCoverStyle(cover)}
        >
            {cover.pattern === "grid" && <GridPattern accent={cover.accent_color || "#D1D5DB"} />}
            {cover.pattern === "dot" && <DotPattern accent={cover.accent_color || "#6B7280"} />}
            {cover.pattern === "line" && <LinePattern accent={cover.accent_color || "#D4A574"} />}
            {cover.pattern === "stripe" && <StripePattern accent={cover.accent_color || "#D4A574"} />}
            {cover.pattern === "circle" && <CirclePattern accent={cover.accent_color || "#FB923C"} />}
            {cover.pattern === "paper" && <PaperTexture />}

            {cover.emoji && (
                <span className={`${emojiSize} relative z-10 mt-2`}>{cover.emoji}</span>
            )}
            {showLabel && (
                <span
                    className={`${labelSize} font-medium mt-2 px-1 relative z-10`}
                    style={{ color: getContrastColor(cover.primary_color) }}
                >
                    {cover.label}
                </span>
            )}
        </div>
    );
}

function getCoverStyle(cover: Cover): React.CSSProperties {
    switch (cover.pattern) {
        case "gradient":
            return {
                background: `linear-gradient(135deg, ${cover.primary_color}, ${cover.accent_color || cover.primary_color})`,
            };
        case "solid":
        default:
            return { backgroundColor: cover.primary_color };
    }
}

function getContrastColor(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luma > 0.6 ? "#1F2937" : "#FFFFFF";
}

function GridPattern({ accent }: { accent: string }) {
    return (
        <div
            className="absolute inset-0 opacity-20"
            style={{
                backgroundImage: `linear-gradient(${accent} 1px, transparent 1px), linear-gradient(90deg, ${accent} 1px, transparent 1px)`,
                backgroundSize: "8px 8px",
            }}
        />
    );
}

function DotPattern({ accent }: { accent: string }) {
    return (
        <div
            className="absolute inset-0 opacity-25"
            style={{
                backgroundImage: `radial-gradient(${accent} 1px, transparent 1px)`,
                backgroundSize: "10px 10px",
            }}
        />
    );
}

function LinePattern({ accent }: { accent: string }) {
    return (
        <div
            className="absolute inset-0 opacity-30"
            style={{
                backgroundImage: `repeating-linear-gradient(0deg, transparent 0, transparent 9px, ${accent} 9px, ${accent} 10px)`,
            }}
        />
    );
}

function StripePattern({ accent }: { accent: string }) {
    return (
        <div
            className="absolute inset-0 opacity-30"
            style={{
                backgroundImage: `repeating-linear-gradient(45deg, transparent 0, transparent 8px, ${accent} 8px, ${accent} 10px)`,
            }}
        />
    );
}

function CirclePattern({ accent }: { accent: string }) {
    return (
        <div
            className="absolute inset-0 opacity-25"
            style={{
                backgroundImage: `radial-gradient(${accent} 4px, transparent 4px)`,
                backgroundSize: "20px 20px",
            }}
        />
    );
}

function PaperTexture() {
    return (
        <div
            className="absolute inset-0 opacity-30"
            style={{
                backgroundImage: `
                    repeating-linear-gradient(0deg, transparent 0, transparent 23px, #D4A574 24px),
                    repeating-linear-gradient(0deg, #8B7355 0, #8B7355 1px, transparent 1px, transparent 100%)`,
                backgroundSize: "100% 24px, 2px 100%",
                backgroundPosition: "0 0, 20px 0",
            }}
        />
    );
}
