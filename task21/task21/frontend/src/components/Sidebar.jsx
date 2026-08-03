import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Database, PlusCircle, History, Search, UserCircle, LogOut, Network,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const adminLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/data-sources", label: "Data Sources", icon: Database },
  { to: "/admin/data-sources/new", label: "Add Data Source", icon: PlusCircle },
  { to: "/admin/history", label: "Connection History", icon: History },
];

const analystLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/analyst/data-sources", label: "Available Sources", icon: Search },
  { to: "/analyst/history", label: "Activity History", icon: History },
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const links = isAdmin ? adminLinks : analystLinks;

  return (
    <aside className="w-64 shrink-0 bg-ink-900 text-white flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
          <Network size={18} className="text-ink-900" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight">DataSource Manager</p>
          <p className="text-[11px] text-white/50 leading-tight">Connection Console</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-accent/15 text-accent-light border border-accent/30"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Icon size={17} strokeWidth={2.2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
            }`
          }
        >
          <UserCircle size={17} strokeWidth={2.2} />
          Profile
        </NavLink>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-danger/10 hover:text-danger transition-colors"
        >
          <LogOut size={17} strokeWidth={2.2} />
          Log out
        </button>
        <div className="flex items-center gap-3 px-3 pt-3 mt-2 border-t border-white/10">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
            {user?.name?.[0] ?? "?"}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate">{user?.name}</p>
            <p className="text-[11px] text-white/50">{isAdmin ? "Administrator" : "Data Analyst"}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
