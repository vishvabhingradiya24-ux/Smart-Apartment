import { useEffect } from "react";

const AdminFormModal = ({ title, onClose, saving = false, children }) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !saving) onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, saving]);

  return (
    <div
      className="admin-form-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <section className="admin-form-modal" role="dialog" aria-modal="true" aria-labelledby="admin-form-modal-title">
        <header className="admin-form-modal-header">
          <h2 id="admin-form-modal-title">{title}</h2>
          <button
            type="button"
            className="admin-form-modal-close"
            aria-label="Close form"
            onClick={onClose}
            disabled={saving}
          >
            ×
          </button>
        </header>
        {children}
      </section>
    </div>
  );
};

export default AdminFormModal;