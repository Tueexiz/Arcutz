import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import '../styles/carousel.css';

export default function Carousel(){
  const items = [
    { id:1, src:'https://images.unsplash.com/photo-1593702295091-2c5f1a0b0b4a?q=80&w=1200&auto=format&fit=crop', alt:'Style 1' },
    { id:2, src:'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1200&auto=format&fit=crop', alt:'Style 2' },
    { id:3, src:'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=1200&auto=format&fit=crop', alt:'Style 3' },
    { id:4, src:'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop', alt:'Style 4' }
  ];
  return (
    <div className="glass card">
      <h3 style={{margin:'0 0 10px'}}>Portfolio</h3>
      <Swiper
        modules={[Navigation]}
        navigation
        slidesPerView={1.2}
        spaceBetween={16}
        breakpoints={{ 720:{ slidesPerView:2.2 }, 1024:{ slidesPerView:3 } }}
      >
        {items.map(x => (
          <SwiperSlide key={x.id}>
            <img src={x.src} alt={x.alt} style={{width:'100%', height:220, objectFit:'cover', borderRadius:16}} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
