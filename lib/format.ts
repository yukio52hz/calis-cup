export const TIME_ZONE = "America/Costa_Rica";

// 155000 → "02:35"
export function formatDuration(ms: number) {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// ₡2.500 (punto como separador de miles, como en la especificación)
export function formatColones(amount: number) {
  return `₡${String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

// "domingo 28 sep, 11:59 p. m." en hora de Costa Rica
export function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("es-CR", {
    timeZone: TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("es-CR", {
    timeZone: TIME_ZONE,
    day: "numeric",
    month: "short",
  }).format(date);
}

// "3 días", "5 horas", "20 min"
export function formatTimeLeft(until: Date, now = new Date()) {
  const minutes = Math.max(
    0,
    Math.floor((until.getTime() - now.getTime()) / 60000),
  );

  if (minutes >= 60 * 24) {
    const days = Math.floor(minutes / (60 * 24));

    return `${days} ${days === 1 ? "día" : "días"}`;
  }
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);

    return `${hours} ${hours === 1 ? "hora" : "horas"}`;
  }

  return `${minutes} min`;
}
