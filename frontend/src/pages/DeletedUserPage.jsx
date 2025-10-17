import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Card, Alert, Button, Typography } from "antd";
import "./DeletedUserPage.scss";

const { Title, Text } = Typography;

const DeletedUserPage = () => {
  const location = useLocation();
  const { isOwner } = useAuth();

  // Check if we're in admin mode (owner accessing via admin route)
  const isAdminView = location.pathname === "/admin/deleted-users" && isOwner();

  if (isAdminView) {
    return (
      <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
        <Title level={2}>Deleted Users Management</Title>

        <Alert
          message="Hard Delete System"
          description="This system currently uses hard delete, which means deleted users are permanently removed from the database and cannot be recovered or viewed."
          type="info"
          showIcon
          style={{ marginBottom: "24px" }}
        />

        <Card title="Current Implementation">
          <Text>
            When users are deleted through the admin interface, they are
            completely removed from the database. This means:
          </Text>
          <ul style={{ marginTop: "12px", marginLeft: "20px" }}>
            <li>Deleted users cannot be recovered</li>
            <li>There's no audit trail of deleted users</li>
            <li>All user data is permanently lost</li>
          </ul>
        </Card>

        <Card title="Recommendations" style={{ marginTop: "16px" }}>
          <Text>Consider implementing a soft delete system that would:</Text>
          <ul style={{ marginTop: "12px", marginLeft: "20px" }}>
            <li>
              Add a <code>deleted_at</code> field to track when users were
              deleted
            </li>
            <li>
              Add a <code>deleted_by</code> field to track who deleted the user
            </li>
            <li>Keep deleted users in the database for audit purposes</li>
            <li>Provide options to restore accidentally deleted users</li>
            <li>Show deleted users in this interface</li>
          </ul>
        </Card>
      </div>
    );
  }

  // Original deleted user message for regular users
  return (
    <div className="deleted-user-container">
      <div className="deleted-user-card">
        <div className="deleted-icon">⚠️</div>
        <h1>Account Deleted</h1>
        <p>Your account has been deleted by an administrator.</p>
        <p>If you believe this was an error, please contact support.</p>
        <div className="deleted-actions">
          <button
            onClick={() => (window.location.href = "/")}
            className="return-home-btn"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletedUserPage;
