import { useNavigate } from 'react-router-dom';

/**
 * HeroSection — matches hp-diagnostik (1).html hero section exactly.
 */
export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background blobs */}
      <div
        className="hero-bg-blob"
        style={{ width: '500px', height: '500px', background: 'rgba(255,107,107,0.18)', top: '-100px', left: '-100px' }}
      />
      <div
        className="hero-bg-blob"
        style={{ width: '400px', height: '400px', background: 'rgba(84,160,255,0.15)', top: '200px', right: '-100px' }}
      />
      <div
        className="hero-bg-blob"
        style={{ width: '300px', height: '300px', background: 'rgba(29,209,161,0.12)', bottom: '-50px', left: '30%' }}
      />

      <div className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Diagnosa Gratis &amp; Instan
          </div>
          <h1>
            Cek Masalah<br />
            <span className="accent">HP-mu</span> dalam<br />
            <span className="accent2">Detik!</span>
          </h1>
          <p>
            Jelaskan gejala HP-mu dengan bahasa sehari-hari. Kami analisa, kamu dapat
            solusinya — tanpa ribet, tanpa istilah teknis.
          </p>
          <div className="hero-cta-group">
            <button
              className="clay-btn clay-btn-primary hero-cta-main"
              onClick={() => navigate('/diagnosa')}
            >
              🚀 Mulai Diagnosa
            </button>
            <button
              className="clay-btn clay-btn-ghost"
              onClick={() => {
                const el = document.getElementById('cara-kerja');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Lihat Cara Kerja ↓
            </button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <strong>50K+</strong>
              <span>Diagnosa Selesai</span>
            </div>
            <div className="hero-stat">
              <strong>98%</strong>
              <span>Akurasi Hasil</span>
            </div>
            <div className="hero-stat">
              <strong>&lt; 30 dtk</strong>
              <span>Waktu Analisis</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="phone-3d">
            <div className="phone-screen">
              <div className="phone-screen-icon">🔍</div>
              <div className="phone-screen-text">Diagnosa Aktif</div>
              <div className="phone-screen-bar" />
              <div className="phone-screen-bar short" />
              <div className="phone-screen-bar" />
            </div>
          </div>
          {/* Orbiting blobs */}
          <div
            className="phone-orb"
            style={{ width: '60px', height: '60px', background: 'rgba(255,107,107,0.3)', top: '40px', right: '-10px', animation: 'float-phone 2.5s ease-in-out infinite' }}
          />
          <div
            className="phone-orb"
            style={{ width: '40px', height: '40px', background: 'rgba(29,209,161,0.35)', bottom: '80px', left: '-10px', animation: 'float-phone 3.5s ease-in-out 0.5s infinite' }}
          />
          <div
            className="phone-orb"
            style={{ width: '28px', height: '28px', background: 'rgba(162,155,254,0.4)', top: '150px', right: '-30px', animation: 'float-phone 2s ease-in-out 1s infinite' }}
          />
        </div>
      </div>
    </section>
  );
}
