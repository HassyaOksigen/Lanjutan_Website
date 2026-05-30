// src/pages/Home.jsx
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Why from "../components/Why";

function Home({ setPage, currentPage, session }) {
  return (
    <div className="homepage">
      <Navbar setPage={setPage} currentPage={currentPage} session={session}/>
      <Hero setPage={setPage} />
      
      <Why />
      <div className="footer-placeholder"></div>
    </div>
  );
}


export default Home;