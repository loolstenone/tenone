"use client";

// 일일 건강·운동·추적 입력 블록 — DailyView에서 분리.
// ExerciseBlock, HealthBlock, TrackingRowWithNote, TrackingRow

export interface ExerciseBlockProps {
    type: string; minutes: string; distance: string; note: string;
    onChange: (patch: { type?: string; minutes?: string; distance?: string; note?: string }) => void;
    onSave: () => void;
}

export function ExerciseBlock({ type, minutes, distance, note, onChange, onSave }: ExerciseBlockProps) {
    const cls = "w-full text-sm border border-neutral-200 rounded px-2 py-1.5 focus:outline-none focus:border-[#6366F1]";
    return (
        <div>
            <p className="text-xs font-semibold text-neutral-700 mb-2">운동 <span className="text-[10px] text-neutral-400 ml-1 font-normal">종류·시간·거리</span></p>
            <div className="grid grid-cols-2 gap-2">
                <input className={cls + " col-span-2"} placeholder="종류 (예: 러닝, 웨이트, 요가)" value={type} onChange={(e) => onChange({ type: e.target.value })} onBlur={onSave} />
                <input className={cls} placeholder="시간 (분)" value={minutes} onChange={(e) => onChange({ minutes: e.target.value.replace(/[^0-9]/g, "") })} onBlur={onSave} inputMode="numeric" />
                <input className={cls} placeholder="거리 (km)" value={distance} onChange={(e) => onChange({ distance: e.target.value.replace(/[^0-9.]/g, "") })} onBlur={onSave} inputMode="decimal" />
                <input className={cls + " col-span-2 text-xs"} placeholder="메모" value={note} onChange={(e) => onChange({ note: e.target.value })} onBlur={onSave} />
            </div>
        </div>
    );
}

export interface HealthBlockProps {
    sys: string; dia: string; sugar: string; weight: string; temp: string; note: string;
    onChange: (patch: { sys?: string; dia?: string; sugar?: string; weight?: string; temp?: string; note?: string }) => void;
    onSave: () => void;
}

export function HealthBlock({ sys, dia, sugar, weight, temp, note, onChange, onSave }: HealthBlockProps) {
    const cls = "w-full text-sm border border-neutral-200 rounded px-2 py-1.5 focus:outline-none focus:border-[#6366F1]";
    const onlyNum = (v: string, dec = false) => v.replace(dec ? /[^0-9.]/g : /[^0-9]/g, "");
    return (
        <div>
            <p className="text-xs font-semibold text-neutral-700 mb-2">건강 <span className="text-[10px] text-neutral-400 ml-1 font-normal">혈압·혈당·체중·체온</span></p>
            <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                    <input className={cls} placeholder="수축기 (mmHg)" value={sys} onChange={(e) => onChange({ sys: onlyNum(e.target.value) })} onBlur={onSave} inputMode="numeric" />
                    <input className={cls} placeholder="이완기 (mmHg)" value={dia} onChange={(e) => onChange({ dia: onlyNum(e.target.value) })} onBlur={onSave} inputMode="numeric" />
                </div>
                <input className={cls} placeholder="혈당 (mg/dL)" value={sugar} onChange={(e) => onChange({ sugar: onlyNum(e.target.value) })} onBlur={onSave} inputMode="numeric" />
                <div className="grid grid-cols-2 gap-2">
                    <input className={cls} placeholder="체중 (kg)" value={weight} onChange={(e) => onChange({ weight: onlyNum(e.target.value, true) })} onBlur={onSave} inputMode="decimal" />
                    <input className={cls} placeholder="체온 (°C)" value={temp} onChange={(e) => onChange({ temp: onlyNum(e.target.value, true) })} onBlur={onSave} inputMode="decimal" />
                </div>
                <input className={cls + " text-xs"} placeholder="메모 (증상·복약 등)" value={note} onChange={(e) => onChange({ note: e.target.value })} onBlur={onSave} />
            </div>
        </div>
    );
}

export interface TrackingRowProps {
    label: string;
    hint: string;
    value: number | null;
    activeColor: string;
    onPick: (n: number) => void;
    onClear: () => void;
}

export function TrackingRow({ label, hint, value, activeColor, onPick, onClear }: TrackingRowProps) {
    return (
        <div>
            <div className="flex items-baseline justify-between mb-1.5">
                <div className="flex items-baseline gap-2">
                    <span className="text-xs font-semibold text-neutral-700">{label}</span>
                    <span className="text-[10px] text-neutral-400">{hint}</span>
                </div>
                {value !== null && (
                    <button
                        onClick={onClear}
                        className="text-[10px] text-neutral-300 hover:text-rose-500 transition-colors"
                        title="해제"
                    >
                        해제
                    </button>
                )}
            </div>
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                    <button
                        key={n}
                        onClick={() => onPick(n)}
                        className={`flex-1 max-w-[40px] h-7 rounded text-xs font-medium transition-colors ${
                            value && n <= value
                                ? `${activeColor} text-white`
                                : "bg-neutral-100 text-neutral-400 hover:bg-neutral-200"
                        }`}
                    >
                        {n}
                    </button>
                ))}
            </div>
        </div>
    );
}

export interface TrackingRowWithNoteProps {
    label: string; hint: string; value: number | null; activeColor: string;
    note: string; placeholder: string;
    onPick: (n: number) => void;
    onClear: () => void;
    onNoteChange: (v: string) => void;
    onNoteBlur: () => void;
}

export function TrackingRowWithNote(p: TrackingRowWithNoteProps) {
    return (
        <div>
            <TrackingRow
                label={p.label} hint={p.hint} value={p.value}
                activeColor={p.activeColor}
                onPick={p.onPick} onClear={p.onClear}
            />
            <input
                type="text"
                value={p.note}
                onChange={(e) => p.onNoteChange(e.target.value)}
                onBlur={p.onNoteBlur}
                placeholder={p.placeholder}
                className="w-full mt-1.5 text-xs border border-neutral-200 rounded px-2 py-1 placeholder:text-neutral-300 placeholder:italic focus:outline-none focus:border-[#6366F1]"
            />
        </div>
    );
}
