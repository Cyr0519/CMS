"use client";

import { useEffect, useState } from "react";

import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";

type Comment = { id: number; nomAuteur: string; contenu: string; createdAt: string };

export default function ArticleComments({ articleId }: { articleId: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    void fetch(`/api/articles/${articleId}/comments`, { cache: "no-store" }).then(async (response) => {
      const result = (await response.json()) as { data?: Comment[] };
      setComments(result.data || []); setLoading(false);
    }).catch(() => setLoading(false));
  }, [articleId]);
  return <section className="mt-10 border-t border-gray-100 pt-8"><div className="mb-5 flex items-center gap-2"><h3 className="text-xl font-semibold tracking-tight">Commentaires</h3><Badge variant="info">{comments.length}</Badge></div>{loading ? <Skeleton className="h-28" /> : comments.length === 0 ? <EmptyState icon="💬" title="Aucun commentaire" description="Cet article n’a pas encore reçu de commentaire." /> : <div className="space-y-4">{comments.map((comment) => <article key={comment.id} className="rounded-xl bg-gray-50 p-4"><div className="flex items-center justify-between gap-4"><p className="font-medium text-primary">{comment.nomAuteur}</p><time className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString("fr-FR")}</time></div><p className="mt-2 text-sm leading-relaxed text-gray-600">{comment.contenu}</p></article>)}</div>}</section>;
}
