import React, { useState, useEffect } from "react";
import { supabase } from '../../supabaseClient'; // Memastikan koneksi database aktif
import '../../styles/AdminDelivery.css';

import packageImg from '../../assets/package.png';
import deskImg from '../../assets/Desk_alt.png';
import analysisImg from '../../assets/Line_up.png';
import delivery2Img from '../../assets/package_car (1).png';
import userImg from '../../assets/User.png';
import groupImg from '../../assets/Group_light.png';
import deliveryImg from '../../assets/package_car.png';
import timeImg from '../../assets/Time.png';
import package2Img from '../../assets/package (1).png';
import searchImg from '../../assets/Search.png';

const AdminDelivery = ({ session, setPage, currentPage }) => {
  // --- STATE DATA UTAMA PANEL PENGIRIMAN ---
  const [deliveryData, setDeliveryData] = useState([]);
  const [loadingFetch, setLoadingFetch] = useState(true);

  // --- STATE DATA STATISTIK ATAS (DINAMIS SUPABASE) ---
  const [totalPenyewaanAktif, setTotalPenyewaanAktif] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalPending, setTotalPending] = useState(0);

  // Ambil data dari database Supabase saat pertama kali load
  useEffect(() => {
    fetchStatsAndDeliveries();
  }, []);

  const fetchStatsAndDeliveries = async () => {
    try {
      setLoadingFetch(true);

      // 1. Ambil data mentah secara paralel dari tabel terkait
      const [penyewaanRes, customerRes] = await Promise.all([
        supabase.from('penyewaan').select('*').order('tgl_pesan', { ascending: false }),
        supabase.from('customer').select('*')
      ]);

      if (penyewaanRes.error) throw penyewaanRes.error;
      if (customerRes.error) throw customerRes.error;

      const rawRentals = penyewaanRes.data || [];
      const rawCustomers = customerRes.data || [];

      // A. KALKULASI STATISTIK RINGKASAN ATAS
      const aktifCount = rawRentals.filter(r => r.status_transaksi === 2 || r.status_transaksi === "2").length;
      setTotalPenyewaanAktif(aktifCount);
      setTotalCustomers(rawCustomers.length);
      const pendingCount = rawRentals.filter(r => r.status_transaksi === 1 || r.status_transaksi === "1").length;
      setTotalPending(pendingCount);

      // B. FILTER & BUAT MANIFEST PENGIRIMAN (Hanya transaksi yang berstatus Disetujui/Aktif)
      // Kita memfilter penyewaan berstatus 2 (Disetujui) untuk dijadikan daftar Semua Pengiriman
      const approvedRentals = rawRentals.filter(r => r.status_transaksi === 2 || r.status_transaksi === "2");

      const formattedDeliveries = approvedRentals.map((item, index) => {
        // Cari kecocokan nama pelanggan berdasarkan id_cust agar tidak memunculkan UUID panjang
        const cocokCust = rawCustomers.find(cust => cust.id_cust === item.id_cust);
        let namaPenerima = "Pelanggan Tandoor";
        if (cocokCust) {
          const depan = cocokCust.nama_depan ? cocokCust.nama_depan.trim() : "";
          const belakang = cocokCust.nama_belakangan ? cocokCust.nama_belakangan.trim() : "";
          namaPenerima = `${depan} ${belakang}`.trim() || "Pelanggan Tandoor";
        }

        // Ambil data supir yang disimpan sementara di localStorage agar pilihan drop-down tidak hilang saat refresh
        const savedDriverState = JSON.parse(localStorage.getItem(`driver_assign_${item.transaksi_id}`) || "null");

        return {
          transaksiId: item.transaksi_id,
          idPengiriman: `SHP-${String(approvedRentals.length - index).padStart(3, '0')}`,
          supir: savedDriverState ? savedDriverState.supir : "Belum dipilih",
          tanggal: item.tgl_sewa || item.tgl_pesan || "30 Mei 2026",
          alamat: item.alamat_pengantaran || "Alamat Lahan User",
          penerima: namaPenerima,
          barang: "Alat Pertanian", // Cadangan dinamis tipe alat
          status: savedDriverState ? savedDriverState.status : "Pilih Driver"
        };
      });

      setDeliveryData(formattedDeliveries);
    } catch (err) {
      console.error("Gagal memuat manajemen pengiriman realtime:", err.message);
    } finally {
      setLoadingFetch(false);
    }
  };

  // Fungsi merubah atau menetapkan nama driver
  const handleAssignDriver = (transaksiId, driverName) => {
    if (!driverName) return;
    
    // Simpan status supir ke localState agar persistensinya terjaga dengan aman
    const driverState = {
      supir: driverName,
      status: "Dalam Perjalanan"
    };
    localStorage.setItem(`driver_assign_${transaksiId}`, JSON.stringify(driverState));
    
    // Refresh data tampilan di layar
    fetchStatsAndDeliveries();
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
    <div className="admin-container">
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

      <main className="admin-content">
        <header className="page-header">
          <h1>Dashboard Admin</h1>
          <p>Kelola operasional platform dan permintaan pengguna</p>
        </header>

        <section className="stats-container">
          <div className="stat-card">
            <div className="stat-info">
              <span>Total Penyewaan Aktif</span>
              <h2>{loadingFetch ? "..." : totalPenyewaanAktif}</h2>
            </div>
            <img src={packageImg} alt="Stats" className="custom-icon" />
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <span>Pengguna Aktif</span>
              <h2>{loadingFetch ? "..." : totalCustomers}</h2>
            </div>
            <img src={groupImg} alt="Stats" className="custom-icon" />
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <span>Permintaan Tertunda</span>
              <h2>{loadingFetch ? "..." : totalPending}</h2>
            </div>
            <img src={timeImg} alt="Stats" className="custom-icon" />
          </div>
          <div className="stat-card">
            <div className="stat-info"><span>Peralatan</span><h2>3</h2></div>
            <img src={deliveryImg} alt="Delivery" className="custom-icon" />
          </div>
        </section>

        <div className="tab-navigation">
          <button className={`tab-btn ${currentPage === 'admin-home' || currentPage === 'home' || !currentPage ? 'active' : ''}`} onClick={() => setPage('admin-home')}> 
            Permintaan Sewa <img src={deskImg} alt="" style={{ width: '16px', height: '16px', marginLeft: '5px' }} className="tab-icon-small" />
          </button>
          <button className={`tab-btn ${currentPage === 'admin-pengguna' ? 'active' : ''}`} onClick={() => setPage('admin-pengguna')}> 
            Pengguna <img src={userImg} alt="" style={{ width: '16px', height: '16px', marginLeft: '5px' }} className="tab-icon-small" />
          </button>
          <button className={`tab-btn active`} onClick={() => setPage('admin-delivery')}> 
            Pengiriman <img src={package2Img} alt="" style={{ width: '20px', height: '20px', marginLeft: '5px' }} className="tab-icon-small" />
          </button>
          <button className={`tab-btn ${currentPage === 'admin-equipment' ? 'active' : ''}`} onClick={() => setPage('admin-equipment')}> 
            Peralatan <img src={delivery2Img} alt="" style={{ width: '20px', height: '20px', marginLeft: '5px' }} className="tab-icon-small" />
          </button>
          <button className={`tab-btn ${currentPage === 'admin-analitik' ? 'active' : ''}`} onClick={() => setPage('admin-analitik')}> 
            Analitik <img src={analysisImg} alt="" style={{ width: '16px', height: '16px', marginLeft: '5px' }} className="tab-icon-small" />
          </button>
        </div>

        <div className="delivery-table-wrapper">
          <div className="delivery-header-row">
            <h2 className="delivery-title">Semua Pengiriman</h2>
            <div className="search-wrapper-delivery">
              <input type="text" placeholder="Telusuri pengiriman" className="search-input-delivery" />
              <img src={searchImg} alt="search" className="search-icon-delivery" />
            </div>
          </div>

          <table className="delivery-table">
            <thead>
              <tr>
                <th>ID Pengiriman</th>
                <th>Supir</th>
                <th>Tanggal Pengiriman</th>
                <th>Alamat</th>
                <th>Penerima</th>
                <th>Barang</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {loadingFetch ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                    Menghubungkan data logistik Supabase...
                  </td>
                </tr>
              ) : deliveryData.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                    Belum ada pengiriman barang yang aktif saat ini.
                  </td>
                </tr>
              ) : (
                deliveryData.map((item, index) => (
                  <tr key={index}>
                    <td className="font-bold">{item.idPengiriman}</td>
                    <td className={item.supir === "Belum dipilih" ? "text-gray" : ""}>
                      {item.supir}
                    </td>
                    <td>{item.tanggal}</td>
                    <td className="addr-cell" style={{ fontSize: '11px' }}>{item.alamat}</td>
                    {/* MENAMPILKAN NAMA PELANGGAN ASLI HASIL GABUNGAN SKEMA DB CUSTOMER */}
                    <td className="font-bold">{item.penerima}</td>
                    <td className="item-cell">{item.barang}</td>
                    <td className="text-center">
                      {item.status === "Pilih Driver" ? (
                        <div className="dropdown-container">
                          <select 
                            className="select-driver-minimal"
                            onChange={(e) => handleAssignDriver(item.transaksiId, e.target.value)}
                          >
                            <option value="">Pilih Driver</option>
                            <option value="Martin Jabrik">Martin Jabrik</option>
                            <option value="Sean Simpati">Sean Simpati</option>
                            <option value="Juju Chalant">Juju Chalant</option>
                          </select>
                        </div>
                      ) : (
                        <span className={`badge-status ${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                          {item.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
      <footer className="footer-spacer"></footer>
    </div> 
  );
};

export default AdminDelivery;