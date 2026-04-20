import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Container } from 'react-bootstrap';
import { BsArrowRight, BsPeopleFill } from 'react-icons/bs';

import CarouselBlock from '../components/CarouselBlock';
import { SectionImagesData } from '../types/interfaces';
import '../styles/Sections.css';

/* ════════════════════════════════════════════════════════
   CONSTANTS
════════════════════════════════════════════════════════ */

const SECTIONS = [
    { name: "Baladins",   slug: "baladins",   color: "#00A0DD", age: "6 – 8 ans",   genre: "Mixte",   band: "Ribambelle", description: "À la ribambelle, je prends confiance, je découvre et je m'émerveille.",                                                path: "/sections/baladins"   },
    { name: "Lutins",     slug: "lutins",     color: "#CC0739", age: "8 – 12 ans",  genre: "Filles",  band: "Ronde",      description: "À la ronde, je grandis, j'écoute, je partage et j'apprends à coopérer.",                                                 path: "/sections/lutins"     },
    { name: "Louveteaux", slug: "louveteaux", color: "#186E54", age: "8 – 12 ans",  genre: "Garçons", band: "Meute",      description: "À la meute, je vis la nature, je coopère et je grandis avec les autres.",                                                path: "/sections/louveteaux" },
    { name: "Guides",     slug: "guides",     color: "#1D325A", age: "12 – 16 ans", genre: "Filles",  band: "Compagnie",  description: "À la compagnie, je construis des projets, je prends des responsabilités et je gagne en autonomie.",                       path: "/sections/guides"     },
    { name: "Éclaireurs", slug: "eclaireurs", color: "#015AA9", age: "12 – 16 ans", genre: "Garçons", band: "Troupe",     description: "À la troupe, je participe à des projets collectifs, je prends des responsabilités et je développe mon esprit d'équipe.", path: "/sections/eclaireurs" },
    { name: "Pionniers",  slug: "pionniers",  color: "#DA1F29", age: "16 – 18 ans", genre: "Mixte",   band: "Poste",      description: "Au poste, je m'engage, je mène des projets et j'agis selon mes convictions.",                                             path: "/sections/pionniers"  },
    { name: "Animateur",  slug: "animateur",  color: "#8B5CF6", age: "18 ans +",    genre: "Mixte",   band: "Staff",      description: "En tant qu'animateur, je transmets ma passion et j'encadre les plus jeunes.",                                              path: "/sections/animateur"  },
    { name: "Clan",       slug: "clan",       color: "#FEB800", age: "18 ans +",    genre: "Mixte",   band: "Clan",       description: "Au clan, je transmets, je partage mon expérience et j'accompagne les plus jeunes.",                                      path: "/sections/clan"       },
    { name: "Unité",      slug: "unite",      color: "#022864", age: "—",           genre: "Mixte",   band: "Unité",      description: "À l'unité, je contribue à la vie collective et aux projets de toute l'unité.",                                           path: "/sections/unite"      },
];

/* ════════════════════════════════════════════════════════
   ANIMATION HELPERS
════════════════════════════════════════════════════════ */

const fadeUp = (delay = 0) => ({
    initial:     { opacity: 0, y: 26 },
    whileInView: { opacity: 1, y: 0 },
    transition:  { duration: 0.55, ease: 'easeOut' as const, delay },
    viewport:    { once: true },
});

const stagger = {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.08 } },
};

const staggerItem = {
    hidden:  { opacity: 0, y: 26 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } },
};

/* ════════════════════════════════════════════════════════
   HERO
════════════════════════════════════════════════════════ */

const PageHero: React.FC = () => (
    <section className="sp-hero">
        <Container className="sp-hero-container">
            <div className="sp-hero-inner">
                <motion.h1
                    className="sp-hero-title"
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.26, duration: 0.6, ease: 'easeOut' }}
                >
                    Nos sections
                </motion.h1>

                <motion.div
                    className="sp-hero-rule"
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ delay: 0.52, duration: 0.44, ease: 'easeOut' }}
                />

                <motion.p
                    className="sp-hero-sub"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.66, duration: 0.5, ease: 'easeOut' }}
                >
                    Du premier foulard aux plus grandes aventures, trouve ta place dans l'unité.
                </motion.p>

                <motion.div
                    className="sp-hero-stats"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.86, duration: 0.48, ease: 'easeOut' }}
                >
                    <div className="sp-hstat">
                        <span className="sp-hstat-num">8</span>
                        <span className="sp-hstat-label">Sections</span>
                    </div>
                    <div className="sp-hstat-sep" />
                    <div className="sp-hstat">
                        <span className="sp-hstat-num">6&nbsp;–&nbsp;18+</span>
                        <span className="sp-hstat-label">Ans</span>
                    </div>
                </motion.div>
            </div>

            <div className="sp-hero-deco" aria-hidden>
                <BsPeopleFill size={220} />
            </div>
        </Container>


    </section>
);

/* ════════════════════════════════════════════════════════
   SECTIONS GRID
════════════════════════════════════════════════════════ */

const SectionsGrid: React.FC = () => (
    <section className="sp-grid-wrap">
        <Container>
            <div className="sp-sec-header">
                <motion.h2 className="sp-sec-heading" {...fadeUp(0.05)}>
                    Choisis ta section
                </motion.h2>
                <motion.div className="sp-sec-rule" {...fadeUp(0.12)} />
                <motion.p className="sp-sec-sub" {...fadeUp(0.2)}>
                    Clique pour découvrir toutes les infos utiles de chaque section.
                </motion.p>
            </div>

            <motion.div
                className="sp-grid"
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.05 }}
            >
                {SECTIONS.filter(s => s.slug !== 'animateur').map(s => (
                    <motion.div key={s.slug} variants={staggerItem} className="sp-grid-item">
                        <Link
                            to={s.path}
                            className="sp-card"
                            style={{ '--sc': s.color } as React.CSSProperties}
                        >
                            <div className="sp-card-bar" />
                            <div className="sp-card-glow" aria-hidden />

                            <div className="sp-card-head">
                                <span className="sp-card-name">{s.name}</span>
                                <span className="sp-card-genre">{s.genre}</span>
                            </div>

                            <div className="sp-card-age-row">
                                <span className="sp-card-age">{s.age}</span>
                                <span className="sp-card-band">{s.band}</span>
                            </div>

                            <p className="sp-card-desc">{s.description}</p>

                            <span className="sp-card-cta">
                                Découvrir
                                <BsArrowRight size={13} className="sp-card-arrow" />
                            </span>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>
        </Container>
    </section>
);

/* ════════════════════════════════════════════════════════
   JOURNEY — horizontal branching tree (left → right)
════════════════════════════════════════════════════════ */

const JOURNEY_NODES: { slug: string; x: number; y: number }[] = [
    { slug: 'baladins',   x: 60,  y: 130 },
    { slug: 'lutins',     x: 230, y: 50  },
    { slug: 'louveteaux', x: 230, y: 210 },
    { slug: 'guides',     x: 430, y: 50  },
    { slug: 'eclaireurs', x: 430, y: 210 },
    { slug: 'pionniers',  x: 630, y: 130 },
    { slug: 'animateur',  x: 790, y: 130 },
    { slug: 'clan',       x: 940, y: 130 },
];

const R = 12;                       // dot radius in SVG units
const JOURNEY_EDGES = [
    `M ${60+R},130 C 150,130 160,50 ${230-R},50`,       // Baladins → Lutins
    `M ${60+R},130 C 150,130 160,210 ${230-R},210`,     // Baladins → Louveteaux
    `M ${230+R},50 L ${430-R},50`,                       // Lutins → Guides
    `M ${230+R},210 L ${430-R},210`,                     // Louveteaux → Éclaireurs
    `M ${430+R},50 C 530,50 560,130 ${630-R},130`,      // Guides → Pionniers
    `M ${430+R},210 C 530,210 560,130 ${630-R},130`,    // Éclaireurs → Pionniers
    `M ${630+R},130 L ${790-R},130`,                     // Pionniers → Animateur
    `M ${790+R},130 L ${940-R},130`,                     // Animateur → Clan
];

const JOURNEY_ORDER = ['baladins','lutins','louveteaux','guides','eclaireurs','pionniers','animateur','clan'];

const JourneyBlock: React.FC = () => (
    <section className="sp-journey-wrap">
        <Container>
            <div className="sp-sec-header sp-sec-header-light">
                <motion.h2 className="sp-sec-heading sp-sec-heading-light" {...fadeUp(0.05)}>
                    Un chemin, étape par étape
                </motion.h2>
                <motion.div className="sp-sec-rule" {...fadeUp(0.12)} />
                <motion.p className="sp-sec-sub sp-sec-sub-light" {...fadeUp(0.2)}>
                    De 6 à 18 ans et plus, chaque âge a sa place.
                </motion.p>
            </div>

            {/* ── Desktop / tablet: SVG graph ── */}
            <motion.div className="sp-journey-graph" {...fadeUp(0.25)}>
                <svg viewBox="0 0 1000 270" className="sp-journey-svg">
                    {/* edges */}
                    {JOURNEY_EDGES.map((d, i) => (
                        <path key={i} d={d} />
                    ))}

                    {/* nodes */}
                    {JOURNEY_NODES.map(n => {
                        const s = SECTIONS.find(sec => sec.slug === n.slug)!;
                        return (
                            <g key={n.slug} className="sp-jsvg-node">
                                <circle cx={n.x} cy={n.y} r={R + 6} fill={s.color} opacity={0.18} />
                                <circle cx={n.x} cy={n.y} r={R}
                                    fill={s.color}
                                    stroke="rgba(255,255,255,0.9)"
                                    strokeWidth="3"
                                />
                                <text x={n.x} y={n.y + 30} textAnchor="middle" className="sp-jsvg-name">
                                    {s.name}
                                </text>
                                <text x={n.x} y={n.y + 46} textAnchor="middle" className="sp-jsvg-age">
                                    {s.age}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </motion.div>

            {/* ── Mobile: vertical list ── */}
            <motion.div
                className="sp-journey-mobile"
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
            >
                {JOURNEY_ORDER.map(slug => {
                    const s = SECTIONS.find(sec => sec.slug === slug)!;
                    return (
                        <motion.div
                            key={slug}
                            className="sp-jm-step"
                            variants={staggerItem}
                            style={{ '--sc': s.color } as React.CSSProperties}
                        >
                            <div className="sp-jm-dot" />
                            <div className="sp-jm-info">
                                <div className="sp-jm-name">{s.name}</div>
                                <div className="sp-jm-age">{s.age}</div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>
        </Container>
    </section>
);

/* ════════════════════════════════════════════════════════
   GALLERY
════════════════════════════════════════════════════════ */

const GallerySection: React.FC<{ images: string[]; captions: string[] }> = ({ images, captions }) => {
    if (!images.length) return null;
    return (
        <section className="sp-gallery-wrap">
            <CarouselBlock images={images} captions={captions} />
        </section>
    );
};

/* ════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════ */

const Sections: React.FC = () => {
    const baseURL = import.meta.env.VITE_API_URL;
    const [sectionImages, setSectionImages] = useState<SectionImagesData[]>([]);

    useEffect(() => {
        (async () => {
            try {
                const response = await axios.get(`${baseURL}/section-images/`);
                const data: SectionImagesData[] = response.data;
                const selectedImages = data.filter(image => image.section === 'global');
                if (selectedImages) setSectionImages(selectedImages);
            } catch (err) {
                console.error('Erreur lors de la récupération des images', err);
            }
        })();
    }, []);

    return (
        <div className="p-0">
            <PageHero />
            <SectionsGrid />
            <JourneyBlock />
            <GallerySection
                images={sectionImages.map(i => i.image)}
                captions={sectionImages.map(i => i.title)}
            />
        </div>
    );
};

export default Sections;