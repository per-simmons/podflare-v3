-- Disable RLS completely for this table to simplify testing
ALTER TABLE "PodFlare Leads Submission" DISABLE ROW LEVEL SECURITY;

-- Grant all permissions to the anonymous role
GRANT ALL ON "PodFlare Leads Submission" TO anon;

-- We now know the ID is a UUID, so don't need to set up a sequence 