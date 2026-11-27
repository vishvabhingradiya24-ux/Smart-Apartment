# Smart-Apartment

## Database setup

After creating the database and applying `backend/database/admin_panel_schema.sql`,
run `backend/database/add_staff_role_features.sql` against the same database.
This migration is safe to rerun and adds the columns required by Security visitor
registration to existing installations.

## Password reset email

Password reset OTP delivery uses Nodemailer. Configure `EMAIL_USER` and
`EMAIL_PASS` in `backend/.env`; with no SMTP host configured, Gmail is used by
default. For Gmail, use an app password rather than the account password.
Alternatively, configure `SMTP_HOST`, `SMTP_PORT`, and optionally
`SMTP_SECURE=true` for a custom SMTP server. Restart the backend after changing
these settings. Never commit `.env` or share email credentials.

## Frontend API URL

Copy `frontend/.env.example` to `frontend/.env` for local development. For a
deployed frontend, set `VITE_API_BASE_URL` to the backend origin (without
`/api`) before building, for example `https://api.example.com`.
