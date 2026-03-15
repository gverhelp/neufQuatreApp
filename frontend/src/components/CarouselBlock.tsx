import { useState } from 'react';
import Image from 'react-bootstrap/Image';
import Carousel from 'react-bootstrap/Carousel';
import { Container } from 'react-bootstrap';
import { BsImages } from 'react-icons/bs';

interface CarouselBlockProps {
    images: string[];
    captions: string[];
}

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

    return (
        <Container fluid className="p-0 cb-wrapper">
            {/* Photo counter badge */}
            <div className="cb-counter">
                {activeIndex + 1} / {images.length}
            </div>

            <Carousel
                className="cb-carousel"
                interval={4000}
                fade
                activeIndex={activeIndex}
                onSelect={(i) => setActiveIndex(i)}
            >
                {images.map((image, index) => (
                    <Carousel.Item key={index}>
                        <Image
                            fluid
                            src={image}
                            className="w-100 cb-image"
                            alt={captions[index] || `Photo ${index + 1}`}
                        />
                        {captions[index] && (
                            <Carousel.Caption className="cb-caption">
                                <p className="cb-caption-text">{captions[index]}</p>
                            </Carousel.Caption>
                        )}
                    </Carousel.Item>
                ))}
            </Carousel>
        </Container>
    );
}

export default CarouselBlock;