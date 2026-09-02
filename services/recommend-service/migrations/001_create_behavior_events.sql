-- Migration: create behavior_events table for recommendation_db
CREATE TABLE IF NOT EXISTS behavior_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id VARCHAR(255) NOT NULL UNIQUE,
    user_key VARCHAR(255) NOT NULL,
    product_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(128) NOT NULL,
    occurred_at DATETIME NOT NULL,
    properties JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
