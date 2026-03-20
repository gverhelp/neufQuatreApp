import { Container, Row, Col, Card, Button, Spinner, Alert } from "react-bootstrap";
import { motion } from "framer-motion";
import axios from "axios";
import "../styles/InformationsPage.css";
import { DocumentData, InformationData } from "../types/interfaces"
import { useEffect, useState } from "react";
import Masonry from "react-masonry-css";


const InformationsPage = () => {
    const baseURL = import.meta.env.VITE_API_URL;
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [documents, setDocuments] = useState<DocumentData[]>([]);
    const [informations, setInformations] = useState<InformationData[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const [docRes, infoRes] = await Promise.all([
                    axios.get(`${baseURL}/documents/`),
                    axios.get(`${baseURL}/infos/`)
                ]);

                setDocuments(docRes.data);
                setInformations(infoRes.data);
            } catch (error) {
                console.error("Erreur lors du chargement des données :", error);
                setError("Impossible de charger les données pour le moment. Veuillez réessayer plus tard.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <Container fluid className="d-flex justify-content-center align-items-center" style={{ minHeight: "70vh" }}>
                <div className="text-center">
                    <Spinner animation="border" style={{ color: "#022864", width: "2.5rem", height: "2.5rem" }} />
                    <p className="mt-3 text-muted">Chargement en cours...</p>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container fluid className="d-flex justify-content-center align-items-center" style={{ minHeight: "70vh" }}>
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container fluid className="p-0">

            {/* ── Titre sticky (même pattern que BySectionPage / AgendaPage) ── */}
            <Container fluid className="py-3 text-center sticky-container sticky-top" style={{ backgroundColor: "#022864", zIndex: 1100 }}>
                <div
                    className="fs-2 text-white"
                    style={{ fontFamily: "Titan One", textShadow: "2px 2px 4px rgba(0,0,0,0.7)" }}
                >
                    Documents & Informations
                </div>
            </Container>

            {/* ── Contenu ── */}
            <Container fluid className="info-content-bg py-4 px-3 px-lg-5">
                <Row className="g-4 align-items-start">

                    {/* ─── Colonne Documents ─── */}
                    <Col md={12} lg={3} className="order-1 order-lg-0">
                        <h2 className="info-col-title">Documents</h2>

                        {documents.length === 0 ? (
                            <p className="text-muted text-center mt-2">Aucun document disponible pour le moment.</p>
                        ) : (
                            documents.map((document, index) => (
                                <motion.div
                                    key={document.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.08 }}
                                    className="mb-3"
                                >
                                    <Card className="info-doc-card rounded-4 shadow-sm">
                                        <Card.Body className="d-flex flex-column">
                                            <Card.Title style={{ fontFamily: "Titan One", color: "#022864", fontSize: "1rem" }}>
                                                {document.title}
                                            </Card.Title>
                                            {document.description && (
                                                <p className="text-muted mb-3" style={{ fontSize: "0.88rem" }}>
                                                    {document.description}
                                                </p>
                                            )}
                                            <Button
                                                as="a" href={document.file}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="download-btn rounded-2 mt-auto"
                                                style={{
                                                    backgroundColor: "#022864",
                                                    borderColor: "#022864",
                                                    textShadow: "1px 1px 3px rgba(0,0,0,0.5)"
                                                }}
                                            >
                                                Télécharger
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                </motion.div>
                            ))
                        )}
                    </Col>

                    {/* ─── Colonne Informations ─── */}
                    <Col md={12} lg={9} className="order-0 order-lg-1">
                        <h2 className="info-col-title">Informations</h2>

                        {informations.length === 0 ? (
                            <p className="text-muted text-center mt-2">Aucune information à afficher pour le moment.</p>
                        ) : (
                            <Masonry
                                breakpointCols={{ default: 2, 1100: 1 }}
                                className="my-masonry-grid"
                                columnClassName="my-masonry-grid_column"
                            >
                                {informations.map((information, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 24 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: index * 0.07 }}
                                        viewport={{ once: true }}
                                    >
                                        <Card className="info-info-card rounded-4 shadow-sm">
                                            {information.image && (
                                                <div className="info-card-media rounded-top-4">
                                                    <img
                                                        src={information.image}
                                                        alt={information.title}
                                                        className="info-card-img"
                                                    />
                                                </div>
                                            )}
                                            {information.video && (
                                                <div className="info-card-media rounded-top-4">
                                                    <video controls className="info-card-img">
                                                        <source src={information.video} type="video/mp4" />
                                                        Votre navigateur ne supporte pas les vidéos HTML5.
                                                    </video>
                                                </div>
                                            )}
                                            {information.videoLink && (
                                                <div className="info-card-media rounded-top-4">
                                                    <iframe
                                                        width="100%"
                                                        height="260"
                                                        src={information.videoLink}
                                                        title={information.title}
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                        style={{ border: "none", display: "block" }}
                                                    />
                                                </div>
                                            )}
                                            <Card.Body className="d-flex flex-column">
                                                <Card.Title style={{ fontFamily: "Titan One", color: "#022864", fontSize: "1.05rem" }}>
                                                    {information.title}
                                                </Card.Title>
                                                {information.description && (
                                                    <Card.Text className="text-muted" style={{ fontSize: "0.92rem", lineHeight: 1.6 }}>
                                                        {information.description}
                                                    </Card.Text>
                                                )}
                                                {information.link && (
                                                    <Button
                                                        as="a" href={information.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="download-btn rounded-2 mt-auto align-self-start"
                                                        style={{
                                                            backgroundColor: "#022864",
                                                            borderColor: "#022864",
                                                            textShadow: "1px 1px 3px rgba(0,0,0,0.5)"
                                                        }}
                                                    >
                                                        En savoir plus
                                                    </Button>
                                                )}
                                            </Card.Body>
                                        </Card>
                                    </motion.div>
                                ))}
                            </Masonry>
                        )}
                    </Col>

                </Row>
            </Container>
        </Container>
    );
};

export default InformationsPage;
