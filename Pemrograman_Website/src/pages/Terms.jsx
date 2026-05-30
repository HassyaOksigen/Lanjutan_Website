// src/pages/Terms.jsx
function Terms({ setPage }) {
  return (
    <div className="auth-overlay">
      <div className="auth-modal terms-modal">
        <button className="close-btn" onClick={() => setPage("rent-form")}>✕</button>
        
        <h2 className="auth-title">Syarat dan Ketentuan</h2>
        <p className="auth-subtitle">
          Dengan melakukan penyewaan alat melalui platform Tandoor, penyewa dianggap telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan berikut:
        </p>

        <div className="terms-content">
          <section>
            <h4>1. Ketentuan Umum</h4>
            <ul>
              <li>Tandoor merupakan platform penyewaan alat pertanian yang menghubungkan penyewa dengan penyedia alat.</li>
              <li>Penyewa wajib memberikan data yang benar, lengkap, dan dapat dipertanggungjawabkan.</li>
              <li>Penyewaan hanya dapat dilakukan oleh pengguna berusia minimal 18 tahun.</li>
            </ul>
          </section>

          <section>
            <h4>2. Pemesanan & Pembayaran</h4>
            <ul>
              <li>Pemesanan dianggap valid setelah penyewa mengisi formulir penyewaan dan melakukan konfirmasi.</li>
              <li>Pembayaran dilakukan sesuai metode yang tersedia pada sistem.</li>
              <li>Alat akan diproses untuk pengiriman setelah pembayaran terverifikasi.</li>
              <li>Harga sewa yang ditampilkan merupakan estimasi dan dapat disesuaikan berdasarkan durasi, lokasi, atau kebutuhan tambahan.</li>
            </ul>
          </section>

          <section>
            <h4>3. Penggunaan Alat</h4>
            <ul>
              <li>Alat hanya boleh digunakan untuk kegiatan pertanian yang wajar dan sesuai fungsinya.</li>
              <li>Penyewa bertanggung jawab atas penggunaan alat selama masa sewa.</li>
              <li>Penyewa wajib memastikan operator memiliki kemampuan yang memadai dalam mengoperasikan alat.</li>
              <li>Dilarang memindahtangankan atau menyewakan kembali alat kepada pihak lain tanpa izin.</li>
            </ul>
          </section>

          <section>
            <h4>4. Pengiriman & Pengembalian</h4>
            <ul>
              <li>Waktu pengiriman mengikuti jadwal yang telah disepakati.</li>
              <li>Penyewa wajib memastikan lokasi pengiriman dapat diakses kendaraan pengangkut.</li>
              <li>Alat harus dikembalikan sesuai waktu yang disepakati.</li>
              <li>Keterlambatan pengembalian dapat dikenakan biaya tambahan.</li>
            </ul>
          </section>

          <section>
            <h4>5. Kerusakan & Tanggung Jawab</h4>
            <ul>
              <li>Penyewa wajib menjaga kondisi alat selama masa penyewaan.</li>
              <li>Kerusakan akibat kelalaian, penggunaan tidak sesuai, atau kecelakaan menjadi tanggung jawab penyewa.</li>
              <li>Biaya perbaikan atau penggantian akan dibebankan sesuai tingkat kerusakan.</li>
            </ul>
          </section>
        </div>

        <button className="btn-submit btn-full" onClick={() => setPage("rent-form")}>
          Tutup
        </button>
      </div>
    </div>
  );
}

export default Terms;