import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { companyProfile } from "@/lib/company";
import { requireAdminApi } from "@/lib/require-admin-api";
import { siteSettingsRepository } from "@/server/repositories/site-settings.repository";

export const runtime = "nodejs";

function defaults() {
  return {
    legalName: companyProfile.legalName,
    brandName: companyProfile.brandName,
    addressLine: companyProfile.addressLine,
    cityState: companyProfile.cityState,
    postalCode: companyProfile.postalCode,
    phoneDisplay: companyProfile.phoneDisplay,
    phoneDigits: companyProfile.phoneDigits,
    email: companyProfile.email,
    shortTrustLine: companyProfile.shortTrustLine,
    supportLine: companyProfile.supportLine,
    shippingFreeMinBrl: null as number | null,
    pixDiscountPercent: 15,
    siteWhatsappDigits: companyProfile.phoneDigits,
  };
}

export async function GET(request: NextRequest) {
  const session = await requireAdminApi(request);
  if (session instanceof NextResponse) {
    return session;
  }

  const row = await siteSettingsRepository.get();
  const base = defaults();
  if (!row) {
    return NextResponse.json({ settings: base });
  }

  return NextResponse.json({
    settings: {
      legalName: row.legalName ?? base.legalName,
      brandName: row.brandName ?? base.brandName,
      addressLine: row.addressLine ?? base.addressLine,
      cityState: row.cityState ?? base.cityState,
      postalCode: row.postalCode ?? base.postalCode,
      phoneDisplay: row.phoneDisplay ?? base.phoneDisplay,
      phoneDigits: row.phoneDigits ?? base.phoneDigits,
      email: row.email ?? base.email,
      shortTrustLine: row.shortTrustLine ?? base.shortTrustLine,
      supportLine: row.supportLine ?? base.supportLine,
      shippingFreeMinBrl: row.shippingFreeMinBrl,
      pixDiscountPercent: row.pixDiscountPercent ?? 15,
      siteWhatsappDigits: row.siteWhatsappDigits ?? base.siteWhatsappDigits,
    },
  });
}

export async function PUT(request: NextRequest) {
  const session = await requireAdminApi(request);
  if (session instanceof NextResponse) {
    return session;
  }

  const body = (await request.json()) as Partial<{
    legalName: string;
    brandName: string;
    addressLine: string;
    cityState: string;
    postalCode: string;
    phoneDisplay: string;
    phoneDigits: string;
    email: string;
    shortTrustLine: string;
    supportLine: string;
    shippingFreeMinBrl: number | null;
    pixDiscountPercent: number;
    siteWhatsappDigits: string;
  }>;

  const current = await siteSettingsRepository.get();
  const base = defaults();
  const merged = {
    legalName: body.legalName ?? current?.legalName ?? base.legalName,
    brandName: body.brandName ?? current?.brandName ?? base.brandName,
    addressLine: body.addressLine ?? current?.addressLine ?? base.addressLine,
    cityState: body.cityState ?? current?.cityState ?? base.cityState,
    postalCode: body.postalCode ?? current?.postalCode ?? base.postalCode,
    phoneDisplay: body.phoneDisplay ?? current?.phoneDisplay ?? base.phoneDisplay,
    phoneDigits: body.phoneDigits ?? current?.phoneDigits ?? base.phoneDigits,
    email: body.email ?? current?.email ?? base.email,
    shortTrustLine: body.shortTrustLine ?? current?.shortTrustLine ?? base.shortTrustLine,
    supportLine: body.supportLine ?? current?.supportLine ?? base.supportLine,
    shippingFreeMinBrl:
      body.shippingFreeMinBrl !== undefined ? body.shippingFreeMinBrl : (current?.shippingFreeMinBrl ?? null),
    pixDiscountPercent: body.pixDiscountPercent ?? current?.pixDiscountPercent ?? base.pixDiscountPercent,
    siteWhatsappDigits: body.siteWhatsappDigits ?? current?.siteWhatsappDigits ?? base.siteWhatsappDigits,
  };

  const saved = await siteSettingsRepository.upsert({
    legalName: merged.legalName,
    brandName: merged.brandName,
    addressLine: merged.addressLine,
    cityState: merged.cityState,
    postalCode: merged.postalCode,
    phoneDisplay: merged.phoneDisplay,
    phoneDigits: merged.phoneDigits,
    email: merged.email,
    shortTrustLine: merged.shortTrustLine,
    supportLine: merged.supportLine,
    shippingFreeMinBrl: merged.shippingFreeMinBrl,
    pixDiscountPercent: merged.pixDiscountPercent,
    siteWhatsappDigits: merged.siteWhatsappDigits,
  });
  return NextResponse.json({ settings: saved });
}
