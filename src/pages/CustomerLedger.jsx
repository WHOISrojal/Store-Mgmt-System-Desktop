import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

function CustomerLedger() {
  const { customerId } = useParams();

  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [sales, setSales] = useState([]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await api.get(`/customer-transactions/${customerId}`);

      setTransactions(response.data);

      const salesResponse = await api.get(`/sales/customer/${customerId}`);

      setSales(salesResponse.data);
    } catch (error) {
      console.error(error);
    }
  };

  const recordPayment = async () => {
    try {
      await api.post("/customer-transactions/payment", {
        customerId,
        amount: Number(amount),
        note,
      });

      setAmount("");
      setNote("");

      fetchTransactions();

      alert("Payment Recorded");
    } catch (error) {
      console.error(error);

      alert("Failed to record payment");
    }
  };

  const customer = transactions.length > 0 ? transactions[0].customer : null;

  const totalPurchases = transactions
    .filter((transaction) => transaction.type === "PURCHASE")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalPayments = transactions
    .filter((transaction) => transaction.type === "PAYMENT")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  return (
    <div className="container-fluid">
      <h2 className="mb-4">Customer Ledger</h2>

      {customer && (
        <div className="card mb-4">
          <div className="card-body">
            <h4>{customer.name}</h4>

            <p>Phone: {customer.phone}</p>

            <p>Address: {customer.address}</p>

            <div className="row mt-3">
              <div className="col-md-4">
                <div className="border rounded p-3 text-center">
                  <h6>Total Purchases</h6>

                  <h4 className="text-primary">
                    Rs. {totalPurchases.toLocaleString()}
                  </h4>
                </div>
              </div>

              <div className="col-md-4">
                <div className="border rounded p-3 text-center">
                  <h6>Total Payments</h6>

                  <h4 className="text-success">
                    Rs. {totalPayments.toLocaleString()}
                  </h4>
                </div>
              </div>

              <div className="col-md-4">
                <div className="border rounded p-3 text-center">
                  <h6>Current Due</h6>

                  <h4 className="text-danger">
                    Rs. {customer.dueAmount.toLocaleString()}
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card mb-4">
        <div className="card-header">Record Payment</div>

        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <input
                type="number"
                className="form-control"
                placeholder="Payment Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="col-md-6">
              <input
                className="form-control"
                placeholder="Note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div className="col-md-2">
              <button className="btn btn-success w-100" onClick={recordPayment}>
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">Recent Invoices</div>

        <div className="card-body">
          {sales.length === 0 ? (
            <p>No sales found.</p>
          ) : (
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Date</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {sales.map((sale) => (
                  <tr key={sale._id}>
                    <td>{sale._id.slice(-6)}</td>

                    <td>{new Date(sale.createdAt).toLocaleDateString()}</td>

                    <td>Rs. {sale.totalAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">Transaction History</div>

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
              {transactions.map((transaction) => (
                <tr key={transaction._id}>
                  <td>
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </td>

                  <td>{transaction.type}</td>

                  <td>Rs. {transaction.amount}</td>

                  <td>{transaction.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CustomerLedger;
