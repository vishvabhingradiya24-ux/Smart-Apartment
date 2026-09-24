import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../../css/facilities.css";

const API_URL = "http://localhost:5000/api/resident/facilities";

const facilityIcons = {
  "Swimming Pool": "🏊",
  Gym: "🏋️",
  "Community Hall": "🏛️",
  "Sports Area": "⚽",
  Garden: "🌳",
};

const Facilities = () => {
  const [facilities, setFacilities] = useState([]);
  const [addons, setAddons] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [selectedFacility, setSelectedFacility] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);

  const [bookingDate, setBookingDate] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");

  const [purpose, setPurpose] = useState("");
  const [numberOfPeople, setNumberOfPeople] = useState("");
  const [additionalRequirements, setAdditionalRequirements] =
    useState("");

  const [step, setStep] = useState(1);

  const [availability, setAvailability] = useState(null);
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [availabilityCharge, setAvailabilityCharge] = useState(0);

  const [loadingFacilities, setLoadingFacilities] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [pageError, setPageError] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [formError, setFormError] = useState("");

  const token = localStorage.getItem("token");

  const today = new Date().toISOString().split("T")[0];

  const selectedFacilityBookingCharge =
    selectedFacility?.charge_period === "Per Booking"
      ? Number(selectedFacility?.base_charge || 0)
      : 0;

  const selectedAddonTotal = useMemo(() => {
    return selectedAddons.reduce((total, selected) => {
      const addon = addons.find(
        (item) =>
          Number(item.addon_id) === Number(selected.addon_id)
      );

      if (!addon) {
        return total;
      }

      const quantity = Number(selected.quantity || 1);

      if (addon.charge_type === "Fixed") {
        return total + Number(addon.price);
      }

      if (addon.charge_type === "Per Person") {
        return (
          total +
          Number(addon.price) *
            Number(numberOfPeople || 0)
        );
      }

      return total + Number(addon.price) * quantity;
    }, 0);
  }, [selectedAddons, addons, numberOfPeople]);

  const estimatedTotal =
    selectedFacilityBookingCharge + selectedAddonTotal;

  const fetchFacilities = async () => {
    try {
      if (!token) {
        setPageError("Please login again.");
        return;
      }

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to fetch facilities"
        );
      }

      setFacilities(data.facilities || []);
      setAddons(data.addons || []);
    } catch (error) {
      console.error("Facilities Error:", error);
      setPageError(error.message);
    } finally {
      setLoadingFacilities(false);
    }
  };

  const fetchBookings = async () => {
    try {
      if (!token) {
        return;
      }

      const response = await fetch(
        `${API_URL}/bookings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to fetch booking history"
        );
      }

      setBookings(data.bookings || []);
    } catch (error) {
      console.error(
        "Booking History Error:",
        error
      );
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
    fetchBookings();
  }, []);

  const resetForm = () => {
    setBookingDate("");
    setFromTime("");
    setToTime("");
    setPurpose("");
    setNumberOfPeople("");
    setAdditionalRequirements("");
    setSelectedAddons([]);

    setStep(1);

    setAvailability(null);
    setAvailabilityMessage("");
    setAvailabilityCharge(0);

    setFormMessage("");
    setFormError("");

    setChecking(false);
    setSubmitting(false);
  };

  const openBooking = (facility) => {
    resetForm();
    setSelectedFacility(facility);
  };

  const closeBooking = () => {
    setSelectedFacility(null);
    resetForm();
  };

  const resetAvailability = () => {
    setAvailability(null);
    setAvailabilityMessage("");
    setAvailabilityCharge(0);
    setFormMessage("");
    setFormError("");
  };

  const handleCheckAvailability = async () => {
    setFormMessage("");
    setFormError("");
    setAvailability(null);
    setAvailabilityMessage("");

    if (!bookingDate) {
      setFormMessage(
        "Please select a booking date."
      );
      return;
    }

    if (!fromTime || !toTime) {
      setFormMessage(
        "Please select From Time and To Time."
      );
      return;
    }

    if (fromTime >= toTime) {
      setFormMessage(
        "To time must be after From time."
      );
      return;
    }

    try {
      if (!token) {
        setFormError("Please login again.");
        return;
      }

      setChecking(true);

      const response = await fetch(
        `${API_URL}/check-availability`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            facility_id:
              selectedFacility.facility_id,
            booking_date: bookingDate,
            start_time: fromTime,
            end_time: toTime,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to check availability"
        );
      }

      setAvailability(data.available);
      setAvailabilityMessage(
        data.message || ""
      );

      setAvailabilityCharge(
        Number(data.facility_charge || 0)
      );
    } catch (error) {
      console.error(
        "Availability Error:",
        error
      );

      setFormError(error.message);
    } finally {
      setChecking(false);
    }
  };

  const continueBooking = () => {
    if (availability !== true) {
      return;
    }

    setFormMessage("");
    setFormError("");
    setStep(2);
  };

  const handleAddonChange = (
    addonId,
    checked
  ) => {
    if (checked) {
      setSelectedAddons((previous) => [
        ...previous,
        {
          addon_id: addonId,
          quantity: 1,
        },
      ]);
    } else {
      setSelectedAddons((previous) =>
        previous.filter(
          (item) =>
            Number(item.addon_id) !==
            Number(addonId)
        )
      );
    }
  };

  const updateAddonQuantity = (
    addonId,
    quantity
  ) => {
    setSelectedAddons((previous) =>
      previous.map((item) =>
        Number(item.addon_id) ===
        Number(addonId)
          ? {
              ...item,
              quantity: Math.max(
                1,
                Number(quantity) || 1
              ),
            }
          : item
      )
    );
  };

  const isAddonSelected = (addonId) => {
    return selectedAddons.some(
      (item) =>
        Number(item.addon_id) ===
        Number(addonId)
    );
  };

  const getAddonQuantity = (addonId) => {
    const selected = selectedAddons.find(
      (item) =>
        Number(item.addon_id) ===
        Number(addonId)
    );

    return selected?.quantity || 1;
  };

  const handleBooking = async (event) => {
    event.preventDefault();

    setFormMessage("");
    setFormError("");

    if (!purpose.trim()) {
      setFormMessage(
        "Please enter the purpose or function."
      );
      return;
    }

    if (
      !numberOfPeople ||
      Number(numberOfPeople) <= 0
    ) {
      setFormMessage(
        "Please enter a valid number of people."
      );
      return;
    }

    if (availability !== true) {
      setFormMessage(
        "Please check availability first."
      );
      setStep(1);
      return;
    }

    try {
      if (!token) {
        setFormError("Please login again.");
        return;
      }

      setSubmitting(true);

      const response = await fetch(
        `${API_URL}/bookings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            facility_id:
              selectedFacility.facility_id,
            booking_date: bookingDate,
            start_time: fromTime,
            end_time: toTime,
            purpose: purpose.trim(),
            number_of_people:
              Number(numberOfPeople),
            additional_requirements:
              additionalRequirements.trim() ||
              null,
            addons: selectedAddons,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to submit booking"
        );
      }

      setFormMessage(
        "Booking request submitted successfully."
      );

      await fetchBookings();

      setTimeout(() => {
        closeBooking();
      }, 1200);
    } catch (error) {
      console.error(
        "Booking Error:",
        error
      );

      setFormError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatTime = (time) => {
    if (!time) {
      return "-";
    }

    const [hours, minutes] =
      time.split(":").map(Number);

    const date = new Date();

    date.setHours(hours);
    date.setMinutes(minutes);

    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }
    );
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Approved":
        return "status-approved";

      case "Rejected":
        return "status-rejected";

      case "Completed":
        return "status-completed";

      default:
        return "status-pending";
    }
  };

  const getChargeText = (facility) => {
    const charge = Number(
      facility.base_charge || 0
    );

    if (
      facility.charge_period === "Free" ||
      charge === 0
    ) {
      return "Free";
    }

    return `₹${charge.toLocaleString(
      "en-IN"
    )} / ${
      facility.charge_period ===
      "Per Month"
        ? "Month"
        : "Booking"
    }`;
  };

  return (
    <div className="facilities-page">

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

            <h1>
              Facilities & Booking
            </h1>

            <p>
              Explore facilities and book
              your preferred slot.
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

      <main className="facilities-content">

        {pageError && (
          <div className="facility-error">
            {pageError}
          </div>
        )}

        <section className="facilities-intro">

          <div>
            <span className="facilities-label">
              SOCIETY FACILITIES
            </span>

            <h2>
              Available Facilities
            </h2>

            <p>
              Click Book Now to select your
              date and time.
            </p>
          </div>

          <div className="facility-summary">
            <strong>
              {facilities.length}
            </strong>

            <span>
              Facilities
            </span>
          </div>

        </section>

        {loadingFacilities ? (
          <div className="facility-state">
            Loading facilities...
          </div>
        ) : facilities.length === 0 ? (
          <div className="facility-state">
            No facilities available.
          </div>
        ) : (
          <section className="facilities-grid">

            {facilities.map(
              (facility, index) => {

                const isAvailable =
                  facility.availability_status ===
                  "Available";

                return (
                  <article
                    className="facility-card"
                    key={
                      facility.facility_id
                    }
                  >

                    <div className="facility-card-top">

                      <div className="facility-icon">
                        {
                          facilityIcons[
                            facility.facility_name
                          ] || "🏢"
                        }
                      </div>

                      <span className="facility-number">
                        {String(
                          index + 1
                        ).padStart(2, "0")}
                      </span>

                    </div>

                    <div className="facility-card-body">

                      <h3>
                        {facility.facility_name}
                      </h3>

                      <p>
                        {facility.description ||
                          "Society facility for residents."}
                      </p>

                      <div className="facility-location">
                        <span>📍</span>

                        {facility.location ||
                          "Society premises"}
                      </div>

                      <div className="facility-charge-box">

                        <span>
                          Charge
                        </span>

                        <strong>
                          {getChargeText(
                            facility
                          )}
                        </strong>

                      </div>

                    </div>

                    <div className="facility-card-footer">

                      <span>
                        Select date and time
                        after clicking Book Now
                      </span>

                      <button
                        type="button"
                        className="book-button"
                        onClick={() =>
                          openBooking(
                            facility
                          )
                        }
                        disabled={!isAvailable}
                      >
                        Book Now
                        <span>→</span>
                      </button>

                    </div>

                  </article>
                );
              }
            )}

          </section>
        )}

        <section className="booking-history-section">

          <div className="section-heading-row">

            <span className="facilities-label">
              YOUR ACTIVITY
            </span>

            <h2>
              Booking History
            </h2>

            <p>
              Track your facility booking
              requests and charges.
            </p>

          </div>

          {loadingBookings ? (
            <div className="facility-state">
              Loading booking history...
            </div>
          ) : bookings.length === 0 ? (
            <div className="booking-empty">

              <div className="booking-empty-icon">
                ▦
              </div>

              <h3>
                No bookings yet
              </h3>

              <p>
                Your facility booking
                history will appear here.
              </p>

            </div>
          ) : (
            <div className="booking-history-list">

              {bookings.map(
                (booking) => (

                  <article
                    className="booking-history-card"
                    key={
                      booking.booking_id
                    }
                  >

                    <div className="booking-history-main">

                      <div className="booking-history-title">

                        <div className="booking-history-icon">
                          {
                            facilityIcons[
                              booking.facility_name
                            ] || "🏢"
                          }
                        </div>

                        <div>
                          <h3>
                            {
                              booking.facility_name
                            }
                          </h3>

                          <p>
                            📍{" "}
                            {booking.location ||
                              "Society premises"}
                          </p>
                        </div>

                      </div>

                      <span
                        className={`booking-status ${getStatusClass(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>

                    </div>

                    <div className="booking-details-grid">

                      <div>
                        <span>
                          Date
                        </span>

                        <strong>
                          {formatDate(
                            booking.booking_date
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Time
                        </span>

                        <strong>
                          {formatTime(
                            booking.start_time
                          )}{" "}
                          -{" "}
                          {formatTime(
                            booking.end_time
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          People
                        </span>

                        <strong>
                          {
                            booking.number_of_people
                          }
                        </strong>
                      </div>

                      <div>
                        <span>
                          Purpose
                        </span>

                        <strong>
                          {booking.purpose ||
                            "-"}
                        </strong>
                      </div>

                    </div>

                    <div className="booking-charge-details">

                      <div>
                        <span>
                          Facility charge
                        </span>

                        <strong>
                          ₹
                          {Number(
                            booking.facility_charge ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Additional charge
                        </span>

                        <strong>
                          ₹
                          {Number(
                            booking.additional_charge ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>
                      </div>

                      <div className="booking-total">
                        <span>
                          Total amount
                        </span>

                        <strong>
                          ₹
                          {Number(
                            booking.total_amount ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>
                      </div>

                    </div>

                    {booking.addons &&
                      booking.addons.length >
                        0 && (
                        <div className="booking-addons-history">

                          <span>
                            Add-ons:
                          </span>

                          {booking.addons.map(
                            (addon) => (
                              <small
                                key={
                                  addon.booking_addon_id
                                }
                              >
                                {
                                  addon.addon_name
                                }{" "}
                                ×{" "}
                                {
                                  addon.quantity
                                }
                              </small>
                            )
                          )}

                        </div>
                      )}

                    {booking.additional_requirements && (
                      <div className="booking-requirements">

                        <span>
                          Additional
                          requirements:
                        </span>

                        <p>
                          {
                            booking.additional_requirements
                          }
                        </p>

                      </div>
                    )}

                  </article>
                )
              )}

            </div>
          )}

        </section>

      </main>

      {selectedFacility && (
        <div
          className="booking-overlay"
          onClick={closeBooking}
        >

          <div
            className="booking-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="booking-modal-header">

              <div>

                <span>
                  FACILITY BOOKING
                </span>

                <h2>
                  {
                    selectedFacility.facility_name
                  }
                </h2>

                <p>
                  {
                    selectedFacility.location ||
                    "Society premises"
                  }
                </p>

              </div>

              <button
                type="button"
                className="booking-close"
                onClick={closeBooking}
              >
                ×
              </button>

            </div>

            {step === 1 && (
              <div className="availability-first-step">

                <div className="availability-facility-info">

                  <div className="availability-facility-icon">
                    {
                      facilityIcons[
                        selectedFacility
                          .facility_name
                      ] || "🏢"
                    }
                  </div>

                  <div>
                    <strong>
                      {
                        selectedFacility.facility_name
                      }
                    </strong>

                    <span>
                      {
                        selectedFacility.location ||
                        "Society premises"
                      }
                    </span>
                  </div>

                </div>

                <div className="selected-facility-charge">

                  <div>

                    <span>
                      Facility charge
                    </span>

                    <strong>
                      {getChargeText(
                        selectedFacility
                      )}
                    </strong>

                  </div>

                  {selectedFacility.charge_period ===
                    "Per Month" && (
                    <p>
                      Monthly charge is
                      shown separately and
                      will not be added to
                      this booking total.
                    </p>
                  )}

                </div>

                <div className="availability-title">

                  <h3>
                    Check Time Slot
                  </h3>

                  <p>
                    Select date and time
                    before continuing.
                  </p>

                </div>

                <div className="booking-field">

                  <label>
                    Booking Date *
                  </label>

                  <input
                    type="date"
                    min={today}
                    value={bookingDate}
                    onChange={(event) => {
                      setBookingDate(
                        event.target.value
                      );
                      resetAvailability();
                    }}
                  />

                </div>

                <div className="availability-time-grid">

                  <div className="booking-field">

                    <label>
                      From Time *
                    </label>

                    <input
                      type="time"
                      value={fromTime}
                      onChange={(event) => {
                        setFromTime(
                          event.target.value
                        );
                        resetAvailability();
                      }}
                    />

                  </div>

                  <div className="booking-field">

                    <label>
                      To Time *
                    </label>

                    <input
                      type="time"
                      value={toTime}
                      onChange={(event) => {
                        setToTime(
                          event.target.value
                        );
                        resetAvailability();
                      }}
                    />

                  </div>

                </div>

                <button
                  type="button"
                  className="availability-main-button"
                  onClick={
                    handleCheckAvailability
                  }
                  disabled={
                    checking ||
                    !bookingDate ||
                    !fromTime ||
                    !toTime
                  }
                >
                  {checking
                    ? "Checking..."
                    : "Check Availability"}
                </button>

                {availability !== null && (
                  <div
                    className={
                      availability
                        ? "availability-result available"
                        : "availability-result unavailable"
                    }
                  >

                    <div>

                      <strong>
                        {availability
                          ? "✓ Time Slot Available"
                          : "× Time Slot Not Available"}
                      </strong>

                      <p>
                        {
                          availabilityMessage
                        }
                      </p>

                    </div>

                    {availability && (
                      <span>
                        ₹
                        {availabilityCharge.toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    )}

                  </div>
                )}

                {formMessage && (
                  <div className="booking-message success">
                    {formMessage}
                  </div>
                )}

                {formError && (
                  <div className="booking-message error">
                    {formError}
                  </div>
                )}

                {availability === true && (
                  <button
                    type="button"
                    className="continue-booking-button"
                    onClick={continueBooking}
                  >
                    Continue Booking →
                  </button>
                )}

              </div>
            )}

            {step === 2 && (
              <form onSubmit={handleBooking}>

                <div className="booking-confirmed-slot">

                  <div>
                    <span>
                      DATE
                    </span>

                    <strong>
                      {formatDate(
                        bookingDate
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      TIME
                    </span>

                    <strong>
                      {formatTime(
                        fromTime
                      )}{" "}
                      -{" "}
                      {formatTime(
                        toTime
                      )}
                    </strong>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setStep(1)
                    }
                  >
                    Change
                  </button>

                </div>

                <div className="booking-field">

                  <label>
                    Purpose / Function *
                  </label>

                  <input
                    type="text"
                    maxLength="255"
                    placeholder="Birthday party, meeting, family function..."
                    value={purpose}
                    onChange={(event) =>
                      setPurpose(
                        event.target.value
                      )
                    }
                  />

                </div>

                <div className="booking-field">

                  <label>
                    Number of People *
                  </label>

                  <input
                    type="number"
                    min="1"
                    placeholder="Enter number of people"
                    value={numberOfPeople}
                    onChange={(event) =>
                      setNumberOfPeople(
                        event.target.value
                      )
                    }
                  />

                </div>

                <div className="booking-field">

                  <label>
                    Additional Requirements
                  </label>

                  <textarea
                    rows="3"
                    placeholder="Mention any special requirements..."
                    value={
                      additionalRequirements
                    }
                    onChange={(event) =>
                      setAdditionalRequirements(
                        event.target.value
                      )
                    }
                  />

                </div>

                <div className="addons-section">

                  <div className="addons-heading">

                    <h3>
                      Additional Paid Extras
                    </h3>

                    <p>
                      Select any extra items
                      required for your booking.
                    </p>

                  </div>

                  {addons.length === 0 ? (
                    <p className="no-addons">
                      No additional extras
                      available.
                    </p>
                  ) : (
                    <div className="addons-list">

                      {addons.map(
                        (addon) => {

                          const selected =
                            isAddonSelected(
                              addon.addon_id
                            );

                          return (
                            <div
                              className={`addon-item ${
                                selected
                                  ? "selected"
                                  : ""
                              }`}
                              key={
                                addon.addon_id
                              }
                            >

                              <label className="addon-check">

                                <input
                                  type="checkbox"
                                  checked={
                                    selected
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    handleAddonChange(
                                      addon.addon_id,
                                      event
                                        .target
                                        .checked
                                    )
                                  }
                                />

                                <span>

                                  <strong>
                                    {
                                      addon.addon_name
                                    }
                                  </strong>

                                  <small>
                                    {
                                      addon.charge_type
                                    }{" "}
                                    · ₹
                                    {Number(
                                      addon.price
                                    ).toLocaleString(
                                      "en-IN"
                                    )}
                                  </small>

                                </span>

                              </label>

                              {selected &&
                                addon.charge_type !==
                                  "Fixed" && (
                                  <input
                                    className="addon-quantity"
                                    type="number"
                                    min="1"
                                    value={getAddonQuantity(
                                      addon.addon_id
                                    )}
                                    onChange={(
                                      event
                                    ) =>
                                      updateAddonQuantity(
                                        addon.addon_id,
                                        event
                                          .target
                                          .value
                                      )
                                    }
                                  />
                                )}

                            </div>
                          );
                        }
                      )}

                    </div>
                  )}

                </div>

                <div className="booking-price-summary">

                  <div>

                    <span>
                      Facility charge
                    </span>

                    <strong>
                      ₹
                      {selectedFacilityBookingCharge.toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Additional extras
                    </span>

                    <strong>
                      ₹
                      {selectedAddonTotal.toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                  </div>

                  <div className="price-total">

                    <span>
                      Estimated total
                    </span>

                    <strong>
                      ₹
                      {estimatedTotal.toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                  </div>

                </div>

                {formMessage && (
                  <div className="booking-message success">
                    {formMessage}
                  </div>
                )}

                {formError && (
                  <div className="booking-message error">
                    {formError}
                  </div>
                )}

                <div className="booking-modal-actions">

                  <button
                    type="button"
                    className="cancel-booking-button"
                    onClick={() =>
                      setStep(1)
                    }
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    className="submit-booking-button"
                    disabled={submitting}
                  >
                    {submitting
                      ? "Submitting..."
                      : "Submit Booking Request"}
                  </button>

                </div>

              </form>
            )}

          </div>

        </div>
      )}

    </div>
  );
};

export default Facilities;