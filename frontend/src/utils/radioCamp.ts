import { RadioCampSummary } from '../types/interfaces';

export type CampStatus = 'live' | 'upcoming' | 'past';

/* « 2026-07-18 » → date locale (new Date('2026-07-18') serait interprété en UTC) */
const parseDay = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
};

export function campStatus(camp: Pick<RadioCampSummary, 'start_date' | 'end_date'>, now = new Date()): CampStatus {
    const start = parseDay(camp.start_date);
    const end   = parseDay(camp.end_date);
    end.setHours(23, 59, 59, 999);   // le dernier jour du camp compte entièrement
    if (now < start) return 'upcoming';
    if (now > end)   return 'past';
    return 'live';
}

export const CAMP_STATUS_LABEL: Record<CampStatus, string> = {
    live:     'En direct',
    upcoming: 'À venir',
    past:     'Terminé',
};

/* « Juil. 2027 » */
export const fmtCampMonth = (iso: string) => {
    const s = parseDay(iso).toLocaleDateString('fr-BE', { month: 'short', year: 'numeric' }).replace('.', '');
    return s.charAt(0).toUpperCase() + s.slice(1);
};
