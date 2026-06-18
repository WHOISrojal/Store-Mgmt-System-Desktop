import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Pagination from "../components/Pagination";

function Sales() {
  const [sales, setSales] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [products, setProducts] = useState([]);
  const [paymentType, setPaymentType] = useState("CASH");
  const [chequeNumber, setChequeNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [chequeDate, setChequeDate] = useState("");
  const [customer, setCustomer] = useState("");
  const [product, setProduct] = useState("");
  const [barcode, setBarcode] = useState("");
  const [quantity, setQuantity] = useState("");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [cart, setCart] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerList, setShowCustomerList] = useState(false);
  const [paidAmount, setPaidAmount] = useState("");
  const [editingSale, setEditingSale] = useState(null);
  const [editItems, setEditItems] = useState([]);

  const role = localStorage.getItem("role");

  useEffect(() => {
    fetchSales(currentPage);
    fetchProducts();
    fetchCustomers();
  }, [currentPage]);

  const fetchSales = async (page = 1) => {
    try {
      const response = await api.get(`/sales?page=${page}`);

      setSales(response.data.sales);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products/all");

      setProducts(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get("/customers");

      setCustomers(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(customerSearch.toLowerCase()),
  );

  const findByBarcode = () => {
    const foundProduct = products.find((p) => p.barcode === barcode);

    if (!foundProduct) {
      return alert("Product not found");
    }

    const existingItem = cart.find((item) => item.product === foundProduct._id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.product === foundProduct._id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        ),
      );
    } else {
      setCart([
        ...cart,
        {
          product: foundProduct._id,
          name: foundProduct.name,
          quantity: 1,
        },
      ]);
    }

    setBarcode("");
  };

  const addToCart = () => {
    if (!product || !quantity) {
      return alert("Select product and quantity");
    }

    const selectedProduct = products.find((p) => p._id === product);

    const existingItem = cart.find((item) => item.product === product);

    if (Number(quantity) > selectedProduct.stock) {
      return alert(`Only ${selectedProduct.stock} items available`);
    }

    if (existingItem) {
      const newQuantity = existingItem.quantity + Number(quantity);

      if (newQuantity > selectedProduct.stock) {
        return alert(`Only ${selectedProduct.stock} items available`);
      }

      setCart(
        cart.map((item) =>
          item.product === product
            ? {
                ...item,
                quantity: newQuantity,
              }
            : item,
        ),
      );
    } else {
      setCart([
        ...cart,
        {
          product,
          name: selectedProduct.name,
          quantity: Number(quantity),
        },
      ]);
    }

    setProduct("");
    setQuantity("");
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.product !== productId));
  };

  const addSale = async () => {
    try {
      if (cart.length === 0) {
        return alert("Cart is empty");
      }

      if (paymentType === "CREDIT" && !customer) {
        return alert("Select customer for credit sale");
      }

      const totalAmount = cart.reduce((total, item) => {
        const productData = products.find((p) => p._id === item.product);

        return total + (productData?.sellingPrice || 0) * item.quantity;
      }, 0);

      const paid = Number(paidAmount) || 0;

      if (paid > totalAmount) {
        return alert("Paid amount cannot exceed total bill");
      }

      if (paymentType === "CHEQUE") {
        if (!chequeNumber || !bankName || !chequeDate) {
          return alert("Cheque Number, Bank Name and Cheque Date are required");
        }
      }
      const saleResponse = await api.post("/sales", {
        customer,
        paymentType,

        chequeNumber,
        bankName,
        chequeDate,

        items: cart.map((item) => ({
          product: item.product,
          quantity: item.quantity,
        })),
      });

      if (paymentType === "CREDIT" && customer) {
        if (paid > 0) {
          await api.post("/customer-transactions/payment", {
            customerId: customer,
            amount: paid,
            note: `Advance Payment #${saleResponse.data._id}`,
          });
        }
      }

      fetchSales();

      setCustomer("");
      setCustomerSearch("");
      setShowCustomerList(false);
      setPaymentType("CASH");
      setPaidAmount("");
      setCart([]);

      alert("Sale Added Successfully");
    } catch (error) {
      console.error(error);

      alert(error?.response?.data?.message || "Failed to create sale");
    }
  };

  const saveSaleChanges = async () => {
    try {
      await api.put(`/sales/${editingSale._id}`, {
        items: editItems.filter((item) => item.quantity > 0),
      });

      alert("Sale updated successfully");

      setEditingSale(null);
      setEditItems([]);

      fetchSales();
      fetchProducts();
    } catch (error) {
      console.error(error);

      console.log(error.response?.data);

      alert(JSON.stringify(error.response?.data || error.message));
    }
  };

  const updateChequeStatus = async (saleId, status) => {
    try {
      await api.put(`/sales/${saleId}/cheque-status`, {
        status,
      });

      fetchSales();

      alert(`Cheque marked as ${status}`);
    } catch (error) {
      console.error(error);

      alert(error?.response?.data?.message || "Failed to update cheque");
    }
  };

  const deleteSale = async (id) => {
    if (!window.confirm("Delete this sale and restore stock?")) {
      return;
    }

    try {
      await api.delete(`/sales/${id}`);

      fetchSales();

      alert("Sale deleted successfully");
    } catch (error) {
      console.error(error);

      alert(error?.response?.data?.message || "Failed to delete sale");
    }
  };

  const filteredSales = sales.filter((sale) => {
    const customerName = sale.customer?.name || "Walk-in Customer";

    const customerMatch = customerName
      .toLowerCase()
      .includes(search.toLowerCase());

    const saleDate = new Date(sale.createdAt);

    const fromMatch = !fromDate || saleDate >= new Date(fromDate);

    const toMatch = !toDate || saleDate <= new Date(toDate + "T23:59:59");

    return customerMatch && fromMatch && toMatch;
  });

  const selectedProduct = products.find((p) => p._id === product);

  return (
    <div className="container-fluid">
      <h2 className="mb-4">Sales</h2>

      <div className="card mb-4">
        <div className="card-header">Create Sale</div>

        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4 position-relative">
              <label className="form-label fw-semibold">Customer</label>

              <input
                className="form-control"
                placeholder="Search Customer..."
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setShowCustomerList(true);
                }}
              />

              {showCustomerList && customerSearch && (
                <div
                  className="border bg-white shadow-sm"
                  style={{
                    maxHeight: "200px",
                    overflowY: "auto",
                    position: "absolute",
                    width: "100%",
                    zIndex: 1000,
                  }}
                >
                  {filteredCustomers.map((item) => (
                    <div
                      key={item._id}
                      className="p-2 border-bottom"
                      style={{
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        setCustomer(item._id);
                        setCustomerSearch(item.name);
                        setShowCustomerList(false);
                      }}
                    >
                      {item.name}
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                className="btn btn-warning btn-sm mt-2"
                onClick={() => {
                  setCustomer("");
                  setCustomerSearch("");
                  setShowCustomerList(false);
                }}
              >
                Clear Customer (Walk-in Sale)
              </button>
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold">Payment Type</label>
              <select
                className="form-control"
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
              >
                <option value="CASH">CASH</option>
                <option value="CREDIT">CREDIT</option>
                <option value="CHEQUE">CHEQUE</option>
              </select>
            </div>

            {paymentType === "CREDIT" && (
              <div className="col-md-3">
                <label className="form-label fw-semibold">Paid Now</label>

                <input
                  type="number"
                  className="form-control"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  placeholder="0"
                />
              </div>
            )}

            {paymentType === "CHEQUE" && (
              <>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">
                    Cheque Number
                  </label>

                  <input
                    className="form-control"
                    value={chequeNumber}
                    onChange={(e) => setChequeNumber(e.target.value)}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label fw-semibold">Bank Name</label>

                  <input
                    className="form-control"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label fw-semibold">Cheque Date</label>

                  <input
                    type="date"
                    className="form-control"
                    value={chequeDate}
                    onChange={(e) => setChequeDate(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="col-md-6">
              <label className="form-label fw-semibold">Enter Barcode</label>
              <input
                className="form-control"
                placeholder="Enter Barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    findByBarcode();
                  }
                }}
              />
              <label className="form-label fw-semibold">Select Product</label>
              <select
                className="form-control"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
              >
                <option value="">Select Product</option>

                {products.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedProduct && (
              <div className="col-md-4">
                <div
                  className="card"
                  style={{
                    maxWidth: "220px",
                  }}
                >
                  <div className="card-body text-center">
                    {selectedProduct.image && (
                      <img
                        src={`http://localhost:5000${selectedProduct.image}`}
                        alt={selectedProduct.name}
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                          borderRadius: "10px",
                        }}
                      />
                    )}

                    <h6 className="mt-2">{selectedProduct.name}</h6>

                    <div>Rs. {selectedProduct.sellingPrice}</div>

                    <div>Stock: {selectedProduct.stock}</div>

                    {selectedProduct.stock <= selectedProduct.minimumStock && (
                      <div className="text-danger fw-bold">LOW STOCK</div>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div className="col-md-4">
              <label className="form-label fw-semibold">Enter Quantity</label>
              <input
                type="number"
                className="form-control"
                placeholder="Enter Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div className="col-12 d-flex gap-2">
              <button className="btn btn-secondary" onClick={findByBarcode}>
                Find Barcode
              </button>
              <button className="btn btn-success" onClick={addToCart}>
                Add To Cart
              </button>

              <div className="text-end mt-3">
                <h4>
                  Grand Total: Rs.{" "}
                  {cart.reduce((total, item) => {
                    const productData = products.find(
                      (p) => p._id === item.product,
                    );

                    return (
                      total + (productData?.sellingPrice || 0) * item.quantity
                    );
                  }, 0)}
                </h4>
              </div>

              <button className="btn btn-primary" onClick={addSale}>
                Create Sale
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="card mb-4">
        <div className="card-header">Cart</div>

        <div className="card-body">
          {cart.length === 0 ? (
            <p>No items in cart.</p>
          ) : (
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {cart.map((item) => {
                  const productData = products.find(
                    (p) => p._id === item.product,
                  );

                  return (
                    <tr key={item.product}>
                      <td>
                        {productData?.image ? (
                          <img
                            src={`http://localhost:5000${productData.image}`}
                            alt={item.name}
                            style={{
                              width: "50px",
                              height: "50px",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                        ) : (
                          "No Image"
                        )}
                      </td>

                      <td>{item.name}</td>

                      <td>Rs. {productData?.sellingPrice || 0}</td>

                      <td>{item.quantity}</td>

                      <td>
                        Rs. {(productData?.sellingPrice || 0) * item.quantity}
                      </td>

                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => removeFromCart(item.product)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {editingSale && (
        <div className="card mb-4">
          <div className="card-header bg-warning">Edit Sale</div>

          <div className="card-body">
            {editItems.map((item, index) => (
              <div key={item.product} className="row mb-3 align-items-center">
                <div className="col-md-4">
                  <strong>{item.name}</strong>
                </div>

                <div className="col-md-3">
                  <input
                    type="number"
                    className="form-control"
                    value={item.quantity}
                    onChange={(e) => {
                      const updated = [...editItems];

                      updated[index].quantity = Number(e.target.value);

                      setEditItems(updated);
                    }}
                  />
                </div>

                <div className="col-md-3">
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      setEditItems(editItems.filter((_, i) => i !== index));
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <hr />

            <h6>Add Product</h6>

            <select
              className="form-select mb-3"
              onChange={(e) => {
                const product = products.find((p) => p._id === e.target.value);

                if (!product) return;

                setEditItems([
                  ...editItems,
                  {
                    product: product._id,
                    name: product.name,
                    quantity: 1,
                  },
                ]);
              }}
            >
              <option value="">Select Product</option>

              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>

            <button className="btn btn-success" onClick={saveSaleChanges}>
              Save Changes
            </button>

            <button
              className="btn btn-secondary ms-2"
              onClick={() => {
                setEditingSale(null);
                setEditItems([]);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <div className="card">
        <div className="card-header">Sales History</div>

        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-4">
              <input
                className="form-control"
                placeholder="Search Customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <input
                type="date"
                className="form-control"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <input
                type="date"
                className="form-control"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>

          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Payment</th>
                <th>Cheque</th>
                <th>Status</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Invoice</th>
                {role === "ADMIN" && <th>Actions</th>}

                {role === "ADMIN" && <th>Profit</th>}
              </tr>
            </thead>

            <tbody>
              {filteredSales.map((sale) => (
                <tr key={sale._id}>
                  <td>{new Date(sale.createdAt).toLocaleDateString()}</td>

                  <td>{sale.customer?.name || "Walk-in Customer"}</td>

                  <td>
                    <span
                      className={
                        sale.paymentType === "CREDIT"
                          ? "badge bg-warning"
                          : "badge bg-success"
                      }
                    >
                      {sale.paymentType}
                    </span>
                  </td>

                  <td>
                    {sale.paymentType === "CHEQUE" ? sale.chequeNumber : "-"}
                  </td>

                  <td>
                    {sale.paymentType === "CHEQUE" ? (
                      <span
                        className={
                          sale.chequeStatus === "CLEARED"
                            ? "badge bg-success"
                            : sale.chequeStatus === "BOUNCED"
                              ? "badge bg-danger"
                              : "badge bg-warning"
                        }
                      >
                        {sale.chequeStatus}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td>{sale.items?.length || 0} Items</td>

                  <td>Rs. {sale.totalAmount}</td>

                  <td>
                    <Link
                      to={`/invoice/${sale._id}`}
                      className="btn btn-success btn-sm"
                    >
                      View Invoice
                    </Link>
                  </td>
                  {role === "ADMIN" && (
                    <td>
                      <button
                        className="btn btn-warning me-2"
                        onClick={() => {
                          setEditingSale(sale);

                          setEditItems(
                            sale.items.map((item) => ({
                              product: item.product._id,
                              name: item.product.name,
                              quantity: item.quantity,
                            })),
                          );
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-danger"
                        onClick={() => deleteSale(sale._id)}
                      >
                        Delete
                      </button>

                      {sale.paymentType === "CHEQUE" &&
                        sale.chequeStatus === "PENDING" && (
                          <>
                            <button
                              className="btn btn-success ms-2"
                              onClick={() =>
                                updateChequeStatus(sale._id, "CLEARED")
                              }
                            >
                              Clear
                            </button>

                            <button
                              className="btn btn-secondary ms-2"
                              onClick={() =>
                                updateChequeStatus(sale._id, "BOUNCED")
                              }
                            >
                              Bounce
                            </button>
                          </>
                        )}
                    </td>
                  )}

                  {role === "ADMIN" && <td>Rs. {sale.profit}</td>}
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}

export default Sales;
