import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const login = async () => {
    try {
      const response =
        await api.post("/auth/login", {
          username,
          password,
        });

      localStorage.setItem(
        "token",
        response.data.token
      );

      localStorage.setItem(
        "role",
        response.data.role
      );

      localStorage.setItem(
        "name",
        response.data.name
      );

      window.location.href = "/";

    } catch (error) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
        "Login Failed"
      );
    }
  };

  return (
    <div
      className="container"
      style={{
        maxWidth: "400px",
        marginTop: "100px",
      }}
    >
      <div className="card">
        <div className="card-body">

          <h2 className="mb-4">
            Store Login
          </h2>

          <input
            className="form-control mb-3"
            placeholder="Username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
          />

          <input
            type="password"
            className="form-control mb-3"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <button
            className="btn btn-primary w-100"
            onClick={login}
          >
            Login
          </button>

        </div>
      </div>
    </div>
  );
}

export default Login;