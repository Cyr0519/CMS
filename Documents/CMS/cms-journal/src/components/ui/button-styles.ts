/**
 * Styles partagés par Button (client) et ButtonLink (serveur) : un bouton et un
 * lien-bouton doivent être strictement indiscernables à l'écran.
 * Volontairement hors du module "use client" pour rester importable des deux côtés.
 */
export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive" | "outline" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand text-white hover:bg-brand-hover shadow-2xs",
  secondary: "border border-line-strong bg-surface text-ink hover:border-ink-muted hover:bg-gray-50",
  outline: "border border-line-strong bg-surface text-ink hover:border-ink-muted hover:bg-gray-50",
  ghost: "text-ink-soft hover:bg-gray-100 hover:text-ink",
  destructive: "bg-error text-white hover:brightness-95",
  danger: "bg-error text-white hover:brightness-95",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 px-3 text-label",
  md: "h-9 gap-2 px-4 text-body",
  lg: "h-11 gap-2 px-5 text-body",
};

export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", fullWidth = false) {
  return `inline-flex shrink-0 items-center justify-center rounded-full font-medium whitespace-nowrap disabled:pointer-events-none disabled:opacity-45 ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""}`;
}
