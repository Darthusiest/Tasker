-- creates tables (Task table)

-- User Table   
Create Table Users (
    -- column_name data_type constraints
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
);

-- Task Table
Create Table Tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    task TEXT NOT NULL, 
    description TEXT,
    start_date TEXT,
    end_date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    completed INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE -- must turn on foreign key in backend
);


--Create tables if they don't exist
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    task TEXT NOT NULL, 
    description TEXT,
    start_date TEXT,
    end_date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    completed INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);