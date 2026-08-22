import Image from "next/image";
import Link from "next/link";

import Icon from "@/components/ui/Icon";

export type PublicArticle = {
  id: number;
  titre: string;
  slug: string;
  resume: string | null;
  contenu: string;
  publishedAt: string | null;
  likes?: number;
  images: Array<{ id: number; nomFichier: string; chemin: string; imageCouverture: boolean }>;
  category: { id: number; nom: string };
  author: { nom: string; prenom: string };
};

export default function PublicArticleCard({ article }: { article: PublicArticle }) {
  const cover = article.images.find((image) => image.imageCouverture) || article.images[0];

  return (
    <article className="group overflow-hidden rounded-3xl border border-line bg-surface p-2 transition hover:border-line-strong">
      <Link href={`/articles/${article.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100">
          {cover ? (
            <Image
              src={cover.chemin}
              alt={cover.nomFichier || article.titre}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-ink-muted"><Icon name="image" size={22} /></div>
          )}
          <span className="absolute left-3 top-3 rounded-full bg-surface/90 px-2.5 py-1 text-caption font-medium text-brand-ink backdrop-blur">
            {article.category.nom}
          </span>
        </div>

        <div className="px-3 pb-3 pt-4">
          <h2 className="line-clamp-2 font-display text-h2 font-semibold leading-snug text-ink transition group-hover:text-brand">
            {article.titre}
          </h2>
          <p className="mt-2 line-clamp-2 text-body leading-relaxed text-ink-soft">{article.resume || article.contenu}</p>
          <div className="mt-4 flex items-center gap-2 text-caption text-ink-muted">
            <span>{article.author.prenom} {article.author.nom}</span>
            <span aria-hidden="true">·</span>
            <time>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "Date indisponible"}</time>
          </div>
        </div>
      </Link>
    </article>
  );
}
