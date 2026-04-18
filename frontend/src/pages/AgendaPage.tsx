import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import {
    BsCalendar3, BsGeoAltFill, BsClock, BsClockFill,
    BsFileArrowDownFill,
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
    const activeSections = new Set(upcoming.map(e => e.section)).size;
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

                        <div
                            className="ap-tl-wrap"
                            style={{ '--tl-color': activeColor } as React.CSSProperties}
                        >
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
                                                idx++;

                                                const card = (
                                                    <div
                                                        className={`ap-tl-card${isLeft ? ' ap-tl-card-left' : ' ap-tl-card-right'}`}
                                                        style={{ '--cc': section.color } as React.CSSProperties}
                                                    >
                                                        {/* Header row */}
                                                        <div className="ap-tl-card-head">
                                                            <div className="ap-tl-card-date"
                                                                style={{ '--cc': section.color } as React.CSSProperties}>
                                                                <span className="ap-tl-card-dayname">
                                                                    {fmtDayName(ev.start_time)}
                                                                </span>
                                                                <span className="ap-tl-card-day">
                                                                    {fmtDay(ev.start_time)}
                                                                </span>
                                                                <span className="ap-tl-card-mon">
                                                                    {fmtMonth(ev.start_time)}
                                                                </span>
                                                            </div>

                                                            <div className="ap-tl-card-main">
                                                                <div className="ap-tl-card-title"
                                                                    style={{ color: section.color }}>
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
                                                                    <span className="ap-tl-section-badge"
                                                                        style={{ background: section.color }}>
                                                                        {section.name}
                                                                    </span>
                                                                )}
                                                                {isPast && (
                                                                    <span className="ap-tl-past-badge">Passé</span>
                                                                )}
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
                                                            className={`ap-tl-item${isPast ? ' ap-tl-item-past' : ''}`}
                                                            initial={{ x: isLeft ? -22 : 22, opacity: 0 }}
                                                            whileInView={{ x: 0, opacity: isPast ? 0.48 : 1 }}
                                                            viewport={{ once: true, amount: 0.12 }}
                                                            transition={{ duration: 0.42, ease: 'easeOut' }}
                                                        >
                                                            {/* Left slot */}
                                                            <div className="ap-tl-slot ap-tl-slot-left">
                                                                {isLeft && card}
                                                            </div>
                                                            {/* Dot */}
                                                            <div className="ap-tl-center">
                                                                <div className="ap-tl-dot"
                                                                    style={{ '--cc': section.color } as React.CSSProperties} />
                                                            </div>
                                                            {/* Right slot */}
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
