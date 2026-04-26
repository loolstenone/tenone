"use client";

import { UniverseFooter } from "@/components/UniverseFooter";

export function OgamjaFooter() {
    return (
        <UniverseFooter
            brandName="공감자"
            tagline="하찮고 귀여운 감자들의 공감 이야기"
            accentColor="#F5C518"
            dark={true}
            linkColumns={[
                {
                    title: "Main Menu",
                    links: [
                        { label: "About Ogamja", href: "/ogamja/about" },
                        { label: "필찐감자", href: "/ogamja/writers" },
                        { label: "프로그램", href: "/ogamja/programs" },
                    ],
                },
            ]}
        />
    );
}
