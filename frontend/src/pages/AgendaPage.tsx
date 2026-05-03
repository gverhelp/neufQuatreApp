import React, { useEffect, useState, useMemo, useRef, useLayoutEffect } from 'react';
import axios from 'axios';
import { Container } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BsCalendar3, BsGeoAltFill, BsClock, BsClockFill,
    BsFileArrowDownFill, BsFlag, BsFlagFill,
    BsChevronLeft, BsChevronRight,
} from 'react-icons/bs';

import '../styles/AgendaPage.css';
import { EventData, AgendaDocument } from '../types/interfaces';
import {
    fadeUp,
    staggerContainer,
    staggerItem,
    heroTitle,
    heroRule,
    heroSubtitle,
} from '../styles/motion';

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

/* ── Calendar date helpers ── */
const startOfDay = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const sameDay    = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const sameMonth  = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

/** 6×7 grid starting Monday for the month containing `cursor` */
function getMonthGrid(cursor: Date): Date[] {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const firstDow = (first.getDay() + 6) % 7;        // 0 = Monday
    const start = new Date(first);
    start.setDate(1 - firstDow);
    return Array.from({ length: 35 }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return d;
    });
}

/** Monday-aligned start of week for `d` */
function startOfWeek(d: Date): Date {
    const x = startOfDay(d);
    const dow = (x.getDay() + 6) % 7;
    x.setDate(x.getDate() - dow);
    return x;
}

/** Number of weeks between two Monday-aligned dates (rounded) */
function weeksBetween(a: Date, b: Date): number {
    return Math.round((b.getTime() - a.getTime()) / (7 * 24 * 3600 * 1000));
}

function fmtMonthShort(d: Date) {
    return d.toLocaleDateString('fr-BE', { month: 'short' }).replace('.', '');
}
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

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

                    <motion.h1 className="ap-hero-title" {...heroTitle(0.28)}>
                        Agenda
                    </motion.h1>

                    <motion.div className="ap-hero-rule" {...heroRule(0.55)} />

                    <motion.p className="ap-hero-sub" {...heroSubtitle(0.7)}>
                        Retrouve ici tous les événements à venir pour chaque section de l'unité.
                    </motion.p>

                    {!loading && events.length > 0 && (
                        <motion.div className="ap-hero-stats" {...heroSubtitle(0.9)}>
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
                    variants={staggerContainer}
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
   CALENDAR — small subcomponents
════════════════════════════════════════════════════════ */

const EventListItem: React.FC<{ ev: EventData }> = ({ ev }) => {
    const s = getSectionInfo(ev.section);
    const sd = new Date(ev.start_time).toDateString() === new Date(ev.end_time).toDateString();
    return (
        <div
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
                <div className={`ap-upcoming-name${ev.highlight ? ' ap-upcoming-name-highlight' : ''}`}>
                    {ev.highlight && <span className="ap-upcoming-star">★</span>}
                    {ev.title}
                </div>
                <div className="ap-upcoming-meta-row">
                    {sd && (
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
};

interface DayCellProps {
    day: Date;
    events: EventData[];
    inMonth: boolean;
    isToday: boolean;
    isWeekend: boolean;
    isSelected: boolean;
    onClick: () => void;
    onEventHover: (ev: EventData, rect: DOMRect) => void;
    onEventLeave: () => void;
}

const DayCell: React.FC<DayCellProps> = ({
    day, events, inMonth, isToday, isWeekend, isSelected, onClick, onEventHover, onEventLeave,
}) => {
    const visible = events.slice(0, 3);
    const more = events.length - visible.length;
    return (
        <button
            type="button"
            tabIndex={inMonth ? 0 : -1}
            className={[
                'ap-daycell',
                !inMonth     ? 'ap-daycell-out'      : '',
                isWeekend    ? 'ap-daycell-weekend'  : '',
                isToday      ? 'ap-daycell-today'    : '',
                isSelected   ? 'ap-daycell-selected' : '',
                events.length ? 'ap-daycell-has'     : '',
            ].filter(Boolean).join(' ')}
            onClick={onClick}
        >
            <span className="ap-daycell-num">{day.getDate()}</span>
            {events.length > 0 && (
                <div className="ap-daycell-events">
                    {visible.map(ev => {
                        const s = getSectionInfo(ev.section);
                        return (
                            <span
                                key={ev.id}
                                className={`ap-daycell-event${ev.highlight ? ' ap-daycell-event-hl' : ''}`}
                                style={{ background: s.color }}
                                onMouseEnter={e => {
                                    e.stopPropagation();
                                    onEventHover(ev, (e.currentTarget as HTMLElement).getBoundingClientRect());
                                }}
                                onMouseLeave={e => { e.stopPropagation(); onEventLeave(); }}
                            >
                                {ev.highlight && <span className="ap-daycell-event-star">★</span>}
                                {ev.title}
                            </span>
                        );
                    })}
                    {more > 0 && <span className="ap-daycell-more">+{more}</span>}
                </div>
            )}
        </button>
    );
};

/* ════════════════════════════════════════════════════════
   CALENDAR SECTION
════════════════════════════════════════════════════════ */

const CalendarSection: React.FC<{ events: EventData[] }> = ({ events }) => {
    const baseURL = import.meta.env.VITE_API_URL;
    const [agendaDoc, setAgendaDoc] = useState<AgendaDocument | null>(null);
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState<Date>(() => {
        const x = new Date(); x.setDate(1); x.setHours(0, 0, 0, 0); return x;
    });
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);
    const [calTooltip, setCalTooltip] = useState<{ ev: EventData; x: number; y: number } | null>(null);

    const now = useMemo(() => new Date(), []);

    const activeSlugs = new Set(events.map(e => e.section));
    const availableSections = SECTIONS.filter(s => activeSlugs.has(s.slug));
    const filteredEvents = activeSection
        ? events.filter(e => e.section === activeSection)
        : events;

    /* Map: dayKey → events[] (multi-day events spread across all their days) */
    const eventsByDay = useMemo(() => {
        const map = new Map<string, EventData[]>();
        filteredEvents.forEach(ev => {
            const start = startOfDay(new Date(ev.start_time));
            const end   = startOfDay(new Date(ev.end_time));
            const cur   = new Date(start);
            while (cur <= end) {
                const k = dayKey(cur);
                const arr = map.get(k) ?? [];
                arr.push(ev);
                map.set(k, arr);
                cur.setDate(cur.getDate() + 1);
            }
        });
        return map;
    }, [filteredEvents]);

    /* Year strip — all 12 months of the currently viewed year */
    const stripMonths = useMemo(() => {
        const year = currentMonth.getFullYear();
        return Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));
    }, [currentMonth]);

    /* Event count per month for strip intensity */
    const monthCounts = useMemo(() => {
        const m = new Map<string, number>();
        filteredEvents.forEach(ev => {
            const d = new Date(ev.start_time);
            m.set(`${d.getFullYear()}-${d.getMonth()}`, (m.get(`${d.getFullYear()}-${d.getMonth()}`) ?? 0) + 1);
        });
        return m;
    }, [filteredEvents]);
    const maxMonthCount = Math.max(1, ...Array.from(monthCounts.values()));

    /* Mobile agenda — upcoming events grouped by week */
    const mobileWeeks = useMemo(() => {
        const upcoming = filteredEvents
            .filter(e => new Date(e.end_time) >= now)
            .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

        const todayWk = startOfWeek(now);
        const groups: { key: string; label: string; events: EventData[] }[] = [];
        const idxByKey = new Map<string, number>();

        upcoming.forEach(ev => {
            const wk = startOfWeek(new Date(ev.start_time));
            const k  = wk.toISOString();
            let idx = idxByKey.get(k);
            if (idx === undefined) {
                const wb = weeksBetween(todayWk, wk);
                let label: string;
                if (wb <= 0)        label = 'Cette semaine';
                else if (wb === 1)  label = 'Semaine prochaine';
                else {
                    const wkEnd = new Date(wk);
                    wkEnd.setDate(wk.getDate() + 6);
                    const fmt = (d: Date) =>
                        d.toLocaleDateString('fr-BE', { day: 'numeric', month: 'short' }).replace('.', '');
                    label = `Semaine du ${fmt(wk)} au ${fmt(wkEnd)}`;
                }
                idx = groups.length;
                groups.push({ key: k, label, events: [] });
                idxByKey.set(k, idx);
            }
            groups[idx].events.push(ev);
        });
        return groups;
    }, [filteredEvents, now]);

    /* Sidebar fallback list (5 next events) */
    const upcomingEvents = useMemo(() =>
        filteredEvents
            .filter(e => new Date(e.end_time) >= now)
            .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
            .slice(0, 5)
    , [filteredEvents, now]);

    /* 6×7 grid for the visible month */
    const grid = useMemo(() => getMonthGrid(currentMonth), [currentMonth]);

    /* Navigation */
    const goPrev  = () => {
        setCurrentMonth(d => { const x = new Date(d); x.setMonth(x.getMonth() - 1); return x; });
        setSelectedDay(null);
    };
    const goNext  = () => {
        setCurrentMonth(d => { const x = new Date(d); x.setMonth(x.getMonth() + 1); return x; });
        setSelectedDay(null);
    };
    const goToday = () => {
        setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
        setSelectedDay(now);
    };

    /* Auto-scroll year strip so the active month stays visible */
    const stripActiveRef = useRef<HTMLButtonElement>(null);
    useEffect(() => {
        stripActiveRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }, [currentMonth]);

    useEffect(() => {
        axios.get(`${baseURL}/agenda-document/`).then(r => {
            if (r.data[0]) setAgendaDoc(r.data[0]);
        }).catch(console.error);
    }, []);

    const isViewingCurrentMonth = sameMonth(currentMonth, now);
    const monthKey = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}`;

    return (
        <section className="ap-cal-section">
            <Container>
                <div className="ap-sec-header">
                    <motion.h2 className="ap-sec-heading" {...fadeUp(0.08)}>Calendrier</motion.h2>
                    <motion.div className="ap-sec-rule" {...fadeUp(0.14)} />
                </div>

                {availableSections.length > 0 && (
                    <FilterPills
                        sections={availableSections}
                        active={activeSection}
                        onSelect={setActiveSection}
                    />
                )}

                <div className="ap-cal-layout">
                    {/* MAIN ─ desktop calendar + mobile agenda */}
                    <motion.div
                        className="ap-cal-main"
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.55, delay: 0.1 }}
                        viewport={{ once: true }}
                    >
                        {/* Desktop calendar card */}
                        <div className="ap-cal-card d-none d-lg-block">
                            {/* Year strip */}
                            <div className="ap-yearstrip">
                                {stripMonths.map(m => {
                                    const k = `${m.getFullYear()}-${m.getMonth()}`;
                                    const count = monthCounts.get(k) ?? 0;
                                    const intensity = count / maxMonthCount;
                                    const active = sameMonth(m, currentMonth);
                                    return (
                                        <button
                                            key={k}
                                            ref={active ? stripActiveRef : null}
                                            type="button"
                                            className={`ap-yearstrip-btn${active ? ' ap-yearstrip-active' : ''}`}
                                            style={{ '--intensity': intensity } as React.CSSProperties}
                                            onClick={() => { setCurrentMonth(new Date(m)); setSelectedDay(null); }}
                                        >
                                            <span className="ap-yearstrip-mon">{fmtMonthShort(m)}</span>
                                            <span className="ap-yearstrip-yr">{m.getFullYear()}</span>
                                            {count > 0 && <span className="ap-yearstrip-count">{count}</span>}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Header — month name, prev/next, today pill */}
                            <div className="ap-calhead">
                                <button type="button" className="ap-calhead-nav"
                                    onClick={goPrev} aria-label="Mois précédent">
                                    <BsChevronLeft size={16} />
                                </button>

                                <div className="ap-calhead-title">
                                    <span className="ap-calhead-month">
                                        {currentMonth.toLocaleDateString('fr-BE', { month: 'long' })
                                            .replace(/^\w/, c => c.toUpperCase())}
                                    </span>
                                    <span className="ap-calhead-year">{currentMonth.getFullYear()}</span>
                                </div>

                                <button type="button" className="ap-calhead-nav"
                                    onClick={goNext} aria-label="Mois suivant">
                                    <BsChevronRight size={16} />
                                </button>

                                <AnimatePresence>
                                    {!isViewingCurrentMonth && (
                                        <motion.button
                                            type="button"
                                            className="ap-calhead-today"
                                            onClick={goToday}
                                            initial={{ opacity: 0, scale: 0.85 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.85 }}
                                            transition={{ duration: 0.22 }}
                                            title="Revenir à aujourd'hui"
                                        >
                                            <span className="ap-calhead-today-num">{now.getDate()}</span>
                                            <span className="ap-calhead-today-label">Aujourd'hui</span>
                                        </motion.button>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Day-of-week header */}
                            <div className="ap-calgrid-head">
                                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
                                    <div key={d} className="ap-calgrid-dayname">{d}</div>
                                ))}
                            </div>

                            {/* Animated month grid */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={monthKey}
                                    className="ap-calgrid"
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -12 }}
                                    transition={{ duration: 0.28, ease: 'easeOut' }}
                                >
                                    {grid.map((day, i) => {
                                        const dayEvts   = eventsByDay.get(dayKey(day)) ?? [];
                                        const inMonth   = sameMonth(day, currentMonth);
                                        const isToday   = sameDay(day, now);
                                        const dow       = day.getDay();
                                        const isWeekend = dow === 0 || dow === 6;
                                        const isSel     = !!selectedDay && sameDay(day, selectedDay);
                                        return (
                                            <DayCell
                                                key={i}
                                                day={day}
                                                events={dayEvts}
                                                inMonth={inMonth}
                                                isToday={isToday}
                                                isWeekend={isWeekend}
                                                isSelected={isSel}
                                                onClick={() => setSelectedDay(new Date(day))}
                                                onEventHover={(ev, rect) => setCalTooltip({
                                                    ev,
                                                    x: rect.left + rect.width / 2,
                                                    y: rect.top,
                                                })}
                                                onEventLeave={() => setCalTooltip(null)}
                                            />
                                        );
                                    })}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Mobile agenda — week-grouped list */}
                        <div className="ap-mobag d-lg-none">
                            {mobileWeeks.length === 0 ? (
                                <div className="ap-mobag-empty">Aucun événement à venir.</div>
                            ) : (
                                mobileWeeks.map(g => (
                                    <div key={g.key} className="ap-mobag-group">
                                        <div className="ap-mobag-week">
                                            <BsCalendar3 size={11} />
                                            {g.label}
                                        </div>
                                        <div className="ap-mobag-list">
                                            {g.events.map(ev => <EventListItem key={ev.id} ev={ev} />)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>

                    {/* SIDEBAR */}
                    <div className="ap-cal-sidebar">
                        <AnimatePresence mode="wait">
                            {selectedDay ? (
                                <motion.div
                                    key={`day-${dayKey(selectedDay)}`}
                                    className="ap-side-card d-none d-lg-block"
                                    initial={{ opacity: 0, x: 16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -16 }}
                                    transition={{ duration: 0.28 }}
                                >
                                    <div className="ap-side-title ap-side-title-with-clear">
                                        <span className="ap-side-title-text">
                                            <BsCalendar3 size={14} />
                                            {selectedDay.toLocaleDateString('fr-BE', {
                                                weekday: 'long', day: 'numeric', month: 'long',
                                            }).replace(/^\w/, c => c.toUpperCase())}
                                        </span>
                                        <button
                                            type="button"
                                            className="ap-side-clear"
                                            onClick={() => setSelectedDay(null)}
                                            aria-label="Fermer"
                                        >
                                            ×
                                        </button>
                                    </div>
                                    {(() => {
                                        const dayEvts = eventsByDay.get(dayKey(selectedDay)) ?? [];
                                        return dayEvts.length === 0 ? (
                                            <p className="ap-side-empty">Aucun événement ce jour-là.</p>
                                        ) : (
                                            <div className="ap-upcoming-list">
                                                {dayEvts.map(ev => <EventListItem key={ev.id} ev={ev} />)}
                                            </div>
                                        );
                                    })()}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="upcoming-default"
                                    className="ap-side-card d-none d-lg-block"
                                    initial={{ opacity: 0, x: 16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -16 }}
                                    transition={{ duration: 0.28 }}
                                >
                                    <div className="ap-side-title">
                                        <BsClockFill size={13} />
                                        Prochains événements
                                    </div>
                                    {upcomingEvents.length === 0 ? (
                                        <p className="ap-side-empty">Aucun événement à venir.</p>
                                    ) : (
                                        <div className="ap-upcoming-list">
                                            {upcomingEvents.map(ev => <EventListItem key={ev.id} ev={ev} />)}
                                        </div>
                                    )}
                                    <p className="ap-side-hint">
                                        Clique sur un jour du calendrier pour voir ses événements.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>

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

            {/* Fixed calendar event tooltip */}
            {calTooltip && (
                <div
                    className="ap-cal-tooltip"
                    style={{ left: calTooltip.x, top: calTooltip.y }}
                >
                    <div className="ap-cal-tooltip-title">
                        {calTooltip.ev.highlight && <span className="ap-cal-tooltip-star">★</span>}
                        {calTooltip.ev.title}
                    </div>

                    {calTooltip.ev.location && (
                        <div className="ap-cal-tooltip-meta">
                            <BsGeoAltFill size={10} />
                            {calTooltip.ev.location}
                        </div>
                    )}

                    <div className="ap-cal-tooltip-meta">
                        <BsClock size={10} />
                        {fmtTimeRange(calTooltip.ev.start_time, calTooltip.ev.end_time)}
                    </div>

                    <div className="ap-cal-tooltip-arrow" />

                    <div
                        className="ap-cal-tooltip-section"
                        style={{ color: getSectionInfo(calTooltip.ev.section).color }}
                    >
                        {getSectionInfo(calTooltip.ev.section).name}
                    </div>
                </div>
            )}
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
            // Use viewport width to stay in sync with CSS @media breakpoint
            const mobile = window.innerWidth <= 1200;
            const centerX = mobile ? 14 : w / 2;
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
        window.addEventListener('resize', measure);
        const t1 = setTimeout(measure, 250);
        const t2 = setTimeout(measure, 700);
        return () => {
            ro.disconnect();
            window.removeEventListener('resize', measure);
            clearTimeout(t1); clearTimeout(t2);
        };
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

    /* Whether at least one past event exists — used to decide if we render the "Aujourd'hui" row */
    const hasPastEvent = useMemo(
        () => filteredEvents.some(e => new Date(e.end_time) < now),
    // eslint-disable-next-line react-hooks/exhaustive-deps
        [filteredEvents],
    );

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
                                            {/* Future = dashed gray */}
                                            <path
                                                d={pathD}
                                                fill="none"
                                                stroke="#94a3b8"
                                                strokeOpacity="0.55"
                                                strokeWidth="2.5"
                                                strokeDasharray="2 9"
                                                strokeLinecap="round"
                                            />
                                            {/* Past = solid gray overlay */}
                                            {pastLen > 0 && (
                                                <path
                                                    d={pathD}
                                                    fill="none"
                                                    stroke="#94a3b8"
                                                    strokeOpacity="0.95"
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
                                                let renderedToday = false;
                                                return filteredEvents.map(ev => {
                                                    const monthKey = getMonthKey(ev.start_time);
                                                    const showSep = monthKey !== lastMonthKey;
                                                    if (showSep) lastMonthKey = monthKey;

                                                    const isPast  = new Date(ev.end_time) < now;
                                                    const showToday = !renderedToday && !isPast && hasPastEvent;
                                                    if (!isPast) renderedToday = true;

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
                                                            {showToday && (
                                                                <motion.div
                                                                    className="ap-tl-today"
                                                                    style={{ '--tl-color': activeColor } as React.CSSProperties}
                                                                    initial={{ opacity: 0, y: -8 }}
                                                                    whileInView={{ opacity: 1, y: 0 }}
                                                                    viewport={{ once: true, amount: 0.5 }}
                                                                    transition={{ duration: 0.34, ease: 'easeOut' }}
                                                                >
                                                                    <span className="ap-tl-today-line" />
                                                                    <span className="ap-tl-today-pill">Aujourd'hui</span>
                                                                    <span className="ap-tl-today-line" />
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
