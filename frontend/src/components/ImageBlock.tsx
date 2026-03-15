import { Container } from "react-bootstrap";
import { motion } from "framer-motion";
import { BsChevronDown } from "react-icons/bs";
import "../styles/Home.css";

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 32 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" as const, delay },
    viewport: { once: true },
});

function ImageBlock() {
    return (
        <Container
            fluid
            className="overflow-hidden text-center text-white px-0 position-relative"
        >
            {/* Image with subtle Ken Burns entrance */}
            <motion.img
                src="background8.webp"
                alt="Scouts en action"
                className="w-100 d-block"
                style={{ height: "82vh", objectFit: "cover", objectPosition: "center" }}
                initial={{ scale: 1.06 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 1.4, ease: "easeOut" as const }}
                viewport={{ once: true }}
            />

            {/* Gradient overlay */}
            <div
                className="position-absolute top-0 start-0 w-100 h-100"
                style={{
                    background: "linear-gradient(170deg, rgba(0,0,0,0.18) 0%, rgba(2,40,100,0.72) 100%)",
                    zIndex: 1,
                }}
            />

            {/* Centered content */}
            <div
                className="position-absolute top-50 start-50 translate-middle w-100 px-3 px-md-5 text-white"
                style={{ zIndex: 2, maxWidth: "820px" }}
            >
                <motion.h2
                    style={{
                        fontFamily: "Titan One",
                        fontSize: "clamp(2.4rem, 6.5vw, 4.2rem)",
                        textShadow: "2px 4px 14px rgba(0,0,0,0.45)",
                        lineHeight: 1.08,
                        marginBottom: 0,
                    }}
                    {...fadeUp(0.12)}
                >
                    Le scoutisme
                </motion.h2>

                <motion.div className="image-block-divider" {...fadeUp(0.22)} />

                <motion.p
                    style={{
                        fontSize: "clamp(0.98rem, 2.2vw, 1.25rem)",
                        fontWeight: 400,
                        lineHeight: 1.7,
                        textShadow: "1px 2px 6px rgba(0,0,0,0.4)",
                        color: "rgba(255,255,255,0.88)",
                        margin: 0,
                    }}
                    {...fadeUp(0.3)}
                >
                    Un mouvement de jeunesse qui veut contribuer à l'éducation des jeunes
                    pour les aider à devenir des citoyens critiques et engagés.
                </motion.p>
            </div>
        </Container>
    );
}

export default ImageBlock;
