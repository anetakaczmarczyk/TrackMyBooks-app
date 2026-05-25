import {BookByIdResponse} from "@/_components/bookInterface";
export interface Review {
    id: number;
    book_Id: number;
    username: string;
    rating: number;
    review_Text: string;
    timestamp: string;
    cached_Book?: BookByIdResponse; 
}