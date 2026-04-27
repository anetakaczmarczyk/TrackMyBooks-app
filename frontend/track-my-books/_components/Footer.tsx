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
            <p>Your digital library. Track, discover, and share your love for books.</p>
          </div>
          <div className="footer-col">
            <h4>Product</h4>
            <ul>
              <li><Link href="/books">Books</Link></li>
              <li><Link href="/recommendations">Recommendations</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <ul>
              <li><Link href="/terms">Terms of Service</Link></li>
              <li><Link href="/privacy?tab=privacy">Privacy Policy</Link></li>
              <li><Link href="/privacy?tab=cookies">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Track My Books. All rights reserved.</p>
        </div>
      </footer>
  );
}