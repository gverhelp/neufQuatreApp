import React from 'react';
import { Modal } from 'react-bootstrap';
import {
    BsCalendar3, BsClock, BsGeoAltFill, BsArrowUpRight,
    BsGoogle, BsApple, BsMicrosoft, BsStarFill,
} from 'react-icons/bs';

import '../styles/AgendaModals.css';
import { EventData } from '../types/interfaces';
import { getSectionInfo, eventLinks, mapsUrl } from '../utils/agenda';

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const fmtTime = (d: Date) => d.toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit' });

/* « Samedi 7 novembre 2026 » ou « Du samedi 31 octobre au lundi 2 novembre 2026 » */
function dateLabels(ev: EventData) {
    const start = new Date(ev.start_time);
    const end   = new Date(ev.end_time);
    const long: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };

    if (start.toDateString() === end.toDateString()) {
        return {
            date: capitalize(start.toLocaleDateString('fr-BE', { ...long, year: 'numeric' })),
            time: `${fmtTime(start)} – ${fmtTime(end)}`,
        };
    }
    return {
        date: `Du ${start.toLocaleDateString('fr-BE', long)} au ${end.toLocaleDateString('fr-BE', { ...long, year: 'numeric' })}`,
        time: `Départ ${fmtTime(start)} · Retour ${fmtTime(end)}`,
    };
}

interface EventDetailModalProps {
    event: EventData | null;
    onHide: () => void;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, onHide }) => {
    /* Garde le dernier événement affiché pendant l'animation de fermeture */
    const [shown, setShown] = React.useState<EventData | null>(event);
    if (event && event !== shown) setShown(event);
    const ev = event ?? shown;

    if (!ev) return null;

    const section = getSectionInfo(ev.section);
    const { date, time } = dateLabels(ev);
    const isPast = new Date(ev.end_time) < new Date();
    const links  = eventLinks(ev);

    const providers = [
        { key: 'google',  label: 'Google',  href: links.google,  icon: <BsGoogle size={15} />,    external: true  },
        { key: 'apple',   label: 'Apple',   href: links.apple,   icon: <BsApple size={17} />,     external: false },
        { key: 'outlook', label: 'Outlook', href: links.outlook, icon: <BsMicrosoft size={14} />, external: true  },
    ];

    return (
        <Modal
            show={!!event}
            onHide={onHide}
            centered
            dialogClassName="ap-evt-dialog"
            contentClassName="ap-evt-content"
            aria-labelledby="ap-evt-title"
            style={{ '--ec': section.color } as React.CSSProperties}
        >
            <Modal.Header closeButton className="ap-evt-header">
                <div className="ap-evt-badges">
                    <span className="ap-evt-section">{section.name}</span>
                    {ev.highlight && (
                        <span className="ap-evt-highlight">
                            <BsStarFill size={10} />
                            Événement phare
                        </span>
                    )}
                    {isPast && <span className="ap-evt-past">Passé</span>}
                </div>
            </Modal.Header>

            <Modal.Body className="ap-evt-body">
                <h2 id="ap-evt-title" className="ap-evt-title">{ev.title}</h2>

                <ul className="ap-evt-facts">
                    <li>
                        <BsCalendar3 size={14} />
                        <span>{date}</span>
                    </li>
                    <li>
                        <BsClock size={14} />
                        <span>{time}</span>
                    </li>
                    {ev.location && (
                        <li>
                            <BsGeoAltFill size={14} />
                            <span>
                                {ev.location}
                                <a
                                    href={mapsUrl(ev.location)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ap-evt-maps"
                                >
                                    Voir sur la carte
                                    <BsArrowUpRight size={11} />
                                </a>
                            </span>
                        </li>
                    )}
                </ul>

                {ev.description && <p className="ap-evt-desc">{ev.description}</p>}

                {!isPast && (
                    <div className="ap-evt-add">
                        <span className="ap-sync-label">Ajouter cet événement à</span>
                        <div className="ap-evt-add-btns">
                            {providers.map(p => (
                                <a
                                    key={p.key}
                                    href={p.href}
                                    {...(p.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                                    className="ap-evt-add-btn"
                                >
                                    {p.icon}
                                    {p.label}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default EventDetailModal;
