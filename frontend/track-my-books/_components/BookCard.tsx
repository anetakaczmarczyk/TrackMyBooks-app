import { useState } from "react";
import { Book } from "@/_components/bookInterface";


export function BookCard({ book }: { book: Book }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="book-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ transform: hovered ? "scale(1.07) translateY(-6px)" : "scale(1)" }}
    >
      <div className="book-cover-wrap">
        <img src={book.cached_Image?.url || undefined} alt={book.title} className="book-cover" width={200} height={300} />
        <div className={`book-overlay ${hovered ? "visible" : ""}`}>
          <div className="book-rating">★ {book.rating.toFixed(2)}</div>
          <a href={`/books/${book.default_Physical_Edition_Id}`} className="add-btn">+ Add to List</a>
        </div>
      </div>
      <div className="book-info">
        <div className="book-title">{book.title}</div>
        <div className="book-author">{book.contributions[0].author.name}</div>
      </div>
    </div>
  );
}