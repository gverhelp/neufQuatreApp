import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Form, Button, Alert, Spinner, Image, Modal, Row, Col } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BsCalendar3, BsArrowLeft, BsBroadcastPin,
    BsImages, BsPlayCircleFill, BsChatSquareText, BsJournalText,
} from 'react-icons/bs';

import { RadioCampData } from '../types/interfaces';
import '../styles/RadioCamps.css';

/* ════════════════════════════════════════════════════════
   CONSTANTS
════════════════════════════════════════════════════════ */

interface SectionMeta {
    name: string;
    band: string;
    color: string;
}

const SECTION_META: Record<string, SectionMeta> = {
    baladins:   { name: 'Baladins',   band: 'Ribambelle', color: '#00A0DD' },
    lutins:     { name: 'Lutins',     band: 'Ronde',      color: '#CC0739' },
    louveteaux: { name: 'Louveteaux', band: 'Meute',      color: '#186E54' },
    guides:     { name: 'Guides',     band: 'Compagnie',  color: '#1D325A' },
    eclaireurs: { name: 'Éclaireurs', band: 'Troupe',     color: '#015AA9' },
    pionniers:  { name: 'Pionniers',  band: 'Poste',      color: '#DA1F29' },
};

/* ════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════ */

function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()!.split(';')[0] || null;
    return null;
}

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('fr-BE', { dateStyle: 'long' });

const formatDateShort = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('fr-BE', { day: '2-digit', month: 'short' });

/* ════════════════════════════════════════════════════════
   ANIMATION HELPERS
════════════════════════════════════════════════════════ */

const fadeUp = (delay = 0) => ({
    initial:     { opacity: 0, y: 26 },
    whileInView: { opacity: 1, y: 0 },
    transition:  { duration: 0.55, ease: 'easeOut' as const, delay },
    viewport:    { once: true },
});

/* ════════════════════════════════════════════════════════
   PASSWORD GATE
════════════════════════════════════════════════════════ */

interface GateProps {
    meta: SectionMeta;
    sectionName: string;
    onValidate: () => void;
}

const PasswordGate: React.FC<GateProps> = ({ meta, sectionName, onValidate }) => {
    const baseURL = import.meta.env.VITE_API_URL;
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const csrftoken = getCookie('csrftoken');
            const response = await axios.post(
                `${baseURL}/radio-camps/${sectionName.toLowerCase()}/verify-password/`,
                { password },
                { headers: { 'X-CSRFToken': csrftoken || '' }, withCredentials: true }
            );
            if (response.data.success) {
                localStorage.setItem(`radioCampValidated-${sectionName}`, 'true');
                onValidate();
            } else {
                setError(response.data.error);
            }
        } catch (err) {
            const status = (err as any).response?.status;
            if (status === 404) {
                setError("Aucun Radio Camp n'est disponible pour cette section actuellement.");
            } else if (status === 429) {
                setError((err as any).response?.data?.detail ?? 'Trop de tentatives. Réessayez dans quelques secondes.');
            } else {
                setError('Une erreur est survenue lors de la vérification du mot de passe.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <section
            className="rcbs-gate"
            style={{ '--rcbs-accent': meta.color } as React.CSSProperties}
        >
            <div className="rcbs-gate-bg" aria-hidden />
            <div className="rcbs-gate-accent" aria-hidden />

            <Container className="rcbs-gate-container">
                <div className="rcbs-gate-wrapper">
                    <Link to="/radio-camps" className="rcbs-gate-back">
                        <BsArrowLeft size={14} />
                        <span>Retour à la carte</span>
                    </Link>

                    <motion.div
                        className="rcbs-gate-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    >
                        <div className="rcbs-gate-header">

                        <div className="rcbs-gate-eyebrow">
                            <BsBroadcastPin size={12} />
                            <span>Radio camp · {meta.band}</span>
                        </div>

                        <h1 className="rcbs-gate-title">
                            {meta.name}
                        </h1>
                    </div>

                    <div className="rcbs-gate-rule" />

                    <p className="rcbs-gate-desc">
                        Le Radio Camp permet aux parents de suivre les aventures de leurs enfants durant le camp.
                        Introduisez le mot de passe fourni par le staff d'Unité.
                    </p>

                    <Form onSubmit={handleSubmit} className="rcbs-gate-form">
                        <Form.Control
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Mot de passe"
                            className="rcbs-gate-input"
                            autoFocus
                        />
                        <Button
                            type="submit"
                            disabled={loading || !password.trim()}
                            className="rcbs-gate-btn"
                        >
                            {loading ? <Spinner animation="border" size="sm" /> : 'Accéder'}
                        </Button>
                    </Form>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.25 }}
                            >
                                <Alert variant="warning" className="rcbs-gate-error">
                                    {error}
                                </Alert>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <p className="rcbs-gate-help">
                        Vous n'avez pas reçu le mot de passe ?{' '}
                        <Link to="/sections/unite" className="rcbs-gate-link">
                            Contactez le staff d'unité
                        </Link>
                    </p>
                    </motion.div>
                </div>
            </Container>
        </section>
    );
};

/* ════════════════════════════════════════════════════════
   HERO (after validation)
════════════════════════════════════════════════════════ */

interface HeroProps {
    meta: SectionMeta;
    title?: string;
    startDate?: string;
    endDate?: string;
    postsCount: number;
    mediaCount: number;
}

const RCBSHero: React.FC<HeroProps> = ({ meta, title, startDate, endDate, postsCount, mediaCount }) => (
    <section className="rcbs-hero">
        <div className="rcbs-hero-bg" aria-hidden />
        <div className="rcbs-hero-accent" aria-hidden />

        <Link to="/radio-camps" className="rcbs-hero-back">
            <BsArrowLeft size={14} />
            <span>Carte</span>
        </Link>

        <Container className="rcbs-hero-container">
            <div className="rcbs-hero-inner">
                <motion.div
                    className="rcbs-hero-badges"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18, duration: 0.45 }}
                >
                    <span className="rcbs-hero-badge rcbs-hero-badge-accent">{meta.band}</span>
                </motion.div>

                <motion.h1
                    className="rcbs-hero-title"
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.55 }}
                >
                    {title ?? `${meta.name}, en direct du camp`}
                </motion.h1>

                {startDate && endDate && (
                    <motion.div
                        className="rcbs-hero-dates"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55, duration: 0.4 }}
                    >
                        <BsCalendar3 size={13} />
                        <span>
                            {formatDate(startDate)} → {formatDate(endDate)}
                        </span>
                    </motion.div>
                )}

                <motion.div
                    className="rcbs-hero-rule"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.65, duration: 0.42 }}
                />

                <motion.div
                    className="rcbs-hero-stats"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.82, duration: 0.45 }}
                >
                    <div className="rcbs-hstat">
                        <span className="rcbs-hstat-num">{postsCount}</span>
                        <span className="rcbs-hstat-label">Posts</span>
                    </div>
                    <div className="rcbs-hstat-sep" />
                    <div className="rcbs-hstat">
                        <span className="rcbs-hstat-num">{mediaCount}</span>
                        <span className="rcbs-hstat-label">Médias</span>
                    </div>
                </motion.div>
            </div>
        </Container>
    </section>
);

/* ════════════════════════════════════════════════════════
   POST CARD
════════════════════════════════════════════════════════ */

interface PostCardProps {
    index: number;
    post: {
        id: number;
        title: string;
        content: string;
        date: string;
        photos: { id: number; image: string; caption: string }[];
        videos: { id: number; video: string; caption: string }[];
    };
    onImageClick: (src: string, caption?: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ index, post, onImageClick }) => (
    <motion.article
        className="rcbs-post"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
    >
        <div className="rcbs-post-rail">
            <div className="rcbs-post-dot">
                <BsBroadcastPin size={12} />
            </div>
            <div className="rcbs-post-line" />
        </div>

        <div className="rcbs-post-card">
            <header className="rcbs-post-head">
                <div className="rcbs-post-date-wrap">
                    <div className="rcbs-post-date-num">{formatDateShort(post.date)}</div>
                    <div className="rcbs-post-date-full">
                        <BsCalendar3 size={11} />
                        {formatDate(post.date)}
                    </div>
                </div>
                <span className="rcbs-post-idx">#{String(index + 1).padStart(2, '0')}</span>
            </header>

            <div className="rcbs-post-body">
                <h2 className="rcbs-post-title">{post.title}</h2>

                {post.content && (
                    <p className="rcbs-post-content">{post.content}</p>
                )}

                {post.photos.length > 0 && (
                    <div className="rcbs-post-media">
                        <div className="rcbs-post-media-head">
                            <BsImages size={13} />
                            <span>Photos ({post.photos.length})</span>
                        </div>
                        <Row className="g-2">
                            {post.photos.map(photo => (
                                <Col xs={6} sm={4} md={3} key={photo.id}>
                                    <div
                                        className="ratio ratio-1x1 rcbs-photo"
                                        onClick={() => onImageClick(photo.image, photo.caption)}
                                    >
                                        <Image
                                            src={photo.image}
                                            alt={photo.caption || ''}
                                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                        />
                                        <div className="rcbs-photo-overlay" aria-hidden />
                                    </div>
                                    {photo.caption && (
                                        <small className="rcbs-photo-caption">{photo.caption}</small>
                                    )}
                                </Col>
                            ))}
                        </Row>
                    </div>
                )}

                {post.videos.length > 0 && (
                    <div className="rcbs-post-media">
                        <div className="rcbs-post-media-head">
                            <BsPlayCircleFill size={13} />
                            <span>Vidéos ({post.videos.length})</span>
                        </div>
                        <Row className="g-2">
                            {post.videos.map(video => (
                                <Col xs={12} md={6} key={video.id}>
                                    <div className="ratio ratio-16x9 rcbs-video">
                                        <video controls>
                                            <source src={video.video} type="video/mp4" />
                                        </video>
                                    </div>
                                    {video.caption && (
                                        <small className="rcbs-photo-caption">{video.caption}</small>
                                    )}
                                </Col>
                            ))}
                        </Row>
                    </div>
                )}
            </div>
        </div>
    </motion.article>
);

/* ════════════════════════════════════════════════════════
   FEED (after validation)
════════════════════════════════════════════════════════ */

interface FeedProps {
    meta: SectionMeta;
    radioCamp: RadioCampData;
    onImageClick: (src: string, caption?: string) => void;
}

const Feed: React.FC<FeedProps> = ({ meta, radioCamp, onImageClick }) => {
    const sortedPosts = [...(radioCamp?.posts ?? [])].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const totalMedia = sortedPosts.reduce(
        (acc, p) => acc + (p.photos?.length ?? 0) + (p.videos?.length ?? 0),
        0
    );

    return (
        <div
            className="rcbs-page"
            style={{ '--rcbs-accent': meta.color } as React.CSSProperties}
        >
            <RCBSHero
                meta={meta}
                title={radioCamp?.title}
                startDate={radioCamp?.start_date}
                endDate={radioCamp?.end_date}
                postsCount={sortedPosts.length}
                mediaCount={totalMedia}
            />

            {sortedPosts.length === 0 ? (
                <section className="rcbs-empty-wrap">
                    <Container>
                        <motion.div
                            className="rcbs-empty-card"
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="rcbs-empty-icon">
                                <BsJournalText size={34} />
                            </div>
                            <h3 className="rcbs-empty-title">Pas encore de post</h3>
                            <p className="rcbs-empty-text">
                                Le camp n'a pas encore commencé, ou le staff n'a pas encore publié d'update.
                                Revenez nous voir bientôt !
                            </p>
                        </motion.div>
                    </Container>
                </section>
            ) : (
                <section className="rcbs-feed-wrap">
                    <Container>
                        <div className="rcbs-sec-header">
                            <motion.h2 className="rcbs-sec-heading" {...fadeUp(0.05)}>
                                Le carnet de route
                            </motion.h2>
                            <motion.div className="rcbs-sec-rule" {...fadeUp(0.12)} />
                            <motion.p className="rcbs-sec-sub" {...fadeUp(0.2)}>
                                Jour après jour, les aventures de la section. Clique sur les photos pour les agrandir.
                            </motion.p>
                        </div>

                        <div className="rcbs-feed">
                            {sortedPosts.map((post, index) => (
                                <PostCard
                                    key={post.id}
                                    index={index}
                                    post={post}
                                    onImageClick={onImageClick}
                                />
                            ))}

                            <motion.div
                                className="rcbs-feed-end"
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                            >
                                <BsChatSquareText size={16} />
                                <span>Fin du carnet, revenez plus tard !</span>
                            </motion.div>
                        </div>
                    </Container>
                </section>
            )}
        </div>
    );
};

/* ════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════ */

const RadioCampBySection: React.FC<{ sectionName: string }> = ({ sectionName }) => {
    const baseURL = import.meta.env.VITE_API_URL;
    const meta = SECTION_META[sectionName.toLowerCase()] ?? {
        name: sectionName,
        band: '',
        color: '#022864',
    };

    const [validated, setValidated] = useState(false);
    const [radioCamp, setRadioCamp] = useState<RadioCampData | undefined>();
    const [loadError, setLoadError] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState<{ src: string; caption?: string } | null>(null);

    const handleImageClick = (src: string, caption?: string) => {
        setSelectedImage({ src, caption });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedImage(null);
    };

    useEffect(() => {
        setValidated(false);
        setRadioCamp(undefined);
        setLoadError('');
        const isValidated = localStorage.getItem(`radioCampValidated-${sectionName}`);
        if (isValidated === 'true') setValidated(true);
    }, [sectionName]);

    useEffect(() => {
        if (!validated) return;
        const fetchPosts = async () => {
            try {
                const response = await axios.get(`${baseURL}/radio-camps/${sectionName.toLowerCase()}`);
                setRadioCamp(response.data);
            } catch (err) {
                if ((err as any).response?.status === 404) {
                    setLoadError("Aucun Radio Camp n'est disponible pour cette section actuellement.");
                    localStorage.removeItem(`radioCampValidated-${sectionName}`);
                    setValidated(false);
                } else {
                    setLoadError('Une erreur est survenue lors du chargement des données.');
                }
            }
        };
        fetchPosts();
    }, [validated, sectionName]);

    // ── Password gate ────────────────────────────────────
    if (!validated) {
        return (
            <PasswordGate
                meta={meta}
                sectionName={sectionName}
                onValidate={() => setValidated(true)}
            />
        );
    }

    // ── Loading error ────────────────────────────────────
    if (loadError && !radioCamp) {
        return (
            <Container fluid className="rcbs-error-wrap">
                <Alert variant="danger">{loadError}</Alert>
            </Container>
        );
    }

    // ── Loading skeleton ─────────────────────────────────
    if (!radioCamp) {
        return (
            <div
                className="rcbs-page"
                style={{ '--rcbs-accent': meta.color } as React.CSSProperties}
            >
                <RCBSHero meta={meta} postsCount={0} mediaCount={0} />
                <section className="rcbs-feed-wrap">
                    <Container>
                        <div className="rcbs-feed">
                            {[0, 1].map(i => (
                                <div key={i} className="rcbs-post">
                                    <div className="rcbs-post-rail">
                                        <div className="rcbs-post-dot" />
                                        <div className="rcbs-post-line" />
                                    </div>
                                    <div className="rcbs-post-card rcbs-post-skel">
                                        <div className="rcbs-skel" style={{ height: 18, width: '40%' }} />
                                        <div className="rcbs-skel" style={{ height: 24, width: '75%', marginTop: 12 }} />
                                        <div className="rcbs-skel" style={{ height: 12, width: '100%', marginTop: 14 }} />
                                        <div className="rcbs-skel" style={{ height: 12, width: '88%', marginTop: 6 }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Container>
                </section>
            </div>
        );
    }

    return (
        <>
            <Feed meta={meta} radioCamp={radioCamp} onImageClick={handleImageClick} />

            <Modal
                show={showModal}
                onHide={handleCloseModal}
                centered
                size="lg"
                className="rcbs-lightbox"
            >
                <Modal.Body className="p-0 text-center">
                    {selectedImage && (
                        <>
                            <Image
                                src={selectedImage.src}
                                alt={selectedImage.caption || ''}
                                fluid
                                style={{ maxHeight: '80vh', objectFit: 'contain', width: '100%', backgroundColor: '#000' }}
                            />
                            {selectedImage.caption && (
                                <div className="rcbs-lightbox-caption">{selectedImage.caption}</div>
                            )}
                        </>
                    )}
                </Modal.Body>
            </Modal>
        </>
    );
};

export default RadioCampBySection;
