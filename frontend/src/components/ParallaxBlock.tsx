import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import "../styles/Home.css";
import { AccueilButton } from "../types/interfaces";
import { Modal, Button } from 'react-bootstrap';


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

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);


    return (
        <div ref={ref} className="position-relative text-center text-white overflow-hidden">
            <motion.img
                src="background4.webp"
                alt="Parallax Background"
                className="img-fluid w-100"
                style={{ height: "80vh", objectFit: "cover", y }}
            />
            <div
                className="position-absolute top-0 start-0 w-100 h-100"
                style={{ zIndex: 1 }}
            ></div>
            <div className="position-absolute top-50 start-50 translate-middle w-75 text-white" style={{ zIndex: 2 }}>
                <motion.div
                    className="fs-1"
                    style={{ fontFamily: "Titan One", textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)" }}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, ease: "easeOut" }}
                >
                    94ème Unité Saint-Augustin
                </motion.div>
                <motion.div
                    className="fs-2 fw-medium"
                    style={{ textShadow: "1px 1px 3px rgba(0, 0, 0, 0.5)" }}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, ease: "easeOut" }}
                >
                    Probably the best Unité in the world.
                </motion.div>
                <motion.div 
                    className="mt-4 d-flex flex-column flex-md-row align-items-center justify-content-center"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1, ease: "easeOut" }}
                >
                    <>
                        <a 
                            href={buttons[0]?.link || "#"} 
                            target={buttons[0]?.link ? "_blank" : undefined}
                            rel={buttons[0]?.link ? "noopener noreferrer" : undefined}
                            className="home-btn rounded-2 d-inline-block text-decoration-none text-center mb-3 mb-md-0 me-md-3"
                            style={{ 
                                width: "200px",
                                fontFamily: "Titan One", 
                                color: "white", 
                                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)" 
                            }}
                            onClick={e => {
                                if (!buttons[0]?.link) {
                                    e.preventDefault();
                                    setShowModal(true);
                                }
                            }}
                        >
                            S'inscrire
                        </a>
                        <Modal
                            show={showModal}
                            onHide={() => setShowModal(false)}
                            centered
                        >
                            <Modal.Header closeButton>
                                <Modal.Title>Inscriptions indisponibles</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <div className="text-center">
                                    <p>Les inscriptions pour l'année prochaine ne sont pas ouvertes pour le moment.
                                        Revenez un peu plus tard ou contactez-nous pour plus d'informations.
                                    </p>
                                </div>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button
                                    className="download-btn rounded-2 d-inline-block text-decoration-none text-center"
                                    style={{
                                        backgroundColor: "#022864",
                                        borderColor: "#022864",
                                        textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)" 
                                    }}
                                    onClick={() => setShowModal(false)}
                                >
                                    D'accord
                                </Button>
                            </Modal.Footer>
                        </Modal>
                    </>
                    <a 
                        href={buttons[1]?.link || "#"} 
                        target={buttons[1]?.link ? "_blank" : undefined}
                        rel={buttons[1]?.link ? "noopener noreferrer" : undefined}
                        className="home-btn rounded-2 d-inline-block text-decoration-none text-center"
                        style={{ 
                            width: "200px",
                            fontFamily: "Titan One", 
                            color: "white", 
                            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)" 
                        }}
                    >
                        Nous contacter
                    </a>
                </motion.div>
            </div>
        </div>
    );
};

export default ParallaxBlock;