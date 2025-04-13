-- First, check if RLS is enabled and enable it if not
SELECT tablename, row_security FROM pg_tables WHERE tablename = 'PodFlare Leads Submission';

-- Make sure RLS is enabled
ALTER TABLE "PodFlare Leads Submission" ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to start fresh
DROP POLICY IF EXISTS "Allow anon insert" ON "PodFlare Leads Submission";
DROP POLICY IF EXISTS "Allow anonymous inserts" ON "PodFlare Leads Submission";

-- Create a simple, permissive policy for anonymous inserts
CREATE POLICY "Allow anon insert" 
  ON "PodFlare Leads Submission" 
  FOR INSERT 
  TO anon 
  WITH CHECK (true);

-- Make sure public can use the table
GRANT INSERT ON "PodFlare Leads Submission" TO anon;
GRANT SELECT ON "PodFlare Leads Submission" TO anon;

-- Verify the policy was created
SELECT * FROM pg_policies WHERE tablename = 'PodFlare Leads Submission'; 