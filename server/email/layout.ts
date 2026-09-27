import "server-only";

export type EmailContent = {
  subject: string;
  // Texto corto que los clientes de correo muestran junto al asunto
  preheader: string;
  title: string;
  paragraphs: string[];
  // Tabla de datos (ej. monto, referencia, fecha)
  details?: [label: string, value: string][];
  // Recuadro destacado (ej. motivo del rechazo)
  note?: { label: string; text: string };
  cta?: { label: string; url: string };
};

function escape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const RED = "#e11d2e";

// HTML con tablas y estilos inline: compatible con Gmail, Outlook y Apple Mail
export function renderEmail(content: EmailContent) {
  const paragraphs = content.paragraphs
    .map(
      (p) =>
        `<p style="margin:0 0 16px;font-size:16px;line-height:24px;color:#1f2430">${escape(p)}</p>`,
    )
    .join("");

  const details = content.details?.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;border-collapse:collapse;background:#f5f6f8;border-radius:8px">${content.details
        .map(
          ([label, value]) =>
            `<tr><td style="padding:10px 14px;font-size:14px;color:#6b7280">${escape(label)}</td><td style="padding:10px 14px;font-size:14px;font-weight:bold;color:#1f2430;text-align:right">${escape(value)}</td></tr>`,
        )
        .join("")}</table>`
    : "";

  const note = content.note
    ? `<div style="margin:8px 0 20px;padding:12px 14px;border-left:4px solid ${RED};background:#fdf2f3;font-size:15px;line-height:22px;color:#1f2430"><strong>${escape(content.note.label)}:</strong> ${escape(content.note.text)}</div>`
    : "";

  const cta = content.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 8px"><tr><td style="border-radius:10px;background:${RED}"><a href="${escape(content.cta.url)}" style="display:inline-block;padding:14px 24px;font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none">${escape(content.cta.label)}</a></td></tr></table>`
    : "";

  const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(content.subject)}</title></head>
<body style="margin:0;padding:0;background:#eef0f3;font-family:Helvetica,Arial,sans-serif">
<span style="display:none;max-height:0;overflow:hidden">${escape(content.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef0f3;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden">
<tr><td style="background:#11141c;padding:20px 28px">
<div style="font-size:10px;letter-spacing:3px;color:#9ca3af;font-weight:bold">COSTA RICA</div>
<div style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px">CALIS CUP</div>
</td></tr>
<tr><td style="height:4px;background:${RED}"></td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 16px;font-size:22px;line-height:28px;color:#11141c">${escape(content.title)}</h1>
${paragraphs}${details}${note}${cta}
</td></tr>
<tr><td style="padding:16px 28px;background:#f5f6f8;font-size:12px;line-height:18px;color:#6b7280">
Torneo online de calistenia · Femenino y masculino<br>Recibes este correo porque participas en Costa Rica Calis Cup.
</td></tr>
</table></td></tr></table></body></html>`;

  // Versión en texto plano (mejora la entrega y la accesibilidad)
  const text = [
    content.title,
    "",
    ...content.paragraphs,
    ...(content.details ?? []).map(([label, value]) => `${label}: ${value}`),
    ...(content.note ? [`${content.note.label}: ${content.note.text}`] : []),
    ...(content.cta ? ["", `${content.cta.label}: ${content.cta.url}`] : []),
  ].join("\n");

  return { html, text };
}
