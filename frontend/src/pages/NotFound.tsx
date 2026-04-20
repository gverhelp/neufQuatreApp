import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BsArrowLeft, BsCompass, BsPeopleFill, BsCalendarEvent, BsGeoAltFill } from 'react-icons/bs';

import '../styles/NotFound.css';

/* ════════════════════════════════════════════════════════
   CONSTANTS
════════════════════════════════════════════════════════ */

const QUICK_LINKS = [
    { to: '/',          label: 'Accueil',       icon: <BsGeoAltFill size={14} /> },
    { to: '/sections',  label: 'Nos sections',  icon: <BsPeopleFill size={14} /> },
    { to: '/agenda',    label: 'Agenda',        icon: <BsCalendarEvent size={14} /> },
];

/* ════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════ */

const NotFound = () => (
    <section className="nf-wrap">
        <div className="nf-bg" aria-hidden />
        <div className="nf-tint" aria-hidden />

        <Container className="nf-container">
            {/* <motion.div
                className="nf-eyebrow"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
            >
                <BsCompass size={12} />
                <span>Piste introuvable</span>
            </motion.div> */}

            <motion.h1
                className="nf-code"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            >
                4
                <motion.span
                    className="nf-zero"
                    initial={{ rotate: -180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ duration: 0.9, delay: 0.35, ease: 'easeOut' }}
                >
                    <BsCompass />
                </motion.span>
                4
            </motion.h1>

            <motion.div
                className="nf-rule"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.45, delay: 0.55 }}
            />

            <motion.h2
                className="nf-title"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.65 }}
            >
                Oups, cette piste s'est perdue dans les bois
            </motion.h2>

            <motion.p
                className="nf-text"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
            >
                La page que tu cherches n'existe pas, ou elle a pris un autre sentier.
                Pas de panique, sors la boussole, voici par où rejoindre le camp de base.
            </motion.p>

            <motion.div
                className="nf-actions"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.95 }}
            >
                <Link to="/" className="nf-btn nf-btn-primary">
                    {/* <BsArrowLeft size={14} /> */}
                    Retour à l'accueil
                </Link>

                <div className="nf-quick">
                    <div className="nf-quick-list">
                        {QUICK_LINKS.map(l => (
                            <Link key={l.to} to={l.to} className="nf-quick-link">
                                {l.icon}
                                <span>{l.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </motion.div>
        </Container>
    </section>
);

export default NotFound;
