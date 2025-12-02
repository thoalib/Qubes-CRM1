-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text check (role in ('admin', 'employee')) default 'employee',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Leads table
create table leads (
  id uuid default uuid_generate_v4() primary key,
  type text check (type in ('academy', 'agency')) not null,
  stage text not null,
  assigned_to uuid references profiles(id),
  created_by uuid references profiles(id),
  contact_details jsonb default '{}'::jsonb, -- { name, email, phone, company }
  source text,
  next_follow_up_at timestamptz,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Students table
create table students (
  id uuid default uuid_generate_v4() primary key,
  lead_id uuid references leads(id),
  course text,
  batch text,
  fee_total numeric default 0,
  fee_paid numeric default 0,
  status text check (status in ('active', 'on_hold', 'completed', 'withdrawn')) default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tasks table
create table tasks (
  id uuid default uuid_generate_v4() primary key,
  related_lead_id uuid references leads(id),
  related_student_id uuid references students(id),
  title text not null,
  description text,
  status text check (status in ('pending', 'in_progress', 'completed', 'blocked')) default 'pending',
  assigned_to uuid references profiles(id),
  due_date timestamptz,
  priority text check (priority in ('standard', 'important', 'critical')) default 'standard',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Finance Entries table
create table finance_entries (
  id uuid default uuid_generate_v4() primary key,
  type text check (type in ('income', 'expense')) not null,
  amount numeric not null,
  category text,
  linked_lead_id uuid references leads(id),
  linked_student_id uuid references students(id),
  date timestamptz default now(),
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- Notifications table
create table notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id),
  title text not null,
  message text,
  link text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- RLS Policies

-- Profiles: Readable by all authenticated users, editable only by self or admin
alter table profiles enable row level security;
create policy "Profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Leads: Employees view assigned, Admin views all
alter table leads enable row level security;
create policy "Leads viewable by assignee or admin" on leads for select using (
  auth.uid() = assigned_to or 
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Leads insertable by authenticated users" on leads for insert with check (auth.role() = 'authenticated');
create policy "Leads updatable by assignee or admin" on leads for update using (
  auth.uid() = assigned_to or 
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Tasks: Viewable by assignee or creator or admin
alter table tasks enable row level security;
create policy "Tasks viewable by assignee, creator, or admin" on tasks for select using (
  auth.uid() = assigned_to or 
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Tasks insertable by authenticated users" on tasks for insert with check (auth.role() = 'authenticated');
create policy "Tasks updatable by assignee or admin" on tasks for update using (
  auth.uid() = assigned_to or 
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Students & Finance: Admin only (or specific permissions, keeping simple for now)
alter table students enable row level security;
create policy "Students viewable by admin" on students for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

alter table finance_entries enable row level security;
create policy "Finance viewable by admin" on finance_entries for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Notifications: Users view their own
alter table notifications enable row level security;
create policy "Users can view own notifications" on notifications for select using (auth.uid() = user_id);
create policy "Users can update own notifications" on notifications for update using (auth.uid() = user_id);

-- Function to handle new user signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'employee');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
