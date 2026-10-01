import { Skeleton } from "@/components/ui/skeleton";
import { DataTableSkeleton } from "@/components/ui/data-table";

// Squelette de page de dashboard (en-tête, indicateurs, table) affiché par
// les loading.tsx pendant le chargement serveur, à la place d'un simple spinner.
export function PageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Chargement">
      <div className="mb-8">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-3 h-8 w-72 max-w-full" />
        <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="rounded-[var(--radius-lg)] border border-border bg-surface p-5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-4 h-7 w-20" />
            <Skeleton className="mt-3 h-3 w-32" />
          </div>
        ))}
      </div>
      <div className="mt-6">
        <DataTableSkeleton />
      </div>
    </div>
  );
}
