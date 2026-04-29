/** Rotas do fluxo de compra do cliente (admin pode usar para testar sem ir para /admin). */
export function isClientPurchaseFlowPath(path: string | null | undefined): boolean {
  if (!path || !path.startsWith("/")) {
    return false;
  }
  const base = path.split("?")[0] ?? path;
  return (
    base.startsWith("/dashboard") ||
    base.startsWith("/cart") ||
    base.startsWith("/order") ||
    base.startsWith("/produtos") ||
    base.startsWith("/products") ||
    base === "/cadastro" ||
    base === "/login"
  );
}
