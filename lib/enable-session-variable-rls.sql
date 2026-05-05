-- ============================================================
-- ENABLE SESSION VARIABLE FOR RLS
-- This creates the set_config RPC function that the API uses
-- to set the PostgreSQL session variable for tenant isolation
-- ============================================================

-- Create the set_config function if it doesn't exist
-- This allows the API to set session variables via RPC
CREATE OR REPLACE FUNCTION set_config(
  setting_name TEXT,
  new_value TEXT,
  is_local BOOLEAN DEFAULT false
)
RETURNS TEXT AS $
BEGIN
  -- Set the configuration parameter
  PERFORM set_config(setting_name, new_value, is_local);
  
  -- Return the value that was set
  RETURN new_value;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION set_config(TEXT, TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION set_config(TEXT, TEXT, BOOLEAN) TO anon;
GRANT EXECUTE ON FUNCTION set_config(TEXT, TEXT, BOOLEAN) TO service_role;

-- Verify the function was created
SELECT 
  proname as function_name,
  prosrc as function_body
FROM pg_proc
WHERE proname = 'set_config'
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- ============================================================
-- DONE: The API can now call set_config() to set session variables
-- Example: await db.rpc('set_config', { 
--   setting_name: 'app.current_user_id', 
--   new_value: userId, 
--   is_local: true 
-- })
-- ============================================================
