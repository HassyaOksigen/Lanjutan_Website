// src/pages/Payment.jsx
import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";

function Payment({ setPage, session, rentData, setRentData }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [latestRent, setLatestRent] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State untuk menampung nama lengkap user dari database customer
  const [customerName, setCustomerName] = useState("");

  const fileInputRef = useRef(null);
  const deliveryFee = 100000; // Biaya Pengiriman Tetap

  useEffect(() => {
    const fetchLatestRentalAndUser = async () => {
      try {
        const userId = session?.user?.id;
        if (!userId) return;

        // 1. Ambil Nama Lengkap dari tabel customer
        const { data: userData } = await supabase
          .from("customer")
          .select("nama_depan, nama_belakang")
          .eq("id_cust", userId)
          .single();
        
        if (userData) {
          const mergedName = `${userData.nama_depan || ""} ${userData.nama_belakang || ""}`.trim();
          setCustomerName(mergedName || "User Tandoor");
        }

        // 2. Ambil data sewa terakhir dari tabel 'penyewaan' berdasarkan 'id_cust'
        const { data, error } = await supabase
          .from("penyewaan")
          .select("*")
          .eq("id_cust", userId)
          .order("transaksi_id", { ascending: false }) // Diurutkan berdasarkan PK transaksi_id terbaru
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          setLatestRent(data[0]);
        }
      } catch (err) {
        console.error("Gagal memuat data sewa:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestRentalAndUser();
  }, [session]);

  const calculateDuration = () => {
    const start = rentData?.startDate || latestRent?.tgl_sewa;
    const end = rentData?.endDate || latestRent?.tgl_selesai;
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  // MENGGABUNGKAN: Biaya sewa asli dari database + biaya pengiriman fixed
  const rentalPrice = latestRent?.total_harga || 0;
  const grandTotal = rentalPrice + deliveryFee;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert("Ukuran file maksimal 5MB");
        return;
      }
      setFile(selectedFile);
    }
  };

const handleConfirm = async () => {
    if (!file) {
      alert("Harap unggah bukti pembayaran.");
      return;
    }

    setIsUploading(true);
    try {
      const userId = session?.user?.id;
      if (!userId) throw new Error("Sesi user tidak ditemukan.");

      // 1. Membuat nama file unik untuk diunggah ke Storage 'bukti-transfer'
      const fileName = `${userId}-${Date.now()}.${file.name.split(".").pop()}`;

      const { error: uploadError } = await supabase.storage
        .from("bukti-transfer")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 2. Ambil Public URL dari file gambar yang diupload
      const { data: publicUrlData } = supabase.storage
        .from("bukti-transfer")
        .getPublicUrl(fileName);

      const todayDate = new Date().toISOString().split("T")[0];

// 3. Melakukan INSERT data baru ke tabel 'pembayaran' dengan ID asli tanpa pemotongan string
      const { error: insertPaymentError } = await supabase
        .from("pembayaran")
        .insert([
          {
            id_pembayaran: latestRent?.id_pembayaran || gen_random_uuid(), // Memastikan PK berupa UUID / string unik bebas acak
            tgl_bayar: todayDate,                        
            jumlah_bayar: grandTotal,                    
            metode_pembayaran: 1,                        
            status_pembayaran: 1,                        
            bukti_pembayaran: publicUrlData.publicUrl,    
            id_penyewaan: latestRent?.id_penyewaan,       // KIRIMKAN ID ASLI langsung dari record data sewa terbaru
            id_cust: userId,                              // KIRIMKAN ID ASLI (UUID user yang sedang login)
            id_admin: null                                // Sudah aman di-set null karena NOT NULL sudah kita hapus
          }
        ]);

      if (insertPaymentError) throw insertPaymentError;

      // 4. Update total_harga akumulasi akhir di tabel 'penyewaan'
      const { error: updateRentError } = await supabase
        .from("penyewaan")
        .update({ 
          total_harga: grandTotal,
          status_transaksi: 1 
        })
        .eq("transaksi_id", latestRent?.transaksi_id);

      if (updateRentError) throw updateRentError;

      setRentData({ startDate: "", endDate: "", deliveryAddress: "", note: "", isAgreed: false });
      setPage("success");
    } catch (err) {
      alert("Kesalahan proses simpan pembayaran: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) return <div className="auth-overlay">Memuat data...</div>;

  return (
    <div className="auth-overlay">
      <div className="auth-modal payment-confirm-modal">
        <button className="close-btn" onClick={() => setPage("rent-form")}>✕</button>

        <h2 className="auth-title">Konfirmasi Pembayaran</h2>
        <p className="auth-subtitle">John Deere 5075E Tractor</p>

        <div className="payment-content">
          <div className="summary-box">
            <h4>Ringkasan Pemesanan</h4>
            <div className="summary-item">
              <span>Nama:</span> <strong>{customerName || "User"}</strong>
            </div>
            <div className="summary-item">
              <span>Email:</span> <strong>{session?.user?.email}</strong>
            </div>
            <div className="summary-item">
              <span>Durasi Sewa:</span> <strong>{calculateDuration()} Hari</strong>
            </div>
            <div className="summary-item">
              <span>Tanggal Mulai:</span> <strong>{rentData?.startDate || latestRent?.tgl_sewa}</strong>
            </div>
            <div className="summary-item">
              <span>Tanggal Selesai:</span> <strong>{rentData?.endDate || latestRent?.tgl_selesai}</strong>
            </div>
            <div className="summary-item" style={{ marginTop: '10px', color: '#555' }}>
              <span>Biaya Sewa Alat:</span> <strong>Rp {rentalPrice.toLocaleString('id-ID')}</strong>
            </div>
            
            {/* DETAIL BIAYA PENGIRIMAN */}
            <div className="summary-item" style={{ color: '#1a4d2e', marginTop: '3px' }}>
              <span>Biaya Pengiriman:</span> <strong>Rp {deliveryFee.toLocaleString('id-ID')}</strong>
            </div>
            
            <hr />
            <div className="total-row">
              <span>Total Biaya:</span>
              <span className="total-price">Rp {grandTotal.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div className="instruction-box">
            <div className="instruction-header">
              <span className="info-icon">ⓘ</span>
              <strong>Petunjuk Pembayaran</strong>
            </div>
            <ol>
              <li>Silakan transfer total pembayaran ke rekening berikut:</li>
              <li>Bank: Tandoor Bank</li>
              <li>Nomor Rekening: 1234-5678-9012</li>
              <li>Nama Rekening: Farm Equipment Rentals</li>
              <li>Unggah bukti transfer atau screenshot transaksi pada kolom di bawah.</li>
            </ol>
          </div>

          <div className="input-field">
            <label>ID Transaksi / Nomor Referensi (Opsional)</label>
            <div className="input-group">
              <input type="text" placeholder="Masukkan nomor referensi transaksi" />
            </div>
          </div>

          <div className="upload-form">
            <label>Unggah Bukti Pembayaran <span className="red">*</span></label>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileChange} 
              accept="image/*" 
            />
            
            {!file ? (
              <div className="upload-area" onClick={() => fileInputRef.current.click()}>
                <div className="upload-icon">📤</div>
                <p><span>Klik untuk mengunggah</span> atau tarik file ke area ini</p>
                <small>PNG, JPG (maks. 5MB)</small>
              </div>
            ) : (
              <div className="uploaded-file-box">
                <div className="file-info">
                  <div className="file-icon-check">✅</div>
                  <div className="file-detail">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{(file.size / 1024).toFixed(2)} KB</span>
                  </div>
                </div>
                <button className="btn-remove-file" onClick={() => setFile(null)}>Hapus File</button>
              </div>
            )}
          </div>

          <div className="warning-note">
            Permintaan penyewaan Anda akan ditinjau setelah pembayaran diverifikasi. 
            Alat tidak akan dikirim sebelum pembayaran berhasil diverifikasi.
          </div>

          <div className="btn-group-row">
            <button className="btn-outline" onClick={() => setPage("rent-form")} disabled={isUploading}>
              Kembali
            </button>
            <button 
              className="btn-submit btn-confirm" 
              onClick={handleConfirm} 
              disabled={isUploading}
            >
              {isUploading ? "Mengirim..." : "Konfirmasi & Kirim"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;