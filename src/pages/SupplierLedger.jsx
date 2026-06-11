import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

function SupplierLedger() {
  const { supplierId } = useParams();

  const [transactions, setTransactions] =
    useState([]);

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await api.get(
        `/supplier-transactions/${supplierId}`
      );

      setTransactions(response.data);

    } catch (error) {
      console.error(error);
    }
  };

  const recordPayment = async () => {
    try {
      await api.post(
        "/supplier-transactions/payment",
        {
          supplierId,
          amount: Number(amount),
          note,
        }
      );

      setAmount("");
      setNote("");

      fetchTransactions();

      alert("Payment Recorded");

    } catch (error) {
      console.error(error);

      alert("Failed to record payment");
    }
  };

  const supplier =
    transactions.length > 0
      ? transactions[0].supplier
      : null;

  return (
    <div className="container-fluid">
      <h2 className="mb-4">
        Supplier Ledger
      </h2>

      {supplier && (
        <div className="card mb-4">
          <div className="card-body">
            <h4>{supplier.name}</h4>

            <p>
              Phone: {supplier.phone}
            </p>

            <p>
              Address: {supplier.address}
            </p>

            <h5>
              Current Due: Rs.
              {supplier.dueAmount}
            </h5>
          </div>
        </div>
      )}

      <div className="card mb-4">
        <div className="card-header">
          Record Payment
        </div>

        <div className="card-body">
          <div className="row g-3">

            <div className="col-md-4">
              <input
                type="number"
                className="form-control"
                placeholder="Payment Amount"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
              />
            </div>

            <div className="col-md-6">
              <input
                className="form-control"
                placeholder="Note"
                value={note}
                onChange={(e) =>
                  setNote(e.target.value)
                }
              />
            </div>

            <div className="col-md-2">
              <button
                className="btn btn-success w-100"
                onClick={recordPayment}
              >
                Save
              </button>
            </div>

          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          Transaction History
        </div>

        <div className="card-body">

          <table className="table table-bordered table-striped">

            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Note</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map(
                (transaction) => (
                  <tr key={transaction._id}>
                    <td>
                      {new Date(
                        transaction.createdAt
                      ).toLocaleDateString()}
                    </td>

                    <td>
                      {transaction.type}
                    </td>

                    <td>
                      Rs. {transaction.amount}
                    </td>

                    <td>
                      {transaction.note}
                    </td>
                  </tr>
                )
              )}
            </tbody>

          </table>

        </div>
      </div>
    </div>
  );
}

export default SupplierLedger;