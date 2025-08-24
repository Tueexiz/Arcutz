import Link from 'next/link';
import { useState } from 'react';
import Carousel from '../components/Carousel';

export default function Home(){
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
          <h1 style={{marginTop:0}}>Coupe pro, style clean.</h1>
          <p>Réservez votre créneau du lundi au samedi, 9h30 – 18h. Prix unique : <span className="priceTag">20€</span>.</p>
          <div style={{marginTop:12}}>
            <Link className="button" href="/reservation">Réserver maintenant</Link>
          </div>
        </section>

        <Carousel />

        <section className="glass section">
          <h3 style={{marginTop:0}}>Pourquoi nous ?</h3>
          <ul>
            <li>Design premium (glassmorphism bleu pastel)</li>
            <li>Formulaire simple & rapide</li>
            <li>Emails automatiques de confirmation</li>
          </ul>
        </section>
      </main>

      <footer className="footer">© {new Date().getFullYear()} ArCutz — Tous droits réservés.</footer>
    </div>
  );
}
