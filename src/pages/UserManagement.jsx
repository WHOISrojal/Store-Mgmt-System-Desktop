import { useEffect, useState } from "react";
import api from "../services/api";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CASHIER");
  const [modalOpen, setModalOpen] = useState(false);
  const [resetModalUser, setResetModalUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null); // { type: "success"|"error", message }
  const [deleteTarget, setDeleteTarget] = useState(null); // user pending delete confirmation

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      setUsers(response.data);
    } catch (error) {
      console.log("FETCH USERS ERROR:", error.response?.data);
      console.log("STATUS:", error.response?.status);
    }
  };

  const resetForm = () => {
    setName(""); setUsername(""); setPassword(""); setRole("CASHIER");
  };

  const closeModal = () => {
    resetForm();
    setModalOpen(false);
  };

  const createUser = async () => {
    try {
      await api.post("/auth/register", { name, username, password, role });
      fetchUsers();
      closeModal();
      showToast("success", "User created successfully!");
    } catch (error) {
      console.error(error);
      showToast("error", error?.response?.data?.message || "Failed to create user");
    }
  };

  const requestDeleteUser = (user) => {
    setDeleteTarget(user);
  };

  const confirmDeleteUser = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/users/${deleteTarget._id}`);
      showToast("success", "User deleted successfully!");
      fetchUsers();
    } catch (error) {
      console.error(error);
      showToast("error", error?.response?.data?.message || "Failed to delete user.");
    } finally {
      setDeleteTarget(null);
    }
  };

  const resetPassword = async () => {
    if (!newPassword) return showToast("error", "Enter a new password");
    try {
      await api.put(`/users/${resetModalUser._id}/password`, { password: newPassword });
      showToast("success", "Password reset successfully!");
      setResetModalUser(null);
      setNewPassword("");
    } catch (error) {
      console.error(error);
      showToast("error", error?.response?.data?.message || "Failed to reset password.");
    }
  };

  const admins   = users.filter(u => u.role === "ADMIN").length;
  const cashiers = users.filter(u => u.role === "CASHIER").length;

  const overlayStyle = {
    position: "fixed", inset: 0,
    background: "rgba(15,23,42,0.55)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000, padding: "20px",
  };

  const modalStyle = {
    background: "#fff", borderRadius: "var(--rl)",
    width: "100%", maxWidth: "460px",
    display: "flex", flexDirection: "column",
    border: "var(--border)", boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  };

  return (
    <>
      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 2000,
          display: "flex", alignItems: "center", gap: 10,
          padding: "12px 18px", borderRadius: "var(--r)",
          background: toast.type === "success" ? "var(--green-b)" : "var(--red-b)",
          border: `1px solid ${toast.type === "success" ? "var(--green-bd)" : "var(--red-bd)"}`,
          boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
          fontSize: 13, fontWeight: 600,
          color: toast.type === "success" ? "var(--green)" : "var(--red)",
          animation: "slideIn .2s ease",
          maxWidth: 340,
        }}>
          <i className={`ti ${toast.type === "success" ? "ti-circle-check" : "ti-alert-circle"}`} style={{ fontSize: 18, flexShrink: 0 }} />
          {toast.message}
          <button onClick={() => setToast(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: 16, padding: 0, marginLeft: 4, opacity: 0.6 }}>
            <i className="ti ti-x" />
          </button>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="kb-page-header">
        <div>
          <h1 className="kb-page-title">User Management</h1>
          <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "var(--t3)" }}>
            Create and manage staff accounts and access roles
          </p>
        </div>
        <button className="kb-btn kb-btn-primary" onClick={() => setModalOpen(true)}>
          <i className="ti ti-user-plus" />
          Create User
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px", marginBottom: "18px" }}>
        <div className="kb-stat-card blue">
          <div className="kb-stat-top">
            <span className="kb-stat-label">Total Users</span>
            <span className="kb-stat-icon blue"><i className="ti ti-users" /></span>
          </div>
          <div className="kb-stat-value">{users.length}</div>
        </div>
        <div className="kb-stat-card red">
          <div className="kb-stat-top">
            <span className="kb-stat-label">Admins</span>
            <span className="kb-stat-icon red"><i className="ti ti-shield" /></span>
          </div>
          <div className="kb-stat-value">{admins}</div>
        </div>
        <div className="kb-stat-card green">
          <div className="kb-stat-top">
            <span className="kb-stat-label">Cashiers</span>
            <span className="kb-stat-icon green"><i className="ti ti-user" /></span>
          </div>
          <div className="kb-stat-value green">{cashiers}</div>
        </div>
      </div>

      {/* ── Users Table ── */}
      <div className="kb-card">
        <div className="kb-card-header">
          <h2 className="kb-card-title">
            <i className="ti ti-list" />
            Staff Accounts
          </h2>
          <span style={{ fontSize: "12px", color: "var(--t3)", background: "var(--bg-surface)", border: "var(--border)", borderRadius: "var(--r)", padding: "3px 10px" }}>
            {users.length} users
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="kb-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Username</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "40px", color: "var(--t3)" }}>
                    <i className="ti ti-users-off" style={{ fontSize: "28px", display: "block", marginBottom: "8px" }} />
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id}>
                    {/* Name */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{
                          width: "34px", height: "34px", borderRadius: "50%", flexShrink: 0,
                          background: user.role === "ADMIN" ? "var(--red-b)" : "var(--blue-b)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "12px", fontWeight: 700,
                          color: user.role === "ADMIN" ? "var(--red-m)" : "var(--blue-m)",
                          textTransform: "uppercase",
                        }}>
                          {user.name?.charAt(0) || "U"}
                        </span>
                        <strong style={{ color: "var(--t1)" }}>{user.name}</strong>
                      </div>
                    </td>

                    {/* Username */}
                    <td style={{ fontFamily: "monospace", fontSize: "12.5px", color: "var(--t2)" }}>
                      @{user.username}
                    </td>

                    {/* Role */}
                    <td>
                      {user.role === "ADMIN" ? (
                        <span className="kb-badge red">
                          <i className="ti ti-shield" style={{ fontSize: "10px" }} />
                          Admin
                        </span>
                      ) : (
                        <span className="kb-badge blue">
                          <i className="ti ti-user" style={{ fontSize: "10px" }} />
                          Cashier
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td>
                      {user.role !== "ADMIN" ? (
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            className="kb-btn"
                            style={{ padding: "5px 10px", fontSize: "11.5px", background: "#fffbeb", color: "#92400e", border: "1px solid #fcd34d" }}
                            onClick={() => { setResetModalUser(user); setNewPassword(""); }}
                          >
                            <i className="ti ti-key" /> Reset Password
                          </button>
                          <button
                            className="kb-btn kb-btn-danger"
                            style={{ padding: "5px 10px", fontSize: "11.5px" }}
                            onClick={() => requestDeleteUser(user)}
                          >
                            <i className="ti ti-trash" /> Delete
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: "12px", color: "var(--t3)", display: "flex", alignItems: "center", gap: "5px" }}>
                          <i className="ti ti-lock" style={{ fontSize: "13px" }} />
                          Protected
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════
          CREATE USER MODAL
      ══════════════════════════════════════ */}
      {modalOpen && (
        <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div style={modalStyle}>

            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "18px 22px", borderBottom: "var(--border)", flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
                <span style={{
                  width: "38px", height: "38px", borderRadius: "10px",
                  background: "var(--blue-b)", display: "flex", alignItems: "center",
                  justifyContent: "center", color: "var(--blue-m)", fontSize: "20px",
                }}>
                  <i className="ti ti-user-plus" />
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--t1)" }}>Create User</div>
                  <div style={{ fontSize: "12px", color: "var(--t3)", marginTop: "1px" }}>
                    Add a new staff account
                  </div>
                </div>
              </div>
              <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--t3)", fontSize: "22px", lineHeight: 1, padding: "4px", borderRadius: "6px" }}>
                <i className="ti ti-x" />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="kb-label">Full Name</label>
                <input className="kb-input" placeholder="e.g. Ram Bahadur" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="kb-label">Username</label>
                <input className="kb-input" placeholder="e.g. ram123" value={username} onChange={e => setUsername(e.target.value)} />
              </div>
              <div>
                <label className="kb-label">Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="kb-input"
                    placeholder="Enter password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ paddingRight: "38px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    style={{
                      position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer", color: "var(--t3)", fontSize: "16px", padding: 0,
                    }}
                  >
                    <i className={`ti ${showPassword ? "ti-eye-off" : "ti-eye"}`} />
                  </button>
                </div>
              </div>
              <div>
                <label className="kb-label">Role</label>
                <select className="kb-input" value={role} onChange={e => setRole(e.target.value)}>
                  <option value="CASHIER">Cashier</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              {/* Role info */}
              <div style={{
                background: role === "ADMIN" ? "var(--red-b)" : "var(--blue-b)",
                border: `1px solid ${role === "ADMIN" ? "var(--red-bd)" : "var(--blue-bd)"}`,
                borderRadius: "var(--r)", padding: "10px 14px",
                display: "flex", alignItems: "flex-start", gap: "8px",
              }}>
                <i className={`ti ${role === "ADMIN" ? "ti-shield" : "ti-user"}`}
                  style={{ color: role === "ADMIN" ? "var(--red-m)" : "var(--blue-m)", fontSize: "16px", marginTop: "1px", flexShrink: 0 }} />
                <span style={{ fontSize: "12px", color: role === "ADMIN" ? "var(--red)" : "var(--blue)", lineHeight: 1.5 }}>
                  {role === "ADMIN"
                    ? "Admin has full access to all features including user management, cost prices, and deletion."
                    : "Cashier can manage sales, purchases, and view inventory but cannot access admin settings."}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: "14px 22px", borderTop: "var(--border)",
              display: "flex", justifyContent: "flex-end", gap: "10px", flexShrink: 0,
              background: "var(--bg-surface)", borderRadius: "0 0 var(--rl) var(--rl)",
            }}>
              <button className="kb-btn kb-btn-outline" onClick={closeModal}>
                <i className="ti ti-x" /> Cancel
              </button>
              <button className="kb-btn kb-btn-primary" onClick={createUser}>
                <i className="ti ti-circle-plus" /> Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          RESET PASSWORD MODAL
      ══════════════════════════════════════ */}
      {resetModalUser && (
        <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) { setResetModalUser(null); setNewPassword(""); } }}>
          <div style={{ ...modalStyle, maxWidth: "400px" }}>

            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "18px 22px", borderBottom: "var(--border)", flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
                <span style={{
                  width: "38px", height: "38px", borderRadius: "10px",
                  background: "#fffbeb", display: "flex", alignItems: "center",
                  justifyContent: "center", color: "#d97706", fontSize: "20px",
                }}>
                  <i className="ti ti-key" />
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--t1)" }}>Reset Password</div>
                  <div style={{ fontSize: "12px", color: "var(--t3)", marginTop: "1px" }}>
                    For: <strong style={{ color: "var(--t2)" }}>{resetModalUser.name}</strong>
                  </div>
                </div>
              </div>
              <button onClick={() => { setResetModalUser(null); setNewPassword(""); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--t3)", fontSize: "22px", lineHeight: 1, padding: "4px", borderRadius: "6px" }}>
                <i className="ti ti-x" />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="kb-label">New Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="kb-input"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    style={{ paddingRight: "38px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    style={{
                      position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer", color: "var(--t3)", fontSize: "16px", padding: 0,
                    }}
                  >
                    <i className={`ti ${showPassword ? "ti-eye-off" : "ti-eye"}`} />
                  </button>
                </div>
              </div>
              <div style={{
                background: "var(--amber-b)", border: "1px solid var(--amber-bd)",
                borderRadius: "var(--r)", padding: "10px 14px",
                display: "flex", alignItems: "center", gap: "8px",
              }}>
                <i className="ti ti-info-circle" style={{ color: "#d97706", fontSize: "15px", flexShrink: 0 }} />
                <span style={{ fontSize: "12px", color: "var(--amber)", lineHeight: 1.5 }}>
                  The user will need to use this new password on their next login.
                </span>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: "14px 22px", borderTop: "var(--border)",
              display: "flex", justifyContent: "flex-end", gap: "10px", flexShrink: 0,
              background: "var(--bg-surface)", borderRadius: "0 0 var(--rl) var(--rl)",
            }}>
              <button className="kb-btn kb-btn-outline" onClick={() => { setResetModalUser(null); setNewPassword(""); }}>
                <i className="ti ti-x" /> Cancel
              </button>
              <button
                className="kb-btn"
                style={{ background: "#d97706", color: "#fff", boxShadow: "0 2px 8px rgba(217,119,6,0.25)" }}
                onClick={resetPassword}
              >
                <i className="ti ti-device-floppy" /> Save Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          DELETE CONFIRMATION MODAL
      ══════════════════════════════════════ */}
      {deleteTarget && (
        <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) setDeleteTarget(null); }}>
          <div style={{ ...modalStyle, maxWidth: "420px" }}>

            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "18px 22px", borderBottom: "var(--border)", flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
                <span style={{
                  width: "38px", height: "38px", borderRadius: "10px",
                  background: "var(--red-b)", display: "flex", alignItems: "center",
                  justifyContent: "center", color: "var(--red-m)", fontSize: "20px",
                }}>
                  <i className="ti ti-alert-triangle" />
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--t1)" }}>Delete User</div>
                  <div style={{ fontSize: "12px", color: "var(--t3)", marginTop: "1px" }}>This action cannot be undone</div>
                </div>
              </div>
              <button onClick={() => setDeleteTarget(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--t3)", fontSize: "22px", lineHeight: 1, padding: "4px", borderRadius: "6px" }}>
                <i className="ti ti-x" />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "20px 22px" }}>
              <p style={{ margin: 0, fontSize: "13.5px", color: "var(--t2)", lineHeight: 1.5 }}>
                Are you sure you want to delete <strong style={{ color: "var(--t1)" }}>"{deleteTarget.name}"</strong>?
                This staff account will be permanently removed and cannot be recovered.
              </p>
            </div>

            {/* Footer */}
            <div style={{
              padding: "14px 22px", borderTop: "var(--border)",
              display: "flex", justifyContent: "flex-end", gap: "10px", flexShrink: 0,
              background: "var(--bg-surface)", borderRadius: "0 0 var(--rl) var(--rl)",
            }}>
              <button className="kb-btn kb-btn-outline" onClick={() => setDeleteTarget(null)}>
                <i className="ti ti-x" /> Cancel
              </button>
              <button className="kb-btn kb-btn-danger" onClick={confirmDeleteUser}>
                <i className="ti ti-trash" /> Delete User
              </button>
            </div>

          </div>
        </div>
      )}

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </>
  );
}

export default UserManagement;