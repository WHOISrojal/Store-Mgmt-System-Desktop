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
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

function Reports() {
  const [report, setReport] = useState({
  totalSalesAmount: 0,
  totalProfit: 0,
  totalExpenses: 0,
  totalCustomerDue: 0,
  netProfit: 0,
  monthlySales: [],
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

  const chartData = {
  labels: [
    "Sales",
    "Profit",
    "Expenses",
    "Customer Due",
  ],

  datasets: [
    {
      label: "Amount (Rs.)",
      data: [
        report.totalSalesAmount,
        report.totalProfit,
        report.totalExpenses,
        report.totalCustomerDue,
      ],
    },
  ],
};

const chartOptions = {
  responsive: true,

  plugins: {
    legend: {
      position: "top",
    },

    title: {
      display: true,
      text: "Business Overview",
    },
  },
};

const monthlySalesData = {
  labels: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],

  datasets: [
    {
      label: "Monthly Sales",
      data:
        report.monthlySales ||
        Array(12).fill(0),
    },
  ],
};

const exportReport = () => {
  const reportData = [
    {
      Report: "Total Sales",
      Amount: report.totalSalesAmount,
    },
    {
      Report: "Total Profit",
      Amount: report.totalProfit,
    },
    {
      Report: "Total Expenses",
      Amount: report.totalExpenses,
    },
    {
      Report: "Customer Due",
      Amount: report.totalCustomerDue,
    },
    {
      Report: "Net Profit",
      Amount: report.netProfit,
    },
  ];

  const worksheet =
    XLSX.utils.json_to_sheet(
      reportData
    );

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Report"
  );

  XLSX.writeFile(
    workbook,
    "Store_Report.xlsx"
  );
};

const monthlySalesOptions = {
  responsive: true,

  plugins: {
    title: {
      display: true,
      text: "Monthly Sales Trend",
    },
  },
};

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">

        <h2>Reports</h2>

        <button
          className="btn btn-success"
          onClick={exportReport}
        >
          📊 Export Excel
        </button>

      </div>

      <div className="row">

        <div className="col-md-4 mb-3">
          <div className="card shadow">
            <div className="card-body">
              <h6>Total Sales</h6>
              <h3>Rs. {report.totalSalesAmount}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card shadow">
            <div className="card-body">
              <h6>Total Profit</h6>
              <h3>Rs. {report.totalProfit}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card shadow">
            <div className="card-body">
              <h6>Total Expenses</h6>
              <h3>Rs. {report.totalExpenses}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-3">
          <div className="card shadow">
            <div className="card-body">
              <h6>Customer Due</h6>
              <h3>Rs. {report.totalCustomerDue}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-3">
          <div className="card shadow">
            <div className="card-body">
              <h6>Net Profit</h6>
              <h3>Rs. {report.netProfit}</h3>
            </div>
          </div>
        </div>

        <div className="card shadow mt-4">
  <div className="card-body">

    <Line
      data={monthlySalesData}
      options={monthlySalesOptions}
    />

    <Bar
      data={chartData}
      options={chartOptions}
    />

  </div>
</div>

      </div>
    </div>

  );
}

export default Reports;