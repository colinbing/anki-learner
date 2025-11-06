import { useLexicon, type TermRow } from "../../state/useLexicon";
import type { Card, Token } from "../../types";

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

// tiny tokenizer helpers
const P = {
  topic: tk("は", "topic", "particle"),
  obj:   tk("を", "object", "particle"),
  to:    tk("に", "to", "particle"),
  at:    tk("で", "at", "particle"),
  period:tk("。", "", "other"),
};

function tk(surface: string, gloss: string, pos: Token["pos"], reading?: string): Token {
  return { id: uid(), surface, reading, gloss, pos };
}
function tFrom(row: TermRow, pos: Token["pos"] = "noun"): Token {
  return { id: uid(), surface: row.term, reading: row.reading, gloss: row.translation || "", pos };
}
const pick = <T,>(a: T[]) => (a.length ? a[Math.floor(Math.random() * a.length)] : null);
const distinct = <T,>(a: T | null, b: T | null) => !!a && !!b && a !== b;

// Very small adjective and adverb helper sets (safe, common)
const ADJECTIVES: { jp: string; en: string }[] = [
  { jp: "大きい", en: "big" },
  { jp: "小さい", en: "small" },
  { jp: "新しい", en: "new" },
  { jp: "古い", en: "old" },
  { jp: "いい", en: "good" },
  { jp: "きれい", en: "clean" }, // technically na-adj; we’ll predicate with です
];
const FREQ_ADV = [
  { jp: "よく", en: "often" },
  { jp: "たいてい", en: "usually" },
  { jp: "ときどき", en: "sometimes" },
];

const has = (rows: TermRow[], lemma: RegExp) => rows.some(r => lemma.test(r.term));
const findOne = (rows: TermRow[], lemma: RegExp): TermRow | null => {
  const pool = rows.filter(r => lemma.test(r.term));
  return pick(pool);
};

// English helpers
const subjEn = (s: TermRow) => (s.term.includes("私") ? "I" : "A friend");
const enVerb = (base: string, s: TermRow) => (s.term.includes("私") ? base : (base.endsWith("y") ? base.slice(0,-1)+"ies" : base+"s"));
const enPlace = (p: TermRow) => (p.term === "家" || p.term === "うち" ? "home" : `the ${ (p.translation || "place").toLowerCase() }`);
const enObject = (o: TermRow) => {
  const g = (o.translation || "thing").toLowerCase();
  if (/^(a|an|the)\s/.test(g)) return g;
  const art = /^[aeiou]/.test(g) ? "an" : "a";
  return `${art} ${g}`;
};

// ---------- FRAMES ----------
function frameGoTo(persons: TermRow[], places: TermRow[]): Card | null {
  const subj = pick(persons), dest = pick(places);
  if (!subj || !dest) return null;
  return {
    id: uid(),
    jp: [tFrom(subj), P.topic, tFrom(dest), P.to, tk("行きます", "go", "verb"), P.period],
    en: `${subjEn(subj)} ${enVerb("go", subj)} to ${enPlace(dest)}.`,
  };
}

function frameStudyAt(persons: TermRow[], places: TermRow[], verbs: TermRow[]): Card | null {
  // prefer 勉強する; fallback to 見る/食べる/読む as neutral "at" actions? keep 勉強する only for safety
  const hasStudy = findOne(verbs, /勉強する$/);
  if (!hasStudy) return null;
  const subj = pick(persons), loc = pick(places);
  if (!subj || !loc) return null;
  return {
    id: uid(),
    jp: [tFrom(subj), P.topic, tFrom(loc), P.at, tk("勉強します", "study", "verb"), P.period],
    en: `${subjEn(subj)} ${enVerb("study", subj)} at ${enPlace(loc)}.`,
  };
}

function frameTransitive(persons: TermRow[], objects: TermRow[], verbs: TermRow[]): Card | null {
  // Choose one of 見る/読む/食べる if present
  const v = findOne(verbs, /(見る|読む|食べる)$/);
  if (!v) return null;
  const subj = pick(persons);
  let obj = pick(objects);
  if (!subj || !obj) return null;
  return {
    id: uid(),
    jp: [tFrom(subj), P.topic, tFrom(obj), P.obj, tk(v.term.replace(/する$/, "します").replace(/る$/, "ます"), v.translation || "", "verb"), P.period],
    en:
      v.term.endsWith("見る")
        ? `${subjEn(subj)} ${enVerb("see", subj)} ${enObject(obj)}.`
      : v.term.endsWith("読む")
        ? `${subjEn(subj)} ${enVerb("read", subj)} ${enObject(obj)}.`
      : `${subjEn(subj)} ${enVerb("eat", subj)} ${enObject(obj)}.`,
  };
}

function frameKoreDesu(objects: TermRow[]): Card | null {
  const obj = pick(objects);
  if (!obj) return null;
  return {
    id: uid(),
    jp: [tk("これは", "this (topic)", "other"), tFrom(obj), tk("です", "is", "verb"), P.period],
    en: `This is ${enObject(obj)}.`,
  };
}

function frameKonoNounAdj(objects: TermRow[]): Card | null {
  const obj = pick(objects);
  const adj = pick(ADJECTIVES);
  if (!obj || !adj) return null;
  return {
    id: uid(),
    jp: [tk("この", "this", "other"), tFrom(obj), P.topic, tk(adj.jp, adj.en, "other"), tk("です", "is", "verb"), P.period],
    en: `This ${ (obj.translation || "thing").toLowerCase() } is ${adj.en}.`,
  };
}

function frameNounAdjTopic(objects: TermRow[]): Card | null {
  const n = pick(objects);
  const adj = pick(ADJECTIVES);
  if (!n || !adj) return null;
  return {
    id: uid(),
    jp: [tFrom(n), P.topic, tk(adj.jp, adj.en, "other"), tk("です", "is", "verb"), P.period],
    en: `The ${ (n.translation || "thing").toLowerCase() } is ${adj.en}.`,
  };
}

function frameFreqVerb(persons: TermRow[], places: TermRow[], verbs: TermRow[]): Card | null {
  const adv = pick(FREQ_ADV);
  const subj = pick(persons);
  const v = findOne(verbs, /(行く|見る|読む|食べる|勉強する)$/);
  if (!adv || !subj || !v) return null;

  // if 行く, prefer a destination; if 勉強する, prefer a place で
  if (/行く$/.test(v.term)) {
    const dest = pick(places);
    if (!dest) return null;
    return {
      id: uid(),
      jp: [tFrom(subj), P.topic, tk(adv.jp, adv.en, "other"), tFrom(dest), P.to, tk("行きます", "go", "verb"), P.period],
      en: `${subjEn(subj)} ${adv.en} ${enVerb("go", subj)} to ${enPlace(dest)}.`,
    };
  }

  if (/勉強する$/.test(v.term)) {
    const loc = pick(places);
    if (!loc) return null;
    return {
      id: uid(),
      jp: [tFrom(subj), P.topic, tk(adv.jp, adv.en, "other"), tFrom(loc), P.at, tk("勉強します", "study", "verb"), P.period],
      en: `${subjEn(subj)} ${adv.en} ${enVerb("study", subj)} at ${enPlace(loc)}.`,
    };
  }

  // neutral transitive with object
  const obj = pick(useLexicon.getState().objects);
  if (!obj) return null;
  const vEn =
    v.term.endsWith("見る") ? "see" :
    v.term.endsWith("読む") ? "read" :
    "eat";
  return {
    id: uid(),
    jp: [tFrom(subj), P.topic, tk(adv.jp, adv.en, "other"), tFrom(obj), P.obj, tk(v.term.replace(/る$/, "ます"), v.translation || "", "verb"), P.period],
    en: `${subjEn(subj)} ${adv.en} ${enVerb(vEn, subj)} ${enObject(obj)}.`,
  };
}

// Past & past-negative polite for 行く and 勉強する
function framePast(persons: TermRow[], places: TermRow[], verbs: TermRow[]): Card | null {
  const subj = pick(persons);
  if (!subj) return null;
  if (has(verbs, /行く$/)) {
    const dest = pick(places);
    if (!dest) return null;
    return {
      id: uid(),
      jp: [tFrom(subj), P.topic, tFrom(dest), P.to, tk("行きました", "went", "verb"), P.period],
      en: `${subjEn(subj)} went to ${enPlace(dest)}.`,
    };
  }
  if (has(verbs, /勉強する$/)) {
    const loc = pick(places);
    if (!loc) return null;
    return {
      id: uid(),
      jp: [tFrom(subj), P.topic, tFrom(loc), P.at, tk("勉強しました", "studied", "verb"), P.period],
      en: `${subjEn(subj)} studied at ${enPlace(loc)}.`,
    };
  }
  return null;
}

function framePastNeg(persons: TermRow[], places: TermRow[], verbs: TermRow[]): Card | null {
  const subj = pick(persons);
  if (!subj) return null;
  if (has(verbs, /行く$/)) {
    const dest = pick(places);
    if (!dest) return null;
    return {
      id: uid(),
      jp: [tFrom(subj), P.topic, tFrom(dest), P.to, tk("行きませんでした", "did not go", "verb"), P.period],
      en: `${subjEn(subj)} did not go to ${enPlace(dest)}.`,
    };
  }
  if (has(verbs, /勉強する$/)) {
    const loc = pick(places);
    if (!loc) return null;
    return {
      id: uid(),
      jp: [tFrom(subj), P.topic, tFrom(loc), P.at, tk("勉強しませんでした", "did not study", "verb"), P.period],
      en: `${subjEn(subj)} did not study at ${enPlace(loc)}.`,
    };
  }
  return null;
}

// Exported generator
export function generateEasy(n: number): Card[] {
  const { persons, places, objects, verbs } = useLexicon.getState();
  const frames = [
    () => frameGoTo(persons, places),
    () => frameStudyAt(persons, places, verbs),
    () => frameTransitive(persons, objects, verbs),
    () => frameKoreDesu(objects),
    () => frameKonoNounAdj(objects),
    () => frameNounAdjTopic(objects),
    () => frameFreqVerb(persons, places, verbs),
    () => framePast(persons, places, verbs),
    () => framePastNeg(persons, places, verbs),
  ];

  const out: Card[] = [];
  for (let i = 0; i < n; i++) {
    // try a few frames each time until one fits the available lexicon
    let card: Card | null = null;
    for (let tries = 0; tries < 6 && !card; tries++) {
      const fn = frames[Math.floor(Math.random() * frames.length)];
      card = fn();
    }
    if (card) out.push(card);
  }
  return out.length ? out : [];
}
