import { useEffect, useState } from "react";
import api from "../services/api";

function Expenses() {
  const [expenses, setExpenses] = useState([]);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await api.get("/expenses");
      setExpenses(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const addExpense = async () => {
    try {
      await api.post("/expenses", {
        title,
        amount: Number(amount),
        category,
        note,
      });

      fetchExpenses();

      setTitle("");
      setAmount("");
      setCategory("");
      setNote("");

    } catch (error) {
      console.error(error);
      alert("Failed to add expense");
    }
  };

  return (
    <div className="container-fluid">
      <h2 className="mb-4">Expenses</h2>

      <div className="card mb-4">
        <div className="card-header">
          Add Expense
        </div>

        <div className="card-body">
          <div className="row g-3">

            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <input
                type="number"
                className="form-control"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div className="col-12">
              <button
                className="btn btn-primary"
                onClick={addExpense}
              >
                Add Expense
              </button>
            </div>

          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          Expense List
        </div>

        <div className="card-body">

          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>Title</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Note</th>
              </tr>
            </thead>

            <tbody>
              {expenses.map((expense) => (
                <tr key={expense._id}>
                  <td>{expense.title}</td>
                  <td>Rs. {expense.amount}</td>
                  <td>{expense.category}</td>
                  <td>{expense.note}</td>
                </tr>
              ))}
            </tbody>

          </table>

        </div>
      </div>
    </div>
  );
}

export default Expenses;