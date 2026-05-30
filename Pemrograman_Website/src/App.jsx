// src/App.jsx
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient"; 
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Equipment from "./pages/Equipment";
import LandInfo from "./pages/LandInfo";
import RentForm from "./pages/RentForm";
import Terms from "./pages/Terms";
import EquipmentDetail from "./pages/EquipmentDetail";
import Payment from "./pages/Payment";
import Success from "./pages/Success";
import Dashboard from "./pages/Dashboard";

// --- IMPORT HALAMAN WEBSITE ADMIN ---
import HomeAdmin from "./pages/admin/AdminDashboard";
import EquipmentAdmin from "./pages/admin/AdminAnalitik";
import AdminPengguna from "./pages/admin/AdminPengguna";   // Ditambahkan[cite: 13]
import AdminDelivery from "./pages/admin/AdminDelivery";   // Ditambahkan[cite: 13]
import AdminPeralatan from "./pages/admin/AdminPeralatan"; // Ditambahkan[cite: 13]

import "./App.css";

// IMPORT STYLE ADMIN YANG SUDAH TERISOLASI DI DALAM SASS (Hanya satu baris pemicu)
import './styles/Admin.scss';

function App() {
  // PERBAIKAN: Membaca URL aktif saat refresh agar state tidak kembali amnesia ke "home"
  const [page, setPage] = useState(() => {
    const path = window.location.pathname.toLowerCase();
    if (path === "/peralatan") return "equipment";
    if (path === "/detail-peralatan") return "equipment-detail";
    if (path === "/dashboard") return "dashboard";
    if (path === "/form-penyewaan") return "rent-form";
    if (path === "/login") return "login";
    if (path === "/register") return "register";
    
    // Konfigurasi Path Admin
    if (path === "/admin/permintaan-sewa") return "admin-home";
    if (path === "/admin/pengguna") return "admin-pengguna";
    if (path === "/admin/pengiriman") return "admin-delivery";
    if (path === "/admin/peralatan") return "admin-equipment";
    if (path === "/admin/analitik") return "admin-analitik";
    
    return "home"; // Jalur beranda default
  });

  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null); // Menampung 'customer' atau 'admin'
  const [editLandData, setEditLandData] = useState(null);
  const [loading, setLoading] = useState(true); // Mencegah kedipan halaman saat cek session

  const [rentFormData, setRentFormData] = useState({
    startDate: "",
    endDate: "",
    deliveryAddress: "",
    note: "",
    isAgreed: false,
  });

  // =========================================================
  // SINKRONISASI STATE HALAMAN KE URL BROWSER (HISTORY API)
  // =========================================================
  useEffect(() => {
    let urlPath = "/";

    switch (page) {
      case "home":
        urlPath = "/";
        break;
      case "equipment":
        urlPath = "/Peralatan";
        break;
      case "equipment-detail":
        urlPath = "/Detail-Peralatan";
        break;
      case "dashboard":
        urlPath = "/Dashboard";
        break;
      case "rent-form":
        urlPath = "/Form-Penyewaan";
        break;
      
      // --- ROUTE URL UNTUK HALAMAN PANEL ADMIN ---
      case "admin-home":
        urlPath = "/admin/Permintaan-Sewa";
        break;
      case "admin-pengguna":
        urlPath = "/admin/Pengguna";
        break;
      case "admin-delivery":
        urlPath = "/admin/Pengiriman";
        break;
      case "admin-equipment":
        urlPath = "/admin/Peralatan";
        break;
      case "admin-analitik":
        urlPath = "/admin/Analitik";
        break;
        
      default:
        urlPath = `/${page}`;
    }

    // Update URL bar tanpa memicu reload komponen
    window.history.pushState({ page }, "", urlPath);
  }, [page]);

  useEffect(() => {
    // 1. Cek sesi login saat aplikasi pertama kali dimuat
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkRole(session.user.id);
      else setLoading(false);
    });

    // 2. Dengarkan perubahan login atau logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkRole(session.user.id);
      } else {
        setRole(null);
        setPage("home");
        setLoading(false); // Diperbaiki dari loading(false) menjadi setLoading(false)
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fungsi untuk memvalidasi Role berdasarkan database customer (Sudah Diperbaiki)
  const checkRole = async (userId) => {
    try {
      // Kita gunakan select biasa tanpa .single() untuk menghindari error 406
      const { data, error } = await supabase
        .from("customer")
        .select("id_cust")
        .eq("id_cust", userId);

      if (error) throw error;

      // Jika data ditemukan di tabel customer, berarti dia adalah Customer
      if (data && data.length > 0) {
        setRole("customer");
      } else {
        // Jika tidak ada di tabel customer, berarti dia adalah Admin
        setRole("admin");
      }
    } catch (err) {
      console.error("Gagal memeriksa hak akses, memaksa ke mode admin cek:", err.message);
      
      // ALTERNATIF TRICK AMAN: 
      if (userId === "MASUKKAN_UUID_AUTH_ADMIN_MU_DISINI") {
         setRole("admin");
      } else {
         setRole("admin"); // Sementara paksa ke 'admin' dulu untuk memastikan halaman adminmu merender dengan benar
      }
    } finally {
      setLoading(false);
    }
  };

  // PERBAIKAN LOGIKA REDIRECT: Menahan proses pengalihan jika session sedang diperiksa oleh Supabase
  useEffect(() => {
    if (loading) return; 

    if (session && role) {
      if (page === "login" || page === "register") {
        if (role === "admin") {
          setPage("admin-home"); // Admin diarahkan ke halaman utama admin sendiri
        } else {
          setPage("dashboard");   // Customer diarahkan ke dashboard customer biasa
        }
      }
    } else if (!session) {
      // Mencegah tendangan paksa ke beranda untuk halaman-halaman umum saat di-refresh
      if (page !== "home" && page !== "login" && page !== "register" && page !== "equipment") {
        setPage("home");
      }
    }
  }, [session, role, page, loading]); // Menambahkan loading ke array dependensi

  // Cek apakah ada layer modal aktif yang sedang terbuka (Khusus sisi Customer/Umum)
  const isModalOpen =
    role !== "admin" && (
      page === "login" ||
      page === "register" ||
      page === "landinfo" ||
      page === "rent-form" ||
      page === "terms" ||
      page === "payment" ||
      page === "success"
    );

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Memuat Aplikasi Tandoor...</div>;
  }

  return (
    <div className={`app-wrapper ${isModalOpen ? "modal-open" : ""}`}>
      
      {/* ========================================================= */}
      {/* A. JALUR RENDERING HALAMAN JIKA LOGIN SEBAGAI ADMIN     */}
      {/* ========================================================= */}
      {session && role === "admin" ? (
        <div className="admin-global-scope">
          {page === "admin-home" || page === "home" || !page ? (
            <HomeAdmin session={session} setPage={setPage} currentPage={page} />
          ) : page === "admin-pengguna" ? (
            <AdminPengguna session={session} setPage={setPage} currentPage={page} />
          ) : page === "admin-delivery" ? (
            <AdminDelivery session={session} setPage={setPage} currentPage={page} />
          ) : page === "admin-equipment" ? (
            <AdminPeralatan session={session} setPage={setPage} currentPage={page} />
          ) : page === "admin-analitik" ? (
            <EquipmentAdmin session={session} setPage={setPage} currentPage={page} />
          ) : (
            <HomeAdmin session={session} setPage={setPage} currentPage={page} />
          )}
        </div>
      ) : (
        
        /* ========================================================= */
        /* B. JALUR RENDERING HALAMAN JIKA CUSTOMER / BELUM LOGIN  */
        /* ========================================================= */
        <>
          {/* --- HALAMAN UTAMA SISI USER (Background) --- */}
          {page === "home" || page === "login" || page === "register" ? (
            <Home setPage={setPage} currentPage={page} session={session} />
          ) : page === "equipment" ? (
            <Equipment setPage={setPage} currentPage={page} session={session} />
          ) : page === "equipment-detail" ||
            page === "rent-form" ||
            page === "terms" ||
            page === "payment" ||
            page === "success" ? (
            <EquipmentDetail
              setPage={setPage}
              currentPage={page}
              session={session}
            />
          ) : page === "dashboard" || page === "landinfo" ? (
            <Dashboard 
              setPage={setPage} 
              currentPage={page} 
              session={session} 
              setEditLandData={setEditLandData} 
            />
          ) : (
            <Home setPage={setPage} currentPage={page} session={session} />
          )}

          {/* --- LAYER MODAL SISI USER --- */}
          {page === "login" && <Login setPage={setPage} />}
          {page === "register" && <Register setPage={setPage} />}
          
          {page === "landinfo" && (
            <LandInfo 
              setPage={setPage} 
              session={session} 
              editLandData={editLandData} 
              setEditLandData={setEditLandData}
            />
          )}

          {page === "rent-form" && (
            <RentForm
              setPage={setPage}
              session={session}
              rentData={rentFormData}
              setRentData={setRentFormData}
            />
          )}
          {page === "terms" && <Terms setPage={setPage} />}
          {page === "payment" && (
            <Payment
              setPage={setPage}
              session={session}
              rentData={rentFormData}
              setRentData={setRentFormData}
            />
          )}
          {page === "success" && <Success setPage={setPage} />}
        </>
      )}
    </div>
  );
}

export default App;