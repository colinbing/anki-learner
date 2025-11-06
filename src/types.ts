// src/types.ts
export type Direction = "JP_EN" | "EN_JP";
export type LayoutMode = "horizontal" | "vertical";
export type Difficulty = "beginner" | "intermediate" | "advanced";

export type PartOfSpeech =
  | "noun"
  | "verb"
  | "adjective"
  | "particle"
  | "connector"
  | "other";

export type Token = {
  id: string;
  surface: string;
  reading?: string;
  gloss?: string;
  pos?: PartOfSpeech; // for reveal coloring
};

export type Card = {
  id: string;
  jp: Token[];
  en: string;
  hint?: string;
};

export type AnswerGrade = "veryHard" | "okay" | "good" | "easy";
