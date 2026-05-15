
-- =========================================
-- Pizza Voice Agent Database Schema
-- Tables: orders, complaints
-- =========================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ======================
-- Orders Table
-- ======================

CREATE TABLE IF NOT EXISTS orders (
  order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Customer Info Snapshot
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,

  -- Order Items stored as JSONB
  items JSONB NOT NULL,

  total_amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'MYR',

  order_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (order_status IN (
      'pending',
      'confirmed',
      'preparing',
      'out_for_delivery',
      'delivered',
      'cancelled'
    )),

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);

-- ======================
-- Complaints Table
-- ======================

CREATE TABLE IF NOT EXISTS complaints (
  complaint_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  order_id UUID REFERENCES orders(order_id) ON DELETE SET NULL,

  customer_name TEXT,
  customer_phone TEXT,

  complaint_type TEXT NOT NULL
    CHECK (complaint_type IN (
      'late_delivery',
      'wrong_order',
      'missing_item',
      'quality_issue',
      'refund_request',
      'other'
    )),

  description TEXT NOT NULL,

  complaint_status TEXT NOT NULL DEFAULT 'open'
    CHECK (complaint_status IN (
      'open',
      'in_review',
      'resolved',
      'rejected',
      'closed'
    )),

  resolution TEXT,
  refund_amount NUMERIC(10,2),

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_complaints_order ON complaints(order_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(complaint_status);
