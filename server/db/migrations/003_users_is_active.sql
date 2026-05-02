-- Garante coluna usada por users.repository (login, Google OAuth, admin).
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
