// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { supabase } from "../supabaseClient";
import peralatanImg from "../assets/peralatan.png";

function Dashboard({ setPage, currentPage, session, setEditLandData }) {
  const [activeTab, setActiveTab] = useState("my-rentals");
  const [lands, setLands] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State untuk menampung data profil dari tabel database 'customer'
  const [profileData, setProfileData] = useState({
    fullName: "Loading...",
    phone: "Loading..."
  });

  // Fungsi untuk mengambil data profil, lahan, atau penyewaan
  const fetchData = async () => {
    setLoading(true);
    try {
      const userId = session?.user?.id;
      if (!userId) return;

      // 1. Ambil data profil dari tabel customer
      const { data: customerData, error: customerError } = await supabase
        .from("customer")
        .select("nama_depan, nama_belakang, telf_cust")
        .eq("id_cust", userId)
        .single();

      if (!customerError && customerData) {
        const mergedName = `${customerData.nama_depan || ""} ${customerData.nama_belakang || ""}`.trim();
        setProfileData({
          fullName: mergedName || "User Tandoor",
          phone: customerData.telf_cust ? `0${customerData.telf_cust}` : "-"
        });
      }

      // 2. Ambil data berdasarkan tab aktif
      if (activeTab === "profile") {
        const { data, error } = await supabase
          .from("informasi_lahan")
          .select("*")
          .eq("id_cust", userId);
          
        if (error) throw error;
        setLands(data || []);
      } else {
        // Ambil data dari tabel 'penyewaan' berdasarkan 'id_cust'
        const { data, error } = await supabase
          .from("penyewaan")
          .select("*")
          .eq("id_cust", userId)
          .order("transaksi_id", { ascending: false });

        if (error) throw error;
        setRequests(data || []);
      }
    } catch (err) {
      console.error("Gagal mengambil data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, session]);

  const handleDeleteLand = async (landId, landName) => {
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus "${landName}"?`);
    if (!confirmDelete) return;
    try {
      const { error } = await supabase.from("informasi_lahan").delete().eq("id_lahan", landId);
      if (error) throw error;
      setLands(lands.filter((land) => land.id_lahan !== landId));
      alert("Lahan berhasil dihapus");
    } catch (err) {
      alert("Gagal menghapus: " + err.message);
    }
  };

  const handleCancelRequest = async (requestId) => {
    const confirmCancel = window.confirm("Apakah Anda yakin ingin membatalkan permintaan ini?");
    if (!confirmCancel) return;
    try {
      // IDE BARU: Mengubah status_transaksi menjadi 6 (Dibatalkan) alih-alih menghapusnya
      const { error } = await supabase
        .from("penyewaan")
        .update({ status_transaksi: 6 }) 
        .eq("transaksi_id", requestId);

      if (error) throw error;
      
      // Update data di state lokal secara instan agar UI langsung berubah ke status Dibatalkan tanpa loading ulang
      setRequests(requests.map((req) => 
        req.transaksi_id === requestId ? { ...req, status_transaksi: 6 } : req
      ));
      
      alert("Permintaan berhasil dibatalkan");
    } catch (err) {
      alert("Gagal membatalkan: " + err.message);
    }
  };

  const handleEditLand = (land) => {
    setEditLandData(land);
    setPage("landinfo");
  };

  const calculateDays = (start, end) => {
    const d1 = new Date(start);
    const d2 = new Date(end);
    const diff = Math.abs(d2 - d1);
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  // PEMBARUAN LOGIKA STATUS BARU (1-6)
  const getDynamicStatus = (req) => {
    const code = Number(req.status_transaksi);
    switch (code) {
      case 1: return "Menunggu Konfirmasi";
      case 2: return "Dikirim";
      case 3: return "Aktif";
      case 4: return "Selesai";
      case 5: return "Ditolak";
      case 6: return "Dibatalkan"; // Status baru pilihanmu
      default: return "Diproses";
    }
  };

  const userEmail = session?.user?.email;

  return (
    <div className="dashboard-page">
      <Navbar setPage={setPage} currentPage="dashboard" session={session} />

      <div className="container">
        <div className="dashboard-header">
          <h2>Dashboard Penyewa</h2>
          <p>Kelola penyewaan alat dan profil Anda</p>
        </div>

        <div className="dashboard-tabs">
          <button className={`tab-btn ${activeTab === "my-rentals" ? "active" : ""}`} onClick={() => setActiveTab("my-rentals")}>🕒 Penyewaan Saya</button>
          <button className={`tab-btn ${activeTab === "requests" ? "active" : ""}`} onClick={() => setActiveTab("requests")}>📋 Permintaan Sewa</button>
          <button className={`tab-btn ${activeTab === "profile" ? "active" : ""}`} onClick={() => setActiveTab("profile")}>👤 Profil</button>
        </div>

        {/* --- TAB PENYEWAAN SAYA --- */}
        {activeTab === "my-rentals" && (
          <div className="tab-content">
            <h3 className="section-title-dash">Penyewaan Aktif</h3>
            <div className="active-rent-grid" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {requests.filter(req => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const endDate = new Date(req.tgl_selesai);
                const statusCode = Number(req.status_transaksi);
                // Menampilkan status 2 (Dikirim) atau 3 (Aktif) yang belum kedaluwarsa
                return (statusCode === 2 || statusCode === 3) && endDate >= today;
              }).length > 0 ? (
                requests
                  .filter(req => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const endDate = new Date(req.tgl_selesai);
                    const statusCode = Number(req.status_transaksi);
                    return (statusCode === 2 || statusCode === 3) && endDate >= today;
                  })
                  .map((req) => {
                    const statusText = getDynamicStatus(req);
                    return (
                      <div className="active-card" key={req.transaksi_id}>
                        <img src={peralatanImg} alt="alat" className="active-img" />
                        <div className="active-info">
                          <div className="title-status">
                            <h4>{req.alat_disewa || "John Deere 5075E Tractor"}</h4>
                            <span className={`badge-${statusText.toLowerCase()}`}>{statusText}</span>
                          </div>
                          <p>{req.tgl_sewa} sampai {req.tgl_selesai}</p>
                          <span className="active-price">Rp {req.total_harga?.toLocaleString("id-ID")}</span>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <p>Tidak ada penyewaan aktif.</p>
              )}
            </div>

            <h3 className="section-title-dash" style={{ marginTop: "40px" }}>Riwayat Penyewaan</h3>
            <div className="history-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {requests.filter(req => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const endDate = new Date(req.tgl_selesai);
                const statusCode = Number(req.status_transaksi);
                // Status 4 (Selesai) atau status aktif/dikirim yang masa sewanya sudah lewat hari ini
                return statusCode === 4 || ((statusCode === 2 || statusCode === 3) && endDate < today);
              }).length > 0 ? (
                requests
                  .filter(req => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const endDate = new Date(req.tgl_selesai);
                    const statusCode = Number(req.status_transaksi);
                    return statusCode === 4 || ((statusCode === 2 || statusCode === 3) && endDate < today);
                  })
                  .map((req) => (
                    <div className="history-card" key={req.transaksi_id}>
                      <h4>{req.alat_disewa || "John Deere 5075E Tractor"}</h4>
                      <p>Selesai — {req.tgl_selesai} • {calculateDays(req.tgl_sewa, req.tgl_selesai)} hari • Rp {req.total_harga?.toLocaleString("id-ID")}</p>
                    </div>
                  ))
              ) : (
                <p>Belum ada riwayat penyewaan.</p>
              )}
            </div>
          </div>
        )}

        {/* --- TAB PERMINTAAN SEWA --- */}
        {activeTab === "requests" && (
          <div className="tab-content">
            <div className="section-header-inline">
              <h3 className="section-title-dash">Permintaan Penyewaan</h3>
              <button className="btn-new-request" onClick={() => setPage("equipment")}>Permintaan Baru</button>
            </div>
            {loading ? <p>Memuat...</p> : (
              <div className="request-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {requests
                  .filter(r => {
                    const statusCode = Number(r.status_transaksi);
                    // Menampilkan status 1 (Menunggu), 5 (Ditolak), dan 6 (Dibatalkan) di tab ini
                    return statusCode === 1 || statusCode === 5 || statusCode === 6;
                  })
                  .map((req) => {
                    const statusCode = Number(req.status_transaksi);
                    const currentStatus = getDynamicStatus(req);
                    
                    // Menentukan class badge CSS secara dinamis
                    let badgeClass = "pending";
                    if (statusCode === 5) badgeClass = "rejected";
                    if (statusCode === 6) badgeClass = "canceled";

                    return (
                      <div className="request-card" key={req.transaksi_id}>
                        <img src={peralatanImg} alt="alat" className="active-img" />
                        <div className="request-info">
                          <div className="title-status">
                            <h4>{req.alat_disewa || "John Deere 5075E Tractor"}</h4>
                            <span className={`badge-${badgeClass}`}>
                              {currentStatus}
                            </span>
                          </div>
                          <p>Diajukan untuk {req.tgl_sewa} • Durasi {calculateDays(req.tgl_sewa, req.tgl_selesai)} hari</p>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                            <span className="active-price">Rp {req.total_harga?.toLocaleString("id-ID") || "0"}</span>
                            
                            {statusCode === 1 ? (
                              <div className="request-actions">
                                <button className="btn-cancel" onClick={() => handleCancelRequest(req.transaksi_id)}>Batalkan Permintaan</button>
                              </div>
                            ) : statusCode === 5 ? (
                              <div className="status-rejected-text">
                                <span style={{ color: "#d32f2f", fontWeight: "600", fontSize: "14px" }}>Permintaan Tidak Disetujui</span>
                              </div>
                            ) : (
                              <div className="status-rejected-text">
                                <span style={{ color: "#991b1b", fontWeight: "600", fontSize: "14px" }}>Permintaan Anda Batalkan</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                {requests.filter(r => {
                  const code = Number(r.status_transaksi);
                  return code === 1 || code === 5 || code === 6;
                }).length === 0 && <p>Tidak ada permintaan sewa.</p>}
              </div>
            )}
          </div>
        )}

        {/* --- TAB PROFIL & INFORMASI LAHAN --- */}
        {activeTab === "profile" && (
          <div className="profile-tab-content">
            <div className="profile-info-card-horizontal">
              <h3 className="info-title-green">Informasi</h3>
              <div className="info-grid-horizontal">
                <div className="info-item-flex">
                  <span className="info-icon-green">👤</span>
                  <div className="info-detail">
                    <strong>{profileData.fullName}</strong>
                    <p>Penyewa Alat</p>
                  </div>
                </div>
                <div className="info-item-flex">
                  <span className="info-icon-green">📞</span>
                  <div className="info-detail">
                    <strong>{profileData.phone}</strong>
                    <p>No. HP</p>
                  </div>
                </div>
                <div className="info-item-flex">
                  <span className="info-icon-green">✉️</span>
                  <div className="info-detail">
                    <strong>{userEmail}</strong>
                    <p>Email</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lahan-section-header">
              <h3 className="info-title-green">Informasi Lahan</h3>
              <button className="btn-tambah-lahan" onClick={() => { if (typeof setEditLandData === "function") setEditLandData(null); setPage("landinfo"); }}>Tambah Lahan</button>
            </div>

            {loading ? <p>Memuat lahan...</p> : (
              <div className="lahan-grid-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {lands.map((land) => (
                  <div className="lahan-mini-card" key={land.id_lahan}>
                    <div className="lahan-card-header">
                      <div className="lahan-name-box">
                        <h4>{land.nama_lahan}</h4>
                        <span className="lahan-size-badge">{land.luas_lahan} Hektar</span>
                      </div>
                      <div className="lahan-actions-icons">
                        <button className="icon-edit-blue" onClick={() => handleEditLand(land)}>✏️</button>
                        <button className="icon-delete-red" onClick={() => handleDeleteLand(land.id_lahan, land.nama_lahan)}>🗑️</button>
                      </div>
                    </div>
                    <div className="lahan-card-body">
                      <div className="lahan-detail-row">
                        <div className="detail-col"><span>Tanaman Utama:</span><p>{land.komoditas_utama || "-"}</p></div>
                        <div className="detail-col"><span>Jenis Lahan:</span><p>{land.tipe_lahan || "-"}</p></div>
                      </div>
                      <hr className="divider-lahan" />
                      <div className="lahan-location-pin"><span>📍</span> {land.alamat_lahan || "Alamat tidak tersedia"}</div>
                    </div>
                  </div>
                ))}
                {lands.length === 0 && <p>Belum ada lahan yang terdaftar.</p>}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="footer-green-dash"></div>
    </div>
  );
}

export default Dashboard;