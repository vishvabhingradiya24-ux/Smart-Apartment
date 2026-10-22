# Import residents and staff from Excel / CSV

Use this to add many residents or staff to the database at once, instead of typing them one by one.

## 1. Fill the template

1. Copy `residents_template.csv` (or `staff_template.csv`) into the `import/data/` folder.
   Files in `import/data/` are never committed to git, so real names, phone numbers and passwords stay private.
2. Open it in Excel, fill one person per row, and **Save as CSV** (keep the CSV format).
   `residents_example.csv` and `staff_example.csv` show what a filled file looks like.

### Resident columns

| Column | Rule |
|---|---|
| `first_name`, `last_name` | Letters, spaces, `.` `'` `-` |
| `email` | Valid email. Capital letters are changed to lowercase |
| `phone` | 10 digits (`+91` and spaces are removed automatically) |
| `block_wing` | `A`, `B`, `C` or `D` |
| `flat_number` | `101` to `504` (floors 1-5, flats 01-04). One resident per flat |
| `ownership_type` | `Owner` or `Rent` |
| `password` | Optional, see below |

### Staff columns

`first_name`, `last_name`, `email`, `phone`, `department`, `password` (optional).
`department` must be one of: Maintenance, Electrical, Plumbing, Housekeeping, Garden Maintenance, Security, Facility Supervisor.

### Passwords

- If you fill `password`, it needs at least 5 characters, 3 digits and 1 special character (for example `Asha@123`).
- If you **leave it empty**, a strong temporary password is created for that person and saved in a new file
  `<yourfile>_login_passwords_<time>.csv` next to your file. Give everyone their password, then delete that file.
- Passwords are stored hashed (bcrypt), the same way the app does it. They cannot be read back from the database.

## 2. Check the file (nothing is written)

Run these from the `backend` folder:

```bash
node import/importPeople.js residents import/data/residents.csv
node import/importPeople.js staff import/data/staff.csv
```

It lists every problem with the row number (the same number Excel shows). Fix them and run again.
People whose email is already in the database are skipped. If a different person already lives in a flat, it is reported as a conflict.

## 3. Add them to the database

When the check says the file looks good, run the same command with `--apply`:

```bash
node import/importPeople.js residents import/data/residents.csv --apply
node import/importPeople.js staff import/data/staff.csv --apply
```

Everything is saved in one go: if anything fails, nothing is added. Running it again later is safe, because existing emails are skipped.
