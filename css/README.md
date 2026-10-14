# CSS files in this folder

The running React app is inside `frontend/`. Its pages import styles from
`frontend/src/css/`; files in this top-level `css/` folder are legacy copies
and are not loaded by Vite.

For a project-wide custom style, edit `frontend/src/css/custom-overrides.css`.
For a page-specific style, edit the CSS file imported by that page, such as
`frontend/src/css/admin.css` for the admin layout or
`frontend/src/css/resident/residentVisitors.css` for the resident visitors page.

Run the frontend with `npm run dev` from the `frontend/` folder. Keep that
development server running and open its localhost URL; Vite applies saved CSS
changes in the browser automatically.
