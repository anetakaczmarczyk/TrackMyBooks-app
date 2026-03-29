import { useState, useRef, useEffect } from "react";
import { BookCard } from "@/_components/BookCard";
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
  { id: 9, title: "The Mountain in the Sea", author: "Ray Nayler", cover: "https://covers.openlibrary.org/b/id/13156978-L.jpg", rating: 4.4, genre: "Sci-Fi" },
  { id: 10, title: "Tomorrow, and Tomorrow", author: "Gabrielle Zevin", cover: "https://covers.openlibrary.org/b/id/12993076-L.jpg", rating: 4.5, genre: "Dramat" },
  { id: 11, title: "Babel", author: "R. F. Kuang", cover: "https://covers.openlibrary.org/b/id/13066421-L.jpg", rating: 4.6, genre: "Fantasy" },
  { id: 12, title: "Sea of Tranquility", author: "Emily St. John Mandel", cover: "https://covers.openlibrary.org/b/id/12699828-L.jpg", rating: 4.4, genre: "Sci-Fi" },
  { id: 13, title: "The Midnight Library", author: "Matt Haig", cover: "https://covers.openlibrary.org/b/id/10481085-L.jpg", rating: 4.3, genre: "Fikcja" },
  { id: 14, title: "Project Hail Mary", author: "Andy Weir", cover: "https://covers.openlibrary.org/b/id/10509244-L.jpg", rating: 4.8, genre: "Sci-Fi" },
];


export function Slider({ title, books, badge }: { title: string; books: typeof BOOKS_TRENDING; badge?: string }) {
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
        <Link href="/ksiazki" className="see-all">Zobacz wszystkie →</Link>
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