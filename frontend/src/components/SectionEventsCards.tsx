import { Card, ListGroup, ListGroupItem, Container } from "react-bootstrap";
import { BsGeoAltFill, BsCalendarEvent, BsChevronLeft } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import Masonry from "react-masonry-css";
import { useState } from "react";
import "../styles/AgendaPage.css";
import { EventData } from "../types/interfaces";

const sections = [
    { name: "Baladins", slug: "baladins", color: "#00A0DD" },
    { name: "Lutins", slug: "lutins", color: "#CC0739" },
    { name: "Louveteaux", slug: "louveteaux", color: "#186E54" },
    { name: "Guides", slug: "guides", color: "#1D325A" },
    { name: "Éclaireurs", slug: "eclaireurs", color: "#015AA9" },
    { name: "Pionniers", slug: "pionniers", color: "#DA1F29" },
    { name: "Clan", slug: "clan", color: "#FEB800" },
    { name: "Unité", slug: "unite", color: "#000000" },
];

interface Props {
    events: EventData[];
}

const breakpointColumnsObj = {
    default: 3,
    1200: 2,
    992: 1,
};

const SectionEventsCards: React.FC<Props> = ({ events }) => {
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

    const toggleSection = (slug: string) => {
        setOpenSections((prev) => ({
            ...prev,
            [slug]: !prev[slug],
        }));
    };

    return (
        <Container fluid className="px-3 py-4 px-sm-5 pt-sm-5 pb-sm-4" style={{ backgroundColor: "white" }}>
            {events.length === 0 ? (
                <div className="fs-3 text-center" style={{ fontFamily: "Titan One" }}>
                    Aucun évènement pour le moment
                </div>
            ) : (
                <Masonry
                    breakpointCols={breakpointColumnsObj}
                    className="my-masonry-grid"
                    columnClassName="my-masonry-grid_column"
                >
                    {sections.map((section) => {
                        const sectionEvents = events
                            .filter((event) => event.section === section.slug)
                            .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

                        if (sectionEvents.length === 0) return null;

                        const isOpen = openSections[section.slug];

                        return (
                            <motion.div
                                initial={{ x: -30, opacity: 0 }}
                                whileInView={{ x: 0, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 100 }}
                                viewport={{ once: true }}
                            >
                                <Card
                                    className="shadow rounded-2 border-5 section-event-card"
                                    style={{ borderColor: section.color }}
                                >
                                    <Card.Header
                                        className="ps-3 mb-0 fs-4 d-flex justify-content-between align-items-center"
                                        style={{
                                            fontFamily: "Titan One",
                                            color: section.color,
                                            cursor: "pointer",
                                        }}
                                        onClick={() => toggleSection(section.slug)}
                                    >
                                        {section.name}
                                        <motion.div
                                            animate={{ rotate: isOpen ? -90 : 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <BsChevronLeft />
                                        </motion.div>
                                    </Card.Header>

                                    {!isOpen && (
                                        <Card.Body
                                            className="text-center text-muted small py-3"
                                            style={{ cursor: "pointer" }}
                                            onClick={() => toggleSection(section.slug)}>
                                        Cliquez pour voir les évènements
                                        </Card.Body>
                                    )}

                                    <AnimatePresence initial={false}>
                                        {isOpen && (
                                            <motion.div
                                                key="content"
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                style={{ overflow: "hidden" }}
                                            >
                                                <Card.Body>
                                                    <ListGroup variant="flush">
                                                        {sectionEvents.map((event) => (
                                                            <ListGroupItem
                                                                key={event.id}
                                                                className="py-3"
                                                                style={{ borderColor: section.color }}
                                                            >
                                                                <div className="fw-bold fs-5 mb-1">
                                                                    {new Date(event.start_time)
                                                                        .toLocaleDateString("fr-BE", {
                                                                            weekday: "long",
                                                                            year: "numeric",
                                                                            month: "long",
                                                                            day: "numeric",
                                                                        })
                                                                        .replace(/^\w/, (c) => c.toUpperCase())}
                                                                </div>

                                                                <div className="mb-1 fw-bolder">{event.title}</div>

                                                                {event.description && (
                                                                    <div className="text-muted small mb-2">
                                                                        {event.description}
                                                                    </div>
                                                                )}

                                                                <div className="mb-1 small d-flex align-items-center">
                                                                    <BsGeoAltFill className="me-1 text-secondary" />
                                                                    {event.location || "Lieu non spécifié"}
                                                                </div>

                                                                <div className="small d-flex align-items-center">
                                                                    <BsCalendarEvent className="me-1 text-secondary" />
                                                                    {new Date(event.start_time).toLocaleString("fr-BE", {
                                                                        dateStyle: "short",
                                                                        timeStyle: "short",
                                                                    })}
                                                                    {" - "}
                                                                    {new Date(event.end_time).toLocaleString("fr-BE", {
                                                                        dateStyle: "short",
                                                                        timeStyle: "short",
                                                                    })}
                                                                </div>
                                                            </ListGroupItem>
                                                        ))}
                                                    </ListGroup>
                                                </Card.Body>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Card>
                            </motion.div>
                        );
                    })}
                </Masonry>
            )}
        </Container>
    );
};

export default SectionEventsCards;
