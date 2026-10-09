import { EventData } from '../types/interfaces';

/* Sections de l'agenda (slug = slug Django) */
export const SECTIONS = [
    { name: 'Baladins',   slug: 'baladins',   color: '#00A0DD' },
    { name: 'Lutins',     slug: 'lutins',     color: '#CC0739' },
    { name: 'Louveteaux', slug: 'louveteaux', color: '#186E54' },
    { name: 'Guides',     slug: 'guides',     color: '#1D325A' },
    { name: 'Éclaireurs', slug: 'eclaireurs', color: '#015AA9' },
    { name: 'Pionniers',  slug: 'pionniers',  color: '#DA1F29' },
    { name: 'Clan',       slug: 'clan',       color: '#FEB800' },
    { name: 'Unité',      slug: 'unite',      color: '#022864' },
];

export type AgendaSection = typeof SECTIONS[number];

export const getSectionInfo = (slug: string) =>
    SECTIONS.find(s => s.slug === slug) ?? { name: slug, slug, color: '#022864' };

export const isSectionSlug = (slug: string | null): slug is string =>
    !!slug && SECTIONS.some(s => s.slug === slug);

const CALENDAR_NAME = '94ème Saint-Augustin';

/* URL absolue d'un endpoint de l'API (VITE_API_URL peut être relatif) */
const apiUrl = (path: string) =>
    new URL(`${import.meta.env.VITE_API_URL}${path}`, window.location.origin);

/* ── Abonnement (flux iCal de plusieurs sections) ── */

/** Toutes les sections → pas de filtre (inclut les futures sections) */
export const buildFeedUrl = (slugs: string[]) => {
    const url = apiUrl('/events/calendar.ics');
    if (slugs.length < SECTIONS.length) url.search = `?sections=${slugs.join(',')}`;
    return url.toString();
};

export const subscriptionLinks = (feedUrl: string) => {
    const webcal = feedUrl.replace(/^https?:/, 'webcal:');
    return {
        google:  `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcal)}`,
        apple:   webcal,
        outlook: `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(feedUrl)}`
            + `&name=${encodeURIComponent(CALENDAR_NAME)}`,
    };
};

/* ── Un seul événement ── */

const toGoogleDate = (iso: string) =>
    new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

export const eventLinks = (ev: EventData) => {
    const section = getSectionInfo(ev.section);
    const title   = `[${section.name}] ${ev.title}`;
    const details = [ev.description, `Section : ${section.name}`].filter(Boolean).join('\n\n');
    const location = ev.location ?? '';

    const google = new URL('https://calendar.google.com/calendar/render');
    google.search = new URLSearchParams({
        action: 'TEMPLATE',
        text: title,
        dates: `${toGoogleDate(ev.start_time)}/${toGoogleDate(ev.end_time)}`,
        details,
        location,
    }).toString();

    const outlook = new URL('https://outlook.live.com/calendar/0/deeplink/compose');
    outlook.search = new URLSearchParams({
        path: '/calendar/action/compose',
        rru: 'addevent',
        subject: title,
        startdt: new Date(ev.start_time).toISOString(),
        enddt: new Date(ev.end_time).toISOString(),
        body: details,
        location,
    }).toString();

    return {
        google:  google.toString(),
        apple:   apiUrl(`/events/${ev.id}/calendar.ics`).toString(),
        outlook: outlook.toString(),
    };
};

export const mapsUrl = (location: string) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
