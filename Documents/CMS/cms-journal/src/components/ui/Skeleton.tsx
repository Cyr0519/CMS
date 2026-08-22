export default function Skeleton({ className = "h-5 w-full" }: { className?: string }) {
  return <div className={`skeleton rounded-lg ${className}`} aria-hidden="true" />;
}
