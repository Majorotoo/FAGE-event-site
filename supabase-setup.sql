-- Create participants table for OmniBSIC event registration
-- Run this in your Supabase SQL Editor

CREATE TABLE participants (
  id BIGSERIAL PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  surname VARCHAR(255) NOT NULL,
  telephone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  association VARCHAR(255),
  device_info JSONB,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on registered_at for faster sorting
CREATE INDEX idx_participants_registered_at ON participants(registered_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert data (for registration)
CREATE POLICY "Allow public insert" ON participants
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policy to allow anyone to select data (for admin dashboard)
-- Note: You may want to restrict this to authenticated users in production
CREATE POLICY "Allow public select" ON participants
  FOR SELECT
  TO anon
  USING (true);

-- Create policy to allow deletion (for admin dashboard)
CREATE POLICY "Allow public delete" ON participants
  FOR DELETE
  TO anon
  USING (true);

-- Optional: Create a view for better data presentation
CREATE VIEW participants_view AS
SELECT 
  id,
  first_name,
  surname,
  telephone,
  COALESCE(email, 'N/A') as email,
  COALESCE(association, 'N/A') as association,
  device_info,
  registered_at,
  created_at
FROM participants;
