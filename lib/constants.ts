export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  authConfirm: "/auth/confirm",
  onboarding: "/onboarding",
  dashboard: "/dashboard",
  profile: "/dashboard/profile",
  enroll: "/dashboard/inscripcion",
  extraVideo: "/dashboard/video-extra",
  ranking: "/dashboard/ranking",
  videos: "/dashboard/videos",
  admin: "/admin",
  adminVideos: "/admin/videos",
  adminRegistrations: "/admin/inscripciones",
  adminTournament: "/admin/torneo",
  adminExtras: "/admin/videos-extra",
} as const;

// Límite por archivo del plan Free de Supabase (también en el bucket "videos")
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

// Comprobantes SINPE: imagen o PDF (también en el bucket "receipts")
export const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;
