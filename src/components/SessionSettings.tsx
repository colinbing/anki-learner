import { useState } from "react";

export type SessionSettingsValue = {
  count: number;
};

export default function SessionSettings({
  onChange,
  value,
}: {
  value?: SessionSettingsValue;
  onChange?: (v: SessionSettingsValue) => void;
}) {
  const [local, setLocal] = useState<SessionSettingsValue>(value ?? { count: 20 });

  const update = (patch: Partial<SessionSettingsValue>) => {
    const next = { ...local, ...patch };
    setLocal(next);
    onChange?.(next);
  };

  return (
    <div className="rounded-xl border p-4 mb-3 grid gap-3 bg-white/60 dark:bg-neutral-900/40">
      <div className="text-sm font-semibold">Session settings</div>
      <div className="flex items-center gap-4 flex-wrap">
        <label className="text-sm">
          Sentences:&nbsp;
          <input
            type="number"
            min={5}
            max={100}
            step={5}
            value={local.count}
            onChange={(e) => update({ count: Math.max(5, Math.min(100, Number(e.target.value) || 20)) })}
            className="w-20 rounded-md border px-2 py-1 bg-white dark:bg-neutral-900"
          />
        </label>

        <span className="text-xs opacity-70">
          (Difficulty, direction, layout, font, furigana already come from the top bar.)
        </span>
      </div>
    </div>
  );
}
