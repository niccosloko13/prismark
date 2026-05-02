import { AdminSettingsTabs, type SiteSettingsFormState } from "@/components/admin/admin-settings-tabs";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/admin";
import { companyProfile } from "@/lib/company";
import { PIX_DISCOUNT_PERCENT } from "@/lib/pix-discount";
import { getPaymentSettings } from "@/lib/storage";
import { siteSettingsRepository } from "@/server/repositories/site-settings.repository";

function buildInitialSite(row: Awaited<ReturnType<typeof siteSettingsRepository.get>>): SiteSettingsFormState {
  return {
    legalName: row?.legalName ?? companyProfile.legalName,
    brandName: row?.brandName ?? companyProfile.brandName,
    addressLine: row?.addressLine ?? companyProfile.addressLine,
    cityState: row?.cityState ?? companyProfile.cityState,
    postalCode: row?.postalCode ?? companyProfile.postalCode,
    phoneDisplay: row?.phoneDisplay ?? companyProfile.phoneDisplay,
    phoneDigits: row?.phoneDigits ?? companyProfile.phoneDigits,
    email: row?.email ?? companyProfile.email,
    shortTrustLine: row?.shortTrustLine ?? companyProfile.shortTrustLine,
    supportLine: row?.supportLine ?? companyProfile.supportLine,
    shippingFreeMinBrl: row?.shippingFreeMinBrl != null ? String(row.shippingFreeMinBrl) : "",
    pixDiscountPercent: String(row?.pixDiscountPercent ?? PIX_DISCOUNT_PERCENT),
    siteWhatsappDigits: row?.siteWhatsappDigits ?? companyProfile.phoneDigits,
  };
}

export default async function AdminSettingsPage() {
  await requireAdminSession();
  const [pix, siteRow] = await Promise.all([
    getPaymentSettings(),
    siteSettingsRepository.get().catch(() => null),
  ]);

  return (
    <AdminShell
      title="Configurações"
      subtitle="Chave Pix, dados da empresa, frete grátis e contatos. O desconto Pix da vitrine é fixo no código."
    >
      <AdminSettingsTabs initialSite={buildInitialSite(siteRow)} initialPix={pix} />
    </AdminShell>
  );
}
