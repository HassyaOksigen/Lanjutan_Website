import { useState } from "react";
import Navbar from "../components/Navbar";
import peralatanImg from "../assets/peralatan.png";

function Equipment({ setPage, session }) {
  const [searchTerm, setSearchTerm] = useState("");

  const tractors = Array(9).fill({
    name: "John Deere 5075E Tractor",
    type: "Traktor",
    price: "Rp 100/Hari",
    desc: "Traktor pertanian serbaguna 110 HP (81 kW) 4WD dengan High-Pressure Common Rail",
    status: "Tersedia",
  });

  // Fungsi untuk menangani pencarian saat ikon diklik
  const handleSearch = () => {
    if (searchTerm) {
      alert(`Mencari alat: ${searchTerm}`);
    }
  };

  const handleDetailClick = () => {
    if (session) {
      // Jika sudah login, lanjut ke halaman detail
      setPage("equipment-detail");
    } else {
      // Jika belum login, paksa buka modal login
      alert("Silakan login terlebih dahulu untuk melihat detail peralatan.");
      setPage("login");
    }
  };

  return (
    <div className="equipment-page">
      <Navbar setPage={setPage} currentPage="equipment" session={session} />

      <div className="container">
        <div className="equipment-header">
          <div className="header-text">
            <h2>Cari Peralatan</h2>
            <p>
              Pilih alat pertanian yang sesuai dengan kebutuhan pekerjaan Anda.
            </p>
          </div>

          {}
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Telusuri alat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()} // Bisa tekan Enter juga
            />
            <span className="search-icon" onClick={handleSearch}>
              🔍
            </span>
          </div>
        </div>

        <div className="filter-group">
          <button className="filter-btn active">Semua</button>
          <button className="filter-btn">Traktor</button>
          <button className="filter-btn">Bajak</button>
          <button className="filter-btn">Cultivator</button>
        </div>

        <div className="equipment-grid">
          {tractors.map((item, index) => (
            <div key={index} className="equipment-card">
              <div className="card-image">
                <img src={peralatanImg} alt={item.name} />
                <span className="status-badge">{item.status}</span>
              </div>
              <div className="card-body">
                <div className="card-title-row">
                  <h3>{item.name}</h3>
                  <span className="price">{item.price}</span>
                </div>
                <span className="category-tag">{item.type}</span>
                <p className="card-desc">{item.desc}</p>
                <div className="card-info">
                  <span>📅 Rental harian</span>
                  <span>🚚 Pengiriman</span>
                </div>
                <button
                  className="btn-detail"
                  onClick={handleDetailClick}
                >
                  Lihat Detail
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Equipment;
