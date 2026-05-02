import { OrderBuilder } from "@/components/order/order-builder";
import { getActiveProducts } from "@/lib/active-products";
import { getSession } from "@/lib/auth";

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<{
    product?: string;
    width?: string;
    height?: string;
    quantity?: string;
    material?: string;
    finishing?: string;
    deadline?: string;
    notes?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    customerCpf?: string;
    cep?: string;
    address?: string;
    addressStreet?: string;
    addressNumber?: string;
    addressComplement?: string;
    addressNeighborhood?: string;
    addressCity?: string;
    addressState?: string;
    deliveryMode?: "delivery" | "pickup";
    paymentMethod?: "pix" | "card";
  }>;
}) {
  const [session, catalogProducts] = await Promise.all([getSession(), getActiveProducts()]);
  const resolvedSearchParams = await searchParams;
  const parsePositiveNumber = (value?: string) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
  };

  const initialConfig = {
    width: parsePositiveNumber(resolvedSearchParams.width),
    height: parsePositiveNumber(resolvedSearchParams.height),
    quantity: parsePositiveNumber(resolvedSearchParams.quantity),
    material: resolvedSearchParams.material,
    finishing: resolvedSearchParams.finishing,
    deadline: resolvedSearchParams.deadline,
    notes: resolvedSearchParams.notes,
  };

  const initialCheckout = {
    customerName: resolvedSearchParams.customerName,
    customerEmail: resolvedSearchParams.customerEmail,
    customerPhone: resolvedSearchParams.customerPhone,
    customerCpf: resolvedSearchParams.customerCpf,
    cep: resolvedSearchParams.cep,
    address: resolvedSearchParams.address,
    addressStreet: resolvedSearchParams.addressStreet,
    addressNumber: resolvedSearchParams.addressNumber,
    addressComplement: resolvedSearchParams.addressComplement,
    addressNeighborhood: resolvedSearchParams.addressNeighborhood,
    addressCity: resolvedSearchParams.addressCity,
    addressState: resolvedSearchParams.addressState,
    deliveryMode: resolvedSearchParams.deliveryMode,
    paymentMethod: resolvedSearchParams.paymentMethod,
  };

  return (
    <div className="min-w-0 px-3 pb-6 pt-2 sm:px-4 sm:pt-4">
      <OrderBuilder
        session={session}
        catalogProducts={catalogProducts}
        initialProductSlug={resolvedSearchParams.product}
        initialConfig={initialConfig}
        initialCheckout={initialCheckout}
      />
    </div>
  );
}
