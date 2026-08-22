export type ReviewStatus = "PUBLIE" | "REFUSE" | "EN_ATTENTE";

/**
 * Change le statut éditorial d'un article. Les transitions autorisées sont
 * vérifiées côté serveur (`REVIEW_TRANSITIONS` dans `src/lib/articles.ts`) :
 * cet appel ne fait que les demander.
 */
export async function changeArticleStatus(articleId: number, statut: ReviewStatus, note?: string): Promise<void> {
  const response = await fetch(`/api/articles/${articleId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ statut, ...(note?.trim() ? { note: note.trim() } : {}) }),
  });

  if (!response.ok) {
    const result = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(result.error || "Action impossible");
  }
}
