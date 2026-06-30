import { useEffect, useState } from "react";
import api from "../services/api";
import Pagination from "../components/Pagination";

function AuditLogs() {
  const [logs,        setLogs]        = useState([]);
  const [search,      setSearch]      = useState("");
  const [filter,      setFilter]      = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [totalCount,  setTotalCount]  = useState(0);
  const [loading,     setLoading]     = useState(false);
  const [stats,       setStats]       = useState({
    total: 0, creates: 0, deletes: 0, updates: 0,
    restores: 0, resets: 0, uniqueUsers: 0,
  });

  // Fetch stats once on mount
  useEffect(() => { fetchStats(); }, []);

  // Fetch logs when page or filter changes
  useEffect(() => {
    fetchLogs(currentPage, filter, search);
  }, [currentPage, filter]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setCurrentPage(1);
      fetchLogs(1, filter, search);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchStats = async () => {
    try {
      const r = await api.get("/audit-logs/stats");
      setStats(r.data);
    } catch {
      // stats endpoint may not exist yet — silently ignore
    }
  };

  const fetchLogs = async (page = 1, action = "ALL", q = "") => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 20 });
      if (action !== "ALL") params.append("action", action);
      if (q.trim())         params.append("search", q.trim());

      const r = await api.get(`/audit-logs?${params}`);

      // Support both paginated and plain array responses
      if (Array.isArray(r.data)) {
        setLogs(r.data);
        setTotalPages(1);
        setTotalCount(r.data.length);
      } else {
        setLogs(r.data.logs ?? []);
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

  const handleFilterChange = (key) => {
    setFilter(key);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getActionType = (action) => {
    if (action.includes("CREATE"))  return "CREATE";
    if (action.includes("DELETE"))  return "DELETE";
    if (action.includes("UPDATE"))  return "UPDATE";
    if (action.includes("RESTORE")) return "RESTORE";
    if (action.includes("RESET"))   return "RESET";
    return "OTHER";
  };

  const actionConfig = {
    CREATE:  { cls: "green",  icon: "ti-circle-plus", label: "Create"  },
    DELETE:  { cls: "red",    icon: "ti-trash",        label: "Delete"  },
    UPDATE:  { cls: "amber",  icon: "ti-pencil",       label: "Update"  },
    RESTORE: { cls: "blue",   icon: "ti-refresh",      label: "Restore" },
    RESET:   { cls: "purple", icon: "ti-key",          label: "Reset"   },
    OTHER:   { cls: "blue",   icon: "ti-activity",     label: "Other"   },
  };

  const actionBadge = (action) => {
    const cfg = actionConfig[getActionType(action)];
    return (
      <span className={`kb-badge ${cfg.cls}`}>
        <i className={`ti ${cfg.icon}`} style={{ fontSize: 10 }} />
        {action}
      </span>
    );
  };

  const filterOptions = [
    { key: "ALL",     label: "All",     color: "var(--brand)",   bg: "var(--blue-b)",   border: "var(--blue-bd)",   count: stats.total    || totalCount },
    { key: "CREATE",  label: "Create",  color: "var(--green-m)", bg: "var(--green-b)",  border: "var(--green-bd)",  count: stats.creates  || 0 },
    { key: "UPDATE",  label: "Update",  color: "#d97706",        bg: "var(--amber-b)",  border: "var(--amber-bd)",  count: stats.updates  || 0 },
    { key: "DELETE",  label: "Delete",  color: "var(--red-m)",   bg: "var(--red-b)",    border: "var(--red-bd)",    count: stats.deletes  || 0 },
    { key: "RESTORE", label: "Restore", color: "var(--blue-m)",  bg: "var(--blue-b)",   border: "var(--blue-bd)",   count: stats.restores || 0 },
    { key: "RESET",   label: "Reset",   color: "#7c3aed",        bg: "var(--purple-b)", border: "var(--purple-bd)", count: stats.resets   || 0 },
  ];

  return (
    <>
      {/* ── Page Header ── */}
      <div className="kb-page-header">
        <div>
          <h1 className="kb-page-title">Audit Logs</h1>
          <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "var(--t3)" }}>
            Full activity trail — every action recorded by every user
          </p>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 18 }}>
        <div className="kb-stat-card blue">
          <div className="kb-stat-top">
            <span className="kb-stat-label">Total Logs</span>
            <span className="kb-stat-icon blue"><i className="ti ti-clipboard-list" /></span>
          </div>
          <div className="kb-stat-value">{stats.total || totalCount}</div>
        </div>
        <div className="kb-stat-card green">
          <div className="kb-stat-top">
            <span className="kb-stat-label">Creates</span>
            <span className="kb-stat-icon green"><i className="ti ti-circle-plus" /></span>
          </div>
          <div className="kb-stat-value green">{stats.creates || 0}</div>
        </div>
        <div className="kb-stat-card red">
          <div className="kb-stat-top">
            <span className="kb-stat-label">Deletes</span>
            <span className="kb-stat-icon red"><i className="ti ti-trash" /></span>
          </div>
          <div className="kb-stat-value red">{stats.deletes || 0}</div>
        </div>
        <div className="kb-stat-card amber">
          <div className="kb-stat-top">
            <span className="kb-stat-label">Active Users</span>
            <span className="kb-stat-icon amber"><i className="ti ti-users" /></span>
          </div>
          <div className="kb-stat-value">{stats.uniqueUsers || 0}</div>
        </div>
      </div>

      {/* ── Filters & Search ── */}
      <div className="kb-card" style={{ marginBottom: 18, padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {filterOptions.map(f => (
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
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              {f.label}
              <span style={{
                background: filter === f.key ? "rgba(255,255,255,0.25)" : f.color,
                color: "#fff", fontSize: 10, fontWeight: 700,
                padding: "1px 6px", borderRadius: 20, lineHeight: "16px",
              }}>
                {f.count}
              </span>
            </button>
          ))}

          {/* Search */}
          <div className="kb-search" style={{ flex: 1, minWidth: 220 }}>
            <i className="ti ti-search" />
            <input
              placeholder="Search by user, action or details…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Clear */}
          {(search || filter !== "ALL") && (
            <button
              className="kb-btn kb-btn-outline"
              style={{ padding: "5px 10px", fontSize: 11.5 }}
              onClick={() => { setSearch(""); handleFilterChange("ALL"); }}
            >
              <i className="ti ti-x" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Logs Table ── */}
      <div className="kb-card">
        <div className="kb-card-header">
          <h2 className="kb-card-title">
            <i className="ti ti-clipboard-list" style={{ color: "var(--blue-m)" }} />
            Activity Log
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {loading && (
              <div style={{
                width: 16, height: 16,
                border: "2px solid #e2e8f0",
                borderTopColor: "var(--brand)",
                borderRadius: "50%",
                animation: "spin .7s linear infinite",
              }} />
            )}
            <span style={{ fontSize: 12, color: "var(--t3)", background: "var(--bg-surface)", border: "var(--border)", borderRadius: "var(--r)", padding: "3px 10px" }}>
              {totalCount} entries
            </span>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="kb-table">
            <thead>
              <tr>
                <th>Date &amp; Time</th>
                <th>User</th>
                <th>Action</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading && logs.length === 0 ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    <td><div className="kb-skeleton" style={{ height: 11, width: "80%" }} /></td>
                    <td><div className="kb-skeleton" style={{ height: 11, width: "60%" }} /></td>
                    <td><div className="kb-skeleton" style={{ height: 18, width: 90, borderRadius: 20 }} /></td>
                    <td><div className="kb-skeleton" style={{ height: 11, width: "70%" }} /></td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "40px", color: "var(--t3)" }}>
                    <i className="ti ti-clipboard-off" style={{ fontSize: 28, display: "block", marginBottom: 8 }} />
                    No audit logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id}>
                    {/* Date */}
                    <td style={{ whiteSpace: "nowrap" }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--t1)" }}>
                        {new Date(log.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--t3)" }}>
                        {new Date(log.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </td>

                    {/* User */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{
                          width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                          background: "var(--blue-b)", display: "flex", alignItems: "center",
                          justifyContent: "center", fontSize: 10, fontWeight: 700,
                          color: "var(--blue-m)", textTransform: "uppercase",
                        }}>
                          {log.user?.charAt(0) || "?"}
                        </span>
                        <strong style={{ color: "var(--t1)", fontSize: 12.5 }}>{log.user}</strong>
                      </div>
                    </td>

                    {/* Action */}
                    <td>{actionBadge(log.action)}</td>

                    {/* Details */}
                    <td style={{ color: "var(--t2)", fontSize: 12.5, maxWidth: 300 }}>
                      {log.details || <span style={{ color: "var(--t3)" }}>—</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "var(--border)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
            <div style={{ fontSize: 12, color: "var(--t3)" }}>
              Page <strong style={{ color: "var(--t1)" }}>{currentPage}</strong> of <strong style={{ color: "var(--t1)" }}>{totalPages}</strong>
              {" · "}showing {((currentPage - 1) * 20) + 1}–{Math.min(currentPage * 20, totalCount)} of {totalCount} entries
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

export default AuditLogs;