"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/_components/Navbar";
import { Book, GenreTag } from "@/_components/bookInterface";

const GENRES = [
  "All", "Classics", "Fiction", "Fantasy", "Mystery",
  "Romance", "History", "Young Adult", "Thriller",
  "Biography", "Nonfiction", "Science Fiction", "Horror",
];

const SORTS = [
  "Rating: highest",
  "Title: A–Z",
  "Newest first",
  "Oldest first",
];

const ITEMS_PER_PAGE =54;
const INITIAL_BATCH = 104;

async function fetchBooks(startNumber: number, itemsPerPage: number): Promise<Book[]> {
  try {
    const response = await fetch("http://localhost:5000/api/books/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        startNumber: startNumber,
        itemsPerPage: itemsPerPage
       }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "An error occurred while fetching books");
    }

    const data = await response.json();
    console.log("Fetched books:", data);
    console.log("Release dates:", data.map((book: Book) => book.release_Date));
    return data;
  } catch (error) {
    console.error("Error fetching books:", error);
    return [];
  }
}

export default function BooksPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [genre, setGenre]         = useState("All");
  const [sort, setSort]           = useState(SORTS[0]);
  const [query, setQuery]         = useState("");
  const [view, setView]           = useState<"grid" | "list">("grid");
  const [books, setBooks]         = useState<Book[]>([]);
  const [loading, setLoading]     = useState(false);
  const [page, setPage]           = useState(1);

  // Reset to page 1 whenever filters change
  useEffect(() => { setPage(1); }, [genre, sort, query]);

  useEffect(() => {
    setIsMounted(true);

    async function loadBooks() {
      try {
        setLoading(true);
        const firstBatch = await fetchBooks(0, INITIAL_BATCH);
        setBooks(firstBatch);

        let offset = INITIAL_BATCH;
        while(offset < 10000) {
          const batch = await fetchBooks(offset, 1000);
          if (batch.length === 0) break;
          batch.filter(b => b.default_cover_edition_id !== null);
          for (let book of batch) {
            if (book.default_cover_edition_id in books.map(b => b.default_cover_edition_id)) {
              batch.splice(batch.indexOf(book), 1);
            }
          }
          console.log(`Fetched batch of ${batch.length} books (offset: ${offset})`);
          setBooks(prev => [...prev, ...batch]);
          offset += 1000;
        }
        setLoading(false);
        
      } catch (error) {
        console.error("Error loading books:", error);
      } finally {
        setLoading(false);
      }
    }

    loadBooks();
  }, []);

  if (!isMounted) {
    return <div className="inner-page">Loading…</div>;
  }

  // ── Filter + sort ──
  const filtered = books
    .filter(b =>
      genre === "All" ||
      b.cached_Tags.Genre?.some((g: GenreTag) => g.tag === genre)
    )
    .filter(b =>
      !query ||
      b.title.toLowerCase().includes(query.toLowerCase()) ||
      b.contributions[0]?.author?.name.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === "Rating: highest") return b.rating - a.rating;
      if (sort === "Title: A–Z")      return a.title.localeCompare(b.title);
      if (sort === "Newest first") {
        const dA = a.release_Date || "0000-00-00";
        const dB = b.release_Date || "0000-00-00";
        return dB.localeCompare(dA);
      }
      if (sort === "Oldest first") {
        const dA = a.release_Date || "9999-99-99";
        const dB = b.release_Date || "9999-99-99";
        return dA.localeCompare(dB);
      }
      return 0;
    });

  // ── Pagination ──
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated  = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const goToPage = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Page numbers with ellipsis
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
    .reduce<(number | "…")[]>((acc, p, i, arr) => {
      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…");
      acc.push(p);
      return acc;
    }, []);

  return (
    <>
      <Navbar />

      <div className="inner-page">

        {/* ── Header ── */}
        <div className="page-header">
          <div>
            <div className="page-eyebrow">
              <span className="eyebrow-line" />Catalogue
              <span className="eyebrow-line" />
            </div>
            <h1 className="page-title">Books</h1>
          </div>

          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Search by title or author…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* ── Toolbar ── */}
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
                title="Grid"
              >⊞</button>
              <button
                className={view === "list" ? "active" : ""}
                onClick={() => setView("list")}
                title="List"
              >☰</button>
            </div>
          </div>
        </div>

        {/* ── Results count ── */}
        <p className="results-count">
          {loading
            ? "Loading…"
            : `${filtered.length} result${filtered.length !== 1 ? "s" : ""} · page ${page} of ${totalPages}`
          }
        </p>

        {/* ── Loading state ── */}
        {loading && (
          <div className="books-loading">
            <div className="books-loading-spinner" />
            <p>Fetching books…</p>
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && filtered.length === 0 && (
          <div className="books-empty">
            <span className="books-empty-icon">📭</span>
            <p>No books found matching your filters.</p>
            <button
              className="add-btn-sm"
              onClick={() => { setQuery(""); setGenre("All"); }}
            >
              Clear filters
            </button>
          </div>
        )}

        {/* ── Grid view ── */}
        {!loading && view === "grid" && paginated.length > 0 && (
          <div className="books-grid">
            {paginated.map(book => (
              <div className="book-grid-card" key={book.default_cover_edition_id}>
                <div className="book-grid-cover-wrap">
                  <img
                    src={book.cached_Image.url}
                    alt={book.title}
                    className="book-grid-cover"
                  />
                  <div className="book-grid-overlay">
                    <button className="add-btn">+ Add to library</button>
                    <a href="#" className="overlay-detail">Details →</a>
                  </div>
                </div>
                <div className="book-grid-info">
                  <div className="book-grid-title">{book.title}</div>
                  <div className="book-grid-author">
                    {book.contributions[0]?.author?.name}
                  </div>
                  <div className="book-grid-meta">
                    <span className="book-star">★ {book.rating.toFixed(2)}</span>
                    <span>{book.pages} pp.</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── List view ── */}
        {!loading && view === "list" && paginated.length > 0 && (
          <div className="books-list">
            {paginated.map(book => (
              <div className="book-list-row" key={book.default_cover_edition_id}>
                <img
                  src={book.cached_Image.url}
                  alt={book.title}
                  className="book-list-cover"
                />
                <div className="book-list-info">
                  <div className="book-list-title">{book.title}</div>
                  <div className="book-list-author">
                    {book.contributions[0]?.author?.name}
                  </div>
                </div>
                <div className="book-list-meta">
                  <span className="book-star">★ {book.rating.toFixed(2)}</span>
                  <span className="book-list-pages">
                    {book.pages} pp. · {book.release_Date}
                  </span>
                </div>
                <button className="add-btn-sm">+ Add</button>
              </div>
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {!loading && totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              disabled={page === 1}
              onClick={() => goToPage(1)}
              title="First page"
            >«</button>

            <button
              className="pagination-btn"
              disabled={page === 1}
              onClick={() => goToPage(page - 1)}
              title="Previous page"
            >‹</button>

            {pageNumbers.map((p, i) =>
              p === "…" ? (
                <span key={`dots-${i}`} className="pagination-dots">…</span>
              ) : (
                <button
                  key={p}
                  className={`pagination-btn ${page === p ? "active" : ""}`}
                  onClick={() => goToPage(p as number)}
                >
                  {p}
                </button>
              )
            )}

            <button
              className="pagination-btn"
              disabled={page === totalPages}
              onClick={() => goToPage(page + 1)}
              title="Next page"
            >›</button>

            <button
              className="pagination-btn"
              disabled={page === totalPages}
              onClick={() => goToPage(totalPages)}
              title="Last page"
            >»</button>
          </div>
        )}

      </div>
    </>
  );
}