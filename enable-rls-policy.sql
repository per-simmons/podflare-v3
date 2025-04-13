-- Enable Row Level Security on the table
ALTER TABLE "PodFlare Leads Submission" ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous inserts
CREATE POLICY "Allow anonymous inserts" 
  ON "PodFlare Leads Submission" FOR INSERT 
  TO anon
  WITH CHECK (true);

-- Create policy to allow service role to select data
CREATE POLICY "Allow service role to select" 
  ON "PodFlare Leads Submission" FOR SELECT 
  TO service_role
  USING (true); 