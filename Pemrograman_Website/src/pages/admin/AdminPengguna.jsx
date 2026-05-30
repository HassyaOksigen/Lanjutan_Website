import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient'; // Memastikan koneksi database aktif
import '../../styles/AdminUser.css';

import deskImg from '../../assets/Desk_alt.png';
import analysisImg from '../../assets/Line_up.png';
import delivery2Img from '../../assets/package_car (1).png';
import userImg from '../../assets/User.png';
import groupImg from '../../assets/Group_light.png';
import packageImg from '../../assets/package.png';
import deliveryImg from '../../assets/package_car.png';
import timeImg from '../../assets/Time.png';
import searchImg from '../../assets/Search.png';
import editImg from '../../assets/Edit_light (1).png';
import deleteImg from '../../assets/Trash_light.png';
import package2Img from '../../assets/package (1).png';

const AdminPengguna = ({ session, setPage, currentPage }) => {
  // --- STATE DATA UTAMA SUPABASE ---
  const [userData, setUserData] = useState([]);
  const [loadingFetch, setLoadingFetch] = useState(true);

  // --- STATE DATA STATISTIK ATAS ---
  const [totalPenyewaanAktif, setTotalPenyewaanAktif] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalPending, setTotalPending] = useState(0);

  // --- STATE KONTROL MODAL EDIT ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Load indikator statistik atas dan tabel pengguna saat komponen dirender
  useEffect(() => {
    fetchStatsAndUsers();
  }, []);

  const fetchStatsAndUsers = async () => {
    try {
      setLoadingFetch(true);

      // 1. Ambil data mentah secara paralel dari seluruh tabel terkait
      const [customerRes, lahanRes, penyewaanRes] = await Promise.all([
        supabase.from('customer').select('*'),
        supabase.from('informasi_lahan').select('*'),
        supabase.from('penyewaan').select('status_transaksi')
      ]);

      if (customerRes.error) throw customerRes.error;
      if (lahanRes.error) throw lahanRes.error;
      if (penyewaanRes.error) throw penyewaanRes.error;

      const rawCustomers = customerRes.data || [];
      const rawLahan = lahanRes.data || [];
      const rawRentals = penyewaanRes.data || [];

      // A. KALKULASI STATISTIK ATAS
      const aktifCount = rawRentals.filter(r => r.status_transaksi === 2 || r.status_transaksi === "2").length;
      setTotalPenyewaanAktif(aktifCount);
      setTotalCustomers(rawCustomers.length);
      const pendingCount = rawRentals.filter(r => r.status_transaksi === 1 || r.status_transaksi === "1").length;
      setTotalPending(pendingCount);

      // B. REKONSILIASI GABUNG DATA RELASIONAL (Customer + Lahan)
      const combinedUsers = rawCustomers.map(cust => {
        // Gabungkan nama depan dan belakang untuk layout UI
        const depan = cust.nama_depan ? cust.nama_depan.trim() : "";
        const belakang = cust.nama_belakangan ? cust.nama_belakangan.trim() : "";
        const namaLengkap = `${depan} ${belakang}`.trim() || "User Tanpa Nama";

        // Filter daftar lahan yang dimiliki oleh user ini berdasarkan id_cust
        const filterLahanUser = rawLahan.filter(lahan => lahan.id_cust === cust.id_cust);

        return {
          id: cust.id_cust, // UUID kunci utama
          nama: namaLengkap,
          nama_depan_asli: cust.nama_depan,
          nama_belakangan_asli: cust.nama_belakangan,
          email: cust.email_cust || "Tidak ada email",
          joinDate: "Aktif", // Teks bawaan fallback informatif
          rental: 0, // Nilai default statis counters
          lahan: filterLahanUser.map(l => ({
            namaLahan: l.nama_lahan || "Lahan Tanpa Nama",
            luasHektar: l.luas_lahan || 0
          }))
        };
      });

      setUserData(combinedUsers);
    } catch (err) {
      console.error("Gagal melakukan sinkronisasi database Pengguna:", err.message);
    } finally {
      setLoadingFetch(false);
    }
  };

  // 2. AKSES DATABASE: Fungsi menghapus akun customer dengan sistem konfirmasi ganda
  const handleDelete = async (id, namaUser) => {
    const confirmFirst = window.confirm(`PERINGATAN: Apakah Anda yakin ingin menghapus pengguna "${namaUser}" secara permanen dari platform Tandoor?`);
    if (!confirmFirst) return;

    const confirmSecond = window.confirm("Tindakan ini tidak dapat dibatalkan. Seluruh data profil pengguna tersebut akan ikut terhapus dari database. Lanjutkan?");
    if (!confirmSecond) return;

    try {
      const { error } = await supabase
        .from('customer')
        .delete()
        .eq('id_cust', id);

      if (error) throw error;

      alert(`Akun "${namaUser}" berhasil dihapus secara permanen.`);
      // Refresh list tabel setelah berhasil dihapus
      fetchStatsAndUsers();
    } catch (err) {
      alert("Gagal menghapus pengguna: " + err.message);
    }
  };

  // 3. AKSES DATABASE: Fungsi menyimpan perubahan informasi data user ke Supabase
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const inputNamaLengkap = formData.get("nama").trim();
    const inputEmail = formData.get("email").trim();

    // Pecah kembali string nama lengkap menjadi nama_depan dan nama_belakangan untuk database
    const parts = inputNamaLengkap.split(" ");
    const namaDepanBaru = parts[0] || "";
    const namaBelakangBaru = parts.slice(1).join(" ") || "";

    try {
      const { error } = await supabase
        .from('customer')
        .update({
          nama_depan: namaDepanBaru,
          nama_belakangan: namaBelakangBaru,
          email_cust: inputEmail
        })
        .eq('id_cust', selectedUser.id);

      if (error) throw error;

      setIsEditModalOpen(false);
      // Refresh list tabel setelah data berhasil diperbarui
      fetchStatsAndUsers();
    } catch (err) {
      alert("Gagal memperbarui data informasi pengguna: " + err.message);
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
            <img src={packageImg} alt="Package" className="custom-icon" />
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <span>Pengguna Aktif</span>
              <h2>{loadingFetch ? "..." : totalCustomers}</h2>
            </div>
            <img src={groupImg} alt="Group" className="custom-icon" />
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <span>Permintaan Tertunda</span>
              <h2>{loadingFetch ? "..." : totalPending}</h2>
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

        <div className="table-container">
          <div className="table-header">
            <h3 className="table-title">User Management</h3>
            <div className="search-wrapper">
              <img src={searchImg} alt="search" className="search-icon-inside" />
              <input type="text" placeholder="Search users..." className="search-input" />
            </div>
          </div>

          <table className="user-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>Lahan</th>
                <th>Status Platform</th>
                <th>Rental</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingFetch ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                    Menghubungkan & Memuat Database Supabase...
                  </td>
                </tr>
              ) : userData.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                    Tidak ada akun customer terdaftar di database.
                  </td>
                </tr>
              ) : (
                userData.map((user) => (
                  <tr key={user.id}>
                    <td className="font-bold">
                      {user.nama}
                      <p style={{ fontSize: '9px', color: '#999', fontWeight: 'normal', marginTop: '2px', wordBreak: 'break-all' }}>ID: {user.id}</p>
                    </td>
                    <td className="text-gray">{user.email}</td>
                    <td>
                      <div className="lahan-container">
                        <div className="lahan-badge">{user.lahan.length} Lahan Terdaftar</div>
                        {user.lahan.map((item, index) => (
                          <div key={index} className="lahan-item">
                            <span className="lahan-nama">{item.namaLahan}</span>
                            <span className="lahan-luas">{item.luasHektar} Hektar</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="text-gray">{user.joinDate}</td>
                    <td className="text-center">{user.rental}</td>
                    <td>
                      <div className="action-buttons">
                        {/* Tombol Pena untuk membuka modal edit */}
                        <button className="btn-action btn-view" onClick={() => { setSelectedUser(user); setIsEditModalOpen(true); }} title="Edit Data">
                          <img src={editImg} alt="Edit" className="action-icon" />
                        </button>
                        {/* Tombol Sampah untuk menghapus customer */}
                        <button className="btn-action btn-delete" onClick={() => handleDelete(user.id, user.nama)} title="Hapus Akun">
                          <img src={deleteImg} alt="Delete" className="action-icon" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* MODAL EDIT DATA PROFIL CUSTOMER */}
      {isEditModalOpen && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content-edit">
            <div className="modal-header">
              <h2>Edit User Information</h2>
              <button className="close-x" onClick={() => setIsEditModalOpen(false)}>&times;</button>
            </div>
            <form className="edit-form" onSubmit={handleSaveEdit}>
              <h4 className="form-section-title">Personal Information (Supabase Live)</h4>
              <div className="form-row two-cols">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input name="nama" type="text" defaultValue={selectedUser.nama} required />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input name="email" type="email" defaultValue={selectedUser.email} required />
                </div>
              </div>

              <h4 className="form-section-title" style={{ color: '#aaa' }}>Farm Info (Read-Only)</h4>
              <p style={{ fontSize: '11px', color: '#999', marginBottom: '15px' }}>Untuk mengedit ukuran lahan, silakan kelola langsung pada modul menu Lahan Utama.</p>
              <div className="form-row two-cols" style={{ opacity: 0.7 }}>
                <div className="form-group">
                  <label>Farm Name (Main)</label>
                  <input type="text" defaultValue={selectedUser.lahan[0]?.namaLahan || "Tidak Ada Lahan"} disabled />
                </div>
                <div className="form-group">
                  <label>Farm Size (Hektar)</label>
                  <input type="text" defaultValue={selectedUser.lahan[0]?.luasHektar || 0} disabled />
                </div>
              </div>

              <div className="modal-actions-edit">
                <button type="submit" className="btn-submit">Save Changes</button>
                <button type="button" className="btn-cancel" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <footer className="footer-spacer"></footer>
    </div>
  );
};

export default AdminPengguna;