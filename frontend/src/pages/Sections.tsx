import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    { name: "Animateurs",  slug: "animateurs",  color: "#8B5CF6", age: "18 ans +",    genre: "Mixte",   band: "Staff",      description: "En tant qu'animateur, je transmets ma passion et j'encadre les plus jeunes.",                                              path: "/sections/animateur"  },
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
                {SECTIONS.filter(s => s.slug !== 'animateurs').map(s => (
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
   JOURNEY — plan de métro en couloirs (Filles / Mixte / Garçons)
════════════════════════════════════════════════════════ */

interface Station { slug: string; label: string; sub: string; x: number; y: number; path?: string }

const sectionColor = (slug: string) => SECTIONS.find(s => s.slug === slug)?.color ?? '#022864';

/* Desktop : viewBox 680 × 300 — couloirs horizontaux, échelle d'âge en bas */
const DESKTOP_STATIONS: Station[] = [
    { slug: 'baladins',   label: 'Baladins',   sub: 'Ribambelle',    x: 130, y: 153, path: '/sections/baladins'   },
    { slug: 'lutins',     label: 'Lutins',     sub: 'Ronde',         x: 235, y: 87,  path: '/sections/lutins'     },
    { slug: 'louveteaux', label: 'Louveteaux', sub: 'Meute',         x: 235, y: 219, path: '/sections/louveteaux' },
    { slug: 'guides',     label: 'Guides',     sub: 'Compagnie',     x: 345, y: 87,  path: '/sections/guides'     },
    { slug: 'eclaireurs', label: 'Éclaireurs', sub: 'Troupe',        x: 345, y: 219, path: '/sections/eclaireurs' },
    { slug: 'pionniers',  label: 'Pionniers',  sub: 'Poste',         x: 450, y: 153, path: '/sections/pionniers'  },
    { slug: 'animateurs', label: 'Animateurs', sub: 'Staff',         x: 540, y: 153                               },
    { slug: 'clan',       label: 'Clan',       sub: 'Anciens chefs', x: 630, y: 153, path: '/sections/clan'       },
];
const DESKTOP_LINES = [
    'M130,153 C185,153 180,87 235,87', 'M130,153 C185,153 180,219 235,219',
    'M235,87 L345,87', 'M235,219 L345,219',
    'M345,87 C400,87 395,153 450,153', 'M345,219 C400,219 395,153 450,153',
    'M450,153 L540,153', 'M540,153 L630,153',
];

/* Mobile : sélecteur d'âge → sections correspondantes */
const AGE_GROUPS: { label: string; slugs: string[] }[] = [
    { label: '6–8',   slugs: ['baladins'] },
    { label: '8–12',  slugs: ['lutins', 'louveteaux'] },
    { label: '12–16', slugs: ['guides', 'eclaireurs'] },
    { label: '16–18', slugs: ['pionniers'] },
    { label: '18+',   slugs: ['animateurs', 'clan'] },
];
const SUBTITLES: Record<string, string> = { clan: 'Anciens chefs' };
const HAS_PAGE = (slug: string) => slug !== 'animateurs';

const AgeSelector: React.FC = () => {
    const [group, setGroup] = useState(0);
    const sections = AGE_GROUPS[group].slugs.map(slug => SECTIONS.find(s => s.slug === slug)!);

    return (
        <div className="sp-age">
            <div className="sp-age-unit">
                <span className="sp-age-unit-title">Chef·fe d'unité</span>
                <span className="sp-age-unit-sub">Parents, anciens chefs ou volontaires · coordonne toute l'unité</span>
            </div>

            <div className="sp-age-question">Quelle section pour ton enfant ? Choisis son âge (en années) :</div>

            {/* 5 colonnes égales : toutes les pastilles ont la même taille */}
            <div className="sp-age-chips" role="group" aria-label="Âge de l'enfant">
                {AGE_GROUPS.map((g, i) => (
                    <button
                        key={g.label}
                        type="button"
                        className={`sp-age-chip${i === group ? ' sp-age-chip-on' : ''}`}
                        onClick={() => setGroup(i)}
                        aria-pressed={i === group}
                    >
                        {g.label}
                    </button>
                ))}
            </div>

            <div className="sp-age-results" aria-live="polite">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={group}
                        className="sp-age-list"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                    >
                        {sections.map(s => {
                            const content = (
                                <>
                                    <span className="sp-age-card-text">
                                        <span className="sp-age-card-name">{s.name}</span>
                                        <span className="sp-age-card-sub">{SUBTITLES[s.slug] ?? s.band}</span>
                                    </span>
                                    <span className={`sp-age-genre sp-age-genre-${s.genre === 'Filles' ? 'f' : s.genre === 'Garçons' ? 'g' : 'm'}`}>
                                        {s.genre}
                                    </span>
                                    {HAS_PAGE(s.slug) && <BsArrowRight size={13} className="sp-age-card-arrow" />}
                                </>
                            );
                            return HAS_PAGE(s.slug) ? (
                                <Link key={s.slug} to={`/sections/${s.slug}`} className="sp-age-card" style={{ '--sc': s.color } as React.CSSProperties}>
                                    {content}
                                </Link>
                            ) : (
                                <div key={s.slug} className="sp-age-card" style={{ '--sc': s.color } as React.CSSProperties}>
                                    {content}
                                </div>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

const StationNode: React.FC<{ st: Station; nameSize: number; subSize: number }> = ({ st, nameSize, subSize }) => {
    const navigate = useNavigate();
    const go = () => st.path && navigate(st.path);
    const linkProps = st.path ? {
        role: 'link',
        tabIndex: 0,
        'aria-label': `Section ${st.label}`,
        onClick: go,
        onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter') go(); },
    } : {};
    return (
        <g className={`sp-st${st.path ? ' sp-st-link' : ''}`} {...linkProps}>
            <circle className="sp-st-dot" cx={st.x} cy={st.y} r={11} fill={sectionColor(st.slug)} />
            <text x={st.x} y={st.y + 26} textAnchor="middle" className="sp-st-name" style={{ fontSize: nameSize }}>
                {st.label}
            </text>
            <text x={st.x} y={st.y + 26 + subSize + 4} textAnchor="middle" className="sp-st-sub" style={{ fontSize: subSize }}>
                {st.sub}
            </text>
        </g>
    );
};

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

            {/* ── Desktop / tablette : couloirs horizontaux ── */}
            <motion.div className="sp-journey-graph" {...fadeUp(0.25)}>
                <svg viewBox="0 0 680 300" className="sp-journey-svg" role="img"
                    aria-label="Parcours dans l'unité : Baladins (mixte), puis Lutins et Guides pour les filles, Louveteaux et Éclaireurs pour les garçons, puis Pionniers, Animateurs et Clan (mixtes). Le ou la chef·fe d'unité coordonne l'ensemble.">
                    <rect x="78" y="10" width="596" height="34" rx="10" className="sp-st-unit" />
                    <text x="376" y="31" textAnchor="middle" className="sp-st-unit-title">
                        Chef·fe d'unité
                        <tspan className="sp-st-unit-sub"> · parents, anciens chefs ou volontaires · coordonne toute l'unité</tspan>
                    </text>

                    <rect x="78" y="58"  width="596" height="58" rx="10" className="sp-st-lane" />
                    <rect x="78" y="124" width="596" height="58" rx="10" className="sp-st-lane sp-st-lane-mixte" />
                    <rect x="78" y="190" width="596" height="58" rx="10" className="sp-st-lane" />
                    <text x="68" y="91"  textAnchor="end" className="sp-st-lane-label">FILLES</text>
                    <text x="68" y="157" textAnchor="end" className="sp-st-lane-label">MIXTE</text>
                    <text x="68" y="223" textAnchor="end" className="sp-st-lane-label">GARÇONS</text>

                    {DESKTOP_LINES.map((d, i) => <path key={i} d={d} className="sp-st-line" />)}
                    {DESKTOP_STATIONS.map(st => <StationNode key={st.slug} st={st} nameSize={11} subSize={7.5} />)}

                    <line x1="92" y1="266" x2="668" y2="266" className="sp-st-axis" />
                    {[['6 – 8 ANS', 130], ['8 – 12 ANS', 235], ['12 – 16 ANS', 345], ['16 – 18 ANS', 450], ['18 ANS +', 585]].map(([t, x]) => (
                        <text key={t} x={x} y={284} textAnchor="middle" className="sp-st-age">{t}</text>
                    ))}
                </svg>
            </motion.div>

            {/* ── Mobile : sélecteur d'âge ── */}
            <motion.div className="sp-journey-mobile" {...fadeUp(0.2)}>
                <AgeSelector />
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