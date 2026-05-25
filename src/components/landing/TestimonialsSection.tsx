import { useRef, useEffect } from 'react';

interface Testimonial {
  stars: string;
  text: string;
  initials: string;
  avatarGradient: string;
  name: string;
  sub: string;
}

const testimonials: Testimonial[] = [
  {
    stars: '★★★★★',
    text: '"HP Samsung aku baterainya cepat habis banget. Dikira rusak parah, ternyata cuma settingan yang salah. Gampang banget solusinya!"',
    initials: 'AG',
    avatarGradient: 'linear-gradient(135deg,#FF6B6B,#FF9F43)',
    name: 'Agung Pratama',
    sub: 'Pengguna Samsung',
  },
  {
    stars: '★★★★★',
    text: '"Layar iPhone aku tiba-tiba gerak sendiri waktu lagi di charge. CekHP langsung tahu penyebabnya dan kasih solusi yang tepat!"',
    initials: 'NR',
    avatarGradient: 'linear-gradient(135deg,#54A0FF,#A29BFE)',
    name: 'Nadia Rahayu',
    sub: 'Pengguna iPhone',
  },
  {
    stars: '★★★★★',
    text: '"Baterai Xiaomi aku drop parah. Setelah pakai CekHP ternyata ada masalah charging port. Langkah solusinya jelas banget!"',
    initials: 'BW',
    avatarGradient: 'linear-gradient(135deg,#1DD1A1,#00D2D3)',
    name: 'Budi Wicaksono',
    sub: 'Pengguna Xiaomi',
  },
  {
    stars: '★★★★★',
    text: '"Aplikasi yang luar biasa! Diagnosa cepat dan akurat. Saya bisa tahu masalah HP sebelum ke servis jadi nggak ketipu harga."',
    initials: 'SP',
    avatarGradient: 'linear-gradient(135deg,#FD79A8,#FECA57)',
    name: 'Siti Pertiwi',
    sub: 'Pengguna OPPO',
  },
  {
    stars: '★★★★★',
    text: '"Kamera belakang HP saya tiba-tiba blur. CekHP langsung deteksi masalah modul kamera. Setelah dibawa servis memang benar!"',
    initials: 'DH',
    avatarGradient: 'linear-gradient(135deg,#FF9F43,#FECA57)',
    name: 'Dimas Hendra',
    sub: 'Pengguna Realme',
  },
  {
    stars: '★★★★★',
    text: '"Sangat membantu! HP saya sering restart sendiri. Ternyata masalah RAM. Solusinya mudah dipahami dan berhasil!"',
    initials: 'RL',
    avatarGradient: 'linear-gradient(135deg,#A29BFE,#54A0FF)',
    name: 'Rina Lestari',
    sub: 'Pengguna Vivo',
  },
];

/**
 * TestimonialsSection — matches hp-diagnostik (1).html testimonials section exactly.
 * Includes drag-scroll behavior and IntersectionObserver for .fade-up animation.
 */
export default function TestimonialsSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  // Trigger .fade-up → .visible when section scrolls into view
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - trackRef.current.offsetLeft;
    scrollLeft.current = trackRef.current.scrollLeft;
    trackRef.current.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    trackRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const stopDragging = () => {
    isDragging.current = false;
    if (trackRef.current) trackRef.current.style.cursor = 'grab';
  };

  return (
    <section className="section fade-up" ref={sectionRef}>
      <p className="section-label">💬 Apa Kata Mereka?</p>
      <h2>Sudah <em>Ribuan</em> Pengguna<br />Terbantu!</h2>
      <div
        className="testimonial-track"
        id="testimonialTrack"
        ref={trackRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
      >
        {testimonials.map((t, i) => (
          <div key={i} className="clay-card testimonial-card">
            <div className="stars">{t.stars}</div>
            <p>{t.text}</p>
            <div className="reviewer">
              <div
                className="reviewer-avatar"
                style={{ background: t.avatarGradient }}
              >
                {t.initials}
              </div>
              <div>
                <div className="reviewer-name">{t.name}</div>
                <div className="reviewer-sub">{t.sub}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
