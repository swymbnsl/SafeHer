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
      console.log(0);
      const res = await getUserFromDb();
      console.log(res);
      console.log(1);
      setUser({
        id: res.user_id,
        name: res.name,
        email: res.email,
        avatar: res.avatar,
      });
    } catch (error) {
      setUser(undefined);
    } finally {
      isLoading;
      setIsLoading(false);
    }
  };
  useEffect(() => {
    console.log(4);
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoading, fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};
