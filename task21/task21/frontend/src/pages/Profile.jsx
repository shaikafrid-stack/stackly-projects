import { useAuth } from "../context/AuthContext";
import AppLayout from "../components/AppLayout";
import { ShieldCheck, Mail, Calendar, BadgeCheck } from "lucide-react";

export default function Profile() {
  const { user, isAdmin } = useAuth();

  return (
    <AppLayout title="Profile" subtitle="Your account details and access level">
      <div className="max-w-xl bg-white border border-line rounded-xl2 shadow-card p-6">
        <div className="flex items-center gap-4 pb-6 border-b border-line">
          <div className="w-16 h-16 rounded-full bg-ink-900 text-accent-light flex items-center justify-center text-2xl font-bold">
            {user?.name?.[0] ?? "?"}
          </div>
          <div>
            <p className="text-lg font-bold text-ink-900">{user?.name}</p>
            <span
              className={`inline-flex items-center gap-1 mt-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                isAdmin ? "bg-indigo-soft text-indigo" : "bg-accent-soft text-accent-dark"
              }`}
            >
              <BadgeCheck size={13} />
              {isAdmin ? "Administrator" : "Data Analyst"}
            </span>
          </div>
        </div>

        <dl className="pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <Mail size={16} className="text-ink-600" />
            <div>
              <dt className="text-xs text-ink-600">Email address</dt>
              <dd className="text-sm font-medium text-ink-900 font-mono-data">{user?.email}</dd>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck size={16} className="text-ink-600" />
            <div>
              <dt className="text-xs text-ink-600">Access level</dt>
              <dd className="text-sm font-medium text-ink-900">
                {isAdmin
                  ? "Full access — create, edit, delete, and test data sources."
                  : "Read-only access — view, search, and filter data sources."}
              </dd>
            </div>
          </div>
          {user?.created_at && (
            <div className="flex items-center gap-3">
              <Calendar size={16} className="text-ink-600" />
              <div>
                <dt className="text-xs text-ink-600">Member since</dt>
                <dd className="text-sm font-medium text-ink-900">
                  {new Date(user.created_at).toLocaleDateString()}
                </dd>
              </div>
            </div>
          )}
        </dl>
      </div>
    </AppLayout>
  );
}
