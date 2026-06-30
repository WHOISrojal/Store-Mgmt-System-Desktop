import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Pagination from "../components/Pagination";

function Suppliers() {
  const [suppliers,   setSuppliers]   = useState([]);
  const [search,      setSearch]      = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [totalCount,  setTotalCount]  = useState(0);
  const [loading,     setLoading]     = useState(false);
  const [toast,       setToast]       = useState(null);

  const [name,      setName]      = useState("");
  const [phone,     setPhone]     = useState("");
  const [address,   setAddress]   = useState("");
  const [notes,     setNotes]     = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const role = localStorage.getItem("role");

  useEffect(() => {
    fetchSuppliers(currentPage, search);
  }, [currentPage]);

  useEffect(() => {
    const t = setTimeout(() => {
      setCurrentPage(1);
      fetchSuppliers(1, search);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchSuppliers = async (page = 1, q = "") => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 15 });
      if (q.trim()) params.append("search", q.trim());
      const r = await api.get(`/suppliers?${params}`);
      if (Array.isArray(r.data)) {
        setSuppliers(r.data);
        setTotalPages(1);
        setTotalCount(r.data.length);
      } else {
        setSuppliers(r.data.suppliers ?? []);
        setCurrentPage(r.data.currentPage ?? page);
        setTotalPages(r.data.totalPages ?? 1);
        setTotalCount(r.data.totalCount ?? 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => { setName(""); setPhone(""); setAddress(""); setNotes(""); };
  const closeModal = () => { resetForm(); setModalOpen(false); };

  const addSupplier = async () => {
    if (!name.trim()) return showToast("error", "Supplier name is required.");
    try {
      await api.post("/suppliers", { name, phone, address, notes });
      fetchSuppliers(currentPage, search);
      closeModal();
      showToast("success", "Supplier added successfully!");
    } catch (error) {
      console.error(error);
      showToast("error", error?.response?.data?.message || "Failed to add supplier.");
    }
  };

  const deleteSupplier = async (id) => {
    if (!window.confirm("Delete this supplier?")) return;
    try {
      await api.delete(`/suppliers/${id}`);
      fetchSuppliers(currentPage, search);
      showToast("success", "Supplier deleted successfully.");
    } catch (error) {
      console.error(error);
      showToast("error", "Failed to delete supplier.");
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const overlayStyle = {
    position: "fixed", inset: 0,
    background: "rgba(15,23,42,0.55)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000, padding: "20px",
  };

  const modalStyle = {
    background: "#fff", borderRadius: "var(--rl)",
    width: "100%", maxWidth: "500px",
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
          <h1 className="kb-page-title">Suppliers</h1>
          <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "var(--t3)" }}>
            Manage your suppliers and view their ledgers
          </p>
        </div>
        <button className="kb-btn kb-btn-primary" onClick={() => setModalOpen(true)}>
          <i className="ti ti-plus" /> Add Supplier
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14, marginBottom: 18 }}>
        <div className="kb-stat-card blue">
          <div className="kb-stat-top">
            <span className="kb-stat-label">Total Suppliers</span>
            <span className="kb-stat-icon blue"><i className="ti ti-truck" /></span>
          </div>
          <div className="kb-stat-value">{totalCount}</div>
        </div>
        <div className="kb-stat-card green">
          <div className="kb-stat-top">
            <span className="kb-stat-label">Active Contacts</span>
            <span className="kb-stat-icon green"><i className="ti ti-phone" /></span>
          </div>
          <div className="kb-stat-value">{suppliers.filter(s => s.phone).length}</div>
        </div>
      </div>

      {/* ── Suppliers Table ── */}
      <div className="kb-card">
        <div className="kb-card-header">
          <h2 className="kb-card-title">
            <i className="ti ti-list" /> Supplier List
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {loading && (
              <div style={{ width: 16, height: 16, border: "2px solid #e2e8f0", borderTopColor: "var(--brand)", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
            )}
            <span style={{ fontSize: 12, color: "var(--t3)", background: "var(--bg-surface)", border: "var(--border)", borderRadius: "var(--r)", padding: "3px 10px" }}>
              {totalCount} suppliers
            </span>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div className="kb-search">
            <i className="ti ti-search" />
            <input
              placeholder="Search by name, phone or address…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="kb-table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && suppliers.length === 0 ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    <td><div className="kb-skeleton" style={{ height: 11, width: "70%" }} /></td>
                    <td><div className="kb-skeleton" style={{ height: 11, width: "60%" }} /></td>
                    <td><div className="kb-skeleton" style={{ height: 11, width: "60%" }} /></td>
                    <td><div className="kb-skeleton" style={{ height: 11, width: "50%" }} /></td>
                    <td><div className="kb-skeleton" style={{ height: 28, width: 100, borderRadius: "var(--r)" }} /></td>
                  </tr>
                ))
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "var(--t3)" }}>
                    <i className="ti ti-truck-off" style={{ fontSize: 28, display: "block", marginBottom: 8 }} />
                    No suppliers found
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier) => (
                  <tr key={supplier._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: "var(--blue-b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "var(--blue-m)", textTransform: "uppercase" }}>
                          {supplier.name?.charAt(0) || "S"}
                        </span>
                        <strong style={{ color: "var(--t1)" }}>{supplier.name}</strong>
                      </div>
                    </td>
                    <td>
                      {supplier.phone ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--t2)" }}>
                          <i className="ti ti-phone" style={{ fontSize: 13, color: "var(--t3)" }} /> {supplier.phone}
                        </div>
                      ) : <span style={{ color: "var(--t3)" }}>—</span>}
                    </td>
                    <td>
                      {supplier.address ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--t2)" }}>
                          <i className="ti ti-map-pin" style={{ fontSize: 13, color: "var(--t3)" }} /> {supplier.address}
                        </div>
                      ) : <span style={{ color: "var(--t3)" }}>—</span>}
                    </td>
                    <td style={{ color: "var(--t2)", fontSize: 12.5, maxWidth: 180 }}>
                      {supplier.notes || <span style={{ color: "var(--t3)" }}>—</span>}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Link to={`/suppliers/${supplier._id}`} className="kb-btn kb-btn-outline" style={{ padding: "5px 10px", fontSize: 11.5 }}>
                          <i className="ti ti-book" /> Ledger
                        </Link>
                        {role === "ADMIN" && (
                          <button className="kb-btn kb-btn-danger" style={{ padding: "5px 10px", fontSize: 11.5 }} onClick={() => deleteSupplier(supplier._id)}>
                            <i className="ti ti-trash" /> Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "var(--border)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            <div style={{ fontSize: 12, color: "var(--t3)" }}>
              Page <strong style={{ color: "var(--t1)" }}>{currentPage}</strong> of <strong style={{ color: "var(--t1)" }}>{totalPages}</strong>
              {" · "}showing {((currentPage - 1) * 15) + 1}–{Math.min(currentPage * 15, totalCount)} of {totalCount} suppliers
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════
          ADD SUPPLIER MODAL
      ══════════════════════════════════════ */}
      {modalOpen && (
        <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div style={modalStyle}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "var(--border)", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <span style={{ width: 38, height: 38, borderRadius: 10, background: "var(--blue-b)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--blue-m)", fontSize: 20 }}>
                  <i className="ti ti-user-plus" />
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "var(--t1)" }}>Add Supplier</div>
                  <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 1 }}>Enter supplier details below</div>
                </div>
              </div>
              <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--t3)", fontSize: 22, lineHeight: 1, padding: 4, borderRadius: 6 }}>
                <i className="ti ti-x" />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="kb-label">Supplier Name</label>
                <input className="kb-input" placeholder="e.g. Sharma Traders" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="kb-label">Phone Number</label>
                <input className="kb-input" placeholder="e.g. 9800000000" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div>
                <label className="kb-label">Address</label>
                <input className="kb-input" placeholder="e.g. New Road, Kathmandu" value={address} onChange={e => setAddress(e.target.value)} />
              </div>
              <div>
                <label className="kb-label">Notes <span style={{ color: "var(--t3)", fontWeight: 400 }}>(optional)</span></label>
                <input className="kb-input" placeholder="Any additional notes…" value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: "14px 22px", borderTop: "var(--border)", display: "flex", justifyContent: "flex-end", gap: 10, flexShrink: 0, background: "var(--bg-surface)", borderRadius: "0 0 var(--rl) var(--rl)" }}>
              <button className="kb-btn kb-btn-outline" onClick={closeModal}><i className="ti ti-x" /> Cancel</button>
              <button className="kb-btn kb-btn-primary" onClick={addSupplier}><i className="ti ti-circle-plus" /> Add Supplier</button>
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

export default Suppliers;