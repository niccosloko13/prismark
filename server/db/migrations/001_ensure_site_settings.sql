-- Idempotente: garante site_settings em bases que ainda não rodaram o trecho completo do schema.sql.
-- Seguro para rodar várias vezes (IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  legal_name TEXT,
  brand_name TEXT,
  address_line TEXT,
  city_state TEXT,
  postal_code TEXT,
  phone_display TEXT,
  phone_digits TEXT,
  email TEXT,
  short_trust_line TEXT,
  support_line TEXT,
  shipping_free_min_brl NUMERIC(12, 2),
  pix_discount_percent NUMERIC(5, 2) DEFAULT 15,
  site_whatsapp_digits TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
