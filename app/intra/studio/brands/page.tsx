import { brands } from "@/lib/data";
import { BrandCard } from "@/components/BrandCard";
import { Plus } from "lucide-react";

export default function BrandsPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold">Brands & IPs</h2>
                    <p className="mt-1 text-sm text-neutral-500">Ten:One™ Universe 브랜드 및 프로젝트 관리</p>
                </div>
                <button className="flex items-center gap-2 bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors">
                    <Plus className="h-4 w-4" />
                    Add New Brand
                </button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {brands.map((brand) => (
                    <BrandCard key={brand.id} brand={brand} />
                ))}
            </div>
        </div>
    );
}
