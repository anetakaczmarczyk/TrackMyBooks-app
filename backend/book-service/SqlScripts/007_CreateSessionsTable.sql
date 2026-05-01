CREATE TABLE IF NOT EXISTS Sessions (
    id SERIAL PRIMARY KEY,
    readingStatus_id INT REFERENCES ReadingStatus(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pages_started INT,
    pages_finished INT,
    duration_minutes INT
);