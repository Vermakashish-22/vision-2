import { createContext, useContext, useEffect, useState } from "react";

type User = {
  name: string;
  email: string;
  imageUrl: string;
};

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
};

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("facemeet_user");
    if (savedUser) {
      setUserState(JSON.parse(savedUser));
    }
  }, []);

  const setUser = (user: User | null) => {
    setUserState(user);

    if (user) {
      localStorage.setItem("facemeet_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("facemeet_user");
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);