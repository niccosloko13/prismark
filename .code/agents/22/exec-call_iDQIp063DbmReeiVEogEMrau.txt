
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useRef, useState, useTransition } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { Badge } from "@/components/common/badge";
import { buildCartItem } from "@/lib/cart";
import { getProductBySlug, products } from "@/lib/catalog";
import { getDefaultSelection, getProductExperience } from "@/lib/product-experience";
import { resolveOrderDraft, type OrderDraftValues } from "@/lib/order-presets";
import { calculateQuote } from "@/lib/pricing";
import { cn, formatCurrencyBRL } from "@/lib/utils";
import type { SessionUser, StoredFile } from "@/types";

type CheckoutField = "customerName" | "customerEmail" | "customerPhone" | "cep" | "address";
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
      <div className="mb-4">
        <h3 className="display-title text-[1.2rem] font-semibold tracking-tight text-ink">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-black/60">{description}</p>
      </div>
      <div className="surface-card p-5 shadow-[0_18px_38px_rgba(15,15,15,0.05)] sm:p-6">{children}</div>
    </section>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <span className="text-sm font-medium text-black/60">{children}</span>;
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
            : "text-black/52",
      )}
    >
      {children}
    </p>
  );
}

function SummaryStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="surface-muted px-4 py-3.5 shadow-[0_12px_28px_rgba(15,15,15,0.04)]">
      <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-black/42">{label}</p>
      <strong className="mt-2 block truncate text-base font-semibold text-ink">{value}</strong>
    </div>
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
            : "border-black/18 bg-black/[0.03] shadow-[0_18px_34px_rgba(15,15,15,0.06)]"
          : "border-black/10 bg-white hover:border-black/16 hover:shadow-[0_18px_34px_rgba(15,15,15,0.05)]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <strong className="block text-sm font-semibold text-ink">{title}</strong>
          <p className="mt-2 text-sm leading-6 text-black/58">{description}</p>
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
  deliveryMode,
  cep,
  address,
}: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryMode: "delivery" | "pickup";
  cep: string;
  address: string;
}) {
  const errors: CheckoutErrors = {};

  if (!customerName.trim()) {
    errors.customerName = "Informe o nome para identificarmos o pedido.";
  }

  if (!customerEmail.trim()) {
    errors.customerEmail = "Informe o e-mail para receber a confirmacao.";
  } else if (!isValidEmail(customerEmail.trim())) {
    errors.customerEmail = "Digite um e-mail valido para continuar.";
  }

  const phoneDigits = customerPhone.replace(/\D/g, "");
  if (!phoneDigits) {
    errors.customerPhone = "Informe um telefone para contato rapido.";
  } else if (phoneDigits.length < 10 || phoneDigits.length > 11) {
    errors.customerPhone = "Use um telefone com DDD, com 10 ou 11 digitos.";
  }

  if (deliveryMode === "delivery") {
    if (cep.replace(/\D/g, "").length !== 8) {
      errors.cep = "Digite um CEP valido para calcular a entrega corretamente.";
    }

    if (!address.trim()) {
      errors.address = "Informe rua, numero e referencia para evitar atrasos.";
    }
  }

  return errors;
}

function buildCheckoutNotes({
  baseNotes,
  customerName,
  customerEmail,
  customerPhone,
  deliveryMode,
  cep,
  address,
  paymentMethod,
}: {
  baseNotes: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryMode: "delivery" | "pickup";
  cep: string;
  address: string;
  paymentMethod: "pix" | "card";
}) {
  const blocks = [];

  if (baseNotes.trim()) {
    blocks.push(baseNotes.trim());
  }

  blocks.push("Checkout Prismarq");
  blocks.push(`Cliente: ${customerName} | ${customerEmail} | ${customerPhone}`);
  blocks.push(
    deliveryMode === "pickup"
      ? "Entrega: retirada na Prismarq"
      : `Entrega: ${cep || "CEP nao informado"} | ${address || "Endereco nao informado"}`,
  );
  blocks.push(`Pagamento: ${paymentMethod === "pix" ? "Pix com 15% de desconto" : "Cartao"}`);

  return blocks.join("\n");
}
export function OrderBuilder({
  session,
  initialProductSlug,
  lockProduct = false,
  initialConfig,
  initialCheckout,
}: {
  session: SessionUser | null;
  initialProductSlug?: string;
  lockProduct?: boolean;
  initialConfig?: OrderDraftValues;
  initialCheckout?: {
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    cep?: string;
    address?: string;
    deliveryMode?: "delivery" | "pickup";
    paymentMethod?: "pix" | "card";
  };
}) {
  const router = useRouter();
  const initialProduct = getProductBySlug(initialProductSlug ?? products[0].slug) ?? products[0];
  const initialDraft = resolveOrderDraft(initialProduct, initialConfig);
  const [productSlug, setProductSlug] = useState(initialProduct.slug);
  const [width, setWidth] = useState(initialDraft.width);
  const [height, setHeight] = useState(initialDraft.height);
  const [quantity, setQuantity] = useState(initialDraft.quantity);
  const [material, setMaterial] = useState(initialDraft.material);
  const [finishing, setFinishing] = useState(initialDraft.finishing);
  const [deadline, setDeadline] = useState(initialDraft.deadline);
  const [notes, setNotes] = useState(initialDraft.notes);
  const [customerName, setCustomerName] = useState(initialCheckout?.customerName ?? session?.name ?? "");
  const [customerEmail, setCustomerEmail] = useState(initialCheckout?.customerEmail ?? session?.email ?? "");
  const [customerPhone, setCustomerPhone] = useState(initialCheckout?.customerPhone ?? session?.phone ?? "");
  const [deliveryMode, setDeliveryMode] = useState<"delivery" | "pickup">(initialCheckout?.deliveryMode ?? "delivery");
  const [cep, setCep] = useState(initialCheckout?.cep ?? "");
  const [address, setAddress] = useState(initialCheckout?.address ?? "");
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">(initialCheckout?.paymentMethod ?? "pix");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<CheckoutErrors>({});
  const [touchedFields, setTouchedFields] = useState<Partial<Record<CheckoutField, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const initializedRef = useRef(false);
  const fieldRefs = useRef<Partial<Record<CheckoutField, HTMLInputElement | null>>>({});
  const { upsertItem } = useCart();

  const currentProduct = getProductBySlug(productSlug) ?? initialProduct;
  const quote = calculateQuote({
    productSlug,
    width,
    height,
    quantity,
    material,
    finishing,
    deadline,
  });
  const pixTotal = quote.total * 0.85;
  const pixSavings = quote.total - pixTotal;
  const checkoutErrors = validateCheckoutFields({
    customerName,
    customerEmail,
    customerPhone,
    deliveryMode,
    cep,
    address,
  });
  const requiredFieldCount = deliveryMode === "delivery" ? 5 : 3;
  const completedFieldCount = [
    customerName.trim(),
    isValidEmail(customerEmail.trim()) ? customerEmail.trim() : "",
    [10, 11].includes(customerPhone.replace(/\D/g, "").length) ? customerPhone.trim() : "",
    deliveryMode === "delivery" ? (cep.replace(/\D/g, "").length === 8 ? cep : "") : "ok",
    deliveryMode === "delivery" ? address.trim() : "ok",
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

    const nextDraft = resolveOrderDraft(getProductBySlug(productSlug) ?? products[0]);
    setWidth(nextDraft.width);
    setHeight(nextDraft.height);
    setMaterial(nextDraft.material);
    setFinishing(nextDraft.finishing);
    setDeadline(nextDraft.deadline);
    setQuantity(nextDraft.quantity);
    setNotes(nextDraft.notes);
  }, [productSlug]);

  useEffect(() => {
    setFieldErrors(checkoutErrors);
  }, [checkoutErrors]);

  useEffect(() => {
    if (deliveryMode === "pickup") {
      setFieldErrors((current) => {
        const next = { ...current };
        delete next.cep;
        delete next.address;
        return next;
      });
    }
  }, [deliveryMode]);

  const normalizedCheckout = {
    customerName: customerName.trim(),
    customerEmail: customerEmail.trim(),
    customerPhone: customerPhone.trim(),
    cep: cep.trim(),
    address: address.trim(),
  };

  const primaryActionLabel = !session
    ? "Entrar para continuar"
    : isPending
      ? file
        ? "Finalizando pedido..."
        : "Preparando pagamento..."
      : !isReadyToSubmit
        ? "Preencha os dados para concluir"
        : file
          ? "Finalizar pedido com arte"
          : "Finalizar pedido agora";
  const primaryActionHelper = !session
    ? "Seus dados e configuracoes ficam salvos ao entrar."
    : isPending
      ? file
        ? "Enviando arte e confirmando seu pedido."
        : "Confirmando seu pedido para seguir sem friccao."
      : hasCheckoutErrors
        ? completionLabel
        : file
          ? "Sua arte ja vai anexada ao pedido final."
          : "Voce pode concluir agora e enviar a arte depois, se precisar.";

  function shouldShowFieldError(field: CheckoutField) {
    return submitAttempted || touchedFields[field];
  }

  function setFieldTouched(field: CheckoutField) {
    setTouchedFields((current) => ({ ...current, [field]: true }));
  }

  function focusFirstInvalidField(errors: CheckoutErrors) {
    const fieldOrder: CheckoutField[] = ["customerName", "customerEmail", "customerPhone", "cep", "address"];
    const firstInvalidField = fieldOrder.find((field) => errors[field]);
    if (firstInvalidField) {
      fieldRefs.current[firstInvalidField]?.focus();
    }
  }

  function redirectToLogin() {
    const orderParams = new URLSearchParams();
    orderParams.set("product", productSlug);
    orderParams.set("width", String(width));
    orderParams.set("height", String(height));
    orderParams.set("quantity", String(quantity));
    orderParams.set("material", material);
    orderParams.set("finishing", finishing);
    orderParams.set("deadline", deadline);
    orderParams.set("notes", notes);
    if (normalizedCheckout.customerName) orderParams.set("customerName", normalizedCheckout.customerName);
    if (normalizedCheckout.customerEmail) orderParams.set("customerEmail", normalizedCheckout.customerEmail);
    if (normalizedCheckout.customerPhone) orderParams.set("customerPhone", normalizedCheckout.customerPhone);
    if (normalizedCheckout.cep) orderParams.set("cep", normalizedCheckout.cep);
    if (normalizedCheckout.address) orderParams.set("address", normalizedCheckout.address);
    orderParams.set("deliveryMode", deliveryMode);
    orderParams.set("paymentMethod", paymentMethod);

    const params = new URLSearchParams();
    params.set("returnTo", `/order?${orderParams.toString()}`);
    router.push(`/login?${params.toString()}`);
  }

  function validateCheckout() {
    const errors = validateCheckoutFields({
      customerName,
      customerEmail,
      customerPhone,
      deliveryMode,
      cep,
      address,
    });

    setFieldErrors(errors);

    if (Object.keys(errors).length === 0) {
      return { message: "", errors };
    }

    if (errors.customerName || errors.customerEmail || errors.customerPhone) {
      return {
        message: "Revise seus dados de contato para receber a confirmacao sem atraso.",
        errors,
      };
    }

    return {
      message: "Confirme os dados de entrega para evitar devolucoes ou atrasos no envio.",
      errors,
    };
  }

  function handleSubmit() {
    setError("");
    setMessage("");
    setSubmitAttempted(true);

    if (!session) {
      redirectToLogin();
      return;
    }

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
            width,
            height,
            quantity,
            material,
            finishing,
            deadline,
            notes: buildCheckoutNotes({
              baseNotes: notes,
              customerName: normalizedCheckout.customerName,
              customerEmail: normalizedCheckout.customerEmail,
              customerPhone: normalizedCheckout.customerPhone,
              deliveryMode,
              cep: normalizedCheckout.cep,
              address: normalizedCheckout.address,
              paymentMethod,
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

        setMessage(`Pedido ${data.order.id} confirmado com sucesso.`);
        router.push(`/dashboard?created=${data.order.id}`);
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Falha inesperada.");
      }
    });
  }

  function handleAddToCart() {
    setError("");
    setMessage("");

    const experience = getProductExperience(productSlug);
    if (!experience) {
      setError("Nao foi possivel preparar o carrinho para este produto.");
      return;
    }

    const baseSelection = getDefaultSelection(currentProduct, experience);
    const cartItem = buildCartItem({
      product: currentProduct,
      experience,
      selection: {
        ...baseSelection,
        width,
        height,
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
        deliveryMode,
        cep: normalizedCheckout.cep,
        address: normalizedCheckout.address,
        paymentMethod,
      }),
    });

    upsertItem(cartItem);
    router.push("/cart");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
      <div className="panel p-6 sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/8 pb-7">
          <div className="max-w-3xl">
            <p className="label-kicker">Checkout Prismarq</p>
            <h2 className="display-title mt-3 text-[clamp(2rem,3vw,3.2rem)] font-semibold leading-[0.98] tracking-tight text-balance">
              Seu pedido em um fluxo simples, rapido e seguro.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-black/62 sm:text-base">
              Revise os detalhes, escolha o pagamento e conclua sem etapas desnecessarias.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="neutral">{completionLabel}</Badge>
              <Badge tone="cyan">Pagamento seguro via Pix ou Cartao</Badge>
              {deliveryMode === "pickup" ? <Badge tone="yellow">Retirada sem frete</Badge> : null}
            </div>
          </div>

          {!session ? (
            <Link
              href={`/login?returnTo=${encodeURIComponent(`/order?product=${productSlug}`)}`}
              className="btn btn-secondary focus-ring"
            >
              Entrar para finalizar
            </Link>
          ) : (
            <div className="surface-muted px-4 py-3 text-sm font-medium text-black/70">Cliente logado: {session.name}</div>
          )}
        </div>

        <div className="mt-6 grid gap-6">
          <FieldGroup
            title="Detalhes do pedido"
            description="Revise produto, medidas, material, acabamento, prazo e arte antes de seguir para o pagamento."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {!lockProduct ? (
                <label className="space-y-2 sm:col-span-2">
                  <FieldLabel>Produto</FieldLabel>
                  <select value={productSlug} onChange={(event) => setProductSlug(event.target.value)} className="field">
                    {products.map((product) => (
                      <option key={product.slug} value={product.slug}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              <label className="space-y-2">
                <FieldLabel>Largura (cm)</FieldLabel>
                <input
                  type="number"
                  min={1}
                  value={width}
                  onChange={(event) => setWidth(Number(event.target.value) || 1)}
                  className="field"
                />
              </label>
              <label className="space-y-2">
                <FieldLabel>Altura (cm)</FieldLabel>
                <input
                  type="number"
                  min={1}
                  value={height}
                  onChange={(event) => setHeight(Number(event.target.value) || 1)}
                  className="field"
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
                  className="field"
                />
              </label>
              <div className="surface-muted p-5">
                <p className="label-kicker">Seu pedido</p>
                <strong className="mt-2 block text-xl font-semibold text-ink">{currentProduct.name}</strong>
                <p className="mt-3 text-sm leading-6 text-black/60">{currentProduct.lead}</p>
              </div>

              <label className="space-y-2">
                <FieldLabel>Material</FieldLabel>
                <select value={material} onChange={(event) => setMaterial(event.target.value)} className="field">
                  {currentProduct.materials.map((item) => (
                    <option key={item.label} value={item.label}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <FieldLabel>Acabamento</FieldLabel>
                <select value={finishing} onChange={(event) => setFinishing(event.target.value)} className="field">
                  {currentProduct.finishings.map((item) => (
                    <option key={item.label} value={item.label}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 sm:col-span-2">
                <FieldLabel>Prazo</FieldLabel>
                <select value={deadline} onChange={(event) => setDeadline(event.target.value)} className="field">
                  {currentProduct.deadlines.map((item) => (
                    <option key={item.label} value={item.label}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-3 sm:col-span-2">
                <FieldLabel>Arquivo da arte</FieldLabel>
                <div className="rounded-[30px] border border-dashed border-black/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,247,248,0.92))] p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ink text-white">
                      <UploadIcon />
                    </span>
                    <div className="min-w-0 flex-1">
                      <strong className="block truncate text-lg font-semibold text-ink sm:text-[1.05rem]">
                        {file ? file.name : "Envie sua arte para anexar ao pedido"}
                      </strong>
                      <p className="mt-2 text-sm leading-6 text-black/60">
                        Aceitamos PDF, PNG, JPG, SVG, ZIP, CDR e AI. Se preferir, finalize agora e envie a arte depois com o atendimento.
                      </p>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.svg,.zip,.cdr,.ai"
                        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                        className="focus-ring mt-4 w-full rounded-[24px] border border-black/10 bg-white px-4 py-3 text-sm outline-none file:mr-4 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                      />
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-black/52">
                          {file ? "Arte pronta para envio" : "Arte opcional nesta etapa"}
                        </span>
                        {!file ? (
                          <span className="rounded-full border border-cyan/20 bg-cyan/8 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-cyan-700">
                            Conclua sem interromper o fluxo
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </FieldGroup>

          <FieldGroup
            title="Dados do cliente"
            description="Use os dados para contato, confirmacao e acompanhamento do seu pedido."
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-2">
                <FieldLabel>Nome</FieldLabel>
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
                  className={cn("field", shouldShowFieldError("customerName") && fieldErrors.customerName && "border-red-300 bg-red-50/40")}
                  placeholder="Seu nome"
                />
                <FieldHint
                  id="customer-name-hint"
                  tone={shouldShowFieldError("customerName") && fieldErrors.customerName ? "error" : "neutral"}
                >
                  {shouldShowFieldError("customerName") && fieldErrors.customerName
                    ? fieldErrors.customerName
                    : "Como voce quer ser chamado na confirmacao do pedido."}
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
                  className={cn("field", shouldShowFieldError("customerEmail") && fieldErrors.customerEmail && "border-red-300 bg-red-50/40")}
                  placeholder="voce@empresa.com"
                />
                <FieldHint
                  id="customer-email-hint"
                  tone={shouldShowFieldError("customerEmail") && fieldErrors.customerEmail ? "error" : "neutral"}
                >
                  {shouldShowFieldError("customerEmail") && fieldErrors.customerEmail
                    ? fieldErrors.customerEmail
                    : "Enviamos a confirmacao e o acompanhamento do pedido por aqui."}
                </FieldHint>
              </label>
              <label className="space-y-2">
                <FieldLabel>Telefone</FieldLabel>
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
                  className={cn("field", shouldShowFieldError("customerPhone") && fieldErrors.customerPhone && "border-red-300 bg-red-50/40")}
                  placeholder="(11) 99999-9999"
                />
                <FieldHint
                  id="customer-phone-hint"
                  tone={shouldShowFieldError("customerPhone") && fieldErrors.customerPhone ? "error" : "neutral"}
                >
                  {shouldShowFieldError("customerPhone") && fieldErrors.customerPhone
                    ? fieldErrors.customerPhone
                    : "Usamos este numero apenas se precisarmos agilizar producao ou entrega."}
                </FieldHint>
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-black/52">
                {completedFieldCount}/{requiredFieldCount} dados essenciais preenchidos
              </span>
              <span className="rounded-full border border-cyan/20 bg-cyan/8 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-cyan-700">
                {completionLabel}
              </span>
            </div>
          </FieldGroup>

          <FieldGroup
            title="Entrega"
            description="Escolha entre receber no endereco informado ou retirar com a equipe Prismarq."
          >
            <div className="grid gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <ChoiceCard
                  title="Entrega"
                  description="Receba seu pedido no endereco informado, com envio organizado no prazo."
                  selected={deliveryMode === "delivery"}
                  onClick={() => setDeliveryMode("delivery")}
                />
                <ChoiceCard
                  title="Retirar na Prismarq"
                  description="Retire seu pedido diretamente com nossa equipe, sem custo de entrega."
                  selected={deliveryMode === "pickup"}
                  onClick={() => setDeliveryMode("pickup")}
                />
              </div>

              {deliveryMode === "delivery" ? (
                <div className="grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
                  <label className="space-y-2">
                    <FieldLabel>CEP</FieldLabel>
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
                      className={cn("field", shouldShowFieldError("cep") && fieldErrors.cep && "border-red-300 bg-red-50/40")}
                      placeholder="00000-000"
                    />
                    <FieldHint id="cep-hint" tone={shouldShowFieldError("cep") && fieldErrors.cep ? "error" : "neutral"}>
                      {shouldShowFieldError("cep") && fieldErrors.cep
                        ? fieldErrors.cep
                        : "CEP usado para organizar entrega e confirmacao logistica."}
                    </FieldHint>
                  </label>
                  <label className="space-y-2">
                    <FieldLabel>Endereco</FieldLabel>
                    <input
                      type="text"
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      onBlur={() => setFieldTouched("address")}
                      ref={(element) => {
                        fieldRefs.current.address = element;
                      }}
                      autoComplete="street-address"
                      aria-invalid={shouldShowFieldError("address") && !!fieldErrors.address}
                      aria-describedby="address-hint"
                      className={cn("field", shouldShowFieldError("address") && fieldErrors.address && "border-red-300 bg-red-50/40")}
                      placeholder="Rua, numero, complemento e referencia"
                    />
                    <FieldHint
                      id="address-hint"
                      tone={shouldShowFieldError("address") && fieldErrors.address ? "error" : "neutral"}
                    >
                      {shouldShowFieldError("address") && fieldErrors.address
                        ? fieldErrors.address
                        : "Quanto mais completo o endereco, menos troca sera necessaria depois."}
                    </FieldHint>
                  </label>
                </div>
              ) : (
                <div className="rounded-[24px] border border-black/10 bg-[linear-gradient(180deg,rgba(250,250,251,0.98),rgba(246,247,248,0.92))] p-4 text-sm leading-6 text-black/62">
                  Retirada na Prismarq selecionada. O endereco e as orientacoes de retirada seguem na confirmacao do pedido.
                </div>
              )}
            </div>
          </FieldGroup>

          <FieldGroup
            title="Pagamento"
            description="Escolha a forma de pagamento e aproveite o desconto no Pix."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <ChoiceCard
                title="Pix"
                description={`Economize ${formatCurrencyBRL(pixSavings)} pagando no Pix.`}
                badge="15% OFF"
                tone="pix"
                selected={paymentMethod === "pix"}
                onClick={() => setPaymentMethod("pix")}
              />
              <ChoiceCard
                title="Cartao"
                description="Pague no cartao e conclua o pedido com praticidade."
                selected={paymentMethod === "card"}
                onClick={() => setPaymentMethod("card")}
              />
            </div>
          </FieldGroup>

          <FieldGroup
            title="Observacoes"
            description="Inclua instrucoes, referencias de marca ou qualquer detalhe importante para a producao."
          >
            <label className="space-y-2">
              <FieldLabel>Observacoes do pedido</FieldLabel>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
                className="field min-h-[132px] rounded-[28px]"
                placeholder="Informe detalhes de aplicacao, acabamento, entrega ou contexto da sua solicitacao."
              />
            </label>
          </FieldGroup>
        </div>

        <div aria-live="polite" className="mt-5 min-h-6 text-sm">
          {error ? <p className="font-medium text-red-600">{error}</p> : null}
          {!error && message ? <p className="font-medium text-emerald-700">{message}</p> : null}
          {!error && !message ? <p className="text-black/52">{primaryActionHelper}</p> : null}
        </div>

        <div className="mt-6 rounded-[32px] border border-black/10 bg-[linear-gradient(145deg,rgba(255,255,255,1),rgba(246,248,250,0.95))] p-5 shadow-[0_22px_48px_rgba(15,15,15,0.06)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-xl">
              <p className="label-kicker">Etapa final</p>
              <strong className="mt-2 block text-2xl font-semibold text-ink">Revise seu pedido e siga para o pagamento com seguranca.</strong>
              <p className="mt-3 text-sm leading-6 text-black/60">
                Tudo o que importa esta aqui: detalhes do pedido, entrega, pagamento e arquivo em um so lugar.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                  Confirmacao imediata apos finalizar
                </span>
                <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-black/52">
                  {deliveryMode === "pickup" ? "Retirada sem custo de entrega" : "Entrega validada com CEP"}
                </span>
              </div>
            </div>
            <div className="rounded-[28px] border border-cyan/20 bg-[linear-gradient(180deg,rgba(0,181,255,0.08),rgba(255,255,255,0.98))] px-4 py-4 shadow-[0_18px_36px_rgba(0,181,255,0.12)]">
              <p className="label-kicker">Resumo do pedido</p>
              <strong className="mt-2 block text-3xl font-semibold tracking-tight text-ink">{formatCurrencyBRL(quote.total)}</strong>
              <p className="mt-2 text-sm font-semibold text-cyan-700">Economize {formatCurrencyBRL(pixSavings)} pagando no Pix</p>
              <p className="mt-1 text-sm font-medium text-black/60">{formatCurrencyBRL(pixTotal)} no Pix (15% de desconto)</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-[1.12fr_0.88fr]">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="focus-ring inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#00a6ff,#0067ff)] px-6 text-base font-semibold text-white shadow-[0_22px_46px_rgba(0,103,255,0.28)] transition duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {primaryActionLabel}
              <ArrowRight />
            </button>
            <button
              type="button"
              onClick={handleAddToCart}
              className="btn btn-secondary focus-ring h-14 w-full justify-center"
            >
              Adicionar ao carrinho
            </button>
          </div>
          <p className="mt-3 text-center text-sm font-medium text-black/58">{primaryActionHelper}</p>
        </div>
      </div>

      <aside className="panel h-fit p-6 sm:p-8 lg:sticky lg:top-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="label-kicker">Resumo do pedido</p>
          <Badge tone={paymentMethod === "pix" ? "yellow" : "cyan"}>{paymentMethod === "pix" ? "Pix 15% OFF" : "Cartao"}</Badge>
        </div>
        <h3 className="display-title mt-3 text-[clamp(1.75rem,4vw,2.2rem)] font-semibold tracking-tight text-ink">{currentProduct.name}</h3>
        <p className="mt-3 text-sm leading-6 text-black/62">{currentProduct.lead}</p>

        <div className="mt-6 rounded-[30px] border border-cyan/20 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(240,250,255,0.98))] p-5 shadow-[0_22px_48px_rgba(0,181,255,0.12)]">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-black/44">Total estimado</p>
          <strong className="mt-3 block text-[clamp(2.6rem,8vw,3.35rem)] font-semibold tracking-tight text-ink">{formatCurrencyBRL(quote.total)}</strong>
          <div className="mt-4 rounded-[24px] border border-cyan/18 bg-cyan/10 p-4">
            <p className="text-sm font-semibold text-cyan-800">Economize {formatCurrencyBRL(pixSavings)} pagando no Pix</p>
            <p className="mt-1 text-base font-semibold text-ink">{formatCurrencyBRL(pixTotal)} no Pix (15% de desconto)</p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <SummaryStat label="Area real" value={`${quote.area.toFixed(2)} m2`} />
          <SummaryStat label="Area faturavel" value={`${quote.billableArea.toFixed(2)} m2`} />
          <SummaryStat label="Quantidade" value={`${quantity} unidades`} />
          <SummaryStat label="Prazo" value={deadline} />
        </div>

        <div className="mt-4 rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_18px_34px_rgba(15,15,15,0.04)]">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-black/44">Cliente e entrega</p>
          <div className="mt-4 space-y-3">
            <div className="surface-muted px-4 py-3">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-black/44">Contato</p>
              <strong className="mt-2 block text-sm font-semibold text-ink">{customerName || "Nome do cliente"}</strong>
              <p className="mt-1 text-sm text-black/58">
                {customerEmail || "E-mail"} {customerPhone ? `| ${customerPhone}` : ""}
              </p>
            </div>
            <div className="surface-muted px-4 py-3">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-black/44">Entrega</p>
              <strong className="mt-2 block text-sm font-semibold text-ink">
                {deliveryMode === "pickup" ? "Retirada na Prismarq" : "Entrega no endereco"}
              </strong>
              <p className="mt-1 break-words text-sm text-black/58">
                {deliveryMode === "pickup" ? "Coleta combinada com a equipe Prismarq." : `${cep || "CEP"} | ${address || "Endereco"}`}
              </p>
            </div>
            <div className="surface-muted px-4 py-3">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-black/44">Status do checkout</p>
              <strong className="mt-2 block text-sm font-semibold text-ink">{completionLabel}</strong>
              <p className="mt-1 text-sm text-black/58">
                {file ? "Arte anexada ao pedido." : "Arte opcional neste momento. Voce pode concluir sem anexar agora."}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_18px_34px_rgba(15,15,15,0.04)]">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-black/44">Detalhes do pedido</p>
          <div className="mt-4 space-y-3">
            {[
              { label: "Medidas", value: `${width} x ${height} cm` },
              { label: "Material", value: material },
              { label: "Acabamento", value: finishing },
              { label: "Prazo", value: deadline },
            ].map((item) => (
              <div key={item.label} className="surface-muted px-4 py-3">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-black/44">{item.label}</p>
                <strong className="mt-2 block text-sm font-semibold text-ink">{item.value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-[28px] border border-emerald-200 bg-[linear-gradient(180deg,rgba(236,253,245,0.96),rgba(255,255,255,0.98))] p-5 shadow-[0_16px_32px_rgba(16,185,129,0.08)]">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-ink shadow-[0_10px_22px_rgba(15,15,15,0.08)]">
              <CheckIcon />
            </span>
            <div className="min-w-0">
              <strong className="block text-sm font-semibold text-ink">Compra com mais confianca</strong>
              <div className="mt-3 grid gap-2 text-sm text-black/64">
                <p>Producao propria Prismarq</p>
                <p>+1.500 pedidos produzidos</p>
                <p>Entrega no prazo</p>
                <p>Atendimento direto</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
