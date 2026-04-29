import { redirect } from "next/navigation";

/** Alias: /register → /cadastro */
export default async function RegisterRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { returnTo } = await searchParams;
  if (returnTo) {
    redirect(`/cadastro?returnTo=${encodeURIComponent(returnTo)}`);
  }
  redirect("/cadastro");
}
