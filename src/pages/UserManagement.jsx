import { useEffect, useState } from "react";
import api from "../services/api";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CASHIER");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
  try {
    const response = await api.get("/users");

    console.log("USERS:", response.data);

    setUsers(response.data);

  } catch (error) {
    console.log(
      "FETCH USERS ERROR:",
      error.response?.data
    );

    console.log(
      "STATUS:",
      error.response?.status
    );
  }
};

  const createUser = async () => {
    try {
      await api.post("/auth/register", {
        name,
        username,
        password,
        role,
      });

      fetchUsers();

      setName("");
      setUsername("");
      setPassword("");
      setRole("CASHIER");

      alert("User Created");
    } catch (error) {
      console.error(error);

      alert(error?.response?.data?.message || "Failed to create user");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) {
      return;
    }

    try {
      await api.delete(`/users/${id}`);

      fetchUsers();

      alert("User Deleted");
    } catch (error) {
      console.error(error);

      alert("Failed to delete user");
    }
  };

  const resetPassword = async (id) => {
    const newPassword = prompt("Enter New Password");

    if (!newPassword) {
      return;
    }

    try {
      await api.put(`/users/${id}/password`, {
        password: newPassword,
      });

      alert("Password Reset Successfully");
    } catch (error) {
      console.error(error);

      alert("Failed to Reset Password");
    }
  };

  return (
    <div className="container-fluid">
      <h2 className="mb-4">User Management</h2>

      <div className="card">
        <div className="card-body">
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <select
                className="form-control"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="CASHIER">CASHIER</option>

                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <div className="col-md-3">
              <button className="btn btn-primary w-100" onClick={createUser}>
                Create User
              </button>
            </div>
          </div>

          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.username}</td>
                  <td>{user.role}</td>

                  <td>
                    {user.role !== "ADMIN" && (
                      <>
                        <button
                          className="btn btn-warning btn-sm me-2"
                          onClick={() => resetPassword(user._id)}
                        >
                          Reset Password
                        </button>

                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteUser(user._id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;
