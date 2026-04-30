import BookDetail from "./bookDetail";
import { BookByIdResponse } from "@/_components/bookInterface";


async function fetchBookByIndex(slug: number): Promise<BookByIdResponse | null> {
  try {
    const response = await fetch("http://localhost:5000/api/books/bookById", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        bookId: slug
       }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "An error occurred while fetching books");
    }

    const data = await response.json();
    return data[0];
  } catch (error) {
    // console.error("Error fetching books:", error);
    return null;
  }
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = await fetchBookByIndex(parseInt(slug));

  if (!book) return <div className="inner-page">Book not found.</div>;

  return <BookDetail bookbyId={book} />;
}