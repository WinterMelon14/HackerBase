import { Resend } from "resend";
import { ApplicationAcceptedEmail, ApplicationReceivedEmail } from "@/lib/emails/ApplicationEmails";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return null;
  return { client: new Resend(apiKey), from };
}

export async function sendApplicationReceivedEmail({
  email,
  name,
  applicationType,
}: {
  email: string;
  name: string;
  applicationType: string;
}) {
  const resend = getResend();
  if (!resend) {
    console.warn("Application email not sent: RESEND_API_KEY or RESEND_FROM_EMAIL is not configured.");
    return;
  }
  const { error } = await resend.client.emails.send({
    from: resend.from,
    to: email,
    subject: "We received your hackathon application",
    react: <ApplicationReceivedEmail name={name} applicationType={applicationType} />,
  });
  if (error) throw new Error(error.message);
}

export async function sendApplicationAcceptedEmail({ email, name }: { email: string; name: string }) {
  const resend = getResend();
  if (!resend) {
    console.warn("Acceptance email not sent: RESEND_API_KEY or RESEND_FROM_EMAIL is not configured.");
    return;
  }
  const { error } = await resend.client.emails.send({
    from: resend.from,
    to: email,
    subject: "Your hackathon application was accepted",
    react: <ApplicationAcceptedEmail name={name} />,
  });
  if (error) throw new Error(error.message);
}
