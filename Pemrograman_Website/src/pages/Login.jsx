// src/pages/Login.jsx
import { useState } from "react";
import { supabase } from "../supabaseClient"; 

function Login({ setPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    setErrorMessage("");
    
    try {
      const { data, error: supabaseError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (supabaseError) throw supabaseError;

      // LOGIN BERHASIL
      console.log("Login Berhasil");
      
      /* PENTING: Kita langsung arahkan ke 'dashboard'. 
         Logika di App.jsx akan mendeteksi perubahan session 
         dan mengunci user agar tidak bisa balik ke 'login' atau 'landinfo'.
      */
      setPage("home"); 

    } catch (err) {
      setError(true);
      if (err.message === "Invalid login credentials") {
        setErrorMessage("Email atau password salah.");
      } else {
        setErrorMessage(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        {/* Tombol Close: Tidak bisa diklik saat sedang loading */}
        <button 
          className="close-btn" 
          onClick={() => !loading && setPage("home")}
        >
          ✕
        </button>
        
        <h2 className="auth-title">Masuk</h2>
        <p className="auth-subtitle">Selamat datang kembali di Tandoor</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>Email</label>
          <div className={`input-group ${error ? "error-border" : ""}`}>
            <span className="icon">📧</span>
            <input 
              type="email" 
              placeholder="Masukkan email Anda" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              disabled={loading}
            />
          </div>

          <label>Password</label>
          <div className={`input-group ${error ? "error-border" : ""}`}>
            <span className="icon">🔒</span>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Masukkan kata sandi" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              disabled={loading}
            />
            <span 
              className="eye-icon" 
              onClick={() => !loading && setShowPassword(!showPassword)}
              style={{ cursor: "pointer" }}
            >
              {showPassword ? "👁️‍🗨️" : "👁️"}
            </span>
          </div>

          {error && (
            <p style={{ color: "#ff4d4d", fontSize: "12px", marginTop: "-10px", fontWeight: "bold" }}>
              {errorMessage}
            </p>
          )}

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <div className="auth-divider">
          <hr /> <span>atau</span> <hr />
        </div>

        <p className="auth-footer">
          Belum punya akun? <span className="green-link" onClick={() => !loading && setPage("register")}>Daftar</span>
        </p>
      </div>
    </div>
  );
}

export default Login;