import { useSettingsStore } from "../state/useSettings";

export function SettingsBar() {
  const { direction, layout, furiganaEnabled, fontFamily,
          setDirection, setLayout, setFurigana, setFont } = useSettingsStore();

  return (
    <div className="flex gap-2 items-center">
      <select value={direction} onChange={(e) => setDirection(e.target.value as any)}>
        <option value="JP_EN">JP → EN</option>
        <option value="EN_JP">EN → JP</option>
      </select>

      <select value={layout} onChange={(e) => setLayout(e.target.value as any)}>
        <option value="horizontal">Horizontal</option>
        <option value="vertical">Vertical（縦書き）</option>
      </select>

      <select value={fontFamily} onChange={(e) => setFont(e.target.value)}>
        <option value="">System</option>
        <option value='"Hiragino Mincho ProN", "Noto Serif JP", serif'>Mincho（明朝）</option>
        <option value='"Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif'>Gothic（ゴシック）</option>
        <option value='"Yu Mincho", serif'>Yu Mincho</option>
      </select>

      <label className="inline-flex items-center gap-1">
        <input
          type="checkbox"
          checked={furiganaEnabled}
          onChange={(e) => setFurigana(e.target.checked)}
        />
        Furigana
      </label>
    </div>
  );
}
