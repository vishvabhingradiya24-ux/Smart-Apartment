import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../css/notice.css";

function Notices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotices = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/notices/active",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch notices");
      }

      setNotices(data.data || []);
    } catch (err) {
      console.error("Notice fetch error:", err);
      setError(err.message || "Unable to load notices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="notice-page">

      <header className="notice-header">

        <div>
          <span className="notice-overline">
            COMMUNITY INFORMATION
          </span>

          <h1>Notices & Events</h1>

          <p>
            Stay updated with important apartment announcements,
            maintenance information and community updates.
          </p>
        </div>

        <Link
          to="/resident"
          className="notice-back-button"
        >
          ← Dashboard
        </Link>

      </header>


      <main className="notice-content">

        <div className="notice-section-heading">
          <div>
            <span className="notice-eyebrow">
              SOCIETY NOTICES
            </span>

            <h2>Latest Announcements</h2>
          </div>

          <span className="notice-count">
            {notices.length} Notice{notices.length !== 1 ? "s" : ""}
          </span>
        </div>


        {loading && (
          <div className="notice-state">
            <div className="notice-loader"></div>
            <h3>Loading notices...</h3>
            <p>
              Please wait while we fetch the latest announcements.
            </p>
          </div>
        )}


        {!loading && error && (
          <div className="notice-state notice-error">
            <div className="notice-state-icon">!</div>

            <h3>Unable to load notices</h3>

            <p>{error}</p>

            <button
              onClick={fetchNotices}
              className="notice-retry-button"
            >
              Try Again
            </button>
          </div>
        )}


        {!loading && !error && notices.length === 0 && (
          <div className="notice-state">
            <div className="notice-state-icon">i</div>

            <h3>No notices available</h3>

            <p>
              New society notices and announcements will
              appear here when published by the administration.
            </p>
          </div>
        )}


        {!loading && !error && notices.length > 0 && (
          <div className="notice-grid">

            {notices.map((notice) => (
              <article
                className="notice-card"
                key={notice.notice_id}
              >

                <div className="notice-card-top">

                  <span className="notice-type">
                    {notice.notice_type}
                  </span>

                  <span className="notice-status">
                    Active
                  </span>

                </div>


                <h3>{notice.title}</h3>


                <p className="notice-description">
                  {notice.description}
                </p>


                <div className="notice-details">

                  <div className="notice-detail">

                    <span>Published</span>

                    <strong>
                      {formatDate(notice.publish_date)}
                    </strong>

                  </div>


                  <div className="notice-detail">

                    <span>Expires</span>

                    <strong>
                      {notice.expiry_date
                        ? formatDate(notice.expiry_date)
                        : "No expiry"}
                    </strong>

                  </div>

                </div>


                <div className="notice-footer">

                  <span>
                    Published {formatDateTime(notice.publish_date)}
                  </span>

                  {notice.posted_by_name && (
                    <span>
                      By {notice.posted_by_name}
                    </span>
                  )}

                </div>

              </article>
            ))}

          </div>
        )}

      </main>

    </div>
  );
}

export default Notices;