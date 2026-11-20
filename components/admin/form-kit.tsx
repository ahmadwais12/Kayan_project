"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { toast } from "sonner";

export function SubmitButton({
  children,
  className,
  variant = "default",
  size = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "accent" | "outline" | "secondary" | "destructive" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className={className} variant={variant} size={size} disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      {children}
    </Button>
  );
}

export function FormFeedback({ error, success }: { error?: string; success?: string }) {
  useEffect(() => {
    if (error) toast.error(error);
    else if (success) toast.success(success);
  }, [error, success]);
  return null;
}

export function FieldHelp({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{children}</p>;
}
