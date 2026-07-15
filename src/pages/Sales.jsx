import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Pagination from "../components/Pagination";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

/* ── Toast ───────────────────────────────────────────────── */
function Toast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div style={{
      position: "fixed", top: 20, right: 20, zIndex: 3000,
      display: "flex", alignItems: "center", gap: 10,
      padding: "12px 18px", borderRadius: "var(--r)",
      background: toast.type === "success" ? "var(--green-b)" : "var(--red-b)",
      border: `1px solid ${toast.type === "success" ? "var(--green-bd)" : "var(--red-bd)"}`,
      boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
      fontSize: 13, fontWeight: 600,
      color: toast.type === "success" ? "var(--green)" : "var(--red)",
      animation: "slideIn .2s ease",
      maxWidth: 360,
    }}>
      <i className={`ti ${toast.type === "success" ? "ti-circle-check" : "ti-alert-circle"}`} style={{ fontSize: 18, flexShrink: 0 }} />
      {toast.message}
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: 16, padding: 0, marginLeft: 4, opacity: 0.6 }}>
        <i className="ti ti-x" />
      </button>
    </div>
  );
}

/* ── Confirm dialog ──────────────────────────────────────── */
function ConfirmDialog({ message, onConfirm, onCancel }) {
  if (!message) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 2500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: "var(--rl)", maxWidth: 400, width: "100%", padding: "24px 24px 20px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
          <span style={{ width: 38, height: 38, borderRadius: 10, background: "var(--red-b)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--red-m)", fontSize: 20, flexShrink: 0 }}>
            <i className="ti ti-alert-triangle" />
          </span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--t1)", marginBottom: 4 }}>Are you sure?</div>
            <div style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.5 }}>{message}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="kb-btn kb-btn-outline" onClick={onCancel}>Cancel</button>
          <button className="kb-btn kb-btn-danger" onClick={onConfirm}><i className="ti ti-trash" /> Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ── Modal wrapper ───────────────────────────────────────── */
function Modal({ title, onClose, children, width = 560 }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1050, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 12, width: "100%", maxWidth: width, maxHeight: "92vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 20px", borderBottom: "1px solid #e2e8f0", flexShrink: 0 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{title}</span>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 22, color: "#94a3b8", lineHeight: 1, padding: 0 }}>×</button>
        </div>
        <div style={{ padding: "18px 20px", overflowY: "auto" }}>{children}</div>
      </div>
    </div>
  );
}

/* ── Inline error box (inside modal) ─────────────────────── */
function InlineError({ message, onClose }) {
  if (!message) return null;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 9,
      background: "var(--red-b)", border: "1px solid var(--red-bd)",
      borderRadius: "var(--r)", padding: "10px 13px", marginBottom: 14,
      fontSize: 12.5, color: "var(--red)", fontWeight: 600,
    }}>
      <i className="ti ti-alert-circle" style={{ fontSize: 16, flexShrink: 0 }} />
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", opacity: 0.6, fontSize: 14, padding: 0 }}>
        <i className="ti ti-x" />
      </button>
    </div>
  );
}

/* ── Payment badge ───────────────────────────────────────── */
function PayBadge({ type }) {
  const map = {
    CASH:   { color: "green", icon: "ti-cash" },
    CREDIT: { color: "amber", icon: "ti-clock" },
    CHEQUE: { color: "blue",  icon: "ti-writing" },
  };
  const { color, icon } = map[type] || { color: "blue", icon: "ti-coin" };
  return (
    <span className={`kb-badge ${color}`}>
      <i className={`ti ${icon}`} style={{ fontSize: 10 }} /> {type}
    </span>
  );
}

function ChequeBadge({ status }) {
  const map = { PENDING: "amber", CLEARED: "green", BOUNCED: "red" };
  return <span className={`kb-badge ${map[status] || "blue"}`}>{status}</span>;
}

/* ══════════════════════════════════════════════════════════
   SALES PAGE
══════════════════════════════════════════════════════════ */
export default function Sales() {
  const role = localStorage.getItem("role");

  const [sales, setSales]         = useState([]);
  const [products, setProducts]   = useState([]);
  const [customers, setCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);

  // toast & confirm
  const [toast,       setToast]       = useState(null);
  const [confirmMsg,  setConfirmMsg]  = useState(null);
  const [confirmCb,   setConfirmCb]   = useState(null);

  // new sale form
  const [paymentType,    setPaymentType]    = useState("CASH");
  const [chequeNumber,   setChequeNumber]   = useState("");
  const [bankName,       setBankName]       = useState("");
  const [chequeDate,     setChequeDate]     = useState("");
  const [customer,       setCustomer]       = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustDrop,   setShowCustDrop]   = useState(false);
  const [paidAmount,     setPaidAmount]     = useState("");
  const [advancePaymentMethod, setAdvancePaymentMethod] = useState("CASH"); // CASH | ONLINE
  const [product,        setProduct]        = useState("");
  const [barcode,        setBarcode]        = useState("");
  const [quantity,       setQuantity]       = useState("");
  const [cart,           setCart]           = useState([]);
  const [showForm,       setShowForm]       = useState(false);
  const [saleError,      setSaleError]      = useState(""); // inline error inside new sale modal

  // discount
  const [discountType,  setDiscountType]  = useState("FLAT"); // FLAT | PERCENT
  const [discountValue, setDiscountValue] = useState("");

  // filters
  const [search,   setSearch]   = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate,   setToDate]   = useState("");

  // edit
  const [editingSale, setEditingSale] = useState(null);
  const [editItems,   setEditItems]   = useState([]);
  const [editDiscountType,  setEditDiscountType]  = useState("FLAT");
  const [editDiscountValue, setEditDiscountValue] = useState("");
  const [editError,   setEditError]   = useState(""); // inline error inside edit modal

  useEffect(() => {
    fetchSales(currentPage);
    fetchProducts();
    fetchCustomers();
  }, [currentPage]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const confirm = (message, cb) => {
    setConfirmMsg(message);
    setConfirmCb(() => cb);
  };

  const fetchSales = async (page = 1) => {
    try {
      const r = await api.get(`/sales?page=${page}`);
      setSales(r.data.sales);
      setCurrentPage(r.data.currentPage);
      setTotalPages(r.data.totalPages);
    } catch (e) { console.error(e); }
  };

  const fetchProducts = async () => {
    try { const r = await api.get("/products/all"); setProducts(r.data); }
    catch (e) { console.error(e); }
  };

  // The /customers endpoint now always returns a paginated shape
  // ({ customers, currentPage, totalPages, ... }) rather than a bare array.
  // This page needs the *full* customer list for the sale-form dropdown, so
  // request a high limit and unwrap the `customers` key. We also keep the
  // Array.isArray check so this still works if the endpoint shape changes
  // back to a plain array in the future — that was the cause of the blank
  // white screen (customers.filter() was being called on a non-array object).
  const fetchCustomers = async () => {
    try {
      const r = await api.get("/customers?limit=1000");
      const data = r.data;
      setCustomers(Array.isArray(data) ? data : (data.customers ?? []));
    } catch (e) { console.error(e); }
  };

  /* ── Cart helpers ─────────────────────────────────────── */
  const selectedProduct = products.find(p => p._id === product);

  const cartTotal = cart.reduce((sum, item) => {
    const p = products.find(p => p._id === item.product);
    return sum + (p?.sellingPrice || 0) * item.quantity;
  }, 0);

  // discount amount resolved in Rs, clamped to [0, cartTotal]
  const discountAmount = (() => {
    const val = Number(discountValue) || 0;
    if (val <= 0) return 0;
    let amt = discountType === "PERCENT" ? (cartTotal * val) / 100 : val;
    if (amt > cartTotal) amt = cartTotal;
    return Math.round(amt * 100) / 100;
  })();

  const grandTotal = Math.max(0, Math.round((cartTotal - discountAmount) * 100) / 100);

  const findByBarcode = () => {
    const found = products.find(p => p.barcode === barcode);
    if (!found) { setSaleError("Product not found for this barcode."); return; }
    addProductToCart(found._id, 1);
    setBarcode("");
  };

  const addProductToCart = (productId, qty) => {
    const prod = products.find(p => p._id === productId);
    if (!prod) return;
    const existing = cart.find(i => i.product === productId);
    const newQty = (existing?.quantity || 0) + qty;
    if (newQty > prod.stock) { setSaleError(`Only ${prod.stock} items available for "${prod.name}".`); return; }
    setSaleError("");
    if (existing) {
      setCart(cart.map(i => i.product === productId ? { ...i, quantity: newQty } : i));
    } else {
      setCart([...cart, { product: productId, name: prod.name, quantity: qty }]);
    }
  };

  const addToCart = () => {
    if (!product || !quantity) { setSaleError("Please select a product and enter a quantity."); return; }
    addProductToCart(product, Number(quantity));
    setProduct(""); setQuantity("");
  };

  const updateCartQty = (productId, qty) => {
    if (qty <= 0) { removeFromCart(productId); return; }
    const prod = products.find(p => p._id === productId);
    if (qty > (prod?.stock || 0)) { setSaleError(`Only ${prod.stock} available for "${prod.name}".`); return; }
    setSaleError("");
    setCart(cart.map(i => i.product === productId ? { ...i, quantity: qty } : i));
  };

  const removeFromCart = id => setCart(cart.filter(i => i.product !== id));

  /* ── Submit sale ─────────────────────────────────────── */
  const addSale = async () => {
    if (cart.length === 0)                                              return setSaleError("Cart is empty. Add at least one product.");
    if (paymentType === "CREDIT" && !customer)                         return setSaleError("Please select a customer for credit sale.");
    if (paymentType === "CHEQUE" && (!chequeNumber || !bankName || !chequeDate)) return setSaleError("Please fill in all cheque details.");
    if (discountType === "PERCENT" && Number(discountValue) > 100)      return setSaleError("Percent discount cannot exceed 100%.");
    if (Number(discountValue) < 0)                                      return setSaleError("Discount cannot be negative.");
    const paid = Number(paidAmount) || 0;
    if (paid > grandTotal)                                             return setSaleError("Paid amount cannot exceed the total.");
    setSaleError("");
    try {
      const r = await api.post("/sales", {
        customer, paymentType, chequeNumber, bankName, chequeDate,
        items: cart.map(i => ({ product: i.product, quantity: i.quantity })),
        discountType, discountValue: Number(discountValue) || 0,
        paidAmount: paymentType === "CREDIT" ? paid : 0,
        advancePaymentMethod: paymentType === "CREDIT" && paid > 0 ? advancePaymentMethod : null,
      });
      if (paymentType === "CREDIT" && customer && paid > 0) {
        await api.post("/customer-transactions/payment", {
          customerId: customer, amount: paid,
          note: `Advance Payment (${advancePaymentMethod === "ONLINE" ? "Online" : "Cash"}) #${r.data._id}`,
        });
      }
      fetchSales();
      setCustomer(""); setCustomerSearch(""); setShowCustDrop(false);
      setPaymentType("CASH"); setPaidAmount(""); setAdvancePaymentMethod("CASH"); setCart([]);
      setChequeNumber(""); setBankName(""); setChequeDate("");
      setDiscountType("FLAT"); setDiscountValue("");
      setShowForm(false);
      showToast("success", "Sale created successfully!");
    } catch (e) {
      setSaleError(e?.response?.data?.message || "Failed to create sale.");
    }
  };

  /* ── Edit / delete ───────────────────────────────────── */
  const editCartTotal = editItems.reduce((sum, item) => {
    const p = products.find(p => p._id === item.product);
    return sum + (p?.sellingPrice || 0) * item.quantity;
  }, 0);

  const editDiscountAmount = (() => {
    const val = Number(editDiscountValue) || 0;
    if (val <= 0) return 0;
    let amt = editDiscountType === "PERCENT" ? (editCartTotal * val) / 100 : val;
    if (amt > editCartTotal) amt = editCartTotal;
    return Math.round(amt * 100) / 100;
  })();

  const editGrandTotal = Math.max(0, Math.round((editCartTotal - editDiscountAmount) * 100) / 100);

  const saveSaleChanges = async () => {
    setEditError("");
    if (editDiscountType === "PERCENT" && Number(editDiscountValue) > 100) return setEditError("Percent discount cannot exceed 100%.");
    if (Number(editDiscountValue) < 0) return setEditError("Discount cannot be negative.");
    try {
      await api.put(`/sales/${editingSale._id}`, {
        items: editItems.filter(i => i.quantity > 0),
        discountType: editDiscountType,
        discountValue: Number(editDiscountValue) || 0,
      });
      setEditingSale(null); setEditItems([]);
      setEditDiscountType("FLAT"); setEditDiscountValue("");
      fetchSales(); fetchProducts();
      showToast("success", "Sale updated successfully!");
    } catch (e) {
      setEditError(e?.response?.data?.message || "Failed to update sale.");
    }
  };

  const updateChequeStatus = async (saleId, status) => {
    try {
      await api.put(`/sales/${saleId}/cheque-status`, { status });
      fetchSales();
      showToast("success", `Cheque marked as ${status.toLowerCase()}.`);
    } catch (e) {
      showToast("error", e?.response?.data?.message || "Failed to update cheque status.");
    }
  };

  const deleteSale = (id) => {
    confirm("This will delete the sale and restore stock. This cannot be undone.", async () => {
      setConfirmMsg(null);
      try {
        await api.delete(`/sales/${id}`);
        fetchSales();
        showToast("success", "Sale deleted and stock restored.");
      } catch (e) {
        showToast("error", e?.response?.data?.message || "Failed to delete sale.");
      }
    });
  };

  /* ── Filtered sales ──────────────────────────────────── */
  const filteredSales = sales.filter(s => {
    const name = (s.customer?.name || "Walk-in").toLowerCase();
    const pan  = (s.customer?.panNumber || "").toLowerCase();
    const d    = new Date(s.createdAt);
    return (
      (name.includes(search.toLowerCase()) || pan.includes(search.toLowerCase())) &&
      (!fromDate || d >= new Date(fromDate)) &&
      (!toDate   || d <= new Date(toDate + "T23:59:59"))
    );
  });

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.panNumber?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.companyName?.toLowerCase().includes(customerSearch.toLowerCase())
  );

  /* ── Summary stats ───────────────────────────────────── */
  const todaySales = sales.filter(s => {
    const d = new Date(s.createdAt);
    const t = new Date(); t.setHours(0, 0, 0, 0);
    return d >= t;
  });
  const todayTotal  = todaySales.reduce((s, x) => s + x.totalAmount, 0);
  const todayCredit = todaySales.filter(s => s.paymentType === "CREDIT").length;
  const todayCheque = todaySales.filter(s => s.paymentType === "CHEQUE").length;

  return (
    <div>
      {/* ── Toast ── */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* ── Confirm dialog ── */}
      <ConfirmDialog
        message={confirmMsg}
        onConfirm={() => { confirmCb && confirmCb(); }}
        onCancel={() => setConfirmMsg(null)}
      />

      {/* ── Page header ── */}
      <div className="kb-page-header">
        <div>
          <h1 className="kb-page-title">Sales</h1>
          <div style={{ fontSize: 12.5, color: "var(--t3)", marginTop: 2 }}>
            Manage sales, invoices and cheques
          </div>
        </div>
        <button className="kb-btn kb-btn-primary" onClick={() => { setShowForm(true); setSaleError(""); }}>
          <i className="ti ti-plus" /> New Sale
        </button>
      </div>

      {/* ── Today's summary strip ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 18 }}>
        {[
          { label: "Today's sales",  value: `Rs. ${todayTotal.toLocaleString()}`, icon: "ti-receipt", color: "green" },
          { label: "Credit sales",   value: `${todayCredit} sales`,               icon: "ti-clock",   color: "amber" },
          { label: "Cheque sales",   value: `${todayCheque} sales`,               icon: "ti-writing", color: "blue"  },
        ].map(c => (
          <div key={c.label} className={`kb-stat-card ${c.color}`} style={{ padding: "13px 16px" }}>
            <div className="kb-stat-top">
              <div className="kb-stat-label">{c.label}</div>
              <div className={`kb-stat-icon ${c.color}`}><i className={`ti ${c.icon}`} /></div>
            </div>
            <div className="kb-stat-value">{c.value}</div>
          </div>
        ))}
      </div>

      {/* ── Sales history card ── */}
      <div className="kb-card">
        <div className="kb-card-header">
          <span className="kb-card-title">
            <i className="ti ti-history" style={{ color: "var(--blue-m)" }} />
            Sales history
          </span>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <div className="kb-search" style={{ width: 200 }}>
              <i className="ti ti-search" />
              <input placeholder="Search customer or PAN…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <input type="date" className="kb-input" style={{ width: 140, height: 33, padding: "0 8px", fontSize: 12 }}
              value={fromDate} onChange={e => setFromDate(e.target.value)} />
            <input type="date" className="kb-input" style={{ width: 140, height: 33, padding: "0 8px", fontSize: 12 }}
              value={toDate} onChange={e => setToDate(e.target.value)} />
            {(fromDate || toDate) && (
              <button className="kb-btn kb-btn-outline" style={{ padding: "5px 10px", fontSize: 11.5 }}
                onClick={() => { setFromDate(""); setToDate(""); }}>
                <i className="ti ti-x" /> Clear
              </button>
            )}
          </div>
        </div>

        <table className="kb-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>PAN</th>
              <th>Payment</th>
              <th>Cheque no.</th>
              <th>Status</th>
              <th className="text-end">Items</th>
              <th className="text-end">Discount</th>
              <th className="text-end">Amount</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.length === 0 && (
              <tr>
                <td colSpan={10} style={{ textAlign: "center", padding: "32px 0", color: "var(--t3)" }}>
                  <i className="ti ti-receipt-off" style={{ fontSize: 28, display: "block", marginBottom: 8 }} />
                  No sales found
                </td>
              </tr>
            )}
            {filteredSales.map(sale => (
              <tr key={sale._id}>
                <td style={{ whiteSpace: "nowrap" }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--t1)" }}>
                    {new Date(sale.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--t3)" }}>
                    {new Date(sale.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                      background: sale.customer ? "linear-gradient(135deg,#2563eb,#7c3aed)" : "#e2e8f0",
                      display: "grid", placeItems: "center",
                      fontSize: 10, fontWeight: 700,
                      color: sale.customer ? "#fff" : "#94a3b8",
                    }}>
                      {sale.customer ? sale.customer.name.slice(0, 2).toUpperCase() : <i className="ti ti-user" style={{ fontSize: 12 }} />}
                    </div>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--t1)" }}>
                        {sale.customer?.name || "Walk-in Customer"}
                      </div>
                      {sale.customer?.companyName && (
                        <div style={{ fontSize: 11, color: "var(--t3)" }}>
                          {sale.customer.companyName}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: 12, fontFamily: "monospace", color: "var(--t2)" }}>
                  {sale.customer?.panNumber || <span style={{ color: "var(--t3)" }}>—</span>}
                </td>
                <td><PayBadge type={sale.paymentType} /></td>
                <td style={{ fontSize: 12, fontFamily: "monospace", color: "var(--t2)" }}>
                  {sale.paymentType === "CHEQUE" ? sale.chequeNumber : <span style={{ color: "var(--t3)" }}>—</span>}
                </td>
                <td>
                  {sale.paymentType === "CHEQUE"
                    ? <ChequeBadge status={sale.chequeStatus} />
                    : <span style={{ color: "var(--t3)", fontSize: 12 }}>—</span>
                  }
                </td>
                <td className="text-end">
                  <span className="kb-badge blue">{sale.items?.length || 0}</span>
                </td>
                <td className="text-end">
                  {sale.discountAmount > 0
                    ? <span className="kb-badge green">− Rs. {sale.discountAmount.toLocaleString()}</span>
                    : <span style={{ color: "var(--t3)", fontSize: 12 }}>—</span>}
                </td>
                <td className="text-end">
                  <strong style={{ color: "var(--t1)" }}>Rs. {sale.totalAmount?.toLocaleString()}</strong>
                </td>
                <td className="text-end">
                  <div style={{ display: "flex", gap: 5, justifyContent: "flex-end", flexWrap: "wrap" }}>
                    <Link to={`/invoice/${sale._id}`} className="kb-btn kb-btn-outline" style={{ padding: "4px 9px", fontSize: 11.5 }}>
                      <i className="ti ti-file-invoice" /> Invoice
                    </Link>
                    {role === "ADMIN" && (
                      <>
                        <button className="kb-btn kb-btn-outline" style={{ padding: "4px 10px", fontSize: 11.5 }}
                          onClick={() => {
                            setEditingSale(sale);
                            setEditError("");
                            setEditItems(sale.items.map(i => ({ product: i.product._id, name: i.product.name, quantity: i.quantity })));
                            setEditDiscountType(sale.discountType || "FLAT");
                            setEditDiscountValue(sale.discountValue ? String(sale.discountValue) : "");
                          }}>
                          <i className="ti ti-edit" /> Edit
                        </button>
                        <button className="kb-btn kb-btn-danger" style={{ padding: "4px 10px", fontSize: 11.5 }}
                          onClick={() => deleteSale(sale._id)}>
                          <i className="ti ti-trash" /> Delete
                        </button>
                        {sale.paymentType === "CHEQUE" && sale.chequeStatus === "PENDING" && (
                          <>
                            <button className="kb-btn kb-btn-success" style={{ padding: "4px 9px", fontSize: 11 }}
                              onClick={() => updateChequeStatus(sale._id, "CLEARED")}>
                              <i className="ti ti-check" /> Clear
                            </button>
                            <button className="kb-btn kb-btn-outline" style={{ padding: "4px 9px", fontSize: 11 }}
                              onClick={() => updateChequeStatus(sale._id, "BOUNCED")}>
                              Bounce
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 14 }}>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>

      {/* ══ NEW SALE MODAL ══════════════════════════════ */}
      {showForm && (
        <Modal title="Create New Sale" onClose={() => { setShowForm(false); setCart([]); setSaleError(""); setDiscountType("FLAT"); setDiscountValue(""); setAdvancePaymentMethod("CASH"); }} width={780}>
          {/* Inline error */}
          <InlineError message={saleError} onClose={() => setSaleError("")} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* LEFT */}
            <div>
              {/* Customer */}
              <div className="kb-form-group" style={{ position: "relative" }}>
                <label className="kb-label">Customer</label>
                <div style={{ display: "flex", gap: 6 }}>
                  <div className="kb-search" style={{ flex: 1 }}>
                    <i className="ti ti-search" />
                    <input
                      placeholder="Search by name, company, phone or PAN…"
                      value={customerSearch}
                      onChange={e => { setCustomerSearch(e.target.value); setShowCustDrop(true); }}
                      onFocus={() => setShowCustDrop(true)}
                    />
                  </div>
                  {customer && (
                    <button className="kb-btn kb-btn-outline" style={{ padding: "0 10px", fontSize: 12 }}
                      onClick={() => { setCustomer(""); setCustomerSearch(""); }}>
                      <i className="ti ti-x" />
                    </button>
                  )}
                </div>
                {showCustDrop && customerSearch && filteredCustomers.length > 0 && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 200, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.1)", maxHeight: 180, overflowY: "auto" }}>
                    {filteredCustomers.map(c => (
                      <div key={c._id} onClick={() => { setCustomer(c._id); setCustomerSearch(c.name); setShowCustDrop(false); setSaleError(""); }}
                        style={{ padding: "9px 12px", cursor: "pointer", borderBottom: "1px solid #f1f5f9", fontSize: 13 }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                        onMouseLeave={e => e.currentTarget.style.background = ""}
                      >
                        <strong>{c.name}</strong>
                        {c.companyName && <span style={{ color: "var(--t3)", marginLeft: 8, fontSize: 11.5 }}>{c.companyName}</span>}
                        {c.phone && <span style={{ color: "var(--t3)", marginLeft: 8, fontSize: 11.5 }}>{c.phone}</span>}
                        {c.panNumber && <span style={{ color: "var(--t3)", marginLeft: 8, fontSize: 11.5, fontFamily: "monospace" }}>PAN: {c.panNumber}</span>}
                        {c.dueAmount > 0 && <span className="kb-badge red" style={{ marginLeft: 6, fontSize: 10 }}>Due: Rs.{c.dueAmount}</span>}
                      </div>
                    ))}
                  </div>
                )}
                {customer && (
                  <div style={{ marginTop: 6, fontSize: 12, color: "var(--green-m)", display: "flex", alignItems: "center", gap: 4 }}>
                    <i className="ti ti-circle-check" /> Customer selected: <strong>{customerSearch}</strong>
                  </div>
                )}
                {!customer && (
                  <div style={{ marginTop: 5, fontSize: 11.5, color: "var(--t3)" }}>Leave empty for walk-in sale</div>
                )}
              </div>

              {/* Payment type */}
              <div className="kb-form-group">
                <label className="kb-label">Payment type</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["CASH", "CREDIT", "CHEQUE"].map(t => (
                    <button key={t} onClick={() => { setPaymentType(t); setSaleError(""); }}
                      style={{
                        flex: 1, padding: "8px 0", borderRadius: "var(--r)",
                        border: paymentType === t ? "2px solid var(--brand)" : "1px solid #e2e8f0",
                        background: paymentType === t ? "var(--blue-b)" : "#fff",
                        color: paymentType === t ? "var(--brand)" : "var(--t2)",
                        fontWeight: paymentType === t ? 700 : 500,
                        fontSize: 12.5, cursor: "pointer", fontFamily: "inherit",
                      }}>
                      <i className={`ti ${t === "CASH" ? "ti-cash" : t === "CREDIT" ? "ti-clock" : "ti-writing"}`} style={{ marginRight: 4 }} />
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {paymentType === "CREDIT" && (
                <div className="kb-form-group">
                  <label className="kb-label">Paid now (advance)</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input type="number" className="kb-input" style={{ flex: 1 }} placeholder="0"
                      value={paidAmount} onChange={e => setPaidAmount(e.target.value)} />
                    <div style={{ display: "flex", gap: 4 }}>
                      {["CASH", "ONLINE"].map(m => (
                        <button key={m} type="button" onClick={() => setAdvancePaymentMethod(m)}
                          style={{
                            padding: "8px 12px", borderRadius: "var(--r)",
                            border: advancePaymentMethod === m ? "2px solid var(--brand)" : "1px solid #e2e8f0",
                            background: advancePaymentMethod === m ? "var(--blue-b)" : "#fff",
                            color: advancePaymentMethod === m ? "var(--brand)" : "var(--t2)",
                            fontWeight: advancePaymentMethod === m ? 700 : 500,
                            fontSize: 12.5, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
                          }}>
                          <i className={`ti ${m === "CASH" ? "ti-cash" : "ti-credit-card"}`} style={{ marginRight: 4 }} />
                          {m === "CASH" ? "Cash" : "Online"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {paymentType === "CHEQUE" && (
                <div style={{ background: "var(--blue-b)", border: "1px solid var(--blue-bd)", borderRadius: "var(--r)", padding: "12px 14px", marginBottom: 14 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--blue)", marginBottom: 10, textTransform: "uppercase", letterSpacing: ".05em" }}>
                    <i className="ti ti-writing" style={{ marginRight: 4 }} /> Cheque details
                  </div>
                  <div className="kb-form-group">
                    <label className="kb-label">Cheque number</label>
                    <input className="kb-input" value={chequeNumber} onChange={e => setChequeNumber(e.target.value)} />
                  </div>
                  <div className="kb-form-group">
                    <label className="kb-label">Bank name</label>
                    <input className="kb-input" value={bankName} onChange={e => setBankName(e.target.value)} />
                  </div>
                  <div className="kb-form-group" style={{ marginBottom: 0 }}>
                    <label className="kb-label">Cheque date</label>
                    <input type="date" className="kb-input" value={chequeDate} onChange={e => setChequeDate(e.target.value)} />
                  </div>
                </div>
              )}

              {/* Discount */}
              <div style={{ background: "var(--green-b, #ecfdf5)", border: "1px solid var(--green-bd, #a7f3d0)", borderRadius: "var(--r)", padding: "12px 14px", marginBottom: 14 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--green, #059669)", marginBottom: 10, textTransform: "uppercase", letterSpacing: ".05em" }}>
                  <i className="ti ti-discount-2" style={{ marginRight: 4 }} /> Discount
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {["FLAT", "PERCENT"].map(t => (
                      <button key={t} onClick={() => setDiscountType(t)}
                        style={{
                          padding: "8px 12px", borderRadius: "var(--r)",
                          border: discountType === t ? "2px solid var(--brand)" : "1px solid #e2e8f0",
                          background: discountType === t ? "var(--blue-b)" : "#fff",
                          color: discountType === t ? "var(--brand)" : "var(--t2)",
                          fontWeight: discountType === t ? 700 : 500,
                          fontSize: 12.5, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
                        }}>
                        {t === "FLAT" ? "Rs." : "%"}
                      </button>
                    ))}
                  </div>
                  <input type="number" min="0" className="kb-input" style={{ flex: 1 }}
                    placeholder={discountType === "PERCENT" ? "e.g. 10 (%)" : "e.g. 100 (Rs.)"}
                    value={discountValue} onChange={e => setDiscountValue(e.target.value)} />
                </div>
                {discountAmount > 0 && (
                  <div style={{ marginTop: 8, fontSize: 12, color: "var(--green-m, #059669)" }}>
                    <i className="ti ti-circle-check" style={{ marginRight: 4 }} />
                    Discount applied: Rs. {discountAmount.toLocaleString()}
                  </div>
                )}
              </div>

              <div className="kb-form-group">
                <label className="kb-label">Add by barcode</label>
                <div style={{ display: "flex", gap: 6 }}>
                  <input className="kb-input" placeholder="Scan or type barcode…"
                    value={barcode} onChange={e => setBarcode(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && findByBarcode()} />
                  <button className="kb-btn kb-btn-outline" style={{ padding: "0 12px", whiteSpace: "nowrap" }} onClick={findByBarcode}>
                    <i className="ti ti-scan" />
                  </button>
                </div>
              </div>

              <div className="kb-form-group">
                <label className="kb-label">Select product</label>
                <select className="kb-input" value={product} onChange={e => { setProduct(e.target.value); setSaleError(""); }}>
                  <option value="">Choose product…</option>
                  {products.map(p => {
                    const lotCode = [p.lotNo && `Lot ${p.lotNo}`, p.code && `Code ${p.code}`].filter(Boolean).join(" · ");
                    return (
                      <option key={p._id} value={p._id}>
                        {p.name} — Rs.{p.sellingPrice} (Stock: {p.stock}){lotCode ? ` [${lotCode}]` : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              {selectedProduct && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--bg-surface)", border: "1px solid #e2e8f0", borderRadius: "var(--r)", padding: "10px 12px", marginBottom: 12 }}>
                  {selectedProduct.image
                    ? <img src={`${API_BASE}${selectedProduct.image}`} alt={selectedProduct.name} style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
                    : <div style={{ width: 40, height: 40, background: "#e2e8f0", borderRadius: 8, display: "grid", placeItems: "center", flexShrink: 0 }}><i className="ti ti-photo" style={{ color: "#94a3b8" }} /></div>
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "var(--t1)" }}>{selectedProduct.name}</div>
                    <div style={{ fontSize: 12, color: "var(--t2)" }}>Rs. {selectedProduct.sellingPrice} · Stock: {selectedProduct.stock}</div>
                    {(selectedProduct.lotNo || selectedProduct.code) && (
                      <div style={{ fontSize: 11, color: "var(--t3)", fontFamily: "monospace" }}>
                        {selectedProduct.lotNo && `Lot: ${selectedProduct.lotNo}`}
                        {selectedProduct.lotNo && selectedProduct.code && "  ·  "}
                        {selectedProduct.code && `Code: ${selectedProduct.code}`}
                      </div>
                    )}
                  </div>
                  {selectedProduct.stock <= selectedProduct.minimumStock && (
                    <span className="kb-badge amber"><i className="ti ti-alert-triangle" style={{ fontSize: 10 }} /> Low</span>
                  )}
                </div>
              )}

              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label className="kb-label">Quantity</label>
                  <input type="number" className="kb-input" placeholder="1"
                    value={quantity} onChange={e => setQuantity(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addToCart()} />
                </div>
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <button className="kb-btn kb-btn-primary" onClick={addToCart}>
                    <i className="ti ti-plus" /> Add to cart
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT — cart */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: "var(--t1)", display: "flex", alignItems: "center", gap: 6 }}>
                  <i className="ti ti-shopping-cart" style={{ color: "var(--blue-m)" }} />
                  Cart
                  {cart.length > 0 && <span className="kb-badge blue">{cart.length}</span>}
                </div>
                {cart.length > 0 && (
                  <button className="kb-btn kb-btn-outline" style={{ padding: "3px 9px", fontSize: 11.5 }} onClick={() => setCart([])}>
                    <i className="ti ti-trash" /> Clear
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", background: "var(--bg-surface)", borderRadius: "var(--r)", border: "2px dashed #e2e8f0", color: "var(--t3)", gap: 8 }}>
                  <i className="ti ti-shopping-cart-off" style={{ fontSize: 32 }} />
                  <div style={{ fontSize: 13 }}>Cart is empty</div>
                  <div style={{ fontSize: 12 }}>Add products from the left</div>
                </div>
              ) : (
                <>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                    {cart.map(item => {
                      const p = products.find(x => x._id === item.product);
                      const lineTotal = (p?.sellingPrice || 0) * item.quantity;
                      return (
                        <div key={item.product} style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--bg-surface)", border: "1px solid #e2e8f0", borderRadius: "var(--r)", padding: "9px 11px" }}>
                          {p?.image
                            ? <img src={`${API_BASE}${p.image}`} alt={item.name} style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
                            : <div style={{ width: 36, height: 36, background: "#e2e8f0", borderRadius: 6, display: "grid", placeItems: "center", flexShrink: 0 }}><i className="ti ti-box" style={{ color: "#94a3b8", fontSize: 14 }} /></div>
                          }
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--t1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
                            <div style={{ fontSize: 11.5, color: "var(--t3)" }}>Rs.{p?.sellingPrice} × {item.quantity}</div>
                            {(p?.lotNo || p?.code) && (
                              <div style={{ fontSize: 10.5, color: "var(--t3)", fontFamily: "monospace" }}>
                                {p?.lotNo && `Lot: ${p.lotNo}`}
                                {p?.lotNo && p?.code && " · "}
                                {p?.code && `Code: ${p.code}`}
                              </div>
                            )}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <button onClick={() => updateCartQty(item.product, item.quantity - 1)}
                              style={{ width: 22, height: 22, borderRadius: 4, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", display: "grid", placeItems: "center", fontSize: 14, color: "var(--t2)" }}>−</button>
                            <span style={{ fontSize: 12.5, fontWeight: 600, minWidth: 20, textAlign: "center" }}>{item.quantity}</span>
                            <button onClick={() => updateCartQty(item.product, item.quantity + 1)}
                              style={{ width: 22, height: 22, borderRadius: 4, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", display: "grid", placeItems: "center", fontSize: 14, color: "var(--t2)" }}>+</button>
                          </div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: "var(--t1)", minWidth: 70, textAlign: "right" }}>Rs.{lineTotal.toLocaleString()}</div>
                          <button onClick={() => removeFromCart(item.product)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#fca5a5", fontSize: 16, padding: 0, lineHeight: 1 }}>
                            <i className="ti ti-x" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "var(--r)", padding: "12px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "var(--t2)", marginBottom: 4 }}>
                      <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                      <span>Rs. {cartTotal.toLocaleString()}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "var(--green-m, #059669)", marginBottom: 4 }}>
                        <span>Discount {discountType === "PERCENT" ? `(${discountValue}%)` : ""}</span>
                        <span>− Rs. {discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    {paymentType === "CREDIT" && paidAmount && (
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "var(--green-m)", marginBottom: 4 }}>
                        <span>Paid now ({advancePaymentMethod === "ONLINE" ? "Online" : "Cash"})</span>
                        <span>− Rs. {Number(paidAmount).toLocaleString()}</span>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 800, color: "var(--t1)", borderTop: "1px solid #e2e8f0", paddingTop: 8, marginTop: 4 }}>
                      <span>Grand total</span>
                      <span style={{ color: "var(--blue-m)" }}>Rs. {grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </>
              )}

              <button className="kb-btn kb-btn-primary"
                style={{ width: "100%", justifyContent: "center", marginTop: 12, padding: "10px 0", fontSize: 14 }}
                onClick={addSale}>
                <i className="ti ti-check" /> Confirm Sale
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ══ EDIT SALE MODAL ════════════════════════════ */}
      {editingSale && (
        <Modal title={`Edit Sale — INV-${editingSale._id.slice(-6).toUpperCase()}`} onClose={() => { setEditingSale(null); setEditItems([]); setEditError(""); setEditDiscountType("FLAT"); setEditDiscountValue(""); }}>
          <InlineError message={editError} onClose={() => setEditError("")} />
          <div style={{ marginBottom: 14 }}>
            {editItems.map((item, idx) => (
              <div key={item.product} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ flex: 1, fontWeight: 600, fontSize: 13, color: "var(--t1)" }}>{item.name}</div>
                <input type="number" className="kb-input" style={{ width: 80 }}
                  value={item.quantity}
                  onChange={e => {
                    const u = [...editItems]; u[idx].quantity = Number(e.target.value); setEditItems(u);
                  }} />
                <button className="kb-btn kb-btn-danger" style={{ padding: "5px 9px" }}
                  onClick={() => setEditItems(editItems.filter((_, i) => i !== idx))}>
                  <i className="ti ti-trash" />
                </button>
              </div>
            ))}
          </div>
          <div className="kb-form-group">
            <label className="kb-label">Add product</label>
            <select className="kb-input" onChange={e => {
              const p = products.find(x => x._id === e.target.value);
              if (!p) return;
              setEditItems([...editItems, { product: p._id, name: p.name, quantity: 1 }]);
              e.target.value = "";
            }}>
              <option value="">Select product…</option>
              {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>

          {/* Discount */}
          <div style={{ background: "var(--green-b, #ecfdf5)", border: "1px solid var(--green-bd, #a7f3d0)", borderRadius: "var(--r)", padding: "12px 14px", marginBottom: 14 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--green, #059669)", marginBottom: 10, textTransform: "uppercase", letterSpacing: ".05em" }}>
              <i className="ti ti-discount-2" style={{ marginRight: 4 }} /> Discount
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ display: "flex", gap: 4 }}>
                {["FLAT", "PERCENT"].map(t => (
                  <button key={t} onClick={() => setEditDiscountType(t)}
                    style={{
                      padding: "8px 12px", borderRadius: "var(--r)",
                      border: editDiscountType === t ? "2px solid var(--brand)" : "1px solid #e2e8f0",
                      background: editDiscountType === t ? "var(--blue-b)" : "#fff",
                      color: editDiscountType === t ? "var(--brand)" : "var(--t2)",
                      fontWeight: editDiscountType === t ? 700 : 500,
                      fontSize: 12.5, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
                    }}>
                    {t === "FLAT" ? "Rs." : "%"}
                  </button>
                ))}
              </div>
              <input type="number" min="0" className="kb-input" style={{ flex: 1 }}
                placeholder={editDiscountType === "PERCENT" ? "e.g. 10 (%)" : "e.g. 100 (Rs.)"}
                value={editDiscountValue} onChange={e => setEditDiscountValue(e.target.value)} />
            </div>
          </div>

          {/* Live totals */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "var(--r)", padding: "12px 14px", marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "var(--t2)", marginBottom: 4 }}>
              <span>Subtotal</span>
              <span>Rs. {editCartTotal.toLocaleString()}</span>
            </div>
            {editDiscountAmount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "var(--green-m, #059669)", marginBottom: 4 }}>
                <span>Discount</span>
                <span>− Rs. {editDiscountAmount.toLocaleString()}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: "var(--t1)", borderTop: "1px solid #e2e8f0", paddingTop: 8, marginTop: 4 }}>
              <span>Grand total</span>
              <span style={{ color: "var(--blue-m)" }}>Rs. {editGrandTotal.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <button className="kb-btn kb-btn-outline" onClick={() => { setEditingSale(null); setEditItems([]); setEditError(""); setEditDiscountType("FLAT"); setEditDiscountValue(""); }}>Cancel</button>
            <button className="kb-btn kb-btn-primary" onClick={saveSaleChanges}>Save changes</button>
          </div>
        </Modal>
      )}

      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </div>
  );
}