import AdminShell from "@/shared/ui/AdminShell";

// The admin shell for every /admin route. Access control is unchanged: middleware.ts redirects anyone without
// an admin token, and the pages keep their own role checks.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
