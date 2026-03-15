import Image from 'react-bootstrap/Image';
import Carousel from 'react-bootstrap/Carousel';
import { Container } from 'react-bootstrap';

interface CarouselBlockProps {
    images: string[];
    captions: string[];
}

function CarouselBlock(carouselBlockProps: CarouselBlockProps) {
    const { images, captions } = carouselBlockProps;

    if (images.length === 0) {
        return (
            <Container fluid className="p-0">
                <div className="carousel" style={{ height: "70vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <h3>Aucune image disponible</h3>
                </div>
            </Container>
        );
    }

    return (
        <>
        <Container fluid className="p-0">
            <Carousel className="carousel" style={{ height: "70vh" }} interval={3000}>
                {images.map((image, index) => (
                    <Carousel.Item key={index}>
                        <Image
                            fluid
                            src={image}
                            className="w-100"
                            style={{ height: "70vh", objectFit: "cover" }}
                        />
                        <Carousel.Caption>
                            <h3>{captions[index]}</h3>
                        </Carousel.Caption>
                    </Carousel.Item>
                ))}
            </Carousel>
        </Container>
        <style>
            {`
                @media (max-width: 768px) {
                    .carousel {
                        height: 35vh !important;
                    }
                    .carousel img {
                        height: 35vh !important;
                    }
                }
            `}
        </style>
        </>
    );
}
  
  export default CarouselBlock;