import { redirect } from "next/navigation";
import { apiFetchJson, ApiError } from "@/lib/api-server";
import { Questionnaire } from "@/components/auto-evaluation/questionnaire";
import type { SessionEvaluation } from "@/lib/types";

export default async function SessionEvaluationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let session: SessionEvaluation;
  try {
    session = await apiFetchJson<SessionEvaluation>(`/sessions-evaluation/${id}`);
  } catch (erreur) {
    if (erreur instanceof ApiError && erreur.status === 404) {
      redirect("/auto-evaluation");
    }
    throw erreur;
  }

  if (session.statut === "SOUMISE") {
    redirect(`/auto-evaluation/${id}/resultats`);
  }

  return <Questionnaire session={session} />;
}
