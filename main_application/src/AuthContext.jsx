import {createContext, useContext, useEffect, useState} from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
    const [me, setMe] = useState(undefined);
    const [loading, setLoading] = useState(true);

    const refreshMe = async() => {
        setLoading(true);
    try {
        const res = await fetch(API_BASE_URL + "/me", {
            credentials: "include",
        });

        if (res.status === 401) {
            setMe(null);
            return;
        }

        if (!res.ok) {
            setMe(null);
            return;
        }

        const data = await res.json();
        setMe(data.user ?? data.users ?? null);
        } catch (error) {
        console.error(error);
        setMe(null);
    }
    };

    const logout = async() => {
        try{
            await fetch(API_BASE_URL + "/logout",{
                method:"POST",
                credentials: "include",
            });
        }
        catch(e){
            console.error("logout failed:", e);
        }
        finally{
            setMe(null)
        }
    }

    useEffect(() => {

        refreshMe();
    },[]);

    return(
        <AuthContext.Provider value={{me, refreshMe, logout}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);