import { Container, Row, Col, Card, ListGroup, ListGroupItem, Button } from "react-bootstrap";
import { EventData, AgendaDocument } from "../types/interfaces";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import bootstrap5Plugin from "@fullcalendar/bootstrap5";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/AgendaPage.css";


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

const getSectionColor = (sectionName: string): string => {
    const section = sections.find(section => section.slug === sectionName);

    return section ? section.color : "#000000";
};


const AgendaBlock = ({ events } : { events : EventData[] }) => {
    const baseURL = import.meta.env.VITE_API_URL;
    const hasHighlight = events.filter((event) => (event.highlight));
    const [agendaDocument, setAgendaDocument] = useState<AgendaDocument>();
    // const [loading, setLoading] = useState<boolean>(true);
    // const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAgendaDocument = async () => {
            try {
                // setLoading(true);
                const response = await axios.get(`${baseURL}/agenda-document/`);
                const data: AgendaDocument = response.data[0];

                if (data) {
                    setAgendaDocument(data);
                }

            } catch (err) {
                console.error("Erreur lors de la récupération des événements", err);
                // setError("Impossible de charger les données");
            } finally {
                // setLoading(false);
            }
        };

        fetchAgendaDocument();
    }, [events]);

    return (
        <Container
            fluid
            className={`${hasHighlight.length ? "px-3 py-4 p-sm-5" : "px-3 py-4 px-sm-5"}`}
            style={{
                backgroundImage: "url('/background7.png')",
                backgroundSize: "cover",
                backgroundPosition: "center center",
            }}
        >
            {!hasHighlight.length && (
                <h1 
                    className="text-center mb-4" 
                    style={{ 
                        fontFamily: "Titan One", 
                        color: "#000000", 
                        textShadow: "1px 1px 2px rgba(0, 0, 0, 0.2)" 
                    }}
                >
                    Agenda
                </h1>
            )}

            <Row className="g-3">
                {/* Calendrier */}
                <Col xl={10} md={12} className="d-none d-lg-block">
                    <motion.div
                        initial={{ x: -30, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        viewport={{ once: true }}
                        className="h-100"
                    >
                        <Card className="shadow rounded-2 p-3 border-5 h-100" style={{ borderColor: "#022864" }}>
                            <FullCalendar
                                plugins={[dayGridPlugin, interactionPlugin, bootstrap5Plugin]}
                                initialView="dayGridMonth"
                                themeSystem="bootstrap5"
                                events={events.map((event) => ({
                                    id: event.id.toString(),
                                    title: event.title,
                                    start: event.start_time,
                                    end: event.end_time,
                                    color: getSectionColor(event.section),
                                }))}
                                locale="fr"
                                height="auto"
                                dayMaxEventRows={true}
                                headerToolbar={{
                                    left: "today",
                                    center: "title",
                                    right: "prevYear,prev,next,nextYear",
                                }}
                                buttonText={{
                                    today: "Aujourd'hui",
                                    month: "Mois",
                                    week: "Semaine",
                                    day: "Jour",
                                }}
                                firstDay={1}
                                eventClassNames="p-1"
                            />
                        </Card>
                    </motion.div>
                </Col>

                {/* Colonne Légende + Téléchargement */}
                <Col xl={2} md={12} className="d-flex flex-column align-content-stretch">
                    <motion.div
                        initial={{ x: 30, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="d-none d-lg-block"
                    >
                        <Card className="shadow rounded-2 border-5" style={{ borderColor: "#022864" }}>
                            <Card.Body className="text-center">
                                <Card.Title
                                    className="fs-4 pb-2"
                                    style={{ fontFamily: "Titan One", borderBottom: "2px solid #022864" }}
                                >
                                    Légende
                                </Card.Title>
                                <ListGroup
                                    variant="flush"
                                    className="d-flex flex-xl-column flex-md-row flex-wrap justify-content-center align-items-center gap-2"
                                >
                                    {sections.map((section) => (
                                        <ListGroupItem
                                            key={section.name}
                                            className="d-flex align-items-center border-0 ps-0"
                                            style={{ minWidth: "120px" }}
                                        >
                                            <span
                                                className="me-2"
                                                style={{
                                                    display: "inline-block",
                                                    width: "16px",
                                                    height: "16px",
                                                    borderRadius: "50%",
                                                    backgroundColor: section.color,
                                                }}
                                            />
                                            {section.name}
                                        </ListGroupItem>
                                    ))}
                                </ListGroup>
                            </Card.Body>
                        </Card>
                    </motion.div>

                    {/* Carte téléchargement */}
                    {agendaDocument && (
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            viewport={{ once: true }}
                            className="pt-3 download-card-padding-lg"
                        >
                            <Card className="shadow rounded-2 border-5 h-100" style={{ borderColor: "#022864" }}>
                                <Card.Body className="text-center d-flex flex-column justify-content-center">
                                        <Card.Title
                                            className="fs-5 pb-2"
                                            style={{
                                                fontFamily: "Titan One",
                                                borderBottom: "2px solid #022864",
                                            }}
                                        >
                                            {agendaDocument.title}
                                        </Card.Title>
                                        <Card.Text className="text-center">
                                            {agendaDocument.description}
                                        </Card.Text>
                                        <Button
                                            className="download-btn rounded-2 d-inline-block text-decoration-none text-center"
                                            style={{ 
                                                backgroundColor: "#022864",
                                                borderColor: "#022864", 
                                                color: "white", 
                                                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)" 
                                            }}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            href={agendaDocument.file}
                                        >
                                            Télécharger
                                        </Button>
                                </Card.Body>
                            </Card>
                        </motion.div>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default AgendaBlock;
