import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from "./App.jsx"
import "./App.css"; 

// SEMUA IMPORT STYLE ADMIN DI SINI SUDAH DIHAPUS
// Karena semuanya sudah aman dikunci di dalam src/styles/Admin.scss dan dipanggil lewat App.jsx

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)