"use client";

interface ConfirmSheetProps {
    open: boolean;
    message: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmSheet({
    open,
    message,
    description,
    confirmLabel = "삭제",
    cancelLabel = "취소",
    danger = true,
    onConfirm,
    onCancel,
}: ConfirmSheetProps) {
    if (!open) return null;
    return (
        <div
            className="fixed inset-0 z-[9999] flex items-start sm:items-center justify-center bg-black/40 px-4 pt-16 sm:pt-0"
            onClick={onCancel}
        >
            <div
                className="bg-white w-full max-w-sm rounded-b-2xl sm:rounded-2xl shadow-2xl p-5"
                onClick={(e) => e.stopPropagation()}
            >
                <p className="text-sm font-semibold text-neutral-900">{message}</p>
                {description && (
                    <p className="text-xs text-neutral-500 mt-1">{description}</p>
                )}
                <div className="flex gap-2 justify-end mt-5">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-sm text-white rounded-lg transition-colors ${
                            danger
                                ? "bg-rose-500 hover:bg-rose-600"
                                : "bg-[#0F766E] hover:bg-[#0F766E]/90"
                        }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
