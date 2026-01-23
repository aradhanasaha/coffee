-- Update the handle_new_user function to use metadata username if available

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_username text;
BEGIN
  -- Check if username is provided in metadata
  new_username := new.raw_user_meta_data->>'username';
  
  -- If not, generate a default one
  IF new_username IS NULL THEN
    new_username := 'user_' || lower(substring(md5(new.id::text || clock_timestamp()::text) from 1 for 8));
  END IF;

  INSERT INTO public.profiles (user_id, username, created_at, follower_count, following_count)
  VALUES (
    new.id,
    new_username,
    now(),
    0,
    0
  );
  
  RETURN new;
END;
$$;
