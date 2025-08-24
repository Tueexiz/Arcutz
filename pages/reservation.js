import Link from 'next/link';
import { useState } from 'react';
import BookingForm from '../components/BookingForm';

export default function Reservation(){
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div>
      <header className="header">
        <nav className="navbar container">
          <div className="brand">ArCutz</div>
          <div className="menu">
            <Link href="/">Accueil</Link>
            <Link href="/reservation">Réservation</Link>
          </div>
          <button className="burger" onClick={()=>setMenuOpen(x=>!x)}>☰</button>
        </nav>
        {menuOpen && (
          <div className="mobileMenu container">
            <Link href="/" onClick={()=>setMenuOpen(false)}>Accueil</Link>
            <Link href="/reservation" onClick={()=>setMenuOpen(false)}>Réservation</Link>
          </div>
        )}
      </header>

      <main className="container">
        <section className="glass section">
          <h2 style={{marginTop:0}}>Réservation</h2>
          <BookingForm />
        </section>
      </main>

      <footer className="footer">© {new Date().getFullYear()} ArCutz</footer>
    </div>
  );
}
