import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Customers() {
  const [customers, setCustomers] = useState([]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [search, setSearch] = useState("");
  const [paymentCustomer, setPaymentCustomer] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await api.get("/customers");
      setCustomers(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const addCustomer = async () => {
    try {
      await api.post("/customers", {
        name,
        phone,
        address,
      });

      fetchCustomers();

      setName("");
      setPhone("");
      setAddress("");

      alert("Customer Added Successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to add customer");
    }
  };

  const receivePayment = async () => {
    try {
      if (!paymentAmount) {
        return alert("Enter payment amount");
      }

      await api.post("/customer-transactions/payment", {
        customerId: paymentCustomer._id,
        amount: Number(paymentAmount),
        note: paymentNote,
      });

      alert("Payment Recorded Successfully");

      setPaymentCustomer(null);
      setPaymentAmount("");
      setPaymentNote("");

      fetchCustomers();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to record payment");
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="container-fluid">
      <h2 className="mb-4">Customers</h2>

      <div className="card mb-4">
        <div className="card-header">Add Customer</div>

        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <input
                className="form-control"
                placeholder="Customer Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <input
                className="form-control"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <input
                className="form-control"
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="col-12">
              <button className="btn btn-primary" onClick={addCustomer}>
                Add Customer
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">Customer List</div>

        <div className="card-body">
          <div className="mb-3">
            <input
              className="form-control"
              placeholder="Search Customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Due Amount</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer._id}>
                  <td>{customer.name}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.address}</td>
                  <td>Rs. {customer.dueAmount.toLocaleString()}</td>

                  <td className="d-flex gap-2">
                    <Link
                      to={`/customers/${customer._id}`}
                      className="btn btn-info btn-sm"
                    >
                      View Ledger
                    </Link>

                    {customer.dueAmount > 0 && (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => setPaymentCustomer(customer)}
                      >
                        Receive Payment
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {paymentCustomer && (
        <div
          className="modal d-block"
          style={{
            background: "rgba(0,0,0,0.5)",
          }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Receive Payment</h5>
              </div>

              <div className="modal-body">
                <p>
                  Customer: <strong>{paymentCustomer.name}</strong>
                </p>

                <p>
                  Current Due: <strong>Rs. {paymentCustomer.dueAmount}</strong>
                </p>

                <input
                  type="number"
                  className="form-control mb-2"
                  placeholder="Amount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />

                <input
                  className="form-control"
                  placeholder="Note"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setPaymentCustomer(null)}
                >
                  Cancel
                </button>

                <button className="btn btn-success" onClick={receivePayment}>
                  Save Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;
