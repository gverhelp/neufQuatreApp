import React, { useEffect, useState } from 'react';
import axios from 'axios';

import '../styles/Home.css';
import { AccueilItem, AccueilButton } from '../types/interfaces';
import ContentBlock from '../components/ContentBlock';
import ParallaxBlock from '../components/ParallaxBlock';
import ImageBlock from '../components/ImageBlock';
import { Container, Placeholder, Alert, Row, Col } from 'react-bootstrap';


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

const Home: React.FC = () => {
    const baseURL = import.meta.env.VITE_API_URL;
    const [accueilItems, setAccueilItems] = useState<AccueilItem[]>([]);
    const [accueilButtons, setAccueilButton] = useState<AccueilButton[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const responseItems = await axios.get<AccueilItem[]>(`${baseURL}/accueil-items/`);
                const responseButtons = await axios.get(`${baseURL}/accueil-buttons`);

                const dataItems: AccueilItem[] = responseItems.data;
                const dataButtons: AccueilButton[] = responseButtons.data;

                setAccueilItems(dataItems.sort((a, b) => a.id - b.id));
                setAccueilButton(dataButtons.sort((a, b) => a.id - b.id));

            } catch (error) {

                console.error('Erreur lors de la récupération des données :', error);
                setError("Impossible de charger les données");

            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);


    if (error) {
        return (
            <Container fluid className="d-flex justify-content-center align-items-center" style={{ height: "85vh" }}>
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    return (
        <>
            <ParallaxBlock buttons={accueilButtons}/>

            {loading ? 
                <PlaceholderBlock /> :
                <ContentBlock 
                    bgImg="background5.png"
                    title={accueilItems[0]?.titre}
                    text={accueilItems[0]?.description}
                    imgSrc={accueilItems[0]?.image}
                    reverse={false}
                />
            }

            <ImageBlock/>

            {loading ? 
                <PlaceholderBlock /> :
                <ContentBlock
                    bgImg="background7.png" 
                    title={accueilItems[1]?.titre}
                    text={accueilItems[1]?.description}
                    imgSrc={accueilItems[1]?.image}
                    reverse={true}
                />
            }
        </>
    );
};
  
export default Home;