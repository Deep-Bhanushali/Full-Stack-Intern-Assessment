import React, { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import { DashboardStats, Store, User } from "../../types";
import "./AdminDashboard.css";

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showUserForm, setShowUserForm] = useState(false);
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
    role: "USER" as const,
  });
  const [storeForm, setStoreForm] = useState({
    name: "",
    email: "",
    address: "",
    ownerId: "",
  });

  // Filter states
  const [storeFilters, setStoreFilters] = useState({
    name: "",
    email: "",
    address: "",
  });
  const [userFilters, setUserFilters] = useState({
    name: "",
    email: "",
    address: "",
    role: "",
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, storesData, usersData] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getStores(),
        adminAPI.getUsers(),
      ]);
      setStats(statsData as DashboardStats);
      setStores(storesData as Store[]);
      setUsers(usersData as User[]);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminAPI.createUser(userForm);
      setUserForm({
        name: "",
        email: "",
        address: "",
        password: "",
        role: "USER",
      });
      setShowUserForm(false);
      loadDashboardData();
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  };

  const handleStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminAPI.createStore({
        ...storeForm,
        ownerId: storeForm.ownerId ? parseInt(storeForm.ownerId) : undefined,
      });
      setStoreForm({ name: "", email: "", address: "", ownerId: "" });
      setShowStoreForm(false);
      loadDashboardData();
    } catch (error) {
      console.error("Failed to create store:", error);
    }
  };

  const applyStoreFilters = async () => {
    try {
      const filteredStores = await adminAPI.getStores(storeFilters);
      setStores(filteredStores as Store[]);
    } catch (error) {
      console.error("Failed to filter stores:", error);
    }
  };

  const applyUserFilters = async () => {
    try {
      const filteredUsers = await adminAPI.getUsers(userFilters);
      setUsers(filteredUsers as User[]);
    } catch (error) {
      console.error("Failed to filter users:", error);
    }
  };

  const renderStars = (rating: number | null) => {
    if (rating === null) return "No ratings";
    return (
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? "star" : "star empty"}>
            ★
          </span>
        ))}
        <span>({rating.toFixed(1)})</span>
      </div>
    );
  };

  if (loading) {
    return <div className="dashboard">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <h2>Admin Dashboard</h2>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats?.users || 0}</h3>
          <p>Total Users</p>
        </div>
        <div className="stat-card">
          <h3>{stats?.stores || 0}</h3>
          <p>Total Stores</p>
        </div>
        <div className="stat-card">
          <h3>{stats?.ratings || 0}</h3>
          <p>Total Ratings</p>
        </div>
      </div>

      {/* Create User Form */}
      <div className="form-section">
        <div className="section-header">
          <h3>Create New User</h3>
          <button
            className="toggle-btn"
            onClick={() => setShowUserForm(!showUserForm)}
          >
            {showUserForm ? "Hide" : "Show"} Form
          </button>
        </div>

        {showUserForm && (
          <form onSubmit={handleUserSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) =>
                    setUserForm({ ...userForm, name: e.target.value })
                  }
                  placeholder="Full name (min 20 chars)"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) =>
                    setUserForm({ ...userForm, email: e.target.value })
                  }
                  placeholder="Email address"
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  value={userForm.address}
                  onChange={(e) =>
                    setUserForm({ ...userForm, address: e.target.value })
                  }
                  placeholder="Address"
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) =>
                    setUserForm({ ...userForm, role: e.target.value as any })
                  }
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                  <option value="OWNER">Store Owner</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={userForm.password}
                onChange={(e) =>
                  setUserForm({ ...userForm, password: e.target.value })
                }
                placeholder="8-16 chars, uppercase + special char"
                required
              />
            </div>
            <button type="submit" className="submit-btn">
              Create User
            </button>
          </form>
        )}
      </div>

      {/* Create Store Form */}
      <div className="form-section">
        <div className="section-header">
          <h3>Create New Store</h3>
          <button
            className="toggle-btn"
            onClick={() => setShowStoreForm(!showStoreForm)}
          >
            {showStoreForm ? "Hide" : "Show"} Form
          </button>
        </div>

        {showStoreForm && (
          <form onSubmit={handleStoreSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Store Name</label>
                <input
                  type="text"
                  value={storeForm.name}
                  onChange={(e) =>
                    setStoreForm({ ...storeForm, name: e.target.value })
                  }
                  placeholder="Store name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={storeForm.email}
                  onChange={(e) =>
                    setStoreForm({ ...storeForm, email: e.target.value })
                  }
                  placeholder="Store email"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  value={storeForm.address}
                  onChange={(e) =>
                    setStoreForm({ ...storeForm, address: e.target.value })
                  }
                  placeholder="Store address"
                  required
                />
              </div>
              <div className="form-group">
                <label>Owner ID (Optional)</label>
                <input
                  type="number"
                  value={storeForm.ownerId}
                  onChange={(e) =>
                    setStoreForm({ ...storeForm, ownerId: e.target.value })
                  }
                  placeholder="User ID of owner"
                />
              </div>
            </div>
            <button type="submit" className="submit-btn">
              Create Store
            </button>
          </form>
        )}
      </div>

      {/* Stores Table */}
      <div className="table-container">
        <h3>Stores</h3>
        <div className="search-filters">
          <input
            type="text"
            placeholder="Filter by name"
            value={storeFilters.name}
            onChange={(e) =>
              setStoreFilters({ ...storeFilters, name: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Filter by email"
            value={storeFilters.email}
            onChange={(e) =>
              setStoreFilters({ ...storeFilters, email: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Filter by address"
            value={storeFilters.address}
            onChange={(e) =>
              setStoreFilters({ ...storeFilters, address: e.target.value })
            }
          />
          <button onClick={applyStoreFilters} className="submit-btn">
            Apply Filters
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Address</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((store) => (
              <tr key={store.id}>
                <td>{store.name}</td>
                <td>{store.email || "N/A"}</td>
                <td>{store.address}</td>
                <td>{renderStars(store.rating)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Users Table */}
      <div className="table-container">
        <h3>Users</h3>
        <div className="search-filters">
          <input
            type="text"
            placeholder="Filter by name"
            value={userFilters.name}
            onChange={(e) =>
              setUserFilters({ ...userFilters, name: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Filter by email"
            value={userFilters.email}
            onChange={(e) =>
              setUserFilters({ ...userFilters, email: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Filter by address"
            value={userFilters.address}
            onChange={(e) =>
              setUserFilters({ ...userFilters, address: e.target.value })
            }
          />
          <select
            value={userFilters.role}
            onChange={(e) =>
              setUserFilters({ ...userFilters, role: e.target.value })
            }
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">User</option>
            <option value="OWNER">Store Owner</option>
          </select>
          <button onClick={applyUserFilters} className="submit-btn">
            Apply Filters
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Address</th>
              <th>Role</th>
              <th>Store Rating</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.address}</td>
                <td>{user.role}</td>
                <td>
                  {user.role === "OWNER" && user.rating !== undefined
                    ? renderStars(user.rating)
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
