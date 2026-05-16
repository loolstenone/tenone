import BrandGravityHeader from "@/features/brandgravity/BrandGravityHeader";
import { BrandGravityFooter } from "@/features/brandgravity/BrandGravityFooter";

export default function BrandGravityLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <BrandGravityHeader />
            {children}
            <BrandGravityFooter />
        </>
    );
}
