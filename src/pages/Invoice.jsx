import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Invoice() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const invoiceRef = useRef();

  const [sale,     setSale]     = useState(null);
  const [settings, setSettings] = useState(null);
  const [returns,  setReturns]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Return modal state
  const [returnModal,   setReturnModal]   = useState(false);
  const [returnProduct, setReturnProduct] = useState(null);
  const [returnQty,     setReturnQty]     = useState('1');
  const [returnReason,  setReturnReason]  = useState('');
  const [returnSaving,  setReturnSaving]  = useState(false);
  const [returnError,   setReturnError]   = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [saleRes, settingsRes, returnsRes] = await Promise.all([
        api.get(`/sales/${id}`),
        api.get("/settings"),
        api.get(`/sale-returns/${id}`),
      ]);
      setSale(saleRes.data);
      setSettings(settingsRes.data);
      setReturns(returnsRes.data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const downloadPDF = async () => {
    try {
      setDownloading(true);
      const el     = invoiceRef.current;
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const img    = canvas.toDataURL("image/png");
      const pdf    = new jsPDF("p", "mm", "a4");
      const w      = pdf.internal.pageSize.getWidth();
      const h      = (canvas.height * w) / canvas.width;
      pdf.addImage(img, "PNG", 0, 0, w, h);
      pdf.save(`INV-${sale._id.slice(-6).toUpperCase()}.pdf`);
    } catch(e) { console.error(e); }
    finally { setDownloading(false); }
  };

  const openReturnModal = (productId, productName) => {
    setReturnProduct({ id: productId, name: productName });
    setReturnQty('1');
    setReturnReason('');
    setReturnModal(true);
  };

  const submitReturn = async () => {
    setReturnError('');
    if (!returnQty || Number(returnQty) <= 0) {
      setReturnError('Please enter a valid quantity.');
      return;
    }
    try {
      setReturnSaving(true);
      await api.post('/sale-returns', {
        saleId: sale._id,
        productId: returnProduct.id,
        quantity: Number(returnQty),
        reason: returnReason,
      });
      setReturnModal(false);
      setReturnError('');
      fetchAll();
    } catch(e) {
      setReturnError(e?.response?.data?.message || 'Failed to process return.');
    } finally { setReturnSaving(false); }
  };

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:300, color:"var(--t3)", flexDirection:"column", gap:12 }}>
      <div style={{ width:32, height:32, border:"3px solid #e2e8f0", borderTopColor:"#2563eb", borderRadius:"50%", animation:"spin .8s linear infinite" }} />
      <div style={{ fontSize:13 }}>Loading invoice…</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!sale || !settings) return (
    <div style={{ textAlign:"center", padding:"60px 0", color:"var(--t3)" }}>
      <i className="ti ti-file-off" style={{ fontSize:40, display:"block", marginBottom:12 }} />
      <div style={{ fontSize:14, fontWeight:600 }}>Invoice not found</div>
    </div>
  );

  const invNumber  = `INV-${sale._id.slice(-6).toUpperCase()}`;
  const isPaid     = sale.paymentType !== "CREDIT" || (sale.paymentType === "CHEQUE" && sale.chequeStatus === "CLEARED");
  const statusLabel = sale.paymentType === "CHEQUE"
    ? sale.chequeStatus
    : sale.paymentType === "CREDIT" ? "CREDIT" : "PAID";
  const statusColor = statusLabel === "PAID" || statusLabel === "CLEARED"
    ? { bg:"#ecfdf5", color:"#065f46", border:"#a7f3d0" }
    : statusLabel === "BOUNCED"
    ? { bg:"#fef2f2", color:"#991b1b", border:"#fca5a5" }
    : { bg:"#fffbeb", color:"#92400e", border:"#fcd34d" };

  // Discount display (falls back gracefully for older sales without the field)
  const subtotal       = sale.subtotal ?? sale.totalAmount;
  const discountAmount = sale.discountAmount || 0;
  const hasDiscount     = discountAmount > 0;
  const discountLabel   = sale.discountType === "PERCENT" && sale.discountValue
    ? `Discount (${sale.discountValue}%)`
    : "Discount";

  // Advance paid / balance due (CREDIT sales only — CASH is settled in full,
  // CHEQUE due tracking is handled via chequeStatus instead)
  const amountPaid  = sale.amountPaid || 0;
  const advMethod   = sale.advancePaymentMethod; // "CASH" | "ONLINE" | null
  const hasAdvance  = sale.paymentType === "CREDIT" && amountPaid > 0;
  const balanceDue  = Math.max(0, Math.round((sale.totalAmount - amountPaid) * 100) / 100);

  return (
    <div>
      {/* ── Top action bar (not printed) ─────────────── */}
      <div className="no-print" style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        marginBottom:20,
      }}>
        <button
          onClick={() => {
            // If this tab has no previous page in its history (e.g. the invoice
            // was opened in a brand-new tab), navigate(-1) has nothing to go back
            // to and silently does nothing. Fall back to the Sales list instead.
            if (window.history.length > 2) navigate(-1);
            else navigate("/sales");
          }}
          className="kb-btn kb-btn-outline" style={{ padding:"6px 11px" }}>
          <i className="ti ti-arrow-left" /> Back
        </button>
        <div style={{ display:"flex", gap:8 }}>
          <button className="kb-btn kb-btn-outline" onClick={() => window.print()}>
            <i className="ti ti-printer" /> Print
          </button>
          <button className="kb-btn kb-btn-primary" onClick={downloadPDF} disabled={downloading}>
            {downloading
              ? <><div style={{ width:13,height:13,border:"2px solid rgba(255,255,255,0.4)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .7s linear infinite" }} /> Generating…</>
              : <><i className="ti ti-download" /> Download PDF</>
            }
          </button>
        </div>
      </div>

      {/* ══ INVOICE DOCUMENT ═══════════════════════════ */}
      <div ref={invoiceRef} style={{
        background:"#fff",
        maxWidth:800,
        margin:"0 auto",
        borderRadius:12,
        boxShadow:"0 4px 24px rgba(0,0,0,0.08)",
        overflow:"hidden",
        fontFamily:"'Inter',system-ui,sans-serif",
      }}>

        {/* ── Header band ──────────────────────────────── */}
        <div style={{
          background:"linear-gradient(135deg,#0f172a 0%,#1e3a8a 60%,#2563eb 100%)",
          padding:"32px 40px",
          display:"flex", alignItems:"flex-start", justifyContent:"space-between",
        }}>
          {/* Store info */}
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
              <div style={{
                width:42, height:42, borderRadius:10,
                background:"rgba(255,255,255,0.15)",
                display:"grid", placeItems:"center",
                fontSize:20, fontWeight:800, color:"#fff",
                backdropFilter:"blur(4px)",
              }}>
                {settings.storeName?.slice(0,1).toUpperCase() || "K"}
              </div>
              <div>
                <div style={{ fontSize:18, fontWeight:800, color:"#fff", letterSpacing:"-0.3px" }}>
                  {settings.storeName}
                </div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.55)", fontWeight:500 }}>
                  Sales Invoice
                </div>
              </div>
            </div>
            <div style={{ fontSize:12.5, color:"rgba(255,255,255,0.65)", lineHeight:1.7 }}>
              {settings.address && <div><i className="ti ti-map-pin" style={{ marginRight:5, fontSize:12 }} />{settings.address}</div>}
              {settings.phone   && <div><i className="ti ti-phone"   style={{ marginRight:5, fontSize:12 }} />{settings.phone}</div>}
              {settings.vatNumber && <div><i className="ti ti-id" style={{ marginRight:5, fontSize:12 }} />VAT/PAN: {settings.vatNumber}</div>}
            </div>
          </div>

          {/* Invoice number + status */}
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:".08em", marginBottom:4 }}>
              Invoice number
            </div>
            <div style={{ fontSize:22, fontWeight:800, color:"#fff", letterSpacing:"-0.5px", marginBottom:12 }}>
              {invNumber}
            </div>
            <div style={{
              display:"inline-flex", alignItems:"center", gap:5,
              background:statusColor.bg, color:statusColor.color,
              border:`1px solid ${statusColor.border}`,
              padding:"4px 12px", borderRadius:20,
              fontSize:11, fontWeight:700, letterSpacing:".05em",
            }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:statusColor.color }} />
              {statusLabel}
            </div>
          </div>
        </div>

        {/* ── Invoice meta ─────────────────────────────── */}
        <div style={{
          display:"grid", gridTemplateColumns:"1fr 1fr 1fr",
          padding:"20px 40px",
          borderBottom:"1px solid #f1f5f9",
          background:"#fafbfc",
          gap:20,
        }}>
          {/* Invoice details */}
          <div>
            <div style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".07em", marginBottom:8 }}>
              Invoice details
            </div>
            {[
              { label:"Invoice ID", value:invNumber },
              { label:"Date",       value:new Date(sale.createdAt).toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" }) },
              { label:"Time",       value:new Date(sale.createdAt).toLocaleTimeString("en-US", { hour:"2-digit", minute:"2-digit" }) },
              { label:"Payment",    value:sale.paymentType },
            ].map(row => (
              <div key={row.label} style={{ display:"flex", justifyContent:"space-between", fontSize:12.5, marginBottom:4 }}>
                <span style={{ color:"#94a3b8" }}>{row.label}</span>
                <span style={{ fontWeight:600, color:"#0f172a" }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Cheque details (if applicable) */}
          {sale.paymentType === "CHEQUE" && (
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".07em", marginBottom:8 }}>
                Cheque details
              </div>
              {[
                { label:"Cheque No",  value:sale.chequeNumber },
                { label:"Bank",       value:sale.bankName },
                { label:"Date",       value:new Date(sale.chequeDate).toLocaleDateString("en-GB") },
                { label:"Status",     value:sale.chequeStatus },
              ].map(row => (
                <div key={row.label} style={{ display:"flex", justifyContent:"space-between", fontSize:12.5, marginBottom:4 }}>
                  <span style={{ color:"#94a3b8" }}>{row.label}</span>
                  <span style={{ fontWeight:600, color:"#0f172a" }}>{row.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Bill to */}
          <div style={{ marginLeft:"auto", textAlign:"right" }}>
            <div style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".07em", marginBottom:8 }}>
              Bill to
            </div>
            {sale.customer ? (
              <>
                <div style={{ fontSize:14, fontWeight:700, color:"#0f172a", marginBottom:3 }}>{sale.customer.name}</div>
                {sale.customer.phone   && <div style={{ fontSize:12.5, color:"#475569" }}>{sale.customer.phone}</div>}
                {sale.customer.address && <div style={{ fontSize:12.5, color:"#475569" }}>{sale.customer.address}</div>}
              </>
            ) : (
              <div style={{ fontSize:13, fontWeight:600, color:"#475569" }}>Walk-in Customer</div>
            )}
          </div>
        </div>

        {/* ── Items table ───────────────────────────────── */}
        <div style={{ padding:"24px 40px" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ background:"#f8fafc" }}>
                <th style={{ padding:"10px 12px", textAlign:"left",  fontSize:10.5, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".06em", borderBottom:"2px solid #e2e8f0" }}>#</th>
                <th style={{ padding:"10px 12px", textAlign:"left",  fontSize:10.5, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".06em", borderBottom:"2px solid #e2e8f0" }}>Product</th>
                <th style={{ padding:"10px 12px", textAlign:"center",fontSize:10.5, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".06em", borderBottom:"2px solid #e2e8f0" }}>Qty</th>
                <th style={{ padding:"10px 12px", textAlign:"right", fontSize:10.5, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".06em", borderBottom:"2px solid #e2e8f0" }}>Unit price</th>
                <th style={{ padding:"10px 12px", textAlign:"right", fontSize:10.5, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".06em", borderBottom:"2px solid #e2e8f0" }}>Total</th>
                <th className="no-print" style={{ padding:"10px 12px", textAlign:"right", fontSize:10.5, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".06em", borderBottom:"2px solid #e2e8f0" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item, i) => (
                <tr key={i} style={{ borderBottom:"1px solid #f1f5f9" }}>
                  <td style={{ padding:"12px 12px", color:"#94a3b8", fontSize:12 }}>{i+1}</td>
                  <td style={{ padding:"12px 12px" }}>
                    <div style={{ fontWeight:600, color:"#0f172a", fontSize:13 }}>{item.product?.name}</div>
                    {item.product?.category && (
                      <div style={{ fontSize:11, color:"#94a3b8", marginTop:1 }}>{item.product.category}</div>
                    )}
                  </td>
                  <td style={{ padding:"12px 12px", textAlign:"center" }}>
                    <span style={{
                      display:"inline-block", background:"#eff6ff", color:"#1e3a8a",
                      borderRadius:6, padding:"2px 10px", fontWeight:700, fontSize:12,
                    }}>{item.quantity}</span>
                  </td>
                  <td style={{ padding:"12px 12px", textAlign:"right", color:"#475569", fontSize:13 }}>
                    Rs. {item.sellingPrice?.toLocaleString()}
                  </td>
                  <td style={{ padding:"12px 12px", textAlign:"right", fontWeight:700, color:"#0f172a", fontSize:13 }}>
                    Rs. {item.total?.toLocaleString()}
                  </td>
                  <td className="no-print" style={{ padding:"12px 12px", textAlign:"right" }}>
                    <button
                      onClick={() => openReturnModal(item.product?._id, item.product?.name)}
                      style={{
                        padding:"4px 10px", fontSize:11.5, fontWeight:600,
                        background:"#fffbeb", color:"#92400e",
                        border:"1px solid #fcd34d", borderRadius:6,
                        cursor:"pointer", fontFamily:"inherit",
                      }}
                    >
                      <i className="ti ti-arrow-back-up" style={{ marginRight:3, fontSize:12 }} />
                      Return
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ── Totals block ────────────────────────────── */}
          <div style={{ display:"flex", justifyContent:"flex-end", marginTop:20 }}>
            <div style={{ minWidth:260 }}>
              <div style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", fontSize:13, color:"#475569", borderBottom:"1px solid #f1f5f9" }}>
                <span>Subtotal</span>
                <span style={{ fontWeight:600 }}>Rs. {subtotal?.toLocaleString()}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", fontSize:13, color:"#475569", borderBottom:"1px solid #f1f5f9" }}>
                <span>{discountLabel}</span>
                <span style={{ fontWeight:600, color: hasDiscount ? "#059669" : "#94a3b8" }}>
                  {hasDiscount ? `− Rs. ${discountAmount.toLocaleString()}` : "Rs. 0"}
                </span>
              </div>
              {hasAdvance && (
                <>
                  <div style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", fontSize:13, color:"#475569", borderBottom:"1px solid #f1f5f9" }}>
                    <span>
                      Paid (advance)
                      {advMethod && (
                        <span style={{
                          marginLeft:6, fontSize:10.5, fontWeight:700,
                          color: advMethod === "ONLINE" ? "#1e3a8a" : "#065f46",
                          background: advMethod === "ONLINE" ? "#eff6ff" : "#ecfdf5",
                          border: `1px solid ${advMethod === "ONLINE" ? "#bfdbfe" : "#a7f3d0"}`,
                          borderRadius:20, padding:"1px 8px", textTransform:"uppercase", letterSpacing:".04em",
                        }}>
                          {advMethod === "ONLINE" ? "Online" : "Cash"}
                        </span>
                      )}
                    </span>
                    <span style={{ fontWeight:600, color:"#059669" }}>− Rs. {amountPaid.toLocaleString()}</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", fontSize:13, color:"#475569", borderBottom:"1px solid #f1f5f9" }}>
                    <span>Balance due</span>
                    <span style={{ fontWeight:700, color:"#dc2626" }}>Rs. {balanceDue.toLocaleString()}</span>
                  </div>
                </>
              )}
              <div style={{
                display:"flex", justifyContent:"space-between",
                padding:"12px 16px", marginTop:8,
                background:"linear-gradient(135deg,#0f172a,#1e3a8a)",
                borderRadius:10, color:"#fff",
              }}>
                <span style={{ fontSize:14, fontWeight:600 }}>Grand Total</span>
                <span style={{ fontSize:18, fontWeight:800, letterSpacing:"-0.4px" }}>
                  Rs. {sale.totalAmount?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Return history ────────────────────────────── */}
        {returns.length > 0 && (
          <div style={{ padding:"0 40px 24px" }}>
            <div style={{
              borderTop:"2px dashed #e2e8f0", paddingTop:20, marginTop:4,
            }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".07em", marginBottom:12 }}>
                <i className="ti ti-arrow-back-up" style={{ marginRight:5 }} />Return history
              </div>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12.5 }}>
                <thead>
                  <tr>
                    {["Date","Product","Qty","Reason"].map(h => (
                      <th key={h} style={{ padding:"7px 10px", textAlign:"left", fontWeight:700, color:"#94a3b8", fontSize:10.5, textTransform:"uppercase", letterSpacing:".06em", borderBottom:"1px solid #e2e8f0" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {returns.map(r => (
                    <tr key={r._id} style={{ borderBottom:"1px solid #f8fafc" }}>
                      <td style={{ padding:"8px 10px", color:"#475569" }}>{new Date(r.createdAt).toLocaleDateString("en-GB")}</td>
                      <td style={{ padding:"8px 10px", fontWeight:600, color:"#0f172a" }}>{r.product?.name}</td>
                      <td style={{ padding:"8px 10px", color:"#475569" }}>{r.quantity}</td>
                      <td style={{ padding:"8px 10px", color:"#475569" }}>{r.reason || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Footer ───────────────────────────────────── */}
        <div style={{
          background:"#f8fafc",
          borderTop:"1px solid #e2e8f0",
          padding:"20px 40px",
          display:"flex", alignItems:"center", justifyContent:"space-between",
        }}>
          <div style={{ fontSize:12, color:"#94a3b8" }}>
            Generated by <strong style={{ color:"#475569" }}>Karobar</strong> · {new Date().toLocaleDateString()}
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:14, fontWeight:700, color:"#0f172a", marginBottom:2 }}>
              Thank you for your business!
            </div>
            <div style={{ fontSize:11.5, color:"#94a3b8" }}>
              {settings.phone && `📞 ${settings.phone}`}
              {settings.phone && settings.address && "  ·  "}
              {settings.address && `📍 ${settings.address}`}
            </div>
          </div>
          <div style={{ fontSize:12, color:"#94a3b8", textAlign:"right" }}>
            <strong style={{ color:"#475569" }}>{invNumber}</strong>
          </div>
        </div>

      </div>

      {/* ══ RETURN MODAL ══════════════════════════════ */}
      {returnModal && returnProduct && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.45)',
          zIndex:1050, display:'flex', alignItems:'center', justifyContent:'center', padding:16,
        }}>
          <div style={{
            background:'#fff', borderRadius:12, width:'100%', maxWidth:440,
            boxShadow:'0 24px 64px rgba(0,0,0,0.2)',
          }}>
            {/* Header */}
            <div style={{
              display:'flex', alignItems:'center', gap:12,
              padding:'15px 20px', borderBottom:'1px solid #e2e8f0',
            }}>
              <div style={{
                width:38, height:38, borderRadius:9,
                background:'#fffbeb', display:'grid', placeItems:'center',
              }}>
                <i className="ti ti-arrow-back-up" style={{ fontSize:18, color:'#d97706' }} />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:14, color:'#0f172a' }}>Process Return</div>
                <div style={{ fontSize:12, color:'#94a3b8' }}>Return item from this invoice</div>
              </div>
              <button onClick={() => { setReturnModal(false); setReturnError(''); }}
                style={{ border:'none', background:'none', cursor:'pointer', fontSize:22, color:'#94a3b8', lineHeight:1, padding:0 }}>
                ×
              </button>
            </div>

            {/* Body */}
            <div style={{ padding:'18px 20px' }}>

              {/* Product info strip */}
              <div style={{
                display:'flex', alignItems:'center', gap:10,
                background:'#f8fafc', border:'1px solid #e2e8f0',
                borderRadius:8, padding:'10px 13px', marginBottom:16,
              }}>
                <div style={{
                  width:34, height:34, borderRadius:8,
                  background:'#eff6ff', display:'grid', placeItems:'center',
                  flexShrink:0,
                }}>
                  <i className="ti ti-box" style={{ fontSize:16, color:'#2563eb' }} />
                </div>
                <div>
                  <div style={{ fontWeight:700, fontSize:13, color:'#0f172a' }}>{returnProduct.name}</div>
                  <div style={{ fontSize:11.5, color:'#94a3b8' }}>Select quantity to return</div>
                </div>
              </div>

              {/* Quantity */}
              <div style={{ marginBottom:14 }}>
                <label style={{ display:'block', fontSize:11.5, fontWeight:600, color:'#475569', marginBottom:5 }}>
                  Return quantity <span style={{ color:'#dc2626' }}>*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  className="kb-input"
                  placeholder="1"
                  value={returnQty}
                  onChange={e => setReturnQty(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Reason */}
              <div style={{ marginBottom:20 }}>
                <label style={{ display:'block', fontSize:11.5, fontWeight:600, color:'#475569', marginBottom:5 }}>
                  Reason for return
                </label>
                <select
                  className="kb-input"
                  value={returnReason}
                  onChange={e => setReturnReason(e.target.value)}
                >
                  <option value="">Select a reason…</option>
                  <option value="Defective product">Defective product</option>
                  <option value="Wrong item delivered">Wrong item delivered</option>
                  <option value="Customer changed mind">Customer changed mind</option>
                  <option value="Size / fit issue">Size / fit issue</option>
                  <option value="Damaged in delivery">Damaged in delivery</option>
                  <option value="Other">Other</option>
                </select>
                {returnReason === 'Other' && (
                  <input
                    className="kb-input"
                    style={{ marginTop:8 }}
                    placeholder="Describe the reason…"
                    value=""
                    onChange={e => setReturnReason(e.target.value)}
                  />
                )}
              </div>

              {/* Inline error */}
              {returnError && (
                <div style={{
                  display:'flex', alignItems:'flex-start', gap:8,
                  background:'#fef2f2', border:'1px solid #fca5a5',
                  borderRadius:7, padding:'10px 13px', marginBottom:12,
                  fontSize:12.5, color:'#991b1b',
                }}>
                  <i className="ti ti-alert-circle" style={{ fontSize:16, flexShrink:0, marginTop:1 }} />
                  <span>{returnError}</span>
                </div>
              )}

              {/* Warning note */}
              <div style={{
                display:'flex', alignItems:'flex-start', gap:7,
                background:'#fffbeb', border:'1px solid #fcd34d',
                borderRadius:7, padding:'9px 12px', marginBottom:18,
                fontSize:12, color:'#92400e',
              }}>
                <i className="ti ti-alert-triangle" style={{ fontSize:14, flexShrink:0, marginTop:1 }} />
                Returning items will restore stock. This action cannot be undone.
              </div>

              {/* Actions */}
              <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                <button
                  style={{
                    padding:'7px 14px', borderRadius:6, border:'1px solid #cbd5e1',
                    background:'#fff', fontSize:12.5, fontWeight:600,
                    cursor:'pointer', fontFamily:'inherit', color:'#475569',
                  }}
                  onClick={() => setReturnModal(false)}
                >
                  Cancel
                </button>
                <button
                  style={{
                    padding:'7px 16px', borderRadius:6, border:'none',
                    background: returnSaving ? '#d97706aa' : '#d97706',
                    color:'#fff', fontSize:12.5, fontWeight:700,
                    cursor:'pointer', fontFamily:'inherit',
                    display:'flex', alignItems:'center', gap:6,
                  }}
                  onClick={submitReturn}
                  disabled={returnSaving}
                >
                  {returnSaving
                    ? <><div style={{ width:13, height:13, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin .7s linear infinite' }} /> Processing…</>
                    : <><i className="ti ti-arrow-back-up" /> Confirm Return</>
                  }
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
          .kb-shell { position: static !important; }
          .kb-sidebar, .kb-topbar { display: none !important; }
          .kb-main { height: auto !important; overflow: visible !important; }
          .kb-content { overflow: visible !important; padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}