-- CPF do comprador no checkout (pedidos legados permanecem NULL).
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cpf TEXT;
