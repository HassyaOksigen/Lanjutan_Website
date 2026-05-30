// src/pages/LandInfo.jsx
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient"; 

function LandInfo({ setPage, session, editLandData, setEditLandData }) {
  const [formData, setFormData] = useState({
    landName: "",
    landType: "",
    landSize: "",
    address: "",
    city: "",
    province: "",
    zipCode: "",
    country: "",
    commodity: "",
    description: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Efek untuk mengisi form otomatis jika sedang dalam mode EDIT
  useEffect(() => {
    if (editLandData) {
      setFormData({
        landName: editLandData.nama_lahan || "",
        landType: editLandData.tipe_lahan || "",
        landSize: editLandData.luas_lahan?.toString() || "",
        address: editLandData.alamat_lahan || "", // DISESUAIKAN: alamat -> alamat_lahan
        city: editLandData.kota || "",
        province: editLandData.provinsi || "",
        zipCode: editLandData.kode_pos?.toString() || "",
        country: editLandData.negara || "",
        commodity: editLandData.komoditas_utama || "",
        description: editLandData.deskripsi_tambahan || "" // DISESUAIKAN: deskripsi_tambah -> deskripsi_tambahan
      });
    }
  }, [editLandData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: false });
    }
  };

  const handleClose = () => {
    if (setEditLandData) setEditLandData(null);
    setPage("dashboard");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let tempErrors = {};
    
    const requiredFields = [
      "landName", "landType", "landSize", "address", 
      "city", "province", "zipCode", "country"
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]) tempErrors[field] = true;
    });

    if (formData.landSize && isNaN(formData.landSize)) {
      tempErrors.landSize = true;
    }

    setErrors(tempErrors);

    if (Object.keys(tempErrors).length === 0) {
      setLoading(true);

      try {
        const userId = session?.user?.id;
        if (!userId) throw new Error("Sesi berakhir, silakan login kembali.");

        // Memetakan payload dengan struktur tabel 'informasi_lahan' yang baru
        const payload = { 
          nama_lahan: formData.landName,
          tipe_lahan: formData.landType,
          luas_lahan: parseFloat(formData.landSize),
          alamat_lahan: formData.address, // DISESUAIKAN: alamat -> alamat_lahan
          kota: formData.city,
          provinsi: formData.province,
          kode_pos: parseInt(formData.zipCode, 10), // Konversi ke integer murni karena tipe data di database numeric
          negara: formData.country,
          komoditas_utama: formData.commodity,
          deskripsi_tambahan: formData.description // DISESUAIKAN: deskripsi_tambah -> deskripsi_tambahan
        };

        if (editLandData) {
          // --- LOGIKA UPDATE ---
          // DISESUAIKAN: Menggunakan tabel 'informasi_lahan' dan target field 'id_lahan'
          const { error: updateError } = await supabase
            .from('informasi_lahan')
            .update(payload)
            .eq('id_lahan', editLandData.id_lahan);

          if (updateError) throw updateError;
          alert("Perubahan lahan berhasil disimpan!");
        } else {
          // --- LOGIKA INSERT ---
          // DISESUAIKAN: Menggunakan tabel 'informasi_lahan' dan target foreign key 'id_cust'
          const { error: insertError } = await supabase
            .from('informasi_lahan')
            .insert([{ ...payload, id_cust: userId }]);

          if (insertError) throw insertError;
          alert("Informasi lahan baru berhasil disimpan!");
        }

        handleClose();

      } catch (error) {
        alert("Gagal menyimpan data: " + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-modal land-modal">
        <button className="close-btn" onClick={handleClose}>✕</button>
        
        <h2 className="auth-title">{editLandData ? "Edit Informasi Lahan" : "Informasi Lahan"}</h2>
        <p className="auth-subtitle">Pastikan data lahan Anda akurat untuk layanan yang lebih maksimal.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          
          <h4 className="section-title">Informasi Dasar</h4>
          <label>Nama Lahan <span className="red">*</span></label>
          <div className={`input-group ${errors.landName ? "error-border" : ""}`}>
            <span className="icon">🌱</span>
            <input 
              type="text" 
              name="landName"
              placeholder="Masukkan nama lahan" 
              value={formData.landName}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="input-row">
            <div className="input-field">
              <label>Tipe Lahan <span className="red">*</span></label>
              <div className={`input-group ${errors.landType ? "error-border" : ""}`}>
                <input 
                  type="text" 
                  name="landType"
                  placeholder="Contoh: Lahan Basah" 
                  value={formData.landType}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="input-field">
              <label>Luas Lahan <span className="red">*</span></label>
              <div className={`input-group ${errors.landSize ? "error-border" : ""}`}>
                <input 
                  type="text" 
                  name="landSize"
                  placeholder="Hektar" 
                  value={formData.landSize}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <h4 className="section-title">Lokasi</h4>
          <label>Alamat Lengkap <span className="red">*</span></label>
          <div className={`input-group ${errors.address ? "error-border" : ""}`}>
            <span className="icon">📍</span>
            <input 
              type="text" 
              name="address"
              placeholder="Masukkan alamat lengkap" 
              value={formData.address}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="input-row">
            <div className="input-field">
              <label>Kota <span className="red">*</span></label>
              <div className={`input-group ${errors.city ? "error-border" : ""}`}>
                <input type="text" name="city" placeholder="Kota" value={formData.city} onChange={handleChange} disabled={loading} />
              </div>
            </div>
            <div className="input-field">
              <label>Provinsi <span className="red">*</span></label>
              <div className={`input-group ${errors.province ? "error-border" : ""}`}>
                <input type="text" name="province" placeholder="Provinsi" value={formData.province} onChange={handleChange} disabled={loading} />
              </div>
            </div>
          </div>

          <div className="input-row">
            <div className="input-field">
              <label>Kode Pos <span className="red">*</span></label>
              <div className={`input-group ${errors.zipCode ? "error-border" : ""}`}>
                <input type="text" name="zipCode" placeholder="Kode Pos" value={formData.zipCode} onChange={handleChange} disabled={loading} />
              </div>
            </div>
            <div className="input-field">
              <label>Negara <span className="red">*</span></label>
              <div className={`input-group ${errors.country ? "error-border" : ""}`}>
                <input type="text" name="country" placeholder="Negara" value={formData.country} onChange={handleChange} disabled={loading} />
              </div>
            </div>
          </div>

          <h4 className="section-title">Operasional Lahan</h4>
          <label>Komoditas Utama</label>
          <div className="input-group">
            <input 
              type="text" 
              name="commodity"
              placeholder="Contoh: Padi, Jagung" 
              value={formData.commodity}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <label>Deskripsi Tambahan</label>
          <div className="input-group textarea-group">
            <textarea 
              name="description"
              placeholder="Ceritakan sedikit tentang lahan Anda..."
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
            ></textarea>
          </div>

          <div className="btn-group-row">
            <button type="button" className="btn-outline" onClick={handleClose}>Batal</button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Menyimpan..." : (editLandData ? "Simpan Perubahan" : "Simpan Lahan")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LandInfo;