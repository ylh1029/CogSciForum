import {useState, useEffect} from "react"
import DefaultDiscussionTemplate from "./DefaultDiscussionTemplate"
import ResearchDiscussionTemplate from "./ResearchDiscussionTemplate"

export default function AddDiscussion(){
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

    const[buttonSelected, setButtonSelected] = useState("Default Template")
    const [tagList, setTagList] = useState([])
    const templates = {
        "Default Template": <DefaultDiscussionTemplate
                                tagList={tagList}
                            />,
        "Research Discussion": <ResearchDiscussionTemplate
                                    tagList={tagList}
                                />
    }

    const getTagList = async() => {
        const apiResponse = await fetch(API_BASE_URL + '/getTags')
        const apiResults = await apiResponse.json()
        setTagList(apiResults.tags)
    }

    useEffect(() => {
        getTagList();
    }, [])

    return (
        <div className="addDiscussion-container">
            <div className="btn-group-wrapper">
                <div className="btn-group discussion-types" role="group">
                    {["Default Template", "Research Discussion"].map(label => (
                    <button
                        key={label}
                        type="button"
                        onClick={() => setButtonSelected(label)}
                        className={`btn discussion-type ${
                        buttonSelected === label ? "active" : ""
                        }`}
                    >
                        {label}
                    </button>
                    ))}
                </div>
            </div>
            {templates[buttonSelected]}
        </div>
        );
}