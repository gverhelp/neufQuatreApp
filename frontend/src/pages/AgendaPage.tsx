import React, { useEffect, useState, useMemo, useRef, useLayoutEffect } from 'react';
import axios from 'axios';
import { Container } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import {
    BsCalendar3, BsGeoAltFill, BsClock, BsClockFill,
    BsFileArrowDownFill, BsFlag, BsFlagFill,
} from 'react-icons/bs';

import '../styles/AgendaPage.css';
import { EventData, AgendaDocument } from '../types/interfaces';

/* ════════════════════════════════════════════════════════
   CONSTANTS
════════════════════════════════════════════════════════ */

const SECTIONS = [
    { name: 'Baladins',   slug: 'baladins',   color: '#00A0DD' },
    { name: 'Lutins',     slug: 'lutins',     color: '#CC0739' },
    { name: 'Louveteaux', slug: 'louveteaux', color: '#186E54' },
    { name: 'Guides',     slug: 'guides',     color: '#1D325A' },
    { name: 'Éclaireurs', slug: 'eclaireurs', color: '#015AA9' },
    { name: 'Pionniers',  slug: 'pionniers',  color: '#DA1F29' },
    { name: 'Clan',       slug: 'clan',       color: '#FEB800' },
    { name: 'Unité',      slug: 'unite',      color: '#022864' },
];

const getSectionInfo = (slug: string) =>
    SECTIONS.find(s => s.slug === slug) ?? { name: slug, color: '#022864' };

/* ════════════════════════════════════════════════════════
   UTILITIES
════════════════════════════════════════════════════════ */

function fmtShort(iso: string) {
    return new Date(iso).toLocaleDateString('fr-BE', { day: 'numeric', month: 'short' })
        .replace('.', '');
}

function fmtDay(iso: string)   { return new Date(iso).getDate(); }
function fmtDayName(iso: string) {
    const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    return DAYS[new Date(iso).getDay()];
}
function fmtMonth(iso: string) {
    return new Date(iso).toLocaleDateString('fr-BE', { month: 'short' }).replace('.', '');
}

function fmtTimeRange(start: string, end: string) {
    const s = new Date(start);
    const e = new Date(end);
    const sameDay = s.toDateString() === e.toDateString();
    const time: Intl.DateTimeFormatOptions  = { hour: '2-digit', minute: '2-digit' };
    const short: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    const long: Intl.DateTimeFormatOptions  = { day: 'numeric', month: 'long', year: 'numeric' };
    if (sameDay) return `${s.toLocaleTimeString('fr-BE', time)} – ${e.toLocaleTimeString('fr-BE', time)}`;
    return `Du ${s.toLocaleDateString('fr-BE', short)} au ${e.toLocaleDateString('fr-BE', long)}`;
}

function getMonthKey(iso: string) {
    const d = new Date(iso);
    return `${d.getFullYear()}-${d.getMonth()}`;
}

function getMonthLabel(iso: string) {
    return new Date(iso)
        .toLocaleDateString('fr-BE', { month: 'long', year: 'numeric' })
        .replace(/^\w/, c => c.toUpperCase());
}

/* ════════════════════════════════════════════════════════
   ANIMATION HELPERS
════════════════════════════════════════════════════════ */

const fadeUp = (delay = 0) => ({
    initial:     { opacity: 0, y: 26 },
    whileInView: { opacity: 1, y: 0 },
    transition:  { duration: 0.56, ease: 'easeOut' as const, delay },
    viewport:    { once: true },
});

const stagger = {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.1 } },
};

const staggerItem = {
    hidden:  { opacity: 0, y: 22 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.48, ease: [0.25, 0.1, 0.25, 1] as const } },
};

/* ════════════════════════════════════════════════════════
   PAGE HERO
════════════════════════════════════════════════════════ */

interface HeroProps { events: EventData[]; loading: boolean; }

const PageHero: React.FC<HeroProps> = ({ events, loading }) => {
    const now = new Date();
    const upcoming = events.filter(e => new Date(e.start_time) >= now);
    const nextEvent = upcoming.sort((a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    )[0];

    return (
        <section className="ap-hero">

            <Container className="ap-hero-container">
                <div className="ap-hero-inner">

                    <motion.h1
                        className="ap-hero-title"
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.28, duration: 0.6, ease: 'easeOut' }}
                    >
                        Agenda
                    </motion.h1>

                    <motion.div
                        className="ap-hero-rule"
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        transition={{ delay: 0.55, duration: 0.45, ease: 'easeOut' }}
                    />

                    <motion.p
                        className="ap-hero-sub"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.5, ease: 'easeOut' }}
                    >
                        Retrouve ici tous les événements à venir pour chaque section de l'unité.
                    </motion.p>

                    {!loading && events.length > 0 && (
                        <motion.div
                            className="ap-hero-stats"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9, duration: 0.5, ease: 'easeOut' }}
                        >
                            <div className="ap-hstat">
                                <span className="ap-hstat-num">{upcoming.length}</span>
                                <span className="ap-hstat-label">Événements à venir</span>
                            </div>
                            <div className="ap-hstat-sep" />
                            {nextEvent && (
                                <>
                                    {/* <div className="ap-hstat-sep" /> */}
                                    <div className="ap-hstat">
                                        <span className="ap-hstat-num">{fmtShort(nextEvent.start_time)}</span>
                                        <span className="ap-hstat-label">Prochain événement</span>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}
                </div>

                {/* Decorative calendar watermark */}
                <div className="ap-hero-deco" aria-hidden>
                    <BsCalendar3 size={220} />
                </div>
            </Container>
        </section>
    );
};

/* ════════════════════════════════════════════════════════
   HIGHLIGHTS SECTION
════════════════════════════════════════════════════════ */

const HighlightsSection: React.FC<{ events: EventData[] }> = ({ events }) => {
    const highlights = events.filter(e => e.highlight);
    if (!highlights.length) return null;

    return (
        <section className="ap-hl-section">
            <Container>
                <div className="ap-hl-header">
                    <motion.h2 className="ap-hl-heading" {...fadeUp(0.08)}>
                        Événements phares
                    </motion.h2>
                    <motion.div className="ap-hl-rule" {...fadeUp(0.14)} />
                </div>

                <motion.div
                    className="ap-hl-grid"
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                >
                    {(() => {
                        const now = new Date();
                        return highlights.map((ev, i) => {
                        const section = getSectionInfo(ev.section);
                        const isPast = new Date(ev.end_time) < now;

                        return (
                            <motion.div
                                key={ev.id}
                                className={`ap-hl-card${isPast ? ' ap-hl-card-past' : ''}`}
                                style={{ '--hl-color': section.color, borderLeftColor: section.color, opacity: isPast ? 0.48 : 1 } as React.CSSProperties}
                                variants={staggerItem}
                                animate={!isPast ? {
                                    boxShadow: [
                                        '0 4px 18px rgba(2,40,100,0.07)',
                                        '0 8px 28px rgba(2,40,100,0.14)',
                                        '0 4px 18px rgba(2,40,100,0.07)',
                                    ],
                                } : {}}
                                transition={!isPast ? {
                                    duration: 3.2,
                                    ease: 'easeInOut',
                                    repeat: Infinity,
                                    delay: i * 0.5,
                                } : {}}
                            >
                                {/* Date chip */}
                                <div className="ap-hl-date-chip" style={{ background: section.color }}>
                                    <span className="ap-hl-dc-dayname">{fmtDayName(ev.start_time)}</span>
                                    <span className="ap-hl-dc-day">{fmtDay(ev.start_time)}</span>
                                    <span className="ap-hl-dc-month">{fmtMonth(ev.start_time)}</span>
                                </div>

                                {/* Body */}
                                <div className="ap-hl-body">
                                    <div className="ap-hl-body-top">
                                        <h3 className="ap-hl-title">{ev.title}</h3>
                                        <div className="ap-hl-card-badges">
                                            <span className="ap-hl-section-pill"
                                                style={{ background: section.color }}>
                                                {section.name}
                                            </span>
                                            {isPast && <span className="ap-tl-past-badge">Passé</span>}
                                        </div>
                                    </div>

                                    <div className="ap-hl-meta">
                                        <span className="ap-hl-meta-item">
                                            <BsClock size={11} />
                                            {fmtTimeRange(ev.start_time, ev.end_time)}
                                        </span>
                                        {ev.location && (
                                            <span className="ap-hl-meta-item">
                                                <BsGeoAltFill size={11} />
                                                {ev.location}
                                            </span>
                                        )}
                                    </div>

                                    {ev.description && (
                                        <p className="ap-hl-desc">{ev.description}</p>
                                    )}
                                </div>
                            </motion.div>
                        );
                    });
                    })()}
                </motion.div>
            </Container>
        </section>
    );
};

/* ════════════════════════════════════════════════════════
   FILTER PILLS — shared component
════════════════════════════════════════════════════════ */

interface FilterPillsProps {
    sections: typeof SECTIONS;
    active: string | null;
    onSelect: (slug: string | null) => void;
    light?: boolean;
}

const FilterPills: React.FC<FilterPillsProps> = ({ sections, active, onSelect, light }) => (
    <motion.div
        className={`ap-filters${light ? ' ap-filters-light' : ''}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38 }}
    >
        <button
            className={`ap-filter-btn${active === null ? ' ap-filter-active' : ''}`}
            style={{ '--fc': '#022864' } as React.CSSProperties}
            onClick={() => onSelect(null)}
        >
            Toutes
        </button>
        {sections.map(s => (
            <button
                key={s.slug}
                className={`ap-filter-btn${active === s.slug ? ' ap-filter-active' : ''}`}
                style={{ '--fc': s.color } as React.CSSProperties}
                onClick={() => onSelect(active === s.slug ? null : s.slug)}
            >
                {s.name}
            </button>
        ))}
    </motion.div>
);

/* ════════════════════════════════════════════════════════
   CALENDAR SECTION
════════════════════════════════════════════════════════ */

const CalendarSection: React.FC<{ events: EventData[] }> = ({ events }) => {
    const baseURL = import.meta.env.VITE_API_URL;
    const [agendaDoc, setAgendaDoc] = useState<AgendaDocument | null>(null);
    const [activeSection, setActiveSection] = useState<string | null>(null);

    const activeSlugs = new Set(events.map(e => e.section));
    const availableSections = SECTIONS.filter(s => activeSlugs.has(s.slug));
    const filteredEvents = activeSection
        ? events.filter(e => e.section === activeSection)
        : events;

    const now = new Date();
    const upcomingEvents = events
        .filter(e => new Date(e.end_time) >= now)
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
        .slice(0, 5);

    useEffect(() => {
        axios.get(`${baseURL}/agenda-document/`).then(r => {
            if (r.data[0]) setAgendaDoc(r.data[0]);
        }).catch(console.error);
    }, []);

    return (
        <section className="ap-cal-section">
            <Container>
                <div className="ap-sec-header">
                    <motion.h2 className="ap-sec-heading" {...fadeUp(0.08)}>Calendrier</motion.h2>
                    <motion.div className="ap-sec-rule" {...fadeUp(0.14)} />
                </div>

                {availableSections.length > 0 && (
                    <div className="d-none d-md-block">
                        <FilterPills
                            sections={availableSections}
                            active={activeSection}
                            onSelect={setActiveSection}
                        />
                    </div>
                )}

                <div className="ap-cal-layout">
                    {/* FullCalendar — hidden on mobile */}
                    <motion.div
                        className="ap-cal-main d-none d-md-block"
                        initial={{ x: -30, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.55, delay: 0.1 }}
                        viewport={{ once: true }}
                    >
                        <div className="ap-cal-card">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeSection ?? 'all'}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <FullCalendar
                                        plugins={[dayGridPlugin, interactionPlugin, bootstrap5Plugin]}
                                        initialView="dayGridMonth"
                                        themeSystem="bootstrap5"
                                        events={filteredEvents.map(ev => ({
                                            id: ev.id.toString(),
                                            title: ev.title,
                                            start: ev.start_time,
                                            end: ev.end_time,
                                            color: getSectionInfo(ev.section).color,
                                        }))}
                                        locale="fr"
                                        height="auto"
                                        dayMaxEventRows
                                        headerToolbar={{
                                            left: 'today',
                                            center: 'title',
                                            right: 'prevYear,prev,next,nextYear',
                                        }}
                                        buttonText={{ today: "Aujourd'hui" }}
                                        firstDay={1}
                                        eventClassNames="p-1"
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Sidebar */}
                    <div className="ap-cal-sidebar">
                        {/* Legend */}
                        <motion.div
                            className="ap-side-card d-none d-md-block"
                            initial={{ x: 30, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.55, delay: 0.18 }}
                            viewport={{ once: true }}
                        >
                            <div className="ap-side-title">
                                <BsCalendar3 size={14} />
                                Légende
                            </div>
                            <div className="ap-legend-wrap">
                                {SECTIONS.map(s => (
                                    <span
                                        key={s.slug}
                                        className="ap-legend-pill"
                                        style={{
                                            background: s.color,
                                            opacity: activeSlugs.has(s.slug) ? 1 : 0.28,
                                        }}
                                    >
                                        <span className="ap-legend-dot" />
                                        {s.name}
                                    </span>
                                ))}
                            </div>
                        </motion.div>

                        {/* Upcoming */}
                        {upcomingEvents.length > 0 && (
                            <motion.div
                                className="ap-side-card"
                                initial={{ x: 30, opacity: 0 }}
                                whileInView={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.55, delay: 0.28 }}
                                viewport={{ once: true }}
                            >
                                <div className="ap-side-title">
                                    <BsClockFill size={13} />
                                    Prochains événements
                                </div>
                                <div className="ap-upcoming-list">
                                    {upcomingEvents.map(ev => {
                                        const s = getSectionInfo(ev.section);
                                        const sameDay = new Date(ev.start_time).toDateString() === new Date(ev.end_time).toDateString();
                                        return (
                                            <div
                                                key={ev.id}
                                                className="ap-upcoming-item"
                                                style={{ '--uc': s.color } as React.CSSProperties}
                                            >
                                                <div className="ap-upcoming-date">
                                                    <span className="ap-upcoming-day">
                                                        {new Date(ev.start_time).toLocaleDateString('fr-BE', { day: '2-digit' })}
                                                    </span>
                                                    <span className="ap-upcoming-month">
                                                        {new Date(ev.start_time).toLocaleDateString('fr-BE', { month: 'short' }).replace('.', '')}
                                                    </span>
                                                </div>
                                                <div className="ap-upcoming-info">
                                                    <div className="ap-upcoming-name">{ev.title}</div>
                                                    <div className="ap-upcoming-meta-row">
                                                        {sameDay && (
                                                            <span className="ap-upcoming-meta">
                                                                <BsClockFill size={9} />
                                                                {new Date(ev.start_time).toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        )}
                                                        {ev.location && (
                                                            <span className="ap-upcoming-meta">
                                                                <BsGeoAltFill size={9} />
                                                                {ev.location}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="ap-upcoming-section">{s.name}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {/* Download */}
                        {agendaDoc && (
                            <motion.div
                                className="ap-side-card"
                                initial={{ y: 20, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.38 }}
                                viewport={{ once: true }}
                            >
                                <div className="ap-side-title">
                                    <BsFileArrowDownFill size={15} />
                                    {agendaDoc.title}
                                </div>
                                {agendaDoc.description && (
                                    <p className="ap-download-desc">{agendaDoc.description}</p>
                                )}
                                <a
                                    href={agendaDoc.file}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ap-download-btn"
                                >
                                    <BsFileArrowDownFill size={14} />
                                    Télécharger le PDF
                                </a>
                            </motion.div>
                        )}
                    </div>
                </div>
            </Container>
        </section>
    );
};

/* ════════════════════════════════════════════════════════
   TIMELINE SECTION
════════════════════════════════════════════════════════ */

const TimelineSection: React.FC<{ events: EventData[] }> = ({ events }) => {
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const now = new Date();

    const activeSlugs = new Set(events.map(e => e.section));
    const availableSections = SECTIONS.filter(s => activeSlugs.has(s.slug));
    const activeColor = activeSection ? getSectionInfo(activeSection).color : '#022864';

    const filteredEvents = events
        .filter(e => activeSection === null || e.section === activeSection)
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

    /* ── Refs & measurements for the SVG trail ── */
    const wrapRef  = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
    const pathRef  = useRef<SVGPathElement>(null);

    const [points, setPoints] = useState<Array<{ x: number; y: number }>>([]);
    const [trail,  setTrail]  = useState<{ w: number; h: number; mobile: boolean }>({ w: 0, h: 0, mobile: false });
    const [pathLen, setPathLen] = useState(0);
    const [hereXY,  setHereXY]  = useState<{ x: number; y: number } | null>(null);

    /* Months for the side nav */
    const months = useMemo(() => {
        const seen = new Set<string>();
        const out: { key: string; label: string; idx: number }[] = [];
        filteredEvents.forEach((ev, i) => {
            const k = getMonthKey(ev.start_time);
            if (!seen.has(k)) {
                seen.add(k);
                out.push({ key: k, label: getMonthLabel(ev.start_time), idx: i });
            }
        });
        return out;
    }, [filteredEvents]);

    /* Measure stage positions along a sinusoidal trail */
    useLayoutEffect(() => {
        const measure = () => {
            const wrap = wrapRef.current;
            if (!wrap) return;
            const wRect  = wrap.getBoundingClientRect();
            const w      = wRect.width;
            const h      = wrap.offsetHeight;
            const mobile = w < 700;
            const centerX = mobile ? 22 : w / 2;
            const amp     = mobile ? 0 : Math.min(w * 0.075, 60);

            const pts: Array<{ x: number; y: number }> = [];
            for (let i = 0; i < filteredEvents.length; i++) {
                const el = itemRefs.current[i];
                if (!el) continue;
                const r = el.getBoundingClientRect();
                const y = r.top - wRect.top + r.height / 2;
                const dir = i % 2 === 0 ? -1 : 1;
                pts.push({ x: centerX + dir * amp, y });
            }
            setPoints(pts);
            setTrail({ w, h, mobile });
        };

        measure();
        const ro = new ResizeObserver(measure);
        if (wrapRef.current) ro.observe(wrapRef.current);
        const t1 = setTimeout(measure, 250);
        const t2 = setTimeout(measure, 700);
        return () => { ro.disconnect(); clearTimeout(t1); clearTimeout(t2); };
    }, [filteredEvents.length, activeSection]);

    /* Build the SVG path string */
    const pathD = useMemo(() => {
        if (points.length === 0) return '';
        const parts: string[] = [];
        parts.push(`M ${points[0].x} 0`);
        parts.push(`L ${points[0].x} ${points[0].y}`);
        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const my = (prev.y + curr.y) / 2;
            parts.push(`C ${prev.x} ${my}, ${curr.x} ${my}, ${curr.x} ${curr.y}`);
        }
        const last = points[points.length - 1];
        parts.push(`L ${last.x} ${trail.h}`);
        return parts.join(' ');
    }, [points, trail.h]);

    /* Total path length */
    useLayoutEffect(() => {
        if (pathRef.current && pathD) {
            try { setPathLen(pathRef.current.getTotalLength()); } catch {}
        }
    }, [pathD]);

    /* Length of the path corresponding to the past portion */
    const pastLen = useMemo(() => {
        if (!pathRef.current || pathLen === 0 || points.length === 0) return 0;
        let pastEnd = -1;
        for (let i = 0; i < filteredEvents.length; i++) {
            if (new Date(filteredEvents[i].end_time) < now) pastEnd = i;
            else break;
        }
        if (pastEnd < 0 || !points[pastEnd]) return 0;
        const targetY = points[pastEnd].y;
        let lo = 0, hi = pathLen;
        for (let i = 0; i < 24; i++) {
            const mid = (lo + hi) / 2;
            const pt = pathRef.current.getPointAtLength(mid);
            if (pt.y < targetY) lo = mid; else hi = mid;
        }
        return lo;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathLen, points, filteredEvents]);

    /* "Vous êtes ici" marker — follows scroll along the path */
    useEffect(() => {
        if (pathLen === 0) return;
        let raf = 0;
        const onScroll = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                const wrap = wrapRef.current;
                const path = pathRef.current;
                if (!wrap || !path) return;
                const r = wrap.getBoundingClientRect();
                const viewMid = window.innerHeight * 0.5;
                const cur = viewMid - r.top;
                const p = Math.max(0, Math.min(1, cur / r.height));
                try {
                    const pt = path.getPointAtLength(p * pathLen);
                    setHereXY({ x: pt.x, y: pt.y });
                } catch {}
            });
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
    }, [pathLen]);

    /* "Aujourd'hui" boundary between past and future events */
    const todayY = useMemo(() => {
        if (points.length === 0) return null;
        let firstFuture = -1;
        for (let i = 0; i < filteredEvents.length; i++) {
            if (new Date(filteredEvents[i].end_time) >= now) { firstFuture = i; break; }
        }
        if (firstFuture <= 0) return null;
        if (!points[firstFuture - 1] || !points[firstFuture]) return null;
        return (points[firstFuture - 1].y + points[firstFuture].y) / 2;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [points, filteredEvents]);

    return (
        <section className="ap-tl-section">
            <Container>
                <div className="ap-sec-header">
                    <motion.h2 className="ap-sec-heading" {...fadeUp(0.08)}>Tous les événements</motion.h2>
                    <motion.div className="ap-sec-rule" {...fadeUp(0.14)} />
                </div>

                {events.length === 0 ? (
                    <p className="ap-tl-empty">Aucun événement pour le moment.</p>
                ) : (
                    <>
                        <FilterPills
                            sections={availableSections}
                            active={activeSection}
                            onSelect={setActiveSection}
                            light
                        />

                        <div className="ap-tl-layout">
                            <div
                                ref={wrapRef}
                                className={`ap-tl-wrap${trail.mobile ? ' ap-tl-wrap-mobile' : ''}`}
                                style={{ '--tl-color': activeColor } as React.CSSProperties}
                            >
                                {/* SVG trail */}
                                <svg
                                    className="ap-tl-svg"
                                    width={trail.w || 0}
                                    height={trail.h || 0}
                                    viewBox={`0 0 ${trail.w || 1} ${trail.h || 1}`}
                                    aria-hidden
                                >
                                    {pathD && (
                                        <>
                                            {/* Future = dashed */}
                                            <path
                                                d={pathD}
                                                fill="none"
                                                stroke={activeColor}
                                                strokeOpacity="0.32"
                                                strokeWidth="2.5"
                                                strokeDasharray="2 9"
                                                strokeLinecap="round"
                                            />
                                            {/* Past = solid overlay */}
                                            {pastLen > 0 && (
                                                <path
                                                    d={pathD}
                                                    fill="none"
                                                    stroke={activeColor}
                                                    strokeOpacity="0.85"
                                                    strokeWidth="3"
                                                    strokeLinecap="round"
                                                    strokeDasharray={`${pastLen} ${Math.max(pathLen - pastLen + 1, 1)}`}
                                                />
                                            )}
                                            {/* Hidden ref path used for getPointAtLength */}
                                            <path ref={pathRef} d={pathD} fill="none" stroke="none" />
                                        </>
                                    )}

                                    {/* "Vous êtes ici" marker */}
                                    {hereXY && (
                                        <g transform={`translate(${hereXY.x}, ${hereXY.y})`}>
                                            <circle r="14" fill={activeColor} fillOpacity="0.16" className="ap-tl-here-pulse" />
                                            <circle r="7" fill="white" stroke={activeColor} strokeWidth="2.5" />
                                            <circle r="3" fill={activeColor} />
                                        </g>
                                    )}
                                </svg>

                                {/* "Aujourd'hui" marker */}
                                {todayY !== null && (
                                    <div
                                        className="ap-tl-today"
                                        style={{ top: todayY, '--tl-color': activeColor } as React.CSSProperties}
                                    >
                                        <span className="ap-tl-today-line" />
                                        <span className="ap-tl-today-pill">Aujourd'hui</span>
                                        <span className="ap-tl-today-line" />
                                    </div>
                                )}

                                <AnimatePresence mode="wait">
                                    {filteredEvents.length === 0 ? (
                                        <motion.p
                                            key="empty"
                                            className="ap-tl-empty"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            Aucun événement pour cette section.
                                        </motion.p>
                                    ) : (
                                        <motion.div
                                            key={activeSection ?? 'all'}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.22 }}
                                        >
                                            {(() => {
                                                let lastMonthKey = '';
                                                let idx = 0;
                                                return filteredEvents.map(ev => {
                                                    const monthKey = getMonthKey(ev.start_time);
                                                    const showSep = monthKey !== lastMonthKey;
                                                    if (showSep) lastMonthKey = monthKey;

                                                    const isPast  = new Date(ev.end_time) < now;
                                                    const section = getSectionInfo(ev.section);
                                                    const isLeft  = idx % 2 === 0;
                                                    const myIdx   = idx;
                                                    idx++;

                                                    const card = (
                                                        <div
                                                            className={`ap-tl-card${isLeft ? ' ap-tl-card-left' : ' ap-tl-card-right'}`}
                                                            style={{ '--cc': section.color } as React.CSSProperties}
                                                        >
                                                            <div className="ap-tl-card-head">
                                                                <div className="ap-tl-card-date"
                                                                    style={{ '--cc': section.color } as React.CSSProperties}>
                                                                    <span className="ap-tl-card-dayname">{fmtDayName(ev.start_time)}</span>
                                                                    <span className="ap-tl-card-day">{fmtDay(ev.start_time)}</span>
                                                                    <span className="ap-tl-card-mon">{fmtMonth(ev.start_time)}</span>
                                                                </div>

                                                                <div className="ap-tl-card-main">
                                                                    <div className="ap-tl-card-title" style={{ color: section.color }}>
                                                                        {ev.title}
                                                                    </div>
                                                                    <div className="ap-tl-card-meta">
                                                                        <span className="ap-tl-meta-item">
                                                                            <BsClock size={11} />
                                                                            {fmtTimeRange(ev.start_time, ev.end_time)}
                                                                        </span>
                                                                        {ev.location && (
                                                                            <span className="ap-tl-meta-item">
                                                                                <BsGeoAltFill size={11} />
                                                                                {ev.location}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="ap-tl-card-badges">
                                                                    {activeSection === null && (
                                                                        <span className="ap-tl-section-badge" style={{ background: section.color }}>
                                                                            {section.name}
                                                                        </span>
                                                                    )}
                                                                    {isPast && (<span className="ap-tl-past-badge">Passé</span>)}
                                                                </div>
                                                            </div>

                                                            {ev.description && (
                                                                <p className="ap-tl-card-desc">{ev.description}</p>
                                                            )}
                                                        </div>
                                                    );

                                                    return (
                                                        <React.Fragment key={ev.id}>
                                                            {showSep && (
                                                                <motion.div
                                                                    className="ap-tl-month-sep"
                                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                                    whileInView={{ opacity: 1, scale: 1 }}
                                                                    viewport={{ once: true, amount: 0.5 }}
                                                                    transition={{ duration: 0.32, ease: 'easeOut' }}
                                                                >
                                                                    <span className="ap-tl-month-pill"
                                                                        style={{ '--tl-color': activeColor } as React.CSSProperties}>
                                                                        {getMonthLabel(ev.start_time)}
                                                                    </span>
                                                                </motion.div>
                                                            )}
                                                            <motion.div
                                                                ref={(el: HTMLDivElement | null) => { itemRefs.current[myIdx] = el; }}
                                                                className={`ap-tl-item${isPast ? ' ap-tl-item-past' : ''}`}
                                                                initial={{ x: isLeft ? -22 : 22, opacity: 0 }}
                                                                whileInView={{ x: 0, opacity: isPast ? 0.55 : 1 }}
                                                                viewport={{ once: true, amount: 0.12 }}
                                                                transition={{ duration: 0.42, ease: 'easeOut' }}
                                                            >
                                                                <div className="ap-tl-slot ap-tl-slot-left">
                                                                    {isLeft && card}
                                                                </div>
                                                                <div className="ap-tl-slot ap-tl-slot-right">
                                                                    {!isLeft && card}
                                                                </div>
                                                            </motion.div>
                                                        </React.Fragment>
                                                    );
                                                });
                                            })()}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Stage markers — absolutely positioned along the curve */}
                                {points.map((p, i) => {
                                    const ev = filteredEvents[i];
                                    if (!ev) return null;
                                    const section = getSectionInfo(ev.section);
                                    const isPast = new Date(ev.end_time) < now;
                                    return (
                                        <div
                                            key={`stage-${ev.id}`}
                                            className={`ap-tl-stage${isPast ? ' ap-tl-stage-past' : ''}`}
                                            style={{
                                                left: p.x,
                                                top: p.y,
                                                '--cc': section.color,
                                            } as React.CSSProperties}
                                            title={ev.title}
                                        >
                                            {isPast ? <BsFlagFill size={11} /> : <BsFlag size={11} />}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Sticky side nav by month */}
                            {months.length > 1 && (
                                <nav className="ap-tl-nav d-none d-lg-flex">
                                    <span className="ap-tl-nav-title">Aller à</span>
                                    {months.map(m => (
                                        <button
                                            key={m.key}
                                            className="ap-tl-nav-btn"
                                            style={{ '--tl-color': activeColor } as React.CSSProperties}
                                            onClick={() => {
                                                const target = itemRefs.current[m.idx];
                                                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            }}
                                        >
                                            <span className="ap-tl-nav-dot" />
                                            {m.label}
                                        </button>
                                    ))}
                                </nav>
                            )}
                        </div>
                    </>
                )}
            </Container>
        </section>
    );
};

/* ════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════ */

const AgendaPage: React.FC = () => {
    const baseURL = import.meta.env.VITE_API_URL;
    const [events,  setEvents]  = useState<EventData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get<EventData[]>(`${baseURL}/events/`)
            .then(r => setEvents(r.data))
            .catch(e => console.error('Erreur chargement événements:', e))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="p-0">
            <PageHero events={events} loading={loading} />
            <HighlightsSection events={events} />
            <CalendarSection events={events} />
            <TimelineSection events={events} />
        </div>
    );
};

export default AgendaPage;
