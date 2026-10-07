import { notFound } from "next/navigation";

// Any /admin URL without a page renders app/admin/not-found.tsx inside the admin shell
// (without this catch-all, Next.js would fall through to the root not-found outside the shell).
export default function AdminCatchAll() {
  notFound();
}
