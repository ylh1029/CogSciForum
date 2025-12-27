import {useState, useEffect} from "react";
import {Link} from 'react-router-dom';

export default function SavedCard(props){
    const [isSaved, setIsSaved] = useState(props.saved);
    const [main_body, setMainBody] = useState(props.body);
    const [name, setName] = useState(props.first_name)

    function changeSave(e){
        if(props.handleRemove(props.discussion_id)){
            e.target.classList.remove("bi-bookmark-fill");
            e.target.classList.add("bi-bookmark");
            setIsSaved(!isSaved);
        }
    }

    const adjustBody = () => {
        if(props.body.length >= 150){
            setMainBody(props.body.slice(0, 150)+"...")
        }
    }

    useEffect(() => {
        const full = props.last_name
            ? `${props.first_name} ${props.last_name}`
            : props.first_name;

        setName(full);

        adjustBody();
    }, [props.first_name, props.last_name]);;

    return(
        <div className="card discussion savedCard">
            <div className="save-icon">
                {
                    props.state === "saved"? <i className="bi bi-bookmark-fill icon-thick" onClick={changeSave}></i>:
                    <i className="bi bi-trash-fill icon-thick" onClick={changeSave}></i>
                }
            </div>
            <div className="card-user">
                <img className="user-pfp" src="img/default-userpfp.jpg" alt="UserProfilePhoto" />
                <div className="names">
                    <span>{name}</span>
                    <span>@{props.username}</span>
                </div>
            </div>
            <Link to={`/discussion/${props.discussion_id}`} className="card-body">
                {main_body}
            </Link>
            <div className="card-tags">
                {
                    props.tagList?.map((tag) => {
                    return(
                        <span key={tag.id} className="card-tag">{tag.body}</span>
                    );
                })}
            </div>
        </div>
    );
}