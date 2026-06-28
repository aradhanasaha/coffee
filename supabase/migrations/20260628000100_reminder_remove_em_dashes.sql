-- Replace em dashes with commas in reminder copy. Only touches the " — " pattern
-- (and any stray bare em dash), so in-word hyphens like "hole-in-the-wall" and
-- "cafe-hopping" are left alone.
UPDATE public.reminder_messages SET body  = replace(body,  ' — ', ', ') WHERE body  LIKE '%—%';
UPDATE public.reminder_messages SET body  = replace(body,  '—',   ',')  WHERE body  LIKE '%—%';
UPDATE public.reminder_messages SET title = replace(title, ' — ', ', ') WHERE title LIKE '%—%';
UPDATE public.reminder_messages SET title = replace(title, '—',   ',')  WHERE title LIKE '%—%';
