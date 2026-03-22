import { UniverseTimelineItem, UniverseNode, UniverseLink } from "@/types/universe";

export const timelineData: UniverseTimelineItem[] = [
    {
        id: "t1",
        year: "Before 2024",
        title: "The Destruction of Lumina",
        description: "The planet Lumina is destroyed. Four shards of light escape into the cosmos.",
        category: "Origin",
        relatedBrands: ["luki"],
    },
    {
        id: "t2",
        year: "2024.04",
        title: "RooK Awakens",
        description: "AI Creator RooK begins activity on Earth. 'The early bird' philosophy is established.",
        category: "Expansion",
        relatedBrands: ["rook"],
    },
    {
        id: "t3",
        year: "2024.08",
        title: "LUKI Landmark",
        description: "The four shards land on Earth and form the group LUKI to gather light through music.",
        category: "Expansion",
        relatedBrands: ["luki", "rook"],
    },
    {
        id: "t4",
        year: "2025.01",
        title: "Badak Foundation",
        description: "Marketing network 'Badak' is formed to support the earthly activities of the Universe.",
        category: "Resolution",
        relatedBrands: ["badak", "youinone"],
    },
    {
        id: "t5",
        year: "2025.11",
        title: "MAD League Assembly",
        description: "University students gather to form the MAD League, expanding the creative energy.",
        category: "Expansion",
        relatedBrands: ["madleague"],
    }
];

// Simple coordinate mapping for a static SVG graph
export const universeNodes: UniverseNode[] = [
    { id: "tenone", label: "Ten:One™", group: "Core", x: 400, y: 300 },
    { id: "luki", label: "LUKI", group: "Branch", x: 400, y: 150 },
    { id: "rook", label: "RooK", group: "Branch", x: 600, y: 200 },
    { id: "badak", label: "Badak", group: "Branch", x: 200, y: 400 },
    { id: "madleague", label: "MAD League", group: "External", x: 300, y: 500 },
    { id: "youinone", label: "YouInOne", group: "Branch", x: 550, y: 450 },
    { id: "hero", label: "HeRo", group: "External", x: 700, y: 300 },
];

export const universeLinks: UniverseLink[] = [
    { source: "tenone", target: "luki", label: "Managed By", type: "Parent" },
    { source: "tenone", target: "rook", label: "Managed By", type: "Parent" },
    { source: "tenone", target: "badak", label: "Network", type: "Support" },
    { source: "tenone", target: "youinone", label: "Alliance", type: "Parent" },
    { source: "luki", target: "rook", label: "Visual Director", type: "Collaboration" },
    { source: "badak", target: "madleague", label: "Sponsor", type: "Support" },
    { source: "youinone", target: "hero", label: "Agent", type: "Parent" },
];
