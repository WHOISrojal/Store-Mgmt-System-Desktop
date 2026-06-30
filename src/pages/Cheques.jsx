import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import Pagination from "../components/Pagination";

function Cheques() {
  const [cheques,     setCheques]     = useState([]);
  const [filter,      setFilter]      = useState("ALL");
  const [search,      setSearch]      = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [totalCount,  setTotalCount]  = useState(0);
  const [loading,     setLoading]     = useState(false);
  const [stats,       setStats]       = useState({ pending: 0, cleared: 0, bounced: 0, overdue: 0, totalPendingValue: 0 });

  useEffect(() => { fetchStats(); }, []);

  useEffect(() => {
    fetchCheques(currentPage, filter, search);
  }, [currentPage, filter]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setCurrentPage(1);
      fetchCheques(1, filter, search);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchStats = async () => {
    try {
      const r = await api.get("/sales/cheques/stats");
      setStats(r.data);
    } catch {
      // silently ignore if not yet available
    }
  };

  const fetchCheques = async (page = 1, status = "ALL", q = "") => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 15 });
      if (status !== "ALL") params.append("status", status);
      if (q.trim())         params.append("search", q.trim());

      const r = await api.get(`/sales/cheques?${params}`);

      if (Array.isArray(r.data)) {
        setCheques(r.data);
        setTotalPages(1);
        setTotalCount(r.data.length);
      } else {
        setCheques(r.data.cheques ?? []);
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

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/sales/${id}/cheque-status`, { status });
      fetchCheques(currentPage, filter, search);
      fetchStats();
    } catch (error) {
      alert("Failed");
    }
  };

  const handleFilterChange = (key) => {
    setFilter(key);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isOverdue = (cheque) =>
    cheque.chequeStatus === "PENDING" && new Date(cheque.chequeDate) < new Date();

  const filters = [
    { key: "ALL",     label: "All",     color: "var(--brand)",   bg: "var(--blue-b)",   border: "var(--blue-bd)"   },
    { key: "PENDING", label: "Pending", color: "#d97706",        bg: "var(--amber-b)",  border: "var(--amber-bd)"  },
    { key: "CLEARED", label: "Cleared", color: "var(--green-m)", bg: "var(--green-b)",  border: "var(--green-bd)"  },
    { key: "BOUNCED", label: "Bounced", color: "var(--red-m)",   bg: "var(--red-b)",    border: "var(--red-bd)"    },
    { key: "OVERDUE", label: "Overdue", color: "#7c3aed",        bg: "var(--purple-b)", border: "var(--purple-bd)" },
  ];

  const statusBadge = (cheque) => {
    if (isOverdue(cheque)) return <span className="kb-badge purple"><i className="ti ti-clock-exclamation" style={{ fontSize: 10 }} />Overdue</span>;
    if (cheque.chequeStatus === "CLEARED") return <span className="kb-badge green"><i className="ti ti-check" style={{ fontSize: 10 }} />Cleared</span>;
    if (cheque.chequeStatus === "BOUNCED") return <span className="kb-badge red"><i className="ti ti-x" style={{ fontSize: 10 }} />Bounced</span>;
    return <span className="kb-badge amber"><i className="ti ti-clock" style={{ fontSize: 10 }} />Pending</span>;
  };

  return (
    <>
      {/* ── Page Header ── */}
      <div className="kb-page-header">
        <div>
          <h1 className="kb-page-title">Cheque Management</h1>
          <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "var(--t3)" }}>
            Track and manage all cheque transactions
          </p>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 18 }}>
        <div className="kb-stat-card amber">
          <div className="kb-stat-top">
            <span className="kb-stat-label">Pending</span>
            <span className="kb-stat-icon amber"><i className="ti ti-clock" /></span>
          </div>
          <div className="kb-stat-value">{stats.pending}</div>
        </div>
        <div className="kb-stat-card green">
          <div className="kb-stat-top">
            <span className="kb-stat-label">Cleared</span>
            <span className="kb-stat-icon green"><i className="ti ti-circle-check" /></span>
          </div>
          <div className="kb-stat-value green">{stats.cleared}</div>
        </div>
        <div className="kb-stat-card red">
          <div className="kb-stat-top">
            <span className="kb-stat-label">Bounced</span>
            <span className="kb-stat-icon red"><i className="ti ti-circle-x" /></span>
          </div>
          <div className="kb-stat-value red">{stats.bounced}</div>
        </div>
        <div className="kb-stat-card purple" style={{ background: "linear-gradient(160deg,#fff 70%,#f5f3ff)" }}>
          <div className="kb-stat-top">
            <span className="kb-stat-label">Overdue</span>
            <span className="kb-stat-icon purple"><i className="ti ti-clock-exclamation" /></span>
          </div>
          <div className="kb-stat-value" style={{ color: "#7c3aed" }}>{stats.overdue}</div>
        </div>
      </div>

      {/* Pending value banner */}
      {stats.totalPendingValue > 0 && (
        <div style={{
          background: "var(--amber-b)", border: "1px solid var(--amber-bd)",
          borderRadius: "var(--r)", padding: "12px 16px", marginBottom: 18,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <i className="ti ti-info-circle" style={{ color: "#d97706", fontSize: 18, flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: "var(--amber)", fontWeight: 600 }}>
            Total pending cheque value: <strong>Rs. {stats.totalPendingValue.toLocaleString()}</strong>
          </span>
        </div>
      )}

      {/* ── Filters & Search ── */}
      <div className="kb-card" style={{ marginBottom: 18, padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => handleFilterChange(f.key)}
              style={{
                padding: "6px 14px", borderRadius: "var(--r)", fontSize: 12.5,
                fontWeight: 600, cursor: "pointer", border: "1px solid",
                fontFamily: "inherit", transition: "all .12s",
                background:  filter === f.key ? f.color : f.bg,
                color:       filter === f.key ? "#fff"  : f.color,
                borderColor: filter === f.key ? f.color : f.border,
                display: "flex", alignItems: "center", gap: 5,
              }}
            >
              {f.label}
              {f.key === "PENDING" && stats.pending > 0 && (
                <span style={{ background: filter === "PENDING" ? "rgba(255,255,255,0.3)" : "#d97706", color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 20 }}>
                  {stats.pending}
                </span>
              )}
              {f.key === "OVERDUE" && stats.overdue > 0 && (
                <span style={{ background: filter === "OVERDUE" ? "rgba(255,255,255,0.3)" : "#7c3aed", color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 20 }}>
                  {stats.overdue}
                </span>
              )}
            </button>
          ))}

          <div className="kb-search" style={{ flex: 1, minWidth: 220 }}>
            <i className="ti ti-search" />
            <input
              placeholder="Search customer, PAN, invoice, cheque no, bank…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {(search || filter !== "ALL") && (
            <button className="kb-btn kb-btn-outline" style={{ padding: "5px 10px", fontSize: 11.5 }}
              onClick={() => { setSearch(""); handleFilterChange("ALL"); }}>
              <i className="ti ti-x" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Cheques Table ── */}
      <div className="kb-card">
        <div className="kb-card-header">
          <h2 className="kb-card-title">
            <i className="ti ti-checkup-list" /> Cheque List
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {loading && (
              <div style={{ width: 16, height: 16, border: "2px solid #e2e8f0", borderTopColor: "var(--brand)", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
            )}
            <span style={{ fontSize: 12, color: "var(--t3)", background: "var(--bg-surface)", border: "var(--border)", borderRadius: "var(--r)", padding: "3px 10px" }}>
              {totalCount} cheques
            </span>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="kb-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Customer</th>
                <th>PAN</th>
                <th>Cheque No</th>
                <th>Bank</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th>Days</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && cheques.length === 0 ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    <td><div className="kb-skeleton" style={{ height: 11, width: 80 }} /></td>
                    <td><div className="kb-skeleton" style={{ height: 11, width: "70%" }} /></td>
                    <td><div className="kb-skeleton" style={{ height: 11, width: 60 }} /></td>
                    <td><div className="kb-skeleton" style={{ height: 11, width: 60 }} /></td>
                    <td><div className="kb-skeleton" style={{ height: 11, width: 70 }} /></td>
                    <td><div className="kb-skeleton" style={{ height: 11, width: 70 }} /></td>
                    <td><div className="kb-skeleton" style={{ height: 11, width: 70 }} /></td>
                    <td><div className="kb-skeleton" style={{ height: 18, width: 70, borderRadius: 20 }} /></td>
                    <td><div className="kb-skeleton" style={{ height: 11, width: 50 }} /></td>
                    <td><div className="kb-skeleton" style={{ height: 28, width: 100, borderRadius: "var(--r)" }} /></td>
                  </tr>
                ))
              ) : cheques.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", padding: "40px", color: "var(--t3)" }}>
                    <i className="ti ti-file-off" style={{ fontSize: 28, display: "block", marginBottom: 8 }} />
                    No cheques found
                  </td>
                </tr>
              ) : (
                cheques.map((cheque) => {
                  const today      = new Date();
                  const chequeDate = new Date(cheque.chequeDate);
                  const daysLeft   = Math.ceil((chequeDate - today) / (1000 * 60 * 60 * 24));
                  const overdueCheque = isOverdue(cheque);

                  return (
                    <tr key={cheque._id} style={overdueCheque ? { background: "#fef2f2" } : {}}>
                      <td>
                        <Link to={`/invoice/${cheque._id}`} style={{ color: "var(--brand)", fontWeight: 600, fontSize: 12, fontFamily: "monospace", textDecoration: "none" }}>
                          INV-{cheque._id.slice(-6).toUpperCase()}
                        </Link>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, background: "var(--blue-b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "var(--blue-m)", textTransform: "uppercase" }}>
                            {cheque.customer?.name?.charAt(0) || "?"}
                          </span>
                          <strong style={{ color: "var(--t1)", fontSize: 12.5 }}>{cheque.customer?.name}</strong>
                        </div>
                      </td>
                      <td style={{ fontFamily: "monospace", fontSize: 12, color: "var(--t2)" }}>
                        {cheque.customer?.panNumber || <span style={{ color: "var(--t3)" }}>—</span>}
                      </td>
                      <td style={{ fontFamily: "monospace", fontSize: 12, color: "var(--t2)" }}>{cheque.chequeNumber || "—"}</td>
                      <td style={{ color: "var(--t2)", fontSize: 12.5 }}>{cheque.bankName || "—"}</td>
                      <td style={{ fontWeight: 700, color: "var(--t1)" }}>Rs. {cheque.totalAmount?.toLocaleString()}</td>
                      <td style={{ color: "var(--t2)", fontSize: 12.5, whiteSpace: "nowrap" }}>
                        {new Date(cheque.chequeDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td>{statusBadge(cheque)}</td>
                      <td>
                        {daysLeft >= 0 ? (
                          <span style={{ fontSize: 12, color: "var(--green-m)", fontWeight: 600 }}>{daysLeft}d left</span>
                        ) : (
                          <span style={{ fontSize: 12, color: "var(--red-m)", fontWeight: 600 }}>{Math.abs(daysLeft)}d overdue</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          {cheque.chequeStatus !== "CLEARED" && (
                            <button className="kb-btn kb-btn-success" style={{ padding: "5px 10px", fontSize: 11.5 }} onClick={() => updateStatus(cheque._id, "CLEARED")}>
                              <i className="ti ti-check" /> Clear
                            </button>
                          )}
                          {cheque.chequeStatus !== "BOUNCED" && (
                            <button className="kb-btn kb-btn-danger" style={{ padding: "5px 10px", fontSize: 11.5 }} onClick={() => updateStatus(cheque._id, "BOUNCED")}>
                              <i className="ti ti-x" /> Bounce
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "var(--border)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            <div style={{ fontSize: 12, color: "var(--t3)" }}>
              Page <strong style={{ color: "var(--t1)" }}>{currentPage}</strong> of <strong style={{ color: "var(--t1)" }}>{totalPages}</strong>
              {" · "}showing {((currentPage - 1) * 15) + 1}–{Math.min(currentPage * 15, totalCount)} of {totalCount} cheques
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

export default Cheques;