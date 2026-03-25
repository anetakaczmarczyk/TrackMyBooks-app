import Link from "next/link";
export function Footer() {
  return (
          <footer>
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo">
              <div className="logo-icon">📚</div>
              <span className="logo-text">Track <span>My</span> Books</span>
            </div>
            <p>Twoja cyfrowa biblioteka. Śledź, odkrywaj i dziel się swoją miłością do książek.</p>
          </div>
          <div className="footer-col">
            <h4>Produkt</h4>
            <ul>
              <li><Link href="#">Książki</Link></li>
              <li><Link href="#">Rekomendacje</Link></li>
              <li><Link href="#">Statystyki</Link></li>
              <li><Link href="#">Listy lektur</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Firma</h4>
            <ul>
              <li><Link href="#">O nas</Link></li>
              <li><Link href="#">Blog</Link></li>
              <li><Link href="#">Kariera</Link></li>
              <li><Link href="#">Kontakt</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Prawne</h4>
            <ul>
              <li><Link href="#">Regulamin</Link></li>
              <li><Link href="#">Prywatność</Link></li>
              <li><Link href="#">Cookies</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Track My Books. Wszystkie prawa zastrzeżone.</p>
          <div className="footer-social">
            <Link href="#" className="social-btn">𝕏</Link>
            <Link href="#" className="social-btn">in</Link>
            <Link href="#" className="social-btn">ig</Link>
          </div>
        </div>
      </footer>
  );
}