import { PageContainer } from "@/components/ui/page-container";
import { PageSkeleton } from "@/components/ui/page-skeleton";

export default function Loading() {
  return (
    <PageContainer>
      <PageSkeleton />
    </PageContainer>
  );
}
