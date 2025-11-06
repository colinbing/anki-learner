// src/components/JPSentence.tsx
import { useState } from "react";
import type { Token } from "../types";
import HoverHint from "./HoverHint";
import styles from "./card.module.css";

export default function JPSentence({
  tokens,
  showFurigana,
  vertical,
  fontFamily,
  revealed,               // when true, color by POS
  onMarkUnknown,          // mark one token as unknown
  isUnknown,              // render unknown state
}: {
  tokens: Token[];
  showFurigana: boolean;
  vertical: boolean;
  fontFamily?: string;
  revealed?: boolean;
  onMarkUnknown?: (tokenId: string) => void;
  isUnknown?: (tokenId: string) => boolean;
}) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [hoverToken, setHoverToken] = useState<Token | null>(null);

  const className = vertical ? styles.vertical : styles.horizontal;

  return (
    <div className={className} style={{ fontFamily }}>
      {tokens.map((t) => {
        const posClass = revealed ? styles[`pos_${t.pos ?? "other"}`] : "";
        const unkClass = isUnknown?.(t.id) ? styles.unknown : "";
        return (
          <span
            key={t.id}
            className={`${styles.token} ${posClass} ${unkClass}`}
            onMouseEnter={(e) => {
              setRect(e.currentTarget.getBoundingClientRect());
              setHoverToken(t);
            }}
            onMouseLeave={() => {
              setRect(null);
              setHoverToken(null);
            }}
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
        textLines={
          hoverToken
            ? [
                hoverToken.reading ? `読み: ${hoverToken.reading}` : "",
                hoverToken.gloss ? `英: ${hoverToken.gloss}` : "",
              ].filter(Boolean)
            : []
        }
        onMarkUnknown={
          hoverToken && onMarkUnknown ? () => onMarkUnknown(hoverToken.id) : undefined
        }
      />
    </div>
  );
}
