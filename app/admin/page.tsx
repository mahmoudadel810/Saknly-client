import { redirect } from "next/navigation";

// /admin has no page of its own; the dashboard is the admin home.
export default function AdminIndexPage() {
  redirect("/admin/dashboard");
}
