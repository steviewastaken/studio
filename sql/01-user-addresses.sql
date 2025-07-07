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

-- Create a table for public user profiles
-- create table profiles (
--   id uuid references auth.users on delete cascade not null primary key,
--   full_name text,
--   role text,
--   updated_at timestamp with time zone
-- );
-- -- Set up Row Level Security (RLS)
-- alter table profiles enable row level security;
-- create policy "Public profiles are viewable by everyone." on profiles for select using (true);
-- create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
-- create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- -- This trigger automatically creates a profile entry when a new user signs up.
-- create or replace function public.handle_new_user()
-- returns trigger as $$
-- begin
--   insert into public.profiles (id, full_name, role)
--   values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'role');
--   return new;
-- end;
-- $$ language plpgsql security definer;
-- create or replace trigger on_auth_user_created
--   after insert on auth.users
--   for each row execute procedure public.handle_new_user();