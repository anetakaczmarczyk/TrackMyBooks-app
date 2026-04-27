import { useState } from "react";
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

export function BookCard({ book }: { book: typeof BOOKS_TRENDING[0] }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="book-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ transform: hovered ? "scale(1.07) translateY(-6px)" : "scale(1)" }}
    >
      <div className="book-cover-wrap">
        <Image src={book.cover} alt={book.title} className="book-cover" width={200} height={300} />
        <div className={`book-overlay ${hovered ? "visible" : ""}`}>
          <span className="book-genre">{book.genre}</span>
          <div className="book-rating">★ {book.rating}</div>
          <button className="add-btn">+ Add to List</button>
        </div>
      </div>
      <div className="book-info">
        <div className="book-title">{book.title}</div>
        <div className="book-author">{book.author}</div>
      </div>
    </div>
  );
}