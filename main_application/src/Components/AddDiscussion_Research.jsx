import ResearchDiscussionTemplate from "./ResearchDiscussionTemplate"
import {useLocation} from "react-router-dom";
import {useState, useEffect} from "react"

export default function AddDiscussion_Research(){
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

    const {state} = useLocation();
    const [tagList, setTagList] = useState([])
    
    const{
        title = "",
        paperUrl = ""
    } = state ?? {};

    const getTagList = async() => {
        const apiResponse = await fetch(API_BASE_URL + '/getTags')
        const apiResults = await apiResponse.json()
        setTagList(apiResults.tags)
    }

    useEffect(() => {
        getTagList();
    }, [])

    return(
        <div className="addDiscussion-research">
            <ResearchDiscussionTemplate
                title={title}
                paperUrl={paperUrl}
                tagList = {tagList}
            />
        </div>
    )
}