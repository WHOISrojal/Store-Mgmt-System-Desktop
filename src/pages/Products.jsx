import { useEffect, useState } from "react";
import api from "../services/api";
import Pagination from "../components/Pagination";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const CATEGORIES = ["Shirt","T-Shirt","Pant","Jeans","Hoodie","Sweater","Track Pant","Innerwear","Accessories","Jacket","Kurta","Saree","Shoes"];
const UNITS      = ["pcs","kg","g","ltr","ml","box"];

function Products() {
  const [products,       setProducts]       = useState([]);
  const [search,         setSearch]         = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [currentPage,    setCurrentPage]    = useState(1);
  const [totalPages,     setTotalPages]     = useState(1);
  const [totalProducts,  setTotalProducts]  = useState(0);
  const [lowStockItems,  setLowStockItems]  = useState(0);
  const [inventoryValue, setInventoryValue] = useState(0);
  const [modalOpen,      setModalOpen]      = useState(false);
  const [stockHistory,   setStockHistory]   = useState([]);
  const [historyProduct, setHistoryProduct] = useState(null);
  const [toast,          setToast]          = useState(null);
  const [deleteTarget,   setDeleteTarget]   = useState(null); // { id, name } pending delete confirmation
  const [loading,        setLoading]        = useState(false);

  // form state
  const [editingId,    setEditingId]    = useState(null);
  const [name,         setName]         = useState("");
  const [category,     setCategory]     = useState("");
  const [barcode,      setBarcode]      = useState("");
  const [lotNo,        setLotNo]        = useState("");
  const [code,         setCode]         = useState("");
  const [image,        setImage]        = useState(null);
  const [imageName,    setImageName]    = useState("Choose Image");
  const [costPrice,    setCostPrice]    = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [stock,        setStock]        = useState("");
  const [minimumStock, setMinimumStock] = useState("5");
  const [unit,         setUnit]         = useState("pcs");

  const role = localStorage.getItem("role");

  // Fetch on page / category change
  useEffect(() => {
    fetchProducts(currentPage, search, categoryFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, categoryFilter]);

  // Debounced search — same pattern as Customers: if not on page 1, resetting
  // to page 1 triggers the effect above; if already on page 1, fetch directly
  // so we don't fire two overlapping requests.
  useEffect(() => {
    const t = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchProducts(1, search, categoryFilter);
      }
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  /* ── Toast helper ─────────────────────────────────── */
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Data fetching ────────────────────────────────── */
  const fetchProducts = async (page = 1, q = "", cat = "All") => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page });
      if (q.trim()) params.append("search", q.trim());
      if (cat && cat !== "All") params.append("category", cat);
      const r = await api.get(`/products?${params}`);
      setProducts(r.data.products);
      setCurrentPage(r.data.currentPage);
      setTotalPages(r.data.totalPages);
      setTotalProducts(r.data.totalProducts);
      setLowStockItems(r.data.lowStockItems);
      setInventoryValue(r.data.inventoryValue);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  /* ── Form helpers ─────────────────────────────────── */
  const resetForm = () => {
    setEditingId(null); setName(""); setCategory(""); setBarcode("");
    setLotNo(""); setCode("");
    setCostPrice(""); setSellingPrice(""); setStock(""); setMinimumStock("5");
    setUnit("pcs"); setImage(null); setImageName("Choose Image");
  };

  const openAddModal  = () => { resetForm(); setModalOpen(true); };
  const closeModal    = () => { resetForm(); setModalOpen(false); };

  /* ── CRUD ─────────────────────────────────────────── */
  const addProduct = async () => {
    if (!name.trim())        return showToast("error", "Product name is required.");
    if (!costPrice)          return showToast("error", "Cost price is required.");
    if (!sellingPrice)       return showToast("error", "Selling price is required.");
    if (!stock && stock !== 0) return showToast("error", "Stock quantity is required.");
    try {
      const fd = new FormData();
      fd.append("name", name); fd.append("category", category);
      fd.append("barcode", barcode); fd.append("lotNo", lotNo); fd.append("code", code);
      fd.append("costPrice", Number(costPrice));
      fd.append("sellingPrice", Number(sellingPrice)); fd.append("stock", Number(stock));
      fd.append("minimumStock", Number(minimumStock)); fd.append("unit", unit);
      if (image) fd.append("image", image);
      await api.post("/products", fd, { headers:{ "Content-Type":"multipart/form-data" } });
      fetchProducts(currentPage, search, categoryFilter);
      closeModal();
      showToast("success", `"${name}" added successfully!`);
    } catch(e) {
      showToast("error", e?.response?.data?.message || "Failed to add product.");
    }
  };

  const editProduct = (p) => {
    setEditingId(p._id); setName(p.name); setCategory(p.category);
    setBarcode(p.barcode || ""); setLotNo(p.lotNo || ""); setCode(p.code || "");
    setCostPrice(p.costPrice);
    setSellingPrice(p.sellingPrice); setStock(p.stock);
    setMinimumStock(p.minimumStock || 5); setUnit(p.unit || "pcs");
    setModalOpen(true);
  };

  const updateProduct = async () => {
    if (!name.trim()) return showToast("error", "Product name is required.");
    try {
      await api.put(`/products/${editingId}`, {
        name, category, barcode, lotNo, code,
        costPrice: Number(costPrice), sellingPrice: Number(sellingPrice),
        stock: Number(stock), minimumStock: Number(minimumStock), unit,
      });
      fetchProducts(currentPage, search, categoryFilter);
      closeModal();
      showToast("success", `"${name}" updated successfully!`);
    } catch(e) {
      showToast("error", e?.response?.data?.message || "Failed to update product.");
    }
  };

  const requestDeleteProduct = (id, pName) => {
    setDeleteTarget({ id, name: pName });
  };

  const confirmDeleteProduct = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/products/${deleteTarget.id}`);
      fetchProducts(currentPage, search, categoryFilter);
      showToast("success", `"${deleteTarget.name}" deleted.`);
    } catch(e) {
      showToast("error", e?.response?.data?.message || "Failed to delete product.");
    } finally {
      setDeleteTarget(null);
    }
  };

  const viewStockHistory = async (p) => {
    try {
      const r = await api.get(`/stock-movements/${p._id}`);
      setStockHistory(r.data); setHistoryProduct(p);
    } catch(e) { console.error(e); }
  };

  /* ── Shared modal styles ──────────────────────────── */
  const overlay = {
    position:"fixed", inset:0, background:"rgba(15,23,42,0.55)",
    display:"flex", alignItems:"center", justifyContent:"center",
    zIndex:1000, padding:20,
  };
  const modalBox = (maxW = 680) => ({
    background:"#fff", borderRadius:"var(--rl)",
    width:"100%", maxWidth:maxW, maxHeight:"90vh",
    display:"flex", flexDirection:"column",
    border:"var(--border)", boxShadow:"0 20px 60px rgba(0,0,0,0.2)",
  });

  const baseCols = role === "ADMIN" ? 10 : 9;

  return (
    <>
      {/* ── Toast notification ───────────────────────── */}
      {toast && (
        <div style={{
          position:"fixed", top:20, right:20, zIndex:2000,
          display:"flex", alignItems:"center", gap:10,
          padding:"12px 18px", borderRadius:"var(--r)",
          background: toast.type === "success" ? "var(--green-b)" : "var(--red-b)",
          border:`1px solid ${toast.type === "success" ? "var(--green-bd)" : "var(--red-bd)"}`,
          boxShadow:"0 4px 20px rgba(0,0,0,0.12)",
          fontSize:13, fontWeight:600,
          color: toast.type === "success" ? "var(--green)" : "var(--red)",
          animation:"slideIn .2s ease",
          maxWidth:340,
        }}>
          <i className={`ti ${toast.type === "success" ? "ti-circle-check" : "ti-alert-circle"}`} style={{ fontSize:18, flexShrink:0 }} />
          {toast.message}
          <button onClick={() => setToast(null)} style={{ background:"none", border:"none", cursor:"pointer", color:"inherit", fontSize:16, padding:0, marginLeft:4, opacity:.6 }}>
            <i className="ti ti-x" />
          </button>
        </div>
      )}

      {/* ── Page header ──────────────────────────────── */}
      <div className="kb-page-header">
        <div>
          <h1 className="kb-page-title">Products</h1>
          <p style={{ margin:"2px 0 0", fontSize:12.5, color:"var(--t3)" }}>
            Manage your inventory, prices and stock levels
          </p>
        </div>
        <button className="kb-btn kb-btn-primary" onClick={openAddModal}>
          <i className="ti ti-plus" /> Add Product
        </button>
      </div>

      {/* ── Stat cards ───────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:18 }}>
        <div className="kb-stat-card blue">
          <div className="kb-stat-top">
            <span className="kb-stat-label">Total products</span>
            <span className="kb-stat-icon blue"><i className="ti ti-package" /></span>
          </div>
          <div className="kb-stat-value">{totalProducts}</div>
        </div>
        <div className="kb-stat-card red">
          <div className="kb-stat-top">
            <span className="kb-stat-label">Low stock items</span>
            <span className="kb-stat-icon red"><i className="ti ti-alert-triangle" /></span>
          </div>
          <div className="kb-stat-value red">{lowStockItems}</div>
        </div>
        <div className="kb-stat-card green">
          <div className="kb-stat-top">
            <span className="kb-stat-label">Inventory value</span>
            <span className="kb-stat-icon green"><i className="ti ti-coins" /></span>
          </div>
          <div className="kb-stat-value green">Rs. {inventoryValue?.toLocaleString()}</div>
        </div>
      </div>

      {/* ── Product list card ─────────────────────────── */}
      <div className="kb-card">
        <div className="kb-card-header">
          <h2 className="kb-card-title"><i className="ti ti-list" /> Product list</h2>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {loading && (
              <div style={{ width:16, height:16, border:"2px solid #e2e8f0", borderTopColor:"var(--brand)", borderRadius:"50%", animation:"spin .7s linear infinite" }} />
            )}
            <span style={{ fontSize:12, color:"var(--t3)", background:"var(--bg-surface)", border:"var(--border)", borderRadius:"var(--r)", padding:"3px 10px" }}>
              {totalProducts} items
            </span>
          </div>
        </div>

        <div style={{ display:"flex", gap:10, marginBottom:16 }}>
          <div className="kb-search" style={{ flex:1 }}>
            <i className="ti ti-search" />
            <input placeholder="Search by name, category, barcode, lot no or code…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="kb-input" style={{ width:200 }} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div style={{ overflowX:"auto" }}>
          <table className="kb-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product</th>
                <th>Category</th>
                <th>Barcode</th>
                <th>Lot No</th>
                <th>Code</th>
                {role === "ADMIN" && <th className="text-end">Cost</th>}
                <th className="text-end">Price</th>
                <th className="text-end">Stock</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={baseCols} style={{ textAlign:"center", padding:40, color:"var(--t3)" }}>
                    <i className="ti ti-package-off" style={{ fontSize:28, display:"block", marginBottom:8 }} />
                    No products found
                  </td>
                </tr>
              ) : products.map(p => {
                const isLow = p.stock <= p.minimumStock;
                return (
                  <tr key={p._id} style={isLow ? { background:"#fef2f2" } : {}}>
                    <td>
                      {p.image
                        ? <img src={`${API_BASE}${p.image}`} alt={p.name} style={{ width:44, height:44, objectFit:"cover", borderRadius:8, border:"var(--border)" }} />
                        : <div style={{ width:44, height:44, borderRadius:8, background:"var(--bg-surface)", border:"var(--border)", display:"grid", placeItems:"center", color:"var(--t3)" }}>
                            <i className="ti ti-photo" style={{ fontSize:18 }} />
                          </div>
                      }
                    </td>
                    <td>
                      <strong style={{ color:"var(--t1)", display:"block" }}>{p.name}</strong>
                      <span style={{ fontSize:11, color:"var(--t3)" }}>{p.unit}</span>
                    </td>
                    <td><span className="kb-badge blue">{p.category}</span></td>
                    <td style={{ fontFamily:"monospace", fontSize:12, color:"var(--t3)" }}>{p.barcode || "—"}</td>
                    <td style={{ fontFamily:"monospace", fontSize:12, color:"var(--t3)" }}>{p.lotNo || "—"}</td>
                    <td style={{ fontFamily:"monospace", fontSize:12, color:"var(--t3)" }}>{p.code || "—"}</td>
                    {role === "ADMIN" && <td className="text-end" style={{ color:"var(--t2)" }}>Rs. {p.costPrice?.toLocaleString()}</td>}
                    <td className="text-end"><strong>Rs. {p.sellingPrice?.toLocaleString()}</strong></td>
                    <td className="text-end">
                      <span className={`kb-badge ${isLow ? "red" : "green"}`}>
                        <i className={`ti ${isLow ? "ti-alert-triangle" : "ti-check"}`} style={{ fontSize:10 }} />
                        {p.stock}{isLow ? " Low" : ""}
                      </span>
                    </td>
                    <td className="text-end">
                      <div style={{ display:"flex", gap:6, justifyContent:"flex-end", flexWrap:"wrap" }}>
                        <button className="kb-btn kb-btn-outline" style={{ padding:"5px 10px", fontSize:11.5 }} onClick={() => viewStockHistory(p)}>
                          <i className="ti ti-history" /> History
                        </button>
                        <button className="kb-btn" style={{ padding:"5px 10px", fontSize:11.5, background:"#fffbeb", color:"#92400e", border:"1px solid #fcd34d" }} onClick={() => editProduct(p)}>
                          <i className="ti ti-pencil" /> Edit
                        </button>
                        {role === "ADMIN" && (
                          <button className="kb-btn kb-btn-danger" style={{ padding:"5px 10px", fontSize:11.5 }} onClick={() => requestDeleteProduct(p._id, p.name)}>
                            <i className="ti ti-trash" /> Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ marginTop:14, paddingTop:14, borderTop:"var(--border)", display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            <div style={{ fontSize:12, color:"var(--t3)" }}>
              Page <strong style={{ color:"var(--t1)" }}>{currentPage}</strong> of <strong style={{ color:"var(--t1)" }}>{totalPages}</strong>
              {" · "}{totalProducts} total products
            </div>
          </div>
        )}
      </div>

      {/* ══ ADD / EDIT PRODUCT MODAL ═══════════════════ */}
      {modalOpen && (
        <div style={overlay} onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div style={modalBox(680)}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 22px", borderBottom:"var(--border)", flexShrink:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:11 }}>
                <span style={{ width:38, height:38, borderRadius:10, background: editingId ? "#fffbeb" : "var(--blue-b)", display:"grid", placeItems:"center", color: editingId ? "#d97706" : "var(--blue-m)", fontSize:20 }}>
                  <i className={editingId ? "ti ti-pencil" : "ti ti-circle-plus"} />
                </span>
                <div>
                  <div style={{ fontWeight:700, fontSize:15, color:"var(--t1)" }}>{editingId ? "Edit Product" : "Add New Product"}</div>
                  <div style={{ fontSize:12, color:"var(--t3)", marginTop:1 }}>{editingId ? `Editing: ${name}` : "Fill in the details below"}</div>
                </div>
              </div>
              <button onClick={closeModal} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--t3)", fontSize:22, lineHeight:1, padding:4 }}>
                <i className="ti ti-x" />
              </button>
            </div>

            <div style={{ overflowY:"auto", padding:"20px 22px", flex:1 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <div><label className="kb-label">Product Name</label><input className="kb-input" placeholder="e.g. Blue Polo Shirt" value={name} onChange={e => setName(e.target.value)} /></div>
                <div><label className="kb-label">Category</label>
                  <select className="kb-input" value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="kb-label">Barcode</label><input className="kb-input" placeholder="e.g. 8901234567890" value={barcode} onChange={e => setBarcode(e.target.value)} /></div>
                <div><label className="kb-label">Lot No</label><input className="kb-input" placeholder="e.g. 3-65(609)" value={lotNo} onChange={e => setLotNo(e.target.value)} /></div>
                <div><label className="kb-label">Code</label><input className="kb-input" placeholder="e.g. 904" value={code} onChange={e => setCode(e.target.value)} /></div>
                <div><label className="kb-label">Unit</label>
                  <select className="kb-input" value={unit} onChange={e => setUnit(e.target.value)}>
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>

                <div style={{ gridColumn:"1/-1" }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"var(--t3)", textTransform:"uppercase", letterSpacing:".06em", paddingBottom:10, borderBottom:"var(--border)" }}>
                    Pricing &amp; Stock
                  </div>
                </div>

                <div><label className="kb-label">Cost Price (Rs.)</label><input type="number" className="kb-input" placeholder="0" value={costPrice} onChange={e => setCostPrice(e.target.value)} /></div>
                <div><label className="kb-label">Selling Price (Rs.)</label><input type="number" className="kb-input" placeholder="0" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} /></div>
                <div><label className="kb-label">Stock Quantity</label><input type="number" className="kb-input" placeholder="0" value={stock} onChange={e => setStock(e.target.value)} /></div>
                <div><label className="kb-label">Minimum Stock Alert</label><input type="number" className="kb-input" placeholder="5" value={minimumStock} onChange={e => setMinimumStock(e.target.value)} /></div>

                {!editingId && (
                  <div style={{ gridColumn:"1/-1" }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"var(--t3)", textTransform:"uppercase", letterSpacing:".06em", paddingBottom:10, borderBottom:"var(--border)", marginBottom:14 }}>
                      Product Image
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      <label style={{ flex:1, display:"flex", alignItems:"center", gap:9, padding:"10px 14px", border:"1px dashed #cbd5e1", borderRadius:"var(--r)", cursor:"pointer", fontSize:13, color:"var(--t2)", background:"var(--bg-surface)" }}>
                        <i className="ti ti-photo-up" style={{ fontSize:18, color:"var(--t3)" }} />
                        {imageName}
                        <input type="file" hidden accept="image/*" onChange={e => {
                          setImage(e.target.files[0]);
                          const fn = e.target.files[0]?.name || "Choose Image";
                          setImageName(fn.length > 22 ? fn.substring(0,22)+"…" : fn);
                        }} />
                      </label>
                      {image && (
                        <button className="kb-btn kb-btn-danger" style={{ padding:"10px 14px" }} onClick={() => { setImage(null); setImageName("Choose Image"); }}>
                          <i className="ti ti-x" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ padding:"14px 22px", borderTop:"var(--border)", display:"flex", justifyContent:"flex-end", gap:10, flexShrink:0, background:"var(--bg-surface)", borderRadius:"0 0 var(--rl) var(--rl)" }}>
              <button className="kb-btn kb-btn-outline" onClick={closeModal}><i className="ti ti-x" /> Cancel</button>
              {editingId
                ? <button className="kb-btn" style={{ background:"#d97706", color:"#fff", boxShadow:"0 2px 8px rgba(217,119,6,0.25)" }} onClick={updateProduct}><i className="ti ti-device-floppy" /> Save Changes</button>
                : <button className="kb-btn kb-btn-primary" onClick={addProduct}><i className="ti ti-circle-plus" /> Add Product</button>
              }
            </div>
          </div>
        </div>
      )}

      {/* ══ STOCK HISTORY MODAL ════════════════════════ */}
      {historyProduct && (
        <div style={overlay}>
          <div style={modalBox(620)}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 22px", borderBottom:"var(--border)", flexShrink:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:11 }}>
                <span style={{ width:38, height:38, borderRadius:10, background:"var(--blue-b)", display:"grid", placeItems:"center", color:"var(--blue-m)", fontSize:20 }}>
                  <i className="ti ti-history" />
                </span>
                <div>
                  <div style={{ fontWeight:700, fontSize:15, color:"var(--t1)" }}>Stock History</div>
                  <div style={{ fontSize:12, color:"var(--t3)", marginTop:1 }}>{historyProduct.name}</div>
                </div>
              </div>
              <button onClick={() => { setHistoryProduct(null); setStockHistory([]); }} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--t3)", fontSize:22, lineHeight:1, padding:4 }}>
                <i className="ti ti-x" />
              </button>
            </div>
            <div style={{ overflowY:"auto", padding:"16px 22px", flex:1 }}>
              {stockHistory.length === 0 ? (
                <div style={{ textAlign:"center", padding:40, color:"var(--t3)" }}>
                  <i className="ti ti-history-off" style={{ fontSize:28, display:"block", marginBottom:8 }} />
                  No stock movements found
                </div>
              ) : (
                <table className="kb-table">
                  <thead><tr><th>Date</th><th>Type</th><th className="text-end">Qty</th><th>Note</th></tr></thead>
                  <tbody>
                    {stockHistory.map(m => (
                      <tr key={m._id}>
                        <td style={{ fontSize:12, color:"var(--t3)", whiteSpace:"nowrap" }}>{new Date(m.createdAt).toLocaleString()}</td>
                        <td>
                          <span className={`kb-badge ${m.type === "PURCHASE" ? "green" : "red"}`}>
                            <i className={`ti ${m.type === "PURCHASE" ? "ti-arrow-down" : "ti-arrow-up"}`} style={{ fontSize:10 }} />
                            {m.type}
                          </span>
                        </td>
                        <td className="text-end" style={{ fontWeight:700, color: m.type === "SALE" ? "var(--red-m)" : "var(--green-m)" }}>
                          {m.type === "SALE" ? `−${m.quantity}` : `+${m.quantity}`}
                        </td>
                        <td style={{ color:"var(--t2)", fontSize:12.5 }}>{m.note || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div style={{ padding:"12px 22px", borderTop:"var(--border)", flexShrink:0, display:"flex", justifyContent:"flex-end", background:"var(--bg-surface)", borderRadius:"0 0 var(--rl) var(--rl)" }}>
              <button className="kb-btn kb-btn-outline" onClick={() => { setHistoryProduct(null); setStockHistory([]); }}>
                <i className="ti ti-x" /> Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ DELETE CONFIRMATION MODAL ══════════════════ */}
      {deleteTarget && (
        <div style={overlay} onClick={e => { if (e.target === e.currentTarget) setDeleteTarget(null); }}>
          <div style={modalBox(420)}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 22px", borderBottom:"var(--border)", flexShrink:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:11 }}>
                <span style={{ width:38, height:38, borderRadius:10, background:"var(--red-b)", display:"grid", placeItems:"center", color:"var(--red-m)", fontSize:20 }}>
                  <i className="ti ti-alert-triangle" />
                </span>
                <div>
                  <div style={{ fontWeight:700, fontSize:15, color:"var(--t1)" }}>Delete Product</div>
                  <div style={{ fontSize:12, color:"var(--t3)", marginTop:1 }}>This action cannot be undone</div>
                </div>
              </div>
              <button onClick={() => setDeleteTarget(null)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--t3)", fontSize:22, lineHeight:1, padding:4 }}>
                <i className="ti ti-x" />
              </button>
            </div>
            <div style={{ padding:"20px 22px" }}>
              <p style={{ margin:0, fontSize:13.5, color:"var(--t2)", lineHeight:1.5 }}>
                Are you sure you want to delete <strong style={{ color:"var(--t1)" }}>"{deleteTarget.name}"</strong>?
              </p>
            </div>
            <div style={{ padding:"14px 22px", borderTop:"var(--border)", display:"flex", justifyContent:"flex-end", gap:10, flexShrink:0, background:"var(--bg-surface)", borderRadius:"0 0 var(--rl) var(--rl)" }}>
              <button className="kb-btn kb-btn-outline" onClick={() => setDeleteTarget(null)}><i className="ti ti-x" /> Cancel</button>
              <button className="kb-btn kb-btn-danger" onClick={confirmDeleteProduct}><i className="ti ti-trash" /> Delete Product</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        @keyframes spin    { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}

export default Products;