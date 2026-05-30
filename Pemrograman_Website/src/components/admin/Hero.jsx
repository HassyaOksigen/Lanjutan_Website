import '../styles/Hero.css'
import '../styles/Buttons.css'
import heroImg from '../assets/hero.png'

function Hero() {
  return (
    <section className="hero" style={{ backgroundImage: `url(${heroImg})` }}>
      <div className="hero__overlay"></div>

      <div className="hero__content">
        <h1 className="hero__title">Gerakkan Pertanian</h1>

        <p className="hero__subtitle">
          Menyewa alat pertanian menjadi semudah memesan
          <br />
          layanan online — cepat, transparan, dan efisien.
        </p>

        <a href="#" className="btn btn--hero">
          Mulai Sekarang
        </a>
      </div>
    </section>
  )
}

export default Hero
