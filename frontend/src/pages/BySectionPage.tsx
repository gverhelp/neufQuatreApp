import { Container, Col, Row, ProgressBar, Alert, Placeholder } from "react-bootstrap";
import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import "../styles/Sections.css";
import { SectionData } from "../types/interfaces";
import CarouselBlock from "../components/CarouselBlock";
import ContentBlock from "../components/ContentBlock";
import StaffBlock from "../components/StaffBlock";
import InfoCards from "../components/InfosCards";


const sectionsPath = [
    { name: "Baladins", slug: "baladins", age: "Enfants de 6 à 8 ans (mixte)", path: "/sections/baladins" },
    { name: "Lutins", slug:"lutins", age: "Filles de 8 à 12 ans", path: "/sections/lutins" },
    { name: "Louveteaux", slug: "louveteaux", age: "Garçons de 8 à 12 ans", path: "/sections/louveteaux" },
    { name: "Guides", slug: "guides", age: "Filles de 12 à 16 ans", path: "/sections/guides" },
    { name: "Éclaireurs", slug: "eclaireurs", age: "Garçons de 12 à 16 ans", path: "/sections/eclaireurs" },
    { name: "Pionniers", slug: "pionniers", age: "Adolescents de 16 à 18 ans (mixte)", path: "/sections/pionniers" },
    { name: "Clan", slug: "clan", path: "/sections/clan" },
    { name: "Unité", slug:"unite", path: "/sections/unite" },
];

const PlaceholderBlock = () => (
    <Container fluid className="p-5 d-flex justify-content-center align-items-center" style={{ minHeight: "40vh" }}>
        <Row className="align-items-center flex-column flex-md-row w-100">
            <Col lg={6} className="d-flex justify-content-center order-lg-1">
                <div style={{ width: "100%", maxWidth: "700px" }}>
                    <Placeholder as="div" animation="glow">
                        <Placeholder style={{ height: "400px", width: "100%" }} />
                    </Placeholder>
                </div>
            </Col>
            <Col lg={6} className="d-flex align-items-center order-lg-2 colTextBlock">
                <div className="colTextMotion" style={{ width: "100%", maxWidth: "600px" }}>
                    <Placeholder as="div" animation="glow">
                        <Placeholder style={{ height: "40px", width: "100%" }} className="mb-3" />
                        <Placeholder style={{ height: "200px", width: "100%" }} />
                    </Placeholder>
                </div>
            </Col>
        </Row>
    </Container>
)

const BySectionPage = ({ sectionName }: { sectionName: string }) => {
    const baseURL = import.meta.env.VITE_API_URL;
    const [sectionData, setSectionData] = useState<SectionData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSectionData = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await axios.get(`${baseURL}/sections/${sectionName.toLowerCase()}`);
                const data: SectionData = response.data;

                if (!data) {
                    throw new Error("Section non trouvée");
                }

                setSectionData(data);
            } catch (err) {
                console.error("Erreur lors de la récupération des données", err);
                setError("Impossible de charger les données de la section.");
            } finally {
                setLoading(false);
            }
        };

        fetchSectionData();
    }, [sectionName]);


    if (error) {
        return (
            <Container fluid className="d-flex justify-content-center align-items-center" style={{ height: "85vh" }}>
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container fluid className="p-0">
            {loading ? (
                <PlaceholderBlock />
                ) : (
                sectionData && (
                    <ContentBlock
                        bgImg="/background5.png"
                        title={
                            sectionData.name === "Unité"
                            ? "L'Unité"
                            : sectionData.name === "Clan"
                            ? "Le Clan"
                            : `Les ${sectionData.name}`
                        }
                        text={sectionData.description}
                        subtitle={sectionsPath.filter((section) => section.slug === sectionName.toLowerCase())[0].age}
                        imgSrc={sectionData.showcaseImage}
                    />
                )
            )}

            <Container fluid className="py-3 sticky-container sticky-top" style={{ backgroundColor: "#022864", zIndex: 1050 }}>
                <Row className="g-3">
                    {sectionsPath
                        // .filter((section) => (
                        //     section.slug !== sectionName.toLowerCase()
                        // ))
                        .map((section, index) => (
                            <Col key={index} className="text-center">
                                <Link to={section.path} className="text-decoration-none text-reset">
                                    <div className="group-card-sections rounded-2" data-group={section.slug}>
                                        <h2 className="fs-4 m-0" style={{ fontFamily: "Titan One" }}>
                                            {section.name}
                                        </h2>
                                    </div>
                                </Link>
                            </Col>
                        ))}
                </Row>
            </Container>

            {sectionData && (
                <CarouselBlock 
                    images={sectionData.section_images.map(image => image.image)} 
                    captions={sectionData.section_images.map(image => image.title)} 
                />
            )}

            {sectionName.toLowerCase() !== "unite" && sectionName.toLowerCase() !== "clan" && (
                <Container fluid className="py-4 text-center" style={{ backgroundColor: "#022864" }}>
                    <h3 className="fs-3 mb-3 text-white"
                        style={{ 
                            fontFamily: "Titan One", 
                            color: "white", 
                            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)" 
                        }}
                    >
                        La section est remplie à
                    </h3>
                    <ProgressBar 
                        animated
                        now={sectionData?.filled} 
                        label={`${sectionData?.filled}%`}
                        className="mx-5 fw-bold"
                        variant="warning"
                    />
                </Container>
            )}
                
            <StaffBlock sectionName={sectionName} />

            <Container fluid className="py-3 text-center sticky-container sticky-top" style={{ backgroundColor: "#022864", zIndex: 1100 }}>
                <div className="fs-2 text-white"
                    style={{ 
                        fontFamily: "Titan One", 
                        color: "white", 
                        textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)" 
                    }}
                >
                    Informations pratiques
                </div>
            </Container>

            {sectionData && <InfoCards sectionData={sectionData} chefsData={sectionData.chefs} />}
        </Container>
    );
};

export default BySectionPage;
