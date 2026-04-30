-- Simple SMS System Setup - Works with existing tables
-- Run this in Supabase SQL Editor

-- Step 1: Check what tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%sms%' OR table_name LIKE '%message%' OR table_name LIKE '%automation%'
ORDER BY table_name;

-- Step 2: Check message_templates structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'message_templates'
ORDER BY ordinal_position;

-- Step 3: If tables don't exist, create them
-- (Skip if they already exist)

-- Step 4: Insert templates using correct column names
-- First, let's see what's in the table
SELECT * FROM message_templates LIMIT 5;

-- Step 5: Insert automation rules with 10 minutes
-- Check if automation_rules table exists first
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'automation_rules'
ORDER BY ordinal_position;
