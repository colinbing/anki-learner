import { usePractice } from "../store/usePractice";
import { generate } from "../generator/generate";

export default function SessionBar({ count = 20 }: { count?: number }) {
  const inject = usePractice((s) => s.inject);

  const start = () => {
    const cards = generate(count);
    inject(cards);
  };

  return (
    <div className="mb-3 flex items-center gap-3">
      <button
        onClick={start}
        className="px-4 py-2 rounded-xl font-extrabold text-white"
        style={{
          background:
            "linear-gradient(180deg, rgba(34,197,94,1) 0%, rgba(16,185,129,1) 100%)",
          boxShadow: "0 8px 24px rgba(16,185,129,0.35)",
        }}
      >
        Start Practice ({count})
      </button>
    </div>
  );
}
