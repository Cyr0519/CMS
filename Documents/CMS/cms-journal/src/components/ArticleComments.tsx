"use client";

import { useEffect, useState } from "react";

import Avatar from "@/components/ui/Avatar";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";

type Comment = { id: number; nomAuteur: string; contenu: string; createdAt: string };

export default function ArticleComments({ articleId }: { articleId: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch(`/api/articles/${articleId}/comments`, { cache: "no-store" })
      .then(async (response) => {
        const result = (await response.json()) as { data?: Comment[] };
        setComments(result.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [articleId]);

  return (
    <section className="mt-10 border-t border-line pt-8">
      <h2 className="flex items-center gap-2 text-h3 font-semibold text-ink">
        Commentaires
        <span className="tabular rounded-full bg-gray-100 px-2 py-0.5 text-caption font-medium text-ink-soft">{comments.length}</span>
      </h2>

      {loading ? (
        <div className="mt-4 space-y-3">{[0, 1].map((item) => <Skeleton key={item} className="h-20 w-full" />)}</div>
      ) : comments.length === 0 ? (
        <EmptyState compact icon="comment" title="Aucun commentaire" description="Cet article n’a pas encore reçu de réaction." />
      ) : (
        <ul className="mt-4 space-y-3">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-3 rounded-2xl bg-surface-sunken p-4">
              <Avatar nom={comment.nomAuteur} size={32} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-medium text-ink">{comment.nomAuteur}</p>
                  <time className="text-caption text-ink-muted">{new Date(comment.createdAt).toLocaleDateString("fr-FR")}</time>
                </div>
                <p className="mt-1.5 text-body leading-relaxed text-ink-soft">{comment.contenu}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
