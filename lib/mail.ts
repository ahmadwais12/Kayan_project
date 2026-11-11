type MailInput = {
  to: string;
  subject: string;
  html: string;
};

export async function sendMail({ to, subject, html }: MailInput) {
  if (!to) return { sent: false, reason: "No recipient configured" };
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info(`[mail] RESEND_API_KEY not configured; skipped "${subject}"`);
    return { sent: false, reason: "Email provider not configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "Kayan Land <onboarding@resend.dev>",
        to,
        subject,
        html,
      }),
    });
    if (!response.ok) {
      console.error("[mail] provider rejected message", response.status);
      return { sent: false, reason: "Provider error" };
    }
    return { sent: true };
  } catch (error) {
    console.error("[mail] failed", error);
    return { sent: false, reason: "Network error" };
  }
}

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
