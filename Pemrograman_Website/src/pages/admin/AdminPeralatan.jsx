import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient"; // Memastikan koneksi database aktif
import "../../styles/AdminPeralatan.css";

import deskImg from "../../assets/Desk_alt.png";
import analysisImg from "../../assets/Line_up.png";
import delivery2Img from "../../assets/package_car (1).png";
import userImg from "../../assets/User.png";
import groupImg from "../../assets/Group_light.png";
import packageImg from "../../assets/package.png";
import deliveryImg from "../../assets/package_car.png";
import timeImg from "../../assets/Time.png";
import exportImg from "../../assets/Export.png";
import package2Img from "../../assets/package (1).png";

const AdminPeralatan = ({ session, setPage, currentPage }) => {
  // --- STATE DATA STATISTIK ATAS (DINAMIS SUPABASE) ---
  const [totalPenyewaanAktif, setTotalPenyewaanAktif] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  const [tools, setTools] = useState([
    {
      id: 1,
      name: "John Deere 5075E Tractor",
      category: "Traktor",
      price: "Rp 200.000",
      count: 3,
      status: "Tersedia",
      brand: "John Deere",
      model: "5075E",
      year: "2024",
      desc: "Traktor kuat.",
    },
    {
      id: 2,
      name: "Kubota L4400",
      category: "Traktor",
      price: "Rp 150.000",
      count: 1,
      status: "Disewa",
      brand: "Kubota",
      model: "L4400",
      year: "2023",
      desc: "Efisien.",
    },
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);

  // Load indikator ringkasan statistik atas saat komponen dimuat
  useEffect(() => {
    fetchStatsData();
  }, []);

  const fetchStatsData = async () => {
    try {
      setLoadingStats(true);

      // Ambil data paralel secara bersamaan dari tabel penyewaan dan customer
      const [penyewaanRes, customerRes] = await Promise.all([
        supabase.from("penyewaan").select("status_transaksi"),
        supabase.from("customer").select("id_cust"),
      ]);

      if (penyewaanRes.error) throw penyewaanRes.error;
      if (customerRes.error) throw customerRes.error;

      const rentals = penyewaanRes.data || [];
      const customers = customerRes.data || [];

      // 1. Total Penyewaan Aktif (Kode status 2 = Disetujui)
      const aktifCount = rentals.filter(
        (r) => r.status_transaksi === 2 || r.status_transaksi === "2",
      ).length;
      setTotalPenyewaanAktif(aktifCount);

      // 2. Pengguna Aktif (Jumlah total baris customer)
      setTotalCustomers(customers.length);

      // 3. Permintaan Tertunda (Kode status 1 = Pending)
      const pendingCount = rentals.filter(
        (r) => r.status_transaksi === 1 || r.status_transaksi === "1",
      ).length;
      setTotalPending(pendingCount);
    } catch (err) {
      console.error(
        "Gagal memuat indikator statistik di menu peralatan:",
        err.message,
      );
    } finally {
      setLoadingStats(false);
    }
  };

  const handleAddTool = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newTool = {
      id: Date.now(),
      name: formData.get("name"),
      category: formData.get("category"),
      price: formData.get("price"),
      count: 0,
      status: "Tersedia",
      brand: formData.get("brand"),
      model: formData.get("model"),
      year: formData.get("year"),
      desc: formData.get("desc"),
    };
    setTools([...tools, newTool]);
    setIsAddModalOpen(false);
  };

  const handleEditTool = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedTool = {
      ...selectedTool,
      name: formData.get("name"),
      category: formData.get("category"),
      price: formData.get("price"),
      brand: formData.get("brand"),
      model: formData.get("model"),
      status: formData.get("status"),
    };
    setTools(tools.map((t) => (t.id === selectedTool.id ? updatedTool : t)));
    setIsEditModalOpen(false);
  };

  const handleDeleteTool = (id) => {
    if (window.confirm("Hapus peralatan ini dari inventaris?")) {
      setTools(tools.filter((t) => t.id !== id));
    }
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm(
      "Apakah Anda yakin ingin keluar dari akun Admin?",
    );
    if (!confirmLogout) return;
    try {
      await supabase.auth.signOut();
      setPage("home");
    } catch (err) {
      console.error("Gagal melakukan sign-out:", err.message);
    }
  };

  return (
    <div className="admin-wrapper">
      <nav className="navbar">
        <div className="nav-container">
          <div
            className="brand-logo"
            onClick={() => setPage("admin-home")}
            style={{ cursor: "pointer" }}
          >
            tandoor
          </div>
          <div className="user-nav-wrapper">
            <div className="user-profile">Admin</div>
            <button
              className="logout-btn"
              onClick={handleLogout}
              title="Keluar"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <div className="main-content">
        <header className="page-header">
          <h1>Dashboard Admin</h1>
          <p>Kelola operasional platform dan permintaan pengguna</p>
        </header>

        {/* SINKRONISASI INDIKATOR ANGKA ATAS DENGAN DATABASE SUPABASE */}
        <section className="stats-container">
          <div className="stat-card">
            <div className="stat-info">
              <span>Total Penyewaan Aktif</span>
              <h2>{loadingStats ? "..." : totalPenyewaanAktif}</h2>
            </div>
            <img src={packageImg} alt="Package" className="custom-icon" />
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <span>Pengguna Aktif</span>
              <h2>{loadingStats ? "..." : totalCustomers}</h2>
            </div>
            <img src={groupImg} alt="Group" className="custom-icon" />
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <span>Permintaan Tertunda</span>
              <h2>{loadingStats ? "..." : totalPending}</h2>
            </div>
            <img src={timeImg} alt="Time" className="custom-icon" />
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <span>Peralatan</span>
              <h2>{tools.length}</h2>
            </div>
            <img src={deliveryImg} alt="Delivery" className="custom-icon" />
          </div>
        </section>

        <div className="tab-navigation">
          <button
            className={`tab-btn ${currentPage === "admin-home" || currentPage === "home" || !currentPage ? "active" : ""}`}
            onClick={() => setPage("admin-home")}
          >
            Permintaan Sewa{" "}
            <img
              src={deskImg}
              alt="Desk"
              style={{ width: "16px", height: "16px", marginLeft: "5px" }}
              className="tab-icon-small"
            />
          </button>
          <button
            className={`tab-btn ${currentPage === "admin-pengguna" ? "active" : ""}`}
            onClick={() => setPage("admin-pengguna")}
          >
            Pengguna{" "}
            <img
              src={userImg}
              alt="User"
              style={{ width: "16px", height: "16px", marginLeft: "5px" }}
              className="tab-icon-small"
            />
          </button>
          <button
            className={`tab-btn ${currentPage === "admin-delivery" ? "active" : ""}`}
            onClick={() => setPage("admin-delivery")}
          >
            Pengiriman{" "}
            <img
              src={package2Img}
              alt="pack"
              style={{ width: "20px", height: "20px", marginLeft: "5px" }}
              className="tab-icon-small"
            />
          </button>
          <button
            className={`tab-btn active`}
            onClick={() => setPage("admin-equipment")}
          >
            Peralatan{" "}
            <img
              src={delivery2Img}
              alt="Delivery2"
              style={{ width: "20px", height: "20px", marginLeft: "5px" }}
              className="tab-icon-small"
            />
          </button>
          <button
            className={`tab-btn ${currentPage === "admin-analitik" ? "active" : ""}`}
            onClick={() => setPage("admin-analitik")}
          >
            Analitik{" "}
            <img
              src={analysisImg}
              alt="Analysis"
              style={{ width: "16px", height: "16px", marginLeft: "5px" }}
              className="tab-icon-small"
            />
          </button>
        </div>

        <section className="management-box">
          <div className="management-header">
            <h2>Manajemen Alat</h2>
            <button className="btn-add" onClick={() => setIsAddModalOpen(true)}>
              Tambah Alat
            </button>
          </div>

          <div className="tools-grid">
            {tools.map((tool) => (
              <div key={tool.id} className="tool-card">
                <div className="tool-card-header">
                  <h3>{tool.name}</h3>
                  <span className={`status-badge ${tool.status.toLowerCase()}`}>
                    {tool.status}
                  </span>
                </div>
                <span className="category">{tool.category}</span>
                <div className="tool-details">
                  <div className="detail-row">
                    <span className="detail-label">Harga</span>
                    <span className="detail-value">{tool.price}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Jumlah Sewa</span>
                    <span className="detail-value">{tool.count}</span>
                  </div>
                </div>
                <div className="tool-actions">
                  <button
                    className="btn-edit"
                    onClick={() => {
                      setSelectedTool(tool);
                      setIsEditModalOpen(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteTool(tool.id)}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="close-x"
              onClick={() => setIsAddModalOpen(false)}
            >
              &times;
            </button>
            <div className="modal-header-text">
              <h2>Tambah Peralatan Baru</h2>
            </div>
            <form className="modal-form" onSubmit={handleAddTool}>
              <div className="form-section">
                <h3>Informasi Alat</h3>
                <div className="form-group">
                  <label>Nama Alat *</label>
                  <input name="name" type="text" required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Kategori *</label>
                    <select name="category">
                      <option value="Traktor">Traktor</option>
                      <option value="Bajak">Bajak</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Harga *</label>
                    <input name="price" type="text" required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Deskripsi</label>
                  <textarea name="desc"></textarea>
                </div>
              </div>
              <div className="form-section">
                <h3>Spesifikasi</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Manufaktur</label>
                    <input name="brand" type="text" />
                  </div>
                  <div className="form-group">
                    <label>Model</label>
                    <input name="model" type="text" />
                  </div>
                  <div className="form-group">
                    <label>Tahun</label>
                    <input name="year" type="text" />
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-submit">
                  Tambahkan Alat
                </button>
                <button
                  type="button"
                  className="btn-batal"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedTool && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="close-x"
              onClick={() => setIsEditModalOpen(false)}
            >
              &times;
            </button>
            <div className="modal-header-text">
              <h2>Edit Informasi Alat</h2>
            </div>
            <form className="modal-form" onSubmit={handleEditTool}>
              <div className="form-section">
                <div className="form-group">
                  <label>Nama Alat *</label>
                  <input
                    name="name"
                    type="text"
                    defaultValue={selectedTool.name}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Kategori *</label>
                    <select
                      name="category"
                      defaultValue={selectedTool.category}
                    >
                      <option value="Traktor">Traktor</option>
                      <option value="Bajak">Bajak</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Harga *</label>
                    <input
                      name="price"
                      type="text"
                      defaultValue={selectedTool.price}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="form-section">
                <div className="form-row">
                  <div className="form-group">
                    <label>Manufaktur</label>
                    <input
                      name="brand"
                      type="text"
                      defaultValue={selectedTool.brand}
                    />
                  </div>
                  <div className="form-group">
                    <label>Model</label>
                    <input
                      name="model"
                      type="text"
                      defaultValue={selectedTool.model}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Status Alat</label>
                  <select name="status" defaultValue={selectedTool.status}>
                    <option value="Tersedia">Tersedia</option>
                    <option value="Disewa">Disewa</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-submit">
                  Simpan Perubahan
                </button>
                <button
                  type="button"
                  className="btn-batal"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <footer className="footer-spacer"></footer>
    </div>
  );
};

export default AdminPeralatan;
