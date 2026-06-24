-- V3__add_security_fields.sql
-- Adds fields for account lockout and password recovery

ALTER TABLE users 
ADD COLUMN failed_login_attempts INT DEFAULT 0 NOT NULL,
ADD COLUMN locked_until TIMESTAMP,
ADD COLUMN reset_token VARCHAR(255),
ADD COLUMN reset_token_expires_at TIMESTAMP;

CREATE INDEX idx_users_reset_token ON users(reset_token);
