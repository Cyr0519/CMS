import type { HTMLAttributes } from "react";

export default function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-xl bg-white p-6 shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md ${className}`} {...props} />;
}
