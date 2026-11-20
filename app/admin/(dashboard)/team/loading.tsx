import { ListPageSkeleton } from "@/components/admin/list-page-skeleton";

export default function Loading() {
  return <ListPageSkeleton columns={4} rows={8} />;
}
