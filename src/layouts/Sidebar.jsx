import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div
      className="bg-dark text-white p-3"
      style={{
        width: "250px",
        minHeight: "100vh",
      }}
    >
      <h3 className="mb-4">Store Management</h3>

      <div className="d-flex flex-column gap-2">

        <Link
          className="btn btn-outline-light"
          to="/"
        >
          Dashboard
        </Link>

        <Link
          className="btn btn-outline-light"
          to="/products"
        >
          Products
        </Link>

        <Link
          className="btn btn-outline-light"
          to="/customers"
        >
          Customers
        </Link>

        <Link
          className="btn btn-outline-light"
          to="/purchases"
        >
          Purchases
        </Link>

        <Link
          className="btn btn-outline-light"
          to="/sales"
        >
          Sales
        </Link>

        <Link
          className="btn btn-outline-light"
          to="/expenses"
        >
          Expenses
        </Link>

        <Link
          className="btn btn-outline-light"
          to="/reports"
        >
          Reports
        </Link>

      </div>
    </div>
  );
}

export default Sidebar;