"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

const BOOKS_TRENDING = [
  { id: 1, title: "Mistrz i Małgorzata", author: "Michaił Bułhakow", cover: "https://covers.openlibrary.org/b/id/8231856-L.jpg", rating: 4.9, genre: "Klasyka" },
  { id: 2, title: "Sto lat samotności", author: "Gabriel García Márquez", cover: "https://covers.openlibrary.org/b/id/8406786-L.jpg", rating: 4.8, genre: "Realizm magiczny" },
  { id: 3, title: "Bracia Karamazow", author: "Fiodor Dostojewski", cover: "https://covers.openlibrary.org/b/id/8091016-L.jpg", rating: 4.7, genre: "Klasyka" },
  { id: 4, title: "Dune", author: "Frank Herbert", cover: "https://covers.openlibrary.org/b/id/8758191-L.jpg", rating: 4.8, genre: "Sci-Fi" },
  { id: 5, title: "1984", author: "George Orwell", cover: "https://covers.openlibrary.org/b/id/8575708-L.jpg", rating: 4.7, genre: "Dystopia" },
  { id: 6, title: "Zbrodnia i kara", author: "Fiodor Dostojewski", cover: "https://covers.openlibrary.org/b/id/8091022-L.jpg", rating: 4.8, genre: "Klasyka" },
  { id: 7, title: "Fundacja", author: "Isaac Asimov", cover: "https://covers.openlibrary.org/b/id/8391619-L.jpg", rating: 4.6, genre: "Sci-Fi" },
  { id: 8, title: "Mały Książę", author: "Antoine de Saint-Exupéry", cover: "https://covers.openlibrary.org/b/id/8406782-L.jpg", rating: 4.9, genre: "Bajka" },
];

const BOOKS_NEW = [
  { id: 9, title: "The Mountain in the Sea", author: "Ray Nayler", cover: "https://covers.openlibrary.org/b/id/13156978-L.jpg", rating: 4.4, genre: "Sci-Fi" },
  { id: 10, title: "Tomorrow, and Tomorrow", author: "Gabrielle Zevin", cover: "https://covers.openlibrary.org/b/id/12993076-L.jpg", rating: 4.5, genre: "Dramat" },
  { id: 11, title: "Babel", author: "R. F. Kuang", cover: "https://covers.openlibrary.org/b/id/13066421-L.jpg", rating: 4.6, genre: "Fantasy" },
  { id: 12, title: "Sea of Tranquility", author: "Emily St. John Mandel", cover: "https://covers.openlibrary.org/b/id/12699828-L.jpg", rating: 4.4, genre: "Sci-Fi" },
  { id: 13, title: "The Midnight Library", author: "Matt Haig", cover: "https://covers.openlibrary.org/b/id/10481085-L.jpg", rating: 4.3, genre: "Fikcja" },
  { id: 14, title: "Project Hail Mary", author: "Andy Weir", cover: "https://covers.openlibrary.org/b/id/10509244-L.jpg", rating: 4.8, genre: "Sci-Fi" },
];

function BookCard({ book }: { book: typeof BOOKS_TRENDING[0] }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="book-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ transform: hovered ? "scale(1.07) translateY(-6px)" : "scale(1)" }}
    >
      <div className="book-cover-wrap">
        <img src={book.cover} alt={book.title} className="book-cover" />
        <div className={`book-overlay ${hovered ? "visible" : ""}`}>
          <span className="book-genre">{book.genre}</span>
          <div className="book-rating">★ {book.rating}</div>
          <button className="add-btn">+ Dodaj do listy</button>
        </div>
      </div>
      <div className="book-info">
        <div className="book-title">{book.title}</div>
        <div className="book-author">{book.author}</div>
      </div>
    </div>
  );
}

function Slider({ title, books, badge }: { title: string; books: typeof BOOKS_TRENDING; badge?: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const scroll = (dir: "left" | "right") => {
    const t = trackRef.current;
    if (!t) return;
    t.scrollBy({ left: dir === "right" ? 340 : -340, behavior: "smooth" });
  };

  const checkScroll = () => {
    const t = trackRef.current;
    if (!t) return;
    setCanLeft(t.scrollLeft > 10);
    setCanRight(t.scrollLeft + t.clientWidth < t.scrollWidth - 10);
  };

  useEffect(() => {
    const t = trackRef.current;
    if (!t) return;
    t.addEventListener("scroll", checkScroll);
    checkScroll();
    return () => t.removeEventListener("scroll", checkScroll);
  }, []);

  return (
    <section className="slider-section">
      <div className="slider-header">
        <h2 className="slider-title">
          {title}
          {badge && <span className="badge">{badge}</span>}
        </h2>
        <a href="#" className="see-all">Zobacz wszystkie →</a>
      </div>
      <div className="slider-wrapper">
        {canLeft && (
          <button className="slider-btn left" onClick={() => scroll("left")}>‹</button>
        )}
        <div className="slider-track" ref={trackRef}>
          {books.map(b => <BookCard key={b.id} book={b} />)}
        </div>
        {canRight && (
          <button className="slider-btn right" onClick={() => scroll("right")}>›</button>
        )}
      </div>
    </section>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>

{/* NAV */}
      <nav className={scrolled ? "scrolled" : ""}>
        <a href="/" className="logo">
          <div className="logo-icon">📚</div>
          <span className="logo-text">Biblio<span>Track</span></span>
        </a>
        <ul className="nav-links">
          <li><a href="/ksiazki">Książki</a></li>
          <li><a href="/rekomendacje">Rekomendacje</a></li>
        </ul>
        <div className="nav-auth">
          <button className="btn-ghost">Zaloguj</button>
          <button className="btn-gold">Zarejestruj</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="eyebrow-line" />
            Twoja cyfrowa biblioteka
            <span className="eyebrow-line" />
          </div>
          <h1>Śledź swoją<br /><em>czytelniczą</em><br />podróż</h1>
          <p>Kataloguj przeczytane książki, odkrywaj nowe tytuły i dziel się rekomendacjami ze społecznością miłośników literatury.</p>
          <div className="hero-cta">
            <button className="btn-gold btn-lg">Zacznij za darmo</button>
            <a href="#" className="hero-link">
              ▶ Zobacz jak to działa
            </a>
          </div>
          <div className="hero-stats">
            <div>
              <div className="stat-num">48k+</div>
              <div className="stat-label">Czytelników</div>
            </div>
            <div>
              <div className="stat-num">1,2M</div>
              <div className="stat-label">Książek w bazie</div>
            </div>
            <div>
              <div className="stat-num">340k</div>
              <div className="stat-label">Recenzji</div>
            </div>
          </div>
        </div>
        <div className="hero-books-float">
          <div className="float-book float-book-1">
            <img src={BOOKS_TRENDING[3].cover} alt="" width={120} height={180} />
          </div>
          <div className="float-book float-book-2">
            <img src={BOOKS_TRENDING[0].cover} alt="" width={130} height={200} />
          </div>
          <div className="float-book float-book-3">
            <img src={BOOKS_TRENDING[4].cover} alt="" width={115} height={175} />
          </div>
        </div>
      </section>

      {/* SLIDERS */}
      <main>
        <Slider title="Popularne teraz" books={BOOKS_TRENDING} badge="🔥 Gorące" />
        <Slider title="Nowości" books={BOOKS_NEW} />

        {/* FEATURE BANNER */}
        <div className="feature-banner">
          <div className="feature-banner-text">
            <h2>Wszystko czego potrzebujesz jako czytelnik</h2>
            <p>Od śledzenia przeczytanych stron po spersonalizowane rekomendacje — mamy wszystko pod kontrolą.</p>
            <button className="btn-gold btn-lg">Dołącz do społeczności</button>
          </div>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">📖</div>
              <h3>Biblioteka</h3>
              <p>Kataloguj i zarządzaj swoimi książkami</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <h3>Statystyki</h3>
              <p>Śledź swój postęp czytelniczy</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🌟</div>
              <h3>Rekomendacje</h3>
              <p>Spersonalizowane propozycje dla Ciebie</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">👥</div>
              <h3>Społeczność</h3>
              <p>Dziel się z innymi czytelnikami</p>
            </div>
          </div>
        </div>

        <Slider title="Klasyka, którą warto przeczytać" books={[...BOOKS_TRENDING].reverse()} />
      </main>

      {/* FOOTER */}
      <footer>
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="/" className="logo">
              <div className="logo-icon">📚</div>
              <span className="logo-text">Biblio<span>Track</span></span>
            </a>
            <p>Twoja cyfrowa biblioteka. Śledź, odkrywaj i dziel się swoją miłością do książek.</p>
          </div>
          <div className="footer-col">
            <h4>Produkt</h4>
            <ul>
              <li><a href="#">Książki</a></li>
              <li><a href="#">Rekomendacje</a></li>
              <li><a href="#">Statystyki</a></li>
              <li><a href="#">Listy lektur</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Firma</h4>
            <ul>
              <li><a href="#">O nas</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Kariera</a></li>
              <li><a href="#">Kontakt</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Prawne</h4>
            <ul>
              <li><a href="#">Regulamin</a></li>
              <li><a href="#">Prywatność</a></li>
              <li><a href="#">Cookies</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 BiblioTrack. Wszystkie prawa zastrzeżone.</p>
          <div className="footer-social">
            <a href="#" className="social-btn">𝕏</a>
            <a href="#" className="social-btn">in</a>
            <a href="#" className="social-btn">ig</a>
          </div>
        </div>
      </footer>
    </>
  );
}
