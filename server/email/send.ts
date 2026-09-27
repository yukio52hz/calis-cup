import "server-only";

import { Resend } from "resend";

import { env } from "@/lib/env";

import { renderEmail, type EmailContent } from "./layout";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

// Nunca lanza: un email fallido no debe romper la acción del usuario.
// Llamar dentro de after() para no demorar la respuesta.
export async function sendEmail(to: string | string[], content: EmailContent) {
  const recipients = (Array.isArray(to) ? to : [to]).filter(Boolean);

  if (recipients.length === 0) return;

  if (!resend) {
    // eslint-disable-next-line no-console
    console.info(
      `[email:sin RESEND_API_KEY] "${content.subject}" → ${recipients.join(", ")}`,
    );

    return;
  }

  const { html, text } = renderEmail(content);

  // Un envío por destinatario: nadie ve los emails de los demás
  const results = await Promise.allSettled(
    recipients.map((recipient) =>
      resend.emails.send({
        from: env.EMAIL_FROM,
        to: recipient,
        subject: content.subject,
        html,
        text,
      }),
    ),
  );

  for (const result of results) {
    const error =
      result.status === "rejected" ? result.reason : result.value.error;

    if (error) {
      // eslint-disable-next-line no-console
      console.error(`[email] Falló "${content.subject}":`, error);
    }
  }
}
