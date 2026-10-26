# Gather

Gather is a small PHP and MySQL friends hangout app. Friend records live in the
`friends` table in the existing Laragon `hangout` database. Each friend is a
row; their name, phone, role, availability, spending range, and activities are
stored in separate columns.

## Run locally with Laragon

1. Start Laragon's MySQL and Apache services.
2. Open `http://localhost/Hangout/` in your browser. Do not open `index.html`
   directly from disk; the PHP API needs to run on the web server.
3. On the first API request, the app creates the `friends` table and inserts
   the 10 example friends if the table did not already exist. The existing
   `hangout` table is left unchanged.
4. Add, edit, and delete friends in the app. Changes are written to MySQL.

The local database defaults are host `127.0.0.1`, port `3306`, database
`hangout`, username `root`, and an empty password, as commonly configured in
Laragon. For a different local setup, set `GATHER_DB_HOST`, `GATHER_DB_PORT`,
`GATHER_DB_NAME`, `GATHER_DB_USER`, and `GATHER_DB_PASS` in the PHP server
environment.
