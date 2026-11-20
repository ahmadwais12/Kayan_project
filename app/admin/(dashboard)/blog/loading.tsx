import { ListPageSkeleton } from "@/components/admin/list-page-skeleton";

export default function Loading() {
  return <ListPageSkeleton columns={5} rows={8} />;
}
