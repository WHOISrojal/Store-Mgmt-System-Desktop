import { useEffect, useState } from "react";
import api from "../services/api";
import * as XLSX from "xlsx";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, Title, Tooltip, Legend
);

function Reports() {
  const [report, setReport] = useState({
    totalSalesAmount:  0,
    totalProfit:       0,
    totalExpenses:     0,
    totalCustomerDue:  0,
    netProfit:         0,
    monthlySales:      [],
  });

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const response = await api.get("/reports");
      setReport(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const exportReport = () => {
    const reportData = [
      { Report: "Total Sales",     Amount: report.totalSalesAmount },
      { Report: "Total Profit",    Amount: report.totalProfit      },
      { Report: "Total Expenses",  Amount: report.totalExpenses    },
      { Report: "Customer Due",    Amount: report.totalCustomerDue },
      { Report: "Net Profit",      Amount: report.netProfit        },
    ];
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook  = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, "Store_Report.xlsx");
  };

  /* ── Chart configs ── */
  const barData = {
    labels: ["Total Sales", "Total Profit", "Total Expenses", "Customer Due"],
    datasets: [{
      label: "Amount (Rs.)",
      data: [
        report.totalSalesAmount,
        report.totalProfit,
        report.totalExpenses,
        report.totalCustomerDue,
      ],
      backgroundColor: [
        "rgba(37,99,235,0.8)",
        "rgba(5,150,105,0.8)",
        "rgba(220,38,38,0.8)",
        "rgba(217,119,6,0.8)",
      ],
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      title:  { display: false },
      tooltip: {
        callbacks: {
          label: ctx => ` Rs. ${ctx.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false }, border: { display: false } },
      y: {
        grid: { color: "#f1f5f9" },
        border: { display: false },
        ticks: { callback: v => `Rs. ${v.toLocaleString()}` },
      },
    },
  };

  const lineData = {
    labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    datasets: [{
      label: "Monthly Sales",
      data: report.monthlySales || Array(12).fill(0),
      borderColor: "#2563eb",
      backgroundColor: "rgba(37,99,235,0.08)",
      borderWidth: 2,
      pointBackgroundColor: "#2563eb",
      pointRadius: 4,
      fill: true,
      tension: 0.4,
    }],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      title:  { display: false },
      tooltip: {
        callbacks: {
          label: ctx => ` Rs. ${ctx.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false }, border: { display: false } },
      y: {
        grid: { color: "#f1f5f9" },
        border: { display: false },
        ticks: { callback: v => `Rs. ${v.toLocaleString()}` },
      },
    },
  };

  const statCards = [
    { label: "Total Sales",    value: report.totalSalesAmount, color: "blue",   icon: "ti-chart-bar"     },
    { label: "Total Profit",   value: report.totalProfit,      color: "green",  icon: "ti-trending-up"   },
    { label: "Total Expenses", value: report.totalExpenses,    color: "red",    icon: "ti-receipt"       },
    { label: "Customer Due",   value: report.totalCustomerDue, color: "amber",  icon: "ti-clock-dollar"  },
    { label: "Net Profit",     value: report.netProfit,        color: report.netProfit >= 0 ? "green" : "red", icon: "ti-coins" },
  ];

  const valueColor = {
    blue:  "var(--t1)",
    green: "var(--green-m)",
    red:   "var(--red-m)",
    amber: "#d97706",
  };

  return (
    <>
      {/* ── Page Header ── */}
      <div className="kb-page-header">
        <div>
          <h1 className="kb-page-title">Reports</h1>
          <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "var(--t3)" }}>
            Business overview — sales, profit, expenses and trends
          </p>
        </div>
        <button className="kb-btn kb-btn-success" onClick={exportReport}>
          <i className="ti ti-table-export" /> Export Excel
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "14px", marginBottom: "18px" }}>
        {statCards.map((card) => (
          <div key={card.label} className={`kb-stat-card ${card.color}`}>
            <div className="kb-stat-top">
              <span className="kb-stat-label">{card.label}</span>
              <span className={`kb-stat-icon ${card.color}`}>
                <i className={`ti ${card.icon}`} />
              </span>
            </div>
            <div className="kb-stat-value" style={{ color: valueColor[card.color], fontSize: "16px" }}>
              Rs. {card.value?.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>

        {/* Monthly Sales Line */}
        <div className="kb-card">
          <div className="kb-card-header" style={{ marginBottom: "18px" }}>
            <h2 className="kb-card-title">
              <i className="ti ti-chart-line" />
              Monthly Sales Trend
            </h2>
            <span style={{ fontSize: "12px", color: "var(--t3)", background: "var(--bg-surface)", border: "var(--border)", borderRadius: "var(--r)", padding: "3px 10px" }}>
              This Year
            </span>
          </div>
          <Line data={lineData} options={lineOptions} />
        </div>

        {/* Business Overview Bar */}
        <div className="kb-card">
          <div className="kb-card-header" style={{ marginBottom: "18px" }}>
            <h2 className="kb-card-title">
              <i className="ti ti-chart-bar" />
              Business Overview
            </h2>
            <div style={{ display: "flex", gap: "10px" }}>
              {["Sales","Profit","Expenses","Due"].map((l, i) => {
                const colors = ["#2563eb","#059669","#dc2626","#d97706"];
                return (
                  <span key={l} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "var(--t3)" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: colors[i], display: "inline-block" }} />
                    {l}
                  </span>
                );
              })}
            </div>
          </div>
          <Bar data={barData} options={barOptions} />
        </div>

      </div>

      {/* ── Summary Table ── */}
      <div className="kb-card" style={{ marginTop: "18px" }}>
        <div className="kb-card-header">
          <h2 className="kb-card-title">
            <i className="ti ti-table" />
            Financial Summary
          </h2>
        </div>
        <table className="kb-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th className="text-end">Amount</th>
            </tr>
          </thead>
          <tbody>
            {statCards.map((card) => (
              <tr key={card.label}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{
                      width: "28px", height: "28px", borderRadius: "7px", flexShrink: 0,
                      background: `var(--${card.color}-b)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: valueColor[card.color],
                    }}>
                      <i className={`ti ${card.icon}`} style={{ fontSize: "14px" }} />
                    </span>
                    <strong style={{ color: "var(--t1)" }}>{card.label}</strong>
                  </div>
                </td>
                <td className="text-end" style={{ fontWeight: 700, fontSize: "13.5px", color: valueColor[card.color] }}>
                  Rs. {card.value?.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: "var(--bg-surface)" }}>
              <td style={{ padding: "12px 10px", fontWeight: 700, fontSize: "13px", color: "var(--t1)", borderTop: "2px solid #e2e8f0" }}>
                Net Profit
              </td>
              <td className="text-end" style={{
                padding: "12px 10px", fontWeight: 800, fontSize: "15px",
                color: report.netProfit >= 0 ? "var(--green-m)" : "var(--red-m)",
                borderTop: "2px solid #e2e8f0",
              }}>
                Rs. {report.netProfit?.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
}

export default Reports;