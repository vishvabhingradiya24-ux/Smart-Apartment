# Smart-Apartment

## Database setup

After creating the database and applying `backend/database/admin_panel_schema.sql`,
run `backend/database/add_staff_role_features.sql` against the same database.
This migration is safe to rerun and adds the columns required by Security visitor
registration to existing installations.