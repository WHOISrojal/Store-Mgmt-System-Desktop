import { useEffect, useState } from "react";
import api from "../services/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

function Dashboard() {
  const [data, setData] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalCustomerDue: 0,
    totalExpenses: 0,
    totalSales: 0,
    totalProfit: 0,

    todaySales: 0,
    todayProfit: 0,
    todayExpenses: 0,
    todayNetProfit: 0,

    lowStockProducts: [],
    topSellingProducts: [],
    topProfitableProducts: [],

    totalSuppliers: 0,
    totalSupplierDue: 0,
    inventoryValue: 0,

    todayCashSales: 0,
    todayCreditSales: 0,
    todayCustomerPayments: 0,
    todayNetCash: 0,

    topCategories: [],
  });

  const [salesChart, setSalesChart] = useState({
    labels: [],
    values: [],
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get("/dashboard");

      setData(response.data);

      setSalesChart({
        labels: response.data.last7DaysSales.map((day) => day.label),

        values: response.data.last7DaysSales.map((day) => day.sales),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const chartData = {
    labels: salesChart.labels,

    datasets: [
      {
        label: "Sales (Rs.)",
        data: salesChart.values,
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="container-fluid">
      <h2 className="mb-4 fw-bold text-center">📊 Dashboard</h2>

      <div className="row g-4">
        <div className="col-md-4">
          <div
            className="card border-0 shadow-sm h-100"
            style={{
              borderRadius: "15px",
              minHeight: "180px",
            }}
          >
            <div className="card-body text-center d-flex flex-column justify-content-center">
              <div style={{ fontSize: "35px" }}>📦</div>

              <div className="text-muted">Total Products</div>

              <h2 className="fw-bold mt-3">{data.totalProducts}</h2>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div
            className="card border-0 shadow-sm h-100"
            style={{
              borderRadius: "15px",
              minHeight: "180px",
            }}
          >
            <div className="card-body text-center d-flex flex-column justify-content-center">
              <div style={{ fontSize: "35px" }}>👥</div>

              <div className="text-muted">Total Customers</div>

              <h2 className="fw-bold mt-3">{data.totalCustomers}</h2>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center d-flex flex-column justify-content-center">
              <div style={{ fontSize: "35px" }}>🏢</div>

              <div className="text-muted">Total Suppliers</div>

              <h2 className="fw-bold mt-3">{data.totalSuppliers}</h2>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div
            className="card border-0 shadow-sm h-100"
            style={{
              borderRadius: "15px",
              minHeight: "180px",
            }}
          >
            <div className="card-body text-center d-flex flex-column justify-content-center">
              <div style={{ fontSize: "35px" }}>💰</div>

              <div className="text-muted">Customer Due</div>

              <h4 className="fw-bold mt-3">
                Rs. {data.totalCustomerDue.toLocaleString()}
              </h4>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center d-flex flex-column justify-content-center">
              <div style={{ fontSize: "35px" }}>📤</div>

              <div className="text-muted">Supplier Due</div>

              <h4 className="fw-bold mt-3">
                Rs. {data.totalSupplierDue.toLocaleString()}
              </h4>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center d-flex flex-column justify-content-center">
              <div style={{ fontSize: "35px" }}>📦</div>

              <div className="text-muted">Inventory Value</div>

              <h4 className="fw-bold mt-3">
                Rs. {data.inventoryValue.toLocaleString()}
              </h4>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div
            className="card border-0 shadow-sm h-100"
            style={{
              borderRadius: "15px",
              minHeight: "180px",
            }}
          >
            <div className="card-body text-center d-flex flex-column justify-content-center">
              <div style={{ fontSize: "35px" }}>🧾</div>

              <div className="text-muted">Total Expenses</div>

              <h4 className="fw-bold mt-3">
                Rs. {data.totalExpenses.toLocaleString()}
              </h4>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div
            className="card border-0 shadow-sm h-100"
            style={{
              borderRadius: "15px",
              minHeight: "180px",
            }}
          >
            <div className="card-body text-center d-flex flex-column justify-content-center">
              <div style={{ fontSize: "35px" }}>💵</div>

              <div className="text-muted">Total Sales</div>

              <h4 className="fw-bold mt-3">
                Rs. {data.totalSales.toLocaleString()}
              </h4>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div
            className="card border-0 shadow-sm h-100"
            style={{
              borderRadius: "15px",
              minHeight: "180px",
            }}
          >
            <div className="card-body text-center d-flex flex-column justify-content-center">
              <div style={{ fontSize: "35px" }}>📈</div>

              <div className="text-muted">Total Profit</div>

              <h4 className="fw-bold mt-3">
                Rs. {data.totalProfit.toLocaleString()}
              </h4>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div
            className="card border-0 shadow-sm h-100"
            style={{
              borderRadius: "15px",
              minHeight: "180px",
            }}
          >
            <div className="card-body text-center d-flex flex-column justify-content-center">
              <div style={{ fontSize: "35px" }}>📅</div>

              <div className="text-muted">Today's Sales</div>

              <h4 className="fw-bold mt-3">
                Rs. {data.todaySales.toLocaleString()}
              </h4>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div
            className="card border-0 shadow-sm h-100"
            style={{
              borderRadius: "15px",
              minHeight: "180px",
            }}
          >
            <div className="card-body text-center d-flex flex-column justify-content-center">
              <div style={{ fontSize: "35px" }}>📈</div>

              <div className="text-muted">Today's Profit</div>

              <h4 className="fw-bold mt-3 text-success">
                Rs. {data.todayProfit.toLocaleString()}
              </h4>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div
            className="card border-0 shadow-sm h-100"
            style={{
              borderRadius: "15px",
              minHeight: "180px",
            }}
          >
            <div className="card-body text-center d-flex flex-column justify-content-center">
              <div style={{ fontSize: "35px" }}>🧾</div>

              <div className="text-muted">Today's Expenses</div>

              <h4 className="fw-bold mt-3 text-danger">
                Rs. {data.todayExpenses.toLocaleString()}
              </h4>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div
            className="card border-0 shadow-sm h-100"
            style={{
              borderRadius: "15px",
              minHeight: "180px",
            }}
          >
            <div className="card-body text-center d-flex flex-column justify-content-center">
              <div style={{ fontSize: "35px" }}>💹</div>

              <div className="text-muted">Net Profit</div>

              <h4
                className={
                  data.todayNetProfit >= 0
                    ? "fw-bold mt-3 text-success"
                    : "fw-bold mt-3 text-danger"
                }
              >
                Rs. {data.todayNetProfit.toLocaleString()}
              </h4>
            </div>
          </div>
        </div>
      </div>

      <div
        className="card border-0 shadow-sm mt-4"
        style={{
          borderRadius: "15px",
        }}
      >
        <div className="card-body">
          <h3 className="text-center mb-4">💵 Daily Cash Summary</h3>

          <table className="table table-bordered">
            <tbody>
              <tr>
                <td>Cash Sales</td>

                <td className="text-end fw-bold">
                  Rs. {data.todayCashSales.toLocaleString()}
                </td>
              </tr>

              <tr>
                <td>Credit Sales</td>

                <td className="text-end fw-bold text-warning">
                  Rs. {data.todayCreditSales.toLocaleString()}
                </td>
              </tr>

              <tr>
                <td>Customer Payments</td>

                <td className="text-end fw-bold text-primary">
                  Rs. {data.todayCustomerPayments.toLocaleString()}
                </td>
              </tr>

              <tr>
                <td>Expenses</td>

                <td className="text-end fw-bold text-danger">
                  Rs. {data.todayExpenses.toLocaleString()}
                </td>
              </tr>

              <tr className="table-success">
                <td>
                  <strong>Net Cash</strong>
                </td>

                <td className="text-end">
                  <strong>Rs. {data.todayNetCash.toLocaleString()}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div
        className="card border-0 shadow-sm mt-4"
        style={{
          borderRadius: "15px",
        }}
      >
        <div className="card-body">
          <h3 className="text-center mb-4">📈 Sales Last 7 Days</h3>

          <Line data={chartData} />
        </div>
      </div>

      <div
        className="card border-0 shadow-sm mt-4"
        style={{
          borderRadius: "15px",
        }}
      >
        <div className="card-body">
          <h3 className="text-center mb-4">⚠ Low Stock Products</h3>

          {data.lowStockProducts.length === 0 ? (
            <div className="alert alert-success">No low stock products.</div>
          ) : (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Current Stock</th>
                </tr>
              </thead>

              <tbody>
                {data.lowStockProducts.map((product) => (
                  <tr key={product._id}>
                    <td>{product.name}</td>
                    <td>{product.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div
        className="card border-0 shadow-sm mt-4"
        style={{
          borderRadius: "15px",
        }}
      >
        <div className="card-body">
          <h3 className="text-center mb-4">🏆 Top Selling Products</h3>

          {data.topSellingProducts.length === 0 ? (
            <div className="alert alert-info">No sales available.</div>
          ) : (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Total Sold</th>
                </tr>
              </thead>

              <tbody>
                {data.topSellingProducts.map((product) => (
                  <tr key={product._id}>
                    <td>{product.name}</td>
                    <td>{product.sold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <div
        className="card border-0 shadow-sm mt-4"
        style={{
          borderRadius: "15px",
        }}
      >
        <div className="card-body">
          <h3 className="text-center mb-4">💰 Top Profitable Products</h3>

          {data.topProfitableProducts.length === 0 ? (
            <div className="alert alert-info">No profit data available.</div>
          ) : (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Total Profit</th>
                </tr>
              </thead>

              <tbody>
                {data.topProfitableProducts.map((product) => (
                  <tr key={product._id}>
                    <td>{product.name}</td>

                    <td>Rs. {product.profit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <div
        className="card border-0 shadow-sm mt-4"
        style={{
          borderRadius: "15px",
        }}
      >
        <div className="card-body">
          <h3 className="text-center mb-4">🏷 Top Categories</h3>

          {data.topCategories.length === 0 ? (
            <div className="alert alert-info">No category data available.</div>
          ) : (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Total Profit</th>
                </tr>
              </thead>

              <tbody>
                {data.topCategories.map((category, index) => (
                  <tr key={index}>
                    <td>{category.category}</td>
                    <td>Rs. {category.profit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
