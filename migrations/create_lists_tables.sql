-- Create List Visibility Enum
CREATE TYPE list_visibility AS ENUM ('private', 'public');

-- Create Lists Table
CREATE TABLE public.lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NULL,
  visibility list_visibility NOT NULL DEFAULT 'private',
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc', now()),
  deleted_at timestamp with time zone NULL
);

CREATE INDEX idx_lists_owner ON public.lists(owner_id);
CREATE INDEX idx_lists_public ON public.lists(visibility)
  WHERE visibility = 'public' AND deleted_at IS NULL;

-- Create List Items Table
CREATE TABLE public.list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  coffee_log_id uuid NOT NULL REFERENCES public.coffee_logs(id) ON DELETE CASCADE,
  added_at timestamp with time zone NOT NULL DEFAULT timezone('utc', now())
);

-- Prevent duplicates
CREATE UNIQUE INDEX uniq_list_item
ON public.list_items(list_id, coffee_log_id);

-- Create List Saves Table
CREATE TABLE public.list_saves (
  user_id uuid NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  list_id uuid NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  saved_at timestamp with time zone NOT NULL DEFAULT timezone('utc', now()),
  PRIMARY KEY (user_id, list_id)
);

-- Enable RLS
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_saves ENABLE ROW LEVEL SECURITY;

-- Lists Policies

-- Read own lists + public lists
CREATE POLICY "read visible lists"
ON public.lists
FOR SELECT
USING (
  deleted_at IS NULL
  AND (
    visibility = 'public'
    OR owner_id = auth.uid()
  )
);

-- Create list
CREATE POLICY "create own list"
ON public.lists
FOR INSERT
WITH CHECK (owner_id = auth.uid());

-- Update / delete own list
CREATE POLICY "modify own list"
ON public.lists
FOR UPDATE
USING (owner_id = auth.uid());

-- List Items Policies

-- Read list items if list is visible
CREATE POLICY "read list items"
ON public.list_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.lists l
    WHERE l.id = list_items.list_id
      AND l.deleted_at IS NULL
      AND (
        l.visibility = 'public'
        OR l.owner_id = auth.uid()
      )
  )
);

-- Only list owner can add/remove items (v1)
CREATE POLICY "owner manages list items"
ON public.list_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.lists l
    WHERE l.id = list_items.list_id
      AND l.owner_id = auth.uid()
      AND l.deleted_at IS NULL
  )
);

CREATE POLICY "owner removes list items"
ON public.list_items
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.lists l
    WHERE l.id = list_items.list_id
      AND l.owner_id = auth.uid()
  )
);

-- List Saves Policies

-- Users manage their own saved lists
CREATE POLICY "read own saved lists"
ON public.list_saves
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "save list"
ON public.list_saves
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "unsave list"
ON public.list_saves
FOR DELETE
USING (user_id = auth.uid());
