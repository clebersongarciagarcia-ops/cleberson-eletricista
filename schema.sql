CREATE TABLE IF NOT EXISTS bookings (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 service TEXT NOT NULL,
 date TEXT NOT NULL,
 time TEXT NOT NULL,
 name TEXT NOT NULL,
 phone TEXT NOT NULL,
 address TEXT DEFAULT '',
 details TEXT DEFAULT '',
 value TEXT DEFAULT '0,00',
 status TEXT NOT NULL DEFAULT 'Pendente',
 created_at TEXT NOT NULL,
 updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_bookings_date_time ON bookings(date,time);
CREATE INDEX IF NOT EXISTS idx_bookings_name ON bookings(name);
