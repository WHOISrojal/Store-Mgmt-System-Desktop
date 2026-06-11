import { useEffect, useState } from "react";
import api from "../services/api";

function AuditLogs() {
  const [logs, setLogs] =
    useState([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response =
        await api.get(
          "/audit-logs"
        );

      setLogs(response.data);

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container-fluid">
      <h2 className="mb-4">
        Audit Logs
      </h2>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Date</th>
            <th>User</th>
            <th>Action</th>
            <th>Details</th>
          </tr>
        </thead>

        <tbody>
          {logs.map((log) => (
            <tr key={log._id}>
              <td>
                {new Date(
                  log.createdAt
                ).toLocaleString()}
              </td>

              <td>{log.user}</td>

              <td>
                {log.action.includes("CREATE") && "🟢 "}
                {log.action.includes("DELETE") && "🔴 "}
                {log.action.includes("RESTORE") && "🟡 "}
                {log.action.includes("RESET") && "🔑 "}
                {log.action.includes("UPDATE") && "✏️ "}
                {log.action}
                </td>

              <td>{log.details}</td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}

export default AuditLogs;