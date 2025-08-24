import { useState } from 'react';

export default function Carousel() {
  const [current, setCurrent] = useState(0);

  const images = [
    '/images/coupe1.jpg',
    '/images/coupe2.jpg',
    '/images/coupe3.jpg',
  ];

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="carousel">
      <button onClick={prevSlide}>←</button>
      <img src={images[current]} alt="photo coupe" />
      <button onClick={nextSlide}>→</button>
    </div>
  );
}
