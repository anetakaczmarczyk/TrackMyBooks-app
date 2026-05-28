import {BookByIdResponse} from "@/_components/bookInterface";

export interface LibraryItem {
    status: string;
    progress: number;
    start_Date: string | null;
    end_Date: string | null;
    book: BookByIdResponse;
}

export interface LibraryItemOnlyId {
    book_Id: number;
    status: string;
    progress: number;
    start_Date: string | null;
    end_Date: string | null;
}