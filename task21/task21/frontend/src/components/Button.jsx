const VARIANTS = {
  primary: "bg-ink-900 text-white hover:bg-ink-800 focus-visible:ring-ink-900",
  accent: "bg-accent text-white hover:bg-accent-dark focus-visible:ring-accent",
  ghost: "bg-transparent text-ink-900 hover:bg-surface-subtle border border-line",
  danger: "bg-danger text-white hover:bg-danger/90 focus-visible:ring-danger",
  subtle: "bg-surface-subtle text-ink-900 hover:bg-line-soft",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  loading = false,
  className = "",
  disabled,
  ...props
}) {
  const sizeCls = size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2.5 text-sm";
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${sizeCls} ${VARIANTS[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        Icon && <Icon size={16} strokeWidth={2.2} />
      )}
      {children}
    </button>
  );
}
