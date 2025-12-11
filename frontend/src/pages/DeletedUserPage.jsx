import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
  Card, 
  Table, 
  Button, 
  Typography, 
  Space, 
  Popconfirm, 
  message,
  Tag
} from "antd";
import { 
  ReloadOutlined, 
  RollbackOutlined, 
  DeleteOutlined 
} from "@ant-design/icons";
import "./DeletedUserPage.scss";

const { Title } = Typography;

const DeletedUserPage = () => {
  const location = useLocation();
  const { isOwner, apiCall } = useAuth();
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Check if we're in admin mode (owner accessing via admin route)
  const isAdminView = location.pathname === "/admin/deleted-users" && isOwner();

  // Fetch deleted users
  const fetchDeletedUsers = async () => {
    setLoading(true);
    try {
      const data = await apiCall("/admin/users/deleted/list", "GET");
      setDeletedUsers(data);
    } catch (error) {
      message.error("Failed to fetch deleted users");
      console.error("Error fetching deleted users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Restore user
  const handleRestore = async (userId, username) => {
    try {
      await apiCall(`/admin/users/${userId}/restore`, "POST");
      message.success(`User ${username} restored successfully`);
      fetchDeletedUsers(); // Refresh the list
    } catch (error) {
      message.error(`Failed to restore user: ${error.message}`);
    }
  };

  // Permanent delete
  const handlePermanentDelete = async (userId, username) => {
    try {
      await apiCall(`/admin/users/${userId}?permanent=true`, "DELETE");
      message.success(`User ${username} permanently deleted`);
      fetchDeletedUsers(); // Refresh the list
    } catch (error) {
      message.error(`Failed to permanently delete user: ${error.message}`);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  // Load deleted users on component mount
  useEffect(() => {
    if (isAdminView) {
      fetchDeletedUsers();
    }
  }, [isAdminView]);

  // Table columns definition
  const columns = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag color={role === "owner" ? "gold" : "blue"}>
          {role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Deleted At",
      dataIndex: "deleted_at",
      key: "deleted_at",
      render: (date) => formatDate(date),
      sorter: (a, b) => new Date(a.deleted_at) - new Date(b.deleted_at),
      defaultSortOrder: "descend",
    },
    {
      title: "Deleted By",
      dataIndex: "deleted_by_username",
      key: "deleted_by_username",
      render: (username) => username || "Unknown",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Popconfirm
            title="Restore User"
            description={`Are you sure you want to restore ${record.username}?`}
            onConfirm={() => handleRestore(record.id, record.username)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="primary" 
              icon={<RollbackOutlined />}
              size="small"
            >
              Restore
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Permanent Delete"
            description={`This will permanently delete ${record.username}. This action cannot be undone!`}
            onConfirm={() => handlePermanentDelete(record.id, record.username)}
            okText="Delete Permanently"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button 
              danger 
              icon={<DeleteOutlined />}
              size="small"
            >
              Delete Permanently
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (isAdminView) {
    return (
      <div style={{ padding: "24px" }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <Title level={2} style={{ margin: 0 }}>Deleted Users</Title>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchDeletedUsers}
              loading={loading}
            >
              Refresh
            </Button>
          </div>
          
          <Table
            columns={columns}
            dataSource={deletedUsers}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} deleted users`,
            }}
            locale={{
              emptyText: "No deleted users found"
            }}
          />
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
