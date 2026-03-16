import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BsGeoAltFill, BsArrowRight } from "react-icons/bs";
import "../styles/RadioCamps.css";

const sections = [
    { label: "Baladins",    top: "28%", left: "13%", path: "/radio-camps/baladins",    delay: 0,    color: "#00A0DD" },
    { label: "Lutins",      top: "68%", left: "25%", path: "/radio-camps/lutins",      delay: 0.15, color: "#CC0739" },
    { label: "Louveteaux",  top: "22%", left: "45%", path: "/radio-camps/louveteaux",  delay: 0.3,  color: "#186E54" },
    { label: "Guides",      top: "55%", left: "47%", path: "/radio-camps/guides",      delay: 0.45, color: "#1D325A" },
    { label: "Éclaireurs",  top: "20%", left: "68%", path: "/radio-camps/eclaireurs",  delay: 0.6,  color: "#015AA9" },
    { label: "Pionniers",   top: "72%", left: "80%", path: "/radio-camps/pionniers",   delay: 0.75, color: "#DA1F29" },
];

const RadioCamps = () => {
    const navigate = useNavigate();

    return (
        <Container fluid className="p-0">

            {/* ── Hero strip ── */}
            <div className="rc-hero-strip fs-2">
                <div className="rc-hero-title">Radio Camp</div>
            </div>

            {/* ── Desktop : carte interactive ── */}
            <div
                className="d-none d-lg-block rc-map-wrapper"
                style={{
                    backgroundImage: "url('/backgroundMap.webp')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                {sections.map((s, index) => (
                    <motion.div
                        key={index}
                        className="rc-map-pin"
                        style={{ top: s.top, left: s.left, "--pin-color": s.color } as React.CSSProperties}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: s.delay, duration: 0.45, ease: "easeOut" }}
                        onClick={() => navigate(s.path)}
                    >
                        <motion.div
                            className="rc-map-card"
                            animate={{ scale: [1, 1.04, 1] }}
                            transition={{
                                duration: 2.8,
                                ease: "easeInOut",
                                repeat: Infinity,
                                delay: index * 0.3,
                            }}
                        >
                            <span className="rc-map-card-label">{s.label}</span>
                        </motion.div>
                        <div className="rc-map-pin-icon">
                            <BsGeoAltFill size={20} />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ── Mobile : grille de cartes ── */}
            <div className="d-block d-lg-none rc-grid-wrapper">
                <Row className="g-4">
                    {sections.map((s, index) => (
                        <Col key={index} xs={12} sm={6}>
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
                            >
                                <div
                                    className="rc-section-card"
                                    style={{ "--pin-color": s.color } as React.CSSProperties}
                                    onClick={() => navigate(s.path)}
                                >
                                    <div className="rc-section-card-header">
                                        <span className="rc-section-card-title">{s.label}</span>
                                    </div>
                                    <div className="rc-section-card-body">
                                        <span className="rc-section-card-cta">
                                            Voir les émissions <BsArrowRight />
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        </Col>
                    ))}
                </Row>
            </div>

        </Container>
    );
};

export default RadioCamps;

