-- Create the user_addresses table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_addresses (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    user_id uuid NOT NULL,
    label text NOT NULL,
    address text NOT NULL,
    CONSTRAINT user_addresses_pkey PRIMARY KEY (id),
    CONSTRAINT user_addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Add unique constraint for label per user if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_addresses_user_id_label_key' 
    AND conrelid = 'public.user_addresses'::regclass
  ) THEN
    ALTER TABLE public.user_addresses 
    ADD CONSTRAINT user_addresses_user_id_label_key UNIQUE (user_id, label);
  END IF;
END
$$;


-- Enable Row Level Security (RLS) on the table if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'user_addresses' 
    AND rowsecurity = 't'
  ) THEN
    ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
  END IF;
END
$$;

-- Create policy for users to view their own addresses if it doesn't exist
CREATE POLICY "Allow individual read access"
ON public.user_addresses
FOR SELECT
USING (auth.uid() = user_id);

-- Create policy for users to insert their own addresses if it doesn't exist
CREATE POLICY "Allow individual insert access"
ON public.user_addresses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own addresses if it doesn't exist
CREATE POLICY "Allow individual update access"
ON public.user_addresses
FOR UPDATE
USING (auth.uid() = user_id);

-- Create policy for users to delete their own addresses if it doesn't exist
CREATE POLICY "Allow individual delete access"
ON public.user_addresses
FOR DELETE
USING (auth.uid() = user_id);
