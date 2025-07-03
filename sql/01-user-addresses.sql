-- Create a table for users to save their frequent addresses
CREATE TABLE user_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_user_address_label UNIQUE(user_id, label)
);

-- Enable Row Level Security (RLS)
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- 1. Users can view their own addresses
CREATE POLICY "Users can view their own addresses"
ON user_addresses
FOR SELECT
USING (auth.uid() = user_id);

-- 2. Users can insert their own addresses
CREATE POLICY "Users can insert their own addresses"
ON user_addresses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own addresses
CREATE POLICY "Users can update their own addresses"
ON user_addresses
FOR UPDATE
USING (auth.uid() = user_id);

-- 4. Users can delete their own addresses
CREATE POLICY "Users can delete their own addresses"
ON user_addresses
FOR DELETE
USING (auth.uid() = user_id);
