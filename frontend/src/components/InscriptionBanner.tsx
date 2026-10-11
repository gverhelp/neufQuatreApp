import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { BsPencilFill, BsHourglassSplit, BsArrowUpRight, BsEnvelopeFill } from 'react-icons/bs';

import '../styles/InscriptionBanner.css';
import { AccueilButton, InscriptionData } from '../types/interfaces';

const FALLBACK_CONTACT = 'mailto:unitesaintaugustin94@gmail.com';

/* Bandeau d'inscriptions : même réglage que le bouton « S'inscrire » de l'accueil */
const InscriptionBanner: React.FC = () => {
    const baseURL = import.meta.env.VITE_API_URL;
    const [inscription, setInscription] = useState<InscriptionData | null>(null);
    const [contact, setContact] = useState(FALLBACK_CONTACT);

    useEffect(() => {
        axios.get<InscriptionData>(`${baseURL}/inscriptions/`)
            .then(r => setInscription(r.data))
            .catch(e => console.error('Erreur chargement inscriptions :', e));
        axios.get<AccueilButton[]>(`${baseURL}/accueil-buttons/`)
            .then(r => { if (r.data[0]?.link) setContact(r.data[0].link); })
            .catch(() => {});
    }, [baseURL]);

    if (!inscription) return null;

    const open = inscription.ouvertes && !!inscription.lien_formulaire;

    return (
        <motion.div
            className={`insc-banner${open ? ' insc-banner-open' : ''}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
        >
            <div className="insc-icon" aria-hidden>
                {open ? <BsPencilFill size={18} /> : <BsHourglassSplit size={18} />}
            </div>

            <div className="insc-text">
                <div className="insc-title">
                    {open ? inscription.titre : 'Inscriptions fermées pour le moment'}
                </div>
                <div className="insc-sub">
                    {open
                        ? inscription.texte
                        : 'Une question ? Écris-nous, on te répond rapidement.'}
                </div>
            </div>

            {open ? (
                <a
                    href={inscription.lien_formulaire}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="insc-btn"
                >
                    Remplir le formulaire
                    <BsArrowUpRight size={13} />
                </a>
            ) : (
                <a href={contact} className="insc-btn insc-btn-outline">
                    <BsEnvelopeFill size={13} />
                    Nous contacter
                </a>
            )}
        </motion.div>
    );
};

export default InscriptionBanner;
