-- This script sets up the necessary tables and policies for the Dunlivrer app.
-- Run this in your Supabase SQL Editor.

-- Create the user_addresses table to store saved addresses for users.
CREATE TABLE public.user_addresses (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    label text NOT NULL,
    address text NOT NULL,
    created_at timestamp with time zone NULL DEFAULT now(),
    CONSTRAINT user_addresses_pkey PRIMARY KEY (id),
    CONSTRAINT user_addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT user_addresses_user_id_label_key UNIQUE (user_id, label)
);

-- Add comments for clarity
COMMENT ON TABLE public.user_addresses IS 'Stores saved addresses for authenticated users.';
COMMENT ON COLUMN public.user_addresses.label IS 'A user-defined label for the address, e.g., "Home", "Work".';


-- Enable Row Level Security (RLS) on the table.
-- This is crucial to ensure users can only access their own data.
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;


-- Create policies for Row Level Security.
-- These policies define the rules for who can access or modify which rows.

-- 1. Allow authenticated users to read their own addresses.
CREATE POLICY "Allow individual read access"
ON public.user_addresses
FOR SELECT
USING (auth.uid() = user_id);

-- 2. Allow authenticated users to insert their own addresses.
CREATE POLICY "Allow individual insert access"
ON public.user_addresses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. Allow authenticated users to update their own addresses.
CREATE POLICY "Allow individual update access"
ON public.user_addresses
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Allow authenticated users to delete their own addresses.
CREATE POLICY "Allow individual delete access"
ON public.user_addresses
FOR DELETE
USING (auth.uid() = user_id);
