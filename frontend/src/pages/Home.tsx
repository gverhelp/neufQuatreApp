import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    BsCalendar3,
    BsPeopleFill,
    BsFileEarmarkTextFill,
    BsBroadcast,
    BsArrowRight,
} from 'react-icons/bs';

import '../styles/Home.css';
import { AccueilItem, AccueilButton } from '../types/interfaces';
import ContentBlock from '../components/ContentBlock';
import ParallaxBlock from '../components/ParallaxBlock';
import ImageBlock from '../components/ImageBlock';
import { Container, Placeholder, Alert, Row, Col } from 'react-bootstrap';

/* ─── Quick-access navigation cards ─── */
const QUICK_LINKS = [
    {
        to: '/agenda',
        icon: <BsCalendar3 size={22} />,
        title: 'Agenda',
        desc: "Consulte le programme de nos activités et les événements à venir.",
    },
    {
        to: '/sections',
        icon: <BsPeopleFill size={22} />,
        title: 'Nos sections',
        desc: "Découvre toutes nos sections, des Baladins jusqu'au Clan.",
    },
    {
        to: '/radio-camps',
        icon: <BsBroadcast size={22} />,
        title: 'Radio Camps',
        desc: "Reviens sur nos camps avec photos, vidéos et souvenirs.",
    },
    {
        to: '/documents-et-infos',
        icon: <BsFileEarmarkTextFill size={22} />,
        title: 'Infos & docs',
        desc: "Retrouve nos documents importants et toutes les infos pratiques.",
    },
];

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
    hidden: { y: 28, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.48, ease: [0.25, 0.1, 0.25, 1] as const } },
};

const QuickAccessCards: React.FC = () => (
    <section className="qac-section">
        <Container>
            <div className="text-center mb-0">
                <h2 className="qac-title">Tout ce qu'il faut savoir sur la vie de la 94ème, en un clic.</h2>
            </div>

            <motion.div
                className="qac-grid"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
            >
                {QUICK_LINKS.map((item) => (
                    <motion.div key={item.to} variants={cardVariants} style={{ height: '100%' }}>
                        <Link to={item.to} className="qac-card" style={{ height: '100%' }}>
                            <div className="qac-icon-wrap">{item.icon}</div>
                            <div className="qac-card-title">{item.title}</div>
                            <p className="qac-card-desc">{item.desc}</p>
                            <span className="qac-card-arrow">
                                Voir <BsArrowRight size={13} />
                            </span>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>
        </Container>
    </section>
);


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

            <QuickAccessCards />

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