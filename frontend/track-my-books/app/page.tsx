"use client";

import { Slider } from "@/_components/BookSlider";
import { Navbar } from "@/_components/Navbar";
import { Footer } from "@/_components/Footer";
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
            Your reading journey, tracked beautifully
            <span className="eyebrow-line" />
          </div>
          <h1>Track Your<br /><em>Reading</em><br />Journey</h1>
          <p>Keep a record of the books you've read, discover new titles, and share recommendations with the community of book lovers.</p>
          <div className="hero-cta">
            <Link href="/signup" className="btn-gold btn-lg">Get Started for Free</Link>
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
        <Slider title="Popular Now" books={BOOKS_TRENDING} badge="🔥 Hot" />
        <Slider title="New Releases" books={BOOKS_NEW} />

        {/* FEATURE BANNER */}
        <div className="feature-banner">
          <div className="feature-banner-text">
            <h2>Everything You Need as a Reader</h2>
            <p>From tracking read pages to personalized recommendations — we've got it all under control.</p>
          </div>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">📖</div>
              <h3>Library</h3>
              <p>Organize and manage your book collection</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <h3>Statistics</h3>
              <p>Track your reading progress</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🌟</div>
              <h3>Recommendations</h3>
              <p>Personalized suggestions for you</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">👥</div>
              <h3>Community</h3>
              <p>Share with other readers</p>
            </div>
          </div>
        </div>

        <Slider title="Classic, which you should read" books={[...BOOKS_TRENDING].reverse()} />
      </main>

    <Footer />

    </>
  );
}
