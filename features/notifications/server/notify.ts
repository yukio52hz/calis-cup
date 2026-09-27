import "server-only";

import { eq, inArray } from "drizzle-orm";

import { CATEGORY_LABELS } from "@/features/users/schemas";
import { ROUTES } from "@/lib/constants";
import { env } from "@/lib/env";
import { formatColones, formatDateTime, formatDuration } from "@/lib/format";
import { db } from "@/server/db/client";
import { profiles } from "@/server/db/schema";
import { sendEmail } from "@/server/email/send";

// Emails transaccionales (§11, §28, §31). Se llaman dentro de after().

type Competitor = {
  firstName: string;
  lastName: string;
  email: string;
  category: "female" | "male";
};

const url = (path: string) => new URL(path, env.APP_URL).toString();

async function adminEmails() {
  const admins = await db
    .select({ email: profiles.email })
    .from(profiles)
    .where(eq(profiles.role, "admin"));

  return admins.map((admin) => admin.email);
}

// §31: se registra correctamente (al completar el perfil)
export async function notifyWelcome(user: {
  firstName: string;
  email: string;
}) {
  await sendEmail(user.email, {
    subject: "¡Bienvenido a Calis Cup!",
    preheader: "Tu cuenta está lista. Solo falta tu inscripción.",
    title: `¡Hola, ${user.firstName}!`,
    paragraphs: [
      "Tu cuenta en Costa Rica Calis Cup está lista.",
      "El siguiente paso es inscribirte al torneo: realiza el SINPE, registra tu comprobante y el equipo lo revisará.",
    ],
    cta: { label: "Inscribirme", url: url(ROUTES.enroll) },
  });
}

// §11: el competidor envió su pago
export async function notifyRegistrationSubmitted(input: {
  registrationId: string;
  competitor: Competitor;
  payment: { amount: number; reference: string; paidOn: string };
}) {
  const { competitor, payment } = input;
  const details: [string, string][] = [
    ["Monto", formatColones(payment.amount)],
    ["Referencia SINPE", payment.reference],
    ["Fecha del pago", payment.paidOn],
  ];

  await Promise.all([
    sendEmail(competitor.email, {
      subject: "Recibimos tu inscripción",
      preheader: "Tu pago está en revisión.",
      title: "Recibimos tu inscripción",
      paragraphs: [
        `Hola, ${competitor.firstName}. Tu pago está siendo revisado por el equipo.`,
        "Te enviaremos un email cuando tu inscripción sea aprobada.",
      ],
      details,
    }),
    sendEmail(await adminEmails(), {
      subject: "Nueva solicitud de inscripción",
      preheader: `${competitor.firstName} ${competitor.lastName} envió su comprobante.`,
      title: "Nueva solicitud de inscripción",
      paragraphs: [
        "Un nuevo competidor ha enviado una solicitud de inscripción al torneo.",
      ],
      details: [
        ["Nombre", `${competitor.firstName} ${competitor.lastName}`],
        ["Email", competitor.email],
        ["Categoría", CATEGORY_LABELS[competitor.category]],
        ...details,
      ],
      cta: {
        label: "Revisar inscripción",
        url: url(`${ROUTES.adminRegistrations}/${input.registrationId}`),
      },
    }),
  ]);
}

// §11: aprobada o rechazada
export async function notifyRegistrationReviewed(input: {
  competitor: Pick<Competitor, "firstName" | "email">;
  approved: boolean;
  reason: string | null;
}) {
  const { competitor } = input;

  if (input.approved) {
    await sendEmail(competitor.email, {
      subject: "¡Tu inscripción fue aprobada!",
      preheader: "Ya puedes participar en los retos del torneo.",
      title: "¡Tu inscripción fue aprobada!",
      paragraphs: [
        `Hola, ${competitor.firstName}. Tu inscripción al Torneo Online ha sido aprobada. Ya puedes participar en los retos del torneo.`,
      ],
      cta: { label: "Ir al torneo", url: url(ROUTES.dashboard) },
    });

    return;
  }

  await sendEmail(competitor.email, {
    subject: "Tu inscripción necesita revisión",
    preheader: "No fue posible aprobar tu inscripción.",
    title: "Tu inscripción necesita revisión",
    paragraphs: [
      `Hola, ${competitor.firstName}. No fue posible aprobar tu inscripción.`,
      "Revisa el motivo, corrige la información y vuelve a enviarla desde la app.",
    ],
    note: input.reason ? { label: "Motivo", text: input.reason } : undefined,
    cta: { label: "Volver a enviar", url: url(ROUTES.enroll) },
  });
}

// §31: video recibido (competidor) y pendiente de revisión (admin)
export async function notifyVideoSubmitted(input: {
  submissionId: string;
  competitor: Competitor;
  weekNumber: number;
  challengeName: string;
  attemptNumber: number;
}) {
  const { competitor } = input;
  const week = `Semana ${input.weekNumber} · ${input.challengeName}`;

  await Promise.all([
    sendEmail(competitor.email, {
      subject: `Recibimos tu video de la Semana ${input.weekNumber}`,
      preheader: "Te avisaremos cuando sea revisado.",
      title: "Video recibido",
      paragraphs: [
        `Hola, ${competitor.firstName}. Tu video fue recibido correctamente.`,
        "Te notificaremos cuando sea revisado.",
      ],
      details: [
        ["Reto", week],
        ["Intento", `#${input.attemptNumber}`],
      ],
      cta: { label: "Ver mis videos", url: url(ROUTES.videos) },
    }),
    sendEmail(await adminEmails(), {
      subject: "Nuevo video pendiente de revisión",
      preheader: `${competitor.firstName} ${competitor.lastName} · ${week}`,
      title: "Nuevo video pendiente de revisión",
      paragraphs: ["Un competidor envió su video."],
      details: [
        ["Competidor", `${competitor.firstName} ${competitor.lastName}`],
        ["Categoría", CATEGORY_LABELS[competitor.category]],
        ["Reto", week],
        ["Intento", `#${input.attemptNumber}`],
      ],
      cta: {
        label: "Revisar video",
        url: url(`${ROUTES.adminVideos}/${input.submissionId}`),
      },
    }),
  ]);
}

// §31: video aprobado (con resultado registrado) o rechazado
export async function notifyVideoReviewed(input: {
  competitor: Pick<Competitor, "firstName" | "email">;
  weekNumber: number;
  challengeName: string;
  approved: boolean;
  rawTimeMs: number | null;
  penaltyMs: number | null;
  finalTimeMs: number | null;
  notes: string | null;
}) {
  const { competitor } = input;
  const week = `Semana ${input.weekNumber} · ${input.challengeName}`;

  if (input.approved && input.finalTimeMs !== null) {
    await sendEmail(competitor.email, {
      subject: `Tu video de la Semana ${input.weekNumber} fue aprobado`,
      preheader: `Resultado final: ${formatDuration(input.finalTimeMs)}`,
      title: "¡Video aprobado!",
      paragraphs: [
        `Hola, ${competitor.firstName}. Tu video fue revisado y tu resultado ya cuenta para la clasificación.`,
      ],
      details: [
        ["Reto", week],
        [
          "Tiempo realizado",
          formatDuration(input.rawTimeMs ?? input.finalTimeMs),
        ],
        ["Penalización", `+${(input.penaltyMs ?? 0) / 1000} s`],
        ["Resultado final", formatDuration(input.finalTimeMs)],
      ],
      note: input.notes
        ? { label: "Observación", text: input.notes }
        : undefined,
      cta: { label: "Ver clasificación", url: url(ROUTES.ranking) },
    });

    return;
  }

  await sendEmail(competitor.email, {
    subject: `Tu video de la Semana ${input.weekNumber} fue rechazado`,
    preheader: "Revisa el motivo y vuelve a enviarlo.",
    title: "Video rechazado",
    paragraphs: [
      `Hola, ${competitor.firstName}. Tu video de ${week} no pudo ser aprobado.`,
      "Si la semana sigue abierta, puedes grabarlo y enviarlo de nuevo.",
    ],
    note: input.notes ? { label: "Motivo", text: input.notes } : undefined,
    cta: { label: "Subir de nuevo", url: url(ROUTES.videos) },
  });
}

// §14, §31: nuevo reto publicado (a los inscritos aprobados)
export async function notifyChallengePublished(input: {
  userIds: string[];
  weekNumber: number;
  challengeName: string;
  endsAt: Date;
}) {
  if (input.userIds.length === 0) return;

  const recipients = await db
    .select({ email: profiles.email })
    .from(profiles)
    .where(inArray(profiles.id, input.userIds));

  await sendEmail(
    recipients.map((r) => r.email),
    {
      subject: `🔥 Nuevo reto: Semana ${input.weekNumber} · ${input.challengeName}`,
      preheader: `Tienes hasta el ${formatDateTime(input.endsAt)} para subir tu video.`,
      title: `Nuevo reto · Semana ${input.weekNumber}`,
      paragraphs: [
        `Ya está disponible el reto de la semana: ${input.challengeName}.`,
        "Revisa las reglas y el video de ejemplo, realiza el set y sube tu video desde la app.",
      ],
      details: [["Fecha límite", formatDateTime(input.endsAt)]],
      cta: { label: "Ver reto", url: url(ROUTES.dashboard) },
    },
  );
}

// §28: solicitud de video extra (admins)
export async function notifyExtraRequested(input: {
  extraId: string;
  competitor: Competitor;
  tournamentName: string;
  weekNumber: number;
  challengeName: string;
  bestTimeMs: number;
  payment: { amount: number; reference: string; paidOn: string };
}) {
  const { competitor, payment } = input;
  const name = `${competitor.firstName} ${competitor.lastName}`;

  await sendEmail(await adminEmails(), {
    subject: "Nueva solicitud de video extra",
    preheader: `${name} ha solicitado un video extra para la Semana ${input.weekNumber}.`,
    title: "Nueva solicitud de video extra",
    paragraphs: [
      `${name} ha solicitado un video extra para la Semana ${input.weekNumber}.`,
    ],
    details: [
      ["Competidor", name],
      ["Categoría", CATEGORY_LABELS[competitor.category]],
      ["Torneo", input.tournamentName],
      ["Semana", `${input.weekNumber} · ${input.challengeName}`],
      ["Resultado actual", formatDuration(input.bestTimeMs)],
      ["Monto", formatColones(payment.amount)],
      ["Referencia SINPE", payment.reference],
      ["Fecha del pago", payment.paidOn],
    ],
    cta: {
      label: "Revisar solicitud",
      url: url(`${ROUTES.adminExtras}/${input.extraId}`),
    },
  });
}

// §28: video extra aprobado o rechazado (competidor)
export async function notifyExtraReviewed(input: {
  competitor: Pick<Competitor, "firstName" | "email">;
  weekNumber: number;
  approved: boolean;
  reason: string | null;
}) {
  const { competitor } = input;

  if (input.approved) {
    await sendEmail(competitor.email, {
      subject: "Video extra aprobado",
      preheader: "Ya puedes realizar un nuevo intento.",
      title: "Video extra aprobado",
      paragraphs: [
        `Hola, ${competitor.firstName}. Tu pago fue aprobado. Ya puedes realizar un nuevo intento para mejorar tu resultado de la Semana ${input.weekNumber}.`,
      ],
      cta: { label: "Subir nuevo video", url: url(ROUTES.videos) },
    });

    return;
  }

  await sendEmail(competitor.email, {
    subject: "Video extra no aprobado",
    preheader: "No fue posible aprobar tu solicitud.",
    title: "Video extra no aprobado",
    paragraphs: [
      `Hola, ${competitor.firstName}. No fue posible aprobar tu solicitud de video extra.`,
      "Revisa el motivo y, si la semana sigue abierta, puedes volver a enviarla.",
    ],
    note: input.reason ? { label: "Motivo", text: input.reason } : undefined,
    cta: { label: "Volver a intentar", url: url(ROUTES.extraVideo) },
  });
}
