-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('follow', 'post', 'save_list')),
    entity_id UUID, -- Can be reference to log_id, list_id, or null depending on type
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = recipient_id);

CREATE POLICY "Users can update their own notifications (mark as read)"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = recipient_id);

-- System/Service role needs specific permissions or we rely on service role key for insertion.
-- Typically, the service role (backend) inserts notifications, but if client-side triggers are used (which is the case here for now),
-- we need to allow authenticated users to insert notifications where they are the SENDER.
CREATE POLICY "Users can insert notifications they send"
    ON public.notifications FOR INSERT
    WITH CHECK (auth.uid() = sender_id);
