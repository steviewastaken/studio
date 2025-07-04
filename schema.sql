
-- Create the user_addresses table
CREATE TABLE public.user_addresses (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    label text NOT NULL,
    address text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT user_addresses_pkey PRIMARY KEY (id),
    CONSTRAINT user_addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT user_addresses_user_id_label_key UNIQUE (user_id, label)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own addresses
CREATE POLICY "Allow individual read access"
ON public.user_addresses
FOR SELECT
USING (auth.uid() = user_id);

-- Create policy for users to insert their own addresses
CREATE POLICY "Allow individual insert access"
ON public.user_addresses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own addresses
CREATE POLICY "Allow individual update access"
ON public.user_addresses
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create policy for users to delete their own addresses
CREATE POLICY "Allow individual delete access"
ON public.user_addresses
FOR DELETE
USING (auth.uid() = user_id);
