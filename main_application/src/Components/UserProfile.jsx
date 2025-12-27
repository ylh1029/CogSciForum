import UserInfo from "./UserInfo"
import DisplayCards from "./DisplayCards"
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom"

export default function UserProfile(){
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

    console.log("API_BASE_URL in component =", API_BASE_URL);
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [interests, setInterests] = useState([]);
    const [saved, setSaved] = useState([]);
    const [posted, setPosted] = useState([]);

    const getUserInterests = async() => {
        try{
            const res = await fetch(API_BASE_URL + "/userInterests",{
                method: "GET",
                credentials: "include",
            });

            if(!res.ok){
                throw new Error(`HTTP error ${res.status}`);
            }

            const data = await res.json();

            if(data.count == 0){
                setInterests([])
                console.log("count was 0!!!")
            }
            else{
                setInterests([
                    ...data.list
                ])
            }
        }
        catch(error){
            console.error("Couldn't retrieve user interests")
        }
    }

    const getSaved = async() => {
        try{
            const res = await fetch(API_BASE_URL + '/user/saved',{
                method: "GET",
                credentials: "include",
            });

            if(!res.ok){
                throw new Error(`HTTP error ${res.status}`);
            }

            const data = await res.json();

            if(data.count == 0){
                setSaved([])
            }
            else{
                setSaved([
                    ...data.discussions
                ])
            }
        }
        catch(error){
            console.error("Couldn't retrieve discussions")
        }
    }

    const getPosted = async() => {
        try{
            const res = await fetch(API_BASE_URL + "/user/posted",{
                method: "GET",
                credentials: "include",
            });

            if(!res.ok){
                throw new Error(`HTTP error ${res.status}`);
            }

            const data = await res.json();

            if(data.count == 0){
                setPosted([])
            }
            else{
                setPosted([
                    ...data.discussions
                ])
            }
        }
        catch(error){
            console.error("Couldn't retrieve discussions")
        }
    }


    useEffect(() => {
    const fetchUserAndInterests = async () => {
        try {
        const res = await fetch(API_BASE_URL + "/me", {
            credentials: "include",
        });

        if (!res.ok) {
            navigate("/user/login");
            return;
        }

        const data = await res.json();

        setUser(data.users ?? data);

        await getUserInterests(); 
        } catch (error) {
        console.error("Me fetch failed:", error);
        setUser(null);
        } finally {
        setLoading(false);
        }
    };

    fetchUserAndInterests();
    getSaved();
    getPosted();
    }, []);


    if(loading){
        return <p>Loading...</p>;
    }
    if(!user) return <p>Please log in</p>;

    return(
        <div className = "userProfile">
            <meta name="description" content="Displays user information, as well as all the discussions they have
                    saved in the past. They can edit their profiles, as well as removing the saved discussions."/>
            <UserInfo
                userFullname={`${user.first_name} ${user.last_name}`}
                email={user.email}
                username={user.username}
                biography={user.biography? user.biography: ""}
                interests = {interests}
                className="userinfo-container"
            />

            <div className="flex-container">
                <div className="saved">
                    <h3>Saved Discussions</h3>
                    <DisplayCards
                        state="saved"
                        list={saved}
                    />
                </div>
                <div className="posted">
                    <h3>Discussions Posted by You</h3>
                    <DisplayCards
                        state="posted"
                        list={posted}
                    />
                </div>
            </div>
        </div>
    );
}