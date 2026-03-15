import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import "../styles/Home.css";
import { AccueilButton } from "../types/interfaces";
import { Modal, Button } from 'react-bootstrap';
import { BsArrowDown, BsEnvelopeFill, BsPencilFill } from "react-icons/bs";

interface ParallaxBlockProps {
    buttons: AccueilButton[];
}

const ParallaxBlock: React.FC<ParallaxBlockProps> = ({ buttons }) => {
    const [showModal, setShowModal] = useState(false);
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "45%"]);

    return (
        <div ref={ref} className="pb-wrapper">
            {/* Parallax image */}
            <motion.img
                src="background4.webp"
                alt="Parallax Background"
                className="pb-bg"
                style={{ y }}
            />

            {/* Dark gradient overlay */}
            <div className="pb-overlay" />

            {/* Content */}
            <div className="pb-content">
                {/* Title */}
                <motion.h1
                    className="pb-title"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.55, ease: "easeOut" }}
                >
                    94ème Unité<br />Saint-Augustin
                </motion.h1>

                {/* Divider */}
                <motion.div
                    className="pb-divider"
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.45, ease: "easeOut" }}
                />

                {/* Subtitle */}
                <motion.p
                    className="pb-subtitle"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.85, duration: 0.5, ease: "easeOut" }}
                >
                    Probably the best Unité in the world.
                </motion.p>

                {/* CTA buttons */}
                <motion.div
                    className="pb-actions"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1, duration: 0.5, ease: "easeOut" }}
                >
                    <a
                        href={buttons[0]?.link || "#"}
                        target={buttons[0]?.link ? "_blank" : undefined}
                        rel={buttons[0]?.link ? "noopener noreferrer" : undefined}
                        className="pb-btn pb-btn-primary"
                        onClick={e => {
                            if (!buttons[0]?.link) {
                                e.preventDefault();
                                setShowModal(true);
                            }
                        }}
                    >
                        <BsPencilFill size={14} />
                        S'inscrire
                    </a>

                    <a
                        href={buttons[1]?.link || "#"}
                        target={buttons[1]?.link ? "_blank" : undefined}
                        rel={buttons[1]?.link ? "noopener noreferrer" : undefined}
                        className="pb-btn pb-btn-outline"
                    >
                        <BsEnvelopeFill size={14} />
                        Nous contacter
                    </a>
                </motion.div>
            </div>

            {/* Scroll cue */}
            <div className="pb-scroll-cue">
                <BsArrowDown size={16} />
                <span>Défiler</span>
            </div>

            {/* Modal — inscriptions indisponibles */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title style={{ fontFamily: "Titan One", color: "#022864" }}>
                        Inscriptions indisponibles
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-0 text-center" style={{ fontFamily: "Roboto", color: "#4b5563", lineHeight: 1.7 }}>
                        Les inscriptions pour l'année prochaine ne sont pas ouvertes pour le moment.
                        Revenez un peu plus tard ou contactez-nous pour plus d'informations.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        className="download-btn rounded-2"
                        style={{ backgroundColor: "#022864", borderColor: "#022864" }}
                        onClick={() => setShowModal(false)}
                    >
                        D'accord
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ParallaxBlock;