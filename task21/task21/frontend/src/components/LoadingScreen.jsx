import { Network } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-surface-muted">
      <div className="w-10 h-10 rounded-lg bg-ink-900 flex items-center justify-center animate-pulse">
        <Network size={20} className="text-accent" />
      </div>
      <p className="text-sm text-ink-600">Loading…</p>
    </div>
  );
}

export function Spinner({ size = 20, className = "" }) {
  return (
    <div
      className={`border-2 border-line border-t-accent rounded-full animate-spin ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

export function InlineLoading({ label = "Loading…" }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-ink-600 text-sm">
      <Spinner size={18} />
      {label}
    </div>
  );
}
