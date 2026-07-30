import type { ReactNode } from "react";

export default function EmptyState({ icon = "📭", title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return <div className="flex flex-col items-center justify-center px-6 py-14 text-center"><span className="text-4xl" aria-hidden="true">{icon}</span><h3 className="mt-3 font-semibold text-primary">{title}</h3>{description && <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>}{action && <div className="mt-4">{action}</div>}</div>;
}
