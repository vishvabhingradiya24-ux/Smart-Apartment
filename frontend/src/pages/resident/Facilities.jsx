import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../../css/facilities.css";

const facilities = [
  {
    id: 1,
    name: "Community Hall",
    icon: "🏛️",
    description: "For society events, meetings and celebrations.",
    timing: "9:00 AM - 10:00 PM",
  },
  {
    id: 2,
    name: "Gym",
    icon: "🏋️",
    description: "Fitness and workout area for residents.",
    timing: "6:00 AM - 10:00 PM",
  },
  {
    id: 3,
    name: "Swimming Pool",
    icon: "🏊",
    description: "Swimming and recreational facility.",
    timing: "7:00 AM - 8:00 PM",
  },
  {
    id: 4,
    name: "Sports Area",
    icon: "⚽",
    description: "Space for sports and recreational activities.",
    timing: "6:00 AM - 10:00 PM",
  },
  {
    id: 5,
    name: "Garden",
    icon: "🌳",
    description: "Relax and enjoy time in the society garden.",
    timing: "6:00 AM - 9:00 PM",
  },
];

const Facilities = () => {
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [availability, setAvailability] = useState(null);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const openBooking = (facility) => {
    setSelectedFacility(facility);
    setBookingDate("");
    setBookingTime("");
    setAvailability(null);
    setMessage("");
  };

  const closeBooking = () => {
    setSelectedFacility(null);
    setBookingDate("");
    setBookingTime("");
    setAvailability(null);
    setChecking(false);
    setMessage("");
  };

  const checkAvailability = () => {
    if (!bookingDate) {
      setMessage("Please select a date first.");
      return;
    }

    setChecking(true);
    setAvailability(null);
    setMessage("");

    setTimeout(() => {
      const selectedDay = new Date(
        `${bookingDate}T00:00:00`
      ).getDate();

      if (selectedDay % 3 === 0) {
        setAvailability(false);
      } else {
        setAvailability(true);
      }

      setChecking(false);
    }, 500);
  };

  const handleBooking = (e) => {
    e.preventDefault();

    if (!bookingDate) {
      setMessage("Please select a date.");
      return;
    }

    if (availability !== true) {
      setMessage("Please check availability first.");
      return;
    }

    if (!bookingTime) {
      setMessage("Please select a preferred time.");
      return;
    }

    setMessage(
      `Booking request submitted for ${selectedFacility.name}.`
    );
  };

  return (
    <div className="facilities-page">

      {/* Header */}

      <header className="facilities-header">

        <div className="facilities-header-left">

          <Link
            to="/resident"
            className="facilities-back-button"
          >
            ←
          </Link>

          <div>
            <span className="facilities-overline">
              RESIDENT SERVICES
            </span>

            <h1>Facilities</h1>

            <p>
              Explore and book society facilities
            </p>
          </div>

        </div>

        <Link
          to="/resident"
          className="facilities-dashboard-button"
        >
          Dashboard
        </Link>

      </header>


      {/* Main */}

      <main className="facilities-content">

        <div className="facilities-page-heading">

          <div>

            <span className="facilities-label">
              SOCIETY FACILITIES
            </span>

            <h2>
              Available Facilities
            </h2>

          </div>

          <p>
            Select a facility to check its availability
            and submit a booking request.
          </p>

        </div>


        {/* Facilities */}

        <div className="facilities-grid">

          {facilities.map((facility) => (

            <div
              className="facility-card"
              key={facility.id}
            >

              <div className="facility-card-header">

                <div className="facility-icon">
                  {facility.icon}
                </div>

                <span className="facility-number">
                  0{facility.id}
                </span>

              </div>


              <div className="facility-card-content">

                <h3>
                  {facility.name}
                </h3>

                <p>
                  {facility.description}
                </p>

              </div>


              <div className="facility-card-bottom">

                <div className="facility-timing">

                  <span>
                    OPENING HOURS
                  </span>

                  <strong>
                    {facility.timing}
                  </strong>

                </div>

                <button
                  className="book-button"
                  onClick={() => openBooking(facility)}
                >
                  Book
                  <span>→</span>
                </button>

              </div>

            </div>

          ))}

        </div>

      </main>


      {/* Booking Modal */}

      {selectedFacility && (

        <div
          className="booking-overlay"
          onClick={closeBooking}
        >

          <div
            className="booking-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              className="booking-close"
              onClick={closeBooking}
            >
              ×
            </button>


            <div className="booking-title">

              <div className="booking-icon">
                {selectedFacility.icon}
              </div>

              <div>

                <span>
                  FACILITY BOOKING
                </span>

                <h2>
                  {selectedFacility.name}
                </h2>

              </div>

            </div>


            <p className="booking-text">
              Select a date to check whether this
              facility is available.
            </p>


            <form onSubmit={handleBooking}>

              {/* Date */}

              <div className="booking-field">

                <label>
                  Select Date
                </label>

                <input
                  type="date"
                  min={today}
                  value={bookingDate}
                  onChange={(e) => {
                    setBookingDate(e.target.value);
                    setAvailability(null);
                    setMessage("");
                  }}
                />

              </div>


              {/* Check Availability */}

              <button
                type="button"
                className="check-availability-button"
                onClick={checkAvailability}
                disabled={!bookingDate || checking}
              >

                {checking
                  ? "Checking..."
                  : "Check Availability"}

                {!checking && <span>→</span>}

              </button>


              {/* Availability Result */}

              {availability !== null && (

                <div
                  className={
                    availability
                      ? "availability-result available"
                      : "availability-result unavailable"
                  }
                >

                  <div className="availability-result-icon">
                    {availability ? "✓" : "×"}
                  </div>

                  <div>

                    <strong>
                      {availability
                        ? "Available"
                        : "Not Available"}
                    </strong>

                    <p>
                      {availability
                        ? "This facility is available on the selected date."
                        : "This facility is already booked on the selected date."}
                    </p>

                  </div>

                </div>

              )}


              {/* Time */}

              {availability === true && (

                <div className="booking-field">

                  <label>
                    Preferred Time
                  </label>

                  <select
                    value={bookingTime}
                    onChange={(e) => {
                      setBookingTime(e.target.value);
                      setMessage("");
                    }}
                  >

                    <option value="">
                      Select time
                    </option>

                    <option value="Morning">
                      Morning
                    </option>

                    <option value="Afternoon">
                      Afternoon
                    </option>

                    <option value="Evening">
                      Evening
                    </option>

                  </select>

                </div>

              )}


              {/* Message */}

              {message && (

                <div className="booking-message">
                  {message}
                </div>

              )}


              {/* Submit */}

              {availability === true && (

                <button
                  type="submit"
                  className="submit-booking-button"
                  disabled={!bookingTime}
                >
                  Submit Booking Request
                  <span>→</span>
                </button>

              )}

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default Facilities;