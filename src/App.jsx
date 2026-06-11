import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  NavLink,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Purchases from "./pages/Purchases";
import Sales from "./pages/Sales";
import Customers from "./pages/Customers";
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import CustomerLedger from "./pages/CustomerLedger";
import SupplierLedger from "./pages/SupplierLedger";
import Invoice from "./pages/Invoice";
import Settings from "./pages/Settings";
import UserManagement from "./pages/UserManagement";
import Suppliers from "./pages/Suppliers";
import AuditLogs from "./pages/AuditLogs";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
}

function App() {
  const token = localStorage.getItem("token");

  const role = localStorage.getItem("role");

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const navStyle = ({ isActive }) => ({
  color: "white",
  textDecoration: "none",
  display: "block",
  padding: "10px",
  borderRadius: "8px",
  marginBottom: "5px",
  backgroundColor: isActive
    ? "#3b82f6"
    : "transparent",
});

  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div
                style={{
                  display: "flex",
                  minHeight: "100vh",
                }}
              >
                <div
                  style={{
                    width: "260px",
                    padding: "25px",
                    backgroundColor: "#1e293b",
                    color: "white",
                    minHeight: "100vh",
                  }}
                >
                  <h2 className="mb-4">
                    🏪 Store Manager
                  </h2>

                  <div
                    className="mb-4 p-3"
                    style={{
                      background: "#334155",
                      borderRadius: "10px",
                    }}
                  >
                    <strong>
                      👤 {localStorage.getItem("name")}
                    </strong>
                    <br />
                    <small>{role}</small>
                  </div>

                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                    }}
                  >
                    <li>
                      <NavLink to="/" style={navStyle}>
                        📊 Dashboard
                      </NavLink>
                    </li>

                    <li>
                      <NavLink to="/products" style={navStyle}>
                        📦 Products
                      </NavLink>
                    </li>

                    {role === "ADMIN" && (
                      <li>
                        <NavLink to="/purchases" style={navStyle}>
                          🛒 Purchases
                        </NavLink>
                      </li>
                    )}

                    <li>
                      <NavLink
                        to="/suppliers"
                        style={navStyle}
                      >
                        🚚 Suppliers
                      </NavLink>
                    </li>

                    <li>
                      <NavLink to="/sales" style={navStyle}>
                        💰 Sales
                      </NavLink>
                    </li>

                    <li>
                      <NavLink to="/customers" style={navStyle}>
                        👥 Customers
                      </NavLink>
                    </li>

                    {role === "ADMIN" && (
                      <li>
                        <NavLink to="/expenses" style={navStyle}>
                          🧾 Expenses
                        </NavLink>
                      </li>
                    )}

                    {role === "ADMIN" && (
                      <li>
                        <NavLink to="/reports" style={navStyle}>
                          📈 Reports
                        </NavLink>
                      </li>
                    )}

                    {role === "ADMIN" && (
                      <li>
                        <NavLink
                          to="/users"
                          style={navStyle}
                        >
                          👤 User Management
                        </NavLink>
                      </li>
                    )}

                    {role === "ADMIN" && (
                      <li>
                        <NavLink
                          to="/audit-logs"
                          style={navStyle}
                        >
                          📋 Audit Logs
                        </NavLink>
                      </li>
                    )}

                    {role === "ADMIN" && (
                      <li>
                        <NavLink
                          to="/settings"
                          style={navStyle}
                        >
                          ⚙️ Settings
                        </NavLink>
                      </li>
                    )}
                  </ul>

                  <button
                    className="btn btn-danger"
                    onClick={logout}
                  >
                    Logout
                  </button>
                </div>

                <div
                  style={{
                    flex: 1,
                    padding: "20px",
                    backgroundColor: "#f8fafc",
                  }}
                >
                  <div
                    className="card shadow-sm border-0 mb-4"
                  >
                    <div className="card-body">
                      <h3 className="mb-0">
                        Store Management System
                      </h3>

                      <small className="text-muted">
                        Welcome back,
                        {" "}
                        {localStorage.getItem("name")}
                      </small>
                    </div>
                  </div>
                  <Routes>
                    <Route
                      path="/"
                      element={<Dashboard />}
                    />

                    <Route
                      path="/products"
                      element={<Products />}
                    />

                    <Route
                      path="/purchases"
                      element={
                        role === "ADMIN"
                          ? <Purchases />
                          : <Navigate to="/" />
                      }
                    />

                    <Route
                      path="/suppliers"
                      element={<Suppliers />}
                    />

                    <Route
                      path="/sales"
                      element={<Sales />}
                    />

                    <Route
                      path="/customers"
                      element={<Customers />}
                    />

                    <Route
                      path="/expenses"
                      element={
                        role === "ADMIN"
                          ? <Expenses />
                          : <Navigate to="/" />
                      }
                    />  

                    <Route
                      path="/reports"
                      element={
                        role === "ADMIN"
                          ? <Reports />
                          : <Navigate to="/" />
                      }
                    />

                    <Route
                      path="/audit-logs"
                      element={
                        role === "ADMIN"
                          ? <AuditLogs />
                          : <Navigate to="/" />
                      }
                    />

                    <Route
                      path="/users"
                      element={
                        role === "ADMIN"
                          ? <UserManagement />
                          : <Navigate to="/" />
                      }
                    />

                    <Route
                      path="/invoice/:id"
                      element={<Invoice />}
                    />

                    <Route
                      path="/settings"
                      element={
                        role === "ADMIN"
                          ? <Settings />
                          : <Navigate to="/" />
                      }
                    />

                    <Route
                      path="/customers/:customerId"
                      element={
                        <CustomerLedger />
                      }
                    />

                    <Route
                      path="/suppliers/:supplierId"
                      element={<SupplierLedger />}
                    />
                  </Routes>
                </div>
              </div>
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;

