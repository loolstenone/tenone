import { brands } from "@/lib/data";
import { BrandCard } from "@/components/BrandCard";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";

export default function BrandsPage() {
    return (
        <div className="space-y-8">
            <PageHeader title="Brands & IPs" description="Ten:One™ Universe 브랜드 및 프로젝트 관리">
                <button className="flex items-center gap-2 bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors">
                    <Plus className="h-4 w-4" />
                    Add New Brand
                </button>
            </PageHeader>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {brands.map((brand) => (
                    <BrandCard key={brand.id} brand={brand} />
                ))}
            </div>
        </div>
    );
}
