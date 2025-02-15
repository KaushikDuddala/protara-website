-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  testimonial TEXT NOT NULL,
  verified_purchase BOOLEAN DEFAULT FALSE,
  product_id bigint REFERENCES products(id) ON DELETE SET NULL,
  contact TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_testimonials_timestamp ON testimonials(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_testimonials_status ON testimonials(status);
CREATE INDEX IF NOT EXISTS idx_testimonials_rating ON testimonials(rating);

-- Ensure product_id column exists for existing installs
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS product_id bigint REFERENCES products(id) ON DELETE SET NULL;

-- Ensure contact column exists for existing installs
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS contact TEXT;

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
DROP TRIGGER IF EXISTS update_testimonials_updated_at ON testimonials;

CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();