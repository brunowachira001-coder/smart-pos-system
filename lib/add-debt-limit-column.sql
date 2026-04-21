-- Migration: Add debt_limit column to customers table
-- Run this in Supabase SQL Editor if you already have a customers table

-- Add debt_limit column if it doesn't exist
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS debt_limit DECIMAL(10, 2) DEFAULT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN customers.debt_limit IS 'Maximum credit limit for this customer';
