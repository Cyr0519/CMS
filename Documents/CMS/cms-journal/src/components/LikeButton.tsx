"use client";

import { useEffect, useState } from "react";

import Icon from "@/components/ui/Icon";

type Props = { slug: string; initialLikes: number };

const storageKey = (slug: string) => `gi:like:${slug}`;

/**
 * « J'aime » d'un article. Le total vit en base ; le fait que *ce* visiteur ait
 * déjà aimé est gardé dans son navigateur, faute de compte lecteur sur le site
 * public. Le compteur est mis à jour de façon optimiste, puis corrigé par la
 * réponse du serveur.
 */
export default function LikeButton({ slug, initialLikes }: Props) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    void Promise.resolve().then(() => setLiked(window.localStorage.getItem(storageKey(slug)) === "1"));
  }, [slug]);

  async function toggle() {
    if (pending) return;
    const next = !liked;
    setPending(true);
    setLiked(next);
    setLikes((value) => Math.max(0, value + (next ? 1 : -1)));
    window.localStorage.setItem(storageKey(slug), next ? "1" : "0");

    try {
      const response = await fetch(`/api/public/articles/${encodeURIComponent(slug)}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liked: next }),
      });
      const result = (await response.json()) as { data?: { likes: number } };
      if (response.ok && result.data) setLikes(result.data.likes);
    } catch {
      // Réseau indisponible : on revient à l'état précédent plutôt que de
      // laisser un compteur qui ment.
      setLiked(!next);
      setLikes((value) => Math.max(0, value + (next ? -1 : 1)));
      window.localStorage.setItem(storageKey(slug), next ? "0" : "1");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      aria-pressed={liked}
      aria-label={liked ? "Retirer mon j’aime" : "J’aime cet article"}
      className={`inline-flex h-9 items-center gap-2 rounded-full border px-4 text-body font-medium transition active:scale-95 ${
        liked
          ? "border-like/30 bg-like-soft text-like"
          : "border-line-strong bg-surface text-ink-soft hover:border-like/40 hover:text-like"
      }`}
    >
      <Icon name="heart" size={16} filled={liked} className={liked ? "scale-110 transition-transform" : "transition-transform"} />
      <span className="tabular">{likes}</span>
    </button>
  );
}
