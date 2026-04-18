export const ORDER_STATUSES = [
  "novo",
  "aguardando arte",
  "em análise",
  "produção",
  "finalizado",
  "entregue",
] as const;

export type Role = "client" | "admin";
export type AuthProvider = "credentials" | "google" | "hybrid";
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface ProductMaterial {
  label: string;
  multiplier: number;
  description: string;
}

export interface ProductFinishing {
  label: string;
  fee: number;
  description: string;
  type: "perOrder" | "perUnit";
}

export interface ProductDeadline {
  label: string;
  days: number;
  multiplier: number;
}

export interface ProductGalleryImage {
  id: string;
  title: string;
  subtitle: string;
  caption?: string;
  tags?: string[];
  accent: "cyan" | "magenta" | "yellow";
  src: string;
}

export interface ProductConfiguratorModelOption {
  id: string;
  label: string;
  description: string;
  recommended?: boolean;
  formatId: string;
  material?: string;
  finishing?: string;
  colorId: string;
  enhancementId: string;
}

export interface ProductConfiguratorFormatOption {
  id: string;
  label: string;
  description: string;
  width: number;
  height: number;
  recommended?: boolean;
}

export interface ProductConfiguratorColorOption {
  id: string;
  label: string;
  description: string;
  swatch: string;
}

export interface ProductConfiguratorEnhancementOption {
  id: string;
  label: string;
  description: string;
  priceLabel: string;
}

export interface ProductAdditionalService {
  id: string;
  label: string;
  description: string;
  priceLabel: string;
  highlighted?: boolean;
}

export interface ProductPriceTier {
  quantity: number;
  unitPrice: number;
  total: number;
  highlighted?: boolean;
}

export interface ProductTechnicalSpec {
  label: string;
  value: string;
}

export interface CartItemAddon {
  id: string;
  label: string;
  priceLabel: string;
  highlighted?: boolean;
}

export interface CartItemSelection {
  modelId: string;
  formatId: string;
  width: number;
  height: number;
  colorId: string;
  enhancementId: string;
  material: string;
  finishing: string;
  deadline: string;
  quantity: number;
  selectedAddonIds: string[];
}

export interface CartItem {
  id: string;
  productSlug: string;
  productName: string;
  productCategory: string;
  productBadge: string;
  image: string;
  selection: CartItemSelection;
  addons: CartItemAddon[];
  notes?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  summary: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductConfiguration {
  categories: string[];
  images: ProductGalleryImage[];
  configurator: {
    model: ProductConfiguratorModelOption[];
    material: ProductMaterial[];
    format: ProductConfiguratorFormatOption[];
    color: ProductConfiguratorColorOption[];
    enhancement: ProductConfiguratorEnhancementOption[];
    finishing: ProductFinishing[];
    deadline: ProductDeadline[];
  };
  priceTable: ProductPriceTier[];
  services: ProductAdditionalService[];
  technicalSpecs: ProductTechnicalSpec[];
}

export interface Product {
  slug: string;
  name: string;
  category: string;
  badge: string;
  description: string;
  lead: string;
  basePriceM2: number;
  minimumArea: number;
  minQuantity: number;
  materials: ProductMaterial[];
  finishings: ProductFinishing[];
  deadlines: ProductDeadline[];
  applications: string[];
  deliveryNote: string;
  featured: boolean;
}

export interface QuoteInput {
  productSlug: string;
  width: number;
  height: number;
  quantity: number;
  material: string;
  finishing: string;
  deadline: string;
}

export interface PriceBreakdown {
  area: number;
  billableArea: number;
  pricePerM2: number;
  materialMultiplier: number;
  finishingFee: number;
  deadlineMultiplier: number;
  unitBase: number;
  subtotal: number;
  total: number;
}

export interface StoredFile {
  id: string;
  orderId?: string | null;
  originalName: string;
  storedName: string;
  url: string;
  size: number;
  mimeType: string;
  relativePath?: string;
  storageDriver?: string;
  uploadedByUserId?: string;
  createdAt?: string;
}

export interface OrderMeasures {
  width: number;
  height: number;
  area: number;
  quantity: number;
}

export interface OrderStatusHistoryEntry {
  id: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  changedByUserId: string;
  changedByName?: string | null;
  note?: string | null;
  createdAt: string;
}

export interface OrderAuditLogEntry {
  id: string;
  action: string;
  actorUserId: string;
  actorName?: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface OrderRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  productSlug: string;
  productName: string;
  measures: OrderMeasures;
  material: string;
  finishing: string;
  deadline: string;
  value: number;
  status: OrderStatus;
  notes?: string | null;
  file?: StoredFile | null;
  statusHistory?: OrderStatusHistoryEntry[];
  auditLogs?: OrderAuditLogEntry[];
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  role: Role;
  passwordHash: string;
  authProvider?: AuthProvider;
  googleSub?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  role: Role;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  company: string;
  phone: string;
  password: string;
}

export interface CreateOrderInput {
  productSlug: string;
  width: number;
  height: number;
  quantity: number;
  material: string;
  finishing: string;
  deadline: string;
  notes?: string;
  fileId?: string | null;
}

export interface UpdateOrderStatusInput {
  status: OrderStatus;
  note?: string;
}

export interface SessionTokenPayload {
  sub: string;
  role: Role;
  email: string;
  type: "session";
}
