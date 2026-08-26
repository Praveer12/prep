-- 1. Create a table for user profiles
create table public.profiles (
  id uuid references auth.users not null primary key,
  user_name text,
  profile_pic text,
  exam_type text,
  exam_date text,
  streak integer default 0,
  first_active_date text,
  last_active_date text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create tasks table
create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  priority text,
  date text not null,
  completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create habits table (custom habits)
create table public.habits (
  id text primary key,
  user_id uuid references auth.users not null,
  name text not null,
  icon text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create habit logs table
create table public.habit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  habit_id text not null,
  date text not null,
  completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create activity logs table
create table public.activity_logs (
  id text primary key,
  user_id uuid references auth.users not null,
  type text not null,
  description text not null,
  date text not null,
  timestamp timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Create completed topics table
create table public.completed_topics (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  topic_key text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Create saved questions table
create table public.saved_questions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  question_text text not null,
  answer_text text not null,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Create notes table
create table public.notes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  content text not null,
  date text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) on all tables
alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.activity_logs enable row level security;
alter table public.completed_topics enable row level security;
alter table public.saved_questions enable row level security;
alter table public.notes enable row level security;

-- Create policies so users can only access their own data
create policy "Users can view their own profile." on profiles for select using (auth.uid() = id);
create policy "Users can update their own profile." on profiles for update using (auth.uid() = id);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);

create policy "Users can view own tasks." on tasks for select using (auth.uid() = user_id);
create policy "Users can insert own tasks." on tasks for insert with check (auth.uid() = user_id);
create policy "Users can update own tasks." on tasks for update using (auth.uid() = user_id);
create policy "Users can delete own tasks." on tasks for delete using (auth.uid() = user_id);

create policy "Users can view own habits." on habits for select using (auth.uid() = user_id);
create policy "Users can insert own habits." on habits for insert with check (auth.uid() = user_id);
create policy "Users can update own habits." on habits for update using (auth.uid() = user_id);
create policy "Users can delete own habits." on habits for delete using (auth.uid() = user_id);

create policy "Users can view own habit logs." on habit_logs for select using (auth.uid() = user_id);
create policy "Users can insert own habit logs." on habit_logs for insert with check (auth.uid() = user_id);
create policy "Users can update own habit logs." on habit_logs for update using (auth.uid() = user_id);
create policy "Users can delete own habit logs." on habit_logs for delete using (auth.uid() = user_id);

create policy "Users can view own activity logs." on activity_logs for select using (auth.uid() = user_id);
create policy "Users can insert own activity logs." on activity_logs for insert with check (auth.uid() = user_id);
create policy "Users can delete own activity logs." on activity_logs for delete using (auth.uid() = user_id);

create policy "Users can view own completed topics." on completed_topics for select using (auth.uid() = user_id);
create policy "Users can insert own completed topics." on completed_topics for insert with check (auth.uid() = user_id);
create policy "Users can delete own completed topics." on completed_topics for delete using (auth.uid() = user_id);

create policy "Users can view own saved questions." on saved_questions for select using (auth.uid() = user_id);
create policy "Users can insert own saved questions." on saved_questions for insert with check (auth.uid() = user_id);
create policy "Users can delete own saved questions." on saved_questions for delete using (auth.uid() = user_id);

create policy "Users can view own notes." on notes for select using (auth.uid() = user_id);
create policy "Users can insert own notes." on notes for insert with check (auth.uid() = user_id);
create policy "Users can update own notes." on notes for update using (auth.uid() = user_id);
create policy "Users can delete own notes." on notes for delete using (auth.uid() = user_id);
