-- Add pro_trial_ends_at to profiles table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'pro_trial_ends_at') THEN
        ALTER TABLE profiles ADD COLUMN pro_trial_ends_at timestamptz;
    END IF;
END $$;
