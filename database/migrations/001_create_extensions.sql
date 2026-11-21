-- ==============================================================================
-- Migration: 001_create_extensions.sql
-- Description: Enable essential PostgreSQL extensions for SolarOS
-- Database: PostgreSQL 15+ / Supabase
-- ==============================================================================

-- Enable UUID extension for generating v4 UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for cryptographic hashing functions (if needed)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable pgvector for future AI RAG / document embeddings
CREATE EXTENSION IF NOT EXISTS "vector";

-- Helper trigger function to automatically update `updated_at` timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
