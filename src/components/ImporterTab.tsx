import { useEffect, useRef, useState } from "react";
import { useLexicon } from "../state/useLexicon";

export default function ImporterTab() {
  const importCSV = useLexicon((s) => s.importCSV);
  const hydrate   = useLexicon((s) => s.hydrate);
  const persons   = useLexicon((s) => s.persons);
  const places    = useLexicon((s) => s.places);
  const objects   = useLexicon((s) => s.objects);
  const verbs     = useLexicon((s) => s.verbs);

  const base = import.meta.env.BASE_URL || "/";
  const extractorSrc = `${base}colpkg-extractor/index.html`;

  const [status, setStatus] = useState("No deck imported yet.");
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => { hydrate(); }, [hydrate]);

  const onPickCSV = async (f: File) => {
    const text = await f.text();
    importCSV(text);
    setStatus("Imported.");
  };

  return (
    <div className="grid gap-4">
      <h2 className="text-lg font-semibold">Import your Anki deck</h2>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Extractor card */}
        <div className="rounded-xl border bg-white/60 dark:bg-neutral-900/40 overflow-hidden">
          <div className="px-4 py-3 font-medium">Step 1 — Extract terms (no upload)</div>
          <div className="border-t">
            <iframe
              title="colpkg-extractor"
              src={extractorSrc}
              className="w-full h-[460px]"
            />
          </div>
        </div>

        {/* CSV import card */}
        <div className="rounded-xl border bg-white/60 dark:bg-neutral-900/40 p-4 grid gap-3">
          <div className="font-medium">Step 2 — Import CSV into JP Drills</div>
          <p className="text-sm opacity-80">
            After clicking <em>Download CSV</em> in the extractor, choose the file here:
          </p>

          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              const f = e.currentTarget.files?.[0];
              if (f) onPickCSV(f);
            }}
            className="block text-sm"
          />

          <div className="rounded-lg border px-3 py-2 bg-white/60 dark:bg-neutral-900/40">
            <div className="text-sm opacity-80">{status}</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <Stat label="Persons" value={persons.length} />
              <Stat label="Places"  value={places.length} />
              <Stat label="Objects" value={objects.length} />
              <Stat label="Verbs"   value={verbs.length} />
            </div>
          </div>

          <p className="text-xs opacity-70">
            Re-import anytime; it overwrites the local guest deck stored in your browser.
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border px-2 py-1 flex items-center justify-between">
      <span className="opacity-70">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}
