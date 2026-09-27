export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Calis Cup",
  description:
    "El primer torneo online de calistenia de Costa Rica. 4 semanas · 4 retos · 1 clasificación.",
  // Anclas de la landing; el prefijo "/" permite usarlas desde cualquier página
  navItems: [
    { label: "Cómo funciona", href: "/#como-funciona" },
    { label: "El torneo", href: "/#torneo" },
    { label: "Inscripción", href: "/#inscripcion" },
    { label: "Preguntas", href: "/#preguntas" },
  ],
};

// Datos del torneo actual mostrados en la landing (§8, §22, §25).
// TODO: leerlos de la tabla tournaments cuando exista (Fase 2).
export const tournamentInfo = {
  registrationFee: 2500,
  extraVideoFee: 500,
  weeks: 4,
  challenges: 4,
  categories: 2,
  rankings: 1,
  points: [100, 95, 90, 85, 80],
};
