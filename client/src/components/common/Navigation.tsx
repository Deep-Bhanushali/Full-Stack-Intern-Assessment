import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import "./Navigation.css";

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <h1>Store Ratings Platform</h1>
        </div>

        <div className="nav-user">
          <span className="user-info">
            Welcome, {user?.name} ({user?.role})
          </span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
