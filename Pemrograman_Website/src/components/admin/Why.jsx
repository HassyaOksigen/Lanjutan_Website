import '../styles/Why.css'
import '../styles/Global.css'

function Why() {
  return (
    <section className="why">

      <div className="why__header">
        <h2 className="why__title">Mengapa Memilih TANDOOR?</h2>

        <p className="why__subtitle">
          Kami memudahkan petani dan pelaku agribisnis mendapatkan akses alat pertanian
          berkualitas melalui platform penyewaan yang praktis, aman, dan terpercaya.
        </p>
      </div>

      <div className="why__grid">

        <div className="card">
          <div className="card__icon card__icon--green">
            <i className="fa-solid fa-leaf"></i>
          </div>

          <h3 className="card__title">Ramah Lingkungan</h3>

          <p className="card__desc">
            Peralatan yang terawat dengan baik membantu mendukung praktik pertanian
            yang berkelanjutan dan efisien.
          </p>
        </div>

        <div className="card">
          <div className="card__icon card__icon--yellow">
            <i className="fa-solid fa-bolt"></i>
          </div>

          <h3 className="card__title">Efisien & Praktis</h3>

          <p className="card__desc">
            Proses penyewaan cepat dan mudah, membantu Anda menghemat waktu serta
            tenaga di lapangan.
          </p>
        </div>

        <div className="card">
          <div className="card__icon card__icon--red">
            <i className="fa-solid fa-shield-halved"></i>
          </div>

          <h3 className="card__title">Terpercaya</h3>

          <p className="card__desc">
            Seluruh peralatan telah melalui proses pemeriksaan dan perawatan rutin untuk
            memastikan performa optimal di setiap penggunaan.
          </p>
        </div>

        <div className="card">
          <div className="card__icon card__icon--orange">
            <i className="fa-solid fa-tractor"></i>
          </div>

          <h3 className="card__title">Peralatan Lengkap</h3>

          <p className="card__desc">
            Berbagai pilihan alat pertanian tersedia sesuai kebutuhan, mulai dari
            pengolahan lahan hingga pendukung panen.
          </p>
        </div>

      </div>

    </section>
  )
}

export default Why
