import Link from "next/link";
import { Download, Mail, MessageSquare, Paperclip, Phone, User } from "lucide-react";
import { updateInquiryStatus, addInquiryNote } from "@/actions/inquiries";
import { SubmitButton } from "@/components/admin/form-kit";
import { InquiryStatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, NativeSelect, Textarea } from "@/components/ui/input";
import { formatBytes, formatDateTime } from "@/lib/utils";

export type InquiryDetailProps = {
  kind: "contact" | "quote";
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  assignedToId: string;
  followUpAt: string;
  createdAt: Date;
  ip: string | null;
  userAgent: string | null;
  details: { label: string; value: string }[];
  message: string;
  messageLabel: string;
  notes: { id: string; body: string; createdAt: Date; author: string | null }[];
  attachments: { id: string; fileName: string; size: number; mimeType: string; createdAt: Date }[];
  staff: { id: string; name: string }[];
};

const STATUSES = [
  ["NEW", "New"],
  ["CONTACTED", "Contacted"],
  ["IN_PROGRESS", "In progress"],
  ["QUOTATION_SENT", "Quotation sent"],
  ["APPROVED", "Approved"],
  ["REJECTED", "Rejected"],
  ["COMPLETED", "Completed"],
];

export function InquiryDetail(props: InquiryDetailProps) {
  return (
    <div className="grid items-start gap-5 xl:grid-cols-[1.5fr_1fr]">
      <div className="space-y-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
            <CardTitle className="flex items-center gap-2">
              <User className="size-4 text-muted-foreground" />
              {props.kind === "quote" ? "Project brief" : "Message"}
            </CardTitle>
            <InquiryStatusBadge status={props.status} />
          </CardHeader>
          <CardContent className="space-y-4">
            {props.details.length > 0 && (
              <dl className="grid gap-3 sm:grid-cols-2">
                {props.details.map((detail) => (
                  <div key={detail.label} className="rounded-md bg-secondary/50 px-3 py-2">
                    <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{detail.label}</dt>
                    <dd className="mt-0.5 text-sm text-primary">{detail.value || "—"}</dd>
                  </div>
                ))}
              </dl>
            )}
            <div>
              <p className="mb-1 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{props.messageLabel}</p>
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{props.message}</p>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-border/70 pt-4">
              <Button asChild variant="outline" size="sm">
                <a href={`mailto:${props.email}`}>
                  <Mail className="size-3.5" /> Reply by email
                </a>
              </Button>
              {props.phone && (
                <Button asChild variant="outline" size="sm">
                  <a href={`tel:${props.phone}`}>
                    <Phone className="size-3.5" /> Call
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card id="notes">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="size-4 text-muted-foreground" /> Internal notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form action={addInquiryNote} className="space-y-3">
              <input type="hidden" name="kind" value={props.kind} />
              <input type="hidden" name="id" value={props.id} />
              <Textarea name="body" rows={3} placeholder="Add a private note for the team…" maxLength={8000} required />
              <SubmitButton size="sm">Add note</SubmitButton>
            </form>

            {props.notes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notes yet. Notes are private and only visible to administrators.</p>
            ) : (
              <ol className="space-y-4 border-t border-border/70 pt-4">
                {props.notes.map((note) => (
                  <li key={note.id} className="rounded-md border border-border/70 px-4 py-3">
                    <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{note.body}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {note.author || "System"} · {formatDateTime(note.createdAt)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-5 xl:sticky xl:top-20">
        <Card>
          <CardHeader><CardTitle>Workflow</CardTitle></CardHeader>
          <CardContent>
            <form action={updateInquiryStatus} className="space-y-4">
              <input type="hidden" name="kind" value={props.kind} />
              <input type="hidden" name="id" value={props.id} />
              <div>
                <Label htmlFor="status">Status</Label>
                <NativeSelect id="status" name="status" defaultValue={props.status}>
                  {STATUSES.map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </NativeSelect>
              </div>
              <div>
                <Label htmlFor="assignedToId">Assigned to</Label>
                <NativeSelect id="assignedToId" name="assignedToId" defaultValue={props.assignedToId}>
                  <option value="">Unassigned</option>
                  {props.staff.map((member) => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </NativeSelect>
              </div>
              <div>
                <Label htmlFor="followUpAt">Follow-up date</Label>
                <Input id="followUpAt" name="followUpAt" type="datetime-local" defaultValue={props.followUpAt} />
              </div>
              <SubmitButton className="w-full">Update inquiry</SubmitButton>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Contact</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-medium text-primary">{props.name}</p>
            <p><a href={`mailto:${props.email}`} className="text-muted-foreground hover:text-primary hover:underline">{props.email}</a></p>
            {props.phone && <p className="text-muted-foreground">{props.phone}</p>}
            <p className="pt-2 text-xs text-muted-foreground">Received {formatDateTime(props.createdAt)}</p>
            {props.ip && <p className="text-xs text-muted-foreground">IP {props.ip}</p>}
            {props.userAgent && <p className="line-clamp-2 text-xs text-muted-foreground">{props.userAgent}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Paperclip className="size-4 text-muted-foreground" /> Attachments</CardTitle></CardHeader>
          <CardContent>
            {props.attachments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No files were attached.</p>
            ) : (
              <ul className="space-y-2">
                {props.attachments.map((file) => (
                  <li key={file.id}>
                    <Link
                      href={`/api/admin/inquiries/attachments/${file.id}`}
                      className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-2 text-sm hover:border-primary/30"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <Download className="size-4 shrink-0 text-muted-foreground" />
                        <span className="truncate">{file.fileName}</span>
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">{formatBytes(file.size)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
