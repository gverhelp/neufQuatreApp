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

    return (
        <Container
            fluid
            className="py-4 pb-5"
            style={{
                minHeight: "85vh",
                backgroundImage: "url('/background5.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center center'
            }}
        >
            <Container fluid>
                {loading ? (
                    <div className="text-center my-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-2">Chargement en cours...</p>
                    </div>
                ) : error ? (
                    <Alert variant="danger" className="text-center my-5">
                        {error}
                    </Alert>
                ) : (
                    <Row className="g-5">
                        <Col md={12} lg={3} className="order-1 order-lg-0">
                            <h1 className="text-center"
                                style={{ 
                                    fontFamily: "Titan One", 
                                    color: "#000000", 
                                    textShadow: "1px 1px 2px rgba(0, 0, 0, 0.2)" 
                                }}
                            >
                                Documents
                            </h1>
                            {documents.length === 0 ? (
                                <p className="text-center" style={{ fontFamily: "Titan One" }}>Aucun document disponible pour le moment.</p>
                            ) : (
                                documents.map((document, index) => (
                                    <motion.div
                                        key={document.id}
                                        initial={{ x: -30, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        viewport={{ once: true }}
                                        className="mt-3"
                                    >
                                        <Card className="shadow rounded-2 border-5" style={{ borderColor: "#022864" }}>
                                            <Card.Body className="text-center d-flex flex-column justify-content-between">
                                                <Card.Title
                                                    className="fs-5 pb-2"
                                                    style={{
                                                        fontFamily: "Titan One",
                                                        borderBottom: "2px solid #022864",
                                                    }}
                                                >
                                                    {document.title}
                                                </Card.Title>
                                                <p>{document.description}</p>
                                                <Button
                                                    className="download-btn rounded-2 d-inline-block text-decoration-none text-center"
                                                    style={{
                                                        backgroundColor: "#022864",
                                                        borderColor: "#022864",
                                                        textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)" 
                                                    }}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    href={document.file}
                                                >
                                                    Télécharger
                                                </Button>
                                            </Card.Body>
                                        </Card>
                                    </motion.div>
                                ))
                            )}
                        </Col>

                        <Col md={12} lg={9} className="order-0 order-lg-1">
                            <h1 className="text-center mb-0"
                                style={{ 
                                    fontFamily: "Titan One", 
                                    color: "#000000", 
                                    textShadow: "1px 1px 2px rgba(0, 0, 0, 0.2)",
                                }}
                            >
                                Informations
                            </h1>
                            {informations.length === 0 ? (
                                <p className="text-center mt-3" style={{ fontFamily: "Titan One" }}>Aucune information à afficher pour le moment.</p>
                            ) : (
                                <Masonry
                                    breakpointCols={{ default: 2, 1100: 1 }}
                                    className="my-masonry-grid"
                                    columnClassName="my-masonry-grid_column"
                                >
                                    {informations.map((information, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ x: -30, opacity: 0 }}
                                            whileInView={{ x: 0, opacity: 1 }}
                                            transition={{ duration: 0.5, delay: index * 0.1 }}
                                            viewport={{ once: true }}
                                            className="mt-3"
                                        >
                                            <Card className="shadow rounded-2 border-5" style={{ borderColor: "#022864" }}>
                                                <Card.Body className="text-center d-flex flex-column justify-content-center align-items-center">
                                                    {information.image && (
                                                        <div
                                                            className="mb-3 d-flex justify-content-center align-items-center"
                                                            style={{ width: "100%", maxHeight: "350px", overflow: "hidden" }}
                                                        >
                                                            <img
                                                                src={information.image}
                                                                alt={information.title}
                                                                style={{
                                                                    width: "100%",
                                                                    height: "100%",
                                                                    maxWidth: "500px",
                                                                    maxHeight: "350px",
                                                                    objectFit: "contain",
                                                                    borderRadius: "8px",
                                                                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                    {information.video && (
                                                        <div
                                                            className="mb-3 d-flex justify-content-center align-items-center"
                                                            style={{ width: "100%", maxHeight: "400px", overflow: "hidden" }}
                                                        >
                                                            <video
                                                                controls
                                                                style={{
                                                                    width: "100%",
                                                                    height: "100%",
                                                                    maxWidth: "500px",
                                                                    maxHeight: "400px",
                                                                    objectFit: "contain",
                                                                    borderRadius: "8px",
                                                                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
                                                                }}
                                                            >
                                                                <source src={information.video} type="video/mp4" />
                                                                Votre navigateur ne supporte pas les vidéos HTML5.
                                                            </video>
                                                        </div>
                                                    )}
                                                    {information.videoLink && (
                                                        <iframe
                                                            className="mb-3"
                                                            width="100%"
                                                            height="400px"
                                                            src={information.videoLink}
                                                            title={information.title}
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                            allowFullScreen
                                                        ></iframe>
                                                    )}
                                                    <Card.Title className="fs-5" style={{ fontFamily: "Titan One" }}>
                                                        {information.title}
                                                    </Card.Title>
                                                    <Card.Text className="text-center">
                                                        {information.description}
                                                    </Card.Text>
                                                    {information.link && (
                                                        <Button
                                                            className="download-btn rounded-2 d-inline-block text-decoration-none text-white text-center"
                                                            style={{
                                                                backgroundColor: "#022864",
                                                                borderColor: "#022864",
                                                                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)"
                                                            }}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            href={information.link}
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
                )}
            </Container>
        </Container>
    );
};

export default InformationsPage;
