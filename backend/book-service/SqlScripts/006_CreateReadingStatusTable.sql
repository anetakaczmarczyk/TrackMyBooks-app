CREATE TABLE IF NOT EXISTS ReadingStatus (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) REFERENCES Users(username) ON DELETE CASCADE,
    book_id INT NOT NULL,
    progress INT DEFAULT 0,
    status VARCHAR(50) NOT NULL CHECK (status IN ('reading', 'read', 'wishlist', 'abandoned')),
    start_date DATE,
    end_date DATE,
    UNIQUE (username, book_id)
);