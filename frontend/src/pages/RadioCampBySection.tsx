import React, { useEffect, useState } from "react";
import { Container, Form, Button, Alert, Spinner, Image, Modal, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import { BsCalendar3 } from "react-icons/bs";
import axios from "axios";

import { RadioCampData } from '../types/interfaces';
import "../styles/RadioCamps.css";

// ── Section colour palette ─────────────────────────────────
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

function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()!.split(';')[0] || null;
    return null;
}

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("fr-BE", { dateStyle: "short" });

// ──────────────────────────────────────────────────────────
const RadioCampBySection = ({ sectionName }: { sectionName: string }) => {
    const baseURL = import.meta.env.VITE_API_URL;
    const accentColor = SECTION_COLORS[sectionName.toLowerCase()] ?? "#022864";

    const [password, setPassword] = useState("");
    const [validated, setValidated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [radio_camp, setRadioCamp] = useState<RadioCampData>();
    const [error, setError] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState<{ src: string; caption?: string } | null>(null);

    const handleImageClick = (src: string, caption?: string) => {
        setSelectedImage({ src, caption });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedImage(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const csrftoken = getCookie("csrftoken");
            const response = await axios.post(
                `${baseURL}/radio-camps/${sectionName.toLowerCase()}/verify-password/`,
                { password },
                { headers: { "X-CSRFToken": csrftoken || "" }, withCredentials: true }
            );
            if (response.data.success) {
                setValidated(true);
                localStorage.setItem(`radioCampValidated-${sectionName}`, "true");
            } else {
                setError(response.data.error);
            }
        } catch (err) {
            if ((err as any).response?.status === 404) {
                setError("Aucun Radio Camp n'est disponible pour cette section actuellement.");
            } else {
                setError("Une erreur est survenue lors de la vérification du mot de passe.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setValidated(false);
        setRadioCamp(undefined);
        const isValidated = localStorage.getItem(`radioCampValidated-${sectionName}`);
        if (isValidated === "true") setValidated(true);
    }, [sectionName]);

    useEffect(() => {
        setPassword("");
        setError("");
    }, [sectionName]);

    useEffect(() => {
        if (!validated) return;
        const fetchPosts = async () => {
            try {
                const response = await axios.get(`${baseURL}/radio-camps/${sectionName.toLowerCase()}`);
                setRadioCamp(response.data);
            } catch (err) {
                if ((err as any).response?.status === 404) {
                    setError("Aucun Radio Camp n'est disponible pour cette section actuellement.");
                    localStorage.removeItem(`radioCampValidated-${sectionName}`);
                } else {
                    setError("Une erreur est survenue lors du chargement des données.");
                }
            }
        };
        fetchPosts();
    }, [validated, sectionName]);

    // ── Password gate ──────────────────────────────────────
    if (!validated) {
        return (
            <Container
                fluid
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: "82vh", background: "#eef2f9" }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{ width: "100%", maxWidth: "520px", padding: "1.5rem" }}
                >
                    <div className="rc-pw-card" style={{ "--rc-accent": accentColor } as React.CSSProperties}>
                        <h2 className="rc-pw-title">Radio Camp — {sectionName}</h2>
                        <p className="rc-pw-desc">
                            Radio Camp permet aux parents de suivre les aventures de leurs enfants durant le camp.
                            Introduisez le mot de passe fourni par le Staff d'Unité.{" "}
                            Vous ne l'avez pas reçu ?{" "}
                            <a href="/sections/unite" style={{ color: accentColor, fontWeight: 600 }}>
                                Contactez-les ici
                            </a>.
                        </p>
                        <Form onSubmit={handleSubmit}>
                            <Form.Control
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Mot de passe"
                                className="rc-pw-input mb-3"
                            />
                            <div className="d-grid">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="rc-pw-btn"
                                    style={{ backgroundColor: accentColor, borderColor: accentColor }}
                                >
                                    {loading ? <Spinner animation="border" size="sm" /> : "Accéder"}
                                </Button>
                            </div>
                        </Form>
                        {error && (
                            <Alert variant="warning" className="mt-3 mb-0 py-2 text-center" style={{ fontSize: "0.88rem" }}>
                                {error}
                            </Alert>
                        )}
                    </div>
                </motion.div>
            </Container>
        );
    }

    const sortedPosts = [...(radio_camp?.posts ?? [])].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return (
        <Container fluid className="p-0" style={{ background: "#eef2f9", minHeight: "82vh" }}>

            {/* ── Coloured header bar ── */}
            <div className="rc-header-bar" style={{ backgroundColor: "#022864" }}>
                <div className="rc-header-title">
                    {radio_camp?.title ?? "Radio Camp"} — {sectionName}
                </div>
                {radio_camp?.start_date && radio_camp?.end_date && (
                    <div className="rc-header-dates">
                        <BsCalendar3 size={13} />
                        {formatDate(radio_camp.start_date)} – {formatDate(radio_camp.end_date)}
                    </div>
                )}
            </div>

            {sortedPosts.length === 0 ? (
                <Container className="text-center py-5 mt-5">
                    <div style={{ fontFamily: "Titan One", fontSize: "1.35rem", color: "#aaa" }}>
                        Aucun post pour le moment.
                    </div>
                    <div style={{ fontFamily: "Roboto", color: "#bbb", marginTop: "0.4rem", fontSize: "0.95rem" }}>
                        Revenez nous voir bientôt !
                    </div>
                </Container>
            ) : (
                <Container fluid className="px-3 py-5 px-sm-5" style={{ background: "#eef2f9" }}>
                    {/* ── Timeline ── */}
                    <div
                        className="rc-timeline-wrapper mx-auto"
                        style={{ "--rc-accent": accentColor } as React.CSSProperties}
                    >
                        {sortedPosts.map((post, index) => {
                            const isLeft = index % 2 === 0;

                            const cardContent = (
                                <div
                                    className={`rc-card-inner ${isLeft ? "is-left" : "is-right"}`}
                                    style={{ "--rc-border": accentColor } as React.CSSProperties}
                                >
                                    {/* Date chip */}
                                    <div className="rc-post-date" style={{ color: accentColor }}>
                                        <BsCalendar3 size={11} />
                                        {formatDate(post.date)}
                                    </div>

                                    {/* Title */}
                                    <div className="rc-post-title" style={{ color: accentColor }}>
                                        {post.title}
                                    </div>

                                    {/* Content */}
                                    {post.content && (
                                        <p className="rc-post-content">{post.content}</p>
                                    )}

                                    {/* Photos */}
                                    {post.photos.length > 0 && (
                                        <>
                                            <div className="rc-media-divider" style={{ borderColor: accentColor + "33" }} />
                                            <Row className="g-2">
                                                {post.photos.map((photo) => (
                                                    <Col xs={6} sm={4} md={3} key={photo.id}>
                                                        <div
                                                            className="ratio ratio-1x1 rc-photo-thumb"
                                                            onClick={() => handleImageClick(photo.image, photo.caption)}
                                                        >
                                                            <Image
                                                                src={photo.image}
                                                                alt={photo.caption || ""}
                                                                rounded
                                                                style={{ objectFit: "cover", width: "100%", height: "100%" }}
                                                            />
                                                        </div>
                                                        {photo.caption && (
                                                            <small className="d-block text-muted mt-1 text-center">{photo.caption}</small>
                                                        )}
                                                    </Col>
                                                ))}
                                            </Row>
                                        </>
                                    )}

                                    {/* Videos */}
                                    {post.videos.length > 0 && (
                                        <>
                                            <div className="rc-media-divider" style={{ borderColor: accentColor + "33" }} />
                                            <Row className="g-2">
                                                {post.videos.map((video) => (
                                                    <Col xs={12} md={6} key={video.id}>
                                                        <div className="ratio ratio-16x9 rc-video-thumb">
                                                            <video controls style={{ width: "100%", borderRadius: "8px" }}>
                                                                <source src={video.video} type="video/mp4" />
                                                            </video>
                                                        </div>
                                                        {video.caption && (
                                                            <small className="d-block text-muted mt-1 text-center">{video.caption}</small>
                                                        )}
                                                    </Col>
                                                ))}
                                            </Row>
                                        </>
                                    )}
                                </div>
                            );

                            return (
                                <motion.div
                                    key={post.id}
                                    className="rc-tl-item"
                                    initial={{ x: isLeft ? -24 : 24, opacity: 0 }}
                                    whileInView={{ x: 0, opacity: 1 }}
                                    viewport={{ once: true, amount: 0.12 }}
                                    transition={{ duration: 0.45, ease: "easeOut" }}
                                >
                                    {/* Left slot */}
                                    <div className="rc-tl-col rc-tl-left">
                                        {isLeft && cardContent}
                                    </div>

                                    {/* Center dot */}
                                    <div className="rc-tl-center">
                                        <div
                                            className="rc-tl-dot"
                                            style={{ ["--dot-color" as string]: accentColor }}
                                        />
                                    </div>

                                    {/* Right slot */}
                                    <div className="rc-tl-col rc-tl-right">
                                        {!isLeft && cardContent}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </Container>
            )}

            {/* ── Lightbox ── */}
            <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
                <Modal.Body className="p-0 text-center">
                    {selectedImage && (
                        <>
                            <Image
                                src={selectedImage.src}
                                alt={selectedImage.caption || ""}
                                fluid
                                style={{ maxHeight: "80vh", objectFit: "contain", width: "100%", backgroundColor: "black" }}
                            />
                            {selectedImage.caption && (
                                <div className="text-muted m-2 fs-6">{selectedImage.caption}</div>
                            )}
                        </>
                    )}
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default RadioCampBySection;
