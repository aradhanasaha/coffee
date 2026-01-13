-- ============================================================================
-- V3 Social Layer: Likes System
-- Generic, extensible table for liking coffee logs, lists, photos, cafes
-- ============================================================================

-- Create likes table with polymorphic target support
create table if not exists likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  target_id uuid not null,
  target_type text not null check (target_type in ('coffee_log', 'list', 'photo', 'cafe')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure a user can only like a target once
  unique(user_id, target_id, target_type)
);

-- Indexes for performance
create index if not exists idx_likes_target on likes(target_id, target_type);
create index if not exists idx_likes_user on likes(user_id);

-- Enable Row Level Security
alter table likes enable row level security;

-- RLS Policies: Anyone can view likes (public social feature)
create policy "Anyone can view likes"
on likes for select
using (true);

-- Authenticated users can insert their own likes
create policy "Users can insert their own likes"
on likes for insert
with check (auth.uid() = user_id);

-- Users can delete their own likes (unlike)
create policy "Users can delete their own likes"
on likes for delete
using (auth.uid() = user_id);

-- ============================================================================
-- Helper View: Like Counts (aggregated)
-- ============================================================================

create or replace view like_counts as
select 
  target_id,
  target_type,
  count(*) as like_count
from likes
group by target_id, target_type;

-- ============================================================================
-- Update coffee_logs RLS for public viewing
-- ============================================================================

-- Drop the restrictive policy that only allows users to see their own logs
drop policy if exists "Users can view their own logs" on coffee_logs;

-- Add new policy: Anyone can view non-deleted coffee logs
create policy "Anyone can view all coffee logs"
on coffee_logs for select
using (deleted_at is null);

-- ============================================================================
-- Grant permissions for views
-- ============================================================================

grant select on like_counts to authenticated;
grant select on like_counts to anon;
