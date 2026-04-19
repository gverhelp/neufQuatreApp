import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Container } from 'react-bootstrap';
import { BsArrowRight, BsPeopleFill, BsCompass } from 'react-icons/bs';

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
                {SECTIONS.map(s => (
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
   JOURNEY — inline timeline of sections by age
════════════════════════════════════════════════════════ */

const JourneyBlock: React.FC = () => (
    <section className="sp-journey-wrap">
        <Container>
            <div className="sp-sec-header sp-sec-header-light">
                <motion.h2 className="sp-sec-heading sp-sec-heading-light" {...fadeUp(0.05)}>
                    Un chemin, étape par étape
                </motion.h2>
                <motion.div className="sp-sec-rule" {...fadeUp(0.12)} />
                <motion.p className="sp-sec-sub sp-sec-sub-light" {...fadeUp(0.2)}>
                    De 6 à 18 ans, chaque âge a sa place. Voici la progression dans l'unité.
                </motion.p>
            </div>

            <motion.div
                className="sp-journey"
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
            >
                <div className="sp-journey-line" aria-hidden />
                {SECTIONS.filter(s => s.slug !== 'unite').map(s => (
                    <motion.div
                        key={s.slug}
                        className="sp-journey-step"
                        variants={staggerItem}
                        style={{ '--sc': s.color } as React.CSSProperties}
                    >
                        <div className="sp-journey-dot" />
                        <div className="sp-journey-pill">{s.age}</div>
                        <div className="sp-journey-name">{s.name}</div>
                    </motion.div>
                ))}
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