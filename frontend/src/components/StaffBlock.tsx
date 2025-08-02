import { Container, Row, Col, Card, Alert, Placeholder } from "react-bootstrap";
import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ChefData } from "../types/interfaces";
import { FaUserCircle } from "react-icons/fa";

const StaffCard = ({ member }: { member: ChefData }) => {
    return (
        <Card className="overflow-hidden border-5 rounded-2 staff-card" style={{ borderColor: "#022864" }}>
            {member.image ? (
                <Card.Img 
                    className="rounded-0" 
                    variant="top" 
                    src={member.image} 
                    alt={member.totem} 
                    style={{ height: "400px", objectFit: "cover"}} 
                />
            ) : (
                <div 
                    className="d-flex justify-content-center align-items-center" 
                    style={{ height: "400px", backgroundColor: "#f0f0f0" }}
                >
                    <FaUserCircle size={100} color="#022864" />
                </div>
            )}
            <Card.Body className="text-center text-break overflow-y-scroll" style={{ height: "400px" }}>
                <Card.Title className="fs-4" style={{ fontFamily: "Titan One" }}>{member.totem}</Card.Title>
                <Card.Subtitle className="pb-2 mb-2 text-muted fs-5" style={{ borderBottom: "2px solid #022864" }}>{member.name}</Card.Subtitle>
                <Card.Text className="fs-6">{member.bafouille}</Card.Text>
            </Card.Body>
        </Card>
    );
};

const PlaceholderCard = () => (
    <Card className="overflow-hidden border-5 rounded-2 staff-card" style={{ borderColor: "#022864" }}>
        <Placeholder as={Card.Img} animation="glow" style={{ height: "350px", backgroundColor: "#f0f0f0" }} />
        <Card.Body className="text-center text-break overflow-scroll" style={{ height: "400px" }}>
            <Placeholder as={Card.Title} animation="glow" className="fs-4">
                <Placeholder xs={6} />
            </Placeholder>
            <Placeholder as={Card.Subtitle} animation="glow" className="pb-2 mb-2 text-muted fs-5">
                <Placeholder xs={4} />
            </Placeholder>
            <Placeholder as={Card.Text} animation="glow" className="fs-6">
                <Placeholder xs={8} />
                <Placeholder xs={7} />
                <Placeholder xs={6} />
            </Placeholder>
        </Card.Body>
    </Card>
);

const StaffBlock = ({ sectionName }: { sectionName: string }) => {
    const baseURL = import.meta.env.VITE_API_URL;
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [chefsData, setChefsData] = useState<ChefData[]>([]);

    useEffect(() => {
        const fetchSectionData = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await axios.get(`${baseURL}/chefs/`);
                const data: ChefData[] = response.data;
                const selectedChefs = data.filter(member => member.section.toLowerCase() === sectionName.toLowerCase());

                setChefsData(selectedChefs);
            } catch (err) {
                console.error("Erreur lors de la récupération des données", err);
                setError("Impossible de charger les données. Veuillez réessayer plus tard.");
            } finally {
                setLoading(false);
            }
        };

        fetchSectionData();
    }, [sectionName]);

    if (loading) {
        return (
            <Container fluid className="p-4">
                <Row className="g-4 justify-content-center">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <Col key={index} md={6} lg={4} xl={3}>
                            <PlaceholderCard />
                        </Col>
                    ))}
                </Row>
            </Container>
        );
    }

    if (error) {
        return (
            <Container fluid className="p-4 text-center">
                <Alert variant="warning">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container fluid className="px-3 py-4 p-sm-5" style={{ backgroundColor: "white", backgroundSize: 'cover', backgroundPosition: 'center center', paddingBlock: "10vh" }}>
            <h2 className="text-center pb-4 fs-1"
                style={{ 
                    fontFamily: "Titan One", 
                    color: "#000000", 
                    textShadow: "1px 1px 2px rgba(0, 0, 0, 0.2)" 
                }}
            >
                {(() => {
                    if (sectionName === "Unite") {
                        return "Les chefs D'Unité";
                    } else if (sectionName === "Eclaireurs") {
                        return "Les chefs Éclaireurs";
                    } else {
                        return `Les chefs ${sectionName}`;
                    }
                })()}
            </h2>
            {chefsData.length > 0 ? (
                <Row className="g-4 justify-content-center">
                    {chefsData.map((member, index) => (
                        <Col key={index} md={6} lg={4} xl={3}>
                            <motion.div
                                initial={{ y: 100, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                viewport={{ once: true }}
                                className="h-100"
                            >
                                <StaffCard member={member} />
                            </motion.div>
                        </Col>
                    ))}
                </Row>
            ) : (
                <p className="text-center fs-5" style={{ fontFamily: "Titan One" }}>
                    Il semble qu'il n'y ait aucun chef dans cette section.
                </p>
            )}
        </Container>
    );
};

export default StaffBlock;