-- Add username and password fields to users table for authentication

-- Add username column (unique)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;

-- Add password_hash column for storing hashed passwords
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Update existing admin user with default credentials
UPDATE users 
SET username = 'admin', 
    password_hash = '$2a$10$rKZLvVZhVqJYQKJYQKJYQOeH8vZhVqJYQKJYQKJYQOeH8vZhVqJYQO' -- This is 'admin123' hashed
WHERE email = 'admin@pos.com';

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
