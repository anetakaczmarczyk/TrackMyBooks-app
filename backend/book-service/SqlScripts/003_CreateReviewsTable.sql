CREATE TABLE IF NOT EXISTS Reviews (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) REFERENCES Users(username) ON DELETE CASCADE,
    book_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);