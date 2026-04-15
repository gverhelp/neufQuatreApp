import { Container, Row, Col, Alert } from "react-bootstrap";
import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ChefData } from "../types/interfaces";
import { FaUserCircle } from "react-icons/fa";

import "../styles/Sections.css";

/* ── Couleur d'accent par section ── */
const SECTION_COLORS: Record<string, string> = {
    baladins:   "#00A0DD",
    lutins:     "#CC0739",
    louveteaux: "#186E54",
    guides:     "#1D325A",
    eclaireurs: "#015AA9",
    pionniers:  "#DA1F29",
    clan:       "#FEB800",
    unite:      "#022864",
};

/* ── Carte chef ── */
const StaffCard = ({
    member,
    accentColor,
}: {
    member: ChefData;
    accentColor: string;
}) => (
    <div
        className="staff-card-v2"
        style={{ "--accent": accentColor } as React.CSSProperties}
    >
        <div className="staff-card-v2-img">
            {member.image ? (
                <img src={member.image} alt={member.totem} />
            ) : (
                <div className="staff-card-v2-placeholder">
                    <FaUserCircle size={80} color={accentColor} />
                </div>
            )}
        </div>

        <div className="staff-card-v2-body">
            <div className="staff-card-v2-totem-row">
                <div className="staff-card-v2-totem">{member.totem}</div>
                {member.chefResp && (
                    <span className="staff-card-v2-badge">Chef responsable</span>
                )}
            </div>
            <div className="staff-card-v2-name">{member.name}</div>
            {member.bafouille && (
                <p className="staff-card-v2-bio">{member.bafouille}</p>
            )}
        </div>
    </div>
);

/* ── Carte fantôme (chargement) ── */
const PlaceholderCard = ({ accentColor }: { accentColor: string }) => (
    <div
        className="staff-card-v2 is-ghost"
        style={{ "--accent": accentColor } as React.CSSProperties}
    >
        <div className="staff-card-v2-img" />

        <div className="staff-card-v2-body placeholder-glow">
            <span
                className="placeholder col-7 mb-2 d-block"
                style={{ height: "22px", borderRadius: "6px" }}
            />
            <span
                className="placeholder col-5 mb-3 d-block"
                style={{ height: "14px", borderRadius: "4px" }}
            />
            <span className="placeholder col-10 d-block mb-1" style={{ height: "12px", borderRadius: "4px" }} />
            <span className="placeholder col-8  d-block mb-1" style={{ height: "12px", borderRadius: "4px" }} />
            <span className="placeholder col-6  d-block"      style={{ height: "12px", borderRadius: "4px" }} />
        </div>
    </div>
);

/* ── Bloc principal ── */
const StaffBlock = ({ sectionName }: { sectionName: string }) => {
    const baseURL   = import.meta.env.VITE_API_URL;
    const [loading, setLoading]   = useState(true);
    const [error,   setError]     = useState<string | null>(null);
    const [chefs,   setChefs]     = useState<ChefData[]>([]);

    const accentColor =
        SECTION_COLORS[sectionName.toLowerCase()] ?? "#022864";

    const blockTitle = (() => {
        if (sectionName === "Unite")      return "Les chefs d'Unité";
        if (sectionName === "Eclaireurs") return "Les chefs Éclaireurs";
        if (sectionName === "Clan")       return "Les animateurs du Clan";
        return `Les chefs ${sectionName}`;
    })();

    useEffect(() => {
        const fetchChefs = async () => {
            try {
                setLoading(true);
                setError(null);

                const { data } = await axios.get<ChefData[]>(`${baseURL}/chefs/`);
                const filtered = data.filter(
                    (m) => m.section.toLowerCase() === sectionName.toLowerCase()
                );
                filtered.sort((a, b) => (b.chefResp ? 1 : 0) - (a.chefResp ? 1 : 0));
                setChefs(filtered);
            } catch (err) {
                console.error("Erreur lors de la récupération des données", err);
                setError("Impossible de charger les données. Veuillez réessayer plus tard.");
            } finally {
                setLoading(false);
            }
        };

        fetchChefs();
    }, [sectionName]);

    return (
        <Container fluid className="px-3 py-5 px-sm-5" style={{ background: "#eef2f9" }}>

            {/* En-tête de section */}
            <motion.div
                className="staff-block-header"
                initial={{ opacity: 0, y: -12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                viewport={{ once: true }}
            >
                <span className="staff-block-header-title">{blockTitle}</span>
            </motion.div>

            {/* Chargement */}
            {loading && (
                <Row className="g-4 justify-content-center mt-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Col key={i} md={8} lg={6} xl={4}>
                            <PlaceholderCard accentColor={accentColor} />
                        </Col>
                    ))}
                </Row>
            )}

            {/* Erreur */}
            {error && (
                <div className="text-center mt-4">
                    <Alert variant="warning">{error}</Alert>
                </div>
            )}

            {/* Contenu */}
            {!loading && !error && (
                chefs.length > 0 ? (
                    <Row className="g-4 justify-content-center mt-2">
                        {chefs.map((member, index) => (
                            <Col key={member.id} md={8} lg={6} xl={4}>
                                <motion.div
                                    initial={{ y: 40, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    transition={{
                                        duration: 0.55,
                                        ease: "easeOut",
                                        delay: index * 0.07,
                                    }}
                                    viewport={{ once: true }}
                                    className="h-100"
                                >
                                    <StaffCard member={member} accentColor={accentColor} />
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <p
                        className="text-center mt-4 fs-5"
                        style={{ fontFamily: "Titan One", color: accentColor }}
                    >
                        Il semble qu'il n'y ait aucun chef dans cette section.
                    </p>
                )
            )}
        </Container>
    );
};

export default StaffBlock;