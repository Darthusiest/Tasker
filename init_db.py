#Initialize database with schema.sql

import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

DB_PATH = BASE_DIR / "data" / "database.db"
SCHEMA_PATH = BASE_DIR / "schema.sql"

def main():
    if not DB_PATH.parent.exists():
        raise SystemExit("Missing Data/ Folder. Create it first: mkdir data")

    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("PRAGMA foreign_keys = ON;")
        schema = SCHEMA_PATH.read_text(encoding="utf-8")
        conn.executescript(schema)

    print("DB initialized successfully", DB_PATH)

if __name__ == "__main__":
    main()