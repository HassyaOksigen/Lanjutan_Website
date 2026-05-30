import '../styles/Footer.css'
import logo from '../assets/logo.png'

function Footer() {
  return (
     <footer className="footer">
      <div className="container">

        <div className="footer__grid">

          {/* Brand */}
          <div className="footer__col footer__col--brand">
            <img src={logo} alt="Tandoor Logo" className="logo-img logo-img--footer"   />

            <p className="footer__tagline">
              Platform penyewaan alat pertanian yang praktis, aman, dan terpercaya untuk petani Indonesia.
            </p>

            <div className="footer__socials">
              <a href="#" className="social-btn"><i className="fa-brands fa-instagram"></i></a>
              <a href="#" className="social-btn"><i className="fa-brands fa-facebook-f"></i></a>
              <a href="#" className="social-btn"><i className="fa-brands fa-x-twitter"></i></a>
              <a href="#" className="social-btn"><i className="fa-brands fa-youtube"></i></a>
            </div>
          </div>

          {/* Navigasi */}
          <div className="footer__col">
            <h4 className="footer__heading">Navigasi</h4>
            <ul className="footer__list">
              <li><a href="#">Beranda</a></li>
              <li><a href="#">Peralatan</a></li>
              <li><a href="#">Penyewaan Saya</a></li>
              <li><a href="#">Hubungi Kami</a></li>
            </ul>
          </div>

          {/* Layanan */}
          <div className="footer__col">
            <h4 className="footer__heading">Layanan</h4>
            <ul className="footer__list">
              <li><a href="#">Sewa Alat</a></li>
              <li><a href="#">Jadwal Penyewaan</a></li>
              <li><a href="#">Panduan Penggunaan</a></li>
              <li><a href="#">FAQ</a></li>
            </ul>
          </div>

          {/* Kontak */}
          <div className="footer__col">
            <h4 className="footer__heading">Kontak</h4>

            <ul className="footer__list footer__list--contact">
              <li>
                <i className="fa-solid fa-envelope"></i>
                <span>halo@tandoor.id</span>
              </li>

              <li>
                <i className="fa-solid fa-phone"></i>
                <span>+62 812-3456-7890</span>
              </li>

              <li>
                <i className="fa-solid fa-location-dot"></i>
                <span>Jl. Pertanian No. 12,<br />Bogor, Jawa Barat</span>
              </li>
            </ul>

          </div>

        </div>

        <div className="footer__divider"></div>

        <div className="footer__bottom">
          <p className="footer__copy">
            © 2026 Tandoor. Seluruh hak cipta dilindungi.
          </p>

          <div className="footer__bottom-links">
            <a href="#">Kebijakan Privasi</a>
            <a href="#">Syarat & Ketentuan</a>
          </div>
        </div>

      </div>
    </footer>
  )
}

export default Footer
