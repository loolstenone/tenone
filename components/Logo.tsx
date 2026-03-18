import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";

interface LogoProps {
    variant?: 'horizontal' | 'vertical';
    size?: 'sm' | 'md' | 'lg';
    href?: string;
    className?: string;
}

const dimensions = {
    horizontal: { sm: { w: 72, h: 18 }, md: { w: 110, h: 28 }, lg: { w: 154, h: 40 } },
    vertical: { sm: { w: 28, h: 28 }, md: { w: 40, h: 40 }, lg: { w: 56, h: 56 } },
};

export function Logo({ variant = 'horizontal', size = 'md', href = '/', className }: LogoProps) {
    const src = variant === 'vertical' ? '/logo-vertical.png' : '/logo-horizontal.png';
    const { w, h } = dimensions[variant][size];

    return (
        <Link href={href} className={clsx("inline-flex shrink-0 select-none", className)}>
            <Image src={src} alt="TEN ONE" width={w} height={h} priority />
        </Link>
    );
}
