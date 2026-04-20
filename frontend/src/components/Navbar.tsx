import { Link, useLocation } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BsHouseDoorFill, BsCalendarEventFill, BsPeopleFill,
    BsBroadcastPin, BsFileEarmarkTextFill,
} from 'react-icons/bs';

import '../styles/Navbar.css';

/* ════════════════════════════════════════════════════════
   CONSTANTS
════════════════════════════════════════════════════════ */

const PAGES = [
    { name: 'Accueil',            path: '/',                   icon: <BsHouseDoorFill      size={13} /> },
    { name: 'Agenda',             path: '/agenda',             icon: <BsCalendarEventFill  size={13} /> },
    { name: 'Sections',           path: '/sections',           icon: <BsPeopleFill         size={13} /> },
    { name: 'Radio camp',         path: '/radio-camps',        icon: <BsBroadcastPin       size={13} /> },
    { name: 'Documents & infos',  path: '/documents-et-infos', icon: <BsFileEarmarkTextFill size={13} /> },
];

const isActive = (currentPath: string, targetPath: string): boolean => {
    if (targetPath === '/') return currentPath === '/';
    return currentPath === targetPath || currentPath.startsWith(targetPath + '/');
};

/* ════════════════════════════════════════════════════════
   NAVBAR
════════════════════════════════════════════════════════ */

function NavigationBar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number; opacity: number }>({
        left: 0,
        width: 0,
        opacity: 0,
    });

    const navWrapRef = useRef<HTMLDivElement>(null);
    const location = useLocation();
    const currentPath = location.pathname;
    const activeIndex = PAGES.findIndex(p => isActive(currentPath, p.path));

    /* Sliding pill indicator (desktop) */
    useEffect(() => {
        const updateIndicator = () => {
            const container = navWrapRef.current;
            if (!container || activeIndex < 0) {
                setIndicatorStyle(s => ({ ...s, opacity: 0 }));
                return;
            }
            const links = container.querySelectorAll<HTMLElement>('.nb-link');
            const activeLink = links[activeIndex];
            if (activeLink) {
                setIndicatorStyle({
                    left: activeLink.offsetLeft,
                    width: activeLink.offsetWidth,
                    opacity: 1,
                });
            }
        };

        updateIndicator();
        window.addEventListener('resize', updateIndicator);
        return () => window.removeEventListener('resize', updateIndicator);
    }, [activeIndex, menuOpen]);

    /* Scroll-aware shrink + shadow */
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    /* Lock body scroll when mobile menu is open */
    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [menuOpen]);

    /* Close menu on route change */
    useEffect(() => {
        setMenuOpen(false);
    }, [currentPath]);

    return (
        <>
            <header className={`nb-root ${scrolled ? 'nb-root--scrolled' : ''}`}>
                <Container className="nb-container">
                    <Link to="/" className="nb-brand" aria-label="Accueil — 94ème Saint-Augustin">
                        <span className="nb-brand-logo">
                            <img alt="" src="/94.png" />
                        </span>
                        <span className="nb-brand-text">
                            <span className="nb-brand-title">Saint-Augustin</span>
                            <span className="nb-brand-sub">Unité scoute · Forest</span>
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <nav
                        ref={navWrapRef}
                        className="nb-links d-none d-lg-flex"
                        aria-label="Navigation principale"
                    >
                        <span
                            className="nb-indicator"
                            style={{
                                left: indicatorStyle.left,
                                width: indicatorStyle.width,
                                opacity: indicatorStyle.opacity,
                            }}
                            aria-hidden
                        />

                        {PAGES.map(page => {
                            const active = isActive(currentPath, page.path);
                            return (
                                <Link
                                    key={page.path}
                                    to={page.path}
                                    className={`nb-link ${active ? 'nb-link--active' : ''}`}
                                >
                                    <span className="nb-link-icon">{page.icon}</span>
                                    <span>{page.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Mobile toggle */}
                    <button
                        type="button"
                        aria-controls="nb-mobile-menu"
                        aria-expanded={menuOpen}
                        aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                        onClick={() => setMenuOpen(o => !o)}
                        className={`nb-toggle d-lg-none ${menuOpen ? 'nb-toggle--open' : ''}`}
                    >
                        <span className="nb-burger-line" />
                        <span className="nb-burger-line" />
                        <span className="nb-burger-line" />
                    </button>
                </Container>
            </header>

            {/* Mobile menu overlay */}
            <AnimatePresence>
                {menuOpen && (
                    <>
                        <motion.div
                            key="nb-backdrop"
                            className="nb-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            onClick={() => setMenuOpen(false)}
                            aria-hidden
                        />
                        <motion.nav
                            key="nb-mobile-menu"
                            id="nb-mobile-menu"
                            className="nb-mobile d-lg-none"
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -10, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            aria-label="Menu mobile"
                        >
                            <ul className="nb-mobile-list">
                                {PAGES.map((page, i) => {
                                    const active = isActive(currentPath, page.path);
                                    return (
                                        <motion.li
                                            key={page.path}
                                            initial={{ opacity: 0, x: -12 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.06 * i + 0.1, duration: 0.3 }}
                                        >
                                            <Link
                                                to={page.path}
                                                onClick={() => setMenuOpen(false)}
                                                className={`nb-mobile-link ${active ? 'nb-mobile-link--active' : ''}`}
                                            >
                                                <span className="nb-mobile-link-icon">{page.icon}</span>
                                                <span>{page.name}</span>
                                            </Link>
                                        </motion.li>
                                    );
                                })}
                            </ul>

                            <div className="nb-mobile-footer">
                                <a
                                    href="mailto:unitesaintaugustin94@gmail.com"
                                    className="nb-mobile-contact"
                                >
                                    unitesaintaugustin94@gmail.com
                                </a>
                            </div>
                        </motion.nav>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

export default NavigationBar;
