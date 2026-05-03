import { Container, Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    BsGeoAltFill, BsEnvelopeFill, BsArrowUpRight, BsArrowRight,
} from 'react-icons/bs';
import { FaLinkedin, FaGithub } from 'react-icons/fa';

import '../styles/Footer.css';

/* ════════════════════════════════════════════════════════
   CONSTANTS
════════════════════════════════════════════════════════ */

const EXTERNAL_LINKS = [
    { name: 'Les Scouts',   path: 'https://lesscouts.be/fr',              description: 'Site officiel' },
    // { name: 'Les Guides',   path: 'https://www.guides.be/',               description: 'Site officiel' },
    { name: 'La Scouterie', path: 'https://www.lascouterie-economats.be/', description: 'Économat' },
];

const INTERNAL_LINKS = [
    { name: 'Accueil',            path: '/' },
    { name: 'Agenda',             path: '/agenda' },
    { name: 'Sections',       path: '/sections' },
    { name: 'Radio camp',         path: '/radio-camps' },
    { name: 'Infos & documents',  path: '/documents-et-infos' },
];

/* ════════════════════════════════════════════════════════
   FOOTER
════════════════════════════════════════════════════════ */

const Footer = () => (
    <footer className="ft-footer">
        <div className="ft-top-rule" aria-hidden />

        {/* <div className="ft-deco" aria-hidden>
            <BsCompass size={260} />
        </div> */}

        <Container className="ft-container">
            <Row className="gy-4">

                {/* ── À propos ── */}
                <Col lg={4} md={6}>
                    <div className="ft-brand">
                        <img
                            src="/les_scouts.png"
                            alt="Logo LC94 Saint-Augustin"
                            className="ft-logo"
                        />
                        <div>
                            <div className="ft-brand-eyebrow">Unité scoute</div>
                            <div className="ft-brand-name">94<sup>ème</sup> Saint-Augustin</div>
                        </div>
                    </div>

                    <p className="ft-brand-tagline">
                        Une grande famille scoute à Forest, de 6 à 18 ans.
                        De l'aventure, des valeurs et beaucoup d'amitiés.
                    </p>

                    <div className="ft-contact-block">
                        <a
                            href="https://maps.google.com/?q=Avenue+Saint-Augustin+16,+1190+Forest,+Bruxelles"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ft-contact-row"
                        >
                            <span className="ft-contact-icon"><BsGeoAltFill size={13} /></span>
                            <div className="ft-contact-text">
                                <span>Avenue Saint-Augustin, 16</span>
                                <span className="ft-contact-sub">1190 Bruxelles — Forest</span>
                            </div>
                        </a>

                        <a
                            href="mailto:unitesaintaugustin94@gmail.com"
                            className="ft-contact-row"
                        >
                            <span className="ft-contact-icon"><BsEnvelopeFill size={13} /></span>
                            <div className="ft-contact-text">
                                <span>unitesaintaugustin94@gmail.com</span>
                                <span className="ft-contact-sub">Écrire au staff d'unité</span>
                            </div>
                        </a>
                    </div>
                </Col>

                {/* ── Navigation interne ── */}
                <Col lg={3} md={6}>
                    <h5 className="ft-heading">Naviguer</h5>
                    <ul className="ft-list">
                        {INTERNAL_LINKS.map(l => (
                            <li key={l.path}>
                                <Link to={l.path} className="ft-link">
                                    <BsArrowRight size={11} className="ft-link-arrow" />
                                    <span>{l.name}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </Col>

                {/* ── Liens utiles ── */}
                <Col lg={5} md={12}>
                    <h5 className="ft-heading">Liens utiles</h5>
                    <div className="ft-ext-grid">
                        {EXTERNAL_LINKS.map(l => (
                            <a
                                key={l.name}
                                href={l.path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ft-ext-card"
                            >
                                <div className="ft-ext-head">
                                    <span className="ft-ext-name">{l.name}</span>
                                    <BsArrowUpRight size={12} className="ft-ext-arrow" />
                                </div>
                                <span className="ft-ext-desc">{l.description}</span>
                            </a>
                        ))}
                    </div>
                </Col>
            </Row>

            {/* ── Bottom bar ── */}
            <div className="ft-bottom">
                <div className="ft-bottom-text">
                    © {new Date().getFullYear()} LC94 Saint-Augustin - Tous droits réservés.
                    <span className="ft-bottom-sep">·</span>
                    Développé par Garreth Verhelpen <span className="ft-totem">(Ocelot)</span>
                </div>

                <div className="ft-socials">
                    <motion.a
                        href="https://www.linkedin.com/in/gverhelp/"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.22 }}
                        className="ft-social"
                        aria-label="LinkedIn de Garreth Verhelpen"
                    >
                        <FaLinkedin />
                    </motion.a>
                    <motion.a
                        href="https://github.com/gverhelp"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.22 }}
                        className="ft-social"
                        aria-label="GitHub de Garreth Verhelpen"
                    >
                        <FaGithub />
                    </motion.a>
                </div>
            </div>
        </Container>
    </footer>
);

export default Footer;
