"use client";

import { useState } from "react";
import {Navbar} from "@/_components/Navbar";

const GENRES = ["Wszystkie", "Klasyka", "Sci-Fi", "Fantasy", "Kryminał", "Romans", "Historia", "Thriller", "Biografia", "Dystopia"];

const ALL_BOOKS = [
  { id: 1,  title: "Mistrz i Małgorzata",      author: "Michaił Bułhakow",          cover: "https://covers.openlibrary.org/b/id/8231856-L.jpg",  rating: 4.9, genre: "Klasyka",   pages: 480, year: 1967 },
  { id: 2,  title: "Sto lat samotności",        author: "Gabriel García Márquez",     cover: "https://covers.openlibrary.org/b/id/8406786-L.jpg",  rating: 4.8, genre: "Klasyka",   pages: 417, year: 1967 },
  { id: 3,  title: "Dune",                      author: "Frank Herbert",              cover: "https://covers.openlibrary.org/b/id/8758191-L.jpg",  rating: 4.8, genre: "Sci-Fi",    pages: 688, year: 1965 },
  { id: 4,  title: "1984",                      author: "George Orwell",              cover: "https://covers.openlibrary.org/b/id/8575708-L.jpg",  rating: 4.7, genre: "Dystopia",  pages: 328, year: 1949 },
  { id: 5,  title: "Fundacja",                  author: "Isaac Asimov",               cover: "https://covers.openlibrary.org/b/id/8391619-L.jpg",  rating: 4.6, genre: "Sci-Fi",    pages: 244, year: 1951 },
  { id: 6,  title: "Zbrodnia i kara",           author: "Fiodor Dostojewski",         cover: "https://covers.openlibrary.org/b/id/8091022-L.jpg",  rating: 4.8, genre: "Klasyka",   pages: 671, year: 1866 },
  { id: 7,  title: "Mały Książę",               author: "Antoine de Saint-Exupéry",  cover: "https://covers.openlibrary.org/b/id/8406782-L.jpg",  rating: 4.9, genre: "Klasyka",   pages: 96,  year: 1943 },
  { id: 8,  title: "Project Hail Mary",         author: "Andy Weir",                 cover: "https://covers.openlibrary.org/b/id/10509244-L.jpg", rating: 4.8, genre: "Sci-Fi",    pages: 476, year: 2021 },
  { id: 9,  title: "The Midnight Library",      author: "Matt Haig",                 cover: "https://covers.openlibrary.org/b/id/10481085-L.jpg", rating: 4.3, genre: "Fantasy",   pages: 304, year: 2020 },
  { id: 10, title: "Babel",                     author: "R. F. Kuang",               cover: "https://covers.openlibrary.org/b/id/13066421-L.jpg", rating: 4.6, genre: "Fantasy",   pages: 545, year: 2022 },
  { id: 11, title: "Sea of Tranquility",        author: "Emily St. John Mandel",     cover: "https://covers.openlibrary.org/b/id/12699828-L.jpg", rating: 4.4, genre: "Sci-Fi",    pages: 272, year: 2022 },
  { id: 12, title: "Bracia Karamazow",          author: "Fiodor Dostojewski",         cover: "https://covers.openlibrary.org/b/id/8091016-L.jpg",  rating: 4.7, genre: "Klasyka",   pages: 796, year: 1880 },
  { id: 13, title: "Nowy wspaniały świat",      author: "Aldous Huxley",             cover: "https://covers.openlibrary.org/b/id/8406786-L.jpg",  rating: 4.5, genre: "Dystopia",  pages: 311, year: 1932 },
  { id: 14, title: "Gra Endera",                author: "Orson Scott Card",          cover: "https://covers.openlibrary.org/b/id/8391619-L.jpg",  rating: 4.6, genre: "Sci-Fi",    pages: 226, year: 1985 },
  { id: 15, title: "Solaris",                   author: "Stanisław Lem",             cover: "https://covers.openlibrary.org/b/id/8758191-L.jpg",  rating: 4.5, genre: "Sci-Fi",    pages: 204, year: 1961 },
  { id: 16, title: "Tomorrow and Tomorrow",     author: "Gabrielle Zevin",           cover: "https://covers.openlibrary.org/b/id/12993076-L.jpg", rating: 4.5, genre: "Romans",    pages: 401, year: 2022 },
];

const SORTS = ["Ocena: najwyższa", "Tytuł: A–Z", "Najnowsze", "Najstarsze"];

export default function BooksPage() {
  const [genre, setGenre]     = useState("Wszystkie");
  const [sort, setSort]       = useState(SORTS[0]);
  const [query, setQuery]     = useState("");
  const [view, setView]       = useState<"grid" | "list">("grid");

  const filtered = ALL_BOOKS
    .filter(b => genre === "Wszystkie" || b.genre === genre)
    .filter(b =>
      !query ||
      b.title.toLowerCase().includes(query.toLowerCase()) ||
      b.author.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === "Ocena: najwyższa") return b.rating - a.rating;
      if (sort === "Tytuł: A–Z")       return a.title.localeCompare(b.title);
      if (sort === "Najnowsze")         return b.year - a.year;
      return a.year - b.year;
    });

  return (
    <>
      <Navbar />

      <div className="inner-page">
        {/* Header */}
        <div className="page-header">
          <div>
            <div className="page-eyebrow">
              <span className="eyebrow-line" />Katalog
              <span className="eyebrow-line" />
            </div>
            <h1 className="page-title">Książki</h1>
          </div>

          {/* Search */}
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Szukaj tytułu lub autora…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Toolbar */}
        <div className="books-toolbar">
          <div className="genre-chips-row">
            {GENRES.map(g => (
              <button
                key={g}
                className={`genre-chip-sm ${genre === g ? "active" : ""}`}
                onClick={() => setGenre(g)}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="toolbar-right">
            <select
              className="sort-select"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              {SORTS.map(s => <option key={s}>{s}</option>)}
            </select>

            <div className="view-toggle">
              <button
                className={view === "grid" ? "active" : ""}
                onClick={() => setView("grid")}
                title="Siatka"
              >⊞</button>
              <button
                className={view === "list" ? "active" : ""}
                onClick={() => setView("list")}
                title="Lista"
              >☰</button>
            </div>
          </div>
        </div>

        <p className="results-count">{filtered.length} wyników</p>

        {/* Grid view */}
        {view === "grid" && (
          <div className="books-grid">
            {filtered.map(book => (
              <div className="book-grid-card" key={book.id}>
                <div className="book-grid-cover-wrap">
                  <img src={book.cover} alt={book.title} className="book-grid-cover" />
                  <div className="book-grid-overlay">
                    <button className="add-btn">+ Dodaj do biblioteczki</button>
                    <a href="#" className="overlay-detail">Szczegóły →</a>
                  </div>
                </div>
                <div className="book-grid-info">
                  <div className="book-grid-genre">{book.genre}</div>
                  <div className="book-grid-title">{book.title}</div>
                  <div className="book-grid-author">{book.author}</div>
                  <div className="book-grid-meta">
                    <span className="book-star">★ {book.rating}</span>
                    <span>{book.pages} str.</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List view */}
        {view === "list" && (
          <div className="books-list">
            {filtered.map(book => (
              <div className="book-list-row" key={book.id}>
                <img src={book.cover} alt={book.title} className="book-list-cover" />
                <div className="book-list-info">
                  <div className="book-list-genre">{book.genre}</div>
                  <div className="book-list-title">{book.title}</div>
                  <div className="book-list-author">{book.author}</div>
                </div>
                <div className="book-list-meta">
                  <span className="book-star">★ {book.rating}</span>
                  <span className="book-list-pages">{book.pages} str. · {book.year}</span>
                </div>
                <button className="add-btn-sm">+ Dodaj</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
