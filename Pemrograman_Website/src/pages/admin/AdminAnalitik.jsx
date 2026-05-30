import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient'; // Memastikan koneksi database aktif
import '../../styles/AdminPeralatan.css'; 
import '../../styles/AdminAnalitik.css'; 

import deskImg from '../../assets/Desk_alt.png';
import analysisImg from '../../assets/Line_up.png';
import delivery2Img from '../../assets/package_car (1).png';
import userImg from '../../assets/User.png';
import groupImg from '../../assets/Group_light.png';
import packageImg from '../../assets/package.png';
import deliveryImg from '../../assets/package_car.png';
import timeImg from '../../assets/Time.png';
import package2Img from '../../assets/package (1).png';

const AdminAnalitik = ({ session, setPage, currentPage }) => {
  // --- STATE DATA STATISTIK ATAS (DINAMIS SUPABASE) ---
  const [totalPenyewaanAktif, setTotalPenyewaanAktif] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  // Load indikator ringkasan statistik atas saat komponen dimuat
  useEffect(() => {
    fetchStatsData();
  }, []);

  const fetchStatsData = async () => {
    try {
      setLoadingStats(true);

      // Ambil data paralel secara bersamaan dari tabel penyewaan dan customer
      const [penyewaanRes, customerRes] = await Promise.all([
        supabase.from('penyewaan').select('status_transaksi'),
        supabase.from('customer').select('id_cust')
      ]);

      if (penyewaanRes.error) throw penyewaanRes.error;
      if (customerRes.error) throw customerRes.error;

      const rentals = penyewaanRes.data || [];
      const customers = customerRes.data || [];

      // 1. Total Penyewaan Aktif (Kode status 2 = Disetujui)
      const aktifCount = rentals.filter(r => r.status_transaksi === 2 || r.status_transaksi === "2").length;
      setTotalPenyewaanAktif(aktifCount);

      // 2. Pengguna Aktif (Jumlah total baris customer)
      setTotalCustomers(customers.length);

      // 3. Permintaan Tertunda (Kode status 1 = Pending)
      const pendingCount = rentals.filter(r => r.status_transaksi === 1 || r.status_transaksi === "1").length;
      setTotalPending(pendingCount);

    } catch (err) {
      console.error("Gagal memuat indikator statistik di menu analitik:", err.message);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Apakah Anda yakin ingin keluar dari akun Admin?");
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
      {/* Navbar Atas */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="brand-logo" onClick={() => setPage("admin-home")} style={{ cursor: 'pointer' }}>tandoor</div>
          <div className="user-nav-wrapper"> 
            <div className="user-profile">Admin</div>
            <button className="logout-btn" onClick={handleLogout} title="Keluar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            <div className="stat-info"><span>Peralatan</span><h2>3</h2></div>
            <img src={deliveryImg} alt="Delivery" className="custom-icon" />
          </div>
        </section>
      
        <div className="tab-navigation">
          <button className={`tab-btn ${currentPage === 'admin-home' || currentPage === 'home' || !currentPage ? 'active' : ''}`} onClick={() => setPage('admin-home')}> 
            Permintaan Sewa <img src={deskImg} alt="Desk" style={{ width: '16px', height: '16px', marginLeft: '5px' }} className="tab-icon-small" />
          </button>
          <button className={`tab-btn ${currentPage === 'admin-pengguna' ? 'active' : ''}`} onClick={() => setPage('admin-pengguna')}> 
            Pengguna <img src={userImg} alt="User" style={{ width: '16px', height: '16px', marginLeft: '5px' }} className="tab-icon-small" />
          </button>
          <button className={`tab-btn ${currentPage === 'admin-delivery' ? 'active' : ''}`} onClick={() => setPage('admin-delivery')}> 
            Pengiriman <img src={package2Img} alt="pack" style={{ width: '20px', height: '20px', marginLeft: '5px' }} className="tab-icon-small" />
          </button>
          <button className={`tab-btn ${currentPage === 'admin-equipment' ? 'active' : ''}`} onClick={() => setPage('admin-equipment')}> 
            Peralatan <img src={delivery2Img} alt="Delivery2" style={{ width: '20px', height: '20px', marginLeft: '5px' }} className="tab-icon-small" />
          </button>
          <button className={`tab-btn active`} onClick={() => setPage('admin-analitik')}> 
            Analitik <img src={analysisImg} alt="Analysis" style={{ width: '16px', height: '16px', marginLeft: '5px' }} className="tab-icon-small" />
          </button>
        </div>

        <div className="analitik-grid">
          <div className="analitik-card">
            <h3 className="card-title">Ringkasan Pendapatan</h3>
            <div className="income-list">
              <div className="income-item highlight">
                <span>Bulan Ini</span>
                <span className="price-text">Rp 1.000</span>
              </div>
              <div className="income-item">
                <span>Bulan Lalu</span>
                <span className="price-text">Rp 1.000</span>
              </div>
              <div className="income-item">
                <span>Total Pendapatan</span>
                <span className="price-text">Rp 1.000</span>
              </div>
            </div>
          </div>

          <div className="analitik-card">
            <h3 className="card-title">Peralatan Populer</h3>
            <div className="popular-list">
              {[1, 2, 3].map((rank) => (
                <div key={rank} className="popular-item">
                  <div className="rank-badge">{rank}</div>
                  <div className="item-details">
                    <span className="tool-name">John Deere 5075E Tractor</span>
                    <span className="rental-count">24 penyewaan</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <footer className="footer-spacer"></footer>
    </div>
  );
};

export default AdminAnalitik;