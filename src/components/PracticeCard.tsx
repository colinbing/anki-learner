// src/components/PracticeCard.tsx
import { useEffect } from "react";
import { usePractice } from "../store/usePractice";
import JPSentence from "./JPSentence";
import styles from "./card.module.css";

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
  const { queue, index, showAnswer, flip, grade, markUnknown, isUnknown } = usePractice();
  const card = queue[index];
  const vertical = layout === "vertical";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        flip();
      }
      if (e.key === "1") grade("veryHard");
      if (e.key === "2") grade("okay");
      if (e.key === "3") grade("good");
      if (e.key === "4") grade("easy");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flip, grade]);

  if (!card) return <div className={styles.cardWrap}>No cards loaded.</div>;

  return (
    <div className={styles.cardWrap}>
      <div className={styles.promptArea}>
        {direction === "JP_EN" ? (
          <JPSentence
            tokens={card.jp}
            showFurigana={showFurigana}
            vertical={vertical}
            fontFamily={fontFamily}
            revealed={showAnswer}                 // color only after reveal
            onMarkUnknown={markUnknown}
            isUnknown={isUnknown}
          />
        ) : (
          <div className={styles.enText}>{card.en}</div>
        )}
      </div>

      <div className={styles.answerArea}>
        {direction === "JP_EN" ? (
          showAnswer ? <div className={styles.enText}>{card.en}</div> : <RevealTip />
        ) : showAnswer ? (
          <JPSentence
            tokens={card.jp}
            showFurigana={showFurigana}
            vertical={vertical}
            fontFamily={fontFamily}
            revealed
            onMarkUnknown={markUnknown}
            isUnknown={isUnknown}
          />
        ) : (
          <RevealTip />
        )}
      </div>

      <div className={styles.btnRow}>
        <button className={`${styles.btn} ${styles.vhard}`} onClick={() => grade("veryHard")}>
          Very Hard (1)
        </button>
        <button className={`${styles.btn} ${styles.okay}`} onClick={() => grade("okay")}>
          Okay (2)
        </button>
        <button className={`${styles.btn} ${styles.good}`} onClick={() => grade("good")}>
          Good (3)
        </button>
        <button className={`${styles.btn} ${styles.easy}`} onClick={() => grade("easy")}>
          Easy (4)
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
