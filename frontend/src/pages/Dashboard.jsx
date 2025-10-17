import React, { useState, useEffect } from "react";
import { Card, Button, QRCode, Input, Space, message, Spin } from "antd";
import { useAuth } from "../contexts/AuthContext";

function Dashboard() {
  const [text, setText] = useState("http://flobozar.com/");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user, apiCall } = useAuth();

  // Load user's QR text from backend
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await apiCall("/dashboard");
      if (response.ok) {
        const data = await response.json();
        setText(data.qr_text || "http://flobozar.com/");
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      message.error("Failed to load your data");
    } finally {
      setLoading(false);
    }
  };

  // Save QR text to backend
  const saveQRText = async (newText) => {
    setSaving(true);
    try {
      const response = await apiCall("/data/qr_text", {
        method: "PUT",
        body: JSON.stringify({ value: newText }),
      });

      if (response.ok) {
        message.success("QR text saved successfully!");
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      console.error("Failed to save QR text:", error);
      message.error("Failed to save QR text");
    } finally {
      setSaving(false);
    }
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);

    // Auto-save after user stops typing (debounced)
    clearTimeout(window.qrSaveTimeout);
    window.qrSaveTimeout = setTimeout(() => {
      saveQRText(newText);
    }, 1000);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px" }}>
        <Spin size="large" />
        <p style={{ marginTop: "20px" }}>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <Card title="Dashboard" className="responsive-card">
      <div style={{ textAlign: "center" }}>
        <h2 className="responsive-text" style={{ marginBottom: "8px" }}>
          Welcome to your Dashboard, {user?.username}!
        </h2>
        <p className="responsive-text" style={{ marginBottom: "8px" }}>
          You have successfully logged in!
        </p>
        <p
          className="responsive-text"
          style={{
            color: "#666",
            marginBottom: "24px",
            lineHeight: "1.5",
          }}
        >
          Your data is automatically saved as you type.
        </p>

        <Space
          direction="vertical"
          align="center"
          size="large"
          style={{ width: "100%" }}
        >
          <QRCode value={text || "-"} size={160} />

          <Input
            placeholder="Enter text for QR code"
            maxLength={60}
            value={text}
            onChange={handleTextChange}
            style={{
              width: "100%",
              maxWidth: "min(350px, 90vw)",
              fontSize: "16px", // Prevents zoom on iOS
            }}
            suffix={saving ? <Spin size="small" /> : null}
          />

          <Button
            type="primary"
            onClick={() => saveQRText(text)}
            loading={saving}
            className="responsive-button"
            style={{ minWidth: "120px" }}
          >
            {saving ? "Saving..." : "Save QR Text"}
          </Button>

          <p
            className="responsive-text"
            style={{
              color: "#666",
              fontSize: "12px",
              margin: 0,
              textAlign: "center",
            }}
          >
            Changes are saved automatically
          </p>
        </Space>
      </div>
    </Card>
  );
}

export default Dashboard;
