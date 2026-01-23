-- Manual fix for users who signed up before the fix
-- Since the username wasn't saved to metadata for these users, we can't recover it automatically.
-- You can use this script to manually update their username.

-- Replace 'barista@example.com' with the user's email
-- Replace 'new_username' with the desired username

UPDATE public.profiles
SET 
  username = 'new_username',
  username_last_changed_at = now()
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'barista@example.com'
);
