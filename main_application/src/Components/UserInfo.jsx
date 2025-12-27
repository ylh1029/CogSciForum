import {useState, useEffect} from "react";

export default function UserProfile(props){
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

    const [username, setUsername] = useState(`${props.userFullname}`);
    const [displayName, setDisplayName] = useState(`${props.userFullname}`);
    const [userId, setUserId] = useState(`ID: ${props.username}`);
    const [userBody, setUserBody] = useState(`${props.biography}`);
    const [interestSelected, setInterestSelected] = useState("");
    const [edit, setEdit] = useState(false);
    const [tagEdit, setTagEdit] = useState(false);
    const [tagList, setTagList] = useState([...props.interests]);
    const tagListCount = props.interests.length;

    const editClick = () => {
        console.log(props)
        setTagEdit(<i className="bi bi-x remove-tag"></i>);
        setEdit(true);
    }

    const removeTag = (targetId) => {
        setTagList(prev => prev.filter(tag => tag.tag_id !== targetId));
    }

    const addClick = async () => {
        if (!interestSelected) return;

        const already = tagList.some(tag => tag?.category === interestSelected);
        if (already) {
            alert("The tag you're trying to add is already in your list");
            return;
        }

        const res = await fetch(
            `${API_BASE_URL}/interestTags/tag_id?category=${encodeURIComponent(interestSelected)}`,
            {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include", 
            }
        );

        if (!res.ok) {
            const text = await res.text();
            console.log("Request failed:", res.status, text);
            return;
        }

        const data = await res.json();

        if (!data?.ok || !data?.tag) {
            console.log("No tag returned for category:", interestSelected, data);
            return;
        }

        setTagList(prev => [...prev.filter(Boolean), data.tag]);

        setInterestSelected("");
    };

    const submitChange = async(e) => {
        e.preventDefault();
        if(interestSelected != ""){
            if(!confirm("You have unsaved changes for your interest selected field. Make sure to add them before saving")){
                return;
            }
        }

        const profile_res = await fetch(API_BASE_URL + "/userProfile", {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({username, userBody}),
        });

        if(tagListCount < tagList.length){
            const tag_res = await fetch(API_BASE_URL + "/interestTags", {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({tags: tagList})
            })
        }
        else if(tagListCount > tagList.length){
            const del_res = await fetch(API_BASE_URL + "/interestTags",{
                method: "DELETE",
                headers:{
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({tags: tagList})
            })

            if(!del_res.ok){
                const text = await del_res.text();
                throw new Error(`Delete failed: ${res.status} ${text}`);
            }

            const data = await del_res.json();
            console.log("Deleted interests:", data.deleted);
        }

        setDisplayName(username);
        setTagEdit();
        setEdit(false);
        setInterestSelected("");

    }

    const handleBodyChange = (e) => {
        console.log(e);
        setUserBody(e.target.value);
        e.target.style.height = "auto";
        e.target.style.height = e.target.scrollHeight + "px";
    }

    const handleNameChange = (e) => {
        setUsername(e.target.value);
    }

    return(
        <div className = "userInfo">
            <div className="userpfp-card">
                <img className= "user-pfp large" src="img/default-userpfp.jpg" alt="Default User pfp" />
                <div>{displayName}</div>
                <div>{userId}</div>
            </div>

            <div className="userinfo-card">
                <div>User Information</div>
                <form className="userinfo-edit" onSubmit={submitChange}>
                    <div className="form-row">
                        <label htmlFor="username" className="form-label form-margin-control">Username: </label>
                        <input 
                            type="text" 
                            value={username} 
                            className="form-control" 
                            disabled={!edit}
                            onChange={handleNameChange}
                        />
                    </div>
                    
                    <div className="form-row userbio">
                        <label htmlFor="bio" className="form-label form-margin-control">Biography: </label>
                        <textarea 
                            name="bio" 
                            id="bio" 
                            className="form-control" 
                            value={userBody} 
                            disabled={!edit}
                            onChange={handleBodyChange}
                            >
                            </textarea>
                    </div>

                    <div className="form-row">
                        <label htmlFor="user-interests" className="form-label form-margin-control">Interests: </label>
                        <div className="user-interests card-tags">
                            {
                                tagList.map(tag => {
                                    return(
                                        <span className="card-tag" key={tag.tag_id}>
                                            <span onClick={() => removeTag(tag.tag_id)}>
                                                {tagEdit}
                                            </span>
                                            {tag.category}
                                        </span>
                                    );
                                })
                            }
                        </div>

                        <div className="user-interest-select-container form-margin-control" hidden={!edit}>
                            <select 
                            className="form-select" 
                            name="user-interests" 
                            id="user-interests" 
                            value={interestSelected}
                            onChange={(e) => {
                                setInterestSelected(e.target.value);
                            }}>
                                <option value="">-- Select --</option>
                                <option value="Psychology">Psychology</option>
                                <option value="Neuroscience">Neuroscience</option>
                                <option value="Linguistics">Linguistics</option>
                                <option value="Philosophy">Philosophy</option>
                                <option value="Computer Science">Computer Science</option>
                            </select>
                            <button type="button" className="btn add" onClick={addClick}>
                                Add
                            </button>
                        </div>
                    </div>

                    <button type="button" className="btn edit" onClick={editClick} hidden={edit}>
                        Edit
                    </button>
                    <button type="submit" className="btn edit" hidden={!edit}>
                        Save Changes
                    </button>
                </form>
                
            </div>
        </div>
    );
}