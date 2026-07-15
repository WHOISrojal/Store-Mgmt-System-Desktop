import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function CustomerLedger() {
  const { customerId } = useParams();
  const navigate       = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [sales,        setSales]        = useState([]);
  const [amount,       setAmount]       = useState("");
  const [note,         setNote]         = useState("");
  const [payMethod,    setPayMethod]    = useState("CASH");
  const [saving,       setSaving]       = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [txRes, saleRes] = await Promise.all([
        api.get(`/customer-transactions/${customerId}`),
        api.get(`/sales/customer/${customerId}`),
      ]);
      setTransactions(txRes.data);
      setSales(saleRes.data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const recordPayment = async () => {
    if (!amount) return alert("Enter payment amount");
    try {
      setSaving(true);
      await api.post("/customer-transactions/payment", {
        customerId, amount: Number(amount), note, paymentMethod: payMethod,
      });
      setAmount(""); setNote(""); setPayMethod("CASH"); setShowPayModal(false);
      fetchData();
    } catch(e) { alert(e?.response?.data?.message || "Failed to record payment"); }
    finally { setSaving(false); }
  };

  // Go back to the previous page in this tab's history. If this tab has no
  // previous entry (e.g. the ledger was opened directly or in a new tab),
  // navigate(-1) has nothing to go back to and silently does nothing —
  // fall back to the Customers list instead.
  const goBack = () => {
    if (window.history.length > 2) navigate(-1);
    else navigate("/customers");
  };

  const customer      = transactions.length > 0 ? transactions[0].customer : null;
  const currentDue    = customer?.dueAmount ?? 0;
  const totalPurchases = transactions.filter(t => t.type === "PURCHASE").reduce((s,t) => s + t.amount, 0);
  const totalPayments  = transactions.filter(t => t.type === "PAYMENT").reduce((s,t)  => s + t.amount, 0);

  /* avatar color based on name */
  const avatarColors = [
    ["#eff6ff","#2563eb"],["#ecfdf5","#059669"],["#fdf4ff","#9333ea"],
    ["#fff7ed","#ea580c"],["#fef2f2","#dc2626"],
  ];
  const [abg, afg] = customer
    ? avatarColors[customer.name.charCodeAt(0) % avatarColors.length]
    : ["#f1f5f9","#94a3b8"];

  return (
    <div>

      {/* ── Back + header ──────────────────────────────── */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
        <button onClick={goBack} className="kb-btn kb-btn-outline" style={{ padding:"6px 11px" }}>
          <i className="ti ti-arrow-left" />
        </button>
        <div>
          <h1 className="kb-page-title" style={{ fontSize:18 }}>Customer Ledger</h1>
          {customer && (
            <div style={{ fontSize:12.5, color:"var(--t3)", marginTop:1 }}>
              Transaction history for {customer.name}
            </div>
          )}
        </div>
      </div>

      {/* ── Customer info + stat cards ─────────────────── */}
      {customer && (
        <div style={{ display:"grid", gridTemplateColumns:"auto 1fr 1fr 1fr", gap:12, marginBottom:18, alignItems:"stretch" }}>

          {/* Customer card */}
          <div className="kb-card" style={{ display:"flex", alignItems:"center", gap:14, minWidth:230 }}>
            <div style={{
              width:52, height:52, borderRadius:"50%",
              background:abg, color:afg,
              display:"grid", placeItems:"center",
              fontSize:20, fontWeight:800, flexShrink:0,
              border:`2px solid ${afg}33`,
            }}>
              {customer.name.slice(0,2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight:700, fontSize:15, color:"var(--t1)", marginBottom:3 }}>{customer.name}</div>
              {customer.companyName && (
                <div style={{ fontSize:12.5, color:"var(--t2)", display:"flex", alignItems:"center", gap:5, marginBottom:2 }}>
                  <i className="ti ti-building" style={{ fontSize:13, color:"var(--t3)" }} />
                  {customer.companyName}
                </div>
              )}
              {customer.phone && (
                <div style={{ fontSize:12.5, color:"var(--t2)", display:"flex", alignItems:"center", gap:5 }}>
                  <i className="ti ti-phone" style={{ fontSize:13, color:"var(--t3)" }} />
                  {customer.phone}
                </div>
              )}
              {customer.address && (
                <div style={{ fontSize:12.5, color:"var(--t2)", display:"flex", alignItems:"center", gap:5, marginTop:2 }}>
                  <i className="ti ti-map-pin" style={{ fontSize:13, color:"var(--t3)" }} />
                  {customer.address}
                </div>
              )}
            </div>
          </div>

          {/* Total purchases */}
          <div className="kb-stat-card blue">
            <div className="kb-stat-top">
              <div className="kb-stat-label">Total purchases</div>
              <div className="kb-stat-icon blue"><i className="ti ti-receipt" /></div>
            </div>
            <div className="kb-stat-value">Rs. {totalPurchases.toLocaleString()}</div>
          </div>

          {/* Total payments */}
          <div className="kb-stat-card green">
            <div className="kb-stat-top">
              <div className="kb-stat-label">Total payments</div>
              <div className="kb-stat-icon green"><i className="ti ti-cash" /></div>
            </div>
            <div className="kb-stat-value">Rs. {totalPayments.toLocaleString()}</div>
          </div>

          {/* Current due */}
          <div className={`kb-stat-card ${currentDue > 0 ? "red" : "green"}`}>
            <div className="kb-stat-top">
              <div className="kb-stat-label">Current due</div>
              <div className={`kb-stat-icon ${currentDue > 0 ? "red" : "green"}`}>
                <i className={`ti ${currentDue > 0 ? "ti-alert-circle" : "ti-circle-check"}`} />
              </div>
            </div>
            <div className={`kb-stat-value ${currentDue > 0 ? "red" : "green"}`}>
              Rs. {currentDue.toLocaleString()}
            </div>
          </div>

        </div>
      )}

      {/* ── Record payment button ──────────────────────── */}
      {currentDue > 0 && (
        <div style={{ marginBottom:18, display:"flex", justifyContent:"flex-end" }}>
          <button className="kb-btn kb-btn-success" style={{ padding:"8px 18px", fontSize:13 }}
            onClick={() => setShowPayModal(true)}>
            <i className="ti ti-cash" /> Receive Payment
          </button>
        </div>
      )}

      {/* ── Recent invoices ────────────────────────────── */}
      <div className="kb-card" style={{ marginBottom:18 }}>
        <div className="kb-card-header">
          <span className="kb-card-title">
            <i className="ti ti-file-invoice" style={{ color:"var(--blue-m)" }} />
            Recent invoices
          </span>
          <span style={{ fontSize:12, color:"var(--t3)" }}>{sales.length} invoices</span>
        </div>

        {sales.length === 0 ? (
          <div style={{ textAlign:"center", padding:"28px 0", color:"var(--t3)" }}>
            <i className="ti ti-file-off" style={{ fontSize:30, display:"block", marginBottom:8 }} />
            <div style={{ fontSize:13 }}>No invoices yet</div>
          </div>
        ) : (
          <table className="kb-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Date</th>
                <th>Payment</th>
                <th className="text-end">Amount</th>
                <th className="text-end">View</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(sale => (
                <tr key={sale._id}>
                  <td>
                    <span style={{ fontFamily:"monospace", fontSize:12.5, fontWeight:600, color:"var(--blue-m)" }}>
                      INV-{sale._id.slice(-6).toUpperCase()}
                    </span>
                  </td>
                  <td style={{ fontSize:12.5 }}>
                    {new Date(sale.createdAt).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })}
                  </td>
                  <td>
                    <span className={`kb-badge ${sale.paymentType === "CASH" ? "green" : sale.paymentType === "CREDIT" ? "amber" : "blue"}`}>
                      {sale.paymentType}
                    </span>
                  </td>
                  <td className="text-end" style={{ fontWeight:700, color:"var(--t1)" }}>
                    Rs. {sale.totalAmount?.toLocaleString()}
                  </td>
                  <td className="text-end">
                    {/* Opens in the SAME tab (in-app navigation) so the invoice's
                        own Back button has a real history entry to return to. */}
                    <Link to={`/invoice/${sale._id}`}
                      className="kb-btn kb-btn-outline" style={{ padding:"4px 10px", fontSize:12 }}>
                      <i className="ti ti-file-invoice" /> View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Transaction history ────────────────────────── */}
      <div className="kb-card">
        <div className="kb-card-header">
          <span className="kb-card-title">
            <i className="ti ti-history" style={{ color:"var(--blue-m)" }} />
            Transaction history
          </span>
          <span style={{ fontSize:12, color:"var(--t3)" }}>{transactions.length} transactions</span>
        </div>

        {loading ? (
          <div>
            {[...Array(4)].map((_,i) => (
              <div key={i} style={{ display:"flex", gap:12, padding:"12px 0", borderBottom:"1px solid #f1f5f9" }}>
                <div className="kb-skeleton" style={{ height:11, width:"15%", borderRadius:5 }} />
                <div className="kb-skeleton" style={{ height:11, width:"10%", borderRadius:5 }} />
                <div className="kb-skeleton" style={{ height:11, width:"15%", borderRadius:5 }} />
                <div className="kb-skeleton" style={{ height:11, flex:1, borderRadius:5 }} />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ textAlign:"center", padding:"40px 0", color:"var(--t3)" }}>
            <i className="ti ti-history" style={{ fontSize:36, display:"block", marginBottom:10 }} />
            <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>No transactions yet</div>
            <div style={{ fontSize:12.5 }}>Transactions will appear once recorded</div>
          </div>
        ) : (
          <table className="kb-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Type</th>
                <th className="text-end">Amount</th>
                <th>Note</th>
                <th className="text-end">Balance after</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => {
                const sorted     = [...transactions].sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
                const sortedIdx  = sorted.findIndex(t => t._id === tx._id);
                const balance    = sorted
                  .slice(0, sortedIdx + 1)
                  .reduce((s,t) => t.type === "PURCHASE" ? s + t.amount : s - t.amount, 0);

                return (
                  <tr key={tx._id}>
                    <td style={{ whiteSpace:"nowrap" }}>
                      <div style={{ fontSize:12.5, fontWeight:600, color:"var(--t1)" }}>
                        {new Date(tx.createdAt).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })}
                      </div>
                      <div style={{ fontSize:11, color:"var(--t3)" }}>
                        {new Date(tx.createdAt).toLocaleTimeString("en-US", { hour:"2-digit", minute:"2-digit" })}
                      </div>
                    </td>
                    <td>
                      <span className={`kb-badge ${tx.type === "PURCHASE" ? "blue" : "green"}`}>
                        <i className={`ti ${tx.type === "PURCHASE" ? "ti-receipt" : "ti-cash"}`} style={{ fontSize:10 }} />
                        {tx.type}
                      </span>
                      {tx.type === "PAYMENT" && tx.paymentMethod && (
                        <span style={{
                          marginLeft:6, fontSize:10.5, fontWeight:700,
                          color:"var(--t3)", textTransform:"capitalize",
                        }}>
                          via {tx.paymentMethod.toLowerCase()}
                        </span>
                      )}
                    </td>
                    <td className="text-end">
                      <span style={{ fontWeight:700, fontSize:13.5, color: tx.type === "PURCHASE" ? "var(--red-m)" : "var(--green-m)" }}>
                        {tx.type === "PURCHASE" ? "+" : "−"} Rs. {tx.amount.toLocaleString()}
                      </span>
                    </td>
                    <td style={{ color:"var(--t2)", fontSize:12.5 }}>
                      {tx.note || <span style={{ color:"var(--t3)" }}>—</span>}
                    </td>
                    <td className="text-end">
                      <span style={{ fontWeight:600, fontSize:12.5, color: balance > 0 ? "var(--red-m)" : "var(--green-m)" }}>
                        Rs. {Math.abs(balance).toLocaleString()}
                        <span style={{ fontSize:10, marginLeft:4, opacity:.7 }}>
                          {balance > 0 ? "due" : "overpaid"}
                        </span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ══ PAYMENT MODAL ══════════════════════════════ */}
      {showPayModal && (
        <div style={{
          position:"fixed", inset:0, background:"rgba(0,0,0,0.45)",
          zIndex:1050, display:"flex", alignItems:"center", justifyContent:"center", padding:16,
        }}>
          <div style={{
            background:"#fff", borderRadius:12, width:"100%", maxWidth:480,
            boxShadow:"0 24px 64px rgba(0,0,0,0.2)",
          }}>
            {/* Header */}
            <div style={{
              display:"flex", alignItems:"center", gap:12,
              padding:"16px 20px", borderBottom:"1px solid #e2e8f0",
            }}>
              <div style={{
                width:38, height:38, borderRadius:9,
                background:"var(--green-b)", display:"grid", placeItems:"center",
              }}>
                <i className="ti ti-cash" style={{ fontSize:18, color:"var(--green-m)" }} />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:14, color:"#0f172a" }}>Receive Payment</div>
                <div style={{ fontSize:12, color:"var(--t3)" }}>From {customer?.name}</div>
              </div>
              <button onClick={() => { setShowPayModal(false); setAmount(""); setNote(""); setPayMethod("CASH"); }}
                style={{ border:"none", background:"none", cursor:"pointer", fontSize:22, color:"#94a3b8", lineHeight:1, padding:0 }}>
                ×
              </button>
            </div>

            {/* Body */}
            <div style={{ padding:"18px 20px" }}>

              {/* Customer + due strip */}
              <div style={{
                display:"flex", alignItems:"center", justifyContent:"space-between",
                background:"var(--bg-surface)", border:"1px solid #e2e8f0",
                borderRadius:"var(--r)", padding:"11px 14px", marginBottom:16,
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{
                    width:36, height:36, borderRadius:"50%",
                    background:abg, color:afg,
                    display:"grid", placeItems:"center",
                    fontSize:13, fontWeight:800,
                  }}>
                    {customer?.name?.slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:13, color:"var(--t1)" }}>{customer?.name}</div>
                    {customer?.phone && <div style={{ fontSize:11.5, color:"var(--t3)" }}>{customer.phone}</div>}
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:11, color:"var(--t3)", marginBottom:1 }}>Outstanding due</div>
                  <div style={{ fontSize:15, fontWeight:800, color:"var(--red-m)" }}>
                    Rs. {currentDue.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Amount */}
              <div className="kb-form-group">
                <label className="kb-label">Payment amount (Rs.) <span style={{ color:"var(--red-m)" }}>*</span></label>
                <div style={{ position:"relative" }}>
                  <span style={{
                    position:"absolute", left:11, top:"50%", transform:"translateY(-50%)",
                    fontSize:12.5, fontWeight:600, color:"var(--t3)",
                  }}>Rs.</span>
                  <input type="number" className="kb-input" style={{ paddingLeft:36 }}
                    placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} autoFocus />
                </div>
                {amount && Number(amount) > 0 && (
                  <div style={{ marginTop:5, fontSize:12, color:"var(--green-m)", display:"flex", alignItems:"center", gap:4 }}>
                    <i className="ti ti-calculator" style={{ fontSize:13 }} />
                    Remaining after: <strong>Rs. {Math.max(0, currentDue - Number(amount)).toLocaleString()}</strong>
                  </div>
                )}
              </div>

              {/* Payment method */}
              <div className="kb-form-group">
                <label className="kb-label">Received via</label>
                <div style={{ display:"flex", gap:8 }}>
                  {["CASH", "ONLINE"].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPayMethod(m)}
                      style={{
                        flex:1, padding:"8px 0", fontSize:12.5, fontWeight:700,
                        borderRadius:8, cursor:"pointer", fontFamily:"inherit",
                        border: payMethod === m ? "1.5px solid var(--green-m)" : "1px solid #e2e8f0",
                        background: payMethod === m ? "var(--green-b)" : "#fff",
                        color: payMethod === m ? "var(--green-m)" : "var(--t2)",
                      }}
                    >
                      <i className={`ti ${m === "CASH" ? "ti-cash" : "ti-credit-card"}`} style={{ marginRight:5 }} />
                      {m === "CASH" ? "Cash" : "Online"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div className="kb-form-group">
                <label className="kb-label">Note (optional)</label>
                <input className="kb-input" placeholder="e.g. Cash received, Bank transfer…"
                  value={note} onChange={e => setNote(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && recordPayment()} />
              </div>

              {/* Quick amounts */}
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:11, color:"var(--t3)", marginBottom:7, fontWeight:600, textTransform:"uppercase", letterSpacing:".05em" }}>
                  Quick amounts
                </div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {[currentDue, Math.round(currentDue*0.5), Math.round(currentDue*0.25), 5000, 2000, 1000]
                    .filter((v,i,a) => v > 0 && a.indexOf(v) === i)
                    .slice(0,5)
                    .map(amt => (
                      <button key={amt} onClick={() => setAmount(String(amt))} style={{
                        padding:"5px 12px", fontSize:12, fontWeight:600,
                        border:"1px solid #e2e8f0", borderRadius:6,
                        background: Number(amount) === amt ? "var(--green-b)" : "#fff",
                        color: Number(amount) === amt ? "var(--green-m)" : "var(--t2)",
                        cursor:"pointer", fontFamily:"inherit", transition:"all .1s",
                      }}>
                        Rs. {amt.toLocaleString()}
                      </button>
                    ))
                  }
                </div>
              </div>

              {/* Actions */}
              <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
                <button className="kb-btn kb-btn-outline"
                  onClick={() => { setShowPayModal(false); setAmount(""); setNote(""); setPayMethod("CASH"); }}>
                  Cancel
                </button>
                <button className="kb-btn kb-btn-success" onClick={recordPayment} disabled={saving}>
                  {saving
                    ? <><div style={{ width:13, height:13, border:"2px solid rgba(255,255,255,0.4)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin .7s linear infinite" }} /> Saving…</>
                    : <><i className="ti ti-check" /> Save Payment</>
                  }
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}