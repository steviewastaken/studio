-- Create a table for users to save their frequent addresses
create table user_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  label text not null,
  address text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Make sure a user cannot have two addresses with the same label
  constraint user_address_label_unique unique (user_id, label)
);

-- Set up Row Level Security (RLS) for the user_addresses table
alter table user_addresses enable row level security;

create policy "Users can manage their own saved addresses." on user_addresses
  for all
  using (auth.uid() = user_id);