-- Add last_sign_in_at to profiles if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_sign_in_at') THEN
        ALTER TABLE profiles ADD COLUMN last_sign_in_at timestamptz;
    END IF;
END $$;

-- Create function to sync timestamp
CREATE OR REPLACE FUNCTION public.sync_last_sign_in()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET last_sign_in_at = NEW.last_sign_in_at
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
-- Drop if exists to avoid duplication errors on re-run
DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
CREATE TRIGGER on_auth_user_login
AFTER UPDATE OF last_sign_in_at ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.sync_last_sign_in();
