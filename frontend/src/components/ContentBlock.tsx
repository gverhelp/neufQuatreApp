import { Container, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import "../styles/Home.css";

interface ContentBlockProps {
    bgColor?: string;
    bgImg?: string;
    title: string;
    subtitle?: string;
    text: string;
    imgSrc: string;
    reverse?: boolean;
}

function ContentBlock({
    title,
    subtitle = "",
    text,
    imgSrc,
    reverse = false,
}: ContentBlockProps) {
    return (
        <Container fluid className="content-block-section">
            <Row className="align-items-center g-4 g-xl-5 justify-content-center">

                {/* Image */}
                <Col
                    lg={6}
                    className={`d-flex justify-content-center ${
                        reverse ? "order-lg-2" : "order-lg-1"
                    }`}
                >
                    <motion.div
                        className="content-block-img-wrap"
                        style={{ maxWidth: "600px", width: "100%" }}
                        initial={{ x: reverse ? 40 : -40, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.65, ease: "easeOut" as const }}
                        viewport={{ once: true }}
                    >
                        <img src={imgSrc} alt={title} />
                    </motion.div>
                </Col>

                {/* Text */}
                <Col
                    lg={6}
                    className={`d-flex align-items-center ${
                        reverse ? "order-lg-1 justify-content-lg-end" : "order-lg-2"
                    }`}
                >
                    <motion.div
                        style={{ maxWidth: "540px", width: "100%" }}
                        initial={{ x: reverse ? -40 : 40, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.65, ease: "easeOut" as const, delay: 0.1 }}
                        viewport={{ once: true }}
                    >
                        {subtitle && (
                            <div className="content-block-subtitle-badge">{subtitle}</div>
                        )}
                        <h1 className="content-block-title">{title}</h1>
                        <div className="content-block-divider" />
                        <p className="content-block-text">{text}</p>
                    </motion.div>
                </Col>

            </Row>
        </Container>
    );
}

export default ContentBlock;