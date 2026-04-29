import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (session?.role === "client" && session.isActive === false) {
    redirect("/login");
  }

  return children;
}
