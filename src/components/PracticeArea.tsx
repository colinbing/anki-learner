// src/components/PracticeArea.tsx
import PracticeCard from "./PracticeCard";

export default function PracticeArea({
  layout,
  direction,
  showFurigana,
  fontFamily,
}: {
  layout: "horizontal" | "vertical";
  direction: "JP_EN" | "EN_JP";
  showFurigana: boolean;
  fontFamily?: string;
}) {
  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <PracticeCard
        layout={layout}
        direction={direction}
        showFurigana={showFurigana}
        fontFamily={fontFamily}
      />
    </div>
  );
}
