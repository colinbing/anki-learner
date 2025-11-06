import type { Card, Token } from "../types";
import { useLexicon } from "../state/useLexicon";
import type { TermRow } from "../state/useLexicon";


const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const P = {
  topic: t("は", "topic", "particle"),
  obj:   t("を", "object", "particle"),
  to:    t("に", "to", "particle"),
  at:    t("で", "at", "particle"),
  period:t("。", "", "other"),
};

function t(surface: string, gloss: string, pos: Token["pos"], reading?: string): Token {
  return { id: uid(), surface, gloss, pos, reading };
}
function tokFrom(row: TermRow, pos: Token["pos"] = "noun"): Token {
  return { id: uid(), surface: row.term, reading: row.reading, gloss: row.translation || "", pos };
}
function pick<T>(arr: T[]): T | null {
  return arr.length ? arr[Math.floor(Math.random() * arr.length)] : null;
}
function distinct<T>(a: T | null, b: T | null) { return !!a && !!b && a !== b; }

function enSubject(s?: string) {
  if (!s) return "Someone";
  if (s.includes("私")) return "I";
  return "A friend"; // simple fallback; we’ll improve later with translation field
}

function enPlace(row?: TermRow) {
  if (!row) return "somewhere";
  if (row.term === "家" || row.term === "うち") return "home";
  return `the ${row.translation || "place"}`.toLowerCase();
}

function enObject(row?: TermRow) {
  if (!row) return "something";
  return (row.translation || "thing").toLowerCase().startsWith("the ")
    ? (row.translation as string).toLowerCase()
    : `a ${ (row.translation || "thing").toLowerCase() }`;
}

export function generateFromStore(n: number): Card[] {
  const { persons, places, objects, verbs } = useLexicon.getState();
  const out: Card[] = [];

  for (let i = 0; i < n; i++) {
    const verb = pick(verbs);

    // Frame 1: 行く → [SUBJ は PLACE に 行きます]
    if (verb && /行く$/.test(verb.term)) {
      const subj = pick(persons);
      const dest = pick(places);
      if (subj && dest) {
        out.push({
          id: uid(),
          jp: [tokFrom(subj), P.topic, tokFrom(dest), P.to, t("行きます", "go", "verb"), P.period],
          en: `${enSubject(subj.term)} go${subj.term.includes("私") ? "" : "es"} to ${enPlace(dest)}.`,
        });
        continue;
      }
    }

    // Frame 2: 勉強する → [SUBJ は PLACE で 勉強します]
    if (verb && /勉強する$/.test(verb.term)) {
      const subj = pick(persons);
      const loc  = pick(places);
      if (subj && loc) {
        out.push({
          id: uid(),
          jp: [tokFrom(subj), P.topic, tokFrom(loc), P.at, t("勉強します", "study", "verb"), P.period],
          en: `${enSubject(subj.term)} stud${subj.term.includes("私") ? "y" : "ies"} at ${enPlace(loc)}.`,
        });
        continue;
      }
    }

    // Frame 3: 見る (past) → [SUBJ は OBJ を 見ました]
    if (verb && /見る$/.test(verb.term)) {
      const subj = pick(persons);
      let obj = pick(objects);
      // avoid “friend saw friend”
      if (!distinct(subj, obj)) obj = pick(objects.filter(o => o !== obj));
      if (subj && obj) {
        out.push({
          id: uid(),
          jp: [tokFrom(subj), P.topic, tokFrom(obj), P.obj, t("見ました", "saw", "verb"), P.period],
          en: `${enSubject(subj.term)} saw ${enObject(obj)}.`,
        });
        continue;
      }
    }

    // Fallback if we didn’t match any verb: go-frame with defaults
    const subj = pick(persons); const dest = pick(places);
    if (subj && dest) {
      out.push({
        id: uid(),
        jp: [tokFrom(subj), P.topic, tokFrom(dest), P.to, t("行きます", "go", "verb"), P.period],
        en: `${enSubject(subj.term)} go${subj.term.includes("私") ? "" : "es"} to ${enPlace(dest)}.`,
      });
    }
  }
  return out;
}
