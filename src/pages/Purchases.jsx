import { useEffect, useState } from "react";
import api from "../services/api";
import Pagination from "../components/Pagination";

const CATEGORIES = ["Shirt","T-Shirt","Pant","Jeans","Hoodie","Sweater","Track Pant","Innerwear","Accessories","Jacket","Kurta","Saree","Shoes"];
const UNITS      = ["pcs","kg","g","ltr","ml","box"];

function Purchases() {
  const [purchases,   setPurchases]   = useState([]);
  const [suppliers,   setSuppliers]   = useState([]);
  const [search,      setSearch]      = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [totalCount,  setTotalCount]  = useState(0);
  const [loading,     setLoading]     = useState(false);
  const [stats,       setStats]       = useState({ totalCount: 0, totalSpent: 0, uniqueSuppliers: 0 });
  const [toast,       setToast]       = useState(null); // { type: "success"|"error", message }

  const [supplier,      setSupplier]      = useState("");
  const [quantity,      setQuantity]      = useState("");
  const [costPrice,     setCostPrice]     = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [modalOpen,     setModalOpen]     = useState(false);

  // New product fields
  const [newName,         setNewName]         = useState("");
  const [newCategory,     setNewCategory]      = useState("");
  const [newBarcode,      setNewBarcode]       = useState("");
  const [newLotNo,        setNewLotNo]         = useState("");
  const [newCode,         setNewCode]          = useState("");
  const [newUnit,         setNewUnit]          = useState("pcs");
  const [newSellingPrice, setNewSellingPrice]  = useState("");
  const [newMinimumStock, setNewMinimumStock]  = useState("5");

  useEffect(() => {
    fetchStats();
    fetchSuppliers();
  }, []);

  useEffect(() => {
    fetchPurchases(currentPage, search);
  }, [currentPage]);

  useEffect(() => {
    const t = setTimeout(() => {
      setCurrentPage(1);
      fetchPurchases(1, search);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchStats = async () => {
    try {
      const r = await api.get("/purchases/stats");
      setStats(r.data);
    } catch { /* silently ignore */ }
  };

  const fetchPurchases = async (page = 1, q = "") => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 15 });
      if (q.trim()) params.append("search", q.trim());
      const r = await api.get(`/purchases?${params}`);
      if (Array.isArray(r.data)) {
        setPurchases(r.data);
        setTotalPages(1);
        setTotalCount(r.data.length);
      } else {
        setPurchases(r.data.purchases ?? []);
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

  const fetchSuppliers = async () => {
    try {
      // Use /suppliers/all to get unpaginated list for the dropdown
      const r = await api.get("/suppliers/all");
      setSuppliers(Array.isArray(r.data) ? r.data : r.data.suppliers ?? []);
    } catch (error) {
      console.error(error);
    }
  };

  const resetForm = () => {
    setSupplier(""); setQuantity(""); setCostPrice(""); setInvoiceNumber("");
    setNewName(""); setNewCategory(""); setNewBarcode("");
    setNewLotNo(""); setNewCode("");
    setNewUnit("pcs"); setNewSellingPrice(""); setNewMinimumStock("5");
  };

  const closeModal = () => { resetForm(); setModalOpen(false); };

  const addPurchase = async () => {
    if (!supplier) return showToast("error", "Please select a supplier.");
    if (!newName.trim()) return showToast("error", "Product name is required.");
    if (!newSellingPrice) return showToast("error", "Selling price is required.");
    if (!quantity || Number(quantity) <= 0) return showToast("error", "Please enter a valid quantity.");
    if (!costPrice || Number(costPrice) <= 0) return showToast("error", "Please enter a valid cost price.");

    try {
      const payload = {
        supplier,
        quantity: Number(quantity),
        costPrice: Number(costPrice),
        invoiceNumber,
        newProduct: {
          name: newName.trim(),
          category: newCategory,
          barcode: newBarcode,
          lotNo: newLotNo,
          code: newCode,
          unit: newUnit,
          sellingPrice: Number(newSellingPrice),
          minimumStock: Number(newMinimumStock) || 5,
        },
      };

      await api.post("/purchases", payload);
      fetchPurchases(currentPage, search);
      fetchStats();
      closeModal();
      showToast("success", "Purchase added successfully!");
    } catch (error) {
      console.error(error);
      showToast("error", error?.response?.data?.message || "Failed to add purchase.");
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
    width: "100%", maxWidth: "560px", maxHeight: "90vh",
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
          <h1 className="kb-page-title">Purchases</h1>
          <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "var(--t3)" }}>
            Track stock purchases and supplier invoices
          </p>
        </div>
        <button className="kb-btn kb-btn-primary" onClick={() => setModalOpen(true)}>
          <i className="ti ti-plus" /> New Purchase
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 18 }}>
        <div className="kb-stat-card blue">
          <div className="kb-stat-top">
            <span className="kb-stat-label">Total Purchases</span>
            <span className="kb-stat-icon blue"><i className="ti ti-shopping-cart" /></span>
          </div>
          <div className="kb-stat-value">{stats.totalCount || totalCount}</div>
        </div>
        <div className="kb-stat-card amber">
          <div className="kb-stat-top">
            <span className="kb-stat-label">Total Spent</span>
            <span className="kb-stat-icon amber"><i className="ti ti-coins" /></span>
          </div>
          <div className="kb-stat-value amber">Rs. {(stats.totalSpent || 0).toLocaleString()}</div>
        </div>
        <div className="kb-stat-card green">
          <div className="kb-stat-top">
            <span className="kb-stat-label">Suppliers Used</span>
            <span className="kb-stat-icon green"><i className="ti ti-truck" /></span>
          </div>
          <div className="kb-stat-value">{stats.uniqueSuppliers || 0}</div>
        </div>
      </div>

      {/* ── Purchase History Table ── */}
      <div className="kb-card">
        <div className="kb-card-header">
          <h2 className="kb-card-title">
            <i className="ti ti-list" /> Purchase History
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
              placeholder="Search by supplier, product or invoice…"
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
                <th>Product</th>
                <th>Quantity</th>
                <th>Cost Price</th>
                <th>Total</th>
                <th>Invoice</th>
              </tr>
            </thead>
            <tbody>
              {loading && purchases.length === 0 ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    <td><div className="kb-skeleton" style={{ height: 11, width: "70%" }} /></td>
                    <td><div className="kb-skeleton" style={{ height: 11, width: "60%" }} /></td>
                    <td><div className="kb-skeleton" style={{ height: 18, width: 70, borderRadius: 20 }} /></td>
                    <td><div className="kb-skeleton" style={{ height: 11, width: "50%" }} /></td>
                    <td><div className="kb-skeleton" style={{ height: 11, width: "50%" }} /></td>
                    <td><div className="kb-skeleton" style={{ height: 11, width: "40%" }} /></td>
                  </tr>
                ))
              ) : purchases.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "var(--t3)" }}>
                    <i className="ti ti-shopping-cart-off" style={{ fontSize: 28, display: "block", marginBottom: 8 }} />
                    No purchases yet
                  </td>
                </tr>
              ) : (
                purchases.map((purchase) => (
                  <tr key={purchase._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--blue-b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "var(--blue-m)", flexShrink: 0, textTransform: "uppercase" }}>
                          {purchase.supplier?.charAt(0) || "S"}
                        </span>
                        <strong style={{ color: "var(--t1)" }}>{purchase.supplier}</strong>
                      </div>
                    </td>
                    <td style={{ color: "var(--t2)" }}>{purchase.product?.name || purchase.product}</td>
                    <td><span className="kb-badge blue">{purchase.quantity} units</span></td>
                    <td style={{ color: "var(--t2)" }}>Rs. {purchase.costPrice?.toLocaleString()}</td>
                    <td style={{ fontWeight: 700, color: "var(--t1)" }}>Rs. {(purchase.costPrice * purchase.quantity)?.toLocaleString()}</td>
                    <td style={{ fontFamily: "monospace", fontSize: 12, color: "var(--t3)" }}>{purchase.invoiceNumber || "—"}</td>
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
              {" · "}showing {((currentPage - 1) * 15) + 1}–{Math.min(currentPage * 15, totalCount)} of {totalCount} records
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════
          NEW PURCHASE MODAL
      ══════════════════════════════════════ */}
      {modalOpen && (
        <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div style={modalStyle}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "var(--border)", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <span style={{ width: 38, height: 38, borderRadius: 10, background: "var(--green-b)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--green-m)", fontSize: 20 }}>
                  <i className="ti ti-shopping-cart-plus" />
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "var(--t1)" }}>New Purchase</div>
                  <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 1 }}>Record a new stock purchase from a supplier</div>
                </div>
              </div>
              <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--t3)", fontSize: 22, lineHeight: 1, padding: 4, borderRadius: 6 }}>
                <i className="ti ti-x" />
              </button>
            </div>

            {/* Body */}
            <div style={{ overflowY: "auto", padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="kb-label">Supplier</label>
                <select className="kb-input" value={supplier} onChange={e => setSupplier(e.target.value)}>
                  <option value="">Select supplier</option>
                  {suppliers.map(item => <option key={item._id} value={item.name}>{item.name}</option>)}
                </select>
              </div>

              <div>
                <label className="kb-label" style={{ marginBottom: 6, display: "block" }}>Product</label>
                <div style={{
                  border: "1px dashed #cbd5e1", borderRadius: "var(--r)", padding: 14,
                  background: "var(--bg-surface)", display: "flex", flexDirection: "column", gap: 12,
                }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label className="kb-label">Product Name</label>
                      <input className="kb-input" placeholder="e.g. Blue Polo Shirt" value={newName} onChange={e => setNewName(e.target.value)} />
                    </div>
                    <div>
                      <label className="kb-label">Category</label>
                      <select className="kb-input" value={newCategory} onChange={e => setNewCategory(e.target.value)}>
                        <option value="">Select category</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="kb-label">Unit</label>
                      <select className="kb-input" value={newUnit} onChange={e => setNewUnit(e.target.value)}>
                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="kb-label">Barcode <span style={{ color: "var(--t3)", fontWeight: 400 }}>(optional)</span></label>
                      <input className="kb-input" placeholder="e.g. 8901234567890" value={newBarcode} onChange={e => setNewBarcode(e.target.value)} />
                    </div>
                    <div>
                      <label className="kb-label">Lot No <span style={{ color: "var(--t3)", fontWeight: 400 }}>(optional)</span></label>
                      <input className="kb-input" placeholder="e.g. 3-65(609)" value={newLotNo} onChange={e => setNewLotNo(e.target.value)} />
                    </div>
                    <div>
                      <label className="kb-label">Code <span style={{ color: "var(--t3)", fontWeight: 400 }}>(optional)</span></label>
                      <input className="kb-input" placeholder="e.g. 904" value={newCode} onChange={e => setNewCode(e.target.value)} />
                    </div>
                    <div>
                      <label className="kb-label">Selling Price (Rs.)</label>
                      <input type="number" className="kb-input" placeholder="0" value={newSellingPrice} onChange={e => setNewSellingPrice(e.target.value)} />
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label className="kb-label">Minimum Stock Alert</label>
                      <input type="number" className="kb-input" placeholder="5" value={newMinimumStock} onChange={e => setNewMinimumStock(e.target.value)} />
                    </div>
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--t3)", lineHeight: 1.5, display: "flex", gap: 6, alignItems: "flex-start" }}>
                    <i className="ti ti-info-circle" style={{ fontSize: 13, marginTop: 1, flexShrink: 0 }} />
                    This product will be added to your inventory with the quantity and cost price entered below.
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label className="kb-label">Quantity (Initial Stock)</label>
                  <input type="number" className="kb-input" placeholder="0" value={quantity} onChange={e => setQuantity(e.target.value)} />
                </div>
                <div>
                  <label className="kb-label">Cost Price (Rs.)</label>
                  <input type="number" className="kb-input" placeholder="0" value={costPrice} onChange={e => setCostPrice(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="kb-label">Invoice Number <span style={{ color: "var(--t3)", fontWeight: 400 }}>(optional)</span></label>
                <input className="kb-input" placeholder="e.g. INV-2026-001" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} />
              </div>
              {quantity && costPrice && Number(quantity) > 0 && Number(costPrice) > 0 && (
                <div style={{ background: "var(--green-b)", border: "1px solid var(--green-bd)", borderRadius: "var(--r)", padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12.5, color: "var(--green)", fontWeight: 600 }}>
                    <i className="ti ti-calculator" style={{ marginRight: 6 }} />Total Purchase Value
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "var(--green)" }}>
                    Rs. {(Number(quantity) * Number(costPrice)).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: "14px 22px", borderTop: "var(--border)", display: "flex", justifyContent: "flex-end", gap: 10, flexShrink: 0, background: "var(--bg-surface)", borderRadius: "0 0 var(--rl) var(--rl)" }}>
              <button className="kb-btn kb-btn-outline" onClick={closeModal}><i className="ti ti-x" /> Cancel</button>
              <button className="kb-btn kb-btn-success" onClick={addPurchase}><i className="ti ti-circle-plus" /> Add Purchase</button>
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

export default Purchases;