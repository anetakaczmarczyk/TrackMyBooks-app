"use client";

import { useState, useEffect, useMemo } from "react";
import useSWR from "swr";
import { Navbar } from "@/_components/Navbar";
import { Book, GenreTag } from "@/_components/bookInterface";
import Link from "next/link";

const GENRES = [
  "All", "Classics", "Fiction", "Fantasy", "Mystery",
  "Romance", "History", "Young Adult", "Thriller",
  "Biography", "Nonfiction", "Science Fiction", "Horror",
];

const SORTS = [
  "Rating: highest", "Title: A-Z", "Newest first", "Oldest first",
];

const ITEMS_PER_PAGE = 54;
const INITIAL_BATCH = 1000;

async function fetchBooks(startNumber: number, itemsPerPage: number): Promise<Book[]> {
  try {
    const response = await fetch("http://localhost:5000/api/books/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startNumber, itemsPerPage }),
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data
    .filter((b: any) => b.default_physical_edition_id)
    .map((book: any) =>({
      ...book,
      default_Physical_Edition_Id: book.default_physical_edition_id,
    }));
  } catch (e) {
    console.error("BŁĄD FETCH:", e);
    return [];
  }
}


export default function BooksPage() {
  // Szybkie pobranie i zapamiętanie pierwszej paczki 1000 książek przy użyciu SWR
  // Wyłączamy automatyczne ponowne odpytywanie API przy powrocie na kartę, aby oszczędzić zasoby sieciowe
  const { data: initialBooks } = useSWR('initial-books', () => fetchBooks(0, INITIAL_BATCH), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateOnMount: true,
    fallbackData: [],
  });

  const [allBooks, setAllBooks] = useState<Book[]>([]);

  // Pobieranie w tle pozostałych książek z bazy (partiami po 1000).
  // Użytkownik widzi i filtruje pierwsze 1000 książek natychmiast, a reszta dociąga się niewidocznie w tle.
  useEffect(() => {
    let isMounted = true;
    if (!initialBooks || initialBooks.length === 0) return;

    setAllBooks(initialBooks);

    async function fetchRest() {
      let offset = INITIAL_BATCH;
      while (isMounted) {
        const batch = await fetchBooks(offset, 1000);
        if (!isMounted || batch.length === 0) break;
        setAllBooks(prev => {
          // Ochrona przed ewentualnym powieleniem tych samych książek w pamięci lokalnej
          const uniqueBatch = batch.filter(b => 
            !prev.some(existing => existing.default_Physical_Edition_Id === b.default_Physical_Edition_Id)
          );
          return [...prev, ...uniqueBatch];
        });
        
        offset += 1000;
      }
    }

    fetchRest();
    return () => { isMounted = false; };
  }, [initialBooks]);


  const [genre, setGenre] = useState("All");
  const [sort, setSort] = useState(SORTS[0]);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [genre, sort, query]);

// Wykorzystanie useMemo zapobiega ponownemu filtrowaniu i sortowaniu tysięcy książek przy każdym renderze.
// Zapobiega to opóźnieniu (input lag) podczas wpisywania tekstu w wyszukiwarkę.
const filtered = useMemo(() => {
  return allBooks
    .filter(b => genre === "All" || b.cached_Tags.Genre?.some((g: GenreTag) => g.tag === genre))
    .filter(b => !query || b.title.toLowerCase().includes(query.toLowerCase()) || b.contributions[0]?.author?.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      if (sort === "Rating: highest") return b.rating - a.rating;
      if (sort === "Title: A–Z") return a.title.localeCompare(b.title);
      if (sort === "Newest first") return (b.release_Date || "0000-00-00").localeCompare(a.release_Date || "0000-00-00");
      if (sort === "Oldest first") return (a.release_Date || "9999-99-99").localeCompare(b.release_Date || "9999-99-99");
      return 0;
    });
}, [allBooks, genre, sort, query]); // Efekt przelicza się tylko przy zmianie tych zależności

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  
  // Algorytm wyliczający skrócony pasek stron z użyciem wielokropków
  const pageNumbers = useMemo(() => {
  return Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
    .reduce<(number | "…")[]>((acc, p, i, arr) => {
      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…");
      acc.push(p);
      return acc;
    }, []);
}, [totalPages, page]);

  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const goToPage = (p: number) => {
    setPage(p);
    // Płynne przewijanie do samej góry po zmianie strony katalogu
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const loading = allBooks.length === 0;

  return (
    <>
      <Navbar />

      <div className="inner-page">

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

        <p className="results-count">
          {loading
            ? "Loading…"
            : `${filtered.length} result${filtered.length !== 1 ? "s" : ""} · page ${page} of ${totalPages}`
          }
        </p>

        {loading && (
          <div className="books-loading">
            <div className="books-loading-spinner" />
            <p>Fetching books…</p>
          </div>
        )}

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

        {!loading && view === "grid" && paginated.length > 0 && (
          <div className="books-grid">
            {paginated.map(book => (
              <div className="book-grid-card" key={book.default_Physical_Edition_Id}>
                <div className="book-grid-cover-wrap">
                  <img
                    src={book.cached_Image.url || undefined}
                    alt={book.title}
                    className="book-grid-cover"
                  />
                  <div className="book-grid-overlay">
                    <Link href={`/books/${book.default_Physical_Edition_Id}`} className="overlay-detail">Details →</Link>
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

        {!loading && view === "list" && paginated.length > 0 && (
          <div className="books-list">
            {paginated.map(book => (
              <div className="book-list-row" key={book.default_Physical_Edition_Id}>
                <img
                  src={book.cached_Image.url || undefined}
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