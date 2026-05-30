import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

import packageImg from '../../assets/package.png';
import groupImg from '../../assets/Group_light.png';
import timeImg from '../../assets/Time.png';
import deliveryImg from '../../assets/package_car.png';
import deskImg from '../../assets/Desk_alt.png';
import userImg from '../../assets/User.png';
import delivery2Img from '../../assets/package_car (1).png';
import analysisImg from '../../assets/Line_up.png';
import paymentImg from '../../assets/Arhive_alt_add.png';
import package2Img from '../../assets/package (1).png';

const AdminDashboard = ({ session, setPage, currentPage }) => {
  const [rentals, setRentals] = useState([]);
  const [totalCustomers, setTotalCustomers] = useState(0); // State baru untuk menyimpan jumlah customer dinamis
  const [loadingFetch, setLoadingFetch] = useState(true);

  // 1. Ambil data realtime dari Supabase saat halaman dimuat
  useEffect(() => {
    fetchPenyewaanData();
  }, []);

  const fetchPenyewaanData = async () => {
    try {
      setLoadingFetch(true);
      
      // A. Ambil data utama dari tabel penyewaan
      const { data: penyewaanData, error: penyewaanError } = await supabase
        .from('penyewaan')
        .select('*')
        .order('tgl_pesan', { ascending: false });

      if (penyewaanError) throw penyewaanError;

      // Amankan jika data penyewaan kosong
      let initialFinalized = [];
      if (penyewaanData && penyewaanData.length > 0) {
        initialFinalized = penyewaanData.map(sewa => ({
          ...sewa,
          nama_lahan_display: sewa.nama_pertanian || 'Tidak Ada Nama Lahan',
          nama_pelanggan_display: 'Pelanggan Tandoor'
        }));
      }

      // B. Jalankan pencocokan silang ke tabel informasi_lahan & customer di dalam blok terisolasi
      try {
        const { data: lahanData } = await supabase.from('informasi_lahan').select('*');
        const { data: customerData } = await supabase.from('customer').select('*');

        // PERBAIKAN: Hitung banyaknya data di dalam tabel customer untuk statistik Pengguna Aktif
        if (customerData) {
          setTotalCustomers(customerData.length);
        }

        if (penyewaanData && penyewaanData.length > 0) {
          initialFinalized = penyewaanData.map(sewa => {
            // 1. Cari baris lahan yang id_cust dan alamatnya cocok
            const cocokLahan = lahanData?.find(lahan => {
              const alamatLahan = lahan.alamat || lahan.alamat_lahan || '';
              return lahan.id_cust === sewa.id_cust && alamatLahan === sewa.alamat_pengantaran;
            });

            // 2. Cari kecocokan Nama Pelanggan berdasarkan nama_depan + nama_belakangan
            const cocokCust = customerData?.find(cust => cust.id_cust === sewa.id_cust);
            
            let namaLengkap = null;
            if (cocokCust) {
              const depan = cocokCust.nama_depan ? cocokCust.nama_depan.trim() : "";
              const belakang = cocokCust.nama_belakangan ? cocokCust.nama_belakangan.trim() : "";
              namaLengkap = `${depan} ${belakang}`.trim();
            }

            return {
              ...sewa,
              nama_lahan_display: cocokLahan ? cocokLahan.nama_lahan : (sewa.nama_pertanian || 'Tidak Ada Nama Lahan'),
              nama_pelanggan_display: namaLengkap || 'Pelanggan Tandoor'
            };
          });
        }
      } catch (innerErr) {
        console.warn("Pencocokan silang dilewati karena variasi skema tabel:", innerErr.message);
      }

      setRentals(initialFinalized);
    } catch (err) {
      console.error("Gagal mengambil data dari tabel penyewaan:", err.message);
    } finally {
      setLoadingFetch(false);
    }
  };

  // Fungsi pembantu untuk mengubah ID Status (int4) dari database menjadi teks UI
  const getStatusText = (statusCode) => {
    if (statusCode === 1 || statusCode === "1") return "Pending";
    if (statusCode === 2 || statusCode === "2") return "Disetujui";
    if (statusCode === 3 || statusCode === "3") return "Ditolak";
    return "Pending";
  };

  // 2. Fungsi merubah status permintaan sewa langsung ke database Supabase
  const handleStatusChange = async (transaksiId, currentItem, newStatusText) => {
    let newStatusCode = 1;
    if (newStatusText === 'Disetujui') newStatusCode = 2;
    if (newStatusText === 'Ditolak') newStatusCode = 3;

    try {
      const { error } = await supabase
        .from('penyewaan')
        .update({ status_transaksi: newStatusCode })
        .eq('transaksi_id', transaksiId);

      if (error) throw error;

      if (newStatusText === 'Disetujui') {
        const existingDeliveries = JSON.parse(localStorage.getItem('tandoor_deliveries') || '[]');
        
        if (!existingDeliveries.find(d => d.requestId === transaksiId)) {
          const lastIdNum = existingDeliveries.length > 0 
            ? parseInt(existingDeliveries[existingDeliveries.length - 1].id.split('-')[1]) 
            : 0;

          const nextId = `SHP-${String(lastIdNum + 1).padStart(3, '0')}`;

          const newDelivery = {
            id: nextId,
            requestId: transaksiId,
            supir: "Belum dipilih",
            tanggal: new Date().toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' }),
            alamat: currentItem.alamat_pengantaran || 'Alamat Lahan User',
            penerima: currentItem.id_cust || 'Pelanggan Tandoor',
            barang: "Alat Pertanian",
            status: "Pilih Driver"
          };

          localStorage.setItem('tandoor_deliveries', JSON.stringify([...existingDeliveries, newDelivery]));
        }
      }

      fetchPenyewaanData();
    } catch (err) {
      alert("Gagal memperbarui status transaksi: " + err.message);
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

  // --- LOGIKA HITUNG STATISTIK SECARA DINAMIS DARI DATABASE ---
  const totalPenyewaanAktif = rentals.filter(r => r.status_transaksi === 2 || r.status_transaksi === "2").length;
  const totalPending = rentals.filter(r => r.status_transaksi === 1 || r.status_transaksi === "1").length;

  return (
    <div className="admin-wrapper">
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

        <section className="stats-container">
          <div className="stat-card">
            <div className="stat-info">
              <span>Total Penyewaan Aktif</span>
              <h2>{totalPenyewaanAktif}</h2>
            </div>
            <img src={packageImg} alt="Package" className="custom-icon" />
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <span>Pengguna Aktif</span>
              {/* RENDERING DINAMIS: Menampilkan jumlah baris dari tabel customer */}
              <h2>{totalCustomers}</h2>
            </div>
            <img src={groupImg} alt="Group" className="custom-icon" />
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <span>Permintaan Tertunda</span>
              <h2>{totalPending}</h2>
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
          <button className={`tab-btn ${currentPage === 'admin-analitik' ? 'active' : ''}`} onClick={() => setPage('admin-analitik')}> 
            Analitik <img src={analysisImg} alt="Analysis" style={{ width: '16px', height: '16px', marginLeft: '5px' }} className="tab-icon-small" />
          </button>
        </div>

        <div className="rental-list">
          {loadingFetch ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Menghubungkan & memuat data dari Supabase...</div>
          ) : rentals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Tidak ada data permintaan sewa di database.</div>
          ) : (
            rentals.map((item) => {
              const currentStatus = getStatusText(item.status_transaksi);
              return (
                <div key={item.transaksi_id} className={`rental-item-card status-${currentStatus.toLowerCase()}`}>
                  <div className="card-header">
                    <h4 className="equipment-title">Transaksi #{item.id_penyewaan || item.transaksi_id}</h4>
                    <span className={`status-badge badge-${currentStatus.toLowerCase()}`}>{currentStatus}</span>
                  </div>

                  <div className="card-info-grid">
                    <div className="info-col">
                      <label>Pelanggan:</label>
                      <p className="primary-text">{item.nama_pelanggan_display}</p>
                      <p className="secondary-text" style={{ fontSize: '10px', wordBreak: 'break-all', marginTop: '2px' }}>ID: {item.id_cust}</p>
                    </div>
                    <div className="info-col">
                      <label>Lahan Pertanian:</label>
                      <p className="primary-text">{item.nama_lahan_display}</p>
                    </div>
                    <div className="info-col">
                      <label>Tanggal Sewa:</label>
                      <p className="primary-text">{item.tgl_sewa || item.tgl_pesan}</p>
                    </div>
                    <div className="info-col">
                      <label>Total Biaya:</label>
                      <p className="primary-text price-text">
                        {item.total_harga ? `Rp ${Number(item.total_harga).toLocaleString('id-ID')}` : 'Rp 0'}
                      </p>
                    </div>
                    <div className="info-col">
                      <label>Bukti Pembayaran:</label>
                      <div className="file-attachment">
                        <img src={paymentImg} alt="icon" className="file-icon-green" />
                        <span className="file-link-text">ID_Bayar_{item.id_pembayaran || 'Pending'}.pdf</span>
                      </div>
                    </div>
                  </div>

                  {currentStatus === 'Pending' && (
                    <div className="card-footer-action">
                      <button className="btn-approve-outline" onClick={() => handleStatusChange(item.transaksi_id, item, 'Disetujui')}>
                        Setujui Permintaan
                      </button>
                      <button className="btn-reject-outline" onClick={() => handleStatusChange(item.transaksi_id, item, 'Ditolak')}>
                        Tolak
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      <footer className="footer-spacer"></footer>
    </div>
  );
};

export default AdminDashboard;