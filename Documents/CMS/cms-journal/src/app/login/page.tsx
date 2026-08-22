"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";

import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import Input from "@/components/ui/Input";
import { clearCurrentUser } from "@/lib/use-current-user";

interface LoginErrorResponse {
  error?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data: LoginErrorResponse = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Une erreur est survenue");
        return;
      }

      // Le compte change : on invalide l'identité mise en cache par la session
      // précédente avant d'entrer dans le tableau de bord.
      clearCurrentUser();
      router.push("/dashboard");
    } catch {
      setError("Impossible de contacter le serveur");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4 py-12">
      <div className="w-full max-w-[380px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-brand text-white">
            <Icon name="book" size={20} strokeWidth={2} />
          </span>
          <h1 className="mt-4 font-display text-h1 font-semibold tracking-tight text-ink">Grace Info</h1>
          <p className="mt-1.5 text-body text-ink-soft">Connectez-vous à votre espace éditorial.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-line bg-surface p-6" noValidate>
          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="vous@graceinfo.fr"
          />
          <Input
            id="password"
            name="password"
            type="password"
            label="Mot de passe"
            autoComplete="current-password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={error ?? undefined}
          />
          <Button type="submit" size="lg" fullWidth loading={isSubmitting} className="mt-2">
            {isSubmitting ? "Connexion…" : "Se connecter"}
          </Button>
        </form>

        <p className="mt-6 text-center text-body-sm text-ink-muted">
          <Link href="/" className="inline-flex items-center gap-1.5 hover:text-ink-soft">
            <Icon name="arrowLeft" size={13} />
            Retour au site
          </Link>
        </p>
      </div>
    </div>
  );
}
