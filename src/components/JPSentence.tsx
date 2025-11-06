import { useRef, useState } from "react";
import type { Token } from "../types";
import HoverHint from "./HoverHint";
import styles from "./card.module.css";

export default function JPSentence({
  tokens,
  showFurigana,
  vertical,
  fontFamily,
  revealed,
  onMarkUnknown,
  isUnknown,
}: {
  tokens: Token[];
  showFurigana: boolean;
  vertical: boolean;
  fontFamily?: string;
  revealed?: boolean;
  onMarkUnknown?: (tokenId: string) => void;
  isUnknown?: (tokenId: string) => boolean;
}) {
  const [hoverToken, setHoverToken] = useState<Token | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hideTimer = useRef<number | null>(null);

  const className = vertical ? styles.vertical : styles.horizontal;

  const showFor = (el: HTMLElement, t: Token) => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    setHoverToken(t);
    setRect(el.getBoundingClientRect());
    setOpen(true);
  };

  const scheduleHide = () => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setOpen(false), 150);
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ fontFamily }}
      onMouseLeave={scheduleHide}
      onMouseEnter={() => {
        if (hideTimer.current) window.clearTimeout(hideTimer.current);
      }}
    >
      {tokens.map((t) => {
        const posClass = revealed ? styles[`pos_${t.pos ?? "other"}`] : "";
        const unkClass = isUnknown?.(t.id) ? styles.unknown : "";
        return (
          <span
            key={t.id}
            className={`${styles.token} ${posClass} ${unkClass}`}
            onMouseEnter={(e) => showFor(e.currentTarget, t)}
          >
            {showFurigana && t.reading ? (
              <ruby>
                {t.surface}
                <rt>{t.reading}</rt>
              </ruby>
            ) : (
              t.surface
            )}
          </span>
        );
      })}

      <HoverHint
        anchorRect={rect}
        lines={
          hoverToken
            ? [hoverToken.reading || "", hoverToken.gloss || ""].filter(Boolean)
            : []
        }
        onMarkUnknown={
          hoverToken && onMarkUnknown ? () => onMarkUnknown(hoverToken.id) : undefined
        }
        open={open}
      />
    </div>
  );
}
