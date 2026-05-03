CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  company TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('client', 'admin')),
  auth_provider TEXT NOT NULL DEFAULT 'credentials' CHECK (auth_provider IN ('credentials', 'google', 'hybrid')),
  google_sub TEXT UNIQUE,
  avatar_url TEXT,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider TEXT NOT NULL DEFAULT 'credentials';
ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_sub TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

DO $$
BEGIN
  ALTER TABLE users ADD CONSTRAINT users_auth_provider_check CHECK (auth_provider IN ('credentials', 'google', 'hybrid'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE SEQUENCE IF NOT EXISTS order_code_seq START WITH 24031;

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  product_slug TEXT NOT NULL,
  product_name TEXT NOT NULL,
  width_cm NUMERIC(10, 2) NOT NULL,
  height_cm NUMERIC(10, 2) NOT NULL,
  area_m2 NUMERIC(12, 4) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  material TEXT NOT NULL,
  finishing TEXT NOT NULL,
  deadline TEXT NOT NULL,
  value_total NUMERIC(12, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('novo', 'aguardando arte', 'em análise', 'produção', 'finalizado', 'entregue')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
  uploaded_by_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  original_name TEXT NOT NULL,
  stored_name TEXT NOT NULL UNIQUE,
  storage_driver TEXT NOT NULL,
  relative_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL CHECK (size_bytes > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_status_history (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL CHECK (to_status IN ('novo', 'aguardando arte', 'em análise', 'produção', 'finalizado', 'entregue')),
  changed_by_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_events (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  actor_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_settings (
  id TEXT PRIMARY KEY,
  pix_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  pix_key TEXT,
  pix_key_type TEXT CHECK (pix_key_type IN ('CPF', 'CNPJ', 'EMAIL', 'PHONE', 'RANDOM')),
  pix_receiver_name TEXT,
  pix_receiver_city TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('PIX_MANUAL')),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED')),
  txid TEXT NOT NULL UNIQUE,
  pix_copy_paste TEXT,
  proof_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(method);

ALTER TABLE payments ADD COLUMN IF NOT EXISTS pix_qr_data_url TEXT;

DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  FOR constraint_name IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = c.connamespace
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(c.conkey)
    WHERE c.contype = 'c' AND n.nspname = 'public' AND t.relname = 'orders' AND a.attname = 'status'
  LOOP
    EXECUTE format('ALTER TABLE orders DROP CONSTRAINT %I', constraint_name);
  END LOOP;
END $$;

ALTER TABLE orders
  ADD CONSTRAINT orders_status_check CHECK (
    status IN (
      'novo',
      'aguardando pagamento',
      'confirmado',
      'cancelado',
      'aguardando arte',
      'em análise',
      'produção',
      'finalizado',
      'entregue'
    )
  );

DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  FOR constraint_name IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = c.connamespace
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(c.conkey)
    WHERE c.contype = 'c' AND n.nspname = 'public' AND t.relname = 'order_status_history' AND a.attname = 'to_status'
  LOOP
    EXECUTE format('ALTER TABLE order_status_history DROP CONSTRAINT %I', constraint_name);
  END LOOP;
END $$;

ALTER TABLE order_status_history
  ADD CONSTRAINT order_status_history_to_status_check CHECK (
    to_status IN (
      'novo',
      'aguardando pagamento',
      'confirmado',
      'cancelado',
      'aguardando arte',
      'em análise',
      'produção',
      'finalizado',
      'entregue'
    )
  );

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username) WHERE username IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_sub ON users(google_sub) WHERE google_sub IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_files_order_id ON files(order_id);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_by_user_id ON files(uploaded_by_user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_files_unique_order_id ON files(order_id) WHERE order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_events_order_id ON order_events(order_id);

-- Admin / operações (2026)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cpf TEXT;

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
  pix_discount_percent NUMERIC(5, 2) DEFAULT 10,
  site_whatsapp_digits TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_overrides (
  product_slug TEXT PRIMARY KEY,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  base_price_m2 NUMERIC(12, 2),
  featured BOOLEAN,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS store_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_store_products_slug_live ON store_products (lower(slug)) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS home_featured_slugs (
  id TEXT PRIMARY KEY,
  product_slug TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_home_featured_sort ON home_featured_slugs (sort_order);

CREATE TABLE IF NOT EXISTS marketing_banners (
  id TEXT PRIMARY KEY,
  title TEXT,
  image_url TEXT NOT NULL,
  href TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketing_banners_sort ON marketing_banners (sort_order);

CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value NUMERIC(12, 2) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  max_uses INT,
  uses_count INT NOT NULL DEFAULT 0,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons (active);
