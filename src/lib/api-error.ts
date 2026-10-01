// Format d'erreur standard renvoyé par l'API NestJS (ValidationPipe / HttpException).
interface CorpsErreurApi {
  message?: string | string[];
  error?: string;
}

export function messageErreurApi(corps: unknown, repli = "Une erreur est survenue. Veuillez réessayer."): string {
  const c = corps as CorpsErreurApi | undefined;
  if (!c?.message) return repli;
  return Array.isArray(c.message) ? c.message.join(", ") : c.message;
}
