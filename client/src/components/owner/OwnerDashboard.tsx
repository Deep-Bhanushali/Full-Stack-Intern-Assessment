import React, { useState, useEffect } from "react";
import { ownerAPI } from "../../services/api";
import { StoreOwnerData } from "../../types";
import "./OwnerDashboard.css";

const OwnerDashboard: React.FC = () => {
  const [storeData, setStoreData] = useState<StoreOwnerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoreData();
  }, []);

  const loadStoreData = async () => {
    try {
      const data = await ownerAPI.getStoreRatings();
      setStoreData(data as StoreOwnerData);
    } catch (error) {
      console.error("Failed to load store data:", error);
    } finally {
      setLoading(false);
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

  if (!storeData) {
    return <div className="dashboard">No store data available.</div>;
  }

  return (
    <div className="dashboard">
      <h2>Store Owner Dashboard</h2>

      {/* Store Overview */}
      <div className="store-overview">
        <h3>{storeData.store.name}</h3>
        <div className="overview-stats">
          <div className="stat-item">
            <span className="stat-label">Average Rating:</span>
            <span className="stat-value">
              {renderStars(storeData.averageRating)}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Ratings:</span>
            <span className="stat-value">{storeData.raters.length}</span>
          </div>
        </div>
      </div>

      {/* Ratings Table */}
      <div className="table-container">
        <h3>User Ratings</h3>
        {storeData.raters.length === 0 ? (
          <p className="no-ratings">No ratings yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Email</th>
                <th>Rating</th>
                <th>Stars</th>
              </tr>
            </thead>
            <tbody>
              {storeData.raters.map((rater) => (
                <tr key={rater.id}>
                  <td>{rater.name}</td>
                  <td>{rater.email}</td>
                  <td>{rater.value}/5</td>
                  <td>
                    <div className="rating-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={
                            star <= rater.value ? "star" : "star empty"
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
