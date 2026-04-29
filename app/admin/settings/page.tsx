import { AdminSettingsTabs, type SiteSettingsFormState } from "@/components/admin/admin-settings-tabs";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/admin";
import { companyProfile } from "@/lib/company";
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
    pixDiscountPercent: String(row?.pixDiscountPercent ?? 15),
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
      subtitle="Pix, dados da empresa, frete grátis, desconto Pix e contatos exibidos no site."
    >
      <AdminSettingsTabs initialSite={buildInitialSite(siteRow)} initialPix={pix} />
    </AdminShell>
  );
}
