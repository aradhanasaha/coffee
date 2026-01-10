-- Create the coffee_logs table
create table coffee_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null default auth.uid(),
  coffee_name text not null,
  place text not null,
  price numeric,
  rating integer check (rating >= 1 and rating <= 5),
  review text,
  flavor_notes text,
  price_feel text check (price_feel in ('steal', 'fair', 'expensive'))
);

-- Enable Row Level Security (RLS)
alter table coffee_logs enable row level security;

-- Create policies
create policy "Users can insert their own logs" 
on coffee_logs for insert 
with check (auth.uid() = user_id);

create policy "Users can view their own logs" 
on coffee_logs for select 
using (auth.uid() = user_id);

create policy "Users can update their own logs"
on coffee_logs for update
using (auth.uid() = user_id);

create policy "Users can delete their own logs"
on coffee_logs for delete
using (auth.uid() = user_id);

-- Locations table policies
-- Note: locations table is shared, so we allow anyone to view and any authenticated user to insert
-- but we typically don't allow updates to shared location data from the client.
alter table locations enable row level security;

create policy "Anyone can view locations"
on locations for select
using (true);

create policy "Authenticated users can insert locations"
on locations for insert
with check (auth.role() = 'authenticated');
