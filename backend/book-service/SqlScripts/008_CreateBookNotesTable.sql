CREATE TABLE IF NOT EXISTS BookNotes (
    id SERIAL PRIMARY KEY,
    readingStatus_id INT REFERENCES ReadingStatus(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    page_number INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);