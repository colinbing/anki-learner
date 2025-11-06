import { useState } from "react";
import type { Token } from "../types";
import HoverHint from "./HoverHint";
import styles from "./card.module.css";


export default function JPSentence({
tokens,
showFurigana,
vertical,
fontFamily,
}: {
tokens: Token[];
showFurigana: boolean;
vertical: boolean;
fontFamily?: string;
}) {
const [rect, setRect] = useState<DOMRect | null>(null);
const [hoverText, setHoverText] = useState<string>("");


return (
<div className={vertical ? styles.vertical : styles.horizontal} style={{ fontFamily }}>
{tokens.map((t) => (
<span
key={t.id}
className={styles.token}
onMouseEnter={(e) => {
setRect(e.currentTarget.getBoundingClientRect());
setHoverText(t.gloss || t.reading || t.surface);
}}
onMouseLeave={() => setRect(null)}
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
))}
<HoverHint anchorRect={rect} text={hoverText} />
</div>
);
}