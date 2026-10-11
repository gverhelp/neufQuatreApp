import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Container, Modal, Button } from 'react-bootstrap';
import {
    BsCalendar3, BsPeopleFill, BsFileEarmarkTextFill, BsBroadcast,
    BsArrowRight, BsPencilFill, BsEnvelopeFill, BsArrowDown, BsGeoAltFill, BsClock,
} from 'react-icons/bs';

import '../styles/Home.css';
import { AccueilItem, AccueilButton, EventData } from '../types/interfaces';
import { getSectionInfo } from '../utils/agenda';
import EventDetailModal from '../components/EventDetailModal';

/* ════════════════════════════════════════════════════════
   CONSTANTS
════════════════════════════════════════════════════════ */

const QUICK_LINKS = [
    { to: '/agenda',              icon: <BsCalendar3 size={22} />,            title: 'Agenda',       desc: "Consulte le programme de nos activités et les événements à venir." },
    { to: '/sections',            icon: <BsPeopleFill size={22} />,           title: 'Nos sections', desc: "Découvre toutes nos sections, des Baladins jusqu'au Clan."          },
    { to: '/radio-camps',         icon: <BsBroadcast size={22} />,            title: 'Radio Camps',  desc: "Reviens sur nos camps avec photos, vidéos et souvenirs."            },
    { to: '/documents-et-infos',  icon: <BsFileEarmarkTextFill size={22} />,  title: 'Infos & docs', desc: "Retrouve nos documents importants et toutes les infos pratiques."   },
];

/* ════════════════════════════════════════════════════════
   ANIMATION HELPERS
════════════════════════════════════════════════════════ */

const fadeUp = (delay = 0) => ({
    initial:     { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    transition:  { duration: 0.58, ease: 'easeOut' as const, delay },
    viewport:    { once: true },
});

const stagger = {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.1 } },
};

const staggerItem = {
    hidden:  { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } },
};

/* ════════════════════════════════════════════════════════
   UTILITY
════════════════════════════════════════════════════════ */

const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit' });

/* « 12:30 – 17:30 » le même jour, sinon « Ven. 18:00 → dim. 12:00 » */
function timeLabel(ev: EventData) {
    const s = new Date(ev.start_time);
    const e = new Date(ev.end_time);
    if (s.toDateString() === e.toDateString()) return `${fmtTime(ev.start_time)} – ${fmtTime(ev.end_time)}`;
    const wd = (d: Date) => d.toLocaleDateString('fr-BE', { weekday: 'short' });
    return `${wd(s)} ${fmtTime(ev.start_time)} → ${wd(e)} ${fmtTime(ev.end_time)}`;
}

function formatDate(iso: string) {
    const d = new Date(iso);
    const DAYS   = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const MONTHS = ['jan', 'fév', 'mar', 'avr', 'mai', 'jun', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc'];
    return { day: DAYS[d.getDay()], date: d.getDate(), month: MONTHS[d.getMonth()] };
}

/* ════════════════════════════════════════════════════════
   HERO
════════════════════════════════════════════════════════ */

const HeroSection: React.FC<{ buttons: AccueilButton[] }> = ({ buttons }) => {
    const [modal, setModal] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
    const y = useTransform(scrollYProgress, [0, 1], ['0%', '42%']);

    return (
        <div ref={ref} className="h-wrapper">
            <motion.img src="background4.webp" className="h-bg" style={{ y }} alt="" />
            <div className="h-overlay" />

            <div className="h-content">

                <motion.h1
                    className="h-title"
                    initial={{ opacity: 0, y: 36 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.65, ease: 'easeOut' }}
                >
                    94<sup>ème</sup> Unité<br />Saint-Augustin
                </motion.h1>

                <motion.div
                    className="h-rule"
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ delay: 0.68, duration: 0.48, ease: 'easeOut' }}
                />

                <motion.p
                    className="h-sub"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.84, duration: 0.52, ease: 'easeOut' }}
                >
                    Probably the best Unité in the world.
                </motion.p>

                <motion.div
                    className="h-ctas"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.05, duration: 0.5, ease: 'easeOut' }}
                >
                    <a
                        href={buttons[0]?.link || '#'}
                        target={buttons[0]?.link ? '_blank' : undefined}
                        rel={buttons[0]?.link ? 'noopener noreferrer' : undefined}
                        className="h-btn h-btn-gold"
                        onClick={e => { if (!buttons[0]?.link) { e.preventDefault(); setModal(true); } }}
                    >
                        <BsPencilFill size={14} />
                        S'inscrire
                    </a>
                    <a
                        href={buttons[1]?.link || '#'}
                        target={buttons[1]?.link ? '_blank' : undefined}
                        rel={buttons[1]?.link ? 'noopener noreferrer' : undefined}
                        className="h-btn h-btn-ghost"
                    >
                        <BsEnvelopeFill size={14} />
                        Nous contacter
                    </a>
                </motion.div>
            </div>

            <div className="h-scroll">
                <BsArrowDown size={15} />
                <span>Défiler</span>
            </div>

            <Modal show={modal} onHide={() => setModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title style={{ fontFamily: 'Titan One', color: '#022864' }}>
                        Inscriptions indisponibles
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-0 text-center" style={{ fontFamily: 'Roboto', color: '#4b5563', lineHeight: 1.7 }}>
                        Les inscriptions pour l'année prochaine ne sont pas ouvertes pour le moment.
                        Revenez un peu plus tard ou contactez-nous pour plus d'informations.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button style={{ background: '#022864', borderColor: '#022864' }} onClick={() => setModal(false)}>
                        D'accord
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

/* ════════════════════════════════════════════════════════
   EVENTS TEASER
════════════════════════════════════════════════════════ */

const EventsTeaser: React.FC<{ events: EventData[] }> = ({ events }) => {
    const [detail, setDetail] = useState<EventData | null>(null);
    const now = new Date();
    const upcoming = events
        .filter(e => new Date(e.start_time) >= now)
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
        .slice(0, 3);

    if (upcoming.length === 0) return null;

    const seeAll = (extra: string) => (
        <Link to="/agenda" className={`ev-see-all ${extra}`}>
            Tout l'agenda <BsArrowRight size={13} />
        </Link>
    );

    return (
        <section className="ev-wrap">
            <Container>
                <div className="ev-top">
                    <div className="blk-header">
                        <motion.h2 className="blk-heading" {...fadeUp(0.08)}>Prochains événements</motion.h2>
                        <motion.div className="blk-rule" {...fadeUp(0.14)} />
                    </div>
                    <motion.div {...fadeUp(0.1)} className="d-none d-md-block">
                        {seeAll('')}
                    </motion.div>
                </div>

                <motion.div
                    className="ev-grid"
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.15 }}
                >
                    {upcoming.map(ev => {
                        const { day, date, month } = formatDate(ev.start_time);
                        const section = getSectionInfo(ev.section);
                        return (
                            <motion.button
                                key={ev.id}
                                type="button"
                                className={`ev-card${section.slug === 'clan' ? ' ev-card-light' : ''}`}
                                style={{ '--ec': section.color } as React.CSSProperties}
                                variants={staggerItem}
                                onClick={() => setDetail(ev)}
                            >
                                <div className="ev-chip">
                                    <span className="ev-chip-day">{day}</span>
                                    <span className="ev-chip-date">{date}</span>
                                    <span className="ev-chip-month">{month}</span>
                                </div>
                                <div className="ev-card-body">
                                    <p className="ev-card-title">{ev.title}</p>
                                    <p className="ev-card-loc">
                                        <BsClock size={10} />
                                        {timeLabel(ev)}
                                    </p>
                                    {ev.location && (
                                        <p className="ev-card-loc">
                                            <BsGeoAltFill size={10} />
                                            {ev.location}
                                        </p>
                                    )}
                                    <span className="ev-card-pill">{section.name}</span>
                                </div>
                            </motion.button>
                        );
                    })}
                </motion.div>

                {/* Mobile : le lien vient après la liste */}
                <div className="ev-bottom d-md-none">{seeAll('')}</div>
            </Container>

            <EventDetailModal event={detail} onHide={() => setDetail(null)} />
        </section>
    );
};

/* ════════════════════════════════════════════════════════
   CONTENT BLOCK (inline, replaces ContentBlock component)
════════════════════════════════════════════════════════ */

const ContentPanel: React.FC<{ item: AccueilItem; reverse: boolean; bg: string }> = ({ item, reverse, bg }) => (
    <section className="cp-wrap" style={{ background: bg }}>
        <Container>
            <div className={`cp-row${reverse ? ' cp-row-rev' : ''}`}>
                <motion.div
                    className="cp-img"
                    initial={{ x: reverse ? 48 : -48, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.68, ease: 'easeOut' }}
                    viewport={{ once: true }}
                >
                    <img loading="lazy" decoding="async" src={item.image} alt={item.titre} />
                </motion.div>

                <motion.div
                    className="cp-text"
                    initial={{ x: reverse ? -48 : 48, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.68, ease: 'easeOut', delay: 0.12 }}
                    viewport={{ once: true }}
                >
                    <h2 className="cp-title">{item.titre}</h2>
                    <div className="cp-rule" />
                    <p className="cp-body">{item.description}</p>
                </motion.div>
            </div>
        </Container>
    </section>
);

/* ════════════════════════════════════════════════════════
   CONTENT SKELETON
════════════════════════════════════════════════════════ */

const ContentSkeleton: React.FC<{ bg: string }> = ({ bg }) => (
    <section className="cp-wrap" style={{ background: bg }}>
        <Container>
            <div className="cp-row">
                <div className="cp-img skel-box" style={{ aspectRatio: '4/3' }} />
                <div className="cp-text">
                    <div className="skel-box" style={{ height: '2.4rem', width: '65%', marginBottom: '1.2rem', borderRadius: '6px' }} />
                    <div className="skel-box" style={{ height: '1rem', width: '100%', marginBottom: '0.5rem', borderRadius: '4px' }} />
                    <div className="skel-box" style={{ height: '1rem', width: '100%', marginBottom: '0.5rem', borderRadius: '4px' }} />
                    <div className="skel-box" style={{ height: '1rem', width: '75%', borderRadius: '4px' }} />
                </div>
            </div>
        </Container>
    </section>
);

/* ════════════════════════════════════════════════════════
   IMAGE BREAK
════════════════════════════════════════════════════════ */

const ImageBreak: React.FC = () => (
    <section className="ib-wrap">
        <motion.img loading="lazy" decoding="async"
            src="background8.webp"
            className="ib-photo"
            alt=""
            initial={{ scale: 1.06 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            viewport={{ once: true }}
        />
        <div className="ib-overlay" />
        <div className="ib-content">
            <motion.h2 className="ib-title" {...fadeUp(0.14)}>Le scoutisme</motion.h2>
            <motion.div className="ib-rule" {...fadeUp(0.22)} />
            <motion.p className="ib-body" {...fadeUp(0.3)}>
                Un mouvement de jeunesse qui veut contribuer à l'éducation des jeunes
                pour les aider à devenir des citoyens critiques et engagés.
            </motion.p>
        </div>
    </section>
);

/* ════════════════════════════════════════════════════════
   QUICK NAV
════════════════════════════════════════════════════════ */

const QuickNav: React.FC = () => (
    <section className="qn-wrap">
        <Container>
            <div className="blk-header">
                <motion.h2 className="blk-heading" {...fadeUp(0.08)}>Tout en un clic</motion.h2>
                <motion.div className="blk-rule" {...fadeUp(0.14)} />
            </div>

            <motion.div
                className="qn-grid"
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
            >
                {QUICK_LINKS.map(item => (
                    <motion.div key={item.to} variants={staggerItem} style={{ height: '100%' }}>
                        <Link to={item.to} className="qn-card">
                            <div className="qn-card-bar" />
                            <div className="qn-icon">{item.icon}</div>
                            <div className="qn-card-title">{item.title}</div>
                            <p className="qn-card-desc">{item.desc}</p>
                            <span className="qn-card-cta">
                                Voir <BsArrowRight size={12} />
                            </span>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>
        </Container>
    </section>
);

/* ════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════ */

const Home: React.FC = () => {
    const baseURL = import.meta.env.VITE_API_URL;
    const [items,   setItems]   = useState<AccueilItem[]>([]);
    const [buttons, setButtons] = useState<AccueilButton[]>([]);
    const [events,  setEvents]  = useState<EventData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const [ri, rb, re] = await Promise.all([
                    axios.get<AccueilItem[]>(`${baseURL}/accueil-items/`),
                    axios.get<AccueilButton[]>(`${baseURL}/accueil-buttons`),
                    axios.get<EventData[]>(`${baseURL}/events/`),
                ]);
                setItems(ri.data.sort((a, b) => a.id - b.id));
                setButtons(rb.data.sort((a, b) => a.id - b.id));
                setEvents(re.data);
            } catch (e) {
                console.error('Erreur chargement données Home :', e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <>
            <HeroSection buttons={buttons} />
            {!loading && <EventsTeaser events={events} />}
            {loading
                ? <ContentSkeleton bg="#ffffff" />
                : items[0] && <ContentPanel item={items[0]} reverse={false} bg="#ffffff" />
            }
            <QuickNav />
            <ImageBreak />
            {loading
                ? <ContentSkeleton bg="#eef2f9" />
                : items[1] && <ContentPanel item={items[1]} reverse={true} bg="#eef2f9" />
            }
        </>
    );
};

export default Home;
