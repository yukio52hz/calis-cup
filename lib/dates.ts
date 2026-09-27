// Fechas en hora de Costa Rica (UTC-6 todo el año, sin horario de verano).
const CR_OFFSET_MS = 6 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

// Date → "YYYY-MM-DDTHH:mm" para <input type="datetime-local">, en hora CR
export function toCrDateTimeInput(date: Date) {
  return new Date(date.getTime() - CR_OFFSET_MS).toISOString().slice(0, 16);
}

// "YYYY-MM-DDTHH:mm" (hora CR) → Date
export function fromCrDateTimeInput(value: string) {
  const date = new Date(`${value}:00.000Z`);

  return Number.isNaN(date.getTime())
    ? null
    : new Date(date.getTime() + CR_OFFSET_MS);
}

// "YYYY-MM-DD" (hora CR) → lunes 00:00 CR de esa semana
export function crMondayOf(dateValue: string) {
  const day = new Date(`${dateValue}T00:00:00.000Z`);
  const daysSinceMonday = (day.getUTCDay() + 6) % 7;

  return new Date(day.getTime() - daysSinceMonday * DAY_MS + CR_OFFSET_MS);
}

// Semana n (1..) de lunes 00:00 a domingo 23:59:59, hora CR
export function weekRange(firstMonday: Date, weekNumber: number) {
  const startsAt = new Date(
    firstMonday.getTime() + (weekNumber - 1) * 7 * DAY_MS,
  );

  return { startsAt, endsAt: new Date(startsAt.getTime() + 7 * DAY_MS - 1000) };
}
