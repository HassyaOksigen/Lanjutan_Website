// src/pages/Success.jsx

function Success({ setPage }) {
  return (
    <div className="auth-overlay">
      <div className="auth-modal success-modal">
        {/* Tombol silang untuk menutup dan kembali ke beranda */}
        <button className="close-btn" onClick={() => setPage("home")}>✕</button>
        
        <div className="success-content">
          <div className="success-icon-large">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="40" cy="40" r="38" stroke="#00A651" strokeWidth="4"/>
              <path d="M25 40L35 50L55 30" stroke="#00A651" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <h2 className="success-title">Pembayaran Berhasil!</h2>
          
          <p className="success-text">
            Terima kasih! Permintaan sewa dan bukti pembayaran Anda sudah kami terima. 
            Tim kami akan melakukan verifikasi dan menghubungi Anda dalam waktu 24 jam 
            untuk konfirmasi penyewaan.
          </p>

          <button className="btn-submit" onClick={() => setPage("home")}>
            Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
}

export default Success;