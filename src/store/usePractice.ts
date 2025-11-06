// src/store/usePractice.ts
import { create } from "zustand";
import type { Card, AnswerGrade, Direction, Token } from "../types";

// id helper (no extra deps)
const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

// Demo seed; you’ll later inject real cards.
const seed: Card[] = [
  {
    id: uid(),
    jp: [
      { id: uid(), surface: "今日", reading: "きょう", gloss: "today", pos: "noun" },
      { id: uid(), surface: "は", gloss: "topic", pos: "particle" },
      { id: uid(), surface: "雨", reading: "あめ", gloss: "rain", pos: "noun" },
      { id: uid(), surface: "です", gloss: "to be", pos: "verb" },
      { id: uid(), surface: "。", pos: "other" },
    ],
    en: "It's raining today.",
  },
  {
    id: uid(),
    jp: [
      { id: uid(), surface: "電車", reading: "でんしゃ", gloss: "train", pos: "noun" },
      { id: uid(), surface: "で", gloss: "by (transport)", pos: "particle" },
      { id: uid(), surface: "会社", reading: "かいしゃ", gloss: "company", pos: "noun" },
      { id: uid(), surface: "に", gloss: "to", pos: "particle" },
      { id: uid(), surface: "行きます", reading: "いきます", gloss: "go", pos: "verb" },
      { id: uid(), surface: "。", pos: "other" },
    ],
    en: "I go to work by train.",
  },
];

type SessionEntry = {
  cardId: string;
  grade: AnswerGrade;
  unknownTokenIds: string[];
};

export type PracticeState = {
  queue: Card[];
  index: number;
  showAnswer: boolean;
  direction: Direction;

  // per-card marking of unknown tokens (session-temp, not global yet)
  unknownTokenIdsForCard: Record<string, Set<string>>;

  // naive session log for now
  session: SessionEntry[];

  stats: { seen: number; graded: number };

  setDirection: (d: Direction) => void;
  inject: (cards: Card[]) => void;
  nextCard: () => void;
  flip: () => void;

  markUnknown: (tokenId: string) => void;
  isUnknown: (tokenId: string) => boolean;

  grade: (g: AnswerGrade) => void;
};

export const usePractice = create<PracticeState>((set, get) => ({
  queue: seed,
  index: 0,
  showAnswer: false,
  direction: "JP_EN",

  unknownTokenIdsForCard: {},
  session: [],
  stats: { seen: 0, graded: 0 },

  setDirection: (d) => set({ direction: d }),

  inject: (cards) =>
    set({
      queue: cards,
      index: 0,
      showAnswer: false,
      unknownTokenIdsForCard: {},
      session: [],
      stats: { seen: 0, graded: 0 },
    }),

  nextCard: () =>
    set((s) => ({
      index: (s.index + 1) % Math.max(1, s.queue.length),
      showAnswer: false,
    })),

  flip: () => set((s) => ({ showAnswer: !s.showAnswer })),

  markUnknown: (tokenId) => {
    const { queue, index, unknownTokenIdsForCard } = get();
    const cardId = queue[index]?.id;
    if (!cardId) return;
    const setFor = unknownTokenIdsForCard[cardId] || new Set<string>();
    setFor.add(tokenId);
    unknownTokenIdsForCard[cardId] = setFor;
    set({ unknownTokenIdsForCard });
  },

  isUnknown: (tokenId) => {
    const { queue, index, unknownTokenIdsForCard } = get();
    const cardId = queue[index]?.id;
    if (!cardId) return false;
    return unknownTokenIdsForCard[cardId]?.has(tokenId) ?? false;
  },

  grade: (g) => {
    const { queue, index, unknownTokenIdsForCard, session, stats } = get();
    const card = queue[index];
    if (!card) return;

    const unknown = Array.from(unknownTokenIdsForCard[card.id] ?? []);
    const entry: SessionEntry = { cardId: card.id, grade: g, unknownTokenIds: unknown };

    // Example queue logic: push Very Hard two cards later
    if (g === "veryHard") {
      const newQueue = [...queue];
      const current = newQueue.splice(index, 1)[0];
      const insertAt = Math.min(index + 2, newQueue.length);
      newQueue.splice(insertAt, 0, current);
      set({ queue: newQueue });
    }

    set({
      session: [...session, entry],
      stats: { seen: stats.seen + 1, graded: stats.graded + 1 },
    });

    get().nextCard();
  },
}));
