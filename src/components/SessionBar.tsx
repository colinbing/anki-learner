// src/components/SessionBar.tsx
import { miniGenerate } from "../generator/minigen";
import { usePractice } from "../store/usePractice";

export default function SessionBar() {
  const inject = usePractice((s) => s.inject);

  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
      <button
        onClick={() => inject(miniGenerate(20))}
        style={{
          appearance: "none",
          border: 0,
          background: "#10b981",        // teal-500
          color: "#fff",
          borderRadius: 12,
          padding: "10px 14px",
          fontWeight: 800,
          boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
          cursor: "pointer",
        }}
      >
        Start New Session (20)
      </button>
    </div>
  );
}
