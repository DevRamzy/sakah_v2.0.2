-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main listings table
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  category VARCHAR NOT NULL,
  subcategory VARCHAR NOT NULL,
  business_name VARCHAR NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR NOT NULL,
  phone VARCHAR,
  email VARCHAR,
  website VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_published BOOLEAN DEFAULT FALSE
);

-- Business hours table
CREATE TABLE IF NOT EXISTS business_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  day VARCHAR NOT NULL,
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT FALSE
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  description TEXT,
  price DECIMAL(10,2)
);

-- Property details table
CREATE TABLE IF NOT EXISTS property_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  property_type VARCHAR NOT NULL,
  size DECIMAL(10,2),
  bedrooms INTEGER,
  bathrooms INTEGER,
  amenities TEXT[]
);

-- Auto dealership details table
CREATE TABLE IF NOT EXISTS auto_dealership_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  brands TEXT[],
  services_offered TEXT[],
  financing_available BOOLEAN DEFAULT FALSE,
  specializations TEXT[]
);

-- Listing images table
CREATE TABLE IF NOT EXISTS listing_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  storage_path VARCHAR NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to listings table
DROP TRIGGER IF EXISTS set_updated_at ON listings;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON listings
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- RLS Policies
-- Enable RLS on all tables
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_dealership_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;

-- Listings policies
CREATE POLICY "Users can view their own listings" ON listings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Public can view published listings" ON listings
  FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Users can insert their own listings" ON listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings" ON listings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings" ON listings
  FOR DELETE USING (auth.uid() = user_id);

-- Business hours policies
CREATE POLICY "Users can view business hours for their listings" ON business_hours
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM listings WHERE listings.id = business_hours.listing_id AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view business hours for published listings" ON business_hours
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM listings WHERE listings.id = business_hours.listing_id AND listings.is_published = TRUE
    )
  );

CREATE POLICY "Users can insert business hours for their listings" ON business_hours
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings WHERE listings.id = business_hours.listing_id AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update business hours for their listings" ON business_hours
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM listings WHERE listings.id = business_hours.listing_id AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete business hours for their listings" ON business_hours
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM listings WHERE listings.id = business_hours.listing_id AND listings.user_id = auth.uid()
    )
  );

-- Apply similar policies to other tables (services, property_details, auto_dealership_details, listing_images)
-- Services policies
CREATE POLICY "Users can view services for their listings" ON services
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM listings WHERE listings.id = services.listing_id AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view services for published listings" ON services
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM listings WHERE listings.id = services.listing_id AND listings.is_published = TRUE
    )
  );

CREATE POLICY "Users can insert services for their listings" ON services
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings WHERE listings.id = services.listing_id AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update services for their listings" ON services
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM listings WHERE listings.id = services.listing_id AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete services for their listings" ON services
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM listings WHERE listings.id = services.listing_id AND listings.user_id = auth.uid()
    )
  );

-- Property details policies
CREATE POLICY "Users can view property details for their listings" ON property_details
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM listings WHERE listings.id = property_details.listing_id AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view property details for published listings" ON property_details
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM listings WHERE listings.id = property_details.listing_id AND listings.is_published = TRUE
    )
  );

CREATE POLICY "Users can insert property details for their listings" ON property_details
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings WHERE listings.id = property_details.listing_id AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update property details for their listings" ON property_details
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM listings WHERE listings.id = property_details.listing_id AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete property details for their listings" ON property_details
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM listings WHERE listings.id = property_details.listing_id AND listings.user_id = auth.uid()
    )
  );

-- Auto dealership details policies
CREATE POLICY "Users can view auto dealership details for their listings" ON auto_dealership_details
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM listings WHERE listings.id = auto_dealership_details.listing_id AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view auto dealership details for published listings" ON auto_dealership_details
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM listings WHERE listings.id = auto_dealership_details.listing_id AND listings.is_published = TRUE
    )
  );

CREATE POLICY "Users can insert auto dealership details for their listings" ON auto_dealership_details
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings WHERE listings.id = auto_dealership_details.listing_id AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update auto dealership details for their listings" ON auto_dealership_details
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM listings WHERE listings.id = auto_dealership_details.listing_id AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete auto dealership details for their listings" ON auto_dealership_details
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM listings WHERE listings.id = auto_dealership_details.listing_id AND listings.user_id = auth.uid()
    )
  );

-- Listing images policies
CREATE POLICY "Users can view images for their listings" ON listing_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM listings WHERE listings.id = listing_images.listing_id AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view images for published listings" ON listing_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM listings WHERE listings.id = listing_images.listing_id AND listings.is_published = TRUE
    )
  );

CREATE POLICY "Users can insert images for their listings" ON listing_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings WHERE listings.id = listing_images.listing_id AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update images for their listings" ON listing_images
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM listings WHERE listings.id = listing_images.listing_id AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete images for their listings" ON listing_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM listings WHERE listings.id = listing_images.listing_id AND listings.user_id = auth.uid()
    )
  );
