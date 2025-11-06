// src/components/PracticeCard.tsx
import { useEffect } from "react";
import { usePractice } from "../store/usePractice";
import JPSentence from "./JPSentence";
import styles from "./card.module.css";

// Keep types local to avoid chasing imports right now
type LayoutMode = "horizontal" | "vertical";
type Direction = "JP_EN" | "EN_JP";

export default function PracticeCard({
  layout,
  direction,
  showFurigana,
  fontFamily,
}: {
  layout: LayoutMode;
  direction: Direction;
  showFurigana: boolean;
  fontFamily?: string;
}) {
  const { queue, index, showAnswer, flip, grade } = usePractice();
  const card = queue[index];
  const vertical = layout === "vertical";

  // Keyboard shortcuts: Space = flip, 1/2/3 = again/hard/good
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        flip();
      }
      if (e.key === "1") grade("again");
      if (e.key === "2") grade("hard");
      if (e.key === "3") grade("good");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flip, grade]);

  if (!card) {
    return <div className={styles.cardWrap}>No cards loaded.</div>;
  }

  return (
    <div className={styles.cardWrap}>
      <div className={styles.promptArea}>
        {direction === "JP_EN" ? (
          <JPSentence
            tokens={card.jp}
            showFurigana={showFurigana}
            vertical={vertical}
            fontFamily={fontFamily}
          />
        ) : (
          <div className={styles.enText}>{card.en}</div>
        )}
      </div>

      <div className={styles.answerArea}>
        {direction === "JP_EN" ? (
          showAnswer ? (
            <div className={styles.enText}>{card.en}</div>
          ) : (
            <RevealTip />
          )
        ) : showAnswer ? (
          <JPSentence
            tokens={card.jp}
            showFurigana={showFurigana}
            vertical={vertical}
            fontFamily={fontFamily}
          />
        ) : (
          <RevealTip />
        )}
      </div>

      <div className={styles.btnRow}>
        <button className={`${styles.btn} ${styles.again}`} onClick={() => grade("again")}>
          Again (1)
        </button>
        <button className={`${styles.btn} ${styles.hard}`} onClick={() => grade("hard")}>
          Hard (2)
        </button>
        <button className={`${styles.btn} ${styles.good}`} onClick={() => grade("good")}>
          Good (3)
        </button>
        <button className={styles.flip} onClick={() => flip()}>
          Flip (Space)
        </button>
      </div>
    </div>
  );
}

function RevealTip() {
  return <div className={styles.reveal}>Press Space or tap Flip to reveal.</div>;
}
