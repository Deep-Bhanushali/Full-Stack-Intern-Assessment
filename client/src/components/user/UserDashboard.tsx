import React, { useState, useEffect } from "react";
import { userAPI } from "../../services/api";
import { StoreWithRating } from "../../types";
import "./UserDashboard.css";

const UserDashboard: React.FC = () => {
  const [stores, setStores] = useState<StoreWithRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ qName: "", qAddress: "" });
  const [ratingForm, setRatingForm] = useState<{
    storeId: number;
    value: number;
  } | null>(null);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      const storesData = await userAPI.getStores();
      setStores(storesData as StoreWithRating[]);
    } catch (error) {
      console.error("Failed to load stores:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      const filteredStores = await userAPI.getStores(filters);
      setStores(filteredStores as StoreWithRating[]);
    } catch (error) {
      console.error("Failed to search stores:", error);
    }
  };

  const handleRatingSubmit = async (storeId: number, value: number) => {
    try {
      await userAPI.submitRating({ storeId, value });
      setRatingForm(null);
      loadStores(); // Reload to get updated ratings
    } catch (error) {
      console.error("Failed to submit rating:", error);
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

  const renderRatingForm = (store: StoreWithRating) => {
    if (ratingForm?.storeId !== store.id) {
      return (
        <button
          className="rate-btn"
          onClick={() => setRatingForm({ storeId: store.id, value: 5 })}
        >
          {store.myRating ? "Update Rating" : "Rate Store"}
        </button>
      );
    }

    return (
      <div className="rating-form">
        <select
          value={ratingForm.value}
          onChange={(e) =>
            setRatingForm({ ...ratingForm, value: parseInt(e.target.value) })
          }
        >
          {[1, 2, 3, 4, 5].map((value) => (
            <option key={value} value={value}>
              {value} Star{value !== 1 ? "s" : ""}
            </option>
          ))}
        </select>
        <button onClick={() => handleRatingSubmit(store.id, ratingForm.value)}>
          Submit
        </button>
        <button className="cancel-btn" onClick={() => setRatingForm(null)}>
          Cancel
        </button>
      </div>
    );
  };

  if (loading) {
    return <div className="dashboard">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <h2>User Dashboard</h2>

      {/* Search Filters */}
      <div className="search-section">
        <h3>Search Stores</h3>
        <div className="search-filters">
          <input
            type="text"
            placeholder="Search by store name"
            value={filters.qName}
            onChange={(e) => setFilters({ ...filters, qName: e.target.value })}
          />
          <input
            type="text"
            placeholder="Search by address"
            value={filters.qAddress}
            onChange={(e) =>
              setFilters({ ...filters, qAddress: e.target.value })
            }
          />
          <button onClick={handleSearch} className="submit-btn">
            Search
          </button>
          <button onClick={loadStores} className="reset-btn">
            Reset
          </button>
        </div>
      </div>

      {/* Stores List */}
      <div className="stores-container">
        <h3>Available Stores</h3>
        {stores.length === 0 ? (
          <p className="no-stores">No stores found.</p>
        ) : (
          <div className="stores-grid">
            {stores.map((store) => (
              <div key={store.id} className="store-card">
                <div className="store-header">
                  <h4>{store.name}</h4>
                  <span className="store-address">{store.address}</span>
                </div>

                <div className="store-ratings">
                  <div className="rating-info">
                    <span className="label">Overall Rating:</span>
                    {renderStars(store.averageRating)}
                  </div>

                  {store.myRating && (
                    <div className="rating-info">
                      <span className="label">My Rating:</span>
                      {renderStars(store.myRating)}
                    </div>
                  )}
                </div>

                <div className="store-actions">{renderRatingForm(store)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
