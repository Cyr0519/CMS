import { redirect } from "next/navigation";

export default function LegacyCommentsPage() {
  redirect("/dashboard/comments");
}
