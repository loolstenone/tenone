"use client";

import { useState } from "react";
import { X, Info } from "lucide-react";
import HitModelGuide from "./HitModelGuide";

export default function HitModelGuideModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 text-neutral-600 text-sm font-medium rounded-xl hover:bg-neutral-50 transition-colors"
      >
        <Info className="h-4 w-4" />
        검사 설명
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8 relative shadow-xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-neutral-100 text-neutral-400"
            >
              <X className="h-5 w-5" />
            </button>
            <HitModelGuide mode="modal" />
          </div>
        </div>
      )}
    </>
  );
}
