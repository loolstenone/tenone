import { brands } from "@/lib/data";
import { BrandCard } from "@/components/BrandCard";
import { Plus } from "lucide-react";

export default function BrandsPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Brands & IPs</h2>
                    <p className="mt-2 text-zinc-400">Manage Ten:One™ Universe brands, projects, and creator profiles.</p>
                </div>
                <button className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors">
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
