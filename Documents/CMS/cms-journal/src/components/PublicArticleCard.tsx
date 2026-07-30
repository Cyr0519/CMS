import Image from "next/image";
import Link from "next/link";

import Badge from "@/components/ui/Badge";

export type PublicArticle = {
  id: number;
  titre: string;
  slug: string;
  resume: string | null;
  contenu: string;
  publishedAt: string | null;
  images: Array<{ id: number; nomFichier: string; chemin: string; imageCouverture: boolean }>;
  category: { id: number; nom: string };
  author: { nom: string; prenom: string };
};

export default function PublicArticleCard({ article }: { article: PublicArticle }) {
  const cover = article.images.find((image) => image.imageCouverture) || article.images[0];
  return (
    <article className="group overflow-hidden rounded-xl bg-white shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/articles/${article.slug}`} className="block">
        <div className="relative aspect-video overflow-hidden bg-gray-100">
          {cover ? (
            <Image src={cover.chemin} alt={cover.nomFichier || article.titre} fill className="object-cover transition duration-300 group-hover:scale-105" />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl text-gray-300">📰</div>
          )}
        </div>
        <div className="p-5">
          <Badge variant="info">{article.category.nom}</Badge>
          <h2 className="mt-3 line-clamp-2 text-xl font-semibold tracking-tight text-primary group-hover:text-accent">{article.titre}</h2>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-500">{article.resume || article.contenu}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-400">
            <span>{article.author.prenom} {article.author.nom}</span><span>·</span>
            <time>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("fr-FR") : "Date indisponible"}</time>
          </div>
        </div>
      </Link>
    </article>
  );
}
