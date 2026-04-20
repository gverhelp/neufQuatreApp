import { useEffect, useRef, useState } from 'react';
import { BsArrowUp } from 'react-icons/bs';
import { motion, AnimatePresence } from 'framer-motion';

import '../styles/BackToTop.css';

const SHOW_THRESHOLD = 320;
const RADIUS = 22;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function BackToTopButton() {
    const [showButton, setShowButton] = useState(false);
    const progressRef = useRef(0);
    const circleRef = useRef<SVGCircleElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            const y = window.scrollY;
            setShowButton(y > SHOW_THRESHOLD);

            const max = document.documentElement.scrollHeight - window.innerHeight;
            const pct = max > 0 ? Math.min(y / max, 1) : 0;
            progressRef.current = pct;

            if (circleRef.current) {
                circleRef.current.style.strokeDashoffset = `${CIRCUMFERENCE * (1 - pct)}`;
            }
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <AnimatePresence>
            {showButton && (
                <motion.button
                    type="button"
                    onClick={scrollToTop}
                    aria-label="Retour en haut de la page"
                    className="btt-btn"
                    initial={{ opacity: 0, y: 24, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 24, scale: 0.9 }}
                    transition={{ duration: 0.32, ease: 'easeOut' }}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.94 }}
                >
                    {/* Scroll progress ring */}
                    <svg className="btt-ring" viewBox="0 0 52 52" aria-hidden>
                        <circle
                            ref={circleRef}
                            className="btt-ring-progress"
                            cx="26"
                            cy="26"
                            r={RADIUS}
                            strokeDasharray={CIRCUMFERENCE}
                            strokeDashoffset={CIRCUMFERENCE * (1 - progressRef.current)}
                        />
                    </svg>

                    <span className="btt-icon" aria-hidden>
                        <BsArrowUp size={18} strokeWidth={0.5} />
                    </span>
                </motion.button>
            )}
        </AnimatePresence>
    );
}

export default BackToTopButton;
