-- Copy and run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create Profiles Table (Linked to Auth)
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  name text,
  business_name text,
  role text default 'user',
  plan text default 'solo',
  joined_date text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Create Clients Table
create table if not exists clients (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text,
  email text,
  phone text,
  company text,
  address text,
  status text default 'active',
  total_spent numeric default 0,
  last_contact text,
  notes text
);

-- 3. Create Documents Table
create table if not exists documents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  client_id uuid references clients(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  type text,
  status text default 'draft',
  date text,
  due_date text,
  subtotal numeric default 0,
  tax numeric default 0,
  total numeric default 0,
  items jsonb default '[]'::jsonb,
  design jsonb default '{}'::jsonb,
  notes text
);

-- 4. Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table clients enable row level security;
alter table documents enable row level security;

-- 5. Create Security Policies
-- Profiles
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Clients
create policy "Users can view own clients" on clients for select using (auth.uid() = user_id);
create policy "Users can insert own clients" on clients for insert with check (auth.uid() = user_id);
create policy "Users can update own clients" on clients for update using (auth.uid() = user_id);
create policy "Users can delete own clients" on clients for delete using (auth.uid() = user_id);

-- Documents
create policy "Users can view own documents" on documents for select using (auth.uid() = user_id);
create policy "Users can insert own documents" on documents for insert with check (auth.uid() = user_id);
create policy "Users can update own documents" on documents for update using (auth.uid() = user_id);
create policy "Users can delete own documents" on documents for delete using (auth.uid() = user_id);