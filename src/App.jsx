import {
  BrowserRouter, Routes, Route, NavLink, Navigate, useLocation,
} from "react-router-dom";

import Login          from "./pages/Login";
import Dashboard      from "./pages/Dashboard";
import Products       from "./pages/Products";
import Purchases      from "./pages/Purchases";
import Sales          from "./pages/Sales";
import Customers      from "./pages/Customers";
import Expenses       from "./pages/Expenses";
import Reports        from "./pages/Reports";
import CustomerLedger from "./pages/CustomerLedger";
import SupplierLedger from "./pages/SupplierLedger";
import Invoice        from "./pages/Invoice";
import Settings       from "./pages/Settings";
import UserManagement from "./pages/UserManagement";
import Suppliers      from "./pages/Suppliers";
import AuditLogs      from "./pages/AuditLogs";
import Cheques        from "./pages/Cheques";
import StockHistory   from "./pages/StockHistory";
import "./styles/theme.css";

const PAGE_TITLES = {
  "/":             ["Dashboard",      "ti-layout-dashboard"],
  "/products":     ["Products",       "ti-box"],
  "/purchases":    ["Purchases",      "ti-shopping-cart"],
  "/suppliers":    ["Suppliers",      "ti-truck"],
  "/sales":        ["Sales",          "ti-receipt"],
  "/cheques":      ["Cheques",        "ti-writing"],
  "/customers":    ["Customers",      "ti-users"],
  "/stock-history":["Stock History",  "ti-history"],
  "/expenses":     ["Expenses",       "ti-coin"],
  "/reports":      ["Reports",        "ti-chart-bar"],
  "/users":        ["User Management","ti-users-group"],
  "/audit-logs":   ["Audit Logs",     "ti-shield"],
  "/settings":     ["Settings",       "ti-settings"],
};

const NAV = {
  Main: [
    { to:"/",        label:"Dashboard",    icon:"ti-layout-dashboard" },
    { to:"/reports", label:"Reports",      icon:"ti-chart-bar", adminOnly:true },
  ],
  Sales: [
    { to:"/sales",     label:"Sales",     icon:"ti-receipt" },
    { to:"/customers", label:"Customers", icon:"ti-users" },
  ],
  Purchasing: [
    { to:"/purchases", label:"Purchases", icon:"ti-shopping-cart", adminOnly:true },
    { to:"/suppliers", label:"Suppliers", icon:"ti-truck" },
  ],
  Finance: [
    { to:"/expenses", label:"Expenses", icon:"ti-coin",    adminOnly:true },
    { to:"/cheques",  label:"Cheques",  icon:"ti-writing", adminOnly:true },
  ],
  Inventory: [
    { to:"/products",      label:"Products",     icon:"ti-box" },
    { to:"/stock-history", label:"Stock History",icon:"ti-history" },
  ],
  System: [
    { to:"/audit-logs", label:"Audit Logs",      icon:"ti-shield",       adminOnly:true },
    { to:"/users",      label:"User Management", icon:"ti-users-group",  adminOnly:true },
    { to:"/settings",   label:"Settings",        icon:"ti-settings",     adminOnly:true },
  ],
};

function ProtectedRoute({ children }) {
  return localStorage.getItem("token") ? children : <Navigate to="/login" />;
}

function Sidebar({ role, onLogout }) {
  const name     = localStorage.getItem("name") || "User";
  const initials = name.slice(0,2).toUpperCase();

  return (
    <aside className="kb-sidebar">
      {/* Brand */}
      <div className="kb-brand">
        <div className="kb-brand-logo">K</div>
        <div>
          <div className="kb-brand-name">Karobar</div>
          <div className="kb-brand-sub">Business Manager</div>
        </div>
      </div>

      {/* User */}
      <div className="kb-user-block">
        <div className="kb-avatar">{initials}</div>
        <div>
          <div className="kb-user-name">{name}</div>
          <div className="kb-user-role">{role}</div>
        </div>
      </div>

      {/* Nav */}
      <ul className="kb-nav">
        {Object.entries(NAV).map(([section, items]) => {
          const visible = items.filter(i => !i.adminOnly || role === "ADMIN");
          if (!visible.length) return null;
          return (
            <li key={section}>
              <div className="kb-nav-section">{section}</div>
              <ul style={{ listStyle:"none", padding:0, margin:0 }}>
                {visible.map(item => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === "/"}
                      className={({ isActive }) => "kb-nav-item" + (isActive ? " active" : "")}
                    >
                      <i className={`ti ${item.icon}`} />
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>

      {/* Logout */}
      <div className="kb-sidebar-footer">
        <button className="kb-logout-btn" onClick={onLogout}>
          <i className="ti ti-logout" /> Logout
        </button>
      </div>
    </aside>
  );
}

function Topbar() {
  const { pathname } = useLocation();
  const match = Object.entries(PAGE_TITLES).find(
    ([path]) => pathname === path || pathname.startsWith(path + "/")
  );
  const [title, icon] = match?.[1] ?? ["Karobar", "ti-home"];
  const name  = localStorage.getItem("name") || "User";
  const today = new Date().toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" });

  return (
    <header className="kb-topbar">
      <div className="kb-topbar-left">
        <i className={`ti ${icon}`} style={{ fontSize:18, color:"var(--brand)", flexShrink:0 }} />
        <span className="kb-topbar-page">{title}</span>
        <div className="kb-topbar-divider" />
        <span className="kb-topbar-sub">Welcome back, {name}</span>
      </div>
      <div className="kb-topbar-right">
        <div className="kb-topbar-date">
          <i className="ti ti-calendar" />
          {today}
        </div>
      </div>
    </header>
  );
}

function AppShell() {
  const role   = localStorage.getItem("role");
  const logout = () => { localStorage.clear(); window.location.href = "/login"; };
  const admin  = el => role === "ADMIN" ? el : <Navigate to="/" />;

  return (
    <div className="kb-shell">
      <Sidebar role={role} onLogout={logout} />
      <div className="kb-main">
        <Topbar />
        <div className="kb-content">
          <Routes>
            <Route path="/"              element={<Dashboard />} />
            <Route path="/products"      element={<Products />} />
            <Route path="/purchases"     element={admin(<Purchases />)} />
            <Route path="/suppliers"     element={<Suppliers />} />
            <Route path="/sales"         element={<Sales />} />
            <Route path="/cheques"       element={admin(<Cheques />)} />
            <Route path="/customers"     element={<Customers />} />
            <Route path="/stock-history" element={<StockHistory />} />
            <Route path="/expenses"      element={admin(<Expenses />)} />
            <Route path="/reports"       element={admin(<Reports />)} />
            <Route path="/audit-logs"    element={admin(<AuditLogs />)} />
            <Route path="/users"         element={admin(<UserManagement />)} />
            <Route path="/settings"      element={admin(<Settings />)} />
            <Route path="/invoice/:id"   element={<Invoice />} />
            <Route path="/customers/:customerId" element={<CustomerLedger />} />
            <Route path="/suppliers/:supplierId" element={<SupplierLedger />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<ProtectedRoute><AppShell /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}