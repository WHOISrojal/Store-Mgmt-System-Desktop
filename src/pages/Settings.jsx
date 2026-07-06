import { useEffect, useState, useRef } from "react";
import api from "../services/api";

function Settings() {
  const [storeName, setStoreName] = useState("");
  const [address, setAddress]     = useState("");
  const [phone, setPhone]         = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [toast, setToast]         = useState(null); // { type: "success"|"error", message }
  const [restoreTarget, setRestoreTarget] = useState(null); // parsed backup pending confirmation
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchSettings = async () => {
    try {
      const response = await api.get("/settings");
      setStoreName(response.data.storeName);
      setAddress(response.data.address);
      setPhone(response.data.phone);
      setVatNumber(response.data.vatNumber);
    } catch (error) {
      console.error(error);
    }
  };

  const saveSettings = async () => {
    try {
      await api.put("/settings", { storeName, address, phone, vatNumber });
      showToast("success", "Settings saved successfully!");
    } catch (error) {
      console.error(error);
      showToast("error", error?.response?.data?.message || error.message);
    }
  };

  const downloadBackup = async () => {
    try {
      const response = await api.get("/backup/export");
      const dataStr  = JSON.stringify(response.data, null, 2);
      const blob     = new Blob([dataStr], { type: "application/json" });
      const url      = window.URL.createObjectURL(blob);
      const link     = document.createElement("a");
      link.href      = url;
      link.download  = `backup-${new Date().toISOString().split("T")[0]}.json`;
      link.click();
      window.URL.revokeObjectURL(url);
      showToast("success", "Backup downloaded successfully!");
    } catch (error) {
      console.error(error);
      showToast("error", "Failed to download backup");
    }
  };

  const handleFileSelect = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;
      const text   = await file.text();
      const backup = JSON.parse(text);
      setRestoreTarget(backup);
    } catch (error) {
      console.error(error);
      showToast("error", "Invalid backup file");
    } finally {
      event.target.value = "";
    }
  };

  const confirmRestoreBackup = async () => {
    if (!restoreTarget) return;
    try {
      await api.post("/backup/restore", restoreTarget);
      showToast("success", "Backup restored successfully!");
    } catch (error) {
      console.error(error);
      showToast("error", error?.response?.data?.message || "Failed to restore backup");
    } finally {
      setRestoreTarget(null);
    }
  };

  const fieldStyle = { marginBottom: "18px" };

  const overlayStyle = {
    position: "fixed", inset: 0,
    background: "rgba(15,23,42,0.55)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000, padding: "20px",
  };

  const modalStyle = {
    background: "#fff", borderRadius: "var(--rl)",
    width: "100%", maxWidth: "420px",
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
          <h1 className="kb-page-title">Settings</h1>
          <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "var(--t3)" }}>
            Configure your store details and manage data backups
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "18px", alignItems: "start" }}>

        {/* ── Left: Store Info ── */}
        <div className="kb-card">
          <div className="kb-card-header" style={{ marginBottom: "20px" }}>
            <h2 className="kb-card-title">
              <i className="ti ti-building-store" />
              Store Information
            </h2>
          </div>

          {/* Store Name */}
          <div style={fieldStyle}>
            <label className="kb-label">Store Name</label>
            <div style={{ position: "relative" }}>
              <i className="ti ti-building-store" style={{
                position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)",
                color: "var(--t3)", fontSize: "15px", pointerEvents: "none",
              }} />
              <input
                className="kb-input"
                placeholder="e.g. Karobar Traders"
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                style={{ paddingLeft: "34px" }}
              />
            </div>
          </div>

          {/* Address */}
          <div style={fieldStyle}>
            <label className="kb-label">Address</label>
            <div style={{ position: "relative" }}>
              <i className="ti ti-map-pin" style={{
                position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)",
                color: "var(--t3)", fontSize: "15px", pointerEvents: "none",
              }} />
              <input
                className="kb-input"
                placeholder="e.g. New Road, Kathmandu"
                value={address}
                onChange={e => setAddress(e.target.value)}
                style={{ paddingLeft: "34px" }}
              />
            </div>
          </div>

          {/* Phone */}
          <div style={fieldStyle}>
            <label className="kb-label">Phone Number</label>
            <div style={{ position: "relative" }}>
              <i className="ti ti-phone" style={{
                position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)",
                color: "var(--t3)", fontSize: "15px", pointerEvents: "none",
              }} />
              <input
                className="kb-input"
                placeholder="e.g. 9800000000"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                style={{ paddingLeft: "34px" }}
              />
            </div>
          </div>

          {/* VAT / PAN */}
          <div style={fieldStyle}>
            <label className="kb-label">VAT / PAN Number</label>
            <div style={{ position: "relative" }}>
              <i className="ti ti-file-certificate" style={{
                position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)",
                color: "var(--t3)", fontSize: "15px", pointerEvents: "none",
              }} />
              <input
                className="kb-input"
                placeholder="e.g. 123456789"
                value={vatNumber}
                onChange={e => setVatNumber(e.target.value)}
                style={{ paddingLeft: "34px" }}
              />
            </div>
          </div>

          {/* Save */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingTop: "4px" }}>
            <button className="kb-btn kb-btn-primary" onClick={saveSettings}>
              <i className="ti ti-device-floppy" /> Save Settings
            </button>
          </div>
        </div>

        {/* ── Right: Backup & Restore ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

          {/* Download Backup */}
          <div className="kb-card">
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "14px" }}>
              <span style={{
                width: "40px", height: "40px", borderRadius: "10px", flexShrink: 0,
                background: "var(--green-b)", display: "flex", alignItems: "center",
                justifyContent: "center", color: "var(--green-m)", fontSize: "20px",
              }}>
                <i className="ti ti-database-export" />
              </span>
              <div>
                <div style={{ fontWeight: 700, fontSize: "13.5px", color: "var(--t1)", marginBottom: "3px" }}>
                  Download Backup
                </div>
                <div style={{ fontSize: "12px", color: "var(--t3)", lineHeight: 1.5 }}>
                  Export all your data as a JSON file. Store it somewhere safe for recovery.
                </div>
              </div>
            </div>
            <button className="kb-btn kb-btn-success" style={{ width: "100%" }} onClick={downloadBackup}>
              <i className="ti ti-download" /> Download Backup
            </button>
          </div>

          {/* Restore Backup */}
          <div className="kb-card" style={{ border: "1px solid var(--red-bd)", background: "linear-gradient(160deg,#fff 70%,#fef2f2)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "14px" }}>
              <span style={{
                width: "40px", height: "40px", borderRadius: "10px", flexShrink: 0,
                background: "var(--red-b)", display: "flex", alignItems: "center",
                justifyContent: "center", color: "var(--red-m)", fontSize: "20px",
              }}>
                <i className="ti ti-database-import" />
              </span>
              <div>
                <div style={{ fontWeight: 700, fontSize: "13.5px", color: "var(--t1)", marginBottom: "3px" }}>
                  Restore Backup
                </div>
                <div style={{ fontSize: "12px", color: "var(--t3)", lineHeight: 1.5 }}>
                  Upload a backup file to restore your data. This will overwrite all current data.
                </div>
              </div>
            </div>

            {/* Warning box */}
            <div style={{
              background: "var(--red-b)", border: "1px solid var(--red-bd)",
              borderRadius: "var(--r)", padding: "10px 12px", marginBottom: "12px",
              display: "flex", alignItems: "flex-start", gap: "8px",
            }}>
              <i className="ti ti-alert-triangle" style={{ color: "var(--red-m)", fontSize: "15px", flexShrink: 0, marginTop: "1px" }} />
              <span style={{ fontSize: "11.5px", color: "var(--red)", lineHeight: 1.5 }}>
                Warning: Restoring a backup will permanently overwrite all existing data. This action cannot be undone.
              </span>
            </div>

            <label style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              width: "100%", padding: "8px 15px", borderRadius: "var(--r)",
              background: "var(--red-b)", color: "var(--red)", border: "1px solid var(--red-bd)",
              fontSize: "12.5px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              transition: "background .12s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "#fecaca"}
              onMouseLeave={e => e.currentTarget.style.background = "var(--red-b)"}
            >
              <i className="ti ti-upload" style={{ fontSize: "15px" }} />
              Choose Backup File
              <input ref={fileInputRef} type="file" accept=".json" hidden onChange={handleFileSelect} />
            </label>
          </div>

          {/* App info card */}
          <div className="kb-card" style={{ background: "#0f172a", border: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <span style={{
                width: "34px", height: "34px", borderRadius: "9px", flexShrink: 0,
                background: "linear-gradient(135deg,#2563eb,#4f46e5)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "16px", fontWeight: 800, color: "#fff",
                boxShadow: "0 4px 12px rgba(37,99,235,0.4)",
              }}>K</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: "13px", color: "#f1f5f9" }}>Karobar</div>
                <div style={{ fontSize: "10.5px", color: "#475569" }}>Business Manager</div>
              </div>
            </div>
            <div style={{ fontSize: "11.5px", color: "#475569", lineHeight: 1.6 }}>
              Version 1.0.0 · © 2026 Karobar
            </div>
          </div>
        </div>

      </div>

      {/* ══════════════════════════════════════
          RESTORE CONFIRMATION MODAL
      ══════════════════════════════════════ */}
      {restoreTarget && (
        <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) setRestoreTarget(null); }}>
          <div style={modalStyle}>

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
                  <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--t1)" }}>Restore Backup</div>
                  <div style={{ fontSize: "12px", color: "var(--t3)", marginTop: "1px" }}>This action cannot be undone</div>
                </div>
              </div>
              <button onClick={() => setRestoreTarget(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--t3)", fontSize: "22px", lineHeight: 1, padding: "4px", borderRadius: "6px" }}>
                <i className="ti ti-x" />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "20px 22px" }}>
              <p style={{ margin: 0, fontSize: "13.5px", color: "var(--t2)", lineHeight: 1.5 }}>
                This will <strong style={{ color: "var(--t1)" }}>overwrite all current data</strong> with the contents of the selected backup file. Are you sure you want to continue?
              </p>
            </div>

            {/* Footer */}
            <div style={{
              padding: "14px 22px", borderTop: "var(--border)",
              display: "flex", justifyContent: "flex-end", gap: "10px", flexShrink: 0,
              background: "var(--bg-surface)", borderRadius: "0 0 var(--rl) var(--rl)",
            }}>
              <button className="kb-btn kb-btn-outline" onClick={() => setRestoreTarget(null)}>
                <i className="ti ti-x" /> Cancel
              </button>
              <button className="kb-btn kb-btn-danger" onClick={confirmRestoreBackup}>
                <i className="ti ti-database-import" /> Restore Backup
              </button>
            </div>

          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </>
  );
}

export default Settings;