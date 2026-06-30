import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [address, setAddress] = useState("");
  const [search, setSearch] = useState("");
  const [paymentCustomer, setPaymentCustomer] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);

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

  const closeAddModal = () => {
    setName(""); setPhone(""); setPanNumber(""); setAddress("");
    setAddModalOpen(false);
  };

  const addCustomer = async () => {
    if (!/^\d{9}$/.test(panNumber)) {
      alert("PAN must be exactly 9 digits");
      return;
    }
    try {
      await api.post("/customers", { name, phone, panNumber, address });
      fetchCustomers();
      closeAddModal();
      alert("Customer Added Successfully");
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Failed to add customer");
    }
  };

  const receivePayment = async () => {
    try {
      if (!paymentAmount) return alert("Enter payment amount");
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

  const filteredCustomers = customers.filter((c) => {
    const q = search.toLowerCase();
    const name = (c.name || "").toLowerCase();
    const pan = (c.panNumber || "").toLowerCase();
    return name.includes(q) || pan.includes(q);
  });

  const totalDue = customers.reduce((sum, c) => sum + (c.dueAmount || 0), 0);
  const withDue = customers.filter(c => c.dueAmount > 0).length;

  const overlayStyle = {
    position: "fixed", inset: 0,
    background: "rgba(15,23,42,0.55)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000, padding: "20px",
  };

  const modalStyle = {
    background: "#fff", borderRadius: "var(--rl)",
    width: "100%", maxWidth: "460px",
    display: "flex", flexDirection: "column",
    border: "var(--border)", boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  };

  return (
    <>
      {/* ── Page Header ── */}
      <div className="kb-page-header">
        <div>
          <h1 className="kb-page-title">Customers</h1>
          <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "var(--t3)" }}>
            Manage customers, dues and payment collection
          </p>
        </div>
        <button className="kb-btn kb-btn-primary" onClick={() => setAddModalOpen(true)}>
          <i className="ti ti-plus" />
          Add Customer
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px", marginBottom: "18px" }}>
        <div className="kb-stat-card blue">
          <div className="kb-stat-top">
            <span className="kb-stat-label">Total Customers</span>
            <span className="kb-stat-icon blue"><i className="ti ti-users" /></span>
          </div>
          <div className="kb-stat-value">{customers.length}</div>
        </div>
        <div className="kb-stat-card red">
          <div className="kb-stat-top">
            <span className="kb-stat-label">Total Due</span>
            <span className="kb-stat-icon red"><i className="ti ti-clock-dollar" /></span>
          </div>
          <div className="kb-stat-value red">Rs. {totalDue.toLocaleString()}</div>
        </div>
        <div className="kb-stat-card amber">
          <div className="kb-stat-top">
            <span className="kb-stat-label">Pending Dues</span>
            <span className="kb-stat-icon amber"><i className="ti ti-alert-circle" /></span>
          </div>
          <div className="kb-stat-value amber">{withDue}</div>
        </div>
      </div>

      {/* ── Customer List ── */}
      <div className="kb-card">
        <div className="kb-card-header">
          <h2 className="kb-card-title">
            <i className="ti ti-list" />
            Customer List
          </h2>
          <span style={{ fontSize: "12px", color: "var(--t3)", background: "var(--bg-surface)", border: "var(--border)", borderRadius: "var(--r)", padding: "3px 10px" }}>
            {filteredCustomers.length} customers
          </span>
        </div>

        {/* Search */}
        <div style={{ marginBottom: "16px" }}>
          <div className="kb-search">
            <i className="ti ti-search" />
            <input
              placeholder="Search customers by name or PAN…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="kb-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>PAN</th>
                <th>Address</th>
                <th>Due Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "var(--t3)" }}>
                    <i className="ti ti-users-off" style={{ fontSize: "28px", display: "block", marginBottom: "8px" }} />
                    No customers found
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer._id} style={customer.dueAmount > 0 ? { background: "#fef2f2" } : {}}>
                    {/* Name */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{
                          width: "34px", height: "34px", borderRadius: "50%", flexShrink: 0,
                          background: "var(--blue-b)", display: "flex", alignItems: "center",
                          justifyContent: "center", fontSize: "12px", fontWeight: 700,
                          color: "var(--blue-m)", textTransform: "uppercase",
                        }}>
                          {customer.name?.charAt(0)}
                        </span>
                        <strong style={{ color: "var(--t1)" }}>{customer.name}</strong>
                      </div>
                    </td>

                    {/* Phone */}
                    <td>
                      {customer.phone ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--t2)" }}>
                          <i className="ti ti-phone" style={{ fontSize: "13px", color: "var(--t3)" }} />
                          {customer.phone}
                        </div>
                      ) : <span style={{ color: "var(--t3)" }}>—</span>}
                    </td>

                    {/* PAN */}
                    <td>
                      {customer.panNumber ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--t2)" }}>
                          <i className="ti ti-id" style={{ fontSize: "13px", color: "var(--t3)" }} />
                          {customer.panNumber}
                        </div>
                      ) : <span style={{ color: "var(--t3)" }}>—</span>}
                    </td>

                    {/* Address */}
                    <td>
                      {customer.address ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--t2)" }}>
                          <i className="ti ti-map-pin" style={{ fontSize: "13px", color: "var(--t3)" }} />
                          {customer.address}
                        </div>
                      ) : <span style={{ color: "var(--t3)" }}>—</span>}
                    </td>

                    {/* Due */}
                    <td>
                      {customer.dueAmount > 0 ? (
                        <span className="kb-badge red">
                          <i className="ti ti-alert-circle" style={{ fontSize: "10px" }} />
                          Rs. {customer.dueAmount.toLocaleString()}
                        </span>
                      ) : (
                        <span className="kb-badge green">
                          <i className="ti ti-check" style={{ fontSize: "10px" }} />
                          Cleared
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <Link
                          to={`/customers/${customer._id}`}
                          className="kb-btn kb-btn-outline"
                          style={{ padding: "5px 10px", fontSize: "11.5px" }}
                        >
                          <i className="ti ti-book" /> Ledger
                        </Link>
                        {customer.dueAmount > 0 && (
                          <button
                            className="kb-btn kb-btn-success"
                            style={{ padding: "5px 10px", fontSize: "11.5px" }}
                            onClick={() => setPaymentCustomer(customer)}
                          >
                            <i className="ti ti-cash" /> Receive Payment
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════
          ADD CUSTOMER MODAL
      ══════════════════════════════════════ */}
      {addModalOpen && (
        <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) closeAddModal(); }}>
          <div style={modalStyle}>

            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "18px 22px", borderBottom: "var(--border)", flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
                <span style={{
                  width: "38px", height: "38px", borderRadius: "10px",
                  background: "var(--blue-b)", display: "flex", alignItems: "center",
                  justifyContent: "center", color: "var(--blue-m)", fontSize: "20px",
                }}>
                  <i className="ti ti-user-plus" />
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--t1)" }}>Add Customer</div>
                  <div style={{ fontSize: "12px", color: "var(--t3)", marginTop: "1px" }}>Enter customer details below</div>
                </div>
              </div>
              <button onClick={closeAddModal} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--t3)", fontSize: "22px", lineHeight: 1, padding: "4px", borderRadius: "6px" }}>
                <i className="ti ti-x" />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="kb-label">Customer Name</label>
                <input className="kb-input" placeholder="e.g. Ram Bahadur" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="kb-label">Phone Number</label>
                <input className="kb-input" placeholder="e.g. 9800000000" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div>
                <label className="kb-label">PAN Number</label>
                <input
                  className="kb-input"
                  placeholder="e.g. 123456789"
                  value={panNumber}
                  maxLength={9}
                  onChange={e => setPanNumber(e.target.value.replace(/\D/g, "").slice(0, 9))}
                />
              </div>
              <div>
                <label className="kb-label">Address <span style={{ color: "var(--t3)", fontWeight: 400 }}>(optional)</span></label>
                <input className="kb-input" placeholder="e.g. Baneshwor, Kathmandu" value={address} onChange={e => setAddress(e.target.value)} />
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: "14px 22px", borderTop: "var(--border)",
              display: "flex", justifyContent: "flex-end", gap: "10px", flexShrink: 0,
              background: "var(--bg-surface)", borderRadius: "0 0 var(--rl) var(--rl)",
            }}>
              <button className="kb-btn kb-btn-outline" onClick={closeAddModal}>
                <i className="ti ti-x" /> Cancel
              </button>
              <button className="kb-btn kb-btn-primary" onClick={addCustomer}>
                <i className="ti ti-circle-plus" /> Add Customer
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          RECEIVE PAYMENT MODAL
      ══════════════════════════════════════ */}
      {paymentCustomer && (
        <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) { setPaymentCustomer(null); setPaymentAmount(""); setPaymentNote(""); } }}>
          <div style={{ ...modalStyle, maxWidth: "420px" }}>

            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "18px 22px", borderBottom: "var(--border)", flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
                <span style={{
                  width: "38px", height: "38px", borderRadius: "10px",
                  background: "var(--green-b)", display: "flex", alignItems: "center",
                  justifyContent: "center", color: "var(--green-m)", fontSize: "20px",
                }}>
                  <i className="ti ti-cash" />
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--t1)" }}>Receive Payment</div>
                  <div style={{ fontSize: "12px", color: "var(--t3)", marginTop: "1px" }}>
                    From: <strong style={{ color: "var(--t2)" }}>{paymentCustomer.name}</strong>
                  </div>
                </div>
              </div>
              <button onClick={() => { setPaymentCustomer(null); setPaymentAmount(""); setPaymentNote(""); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--t3)", fontSize: "22px", lineHeight: 1, padding: "4px", borderRadius: "6px" }}>
                <i className="ti ti-x" />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>

              {/* Due summary */}
              <div style={{
                background: "var(--red-b)", border: "1px solid var(--red-bd)",
                borderRadius: "var(--r)", padding: "12px 14px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ fontSize: "12.5px", color: "var(--red)", fontWeight: 600 }}>
                  <i className="ti ti-alert-circle" style={{ marginRight: "6px" }} />
                  Current Due Balance
                </span>
                <span style={{ fontSize: "15px", fontWeight: 800, color: "var(--red-m)" }}>
                  Rs. {paymentCustomer.dueAmount?.toLocaleString()}
                </span>
              </div>

              <div>
                <label className="kb-label">Payment Amount (Rs.)</label>
                <input
                  type="number"
                  className="kb-input"
                  placeholder="Enter amount received"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                />
              </div>

              <div>
                <label className="kb-label">Note <span style={{ color: "var(--t3)", fontWeight: 400 }}>(optional)</span></label>
                <input
                  className="kb-input"
                  placeholder="e.g. Cash payment for June"
                  value={paymentNote}
                  onChange={e => setPaymentNote(e.target.value)}
                />
              </div>

              {/* Remaining preview */}
              {paymentAmount && (
                <div style={{
                  background: "var(--green-b)", border: "1px solid var(--green-bd)",
                  borderRadius: "var(--r)", padding: "12px 14px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span style={{ fontSize: "12.5px", color: "var(--green)", fontWeight: 600 }}>
                    <i className="ti ti-calculator" style={{ marginRight: "6px" }} />
                    Remaining After Payment
                  </span>
                  <span style={{ fontSize: "15px", fontWeight: 800, color: "var(--green-m)" }}>
                    Rs. {Math.max(0, paymentCustomer.dueAmount - Number(paymentAmount)).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: "14px 22px", borderTop: "var(--border)",
              display: "flex", justifyContent: "flex-end", gap: "10px", flexShrink: 0,
              background: "var(--bg-surface)", borderRadius: "0 0 var(--rl) var(--rl)",
            }}>
              <button className="kb-btn kb-btn-outline" onClick={() => { setPaymentCustomer(null); setPaymentAmount(""); setPaymentNote(""); }}>
                <i className="ti ti-x" /> Cancel
              </button>
              <button className="kb-btn kb-btn-success" onClick={receivePayment}>
                <i className="ti ti-device-floppy" /> Save Payment
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

export default Customers;