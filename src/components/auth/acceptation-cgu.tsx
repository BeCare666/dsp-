import Link from "next/link";

// Case d'acceptation des CGU et de la politique de confidentialité, commune aux
// deux formulaires d'inscription. Les liens s'ouvrent dans un nouvel onglet pour
// ne pas perdre la saisie en cours.
export function AcceptationCgu() {
  return (
    <label className="flex items-start gap-3 text-sm leading-6 text-text-muted">
      <input
        type="checkbox"
        name="accepteCgu"
        required
        className="mt-1 h-4 w-4 flex-shrink-0 rounded border-border accent-[var(--color-primary)]"
      />
      <span>
        J&apos;accepte les{" "}
        <Link href="/conditions-utilisation" target="_blank" className="font-medium text-primary hover:underline">
          conditions générales d&apos;utilisation
        </Link>{" "}
        et j&apos;ai pris connaissance de la{" "}
        <Link href="/politique-confidentialite" target="_blank" className="font-medium text-primary hover:underline">
          politique de confidentialité
        </Link>
        .
      </span>
    </label>
  );
}
