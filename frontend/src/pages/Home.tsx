import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Container, Modal, Button } from 'react-bootstrap';
import {
    BsCalendar3, BsPeopleFill, BsFileEarmarkTextFill, BsBroadcast,
    BsArrowRight, BsPencilFill, BsEnvelopeFill, BsArrowDown, BsGeoAltFill,
} from 'react-icons/bs';

import '../styles/Home.css';
import { AccueilItem, AccueilButton, EventData } from '../types/interfaces';
import {
    fadeUp,
    staggerContainer,
    staggerItem,
    heroTitle,
    heroRule,
    heroSubtitle,
    easeOut,
    DURATION,
} from '../styles/motion';

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
   UTILITY
════════════════════════════════════════════════════════ */

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

                <motion.h1 className="h-title" {...heroTitle(0.35)}>
                    94<sup>ème</sup> Unité<br />Saint-Augustin
                </motion.h1>

                <motion.div className="h-rule" {...heroRule(0.68)} />

                <motion.p className="h-sub" {...heroSubtitle(0.84)}>
                    Probably the best Unité in the world.
                </motion.p>

                <motion.div className="h-ctas" {...heroSubtitle(1.05)}>
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
                    <Modal.Title style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)' }}>
                        Inscriptions indisponibles
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-0 text-center" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-body)', lineHeight: 'var(--line-height-base)' }}>
                        Les inscriptions pour l'année prochaine ne sont pas ouvertes pour le moment.
                        Revenez un peu plus tard ou contactez-nous pour plus d'informations.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button style={{ background: 'var(--color-primary)', borderColor: 'var(--color-primary)' }} onClick={() => setModal(false)}>
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
    const now = new Date();
    const upcoming = events
        .filter(e => new Date(e.start_time) >= now)
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
        .slice(0, 3);

    if (upcoming.length === 0) return null;

    return (
        <section className="ev-wrap">
            <Container>
                <div className="ev-top">
                    <div className="blk-header">
                        <motion.h2 className="blk-heading" {...fadeUp(0.08)}>Prochains événements</motion.h2>
                        <motion.div className="blk-rule" {...fadeUp(0.14)} />
                    </div>
                    <motion.div {...fadeUp(0.1)}>
                        <Link to="/agenda" className="ev-see-all">
                            Tout l'agenda <BsArrowRight size={13} />
                        </Link>
                    </motion.div>
                </div>

                <motion.div
                    className="ev-grid"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.15 }}
                >
                    {upcoming.map(ev => {
                        const { day, date, month } = formatDate(ev.start_time);
                        return (
                            <motion.div key={ev.id} className="ev-card" variants={staggerItem}>
                                <div className="ev-chip">
                                    <span className="ev-chip-day">{day}</span>
                                    <span className="ev-chip-date">{date}</span>
                                    <span className="ev-chip-month">{month}</span>
                                </div>
                                <div className="ev-card-body">
                                    <p className="ev-card-title">{ev.title}</p>
                                    {ev.location && (
                                        <p className="ev-card-loc">
                                            <BsGeoAltFill size={10} />
                                            {ev.location}
                                        </p>
                                    )}
                                    {ev.section && (
                                        <span className="ev-card-pill">{ev.section}</span>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </Container>
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
                    viewport={{ once: true, amount: 0.05 }}
                    transition={{ duration: DURATION.hero, ease: easeOut }}
                >
                    <img src={item.image} alt={item.titre} />
                </motion.div>

                <motion.div
                    className="cp-text"
                    initial={{ x: reverse ? -48 : 48, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true, amount: 0.05 }}
                    transition={{ duration: DURATION.hero, ease: easeOut, delay: 0.12 }}
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
                <div className="cp-img skel" style={{ aspectRatio: '4/3' }} />
                <div className="cp-text">
                    <div className="skel" style={{ height: '2.4rem', width: '65%', marginBottom: '1.2rem', borderRadius: '6px' }} />
                    <div className="skel" style={{ height: '1rem', width: '100%', marginBottom: '0.5rem', borderRadius: '4px' }} />
                    <div className="skel" style={{ height: '1rem', width: '100%', marginBottom: '0.5rem', borderRadius: '4px' }} />
                    <div className="skel" style={{ height: '1rem', width: '75%', borderRadius: '4px' }} />
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
        <motion.img
            src="background8.webp"
            className="ib-photo"
            alt=""
            initial={{ scale: 1.06 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, amount: 0.05 }}
            transition={{ duration: 1.5, ease: easeOut }}
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
                variants={staggerContainer}
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
                ? <ContentSkeleton bg="var(--color-surface)" />
                : items[0] && <ContentPanel item={items[0]} reverse={false} bg="var(--color-surface)" />
            }
            <QuickNav />
            <ImageBreak />
            {loading
                ? <ContentSkeleton bg="var(--color-bg)" />
                : items[1] && <ContentPanel item={items[1]} reverse={true} bg="var(--color-bg)" />
            }
        </>
    );
};

export default Home;
