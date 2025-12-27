import {useParams} from "react-router"
import {useEffect, useState} from "react"

export default function DisplayDiscussion(){ 
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

    const params = useParams();
    const [title, setTitle] = useState("");
    const [user, setUser] = useState("");
    const [body, setBody] = useState("");
    const [url, setUrl] = useState("");
    const [aim, setAim] = useState("");
    const [procedure, setProcedure] = useState("");
    const [participants, setParticipants] = useState("");
    const [results, setResults] = useState("");
    const [conclusion, setConclusion] = useState("");
    const [tag, setTag] = useState("");
    const [save, setSave] = useState();
    const [isAuthed, setIsAuthed] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);

    const getDiscussion = async() =>{
        const apiResponse = await fetch(`${API_BASE_URL}/discussions/${params.id}`)
        const apiResults = await apiResponse.json()
        console.log(apiResults.discussion)
        const {title, first_name, last_name, body, paper_url, aim, procedure, participants, results, coclusion} = apiResults.discussion;

        setTitle(title);
        setUser(`${first_name} ${last_name}`);
        setBody(body);
        setUrl(paper_url);
        setAim(aim);
        setProcedure(procedure);
        setParticipants(participants);
        setResults(results);
        setConclusion(coclusion)
    }

    const getTag = async() => {
        const apiResponse = await fetch(API_BASE_URL + `/discussion/tag?discussion_id=${encodeURIComponent(params.id)}`)
        const apiResults = await apiResponse.json()
        setTag(apiResults.tag.category)
    }

    const isSaved = async() => {
        try{
            const apiResponse = await fetch(API_BASE_URL + `/discussion/save/match?id=${encodeURIComponent(params.id)}`,{
                method: "GET",
                credentials: "include",
            });
            const apiResults = await apiResponse.json()
            console.log("Saved: ", apiResults.saved)
            setSave(apiResults.saved)
        }
        catch(error){
            console.error("Couldn't retrieve discussion-user match")
        }
        

    }

    useEffect(() => {
        const checkMe = async() => {
            try{
                const res = await fetch(API_BASE_URL + "/me", {
                    method: "GET",
                    credentials: "include",
                });

                setIsAuthed(res.ok)
            }
            catch(error){
                setIsAuthed(false)
            }
            finally{
                setAuthChecked(true);
            }
        }
        checkMe();
        getDiscussion();
        getTag();
        isSaved();
    }, [])

    const changeSave = async(e) => {
        console.log("save clicked")
        if(save){
        //Delete
            setSave(false)

            try{
                const res = await fetch(
                    `${API_BASE_URL}/user/saved?id=${encodeURIComponent(params.id)}`,
                    {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    }
                );
            }
            catch(error){
                console.error("Couldn't delete the discussion")
            }
        }
        else{
        //Add
            setSave(true)

            try{
                const res = await fetch(
                    `${API_BASE_URL}/user/saved`,
                    {
                    method: "POST",
                    credentials: "include",
                    headers: {
                    "Content-Type": "application/json",
                    },
                    body: JSON.stringify({id: params.id})
                    }
                );
            }
            catch(error){
                console.error("Couldn't add the discussion to your saved list")
            }
        }
    }

    return (
        <div className="displayDiscussion">
            <div className="container">
                <h2>{title}</h2>
                <p><i>By: {user}</i></p>
                {aim?<><strong>Aim</strong><p>{aim}</p></>: <></>}
                {participants?<><strong>Participants</strong><p>{participants}</p></>:<></>}
                {procedure?<><strong>Procedure</strong><p>{procedure}</p></>:<></>}
                {body?<><strong>Main Discussion</strong><p>{body}</p></>:<></>}
                {results?<><strong>Results</strong><p>{results}</p></>:<></>}
                {conclusion?<><strong>Conclusion</strong><p>{conclusion}</p></>:<></>}
                {tag?<><span className="tag">{tag}</span></>:<></>}

                {authChecked && isAuthed && (
                    <div className="save-icon">
                        <i 
                            className={`bi ${save ? "bi-bookmark-fill" : "bi-bookmark"} icon-thick`}
                            onClick={changeSave}
                            role="button"
                            aria-label={save? "Unsave discussion":"Save discussion"}
                        ></i>
                    </div>
                )}
            </div>
            
        </div>
    );
};