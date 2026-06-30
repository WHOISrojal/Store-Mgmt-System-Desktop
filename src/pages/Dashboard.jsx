import { useEffect, useState } from "react";
import api from "../services/api";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  PointElement, LineElement,
  Tooltip, Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

/* ── Sales chart ─────────────────────────────────────────── */
function SalesChart({ last7DaysSales }) {
  if (!last7DaysSales?.length) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:160, color:"var(--t3)", fontSize:13 }}>
      No sales data for the last 7 days
    </div>
  );

  const labels = last7DaysSales.map(d =>
    new Date(d.label).toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" })
  );
  const values = last7DaysSales.map(d => d.sales);
  const max    = Math.max(...values, 1);
  const hasData = values.some(v => v > 0);

  const data = {
    labels,
    datasets: [{
      data: values,
      fill: true,
      tension: 0.4,
      borderColor: "#2563eb",
      backgroundColor: (ctx) => {
        const canvas = ctx.chart.canvas;
        const gradient = canvas.getContext("2d").createLinearGradient(0, 0, 0, 180);
        gradient.addColorStop(0, "rgba(37,99,235,0.15)");
        gradient.addColorStop(1, "rgba(37,99,235,0.00)");
        return gradient;
      },
      pointBackgroundColor: "#2563eb",
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
      pointRadius: hasData ? 4 : 0,
      pointHoverRadius: 6,
      borderWidth: 2,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0f172a",
        titleColor: "#94a3b8",
        bodyColor: "#f1f5f9",
        padding: 12,
        cornerRadius: 8,
        callbacks: { label: ctx => `  Rs. ${ctx.raw.toLocaleString()}` },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font:{ size:11 }, color:"#94a3b8" },
        border: { display: false },
      },
      y: {
        grid: { color:"#f1f5f9", drawBorder: false },
        ticks: {
          font:{ size:11 }, color:"#94a3b8",
          callback: v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v,
        },
        border: { display: false },
        min: 0,
        suggestedMax: max * 1.25,
      },
    },
  };

  return (
    <div style={{ height: 180 }}>
      <Line data={data} options={options} />
    </div>
  );
}

/* ── Stat card ───────────────────────────────────────────── */
function StatCard({ label, value, icon, color, valueColor }) {
  return (
    <div className={`kb-stat-card ${color}`}>
      <div className="kb-stat-top">
        <div className="kb-stat-label">{label}</div>
        <div className={`kb-stat-icon ${color}`}><i className={`ti ${icon}`} /></div>
      </div>
      <div className={`kb-stat-value ${valueColor || ""}`}>{value}</div>
    </div>
  );
}

/* ── Section heading ─────────────────────────────────────── */
function SectionHead({ icon, title, color = "var(--t3)" }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 7,
      fontSize: 11, fontWeight: 700, color: "var(--t3)",
      textTransform: "uppercase", letterSpacing: ".08em",
      marginBottom: 10,
    }}>
      <i className={`ti ${icon}`} style={{ fontSize: 13, color }} />
      {title}
    </div>
  );
}

/* ── Dashboard ───────────────────────────────────────────── */
export default function Dashboard() {
  const [data, setData] = useState({
    totalProducts:0, totalCustomers:0, totalCustomerDue:0,
    totalExpenses:0, totalSales:0, totalProfit:0,
    todaySales:0, todayProfit:0, todayExpenses:0, todayNetProfit:0,
    lowStockProducts:[], topSellingProducts:[], topProfitableProducts:[],
    totalSuppliers:0, totalSupplierDue:0, inventoryValue:0,
    todayCashSales:0, todayCreditSales:0, todayCustomerPayments:0, todayNetCash:0,
    pendingChequeAmount:0, todayCheques:[], upcomingCheques:[],
    overdueCheques:[], clearedChequeAmount:0, bouncedChequeAmount:0,
    overdueChequeAmount:0, topCategories:[], last7DaysSales:[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch(); }, []);

  const fetch = async () => {
    try { setLoading(true); const r = await api.get("/dashboard"); setData(r.data); }
    catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fmt = n => `Rs. ${Number(n||0).toLocaleString()}`;

  if (loading) return (
    <div>
      <div className="kb-stat-grid" style={{ marginBottom:18 }}>
        {[...Array(8)].map((_,i) => (
          <div key={i} className="kb-stat-card" style={{ minHeight:90 }}>
            <div className="kb-skeleton" style={{ height:10, width:"50%", marginBottom:14 }} />
            <div className="kb-skeleton" style={{ height:24, width:"70%" }} />
          </div>
        ))}
      </div>
      <div className="kb-row-2">
        {[...Array(2)].map((_,i) => (
          <div key={i} className="kb-card" style={{ minHeight:160 }}>
            <div className="kb-skeleton" style={{ height:13, width:"40%", marginBottom:18 }} />
            <div className="kb-skeleton" style={{ height:10, marginBottom:10 }} />
            <div className="kb-skeleton" style={{ height:10, width:"80%", marginBottom:10 }} />
            <div className="kb-skeleton" style={{ height:10, width:"60%" }} />
          </div>
        ))}
      </div>
    </div>
  );

  const weekTotal = data.last7DaysSales?.reduce((s,d) => s+d.sales, 0) || 0;

  return (
    <div>

      {/* ══ ALERTS ══════════════════════════════════════ */}
      {data.overdueCheques?.length > 0 && (
        <div className="kb-alert danger">
          <div className="kb-alert-title">
            <i className="ti ti-alert-circle" />
            {data.overdueCheques.length} overdue cheque{data.overdueCheques.length > 1 ? "s" : ""}
          </div>
          {data.overdueCheques.map(c => (
            <div key={c._id} style={{ fontSize:12.5, display:"flex", gap:6, alignItems:"center" }}>
              <a href={`/invoice/${c._id}`} target="_blank" rel="noreferrer" style={{ fontWeight:600 }}>
                INV-{c._id.slice(-6).toUpperCase()}
              </a>
              <span style={{ color:"#fca5a5" }}>·</span>
              {c.customer?.name || "Walk-in"}
              <span style={{ color:"#fca5a5" }}>·</span>
              {fmt(c.totalAmount)}
              <span style={{ color:"#fca5a5" }}>·</span>
              {new Date(c.chequeDate).toLocaleDateString()}
            </div>
          ))}
        </div>
      )}

      {data.todayCheques?.length > 0 && (
        <div className="kb-alert warning">
          <div className="kb-alert-title">
            <i className="ti ti-clock" /> {data.todayCheques.length} cheque{data.todayCheques.length > 1 ? "s" : ""} due today
          </div>
          {data.todayCheques.map(c => (
            <div key={c._id} style={{ fontSize:12.5 }}>
              <a href={`/invoice/${c._id}`} style={{ fontWeight:600 }}>INV-{c._id.slice(-6).toUpperCase()}</a>
              {" · "}{c.customer?.name || "Walk-in"}{" · "}{fmt(c.totalAmount)}
            </div>
          ))}
        </div>
      )}

      {/* ══ ROW 1 — 8 KPI CARDS ════════════════════════ */}
      <div className="kb-stat-grid" style={{ marginBottom:20 }}>
        <StatCard label="Total sales"     value={fmt(data.totalSales)}      icon="ti-receipt"      color="green" />
        <StatCard label="Total profit"    value={fmt(data.totalProfit)}      icon="ti-trending-up"  color="blue" />
        <StatCard label="Total expenses"  value={fmt(data.totalExpenses)}    icon="ti-coin"         color="amber" />
        <StatCard label="Inventory value" value={fmt(data.inventoryValue)}   icon="ti-box"          color="blue" />
        <StatCard label="Customer due"    value={fmt(data.totalCustomerDue)} icon="ti-user-dollar"  color="red"   valueColor="red" />
        <StatCard label="Supplier due"    value={fmt(data.totalSupplierDue)} icon="ti-truck"        color="amber" valueColor="amber" />
        <StatCard label="Products"        value={data.totalProducts}         icon="ti-package"      color="blue" />
        <StatCard label="Customers"       value={data.totalCustomers}        icon="ti-users"        color="green" />
      </div>

      {/* ══ ROW 2 — TODAY + CHEQUE SUMMARY ════════════ */}
      <SectionHead icon="ti-sun" title="Today & Finance" color="var(--amber-m)" />
      <div className="kb-row-2">

        <div className="kb-card">
          <div className="kb-card-header">
            <span className="kb-card-title">
              <i className="ti ti-calendar-today" style={{ color:"var(--amber-m)" }} />
              Today's summary
            </span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {[
              { label:"Sales",       value:fmt(data.todaySales),     c:"var(--t1)" },
              { label:"Profit",      value:fmt(data.todayProfit),    c:data.todayProfit    >= 0 ? "var(--green-m)" : "var(--red-m)" },
              { label:"Expenses",    value:fmt(data.todayExpenses),  c:"var(--red-m)" },
              { label:"Net profit",  value:fmt(data.todayNetProfit), c:data.todayNetProfit >= 0 ? "var(--green-m)" : "var(--red-m)" },
            ].map(item => (
              <div key={item.label} style={{
                background:"var(--bg-surface)", border:"1px solid #e2e8f0",
                borderRadius:"var(--r)", padding:"12px 14px",
              }}>
                <div style={{ fontSize:10, fontWeight:700, color:"var(--t3)", textTransform:"uppercase", letterSpacing:".07em", marginBottom:6 }}>
                  {item.label}
                </div>
                <div style={{ fontSize:17, fontWeight:800, color:item.c, letterSpacing:"-0.4px" }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="kb-card">
          <div className="kb-card-header">
            <span className="kb-card-title">
              <i className="ti ti-writing" style={{ color:"var(--blue-m)" }} />
              Cheque summary
            </span>
            <a className="kb-card-link" href="/cheques">
              View all <i className="ti ti-arrow-right" style={{ fontSize:12 }} />
            </a>
          </div>
          {[
            { label:"Pending", value:fmt(data.pendingChequeAmount), c:"var(--t1)",    dot:"#94a3b8" },
            { label:"Cleared", value:fmt(data.clearedChequeAmount), c:"var(--green-m)", dot:"var(--green-m)" },
            { label:"Bounced", value:fmt(data.bouncedChequeAmount), c:"var(--red-m)",   dot:"var(--red-m)" },
            { label:"Overdue", value:fmt(data.overdueChequeAmount), c:"var(--amber-m)", dot:"var(--amber-m)" },
          ].map(row => (
            <div key={row.label} style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"10px 0", borderBottom:"1px solid #f1f5f9",
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:7, height:7, borderRadius:"50%", background:row.dot, flexShrink:0 }} />
                <span style={{ fontSize:13, color:"var(--t2)" }}>{row.label}</span>
              </div>
              <strong style={{ fontSize:13, color:row.c }}>{row.value}</strong>
            </div>
          ))}
        </div>

      </div>

      {/* ══ ROW 3 — SALES CHART (full width) ══════════ */}
      <SectionHead icon="ti-chart-line" title="Sales trend" color="var(--blue-m)" />
      <div style={{ marginBottom:18 }}>
        <div className="kb-card">
          <div className="kb-card-header">
            <span className="kb-card-title">
              <i className="ti ti-chart-line" style={{ color:"var(--blue-m)" }} />
              Sales — last 7 days
            </span>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:11, color:"var(--t3)" }}>7-day total</span>
              <span style={{
                fontSize:13, fontWeight:700, color:"var(--blue-m)",
                background:"var(--blue-b)", padding:"3px 10px",
                borderRadius:20, border:"1px solid var(--blue-bd)"
              }}>
                {fmt(weekTotal)}
              </span>
            </div>
          </div>
          <SalesChart last7DaysSales={data.last7DaysSales} />
        </div>
      </div>

      {/* ══ ROW 4 — DAILY CASH + LOW STOCK ═══════════ */}
      <SectionHead icon="ti-cash" title="Cash & Inventory" color="var(--green-m)" />
      <div className="kb-row-2">

        <div className="kb-card">
          <div className="kb-card-header">
            <span className="kb-card-title">
              <i className="ti ti-cash" style={{ color:"var(--green-m)" }} />
              Daily cash summary
            </span>
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <tbody>
              {[
                { label:"Cash sales",          value:fmt(data.todayCashSales),         c:"var(--t1)" },
                { label:"Credit sales",        value:fmt(data.todayCreditSales),       c:"var(--amber-m)" },
                { label:"Customer payments",   value:fmt(data.todayCustomerPayments),  c:"var(--blue-m)" },
                { label:"Expenses",            value:fmt(data.todayExpenses),          c:"var(--red-m)" },
              ].map(row => (
                <tr key={row.label}>
                  <td style={{ padding:"9px 0", borderBottom:"1px solid #f1f5f9", color:"var(--t2)" }}>{row.label}</td>
                  <td style={{ padding:"9px 0", borderBottom:"1px solid #f1f5f9", textAlign:"right", fontWeight:600, color:row.c }}>{row.value}</td>
                </tr>
              ))}
              <tr>
                <td style={{ paddingTop:12, fontWeight:700, color:"var(--t1)", fontSize:13 }}>Net cash</td>
                <td style={{ paddingTop:12, textAlign:"right", fontWeight:800, color:data.todayNetCash >= 0 ? "var(--green-m)" : "var(--red-m)", fontSize:15 }}>
                  {fmt(data.todayNetCash)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="kb-card">
          <div className="kb-card-header">
            <span className="kb-card-title">
              <i className="ti ti-package-off" style={{ color:"var(--red-m)" }} />
              Low stock
            </span>
            {data.lowStockProducts.length > 0 && (
              <span className="kb-badge red">
                <i className="ti ti-alert-triangle" style={{ fontSize:10 }} />
                {data.lowStockProducts.length} items
              </span>
            )}
          </div>
          {data.lowStockProducts.length === 0
            ? (
              <div style={{ display:"flex", alignItems:"center", gap:8, padding:"16px 0", color:"var(--green-m)", fontSize:13 }}>
                <i className="ti ti-circle-check" style={{ fontSize:16 }} />
                All stock levels are healthy
              </div>
            ) : (
              <table className="kb-table">
                <thead><tr><th>Product</th><th className="text-end">Stock</th><th className="text-end">Status</th></tr></thead>
                <tbody>
                  {data.lowStockProducts.map(p => (
                    <tr key={p._id}>
                      <td><strong>{p.name}</strong></td>
                      <td className="text-end" style={{ fontWeight:600 }}>{p.stock}</td>
                      <td className="text-end">
                        <span className={`kb-badge ${p.stock === 0 ? "red" : "amber"}`}>
                          {p.stock === 0 ? "Out" : "Low"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>

      </div>

      {/* ══ ROW 5 — TOP SELLING + TOP PROFITABLE ══════ */}
      <SectionHead icon="ti-award" title="Product performance" color="var(--amber-m)" />
      <div className="kb-row-2">

        <div className="kb-card">
          <div className="kb-card-header">
            <span className="kb-card-title">
              <i className="ti ti-award" style={{ color:"var(--amber-m)" }} />
              Top selling products
            </span>
          </div>
          {data.topSellingProducts.length === 0
            ? <div style={{ fontSize:13, color:"var(--t3)", padding:"8px 0" }}>No sales data yet.</div>
            : (
              <table className="kb-table">
                <thead><tr><th>#</th><th>Product</th><th className="text-end">Sold</th></tr></thead>
                <tbody>
                  {data.topSellingProducts.map((p, i) => (
                    <tr key={p._id}>
                      <td style={{ width:28 }}>
                        <span style={{
                          display:"inline-flex", alignItems:"center", justifyContent:"center",
                          width:20, height:20, borderRadius:"50%", fontSize:10, fontWeight:700,
                          background: i === 0 ? "#fef3c7" : i === 1 ? "#f1f5f9" : "transparent",
                          color: i === 0 ? "#92400e" : i === 1 ? "#475569" : "var(--t3)",
                        }}>
                          {i+1}
                        </span>
                      </td>
                      <td><strong>{p.name}</strong></td>
                      <td className="text-end">
                        <span style={{ fontWeight:700, color:"var(--t1)" }}>{p.sold}</span>
                        <span style={{ fontSize:11, color:"var(--t3)", marginLeft:3 }}>units</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>

        <div className="kb-card">
          <div className="kb-card-header">
            <span className="kb-card-title">
              <i className="ti ti-trending-up" style={{ color:"var(--green-m)" }} />
              Top profitable products
            </span>
          </div>
          {data.topProfitableProducts.length === 0
            ? <div style={{ fontSize:13, color:"var(--t3)", padding:"8px 0" }}>No profit data yet.</div>
            : (
              <table className="kb-table">
                <thead><tr><th>#</th><th>Product</th><th className="text-end">Profit</th></tr></thead>
                <tbody>
                  {data.topProfitableProducts.map((p, i) => (
                    <tr key={p._id}>
                      <td style={{ width:28 }}>
                        <span style={{
                          display:"inline-flex", alignItems:"center", justifyContent:"center",
                          width:20, height:20, borderRadius:"50%", fontSize:10, fontWeight:700,
                          background: i === 0 ? "#ecfdf5" : i === 1 ? "#f1f5f9" : "transparent",
                          color: i === 0 ? "#065f46" : i === 1 ? "#475569" : "var(--t3)",
                        }}>
                          {i+1}
                        </span>
                      </td>
                      <td><strong>{p.name}</strong></td>
                      <td className="text-end" style={{ fontWeight:700, color:"var(--green-m)" }}>Rs. {p.profit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>

      </div>

      {/* ══ ROW 6 — TOP CATEGORIES + UPCOMING CHEQUES ═ */}
      {(data.topCategories?.length > 0 || data.upcomingCheques?.length > 0) && (
        <>
          <SectionHead icon="ti-tag" title="Categories & Upcoming" color="var(--purple)" />
          <div className="kb-row-2">

            {data.topCategories?.length > 0 && (
              <div className="kb-card">
                <div className="kb-card-header">
                  <span className="kb-card-title">
                    <i className="ti ti-tag" style={{ color:"var(--purple)" }} />
                    Top categories
                  </span>
                </div>
                <table className="kb-table">
                  <thead><tr><th>Category</th><th className="text-end">Profit</th></tr></thead>
                  <tbody>
                    {data.topCategories.map((c,i) => (
                      <tr key={i}>
                        <td>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <div style={{
                              width:6, height:6, borderRadius:"50%", flexShrink:0,
                              background: ["#2563eb","#059669","#d97706","#7c3aed","#dc2626"][i] || "#94a3b8"
                            }} />
                            {c.category}
                          </div>
                        </td>
                        <td className="text-end" style={{ fontWeight:700, color:"var(--green-m)" }}>Rs. {c.profit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {data.upcomingCheques?.length > 0 && (
              <div className="kb-card">
                <div className="kb-card-header">
                  <span className="kb-card-title">
                    <i className="ti ti-calendar-event" style={{ color:"var(--blue-m)" }} />
                    Upcoming cheques
                  </span>
                  <a className="kb-card-link" href="/cheques">View all →</a>
                </div>
                <table className="kb-table">
                  <thead>
                    <tr><th>Cheque</th><th>Customer</th><th className="text-end">Amount</th><th className="text-end">Due</th></tr>
                  </thead>
                  <tbody>
                    {data.upcomingCheques.map(sale => {
                      const days = Math.ceil((new Date(sale.chequeDate) - new Date()) / 86400000);
                      return (
                        <tr key={sale._id}>
                          <td style={{ fontFamily:"monospace", fontSize:11.5 }}>{sale.chequeNumber}</td>
                          <td>{sale.customer?.name || "Walk-in"}</td>
                          <td className="text-end" style={{ fontWeight:600 }}>{fmt(sale.totalAmount)}</td>
                          <td className="text-end">
                            <span className={`kb-badge ${days <= 2 ? "red" : "amber"}`}>{days}d</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </>
      )}

    </div>
  );
}