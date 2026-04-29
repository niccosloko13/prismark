import { redirect } from "next/navigation";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
  }>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = (resolvedSearchParams.q ?? "").trim();
  const target = query ? `/produtos?q=${encodeURIComponent(query)}` : "/produtos";
  redirect(target);
}
