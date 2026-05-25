import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';

/**
 * FeaturesSection — matches hp-diagnostik (1).html features bento section exactly.
 * Uses IntersectionObserver to trigger the .fade-up → .visible animation.
 */
export default function FeaturesSection() {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const targets = sectionRef.current?.querySelectorAll('.fade-up') ?? [];
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0 }
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="section" id="features" ref={sectionRef}>
      <div className="fade-up">
        <p className="section-label">🎯 Kenapa CekHP?</p>
        <h2>Diagnosa <em>Canggih</em>,<br />Bahasa Tetap Santai</h2>
      </div>
      <div className="bento-grid fade-up">
        <div className="clay-card feature-card fc-1">
          <div className="feature-icon fi-red">⚡</div>
          <h3>Cepat &amp; Akurat</h3>
          <p>
            Analisis selesai dalam hitungan detik. Sistem pintar kami mencocokkan gejala kamu
            dengan ribuan pola kerusakan yang sudah dipelajari.
          </p>
        </div>
        <div className="clay-card feature-card fc-2">
          <div className="feature-icon fi-blue">💬</div>
          <h3>Bahasa Mudah</h3>
          <p>
            Nggak ada istilah teknis yang bikin pusing. Semua penjelasan pakai bahasa Indonesia
            yang mudah dimengerti semua orang.
          </p>
        </div>
        <div className="clay-card feature-card fc-3">
          <div className="feature-icon fi-green">🛠️</div>
          <h3>Solusi Praktis</h3>
          <p>
            Bukan cuma diagnosa — kami kasih langkah-langkah perbaikan yang bisa kamu coba
            sendiri di rumah sebelum ke tukang servis.
          </p>
        </div>
        <div className="clay-card bento-big">
          <div>
            <h3>Lebih dari 200 Pola Kerusakan Terdeteksi</h3>
            <p>
              Dari baterai boros sampai layar mati total — database kami terus diperbarui
              dengan kasus terbaru dari seluruh Indonesia.
            </p>
            <button
              className="clay-btn clay-btn-green"
              style={{ marginTop: '20px' }}
              onClick={() => navigate('/diagnosa')}
            >
              Coba Sekarang →
            </button>
          </div>
          <div className="bento-big-visual">📱</div>
        </div>
      </div>
    </section>
  );
}
