import { useEffect, useState } from "react";
import api from "../services/api";

function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);

  const [supplier, setSupplier] = useState("");
  const [product, setProduct] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [quantity, setQuantity] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");

  useEffect(() => {
    fetchPurchases();
    fetchProducts();
    fetchSuppliers();
  }, []);

  const fetchPurchases = async () => {
    try {
      const response = await api.get("/purchases");
      setPurchases(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await api.get("/suppliers");

      setSuppliers(response.data);
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

  const addPurchase = async () => {
    try {
      await api.post("/purchases", {
        supplier,
        product,
        quantity: Number(quantity),
        costPrice: Number(costPrice),
        invoiceNumber,
      });

      fetchPurchases();

      setSupplier("");
      setProduct("");
      setQuantity("");
      setCostPrice("");
      setInvoiceNumber("");

      alert("Purchase Added Successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to add purchase");
    }
  };

  return (
    <div className="container-fluid">
      <h2 className="mb-4">Purchases</h2>

      <div className="card mb-4">
        <div className="card-header">Add Purchase</div>

        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <select
                className="form-control"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
              >
                <option value="">Select Supplier</option>

                {suppliers.map((item) => (
                  <option key={item._id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
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

            <div className="col-md-4">
              <input
                type="number"
                className="form-control"
                placeholder="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <input
                type="number"
                className="form-control"
                placeholder="Cost Price"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <input
                className="form-control"
                placeholder="Invoice Number"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <button className="btn btn-success w-100" onClick={addPurchase}>
                Add Purchase
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">Purchase History</div>

        <div className="card-body">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Cost Price</th>
                <th>Invoice</th>
              </tr>
            </thead>

            <tbody>
              {purchases.map((purchase) => (
                <tr key={purchase._id}>
                  <td>{purchase.supplier}</td>

                  <td>{purchase.product?.name || purchase.product}</td>

                  <td>{purchase.quantity}</td>

                  <td>Rs. {purchase.costPrice}</td>

                  <td>{purchase.invoiceNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Purchases;
