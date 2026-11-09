/**
 * Horário do Papo Reto: segunda a sexta, das 12h às 14h (horário de Brasília).
 * Funções puras: recebem "agora" e devolvem se está no ar e quando é o próximo programa.
 */
export const SHOW_SCHEDULE = {
  timeZone: "America/Sao_Paulo",
  /** 1 = segunda … 5 = sexta (getUTCDay da data local). */
  days: [1, 2, 3, 4, 5],
  startMinutes: 12 * 60,
  endMinutes: 14 * 60,
  label: "De segunda a sexta, das 12h às 14h",
} as const;

export const WEEKDAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

/** Data e hora locais (Brasília) de um instante. */
function localParts(now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: SHOW_SCHEDULE.timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const date = new Date(Date.UTC(get("year"), get("month") - 1, get("day")));
  return { weekday: date.getUTCDay(), minutes: get("hour") * 60 + get("minute"), seconds: get("second") };
}

export interface ShowStatus {
  live: boolean;
  /** Dia da semana local de hoje (0 = domingo). */
  weekday: number;
  /** Segundos até o próximo início (0 quando está no ar). */
  secondsToStart: number;
  /** Segundos até acabar (só quando está no ar). */
  secondsToEnd: number;
  /** Dia da semana local do próximo programa. */
  nextWeekday: number;
  /** Quantos dias até o próximo programa (0 = hoje). */
  nextInDays: number;
}

export function getShowStatus(now: Date = new Date()): ShowStatus {
  const { weekday, minutes, seconds } = localParts(now);
  const nowSec = minutes * 60 + seconds;
  const start = SHOW_SCHEDULE.startMinutes * 60;
  const end = SHOW_SCHEDULE.endMinutes * 60;
  const isShowDay = (d: number) => (SHOW_SCHEDULE.days as readonly number[]).includes(d);

  if (isShowDay(weekday) && nowSec >= start && nowSec < end) {
    return { live: true, weekday, secondsToStart: 0, secondsToEnd: end - nowSec, nextWeekday: weekday, nextInDays: 0 };
  }
  for (let add = 0; add <= 7; add++) {
    const day = (weekday + add) % 7;
    if (!isShowDay(day)) continue;
    if (add === 0 && nowSec >= start) continue; // hoje já passou
    const secondsToStart = add * 86_400 + start - nowSec;
    return { live: false, weekday, secondsToStart, secondsToEnd: 0, nextWeekday: day, nextInDays: add };
  }
  return { live: false, weekday, secondsToStart: 0, secondsToEnd: 0, nextWeekday: 1, nextInDays: 0 };
}

const DAY_NAMES = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

/** "Hoje às 12h", "Amanhã às 12h", "Segunda às 12h". */
export function nextShowLabel(status: ShowStatus) {
  if (status.nextInDays === 0) return "Hoje às 12h";
  if (status.nextInDays === 1) return "Amanhã às 12h";
  const name = DAY_NAMES[status.nextWeekday]!;
  return `${name[0]!.toUpperCase()}${name.slice(1)} às 12h`;
}

/** "2d 03h 15min", "03h 15min", "15min 30s". */
export function formatCountdown(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const d = Math.floor(s / 86_400);
  const h = Math.floor((s % 86_400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (d > 0) return `${d}d ${pad(h)}h ${pad(m)}min`;
  if (h > 0) return `${pad(h)}h ${pad(m)}min`;
  return `${m}min ${pad(sec)}s`;
}
