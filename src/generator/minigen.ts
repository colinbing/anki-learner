// src/generator/minigen.ts
import type { Card, Token } from "../types";

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

// --- Lexicon with semantic categories so frames can enforce logic ---
type NounCat = "person" | "place" | "object";
type LexNoun = {
  surface: string;
  reading?: string;
  gloss: string;        // base EN headword (singular)
  pos: "noun";
  cat: NounCat;
  // Optional: nicer English when used as destination
  asDestination?: string;  // e.g., "home" for 家
  // Optional: article preferences
  proper?: boolean;        // no article
};

const NOUNS: LexNoun[] = [
  { surface: "私", reading: "わたし", gloss: "I", pos: "noun", cat: "person", proper: true },
  { surface: "友だち", reading: "ともだち", gloss: "friend", pos: "noun", cat: "person" },

  { surface: "家", reading: "いえ", gloss: "house", pos: "noun", cat: "place", asDestination: "home" },
  { surface: "会社", reading: "かいしゃ", gloss: "company", pos: "noun", cat: "place" },
  { surface: "学校", reading: "がっこう", gloss: "school", pos: "noun", cat: "place" },
  { surface: "駅", reading: "えき", gloss: "station", pos: "noun", cat: "place" },

  { surface: "本", reading: "ほん", gloss: "book", pos: "noun", cat: "object" },
  { surface: "映画", reading: "えいが", gloss: "movie", pos: "noun", cat: "object" },
];

type LexVerb = {
  lemma: string;
  polite: string;
  politeNeg: string;
  pastPolite: string;
  gloss: string;
  // constraints for slots
  needs: {
    subject: NounCat[];          // allowed subject categories
    object?: NounCat[];          // if transitive
    placeRole?: "destination" | "location"; // に or で
  };
};

const VERBS: LexVerb[] = [
  {
    lemma: "行く",
    polite: "行きます",
    politeNeg: "行きません",
    pastPolite: "行きました",
    gloss: "go",
    needs: { subject: ["person"], placeRole: "destination" },
  },
  {
    lemma: "勉強する",
    polite: "勉強します",
    politeNeg: "勉強しません",
    pastPolite: "勉強しました",
    gloss: "study",
    needs: { subject: ["person"], placeRole: "location" },
  },
  {
    lemma: "見る",
    polite: "見ます",
    politeNeg: "見ません",
    pastPolite: "見ました",
    gloss: "see",
    needs: { subject: ["person"], object: ["person", "object", "place"] },
  },
];

const P = {
  topic: mkToken("は", "topic", "particle"),
  obj: mkToken("を", "object", "particle"),
  to: mkToken("に", "to", "particle"),
  at: mkToken("で", "at", "particle"),
  period: mkToken("。", "", "other"),
};

// --- helpers ---
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function choose<T>(arr: T[], pred: (x: T) => boolean): T {
  const pool = arr.filter(pred);
  return pick(pool.length ? pool : arr);
}
function distinct<T>(a: T, b: T) {
  return a !== b;
}
function mkToken(surface: string, gloss: string, pos: Token["pos"], reading?: string): Token {
  return { id: uid(), surface, gloss, pos, reading };
}
function tokN(n: LexNoun): Token {
  return { id: uid(), surface: n.surface, reading: n.reading, gloss: n.gloss, pos: "noun" };
}

// English rendering utilities
function enSubject(n: LexNoun): string {
  if (n.surface === "私") return "I";
  if (n.gloss === "friend") return "A friend";
  // fallback: definite for places, “The X”
  if (n.cat === "place") return `The ${n.gloss}`;
  return `The ${n.gloss}`;
}
function enDestination(n: LexNoun): string {
  if (n.asDestination) return n.asDestination; // e.g., "home"
  return `the ${n.gloss}`;
}
function enPlace(n: LexNoun): string {
  return `the ${n.gloss}`;
}
function enObject(n: LexNoun): string {
  if (n.cat === "person") return (n.gloss === "friend" ? "a friend" : `the ${n.gloss}`);
  if (n.cat === "place") return `the ${n.gloss}`;
  return `a ${n.gloss}`;
}
function s3rd(subj: LexNoun): boolean {
  // third-person singular if not "I"
  return !(subj.surface === "私");
}
function enVerbPresent(gloss: string, subj: LexNoun): string {
  if (gloss === "go") return s3rd(subj) ? "goes" : "go";
  if (gloss === "study") return s3rd(subj) ? "studies" : "study";
  if (gloss === "see") return s3rd(subj) ? "sees" : "see";
  return gloss;
}

// --- Frames with constraints ---

// [SUBJ は PLACE に 行きます]
function frameGoTo(): Card {
  const subj = choose(NOUNS, n => n.cat === "person");
  const dest = choose(NOUNS, n => n.cat === "place" && distinct(n, subj));
  const jp: Token[] = [
    tokN(subj), P.topic,
    tokN(dest), P.to,
    mkToken("行きます", "go", "verb"),
    P.period
  ];
  const en = `${enSubject(subj)} ${enVerbPresent("go", subj)} to ${enDestination(dest)}.`;
  return { id: uid(), jp, en };
}

// [SUBJ は PLACE で 勉強します]
function frameStudyAt(): Card {
  const subj = choose(NOUNS, n => n.cat === "person");
  const loc  = choose(NOUNS, n => n.cat === "place" && distinct(n, subj));
  const jp: Token[] = [
    tokN(subj), P.topic,
    tokN(loc), P.at,
    mkToken("勉強します", "study", "verb"),
    P.period
  ];
  const en = `${enSubject(subj)} ${enVerbPresent("study", subj)} at ${enPlace(loc)}.`;
  return { id: uid(), jp, en };
}

// [SUBJ は OBJ を 見ました]  (past)
function frameSawObject(): Card {
  const subj = choose(NOUNS, n => n.cat === "person");
  const obj  = choose(NOUNS, n => distinct(n, subj));
  const jp: Token[] = [
    tokN(subj), P.topic,
    tokN(obj),  P.obj,
    mkToken("見ました", "saw", "verb"),
    P.period
  ];
  const en = `${enSubject(subj)} saw ${enObject(obj)}.`;
  return { id: uid(), jp, en };
}

const FRAMES = [frameGoTo, frameStudyAt, frameSawObject];

// Public
export function miniGenerate(n: number): Card[] {
  const out: Card[] = [];
  for (let i = 0; i < n; i++) out.push(pick(FRAMES)());
  return out;
}
