-- Create the user_addresses table only if it doesn't exist
CREATE TABLE IF NOT EXISTS user_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    label TEXT NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, label)
);

-- Enable Row-Level Security for the table
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

-- Create policies for user_addresses
-- Drop existing policies before creating new ones to avoid errors on re-run
DROP POLICY IF EXISTS "Allow users to view their own addresses" ON public.user_addresses;
CREATE POLICY "Allow users to view their own addresses"
ON public.user_addresses
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to insert their own addresses" ON public.user_addresses;
CREATE POLICY "Allow users to insert their own addresses"
ON public.user_addresses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to update their own addresses" ON public.user_addresses;
CREATE POLICY "Allow users to update their own addresses"
ON public.user_addresses
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to delete their own addresses" ON public.user_addresses;
CREATE POLICY "Allow users to delete their own addresses"
ON public.user_addresses
FOR DELETE
USING (auth.uid() = user_id);
