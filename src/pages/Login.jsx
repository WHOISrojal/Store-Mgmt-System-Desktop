import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [initialized, setInitialized] = useState(true);

  const [setupName, setSetupName] = useState("");
  const [setupUsername, setSetupUsername] = useState("");
  const [setupPassword, setSetupPassword] = useState("");

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const response = await api.get("/auth/setup-status");

      setInitialized(response.data.initialized);
    } catch (error) {
      console.error(error);
    }
  };

  const createAdmin = async () => {
    try {
      await api.post("/auth/setup", {
        name: setupName,
        username: setupUsername,
        password: setupPassword,
      });

      alert("Administrator created successfully");

      setInitialized(true);

      setSetupName("");
      setSetupUsername("");
      setSetupPassword("");
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to create administrator");
    }
  };

  const login = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const response = await api.post("/auth/login", { username, password });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role);
      localStorage.setItem("name", response.data.name);
      window.location.href = "/";
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
  if (e.key !== "Enter") return;

  if (initialized) {
    login();
  } else {
    createAdmin();
  }
};

  return (
    <>
      <style>{`
        .login-page {
          position: fixed;
          inset: 0;
          display: flex;
          font-family: 'Inter', system-ui, sans-serif;
          background: #0f172a;
          overflow: hidden;
        }

        /* ── Left panel — brand ── */
        .login-left {
          width: 45%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px;
          position: relative;
          overflow: hidden;
          background: linear-gradient(145deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%);
        }

        .login-left::before {
          content: '';
          position: absolute;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: rgba(37,99,235,0.15);
          top: -150px; right: -150px;
        }

        .login-left::after {
          content: '';
          position: absolute;
          width: 300px; height: 300px;
          border-radius: 50%;
          background: rgba(99,102,241,0.1);
          bottom: -80px; left: -80px;
        }

        .login-brand {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 56px;
          position: relative;
          z-index: 1;
        }

        .login-brand-logo {
          width: 44px; height: 44px;
          background: #2563eb;
          border-radius: 12px;
          display: grid; place-items: center;
          font-size: 22px; font-weight: 800;
          color: #fff;
          box-shadow: 0 8px 24px rgba(37,99,235,0.4);
        }

        .login-brand-name {
          font-size: 22px; font-weight: 800;
          color: #f1f5f9; letter-spacing: -0.5px;
        }

        .login-brand-sub {
          font-size: 12px; color: #64748b; font-weight: 500;
        }

        .login-headline {
          position: relative; z-index: 1;
          margin-bottom: 20px;
        }

        .login-headline h1 {
          font-size: 36px; font-weight: 800;
          color: #f8fafc; line-height: 1.15;
          letter-spacing: -1px; margin: 0 0 14px;
        }

        .login-headline h1 span {
          color: #60a5fa;
        }

        .login-headline p {
          font-size: 15px; color: #94a3b8;
          line-height: 1.6; margin: 0;
          max-width: 340px;
        }

        .login-features {
          position: relative; z-index: 1;
          display: flex; flex-direction: column;
          gap: 12px; margin-top: 40px;
        }

        .login-feature {
          display: flex; align-items: center;
          gap: 10px; font-size: 13px; color: #94a3b8;
        }

        .login-feature-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #3b82f6;
          flex-shrink: 0;
        }

        /* ── Right panel — form ── */
        .login-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          padding: 40px;
        }

        .login-card {
          width: 100%;
          max-width: 400px;
        }

        .login-card-header {
          margin-bottom: 32px;
        }

        .login-card-header h2 {
          font-size: 26px; font-weight: 800;
          color: #0f172a; margin: 0 0 6px;
          letter-spacing: -0.5px;
        }

        .login-card-header p {
          font-size: 13.5px; color: #64748b; margin: 0;
        }

        .login-field {
          margin-bottom: 18px;
        }

        .login-label {
          display: block;
          font-size: 12px; font-weight: 600;
          color: #475569; margin-bottom: 6px;
          text-transform: uppercase; letter-spacing: .05em;
        }

        .login-input-wrap {
          position: relative;
        }

        .login-input-icon {
          position: absolute;
          left: 12px; top: 50%; transform: translateY(-50%);
          color: #94a3b8; font-size: 17px;
          pointer-events: none;
        }

        .login-input {
          width: 100%;
          padding: 11px 12px 11px 38px;
          font-size: 13.5px;
          font-family: inherit;
          color: #0f172a;
          background: #fff;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          outline: none;
          transition: border-color .15s, box-shadow .15s;
          box-sizing: border-box;
        }

        .login-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
        }

        .login-input::placeholder { color: #94a3b8; }

        .login-eye {
          position: absolute;
          right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #94a3b8; font-size: 17px; padding: 0;
          line-height: 1;
          transition: color .12s;
        }
        .login-eye:hover { color: #475569; }

        .login-error {
          background: #fef2f2;
          border: 1px solid #fca5a5;
          border-radius: 8px;
          padding: 10px 13px;
          font-size: 12.5px;
          color: #991b1b;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .login-btn {
          width: 100%;
          padding: 12px;
          background: #2563eb;
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          font-family: inherit;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background .15s, transform .1s, box-shadow .15s;
          display: flex; align-items: center; justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 14px rgba(37,99,235,0.35);
          margin-top: 6px;
        }

        .login-btn:hover:not(:disabled) {
          background: #1d4ed8;
          box-shadow: 0 6px 20px rgba(37,99,235,0.45);
          transform: translateY(-1px);
        }

        .login-btn:active:not(:disabled) { transform: translateY(0); }

        .login-btn:disabled {
          opacity: 0.7; cursor: not-allowed;
        }

        .login-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin .7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .login-footer {
          text-align: center;
          margin-top: 28px;
          font-size: 12px;
          color: #94a3b8;
        }

        @media (max-width: 768px) {
          .login-left { display: none; }
          .login-right { background: #0f172a; }
          .login-card-header h2 { color: #f1f5f9; }
          .login-card-header p  { color: #64748b; }
          .login-label { color: #94a3b8; }
          .login-input { background: #1e293b; border-color: #334155; color: #f1f5f9; }
          .login-input:focus { border-color: #3b82f6; }
          .login-footer { color: #475569; }
        }
      `}</style>

      <div className="login-page">
        {/* ── Left — brand panel ────────────────────── */}
        <div className="login-left">
          <div className="login-brand">
            <div className="login-brand-logo">K</div>
            <div>
              <div className="login-brand-name">Karobar</div>
              <div className="login-brand-sub">Business Manager</div>
            </div>
          </div>

          <div className="login-headline">
            <h1>
              Run your business
              <br />
              <span>smarter, faster.</span>
            </h1>
            <p>
              Complete business management — inventory, sales, customers,
              suppliers, cheques and reports in one place.
            </p>
          </div>

          <div className="login-features">
            {[
              "Inventory & stock management",
              "Sales, invoicing & billing",
              "Customer & supplier ledger",
              "Cheque tracking & audit logs",
              "Role-based access control",
            ].map((f) => (
              <div key={f} className="login-feature">
                <div className="login-feature-dot" />
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* ── Right — form ──────────────────────────── */}
        <div className="login-right">
          <div className="login-card">
            <div className="login-card-header">
              <h2>{initialized ? "Welcome back" : "First Time Setup"}</h2>

              <p>
                {initialized
                  ? "Sign in to your Karobar account to continue"
                  : "Create the first administrator account"}
              </p>
            </div>

            {error && (
              <div className="login-error">
                <i
                  className="ti ti-alert-circle"
                  style={{ fontSize: 15, flexShrink: 0 }}
                />
                {error}
              </div>
            )}

            {initialized ? (
              <>
                <div className="login-field">
                  <label className="login-label">Username</label>

                  <div className="login-input-wrap">
                    <input
                      className="login-input"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setError("");
                      }}
                      onKeyDown={handleKey}
                    />
                  </div>
                </div>

                <div className="login-field">
                  <label className="login-label">Password</label>

                  <div className="login-input-wrap">
                    <input
                      type={showPass ? "text" : "password"}
                      className="login-input"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                      onKeyDown={handleKey}
                    />
                  </div>
                </div>

                <button
                  className="login-btn"
                  onClick={login}
                  disabled={loading}
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                <div className="login-field">
                  <label className="login-label">Administrator Name</label>

                  <input
                    className="login-input"
                    placeholder="Enter administrator name"
                    value={setupName}
                    onChange={(e) => setSetupName(e.target.value)}
                    onKeyDown={handleKey}
                  />
                </div>

                <div className="login-field">
                  <label className="login-label">Username</label>

                  <input
                    className="login-input"
                    placeholder="Enter username"
                    value={setupUsername}
                    onChange={(e) => setSetupUsername(e.target.value)}
                    onKeyDown={handleKey}
                  />
                </div>

                <div className="login-field">
                  <label className="login-label">Password</label>

                  <input
                    type="password"
                    className="login-input"
                    placeholder="Enter password"
                    value={setupPassword}
                    onChange={(e) => setSetupPassword(e.target.value)}
                    onKeyDown={handleKey}
                  />
                </div>

                <button className="login-btn" onClick={createAdmin}>
                  Create Administrator
                </button>
              </>
            )}

            <div className="login-footer">
              Karobar © {new Date().getFullYear()} · Business Manager
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
