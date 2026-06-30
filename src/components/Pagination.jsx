export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  /* ── Build page number array with "..." gaps ─────────────
     Always shows: first, last, current ± 2, with ellipsis gaps
     e.g. 1 ... 4 5 [6] 7 8 ... 20
  ─────────────────────────────────────────────────────────── */
  const buildPages = () => {
    const pages = [];
    const delta = 2; // pages shown either side of current

    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd   = Math.min(totalPages - 1, currentPage + delta);

    pages.push(1);

    if (rangeStart > 2)             pages.push("...");
    for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);
    if (rangeEnd < totalPages - 1)  pages.push("...");

    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  const pages = buildPages();

  /* ── Shared button style ─────────────────────────────── */
  const btn = (active, disabled = false) => ({
    minWidth:   32,
    height:     32,
    padding:    "0 10px",
    borderRadius: "var(--r, 6px)",
    border:     active
      ? "1px solid var(--brand, #2563eb)"
      : "1px solid #e2e8f0",
    background: active
      ? "var(--brand, #2563eb)"
      : "#fff",
    color: active
      ? "#fff"
      : disabled ? "#cbd5e1" : "var(--t2, #475569)",
    fontSize:   12.5,
    fontWeight: active ? 700 : 500,
    cursor:     disabled ? "not-allowed" : "pointer",
    fontFamily: "inherit",
    display:    "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap:        4,
    transition: "all .12s",
    opacity:    disabled ? 0.5 : 1,
  });

  return (
    <div style={{ display:"flex", alignItems:"center", gap:4, flexWrap:"wrap", justifyContent:"center" }}>

      {/* Previous */}
      <button
        style={btn(false, currentPage === 1)}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <i className="ti ti-chevron-left" style={{ fontSize:14 }} />
        Previous
      </button>

      {/* Page numbers */}
      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`ellipsis-${i}`} style={{
            minWidth:32, height:32, display:"inline-flex",
            alignItems:"center", justifyContent:"center",
            fontSize:13, color:"var(--t3, #94a3b8)", userSelect:"none",
          }}>
            ···
          </span>
        ) : (
          <button
            key={page}
            style={btn(page === currentPage)}
            onClick={() => page !== currentPage && onPageChange(page)}
          >
            {page}
          </button>
        )
      )}

      {/* Next */}
      <button
        style={btn(false, currentPage === totalPages)}
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
        <i className="ti ti-chevron-right" style={{ fontSize:14 }} />
      </button>

    </div>
  );
}