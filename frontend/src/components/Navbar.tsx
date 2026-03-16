import { Link, useLocation } from "react-router-dom";
import '../styles/Navbar.css';
import { Navbar, Container } from "react-bootstrap";
import { useState, useEffect, useRef } from "react";


const pages = [
    { name: "Accueil", path: "/" },
    { name: "Agenda", path: "/agenda" },
    { name: "Sections", path: "/sections" },
    { name: "Radio Camps", path: "/radio-camps" },
    { name: "Documents et infos", path: "/documents-et-infos" },
];


function NavigationBar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number; opacity: number }>({
        left: 0,
        width: 0,
        opacity: 0,
    });

    const navWrapRef = useRef<HTMLDivElement>(null);
    const location = useLocation();
    const currentPath = location.pathname;
    const activeIndex = pages.findIndex(p => p.path === currentPath);


    useEffect(() => {
        const updateIndicator = () => {
            const container = navWrapRef.current;
            if (!container || activeIndex < 0) return;
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


    return (
        <Navbar
            data-bs-theme="dark"
            expand="lg"
            fixed="top"
            expanded={menuOpen}
            className="nb-root"
        >
            <Container>
                <Navbar.Brand as={Link} to="/" className="nb-brand">
                    <img alt="" src="/94.png" width="70" height="50" className="me-2" />
                    <span className="d-none d-xl-inline">Unité Saint-Augustin</span>
                </Navbar.Brand>

                <button
                    aria-controls="nb-collapse"
                    aria-expanded={menuOpen}
                    aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                    onClick={() => setMenuOpen(!menuOpen)}
                    className={`nb-toggle d-lg-none ${menuOpen ? "nb-toggle--open" : ""}`}
                >
                    <span className="nb-burger-line" />
                    <span className="nb-burger-line" />
                    <span className="nb-burger-line" />
                </button>

                <Navbar.Collapse id="nb-collapse">
                    <div ref={navWrapRef} className="ms-auto nb-links">
                        {/* Sliding active indicator — desktop only */}
                        <span
                            className="nb-indicator"
                            style={{
                                left: indicatorStyle.left,
                                width: indicatorStyle.width,
                                opacity: indicatorStyle.opacity,
                            }}
                        />

                        {pages.map((page, index) => (
                            <Link
                                key={index}
                                to={page.path}
                                onClick={() => setMenuOpen(false)}
                                className={`nb-link ${currentPath === page.path ? "nb-link--active" : ""}`}
                            >
                                {page.name}
                            </Link>
                        ))}
                    </div>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavigationBar;
