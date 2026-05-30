// src/pages/EquipmentDetail.jsx
import Navbar from "../components/Navbar";
import peralatanImg from "../assets/peralatan.png";

function EquipmentDetail({ setPage, currentPage, session }) {
  return (
    <div className="detail-page">
      <Navbar setPage={setPage} currentPage="peralatan" session={session}/>

      <div className="container">
        <div className="back-link" onClick={() => setPage("equipment")}>
          <span>← Kembali</span>
        </div>

        {}
        <div className="detail-main">
          <div className="detail-image-box">
            <img src={peralatanImg} alt="John Deere 5075E" />
          </div>

          <div className="detail-info-box">
            <div className="title-row">
              <h2>John Deere 5075E Tractor</h2>
              <span className="status-badge">Tersedia</span>
            </div>
            <p className="detail-desc">
              Traktor pertanian serbaguna 110 HP (81 kW) 4WD yang tangguh,
              ditenagai oleh mesin 4 silinder 4.5L John Deere PTE (PowerTech
              Engine) dengan High-Pressure Common Rail.
            </p>

            <div className="price-card">
              <span>Harga Sewa</span>
              <span className="price-value">Rp10/hari</span>
            </div>

            <div className="action-box">
              <div className="action-info">
                <span>📅 Tersedia untuk Disewa Sekarang</span>
                <span>🚚 Tersedia pengiriman</span>
              </div>
              <button
                className="btn-pesan"
                onClick={() => setPage("rent-form")}
              >
                Pesan Sekarang
              </button>
            </div>
          </div>
        </div>

        {}
        <div className="detail-grid-info">
          <div className="info-card">
            <h3>Spesifikasi</h3>
            <ul className="spec-list">
              <li>
                <span>Daya Mesin:</span> <strong>120HP</strong>
              </li>
              <li>
                <span>Transmisi:</span> <strong>9F/3R</strong>
              </li>
              <li>
                <span>Aliran Hidrolik:</span> <strong>Open-Center</strong>
              </li>
              <li>
                <span>Berat:</span> <strong>4500 kg</strong>
              </li>
              <li>
                <span>Kapasitas Bahan Bakar:</span> <strong>220 Liter</strong>
              </li>
            </ul>
          </div>

          <div className="info-card">
            <h3>Fitur</h3>
            <ul className="feature-list">
              <li>Kabin berpendingin udara (AC)</li>
              <li>Kemudi ringan dengan power steering</li>
              <li>Sistem pengait 3 titik (3-point hitch)</li>
              <li>PTO untuk penggerak peralatan tambahan</li>
              <li>Lampu kerja LED untuk operasional malam hari</li>
              <li>Kursi suspensi ergonomis dan nyaman</li>
            </ul>
          </div>

          <div className="info-card">
            <h3>Fasilitas Penyewaan</h3>
            <ul className="feature-list">
              <li>Unit telah melalui pemeriksaan dan perawatan rutin</li>
              <li>Bantuan layanan pelanggan selama periode sewa</li>
              <li>Layanan pengantaran sesuai area operasional</li>
              <li>Buku panduan operasional alat</li>
              <li>Perlengkapan keselamatan dasar</li>
            </ul>
          </div>
        </div>
      </div>

      {}
      <div className="footer-green"></div>
    </div>
  );
}

export default EquipmentDetail;
