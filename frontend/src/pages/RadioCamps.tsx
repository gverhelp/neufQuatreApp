import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Container } from 'react-bootstrap';
import {
    BsArrowRight, BsGeoAltFill, BsCompass,
    BsShieldLockFill, BsCameraReelsFill, BsBroadcastPin,
} from 'react-icons/bs';

import '../styles/RadioCamps.css';
import {
    fadeUp,
    staggerContainer,
    staggerItem,
    heroTitle,
    heroRule,
    heroSubtitle,
} from '../styles/motion';

/* ════════════════════════════════════════════════════════
   CONSTANTS
════════════════════════════════════════════════════════ */

interface Destination {
    slug: string;
    label: string;
    band: string;
    color: string;
    // percentage position on the map background
    top: string;
    left: string;
    path: string;
}

const DESTINATIONS: Destination[] = [
    { slug: 'baladins',   label: 'Baladins',   band: 'Ribambelle', color: '#00A0DD', top: '28%', left: '18%', path: '/radio-camps/baladins'   },
    { slug: 'lutins',     label: 'Lutins',     band: 'Ronde',      color: '#CC0739', top: '70%', left: '30%', path: '/radio-camps/lutins'     },
    { slug: 'louveteaux', label: 'Louveteaux', band: 'Meute',      color: '#186E54', top: '37%', left: '49%', path: '/radio-camps/louveteaux' },
    { slug: 'guides',     label: 'Guides',     band: 'Compagnie',  color: '#1D325A', top: '65%', left: '54%', path: '/radio-camps/guides'     },
    { slug: 'eclaireurs', label: 'Éclaireurs', band: 'Troupe',     color: '#015AA9', top: '22%', left: '75%', path: '/radio-camps/eclaireurs' },
    { slug: 'pionniers',  label: 'Pionniers',  band: 'Poste',      color: '#DA1F29', top: '80%', left: '85%', path: '/radio-camps/pionniers'  },
];

/* ════════════════════════════════════════════════════════
   HERO
════════════════════════════════════════════════════════ */

const PageHero: React.FC = () => (
    <section className="rcp-hero">
        <Container className="rcp-hero-container">
            <div className="rcp-hero-inner">
                {/* <motion.div
                    className="rcp-hero-eyebrow"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.5 }}
                >
                    <BsBroadcastPin size={13} />
                    <span>Journal de camp · été</span>
                </motion.div> */}

                <motion.h1 className="rcp-hero-title" {...heroTitle(0.26)}>
                    Radio Camp
                </motion.h1>

                <motion.div className="rcp-hero-rule" {...heroRule(0.52)} />

                <motion.p className="rcp-hero-sub" {...heroSubtitle(0.66)}>
                    Pendant le camp, chaque section publie ses aventures, photos et vidéos.
                    Embarquez avec nous et suivez vos enfants au jour le jour.
                </motion.p>

                <motion.div className="rcp-hero-stats" {...heroSubtitle(0.86)}>
                    <div className="rcp-hstat">
                        <span className="rcp-hstat-num">{DESTINATIONS.length}</span>
                        <span className="rcp-hstat-label">Destinations</span>
                    </div>
                    <div className="rcp-hstat-sep" />
                    <div className="rcp-hstat">
                        <span className="rcp-hstat-num">24/7</span>
                        <span className="rcp-hstat-label">En direct</span>
                    </div>
                </motion.div>
            </div>

            <div className="rcp-hero-deco" aria-hidden>
                <BsBroadcastPin size={220} />
            </div>
        </Container>
    </section>
);

/* ════════════════════════════════════════════════════════
   HOW IT WORKS
════════════════════════════════════════════════════════ */

const steps = [
    {
        icon: <BsGeoAltFill size={18} />,
        title: 'Choisis ta section',
        text: "Chaque section a son propre Radio Camp. Clique sur la destination qui t'intéresse sur la carte.",
    },
    {
        icon: <BsShieldLockFill size={18} />,
        title: 'Entre le mot de passe',
        text: "Tu as reçu un mot de passe du staff d'unité ? Saisis-le pour accéder au journal de camp.",
    },
    {
        icon: <BsCameraReelsFill size={18} />,
        title: 'Suis le camp en direct',
        text: 'Photos, vidéos et récits sont publiés régulièrement. Reviens aussi souvent que tu veux.',
    },
];

const HowItWorks: React.FC = () => (
    <section className="rcp-steps-wrap">
        <Container>
            <div className="rcp-sec-header">
                <motion.h2 className="rcp-sec-heading" {...fadeUp(0.05)}>
                    Comment ça marche ?
                </motion.h2>
                <motion.div className="rcp-sec-rule" {...fadeUp(0.12)} />
                <motion.p className="rcp-sec-sub" {...fadeUp(0.2)}>
                    Trois étapes pour vivre le camp depuis la maison.
                </motion.p>
            </div>

            <motion.div
                className="rcp-steps"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
            >
                {steps.map((s, i) => (
                    <motion.div key={i} className="rcp-step" variants={staggerItem}>
                        <div className="rcp-step-num">{String(i + 1).padStart(2, '0')}</div>
                        <div className="rcp-step-icon">{s.icon}</div>
                        <h3 className="rcp-step-title">{s.title}</h3>
                        <p className="rcp-step-text">{s.text}</p>
                    </motion.div>
                ))}
            </motion.div>
        </Container>
    </section>
);

/* ════════════════════════════════════════════════════════
   MAP — desktop
════════════════════════════════════════════════════════ */

const MapBlock: React.FC = () => {
    const navigate = useNavigate();

    return (
        <section className="rcp-map-wrap">
            <Container>
                <div className="rcp-sec-header rcp-sec-header-light">
                    <motion.h2 className="rcp-sec-heading rcp-sec-heading-light" {...fadeUp(0.05)}>
                        Choisis ta destination
                    </motion.h2>
                    <motion.div className="rcp-sec-rule" {...fadeUp(0.12)} />
                    <motion.p className="rcp-sec-sub rcp-sec-sub-light" {...fadeUp(0.2)}>
                        Clique sur une épingle pour plonger dans le carnet de route de la section.
                    </motion.p>
                </div>
            </Container>

            {/* ── Desktop map ── */}
            <motion.div
                className="rcp-map d-none d-lg-block"
                initial={{ opacity: 0, scale: 1.02 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
            >
                <div className="rcp-map-img" style={{ backgroundImage: "url('/backgroundMap.webp')" }} />
                <div className="rcp-map-tint" aria-hidden />

                {/* Compass */}
                <motion.div
                    className="rcp-compass"
                    initial={{ opacity: 0, rotate: -20 }}
                    whileInView={{ opacity: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    aria-hidden
                >
                    <span className="rcp-compass-n">N</span>
                    <BsCompass size={44} />
                </motion.div>

                {/* Pins */}
                {DESTINATIONS.map((d, i) => (
                    <div
                        key={d.slug}
                        className="rcp-pin-anchor"
                        style={{ top: d.top, left: d.left }}
                    >
                        <motion.button
                            type="button"
                            className="rcp-pin"
                            style={{ '--pc': d.color } as React.CSSProperties}
                            initial={{ scale: 0, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{
                                delay: 0.4 + i * 0.1,
                                type: 'spring',
                                stiffness: 210,
                                damping: 14,
                            }}
                            onClick={() => navigate(d.path)}
                            aria-label={`Radio camp ${d.label}`}
                        >
                            <span className="rcp-pin-pulse rcp-pin-pulse-1" />
                            <span className="rcp-pin-pulse rcp-pin-pulse-2" />
                            <span className="rcp-pin-dot">
                                <BsGeoAltFill size={14} />
                            </span>

                            <div className="rcp-pin-card">
                                <span className="rcp-pin-card-band">{d.band}</span>
                                <span className="rcp-pin-card-name">{d.label}</span>
                                <span className="rcp-pin-card-cta">
                                    Accéder
                                    <BsArrowRight size={12} />
                                </span>
                            </div>
                        </motion.button>
                    </div>
                ))}
            </motion.div>

            {/* ── Mobile destinations grid ── */}
            <Container className="d-block d-lg-none rcp-mobile-dests">
                <motion.div
                    className="rcp-mobile-grid"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.05 }}
                >
                    {DESTINATIONS.map(d => (
                        <motion.button
                            key={d.slug}
                            type="button"
                            className="rcp-dest-card"
                            style={{ '--pc': d.color } as React.CSSProperties}
                            variants={staggerItem}
                            onClick={() => navigate(d.path)}
                        >
                            <div className="rcp-dest-bar" />
                            <div className="rcp-dest-head">
                                <BsGeoAltFill size={14} className="rcp-dest-pin-icon" />
                                <span className="rcp-dest-name">{d.label}</span>
                            </div>
                            <div className="rcp-dest-band">{d.band}</div>
                            <span className="rcp-dest-cta">
                                Accéder au carnet
                                <BsArrowRight size={13} />
                            </span>
                        </motion.button>
                    ))}
                </motion.div>
            </Container>
        </section>
    );
};

/* ════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════ */

const RadioCamps: React.FC = () => {
    return (
        <div className="p-0">
            <PageHero />
            <HowItWorks />
            <MapBlock />
        </div>
    );
};

export default RadioCamps;
