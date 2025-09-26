import React from "react";
import "./DeletedUserPage.css";

const DeletedUserPage = () => {
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
