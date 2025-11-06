import { SettingsBar } from "./components/SettingsBar";
import SessionSettings from "./components/SessionSettings";
import type { SessionSettingsValue } from "./components/SessionSettings";
import PracticeArea from "./components/PracticeArea";
import SessionBar from "./components/SessionBar";
import ImporterTab from "./components/ImporterTab";
import { useSettingsStore } from "./state/useSettings";
import { useLexicon } from "./state/useLexicon";
import { useEffect, useState } from "react";


export default function App() {
  const layout = useSettingsStore((s) => s.layout as "horizontal" | "vertical");
  const direction = useSettingsStore((s) => (s.direction === "JP_EN" ? "JP_EN" : "EN_JP"));
  const showFurigana = useSettingsStore((s) => s.furiganaEnabled as boolean);
  const fontFamily = useSettingsStore((s) => s.fontFamily || undefined);
  const [sess, setSess] = useState<SessionSettingsValue>({ count: 20 });


  const [tab, setTab] = useState<"practice" | "import">("practice");
  const hydrateLexicon = useLexicon((s) => s.hydrate);
  const lexCount = useLexicon((s) => s.rows.length);

  useEffect(() => { hydrateLexicon(); }, [hydrateLexicon]);

  // First-run: if no lexicon yet, land on Import
  useEffect(() => {
    if (lexCount === 0) setTab("import");
  }, [lexCount]);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="max-w-3xl mx-auto p-4">
        <header className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-semibold">JP Drills</h1>
          <SettingsBar />
        </header>

        <nav className="flex gap-2 mb-3">
          <TabButton active={tab==="practice"} onClick={() => setTab("practice")}>Practice</TabButton>
          <TabButton active={tab==="import"} onClick={() => setTab("import")}>Import</TabButton>
        </nav>

        {tab === "practice" ? (
          <>
          <SessionSettings value={sess} onChange={setSess} />
          <SessionBar count={sess.count} />
          <div className="rounded-xl border p-6">
            <PracticeArea
              layout={layout}
              direction={direction}
              showFurigana={showFurigana}
              fontFamily={fontFamily}
            />
          </div>
        </>
        ) : (
          <ImporterTab />
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: any }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg border ${active ? "bg-neutral-200 dark:bg-neutral-800" : "bg-white dark:bg-neutral-900"}`}
    >
      {children}
    </button>
  );
}
