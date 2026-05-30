import { useState } from "react";
// 1. Import library supabase yang sudah kamu buat di src/supabaseClient.js
import { supabase } from "../supabaseClient"; 

function Register({ setPage }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // State untuk loading

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: false });
    }
  };

  // 2. Async function untuk menangani pendaftaran dan sinkronisasi ke tabel customer
  const handleSubmit = async (e) => {
    e.preventDefault();
    let tempErrors = {};

    // Validasi input
    Object.keys(formData).forEach((key) => {
      if (!formData[key]) tempErrors[key] = true;
    });

    const phoneRegex = /^0[0-9]{9,13}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      tempErrors.phone = true;
    }

    if (formData.password && formData.password.length < 8) {
      tempErrors.password = true;
    }

    if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = true;
    }

    setErrors(tempErrors);

    // 3. Jika tidak ada error validasi, kirim ke Supabase
    if (Object.keys(tempErrors).length === 0) {
      setLoading(true); // Mulai loading

      try {
        // LANGKAH A: Daftarkan user ke sistem Auth Supabase
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (authError) throw authError;

        // Ambil UUID user yang baru saja terbuat dari sistem Auth
        const userUuid = authData.user?.id;

        if (userUuid) {
          // LANGKAH B: Masukkan data profil ke tabel 'customer'
          const { error: dbError } = await supabase
            .from("customer")
            .insert([
              {
                id_cust: userUuid,                       // Menyambungkan ID Auth ke PK tabel customer
                nama_depan: formData.firstName,
                nama_belakang: formData.lastName,
                email_cust: formData.email,
                telf_cust: parseInt(formData.phone, 10), // Konversi string telp ke numeric sesuai tipe data tabel
                katasandi_cust: formData.password        // Menyimpan password (opsional, karena auth Supabase sudah terenkripsi)
              },
            ]);

          if (dbError) throw dbError;
        }

        // Jika semua langkah berhasil
        alert("Registrasi Berhasil! Silakan cek email kamu atau langsung masuk.");
        console.log("User & Profil berhasil dibuat:", authData);
        setPage("login"); 

      } catch (error) {
        alert("Terjadi kesalahan: " + error.message);
      } finally {
        setLoading(false); // Matikan loading
      }
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-modal register-modal">
        <button className="close-btn" onClick={() => setPage("home")}>✕</button>
        
        <h2 className="auth-title">Daftar</h2>
        <p className="auth-subtitle">Bergabung dengan Tandoor</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-row">
            <div className="input-field">
              <label>Nama Depan <span className="red">*</span></label>
              <div className={`input-group ${errors.firstName ? "error-border" : ""}`}>
                <input 
                  type="text" 
                  name="firstName"
                  placeholder="Nama" 
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="input-field">
              <label>Nama Belakang <span className="red">*</span></label>
              <div className={`input-group ${errors.lastName ? "error-border" : ""}`}>
                <input 
                  type="text" 
                  name="lastName"
                  placeholder="Nama" 
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <label>Email <span className="red">*</span></label>
          <div className={`input-group ${errors.email ? "error-border" : ""}`}>
            <span className="icon">📧</span>
            <input 
              type="email" 
              name="email"
              placeholder="Masukkan email Anda" 
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <label>No. Telepon <span className="red">*</span></label>
          <div className={`input-group ${errors.phone ? "error-border" : ""}`}>
            <span className="icon">📞</span>
            <input 
              type="tel" 
              name="phone"
              placeholder="Contoh: 08123456789" 
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <label>Katasandi <span className="red">*</span></label>
          <div className={`input-group ${errors.password ? "error-border" : ""}`}>
            <span className="icon">🔒</span>
            <input 
              type={showPassword ? "text" : "password"} 
              name="password"
              placeholder="Buat kata sandi" 
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
            <span className="eye-icon" onClick={() => !loading && setShowPassword(!showPassword)} style={{ cursor: "pointer" }}>
              {showPassword ? "👁️‍🗨️" : "👁️"}
            </span>
          </div>
          <p className={`input-hint ${errors.password ? "red" : ""}`}>Minimal 8 karakter</p>

          <label>Konfirmasi Kata Sandi <span className="red">*</span></label>
          <div className={`input-group ${errors.confirmPassword ? "error-border" : ""}`}>
            <span className="icon">🔒</span>
            <input 
              type={showConfirmPassword ? "text" : "password"} 
              name="confirmPassword"
              placeholder="Masukkan kata sandi" 
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
            />
            <span className="eye-icon" onClick={() => !loading && setShowConfirmPassword(!showConfirmPassword)} style={{ cursor: "pointer" }}>
              {showConfirmPassword ? "👁️‍🗨️" : "👁️"}
            </span>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Memproses..." : "Daftar"}
          </button>
        </form>

        <div className="auth-divider">
          <hr /> <span>atau</span> <hr />
        </div>

        <p className="auth-footer">
          Sudah punya akun? <span className="green-link" onClick={() => !loading && setPage("login")}>Masuk</span>
        </p>
      </div>
    </div>
  );
}

export default Register;