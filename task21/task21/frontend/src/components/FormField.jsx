export function Field({ label, error, required, children, hint }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-ink-900 mb-1.5">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-ink-600 mt-1">{hint}</p>}
      {error && <p className="text-xs text-danger mt-1 font-medium">{error}</p>}
    </div>
  );
}

const baseInput =
  "w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white text-ink-900 placeholder:text-ink-600/50 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow";

export function Input({ error, className = "", ...props }) {
  return (
    <input
      className={`${baseInput} ${error ? "border-danger" : "border-line"} ${className}`}
      {...props}
    />
  );
}

export function Select({ error, className = "", children, ...props }) {
  return (
    <select
      className={`${baseInput} ${error ? "border-danger" : "border-line"} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
