import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRef } from "react";

function Invoice() {
  const { id } = useParams();

  const [sale, setSale] = useState(null);
  const [settings, setSettings] = useState(null);
  const invoiceRef = useRef();
  const [returnQty, setReturnQty] = useState("");
  const [returns, setReturns] = useState([]);
  const [returnReason, setReturnReason] = useState("");

  useEffect(() => {
    fetchInvoice();
    fetchSettings();
    fetchReturns();
  }, []);

  const fetchInvoice = async () => {
    try {
      const response = await api.get(`/sales/${id}`);

      setSale(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await api.get("/settings");

      setSettings(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const downloadPDF = async () => {
    const element = invoiceRef.current;

    const canvas = await html2canvas(element);

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();

    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

    pdf.save(`Invoice-${sale._id}.pdf`);
  };

  const fetchReturns = async () => {
    try {
      const response = await api.get(`/sale-returns/${id}`);

      setReturns(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const returnItem = async (productId) => {
    const quantity = prompt("Enter return quantity");

    if (!quantity) return;

    const reason = prompt("Reason for return");

    try {
      await api.post("/sale-returns", {
        saleId: sale._id,
        productId,
        quantity: Number(quantity),
        reason,
      });

      alert("Return processed successfully");
    } catch (error) {
      console.error(error);

      alert(error?.response?.data?.message || "Failed to process return");
    }
  };
  if (!sale || !settings) {
    return <h3>Loading...</h3>;
  }

  return (
    <div className="container mt-4">
      <div
        ref={invoiceRef}
        className="card shadow border-0"
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          borderRadius: "15px",
        }}
      >
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <h1 className="fw-bold">🏪 {settings.storeName}</h1>

            <p className="mb-1"> {settings.address}</p>

            <p className="mb-1">Phone: {settings.phone}</p>

            <p className="mb-1">VAT/PAN: {settings.vatNumber}</p>

            <p className="text-muted mt-2">Sales Invoice</p>
          </div>

          <hr />

          <div className="row mb-4">
            <div className="col-md-6">
              <h5>Invoice Details</h5>

              <p className="mb-1">
                <strong>Invoice ID:</strong> INV-
                {sale._id.slice(-6).toUpperCase()}
              </p>

              <p className="mb-1">
                <strong>Date:</strong>{" "}
                {new Date(sale.createdAt).toLocaleDateString("en-GB")}
              </p>

              <p className="mb-1">
                <strong>Payment Type:</strong> {sale.paymentType}
              </p>
              
              {sale.paymentType === "CHEQUE" && (
                <>
                  <p className="mb-1">
                    <strong>Cheque No:</strong> {sale.chequeNumber}
                  </p>

                  <p className="mb-1">
                    <strong>Bank:</strong> {sale.bankName}
                  </p>

                  <p className="mb-1">
                    <strong>Cheque Date:</strong>{" "}
                    {new Date(sale.chequeDate).toLocaleDateString("en-GB")}
                  </p>

                  <p className="mb-1">
                    <strong>Cheque Status:</strong> {sale.chequeStatus}
                  </p>
                </>
              )}
            </div>

            <div className="col-md-6 text-md-end">
              <h5>Customer</h5>
              <p className="mb-1">
                {sale.customer?.name || "Walk-in Customer"}
              </p>
            </div>
          </div>

          <table className="table table-bordered">
            <thead className="table-light">
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {sale.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.product?.name}</td>

                  <td>{item.quantity}</td>

                  <td>Rs. {item.sellingPrice.toLocaleString()}</td>

                  <td>Rs. {item.total.toLocaleString()}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => returnItem(item.product?._id)}
                    >
                      Return
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-end mt-4">
            <h3 className="fw-bold">
              Grand Total: Rs. {sale.totalAmount.toLocaleString()}
            </h3>
          </div>

          {returns.length > 0 && (
            <div className="mt-5">
              <h4>Return History</h4>

              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Reason</th>
                  </tr>
                </thead>

                <tbody>
                  {returns.map((item) => (
                    <tr key={item._id}>
                      <td>{new Date(item.createdAt).toLocaleDateString()}</td>

                      <td>{item.product?.name}</td>

                      <td>{item.quantity}</td>

                      <td>{item.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <hr />

          <div className="text-center mt-4">
            <p className="text-muted">Thank You For Shopping</p>

            <div className="d-flex gap-2 justify-content-center">
              <button
                className="btn btn-primary"
                onClick={() => window.print()}
              >
                🖨 Print Invoice
              </button>

              <button className="btn btn-success" onClick={downloadPDF}>
                📄 Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Invoice;
