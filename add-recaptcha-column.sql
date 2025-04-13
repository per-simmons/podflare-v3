-- Add a column to store the reCAPTCHA token
ALTER TABLE "PodFlare Leads Submission" 
ADD COLUMN IF NOT EXISTS recaptcha_token TEXT; 