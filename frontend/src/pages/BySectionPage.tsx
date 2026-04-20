import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { 
    BsArrowRight, BsArrowLeft, BsEnvelopeFill, BsCreditCard2Front, BsBroadcast,
} from 'react-icons/bs';
import { FaTshirt, FaUserCircle } from 'react-icons/fa';

import '../styles/Sections.css';
import { SectionData, ChefData } from '../types/interfaces';
import CarouselBlock from '../components/CarouselBlock';

/* ════════════════════════════════════════════════════════
   CONSTANTS
════════════════════════════════════════════════════════ */

interface SectionMeta {
    name: string;
    age: string;
    genre: string;
    band: string;
    color: string;
}

const SECTIONS_META: Record<string, SectionMeta> = {
    baladins:   { name: "Baladins",   age: "6 – 8 ans",   genre: "Mixte",   band: "Ribambelle", color: "#00A0DD" },
    lutins:     { name: "Lutins",     age: "8 – 12 ans",  genre: "Filles",  band: "Ronde",      color: "#CC0739" },
    louveteaux: { name: "Louveteaux", age: "8 – 12 ans",  genre: "Garçons", band: "Meute",      color: "#186E54" },
    guides:     { name: "Guides",     age: "12 – 16 ans", genre: "Filles",  band: "Compagnie",  color: "#1D325A" },
    eclaireurs: { name: "Éclaireurs", age: "12 – 16 ans", genre: "Garçons", band: "Troupe",     color: "#015AA9" },
    pionniers:  { name: "Pionniers",  age: "16 – 18 ans", genre: "Mixte",   band: "Poste",      color: "#DA1F29" },
    clan:       { name: "Clan",       age: "18 ans +",    genre: "Mixte",   band: "Clan",       color: "#FEB800" },
    unite:      { name: "Unité",      age: "Toutes",      genre: "Mixte",   band: "Unité",      color: "#022864" },
};

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
    hidden:  { opacity: 0, y: 22 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.48, ease: [0.25, 0.1, 0.25, 1] as const } },
};

/* ════════════════════════════════════════════════════════
   SECTION HEADER (shared)
════════════════════════════════════════════════════════ */

const BsSecHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
    <div className="bsp-sec-header">
        <motion.h2 className="bsp-sec-heading" {...fadeUp(0.05)}>{title}</motion.h2>
        <motion.div className="bsp-sec-rule" {...fadeUp(0.12)} />
        {subtitle && (
            <motion.p className="bsp-sec-sub" {...fadeUp(0.2)}>{subtitle}</motion.p>
        )}
    </div>
);

/* ════════════════════════════════════════════════════════
   HERO — dynamic per-section color
════════════════════════════════════════════════════════ */

interface HeroProps {
    meta: SectionMeta;
    description?: string;
    image?: string;
    loading: boolean;
}

const SectionHero: React.FC<HeroProps> = ({ meta, description, image, loading }) => {
    const prettyName =
        meta.name === "Unité" ? "L'Unité" :
        meta.name === "Clan"  ? "Le Clan" :
        `Les ${meta.name}`;

    return (
        <section className="bsp-hero">
            {image && (
                <motion.img
                    src={image}
                    alt=""
                    className="bsp-hero-img"
                    initial={{ scale: 1.08, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                />
            )}
            <div className="bsp-hero-overlay" aria-hidden />
            <div className="bsp-hero-accent" aria-hidden />

            <Link to="/sections" className="bsp-hero-back">
                <BsArrowLeft size={14} />
                <span>Sections</span>
            </Link>

            <Container className="bsp-hero-container">
                <div className="bsp-hero-inner">

                    <motion.div
                        className="bsp-hero-badges"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                    >
                        <span className="bsp-hero-badge">{meta.age}</span>
                        <span className="bsp-hero-badge">{meta.genre}</span>
                        <span className="bsp-hero-badge bsp-hero-badge-band">{meta.band}</span>
                    </motion.div>

                    <motion.h1
                        className="bsp-hero-title"
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
                    >
                        {prettyName}
                    </motion.h1>

                    <motion.div
                        className="bsp-hero-rule"
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        transition={{ delay: 0.56, duration: 0.44, ease: 'easeOut' }}
                    />

                    {loading ? (
                        <>
                            <div className="bsp-skel" style={{ height: '14px', width: '90%', marginTop: '1.2rem', borderRadius: '4px' }} />
                            <div className="bsp-skel" style={{ height: '14px', width: '75%', marginTop: '0.4rem', borderRadius: '4px' }} />
                        </>
                    ) : (
                        description && (
                            <motion.p
                                className="bsp-hero-sub"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.72, duration: 0.55, ease: 'easeOut' }}
                            >
                                {description}
                            </motion.p>
                        )
                    )}
                </div>
            </Container>

        </section>
    );
};

/* ════════════════════════════════════════════════════════
   STAFF SECTION
════════════════════════════════════════════════════════ */

interface StaffProps { sectionName: string; }

const StaffSection: React.FC<StaffProps> = ({ sectionName }) => {
    const baseURL = import.meta.env.VITE_API_URL;
    const [chefs,   setChefs]   = useState<ChefData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState<string | null>(null);

    const title = (() => {
        if (sectionName === 'Unite')      return "Les chefs d'Unité";
        if (sectionName === 'Eclaireurs') return "Les chefs Éclaireurs";
        if (sectionName === 'Clan')       return "Les animateurs du Clan";
        return `Les chefs ${sectionName}`;
    })();

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const { data } = await axios.get<ChefData[]>(`${baseURL}/chefs/`);
                const filtered = data
                    .filter(m => m.section.toLowerCase() === sectionName.toLowerCase())
                    .sort((a, b) => (b.chefResp ? 1 : 0) - (a.chefResp ? 1 : 0));
                setChefs(filtered);
            } catch (e) {
                console.error('Erreur chefs:', e);
                setError('Impossible de charger le staff.');
            } finally {
                setLoading(false);
            }
        })();
    }, [sectionName]);

    return (
        <section className="bsp-staff-wrap">
            <Container>
                <BsSecHeader
                    title={title}
                    subtitle="Le staff derrière la section, leurs totems, leurs passions, leurs bafouilles."
                />

                {error && <Alert variant="warning">{error}</Alert>}

                {loading && (
                    <div className="bsp-staff-grid">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bsp-staff-card bsp-staff-ghost">
                                <div className="bsp-staff-img bsp-skel-block" />
                                <div className="bsp-staff-body">
                                    <div className="bsp-skel" style={{ height: '22px', width: '60%', marginBottom: '10px', borderRadius: '6px' }} />
                                    <div className="bsp-skel" style={{ height: '14px', width: '40%', marginBottom: '14px', borderRadius: '4px' }} />
                                    <div className="bsp-skel" style={{ height: '12px', width: '100%', marginBottom: '6px', borderRadius: '4px' }} />
                                    <div className="bsp-skel" style={{ height: '12px', width: '85%', borderRadius: '4px' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && !error && (chefs.length === 0 ? (
                    <p className="bsp-empty">Aucun chef pour cette section pour le moment.</p>
                ) : (
                    <motion.div
                        className="bsp-staff-grid"
                        variants={stagger}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.05 }}
                    >
                        {chefs.map(m => (
                            <motion.div
                                key={m.id}
                                className="bsp-staff-card"
                                variants={staggerItem}
                            >
                                <div className="bsp-staff-img">
                                    {m.image ? (
                                        <img src={m.image} alt={m.totem} />
                                    ) : (
                                        <div className="bsp-staff-placeholder">
                                            <FaUserCircle size={86} />
                                        </div>
                                    )}
                                    {m.chefResp && (
                                        <span className="bsp-staff-resp-badge">Chef responsable</span>
                                    )}
                                </div>
                                <div className="bsp-staff-body">
                                    <div className="bsp-staff-totem">{m.totem}</div>
                                    <div className="bsp-staff-name">{m.name}</div>
                                    {m.bafouille && (
                                        <p className="bsp-staff-bio">{m.bafouille}</p>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ))}
            </Container>
        </section>
    );
};

/* ════════════════════════════════════════════════════════
   GALLERY
════════════════════════════════════════════════════════ */

const GallerySection: React.FC<{ images: string[]; captions: string[] }> = ({ images, captions }) => {
    if (!images || images.length === 0) return null;
    return (
        <section className="bsp-gallery-wrap">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.05 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <CarouselBlock images={images} captions={captions} />
            </motion.div>
        </section>
    );
};

/* ════════════════════════════════════════════════════════
   INFO SECTION — uniforme, contacts, compte, radio camp
════════════════════════════════════════════════════════ */

const InfoSection: React.FC<{ data: SectionData }> = ({ data }) => (
    <section className="bsp-info-wrap">
        <Container>
            <BsSecHeader
                title="Informations pratiques"
                subtitle="Uniforme, contacts, paiements et accès Radio Camp, tout ce qu'il faut savoir avant de se lancer."
            />

            <motion.div
                className="bsp-info-grid"
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.05 }}
            >

                {/* ── Uniforme (pleine largeur) ── */}
                <motion.div className="bsp-info-card bsp-info-card-wide" variants={staggerItem}>
                    <div className="bsp-info-card-head">
                        <div className="bsp-info-icon">
                            <FaTshirt size={18} />
                        </div>
                        <h3 className="bsp-info-title">Uniforme</h3>
                    </div>

                    <div className="bsp-info-body">
                        <p className="bsp-info-text">{data.uniformDescription}</p>

                        <div className="bsp-info-imgs">
                            <div className="bsp-info-img-wrap">
                                <img src="/UniformePourTous.webp" alt="Uniforme commun" />
                                <span className="bsp-info-img-caption">Pour tous</span>
                            </div>
                            {data.uniformImage && (
                                <div className="bsp-info-img-wrap">
                                    <img src={data.uniformImage} alt="Uniforme de section" />
                                    <span className="bsp-info-img-caption">{data.name}</span>
                                </div>
                            )}
                        </div>

                        <div className="bsp-info-cta-row">
                            <p className="bsp-info-cta-label">
                                Besoin d'acheter un insigne ou un uniforme ?
                            </p>
                            <a
                                href="https://www.lascouterie-economats.be/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bsp-info-btn"
                            >
                                Boutique de la Scouterie
                                <BsArrowRight size={13} />
                            </a>
                        </div>
                    </div>
                </motion.div>

                {/* ── Contacts ── */}
                <motion.div className="bsp-info-card" variants={staggerItem}>
                    <div className="bsp-info-card-head">
                        <div className="bsp-info-icon">
                            <BsEnvelopeFill size={16} />
                        </div>
                        <h3 className="bsp-info-title">Contacts</h3>
                    </div>
                    <div className="bsp-info-body">
                        <p className="bsp-info-text">
                            Besoin d'informations ? Contactez le staff de la section via l'email ci-dessous.
                        </p>
                        {data.email ? (
                            <a href={`mailto:${data.email}`} className="bsp-info-pill">
                                {data.email}
                            </a>
                        ) : (
                            <span className="bsp-info-muted">
                                Email non disponible pour le moment.
                            </span>
                        )}
                    </div>
                </motion.div>

                {/* ── Compte bancaire ── */}
                {data.name !== 'Clan' && (
                    <motion.div className="bsp-info-card" variants={staggerItem}>
                        <div className="bsp-info-card-head">
                            <div className="bsp-info-icon">
                                <BsCreditCard2Front size={17} />
                            </div>
                            <h3 className="bsp-info-title">Compte bancaire</h3>
                        </div>
                        <div className="bsp-info-body">
                            <p className="bsp-info-text">
                                Tous les virements liés aux activités de la section (week-end, camp…) sont à faire sur ce compte.
                            </p>
                            {data.bankAccount ? (
                                <div className="bsp-info-account">{data.bankAccount}</div>
                            ) : (
                                <span className="bsp-info-muted">
                                    Compte bancaire non disponible pour le moment.
                                </span>
                            )}
                            <p className="bsp-info-note">
                                En communication : nom, prénom de l'enfant et activité concernée.
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* ── Radio camp (pleine largeur) ── */}
                {!['Unité', 'Clan'].includes(data.name) && (
                    <motion.div className="bsp-info-card bsp-info-card-wide" variants={staggerItem}>
                        <div className="bsp-info-card-head">
                            <div className="bsp-info-icon">
                                <BsBroadcast size={18} />
                            </div>
                            <h3 className="bsp-info-title">Radio camp</h3>
                        </div>
                        <div className="bsp-info-body">
                            <p className="bsp-info-text">
                                Un outil pour suivre les aventures de vos enfants durant le camp.
                                Cliquez sur le bouton ci-dessous et saisissez le mot de passe fourni par le staff.
                            </p>
                            <a
                                href={`/radio-camps/${data.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bsp-info-btn"
                            >
                                Accéder au Radio camp
                                <BsArrowRight size={13} />
                            </a>
                        </div>
                    </motion.div>
                )}

            </motion.div>
        </Container>
    </section>
);

/* ════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════ */

const BySectionPage: React.FC<{ sectionName: string }> = ({ sectionName }) => {
    const baseURL = import.meta.env.VITE_API_URL;
    const [sectionData, setSectionData] = useState<SectionData | null>(null);
    const [loading,     setLoading]     = useState(true);
    const [error,       setError]       = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`${baseURL}/sections/${sectionName.toLowerCase()}`);
                setSectionData(response.data);
            } catch (err) {
                console.error('Erreur chargement section:', err);
                setError('Impossible de charger les données de la section.');
            } finally {
                setLoading(false);
            }
        })();
    }, [sectionName]);

    const meta = SECTIONS_META[sectionName.toLowerCase()] ?? SECTIONS_META.unite;

    if (error) {
        return (
            <Container fluid className="d-flex justify-content-center align-items-center" style={{ height: '85vh' }}>
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    return (
        <div
            className="bsp-page p-0"
            style={{ '--bs-accent': meta.color } as React.CSSProperties}
        >
            <SectionHero
                meta={meta}
                description={sectionData?.description}
                image={sectionData?.showcaseImage}
                loading={loading}
            />

            <StaffSection sectionName={sectionName} />

            {sectionData && (
                <GallerySection
                    images={sectionData.section_images.map(i => i.image)}
                    captions={sectionData.section_images.map(i => i.title)}
                />
            )}

            {sectionData && <InfoSection data={sectionData} />}
        </div>
    );
};

export default BySectionPage;