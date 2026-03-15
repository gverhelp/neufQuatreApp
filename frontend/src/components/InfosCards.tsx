import { motion } from 'framer-motion';
import { Container, Row, Col } from 'react-bootstrap';
import { SectionData } from '../types/interfaces';
import '../styles/Sections.css';
import {
    BsEnvelopeFill,
    BsCreditCard2Front,
    BsBroadcast,
} from 'react-icons/bs';
import { FaTshirt } from 'react-icons/fa';

/* ── Wrapper de carte avec animation ── */
const InfoCard = ({
    title,
    icon,
    children,
    delay = 0,
    colProps = { md: 6 },
}: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    delay?: number;
    colProps?: object;
}) => (
    <Col {...colProps}>
        <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay }}
            viewport={{ once: true }}
            className="h-100"
        >
            <div className="info-card h-100">
                <div className="info-card-title">
                    {icon}
                    {title}
                </div>
                <div className="info-card-body">{children}</div>
            </div>
        </motion.div>
    </Col>
);

/* ── Composant principal ── */
function InfoCards({ sectionData }: { sectionData: SectionData }) {
    return (
        <Container
            fluid
            className="px-3 py-5 px-sm-5"
            style={{ background: '#eef2f9' }}
        >
            <Container className="px-0">
                <Row className="justify-content-center align-items-stretch g-4">

                    {/* ── Uniforme (pleine largeur) ── */}
                    <InfoCard
                        title="Uniforme"
                        icon={<FaTshirt size={15} />}
                        delay={0}
                        colProps={{ md: 12 }}
                    >
                        <p className="info-card-text">{sectionData.uniformDescription}</p>

                        <Row className="g-3 mt-1 mb-4">
                            <Col xs={12}>
                                <img
                                    src="/UniformePourTous.webp"
                                    alt="Uniforme pour tous"
                                    className="rounded-3 shadow-sm w-100"
                                    style={{ maxHeight: '240px', objectFit: 'contain', background: '#f6f9fc' }}
                                />
                            </Col>
                            {sectionData.uniformImage && (
                                <Col xs={12}>
                                    <img
                                        src={sectionData.uniformImage}
                                        alt="Uniforme de section"
                                        className="rounded-3 shadow-sm w-100"
                                        style={{ maxHeight: '240px', objectFit: 'contain', background: '#f6f9fc' }}
                                    />
                                </Col>
                            )}
                        </Row>

                        <p className="info-card-cta-label">
                            Besoin d'acheter un insigne ou un uniforme ?
                        </p>
                        <a
                            href="https://www.lascouterie-economats.be/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="info-card-btn"
                        >
                            Boutique de la Scouterie
                        </a>
                    </InfoCard>

                    {/* ── Contacts ── */}
                    <InfoCard
                        title="Contacts"
                        icon={<BsEnvelopeFill size={14} />}
                        delay={0.1}
                    >
                        <p className="info-card-text">
                            Besoin d'informations ? Vous pouvez contacter le staff de la
                            section via l'email ci-dessous :
                        </p>

                        {sectionData.email ? (
                            <a
                                href={`mailto:${sectionData.email}`}
                                className="info-card-email-pill"
                            >
                                {sectionData.email}
                            </a>
                        ) : (
                            <span
                                className="text-muted fst-italic"
                                style={{ fontSize: '0.88rem' }}
                            >
                                Email non disponible pour le moment.
                            </span>
                        )}
                    </InfoCard>

                    {/* ── Compte bancaire (masqué pour le Clan) ── */}
                    {sectionData.name !== 'Clan' && (
                        <InfoCard
                            title="Compte bancaire"
                            icon={<BsCreditCard2Front size={15} />}
                            delay={0.2}
                        >
                            <p className="info-card-text">
                                Tous les virements nécessaires aux événements liés à cette
                                section (week-ends, activités, camp) sont à faire sur le
                                compte bancaire suivant :
                            </p>

                            {sectionData.bankAccount ? (
                                <div className="info-card-account-pill">
                                    {sectionData.bankAccount}
                                </div>
                            ) : (
                                <span
                                    className="text-muted fst-italic"
                                    style={{ fontSize: '0.88rem' }}
                                >
                                    Compte bancaire non disponible pour le moment.
                                </span>
                            )}

                            <p className="info-card-note mt-3">
                                Merci de mentionner en communication le nom et prénom de votre
                                enfant ainsi que l'activité concernée.
                            </p>
                        </InfoCard>
                    )}

                    {/* ── Radio camp (pleine largeur, masqué pour Unité et Clan) ── */}
                    {!['Unité', 'Clan'].includes(sectionData.name) && (
                        <InfoCard
                            title="Radio camp"
                            icon={<BsBroadcast size={15} />}
                            delay={0.3}
                            colProps={{ md: 12 }}
                        >
                            <p className="info-card-text">
                                Radio camp est un outil mis à la disposition des parents pour
                                suivre les aventures de leurs enfants durant le camp. Cliquez
                                sur le bouton ci-dessous et introduisez le mot de passe fourni
                                par le staff.
                            </p>
                            <a
                                href={`/radio-camps/${sectionData.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="info-card-btn"
                            >
                                Accéder au Radio camp
                            </a>
                        </InfoCard>
                    )}

                </Row>
            </Container>
        </Container>
    );
}

export default InfoCards;