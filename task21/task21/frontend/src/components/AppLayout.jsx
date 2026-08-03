import Sidebar from "./Sidebar";

export default function AppLayout({ title, subtitle, actions, children }) {
  return (
    <div className="flex min-h-screen bg-surface-muted">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-10 bg-surface-muted/90 backdrop-blur border-b border-line px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-ink-900">{title}</h1>
            {subtitle && <p className="text-sm text-ink-600 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
