import { create } from "zustand";

export type TermRow = {
  note_id: string;
  term: string;           // JP surface
  reading?: string;       // kana
  translation?: string;   // EN gloss
  status?: string;        // "new" | "studied" | ...
  last_studied_at?: string;
  tags?: string;
};

export type Lexicon = {
  rows: TermRow[];
  // simple derived lists the generator can use
  persons: TermRow[];     // 私 / 友だち / 先生 / 人 etc.
  places: TermRow[];      // 学校 / 会社 / 駅 / 家 etc.
  objects: TermRow[];     // 本 / 映画 / 水 …
  verbs: TermRow[];       // 行く / 見る / 食べる / 勉強する …

  importCSV: (csvText: string) => void;
  clear: () => void;
  hydrate: () => void;
};

const STORAGE_KEY = "jpdrills.lexicon.v1";

// very tiny JP keyword heuristics → category
function categorize(row: TermRow): "person"|"place"|"object"|"verb"|null {
  const s = row.term;
  if (!s) return null;

  // verbs: ends with する or dictionary-form kana/kanji verb-ish
  if (/する$/.test(s) || /[一-龥ぁ-んァ-ン]る$/.test(s) || /[一-龥]く$/.test(s) || /[一-龥]む$/.test(s) || /[一-龥]ぶ$/.test(s) || /[一-龥]う$/.test(s) || /[一-龥]す$/.test(s) || /[一-龥]つ$/.test(s) || /[一-龥]ぐ$/.test(s)) {
    return "verb";
  }

  // places (common)
  const placeHints = ["学校","会社","駅","家","うち","病院","図書館","公園","デパート","スーパー","店","空港","図書館","市役所","図書館","コンビニ"];
  if (placeHints.some(h => s.includes(h))) return "place";

  // persons
  const personHints = ["私","わたし","僕","ぼく","友だち","友達","先生","子ども","人","彼","彼女"];
  if (personHints.some(h => s.includes(h))) return "person";

  // fallback object
  return "object";
}

function parseCSV(text: string): TermRow[] {
  // tiny CSV parser (handles quotes and commas/newlines)
  const rows: TermRow[] = [];
  const lines: string[] = [];
  let cur = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQ && text[i+1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (c === '\n' && !inQ) {
      lines.push(cur); cur = "";
    } else {
      cur += c;
    }
  }
  if (cur) lines.push(cur);

  const header = lines.shift()?.split(",") ?? [];
  const idx = (name: string) => header.findIndex(h => h.trim() === name);

  const mapRow = (line: string) => {
    const cols: string[] = [];
    let cell = "", q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (q && line[i+1] === '"') { cell += '"'; i++; }
        else q = !q;
      } else if (ch === ',' && !q) {
        cols.push(cell); cell = "";
      } else {
        cell += ch;
      }
    }
    cols.push(cell);

    const get = (h: string) => {
      const i = idx(h); return i >= 0 ? cols[i]?.trim() : "";
    };
    return {
      note_id: get("note_id"),
      term: get("term"),
      reading: get("reading"),
      translation: get("translation"),
      status: get("status"),
      last_studied_at: get("last_studied_at"),
      tags: get("tags"),
    } as TermRow;
  };

  return lines.filter(Boolean).map(mapRow);
}

export const useLexicon = create<Lexicon>((set, get) => ({
  rows: [],
  persons: [],
  places: [],
  objects: [],
  verbs: [],

  importCSV: (csvText: string) => {
    const raw = parseCSV(csvText);

    // studied-only first pass (you can relax later)
    const filtered = raw.filter(r => (r.status || "").toLowerCase() !== "new");

    const persons: TermRow[] = [];
    const places: TermRow[] = [];
    const objects: TermRow[] = [];
    const verbs: TermRow[] = [];

    for (const r of filtered) {
      const cat = categorize(r);
      if (cat === "verb") verbs.push(r);
      else if (cat === "place") places.push(r);
      else if (cat === "person") persons.push(r);
      else objects.push(r);
    }

    const data = { rows: filtered, persons, places, objects, verbs };
    set(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  clear: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ rows: [], persons: [], places: [], objects: [], verbs: [] });
  },

  hydrate: () => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      if (!s) return;
      const data = JSON.parse(s);
      set(data);
    } catch {}
  },
}));
