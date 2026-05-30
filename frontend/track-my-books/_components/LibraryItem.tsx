import {BookByIdResponse} from "@/_components/bookInterface";

export interface LibraryItem {
    status: string;
    progress: number;
    start_Date: string | null;
    end_Date: string | null;
    book: BookByIdResponse;
}

export interface LibraryItemOnlyId {
    id:number;
    book_Id: number;
    status: string;
    progress: number;
    start_Date: string | null;
    end_Date: string | null;
}

export interface Session {
    id: number;
    pages_Start: number;
    pages_Finished: number;
    duration_Minutes: number;
    created_At: string;
}

export interface BookNote {
    note: string;
    page_Number: number;
    created_At: string;
}