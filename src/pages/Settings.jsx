import { useEffect, useState } from "react";
import api from "../services/api";

function Settings() {
  const [storeName, setStoreName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [vatNumber, setVatNumber] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get("/settings");

      setStoreName(response.data.storeName);
      setAddress(response.data.address);
      setPhone(response.data.phone);
      setVatNumber(response.data.vatNumber);

    } catch (error) {
      console.error(error);
    }
  };

  const saveSettings = async () => {
      try {
        await api.put("/settings", {
          storeName,
          address,
          phone,
          vatNumber,
        });

        alert("Settings Saved Successfully");

      } catch (error) {
    console.error(error);

    alert(
      error?.response?.data?.message ||
      error.message
    );
  }
    };

    const downloadBackup = async () => {
    try {

      const response =
        await api.get(
          "/backup/export"
        );

      const dataStr =
        JSON.stringify(
          response.data,
          null,
          2
        );

      const blob = new Blob(
        [dataStr],
        {
          type:
            "application/json",
        }
      );

      const url =
        window.URL.createObjectURL(
          blob
        );

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `backup-${
          new Date()
            .toISOString()
            .split("T")[0]
        }.json`;

      link.click();

      window.URL.revokeObjectURL(
        url
      );

    } catch (error) {
      console.error(error);

      alert(
        "Failed to download backup"
      );
    }
  };

  const restoreBackup = async (event) => {
  try {
      const file =
        event.target.files[0];

      if (!file) return;

      const text =
        await file.text();

      const backup =
        JSON.parse(text);

      if (
        !window.confirm(
          "This will overwrite all current data. Continue?"
        )
      ) {
        return;
      }

      await api.post(
        "/backup/restore",
        backup
      );

      alert(
        "Backup restored successfully"
      );

    } catch (error) {

      console.error(error);

      alert(
        error?.response?.data?.message ||
        "Failed to restore backup"
      );
    }
  };

  return (
    <div className="container-fluid">
      <h2 className="mb-4">
        Store Settings
      </h2>

      <div className="card shadow">
        <div className="card-body">

          <div className="mb-3">
            <label className="form-label">
              Store Name
            </label>

            <input
              className="form-control"
              value={storeName}
              onChange={(e) =>
                setStoreName(e.target.value)
              }
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              Address
            </label>

            <input
              className="form-control"
              value={address}
              onChange={(e) =>
                setAddress(e.target.value)
              }
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              Phone Number
            </label>

            <input
              className="form-control"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              VAT / PAN Number
            </label>

            <input
              className="form-control"
              value={vatNumber}
              onChange={(e) =>
                setVatNumber(e.target.value)
              }
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={saveSettings}
          >
            Save Settings
          </button>

          <button
            className="btn btn-success"
            onClick={downloadBackup}
          >
            Download Backup
          </button>
          <div className="mt-3">
            <label
              className="btn btn-danger"
            >
              Restore Backup

              <input
                type="file"
                accept=".json"
                hidden
                onChange={restoreBackup}
              />
            </label>

          </div>

        </div>
      </div>
    </div>
  );
}

export default Settings;