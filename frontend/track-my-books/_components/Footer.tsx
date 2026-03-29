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
              <li><Link href="/books">Książki</Link></li>
              <li><Link href="/recommendations">Rekomendacje</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Firma</h4>
            <ul>
              <li><Link href="/about">O nas</Link></li>
              <li><Link href="/contact">Kontakt</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Prawne</h4>
            <ul>
              <li><Link href="/terms">Regulamin</Link></li>
              <li><Link href="/privacy?tab=privacy">Prywatność</Link></li>
              <li><Link href="/privacy?tab=cookies">Cookies</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Track My Books. Wszystkie prawa zastrzeżone.</p>
        </div>
      </footer>
  );
}