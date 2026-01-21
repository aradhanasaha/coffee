-- Migration: Add function to get user email by username
-- This function allows looking up a user's email from their username
-- Required for username-based login since auth.users table is not directly accessible

-- Create a security definer function that can access auth.users
CREATE OR REPLACE FUNCTION get_user_email_by_username(p_username TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_email TEXT;
BEGIN
    -- Get the user_id from profiles
    SELECT user_id INTO v_user_id
    FROM profiles
    WHERE username = LOWER(p_username);
    
    IF v_user_id IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Get the email from auth.users
    SELECT email INTO v_email
    FROM auth.users
    WHERE id = v_user_id;
    
    RETURN v_email;
END;
$$;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION get_user_email_by_username(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_email_by_username(TEXT) TO anon;
