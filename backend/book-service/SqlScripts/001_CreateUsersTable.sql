CREATE TABLE IF NOT EXISTS Users (
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    preferred_genres TEXT,
    bio TEXT DEFAULT '',
    books_goal INT DEFAULT 0
);