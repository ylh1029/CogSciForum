import {useState} from "react"
import {useNavigate} from "react-router-dom"

export default function ResearchDiscussionTemplate(props){
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

    const navigate = useNavigate()
    const [title, setTitle] = useState(props.title)
    const [topic, setTopic] = useState("")
    const [url, setUrl] = useState(props.paperUrl)
    const [aim, setAim] = useState("")
    const [participants, setParticipants] = useState("")
    const [procedure, setProcedure] = useState("")
    const [results, setResults] = useState("")
    const [description, setDescription] = useState("")
    const [conclusion, setConclusion] = useState("")

    const handlesubmit = async(e) => {
        e.preventDefault();

        if(!title || !description){
            alert("Title and description are required.");
            return;
        }

        const payload = {
            title, 
            description,
            topic, 
            url,
            aim,
            participants,
            procedure,
            results,
            conclusion
        }

        try{
            const res = await fetch(API_BASE_URL + "/discussions", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            
            if(!res.ok){
                const errorText = await res.text();
                throw new Error(errorText || "Failed to create discussion");
            }

            const data = await res.json();

            navigate(`/discussion/${data.discussion_id}`)
        }
        catch(error){
            console.error("Submit failed: ", error);
            alert("Something went wrong. Please try again.");
        }
    }
    return(
        <form className="addDiscussion-form" onSubmit={handlesubmit}>
            <div className="form-row form-group">
                <label htmlFor="title" className="form-label">
                    Title
                </label>
                <input 
                    type="text" 
                    id="title" 
                    className="form-control"  
                    value={title} 
                    required
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>

            <div className="form-row form-group">
                <label htmlFor="aim" className="form-label">
                    Aim
                </label>
                <input 
                    type="text" 
                    id="aim" 
                    className="form-control"  
                    value={aim} 
                    required
                    onChange={(e) => setAim(e.target.value)}
                />
            </div>

            <div className="form-row form-group">
                <label htmlFor="participants" className="form-label">
                    Participants
                </label>
                <input 
                    type="text" 
                    id="participants" 
                    className="form-control"  
                    value={participants} 
                    onChange={(e) => setParticipants(e.target.value)}
                />
            </div>

            <div className="form-row form-group">
                <label htmlFor="procedure" className="form-label">
                    Procedure
                </label>
                <textarea 
                    id="procedure" 
                    className="form-control"  
                    value={procedure} 
                    onChange={(e) => setProcedure(e.target.value)}
                />
            </div>

            <div className="form-row form-group">
                <label htmlFor="results" className="form-label">
                    Results
                </label>
                <input 
                    type="text" 
                    id="results" 
                    className="form-control"  
                    value={results} 
                    required
                    onChange={(e) => setResults(e.target.value)}
                />
            </div>

            <div className="form-row form-group">
                <label htmlFor="discussion" className="form-label">
                    Discussion
                </label>
                <textarea 
                    id="discussion" 
                    className="form-control"  
                    value={description} 
                    required
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>

            <div className="form-row form-group">
                <label htmlFor="conclusion" className="form-label">
                    Conclusion
                </label>
                <textarea
                    id="conclusion" 
                    className="form-control"  
                    value={conclusion} 
                    required
                    onChange={(e) => setConclusion(e.target.value)}
                />
            </div>

            <div className="form-row form-group">
                <label htmlFor="topics-select">Related Topics</label>
                <select 
                    type="text" 
                    name="related-topics" 
                    id="topics-select"
                    className="form-control"  
                    onChange={(e) => {setTopic(e.target.value)}}
                    value={topic}
                > 
                    <option value="">Select a Topic</option>
                        {
                            props.tagList.map((tag) => {
                                return(
                                    <option value={tag.category} key={tag.tag_id}>{tag.category}</option>
                                );
                            })

                        }
                </select>
            </div>
            
            <div className="form-row">
                <label htmlFor="url" className="form-label">
                    Link to The Paper
                </label>
                <input 
                    type="url" 
                    className="form-control"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                />
            </div>

            <button type="submit" className="btn">Submit</button>
        </form>
    )
}