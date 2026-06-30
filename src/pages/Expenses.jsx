import { useEffect, useState } from "react";
import api from "../services/api";
import Pagination from "../components/Pagination";

function Expenses() {
  const [expenses,    setExpenses]    = useState([]);
  const [search,      setSearch]      = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [totalCount,  setTotalCount]  = useState(0);
  const [loading,     setLoading]     = useState(false);
  const [stats,       setStats]       = useState({ totalCount: 0, totalAmount: 0, uniqueCategories: 0 });
  const [toast,       setToast]       = useState(null);

  const [title,     setTitle]     = useState("");
  const [amount,    setAmount]    = useState("");
  const [category,  setCategory]  = useState("");
  const [note,      setNote]      = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const categoryColors = ["blue", "amber", "purple", "green", "red"];
  const categoryColorMap = {};
  [...new Set(expenses.map(e => e.category).filter(Boolean))].forEach((cat, i) => {
    categoryColorMap[cat] = categoryColors[i % categoryColors.length];
  });

  useEffect(() => { fetchStats(); }, []);

  useEffect(() => {
    fetchExpenses(currentPage, search);
  }, [currentPage]);

  useEffect(() => {
    const t = setTimeout(() => {
      setCurrentPage(1);
      fetchExpenses(1, search);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchStats = async () => {
    try {
      const r = await api.get("/expenses/stats");
      setStats(r.data);
    } catch { /* silently ignore */ }
  };

  const fetchExpenses = async (page = 1, q = "") => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 15 });
      if (q.trim()) params.append("search", q.trim());
      const r = await api.get(`/expenses?${params}`);
      if (Array.isArray(r.data)) {
        setExpenses(r.data);
        setTotalPages(1);
        setTotalCount(r.data.length);
      } else {
        setExpenses(r.data.expenses ?? []);
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

  const resetForm = () => { setTitle(""); setAmount(""); setCategory(""); setNote(""); };
  const closeModal = () => { resetForm(); setModalOpen(false); };

  const addExpense = async () => {
    if (!title.trim())                    return showToast("error", "Expense title is required.");
    if (!amount || Number(amount) <= 0)   return showToast("error", "Please enter a valid amount.");
    try {
      await api.post("/expenses", { title, amount: Number(amount), category, note });
      fetchExpenses(currentPage, search);
      fetchStats();
      closeModal();
      showToast("success", "Expense added successfully!");
    } catch (error) {
      console.error(error);
      showToast("error", error?.response?.data?.message || "Failed to add expense.");
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pageTotalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  const overlayStyle = {
    position: "fixed", inset: 0,
    background: "rgba(15,23,42,0.55)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000, padding: "20px",
  };

  const modalStyle = {
    background: "#fff", borderRadius: "var(--rl)",
    width: "100%", maxWidth: "480px",
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
          <h1 className="kb-page-title">Expenses</h1>
          <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "var(--t3)" }}>
            Track and manage your business expenses
          </p>
        </div>
        <button className="kb-btn kb-btn-primary" onClick={() => setModalOpen(true)}>
          <i className="ti ti-plus" /> Add Expense
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 18 }}>
        <div className="kb-stat-card red">
          <div className="kb-stat-top">
            <span className="kb-stat-label">Total Expenses</span>
            <span className="kb-stat-icon red"><i className="ti ti-receipt" /></span>
          </div>
          <div className="kb-stat-value red">Rs. {(stats.totalAmount || 0).toLocaleString()}</div>
        </div>
        <div className="kb-stat-card blue">
          <div className="kb-stat-top">
            <span className="kb-stat-label">Total Records</span>
            <span className="kb-stat-icon blue"><i className="ti ti-list" /></span>
          </div>
          <div className="kb-stat-value">{stats.totalCount || totalCount}</div>
        </div>
        <div className="kb-stat-card amber">
          <div className="kb-stat-top">
            <span className="kb-stat-label">Categories</span>
            <span className="kb-stat-icon amber"><i className="ti ti-tags" /></span>
          </div>
          <div className="kb-stat-value">{stats.uniqueCategories || 0}</div>
        </div>
      </div>

      {/* ── Expense List ── */}
      <div className="kb-card">
        <div className="kb-card-header">
          <h2 className="kb-card-title">
            <i className="ti ti-list" /> Expense List
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {loading && (
              <div style={{ width: 16, height: 16, border: "2px solid #e2e8f0", borderTopColor: "var(--brand)", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
            )}
            <span style={{ fontSize: 12, color: "var(--t3)", background: "var(--bg-surface)", border: "var(--border)", borderRadius: "var(--r)", padding: "3px 10px" }}>
              {totalCount} records
            </span>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div className="kb-search">
            <i className="ti ti-search" />
            <input
              placeholder="Search by title, category or note…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="kb-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Note</th>
                <th className="text-end">Amount</th>
              </tr>
            </thead>
            <tbody>
              {loading && expenses.length === 0 ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    <td><div className="kb-skeleton" style={{ height: 11, width: "70%" }} /></td>
                    <td><div className="kb-skeleton" style={{ height: 18, width: 70, borderRadius: 20 }} /></td>
                    <td><div className="kb-skeleton" style={{ height: 11, width: "60%" }} /></td>
                    <td><div className="kb-skeleton" style={{ height: 11, width: "40%", marginLeft: "auto" }} /></td>
                  </tr>
                ))
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "40px", color: "var(--t3)" }}>
                    <i className="ti ti-receipt-off" style={{ fontSize: 28, display: "block", marginBottom: 8 }} />
                    No expenses recorded yet
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: "var(--red-b)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--red-m)" }}>
                          <i className="ti ti-receipt" style={{ fontSize: 15 }} />
                        </span>
                        <strong style={{ color: "var(--t1)" }}>{expense.title}</strong>
                      </div>
                    </td>
                    <td>
                      {expense.category ? (
                        <span className={`kb-badge ${categoryColorMap[expense.category] || "blue"}`}>{expense.category}</span>
                      ) : <span style={{ color: "var(--t3)" }}>—</span>}
                    </td>
                    <td style={{ color: "var(--t2)", fontSize: 12.5 }}>
                      {expense.note || <span style={{ color: "var(--t3)" }}>—</span>}
                    </td>
                    <td className="text-end">
                      <span style={{ fontWeight: 700, color: "var(--red-m)", fontSize: 13.5 }}>
                        Rs. {expense.amount?.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {expenses.length > 0 && (
              <tfoot>
                <tr style={{ background: "var(--bg-surface)" }}>
                  <td colSpan={3} style={{ padding: "10px", fontWeight: 700, fontSize: 12.5, color: "var(--t2)", borderTop: "2px solid #e2e8f0" }}>
                    {totalPages > 1 ? `Page ${currentPage} Total` : "Total"}
                  </td>
                  <td className="text-end" style={{ padding: "10px", fontWeight: 800, fontSize: 14, color: "var(--red-m)", borderTop: "2px solid #e2e8f0" }}>
                    Rs. {pageTotalExpenses.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "var(--border)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            <div style={{ fontSize: 12, color: "var(--t3)" }}>
              Page <strong style={{ color: "var(--t1)" }}>{currentPage}</strong> of <strong style={{ color: "var(--t1)" }}>{totalPages}</strong>
              {" · "}showing {((currentPage - 1) * 15) + 1}–{Math.min(currentPage * 15, totalCount)} of {totalCount} records
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════
          ADD EXPENSE MODAL
      ══════════════════════════════════════ */}
      {modalOpen && (
        <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div style={modalStyle}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "var(--border)", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <span style={{ width: 38, height: 38, borderRadius: 10, background: "var(--red-b)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--red-m)", fontSize: 20 }}>
                  <i className="ti ti-receipt" />
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "var(--t1)" }}>Add Expense</div>
                  <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 1 }}>Record a new business expense</div>
                </div>
              </div>
              <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--t3)", fontSize: 22, lineHeight: 1, padding: 4, borderRadius: 6 }}>
                <i className="ti ti-x" />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="kb-label">Expense Title</label>
                <input className="kb-input" placeholder="e.g. Office Rent" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="kb-label">Amount (Rs.)</label>
                <input type="number" className="kb-input" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} />
              </div>
              <div>
                <label className="kb-label">Category</label>
                <input className="kb-input" placeholder="e.g. Rent, Utilities, Salary" value={category} onChange={e => setCategory(e.target.value)} />
              </div>
              <div>
                <label className="kb-label">Note <span style={{ color: "var(--t3)", fontWeight: 400 }}>(optional)</span></label>
                <input className="kb-input" placeholder="Any additional details…" value={note} onChange={e => setNote(e.target.value)} />
              </div>
              {amount && Number(amount) > 0 && (
                <div style={{ background: "var(--red-b)", border: "1px solid var(--red-bd)", borderRadius: "var(--r)", padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12.5, color: "var(--red)", fontWeight: 600 }}>
                    <i className="ti ti-coins" style={{ marginRight: 6 }} />Expense Amount
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "var(--red-m)" }}>
                    Rs. {Number(amount).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: "14px 22px", borderTop: "var(--border)", display: "flex", justifyContent: "flex-end", gap: 10, flexShrink: 0, background: "var(--bg-surface)", borderRadius: "0 0 var(--rl) var(--rl)" }}>
              <button className="kb-btn kb-btn-outline" onClick={closeModal}><i className="ti ti-x" /> Cancel</button>
              <button className="kb-btn" style={{ background: "var(--red-m)", color: "#fff", boxShadow: "0 2px 8px rgba(220,38,38,0.25)" }} onClick={addExpense}>
                <i className="ti ti-circle-plus" /> Add Expense
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

export default Expenses;