import { create } from "zustand";

type Direction = "JP_EN" | "EN_JP";
type Layout = "horizontal" | "vertical";

type SettingsState = {
  direction: Direction;
  layout: Layout;
  furiganaEnabled: boolean;
  fontFamily?: string;

  setDirection: (d: Direction) => void;
  setLayout: (l: Layout) => void;
  setFurigana: (v: boolean) => void;
  setFont: (f?: string) => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  direction: "JP_EN",
  layout: "horizontal",
  furiganaEnabled: true,
  fontFamily: undefined,

  setDirection: (d) => set({ direction: d }),
  setLayout: (l) => set({ layout: l }),
  setFurigana: (v) => set({ furiganaEnabled: v }),
  setFont: (f) => set({ fontFamily: f }),
}));
