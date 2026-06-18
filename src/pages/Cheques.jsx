import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

function Cheques() {
  const [cheques, setCheques] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const fetchCheques = async () => {
    const response = await api.get("/sales/cheques");
    setCheques(response.data);
  };

  useEffect(() => {
    fetchCheques();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/sales/${id}/cheque-status`, {
        status,
      });

      fetchCheques();
    } catch (error) {
      alert("Failed");
    }
  };

  const filteredCheques = cheques.filter((cheque) => {
    const invoice = `INV-${cheque._id.slice(-6).toUpperCase()}`;

    const matchesSearch =
      cheque.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      cheque.chequeNumber?.toLowerCase().includes(search.toLowerCase()) ||
      cheque.bankName?.toLowerCase().includes(search.toLowerCase()) ||
      invoice.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === "ALL") return true;

    if (filter === "OVERDUE") {
      return (
        cheque.chequeStatus === "PENDING" &&
        new Date(cheque.chequeDate) < new Date()
      );
    }

    return cheque.chequeStatus === filter;
  });

  return (
    <div className="container-fluid">
      <h2 className="mb-4">Cheque Management</h2>

      <div className="mb-3 d-flex gap-2">
        <button
          className={`btn ${filter === "ALL" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setFilter("ALL")}
        >
          All
        </button>

        <button
          className={`btn ${filter === "PENDING" ? "btn-warning" : "btn-outline-warning"}`}
          onClick={() => setFilter("PENDING")}
        >
          Pending
        </button>

        <button
          className={`btn ${filter === "CLEARED" ? "btn-success" : "btn-outline-success"}`}
          onClick={() => setFilter("CLEARED")}
        >
          Cleared
        </button>

        <button
          className={`btn ${filter === "BOUNCED" ? "btn-danger" : "btn-outline-danger"}`}
          onClick={() => setFilter("BOUNCED")}
        >
          Bounced
        </button>

        <button
          className={`btn ${filter === "OVERDUE" ? "btn-dark" : "btn-outline-dark"}`}
          onClick={() => setFilter("OVERDUE")}
        >
          Overdue
        </button>

        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search Customer / Invoice / Cheque No / Bank"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Invoice</th>
            <th>Customer</th>
            <th>Cheque No</th>
            <th>Bank</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Status</th>
            <th>Days</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredCheques.map((cheque) => {
            const today = new Date();

            const chequeDate = new Date(cheque.chequeDate);

            const daysLeft = Math.ceil(
              (chequeDate - today) / (1000 * 60 * 60 * 24),
            );

            return (
              <tr
                key={cheque._id}
                className={
                  cheque.chequeStatus === "PENDING" &&
                  new Date(cheque.chequeDate) < new Date()
                    ? "table-danger"
                    : ""
                }
              >
                <td>
                  <Link to={`/invoice/${cheque._id}`}>
                    INV-{cheque._id.slice(-6).toUpperCase()}
                  </Link>
                </td>

                <td>{cheque.customer?.name}</td>

                <td>{cheque.chequeNumber}</td>

                <td>{cheque.bankName}</td>

                <td>Rs. {cheque.totalAmount}</td>

                <td>{new Date(cheque.chequeDate).toLocaleDateString()}</td>

                <td>
                  <span
                    className={`badge ${
                      cheque.chequeStatus === "CLEARED"
                        ? "bg-success"
                        : cheque.chequeStatus === "BOUNCED"
                          ? "bg-danger"
                          : "bg-warning"
                    }`}
                  >
                    {cheque.chequeStatus}
                  </span>
                </td>

                <td>
                  {daysLeft >= 0
                    ? `${daysLeft} day(s) left`
                    : `Overdue by ${Math.abs(daysLeft)} day(s)`}
                </td>

                <td>
                  <button
                    className="btn btn-success btn-sm me-2"
                    onClick={() => updateStatus(cheque._id, "CLEARED")}
                  >
                    Clear
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => updateStatus(cheque._id, "BOUNCED")}
                  >
                    Bounce
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Cheques;
