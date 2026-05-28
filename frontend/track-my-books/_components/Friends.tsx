import {LibraryItemOnlyId} from "@/_components/LibraryItem";
import {Review} from "@/_components/Review";
import {FriendActivity} from "@/_components/Activity";

export interface FriendsData {
    name: string;
    username: string;
    friendshipStatus: string;
    isInitiator: boolean;
    activities: FriendActivity[];
    reviews: Review[];
    readingStatuses: LibraryItemOnlyId[];
}