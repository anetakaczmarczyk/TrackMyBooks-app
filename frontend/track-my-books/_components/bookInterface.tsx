export interface Book {
    default_physical_edition_id: number;
    description: string;
    title: string;
    pages: number;
    ratings_Count: number;
    rating: number;
    cached_Image: {
        url: string;
    };
    cached_Tags: {
        Genre: GenreTag[];
    };
    contributions: {
        author: Author;
    }[];
    release_Date: string;
    book_Series: {
        series: {
            name: string;
            position: number;
        }
    }[];
    publisher: {
        name: string;
    }
}

export interface Author {
    name: string;
    bio: string;
    image: {
        url: string;
    }
}

export interface GenreTag{
    tag: string;
}

export interface BookByIdResponse {
    isbn_10: string;
    isbn_13: string;
    language: {language: string};
    publisher: {
        name: string;
    }
    contributions: {
        author: Author;
    }[];
    book: Book;
}