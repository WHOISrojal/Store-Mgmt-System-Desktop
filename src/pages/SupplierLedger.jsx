import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function SupplierLedger() {
  const { supplierId } = useParams();
  const navigate       = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount]             = useState("");
  const [note,   setNote]               = useState("");
  const [saving, setSaving]             = useState(false);
  const [loading, setLoading]           = useState(true);
  const [showPayForm, setShowPayForm]   = useState(false);

  useEffect(() => { fetchTransactions(); }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const r = await api.get(`/supplier-transactions/${supplierId}`);
      setTransactions(r.data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const recordPayment = async () => {
    if (!amount) return alert("Enter payment amount");
    try {
      setSaving(true);
      await api.post("/supplier-transactions/payment", {
        supplierId, amount: Number(amount), note,
      });
      setAmount(""); setNote(""); setShowPayForm(false);
      fetchTransactions();
    } catch(e) { alert("Failed to record payment"); }
    finally { setSaving(false); }
  };

  const supplier = transactions.length > 0 ? transactions[0].supplier : null;

  /* ── derived stats ─────────────────────────────────── */
  const totalPurchases = transactions
    .filter(t => t.type === "PURCHASE")
    .reduce((s, t) => s + t.amount, 0);

  const totalPaid = transactions
    .filter(t => t.type === "PAYMENT")
    .reduce((s, t) => s + t.amount, 0);

  const currentDue = supplier?.dueAmount ?? 0;

  return (
    <div>

      {/* ── Back + header ───────────────────────────── */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
        <button
          onClick={() => navigate(-1)}
          className="kb-btn kb-btn-outline"
          style={{ padding:"6px 11px" }}
        >
          <i className="ti ti-arrow-left" />
        </button>
        <div>
          <h1 className="kb-page-title" style={{ fontSize:18 }}>
            Supplier Ledger
          </h1>
          {supplier && (
            <div style={{ fontSize:12.5, color:"var(--t3)", marginTop:1 }}>
              Transaction history for {supplier.name}
            </div>
          )}
        </div>
      </div>

      {/* ── Supplier info + stats ────────────────────── */}
      {supplier && (
        <div style={{ display:"grid", gridTemplateColumns:"auto 1fr 1fr 1fr", gap:12, marginBottom:18, alignItems:"stretch" }}>

          {/* Supplier card */}
          <div className="kb-card" style={{ display:"flex", alignItems:"center", gap:14, minWidth:240 }}>
            <div style={{
              width:52, height:52, borderRadius:12,
              background:"linear-gradient(135deg,#f59e0b,#d97706)",
              display:"grid", placeItems:"center",
              fontSize:20, fontWeight:800, color:"#fff", flexShrink:0,
            }}>
              {supplier.name.slice(0,1).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight:700, fontSize:15, color:"var(--t1)", marginBottom:3 }}>{supplier.name}</div>
              {supplier.phone && (
                <div style={{ fontSize:12.5, color:"var(--t2)", display:"flex", alignItems:"center", gap:5 }}>
                  <i className="ti ti-phone" style={{ fontSize:13, color:"var(--t3)" }} />
                  {supplier.phone}
                </div>
              )}
              {supplier.address && (
                <div style={{ fontSize:12.5, color:"var(--t2)", display:"flex", alignItems:"center", gap:5, marginTop:2 }}>
                  <i className="ti ti-map-pin" style={{ fontSize:13, color:"var(--t3)" }} />
                  {supplier.address}
                </div>
              )}
            </div>
          </div>

          {/* Total purchases */}
          <div className="kb-stat-card blue">
            <div className="kb-stat-top">
              <div className="kb-stat-label">Total purchases</div>
              <div className="kb-stat-icon blue"><i className="ti ti-shopping-cart" /></div>
            </div>
            <div className="kb-stat-value">Rs. {totalPurchases.toLocaleString()}</div>
          </div>

          {/* Total paid */}
          <div className="kb-stat-card green">
            <div className="kb-stat-top">
              <div className="kb-stat-label">Total paid</div>
              <div className="kb-stat-icon green"><i className="ti ti-cash" /></div>
            </div>
            <div className="kb-stat-value">Rs. {totalPaid.toLocaleString()}</div>
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

      {/* ── Record payment button (only shows if due > 0) ── */}
      {currentDue > 0 && (
        <div style={{ marginBottom:18, display:"flex", justifyContent:"flex-end" }}>
          <button
            className="kb-btn kb-btn-success"
            style={{ padding:"8px 18px", fontSize:13 }}
            onClick={() => setShowPayForm(true)}
          >
            <i className="ti ti-cash" /> Record Payment
          </button>
        </div>
      )}

      {/* ── Payment modal ────────────────────────────── */}
      {showPayForm && (
        <div style={{
          position:"fixed", inset:0, background:"rgba(0,0,0,0.45)",
          zIndex:1050, display:"flex", alignItems:"center", justifyContent:"center", padding:16,
        }}>
          <div style={{
            background:"#fff", borderRadius:12, width:"100%", maxWidth:480,
            boxShadow:"0 24px 64px rgba(0,0,0,0.2)",
          }}>
            {/* Modal header */}
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
                <div style={{ fontWeight:700, fontSize:14, color:"#0f172a" }}>Record Payment</div>
                <div style={{ fontSize:12, color:"var(--t3)" }}>Payment to {supplier?.name}</div>
              </div>
              <button onClick={() => { setShowPayForm(false); setAmount(""); setNote(""); }}
                style={{ border:"none", background:"none", cursor:"pointer", fontSize:22, color:"#94a3b8", lineHeight:1, padding:0 }}>
                ×
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding:"18px 20px" }}>

              {/* Supplier + due strip */}
              <div style={{
                display:"flex", alignItems:"center", justifyContent:"space-between",
                background:"var(--bg-surface)", border:"1px solid #e2e8f0",
                borderRadius:"var(--r)", padding:"11px 14px", marginBottom:16,
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{
                    width:36, height:36, borderRadius:8,
                    background:"linear-gradient(135deg,#f59e0b,#d97706)",
                    display:"grid", placeItems:"center",
                    fontSize:14, fontWeight:800, color:"#fff",
                  }}>
                    {supplier?.name?.slice(0,1).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:13, color:"var(--t1)" }}>{supplier?.name}</div>
                    {supplier?.phone && <div style={{ fontSize:11.5, color:"var(--t3)" }}>{supplier.phone}</div>}
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:11, color:"var(--t3)", marginBottom:1 }}>Outstanding due</div>
                  <div style={{ fontSize:15, fontWeight:800, color:"var(--red-m)" }}>
                    Rs. {currentDue.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Amount field */}
              <div className="kb-form-group">
                <label className="kb-label">
                  Payment amount (Rs.) <span style={{ color:"var(--red-m)" }}>*</span>
                </label>
                <div style={{ position:"relative" }}>
                  <span style={{
                    position:"absolute", left:11, top:"50%", transform:"translateY(-50%)",
                    fontSize:12.5, fontWeight:600, color:"var(--t3)",
                  }}>Rs.</span>
                  <input
                    type="number"
                    className="kb-input"
                    style={{ paddingLeft:36 }}
                    placeholder="0"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    autoFocus
                  />
                </div>
                {amount && Number(amount) > 0 && (
                  <div style={{ marginTop:5, fontSize:12, color:"var(--green-m)", display:"flex", alignItems:"center", gap:4 }}>
                    <i className="ti ti-calculator" style={{ fontSize:13 }} />
                    Remaining after: <strong>Rs. {Math.max(0, currentDue - Number(amount)).toLocaleString()}</strong>
                  </div>
                )}
              </div>

              {/* Note field */}
              <div className="kb-form-group">
                <label className="kb-label">Note (optional)</label>
                <input
                  className="kb-input"
                  placeholder="e.g. Cash payment, Bank transfer…"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && recordPayment()}
                />
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
                      <button key={amt} onClick={() => setAmount(String(amt))}
                        style={{
                          padding:"5px 12px", fontSize:12, fontWeight:600,
                          border:"1px solid #e2e8f0", borderRadius:6,
                          background: Number(amount) === amt ? "var(--green-b)" : "#fff",
                          color: Number(amount) === amt ? "var(--green-m)" : "var(--t2)",
                          cursor:"pointer", fontFamily:"inherit",
                          transition:"all .1s",
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
                  onClick={() => { setShowPayForm(false); setAmount(""); setNote(""); }}>
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

      {/* ── Transaction history ──────────────────────── */}
      <div className="kb-card">
        <div className="kb-card-header">
          <span className="kb-card-title">
            <i className="ti ti-history" style={{ color:"var(--blue-m)" }} />
            Transaction history
          </span>
          <span style={{ fontSize:12, color:"var(--t3)" }}>
            {transactions.length} transactions
          </span>
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
            <div style={{ fontSize:12.5 }}>Transactions will appear here once recorded</div>
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
              {transactions.map((tx, idx) => {
                /* running balance — newest first so reverse */
                const sorted = [...transactions].sort(
                  (a,b) => new Date(a.createdAt) - new Date(b.createdAt)
                );
                const sortedIdx = sorted.findIndex(t => t._id === tx._id);
                const balance = sorted
                  .slice(0, sortedIdx + 1)
                  .reduce((s, t) => t.type === "PURCHASE" ? s + t.amount : s - t.amount, 0);

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
                      <span className={`kb-badge ${tx.type === "PURCHASE" ? "amber" : "green"}`}>
                        <i className={`ti ${tx.type === "PURCHASE" ? "ti-shopping-cart" : "ti-cash"}`} style={{ fontSize:10 }} />
                        {tx.type}
                      </span>
                    </td>
                    <td className="text-end">
                      <span style={{
                        fontWeight:700, fontSize:13.5,
                        color: tx.type === "PURCHASE" ? "var(--red-m)" : "var(--green-m)",
                      }}>
                        {tx.type === "PURCHASE" ? "+" : "−"} Rs. {tx.amount.toLocaleString()}
                      </span>
                    </td>
                    <td style={{ color:"var(--t2)", fontSize:12.5 }}>
                      {tx.note || <span style={{ color:"var(--t3)" }}>—</span>}
                    </td>
                    <td className="text-end">
                      <span style={{
                        fontWeight:600, fontSize:12.5,
                        color: balance > 0 ? "var(--red-m)" : "var(--green-m)",
                      }}>
                        Rs. {Math.abs(balance).toLocaleString()}
                        {balance > 0
                          ? <span style={{ fontSize:10, marginLeft:4, opacity:.7 }}>due</span>
                          : <span style={{ fontSize:10, marginLeft:4, opacity:.7 }}>overpaid</span>
                        }
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}