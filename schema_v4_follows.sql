-- ============================================================================
-- V4 Social Layer: Follow System
-- Allows users to follow/unfollow other users
-- Tracks follower/following counts on user profiles
-- ============================================================================

-- ============================================================================
-- Step 1: Add follower/following count columns to profiles table
-- ============================================================================

alter table profiles
add column if not exists follower_count integer default 0,
add column if not exists following_count integer default 0;

-- Add check constraints to ensure counts never go negative
alter table profiles
add constraint follower_count_non_negative check (follower_count >= 0),
add constraint following_count_non_negative check (following_count >= 0);

-- ============================================================================
-- Step 2: Create follows table
-- ============================================================================

create table if not exists follows (
  id uuid default gen_random_uuid() primary key,
  follower_id uuid references auth.users not null,
  following_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Prevent duplicate follows
  unique(follower_id, following_id)
);

-- ============================================================================
-- Step 3: Create indexes for performance
-- ============================================================================

create index if not exists idx_follows_follower on follows(follower_id);
create index if not exists idx_follows_following on follows(following_id);
create index if not exists idx_follows_created on follows(created_at desc);

-- Composite index for efficient follow status checks
create index if not exists idx_follows_relationship on follows(follower_id, following_id);

-- ============================================================================
-- Step 4: Enable Row Level Security
-- ============================================================================

alter table follows enable row level security;

-- Anyone can view follows (public social feature)
create policy "Anyone can view follows"
on follows for select
using (true);

-- Users can only insert their own follows (follower_id must match auth.uid())
create policy "Users can insert their own follows"
on follows for insert
with check (auth.uid() = follower_id);

-- Users can only delete their own follows
create policy "Users can delete their own follows"
on follows for delete
using (auth.uid() = follower_id);

-- ============================================================================
-- Step 5: Create helper functions for count management
-- ============================================================================

-- Function to increment follow counts (called after insert)
create or replace function increment_follow_counts()
returns trigger as $$
begin
  -- Increment following_count for the follower
  update profiles
  set following_count = following_count + 1
  where user_id = new.follower_id;
  
  -- Increment follower_count for the user being followed
  update profiles
  set follower_count = follower_count + 1
  where user_id = new.following_id;
  
  return new;
end;
$$ language plpgsql security definer;

-- Function to decrement follow counts (called after delete)
create or replace function decrement_follow_counts()
returns trigger as $$
begin
  -- Decrement following_count for the follower (with floor at 0)
  update profiles
  set following_count = greatest(0, following_count - 1)
  where user_id = old.follower_id;
  
  -- Decrement follower_count for the user being unfollowed (with floor at 0)
  update profiles
  set follower_count = greatest(0, follower_count - 1)
  where user_id = old.following_id;
  
  return old;
end;
$$ language plpgsql security definer;

-- ============================================================================
-- Step 6: Create triggers to auto-update counts
-- ============================================================================

-- Trigger on INSERT to increment counts
create trigger on_follow_created
  after insert on follows
  for each row
  execute function increment_follow_counts();

-- Trigger on DELETE to decrement counts
create trigger on_follow_deleted
  after delete on follows
  for each row
  execute function decrement_follow_counts();

-- ============================================================================
-- Step 7: Grant permissions
-- ============================================================================

grant select on follows to authenticated;
grant select on follows to anon;
grant insert on follows to authenticated;
grant delete on follows to authenticated;

-- ============================================================================
-- Optional: Create helper view for follow statistics
-- ============================================================================

create or replace view user_follow_stats as
select
  u.id as user_id,
  p.username,
  p.follower_count,
  p.following_count,
  (
    select count(*)
    from follows f
    where f.follower_id = u.id
  ) as verified_following_count,
  (
    select count(*)
    from follows f
    where f.following_id = u.id
  ) as verified_follower_count
from auth.users u
left join profiles p on p.user_id = u.id;

grant select on user_follow_stats to authenticated;

-- ============================================================================
-- Notes:
-- - Triggers automatically maintain count integrity
-- - Unique constraint prevents duplicate follows at database level
-- - Self-follow prevention handled at application level (service layer)
-- - Counts are denormalized for performance but kept in sync via triggers
-- - Security: RLS ensures users can only create/delete their own follows
-- ============================================================================
