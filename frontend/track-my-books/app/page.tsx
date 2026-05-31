"use client";

import { Slider } from "@/_components/BookSlider";
import { Navbar } from "@/_components/Navbar";
import { Footer } from "@/_components/Footer";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Book } from "@/_components/bookInterface";


export default function Home() {
  const [trending, setTrending] = useState<Book[]>([]);
  const [news, setNews] = useState<Book[]>([]);

  useEffect(() => {
    async function fetchAllBooks() {
      try {
        const res = await fetch("http://localhost:5000/api/books/slider-books");
        const data = await res.json();
        setTrending(data.trending);
        setNews(data.news);
      } catch (err) {
        console.error("Error fetching books:", err);
      } 
    }
    fetchAllBooks();
  }, []);

  if (trending.length == 0) return <div>Loading books...</div>;
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
            <img src={trending[1]?.cached_Image?.url} alt="" width={120} height={180} />
          </div>
          <div className="float-book float-book-2">
            <img src={trending[0]?.cached_Image?.url} alt="" width={130} height={200} />
          </div>
          <div className="float-book float-book-3">
            <img src={trending[5]?.cached_Image?.url} alt="" width={115} height={175} />
          </div>
        </div>
      </section>

      <main>
        <Slider title="Popular Now" books={trending} badge="🔥 Hot" />
        <Slider title="New Releases" books={news} />

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
      </main>

    <Footer />

    </>
  );
}
