import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import "./AdminUsersPage.css";

const AdminUsersPage = () => {
  const { apiCall, isOwner } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState({});

  // Redirect if not owner
  useEffect(() => {
    if (!isOwner()) {
      window.location.href = "/dashboard";
    }
  }, [isOwner]);

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiCall("/admin/users");
      if (response.ok) {
        const usersData = await response.json();
        setUsers(usersData);
      } else {
        console.error("Failed to load users");
      }
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId, username) => {
    if (
      !confirm(
        `Are you sure you want to delete user "${username}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setDeleteLoading((prev) => ({ ...prev, [userId]: true }));
      const response = await apiCall(`/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Remove user from local state
        setUsers((prev) => prev.filter((user) => user.id !== userId));
        alert(`User "${username}" has been deleted successfully.`);
      } else {
        const errorData = await response.json();
        alert(`Failed to delete user: ${errorData.detail}`);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    } finally {
      setDeleteLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOwner()) {
    return <div>Access denied. Owner permissions required.</div>;
  }

  return (
    <div className="admin-users-container">
      <div className="admin-users-header">
        <h1>User Management</h1>
        <p>Manage all users in the system</p>
      </div>

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${
                        user.is_active ? "active" : "inactive"
                      }`}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>{formatDate(user.created_at)}</td>
                  <td>
                    {user.role !== "owner" ? (
                      <button
                        onClick={() => deleteUser(user.id, user.username)}
                        className="delete-btn"
                        disabled={deleteLoading[user.id]}
                      >
                        {deleteLoading[user.id] ? "Deleting..." : "Delete"}
                      </button>
                    ) : (
                      <span className="no-action">Owner</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && <div className="no-users">No users found</div>}
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
