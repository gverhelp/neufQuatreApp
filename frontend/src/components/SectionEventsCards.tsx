import { Container, Badge } from "react-bootstrap";
import { BsGeoAltFill, BsClock } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import "../styles/AgendaPage.css";
import { EventData } from "../types/interfaces";

const SECTIONS = [
    { name: "Baladins",   slug: "baladins",   color: "#00A0DD" },
    { name: "Lutins",     slug: "lutins",     color: "#CC0739" },
    { name: "Louveteaux", slug: "louveteaux", color: "#186E54" },
    { name: "Guides",     slug: "guides",     color: "#1D325A" },
    { name: "Éclaireurs", slug: "eclaireurs", color: "#015AA9" },
    { name: "Pionniers",  slug: "pionniers",  color: "#DA1F29" },
    { name: "Clan",       slug: "clan",       color: "#FEB800" },
    { name: "Unité",      slug: "unite",      color: "#022864" },
];

const getSectionInfo = (slug: string) =>
    SECTIONS.find((s) => s.slug === slug) ?? { name: slug, color: "#022864" };

interface Props {
    events: EventData[];
}

const getDateLabel = (start: string) => {
    const d = new Date(start);
    return d
        .toLocaleDateString("fr-BE", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        })
        .replace(/^\w/, (c) => c.toUpperCase());
};

const formatTimeRange = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const sameDay = s.toDateString() === e.toDateString();
    const time: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };
    const short: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
    const long: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };

    if (sameDay) {
        return `${s.toLocaleTimeString("fr-BE", time)} – ${e.toLocaleTimeString("fr-BE", time)}`;
    }
    return `Du ${s.toLocaleDateString("fr-BE", short)} au ${e.toLocaleDateString("fr-BE", long)}`;
};

const SectionEventsCards = ({ events }: Props) => {
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const now = new Date();

    // Sections that actually have events
    const activeSlugs = new Set(events.map((e) => e.section));
    const availableSections = SECTIONS.filter((s) => activeSlugs.has(s.slug));

    const filteredEvents = events
        .filter((e) => activeSection === null || e.section === activeSection)
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

    const activeColor =
        activeSection ? (getSectionInfo(activeSection).color) : "#022864";

    return (
        <Container
            fluid
            className="px-3 py-5 px-sm-5"
            style={{
                background: "linear-gradient(160deg, #eef2f9 0%, #ffffff 45%, #f5f7fb 100%)",
            }}
        >
            {events.length === 0 ? (
                <div className="fs-3 text-center" style={{ fontFamily: "Titan One" }}>
                    Aucun évènement pour le moment
                </div>
            ) : (
                <>
                    {/* Section filter pills */}
                    <motion.div
                        className="d-flex flex-wrap justify-content-center gap-2 mb-5"
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <button
                            className={`timeline-section-btn${
                                activeSection === null ? " is-active" : ""
                            }`}
                            style={{
                                ["--btn-color" as string]: "#022864",
                            }}
                            onClick={() => setActiveSection(null)}
                        >
                            Toutes
                        </button>

                        {availableSections.map((s) => (
                            <button
                                key={s.slug}
                                className={`timeline-section-btn${
                                    activeSection === s.slug ? " is-active" : ""
                                }`}
                                style={{
                                    ["--btn-color" as string]: s.color,
                                }}
                                onClick={() =>
                                    setActiveSection(
                                        activeSection === s.slug ? null : s.slug
                                    )
                                }
                            >
                                {s.name}
                            </button>
                        ))}
                    </motion.div>

                    {/* Timeline */}
                    <div
                        className="timeline-wrapper mx-auto"
                        style={{
                            maxWidth: "1000px",
                            ["--line-color" as string]: activeColor,
                        }}
                    >
                        <AnimatePresence mode="wait">
                            {filteredEvents.length === 0 ? (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-center text-muted py-4"
                                    style={{ fontFamily: "Roboto" }}
                                >
                                    Aucun évènement pour cette section.
                                </motion.div>
                            ) : (
                                <motion.div
                                    key={activeSection ?? "all"}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    {filteredEvents.map((event, index) => {
                                        const isPast = new Date(event.end_time) < now;
                                        const section = getSectionInfo(event.section);
                                        const isLeft = index % 2 === 0;

                                        const cardContent = (
                                            <div
                                                className={`timeline-card-inner ${
                                                    isLeft ? "is-left" : "is-right"
                                                }`}
                                                style={{
                                                    ["--card-accent" as string]: section.color,
                                                }}
                                            >
                                                <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap mb-2">
                                                    <div>
                                                        <div
                                                            className="fw-bold mb-1"
                                                            style={{
                                                                fontFamily: "Titan One",
                                                                color: section.color,
                                                                fontSize: "1rem",
                                                            }}
                                                        >
                                                            {event.title}
                                                        </div>
                                                        <div
                                                            className="text-muted"
                                                            style={{ fontSize: "0.82rem", fontWeight: 600 }}
                                                        >
                                                            {getDateLabel(event.start_time)}
                                                        </div>
                                                    </div>

                                                    <div className="d-flex flex-column align-items-end gap-1">
                                                        {activeSection === null && (
                                                            <Badge
                                                                pill
                                                                style={{
                                                                    backgroundColor: section.color,
                                                                    fontSize: "0.68rem",
                                                                    fontFamily: "Roboto",
                                                                    fontWeight: 700,
                                                                    letterSpacing: "0.05em",
                                                                    textTransform: "uppercase",
                                                                    padding: "3px 10px",
                                                                }}
                                                            >
                                                                {section.name}
                                                            </Badge>
                                                        )}
                                                        {isPast && (
                                                            <Badge
                                                                pill
                                                                bg="secondary"
                                                                style={{
                                                                    fontSize: "0.68rem",
                                                                    fontFamily: "Roboto",
                                                                    fontWeight: 700,
                                                                    letterSpacing: "0.05em",
                                                                    textTransform: "uppercase",
                                                                    padding: "3px 10px",
                                                                }}
                                                            >
                                                                Passé
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="d-flex flex-wrap gap-3 mt-2">
                                                    <div
                                                        className="d-flex align-items-center gap-1 text-muted"
                                                        style={{ fontSize: "0.83rem" }}
                                                    >
                                                        <BsClock size={13} style={{ flexShrink: 0 }} />
                                                        <span>{formatTimeRange(event.start_time, event.end_time)}</span>
                                                    </div>

                                                    {event.location && (
                                                        <div
                                                            className="d-flex align-items-center gap-1 text-muted"
                                                            style={{ fontSize: "0.83rem" }}
                                                        >
                                                            <BsGeoAltFill size={13} style={{ flexShrink: 0 }} />
                                                            <span>{event.location}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {event.description && (
                                                    <div
                                                        className="mt-2 text-secondary"
                                                        style={{ fontSize: "0.875rem", lineHeight: 1.55 }}
                                                    >
                                                        {event.description}
                                                    </div>
                                                )}
                                            </div>
                                        );

                                        return (
                                            <motion.div
                                                key={event.id}
                                                className={`timeline-item${
                                                    isPast ? " is-past" : ""
                                                }`}
                                                initial={{ x: isLeft ? -24 : 24, opacity: 0 }}
                                                whileInView={{ x: 0, opacity: isPast ? 0.5 : 1 }}
                                                viewport={{ once: true, amount: 0.15 }}
                                                transition={{
                                                    duration: 0.4,
                                                    delay: index * 0.04,
                                                    ease: "easeOut",
                                                }}
                                            >
                                                {/* Left slot */}
                                                <div className="timeline-col timeline-left">
                                                    {isLeft && cardContent}
                                                </div>

                                                {/* Center dot */}
                                                <div className="timeline-center">
                                                    <div
                                                        className="timeline-dot"
                                                        style={{
                                                            ["--dot-color" as string]: section.color,
                                                        }}
                                                    />
                                                </div>

                                                {/* Right slot */}
                                                <div className="timeline-col timeline-right">
                                                    {!isLeft && cardContent}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </>
            )}
        </Container>
    );
};

export default SectionEventsCards;
