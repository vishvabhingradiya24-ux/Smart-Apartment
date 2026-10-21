import { useState } from "react";
import "../css/staff/staff_extra.css";

// Small dialog that asks the staff member for work notes before a status
// change (for example "Mark Completed"). The parent mounts it only while it
// is needed, so the text field always starts from `initialNotes`.
function WorkNotesModal({
  title,
  description,
  confirmLabel = "Save",
  initialNotes = "",
  placeholder = "What was done, or why it could not be completed?",
  busy = false,
  onConfirm,
  onCancel
}) {
  const [notes, setNotes] = useState(initialNotes);

  return (
    <div className="sx-modal-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <div className="sx-modal">
        <h3>{title}</h3>
        {description && <p>{description}</p>}

        <div className="sx-field">
          <label htmlFor="work-notes-input">Work notes (optional)</label>

          <textarea
            id="work-notes-input"
            value={notes}
            maxLength={1000}
            placeholder={placeholder}
            onChange={(event) => setNotes(event.target.value)}
            autoFocus
          />

          <small>{notes.length}/1000</small>
        </div>

        <div className="sx-modal-actions">
          <button type="button" className="sx-btn sx-btn-ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </button>

          <button
            type="button"
            className="sx-btn sx-btn-primary"
            onClick={() => onConfirm(notes.trim())}
            disabled={busy}
          >
            {busy ? "Saving..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default WorkNotesModal;
