import { useEffect, useRef, useState } from "react";

type Props = {
  anchorRect: DOMRect | null;
  lines: string[];                // e.g., ["あめ", "rain"]
  onMarkUnknown?: () => void;
  open: boolean;                  // parent controls visibility
};

export default function HoverHint({ anchorRect, lines, onMarkUnknown, open }: Props) {
  const [style, setStyle] = useState<React.CSSProperties>({ display: "none" });
  const holdRef = useRef<number | null>(null);

  // position centered above token
  useEffect(() => {
    if (!anchorRect || !open) {
      setStyle((s) => ({ ...s, display: "none" }));
      return;
    }
    const margin = 10;
    const top = window.scrollY + anchorRect.top - margin;
    const left = window.scrollX + anchorRect.left + anchorRect.width / 2;
    setStyle({
      position: "absolute",
      top: top - 44, // place above
      left,
      transform: "translate(-50%, -100%)",
      display: "block",
      zIndex: 1000,
    });
  }, [anchorRect, open]);

  // tiny “hold-open” when moving pointer token <-> tooltip
  const keepOpen = () => {
    if (holdRef.current) window.clearTimeout(holdRef.current);
  };
  const allowCloseSoon = () => {
    if (holdRef.current) window.clearTimeout(holdRef.current);
    holdRef.current = window.setTimeout(() => {
      setStyle((s) => ({ ...s, display: "none" }));
    }, 150);
  };

  return (
    <div
      onMouseEnter={keepOpen}
      onMouseLeave={allowCloseSoon}
      style={{
        ...style,
        background: "var(--card-bg, #111)",
        color: "var(--card-fg, #fff)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 10,
        padding: "10px 12px",
        fontSize: 13,
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        maxWidth: 280,
        pointerEvents: "auto",
      }}
    >
      <div style={{ marginBottom: 8 }}>
        {lines.map((t, i) => (
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
            padding: "6px 10px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Didn’t know this
        </button>
      )}
    </div>
  );
}
