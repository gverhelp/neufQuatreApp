import { Container, Row, Col } from "react-bootstrap";
import { EventData, AgendaDocument } from "../types/interfaces";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import bootstrap5Plugin from "@fullcalendar/bootstrap5";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { BsFileArrowDownFill, BsCalendar3, BsClockFill, BsGeoAltFill } from "react-icons/bs";
import axios from "axios";
import "../styles/AgendaPage.css";

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

const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" });

const AgendaBlock = ({ events }: { events: EventData[] }) => {
    const baseURL = import.meta.env.VITE_API_URL;
    const [agendaDocument, setAgendaDocument] = useState<AgendaDocument>();
    const [activeSection, setActiveSection] = useState<string | null>(null);

    const activeSlugs = new Set(events.map((e) => e.section));
    const availableSections = SECTIONS.filter((s) => activeSlugs.has(s.slug));

    const filteredEvents = activeSection
        ? events.filter((e) => e.section === activeSection)
        : events;

    const now = new Date();
    const upcomingEvents = events
        .filter((e) => new Date(e.end_time) >= now)
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
        .slice(0, 4);

    useEffect(() => {
        const fetchAgendaDocument = async () => {
            try {
                const response = await axios.get(`${baseURL}/agenda-document/`);
                const data: AgendaDocument = response.data[0];
                if (data) setAgendaDocument(data);
            } catch (err) {
                console.error("Erreur lors de la récupération du document agenda", err);
            }
        };
        fetchAgendaDocument();
    }, [events]);

    return (
        <Container
            fluid
            className="px-3 py-5 px-sm-5"
            style={{
                background: "#eef2f9"
            }}
        >
            {/* Section filter pills */}
            {availableSections.length > 0 && (
                <motion.div
                    className="d-none d-md-flex flex-wrap justify-content-center gap-2 mb-4"
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <button
                        className={`timeline-section-btn${activeSection === null ? " is-active" : ""}`}
                        style={{ ["--btn-color" as string]: "#022864" }}
                        onClick={() => setActiveSection(null)}
                    >
                        Toutes
                    </button>
                    {availableSections.map((s) => (
                        <button
                            key={s.slug}
                            className={`timeline-section-btn${activeSection === s.slug ? " is-active" : ""}`}
                            style={{ ["--btn-color" as string]: s.color }}
                            onClick={() => setActiveSection(activeSection === s.slug ? null : s.slug)}
                        >
                            {s.name}
                        </button>
                    ))}
                </motion.div>
            )}

            <Row className="g-4">
                {/* ── Calendrier ── */}
                <Col xl={8} lg={12} className="d-none d-md-block">
                    <motion.div
                        initial={{ x: -30, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        viewport={{ once: true }}
                    >
                        <div className="agenda-calendar-card">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeSection ?? "all"}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <FullCalendar
                                        plugins={[dayGridPlugin, interactionPlugin, bootstrap5Plugin]}
                                        initialView="dayGridMonth"
                                        themeSystem="bootstrap5"
                                        events={filteredEvents.map((event) => ({
                                            id: event.id.toString(),
                                            title: event.title,
                                            start: event.start_time,
                                            end: event.end_time,
                                            color: getSectionInfo(event.section).color,
                                        }))}
                                        locale="fr"
                                        height="auto"
                                        dayMaxEventRows={true}
                                        headerToolbar={{
                                            left: "today",
                                            center: "title",
                                            right: "prevYear,prev,next,nextYear",
                                        }}
                                        buttonText={{ today: "Aujourd'hui" }}
                                        firstDay={1}
                                        eventClassNames="p-1"
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </Col>

                {/* ── Colonne droite ── */}
                <Col xl={4} lg={12}>
                    <div className="d-flex flex-column gap-3">

                        {/* Légende */}
                        <motion.div
                            className="d-none d-md-block"
                            initial={{ x: 30, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            viewport={{ once: true }}
                        >
                            <div className="agenda-side-card">
                                <div className="agenda-side-card-title">
                                    <BsCalendar3 size={15} />
                                    Légende
                                </div>
                                <div className="d-flex flex-wrap gap-2 pt-3">
                                    {SECTIONS.map((section) => (
                                        <span
                                            key={section.slug}
                                            className="agenda-legend-pill"
                                            style={{
                                                ["--pill-color" as string]: section.color,
                                                opacity: activeSlugs.has(section.slug) ? 1 : 0.3,
                                            }}
                                        >
                                            <span className="agenda-legend-dot" />
                                            {section.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Prochains événements */}
                        {upcomingEvents.length > 0 && (
                            <motion.div
                                initial={{ x: 30, opacity: 0 }}
                                whileInView={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                viewport={{ once: true }}
                            >
                                <div className="agenda-side-card">
                                    <div className="agenda-side-card-title">
                                        <BsClockFill size={14} />
                                        Prochains événements
                                    </div>
                                    <div className="d-flex flex-column gap-2 pt-3">
                                        {upcomingEvents.map((event) => {
                                            const s = getSectionInfo(event.section);
                                            const d = new Date(event.start_time);
                                            const isSameDay =
                                                new Date(event.start_time).toDateString() ===
                                                new Date(event.end_time).toDateString();
                                            return (
                                                <div
                                                    key={event.id}
                                                    className="agenda-upcoming-item"
                                                    style={{ ["--item-color" as string]: s.color }}
                                                >
                                                    <div className="agenda-upcoming-date">
                                                        <span className="agenda-upcoming-day">
                                                            {d.toLocaleDateString("fr-BE", { day: "2-digit" })}
                                                        </span>
                                                        <span className="agenda-upcoming-month">
                                                            {d
                                                                .toLocaleDateString("fr-BE", { month: "short" })
                                                                .replace(".", "")}
                                                        </span>
                                                    </div>
                                                    <div className="agenda-upcoming-info">
                                                        <div className="agenda-upcoming-title">{event.title}</div>
                                                        <div className="d-flex flex-wrap gap-2 mt-1">
                                                            {isSameDay && (
                                                                <span className="agenda-upcoming-meta">
                                                                    <BsClockFill size={9} />
                                                                    {formatTime(event.start_time)}
                                                                </span>
                                                            )}
                                                            {event.location && (
                                                                <span className="agenda-upcoming-meta">
                                                                    <BsGeoAltFill size={9} />
                                                                    {event.location}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="agenda-upcoming-section">{s.name}</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Téléchargement */}
                        {agendaDocument && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                viewport={{ once: true }}
                            >
                                <div className="agenda-side-card agenda-download-card">
                                    <div className="agenda-side-card-title">
                                        <BsFileArrowDownFill size={16} />
                                        {agendaDocument.title}
                                    </div>
                                    {agendaDocument.description && (
                                        <p
                                            className="text-secondary mt-2 mb-3"
                                            style={{ fontSize: "0.87rem", lineHeight: 1.5 }}
                                        >
                                            {agendaDocument.description}
                                        </p>
                                    )}
                                    <a
                                        href={agendaDocument.file}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="agenda-download-btn d-flex align-items-center justify-content-center gap-2"
                                    >
                                        Télécharger le PDF
                                    </a>
                                </div>
                            </motion.div>
                        )}

                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default AgendaBlock;
