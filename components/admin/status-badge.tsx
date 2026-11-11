import { Badge } from "@/components/ui/badge";
import { inquiryStatusLabel } from "@/lib/utils";

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "accent" | "success" | "warning" | "danger" | "info"> = {
  NEW: "info",
  CONTACTED: "warning",
  IN_PROGRESS: "warning",
  QUOTATION_SENT: "accent",
  APPROVED: "success",
  REJECTED: "danger",
  COMPLETED: "success",
};

export function InquiryStatusBadge({ status }: { status: string }) {
  return <Badge variant={STATUS_VARIANTS[status] || "secondary"}>{inquiryStatusLabel(status)}</Badge>;
}

export function PublishBadge({ published }: { published: boolean }) {
  return (
    <Badge variant={published ? "success" : "secondary"}>
      {published ? "Published" : "Draft"}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "success" | "warning" | "secondary"> = {
    COMPLETED: "success",
    IN_PROGRESS: "warning",
    PLANNING: "secondary",
    ON_HOLD: "secondary",
    PUBLISHED: "success",
    DRAFT: "secondary",
    SCHEDULED: "warning",
  };
  return (
    <Badge variant={variants[status] || "secondary"}>
      {inquiryStatusLabel(status)}
    </Badge>
  );
}
