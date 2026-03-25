"use client";

import { Slider } from "@/components/BookSlider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Link from "next/link";

const BOOKS_TRENDING = [
  { id: 1, title: "Mistrz i Małgorzata", author: "Michaił Bułhakow", cover: "https://covers.openlibrary.org/b/id/8231856-L.jpg", rating: 4.9, genre: "Klasyka" },
  { id: 2, title: "Sto lat samotności", author: "Gabriel García Márquez", cover: "https://covers.openlibrary.org/b/id/8406786-L.jpg", rating: 4.8, genre: "Realizm magiczny" },
  { id: 3, title: "Bracia Karamazow", author: "Fiodor Dostojewski", cover: "https://covers.openlibrary.org/b/id/8091016-L.jpg", rating: 4.7, genre: "Klasyka" },
  { id: 4, title: "Dune", author: "Frank Herbert", cover: "https://covers.openlibrary.org/b/id/8758191-L.jpg", rating: 4.8, genre: "Sci-Fi" },
  { id: 5, title: "1984", author: "George Orwell", cover: "https://covers.openlibrary.org/b/id/8575708-L.jpg", rating: 4.7, genre: "Dystopia" },
  { id: 6, title: "Zbrodnia i kara", author: "Fiodor Dostojewski", cover: "https://covers.openlibrary.org/b/id/8091022-L.jpg", rating: 4.8, genre: "Klasyka" },
  { id: 7, title: "Fundacja", author: "Isaac Asimov", cover: "https://covers.openlibrary.org/b/id/8391619-L.jpg", rating: 4.6, genre: "Sci-Fi" },
  { id: 8, title: "Mały Książę", author: "Antoine de Saint-Exupéry", cover: "https://covers.openlibrary.org/b/id/8406782-L.jpg", rating: 4.9, genre: "Bajka" },
  { id: 9, title: "Mistrz i Małgorzata", author: "Michaił Bułhakow", cover: "https://covers.openlibrary.org/b/id/8231856-L.jpg", rating: 4.9, genre: "Klasyka" },
  { id: 10, title: "Sto lat samotności", author: "Gabriel García Márquez", cover: "https://covers.openlibrary.org/b/id/8406786-L.jpg", rating: 4.8, genre: "Realizm magiczny" },
  { id: 11, title: "Bracia Karamazow", author: "Fiodor Dostojewski", cover: "https://covers.openlibrary.org/b/id/8091016-L.jpg", rating: 4.7, genre: "Klasyka" },
  { id: 12, title: "Dune", author: "Frank Herbert", cover: "https://covers.openlibrary.org/b/id/8758191-L.jpg", rating: 4.8, genre: "Sci-Fi" },
  { id: 13, title: "1984", author: "George Orwell", cover: "https://covers.openlibrary.org/b/id/8575708-L.jpg", rating: 4.7, genre: "Dystopia" },
  { id: 14, title: "Zbrodnia i kara", author: "Fiodor Dostojewski", cover: "https://covers.openlibrary.org/b/id/8091022-L.jpg", rating: 4.8, genre: "Klasyka" },
  { id: 15, title: "Fundacja", author: "Isaac Asimov", cover: "https://covers.openlibrary.org/b/id/8391619-L.jpg", rating: 4.6, genre: "Sci-Fi" },
  { id: 16, title: "Mały Książę", author: "Antoine de Saint-Exupéry", cover: "https://covers.openlibrary.org/b/id/8406782-L.jpg", rating: 4.9, genre: "Bajka" },
];

const BOOKS_NEW = [
  { id: 9, title: "The Mountain in the Sea", author: "Ray Nayler", cover: "https://covers.openlibrary.org/b/id/13156978-L.jpg", rating: 4.4, genre: "Sci-Fi" },
  { id: 10, title: "Tomorrow, and Tomorrow", author: "Gabrielle Zevin", cover: "https://covers.openlibrary.org/b/id/12993076-L.jpg", rating: 4.5, genre: "Dramat" },
  { id: 11, title: "Babel", author: "R. F. Kuang", cover: "https://covers.openlibrary.org/b/id/13066421-L.jpg", rating: 4.6, genre: "Fantasy" },
  { id: 12, title: "Sea of Tranquility", author: "Emily St. John Mandel", cover: "https://covers.openlibrary.org/b/id/12699828-L.jpg", rating: 4.4, genre: "Sci-Fi" },
  { id: 13, title: "The Midnight Library", author: "Matt Haig", cover: "https://covers.openlibrary.org/b/id/10481085-L.jpg", rating: 4.3, genre: "Fikcja" },
  { id: 14, title: "Project Hail Mary", author: "Andy Weir", cover: "https://covers.openlibrary.org/b/id/10509244-L.jpg", rating: 4.8, genre: "Sci-Fi" },
];




export default function Home() {
  return (
    <>
    <Navbar />

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
            <Link href="/signup" className="btn-gold btn-lg">Zacznij za darmo</Link>
          </div>
        </div>
        <div className="hero-books-float">
          <div className="float-book float-book-1">
            <img src={BOOKS_TRENDING[1].cover} alt="" width={120} height={180} />
          </div>
          <div className="float-book float-book-2">
            <img src={BOOKS_TRENDING[0].cover} alt="" width={130} height={200} />
          </div>
          <div className="float-book float-book-3">
            <img src={BOOKS_TRENDING[5].cover} alt="" width={115} height={175} />
          </div>
        </div>
      </section>

      <main>
        <Slider title="Popularne teraz" books={BOOKS_TRENDING} badge="🔥 Gorące" />
        <Slider title="Nowości" books={BOOKS_NEW} />

        {/* FEATURE BANNER */}
        <div className="feature-banner">
          <div className="feature-banner-text">
            <h2>Wszystko czego potrzebujesz jako czytelnik</h2>
            <p>Od śledzenia przeczytanych stron po spersonalizowane rekomendacje — mamy wszystko pod kontrolą.</p>
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

    <Footer />

    </>
  );
}
