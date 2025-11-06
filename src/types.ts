export type Direction = "JP_EN" | "EN_JP";
export type LayoutMode = "horizontal" | "vertical";
export type Difficulty = "beginner" | "intermediate" | "advanced";


export type Token = {
id: string;
surface: string; // 表記
reading?: string; // ふりがな (Kana)
gloss?: string; // quick meaning for tooltip
};


export type Card = {
id: string;
jp: Token[]; // tokenized Japanese with optional furigana & gloss
en: string; // target translation or prompt
hint?: string; // optional extra hint
};


export type AnswerGrade = "again" | "hard" | "good";