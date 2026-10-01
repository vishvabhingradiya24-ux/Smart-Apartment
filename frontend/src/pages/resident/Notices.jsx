import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../css/resident/notice.css";

function Notices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadNotices = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Login session not found. Please log in again.");
        }

        const response = await fetch(
          "http://localhost:5000/api/notices/active",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const responseText = await response.text();

        let data = {};

        try {
          data = responseText ? JSON.parse(responseText) : {};
        } catch {
          throw new Error("Server returned an invalid response.");
        }

        if (!response.ok) {
          throw new Error(
            data.message || `Request failed (${response.status})`
          );
        }

        const noticeList = Array.isArray(data)
          ? data
          : Array.isArray(data.data)
          ? data.data
          : [];

        if (!cancelled) {
          setNotices(noticeList);
          setError("");
          setLoading(false);
        }
      } catch (err) {
        console.error("Notice fetch error:", err);

        if (!cancelled) {
          setNotices([]);
          setError(err.message || "Unable to load notices.");
          setLoading(false);
        }
      }
    };

    loadNotices();

    return () => {
      cancelled = true;
    };
  }, []);

  const formatDate = (value) => {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (value) => {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const retryNotices = () => {
    window.location.reload();
  };

  return (
    <div className="notice-page">
      <header className="notice-header">
        <div>
          <span className="notice-overline">
            COMMUNITY INFORMATION
          </span>

          <h1>Notices &amp; Events</h1>

          <p>
            Stay updated with important apartment announcements,
            maintenance information and community updates.
          </p>
        </div>

        <Link to="/resident" className="notice-back-button">
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
            {notices.length} Notice
            {notices.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading && (
          <div className="notice-state">
            <div className="notice-loader" />
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
              type="button"
              onClick={retryNotices}
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
              New society notices and announcements will appear
              here when published by the administration.
            </p>
          </div>
        )}

        {!loading && !error && notices.length > 0 && (
          <div className="notice-grid">
            {notices.map((notice, index) => (
              <article
                className="notice-card"
                key={
                  notice.notice_id ??
                  notice.id ??
                  index
                }
              >
                <div className="notice-card-top">
                  <span className="notice-type">
                    {notice.notice_type || "General"}
                  </span>

                  <span className="notice-status">
                    Active
                  </span>
                </div>

                <h3>
                  {notice.title || "Untitled notice"}
                </h3>

                <p className="notice-description">
                  {notice.description ||
                    "No description provided."}
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
                    Published{" "}
                    {formatDateTime(notice.publish_date)}
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