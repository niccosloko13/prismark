
"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";

import { OrderAuthPanel, type OrderAuthTab } from "@/components/order/order-auth-panel";
import { CheckoutHeader } from "@/components/order/checkout-header";
import { useCart } from "@/components/cart/cart-provider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BRAZIL_UFS } from "@/lib/brazil-states";
import { buildCartItem } from "@/lib/cart";
import { cpfDigits, formatCpfMask, isValidCpf } from "@/lib/cpf";
import {
  buildFallbackActiveProduct,
  hydrateActiveProductSnapshotsFromList,
  type ActiveProduct,
} from "@/lib/active-product-snapshot";
import { COPY, pixEconomizePagarNoPixLabel } from "@/lib/copy";
import { getDefaultSelection, buildProductExperience } from "@/lib/product-experience";
import { resolveOrderDraft, type OrderDraftValues } from "@/lib/order-presets";
import { applyPixDiscount, PIX_DISCOUNT_PERCENT } from "@/lib/pix-discount";
import { calculateQuoteForProduct } from "@/lib/pricing";
import { fetchViaCep } from "@/lib/viacep";
import { cn, formatCurrencyBRL, roundTo } from "@/lib/utils";
import type { SessionUser, StoredFile } from "@/types";

type CheckoutField =
  | "customerName"
  | "customerEmail"
  | "customerPhone"
  | "customerCpf"
  | "cep"
  | "addressStreet"
  | "addressNumber"
  | "addressNeighborhood"
  | "addressCity"
  | "addressState";
type CheckoutErrors = Partial<Record<CheckoutField, string>>;

function ArrowRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M12 3v10" strokeLinecap="round" />
      <path d="m8.5 6.5 3.5-3.5 3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 15.5v1.75A2.75 2.75 0 0 0 7.75 20h8.5A2.75 2.75 0 0 0 19 17.25V15.5" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="m5.5 12.5 4 4 9-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PixMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="3" y="6" width="18" height="12" rx="3" fill="currentColor" className="text-teal-400" />
      <path
        d="M7 10h2v4H7v-4Zm4 0h2v4h-2v-4Zm4 0h2v4h-2v-4Z"
        fill="#0b0e15"
        className="text-[#0b0e15]"
      />
    </svg>
  );
}

function FieldGroup({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="mb-3 sm:mb-4">
        <h3 className="display-title text-[1.05rem] font-semibold tracking-tight text-white sm:text-[1.2rem]">{title}</h3>
        <p className="mt-1.5 text-sm leading-6 text-white/65 sm:mt-2">{description}</p>
      </div>
      <div className="surface-card p-4 shadow-[0_18px_38px_rgba(15,15,15,0.05)] sm:p-6">{children}</div>
    </section>
  );
}

function FieldLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("text-sm font-medium text-white/65", className)}>{children}</span>;
}

function FieldHint({
  id,
  tone = "neutral",
  children,
}: {
  id?: string;
  tone?: "neutral" | "error" | "success";
  children: ReactNode;
}) {
  return (
    <p
      id={id}
      className={cn(
        "text-xs leading-5",
        tone === "error"
          ? "font-medium text-red-600"
          : tone === "success"
            ? "font-medium text-emerald-700"
            : "text-white/55",
      )}
    >
      {children}
    </p>
  );
}

function ChoiceCard({
  title,
  description,
  selected,
  tone = "default",
  onClick,
  badge,
}: {
  title: string;
  description: string;
  selected: boolean;
  tone?: "default" | "pix";
  onClick: () => void;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "focus-ring rounded-[26px] border p-4 text-left transition duration-200",
        "hover:-translate-y-0.5",
        selected
          ? tone === "pix"
            ? "border-cyan bg-cyan/8 shadow-[0_18px_34px_rgba(0,181,255,0.1)]"
            : "border-white/22 bg-white/[0.08] shadow-[0_18px_34px_rgba(0,0,0,0.25)]"
          : "border-white/8 bg-white/[0.04] hover:border-white/18 hover:shadow-[0_18px_34px_rgba(0,0,0,0.2)]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <strong className="block text-sm font-semibold text-white">{title}</strong>
          <p className="mt-2 text-sm leading-6 text-white/65">{description}</p>
        </div>
        {badge ? (
          <span className="rounded-full bg-ink px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white">
            {badge}
          </span>
        ) : null}
      </div>
    </button>
  );
}

function formatCep(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) {
    return digits;
  }
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateCheckoutFields({
  customerName,
  customerEmail,
  customerPhone,
  customerCpf,
  deliveryMode,
  cep,
  addressStreet,
  addressNumber,
  addressNeighborhood,
  addressCity,
  addressState,
}: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCpf: string;
  deliveryMode: "delivery" | "pickup";
  cep: string;
  addressStreet: string;
  addressNumber: string;
  addressNeighborhood: string;
  addressCity: string;
  addressState: string;
}) {
  const errors: CheckoutErrors = {};

  if (!customerName.trim()) {
    errors.customerName = "Informe o nome completo.";
  }

  if (!customerEmail.trim()) {
    errors.customerEmail = "Informe o e-mail.";
  } else if (!isValidEmail(customerEmail.trim())) {
    errors.customerEmail = "E-mail inválido.";
  }

  const phoneDigits = customerPhone.replace(/\D/g, "");
  if (!phoneDigits) {
    errors.customerPhone = "Informe o WhatsApp com DDD.";
  } else if (phoneDigits.length < 10 || phoneDigits.length > 11) {
    errors.customerPhone = "WhatsApp deve ter 10 ou 11 dígitos com DDD.";
  }

  const cpfD = cpfDigits(customerCpf);
  if (cpfD.length !== 11) {
    errors.customerCpf = "Informe um CPF com 11 dígitos.";
  } else if (!isValidCpf(cpfD)) {
    errors.customerCpf = "CPF inválido.";
  }

  if (deliveryMode === "delivery") {
    if (cep.replace(/\D/g, "").length !== 8) {
      errors.cep = "CEP deve ter 8 dígitos.";
    }
    if (!addressStreet.trim()) {
      errors.addressStreet = "Informe o logradouro (rua).";
    }
    if (!addressNumber.trim()) {
      errors.addressNumber = "Informe o número.";
    }
    if (!addressNeighborhood.trim()) {
      errors.addressNeighborhood = "Informe o bairro.";
    }
    if (!addressCity.trim()) {
      errors.addressCity = "Informe a cidade.";
    }
    if (!addressState.trim() || addressState.trim().length !== 2) {
      errors.addressState = "Selecione o estado (UF).";
    }
  }

  return errors;
}

function buildCheckoutNotes({
  baseNotes,
  customerName,
  customerEmail,
  customerPhone,
  customerCpf,
  deliveryMode,
  cep,
  addressStreet,
  addressNumber,
  addressComplement,
  addressNeighborhood,
  addressCity,
  addressState,
}: {
  baseNotes: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCpf: string;
  deliveryMode: "delivery" | "pickup";
  cep: string;
  addressStreet: string;
  addressNumber: string;
  addressComplement: string;
  addressNeighborhood: string;
  addressCity: string;
  addressState: string;
}) {
  const blocks = [];

  if (baseNotes.trim()) {
    blocks.push(baseNotes.trim());
  }

  blocks.push("Checkout Prismarq");
  blocks.push(`Cliente: ${customerName} | ${customerEmail} | ${customerPhone} | CPF: ${formatCpfMask(customerCpf)}`);
  if (deliveryMode === "pickup") {
    blocks.push("Entrega: retirada na Prismarq");
  } else {
    const comp = addressComplement.trim() ? `, ${addressComplement.trim()}` : "";
    blocks.push(
      `Entrega: CEP ${cep} | ${addressStreet}, ${addressNumber}${comp} | ${addressNeighborhood} | ${addressCity} - ${addressState}`,
    );
  }
  blocks.push(`Pagamento: Pix com ${PIX_DISCOUNT_PERCENT}% de desconto`);

  return blocks.join("\n");
}

export function OrderBuilder({
  session,
  initialProductSlug,
  lockProduct = false,
  initialConfig,
  initialCheckout,
  catalogProducts,
}: {
  session: SessionUser | null;
  initialProductSlug?: string;
  lockProduct?: boolean;
  initialConfig?: OrderDraftValues;
  catalogProducts?: ActiveProduct[];
  initialCheckout?: {
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    customerCpf?: string;
    cep?: string;
    /** Legado: linha única; mapeado para logradouro quando não há addressStreet. */
    address?: string;
    addressStreet?: string;
    addressNumber?: string;
    addressComplement?: string;
    addressNeighborhood?: string;
    addressCity?: string;
    addressState?: string;
    deliveryMode?: "delivery" | "pickup";
    /** @deprecated Ignorado — checkout só PIX. */
    paymentMethod?: "pix" | "card";
  };
}) {
  const router = useRouter();
  const [remoteCatalog, setRemoteCatalog] = useState<ActiveProduct[] | null>(null);

  useEffect(() => {
    if (catalogProducts?.length) return;
    void fetch("/api/store/active-catalog-bridge")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { activeProducts?: ActiveProduct[] } | null) => {
        const list = data?.activeProducts ?? [];
        if (list.length) {
          hydrateActiveProductSnapshotsFromList(list);
          setRemoteCatalog(list);
        }
      });
  }, [catalogProducts?.length]);

  const catalog = useMemo(
    () => (catalogProducts?.length ? catalogProducts : remoteCatalog ?? []),
    [catalogProducts, remoteCatalog],
  );
  const stableCatalog = useMemo(
    () => (catalog.length > 0 ? catalog : [buildFallbackActiveProduct("checkout")]),
    [catalog],
  );
  const pickProduct = useCallback(
    (slug: string) => stableCatalog.find((p) => p.slug === slug) ?? stableCatalog[0],
    [stableCatalog],
  );
  const initialProduct = pickProduct(initialProductSlug ?? stableCatalog[0].slug);
  const initialDraft = resolveOrderDraft(initialProduct, initialConfig);
  const [productSlug, setProductSlug] = useState(initialProduct.slug);
  // Width/height em cm: manter um "texto" controlado para permitir digitação livre (inclui "1")
  // e só converter/validar ao sair do campo (onBlur) ou no submit.
  const [width, setWidth] = useState(initialDraft.width);
  const [height, setHeight] = useState(initialDraft.height);
  const [widthText, setWidthText] = useState(String(initialDraft.width));
  const [heightText, setHeightText] = useState(String(initialDraft.height));
  const [quantity, setQuantity] = useState(initialDraft.quantity);
  const [material, setMaterial] = useState(initialDraft.material);
  const [finishing, setFinishing] = useState(initialDraft.finishing);
  const [deadline, setDeadline] = useState(initialDraft.deadline);
  const [notes, setNotes] = useState(initialDraft.notes);
  const [customerName, setCustomerName] = useState(initialCheckout?.customerName ?? session?.name ?? "");
  const [customerEmail, setCustomerEmail] = useState(initialCheckout?.customerEmail ?? session?.email ?? "");
  const [customerPhone, setCustomerPhone] = useState(initialCheckout?.customerPhone ?? session?.phone ?? "");
  const [customerCpf, setCustomerCpf] = useState(
    initialCheckout?.customerCpf ? formatCpfMask(initialCheckout.customerCpf) : "",
  );
  const [deliveryMode, setDeliveryMode] = useState<"delivery" | "pickup">(initialCheckout?.deliveryMode ?? "delivery");
  const [cep, setCep] = useState(initialCheckout?.cep ?? "");
  const legacyLine = initialCheckout?.address?.trim() ?? "";
  const [addressStreet, setAddressStreet] = useState(initialCheckout?.addressStreet ?? legacyLine);
  const [addressNumber, setAddressNumber] = useState(initialCheckout?.addressNumber ?? "");
  const [addressComplement, setAddressComplement] = useState(initialCheckout?.addressComplement ?? "");
  const [addressNeighborhood, setAddressNeighborhood] = useState(initialCheckout?.addressNeighborhood ?? "");
  const [addressCity, setAddressCity] = useState(initialCheckout?.addressCity ?? "");
  const [addressState, setAddressState] = useState((initialCheckout?.addressState ?? "").slice(0, 2).toUpperCase());
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<CheckoutErrors>({});
  const [touchedFields, setTouchedFields] = useState<Partial<Record<CheckoutField, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const initializedRef = useRef(false);
  const fieldRefs = useRef<Partial<Record<CheckoutField, HTMLInputElement | HTMLSelectElement | null>>>({});
  const { upsertItem } = useCart();

  const currentProduct = pickProduct(productSlug);

  function parseCmText(text: string, fallback: number) {
    const n = Number(text);
    if (!Number.isFinite(n) || n <= 0) return fallback;
    return n;
  }

  const widthForQuote = parseCmText(widthText, width);
  const heightForQuote = parseCmText(heightText, height);

  const [orderAuthExpanded, setOrderAuthExpanded] = useState(false);
  const [orderAuthTab, setOrderAuthTab] = useState<OrderAuthTab>("login");
  const prevSessionLoggedRef = useRef(Boolean(session));
  const continueCheckoutAfterAuthRef = useRef(false);

  const quote = calculateQuoteForProduct(currentProduct, {
    width: widthForQuote,
    height: heightForQuote,
    quantity,
    material,
    finishing,
    deadline,
  });
  const pixTotal = applyPixDiscount(quote.total);

  const checkoutErrors = useMemo(
    () =>
      validateCheckoutFields({
        customerName,
        customerEmail,
        customerPhone,
        customerCpf,
        deliveryMode,
        cep,
        addressStreet,
        addressNumber,
        addressNeighborhood,
        addressCity,
        addressState,
      }),
    [
      customerName,
      customerEmail,
      customerPhone,
      customerCpf,
      deliveryMode,
      cep,
      addressStreet,
      addressNumber,
      addressNeighborhood,
      addressCity,
      addressState,
    ],
  );

  const requiredFieldCount = deliveryMode === "delivery" ? 11 : 4;
  const completedFieldCount = [
    customerName.trim(),
    isValidEmail(customerEmail.trim()) ? customerEmail.trim() : "",
    [10, 11].includes(customerPhone.replace(/\D/g, "").length) ? customerPhone.trim() : "",
    isValidCpf(cpfDigits(customerCpf)) ? "cpf" : "",
    deliveryMode === "delivery" ? (cep.replace(/\D/g, "").length === 8 ? cep : "") : "ok",
    deliveryMode === "delivery" ? addressStreet.trim() : "ok",
    deliveryMode === "delivery" ? addressNumber.trim() : "ok",
    deliveryMode === "delivery" ? addressNeighborhood.trim() : "ok",
    deliveryMode === "delivery" ? addressCity.trim() : "ok",
    deliveryMode === "delivery" ? (addressState.trim().length === 2 ? addressState : "") : "ok",
  ].filter(Boolean).length;
  const missingFieldCount = Math.max(requiredFieldCount - completedFieldCount, 0);
  const hasCheckoutErrors = Object.keys(checkoutErrors).length > 0;
  const isReadyToSubmit = !hasCheckoutErrors;
  const completionLabel =
    missingFieldCount === 0
      ? "Tudo pronto para concluir"
      : missingFieldCount === 1
        ? "Falta so 1 dado para concluir"
        : `Faltam ${missingFieldCount} dados para concluir`;

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }

    const nextDraft = resolveOrderDraft(pickProduct(productSlug));
    setWidth(nextDraft.width);
    setHeight(nextDraft.height);
    setWidthText(String(nextDraft.width));
    setHeightText(String(nextDraft.height));
    setMaterial(nextDraft.material);
    setFinishing(nextDraft.finishing);
    setDeadline(nextDraft.deadline);
    setQuantity(nextDraft.quantity);
    setNotes(nextDraft.notes);
  }, [productSlug, pickProduct]);

  function areCheckoutErrorsEqual(a: CheckoutErrors, b: CheckoutErrors) {
    const aKeys = Object.keys(a) as CheckoutField[];
    const bKeys = Object.keys(b) as CheckoutField[];
    if (aKeys.length !== bKeys.length) return false;
    for (const k of aKeys) {
      if (a[k] !== b[k]) return false;
    }
    return true;
  }

  useEffect(() => {
    setFieldErrors((current) => (areCheckoutErrorsEqual(current, checkoutErrors) ? current : checkoutErrors));
  }, [checkoutErrors]);

  useEffect(() => {
    if (deliveryMode === "pickup") {
      setFieldErrors((current) => {
        const next = { ...current };
        delete next.cep;
        delete next.addressStreet;
        delete next.addressNumber;
        delete next.addressNeighborhood;
        delete next.addressCity;
        delete next.addressState;
        return next;
      });
    }
  }, [deliveryMode]);

  useEffect(() => {
    if (deliveryMode !== "delivery") {
      return;
    }
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) {
      return;
    }
    let cancelled = false;
    void fetchViaCep(digits).then((data) => {
      if (cancelled || !data) {
        return;
      }
      if (data.logradouro) {
        setAddressStreet(data.logradouro);
      }
      if (data.bairro) {
        setAddressNeighborhood(data.bairro);
      }
      if (data.localidade) {
        setAddressCity(data.localidade);
      }
      if (data.uf) {
        setAddressState(data.uf.toUpperCase().slice(0, 2));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [cep, deliveryMode]);

  const normalizedCheckout = {
    customerName: customerName.trim(),
    customerEmail: customerEmail.trim(),
    customerPhone: customerPhone.trim(),
    customerCpf: cpfDigits(customerCpf),
    cep: cep.trim(),
    addressStreet: addressStreet.trim(),
    addressNumber: addressNumber.trim(),
    addressComplement: addressComplement.trim(),
    addressNeighborhood: addressNeighborhood.trim(),
    addressCity: addressCity.trim(),
    addressState: addressState.trim().toUpperCase().slice(0, 2),
  };

  const orderReturnTo = useMemo(() => {
    const orderParams = new URLSearchParams();
    orderParams.set("product", productSlug);
    orderParams.set("width", String(widthForQuote));
    orderParams.set("height", String(heightForQuote));
    orderParams.set("quantity", String(quantity));
    orderParams.set("material", material);
    orderParams.set("finishing", finishing);
    orderParams.set("deadline", deadline);
    orderParams.set("notes", notes);
    if (normalizedCheckout.customerName) orderParams.set("customerName", normalizedCheckout.customerName);
    if (normalizedCheckout.customerEmail) orderParams.set("customerEmail", normalizedCheckout.customerEmail);
    if (normalizedCheckout.customerPhone) orderParams.set("customerPhone", normalizedCheckout.customerPhone);
    if (normalizedCheckout.customerCpf) orderParams.set("customerCpf", normalizedCheckout.customerCpf);
    if (normalizedCheckout.cep) orderParams.set("cep", normalizedCheckout.cep);
    if (normalizedCheckout.addressStreet) orderParams.set("addressStreet", normalizedCheckout.addressStreet);
    if (normalizedCheckout.addressNumber) orderParams.set("addressNumber", normalizedCheckout.addressNumber);
    if (normalizedCheckout.addressComplement) orderParams.set("addressComplement", normalizedCheckout.addressComplement);
    if (normalizedCheckout.addressNeighborhood) orderParams.set("addressNeighborhood", normalizedCheckout.addressNeighborhood);
    if (normalizedCheckout.addressCity) orderParams.set("addressCity", normalizedCheckout.addressCity);
    if (normalizedCheckout.addressState) orderParams.set("addressState", normalizedCheckout.addressState);
    orderParams.set("deliveryMode", deliveryMode);
    return `/order?${orderParams.toString()}`;
  }, [
    productSlug,
    widthForQuote,
    heightForQuote,
    quantity,
    material,
    finishing,
    deadline,
    notes,
    normalizedCheckout.customerName,
    normalizedCheckout.customerEmail,
    normalizedCheckout.customerPhone,
    normalizedCheckout.customerCpf,
    normalizedCheckout.cep,
    normalizedCheckout.addressStreet,
    normalizedCheckout.addressNumber,
    normalizedCheckout.addressComplement,
    normalizedCheckout.addressNeighborhood,
    normalizedCheckout.addressCity,
    normalizedCheckout.addressState,
    deliveryMode,
  ]);

  function submitCheckoutOrder() {
    const validationResult = validateCheckout();
    if (validationResult.message) {
      setError(validationResult.message);
      focusFirstInvalidField(validationResult.errors);
      return;
    }

    startTransition(async () => {
      try {
        let uploadedFile: StoredFile | null = null;

        if (file) {
          const uploadFormData = new FormData();
          uploadFormData.append("file", file);

          const uploadResponse = await fetch("/api/upload", {
            method: "POST",
            body: uploadFormData,
          });

          const uploadData = (await uploadResponse.json()) as {
            message?: string;
            file?: StoredFile;
          };

          if (!uploadResponse.ok || !uploadData.file) {
            throw new Error(uploadData.message ?? "Falha ao enviar o arquivo.");
          }

          uploadedFile = uploadData.file;
        }

        const response = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productSlug,
            width: widthForQuote,
            height: heightForQuote,
            quantity,
            material,
            finishing,
            deadline,
            cpf: normalizedCheckout.customerCpf,
            notes: buildCheckoutNotes({
              baseNotes: notes,
              customerName: normalizedCheckout.customerName,
              customerEmail: normalizedCheckout.customerEmail,
              customerPhone: normalizedCheckout.customerPhone,
              customerCpf: normalizedCheckout.customerCpf,
              deliveryMode,
              cep: normalizedCheckout.cep,
              addressStreet: normalizedCheckout.addressStreet,
              addressNumber: normalizedCheckout.addressNumber,
              addressComplement: normalizedCheckout.addressComplement,
              addressNeighborhood: normalizedCheckout.addressNeighborhood,
              addressCity: normalizedCheckout.addressCity,
              addressState: normalizedCheckout.addressState,
            }),
            fileId: uploadedFile?.id ?? null,
            file: uploadedFile,
          }),
        });

        const data = (await response.json()) as {
          message?: string;
          order?: { id: string };
        };

        if (!response.ok || !data.order) {
          throw new Error(data.message ?? "Nao foi possivel finalizar o pedido.");
        }

        const pixResponse = await fetch("/api/payments/pix", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: data.order.id,
          }),
        });

        const pixPayload = (await pixResponse.json()) as {
          available?: boolean;
          orderId?: string;
          message?: string;
        };

        if (!pixResponse.ok) {
          throw new Error(pixPayload.message ?? "Nao foi possivel preparar o pagamento Pix.");
        }

        if (pixPayload.available) {
          const orderIdForPix = pixPayload.orderId?.trim() || data.order.id;
          if (!orderIdForPix) {
            throw new Error("Resposta do servidor sem identificador do pedido.");
          }
          router.push(`/dashboard/pedidos/${orderIdForPix}/pagamento`);
          router.refresh();
          return;
        }

        setMessage(
          `Pedido #${data.order.id} criado. O Pix nao esta disponivel no momento — acesse o painel ou fale com a Prismarq.`,
        );
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Falha inesperada.");
      }
    });
  }

  useEffect(() => {
    const now = Boolean(session);
    const prev = prevSessionLoggedRef.current;
    prevSessionLoggedRef.current = now;

    if (session) {
      setOrderAuthExpanded(false);
    }

    if (now && !prev && continueCheckoutAfterAuthRef.current) {
      continueCheckoutAfterAuthRef.current = false;
      setError("");
      setMessage("");
      setSubmitAttempted(true);
      const validationResult = validateCheckout();
      if (validationResult.message) {
        setMessage("Conta conectada. Complete os dados do pedido para finalizar.");
        setError(validationResult.message);
        focusFirstInvalidField(validationResult.errors);
        return;
      }
      submitCheckoutOrder();
    }
    // Intencional: reagir só à transição de sessão; submitCheckoutOrder usa estado do fechamento deste render.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- session boundary only
  }, [session]);

  const primaryActionLabel = !session
    ? "Entrar para continuar"
    : isPending
      ? "Processando..."
      : !isReadyToSubmit
        ? "Complete os dados"
        : COPY.finalizeOrderPix;
  const primaryActionHelper = !session
    ? "Login rápido no próprio checkout."
    : isPending
      ? "Aguarde um instante."
      : hasCheckoutErrors
        ? completionLabel
        : `Pix com ${PIX_DISCOUNT_PERCENT}% de desconto · ambiente seguro.`;

  function shouldShowFieldError(field: CheckoutField) {
    return submitAttempted || touchedFields[field];
  }

  function setFieldTouched(field: CheckoutField) {
    setTouchedFields((current) => ({ ...current, [field]: true }));
  }

  function focusFirstInvalidField(errors: CheckoutErrors) {
    const fieldOrder: CheckoutField[] = [
      "customerName",
      "customerEmail",
      "customerPhone",
      "customerCpf",
      "cep",
      "addressStreet",
      "addressNumber",
      "addressNeighborhood",
      "addressCity",
      "addressState",
    ];
    const firstInvalidField = fieldOrder.find((field) => errors[field]);
    if (firstInvalidField) {
      fieldRefs.current[firstInvalidField]?.focus();
    }
  }

  function validateCheckout() {
    const errors = validateCheckoutFields({
      customerName,
      customerEmail,
      customerPhone,
      customerCpf,
      deliveryMode,
      cep,
      addressStreet,
      addressNumber,
      addressNeighborhood,
      addressCity,
      addressState,
    });

    setFieldErrors(errors);

    if (Object.keys(errors).length === 0) {
      return { message: "", errors };
    }

    if (errors.customerName || errors.customerEmail || errors.customerPhone || errors.customerCpf) {
      return {
        message: "Revise seus dados de contato e CPF.",
        errors,
      };
    }

    return {
      message: "Confirme o endereço de entrega.",
      errors,
    };
  }

  function handleSubmit() {
    setError("");
    setMessage("");
    setSubmitAttempted(true);

    if (!session) {
      setOrderAuthExpanded(true);
      setOrderAuthTab("login");
      setError("");
      setMessage("Entre ou crie sua conta para finalizar o pedido.");
      return;
    }

    submitCheckoutOrder();
  }

  function handleAddToCart() {
    setError("");
    setMessage("");

    const experience = buildProductExperience(currentProduct);

    const baseSelection = getDefaultSelection(currentProduct, experience);
    const cartItem = buildCartItem({
      product: currentProduct,
      experience,
      selection: {
        ...baseSelection,
        width: widthForQuote,
        height: heightForQuote,
        quantity,
        material,
        finishing,
        deadline,
      },
      image: experience.gallery[0]?.src,
      notes: buildCheckoutNotes({
        baseNotes: notes,
        customerName: normalizedCheckout.customerName,
        customerEmail: normalizedCheckout.customerEmail,
        customerPhone: normalizedCheckout.customerPhone,
        customerCpf: normalizedCheckout.customerCpf,
        deliveryMode,
        cep: normalizedCheckout.cep,
        addressStreet: normalizedCheckout.addressStreet,
        addressNumber: normalizedCheckout.addressNumber,
        addressComplement: normalizedCheckout.addressComplement,
        addressNeighborhood: normalizedCheckout.addressNeighborhood,
        addressCity: normalizedCheckout.addressCity,
        addressState: normalizedCheckout.addressState,
      }),
    });

    upsertItem(cartItem);
    router.push("/cart");
  }

  const productExperience = useMemo(() => buildProductExperience(currentProduct), [currentProduct]);
  const summaryThumbSrc = productExperience.gallery[0]?.src ?? "";
  const pixSavingsBrl = roundTo(quote.total - pixTotal, 2);

  return (
    <>
      <CheckoutHeader activeStepIndex={1} />
      <div className="mx-auto flex min-w-0 max-w-[1180px] flex-col-reverse px-0 pb-[10.5rem] sm:pb-36 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8 lg:pb-10">
        <div className="min-w-0 space-y-5 lg:space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-white/10 bg-[#0a0d12]/85 px-4 py-3 backdrop-blur-xl sm:px-5">
            {!session ? (
              <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold text-white">Entre ou crie sua conta para finalizar</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOrderAuthExpanded(true);
                      setOrderAuthTab("login");
                      setError("");
                      setMessage("");
                    }}
                    className="btn btn-secondary focus-ring min-h-[40px] px-4 text-sm"
                  >
                    Entrar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOrderAuthExpanded(true);
                      setOrderAuthTab("register");
                      setError("");
                      setMessage("");
                    }}
                    className="home-btn-gradient focus-ring min-h-[40px] rounded-full px-4 text-sm font-semibold"
                  >
                    Criar conta
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-white/75">
                Olá, <strong className="text-white">{session.name}</strong>
              </p>
            )}
          </div>

          {!session && orderAuthExpanded ? (
            <OrderAuthPanel
              activeTab={orderAuthTab}
              onActiveTabChange={setOrderAuthTab}
              returnToPath={orderReturnTo}
              onSuccess={() => {
                continueCheckoutAfterAuthRef.current = true;
                setOrderAuthExpanded(false);
                setError("");
                setMessage("");
              }}
              onCollapse={() => setOrderAuthExpanded(false)}
            />
          ) : null}

          <div className="grid min-w-0 gap-5 sm:gap-6">
            <FieldGroup
              title="Configuração do pedido"
              description="Produto, medidas e opções de produção."
              className="checkout-section"
            >
            <div className="grid gap-4 sm:grid-cols-2">
              {!lockProduct ? (
                <label className="space-y-2 sm:col-span-2">
                  <FieldLabel>Produto</FieldLabel>
                  <Select value={productSlug} onValueChange={setProductSlug}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {catalog.map((product) => (
                        <SelectItem key={product.slug} value={product.slug}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
              ) : null}

              <label className="space-y-2">
                <FieldLabel>Largura (cm)</FieldLabel>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={widthText}
                  onChange={(event) => setWidthText(event.target.value.replace(/[^\d]/g, "").slice(0, 5))}
                  onBlur={() => {
                    const next = parseCmText(widthText, width);
                    setWidth(next);
                    setWidthText(String(next));
                  }}
                  className="field min-h-[48px]"
                />
              </label>
              <label className="space-y-2">
                <FieldLabel>Altura (cm)</FieldLabel>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={heightText}
                  onChange={(event) => setHeightText(event.target.value.replace(/[^\d]/g, "").slice(0, 5))}
                  onBlur={() => {
                    const next = parseCmText(heightText, height);
                    setHeight(next);
                    setHeightText(String(next));
                  }}
                  className="field min-h-[48px]"
                />
              </label>
              <label className="space-y-2">
                <FieldLabel>Quantidade</FieldLabel>
                <input
                  type="number"
                  min={currentProduct.minQuantity}
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(Math.max(Number(event.target.value) || currentProduct.minQuantity, currentProduct.minQuantity))
                  }
                  className="field min-h-[48px]"
                />
              </label>

              <label className="space-y-2">
                <FieldLabel>Material</FieldLabel>
                <Select value={material} onValueChange={setMaterial}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o material" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentProduct.materials.map((item) => (
                      <SelectItem key={item.label} value={item.label}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <label className="space-y-2">
                <FieldLabel>Acabamento</FieldLabel>
                <Select value={finishing} onValueChange={setFinishing}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o acabamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentProduct.finishings.map((item) => (
                      <SelectItem key={item.label} value={item.label}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <label className="space-y-2 sm:col-span-2">
                <FieldLabel>Prazo</FieldLabel>
                <Select value={deadline} onValueChange={setDeadline}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o prazo" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentProduct.deadlines.map((item) => (
                      <SelectItem key={item.label} value={item.label}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
            </div>
          </FieldGroup>

          <FieldGroup title="Dados do cliente" description="Nome, e-mail, WhatsApp e CPF para o pedido." className="checkout-section">
            <div className="grid min-w-0 gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <FieldLabel>Nome completo</FieldLabel>
                <input
                  type="text"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  onBlur={() => setFieldTouched("customerName")}
                  ref={(element) => {
                    fieldRefs.current.customerName = element;
                  }}
                  autoComplete="name"
                  aria-invalid={shouldShowFieldError("customerName") && !!fieldErrors.customerName}
                  aria-describedby="customer-name-hint"
                  className={cn(
                    "field min-h-[48px]",
                    shouldShowFieldError("customerName") && fieldErrors.customerName && "border-red-400/50 ring-1 ring-red-400/30",
                  )}
                  placeholder="Nome completo"
                />
                <FieldHint
                  id="customer-name-hint"
                  tone={shouldShowFieldError("customerName") && fieldErrors.customerName ? "error" : "neutral"}
                >
                  {shouldShowFieldError("customerName") && fieldErrors.customerName
                    ? fieldErrors.customerName
                    : "Como você quer ser chamado na confirmação do pedido."}
                </FieldHint>
              </label>
              <label className="space-y-2">
                <FieldLabel>Email</FieldLabel>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(event) => setCustomerEmail(event.target.value)}
                  onBlur={() => setFieldTouched("customerEmail")}
                  ref={(element) => {
                    fieldRefs.current.customerEmail = element;
                  }}
                  autoComplete="email"
                  aria-invalid={shouldShowFieldError("customerEmail") && !!fieldErrors.customerEmail}
                  aria-describedby="customer-email-hint"
                  className={cn(
                    "field min-h-[48px]",
                    shouldShowFieldError("customerEmail") && fieldErrors.customerEmail && "border-red-300 bg-red-50/40",
                  )}
                  placeholder="voce@empresa.com"
                  inputMode="email"
                />
                <FieldHint
                  id="customer-email-hint"
                  tone={shouldShowFieldError("customerEmail") && fieldErrors.customerEmail ? "error" : "neutral"}
                >
                  {shouldShowFieldError("customerEmail") && fieldErrors.customerEmail
                    ? fieldErrors.customerEmail
                    : "Enviamos a confirmação e o acompanhamento do pedido por aqui."}
                </FieldHint>
              </label>
              <label className="space-y-2">
                <FieldLabel className="inline-flex items-center gap-2">
                  WhatsApp
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-emerald-400" aria-hidden fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </FieldLabel>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(event) => setCustomerPhone(formatPhone(event.target.value))}
                  onBlur={() => setFieldTouched("customerPhone")}
                  ref={(element) => {
                    fieldRefs.current.customerPhone = element;
                  }}
                  autoComplete="tel"
                  inputMode="tel"
                  aria-invalid={shouldShowFieldError("customerPhone") && !!fieldErrors.customerPhone}
                  aria-describedby="customer-phone-hint"
                  className={cn(
                    "field min-h-[48px]",
                    shouldShowFieldError("customerPhone") && fieldErrors.customerPhone && "border-red-400/50 ring-1 ring-red-400/30",
                  )}
                  placeholder="(11) 99999-9999"
                />
                <FieldHint
                  id="customer-phone-hint"
                  tone={shouldShowFieldError("customerPhone") && fieldErrors.customerPhone ? "error" : "neutral"}
                >
                  {shouldShowFieldError("customerPhone") && fieldErrors.customerPhone
                    ? fieldErrors.customerPhone
                    : "DDD + número com 8 ou 9 dígitos."}
                </FieldHint>
              </label>
              <label className="space-y-2 sm:col-span-2">
                <FieldLabel>CPF</FieldLabel>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={customerCpf}
                  onChange={(event) => setCustomerCpf(formatCpfMask(event.target.value))}
                  onBlur={() => setFieldTouched("customerCpf")}
                  ref={(element) => {
                    fieldRefs.current.customerCpf = element;
                  }}
                  aria-invalid={shouldShowFieldError("customerCpf") && !!fieldErrors.customerCpf}
                  aria-describedby="customer-cpf-hint"
                  className={cn(
                    "field min-h-[48px]",
                    shouldShowFieldError("customerCpf") && fieldErrors.customerCpf && "border-red-400/50 ring-1 ring-red-400/30",
                  )}
                  placeholder="000.000.000-00"
                />
                <FieldHint
                  id="customer-cpf-hint"
                  tone={shouldShowFieldError("customerCpf") && fieldErrors.customerCpf ? "error" : "neutral"}
                >
                  {shouldShowFieldError("customerCpf") && fieldErrors.customerCpf
                    ? fieldErrors.customerCpf
                    : "Obrigatório para emissão e conferência do pedido."}
                </FieldHint>
              </label>
            </div>
          </FieldGroup>

          <FieldGroup title="Entrega" description="Receba em casa ou retire na Prismarq." className="checkout-section">
            <div className="grid gap-4">
              <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                <ChoiceCard
                  title="Receber em endereço"
                  description="Envio para o endereço informado abaixo."
                  selected={deliveryMode === "delivery"}
                  onClick={() => setDeliveryMode("delivery")}
                />
                <ChoiceCard
                  title="Retirar na Prismarq"
                  description="Sem custo de envio — retirada com nossa equipe."
                  selected={deliveryMode === "pickup"}
                  onClick={() => setDeliveryMode("pickup")}
                />
              </div>

              {deliveryMode === "delivery" ? (
                <div className="grid min-w-0 gap-4">
                  <div className="grid gap-4 sm:grid-cols-[140px_minmax(0,1fr)]">
                    <label className="space-y-2">
                      <FieldLabel>CEP</FieldLabel>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={cep}
                          onChange={(event) => setCep(formatCep(event.target.value))}
                          onBlur={() => setFieldTouched("cep")}
                          ref={(element) => {
                            fieldRefs.current.cep = element;
                          }}
                          autoComplete="postal-code"
                          aria-invalid={shouldShowFieldError("cep") && !!fieldErrors.cep}
                          aria-describedby="cep-hint"
                          className={cn(
                            "field min-h-[48px] pr-10",
                            shouldShowFieldError("cep") && fieldErrors.cep && "border-red-400/50 ring-1 ring-red-400/30",
                          )}
                          placeholder="00000-000"
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/35" aria-hidden>
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <circle cx="11" cy="11" r="7" strokeWidth="1.5" />
                            <path d="m20 20-3-3" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </span>
                      </div>
                      <FieldHint id="cep-hint" tone={shouldShowFieldError("cep") && fieldErrors.cep ? "error" : "neutral"}>
                        {shouldShowFieldError("cep") && fieldErrors.cep
                          ? fieldErrors.cep
                          : "Com 8 dígitos buscamos o endereço automaticamente (ViaCEP)."}
                      </FieldHint>
                    </label>
                    <label className="space-y-2 sm:col-span-2">
                      <FieldLabel>Rua / logradouro</FieldLabel>
                      <input
                        type="text"
                        value={addressStreet}
                        onChange={(event) => setAddressStreet(event.target.value)}
                        onBlur={() => setFieldTouched("addressStreet")}
                        ref={(element) => {
                          fieldRefs.current.addressStreet = element;
                        }}
                        autoComplete="street-address"
                        aria-invalid={shouldShowFieldError("addressStreet") && !!fieldErrors.addressStreet}
                        className={cn(
                          "field min-h-[48px]",
                          shouldShowFieldError("addressStreet") && fieldErrors.addressStreet && "border-red-400/50 ring-1 ring-red-400/30",
                        )}
                        placeholder="Rua, avenida..."
                      />
                      {shouldShowFieldError("addressStreet") && fieldErrors.addressStreet ? (
                        <FieldHint tone="error">{fieldErrors.addressStreet}</FieldHint>
                      ) : null}
                    </label>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <label className="space-y-2">
                      <FieldLabel>Número</FieldLabel>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={addressNumber}
                        onChange={(event) => setAddressNumber(event.target.value)}
                        onBlur={() => setFieldTouched("addressNumber")}
                        ref={(element) => {
                          fieldRefs.current.addressNumber = element;
                        }}
                        className={cn(
                          "field min-h-[48px]",
                          shouldShowFieldError("addressNumber") && fieldErrors.addressNumber && "border-red-400/50 ring-1 ring-red-400/30",
                        )}
                      />
                      {shouldShowFieldError("addressNumber") && fieldErrors.addressNumber ? (
                        <FieldHint tone="error">{fieldErrors.addressNumber}</FieldHint>
                      ) : null}
                    </label>
                    <label className="space-y-2 sm:col-span-2">
                      <FieldLabel>Complemento</FieldLabel>
                      <input
                        type="text"
                        value={addressComplement}
                        onChange={(event) => setAddressComplement(event.target.value)}
                        autoComplete="off"
                        className="field min-h-[48px]"
                        placeholder="Opcional"
                      />
                    </label>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2">
                      <FieldLabel>Bairro</FieldLabel>
                      <input
                        type="text"
                        value={addressNeighborhood}
                        onChange={(event) => setAddressNeighborhood(event.target.value)}
                        onBlur={() => setFieldTouched("addressNeighborhood")}
                        ref={(element) => {
                          fieldRefs.current.addressNeighborhood = element;
                        }}
                        className={cn(
                          "field min-h-[48px]",
                          shouldShowFieldError("addressNeighborhood") &&
                            fieldErrors.addressNeighborhood &&
                            "border-red-400/50 ring-1 ring-red-400/30",
                        )}
                      />
                      {shouldShowFieldError("addressNeighborhood") && fieldErrors.addressNeighborhood ? (
                        <FieldHint tone="error">{fieldErrors.addressNeighborhood}</FieldHint>
                      ) : null}
                    </label>
                    <label className="space-y-2">
                      <FieldLabel>Cidade</FieldLabel>
                      <input
                        type="text"
                        value={addressCity}
                        onChange={(event) => setAddressCity(event.target.value)}
                        onBlur={() => setFieldTouched("addressCity")}
                        ref={(element) => {
                          fieldRefs.current.addressCity = element;
                        }}
                        className={cn(
                          "field min-h-[48px]",
                          shouldShowFieldError("addressCity") && fieldErrors.addressCity && "border-red-400/50 ring-1 ring-red-400/30",
                        )}
                      />
                      {shouldShowFieldError("addressCity") && fieldErrors.addressCity ? (
                        <FieldHint tone="error">{fieldErrors.addressCity}</FieldHint>
                      ) : null}
                    </label>
                  </div>
                  <label className="space-y-2 sm:max-w-[120px]">
                    <FieldLabel>UF</FieldLabel>
                    <select
                      value={addressState}
                      onChange={(event) => setAddressState(event.target.value.toUpperCase().slice(0, 2))}
                      onBlur={() => setFieldTouched("addressState")}
                      ref={(element) => {
                        fieldRefs.current.addressState = element;
                      }}
                      aria-invalid={shouldShowFieldError("addressState") && !!fieldErrors.addressState}
                      className={cn(
                        "field min-h-[48px]",
                        shouldShowFieldError("addressState") && fieldErrors.addressState && "border-red-400/50 ring-1 ring-red-400/30",
                      )}
                    >
                      <option value="">UF</option>
                      {BRAZIL_UFS.map((uf) => (
                        <option key={uf} value={uf}>
                          {uf}
                        </option>
                      ))}
                    </select>
                    {shouldShowFieldError("addressState") && fieldErrors.addressState ? (
                      <FieldHint tone="error">{fieldErrors.addressState}</FieldHint>
                    ) : null}
                  </label>
                </div>
              ) : (
                <div className="rounded-[20px] border border-white/10 bg-white/[0.04] p-4 text-sm text-white/70">
                  Retirada na Prismarq. Detalhes no e-mail de confirmação.
                </div>
              )}
            </div>
          </FieldGroup>

          <FieldGroup title="Arquivo da arte" description="Envie agora ou depois pelo atendimento." className="checkout-section">
            <div className="rounded-[24px] border border-dashed border-white/18 bg-white/[0.03] p-6">
              <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
                <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white">
                  <UploadIcon />
                </span>
                <div className="min-w-0 flex-1">
                  <strong className="block text-base font-semibold text-white">
                    {file ? file.name : "Clique para enviar ou arraste seu arquivo"}
                  </strong>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">
                    PDF, PNG, JPG, SVG, AI, CDR, ZIP (máx. 15 MB nesta instalação). Você também pode enviar sua arte depois pelo
                    atendimento.
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.svg,.zip,.cdr,.ai"
                    onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                    className="focus-ring mt-4 w-full min-w-0 max-w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white file:mr-3 file:rounded-full file:border-0 file:bg-gradient-to-r file:from-fuchsia-500 file:to-violet-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                  />
                  <p className="mt-3 flex items-start gap-2 text-xs text-white/45">
                    <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                      <path d="M7 11V8a5 5 0 0 1 10 0v3" strokeWidth="1.5" strokeLinecap="round" />
                      <rect x="5" y="11" width="14" height="10" rx="2" strokeWidth="1.5" />
                    </svg>
                    Seus arquivos são confidenciais e usados apenas para produção do pedido.
                  </p>
                </div>
              </div>
            </div>
          </FieldGroup>

          <FieldGroup title="Pagamento" description="Pix ativo com desconto. Cartão em manutenção." className="checkout-section">
            <div className="grid min-w-0 gap-3 sm:grid-cols-2">
              <div
                className="rounded-[22px] border border-teal-400/35 bg-gradient-to-br from-teal-500/15 to-emerald-500/10 p-4 text-left shadow-[0_16px_40px_rgba(0,0,0,0.25)]"
                role="status"
                aria-label="Forma de pagamento: PIX ativo"
              >
                <div className="flex items-start gap-3">
                  <PixMark className="h-10 w-10 shrink-0 text-teal-300" />
                  <div className="min-w-0 flex-1">
                    <strong className="block text-sm font-semibold text-white">PIX</strong>
                    <p className="mt-2 text-sm leading-relaxed text-white/75">
                      Economize {PIX_DISCOUNT_PERCENT}% pagando no PIX. Total:{" "}
                      <span className="font-semibold text-teal-200">{formatCurrencyBRL(pixTotal)}</span>.
                    </p>
                  </div>
                </div>
              </div>
              <div
                className="pointer-events-none cursor-not-allowed rounded-[26px] border border-white/8 bg-white/[0.03] p-4 opacity-50"
                aria-disabled="true"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <strong className="block text-sm font-semibold text-white/80">Cartão (em manutenção)</strong>
                    <p className="mt-2 text-sm leading-6 text-white/45">{COPY.cardMaintenanceHint}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/40">
                    Indisponível
                  </span>
                </div>
              </div>
            </div>
          </FieldGroup>

          <FieldGroup title="Observações" description="Opcional — instruções extras para produção." className="checkout-section">
            <label className="space-y-2">
              <FieldLabel>Notas</FieldLabel>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                className="field min-h-[100px] rounded-[20px]"
                placeholder="Detalhes para a equipe (opcional)."
              />
            </label>
          </FieldGroup>
        </div>

        <div aria-live="polite" className="mt-5 min-h-6 text-sm">
          {error ? <p className="font-medium text-red-300">{error}</p> : null}
          {!error && message ? <p className="font-medium text-emerald-300">{message}</p> : null}
          {!error && !message ? <p className="text-white/50">{primaryActionHelper}</p> : null}
        </div>

        <div className="mt-4 hidden gap-3 lg:flex">
          <button
            type="button"
            onClick={handleAddToCart}
            className="btn btn-secondary focus-ring h-12 flex-1 justify-center text-sm"
          >
            Adicionar ao carrinho
          </button>
        </div>
      </div>

      <aside className="mb-5 h-fit min-w-0 lg:mb-0 lg:mt-0 lg:sticky lg:top-6">
        <div className="rounded-[24px] border border-white/10 bg-[#0a0d12]/92 p-5 shadow-[0_24px_56px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-6">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-fuchsia-200/80">Resumo do pedido</p>

          <div className="mt-4 flex min-w-0 gap-3">
            {summaryThumbSrc ? (
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/30">
                {/* eslint-disable-next-line @next/next/no-img-element -- URLs de vitrine podem ser externas */}
                <img src={summaryThumbSrc} alt="" className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="h-16 w-16 shrink-0 rounded-xl border border-white/10 bg-white/5" />
            )}
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-semibold text-white">{currentProduct.name}</h3>
              <p className="mt-1 line-clamp-2 text-xs leading-snug text-white/55">
                {material} · {finishing}
              </p>
            </div>
          </div>

          <ul className="mt-5 space-y-2.5 text-sm text-white/70">
            <li className="flex justify-between gap-2">
              <span className="text-white/45">Medidas</span>
              <span className="min-w-0 text-right font-medium text-white">
                {widthForQuote} × {heightForQuote} cm
              </span>
            </li>
            <li className="flex justify-between gap-2">
              <span className="text-white/45">Quantidade</span>
              <span className="font-medium text-white">{quantity}</span>
            </li>
            <li className="flex justify-between gap-2">
              <span className="text-white/45">Prazo</span>
              <span className="min-w-0 text-right font-medium text-white">{deadline}</span>
            </li>
            <li className="flex justify-between gap-2 border-t border-white/10 pt-2">
              <span className="text-white/45">Subtotal</span>
              <span className="font-medium tabular-nums text-white">{formatCurrencyBRL(quote.total)}</span>
            </li>
            <li className="flex justify-between gap-2 text-emerald-300/95">
              <span>Desconto PIX ({PIX_DISCOUNT_PERCENT}%)</span>
              <span className="font-semibold tabular-nums">− {formatCurrencyBRL(pixSavingsBrl)}</span>
            </li>
          </ul>

          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-fuchsia-200/90">Total no PIX</p>
            <p className="mt-1 bg-gradient-to-r from-fuchsia-300 to-violet-300 bg-clip-text text-3xl font-bold tabular-nums text-transparent sm:text-4xl">
              {formatCurrencyBRL(pixTotal)}
            </p>
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-[18px] border border-emerald-400/25 bg-emerald-500/10 px-3 py-3">
            <PixMark className="h-9 w-9 shrink-0 text-teal-300" />
            <p className="text-sm leading-snug text-emerald-50/95">
              Você economiza <strong className="text-white">{formatCurrencyBRL(pixSavingsBrl)}</strong> pagando no PIX.
            </p>
          </div>

          <ul className="mt-5 space-y-2 text-xs text-white/55">
            <li className="flex gap-2">
              <CheckIcon />
              <span>Produção própria Prismarq</span>
            </li>
            <li className="flex gap-2">
              <CheckIcon />
              <span>+1.500 pedidos produzidos</span>
            </li>
            <li className="flex gap-2">
              <CheckIcon />
              <span>Entrega no prazo</span>
            </li>
            <li className="flex gap-2">
              <CheckIcon />
              <span>Atendimento direto</span>
            </li>
          </ul>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="home-btn-gradient focus-ring mt-6 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full text-base font-semibold shadow-lg disabled:opacity-50"
          >
            {primaryActionLabel}
            <ArrowRight />
          </button>

          <p className="mt-4 flex items-center justify-center gap-2 text-center text-[0.7rem] text-white/40">
            <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
              <path d="M7 11V8a5 5 0 0 1 10 0v3" strokeWidth="1.5" strokeLinecap="round" />
              <rect x="5" y="11" width="14" height="10" rx="2" strokeWidth="1.5" />
            </svg>
            Ambiente 100% seguro
          </p>
        </div>
      </aside>
    </div>

      <div className="fixed inset-x-0 bottom-0 z-[50] w-full max-w-[100vw] border-t border-white/10 bg-[#05070d]/78 px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-3 shadow-[0_-20px_50px_rgba(0,0,0,0.52)] backdrop-blur-2xl supports-[backdrop-filter]:bg-[#05070d]/64 sm:px-4 lg:hidden">
        <div className="mx-auto w-full min-w-0 max-w-[1600px]">
          <div className="flex min-w-0 items-end justify-between gap-3">
            <div className="min-w-0 shrink">
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-white/50">Total estimado</p>
              <strong className="mt-0.5 block text-base font-semibold tabular-nums text-white">{formatCurrencyBRL(quote.total)}</strong>
              <p className="text-[0.7rem] font-medium text-fuchsia-200/90">{pixEconomizePagarNoPixLabel()}</p>
              <p className="text-[0.72rem] font-semibold tabular-nums text-cyan-200/95">{formatCurrencyBRL(pixTotal)} no Pix</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="home-btn-gradient focus-ring mt-3 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[18px] px-4 text-[0.9375rem] font-semibold transition hover:brightness-[1.03] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {primaryActionLabel}
            <ArrowRight />
          </button>
          <button
            type="button"
            onClick={handleAddToCart}
            className="focus-ring mt-2 flex min-h-[52px] w-full items-center justify-center rounded-[18px] border border-white/14 bg-[#0a0e18]/95 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
          >
            Adicionar ao carrinho
          </button>
        </div>
      </div>
    </>
  );
}
