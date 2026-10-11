import { useState } from 'react';
import Image from 'react-bootstrap/Image';
import Carousel from 'react-bootstrap/Carousel';
import { Container } from 'react-bootstrap';
import { BsImages, BsChevronLeft, BsChevronRight } from 'react-icons/bs';

interface CarouselBlockProps {
    images: string[];
    captions: string[];
}

/* Au-delà, les points deviennent illisibles : le compteur suffit */
const MAX_DOTS = 12;

function CarouselBlock({ images, captions }: CarouselBlockProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    if (images.length === 0) {
        return (
            <Container fluid className="cb-empty">
                <BsImages size={36} className="cb-empty-icon" />
                <p className="cb-empty-text">Aucune image disponible</p>
            </Container>
        );
    }

    const many = images.length > 1;

    return (
        <Container className="cb-wrapper">
            <div className="cb-frame">
                {many && (
                    <div className="cb-counter" aria-live="polite">
                        {activeIndex + 1} / {images.length}
                    </div>
                )}

                <Carousel
                    className="cb-carousel"
                    interval={5000}
                    fade
                    activeIndex={activeIndex}
                    onSelect={(i) => setActiveIndex(i)}
                    indicators={false}
                    controls={many}
                    prevIcon={<span className="cb-arrow" aria-hidden><BsChevronLeft size={16} /></span>}
                    nextIcon={<span className="cb-arrow" aria-hidden><BsChevronRight size={16} /></span>}
                    prevLabel="Photo précédente"
                    nextLabel="Photo suivante"
                >
                    {images.map((image, index) => (
                        <Carousel.Item key={index}>
                            <Image loading="lazy" decoding="async"
                                src={image}
                                className="w-100 cb-image"
                                alt={captions[index] || `Photo ${index + 1}`}
                            />
                            {captions[index] && (
                                <div className="cb-caption">{captions[index]}</div>
                            )}
                        </Carousel.Item>
                    ))}
                </Carousel>
            </div>

            {many && images.length <= MAX_DOTS && (
                <div className="cb-dots">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            className={`cb-dot${index === activeIndex ? ' cb-dot-active' : ''}`}
                            onClick={() => setActiveIndex(index)}
                            aria-label={`Photo ${index + 1}`}
                            aria-current={index === activeIndex}
                        />
                    ))}
                </div>
            )}
        </Container>
    );
}

export default CarouselBlock;
