import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response =
        await api.get("/suppliers");

      setSuppliers(response.data);

    } catch (error) {
      console.error(error);
    }
  };

  const addSupplier = async () => {
    try {
      await api.post("/suppliers", {
        name,
        phone,
        address,
        notes,
      });

      fetchSuppliers();

      setName("");
      setPhone("");
      setAddress("");
      setNotes("");

      alert("Supplier Added");

    } catch (error) {
      console.error(error);

      alert("Failed to add supplier");
    }
  };

  const deleteSupplier = async (id) => {
    if (
      !window.confirm(
        "Delete this supplier?"
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/suppliers/${id}`
      );

      fetchSuppliers();

      alert("Supplier Deleted");

    } catch (error) {
      console.error(error);

      alert(
        "Failed to delete supplier"
      );
    }
  };

  return (
    <div className="container-fluid">
      <h2 className="mb-4">
        Suppliers
      </h2>

      <div className="card mb-4">
        <div className="card-body">

          <div className="row g-3">

            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
              />
            </div>

            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Phone"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
              />
            </div>

            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Address"
                value={address}
                onChange={(e) =>
                  setAddress(e.target.value)
                }
              />
            </div>

            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Notes"
                value={notes}
                onChange={(e) =>
                  setNotes(e.target.value)
                }
              />
            </div>

            <div className="col-md-3">
              <button
                className="btn btn-success w-100"
                onClick={addSupplier}
              >
                Add
              </button>
            </div>

          </div>

        </div>
      </div>

      <div className="card">
        <div className="card-body">

          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {suppliers.map(
                (supplier) => (
                  <tr key={supplier._id}>
                    <td>{supplier.name}</td>
                    <td>{supplier.phone}</td>
                    <td>{supplier.address}</td>
                    <td>{supplier.notes}</td>

                    <td>
                    <Link
                        to={`/suppliers/${supplier._id}`}
                        className="btn btn-primary btn-sm me-2"
                    >
                        Ledger
                    </Link>

                    {localStorage.getItem("role") === "ADMIN" && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() =>
                          deleteSupplier(
                            supplier._id
                          )
                        }
                      >
                        Delete
                      </button>
                    )}

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

export default Suppliers;