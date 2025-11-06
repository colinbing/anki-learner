import { useEffect, useRef, useState } from "react";


type Props = {
anchorRect: DOMRect | null;
text: string;
};


export default function HoverHint({ anchorRect, text }: Props) {
const [style, setStyle] = useState<React.CSSProperties>({ display: "none" });
const boxRef = useRef<HTMLDivElement | null>(null);


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
ref={boxRef}
style={{
...style,
background: "var(--card-bg, #111)",
color: "var(--card-fg, #fff)",
border: "1px solid rgba(255,255,255,0.15)",
borderRadius: 8,
padding: "6px 8px",
fontSize: 12,
boxShadow: "0 6px 24px rgba(0,0,0,0.25)",
maxWidth: 260,
pointerEvents: "none",
lineHeight: 1.35,
whiteSpace: "normal",
}}
>
{text}
</div>
);
}