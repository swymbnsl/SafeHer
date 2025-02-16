import { getUserFromDb } from "@/lib/supabase";
import React, { createContext, useContext, useEffect, useState } from "react";

export const UserContext = createContext(undefined);

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const res = await getUserFromDb();
      setUser({
        id: res.user_id,
        name: res.name,
        phone: res.phone_number,
        bio: res.bio,
        email: res.email,
        avatar: res.avatar,
        location: res.location,
        age: res.age,
        interests: res.interests,
        friends: res.friends,
        isVerified: res.verified || false,
        verificationStatus: res.verification_status,
      });
    } catch (error) {
      setUser(undefined);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoading, fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};
