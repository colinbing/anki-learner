// src/components/HoverHint.tsx
import { useEffect, useState } from "react";

type Props = {
  anchorRect: DOMRect | null;
  textLines: string[];          // multiple lines: reading, gloss, etc.
  onMarkUnknown?: () => void;   // optional action
};

export default function HoverHint({ anchorRect, textLines, onMarkUnknown }: Props) {
  const [style, setStyle] = useState<React.CSSProperties>({ display: "none" });

  useEffect(() => {
    if (!anchorRect) {
      setStyle((s) => ({ ...s, display: "none" }));
      return;
    }
    const margin = 8;
    const top = window.scrollY + anchorRect.top - margin;
    const left = window.scrollX + anchorRect.left + anchorRect.width + margin;
    setStyle({ position: "absolute", top, left, display: "block", zIndex: 1000 });
  }, [anchorRect]);

  return (
    <div
      style={{
        ...style,
        background: "var(--card-bg, #111)",
        color: "var(--card-fg, #fff)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 8,
        padding: "8px 10px",
        fontSize: 12,
        boxShadow: "0 6px 24px rgba(0,0,0,0.25)",
        maxWidth: 260,
        lineHeight: 1.4,
        pointerEvents: "auto", // allow clicking button
      }}
    >
      <div style={{ marginBottom: 6 }}>
        {textLines.map((t, i) => (
          <div key={i}>{t}</div>
        ))}
      </div>
      {onMarkUnknown && (
        <button
          onClick={onMarkUnknown}
          style={{
            appearance: "none",
            border: 0,
            background: "#3a2a2a",
            color: "#fff",
            borderRadius: 8,
            padding: "6px 8px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Didn’t know this
        </button>
      )}
    </div>
  );
}
