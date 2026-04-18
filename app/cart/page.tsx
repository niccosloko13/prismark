import { CartPage } from "@/components/cart/cart-page";
import { getSession } from "@/lib/auth";

export default async function CartRoutePage() {
  const session = await getSession();

  return <CartPage session={session} />;
}
