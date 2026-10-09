import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import {
    BsCalendarPlusFill, BsGoogle, BsApple, BsMicrosoft, BsLink45Deg,
    BsCheck, BsCheck2, BsArrowRepeat, BsChevronRight,
} from 'react-icons/bs';

import '../styles/AgendaModals.css';
import { SECTIONS, buildFeedUrl, subscriptionLinks } from '../utils/agenda';

interface CalendarSyncModalProps {
    show: boolean;
    onHide: () => void;
    /** Sections cochées à l'ouverture */
    initialSections: string[];
}

/* Abonnement iCal (Google / Apple / Outlook) aux sections choisies */
const CalendarSyncModal: React.FC<CalendarSyncModalProps> = ({ show, onHide, initialSections }) => {
    const [selected, setSelected] = useState<string[]>([]);
    const [copied, setCopied] = useState(false);

    /* À chaque ouverture : repart des sections présélectionnées */
    const handleShow = () => {
        setSelected(initialSections);
        setCopied(false);
    };

    const allSelected = selected.length === SECTIONS.length;
    const isEmpty     = selected.length === 0;

    const toggle = (slug: string) =>
        setSelected(cur => cur.includes(slug) ? cur.filter(s => s !== slug) : [...cur, slug]);

    /* Garde l'ordre de SECTIONS dans l'URL, peu importe l'ordre des clics */
    const feedUrl = buildFeedUrl(SECTIONS.filter(s => selected.includes(s.slug)).map(s => s.slug));
    const links   = subscriptionLinks(feedUrl);

    const providers = [
        { key: 'google',  label: 'Google Agenda',    hint: 'Android, Gmail',       href: links.google,  icon: <BsGoogle size={17} />,    external: true  },
        { key: 'apple',   label: 'Apple Calendrier', hint: 'iPhone, iPad, Mac',    href: links.apple,   icon: <BsApple size={19} />,     external: false },
        { key: 'outlook', label: 'Outlook',          hint: 'Outlook.com, Hotmail', href: links.outlook, icon: <BsMicrosoft size={16} />, external: true  },
    ];

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(feedUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2200);
        } catch {
            window.prompt('Copie ce lien :', feedUrl);
        }
    };

    return (
        <Modal show={show} onShow={handleShow} onHide={onHide} centered dialogClassName="ap-sync-dialog" contentClassName="ap-sync-content">
            <Modal.Header closeButton className="ap-sync-header">
                <Modal.Title className="ap-sync-title">
                    <BsCalendarPlusFill size={18} />
                    Ajouter à mon agenda
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="ap-sync-body">
                <p className="ap-sync-intro">
                    Choisis les sections à suivre. Les événements apparaîtront dans ton agenda
                    et se mettront à jour automatiquement.
                </p>

                <div className="ap-sync-label-row">
                    <span className="ap-sync-label">Sections</span>
                    <button
                        type="button"
                        className="ap-sync-toggle-all"
                        onClick={() => setSelected(allSelected ? [] : SECTIONS.map(s => s.slug))}
                    >
                        {allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
                    </button>
                </div>

                {/* Tuiles à taille fixe : la case à cocher est toujours là, seul son état change */}
                <div className="ap-sync-sections" role="group" aria-label="Sections à ajouter">
                    {SECTIONS.map(s => {
                        const on = selected.includes(s.slug);
                        return (
                            <button
                                key={s.slug}
                                type="button"
                                className={`ap-sync-section${on ? ' ap-sync-section-on' : ''}`}
                                style={{ '--fc': s.color } as React.CSSProperties}
                                onClick={() => toggle(s.slug)}
                                aria-pressed={on}
                            >
                                <span className="ap-sync-check" aria-hidden>
                                    <BsCheck size={16} />
                                </span>
                                <span className="ap-sync-section-name">{s.name}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="ap-sync-label-row">
                    <span className="ap-sync-label">Ajouter à</span>
                </div>

                <div className={`ap-sync-providers${isEmpty ? ' ap-sync-providers-empty' : ''}`}>
                    {providers.map(p => (
                        <a
                            key={p.key}
                            href={p.href}
                            {...(p.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                            className="ap-sync-provider"
                            aria-disabled={isEmpty}
                            tabIndex={isEmpty ? -1 : undefined}
                        >
                            <span className="ap-sync-provider-icon">{p.icon}</span>
                            <span className="ap-sync-provider-text">
                                <span className="ap-sync-provider-label">{p.label}</span>
                                <span className="ap-sync-provider-hint">{p.hint}</span>
                            </span>
                            <BsChevronRight size={14} className="ap-sync-provider-chevron" />
                        </a>
                    ))}
                </div>

                {isEmpty ? (
                    <p className="ap-sync-hint">Sélectionne au moins une section.</p>
                ) : (
                    <button type="button" className="ap-sync-copy" onClick={copyLink}>
                        {copied ? <BsCheck2 size={14} /> : <BsLink45Deg size={15} />}
                        {copied ? 'Lien copié' : 'Copier le lien (autres agendas)'}
                    </button>
                )}

                <p className="ap-sync-note">
                    <BsArrowRepeat size={12} />
                    Google et Outlook peuvent mettre plusieurs heures à afficher les modifications.
                </p>
            </Modal.Body>
        </Modal>
    );
};

export default CalendarSyncModal;
