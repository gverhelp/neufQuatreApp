import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container } from 'react-bootstrap';
import { motion } from 'framer-motion';
import Masonry from 'react-masonry-css';
import {
    BsFileEarmarkTextFill, BsFileArrowDownFill,
    BsLink45Deg, BsPlayCircleFill, BsImageFill,
} from 'react-icons/bs';

import '../styles/InformationsPage.css';
import { DocumentData, InformationData } from '../types/interfaces';

/* ════════════════════════════════════════════════════════
   ANIMATION HELPERS
════════════════════════════════════════════════════════ */

const fadeUp = (delay = 0) => ({
    initial:     { opacity: 0, y: 26 },
    whileInView: { opacity: 1, y: 0 },
    transition:  { duration: 0.55, ease: 'easeOut' as const, delay },
    viewport:    { once: true },
});

const fadeIn = (delay = 0) => ({
    initial:    { opacity: 0, y: 20 },
    animate:    { opacity: 1, y: 0 },
    transition: { duration: 0.48, ease: 'easeOut' as const, delay },
});

const stagger = {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.09 } },
};

const staggerItem = {
    hidden:  { opacity: 0, y: 22 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.46, ease: [0.25, 0.1, 0.25, 1] as const } },
};

/* ════════════════════════════════════════════════════════
   UTILITY — detect info card media type
════════════════════════════════════════════════════════ */

type InfoType = 'image' | 'video' | 'embed' | 'link' | 'text';

function getInfoType(info: InformationData): InfoType {
    if (info.image)     return 'image';
    if (info.video)     return 'video';
    if (info.videoLink) return 'embed';
    if (info.link)      return 'link';
    return 'text';
}

const TYPE_META: Record<InfoType, { label: string; icon: React.ReactNode; color: string; bg: string } | null> = {
    image:  { label: 'Image',  icon: <BsImageFill size={10} />,      color: '#015AA9', bg: 'rgba(1,90,169,0.09)' },
    video:  { label: 'Vidéo',  icon: <BsPlayCircleFill size={10} />, color: '#DA1F29', bg: 'rgba(218,31,41,0.09)' },
    embed:  { label: 'Vidéo',  icon: <BsPlayCircleFill size={10} />, color: '#DA1F29', bg: 'rgba(218,31,41,0.09)' },
    link:   { label: 'Lien',   icon: <BsLink45Deg size={11} />,      color: '#186E54', bg: 'rgba(24,110,84,0.09)' },
    text:   null,
};

/* ════════════════════════════════════════════════════════
   PAGE HERO
════════════════════════════════════════════════════════ */

interface HeroProps {
    docsCount: number;
    infosCount: number;
    loading: boolean;
}

const PageHero: React.FC<HeroProps> = ({ docsCount, infosCount, loading }) => (
    <section className="ip-hero">

        <Container className="ip-hero-container">
            <div className="ip-hero-inner">
                {/* <motion.span
                    className="ip-hero-eyebrow"
                    initial={{ opacity: 0, y: -14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.48, ease: 'easeOut' }}
                >
                    94ème Saint-Augustin
                </motion.span> */}

                <motion.h1
                    className="ip-hero-title"
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.26, duration: 0.6, ease: 'easeOut' }}
                >
                    Documents<br />&amp; Informations
                </motion.h1>

                <motion.div
                    className="ip-hero-rule"
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ delay: 0.52, duration: 0.44, ease: 'easeOut' }}
                />

                <motion.p
                    className="ip-hero-sub"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.66, duration: 0.5, ease: 'easeOut' }}
                >
                    Retrouve ici tous les documents téléchargeables et les informations pratiques de l'unité.
                </motion.p>

                {!loading && (docsCount > 0 || infosCount > 0) && (
                    <motion.div
                        className="ip-hero-stats"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.86, duration: 0.48, ease: 'easeOut' }}
                    >
                        <div className="ip-hstat">
                            <span className="ip-hstat-num">{docsCount}</span>
                            <span className="ip-hstat-label">Document{docsCount !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="ip-hstat-sep" />
                        <div className="ip-hstat">
                            <span className="ip-hstat-num">{infosCount}</span>
                            <span className="ip-hstat-label">Information{infosCount !== 1 ? 's' : ''}</span>
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="ip-hero-deco" aria-hidden>
                <BsFileEarmarkTextFill size={230} />
            </div>
        </Container>
    </section>
);

/* ════════════════════════════════════════════════════════
   DOCUMENTS SECTION
════════════════════════════════════════════════════════ */

const DocumentsSection: React.FC<{ documents: DocumentData[] }> = ({ documents }) => (
    <section className="ip-docs-section">
        <Container>
            <div className="ip-sec-header">
                <motion.span className="ip-sec-eyebrow" {...fadeUp(0)}>Téléchargements</motion.span>
                <motion.h2 className="ip-sec-heading" {...fadeUp(0.08)}>Documents</motion.h2>
                <motion.div className="ip-sec-rule" {...fadeUp(0.14)} />
                <motion.p className="ip-sec-sub" {...fadeUp(0.2)}>
                    Télécharge les documents officiels de l'unité au format PDF.
                </motion.p>
            </div>

            {documents.length === 0 ? (
                <p className="ip-empty">Aucun document disponible pour le moment.</p>
            ) : (
                <motion.div
                    className="ip-docs-grid"
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                >
                    {documents.map(doc => (
                        <motion.div key={doc.id} variants={staggerItem} className="ip-doc-card">
                            {/* Icon */}
                            <div className="ip-doc-icon">
                                <BsFileEarmarkTextFill size={26} />
                            </div>

                            {/* Content */}
                            <div className="ip-doc-content">
                                <h3 className="ip-doc-title">{doc.title}</h3>
                                {doc.description && (
                                    <p className="ip-doc-desc">{doc.description}</p>
                                )}
                            </div>

                            {/* Download button */}
                            <a
                                href={doc.file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ip-doc-btn"
                            >
                                <BsFileArrowDownFill size={14} />
                                Télécharger
                            </a>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </Container>
    </section>
);

/* ════════════════════════════════════════════════════════
   INFORMATION CARD
════════════════════════════════════════════════════════ */

const InfoCard: React.FC<{ info: InformationData; index: number }> = ({ info, index }) => {
    const type     = getInfoType(info);
    const typeMeta = TYPE_META[type];

    return (
        <motion.div
            className="ip-info-card"
            {...fadeIn(index * 0.06)}
        >
            {/* ── Media ── */}
            {info.image && (
                <div className="ip-info-media">
                    <img src={info.image} alt={info.title} className="ip-info-img" />
                </div>
            )}
            {info.video && (
                <div className="ip-info-media">
                    <video controls className="ip-info-video">
                        <source src={info.video} type="video/mp4" />
                        Votre navigateur ne supporte pas les vidéos HTML5.
                    </video>
                </div>
            )}
            {info.videoLink && (
                <div className="ip-info-media ip-info-embed">
                    <iframe
                        src={info.videoLink}
                        title={info.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            )}

            {/* ── Body ── */}
            <div className="ip-info-body">
                {typeMeta && (
                    <span
                        className="ip-info-type-badge"
                        style={{ color: typeMeta.color, background: typeMeta.bg }}
                    >
                        {typeMeta.icon}
                        {typeMeta.label}
                    </span>
                )}

                <h3 className="ip-info-title">{info.title}</h3>

                {info.description && (
                    <p className="ip-info-desc">{info.description}</p>
                )}

                {info.link && (
                    <a
                        href={info.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ip-info-link-btn"
                    >
                        <BsLink45Deg size={14} />
                        En savoir plus
                    </a>
                )}
            </div>
        </motion.div>
    );
};

/* ════════════════════════════════════════════════════════
   INFORMATIONS SECTION
════════════════════════════════════════════════════════ */

const InformationsSection: React.FC<{ informations: InformationData[] }> = ({ informations }) => (
    <section className="ip-infos-section">
        <Container>
            <div className="ip-sec-header">
                <motion.span className="ip-sec-eyebrow" {...fadeUp(0)}>Ressources</motion.span>
                <motion.h2 className="ip-sec-heading" {...fadeUp(0.08)}>Informations</motion.h2>
                <motion.div className="ip-sec-rule" {...fadeUp(0.14)} />
                <motion.p className="ip-sec-sub" {...fadeUp(0.2)}>
                    Toutes les informations pratiques et ressources utiles de l'unité.
                </motion.p>
            </div>

            {informations.length === 0 ? (
                <p className="ip-empty">Aucune information disponible pour le moment.</p>
            ) : (
                <Masonry
                    breakpointCols={{ default: 3, 1199: 2, 767: 1 }}
                    className="ip-masonry"
                    columnClassName="ip-masonry-col"
                >
                    {informations.map((info, i) => (
                        <InfoCard key={info.id} info={info} index={i} />
                    ))}
                </Masonry>
            )}
        </Container>
    </section>
);

/* ════════════════════════════════════════════════════════
   LOADING SKELETON
════════════════════════════════════════════════════════ */

const DocSkeleton: React.FC = () => (
    <div className="ip-docs-grid">
        {[1, 2, 3].map(i => (
            <div key={i} className="ip-doc-card ip-skel-card">
                <div className="ip-skel ip-skel-icon" />
                <div className="ip-doc-content">
                    <div className="ip-skel" style={{ height: '1.3rem', width: '70%', marginBottom: '0.6rem', borderRadius: '6px' }} />
                    <div className="ip-skel" style={{ height: '0.9rem', width: '100%', marginBottom: '0.4rem', borderRadius: '4px' }} />
                    <div className="ip-skel" style={{ height: '0.9rem', width: '85%', borderRadius: '4px' }} />
                </div>
                <div className="ip-skel" style={{ height: '2.6rem', width: '100%', borderRadius: '10px', marginTop: 'auto' }} />
            </div>
        ))}
    </div>
);

const InfoSkeleton: React.FC = () => (
    <div className="ip-masonry">
        <div className="ip-masonry-col">
            {[1, 2].map(i => (
                <div key={i} className="ip-info-card ip-skel-card" style={{ marginBottom: '1.25rem' }}>
                    <div className="ip-skel" style={{ height: '200px', width: '100%', borderRadius: '14px 14px 0 0' }} />
                    <div className="ip-info-body">
                        <div className="ip-skel" style={{ height: '1.2rem', width: '60%', marginBottom: '0.7rem', borderRadius: '6px' }} />
                        <div className="ip-skel" style={{ height: '0.9rem', width: '100%', marginBottom: '0.4rem', borderRadius: '4px' }} />
                        <div className="ip-skel" style={{ height: '0.9rem', width: '80%', borderRadius: '4px' }} />
                    </div>
                </div>
            ))}
        </div>
        <div className="ip-masonry-col">
            {[1].map(i => (
                <div key={i} className="ip-info-card ip-skel-card">
                    <div className="ip-info-body">
                        <div className="ip-skel" style={{ height: '1.2rem', width: '55%', marginBottom: '0.7rem', borderRadius: '6px' }} />
                        <div className="ip-skel" style={{ height: '0.9rem', width: '100%', marginBottom: '0.4rem', borderRadius: '4px' }} />
                        <div className="ip-skel" style={{ height: '0.9rem', width: '90%', borderRadius: '4px' }} />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

/* ════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════ */

const InformationsPage: React.FC = () => {
    const baseURL = import.meta.env.VITE_API_URL;
    const [documents,    setDocuments]    = useState<DocumentData[]>([]);
    const [informations, setInformations] = useState<InformationData[]>([]);
    const [loading,      setLoading]      = useState(true);
    const [error,        setError]        = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const [docRes, infoRes] = await Promise.all([
                    axios.get<DocumentData[]>(`${baseURL}/documents/`),
                    axios.get<InformationData[]>(`${baseURL}/infos/`),
                ]);
                setDocuments(docRes.data);
                setInformations(infoRes.data);
            } catch (e) {
                console.error('Erreur chargement données:', e);
                setError('Impossible de charger les données. Veuillez réessayer plus tard.');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <div className="p-0">
            <PageHero
                docsCount={documents.length}
                infosCount={informations.length}
                loading={loading}
            />

            {error ? (
                <section className="ip-docs-section">
                    <Container>
                        <div className="ip-error">{error}</div>
                    </Container>
                </section>
            ) : (
                <>
                    <section className="ip-docs-section">
                        <Container>
                            <div className="ip-sec-header">
                                {/* <motion.span className="ip-sec-eyebrow" {...fadeUp(0)}>Téléchargements</motion.span> */}
                                <motion.h2 className="ip-sec-heading" {...fadeUp(0.08)}>Documents</motion.h2>
                                <motion.div className="ip-sec-rule" {...fadeUp(0.14)} />
                                <motion.p className="ip-sec-sub" {...fadeUp(0.2)}>
                                    Télécharge les documents officiels de l'unité au format PDF.
                                </motion.p>
                            </div>

                            {loading ? <DocSkeleton /> : (
                                documents.length === 0 ? (
                                    <p className="ip-empty">Aucun document disponible pour le moment.</p>
                                ) : (
                                    <motion.div
                                        className="ip-docs-grid"
                                        variants={stagger}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, amount: 0.1 }}
                                    >
                                        {documents.map(doc => (
                                            <motion.div key={doc.id} variants={staggerItem} className="ip-doc-card">
                                                <div className="ip-doc-icon">
                                                    <BsFileEarmarkTextFill size={26} />
                                                </div>
                                                <div className="ip-doc-content">
                                                    <h3 className="ip-doc-title">{doc.title}</h3>
                                                    {doc.description && (
                                                        <p className="ip-doc-desc">{doc.description}</p>
                                                    )}
                                                </div>
                                                <a
                                                    href={doc.file}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="ip-doc-btn"
                                                >
                                                    <BsFileArrowDownFill size={14} />
                                                    Télécharger
                                                </a>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )
                            )}
                        </Container>
                    </section>

                    <section className="ip-infos-section">
                        <Container>
                            <div className="ip-sec-header">
                                <motion.h2 className="ip-sec-heading" {...fadeUp(0.08)}>Informations</motion.h2>
                                <motion.div className="ip-sec-rule" {...fadeUp(0.14)} />
                                <motion.p className="ip-sec-sub" {...fadeUp(0.2)}>
                                    Toutes les informations pratiques et ressources utiles de l'unité.
                                </motion.p>
                            </div>

                            {loading ? <InfoSkeleton /> : (
                                informations.length === 0 ? (
                                    <p className="ip-empty">Aucune information disponible pour le moment.</p>
                                ) : (
                                    <Masonry
                                        breakpointCols={{ default: 3, 1199: 2, 767: 1 }}
                                        className="ip-masonry"
                                        columnClassName="ip-masonry-col"
                                    >
                                        {informations.map((info, i) => (
                                            <InfoCard key={info.id} info={info} index={i} />
                                        ))}
                                    </Masonry>
                                )
                            )}
                        </Container>
                    </section>
                </>
            )}
        </div>
    );
};

export default InformationsPage;
