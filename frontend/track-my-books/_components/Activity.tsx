export interface Activity {
    book_Title: string;
    activity_Type: string;
    timestamp: string;
}

export interface FriendActivity {
    activityType: string;
    bookTitle: string;
    timestamp: string;
}
export interface FriendActivityRaw {
    activityType: string;
    bookTitle: string;
    timestamp: string;
    username: string;
}