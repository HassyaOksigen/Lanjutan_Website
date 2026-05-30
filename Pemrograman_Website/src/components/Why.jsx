// src/components/Why.jsx
function Why() {
  const dataFeatures = [
    { icon: "🌿", title: "Ramah Lingkungan", desc: "Peralatan yang terawat dengan baik membantu mendukung praktik pertanian yang berkelanjutan dan efisien." },
    { icon: "⚡", title: "Efisien & Praktis", desc: "Proses penyewaan cepat dan mudah, membantu Anda menghemat waktu serta tenaga di lapangan." },
    { icon: "🛡️", title: "Terpercaya", desc: "Seluruh peralatan telah melalui proses pemeriksaan dan perawatan rutin untuk memastikan performa optimal." },
    { icon: "🚜", title: "Peralatan Lengkap", desc: "Berbagai pilihan alat pertanian tersedia sesuai kebutuhan, mulai dari pengolahan lahan hingga pendukung panen." },
  ];

  return (
    <section className="why container">
      <div className="why__header">
        <h2>Mengapa Memilih TANDOOR?</h2>
        <p>
          Kami memudahkan petani dan pelaku agribisnis mendapatkan akses alat pertanian berkualitas melalui platform penyewaan yang praktis, aman, dan terpercaya.
        </p>
      </div>

      <div className="why__grid">
        {dataFeatures.map((f, index) => (
          <div key={index} className="why-card">
            <div className="card-title-row">
              <span className="card-icon">{f.icon}</span>
              <h3>{f.title}</h3>
            </div>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Why;