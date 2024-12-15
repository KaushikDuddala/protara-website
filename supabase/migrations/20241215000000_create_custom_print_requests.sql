-- Create custom_print_requests table
CREATE TABLE IF NOT EXISTS custom_print_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('request', 'upload')),
  product_name TEXT NOT NULL,
  budget TEXT NOT NULL,
  description TEXT,
  email TEXT NOT NULL,
  phone_number TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'responded', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_custom_print_requests_timestamp ON custom_print_requests(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_custom_print_requests_status ON custom_print_requests(status);

-- Set up updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Postgres does not support IF NOT EXISTS on CREATE TRIGGER.
-- Drop existing trigger if present, then create it.
DROP TRIGGER IF EXISTS update_custom_print_requests_updated_at ON custom_print_requests;

CREATE TRIGGER update_custom_print_requests_updated_at
  BEFORE UPDATE ON custom_print_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();