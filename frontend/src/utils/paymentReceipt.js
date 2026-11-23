const escapeHtml = (value) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

const formatReceiptDate = (value) => value
  ? new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
  : "—";

const formatReceiptAmount = (value) => Number(value || 0).toLocaleString("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export const downloadPaymentReceipt = (payment, resident = {}) => {
  if (payment.status !== "Paid") return;

  const residentDetails = {
    first_name: resident.first_name || payment.first_name,
    last_name: resident.last_name || payment.last_name,
    email: resident.email || payment.email,
    phone: resident.phone || payment.phone,
    block_wing: resident.block_wing || payment.block_wing,
    flat_number: resident.flat_number || payment.flat_number,
  };
  const receiptWindow = window.open("", "_blank");
  if (!receiptWindow) {
    window.alert("Please allow pop-ups to download your payment receipt.");
    return;
  }

  const residentName = [residentDetails.first_name, residentDetails.last_name].filter(Boolean).join(" ");
  const flat = [residentDetails.block_wing, residentDetails.flat_number].filter(Boolean).join("-");
  const isAmenityBooking = Boolean(payment.booking_id);
  const paymentFor = isAmenityBooking
    ? `Amenity booking · ${payment.facility_name || `Booking #${payment.booking_id}`}`
    : payment.payment_type === "Maintenance"
      ? "Monthly maintenance"
      : payment.payment_type || "Apartment charges";
  const bookingDate = payment.facility_booking_date
    ? `${formatReceiptDate(payment.facility_booking_date)}${payment.facility_start_time ? ` · ${String(payment.facility_start_time).slice(0, 5)}` : ""}${payment.facility_end_time ? `–${String(payment.facility_end_time).slice(0, 5)}` : ""}`
    : "";
  const chargeRows = [
    isAmenityBooking && Number(payment.facility_charge) > 0
      ? `<div><dt>Amenity charge</dt><dd>${escapeHtml(formatReceiptAmount(payment.facility_charge))}</dd></div>`
      : "",
    isAmenityBooking && Number(payment.additional_charge) > 0
      ? `<div><dt>Add-on charges${payment.facility_addons ? ` · ${escapeHtml(payment.facility_addons)}` : ""}</dt><dd>${escapeHtml(formatReceiptAmount(payment.additional_charge))}</dd></div>`
      : "",
    Number(payment.penalty_amount) > 0
      ? `<div><dt>Late charge</dt><dd>${escapeHtml(formatReceiptAmount(payment.penalty_amount))}</dd></div>`
      : "",
  ].filter(Boolean).join("");

  receiptWindow.document.open();
  receiptWindow.document.write(`<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Payment Receipt PAY${escapeHtml(payment.id ?? payment.payment_id)}</title>
        <style>
          body { margin: 0; padding: 32px; color: #172033; font: 15px Arial, sans-serif; }
          main { max-width: 680px; margin: 0 auto; padding: 32px; border: 1px solid #d9e1eb; border-radius: 12px; }
          h1 { margin: 0; color: #087c67; font-size: 24px; }
          .subtitle { margin: 8px 0 28px; color: #64748b; }
          .amount { margin: 0 0 24px; font-size: 30px; font-weight: 700; }
          dl { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin: 0; }
          dt { margin-bottom: 5px; color: #64748b; font-size: 12px; text-transform: uppercase; }
          dd { margin: 0; overflow-wrap: anywhere; font-weight: 600; }
          .status { margin-top: 26px; padding: 12px; border-radius: 8px; background: #e8f8f4; color: #087c67; font-weight: 700; }
          .print { margin-top: 24px; padding: 10px 16px; border: 0; border-radius: 7px; background: #087c67; color: white; cursor: pointer; }
          @media print { body { padding: 0; } main { border: 0; } .print { display: none; } }
        </style>
      </head>
      <body>
        <main>
          <h1>Smart Apartment</h1>
          <p class="subtitle">Payment receipt · PAY${escapeHtml(payment.id ?? payment.payment_id)}</p>
          <p class="amount">${escapeHtml(formatReceiptAmount(payment.amount))}</p>
          <dl>
            <div><dt>Resident</dt><dd>${escapeHtml(residentName || "Resident")}</dd></div>
            <div><dt>Flat</dt><dd>${escapeHtml(flat || "—")}</dd></div>
            ${residentDetails.email ? `<div><dt>Email</dt><dd>${escapeHtml(residentDetails.email)}</dd></div>` : ""}
            ${residentDetails.phone ? `<div><dt>Phone</dt><dd>${escapeHtml(residentDetails.phone)}</dd></div>` : ""}
            <div><dt>Payment for</dt><dd>${escapeHtml(paymentFor)}</dd></div>
            <div><dt>Billing month</dt><dd>${escapeHtml(payment.billing_month || "—")}</dd></div>
            ${isAmenityBooking ? `<div><dt>Booking date / time</dt><dd>${escapeHtml(bookingDate || "—")}</dd></div><div><dt>Purpose</dt><dd>${escapeHtml(payment.facility_booking_purpose || "—")}</dd></div>` : ""}
            ${chargeRows}
            <div><dt>Payment date</dt><dd>${escapeHtml(formatReceiptDate(payment.paid_date))}</dd></div>
            <div><dt>Payment method</dt><dd>${escapeHtml(payment.payment_method || "Razorpay")}</dd></div>
            <div><dt>Transaction ID</dt><dd>${escapeHtml(payment.transaction_id || "—")}</dd></div>
          </dl>
          <div class="status">Payment completed successfully</div>
          <button class="print" onclick="window.print()">Download / Print receipt</button>
        </main>
      </body>
    </html>`);
  receiptWindow.document.close();
  receiptWindow.focus();
  receiptWindow.setTimeout(() => receiptWindow.print(), 300);
};
