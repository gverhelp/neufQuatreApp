import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BsGeoAltFill, BsHeadphones, BsCompass } from "react-icons/bs";
import "../styles/RadioCamps.css";

const sections = [
  { label: "Baladins", top: "28%", left: "18%", path: "/radio-camps/baladins",   delay: 0.10, color: "#00A0DD"},
  { label: "Lutins", top: "70%", left: "30%", path: "/radio-camps/lutins",     delay: 0.25, color: "#CC0739"},
  { label: "Louveteaux",top: "37%", left: "49%", path: "/radio-camps/louveteaux", delay: 0.40, color: "#186E54"},
  { label: "Guides", top: "65%", left: "54%", path: "/radio-camps/guides",     delay: 0.55, color: "#1D325A"},
  { label: "Éclaireurs", top: "20%", left: "75%", path: "/radio-camps/eclaireurs", delay: 0.70, color: "#015AA9"},
  { label: "Pionniers", top: "80%", left: "85%", path: "/radio-camps/pionniers",  delay: 0.85, color: "#DA1F29"},
];


const RadioCamps = () => {
  const navigate = useNavigate();

  return (
    <div className="rc-root">

      {/* ════════════════════ DESKTOP ════════════════════ */}
      <div
        className="d-none d-lg-block rc-map-wrapper"
        style={{ backgroundImage: "url('/backgroundMap.webp')" }}
      >
        {/* Depth overlays */}
        <div className="rc-vignette" />
        <div className="rc-ocean-tint" />

        {/* Animated clouds */}
        <div className="rc-cloud rc-cloud-1" />
        <div className="rc-cloud rc-cloud-2" />
        <div className="rc-cloud rc-cloud-3" />

        {/* ── Hero title (glassmorphism) ── */}
        <motion.div
          className="rc-title-block"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <div className="rc-eyebrow">
            <BsCompass className="rc-eyebrow-icon" size={13} />
            <span>Choisissez votre destination</span>
          </div>
          <h1 className="rc-main-title">Radio Camp</h1>
          <div className="rc-title-divider" />
          <p className="rc-main-subtitle">
            Cliquez sur une épingle pour découvrir les émissions
          </p>
        </motion.div>

        {/* ── Compass widget ── */}
        <motion.div
          className="rc-compass-widget"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 0.8 }}
        >
          <BsCompass size={46} className="rc-compass-icon" />
          <span className="rc-compass-n">N</span>
        </motion.div>

        {/* ── Map pins ── */}
        {sections.map((s, i) => (
          // Outer div handles absolute positioning; inner motion.div handles animation
          <div
            key={i}
            className="rc-pin-anchor"
            style={{ top: s.top, left: s.left }}
          >
            <motion.div
              className="rc-pin-group"
              style={{ "--pin-color": s.color } as React.CSSProperties}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8 + s.delay, type: "spring", stiffness: 220, damping: 14 }}
              onClick={() => navigate(s.path)}
            >
              <div className="rc-pulse rc-pulse-1" />
              <div className="rc-pulse rc-pulse-2" />
              <div className="rc-pulse rc-pulse-3" />
              <div className="rc-pin-dot">
                <BsGeoAltFill size={15} color="white" />
              </div>
              {/* Hover tooltip card */}
              <div className="rc-pin-card">
                <div className="rc-pin-card-top">
                  <span className="rc-pin-card-label">{s.label}</span>
                </div>
                <div className="rc-pin-card-cta">
                  <BsHeadphones size={11} />
                  <span>Écouter</span>
                </div>
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      {/* ════════════════════ MOBILE ════════════════════ */}
      <div className="d-block d-lg-none rc-mobile">
        {/* Map hero strip */}
        <div
          className="rc-mobile-hero"
          style={{ backgroundImage: "url('/backgroundMap.webp')" }}
        >
          <div className="rc-mobile-hero-overlay" />
          <motion.div
            className="rc-mobile-hero-content"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75 }}
          >
            <BsCompass size={28} className="rc-compass-spin" />
            <h1 className="rc-main-title" style={{ marginTop: "0.5rem" }}>
              Radio Camp
            </h1>
            <p className="rc-mobile-sub">Choisissez votre destination</p>
          </motion.div>
        </div>

        {/* Destination cards */}
        <div className="rc-mobile-cards">
          {sections.map((s, i) => (
            <motion.div
              key={i}
              className="rc-destination-card"
              style={{ "--pin-color": s.color } as React.CSSProperties}
              initial={{ opacity: 0, y: 22, rotate: i % 2 === 0 ? -1.5 : 1.5 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.09, type: "spring", stiffness: 160 }}
              onClick={() => navigate(s.path)}
            >
              <div className="rc-dc-body">
                <div className="rc-dc-text">
                  <div className="rc-dc-label">{s.label}</div>
                </div>
                <BsHeadphones size={18} className="rc-dc-arrow" />
              </div>
              <div className="rc-dc-footer">Voir les émissions →</div>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default RadioCamps;

