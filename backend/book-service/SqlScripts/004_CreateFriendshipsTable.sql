CREATE TABLE IF NOT EXISTS Friendships (
    id SERIAL PRIMARY KEY,
    user1 VARCHAR(255) REFERENCES Users(username) ON DELETE CASCADE,
    user2 VARCHAR(255) REFERENCES Users(username) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
    UNIQUE (user1, user2)
);