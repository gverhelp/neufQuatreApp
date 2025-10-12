import React from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import { EventData } from "../types/interfaces";
import { motion } from "framer-motion";
import "../styles/AgendaPage.css";
import { BsGeoAltFill, BsCalendarEvent } from "react-icons/bs";

interface Props {
    events: EventData[];
}

const formatDate = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const options: Intl.DateTimeFormatOptions = {
        dateStyle: "short",
        timeStyle: "short",
    };

    return `Du ${startDate.toLocaleString("fr-BE", options)} au ${endDate.toLocaleString("fr-BE", options)}`;
};

const HighlightEventsBlock: React.FC<Props> = ({ events }) => {
    const highlightEvents = events.filter((event) => event.highlight);

    if (highlightEvents.length === 0) return null;

    return (
        <>
            <Container
                fluid
                className="px-3 pt-4 pb-5 px-sm-5"
                style={{
                    backgroundImage: "url('/background2_event.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center center",
                    minHeight: "350px",
                }}
            >
                <h1 
                    className="text-center mb-4" 
                    style={{ 
                        fontFamily: "Titan One", 
                        color: "white", 
                        textShadow: "2px 2px 4px rgba(0, 0, 0, .5)" 
                    }}
                >
                    À ne pas manquer !
                </h1>

                <Row className="g-4 justify-content-center">
                    {highlightEvents.map((event, index) => (
                        <Col key={event.id} md={6} xl={4}>
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                viewport={{ once: true }}
                                animate={{ y: 0, opacity: 1, scale: [1, 1.01, 1] }}
                                className="h-100"
                                transition={{
                                    scale: {
                                        duration: 2.5,
                                        ease: "easeInOut",
                                        repeat: Infinity,
                                        delay: index * 0.2,
                                    },
                                    y: {
                                        duration: 0.5,
                                        ease: "easeOut",
                                        delay: index * 0.1,
                                    },
                                    opacity: {
                                        duration: 0.5,
                                        ease: "easeOut",
                                        delay: index * 0.1,
                                    }
                                }}
                            >
                                <Card className="shadow rounded-2 border-5 h-100" style={{ borderColor: "#022864" }}>
                                    <Card.Body>
                                        <Card.Title className="fs-4" style={{ fontFamily: "Titan One", color: "#022864" }}>
                                            {event.title}
                                        </Card.Title>

                                        <Card.Subtitle className="mt-3 mb-2 text-muted d-flex align-items-center">
                                            <BsGeoAltFill size={18} className="me-2" style={{ color: "#022864" }}/>
                                            {event.location || "Lieu non spécifié"}
                                        </Card.Subtitle>

                                        <Card.Text className="mb-3 text-muted d-flex align-items-center">
                                            <BsCalendarEvent size={18} className="me-2" style={{ color: "#022864" }}/>
                                            <span>
                                                {formatDate(event.start_time, event.end_time)}
                                            </span>
                                        </Card.Text>

                                        <Card.Text>{event.description}</Card.Text>
                                    </Card.Body>
                                </Card>
                            </motion.div>
                        </Col>
                    ))}
                </Row>
            </Container>

            <Container fluid className="py-3 text-center sticky-container sticky-top" style={{ backgroundColor: "#022864", zIndex: 1050 }}>
                <div className="fs-2 text-white"
                    style={{ 
                        fontFamily: "Titan One", 
                        color: "white", 
                        textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)" 
                    }}
                >
                    Agenda
                </div>
            </Container>
        </>
    );
};

export default HighlightEventsBlock;
