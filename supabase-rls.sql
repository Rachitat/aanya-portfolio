-- Run this ONCE in Supabase → SQL Editor → New query → Run
-- This locks down your "form" table so strangers cannot read or edit messages.

ALTER TABLE form ENABLE ROW LEVEL SECURITY;

-- Remove old open policies (safe if they do not exist)
DROP POLICY IF EXISTS "Allow anon to read form" ON form;
DROP POLICY IF EXISTS "Allow anon to update form" ON form;
DROP POLICY IF EXISTS "Allow anon insert" ON form;
DROP POLICY IF EXISTS "Anyone can submit contact form" ON form;
DROP POLICY IF EXISTS "Admin can read messages" ON form;
DROP POLICY IF EXISTS "Admin can update messages" ON form;

-- Contact form (public website): visitors may INSERT only
CREATE POLICY "Anyone can submit contact form"
  ON form FOR INSERT
  TO anon
  WITH CHECK (true);

-- Admin inbox: only signed-in users may read messages
CREATE POLICY "Admin can read messages"
  ON form FOR SELECT
  TO authenticated
  USING (true);

-- Admin inbox: only signed-in users may mark messages as read
CREATE POLICY "Admin can update messages"
  ON form FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
