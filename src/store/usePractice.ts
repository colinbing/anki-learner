// src/store/usePractice.ts
import { create } from "zustand";
import type { Card, AnswerGrade, Direction } from "../types";

// lightweight id helper
const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

// Demo seed; replace with deck wiring later.
const seed: Card[] = [
  {
    id: uid(),
    jp: [
      { id: uid(), surface: "今日", reading: "きょう", gloss: "today" },
      { id: uid(), surface: "は", gloss: "topic" },
      { id: uid(), surface: "雨", reading: "あめ", gloss: "rain" },
      { id: uid(), surface: "です", gloss: "to be" },
      { id: uid(), surface: "。" },
    ],
    en: "It's raining today.",
  },
  {
    id: uid(),
    jp: [
      { id: uid(), surface: "電車", reading: "でんしゃ", gloss: "train" },
      { id: uid(), surface: "で", gloss: "by (transport)" },
      { id: uid(), surface: "会社", reading: "かいしゃ", gloss: "company" },
      { id: uid(), surface: "に", gloss: "to" },
      { id: uid(), surface: "行きます", reading: "いきます", gloss: "go" },
      { id: uid(), surface: "。" },
    ],
    en: "I go to work by train.",
  },
];

// …keep the rest of the file exactly as you have it…


export type PracticeState = {
queue: Card[];
index: number; // current card index
showAnswer: boolean;
direction: Direction; // kept here to decouple from SettingsBar if needed
stats: { seen: number; correct: number; incorrect: number };
nextCard: () => void;
flip: () => void;
grade: (g: AnswerGrade) => void;
setDirection: (d: Direction) => void;
inject: (cards: Card[]) => void;
};


export const usePractice = create<PracticeState>((set, get) => ({
queue: seed,
index: 0,
showAnswer: false,
direction: "JP_EN",
stats: { seen: 0, correct: 0, incorrect: 0 },


setDirection: (d) => set({ direction: d }),


inject: (cards) => set({ queue: cards, index: 0, showAnswer: false, stats: { seen: 0, correct: 0, incorrect: 0 } }),


nextCard: () => set((s) => ({ index: (s.index + 1) % Math.max(1, s.queue.length), showAnswer: false })),


flip: () => set((s) => ({ showAnswer: !s.showAnswer })),


grade: (g) => {
const { stats } = get();
const correct = g === "good" ? stats.correct + 1 : stats.correct;
const incorrect = g === "again" ? stats.incorrect + 1 : stats.incorrect;
set({ stats: { seen: stats.seen + 1, correct, incorrect } });
// Simple queue behavior: 'again' re-queues current card after 2 cards
if (g === "again") {
const { queue, index } = get();
const current = queue[index];
const newQueue = [...queue];
newQueue.splice(index, 1); // remove current
const insertAt = Math.min(index + 2, newQueue.length);
newQueue.splice(insertAt, 0, current);
set({ queue: newQueue });
}
get().nextCard();
},
}));