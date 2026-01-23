-- Debug script to list policies and triggers on coffee_logs
-- Run this in Supabase SQL editor and share the results

SELECT 'POLICIES' as category, policyname, cmd, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'coffee_logs';

SELECT 'TRIGGERS' as category, trigger_name, action_statement 
FROM information_schema.triggers 
WHERE event_object_table = 'coffee_logs';

SELECT 'COLUMNS' as category, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'coffee_logs';
