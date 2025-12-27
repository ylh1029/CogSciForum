import {useState} from "react"
import {useNavigate} from "react-router-dom"
export default function DefaultDiscussionTemplate(props){
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

    const [title, setTitle] = useState("")
    const [topic, setTopic] = useState("")
    const [description, setDescription] = useState("")
    const [url, setUrl] = useState("")
    const navigate = useNavigate();

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
            url
        }

        try{
            const res = await fetch(API_BASE_URL+ "/discussions", {
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
            console.error("Submit failed: ", err);
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
                <label htmlFor="description" className="form-label">
                    Description
                </label>
                <textarea
                    id="description" 
                    className="form-control"  
                    name="description"
                    value={description} 
                    required
                    onChange={(e) => setDescription(e.target.value)}
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