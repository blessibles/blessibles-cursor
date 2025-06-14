-- Create user_preferences table
create table if not exists user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  order_updates boolean not null default true,
  marketing_emails boolean not null default false,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table user_preferences enable row level security;

-- Policy: Users can view their own preferences
create policy "Users can view their own preferences"
  on user_preferences for select
  using (auth.uid() = user_id);

-- Policy: Users can update their own preferences
create policy "Users can update their own preferences"
  on user_preferences for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policy: Users can insert their own preferences
create policy "Users can insert their own preferences"
  on user_preferences for insert
  with check (auth.uid() = user_id); 