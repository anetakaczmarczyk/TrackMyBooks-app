"use client";

import { useEffect } from "react";
import {useRouter} from "next/navigation";
import { useAuth } from "@/_context/AuthContext";


export default function ProfilePage() {
    const { user, loading: authLoading, refreshUser } = useAuth();
    const router = useRouter();
    useEffect(() => {
      if (!authLoading && !user) router.push("/");
      if (user) {
        router.push(`/profile/${user.username}`);
      }
    }, [user, authLoading, router]);

}
