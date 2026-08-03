import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Network, Eye, EyeOff, LogIn, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { Field, Input } from "../components/FormField";
import Button from "../components/Button";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("admin@datasource.io");
  const [password, setPassword] = useState("Admin@123");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    if (!email) return setErrors({ email: "Email is required." });
    if (!password) return setErrors({ password: "Password is required." });

    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(role) {
    if (role === "ADMIN") {
      setEmail("admin@datasource.io");
      setPassword("Admin@123");
    } else {
      setEmail("analyst@datasource.io");
      setPassword("Analyst@123");
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-surface-muted">
      {/* Left: brand / signature visual */}
      <div className="hidden lg:flex flex-col justify-between bg-ink-900 text-white p-12 relative overflow-hidden">
        <NetworkBackdrop />
        <div className="relative flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
            <Network size={18} className="text-ink-900" strokeWidth={2.5} />
          </div>
          <span className="font-bold">DataSource Manager</span>
        </div>

        <div className="relative max-w-md">
          <p className="text-3xl font-bold leading-tight">
            Every connection,<br />one control plane.
          </p>
          <p className="text-white/60 mt-4 text-sm leading-relaxed">
            Register, validate, and monitor database connections across environments —
            from development sandboxes to production warehouses — with a full audit trail
            of every test.
          </p>
          <div className="flex items-center gap-2 mt-6 text-xs text-white/50">
            <ShieldCheck size={14} className="text-accent" />
            Role-based access for Administrators and Data Analysts
          </div>
        </div>

        <p className="relative text-xs text-white/40">© 2026 DataSource Manager. Internal enterprise tool.</p>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-lg bg-ink-900 flex items-center justify-center">
              <Network size={18} className="text-accent" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-ink-900">DataSource Manager</span>
          </div>

          <h2 className="text-2xl font-bold text-ink-900">Sign in</h2>
          <p className="text-sm text-ink-600 mt-1 mb-8">Access your data source console.</p>

          <form onSubmit={handleSubmit} noValidate>
            <Field label="Email" error={errors.email} required>
              <Input
                type="email"
                autoFocus
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
              />
            </Field>
            <Field label="Password" error={errors.password} required>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-600 hover:text-ink-900"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            <Button type="submit" variant="accent" className="w-full mt-2" loading={loading} icon={LogIn}>
              Sign in
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-line">
            <p className="text-xs font-semibold text-ink-600 uppercase tracking-wide mb-3">Demo credentials</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => fillDemo("ADMIN")}
                className="text-left px-3 py-2.5 rounded-lg border border-line hover:border-accent hover:bg-accent-soft transition-colors"
              >
                <p className="text-xs font-semibold text-ink-900">Administrator</p>
                <p className="text-[11px] text-ink-600 font-mono-data">admin@datasource.io</p>
              </button>
              <button
                onClick={() => fillDemo("ANALYST")}
                className="text-left px-3 py-2.5 rounded-lg border border-line hover:border-accent hover:bg-accent-soft transition-colors"
              >
                <p className="text-xs font-semibold text-ink-900">Data Analyst</p>
                <p className="text-[11px] text-ink-600 font-mono-data">analyst@datasource.io</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NetworkBackdrop() {
  // Signature element: a faint node/connection graph echoing the "data source
  // connection" subject matter, sitting quietly behind the copy.
  const nodes = [
    [40, 60], [140, 30], [230, 90], [90, 150], [200, 190], [300, 140], [60, 240], [260, 260],
  ];
  const edges = [[0, 1], [1, 2], [0, 3], [3, 4], [2, 5], [4, 6], [4, 7], [5, 7], [1, 5]];
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.18]"
      viewBox="0 0 340 300"
      preserveAspectRatio="xMidYMid slice"
    >
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]}
          stroke="#5EEAD4" strokeWidth="1"
        />
      ))}
      {nodes.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 4 : 2.5} fill="#5EEAD4" />
      ))}
    </svg>
  );
}
