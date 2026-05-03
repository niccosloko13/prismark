-- Alinha default e valores legados de desconto Pix da loja a 10%.
ALTER TABLE site_settings
  ALTER COLUMN pix_discount_percent SET DEFAULT 10;

UPDATE site_settings
SET pix_discount_percent = 10
WHERE pix_discount_percent = 15;
