import { Link } from "react-router-dom";
import { motion, Variants } from "framer-motion";
import axios from "axios";
import { useEffect, useState } from "react";
import { BsArrowRight } from "react-icons/bs";

import { Container, Row, Col } from "react-bootstrap";
import CarouselBlock from "../components/CarouselBlock";
import { SectionImagesData } from "../types/interfaces";
import '../styles/Sections.css';


const sections = [
    {
        name: "Baladins",
        slug: "baladins",
        color: "#00A0DD",
        age: "6 – 8 ans",
        genre: "Mixte",
        description: "À la ribambelle, je prends confiance, je découvre et je m'émerveille.",
        path: "/sections/baladins",
    },
    {
        name: "Lutins",
        slug: "lutins",
        color: "#CC0739",
        age: "8 – 12 ans",
        genre: "Filles",
        description: "À la ronde, je grandis, j'écoute, je partage et j'apprends à coopérer.",
        path: "/sections/lutins",
    },
    {
        name: "Louveteaux",
        slug: "louveteaux",
        color: "#186E54",
        age: "8 – 12 ans",
        genre: "Garçons",
        description: "À la meute, je vis la nature, je coopère et je grandis avec les autres.",
        path: "/sections/louveteaux",
    },
    {
        name: "Guides",
        slug: "guides",
        color: "#1D325A",
        age: "12 – 16 ans",
        genre: "Filles",
            description: "À la compagnie, je construis des projets, je prends des responsabilités et je gagne en autonomie.",
        path: "/sections/guides",
    },
    {
        name: "Éclaireurs",
        slug: "eclaireurs",
        color: "#015AA9",
        age: "12 – 16 ans",
        genre: "Garçons",
            description: "À la troupe, je participe à des projets collectifs, je prends des responsabilités et je développe mon esprit d'équipe.",
        path: "/sections/eclaireurs",
    },
    {
        name: "Pionniers",
        slug: "pionniers",
        color: "#DA1F29",
        age: "16 – 18 ans",
        genre: "Mixte",
        description: "Au poste, je m'engage, je mène des projets et j'agis selon mes convictions.",
        path: "/sections/pionniers",
    },
    {
        name: "Clan",
        slug: "clan",
        color: "#FEB800",
        age: "18 ans +",
        genre: "Mixte",
        description: "Au clan, je transmets, je partage mon expérience et j'accompagne les plus jeunes.",
        path: "/sections/clan",
    },
    {
        name: "Unité",
        slug: "unite",
        color: "#022864",
        age: "—",
        genre: "Mixte",
        description: "À l'unité, je contribue à la vie collective et aux projets de toute l'unité.",
        path: "/sections/unite",
    },
];

const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07 } },
};

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};


const Sections = () => {
    const baseURL = import.meta.env.VITE_API_URL;
    const [sectionImages, setSectionImages] = useState<SectionImagesData[]>([]);

    useEffect(() => {
        const fetchSectionImages = async () => {
            try {
                const response = await axios.get(`${baseURL}/section-images/`);
                const data: SectionImagesData[] = response.data;
                const selectedImages = data.filter((image) => image.section === "global");
                if (selectedImages) setSectionImages(selectedImages);
            } catch (err) {
                console.error("Erreur lors de la récupération des images", err);
            }
        };
        fetchSectionImages();
    }, []);

    return (
        <Container fluid className="p-0">
            <CarouselBlock
                images={sectionImages.map((image) => image.image)}
                captions={sectionImages.map((image) => image.title)}
            />

            {/* Intro strip */}
            <div className="sections-intro-strip">
                <h2 className="sections-intro-title">Nos sections</h2>
                <p className="sections-intro-sub">
                    Du premier foulard aux plus grandes aventures, trouve ta place dans l'unité.
                </p>
            </div>

            {/* Cards grid */}
            <Container
                fluid
                className="sections-grid-wrapper"
            >
                <Container>
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.05 }}
                    >
                        <Row className="g-4">
                            {sections.map((section) => (
                                <Col key={section.slug} xl={3} md={4} sm={6} xs={12}>
                                    <motion.div variants={cardVariants} className="h-100">
                                        <Link to={section.path} className="text-decoration-none">
                                            <div
                                                className="section-card"
                                                style={{ ["--sc-color" as string]: section.color }}
                                            >
                                                {/* Colored header */}
                                                <div className="section-card-header">
                                                    <span className="section-card-name">{section.name}</span>
                                                    <span className="section-card-genre-badge">{section.genre}</span>
                                                </div>

                                                {/* Body */}
                                                <div className="section-card-body">
                                                    <span className="section-card-age">{section.age}</span>
                                                    <p className="section-card-desc">{section.description}</p>
                                                    <div className="section-card-cta">
                                                        Découvrir
                                                        <BsArrowRight size={14} className="section-card-arrow" />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                </Col>
                            ))}
                        </Row>
                    </motion.div>
                </Container>
            </Container>
        </Container>
    );
};

export default Sections;