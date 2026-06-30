import { useEffect, useState } from "react";
import api from "../services/api";
import Pagination from "../components/Pagination";

function StockHistory() {
  const [movements,    setMovements]    = useState([]);
  const [search,       setSearch]       = useState("");
  const [filter,       setFilter]       = useState("ALL");
  const [currentPage,  setCurrentPage]  = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);
  const [totalCount,   setTotalCount]   = useState(0);
  const [loading,      setLoading]      = useState(false);

  // Stats (fetched separately — full count, not paginated)
  const [stats, setStats] = useState({
    total: 0, purchases: 0, sales: 0, returns: 0, adjustments: 0,
    totalIn: 0, totalOut: 0,
  });

  useEffect(() => {
    fetchMovements(currentPage, filter, search);
  }, [currentPage, filter]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setCurrentPage(1);
      fetchMovements(1, filter, search);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch stats once on mount (all records, no pagination)
  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const r = await api.get("/stock-movements/stats");
      setStats(r.data);
    } catch {
      // fallback — stats endpoint may not exist, silently ignore
    }
  };

  const fetchMovements = async (page = 1, type = "ALL", q = "") => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 15 });
      if (type !== "ALL") params.append("type", type);
      if (q.trim())       params.append("search", q.trim());

      const r = await api.get(`/stock-movements?${params}`);

      // Support both paginated { movements, currentPage, totalPages, totalCount }
      // and plain array response (fallback)
      if (Array.isArray(r.data)) {
        setMovements(r.data);
        setTotalPages(1);
        setTotalCount(r.data.length);
      } else {
        setMovements(r.data.movements ?? r.data.data ?? []);
        setCurrentPage(r.data.currentPage ?? page);
        setTotalPages(r.data.totalPages ?? 1);
        setTotalCount(r.data.totalCount ?? r.data.total ?? 0);
      }
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleFilterChange = (key) => {
    setFilter(key);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ── derived counts from current full stats ─────────── */
  const filterOptions = [
    { key: "ALL",        label: "All",        color: "var(--brand)",   bg: "var(--blue-b)",  border: "var(--blue-bd)",  count: stats.total || totalCount },
    { key: "PURCHASE",   label: "Purchase",   color: "var(--green-m)", bg: "var(--green-b)", border: "var(--green-bd)", count: stats.purchases  || 0 },
    { key: "SALE",       label: "Sale",       color: "var(--red-m)",   bg: "var(--red-b)",   border: "var(--red-bd)",   count: stats.sales      || 0 },
    { key: "RETURN",     label: "Return",     color: "var(--blue-m)",  bg: "var(--blue-b)",  border: "var(--blue-bd)",  count: stats.returns    || 0 },
    { key: "ADJUSTMENT", label: "Adjustment", color: "var(--amber-m)", bg: "var(--amber-b)", border: "var(--amber-bd)", count: stats.adjustments|| 0 },
  ];

  const typeBadge = (type) => {
    const map = {
      PURCHASE:   { cls:"green", icon:"ti-arrow-down-circle", label:"Purchase"   },
      SALE:       { cls:"red",   icon:"ti-arrow-up-circle",   label:"Sale"       },
      RETURN:     { cls:"blue",  icon:"ti-refresh",           label:"Return"     },
      ADJUSTMENT: { cls:"amber", icon:"ti-adjustments",       label:"Adjustment" },
    };
    const t = map[type] || { cls:"blue", icon:"ti-circle", label:type };
    return (
      <span className={`kb-badge ${t.cls}`}>
        <i className={`ti ${t.icon}`} style={{ fontSize:10 }} /> {t.label}
      </span>
    );
  };

  return (
    <>
      {/* ── Page header ──────────────────────────────── */}
      <div className="kb-page-header">
        <div>
          <h1 className="kb-page-title">Stock History</h1>
          <p style={{ margin:"2px 0 0", fontSize:12.5, color:"var(--t3)" }}>
            Track all inventory movements — purchases, sales, returns and adjustments
          </p>
        </div>
      </div>

      {/* ── Stat cards ───────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:18 }}>
        <div className="kb-stat-card blue">
          <div className="kb-stat-top">
            <span className="kb-stat-label">Total movements</span>
            <span className="kb-stat-icon blue"><i className="ti ti-history" /></span>
          </div>
          <div className="kb-stat-value">{stats.total || totalCount}</div>
        </div>
        <div className="kb-stat-card green">
          <div className="kb-stat-top">
            <span className="kb-stat-label">Stock in</span>
            <span className="kb-stat-icon green"><i className="ti ti-arrow-down-circle" /></span>
          </div>
          <div className="kb-stat-value green">+{stats.totalIn || 0}</div>
        </div>
        <div className="kb-stat-card red">
          <div className="kb-stat-top">
            <span className="kb-stat-label">Stock out</span>
            <span className="kb-stat-icon red"><i className="ti ti-arrow-up-circle" /></span>
          </div>
          <div className="kb-stat-value red">−{stats.totalOut || 0}</div>
        </div>
        <div className="kb-stat-card amber">
          <div className="kb-stat-top">
            <span className="kb-stat-label">Adjustments</span>
            <span className="kb-stat-icon amber"><i className="ti ti-adjustments" /></span>
          </div>
          <div className="kb-stat-value">{stats.adjustments || 0}</div>
        </div>
      </div>

      {/* ── Filter tabs + search ──────────────────────── */}
      <div className="kb-card" style={{ marginBottom:18, padding:"14px 16px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
          {filterOptions.map(f => (
            <button key={f.key} onClick={() => handleFilterChange(f.key)} style={{
              padding:"6px 14px", borderRadius:"var(--r)", fontSize:12.5,
              fontWeight:600, cursor:"pointer", border:"1px solid",
              fontFamily:"inherit", transition:"all .12s",
              background: filter === f.key ? f.color : f.bg,
              color:       filter === f.key ? "#fff"  : f.color,
              borderColor: filter === f.key ? f.color : f.border,
              display:"flex", alignItems:"center", gap:6,
            }}>
              {f.label}
              <span style={{
                background: filter === f.key ? "rgba(255,255,255,0.25)" : f.color,
                color:"#fff", fontSize:10, fontWeight:700,
                padding:"1px 6px", borderRadius:20, lineHeight:"16px",
              }}>
                {f.count}
              </span>
            </button>
          ))}

          <div className="kb-search" style={{ flex:1, minWidth:220 }}>
            <i className="ti ti-search" />
            <input
              placeholder="Search by product name or note…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {(search || filter !== "ALL") && (
            <button className="kb-btn kb-btn-outline" style={{ padding:"5px 10px", fontSize:11.5 }}
              onClick={() => { setSearch(""); handleFilterChange("ALL"); }}>
              <i className="ti ti-x" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Movements table ───────────────────────────── */}
      <div className="kb-card">
        <div className="kb-card-header">
          <h2 className="kb-card-title">
            <i className="ti ti-list" style={{ color:"var(--blue-m)" }} /> Movement log
          </h2>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {loading && (
              <div style={{ width:16, height:16, border:"2px solid #e2e8f0", borderTopColor:"var(--brand)", borderRadius:"50%", animation:"spin .7s linear infinite" }} />
            )}
            <span style={{ fontSize:12, color:"var(--t3)", background:"var(--bg-surface)", border:"var(--border)", borderRadius:"var(--r)", padding:"3px 10px" }}>
              {totalCount} records
            </span>
          </div>
        </div>

        <div style={{ overflowX:"auto" }}>
          <table className="kb-table">
            <thead>
              <tr>
                <th>Date &amp; Time</th>
                <th>Product</th>
                <th>Type</th>
                <th className="text-end">Quantity</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {loading && movements.length === 0 ? (
                [...Array(8)].map((_,i) => (
                  <tr key={i}>
                    <td><div className="kb-skeleton" style={{ height:11, width:"80%" }} /></td>
                    <td><div className="kb-skeleton" style={{ height:11, width:"70%" }} /></td>
                    <td><div className="kb-skeleton" style={{ height:18, width:70, borderRadius:20 }} /></td>
                    <td><div className="kb-skeleton" style={{ height:11, width:40, marginLeft:"auto" }} /></td>
                    <td><div className="kb-skeleton" style={{ height:11, width:"60%" }} /></td>
                  </tr>
                ))
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign:"center", padding:"40px", color:"var(--t3)" }}>
                    <i className="ti ti-history-off" style={{ fontSize:28, display:"block", marginBottom:8 }} />
                    No stock movements found
                  </td>
                </tr>
              ) : (
                movements.map(m => (
                  <tr key={m._id}>
                    <td style={{ whiteSpace:"nowrap" }}>
                      <div style={{ fontSize:12.5, fontWeight:600, color:"var(--t1)" }}>
                        {new Date(m.createdAt).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })}
                      </div>
                      <div style={{ fontSize:11, color:"var(--t3)" }}>
                        {new Date(m.createdAt).toLocaleTimeString("en-US", { hour:"2-digit", minute:"2-digit" })}
                      </div>
                    </td>
                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{
                          width:30, height:30, borderRadius:8, flexShrink:0,
                          background:"var(--blue-b)", display:"grid", placeItems:"center", color:"var(--blue-m)",
                        }}>
                          <i className="ti ti-package" style={{ fontSize:14 }} />
                        </span>
                        <strong style={{ color:"var(--t1)", fontSize:12.5 }}>
                          {m.product?.name || "—"}
                        </strong>
                      </div>
                    </td>
                    <td>{typeBadge(m.type)}</td>
                    <td className="text-end">
                      <span style={{
                        fontWeight:800, fontSize:13.5,
                        color: m.type === "SALE" ? "var(--red-m)" : "var(--green-m)",
                      }}>
                        {m.type === "SALE" ? `−${m.quantity}` : `+${m.quantity}`}
                      </span>
                    </td>
                    <td style={{ color:"var(--t2)", fontSize:12.5 }}>
                      {m.note || <span style={{ color:"var(--t3)" }}>—</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ──────────────────────────────── */}
        {totalPages > 1 && (
          <div style={{ marginTop:14, paddingTop:14, borderTop:"var(--border)", display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
            <div style={{ fontSize:12, color:"var(--t3)" }}>
              Page <strong style={{ color:"var(--t1)" }}>{currentPage}</strong> of <strong style={{ color:"var(--t1)" }}>{totalPages}</strong>
              {" · "}showing {((currentPage-1)*15)+1}–{Math.min(currentPage*15, totalCount)} of {totalCount} records
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </>
  );
}

export default StockHistory;