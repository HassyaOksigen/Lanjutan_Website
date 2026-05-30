// src/components/Hero.jsx
import heroBg from "../assets/hero.png"; 

function Hero({ setPage }) { 
  return (
    <section className="hero" style={{ backgroundImage: `url(${heroBg})` }}>
      <div className="hero__overlay"></div>

      <div className="container hero__content">
        <h1>Gerakkan Pertanian</h1>
        {}
        <p className="hero-description-bold">
          Menyewa alat pertanian menjadi semudah memesan layanan online — cepat, transparan, dan efisien.
        </p>
        
        {}
        <button 
          className="btn-mulai" 
          onClick={() => setPage("login")}
        >
          Mulai Sekarang
        </button>
      </div>
    </section>
  );
}

export default Hero;