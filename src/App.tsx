// src/App.tsx
import { SettingsBar } from "./components/SettingsBar";
import PracticeArea from "./components/PracticeArea";
import SessionBar from "./components/SessionBar";
import { useSettingsStore } from "./state/useSettings"; // <- drop the .ts

export default function App() {
  const layout = useSettingsStore((s) => s.layout as "horizontal" | "vertical");
  const direction = useSettingsStore((s) => (s.direction === "JP_EN" ? "JP_EN" : "EN_JP"));
  const showFurigana = useSettingsStore((s) => s.furiganaEnabled as boolean);
  const fontFamily = useSettingsStore((s) => s.fontFamily || undefined);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="max-w-3xl mx-auto p-4">
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">JP Drills</h1>
          <SettingsBar />
        </header>

        {/* Session controls */}
        <SessionBar />

        {/* Practice Card Area */}
        <div className="rounded-xl border p-6">
          <PracticeArea
            layout={layout}
            direction={direction}
            showFurigana={showFurigana}
            fontFamily={fontFamily}
          />
        </div>
      </div>
    </div>
  );
}
